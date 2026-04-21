/**
 * VERSION: 1.0 — Phase 2: Data Cleansing
 * 🧹 Service: Data Cleansing - ทำความสะอาดข้อมูลเก่าจากชีต SCGนครหลวงJWDภูมิภาค
 * -----------------------------------------------------------
 * [NEW v1.0]: สคริปต์ทำความสะอาดข้อมูล_legacy_ ก่อน migrate เข้า Master Tables
 * 
 * ทำงานเป็นขั้นตอน:
 *   1. อ่านข้อมูลทั้งหมดจาก SCGนครหลวงJWDภูมิภาค
 *   2. จัดกลุ่มบุคคลด้วย Levenshtein Distance (>90% = คนเดียวกัน)
 *   3. จัดกลุ่มสถานที่ด้วย Radius Check (<20ม. = ที่เดียวกัน)
 *   4. Generate Master_Persons และ Master_Locations ชุดใหม่
 *   5. Report รายการที่ Confidence <80% ให้ Admin ตรวจสอบ
 * 
 * Author: Elite Logistics Architect
 */

// ==========================================
// 1. CLEANSING CONFIGURATION
// ==========================================

const CLEANSE_CONFIG = {
  // Thresholds สำหรับการจัดกลุ่ม
  PERSON_FUZZY_THRESHOLD:    90,  // % ความคล้ายชื่อ → จัดว่าเป็นคนเดียวกัน
  LOCATION_RADIUS_METERS:    20,  // รัศมีจัดกลุ่มสถานที่ (เมตร)
  MIN_CONFIDENCE_AUTO:       80,  // % ความมั่นใจขั้นต่ำที่ระบบตัดสินใจอัตโนมัติ
  
  // Batch Processing
  BATCH_SIZE:                100, // จำนวนแถวที่ประมวลผลต่อรอบ
  SLEEP_MS_BETWEEN_BATCHES:  500, // เวลารอระหว่างรอบ (ms)
  
  // Reporting
  REPORT_SHEET_NAME:         'Cleansing_Report',
  LOG_SHEET_NAME:            'Cleansing_Log'
};

// ==========================================
// 2. MAIN CLEANSING FUNCTION
// ==========================================

/**
 * ฟังก์ชันหลัก: ทำความสะอาดข้อมูล_legacy_ และสร้าง Master Tables
 * รันครั้งเดียวสำหรับข้อมูลประวัติทั้งหมด
 */
function cleanseLegacyData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(60000)) {
    ui.alert('⚠️ ระบบกำลังทำงาน', 'มีผู้ใช้งานอื่นกำลังทำความสะอาดข้อมูล กรุณารอสักครู่', ui.ButtonSet.OK);
    return;
  }
  
  try {
    Logger.log('🚀 เริ่มกระบวนการทำความสะอาดข้อมูล_legacy_');
    
    // 1. อ่านข้อมูลต้นทาง
    var sourceSheet = ss.getSheetByName('SCGนครหลวงJWDภูมิภาค');
    if (!sourceSheet) {
      throw new Error('ไม่พบชีต SCGนครหลวงJWDภูมิภาค');
    }
    
    var lastRow = sourceSheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('ℹ️ ไม่มีข้อมูลในชีตต้นทาง');
      return;
    }
    
    var headers = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
    var data = sourceSheet.getRange(2, 1, lastRow - 1, sourceSheet.getLastColumn()).getValues();
    
    Logger.log('📊 พบข้อมูลทั้งหมด: ' + data.length + ' แถว');
    
    // 2. แยกข้อมูลเป็น 2 กลุ่ม: บุคคล และ สถานที่
    var personsRaw = [];
    var locationsRaw = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      
      // ดึงข้อมูลชื่อ (คอลัมน์ที่ 12 = ชื่อ - นามสกุล)
      var name = row[11]; // Index 11 = คอลัมน์ L
      
      // ดึงข้อมูลพิกัด (คอลัมน์ที่ 14 = LAT, 15 = LONG)
      var lat = parseFloat(row[13]); // Index 13 = คอลัมน์ N
      var lng = parseFloat(row[14]); // Index 14 = คอลัมน์ O
      
      if (name && name.toString().trim() !== '') {
        personsRaw.push({
          rowIndex: i + 2,
          name: name.toString().trim(),
          lat: lat,
          lng: lng,
          shipmentNo: row[6] || '', // Shipment No
          invoiceNo: row[7] || '',  // Invoice No
          date: row[2] || '',       // วันที่ส่งสินค้า
          truckLicense: row[5] || '' // ทะเบียนรถ
        });
      }
      
      if (!isNaN(lat) && !isNaN(lng)) {
        locationsRaw.push({
          rowIndex: i + 2,
          name: name ? name.toString().trim() : '',
          lat: lat,
          lng: lng,
          address: row[17] || '', // ที่อยู่ปลายทาง
          shipmentNo: row[6] || '',
          date: row[2] || ''
        });
      }
    }
    
    Logger.log('👤 พบชื่อบุคคล: ' + personsRaw.length + ' รายการ');
    Logger.log('📍 พบพิกัดสถานที่: ' + locationsRaw.length + ' รายการ');
    
    // 3. จัดกลุ่มบุคคล (Clustering ด้วย Fuzzy Match)
    Logger.log('🔍 กำลังจัดกลุ่มบุคคล...');
    var personClusters = clusterPersons(personsRaw, CLEANSE_CONFIG.PERSON_FUZZY_THRESHOLD);
    Logger.log('✅ จัดกลุ่มบุคคลเสร็จ: ' + personClusters.length + ' กลุ่ม');
    
    // 4. จัดกลุ่มสถานที่ (Clustering ด้วย Radius)
    Logger.log('🔍 กำลังจัดกลุ่มสถานที่...');
    var locationClusters = clusterLocations(locationsRaw, CLEANSE_CONFIG.LOCATION_RADIUS_METERS);
    Logger.log('✅ จัดกลุ่มสถานที่เสร็จ: ' + locationClusters.length + ' กลุ่ม');
    
    // 5. สร้างรายงาน
    Logger.log('📝 กำลังสร้างรายงาน...');
    createCleansingReport(personClusters, locationClusters);
    
    // 6. สรุปผล
    var summary = {
      totalRows: data.length,
      personClusters: personClusters.length,
      locationClusters: locationClusters.length,
      lowConfidencePersons: personClusters.filter(function(c) { return c.confidence < CLEANSE_CONFIG.MIN_CONFIDENCE_AUTO; }).length,
      lowConfidenceLocations: locationClusters.filter(function(c) { return c.confidence < CLEANSE_CONFIG.MIN_CONFIDENCE_AUTO; }).length
    };
    
    var msg = '✅ ทำความสะอาดข้อมูลเสร็จสิ้น!\n\n' +
              '📊 สรุปผล:\n' +
              '• ข้อมูลต้นฉบับ: ' + summary.totalRows + ' แถว\n' +
              '• กลุ่มบุคคล: ' + summary.personClusters + ' กลุ่ม\n' +
              '• กลุ่มสถานที่: ' + summary.locationClusters + ' กลุ่ม\n\n' +
              '⚠️ ต้องตรวจสอบด้วยมือ:\n' +
              '• บุคคล: ' + summary.lowConfidencePersons + ' กลุ่ม\n' +
              '• สถานที่: ' + summary.lowConfidenceLocations + ' กลุ่ม\n\n' +
              '📄 ดูรายละเอียดในชีต: Cleansing_Report';
    
    Logger.log(msg);
    ui.alert('✅ เสร็จสิ้น', msg, ui.ButtonSet.OK);
    
    return {
      success: true,
      summary: summary,
      personClusters: personClusters,
      locationClusters: locationClusters
    };
    
  } catch (error) {
    Logger.error('❌ Cleansing Error: ' + error.message);
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
// 3. PERSON CLUSTERING ALGORITHM
// ==========================================

/**
 * จัดกลุ่มบุคคลด้วย Fuzzy Matching (Levenshtein Distance)
 * @param {array} personsRaw - ข้อมูลบุคคลดิบ
 * @param {number} threshold - ค่าความคล้ายขั้นต่ำ (%)
 * @return {array} - กลุ่มบุคคล
 */
function clusterPersons(personsRaw, threshold) {
  var clusters = [];
  var processed = new Set();
  
  for (var i = 0; i < personsRaw.length; i++) {
    if (processed.has(i)) continue;
    
    var currentPerson = personsRaw[i];
    var currentNorm = normalizeText(currentPerson.name);
    
    var cluster = {
      id: generateUUID(),
      representativeName: currentPerson.name,
      variants: [currentPerson.name],
      memberIndices: [i],
      confidence: 100,
      lat: currentPerson.lat,
      lng: currentPerson.lng,
      usageCount: 1
    };
    
    processed.add(i);
    
    // หาคนที่คล้ายกัน
    for (var j = i + 1; j < personsRaw.length; j++) {
      if (processed.has(j)) continue;
      
      var otherPerson = personsRaw[j];
      var otherNorm = normalizeText(otherPerson.name);
      
      var similarity = calculateSimilarity(currentNorm, otherNorm);
      
      if (similarity >= threshold) {
        cluster.variants.push(otherPerson.name);
        cluster.memberIndices.push(j);
        cluster.usageCount++;
        
        // ถ้ามีพิกัด ให้ใช้ค่าเฉลี่ย
        if (!isNaN(otherPerson.lat) && !isNaN(otherPerson.lng)) {
          if (isNaN(cluster.lat) || isNaN(cluster.lng)) {
            cluster.lat = otherPerson.lat;
            cluster.lng = otherPerson.lng;
          } else {
            cluster.lat = (cluster.lat + otherPerson.lat) / 2;
            cluster.lng = (cluster.lng + otherPerson.lng) / 2;
          }
        }
        
        processed.add(j);
      }
    }
    
    // คำนวณ Confidence ของ Cluster
    if (cluster.variants.length > 1) {
      var avgSimilarity = 0;
      for (var k = 1; k < cluster.variants.length; k++) {
        var sim = calculateSimilarity(
          normalizeText(cluster.variants[0]),
          normalizeText(cluster.variants[k])
        );
        avgSimilarity += sim;
      }
      cluster.confidence = Math.round(avgSimilarity / (cluster.variants.length - 1));
    }
    
    clusters.push(cluster);
  }
  
  return clusters;
}

// ==========================================
// 4. LOCATION CLUSTERING ALGORITHM
// ==========================================

/**
 * จัดกลุ่มสถานที่ด้วย Radius Check
 * @param {array} locationsRaw - ข้อมูลสถานที่ดิบ
 * @param {number} radiusMeters - รัศมีจัดกลุ่ม (เมตร)
 * @return {array} - กลุ่มสถานที่
 */
function clusterLocations(locationsRaw, radiusMeters) {
  var clusters = [];
  var processed = new Set();
  
  // กรองแถวที่ไม่มีพิกัดออกก่อน
  var validLocations = locationsRaw.filter(function(loc) {
    return !isNaN(loc.lat) && !isNaN(loc.lng);
  });
  
  for (var i = 0; i < validLocations.length; i++) {
    if (processed.has(i)) continue;
    
    var currentLoc = validLocations[i];
    
    var cluster = {
      id: generateUUID(),
      representativeName: currentLoc.name,
      variants: currentLoc.name ? [currentLoc.name] : [],
      memberIndices: [i],
      lat: currentLoc.lat,
      lng: currentLoc.lng,
      radius: radiusMeters,
      address: currentLoc.address,
      usageCount: 1,
      confidence: 100
    };
    
    processed.add(i);
    
    // หาสถานที่ที่อยู่ในรัศมี
    for (var j = i + 1; j < validLocations.length; j++) {
      if (processed.has(j)) continue;
      
      var otherLoc = validLocations[j];
      var distanceKm = getHaversineDistanceKM(
        currentLoc.lat, currentLoc.lng,
        otherLoc.lat, otherLoc.lng
      );
      var distanceMeters = distanceKm * 1000;
      
      if (distanceMeters <= radiusMeters) {
        if (otherLoc.name && cluster.variants.indexOf(otherLoc.name) === -1) {
          cluster.variants.push(otherLoc.name);
        }
        
        cluster.memberIndices.push(j);
        cluster.usageCount++;
        
        // ค่าเฉลี่ยพิกัด
        cluster.lat = (cluster.lat + otherLoc.lat) / 2;
        cluster.lng = (cluster.lng + otherLoc.lng) / 2;
        
        processed.add(j);
      }
    }
    
    // คำนวณ Confidence จากจำนวนสมาชิกและความสม่ำเสมอของพิกัด
    if (cluster.usageCount > 10) {
      cluster.confidence = 100;
    } else if (cluster.usageCount > 5) {
      cluster.confidence = 90;
    } else if (cluster.usageCount > 2) {
      cluster.confidence = 80;
    } else {
      cluster.confidence = 70;
    }
    
    clusters.push(cluster);
  }
  
  return clusters;
}

// ==========================================
// 5. REPORT GENERATION
// ==========================================

/**
 * สร้างรายงานผลการทำ Cleansing
 * @param {array} personClusters - กลุ่มบุคคล
 * @param {array} locationClusters - กลุ่มสถานที่
 */
function createCleansingReport(personClusters, locationClusters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // สร้างหรือล้างชีตรายงาน
  var reportSheet = ss.getSheetByName(CLEANSE_CONFIG.REPORT_SHEET_NAME);
  if (reportSheet) {
    ss.deleteSheet(reportSheet);
  }
  reportSheet = ss.insertSheet(CLEANSE_CONFIG.REPORT_SHEET_NAME);
  
  // Header
  var headers = [
    'ประเภท', 'Cluster_ID', 'ชื่อมาตรฐาน', 'Variants(JSON)',
    'LAT', 'LNG', 'จำนวนครั้งใช้งาน', 'Confidence_%',
    'สถานะ', 'หมายเหตุ'
  ];
  reportSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  reportSheet.setFrozenRows(1);
  
  var row = 2;
  
  // เพิ่มข้อมูลบุคคล
  personClusters.forEach(function(cluster) {
    var status = cluster.confidence >= CLEANSE_CONFIG.MIN_CONFIDENCE_AUTO ? 'Auto_Approve' : 'Manual_Review';
    
    reportSheet.getRange(row, 1, 1, 10).setValues([[
      'Person',
      cluster.id,
      cluster.representativeName,
      JSON.stringify(cluster.variants),
      cluster.lat || '',
      cluster.lng || '',
      cluster.usageCount,
      cluster.confidence,
      status,
      cluster.variants.length > 1 ? 'ชื่อเขียนต่างกันหลายรูปแบบ' : ''
    ]]);
    
    row++;
  });
  
  // เพิ่มข้อมูลสถานที่
  locationClusters.forEach(function(cluster) {
    var status = cluster.confidence >= CLEANSE_CONFIG.MIN_CONFIDENCE_AUTO ? 'Auto_Approve' : 'Manual_Review';
    
    reportSheet.getRange(row, 1, 1, 10).setValues([[
      'Location',
      cluster.id,
      cluster.representativeName,
      JSON.stringify(cluster.variants),
      cluster.lat,
      cluster.lng,
      cluster.usageCount,
      cluster.confidence,
      status,
      cluster.variants.length > 1 ? 'ชื่อสถานที่ต่างกันแต่พิกัดใกล้กัน' : ''
    ]]);
    
    row++;
  });
  
  // Format
  reportSheet.setColumnWidth(1, 80);   // ประเภท
  reportSheet.setColumnWidth(2, 36);   // ID
  reportSheet.setColumnWidth(3, 200);  // ชื่อมาตรฐาน
  reportSheet.setColumnWidth(4, 300);  // Variants
  reportSheet.setColumnWidth(5, 100);  // LAT
  reportSheet.setColumnWidth(6, 100);  // LNG
  reportSheet.setColumnWidth(9, 120);  // สถานะ
  
  // Conditional Formatting (ใช้สีแยกสถานะ)
  var range = reportSheet.getRange(2, 9, row - 2, 1);
  var ruleAuto = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=I2="Auto_Approve"')
    .setBackground('#d9ead3') // เขียวอ่อน
    .setRanges([range])
    .build();
  
  var ruleManual = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=I2="Manual_Review"')
    .setBackground('#fce5cd') // ส้มอ่อน
    .setRanges([range])
    .build();
  
  reportSheet.setConditionalFormatRules([ruleAuto, ruleManual]);
  
  Logger.log('📄 สร้างรายงานเสร็จ: ' + (row - 2) + ' รายการ');
}

// ==========================================
// 6. MIGRATION TO MASTER TABLES
// ==========================================

/**
 * ย้ายข้อมูลจาก Cleansing Report เข้า Master Tables
 * (รันหลังจาก Admin ตรวจสอบ Manual_Review แล้ว)
 */
function migrateFromCleansingReport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  
  var reportSheet = ss.getSheetByName(CLEANSE_CONFIG.REPORT_SHEET_NAME);
  if (!reportSheet) {
    ui.alert('❌ ไม่พบชีต Cleansing_Report', 'กรุณารัน cleanseLegacyData() ก่อน', ui.ButtonSet.OK);
    return;
  }
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(60000)) {
    ui.alert('⚠️ ระบบกำลังทำงาน', 'มีผู้ใช้งานอื่นกำลัง migrate ข้อมูล', ui.ButtonSet.OK);
    return;
  }
  
  try {
    var lastRow = reportSheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('ℹ️ ไม่มีข้อมูลในรายงาน');
      return;
    }
    
    var data = reportSheet.getRange(2, 1, lastRow - 1, 10).getValues();
    
    var personsMigrated = 0;
    var locationsMigrated = 0;
    var skipped = 0;
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var type = row[0];
      var clusterId = row[1];
      var nameStd = row[2];
      var variantsStr = row[3];
      var lat = parseFloat(row[4]);
      var lng = parseFloat(row[5]);
      var usageCount = row[6];
      var confidence = row[7];
      var status = row[8];
      
      // ข้ามรายการที่ยังต้องตรวจสอบ
      if (status === 'Manual_Review') {
        skipped++;
        continue;
      }
      
      if (type === 'Person') {
        var variants = [];
        try {
          variants = JSON.parse(variantsStr);
        } catch(e) {
          variants = [nameStd];
        }
        
        upsertPerson({
          personId: clusterId,
          nameStd: nameStd,
          name: nameStd,
          variants: variants,
          phone: '',
          employeeId: ''
        });
        
        personsMigrated++;
      } else if (type === 'Location') {
        var variants = [];
        try {
          variants = JSON.parse(variantsStr);
        } catch(e) {
          variants = [nameStd];
        }
        
        upsertLocation({
          locationId: clusterId,
          nameStd: nameStd,
          name: nameStd,
          lat: lat,
          lng: lng,
          addrFull: '',
          province: '',
          district: '',
          postcode: ''
        });
        
        locationsMigrated++;
      }
      
      // Progress update ทุก 50 รายการ
      if ((i + 1) % 50 === 0) {
        ss.toast('🔄 Migrated: ' + (i + 1) + '/' + data.length, 'Progress');
      }
    }
    
    var msg = '✅ Migration เสร็จสิ้น!\n\n' +
              '• บุคคล: ' + personsMigrated + ' รายการ\n' +
              '• สถานที่: ' + locationsMigrated + ' รายการ\n' +
              '• ข้าม (ต้องตรวจสอบ): ' + skipped + ' รายการ';
    
    Logger.log(msg);
    ui.alert('✅ เสร็จสิ้น', msg, ui.ButtonSet.OK);
    
    return {
      success: true,
      personsMigrated: personsMigrated,
      locationsMigrated: locationsMigrated,
      skipped: skipped
    };
    
  } catch (error) {
    Logger.error('❌ Migration Error: ' + error.message);
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
// 7. UTILITY FUNCTIONS
// ==========================================

/**
 * คำนวณความคล้ายระหว่าง 2 สตริง (Levenshtein Distance)
 * @param {string} s1 - สตริงที่ 1
 * @param {string} s2 - สตริงที่ 2
 * @return {number} - ค่าความคล้าย (%)
 */
function calculateSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;
  
  var longer = s1.length > s2.length ? s1 : s2;
  var shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 100;
  
  var editDistance = levenshteinDistance(longer, shorter);
  var similarity = ((longer.length - editDistance) / longer.length) * 100;
  
  return Math.round(similarity);
}

/**
 * คำนวณ Levenshtein Distance ระหว่าง 2 สตริง
 * @param {string} s1 - สตริงที่ 1
 * @param {string} s2 - สตริงที่ 2
 * @return {number} - จำนวนครั้งที่แก้ไข
 */
function levenshteinDistance(s1, s2) {
  var len1 = s1.length;
  var len2 = s2.length;
  
  // สร้าง Matrix
  var matrix = [];
  for (var i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (var j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // คำนวณ Distance
  for (var i = 1; i <= len1; i++) {
    for (var j = 1; j <= len2; j++) {
      var cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Deletion
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
      
      // Transposition (Damerau-Levenshtein)
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }
  
  return matrix[len1][len2];
}
