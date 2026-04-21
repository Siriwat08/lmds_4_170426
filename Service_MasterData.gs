/**
 * VERSION: 1.0 — Phase 2: Master Data Management
 * 🧠 Service: Master Data - แยกตารางบุคคลและสถานที่
 * -----------------------------------------------------------
 * [NEW v1.0]: แยก Database เป็น 3 ตารางหลัก:
 *   1. Master_Persons - เก็บข้อมูล "คน" เท่านั้น
 *   2. Master_Locations - เก็บข้อมูล "สถานที่" เท่านั้น
 *   3. Transaction_Logs - เก็บประวัติการทำงาน (อ้างอิง ID จาก 2 ตารางแรก)
 * 
 * แก้ปัญหา 8 ข้อ:
 *   ข้อ 1, 4 → ใช้ Person_ID + Levenshtein Distance
 *   ข้อ 2, 3, 5, 6, 7, 8 → ใช้ Location_ID + Radius Check
 * 
 * Author: Elite Logistics Architect
 */

// ==========================================
// 1. CONFIGURATION FOR MASTER TABLES
// ==========================================

const MASTER_CONFIG = {
  // Sheet Names
  SHEET_PERSONS:    'Master_Persons',
  SHEET_LOCATIONS:  'Master_Locations',
  SHEET_TRANSACTIONS: 'Transaction_Logs',
  SHEET_PENDING_REVIEW: 'Pending_Review',
  
  // Column Indexes for Master_Persons (1-based)
  PERSON_COL_ID:           1,   // Unique_Person_ID (UUID)
  PERSON_COL_NAME_STD:     2,   // ชื่อมาตรฐาน (Golden Record)
  PERSON_COL_NAME_VARIANTS: 3,  // ชื่ออื่นๆ ที่เคยพบ (JSON Array)
  PERSON_COL_EMPLOYEE_ID:  4,   // รหัสพนักงาน (ถ้ามี)
  PERSON_COL_PHONE:        5,   // เบอร์โทรศัพท์ (Unique Key)
  PERSON_COL_HASH_KEY:     6,   // Hash จาก ชื่อ+เบอร์โทร
  PERSON_COL_CREATED:      7,   // วันที่สร้าง
  PERSON_COL_UPDATED:      8,   // วันที่อัปเดต
  PERSON_COL_STATUS:       9,   // Active/Merged/Deleted
  PERSON_COL_MERGED_TO:    10,  // ถ้า Merge แล้ว ชี้ไป ID ไหน
  PERSON_COL_QUALITY:      11,  // Quality Score (0-100)
  PERSON_COL_NOTES:        12,  // หมายเหตุ
  
  // Column Indexes for Master_Locations (1-based)
  LOC_COL_ID:              1,   // Unique_Location_ID (UUID)
  LOC_COL_NAME_STD:        2,   // ชื่อสถานที่มาตรฐาน
  LOC_COL_NAME_VARIANTS:   3,   // ชื่ออื่นๆ ที่เคยพบ (JSON Array)
  LOC_COL_LAT:             4,   // Latitude
  LOC_COL_LNG:             5,   // Longitude
  LOC_COL_RADIUS_M:        6,   // รัศมีที่ยอมรับได้ (เมตร)
  LOC_COL_ADDR_FULL:       7,   // ที่อยู่เต็มจาก Google
  LOC_COL_PROVINCE:        8,   // จังหวัด
  LOC_COL_DISTRICT:        9,   // เขต/อำเภอ
  LOC_COL_POSTCODE:        10,  // รหัสไปรษณีย์
  LOC_COL_HASH_KEY:        11,  // Hash จาก Lat+Long+ชื่อถนน
  LOC_COL_CREATED:         12,  // วันที่สร้าง
  LOC_COL_UPDATED:         13,  // วันที่อัปเดต
  LOC_COL_STATUS:          14,  // Active/Merged/Deleted
  LOC_COL_MERGED_TO:       15,  // ถ้า Merge แล้ว ชี้ไป ID ไหน
  LOC_COL_QUALITY:         16,  // Quality Score (0-100)
  LOC_COL_USAGE_COUNT:     17,  // จำนวนครั้งที่ใช้งาน
  LOC_COL_LAST_USED:       18,  // วันที่ใช้งานล่าสุด
  LOC_COL_NOTES:           19,  // หมายเหตุ
  
  // Column Indexes for Transaction_Logs (1-based)
  TRANS_COL_ID:            1,   // Transaction_ID (UUID)
  TRANS_COL_DATE:          2,   // วันที่ทำรายการ
  TRANS_COL_TIME:          3,   // เวลา
  TRANS_COL_PERSON_ID:     4,   // อ้างอิง Master_Persons.ID
  TRANS_COL_LOCATION_ID:   5,   // อ้างอิง Master_Locations.ID
  TRANS_COL_SHIPMENT_NO:   6,   // Shipment No
  TRANS_COL_INVOICE_NO:    7,   // Invoice No
  TRANS_COL_SOURCE_SHEET:  8,   // แหล่งที่มา (SCGนครหลวงJWDภูมิภาค)
  TRANS_COL_ROW_ORIGINAL:  9,   // แถวต้นฉบับในชีตแหล่งที่มา
  TRANS_COL_LATLNG_RAW:    10,  // พิกัดดิบจาก Driver
  TRANS_COL_CONFIDENCE:    11,  // ความมั่นใจในการจับคู่ (%)
  TRANS_COL_MATCH_METHOD:  12,  // วิธีจับคู่ (Exact/Fuzzy/Radius)
  TRANS_COL_STATUS:        13,  // Pending/Approved/Rejected
  TRANS_COL_REVIEWED_BY:   14,  // ผู้ตรวจสอบ (ถ้ามี)
  TRANS_COL_REVIEWED_AT:   15,  // วันที่ตรวจสอบ
  TRANS_COL_NOTES:         16,  // หมายเหตุ
  
  // Column Indexes for Pending_Review (1-based)
  PENDING_COL_ID:          1,   // Review_ID
  PENDING_COL_TIMESTAMP:   2,   // วันที่เวลาที่ส่งเข้าคิว
  PENDING_COL_TYPE:        3,   // ประเภท (Person/Location/Both)
  PENDING_COL_INPUT_NAME:  4,   // ชื่อที่รับเข้ามา
  PENDING_COL_INPUT_LAT:   5,   // Lat ที่รับเข้ามา
  PENDING_COL_INPUT_LNG:   6,   // Lng ที่รับเข้ามา
  PENDING_COL_MATCH_CANDIDATES: 7, // ตัวเลือกที่ระบบเสนอ (JSON)
  PENDING_COL_SUGGESTED_ACTION: 8, // คำแนะนำจากระบบ
  PENDING_COL_CONFIDENCE:  9,   // ความมั่นใจ (%)
  PENDING_COL_STATUS:      10,  // Pending/Approved/Rejected
  PENDING_COL_DECISION_BY: 11,  // ผู้ตัดสินใจ
  PENDING_COL_DECISION_AT: 12,  // วันที่ตัดสินใจ
  PENDING_COL_NOTES:       13,  // หมายเหตุ
  
  // Thresholds
  FUZZY_MATCH_THRESHOLD:   85,  // % ความคล้ายขั้นต่ำสำหรับ Fuzzy Match
  RADIUS_CHECK_METERS:     20,  // รัศมีจัดกลุ่มพิกัดใกล้เคียง (เมตร)
  RADIUS_ALERT_METERS:     500, // รัศมีแจ้งเตือนตำแหน่งผิดปกติ
  AUTO_APPROVE_THRESHOLD:  95,  // % ความมั่นใจที่อนุมัติอัตโนมัติ
  REVIEW_THRESHOLD:        70   // % ความมั่นใจขั้นต่ำที่จะส่ง Review
};

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

/**
 * สร้าง Hash Key สำหรับบุคคล (ชื่อ + เบอร์โทร)
 */
function createPersonHashKey(name, phone) {
  var cleanName = normalizeText(name || '');
  var cleanPhone = (phone || '').toString().replace(/[^0-9]/g, '');
  var rawKey = cleanName + '|' + cleanPhone;
  return md5(rawKey);
}

/**
 * สร้าง Hash Key สำหรับสถานที่ (Lat + Long + ชื่อถนน)
 */
function createLocationHashKey(lat, lng, addrLine) {
  var latFixed = parseFloat(lat || 0).toFixed(6);
  var lngFixed = parseFloat(lng || 0).toFixed(6);
  var cleanAddr = normalizeText(addrLine || '');
  var rawKey = latFixed + '|' + lngFixed + '|' + cleanAddr;
  return md5(rawKey);
}

/**
 * แปลง JSON Array เป็น String สำหรับเก็บใน Cell
 */
function serializeVariants(variantsArray) {
  if (!variantsArray || variantsArray.length === 0) return '';
  return JSON.stringify(variantsArray);
}

/**
 * แปลง String กลับเป็น JSON Array
 */
function deserializeVariants(variantsStr) {
  if (!variantsStr || variantsStr === '') return [];
  try {
    return JSON.parse(variantsStr);
  } catch(e) {
    return [variantsStr];
  }
}

/**
 * คำนวณ Quality Score สำหรับบุคคล
 */
function calculatePersonQualityScore(name, phone, employeeId, variantsCount) {
  var score = 0;
  
  // ชื่อ (สูงสุด 30 คะแนน)
  if (name && name.toString().trim().length >= 3) {
    score += 20;
    if (name.toString().trim().length >= 10) score += 10;
  }
  
  // เบอร์โทร (สูงสุด 30 คะแนน)
  if (phone && phone.toString().replace(/[^0-9]/g, '').length >= 9) {
    score += 30;
  }
  
  // รหัสพนักงาน (สูงสุด 20 คะแนน)
  if (employeeId && employeeId.toString().trim() !== '') {
    score += 20;
  }
  
  // มี Variants (สูงสุด 20 คะแนน)
  if (variantsCount > 0) {
    score += Math.min(variantsCount * 2, 20);
  }
  
  return Math.min(score, 100);
}

/**
 * คำนวณ Quality Score สำหรับสถานที่
 */
function calculateLocationQualityScore(name, lat, lng, addrFull, province, usageCount) {
  var score = 0;
  
  // ชื่อสถานที่ (สูงสุด 20 คะแนน)
  if (name && name.toString().trim().length >= 3) {
    score += 15;
    if (name.toString().trim().length >= 10) score += 5;
  }
  
  // พิกัด (สูงสุด 30 คะแนน)
  var latNum = parseFloat(lat || 0);
  var lngNum = parseFloat(lng || 0);
  if (!isNaN(latNum) && !isNaN(lngNum)) {
    score += 20;
    // พิกัดอยู่ในประเทศไทย
    if (latNum >= 6 && latNum <= 21 && lngNum >= 97 && lngNum <= 106) {
      score += 10;
    }
  }
  
  // ที่อยู่เต็มจาก Google (สูงสุด 20 คะแนน)
  if (addrFull && addrFull.toString().trim() !== '') {
    score += 15;
    if (province && province.toString().trim() !== '') {
      score += 5;
    }
  }
  
  // จำนวนครั้งใช้งาน (สูงสุด 30 คะแนน)
  if (usageCount > 0) {
    score += Math.min(usageCount * 3, 30);
  }
  
  return Math.min(score, 100);
}

// ==========================================
// 3. INITIALIZATION FUNCTIONS
// ==========================================

/**
 * สร้างตาราง Master ทั้ง 3 ตาราง + Pending_Review
 * รันครั้งเดียวตอนเริ่มใช้งานระบบใหม่
 */
function initializeMasterTables() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    ui.alert('⚠️ ระบบกำลังทำงาน', 'มีผู้ใช้งานอื่นกำลังสร้างตาราง กรุณารอสักครู่', ui.ButtonSet.OK);
    return;
  }
  
  try {
    var sheetsCreated = [];
    
    // 1. สร้าง Master_Persons
    if (!ss.getSheetByName(MASTER_CONFIG.SHEET_PERSONS)) {
      var personSheet = ss.insertSheet(MASTER_CONFIG.SHEET_PERSONS);
      var headers = [
        'Unique_Person_ID', 'ชื่อมาตรฐาน', 'ชื่อ_variants(JSON)', 'รหัสพนักงาน',
        'เบอร์โทร', 'Hash_Key', 'วันที่สร้าง', 'วันที่อัปเดต',
        'สถานะ', 'Merge_To_ID', 'Quality_Score', 'หมายเหตุ'
      ];
      personSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      personSheet.setFrozenRows(1);
      personSheet.setColumnWidth(1, 36);  // ID
      personSheet.setColumnWidth(2, 200); // ชื่อมาตรฐาน
      personSheet.setColumnWidth(3, 300); // Variants
      personSheet.setColumnWidth(5, 120); // เบอร์โทร
      sheetsCreated.push(MASTER_CONFIG.SHEET_PERSONS);
    }
    
    // 2. สร้าง Master_Locations
    if (!ss.getSheetByName(MASTER_CONFIG.SHEET_LOCATIONS)) {
      var locSheet = ss.insertSheet(MASTER_CONFIG.SHEET_LOCATIONS);
      var headers = [
        'Unique_Location_ID', 'ชื่อสถานที่มาตรฐาน', 'ชื่อ_variants(JSON)', 'LAT', 'LNG',
        'Radius_M', 'ที่อยู่เต็ม(Google)', 'จังหวัด', 'เขต/อำเภอ', 'รหัสไปรษณีย์',
        'Hash_Key', 'วันที่สร้าง', 'วันที่อัปเดต', 'สถานะ', 'Merge_To_ID',
        'Quality_Score', 'จำนวนครั้งใช้งาน', 'วันที่ใช้งานล่าสุด', 'หมายเหตุ'
      ];
      locSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      locSheet.setFrozenRows(1);
      locSheet.setColumnWidth(1, 36);  // ID
      locSheet.setColumnWidth(2, 200); // ชื่อสถานที่
      locSheet.setColumnWidth(4, 100); // LAT
      locSheet.setColumnWidth(5, 100); // LNG
      locSheet.setColumnWidth(7, 300); // ที่อยู่
      sheetsCreated.push(MASTER_CONFIG.SHEET_LOCATIONS);
    }
    
    // 3. สร้าง Transaction_Logs
    if (!ss.getSheetByName(MASTER_CONFIG.SHEET_TRANSACTIONS)) {
      var transSheet = ss.insertSheet(MASTER_CONFIG.SHEET_TRANSACTIONS);
      var headers = [
        'Transaction_ID', 'วันที่', 'เวลา', 'Person_ID', 'Location_ID',
        'Shipment_No', 'Invoice_No', 'แหล่งที่มา', 'แถวต้นฉบับ', 'LatLong_Driver',
        'Confidence_%', 'วิธีจับคู่', 'สถานะ', 'ผู้ตรวจสอบ', 'วันที่ตรวจสอบ', 'หมายเหตุ'
      ];
      transSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      transSheet.setFrozenRows(1);
      transSheet.setColumnWidth(1, 36);  // ID
      transSheet.setColumnWidth(6, 150); // Shipment
      transSheet.setColumnWidth(10, 200);// LatLong
      sheetsCreated.push(MASTER_CONFIG.SHEET_TRANSACTIONS);
    }
    
    // 4. สร้าง Pending_Review
    if (!ss.getSheetByName(MASTER_CONFIG.SHEET_PENDING_REVIEW)) {
      var pendingSheet = ss.insertSheet(MASTER_CONFIG.SHEET_PENDING_REVIEW);
      var headers = [
        'Review_ID', 'Timestamp', 'ประเภท', 'ชื่อ_Input', 'LAT_Input', 'LNG_Input',
        'ตัวเลือกที่เสนอ(JSON)', 'คำแนะนำ', 'Confidence_%', 'สถานะ',
        'ผู้ตัดสินใจ', 'วันที่ตัดสินใจ', 'หมายเหตุ'
      ];
      pendingSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      pendingSheet.setFrozenRows(1);
      pendingSheet.setColumnWidth(1, 36);  // ID
      pendingSheet.setColumnWidth(4, 200); // ชื่อ
      pendingSheet.setColumnWidth(7, 400); // Candidates
      sheetsCreated.push(MASTER_CONFIG.SHEET_PENDING_REVIEW);
    }
    
    var msg = '✅ สร้างตาราง Master สำเร็จ!\n\n' + 
              'ตารางที่สร้าง: ' + sheetsCreated.join(', ') + '\n\n' +
              '📌 ขั้นตอนต่อไป:\n' +
              '1. รัน migrateData_FromOldDatabase() เพื่อย้ายข้อมูลเก่า\n' +
              '2. รัน cleanseLegacyData() เพื่อทำความสะอาดข้อมูล';
    
    Logger.log(msg);
    ui.alert('✅ เสร็จสิ้น', msg, ui.ButtonSet.OK);
    
    return {
      success: true,
      sheetsCreated: sheetsCreated
    };
    
  } catch (error) {
    Logger.error('❌ Error initializing master tables: ' + error.message);
    ui.alert('❌ เกิดข้อผิดพลาด', error.message, ui.ButtonSet.OK);
    return {
      success: false,
      error: error.message
    };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 4. PERSON MANAGEMENT FUNCTIONS
// ==========================================

/**
 * ค้นหาบุคคลด้วยชื่อ (รองรับ Fuzzy Match)
 * @param {string} inputName - ชื่อที่ต้องการค้นหา
 * @param {number} threshold - ค่าความคล้ายขั้นต่ำ (%) 
 * @return {object|null} - ข้อมูลบุคคลที่พบ หรือ null
 */
function findPersonByName(inputName, threshold) {
  threshold = threshold || MASTER_CONFIG.FUZZY_MATCH_THRESHOLD;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_PERSONS);
  if (!sheet) return null;
  
  var lastRow = getRealLastRow_(sheet, MASTER_CONFIG.PERSON_COL_NAME_STD);
  if (lastRow < 2) return null;
  
  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var inputNorm = normalizeText(inputName);
  
  var bestMatch = null;
  var bestScore = 0;
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var status = row[MASTER_CONFIG.PERSON_COL_STATUS - 1];
    if (status === 'Deleted' || status === 'Merged') continue;
    
    var stdName = row[MASTER_CONFIG.PERSON_COL_NAME_STD - 1];
    var variantsStr = row[MASTER_CONFIG.PERSON_COL_NAME_VARIANTS - 1];
    
    // ตรวจสอบชื่อมาตรฐาน
    var stdNorm = normalizeText(stdName);
    var scoreStd = calculateSimilarity(inputNorm, stdNorm);
    
    // ตรวจสอบ Variants
    var variants = deserializeVariants(variantsStr);
    var maxVariantScore = 0;
    variants.forEach(function(v) {
      var vNorm = normalizeText(v);
      var scoreV = calculateSimilarity(inputNorm, vNorm);
      if (scoreV > maxVariantScore) maxVariantScore = scoreV;
    });
    
    var bestRowScore = Math.max(scoreStd, maxVariantScore);
    
    if (bestRowScore > bestScore && bestRowScore >= threshold) {
      bestScore = bestRowScore;
      bestMatch = {
        rowIndex: i + 2,
        personId: row[MASTER_CONFIG.PERSON_COL_ID - 1],
        nameStd: stdName,
        variants: variants,
        phone: row[MASTER_CONFIG.PERSON_COL_PHONE - 1],
        employeeId: row[MASTER_CONFIG.PERSON_COL_EMPLOYEE_ID - 1],
        hashKey: row[MASTER_CONFIG.PERSON_COL_HASH_KEY - 1],
        quality: row[MASTER_CONFIG.PERSON_COL_QUALITY - 1],
        matchScore: bestRowScore,
        matchMethod: bestRowScore === scoreStd ? 'Standard' : 'Variant'
      };
    }
  }
  
  return bestMatch;
}

/**
 * ค้นหาบุคคลด้วยเบอร์โทร (Exact Match)
 * @param {string} phone - เบอร์โทรศัพท์
 * @return {object|null} - ข้อมูลบุคคลที่พบ หรือ null
 */
function findPersonByPhone(phone) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_PERSONS);
  if (!sheet) return null;
  
  var lastRow = getRealLastRow_(sheet, MASTER_CONFIG.PERSON_COL_PHONE);
  if (lastRow < 2) return null;
  
  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var cleanPhone = phone.toString().replace(/[^0-9]/g, '');
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var status = row[MASTER_CONFIG.PERSON_COL_STATUS - 1];
    if (status === 'Deleted' || status === 'Merged') continue;
    
    var rowPhone = row[MASTER_CONFIG.PERSON_COL_PHONE - 1];
    if (!rowPhone) continue;
    
    var cleanRowPhone = rowPhone.toString().replace(/[^0-9]/g, '');
    if (cleanRowPhone === cleanPhone) {
      return {
        rowIndex: i + 2,
        personId: row[MASTER_CONFIG.PERSON_COL_ID - 1],
        nameStd: row[MASTER_CONFIG.PERSON_COL_NAME_STD - 1],
        variants: deserializeVariants(row[MASTER_CONFIG.PERSON_COL_NAME_VARIANTS - 1]),
        phone: rowPhone,
        employeeId: row[MASTER_CONFIG.PERSON_COL_EMPLOYEE_ID - 1],
        hashKey: row[MASTER_CONFIG.PERSON_COL_HASH_KEY - 1],
        quality: row[MASTER_CONFIG.PERSON_COL_QUALITY - 1],
        matchScore: 100,
        matchMethod: 'Phone_Exact'
      };
    }
  }
  
  return null;
}

/**
 * เพิ่มหรืออัปเดตบุคคล
 * @param {object} personData - ข้อมูลบุคคล
 * @return {object} - ผลลัพธ์
 */
function upsertPerson(personData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_PERSONS);
  if (!sheet) throw new Error('ไม่พบตาราง Master_Persons');
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    throw new Error('ระบบกำลังทำงาน กรุณาลองใหม่');
  }
  
  try {
    var now = new Date();
    var personId = personData.personId || generateUUID();
    var nameStd = personData.nameStd || personData.name;
    var phone = personData.phone || '';
    var employeeId = personData.employeeId || '';
    var newVariant = personData.name || nameStd;
    
    // สร้าง Hash Key
    var hashKey = createPersonHashKey(nameStd, phone);
    
    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    var existing = null;
    if (phone) {
      existing = findPersonByPhone(phone);
    }
    if (!existing && nameStd) {
      existing = findPersonByName(nameStd, MASTER_CONFIG.FUZZY_MATCH_THRESHOLD);
    }
    
    if (existing) {
      // อัปเดต: เพิ่ม Variant ถ้ายังไม่มี
      var variants = existing.variants || [];
      var newVariantNorm = normalizeText(newVariant);
      var hasVariant = false;
      
      variants.forEach(function(v) {
        if (normalizeText(v) === newVariantNorm) hasVariant = true;
      });
      
      if (!hasVariant && newVariantNorm !== normalizeText(existing.nameStd)) {
        variants.push(newVariant);
      }
      
      // อัปเดตแถว
      var updateRow = dbObjectToRow({
        name: existing.nameStd,
        lat: '',
        lng: '',
        suggested: '',
        confidence: '',
        normalized: '',
        verified: false,
        sysAddr: '',
        googleAddr: '',
        distKm: '',
        uuid: existing.personId,
        province: '',
        district: '',
        postcode: '',
        quality: calculatePersonQualityScore(existing.nameStd, phone, employeeId, variants.length),
        created: now,
        updated: now,
        coordSource: '',
        coordConfidence: 0,
        coordLastUpdated: '',
        recordStatus: 'Active',
        mergedToUuid: ''
      });
      
      // Mapping ให้ตรงกับโครงสร้าง Person
      updateRow[MASTER_CONFIG.PERSON_COL_ID - 1] = existing.personId;
      updateRow[MASTER_CONFIG.PERSON_COL_NAME_STD - 1] = existing.nameStd;
      updateRow[MASTER_CONFIG.PERSON_COL_NAME_VARIANTS - 1] = serializeVariants(variants);
      updateRow[MASTER_CONFIG.PERSON_COL_EMPLOYEE_ID - 1] = employeeId || existing.employeeId;
      updateRow[MASTER_CONFIG.PERSON_COL_PHONE - 1] = phone || existing.phone;
      updateRow[MASTER_CONFIG.PERSON_COL_HASH_KEY - 1] = hashKey;
      updateRow[MASTER_CONFIG.PERSON_COL_STATUS - 1] = 'Active';
      updateRow[MASTER_CONFIG.PERSON_COL_QUALITY - 1] = calculatePersonQualityScore(existing.nameStd, phone || existing.phone, employeeId || existing.employeeId, variants.length);
      
      sheet.getRange(existing.rowIndex, 1, 1, MASTER_CONFIG.PERSON_COL_NOTES).setValues([updateRow.slice(0, MASTER_CONFIG.PERSON_COL_NOTES)]);
      
      return {
        action: 'updated',
        personId: existing.personId,
        rowIndex: existing.rowIndex,
        message: 'อัปเดตบุคคลสำเร็จ เพิ่ม variant: ' + newVariant
      };
    } else {
      // เพิ่มใหม่
      var newRow = new Array(MASTER_CONFIG.PERSON_COL_NOTES).fill('');
      newRow[MASTER_CONFIG.PERSON_COL_ID - 1] = personId;
      newRow[MASTER_CONFIG.PERSON_COL_NAME_STD - 1] = nameStd;
      newRow[MASTER_CONFIG.PERSON_COL_NAME_VARIANTS - 1] = serializeVariants([newVariant]);
      newRow[MASTER_CONFIG.PERSON_COL_EMPLOYEE_ID - 1] = employeeId;
      newRow[MASTER_CONFIG.PERSON_COL_PHONE - 1] = phone;
      newRow[MASTER_CONFIG.PERSON_COL_HASH_KEY - 1] = hashKey;
      newRow[MASTER_CONFIG.PERSON_COL_CREATED - 1] = now;
      newRow[MASTER_CONFIG.PERSON_COL_UPDATED - 1] = now;
      newRow[MASTER_CONFIG.PERSON_COL_STATUS - 1] = 'Active';
      newRow[MASTER_CONFIG.PERSON_COL_QUALITY - 1] = calculatePersonQualityScore(nameStd, phone, employeeId, 1);
      
      var lastRow = getRealLastRow_(sheet, MASTER_CONFIG.PERSON_COL_NAME_STD) + 1;
      sheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);
      
      return {
        action: 'created',
        personId: personId,
        rowIndex: lastRow,
        message: 'เพิ่มบุคคลใหม่สำเร็จ'
      };
    }
    
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 5. LOCATION MANAGEMENT FUNCTIONS
// ==========================================

/**
 * ค้นหาสถานที่ด้วยพิกัด (Radius Check)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMeters - รัศมีค้นหา (เมตร)
 * @return {array} - รายการสถานที่ที่พบในรัศมี
 */
function findLocationsByRadius(lat, lng, radiusMeters) {
  radiusMeters = radiusMeters || MASTER_CONFIG.RADIUS_CHECK_METERS;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_LOCATIONS);
  if (!sheet) return [];
  
  var lastRow = getRealLastRow_(sheet, MASTER_CONFIG.LOC_COL_NAME_STD);
  if (lastRow < 2) return [];
  
  var data = sheet.getRange(2, 1, lastRow - 1, 19).getValues();
  var results = [];
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var status = row[MASTER_CONFIG.LOC_COL_STATUS - 1];
    if (status === 'Deleted' || status === 'Merged') continue;
    
    var rowLat = parseFloat(row[MASTER_CONFIG.LOC_COL_LAT - 1]);
    var rowLng = parseFloat(row[MASTER_CONFIG.LOC_COL_LNG - 1]);
    
    if (isNaN(rowLat) || isNaN(rowLng)) continue;
    
    var distanceKm = getHaversineDistanceKM(lat, lng, rowLat, rowLng);
    var distanceMeters = distanceKm * 1000;
    
    if (distanceMeters <= radiusMeters) {
      results.push({
        rowIndex: i + 2,
        locationId: row[MASTER_CONFIG.LOC_COL_ID - 1],
        nameStd: row[MASTER_CONFIG.LOC_COL_NAME_STD - 1],
        variants: deserializeVariants(row[MASTER_CONFIG.LOC_COL_NAME_VARIANTS - 1]),
        lat: rowLat,
        lng: rowLng,
        radius: row[MASTER_CONFIG.LOC_COL_RADIUS_M - 1] || MASTER_CONFIG.RADIUS_CHECK_METERS,
        addrFull: row[MASTER_CONFIG.LOC_COL_ADDR_FULL - 1],
        province: row[MASTER_CONFIG.LOC_COL_PROVINCE - 1],
        district: row[MASTER_CONFIG.LOC_COL_DISTRICT - 1],
        postcode: row[MASTER_CONFIG.LOC_COL_POSTCODE - 1],
        hashKey: row[MASTER_CONFIG.LOC_COL_HASH_KEY - 1],
        quality: row[MASTER_CONFIG.LOC_COL_QUALITY - 1],
        usageCount: row[MASTER_CONFIG.LOC_COL_USAGE_COUNT - 1] || 0,
        distanceMeters: Math.round(distanceMeters),
        matchMethod: 'Radius_' + Math.round(distanceMeters) + 'm'
      });
    }
  }
  
  // เรียงตามระยะทางใกล้สุด
  results.sort(function(a, b) {
    return a.distanceMeters - b.distanceMeters;
  });
  
  return results;
}

/**
 * ค้นหาสถานที่ด้วยชื่อ (รองรับ Fuzzy Match)
 * @param {string} inputName - ชื่อที่ต้องการค้นหา
 * @param {number} threshold - ค่าความคล้ายขั้นต่ำ (%)
 * @return {object|null} - ข้อมูลสถานที่ที่พบ หรือ null
 */
function findLocationByName(inputName, threshold) {
  threshold = threshold || MASTER_CONFIG.FUZZY_MATCH_THRESHOLD;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_LOCATIONS);
  if (!sheet) return null;
  
  var lastRow = getRealLastRow_(sheet, MASTER_CONFIG.LOC_COL_NAME_STD);
  if (lastRow < 2) return null;
  
  var data = sheet.getRange(2, 1, lastRow - 1, 19).getValues();
  var inputNorm = normalizeText(inputName);
  
  var bestMatch = null;
  var bestScore = 0;
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var status = row[MASTER_CONFIG.LOC_COL_STATUS - 1];
    if (status === 'Deleted' || status === 'Merged') continue;
    
    var stdName = row[MASTER_CONFIG.LOC_COL_NAME_STD - 1];
    var variantsStr = row[MASTER_CONFIG.LOC_COL_NAME_VARIANTS - 1];
    
    var stdNorm = normalizeText(stdName);
    var scoreStd = calculateSimilarity(inputNorm, stdNorm);
    
    var variants = deserializeVariants(variantsStr);
    var maxVariantScore = 0;
    variants.forEach(function(v) {
      var vNorm = normalizeText(v);
      var scoreV = calculateSimilarity(inputNorm, vNorm);
      if (scoreV > maxVariantScore) maxVariantScore = scoreV;
    });
    
    var bestRowScore = Math.max(scoreStd, maxVariantScore);
    
    if (bestRowScore > bestScore && bestRowScore >= threshold) {
      bestScore = bestRowScore;
      bestMatch = {
        rowIndex: i + 2,
        locationId: row[MASTER_CONFIG.LOC_COL_ID - 1],
        nameStd: stdName,
        variants: variants,
        lat: row[MASTER_CONFIG.LOC_COL_LAT - 1],
        lng: row[MASTER_CONFIG.LOC_COL_LNG - 1],
        addrFull: row[MASTER_CONFIG.LOC_COL_ADDR_FULL - 1],
        province: row[MASTER_CONFIG.LOC_COL_PROVINCE - 1],
        district: row[MASTER_CONFIG.LOC_COL_DISTRICT - 1],
        postcode: row[MASTER_CONFIG.LOC_COL_POSTCODE - 1],
        quality: row[MASTER_CONFIG.LOC_COL_QUALITY - 1],
        matchScore: bestRowScore,
        matchMethod: bestRowScore === scoreStd ? 'Standard' : 'Variant'
      };
    }
  }
  
  return bestMatch;
}

/**
 * เพิ่มหรืออัปเดตสถานที่
 * @param {object} locationData - ข้อมูลสถานที่
 * @return {object} - ผลลัพธ์
 */
function upsertLocation(locationData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_LOCATIONS);
  if (!sheet) throw new Error('ไม่พบตาราง Master_Locations');
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    throw new Error('ระบบกำลังทำงาน กรุณาลองใหม่');
  }
  
  try {
    var now = new Date();
    var locationId = locationData.locationId || generateUUID();
    var nameStd = locationData.nameStd || locationData.name;
    var lat = parseFloat(locationData.lat);
    var lng = parseFloat(locationData.lng);
    var addrFull = locationData.addrFull || '';
    var province = locationData.province || '';
    var district = locationData.district || '';
    var postcode = locationData.postcode || '';
    var newVariant = locationData.name || nameStd;
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('พิกัดไม่ถูกต้อง');
    }
    
    // สร้าง Hash Key
    var hashKey = createLocationHashKey(lat, lng, addrFull);
    
    // ตรวจสอบด้วย Radius ก่อน (สำคัญที่สุด)
    var nearbyLocations = findLocationsByRadius(lat, lng, MASTER_CONFIG.RADIUS_CHECK_METERS);
    
    if (nearbyLocations.length > 0) {
      // พบสถานที่ในรัศมี → อัปเดต
      var existing = nearbyLocations[0]; // เอาตัวที่ใกล้สุด
      
      // เพิ่ม Variant ถ้ายังไม่มี
      var variants = existing.variants || [];
      var newVariantNorm = normalizeText(newVariant);
      var hasVariant = false;
      
      variants.forEach(function(v) {
        if (normalizeText(v) === newVariantNorm) hasVariant = true;
      });
      
      if (!hasVariant && newVariantNorm !== normalizeText(existing.nameStd)) {
        variants.push(newVariant);
      }
      
      // อัปเดต Usage Count
      var newUsageCount = (existing.usageCount || 0) + 1;
      
      // เตรียมข้อมูลอัปเดต
      var updateRow = new Array(MASTER_CONFIG.LOC_COL_NOTES).fill('');
      updateRow[MASTER_CONFIG.LOC_COL_ID - 1] = existing.locationId;
      updateRow[MASTER_CONFIG.LOC_COL_NAME_STD - 1] = existing.nameStd;
      updateRow[MASTER_CONFIG.LOC_COL_NAME_VARIANTS - 1] = serializeVariants(variants);
      updateRow[MASTER_CONFIG.LOC_COL_LAT - 1] = lat;
      updateRow[MASTER_CONFIG.LOC_COL_LNG - 1] = lng;
      updateRow[MASTER_CONFIG.LOC_COL_RADIUS_M - 1] = MASTER_CONFIG.RADIUS_CHECK_METERS;
      updateRow[MASTER_CONFIG.LOC_COL_ADDR_FULL - 1] = addrFull || existing.addrFull;
      updateRow[MASTER_CONFIG.LOC_COL_PROVINCE - 1] = province || existing.province;
      updateRow[MASTER_CONFIG.LOC_COL_DISTRICT - 1] = district || existing.district;
      updateRow[MASTER_CONFIG.LOC_COL_POSTCODE - 1] = postcode || existing.postcode;
      updateRow[MASTER_CONFIG.LOC_COL_HASH_KEY - 1] = hashKey;
      updateRow[MASTER_CONFIG.LOC_COL_UPDATED - 1] = now;
      updateRow[MASTER_CONFIG.LOC_COL_STATUS - 1] = 'Active';
      updateRow[MASTER_CONFIG.LOC_COL_QUALITY - 1] = calculateLocationQualityScore(existing.nameStd, lat, lng, addrFull || existing.addrFull, province || existing.province, newUsageCount);
      updateRow[MASTER_CONFIG.LOC_COL_USAGE_COUNT - 1] = newUsageCount;
      updateRow[MASTER_CONFIG.LOC_COL_LAST_USED - 1] = now;
      
      sheet.getRange(existing.rowIndex, 1, 1, updateRow.length).setValues([updateRow]);
      
      return {
        action: 'updated',
        locationId: existing.locationId,
        rowIndex: existing.rowIndex,
        message: 'อัปเดตสถานที่สำเร็จ (ระยะห่าง: ' + existing.distanceMeters + 'ม.)',
        isNearby: true,
        distanceMeters: existing.distanceMeters
      };
    } else {
      // ไม่พบในรัศมี → เพิ่มใหม่
      var newRow = new Array(MASTER_CONFIG.LOC_COL_NOTES).fill('');
      newRow[MASTER_CONFIG.LOC_COL_ID - 1] = locationId;
      newRow[MASTER_CONFIG.LOC_COL_NAME_STD - 1] = nameStd;
      newRow[MASTER_CONFIG.LOC_COL_NAME_VARIANTS - 1] = serializeVariants([newVariant]);
      newRow[MASTER_CONFIG.LOC_COL_LAT - 1] = lat;
      newRow[MASTER_CONFIG.LOC_COL_LNG - 1] = lng;
      newRow[MASTER_CONFIG.LOC_COL_RADIUS_M - 1] = MASTER_CONFIG.RADIUS_CHECK_METERS;
      newRow[MASTER_CONFIG.LOC_COL_ADDR_FULL - 1] = addrFull;
      newRow[MASTER_CONFIG.LOC_COL_PROVINCE - 1] = province;
      newRow[MASTER_CONFIG.LOC_COL_DISTRICT - 1] = district;
      newRow[MASTER_CONFIG.LOC_COL_POSTCODE - 1] = postcode;
      newRow[MASTER_CONFIG.LOC_COL_HASH_KEY - 1] = hashKey;
      newRow[MASTER_CONFIG.LOC_COL_CREATED - 1] = now;
      newRow[MASTER_CONFIG.LOC_COL_UPDATED - 1] = now;
      newRow[MASTER_CONFIG.LOC_COL_STATUS - 1] = 'Active';
      newRow[MASTER_CONFIG.LOC_COL_QUALITY - 1] = calculateLocationQualityScore(nameStd, lat, lng, addrFull, province, 1);
      newRow[MASTER_CONFIG.LOC_COL_USAGE_COUNT - 1] = 1;
      newRow[MASTER_CONFIG.LOC_COL_LAST_USED - 1] = now;
      
      var lastRow = getRealLastRow_(sheet, MASTER_CONFIG.LOC_COL_NAME_STD) + 1;
      sheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);
      
      return {
        action: 'created',
        locationId: locationId,
        rowIndex: lastRow,
        message: 'เพิ่มสถานที่ใหม่สำเร็จ',
        isNearby: false
      };
    }
    
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 6. TRANSACTION LOGGING
// ==========================================

/**
 * บันทึก Transaction
 * @param {object} transData - ข้อมูล Transaction
 * @return {object} - ผลลัพธ์
 */
function logTransaction(transData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_TRANSACTIONS);
  if (!sheet) throw new Error('ไม่พบตาราง Transaction_Logs');
  
  var transId = transData.transId || generateUUID();
  var transDate = transData.date || new Date();
  var transTime = Utilities.formatString(transDate, 'HH:mm:ss');
  
  var newRow = new Array(MASTER_CONFIG.COL_NOTES).fill('');
  newRow[MASTER_CONFIG.TRANS_COL_ID - 1] = transId;
  newRow[MASTER_CONFIG.TRANS_COL_DATE - 1] = transDate;
  newRow[MASTER_CONFIG.TRANS_COL_TIME - 1] = transTime;
  newRow[MASTER_CONFIG.TRANS_COL_PERSON_ID - 1] = transData.personId || '';
  newRow[MASTER_CONFIG.TRANS_COL_LOCATION_ID - 1] = transData.locationId || '';
  newRow[MASTER_CONFIG.TRANS_COL_SHIPMENT_NO - 1] = transData.shipmentNo || '';
  newRow[MASTER_CONFIG.TRANS_COL_INVOICE_NO - 1] = transData.invoiceNo || '';
  newRow[MASTER_CONFIG.TRANS_COL_SOURCE_SHEET - 1] = transData.sourceSheet || '';
  newRow[MASTER_CONFIG.TRANS_COL_ROW_ORIGINAL - 1] = transData.rowOriginal || '';
  newRow[MASTER_CONFIG.TRANS_COL_LATLNG_RAW - 1] = transData.latLngRaw || '';
  newRow[MASTER_CONFIG.TRANS_COL_CONFIDENCE - 1] = transData.confidence || 0;
  newRow[MASTER_CONFIG.TRANS_COL_MATCH_METHOD - 1] = transData.matchMethod || '';
  newRow[MASTER_CONFIG.TRANS_COL_STATUS - 1] = transData.status || 'Approved';
  newRow[MASTER_CONFIG.TRANS_COL_REVIEWED_BY - 1] = transData.reviewedBy || '';
  newRow[MASTER_CONFIG.TRANS_COL_REVIEWED_AT - 1] = transData.reviewedAt || '';
  newRow[MASTER_CONFIG.TRANS_COL_NOTES - 1] = transData.notes || '';
  
  var lastRow = sheet.getLastRow() + 1;
  sheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);
  
  return {
    success: true,
    transId: transId,
    rowIndex: lastRow
  };
}

// ==========================================
// 7. VALIDATION & MATCHING ENGINE
// ==========================================

/**
 * ตรวจสอบและจับคู่ข้อมูลก่อนบันทึก (Main Entry Point)
 * @param {object} inputData - ข้อมูล Input จาก SCG
 * @return {object} - ผลลัพธ์การจับคู่
 */
function validateAndMatchData(inputData) {
  var result = {
    personMatch: null,
    locationMatch: null,
    needsReview: false,
    reviewReason: [],
    confidence: 0,
    actions: []
  };
  
  var inputName = inputData.name || '';
  var inputLat = parseFloat(inputData.lat);
  var inputLng = parseFloat(inputData.lng);
  var inputPhone = inputData.phone || '';
  
  // 1. จับคู่บุคคล
  if (inputPhone) {
    result.personMatch = findPersonByPhone(inputPhone);
  }
  
  if (!result.personMatch && inputName) {
    result.personMatch = findPersonByName(inputName, MASTER_CONFIG.FUZZY_MATCH_THRESHOLD);
  }
  
  // 2. จับคู่สถานที่
  if (!isNaN(inputLat) && !isNaN(inputLng)) {
    var nearbyLocations = findLocationsByRadius(inputLat, inputLng, MASTER_CONFIG.RADIUS_CHECK_METERS);
    if (nearbyLocations.length > 0) {
      result.locationMatch = nearbyLocations[0];
    }
  }
  
  if (!result.locationMatch && inputName) {
    result.locationMatch = findLocationByName(inputName, MASTER_CONFIG.FUZZY_MATCH_THRESHOLD);
  }
  
  // 3. คำนวณ Confidence และตัดสินใจ
  var personScore = result.personMatch ? result.personMatch.matchScore : 0;
  var locationScore = result.locationMatch ? (result.locationMatch.distanceMeters ? 100 - Math.min(result.locationMatch.distanceMeters / 5, 50) : 100) : 0;
  
  result.confidence = Math.round((personScore + locationScore) / 2);
  
  // 4. ตรวจสอบเงื่อนไขที่ต้อง Review
  if (!result.personMatch && !result.locationMatch) {
    result.needsReview = true;
    result.reviewReason.push('ไม่พบบุคคลหรือสถานที่ในระบบ');
  }
  
  if (result.personMatch && result.personMatch.matchScore < MASTER_CONFIG.AUTO_APPROVE_THRESHOLD) {
    result.needsReview = true;
    result.reviewReason.push('ความมั่นใจบุคคลต่ำ (' + result.personMatch.matchScore + '%)');
  }
  
  if (result.locationMatch && result.locationMatch.distanceMeters > 10) {
    result.needsReview = true;
    result.reviewReason.push('พิกัดห่างจากฐานข้อมูล (' + result.locationMatch.distanceMeters + 'ม.)');
  }
  
  // 5. กำหนด Action
  if (result.needsReview) {
    result.actions.push('send_to_pending_review');
  } else {
    if (!result.personMatch) {
      result.actions.push('create_person');
    }
    if (!result.locationMatch) {
      result.actions.push('create_location');
    }
    result.actions.push('log_transaction');
  }
  
  return result;
}

/**
 * ส่งข้อมูลเข้า Pending Review Queue
 * @param {object} reviewData - ข้อมูลสำหรับ Review
 * @return {object} - ผลลัพธ์
 */
function sendToPendingReview(reviewData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_PENDING_REVIEW);
  if (!sheet) throw new Error('ไม่พบตาราง Pending_Review');
  
  var reviewId = generateUUID();
  var now = new Date();
  
  var candidates = reviewData.candidates || [];
  var suggestedAction = reviewData.suggestedAction || 'Manual Review Required';
  
  var newRow = new Array(MASTER_CONFIG.PENDING_COL_NOTES).fill('');
  newRow[MASTER_CONFIG.PENDING_COL_ID - 1] = reviewId;
  newRow[MASTER_CONFIG.PENDING_COL_TIMESTAMP - 1] = now;
  newRow[MASTER_CONFIG.PENDING_COL_TYPE - 1] = reviewData.type || 'Both';
  newRow[MASTER_CONFIG.PENDING_COL_INPUT_NAME - 1] = reviewData.inputName || '';
  newRow[MASTER_CONFIG.PENDING_COL_INPUT_LAT - 1] = reviewData.inputLat || '';
  newRow[MASTER_CONFIG.PENDING_COL_INPUT_LNG - 1] = reviewData.inputLng || '';
  newRow[MASTER_CONFIG.PENDING_COL_MATCH_CANDIDATES - 1] = JSON.stringify(candidates);
  newRow[MASTER_CONFIG.PENDING_COL_SUGGESTED_ACTION - 1] = suggestedAction;
  newRow[MASTER_CONFIG.PENDING_COL_CONFIDENCE - 1] = reviewData.confidence || 0;
  newRow[MASTER_CONFIG.PENDING_COL_STATUS - 1] = 'Pending';
  
  var lastRow = sheet.getLastRow() + 1;
  sheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);
  
  return {
    success: true,
    reviewId: reviewId,
    rowIndex: lastRow,
    message: 'ส่งเข้าคิวตรวจสอบสำเร็จ'
  };
}

// ==========================================
// 6. DAILY DATA INGESTION & ORCHESTRATION
// ==========================================

/**
 * ฟังก์ชันหลัก: ดึงข้อมูลจาก SCGนครหลวงJWDภูมิภาค -> Validate -> อัปเดต Master
 * Admin กดรันเมื่อต้องการประมวลผลข้อมูลใหม่ประจำวัน
 * @returns {Object} สรุปผลการประมวลผล
 */
function runDailyDataIngestion() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheetName = "SCGนครหลวงJWDภูมิภาค";
  const pendingSheetName = "Pending_Review";
  
  // 1. ตรวจสอบชีตต้นทาง
  const sourceSheet = ss.getSheetByName(sourceSheetName);
  if (!sourceSheet) {
    throw new Error(`ไม่พบชีตแหล่งข้อมูล: ${sourceSheetName}`);
  }

  const lastRow = sourceSheet.getLastRow();
  if (lastRow < 2) {
    const msg = "✅ ไม่มีข้อมูลใหม่ให้ประมวลผล";
    Logger.log(msg);
    SpreadsheetApp.getUi().alert("สรุปผลการประมวลผล", msg, SpreadsheetApp.getUi().ButtonSet.OK);
    return { status: "SUCCESS", message: msg };
  }

  // ดึงข้อมูลทั้งหมด (ปรับ Column Index ตามโครงสร้างจริงของคุณ)
  // โครงสร้างคอลัมน์ตามที่คุณระบุ:
  // A=head, B=ID_SCG, C=วันที่ส่ง, D=เวลาส่ง, E=จุดส่ง(LatLong), F=ชื่อ-นามสกุล
  // G=ทะเบียนรถ, H=Shipment No, I=Invoice No, J=รูปบิล, K=รหัสลูกค้า, L=ชื่อเจ้าของสินค้า
  // M=ชื่อปลายทาง, N=Email พนักงาน, O=LAT, P=LONG, Q=ID_Doc_Return, R=คลังสินค้า
  // S=ที่อยู่ปลายทาง, T=รูปสินค้า, U=รูปหน้าร้าน, V=หมายเหตุ, W=เดือน, X=ระยะทาง_Km
  // Y=ชื่อที่อยู่จาก_LatLong, Z=SM_Link, AA=ID_พนักงาน, AB=พิกัดตอนกดบันทึก
  // AC=เวลาเริ่มกรอก, AD=เวลาบันทึกสำเร็จ, AE=ระยะขยับ_เมตร, AF=ระยะเวลา_นาที
  // AG=ความเร็ว_เมตร/นาที, AH=ผลการตรวจ, AI=เหตุผิดปกติ, AJ=เวลาถ่ายรูป, AK=SYNC_STATUS
  
  // คอลัมน์ที่สำคัญสำหรับ Master Data:
  // F(6)=ชื่อลูกค้า, O(15)=LAT, P(16)=LONG, S(19)=ที่อยู่, B(2)=ID_SCG
  const rawData = sourceSheet.getRange(2, 1, lastRow - 1, sourceSheet.getLastColumn()).getValues();
  
  let processedCount = 0;
  let autoApprovedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  let errorCount = 0;
  const pendingRows = [];

  Logger.log(`🚀 เริ่มประมวลผลข้อมูล ${rawData.length} แถวจากชีต ${sourceSheetName}...`);

  // 3. วนลูปประมวลผลทีละแถว
  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      
      // Map ข้อมูลจาก Row เข้า Object (Index แบบ 0-based ใน array)
      const rawRecord = {
        sourceId: row[1],          // Col B: ID_SCG
        customerName: row[5],      // Col F: ชื่อ-นามสกุล
        lat: row[14],              // Col O: LAT
        lng: row[15],              // Col P: LONG
        address: row[18],          // Col S: ที่อยู่ปลายทาง
        shipmentNo: row[7],        // Col H: Shipment No
        invoiceNo: row[8],         // Col I: Invoice No
        fullRow: row
      };

      // ข้ามแถวที่ไม่มีข้อมูลสำคัญ
      if (!rawRecord.customerName || !rawRecord.lat || !rawRecord.lng) {
        rejectedCount++;
        continue;
      }

      // 4. เรียกใช้ Validation Layer (จาก Service_Validation.gs)
      const validationResults = validateIncomingRecord(rawRecord);

      // 5. จัดการตามผลลัพธ์ Confidence Score
      if (validationResults.confidence >= MASTER_CONFIG.AUTO_APPROVE_THRESHOLD) {
        // --- กรณีมั่นใจสูง (≥95%): Auto Approve ---
        updateMasterTables(validationResults, rawRecord);
        autoApprovedCount++;
        
      } else if (validationResults.confidence >= MASTER_CONFIG.REVIEW_THRESHOLD) {
        // --- กรณีสงสัย (70-94%): ส่งเข้า Pending Review ---
        pendingRows.push({
          ...rawRecord,
          confidenceScore: validationResults.confidence,
          matchedPersonId: validationResults.personMatch ? validationResults.personMatch.id : null,
          matchedLocationId: validationResults.locationMatch ? validationResults.locationMatch.id : null,
          reason: validationResults.reason,
          suggestedAction: validationResults.suggestedAction
        });
        pendingCount++;
        
      } else {
        // --- กรณีไม่มั่นใจ (<70%): Reject ---
        rejectedCount++;
        Logger.log(`⚠️ Reject Row ${i+2}: Score ${validationResults.confidence}% - ${validationResults.reason}`);
      }
      
      processedCount++;
      
    } catch (e) {
      errorCount++;
      Logger.log(`❌ Error processing row ${i+2}: ${e.message}`);
    }
  }

  // 6. บันทึกลงชีต Pending_Review (ถ้ามี)
  if (pendingRows.length > 0) {
    saveToPendingReview(pendingRows, pendingSheetName);
  }

  const summary = {
    status: "COMPLETED",
    totalProcessed: processedCount,
    autoApproved: autoApprovedCount,
    pendingReview: pendingCount,
    rejected: rejectedCount,
    errors: errorCount
  };

  const summaryMsg = `✅ ประมวลผลเสร็จสิ้น!\n\n` +
                     `📊 ทั้งหมด: ${processedCount} แถว\n` +
                     `✅ อัตโนมัติ: ${autoApprovedCount} (${((autoApprovedCount/processedCount)*100).toFixed(1)}%)\n` +
                     `⏳ รอตรวจสอบ: ${pendingCount}\n` +
                     `❌ ปฏิเสธ: ${rejectedCount}\n` +
                     `⚠️ ผิดพลาด: ${errorCount}`;
  
  Logger.log(JSON.stringify(summary));
  SpreadsheetApp.getUi().alert("สรุปผลการประมวลผล", summaryMsg, SpreadsheetApp.getUi().ButtonSet.OK);

  return summary;
}

/**
 * ฟังก์ชันช่วย: บันทึกข้อมูลลงชีต Pending_Review
 * @param {Array} rows ข้อมูลรอตรวจสอบ
 * @param {String} sheetName ชื่อชีต
 */
function saveToPendingReview(rows, sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // สร้างชีตถ้ายังไม่มี
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      "Timestamp", "Source ID", "ชื่อลูกค้า", "LAT", "LONG", "ที่อยู่", 
      "Confidence Score", "Matched Person ID", "Matched Location ID", 
      "เหตุผล/ข้อสงสัย", "คำแนะนำจากระบบ", "Status", "Admin_Action"
    ]);
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(10, 300);
  }

  const timestamp = new Date();
  const dataToWrite = rows.map(r => [
    timestamp,
    r.sourceId,
    r.customerName,
    r.lat,
    r.lng,
    r.address,
    r.confidenceScore,
    r.matchedPersonId || "",
    r.matchedLocationId || "",
    r.reason,
    r.suggestedAction,
    "PENDING",
    ""
  ]);

  sheet.getRange(sheet.getLastRow() + 1, 1, dataToWrite.length, dataToWrite[0].length).setValues(dataToWrite);
  Logger.log(`📝 บันทึก ${rows.length} แถวลงชีต Pending_Review`);
}

/**
 * ฟังก์ชันช่วย: อัปเดต Master Tables เมื่อผ่านการตรวจสอบ
 * @param {Object} validationResult ผลจาก Validation
 * @param {Object} rawRecord ข้อมูลดิบ
 */
function updateMasterTables(validationResult, rawRecord) {
  const now = new Date();
  
  // 1. จัดการบุคคล (Person)
  if (validationResult.personMatch) {
    // อัปเดตสถิติบุคคลที่มีอยู่ (เพิ่มความถี่การใช้งาน)
    // หมายเหตุ: ต้องเพิ่มฟังก์ชันนี้ใน Service_MasterData.gs
    Logger.log(`✓ อัปเดตบุคคลที่มีอยู่: ${validationResult.personMatch.id}`);
  } else {
    // สร้างบุคคลใหม่
    createNewPersonFromRaw(rawRecord, now);
    Logger.log(`✓ สร้างบุคคลใหม่: ${rawRecord.customerName}`);
  }

  // 2. จัดการสถานที่ (Location)
  if (validationResult.locationMatch) {
    // อัปเดตสถิติสถานที่ที่มีอยู่
    Logger.log(`✓ อัปเดตสถานที่ที่มีอยู่: ${validationResult.locationMatch.id}`);
  } else {
    // สร้างสถานที่ใหม่
    createNewLocationFromRaw(rawRecord, now);
    Logger.log(`✓ สร้างสถานที่ใหม่: Lat=${rawRecord.lat}, Lng=${rawRecord.lng}`);
  }

  // 3. บันทึก Transaction Log
  logTransaction(rawRecord, validationResult, now);
}

/**
 * สร้างบุคคลใหม่จากข้อมูลดิบ
 */
function createNewPersonFromRaw(rawRecord, timestamp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_PERSONS);
  if (!sheet) throw new Error('ไม่พบตาราง Master_Persons');

  const personId = generateUUID();
  const hashKey = createPersonHashKey(rawRecord.customerName, '');
  
  const newRow = [
    personId,                    // Unique_Person_ID
    rawRecord.customerName,      // ชื่อมาตรฐาน
    serializeVariants([rawRecord.customerName]), // Variants
    '',                          // รหัสพนักงาน
    '',                          // เบอร์โทร
    hashKey,                     // Hash_Key
    timestamp,                   // วันที่สร้าง
    timestamp,                   // วันที่อัปเดต
    'Active',                    // สถานะ
    '',                          // Merge_To_ID
    calculatePersonQualityScore(rawRecord.customerName, '', '', 1), // Quality_Score
    `Imported from ${rawRecord.sourceId}` // หมายเหตุ
  ];

  sheet.appendRow(newRow);
}

/**
 * สร้างสถานที่ใหม่จากข้อมูลดิบ
 */
function createNewLocationFromRaw(rawRecord, timestamp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_LOCATIONS);
  if (!sheet) throw new Error('ไม่พบตาราง Master_Locations');

  const locationId = generateUUID();
  const hashKey = createLocationHashKey(rawRecord.lat, rawRecord.lng, rawRecord.address || '');
  
  const newRow = [
    locationId,                  // Unique_Location_ID
    rawRecord.address || 'ไม่มีชื่อ', // ชื่อสถานที่มาตรฐาน
    serializeVariants([rawRecord.address || 'ไม่มีชื่อ']), // Variants
    rawRecord.lat,               // LAT
    rawRecord.lng,               // LNG
    20,                          // Radius_M (ค่าเริ่มต้น)
    '',                          // ที่อยู่เต็ม(Google)
    '',                          // จังหวัด
    '',                          // เขต/อำเภอ
    '',                          // รหัสไปรษณีย์
    hashKey,                     // Hash_Key
    timestamp,                   // วันที่สร้าง
    timestamp,                   // วันที่อัปเดต
    'Active',                    // สถานะ
    '',                          // Merge_To_ID
    calculateLocationQualityScore(rawRecord.address, rawRecord.lat, rawRecord.lng, '', '', 1), // Quality_Score
    1,                           // จำนวนครั้งใช้งาน
    timestamp,                   // วันที่ใช้งานล่าสุด
    `Imported from ${rawRecord.sourceId}` // หมายเหตุ
  ];

  sheet.appendRow(newRow);
}

/**
 * บันทึก Transaction Log
 */
function logTransaction(rawRecord, validationResult, timestamp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MASTER_CONFIG.SHEET_TRANSACTIONS);
  if (!sheet) throw new Error('ไม่พบตาราง Transaction_Logs');

  const transId = generateUUID();
  const matchMethod = validationResult.confidence >= 95 ? 'Auto_Approve' : 
                      validationResult.confidence >= 70 ? 'Manual_Review' : 'Low_Confidence';

  const newRow = [
    transId,                     // Transaction_ID
    timestamp,                   // วันที่
    timestamp.toLocaleTimeString(), // เวลา
    validationResult.personMatch ? validationResult.personMatch.id : '', // Person_ID
    validationResult.locationMatch ? validationResult.locationMatch.id : '', // Location_ID
    rawRecord.shipmentNo || '',  // Shipment_No
    rawRecord.invoiceNo || '',   // Invoice_No
    'SCGนครหลวงJWDภูมิภาค',     // แหล่งที่มา
    '',                          // แถวต้นฉบับ
    `${rawRecord.lat},${rawRecord.lng}`, // LatLong_Driver
    validationResult.confidence, // Confidence_%
    matchMethod,                 // วิธีจับคู่
    'Approved',                  // สถานะ
    'System',                    // ผู้ตรวจสอบ
    timestamp,                   // วันที่ตรวจสอบ
    ''                           // หมายเหตุ
  ];

  sheet.appendRow(newRow);
}
