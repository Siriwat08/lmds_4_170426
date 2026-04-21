/**
 * VERSION: 1.0 — Phase 2: Validation Layer
 * 🛡️ Service: Validation - ตรวจสอบข้อมูลก่อนบันทึก
 * -----------------------------------------------------------
 * [NEW v1.0]: Interceptor Layer ระหว่างรับข้อมูลกับบันทึกข้อมูล
 * 
 * ทำงานเป็น "Validation Pipeline":
 *   1. รับข้อมูลจาก SCG API / Manual Input
 *   2. ตรวจสอบความถูกต้อง (Validation)
 *   3. จับคู่กับ Master Data (Matching)
 *   4. ตัดสินใจ: Auto Approve / Send to Review
 *   5. บันทึกผลลัพธ์
 * 
 * แก้ปัญหา: ข้อมูลสกปรกสะสม → มีชั้นกรองก่อนลง Database
 * 
 * Author: Elite Logistics Architect
 */

// ==========================================
// 1. VALIDATION PIPELINE CONFIGURATION
// ==========================================

const VALIDATION_CONFIG = {
  // Validation Rules
  REQUIRE_PHONE_FOR_PERSON:    false, // ถ้า true ต้องมีเบอร์โทรถึงจะสร้าง Person ได้
  REQUIRE_GPS_FOR_LOCATION:    true,  // ถ้า true ต้องมีพิกัดถึงจะสร้าง Location ได้
  MIN_NAME_LENGTH:             3,     // จำนวนตัวอักษรขั้นต่ำของชื่อ
  MAX_NAME_LENGTH:             200,   // จำนวนตัวอักษรสูงสุดของชื่อ
  
  // Matching Thresholds (ปรับปรุงให้สอดคล้องกับ MASTER_CONFIG)
  EXACT_MATCH_THRESHOLD:       100,   // ตรงกัน 100%
  HIGH_CONFIDENCE_THRESHOLD:   95,    // มั่นใจสูง ≥95% → Auto Approve
  MEDIUM_CONFIDENCE_THRESHOLD: 70,    // มั่นใจปานกลาง 70-94% → Review
  LOW_CONFIDENCE_THRESHOLD:    70,    // มั่นใจต่ำ <70% → Reject
  
  // Geo Validation
  THAILAND_LAT_MIN:            6.0,
  THAILAND_LAT_MAX:            21.0,
  THAILAND_LNG_MIN:            97.0,
  THAILAND_LNG_MAX:            106.0,
  MAX_REASONABLE_DISTANCE_KM:  1000,  // ระยะทางสูงสุดที่สมเหตุสมผล (km)
  
  // Rate Limiting
  MAX_VALIDATIONS_PER_MINUTE:  60,    // จำกัดจำนวนครั้งต่อนาที
  ENABLE_RATE_LIMITING:        true
};

// Rate Limiter State
var validationRateLimiter = {
  count: 0,
  resetTime: 0
};

// ==========================================
// 2. MAIN VALIDATION ENTRY POINT
// ==========================================

/**
 * ฟังก์ชันหลัก: ตรวจสอบและจับคู่ข้อมูลก่อนบันทึก
 * เรียกใช้จาก Service_SCG.gs ก่อนบันทึกลง Database
 * 
 * @param {object} rawData - ข้อมูลดิบจาก API/Input
 * @return {object} - ผลลัพธ์การตรวจสอบ
 */
function validateAndIntercept(rawData) {
  var startTime = new Date();
  var result = {
    isValid: false,
    action: '', // 'AUTO_APPROVE', 'SEND_REVIEW', 'REJECT'
    personMatch: null,
    locationMatch: null,
    confidence: 0,
    errors: [],
    warnings: [],
    processingTimeMs: 0
  };
  
  try {
    // 1. Rate Limiting Check
    if (VALIDATION_CONFIG.ENABLE_RATE_LIMITING) {
      checkRateLimit();
    }
    
    // 2. Basic Validation
    var basicValidation = performBasicValidation(rawData);
    if (!basicValidation.isValid) {
      result.errors = basicValidation.errors;
      result.action = 'REJECT';
      return finalizeResult(result, startTime);
    }
    
    // 3. Normalize Data
    var normalizedData = normalizeInputData(rawData);
    
    // 4. Person Matching
    var personResult = matchPerson(normalizedData);
    result.personMatch = personResult.match;
    if (personResult.warnings) {
      result.warnings = result.warnings.concat(personResult.warnings);
    }
    
    // 5. Location Matching
    var locationResult = matchLocation(normalizedData);
    result.locationMatch = locationResult.match;
    if (locationResult.warnings) {
      result.warnings = result.warnings.concat(locationResult.warnings);
    }
    
    // 6. Calculate Overall Confidence
    result.confidence = calculateOverallConfidence(personResult, locationResult);
    
    // 7. Decision Making (ปรับปรุง Logic ให้ชัดเจน)
    if (result.confidence >= VALIDATION_CONFIG.HIGH_CONFIDENCE_THRESHOLD) {
      // ≥95%: Auto Approve
      result.action = 'AUTO_APPROVE';
      result.isValid = true;
    } else if (result.confidence >= VALIDATION_CONFIG.MEDIUM_CONFIDENCE_THRESHOLD) {
      // 70-94%: Send to Review
      result.action = 'SEND_REVIEW';
      result.isValid = true; // แต่ต้อง Review
    } else {
      // <70%: Reject
      result.action = 'REJECT';
      result.errors.push('ความมั่นใจต่ำเกินไป (' + result.confidence + '%) - ต่ำกว่าเกณฑ์ 70%');
    }
    
    // 8. Add Recommendations
    addRecommendations(result, normalizedData);
    
    return finalizeResult(result, startTime);
    
  } catch (error) {
    Logger.error('❌ Validation Error: ' + error.message);
    result.errors.push('Validation Error: ' + error.message);
    result.action = 'REJECT';
    return finalizeResult(result, startTime);
  }
}

// ==========================================
// 3. BASIC VALIDATION
// ==========================================

/**
 * ตรวจสอบความถูกต้องพื้นฐานของข้อมูล
 * @param {object} rawData - ข้อมูลดิบ
 * @return {object} - ผลลัพธ์
 */
function performBasicValidation(rawData) {
  var result = {
    isValid: true,
    errors: []
  };
  
  // ตรวจสอบชื่อ
  var name = rawData.name || rawData.ShipToName || '';
  if (!name || name.toString().trim() === '') {
    result.errors.push('ไม่มีชื่อผู้รับสินค้า');
    result.isValid = false;
  } else if (name.toString().length < VALIDATION_CONFIG.MIN_NAME_LENGTH) {
    result.errors.push('ชื่อยาวไม่เพียงพอ (ขั้นต่ำ ' + VALIDATION_CONFIG.MIN_NAME_LENGTH + ' ตัวอักษร)');
    result.isValid = false;
  } else if (name.toString().length > VALIDATION_CONFIG.MAX_NAME_LENGTH) {
    result.errors.push('ชื่อยาวเกินไป (สูงสุด ' + VALIDATION_CONFIG.MAX_NAME_LENGTH + ' ตัวอักษร)');
    result.isValid = false;
  }
  
  // ตรวจสอบพิกัด (ถ้าต้องการ)
  var lat = parseFloat(rawData.lat || rawData.LAT || 0);
  var lng = parseFloat(rawData.lng || rawData.LONG || 0);
  
  if (VALIDATION_CONFIG.REQUIRE_GPS_FOR_LOCATION) {
    if (isNaN(lat) || isNaN(lng)) {
      result.errors.push('ไม่มีพิกัด GPS');
      result.isValid = false;
    }
  }
  
  // ตรวจสอบว่าพิกัดอยู่ในประเทศไทยหรือไม่ (ถ้ามี)
  if (!isNaN(lat) && !isNaN(lng)) {
    if (lat < VALIDATION_CONFIG.THAILAND_LAT_MIN || lat > VALIDATION_CONFIG.THAILAND_LAT_MAX ||
        lng < VALIDATION_CONFIG.THAILAND_LNG_MIN || lng > VALIDATION_CONFIG.THAILAND_LNG_MAX) {
      result.errors.push('พิกัดไม่อยู่ในประเทศไทย (LAT: ' + lat + ', LNG: ' + lng + ')');
      result.isValid = false;
    }
  }
  
  // ตรวจสอบ Shipment No (ถ้ามี)
  var shipmentNo = rawData.shipmentNo || rawData.ShipmentNo || '';
  if (shipmentNo && shipmentNo.toString().trim() !== '') {
    // ตรวจสอบรูปแบบ (ถ้าต้องการ)
    // ตัวอย่าง: ต้องขึ้นต้นด้วยตัวอักษร 2 ตัว ตามด้วยตัวเลข 10 หลัก
    // var shipmentPattern = /^[A-Z]{2}\d{10}$/;
    // if (!shipmentPattern.test(shipmentNo.toString().toUpperCase())) {
    //   result.warnings = result.warnings || [];
    //   result.warnings.push('รูปแบบ Shipment No ผิดปกติ');
    // }
  }
  
  return result;
}

// ==========================================
// 4. DATA NORMALIZATION
// ==========================================

/**
 * ปรับรูปแบบข้อมูลให้เป็นมาตรฐาน
 * @param {object} rawData - ข้อมูลดิบ
 * @return {object} - ข้อมูลที่ normalize แล้ว
 */
function normalizeInputData(rawData) {
  var normalized = {
    name: (rawData.name || rawData.ShipToName || '').toString().trim(),
    phone: (rawData.phone || rawData.Phone || '').toString().replace(/[^0-9]/g, ''),
    lat: parseFloat(rawData.lat || rawData.LAT || 0),
    lng: parseFloat(rawData.lng || rawData.LONG || 0),
    address: (rawData.address || rawData.ShipToAddress || '').toString().trim(),
    shipmentNo: (rawData.shipmentNo || rawData.ShipmentNo || '').toString().trim(),
    invoiceNo: (rawData.invoiceNo || rawData.InvoiceNo || '').toString().trim(),
    date: rawData.date || rawData.DeliveryDate || new Date(),
    employeeId: (rawData.employeeId || rawData.EmployeeId || '').toString().trim()
  };
  
  // Normalize ชื่อ
  normalized.normalizedName = normalizeText(normalized.name);
  
  return normalized;
}

// ==========================================
// 5. PERSON MATCHING
// ==========================================

/**
 * จับคู่บุคคล
 * @param {object} normalizedData - ข้อมูลที่ normalize แล้ว
 * @return {object} - ผลลัพธ์การจับคู่
 */
function matchPerson(normalizedData) {
  var result = {
    match: null,
    warnings: []
  };
  
  // 1. ลองจับคู่ด้วยเบอร์โทรก่อน (Exact Match)
  if (normalizedData.phone && VALIDATION_CONFIG.REQUIRE_PHONE_FOR_PERSON) {
    var phoneMatch = findPersonByPhone(normalizedData.phone);
    if (phoneMatch) {
      result.match = phoneMatch;
      result.match.matchType = 'Phone_Exact';
      result.match.confidence = 100;
      return result;
    }
  }
  
  // 2. จับคู่ด้วยชื่อ (Fuzzy Match)
  if (normalizedData.name) {
    var nameMatch = findPersonByName(normalizedData.name, VALIDATION_CONFIG.MEDIUM_CONFIDENCE_THRESHOLD);
    if (nameMatch) {
      result.match = nameMatch;
      result.match.matchType = 'Name_Fuzzy';
      
      // เตือนถ้าความมั่นใจไม่สูงมาก
      if (nameMatch.matchScore < VALIDATION_CONFIG.HIGH_CONFIDENCE_THRESHOLD) {
        result.warnings.push('ความมั่นใจการจับคู่ชื่อ: ' + nameMatch.matchScore + '%');
      }
      
      return result;
    }
  }
  
  // 3. ไม่พบการจับคู่
  result.warnings.push('ไม่พบบุคคลในระบบ');
  return result;
}

// ==========================================
// 6. LOCATION MATCHING
// ==========================================

/**
 * จับคู่สถานที่
 * @param {object} normalizedData - ข้อมูลที่ normalize แล้ว
 * @return {object} - ผลลัพธ์การจับคู่
 */
function matchLocation(normalizedData) {
  var result = {
    match: null,
    warnings: []
  };
  
  // 1. จับคู่ด้วยพิกัด (Radius Check) - สำคัญที่สุด
  if (!isNaN(normalizedData.lat) && !isNaN(normalizedData.lng)) {
    var nearbyLocations = findLocationsByRadius(
      normalizedData.lat,
      normalizedData.lng,
      MASTER_CONFIG.RADIUS_CHECK_METERS
    );
    
    if (nearbyLocations.length > 0) {
      result.match = nearbyLocations[0]; // เอาตัวที่ใกล้สุด
      
      // คำนวณ Confidence จากระยะทาง
      var distanceMeters = result.match.distanceMeters || 0;
      if (distanceMeters <= 5) {
        result.match.confidence = 100;
        result.match.matchType = 'GPS_Exact_' + distanceMeters + 'm';
      } else if (distanceMeters <= 10) {
        result.match.confidence = 95;
        result.match.matchType = 'GPS_Near_' + distanceMeters + 'm';
      } else if (distanceMeters <= 20) {
        result.match.confidence = 85;
        result.match.matchType = 'Radius_' + distanceMeters + 'm';
      } else {
        result.match.confidence = 70;
        result.match.matchType = 'Radius_Far_' + distanceMeters + 'm';
      }
      
      // เตือนถ้าระยะห่างมาก
      if (distanceMeters > 10) {
        result.warnings.push('พิกัดห่างจากฐานข้อมูล: ' + distanceMeters + ' เมตร');
      }
      
      return result;
    }
  }
  
  // 2. จับคู่ด้วยชื่อสถานที่ (Fuzzy Match)
  if (normalizedData.address) {
    var addrMatch = findLocationByName(normalizedData.address, VALIDATION_CONFIG.MEDIUM_CONFIDENCE_THRESHOLD);
    if (addrMatch) {
      result.match = addrMatch;
      result.match.matchType = 'Address_Fuzzy';
      result.match.confidence = addrMatch.matchScore;
      
      if (addrMatch.matchScore < VALIDATION_CONFIG.HIGH_CONFIDENCE_THRESHOLD) {
        result.warnings.push('ความมั่นใจการจับคู่ที่อยู่: ' + addrMatch.matchScore + '%');
      }
      
      return result;
    }
  }
  
  // 3. ไม่พบการจับคู่
  result.warnings.push('ไม่พบสถานที่ในระบบ');
  return result;
}

// ==========================================
// 7. CONFIDENCE CALCULATION
// ==========================================

/**
 * คำนวณความมั่นใจโดยรวม
 * @param {object} personResult - ผลลัพธ์การจับคู่บุคคล
 * @param {object} locationResult - ผลลัพธ์การจับคู่สถานที่
 * @return {number} - ค่าความมั่นใจ (%)
 */
function calculateOverallConfidence(personResult, locationResult) {
  var personScore = personResult.match ? (personResult.match.confidence || personResult.match.matchScore || 0) : 0;
  var locationScore = locationResult.match ? (locationResult.match.confidence || 0) : 0;
  
  // ถ้าน้ำหนักเท่ากัน
  if (personScore > 0 && locationScore > 0) {
    return Math.round((personScore + locationScore) / 2);
  } else if (personScore > 0) {
    return personScore;
  } else if (locationScore > 0) {
    return locationScore;
  } else {
    return 0;
  }
}

// ==========================================
// 8. RECOMMENDATIONS
// ==========================================

/**
 * เพิ่มคำแนะนำ berdasarkanผลลัพธ์
 * @param {object} result - ผลลัพธ์การตรวจสอบ
 * @param {object} normalizedData - ข้อมูลที่ normalize แล้ว
 */
function addRecommendations(result, normalizedData) {
  result.recommendations = [];
  
  if (!result.personMatch) {
    result.recommendations.push('สร้างบุคคลใหม่: ' + normalizedData.name);
  }
  
  if (!result.locationMatch) {
    result.recommendations.push('สร้างสถานที่ใหม่: ' + (normalizedData.address || 'พิกัด ' + normalizedData.lat + ',' + normalizedData.lng));
  }
  
  if (result.personMatch && result.personMatch.matchType === 'Name_Fuzzy' && 
      result.personMatch.matchScore < VALIDATION_CONFIG.HIGH_CONFIDENCE_THRESHOLD) {
    result.recommendations.push('ตรวจสอบการจับคู่บุคคล: อาจเป็นคนละคน (ความมั่นใจ ' + result.personMatch.matchScore + '%)');
  }
  
  if (result.locationMatch && result.locationMatch.distanceMeters > 10) {
    result.recommendations.push('ตรวจสอบพิกัดสถานที่: ห่างจากฐานข้อมูล ' + result.locationMatch.distanceMeters + ' เมตร');
  }
}

// ==========================================
// 9. RATE LIMITING
// ==========================================

/**
 * ตรวจสอบ Rate Limiting
 */
function checkRateLimit() {
  var now = new Date().getTime();
  
  if (now > validationRateLimiter.resetTime) {
    // Reset counter
    validationRateLimiter.count = 0;
    validationRateLimiter.resetTime = now + 60000; // 1 นาที
  }
  
  validationRateLimiter.count++;
  
  if (validationRateLimiter.count > VALIDATION_CONFIG.MAX_VALIDATIONS_PER_MINUTE) {
    throw new Error('Rate Limit Exceeded: เกินจำนวนครั้งที่อนุญาต (' + VALIDATION_CONFIG.MAX_VALIDATIONS_PER_MINUTE + ' ครั้ง/นาที)');
  }
}

// ==========================================
// 10. RESULT FINALIZATION
// ==========================================

/**
 * สรุปผลลัพธ์และคำนวณเวลาประมวลผล
 * @param {object} result - ผลลัพธ์
 * @param {Date} startTime - เวลาเริ่ม
 * @return {object} - ผลลัพธ์สุดท้าย
 */
function finalizeResult(result, startTime) {
  result.processingTimeMs = new Date().getTime() - startTime.getTime();
  result.timestamp = new Date();
  
  // ลบฟิลด์ที่ไม่จำเป็นออกก่อนส่งกลับ
  if (result.action === 'REJECT' && result.personMatch) {
    delete result.personMatch;
  }
  if (result.action === 'REJECT' && result.locationMatch) {
    delete result.locationMatch;
  }
  
  return result;
}

// ==========================================
// 11. INTEGRATION HELPERS
// ==========================================

/**
 * Helper สำหรับเรียกใช้จาก Service_SCG.gs
 * บันทึก Transaction หลังจาก Validate แล้ว
 * 
 * @param {object} validationData - ข้อมูลที่ validate แล้ว
 * @param {string} sourceSheet - ชื่อชีตต้นทาง
 * @param {number} rowIndex - แถวต้นทาง
 * @return {object} - ผลลัพธ์
 */
function processValidatedData(validationData, sourceSheet, rowIndex) {
  var result = {
    success: false,
    message: '',
    transactionId: null
  };
  
  if (validationData.action === 'REJECT') {
    result.message = 'ข้อมูลถูกปฏิเสธ: ' + validationData.errors.join(', ');
    return result;
  }
  
  try {
    var transData = {
      date: new Date(),
      personId: validationData.personMatch ? validationData.personMatch.personId : '',
      locationId: validationData.locationMatch ? validationData.locationMatch.locationId : '',
      shipmentNo: validationData.shipmentNo || '',
      invoiceNo: validationData.invoiceNo || '',
      sourceSheet: sourceSheet,
      rowOriginal: rowIndex,
      latLngRaw: validationData.lat + ',' + validationData.lng,
      confidence: validationData.confidence,
      matchMethod: (validationData.personMatch ? validationData.personMatch.matchType : '') + '|' + 
                   (validationData.locationMatch ? validationData.locationMatch.matchType : ''),
      status: validationData.action === 'AUTO_APPROVE' ? 'Approved' : 'Pending',
      reviewedBy: validationData.action === 'AUTO_APPROVE' ? 'System' : '',
      reviewedAt: validationData.action === 'AUTO_APPROVE' ? new Date() : ''
    };
    
    // บันทึก Transaction
    var transResult = logTransaction(transData);
    
    if (transResult.success) {
      result.success = true;
      result.transactionId = transResult.transId;
      result.message = validationData.action === 'AUTO_APPROVE' ? 
                       'อนุมัติอัตโนมัติ' : 'ส่งเข้าคิวตรวจสอบ';
    }
    
    // ถ้าต้อง Review ส่งเข้า Pending Queue
    if (validationData.action === 'SEND_REVIEW') {
      var reviewData = {
        type: (!validationData.personMatch && !validationData.locationMatch) ? 'Both' :
              (!validationData.personMatch) ? 'Person' : 'Location',
        inputName: validationData.name,
        inputLat: validationData.lat,
        inputLng: validationData.lng,
        candidates: [
          validationData.personMatch || null,
          validationData.locationMatch || null
        ].filter(function(x) { return x !== null; }),
        suggestedAction: validationData.recommendations ? validationData.recommendations.join('; ') : 'Manual Review',
        confidence: validationData.confidence
      };
      
      sendToPendingReview(reviewData);
    }
    
    return result;
    
  } catch (error) {
    Logger.error('❌ Process Validated Data Error: ' + error.message);
    result.message = 'Error: ' + error.message;
    return result;
  }
}
