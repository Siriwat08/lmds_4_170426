\# โมดูลโค้ดทั้งหมด

เอกสารนี้รวบรวมโค้ดโมดูลทั้งหมดที่ใช้ในระบบ Logistics Master Data System (LMDS) โดยแบ่งตามไฟล์ \`.gs\`

\#\# 1\. \`Config.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม DB\_TOTAL\_COLS, header constants  
 \*/

var CONFIG \= {  
  SHEET\_NAME:    "Database",  
  MAPPING\_SHEET: "NameMapping",  
  SOURCE\_SHEET:  "SCGนครหลวงJWDภูมิภาค",  
  SHEET\_POSTAL:  "PostalRef",

  // \[Phase A NEW\] Schema Width Constants  
  DB\_TOTAL\_COLS:        22,  
  DB\_LEGACY\_COLS:       17,  
  MAP\_TOTAL\_COLS:       5,  
  GPS\_QUEUE\_TOTAL\_COLS: 9,  
  DATA\_TOTAL\_COLS:      29,

  // \[Phase A NEW\] Header Arrays กลาง  
  DB\_REQUIRED\_HEADERS: {  
    1: "NAME", 2: "LAT", 3: "LNG", 11: "UUID",  
    15: "QUALITY", 16: "CREATED", 17: "UPDATED",  
    18: "Coord\_Source", 19: "Coord\_Confidence",  
    20: "Coord\_Last\_Updated",  
    21: "Record\_Status",  
    22: "Merged\_To\_UUID"  
  },

  MAP\_REQUIRED\_HEADERS: {  
    1: "Variant\_Name", 2: "Master\_UID",  
    3: "Confidence\_Score", 4: "Mapped\_By", 5: "Timestamp"  
  },

  GPS\_QUEUE\_REQUIRED\_HEADERS: {  
    1: "Timestamp", 2: "ShipToName", 3: "UUID\_DB",  
    4: "LatLng\_Driver", 5: "LatLng\_DB", 6: "Diff\_Meters",  
    7: "Reason", 8: "Approve", 9: "Reject"  
  },

  get GEMINI\_API\_KEY() {  
    var key \= PropertiesService.getScriptProperties().getProperty('GEMINI\_API\_KEY');  
    if (\!key) throw new Error(  
      "CRITICAL ERROR: GEMINI\_API\_KEY is not set. Please run setupEnvironment() first."  
    );  
    return key;  
  },  
  USE\_AI\_AUTO\_FIX: true,  
  AI\_MODEL:       "gemini-1.5-flash",  
  AI\_BATCH\_SIZE:  20,

  DEPOT\_LAT: 14.164688,  
  DEPOT\_LNG: 100.625354,

  DISTANCE\_THRESHOLD\_KM: 0.05,  
  BATCH\_LIMIT:            50,  
  DEEP\_CLEAN\_LIMIT:       100,  
  API\_MAX\_RETRIES:        3,  
  API\_TIMEOUT\_MS:         30000,  
  CACHE\_EXPIRATION:       21600,

  COL\_NAME: 1,       COL\_LAT: 2,        COL\_LNG: 3,  
  COL\_SUGGESTED: 4,  COL\_CONFIDENCE: 5, COL\_NORMALIZED: 6,  
  COL\_VERIFIED: 7,   COL\_SYS\_ADDR: 8,   COL\_ADDR\_GOOG: 9,  
  COL\_DIST\_KM: 10,   COL\_UUID: 11,      COL\_PROVINCE: 12,  
  COL\_DISTRICT: 13,  COL\_POSTCODE: 14,  COL\_QUALITY: 15,  
  COL\_CREATED: 16,   COL\_UPDATED: 17,  
  COL\_COORD\_SOURCE:       18,  
  COL\_COORD\_CONFIDENCE:   19,  
  COL\_COORD\_LAST\_UPDATED: 20,  
  COL\_RECORD\_STATUS:      21,  
  COL\_MERGED\_TO\_UUID:     22,

  MAP\_COL\_VARIANT: 1, MAP\_COL\_UID: 2,   MAP\_COL\_CONFIDENCE: 3,  
  MAP\_COL\_MAPPED\_BY: 4, MAP\_COL\_TIMESTAMP: 5,

  get C\_IDX() {  
    return {  
      NAME: this.COL\_NAME \- 1,           LAT: this.COL\_LAT \- 1,  
      LNG: this.COL\_LNG \- 1,             SUGGESTED: this.COL\_SUGGESTED \- 1,  
      CONFIDENCE: this.COL\_CONFIDENCE \- 1, NORMALIZED: this.COL\_NORMALIZED \- 1,  
      VERIFIED: this.COL\_VERIFIED \- 1,   SYS\_ADDR: this.COL\_SYS\_ADDR \- 1,  
      GOOGLE\_ADDR: this.COL\_ADDR\_GOOG \- 1, DIST\_KM: this.COL\_DIST\_KM \- 1,  
      UUID: this.COL\_UUID \- 1,           PROVINCE: this.COL\_PROVINCE \- 1,  
      DISTRICT: this.COL\_DISTRICT \- 1,   POSTCODE: this.COL\_POSTCODE \- 1,  
      QUALITY: this.COL\_QUALITY \- 1,     CREATED: this.COL\_CREATED \- 1,  
      UPDATED: this.COL\_UPDATED \- 1,  
      COORD\_SOURCE:       this.COL\_COORD\_SOURCE \- 1,  
      COORD\_CONFIDENCE:   this.COL\_COORD\_CONFIDENCE \- 1,  
      COORD\_LAST\_UPDATED: this.COL\_COORD\_LAST\_UPDATED \- 1,  
      RECORD\_STATUS:      this.COL\_RECORD\_STATUS \- 1,  
      MERGED\_TO\_UUID:     this.COL\_MERGED\_TO\_UUID \- 1  
    };  
  },

  get MAP\_IDX() {  
    return {  
      VARIANT:    this.MAP\_COL\_VARIANT \- 1,  
      UID:        this.MAP\_COL\_UID \- 1,  
      CONFIDENCE: this.MAP\_COL\_CONFIDENCE \- 1,  
      MAPPED\_BY:  this.MAP\_COL\_MAPPED\_BY \- 1,  
      TIMESTAMP:  this.MAP\_COL\_TIMESTAMP \- 1  
    };  
  }  
};

const SCG\_CONFIG \= {  
  SHEET\_DATA:     'Data',  
  SHEET\_INPUT:    'Input',  
  SHEET\_EMPLOYEE: 'ข้อมูลพนักงาน',  
  API\_URL:        'https://fsm.scgjwd.com/Monitor/SearchDelivery',  
  INPUT\_START\_ROW: 4,  
  COOKIE\_CELL:    'B1',  
  SHIPMENT\_STRING\_CELL: 'B3',  
  SHEET\_MASTER\_DB: 'Database',  
  SHEET\_MAPPING:   'NameMapping',  
  SHEET\_GPS\_QUEUE: 'GPS\_Queue',  
  GPS\_THRESHOLD\_METERS: 50,  
  SRC\_IDX: {  
    NAME: 12, LAT: 14, LNG: 15,  
    SYS\_ADDR: 18, DIST: 23, GOOG\_ADDR: 24  
  },  
  SRC\_IDX\_SYNC\_STATUS: 37,  
  SYNC\_STATUS\_DONE: "SYNCED",  
  JSON\_MAP: {  
    SHIPMENT\_NO:   'shipmentNo',  
    CUSTOMER\_NAME: 'customerName',  
    DELIVERY\_DATE: 'deliveryDate'  
  }  
};

// \[Phase B NEW\] เพิ่มใน SCG\_CONFIG ต่อท้าย JSON\_MAP  
// Data Sheet Column Index (0-based) สำหรับ Service\_SCG.gs  
// แทน r\[10\], r\[22\], r\[26\] ที่กระจัดกระจาย  
const DATA\_IDX \= {  
  JOB\_ID:        0,   // ID\_งานประจำวัน  
  PLAN\_DELIVERY: 1,   // PlanDelivery  
  INVOICE\_NO:    2,   // InvoiceNo  
  SHIPMENT\_NO:   3,   // ShipmentNo  
  DRIVER\_NAME:   4,   // DriverName  
  TRUCK\_LICENSE: 5,   // TruckLicense  
  CARRIER\_CODE:  6,   // CarrierCode  
  CARRIER\_NAME:  7,   // CarrierName  
  SOLD\_TO\_CODE:  8,   // SoldToCode  
  SOLD\_TO\_NAME:  9,   // SoldToName  
  SHIP\_TO\_NAME:  10,  // ShipToName  
  SHIP\_TO\_ADDR:  11,  // ShipToAddress  
  LATLNG\_SCG:    12,  // LatLong\_SCG  
  MATERIAL:      13,  // MaterialName  
  QTY:           14,  // ItemQuantity  
  QTY\_UNIT:      15,  // QuantityUnit  
  WEIGHT:        16,  // ItemWeight  
  DELIVERY\_NO:   17,  // DeliveryNo  
  DEST\_COUNT:    18,  // จำนวนปลายทาง\_System  
  DEST\_LIST:     19,  // รายชื่อปลายทาง\_System  
  SCAN\_STATUS:   20,  // ScanStatus  
  DELIVERY\_STATUS: 21, // DeliveryStatus  
  EMAIL:         22,  // Email พนักงาน  
  TOT\_QTY:       23,  // จำนวนสินค้ารวมของร้านนี้  
  TOT\_WEIGHT:    24,  // น้ำหนักสินค้ารวมของร้านนี้  
  SCAN\_INV:      25,  // จำนวน\_Invoice\_ที่ต้องสแกน  
  LATLNG\_ACTUAL: 26,  // LatLong\_Actual  
  OWNER\_LABEL:   27,  // ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน  
  SHOP\_KEY:      28   // ShopKey  
};

// \[Phase D NEW\] AI Field Column Index (ใน Database)  
// Phase D จะแยก AI keywords ออกจาก COL\_NORMALIZED  
// ตอนนี้เพิ่ม constants ไว้ก่อน ใช้จริงเมื่อ migrate data  
const AI\_CONFIG \= {  
  // Confidence thresholds สำหรับ AI matching  
  THRESHOLD\_AUTO\_MAP:    90,  // \>= 90 → append mapping ทันที  
  THRESHOLD\_REVIEW:      70,  // 70-89 → ส่งเข้า review queue  
  THRESHOLD\_IGNORE:      70,  // \< 70  → ignore

  // AI field tags  
  TAG\_AI:       "\[AI\]",  
  TAG\_REVIEWED: "\[REVIEWED\]",

  // Prompt version tracking  
  PROMPT\_VERSION: "v4.2",

  // Candidate retrieval limit ก่อนส่ง AI  
  RETRIEVAL\_LIMIT: 50  
};

CONFIG.validateSystemIntegrity \= function() {  
  var ss     \= SpreadsheetApp.getActiveSpreadsheet();  
  var errors \= \[\];  
  \[this.SHEET\_NAME, this.MAPPING\_SHEET,  
   SCG\_CONFIG.SHEET\_INPUT, this.SHEET\_POSTAL\].forEach(function(name) {  
    if (\!ss.getSheetByName(name)) errors.push("Missing Sheet: " \+ name);  
  });  
  try {  
    var key \= this.GEMINI\_API\_KEY;  
    if (\!key || key.length \< 20\) errors.push("Invalid Gemini API Key format");  
  } catch(e) {  
    errors.push("Gemini API Key not set. Run setupEnvironment() first.");  
  }  
  if (errors.length \> 0\) {  
    var msg \= "⚠️ SYSTEM INTEGRITY FAILED:\\n" \+ errors.join("\\n");  
    console.error(msg);  
    throw new Error(msg);  
  }  
  console.log("✅ System Integrity: OK");  
  return true;  
};

\`\`\`

\#\# 2\. \`Menu.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🖥️ MODULE: Menu UI Interface  
 \* Version: 4.1 Enterprise Edition (UI Text Fix)  
 \* \---------------------------------------------------  
 \* \[FIXED v4.1\]: Dynamic UI Alert pulling exact sheet names from CONFIG.  
 \* Author: Elite Logistics Architect  
 \*/

/\*\*  
 \* VERSION: 4.2 — Phase E  
 \* \[Phase E\] เพิ่มเมนู Phase D test helpers \+ Dry Run  
 \*/  
function onOpen() {  
  var ui \= SpreadsheetApp.getUi();

  // เมนู 1: Master Data  
  ui.createMenu('🚛 1\. ระบบจัดการ Master Data')  
    .addItem('1️⃣ ดึงลูกค้าใหม่ (Sync New Data)',        'syncNewDataToMaster\_UI')  
    .addItem('2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)',   'updateGeoData\_SmartCache')  
    .addItem('3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)',         'autoGenerateMasterList\_Smart')  
    .addItem('🧠 4️⃣ ส่งชื่อแปลกให้ AI วิเคราะห์',       'runAIBatchResolver\_UI')  
    .addSeparator()  
    .addItem('🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)',    'runDeepCleanBatch\_100')  
    .addItem('🔄 รีเซ็ตความจำปุ่ม 5',                    'resetDeepCleanMemory\_UI')  
    .addSeparator()  
    .addItem('✅ 6️⃣ จบงาน (Finalize & Move to Mapping)', 'finalizeAndClean\_UI')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🛠️ Admin & Repair Tools')  
      .addItem('🔑 สร้าง UUID ให้ครบทุกแถว',              'assignMissingUUIDs')  
      .addItem('🚑 ซ่อมแซม NameMapping',                   'repairNameMapping\_UI')  
      .addSeparator()  
      .addItem('🔍 ค้นหาพิกัดซ้ำซ้อน',                    'findHiddenDuplicates')  
      .addItem('📊 ตรวจสอบคุณภาพข้อมูล',                   'showQualityReport\_UI')  
      .addItem('🔄 คำนวณ Quality ใหม่ทั้งหมด',             'recalculateAllQuality')  
      .addItem('🎯 คำนวณ Confidence ใหม่ทั้งหมด',          'recalculateAllConfidence')  
      .addSeparator()  
      .addItem('🗂️ Initialize Record Status',              'initializeRecordStatus')  
      .addItem('🔀 Merge UUID ซ้ำซ้อน',                    'mergeDuplicates\_UI')  
      .addItem('📋 ดูสถานะ Record ทั้งหมด',                'showRecordStatusReport')  
    )  
    .addToUi();

  // เมนู 2: SCG  
  ui.createMenu('📦 2\. เมนูพิเศษ SCG')  
    .addItem('📥 1\. โหลดข้อมูล Shipment (+E-POD)',        'fetchDataFromSCGJWD')  
    .addItem('🟢 2\. อัปเดตพิกัด \+ อีเมลพนักงาน',          'applyMasterCoordinatesToDailyJob')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('📍 GPS Queue Management')  
      .addItem('🔄 1\. Sync GPS จากคนขับ → Queue',          'syncNewDataToMaster\_UI')  
      .addItem('✅ 2\. อนุมัติรายการที่ติ๊กแล้ว',            'applyApprovedFeedback')  
      .addItem('📊 3\. ดูสถิติ Queue',                       'showGPSQueueStats')  
      .addSeparator()  
      .addItem('🛠️ สร้างชีต GPS\_Queue ใหม่',               'createGPSQueueSheet')  
    )  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🧹 เมนูล้างข้อมูล (Dangerous Zone)')  
      .addItem('⚠️ ล้างเฉพาะชีต Data',                     'clearDataSheet\_UI')  
      .addItem('⚠️ ล้างเฉพาะชีต Input',                    'clearInputSheet\_UI')  
      .addItem('⚠️ ล้างเฉพาะชีต สรุป\_เจ้าของสินค้า',       'clearSummarySheet\_UI')  
      .addItem('🔥 ล้างทั้งหมด',                            'clearAllSCGSheets\_UI')  
    )  
    .addToUi();

  // เมนู 3: ระบบอัตโนมัติ  
  ui.createMenu('🤖 3\. ระบบอัตโนมัติ')  
    .addItem('▶️ เปิดระบบ Auto-Pilot',                     'START\_AUTO\_PILOT')  
    .addItem('⏹️ ปิดระบบ Auto-Pilot',                      'STOP\_AUTO\_PILOT')  
    .addItem('👋 ปลุก AI Agent ทำงานทันที',                 'WAKE\_UP\_AGENT')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🧪 Debug & Test Tools')  
      .addItem('🚀 รัน AI Indexing ทันที',                  'forceRunAI\_Now')  
      .addItem('🧠 ทดสอบ Tier 4 AI Resolution',             'debug\_TestTier4SmartResolution')  
      .addItem('📡 ทดสอบ Gemini Connection',                'debugGeminiConnection')  
      .addItem('🔄 ล้าง AI Tags (แถวที่เลือก)',             'debug\_ResetSelectedRowsAI')  
      .addSeparator()  
      // \[Phase E\] Phase D test helpers  
      .addItem('🔍 ทดสอบ Retrieval Candidates',             'testRetrieveCandidates')  
      .addItem('🧪 ทดสอบ AI Response Validation',           'testAIResponseValidation')  
      .addSeparator()  
      .addItem('🔁 Reset SYNC\_STATUS (ทดสอบ)',              'resetSyncStatus')  
    )  
    .addToUi();

  // เมนู 4: System Admin  
  ui.createMenu('⚙️ System Admin')  
    .addItem('🏥 ตรวจสอบสถานะระบบ (Health Check)',          'runSystemHealthCheck')  
    .addItem('🧹 ล้าง Backup เก่า (\>30 วัน)',               'cleanupOldBackups')  
    .addItem('📊 เช็คปริมาณข้อมูล (Cell Usage)',            'checkSpreadsheetHealth')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🔬 System Diagnostic')  
      .addItem('🛡️ ตรวจสอบ Schema ทุกชีต',                  'runFullSchemaValidation')  
      .addItem('🔍 ตรวจสอบ Engine (Phase 1)',               'RUN\_SYSTEM\_DIAGNOSTIC')  
      .addItem('🕵️ ตรวจสอบชีต (Phase 2)',                   'RUN\_SHEET\_DIAGNOSTIC')  
      .addSeparator()  
      // \[Phase E NEW\] Dry Run options  
      .addItem('🔵 Dry Run: ตรวจสอบ Mapping Conflicts',     'runDryRunMappingConflicts')  
      .addItem('🔵 Dry Run: ตรวจสอบ UUID Integrity',        'runDryRunUUIDIntegrity')  
      .addSeparator()  
      .addItem('🧹 ล้าง Postal Cache',                      'clearPostalCache\_UI')  
      .addItem('🧹 ล้าง Search Cache',                      'clearSearchCache\_UI')  
    )  
    .addSeparator()  
    .addItem('🔔 ตั้งค่า LINE Notify',                       'setupLineToken')  
    .addItem('✈️ ตั้งค่า Telegram Notify',                   'setupTelegramConfig')  
    .addItem('🔐 ตั้งค่า API Key (Setup)',                   'setupEnvironment')  
    .addToUi();  
}

// \=================================================================  
// 🛡️ SAFETY WRAPPERS  
// \=================================================================

/\*\*  
 \* Wrapper: ยืนยันก่อนดึงข้อมูลลูกค้าใหม่  
 \* \[FIXED v4.1\]: ปรับข้อความให้ดึงชื่อจากตัวแปร Config จริงๆ  
 \*/  
function syncNewDataToMaster\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var sourceName \= (typeof CONFIG \!== 'undefined' && CONFIG.SOURCE\_SHEET) ? CONFIG.SOURCE\_SHEET : 'ชีตนำเข้า';  
  var dbName \= (typeof CONFIG \!== 'undefined' && CONFIG.SHEET\_NAME) ? CONFIG.SHEET\_NAME : 'Database';  
    
  var result \= ui.alert(  
    'ยืนยันการดึงข้อมูลใหม่?',  
    'ระบบจะดึงรายชื่อลูกค้าจากชีต "' \+ sourceName \+ '"\\nมาเพิ่มต่อท้ายในชีต "' \+ dbName \+ '"\\n(เฉพาะรายชื่อที่ยังไม่เคยมีในระบบ)\\n\\nคุณต้องการดำเนินการต่อหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
  if (result \== ui.Button.YES) {  
    syncNewDataToMaster();  
  }  
}

function runAIBatchResolver\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var batchSize \= (typeof CONFIG \!== 'undefined' && CONFIG.AI\_BATCH\_SIZE) ? CONFIG.AI\_BATCH\_SIZE : 20;  
    
  var result \= ui.alert(  
    '🧠 ยืนยันการรัน AI Smart Resolution?',  
    'ระบบจะรวบรวมชื่อที่ยังหาพิกัดไม่เจอ/ไม่รู้จัก (สูงสุด ' \+ batchSize \+ ' รายการ)\\nส่งให้ Gemini AI วิเคราะห์และจับคู่กับ Database อัตโนมัติ\\n\\nต้องการเริ่มเลยหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (result \== ui.Button.YES) {  
    if (typeof resolveUnknownNamesWithAI \=== 'function') {  
       resolveUnknownNamesWithAI();  
    } else {  
       ui.alert(  
         '⚠️ System Note',   
         'ฟังก์ชัน AI (Service\_Agent.gs) กำลังอยู่ระหว่างการติดตั้ง (Coming soon\!)\\nกรุณารออัปเดตโมดูลถัดไปครับ',   
         ui.ButtonSet.OK  
       );  
    }  
  }  
}

function finalizeAndClean\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var result \= ui.alert(  
    '⚠️ ยืนยันการจบงาน (Finalize)?',  
    'รายการที่ติ๊กถูก "Verified" จะถูกย้ายไปยัง NameMapping และลบออกจาก Database\\nข้อมูลต้นฉบับจะถูก Backup ไว้\\n\\nยืนยันหรือไม่?',  
    ui.ButtonSet.OK\_CANCEL  
  );  
  if (result \== ui.Button.OK) {  
    finalizeAndClean\_MoveToMapping();  
  }  
}

function resetDeepCleanMemory\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var result \= ui.alert(  
    'ยืนยันการรีเซ็ต?',  
    'ระบบจะเริ่มตรวจสอบ Deep Clean ตั้งแต่แถวแรกใหม่\\nใช้ในกรณีที่ต้องการ Re-check ข้อมูลทั้งหมด',  
    ui.ButtonSet.YES\_NO  
  );  
  if (result \== ui.Button.YES) {  
    resetDeepCleanMemory();  
  }  
}

function clearDataSheet\_UI() {  
  confirmAction('ล้างชีต Data', 'ข้อมูลผลลัพธ์ทั้งหมดจะหายไป', clearDataSheet);  
}

function clearInputSheet\_UI() {  
  confirmAction('ล้างชีต Input', 'ข้อมูลนำเข้า (Shipment) ทั้งหมดจะหายไป', clearInputSheet);  
}

function repairNameMapping\_UI() {  
  confirmAction('ซ่อมแซม NameMapping', 'ระบบจะลบแถวซ้ำและเติม UUID ให้ครบ', repairNameMapping\_Full);  
}

function confirmAction(title, message, callbackFunction) {  
  var ui \= SpreadsheetApp.getUi();  
  var result \= ui.alert(title, message, ui.ButtonSet.YES\_NO);  
  if (result \== ui.Button.YES) {  
    callbackFunction();  
  }  
}

function runSystemHealthCheck() {  
  var ui \= SpreadsheetApp.getUi();  
  try {  
    if (typeof CONFIG \!== 'undefined' && CONFIG.validateSystemIntegrity) {  
      CONFIG.validateSystemIntegrity();   
      ui.alert(  
        "✅ System Health: Excellent\\n",  
        "ระบบพร้อมทำงานสมบูรณ์ครับ\!\\n- โครงสร้างชีตครบถ้วน\\n- เชื่อมต่อ API (Gemini) พร้อมใช้งาน",  
        ui.ButtonSet.OK  
      );  
    } else {  
      ui.alert("⚠️ System Warning", "Config check skipped (CONFIG.validateSystemIntegrity ไม่ทำงาน)", ui.ButtonSet.OK);  
    }  
  } catch (e) {  
    ui.alert("❌ System Health: FAILED", e.message, ui.ButtonSet.OK);  
  }  
}

function showQualityReport\_UI() {  
  var ss  \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui  \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) {  
    ui.alert("ℹ️ Database ว่างเปล่าครับ");  
    return;  
  }  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, 17).getValues();  
    
  var stats \= {  
    total:      0,  
    noCoord:    0,  
    noProvince: 0,  
    noUUID:     0,  
    noAddr:     0,  
    notVerified:0,  
    highQ:      0,  
    midQ:       0,  
    lowQ:       0  
  };  
    
  data.forEach(function(row) {  
    if (\!row\[CONFIG.C\_IDX.NAME\]) return;  
    stats.total++;  
      
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
    var q   \= parseFloat(row\[CONFIG.C\_IDX.QUALITY\]);  
      
    if (isNaN(lat) || isNaN(lng))          stats.noCoord++;  
    if (\!row\[CONFIG.C\_IDX.PROVINCE\])       stats.noProvince++;  
    if (\!row\[CONFIG.C\_IDX.UUID\])           stats.noUUID++;  
    if (\!row\[CONFIG.C\_IDX.GOOGLE\_ADDR\])    stats.noAddr++;  
    if (row\[CONFIG.C\_IDX.VERIFIED\] \!== true) stats.notVerified++;  
      
    if (q \>= 80\)      stats.highQ++;  
    else if (q \>= 50\) stats.midQ++;  
    else              stats.lowQ++;  
  });  
    
  var msg \=  
    "📊 Database Quality Report\\n" \+  
    "━━━━━━━━━━━━━━━━━━━━━━━━━\\n" \+  
    "📝 ทั้งหมด: " \+ stats.total \+ " แถว\\n\\n" \+  
      
    "🎯 Quality Score:\\n" \+  
    "🟢 ≥ 80% (ดีมาก):      " \+ stats.highQ \+ " แถว\\n" \+  
    "🟡 50-79% (ดีพอใช้):   " \+ stats.midQ  \+ " แถว\\n" \+  
    "🔴 \< 50% (ต้องปรับปรุง): " \+ stats.lowQ  \+ " แถว\\n\\n" \+  
      
    "⚠️ ข้อมูลที่ขาดหาย:\\n" \+  
    "📍 ไม่มีพิกัด:     " \+ stats.noCoord    \+ " แถว\\n" \+  
    "🏙️ ไม่มี Province: " \+ stats.noProvince \+ " แถว\\n" \+  
    "🗺️ ไม่มีที่อยู่:   " \+ stats.noAddr     \+ " แถว\\n" \+  
    "🔑 ไม่มี UUID:     " \+ stats.noUUID     \+ " แถว\\n" \+  
    "✅ ยังไม่ Verified: " \+ stats.notVerified \+ " แถว\\n\\n" \+  
      
    "━━━━━━━━━━━━━━━━━━━━━━━━━\\n" \+  
    "💡 แนะนำ:\\n";  
      
  if (stats.noCoord \> 0\) {  
    msg \+= "• รัน 'เติมข้อมูลพิกัด (ทีละ 50)' เพื่อเติมพิกัด\\n";  
  }  
  if (stats.noProvince \> 0\) {  
    msg \+= "• รัน 'Deep Clean' เพื่อเติม Province/District\\n";  
  }  
  if (stats.noUUID \> 0\) {  
    msg \+= "• รัน 'สร้าง UUID ให้ครบทุกแถว'\\n";  
  }  
  if (stats.lowQ \> 0\) {  
    msg \+= "• ตรวจสอบ " \+ stats.lowQ \+ " แถวที่ Quality ต่ำ\\n";  
  }  
      
  ui.alert(msg);  
}

function clearPostalCache\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  try {  
    // \[FIXED v4.1\] เรียกผ่านฟังก์ชันใน Service\_GeoAddr.gs  
    // เพราะ \_POSTAL\_CACHE อยู่ในไฟล์นั้น แก้ตรงๆ จากไฟล์อื่นไม่ได้  
    clearPostalCache();  
    ui.alert(  
      "✅ ล้าง Postal Cache เรียบร้อย\!\\n\\n" \+  
      "ครั้งถัดไปที่ระบบค้นหารหัสไปรษณีย์\\n" \+  
      "จะโหลดข้อมูลใหม่จากชีต PostalRef ครับ"  
    );  
    console.log("\[Cache\] Postal Cache cleared by user.");  
  } catch(e) {  
    ui.alert("❌ Error: " \+ e.message);  
  }  
}

function clearSearchCache\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  try {  
    clearSearchCache();  
    ui.alert(  
      "✅ ล้าง Search Cache เรียบร้อย\!\\n\\n" \+  
      "ครั้งถัดไปที่ค้นหาผ่าน WebApp\\n" \+  
      "จะโหลด NameMapping ใหม่จากชีตครับ"  
    );  
    console.log("\[Cache\] Search Cache cleared by user.");  
  } catch(e) {  
    ui.alert("❌ Error: " \+ e.message);  
  }  
}

\`\`\`

\#\# 3\. \`Service\_Master.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🧠 Service: Master Data Management  
 \* Version: 4.1 Checkbox Bugfix  
 \* \-----------------------------------------------------------  
 \* \[FIXED v4.1\]: Created getRealLastRow\_() to ignore pre-filled checkboxes.  
 \* Data will now append exactly after the last actual customer name.  
 \* Author: Elite Logistics Architect  
 \*/

// \==========================================  
// 1\. IMPORT & SYNC  
// \==========================================

/\*\*  
 \* 🛠️ \[NEW v4.1\] Helper หาแถวสุดท้ายจริงๆ โดยดูจากคอลัมน์ชื่อลูกค้า (ข้าม Checkbox)  
 \*/  
function getRealLastRow\_(sheet, columnIndex) {  
  var data \= sheet.getRange(1, columnIndex, sheet.getMaxRows(), 1).getValues();  
  for (var i \= data.length \- 1; i \>= 0; i--) {  
    // ถ้าช่องนั้นไม่ว่างเปล่า ไม่เป็น null และไม่เป็น boolean (Checkbox)  
    if (data\[i\]\[0\] \!== "" && data\[i\]\[0\] \!== null && typeof data\[i\]\[0\] \!== 'boolean') {  
      return i \+ 1;  
    }  
  }  
  return 1; // ถ้าชีตว่างเปล่าเลย  
}

/\*\*  
 \* \[Phase C\] Mapping Repository Helpers  
 \* ใช้ร่วมกันระหว่าง finalize, repair, และ sync  
 \*/

function loadDatabaseIndexByUUID\_() {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var result  \= {};  
  if (lastRow \< 2\) return result;

  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  data.forEach(function(row, i) {  
    var uuid \= row\[CONFIG.C\_IDX.UUID\];  
    if (uuid) result\[uuid\] \= i;  
  });  
  return result;  
}

function loadDatabaseIndexByNormalizedName\_() {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var result  \= {};  
  if (lastRow \< 2\) return result;

  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  data.forEach(function(row, i) {  
    var name \= row\[CONFIG.C\_IDX.NAME\];  
    if (name) result\[normalizeText(name)\] \= i;  
  });  
  return result;  
}

function loadNameMappingRows\_() {  
  var ss       \= SpreadsheetApp.getActiveSpreadsheet();  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  if (\!mapSheet || mapSheet.getLastRow() \< 2\) return \[\];  
  return mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, CONFIG.MAP\_TOTAL\_COLS).getValues();  
}

function appendNameMappings\_(rows) {  
  if (\!rows || rows.length \=== 0\) return;  
  var ss       \= SpreadsheetApp.getActiveSpreadsheet();  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  var lastRow  \= mapSheet.getLastRow();  
  mapSheet.getRange(lastRow \+ 1, 1, rows.length, CONFIG.MAP\_TOTAL\_COLS).setValues(rows);  
}

function syncNewDataToMaster() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
    
 var lock \= LockService.getScriptLock();  
if (\!lock.tryLock(15000)) {   
  ui.alert("⚠️ ระบบคิวทำงาน", "มีผู้ใช้งานอื่นกำลังอัปเดตฐานข้อมูลอยู่ กรุณาลองใหม่ในอีก 15 วินาทีครับ", ui.ButtonSet.OK);  
  return;  
}

// \[NEW v4.1\] ตรวจสอบ Schema ก่อนทำงาน  
try { preCheck\_Sync(); } catch(e) {  
  ui.alert("❌ Schema Error", e.message, ui.ButtonSet.OK);  
  return;  
}

try {  
  var sourceSheet \= ss.getSheetByName(CONFIG.SOURCE\_SHEET);  
    var masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    var queueSheet  \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
      
    if (\!sourceSheet || \!masterSheet) {   
      ui.alert("❌ CRITICAL: ไม่พบ Sheet (Source หรือ Database)");   
      return;   
    }  
      
    if (\!queueSheet) {  
      ui.alert("❌ CRITICAL: ไม่พบชีต GPS\_Queue\\nกรุณาสร้างชีตก่อนครับ");  
      return;  
    }

    // \--- โหลด Database ทั้งหมดเข้า Memory \---  
    var lastRowM \= getRealLastRow\_(masterSheet, CONFIG.COL\_NAME);  
    var existingNames \= {};   // normalizedName → rowIndex (0-based)  
    var existingUUIDs \= {};   // uuid → rowIndex (0-based)  
    var dbData \= \[\];

    if (lastRowM \> 1\) {  
      var maxCol \= Math.max(  
        CONFIG.COL\_NAME, CONFIG.COL\_LAT, CONFIG.COL\_LNG,  
        CONFIG.COL\_UUID, CONFIG.COL\_COORD\_SOURCE,  
        CONFIG.COL\_COORD\_CONFIDENCE, CONFIG.COL\_COORD\_LAST\_UPDATED  
      );  
      dbData \= masterSheet.getRange(2, 1, lastRowM \- 1, maxCol).getValues();  
      dbData.forEach(function(r, i) {  
        if (r\[CONFIG.C\_IDX.NAME\]) {  
          existingNames\[normalizeText(r\[CONFIG.C\_IDX.NAME\])\] \= i;  
        }  
        if (r\[CONFIG.C\_IDX.UUID\]) {  
          existingUUIDs\[r\[CONFIG.C\_IDX.UUID\]\] \= i;  
        }  
      });  
    }

    // \--- โหลด NameMapping เข้า Memory \---  
    var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
    var aliasToUUID \= {};  
    if (mapSheet && mapSheet.getLastRow() \> 1\) {  
      mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 2).getValues()  
        .forEach(function(r) {  
          if (r\[0\] && r\[1\]) aliasToUUID\[normalizeText(r\[0\])\] \= r\[1\];  
        });  
    }

    // \--- อ่านข้อมูลจาก Source Sheet \---  
    var lastRowS \= sourceSheet.getLastRow();  
    if (lastRowS \< 2\) {  
      ui.alert("ℹ️ ไม่มีข้อมูลในชีตต้นทาง");  
      return;  
    }  
      
    var lastColS \= sourceSheet.getLastColumn();  
    var sData \= sourceSheet.getRange(2, 1, lastRowS \- 1, lastColS).getValues();  
      
    // \--- ตัวแปรเก็บผลลัพธ์ \---  
    var newEntries    \= \[\];   // ชื่อใหม่ → เพิ่มใน Database  
    var queueEntries  \= \[\];   // GPS ต่างกัน → ส่งเข้า GPS\_Queue  
    var dbUpdates     \= {};   // rowIndex → อัปเดต Coord\_Last\_Updated  
    var currentBatch  \= new Set();  
    var ts            \= new Date();

    sData.forEach(function(row, rowIndex) {

      // \[v4.1\] ข้ามแถวที่ SYNCED แล้ว  
      var syncStatus \= row\[SCG\_CONFIG.SRC\_IDX\_SYNC\_STATUS \- 1\];  
      if (syncStatus \=== SCG\_CONFIG.SYNC\_STATUS\_DONE) return;

      var name \= row\[SCG\_CONFIG.SRC\_IDX.NAME\];  
      var lat  \= parseFloat(row\[SCG\_CONFIG.SRC\_IDX.LAT\]);  
      var lng  \= parseFloat(row\[SCG\_CONFIG.SRC\_IDX.LNG\]);

      if (\!name || isNaN(lat) || isNaN(lng)) return;

      var cleanName \= normalizeText(name);

      // \--- หา match ใน Database \---  
      var matchIdx \= \-1;  
      var matchUUID \= "";

      // Tier 1: ชื่อตรง  
      if (existingNames.hasOwnProperty(cleanName)) {  
        matchIdx \= existingNames\[cleanName\];  
      }  
      // Tier 2: ผ่าน NameMapping  
      else if (aliasToUUID.hasOwnProperty(cleanName)) {  
        var uid \= aliasToUUID\[cleanName\];  
        if (existingUUIDs.hasOwnProperty(uid)) {  
          matchIdx \= existingUUIDs\[uid\];  
        }  
      }

      // \========================================  
      // กรณีที่ 1: ชื่อใหม่ ไม่เคยมีใน Database  
      // \========================================  
      if (matchIdx \=== \-1) {  
        if (\!currentBatch.has(cleanName)) {  
          var newRow \= new Array(20).fill("");  
          newRow\[CONFIG.C\_IDX.NAME\]               \= name;  
          newRow\[CONFIG.C\_IDX.LAT\]                \= lat;  
          newRow\[CONFIG.C\_IDX.LNG\]                \= lng;  
          newRow\[CONFIG.C\_IDX.VERIFIED\]           \= false;  
          newRow\[CONFIG.C\_IDX.SYS\_ADDR\]           \= row\[SCG\_CONFIG.SRC\_IDX.SYS\_ADDR\] || "";  
          newRow\[CONFIG.C\_IDX.UUID\]               \= generateUUID();  
          newRow\[CONFIG.C\_IDX.CREATED\]            \= ts;  
          newRow\[CONFIG.C\_IDX.UPDATED\]            \= ts;  
          newRow\[CONFIG.C\_IDX.COORD\_SOURCE\]       \= "SCG\_System";  
          newRow\[CONFIG.C\_IDX.COORD\_CONFIDENCE\]   \= 50;  
          newRow\[CONFIG.C\_IDX.COORD\_LAST\_UPDATED\] \= ts;

          newEntries.push(newRow);  
          currentBatch.add(cleanName);

          // เพิ่มเข้า memory ด้วยเพื่อป้องกันซ้ำในรอบเดียวกัน  
          existingNames\[cleanName\] \= \-999;  
        }  
        return;  
      }

      // \--- ดึงพิกัดจาก Database มาเปรียบเทียบ \---  
      // \[FIXED\] ถ้า matchIdx \= \-999 หมายถึงเพิ่งเพิ่มในรอบนี้ ข้ามไปได้เลย  
if (matchIdx \=== \-999) return;

// \--- ดึงพิกัดจาก Database มาเปรียบเทียบ \---  
var dbRow \= dbData\[matchIdx\];  
if (\!dbRow) return; // safety check  
      var dbLat  \= parseFloat(dbRow\[CONFIG.C\_IDX.LAT\]);  
      var dbLng  \= parseFloat(dbRow\[CONFIG.C\_IDX.LNG\]);  
      var dbUUID \= dbRow\[CONFIG.C\_IDX.UUID\];

      // \========================================  
      // กรณีที่ 2: Database ไม่มีพิกัด → Queue  
      // \========================================  
      if (isNaN(dbLat) || isNaN(dbLng)) {  
        queueEntries.push(\[  
          ts, name, dbUUID,  
          lat \+ ", " \+ lng,  
          "ไม่มีพิกัดใน DB",  
          "",  
          "DB\_NO\_GPS",  
          false, false  
        \]);  
        return;  
      }

      // คำนวณระยะห่าง  
      var diffKm     \= getHaversineDistanceKM(lat, lng, dbLat, dbLng);  
      var diffMeters \= Math.round(diffKm \* 1000);  
      var threshold  \= SCG\_CONFIG.GPS\_THRESHOLD\_METERS / 1000; // แปลงเป็น KM

      // \========================================  
      // กรณีที่ 3: diff ≤ 50m → อัปเดต timestamp  
      // \========================================  
      if (diffKm \<= threshold) {  
        if (\!dbUpdates.hasOwnProperty(matchIdx)) {  
          dbUpdates\[matchIdx\] \= ts;  
        }  
        return;  
      }

      // \========================================  
      // กรณีที่ 4: diff \> 50m → ส่งเข้า Queue  
      // \========================================  
      queueEntries.push(\[  
        ts, name, dbUUID,  
        lat \+ ", " \+ lng,  
        dbLat \+ ", " \+ dbLng,  
        diffMeters,  
        "GPS\_DIFF",  
        false, false  
      \]);  
    });

    // \--- เขียนผลลัพธ์ทั้งหมดกลับ \---  
    var summary \= \[\];

    // 1\. เพิ่มชื่อใหม่ใน Database  
    if (newEntries.length \> 0\) {  
      masterSheet.getRange(lastRowM \+ 1, 1, newEntries.length, 20\)  
        .setValues(newEntries);  
      summary.push("➕ เพิ่มลูกค้าใหม่: " \+ newEntries.length \+ " ราย");  
    }

    // 2\. อัปเดต Coord\_Last\_Updated  
    var updateCount \= Object.keys(dbUpdates).length;  
    if (updateCount \> 0\) {  
      Object.keys(dbUpdates).forEach(function(idx) {  
        var rowNum \= parseInt(idx) \+ 2;  
        masterSheet.getRange(rowNum, CONFIG.COL\_COORD\_LAST\_UPDATED)  
          .setValue(dbUpdates\[idx\]);  
      });  
      summary.push("🕐 อัปเดต timestamp: " \+ updateCount \+ " ราย");  
    }

    // 3\. ส่งเข้า GPS\_Queue  
   if (queueEntries.length \> 0\) {  
  // \[FIXED\] หา lastRow จริงจาก Col A (Timestamp) ไม่นับ Checkbox  
  var lastQueueRow \= getRealLastRow\_(queueSheet, 1);  
  queueSheet.getRange(lastQueueRow \+ 1, 1, queueEntries.length, 9\)  
    .setValues(queueEntries);  
      summary.push("📋 ส่งเข้า GPS\_Queue: " \+ queueEntries.length \+ " ราย");  
    }

    // 4\. Mark SYNCED  
    var syncColIndex \= SCG\_CONFIG.SRC\_IDX\_SYNC\_STATUS;  
    sData.forEach(function(row, i) {  
      var name \= row\[SCG\_CONFIG.SRC\_IDX.NAME\];  
      var lat  \= parseFloat(row\[SCG\_CONFIG.SRC\_IDX.LAT\]);  
      var lng  \= parseFloat(row\[SCG\_CONFIG.SRC\_IDX.LNG\]);  
      var currentStatus \= row\[syncColIndex \- 1\];  
        
      if (name && \!isNaN(lat) && \!isNaN(lng) &&   
          currentStatus \!== SCG\_CONFIG.SYNC\_STATUS\_DONE) {  
        sourceSheet.getRange(i \+ 2, syncColIndex)  
          .setValue(SCG\_CONFIG.SYNC\_STATUS\_DONE);  
      }  
    });

    SpreadsheetApp.flush();

    if (summary.length \=== 0\) {  
      ui.alert("👌 ไม่มีข้อมูลใหม่ที่ต้องประมวลผลครับ");  
    } else {  
      ui.alert("✅ Sync สำเร็จ\!\\n\\n" \+ summary.join("\\n"));  
    }

  } catch (error) {  
    console.error("Sync Error: " \+ error.message);  
    ui.alert("❌ เกิดข้อผิดพลาด: " \+ error.message);  
  } finally {  
    lock.releaseLock();   
  }  
}

function cleanDistance\_Helper(val) {  
  if (\!val) return "";  
  if (typeof val \=== 'number') return val;  
  return parseFloat(val.toString().replace(/,/g, '').replace('km', '').trim()) || "";  
}

// \==========================================  
// (ส่วนที่เหลือทั้งหมดดึงมาจาก V4.0 เหมือนเดิม เพื่อให้ครบไฟล์)  
// \==========================================

function updateGeoData\_SmartCache() { runDeepCleanBatch\_100(); }  
function autoGenerateMasterList\_Smart() { processClustering\_GridOptimized(); }

function runDeepCleanBatch\_100() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) return;

  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) return;

  var props \= PropertiesService.getScriptProperties();  
  var startRow \= parseInt(props.getProperty('DEEP\_CLEAN\_POINTER') || '2');  
    
  if (startRow \> lastRow) {  
    ui.alert("🎉 ตรวจครบทุกแถวแล้ว (Pointer Reset)");  
    props.deleteProperty('DEEP\_CLEAN\_POINTER');  
    return;  
  }

  var endRow \= Math.min(startRow \+ CONFIG.DEEP\_CLEAN\_LIMIT \- 1, lastRow);  
  var numRows \= endRow \- startRow \+ 1;  
    
  var range \= sheet.getRange(startRow, 1, numRows, 17);  
  var values \= range.getValues();  
    
  var origin \= CONFIG.DEPOT\_LAT \+ "," \+ CONFIG.DEPOT\_LNG;  
  var updatedCount \= 0;

  for (var i \= 0; i \< values.length; i++) {  
    var row \= values\[i\];  
    var lat \= row\[CONFIG.C\_IDX.LAT\];  
    var lng \= row\[CONFIG.C\_IDX.LNG\];  
    var changed \= false;

    if (lat && lng && \!row\[CONFIG.C\_IDX.GOOGLE\_ADDR\]) {  
      try {  
        var addr \= GET\_ADDR\_WITH\_CACHE(lat, lng);   
        if (addr && addr \!== "Error") {  
          row\[CONFIG.C\_IDX.GOOGLE\_ADDR\] \= addr;  
          changed \= true;  
        }  
      } catch (e) { console.warn("Geo Error: " \+ e.message); }  
    }

    if (lat && lng && \!row\[CONFIG.C\_IDX.DIST\_KM\]) {  
      var km \= CALCULATE\_DISTANCE\_KM(origin, lat \+ "," \+ lng);   
      if (km) { row\[CONFIG.C\_IDX.DIST\_KM\] \= km; changed \= true; }  
    }  
      
    if (\!row\[CONFIG.C\_IDX.UUID\]) {   
      row\[CONFIG.C\_IDX.UUID\] \= generateUUID();   
      row\[CONFIG.C\_IDX.CREATED\] \= row\[CONFIG.C\_IDX.CREATED\] || new Date();   
      changed \= true;   
    }

    var gAddr \= row\[CONFIG.C\_IDX.GOOGLE\_ADDR\];  
    if (gAddr && (\!row\[CONFIG.C\_IDX.PROVINCE\] || \!row\[CONFIG.C\_IDX.DISTRICT\])) {  
       var parsed \= parseAddressFromText(gAddr);   
       if (parsed && parsed.province) {  
         row\[CONFIG.C\_IDX.PROVINCE\] \= parsed.province;  
         row\[CONFIG.C\_IDX.DISTRICT\] \= parsed.district;  
         row\[CONFIG.C\_IDX.POSTCODE\] \= parsed.postcode;  
         changed \= true;  
       }  
    }

    // \[NEW v4.1\] คำนวณ QUALITY Score ทุกครั้งที่ Deep Clean  
var qualityScore \= 0;

// ชื่อ  
var rowName \= row\[CONFIG.C\_IDX.NAME\];  
if (rowName && rowName.toString().length \>= 3\) qualityScore \+= 10;

// พิกัด  
var rowLat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
var rowLng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
if (\!isNaN(rowLat) && \!isNaN(rowLng)) {  
  qualityScore \+= 20;  
  // พิกัดอยู่ในไทย  
  if (rowLat \>= 6 && rowLat \<= 21 && rowLng \>= 97 && rowLng \<= 106\) {  
    qualityScore \+= 10;  
  }  
}

// ที่อยู่จาก Google  
if (row\[CONFIG.C\_IDX.GOOGLE\_ADDR\]) qualityScore \+= 15;

// Province/District  
if (row\[CONFIG.C\_IDX.PROVINCE\] && row\[CONFIG.C\_IDX.DISTRICT\]) {  
  qualityScore \+= 10;  
}

// Postcode  
if (row\[CONFIG.C\_IDX.POSTCODE\]) qualityScore \+= 5;

// UUID  
if (row\[CONFIG.C\_IDX.UUID\]) qualityScore \+= 10;

// Verified  
if (row\[CONFIG.C\_IDX.VERIFIED\] \=== true) qualityScore \+= 20;

row\[CONFIG.C\_IDX.QUALITY\] \= Math.min(qualityScore, 100);

if (changed || row\[CONFIG.C\_IDX.QUALITY\] \!== values\[i\]\[CONFIG.C\_IDX.QUALITY\]) {  
  row\[CONFIG.C\_IDX.UPDATED\] \= new Date();  
  updatedCount++;  
  changed \= true;  
}  
  }

  if (updatedCount \> 0\) range.setValues(values);  
  props.setProperty('DEEP\_CLEAN\_POINTER', (endRow \+ 1).toString());  
  ss.toast("✅ Processed rows " \+ startRow \+ "-" \+ endRow \+ " (Updated: " \+ updatedCount \+ ")", "Deep Clean");  
}

function resetDeepCleanMemory() {  
  PropertiesService.getScriptProperties().deleteProperty('DEEP\_CLEAN\_POINTER');  
  SpreadsheetApp.getActiveSpreadsheet().toast("🔄 Memory Reset: ระบบถูกรีเซ็ต จะเริ่มตรวจสอบแถวที่ 2 ในรอบถัดไป", "System Ready");  
}

/\*\*  
 \* \[Phase B FIXED\] finalizeAndClean\_MoveToMapping()  
 \* เปลี่ยน hardcode 17 → CONFIG.DB\_TOTAL\_COLS  
 \*/

/\*\*  
 \* \[Phase C FIXED\] finalizeAndClean\_MoveToMapping()  
 \* แยกเป็น 3 step: collect → build → rewrite  
 \* เพิ่ม conflict report ก่อน finalize  
 \*/  
function finalizeAndClean\_MoveToMapping() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();

  var lock \= LockService.getScriptLock();  
  if (\!lock.tryLock(30000)) {  
    ui.alert("⚠️ ระบบคิวทำงาน", "มีผู้ใช้งานอื่นกำลังแก้ไขฐานข้อมูล กรุณารอสักครู่", ui.ButtonSet.OK);  
    return;  
  }

  try {  
    var masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    var mapSheet    \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
    if (\!masterSheet || \!mapSheet) { ui.alert("❌ Error: Missing Sheets"); return; }

    var lastRow \= getRealLastRow\_(masterSheet, CONFIG.COL\_NAME);  
    if (lastRow \< 2\) { ui.alert("ℹ️ Database is empty."); return; }

    var allData \= masterSheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();

    // ─── Step 1: Collect ──────────────────────────────────────────────  
    var uuidMap       \= {};  
    var conflicts     \= \[\];  
    var uuidNameIndex \= {};

    allData.forEach(function(row) {  
      var uuid \= row\[CONFIG.C\_IDX.UUID\];  
      var name \= row\[CONFIG.C\_IDX.NAME\];  
      var sugg \= row\[CONFIG.C\_IDX.SUGGESTED\];  
      if (uuid) {  
        uuidMap\[normalizeText(name)\] \= uuid;  
        if (sugg) uuidMap\[normalizeText(sugg)\] \= uuid;  
        // ตรวจ UUID ซ้ำ  
        if (uuidNameIndex\[uuid\]) {  
          conflicts.push("UUID ซ้ำ: " \+ uuid \+ " พบทั้ง '" \+ uuidNameIndex\[uuid\] \+ "' และ '" \+ name \+ "'");  
        } else {  
          uuidNameIndex\[uuid\] \= name;  
        }  
      }  
    });

    // แสดง conflict report ถ้ามี  
    if (conflicts.length \> 0\) {  
      var conflictMsg \= "⚠️ พบ conflict ก่อน Finalize:\\n\\n" \+  
                        conflicts.slice(0, 5).join("\\n") \+  
                        (conflicts.length \> 5 ? "\\n...และอีก " \+ (conflicts.length \- 5\) \+ " รายการ" : "") \+  
                        "\\n\\nต้องการดำเนินการต่อหรือไม่?";  
      var proceed \= ui.alert("⚠️ Finalize Conflicts", conflictMsg, ui.ButtonSet.YES\_NO);  
      if (proceed \!== ui.Button.YES) return;  
    }

    // ─── Step 2: Build Mapping Rows ───────────────────────────────────  
    var rowsToKeep      \= \[\];  
    var mappingToUpload \= \[\];  
    var processedNames  \= new Set();

    for (var i \= 0; i \< allData.length; i++) {  
      var row           \= allData\[i\];  
      var rawName       \= row\[CONFIG.C\_IDX.NAME\];  
      var suggestedName \= row\[CONFIG.C\_IDX.SUGGESTED\];  
      var isVerified    \= row\[CONFIG.C\_IDX.VERIFIED\];  
      var currentUUID   \= row\[CONFIG.C\_IDX.UUID\];

      if (isVerified \=== true) {  
        rowsToKeep.push(row);  
      } else if (suggestedName && suggestedName \!== "") {  
        if (rawName \!== suggestedName && \!processedNames.has(rawName)) {  
          var targetUUID \= uuidMap\[normalizeText(suggestedName)\] || currentUUID;

          // \[Phase C\] ตรวจว่า targetUUID ยัง active อยู่  
          if (\!targetUUID) {  
            console.warn("\[finalizeAndClean\] '" \+ rawName \+ "' ไม่มี target UUID ข้ามไป");  
          } else {  
            mappingToUpload.push(mapObjectToRow({  
              variant:    rawName,  
              uid:        targetUUID,  
              confidence: 100,  
              mappedBy:   "Human",  
              timestamp:  new Date()  
            }));  
            processedNames.add(rawName);  
          }  
        }  
      }  
    }

    // ─── Step 3: Rewrite ──────────────────────────────────────────────  
    var backupName \= "Backup\_DB\_" \+ Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd\_HHmm");  
    masterSheet.copyTo(ss).setName(backupName);  
    console.log("\[finalizeAndClean\] Backup created: " \+ backupName);

    if (mappingToUpload.length \> 0\) {  
      appendNameMappings\_(mappingToUpload);  
    }

    masterSheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).clearContent();

    if (rowsToKeep.length \> 0\) {  
      masterSheet.getRange(2, 1, rowsToKeep.length, CONFIG.DB\_TOTAL\_COLS).setValues(rowsToKeep);  
      var ghostStart \= rowsToKeep.length \+ 2;  
      var ghostCount \= lastRow \- 1 \- rowsToKeep.length;  
      if (ghostCount \> 0\) masterSheet.deleteRows(ghostStart, ghostCount);  
      SpreadsheetApp.flush();  
      if (typeof clearSearchCache \=== 'function') clearSearchCache();  
      ui.alert(  
        "✅ Finalize Complete\!\\n\\n" \+  
        "📋 New Mappings: " \+ mappingToUpload.length \+ "\\n" \+  
        "✅ Active Master Data: " \+ rowsToKeep.length \+ "\\n" \+  
        "⚠️ Conflicts detected: " \+ conflicts.length  
      );  
    } else {  
      masterSheet.getRange(2, 1, allData.length, CONFIG.DB\_TOTAL\_COLS).setValues(allData);  
      ui.alert("⚠️ Warning: No Verified rows found. Data restored.");  
    }

  } catch(e) {  
    console.error("\[finalizeAndClean\] Error: " \+ e.message);  
    ui.alert("❌ CRITICAL WRITE ERROR: " \+ e.message \+ "\\nPlease check Backup Sheet.");  
  } finally {  
    lock.releaseLock();  
  }  
}

function assignMissingUUIDs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) return;

  var range \= sheet.getRange(2, CONFIG.COL\_UUID, lastRow \- 1, 1);  
  var values \= range.getValues();  
  var count \= 0;

  var newValues \= values.map(function(r) {  
    if (\!r\[0\]) {  
      count++;  
      return \[generateUUID()\];  
    }  
    return \[r\[0\]\];  
  });

  if (count \> 0\) {  
    range.setValues(newValues);  
    ui.alert("✅ Generated " \+ count \+ " new UUIDs.");  
  } else {  
    ui.alert("ℹ️ All rows already have UUIDs.");  
  }  
}

/\*\*  
 \* \[Phase A FIXED\] repairNameMapping\_Full()  
 \* แก้ UUID fallback ที่ lookup จาก r\[1\] (UID column) ผิด → ใช้ variantName แทน  
 \* เพิ่ม invalid row report แทนการสร้าง UUID ใหม่แบบ silent  
 \*/  
function repairNameMapping\_Full() {  
  var ss       \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui       \= SpreadsheetApp.getUi();  
  var dbSheet  \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);

  if (\!dbSheet || \!mapSheet) {  
    ui.alert("❌ ไม่พบชีต Database หรือ NameMapping");  
    return;  
  }

  console.log("\[repairNameMapping\_Full\] START — Phase A Fixed");

  // Step 1: สร้าง uuidMap จาก Database (normalizedName → UUID)  
  var dbLastRow \= getRealLastRow\_(dbSheet, CONFIG.COL\_NAME);  
  var dbData    \= (dbLastRow \> 1\)  
    ? dbSheet.getRange(2, 1, dbLastRow \- 1, CONFIG.COL\_UUID).getValues()  
    : \[\];

  var uuidMap \= {};  
  dbData.forEach(function(r) {  
    var name \= r\[CONFIG.C\_IDX.NAME\];  
    var uuid \= r\[CONFIG.C\_IDX.UUID\];  
    if (name && uuid) uuidMap\[normalizeText(name)\] \= uuid;  
  });  
  console.log("\[repairNameMapping\_Full\] DB map: " \+ Object.keys(uuidMap).length \+ " entries");

  // Step 2: อ่าน NameMapping  
  var mapLastRow \= mapSheet.getLastRow();  
  if (mapLastRow \< 2\) { ui.alert("ℹ️ NameMapping ว่างเปล่า"); return; }

  var mapValues   \= mapSheet.getRange(2, 1, mapLastRow \- 1, CONFIG.MAP\_TOTAL\_COLS).getValues();  
  var cleanList   \= \[\];  
  var seen        \= new Set();  
  var invalidRows \= \[\];

  mapValues.forEach(function(r, i) {  
    var variantName \= r\[CONFIG.MAP\_IDX.VARIANT\] ? r\[CONFIG.MAP\_IDX.VARIANT\].toString().trim() : "";  
    var providedUid \= r\[CONFIG.MAP\_IDX.UID\]     ? r\[CONFIG.MAP\_IDX.UID\].toString().trim()     : "";  
    var conf        \= r\[CONFIG.MAP\_IDX.CONFIDENCE\] || 100;  
    var mappedBy    \= r\[CONFIG.MAP\_IDX.MAPPED\_BY\]  || "System\_Repair";  
    var ts          \= r\[CONFIG.MAP\_IDX.TIMESTAMP\]  || new Date();

    var normVariant \= normalizeText(variantName);  
    if (\!normVariant) return;

    // \[Phase A FIXED\] UUID Resolution  
    // 1\. ใช้ providedUid ถ้ามี  
    // 2\. lookup จาก variantName → DB  (เดิม lookup จาก r\[1\] ผิด)  
    // 3\. ถ้าไม่เจอ → mark invalid ไม่สร้าง UUID ใหม่  
    var resolvedUid \= "";

    if (providedUid) {  
      resolvedUid \= providedUid;  
    } else {  
      resolvedUid \= uuidMap\[normVariant\] || "";  
      if (resolvedUid) {  
        console.log("\[repairNameMapping\_Full\] Auto-resolved: '" \+ variantName \+ "'");  
      } else {  
        invalidRows.push({ rowNum: i \+ 2, variant: variantName });  
        console.warn("\[repairNameMapping\_Full\] INVALID row " \+ (i \+ 2\) \+ ": '" \+ variantName \+ "'");  
        return;  
      }  
    }

    if (\!seen.has(normVariant)) {  
      seen.add(normVariant);  
      var mapRow \= new Array(CONFIG.MAP\_TOTAL\_COLS).fill("");  
      mapRow\[CONFIG.MAP\_IDX.VARIANT\]    \= variantName;  
      mapRow\[CONFIG.MAP\_IDX.UID\]        \= resolvedUid;  
      mapRow\[CONFIG.MAP\_IDX.CONFIDENCE\] \= conf;  
      mapRow\[CONFIG.MAP\_IDX.MAPPED\_BY\]  \= mappedBy;  
      mapRow\[CONFIG.MAP\_IDX.TIMESTAMP\]  \= ts;  
      cleanList.push(mapRow);  
    }  
  });

  // Step 3: เขียนกลับ  
  if (cleanList.length \> 0\) {  
    mapSheet.getRange(2, 1, mapLastRow \- 1, CONFIG.MAP\_TOTAL\_COLS).clearContent();  
    mapSheet.getRange(2, 1, cleanList.length, CONFIG.MAP\_TOTAL\_COLS).setValues(cleanList);  
    if (typeof clearSearchCache \=== 'function') clearSearchCache();  
  }

  // Step 4: Report  
  var report \= "✅ Repair NameMapping สำเร็จ\!\\n\\n" \+  
               "📋 Valid mappings: " \+ cleanList.length \+ " rows\\n" \+  
               "❌ Invalid (หา UUID ไม่เจอ): " \+ invalidRows.length \+ " rows";

  if (invalidRows.length \> 0\) {  
    report \+= "\\n\\n⚠️ แถวที่ต้องตรวจสอบมือ:\\n";  
    invalidRows.slice(0, 10).forEach(function(inv) {  
      report \+= "  แถว " \+ inv.rowNum \+ ": " \+ inv.variant \+ "\\n";  
    });  
    if (invalidRows.length \> 10\) {  
      report \+= "  ...และอีก " \+ (invalidRows.length \- 10\) \+ " รายการ";  
    }  
    report \+= "\\n\\n💡 เปิดชีต NameMapping แล้วเติม Master\_UID ให้แถวเหล่านี้ครับ";  
  }

  console.log("\[repairNameMapping\_Full\] DONE — Valid: " \+ cleanList.length \+  
              " | Invalid: " \+ invalidRows.length);  
  ui.alert(report);  
}

function processClustering\_GridOptimized() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) return;

  var range \= sheet.getRange(2, 1, lastRow \- 1, 15);   
  var values \= range.getValues();  
    
  var clusters \= \[\];        
  var grid \= {};          

  for (var i \= 0; i \< values.length; i++) {  
    var r \= values\[i\];  
    var lat \= parseFloat(r\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(r\[CONFIG.C\_IDX.LNG\]);  
      
    // \[FIXED v4.1\] ดักจับ NaN ก่อนสร้าง gridKey  
    // ถ้าไม่มีพิกัด ข้ามไปเลย ไม่เอาเข้ากลุ่ม NaN\_NaN  
    if (\!lat || \!lng || isNaN(lat) || isNaN(lng)) continue;

    var gridKey \= Math.floor(lat \* 10\) \+ "\_" \+ Math.floor(lng \* 10);  
      
    if (\!grid\[gridKey\]) grid\[gridKey\] \= \[\];  
    grid\[gridKey\].push(i);

    if (r\[CONFIG.C\_IDX.VERIFIED\] \=== true) {  
      clusters.push({  
        lat: lat,  
        lng: lng,  
        name: r\[CONFIG.C\_IDX.SUGGESTED\] || r\[CONFIG.C\_IDX.NAME\],  
        rowIndexes: \[i\],  
        hasLock: true,  
        gridKey: gridKey  
      });  
    }  
  }

  for (var i \= 0; i \< values.length; i++) {  
    if (values\[i\]\[CONFIG.C\_IDX.VERIFIED\] \=== true) continue; 

    var lat \= parseFloat(values\[i\]\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(values\[i\]\[CONFIG.C\_IDX.LNG\]);  
      
    // \[FIXED v4.1\] ดักจับ NaN ทั้งสองค่าก่อนใช้งาน  
    if (\!lat || \!lng || isNaN(lat) || isNaN(lng)) continue;

    var myGridKey \= Math.floor(lat \* 10\) \+ "\_" \+ Math.floor(lng \* 10);  
    var found \= false;

    for (var c \= 0; c \< clusters.length; c++) {  
      if (clusters\[c\].gridKey \=== myGridKey) {   
        var dist \= getHaversineDistanceKM(lat, lng, clusters\[c\].lat, clusters\[c\].lng);  
        if (dist \<= CONFIG.DISTANCE\_THRESHOLD\_KM) {  
          clusters\[c\].rowIndexes.push(i);  
          found \= true;  
          break;  
        }  
      }  
    }

    if (\!found) {  
      clusters.push({  
        lat: lat,  
        lng: lng,  
        rowIndexes: \[i\],  
        hasLock: false,  
        name: null,  
        gridKey: myGridKey  
      });  
    }  
  }

  var updateCount \= 0;  
  clusters.forEach(function(g) {  
    var candidateNames \= \[\];  
    g.rowIndexes.forEach(function(idx) {   
        var rawName \= values\[idx\]\[CONFIG.C\_IDX.NAME\];  
        var existingSuggested \= values\[idx\]\[CONFIG.C\_IDX.SUGGESTED\];  
        candidateNames.push(rawName);   
        if (existingSuggested && existingSuggested \!== rawName) {  
            candidateNames.push(existingSuggested, existingSuggested, existingSuggested);  
        }  
    });

    var winner \= g.hasLock ? g.name : getBestName\_Smart(candidateNames);

// \[FIXED v4.1\] คำนวณ Confidence เป็น % จริงๆ  
// ปัจจัย 1: จำนวนแถวในกลุ่ม (max 40%)  
var countScore \= Math.min(g.rowIndexes.length \* 10, 40);

// ปัจจัย 2: มี Verified \= true ในกลุ่ม (40%)  
var hasVerified \= g.rowIndexes.some(function(idx) {  
  return values\[idx\]\[CONFIG.C\_IDX.VERIFIED\] \=== true;  
});  
var verifiedScore \= hasVerified ? 40 : 0;

// ปัจจัย 3: มีพิกัดครบ (20%)  
var hasCoord \= \!isNaN(parseFloat(values\[g.rowIndexes\[0\]\]\[CONFIG.C\_IDX.LAT\])) &&  
               \!isNaN(parseFloat(values\[g.rowIndexes\[0\]\]\[CONFIG.C\_IDX.LNG\]));  
var coordScore \= hasCoord ? 20 : 0;

// รวม Confidence (0-100)  
var confidence \= Math.min(countScore \+ verifiedScore \+ coordScore, 100);

g.rowIndexes.forEach(function(idx) {  
  if (values\[idx\]\[CONFIG.C\_IDX.VERIFIED\] \!== true) {  
    var currentSuggested  \= values\[idx\]\[CONFIG.C\_IDX.SUGGESTED\];  
    var currentConfidence \= values\[idx\]\[CONFIG.C\_IDX.CONFIDENCE\];  
      
    if (currentSuggested \!== winner || currentConfidence \!== confidence) {  
      values\[idx\]\[CONFIG.C\_IDX.SUGGESTED\]  \= winner;  
      values\[idx\]\[CONFIG.C\_IDX.CONFIDENCE\] \= confidence;  
      values\[idx\]\[CONFIG.C\_IDX.NORMALIZED\] \= normalizeText(winner);  
      updateCount++;  
    }  
  }  
});  
  });

  if (updateCount \> 0\) {  
    range.setValues(values);  
    ss.toast("✅ จัดกลุ่มสำเร็จ\! พร้อมอัปเกรดชื่อที่ฉลาดขึ้น (Updated: " \+ updateCount \+ " rows)", "Clustering V4.1");  
  } else {  
    ss.toast("ℹ️ ข้อมูลจัดกลุ่มเรียบร้อยดีอยู่แล้ว ไม่มีการเปลี่ยนแปลง", "Clustering V4.1");  
  }  
}

function fixCheckboxOverflow() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  // หาแถวข้อมูลจริงจาก COL\_NAME  
  var realLastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var sheetLastRow \= sheet.getLastRow();  
    
  console.log("ข้อมูลจริงจบที่แถว: " \+ realLastRow);  
  console.log("getLastRow() คืนค่า: " \+ sheetLastRow);  
  console.log("แถว Checkbox เกิน: " \+ (sheetLastRow \- realLastRow));  
    
  if (sheetLastRow \<= realLastRow) {  
    ui.alert("✅ ไม่มีแถวเกิน ไม่ต้องแก้ไขครับ");  
    return;  
  }  
    
  var result \= ui.alert(  
    "⚠️ ยืนยันการลบแถวเกิน",  
    "ข้อมูลจริงจบที่แถว " \+ realLastRow \+ "\\n" \+  
    "มีแถว Checkbox เกินอยู่ " \+ (sheetLastRow \- realLastRow) \+ " แถว\\n\\n" \+  
    "ต้องการลบแถว " \+ (realLastRow \+ 1\) \+ " ถึง " \+ sheetLastRow \+ " ออกหรือไม่?",  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (result \!== ui.Button.YES) return;  
    
  // ลบแถวเกินออกทั้งหมด  
  var deleteStart \= realLastRow \+ 1;  
  var deleteCount \= sheetLastRow \- realLastRow;  
  sheet.deleteRows(deleteStart, deleteCount);  
    
  SpreadsheetApp.flush();  
    
  var newLastRow \= sheet.getLastRow();  
  console.log("หลังแก้ไข getLastRow() \= " \+ newLastRow);  
    
  ui.alert(  
    "✅ แก้ไขสำเร็จ\!\\n\\n" \+  
    "ลบแถวเกินออก " \+ deleteCount \+ " แถว\\n" \+  
    "getLastRow() ตอนนี้คืนค่า " \+ newLastRow \+ "\\n\\n" \+  
    "หมายเหตุ: ถ้าต้องการ Checkbox ใหม่\\n" \+  
    "ให้เพิ่มแค่ 200-300 แถว ไม่ต้องหมื่นแถวครับ"  
  );  
}

/\*\*  
 \* \[Phase B FIXED\] recalculateAllConfidence()  
 \* เปลี่ยน hardcode 17 → CONFIG.DB\_TOTAL\_COLS  
 \*/  
function recalculateAllConfidence() {  
  var ss    \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui    \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);

  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) return;

  // \[Phase B\] ใช้ DB\_TOTAL\_COLS  
  var maxCol       \= CONFIG.DB\_TOTAL\_COLS;  
  var data         \= sheet.getRange(2, 1, lastRow \- 1, maxCol).getValues();  
  var updatedCount \= 0;

  data.forEach(function(row, i) {  
    if (\!row\[CONFIG.C\_IDX.NAME\]) return;

    var verifiedScore \= (row\[CONFIG.C\_IDX.VERIFIED\] \=== true) ? 40 : 0;  
    var lat           \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng           \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
    var coordScore    \= (\!isNaN(lat) && \!isNaN(lng)) ? 20 : 0;  
    var addrScore     \= row\[CONFIG.C\_IDX.GOOGLE\_ADDR\] ? 10 : 0;  
    var geoScore      \= (row\[CONFIG.C\_IDX.PROVINCE\] && row\[CONFIG.C\_IDX.DISTRICT\]) ? 10 : 0;  
    var uuidScore     \= row\[CONFIG.C\_IDX.UUID\] ? 10 : 0;  
    var sourceScore   \= (row\[CONFIG.C\_IDX.COORD\_SOURCE\] \=== "Driver\_GPS") ? 10 : 0;

    var newConf \= Math.min(verifiedScore \+ coordScore \+ addrScore \+ geoScore \+ uuidScore \+ sourceScore, 100);  
    if (row\[CONFIG.C\_IDX.CONFIDENCE\] \!== newConf) {  
      data\[i\]\[CONFIG.C\_IDX.CONFIDENCE\] \= newConf;  
      updatedCount++;  
    }  
  });

  if (updatedCount \> 0\) {  
    sheet.getRange(2, 1, data.length, maxCol).setValues(data);  
    SpreadsheetApp.flush();  
  }

  ui.alert("✅ คำนวณ Confidence ใหม่เสร็จ\!\\nอัปเดต: " \+ updatedCount \+ " แถว");  
}  
  

/\*\*  
 \* \[Phase B FIXED\] recalculateAllQuality()  
 \* เปลี่ยน hardcode 17 → CONFIG.DB\_TOTAL\_COLS  
 \*/  
function recalculateAllQuality() {  
  var ss    \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui    \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);

  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) return;

  // \[Phase B\] ใช้ DB\_TOTAL\_COLS  
  var data         \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var updatedCount \= 0;

  data.forEach(function(row, i) {  
    var name \= row\[CONFIG.C\_IDX.NAME\];  
    if (\!name) return;

    var qualityScore \= 0;  
    if (name.toString().length \>= 3\) qualityScore \+= 10;

    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
    if (\!isNaN(lat) && \!isNaN(lng)) {  
      qualityScore \+= 20;  
      if (lat \>= 6 && lat \<= 21 && lng \>= 97 && lng \<= 106\) qualityScore \+= 10;  
    }  
    if (row\[CONFIG.C\_IDX.GOOGLE\_ADDR\])                         qualityScore \+= 15;  
    if (row\[CONFIG.C\_IDX.PROVINCE\] && row\[CONFIG.C\_IDX.DISTRICT\]) qualityScore \+= 10;  
    if (row\[CONFIG.C\_IDX.POSTCODE\])                            qualityScore \+= 5;  
    if (row\[CONFIG.C\_IDX.UUID\])                                qualityScore \+= 10;  
    if (row\[CONFIG.C\_IDX.VERIFIED\] \=== true)                   qualityScore \+= 20;

    var newQuality \= Math.min(qualityScore, 100);  
    if (row\[CONFIG.C\_IDX.QUALITY\] \!== newQuality) {  
      data\[i\]\[CONFIG.C\_IDX.QUALITY\] \= newQuality;  
      updatedCount++;  
    }  
  });

  if (updatedCount \> 0\) {  
    sheet.getRange(2, 1, data.length, CONFIG.DB\_TOTAL\_COLS).setValues(data);  
    SpreadsheetApp.flush();  
  }

  var stats \= { total: 0, high: 0, mid: 0, low: 0 };  
  data.forEach(function(row) {  
    var q \= parseFloat(row\[CONFIG.C\_IDX.QUALITY\]);  
    if (isNaN(q) || \!row\[CONFIG.C\_IDX.NAME\]) return;  
    stats.total++;  
    if (q \>= 80\)      stats.high++;  
    else if (q \>= 50\) stats.mid++;  
    else              stats.low++;  
  });

  ui.alert(  
    "✅ คำนวณ Quality Score เสร็จแล้ว\!\\n\\nอัปเดต: " \+ updatedCount \+ " แถว\\n\\n" \+  
    "🟢 ≥80%: " \+ stats.high \+ " แถว\\n" \+  
    "🟡 50-79%: " \+ stats.mid  \+ " แถว\\n" \+  
    "🔴 \<50%: "  \+ stats.low  \+ " แถว"  
  );  
}

function showLowQualityRows() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data \= sheet.getRange(2, 1, lastRow \- 1, 17).getValues();  
    
  console.log("=== แถวที่ Quality \< 50% \===");  
  data.forEach(function(row, i) {  
    var quality \= parseFloat(row\[CONFIG.C\_IDX.QUALITY\]);  
    if (\!row\[CONFIG.C\_IDX.NAME\] || isNaN(quality)) return;  
      
    if (quality \< 50\) {  
      console.log("แถว " \+ (i+2) \+ ": " \+ row\[CONFIG.C\_IDX.NAME\]);  
      console.log("  Quality: " \+ quality \+ "%");  
      console.log("  LAT: " \+ row\[CONFIG.C\_IDX.LAT\]);  
      console.log("  LNG: " \+ row\[CONFIG.C\_IDX.LNG\]);  
      console.log("  Province: " \+ row\[CONFIG.C\_IDX.PROVINCE\]);  
      console.log("  UUID: " \+ row\[CONFIG.C\_IDX.UUID\]);  
      console.log("  Verified: " \+ row\[CONFIG.C\_IDX.VERIFIED\]);  
    }  
  });  
}

\`\`\`

\#\# 4\. \`Service\_Maintenance.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🧹 Service: System Maintenance & Alerts (Enterprise Edition)  
 \* หน้าที่: ดูแลรักษาความสะอาดไฟล์ ลบ Backup เก่า และแจ้งเตือนผ่าน LINE/Telegram  
 \* Version: 4.0 Omni-Alerts & Housekeeping  
 \* \---------------------------------------------  
 \* \[PRESERVED\]: 10M Cell Limit check and 30-day Backup retention logic.  
 \* \[ADDED v4.0\]: Fully implemented sendLineNotify() and sendTelegramNotify().  
 \* \[MODIFIED v4.0\]: Improved Regex for extracting dates from Backup sheets.  
 \* \[MODIFIED v4.0\]: Added LockService and GCP Console Logging.  
 \* Author: Elite Logistics Architect  
 \*/

// \==========================================  
// 1\. SYSTEM MAINTENANCE (HOUSEKEEPING)  
// \==========================================

/\*\*  
 \* 🗑️ ลบชีต Backup ที่เก่ากว่า 30 วัน (แนะนำให้ตั้ง Trigger รันทุกสัปดาห์)  
 \*/  
function cleanupOldBackups() {  
  var lock \= LockService.getScriptLock();  
  if (\!lock.tryLock(10000)) {  
    console.warn("\[Maintenance\] ข้ามการทำงานเนื่องจากระบบอื่นกำลังใช้งานอยู่");  
    return;  
  }

  try {  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var sheets \= ss.getSheets();  
    var deletedCount \= 0;  
    var keepDays \= 30; // เก็บย้อนหลัง 30 วัน  
    var now \= new Date();  
    var deletedNames \= \[\];

    sheets.forEach(function(sheet) {  
      var name \= sheet.getName();  
        
      // ตรวจสอบชื่อชีตที่ขึ้นต้นด้วย "Backup\_"  
      if (name.startsWith("Backup\_")) {  
        // \[MODIFIED v4.0\]: แกะวันที่จากรูปแบบ Backup\_DB\_yyyyMMdd\_HHmm  
        var datePart \= name.match(/(\\d{4})(\\d{2})(\\d{2})/); // จับกลุ่ม ปี(4) เดือน(2) วัน(2)  
          
        if (datePart && datePart.length \=== 4\) {  
          var year \= parseInt(datePart\[1\]);  
          var month \= parseInt(datePart\[2\]) \- 1; // JS Month starts at 0  
          var day \= parseInt(datePart\[3\]);  
            
          var sheetDate \= new Date(year, month, day);  
          var diffTime \= Math.abs(now \- sheetDate);  
          var diffDays \= Math.ceil(diffTime / (1000 \* 60 \* 60 \* 24)); 

          if (diffDays \> keepDays) {  
            try {  
              ss.deleteSheet(sheet);  
              deletedCount++;  
              deletedNames.push(name);  
            } catch(e) {  
              console.error("\[Maintenance\] Could not delete " \+ name \+ ": " \+ e.message);  
            }  
          }  
        }  
      }  
    });

    if (deletedCount \> 0\) {  
      var msg \= \`🧹 Maintenance Report:\\nระบบได้ลบชีต Backup ที่เก่ากว่า ${keepDays} วัน จำนวน ${deletedCount} ชีตเรียบร้อยแล้ว\`;  
      console.info(\`\[Maintenance\] Deleted ${deletedCount} old backups: ${deletedNames.join(", ")}\`);  
        
      // แจ้งเตือนผู้ดูแลระบบ  
      sendLineNotify(msg);  
      sendTelegramNotify(msg);  
      SpreadsheetApp.getActiveSpreadsheet().toast(\`ลบ Backup เก่าไป ${deletedCount} ชีต\`, "Maintenance");  
    } else {  
      console.log("\[Maintenance\] No old backups to delete.");  
    }  
  } catch (err) {  
    console.error("\[Maintenance\] Error: " \+ err.message);  
  } finally {  
    lock.releaseLock();  
  }  
}

/\*\*  
 \* 🏥 ตรวจสอบสุขภาพไฟล์ (Cell Limit Check)  
 \* แนะนำให้ตั้ง Trigger รันวันละ 1 ครั้ง  
 \*/  
function checkSpreadsheetHealth() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  // Google Sheets Limit: 10 Million Cells (Enterprise Standard)  
  var cellLimit \= 10000000;  
  var totalCells \= 0;  
  var sheetCount \= 0;  
    
  ss.getSheets().forEach(function(s) {  
    totalCells \+= (s.getMaxRows() \* s.getMaxColumns());  
    sheetCount++;  
  });  
    
  var usagePercent \= (totalCells / cellLimit) \* 100;  
  var msg \= \`🏥 System Health Report:\\n- จำนวนชีต: ${sheetCount}\\n- การใช้งาน: ${totalCells.toLocaleString()} Cells\\n- อัตราการใช้: ${usagePercent.toFixed(2)}%\`;  
    
  console.info(\`\[System Health\] Usage: ${usagePercent.toFixed(2)}% (${totalCells}/${cellLimit} cells)\`);  
    
  if (usagePercent \> 80\) {  
    var warn \= \`⚠️ CRITICAL WARNING: ไฟล์ใกล้เต็มแล้ว\!\\n\\nการใช้งานปัจจุบันอยู่ที่ ${usagePercent.toFixed(2)}% (${totalCells.toLocaleString()} Cells)\\nกรุณารันฟังก์ชันลบ Backup เก่า หรือย้ายข้อมูลไปยังไฟล์ใหม่ด่วนครับ\`;  
      
    // แจ้งเตือนฉุกเฉิน  
    sendLineNotify(warn, true);  
    sendTelegramNotify(warn);  
    SpreadsheetApp.getUi().alert("⚠️ SYSTEM ALERT", warn, SpreadsheetApp.getUi().ButtonSet.OK);  
  } else {  
    // ถ้ารันมือผ่านเมนู ให้โชว์ Toast  
    SpreadsheetApp.getActiveSpreadsheet().toast(\`System Health OK (${usagePercent.toFixed(1)}%)\`, "Health Check", 5);  
  }  
}

\`\`\`

\#\# 5\. \`Service\_Agent.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase D  
 \* \[Phase D\] เพิ่ม retrieveCandidateMasters\_() ก่อนส่ง AI  
 \* \[Phase D\] เพิ่ม confidence bands: auto-map / review / ignore  
 \* \[Phase D\] เพิ่ม AI audit logging  
 \*/

var AGENT\_CONFIG \= {  
  NAME:       "Logistics\_Agent\_01",  
  MODEL:      (typeof CONFIG \!== 'undefined' && CONFIG.AI\_MODEL) ? CONFIG.AI\_MODEL : "gemini-1.5-flash",  
  BATCH\_SIZE: (typeof CONFIG \!== 'undefined' && CONFIG.AI\_BATCH\_SIZE) ? CONFIG.AI\_BATCH\_SIZE : 20,  
  TAG:        "\[Agent\_V4\]"  
};

// \==========================================  
// 1\. AGENT TRIGGERS  
// \==========================================

function WAKE\_UP\_AGENT() {  
  SpreadsheetApp.getUi().toast("🕵️ Agent: กำลังเริ่มวิเคราะห์...", "AI Agent Started");  
  try {  
    processAIIndexing\_Batch();  
    SpreadsheetApp.getUi().alert("✅ Agent รายงานผล:\\nวิเคราะห์ข้อมูลชุดล่าสุดเสร็จสิ้น");  
  } catch(e) {  
    SpreadsheetApp.getUi().alert("❌ Agent Error: " \+ e.message);  
  }  
}

function SCHEDULE\_AGENT\_WORK() {  
  var triggers \= ScriptApp.getProjectTriggers();  
  for (var i \= 0; i \< triggers.length; i++) {  
    if (triggers\[i\].getHandlerFunction() \=== "runAgentLoop") {  
      ScriptApp.deleteTrigger(triggers\[i\]);  
    }  
  }  
  ScriptApp.newTrigger("autoPilotRoutine").timeBased().everyMinutes(10).create();  
  SpreadsheetApp.getUi().alert("✅ ตั้งค่าเรียบร้อย\!\\nระบบจะทำงานทุก 10 นาที");  
}

// \==========================================  
// 2\. \[Phase D NEW\] RETRIEVAL HELPER  
// \==========================================

/\*\*  
 \* retrieveCandidateMasters\_()  
 \* คัด top-N candidates ที่เกี่ยวข้องก่อนส่ง AI  
 \* แทน slice(0, 500\) แบบตัดตรง  
 \*/  
function retrieveCandidateMasters\_(unknownName, dbRows, mapRows, limit) {  
  var normUnknown \= normalizeText(unknownName);  
  var tokens      \= normUnknown.split(/\\s+/).filter(function(t) { return t.length \> 1; });  
  var scored      \= \[\];

  dbRows.forEach(function(r) {  
    var obj \= dbRowToObject(r);  
    if (\!obj.name || \!obj.uuid) return;  
    if (obj.recordStatus \=== "Inactive" || obj.recordStatus \=== "Merged") return;

    var normName \= normalizeText(obj.name);  
    var score    \= 0;

    // exact match  
    if (normName \=== normUnknown) score \+= 100;

    // token overlap  
    tokens.forEach(function(token) {  
      if (normName.indexOf(token) \> \-1) score \+= 10;  
    });

    // partial prefix match  
    if (normName.indexOf(normUnknown.substring(0, 3)) \> \-1) score \+= 5;

    if (score \> 0\) scored.push({ uid: obj.uuid, name: obj.name, score: score });  
  });

  // เพิ่ม alias matches  
  if (mapRows && mapRows.length \> 0\) {  
    mapRows.forEach(function(r) {  
      var mapObj \= mapRowToObject(r);  
      if (\!mapObj || \!mapObj.uid) return;  
      var normVariant \= normalizeText(mapObj.variant || "");  
      var score       \= 0;  
      if (normVariant \=== normUnknown) score \+= 80;  
      tokens.forEach(function(token) {  
        if (normVariant.indexOf(token) \> \-1) score \+= 8;  
      });  
      if (score \> 0\) scored.push({ uid: mapObj.uid, name: mapObj.variant, score: score });  
    });  
  }

  // sort by score desc แล้วตัด limit  
  scored.sort(function(a, b) { return b.score \- a.score; });

  // dedupe by uid  
  var seen   \= new Set();  
  var result \= \[\];  
  scored.forEach(function(item) {  
    if (\!seen.has(item.uid) && result.length \< (limit || AI\_CONFIG.RETRIEVAL\_LIMIT)) {  
      seen.add(item.uid);  
      result.push({ uid: item.uid, name: item.name });  
    }  
  });

  return result;  
}

// \==========================================  
// 3\. TIER 4: SMART RESOLUTION  
// \==========================================

function resolveUnknownNamesWithAI() {  
  var ss        \= SpreadsheetApp.getActiveSpreadsheet();  
  var dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  var dbSheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var mapSheet  \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);

  if (\!dataSheet || \!dbSheet || \!mapSheet) return;

  var lock \= LockService.getScriptLock();  
  if (\!lock.tryLock(30000)) {  
    SpreadsheetApp.getUi().alert("⚠️ ระบบคิวทำงาน", "กรุณารอสักครู่", SpreadsheetApp.getUi().ButtonSet.OK);  
    return;  
  }

  try {  
    console.time("SmartResolution\_Time");

    // หาชื่อที่ยังไม่มีพิกัด  
    var dLastRow \= dataSheet.getLastRow();  
    if (dLastRow \< 2\) return;

    var dataValues   \= dataSheet.getRange(2, 1, dLastRow \- 1, CONFIG.DATA\_TOTAL\_COLS).getValues();  
    var unknownNames \= new Set();

    dataValues.forEach(function(r) {  
      var job \= dailyJobRowToObject(r);  
      if (job.shipToName && \!job.latLngActual) {  
        unknownNames.add(job.shipToName);  
      }  
    });

    var unknownsArray \= Array.from(unknownNames).slice(0, AGENT\_CONFIG.BATCH\_SIZE);  
    if (unknownsArray.length \=== 0\) {  
      SpreadsheetApp.getUi().alert("ℹ️ AI Standby: ไม่มีรายชื่อตกหล่น");  
      return;  
    }

    // \[Phase D\] โหลด DB \+ Map rows สำหรับ retrieval  
    var mLastRow \= dbSheet.getLastRow();  
    var dbRows   \= dbSheet.getRange(2, 1, mLastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
    var mapRows  \= loadNameMappingRows\_();

    // \[Phase D\] โหลด UUID state map  
    var uuidStateMap \= buildUUIDStateMap\_();

    var apiKey \= CONFIG.GEMINI\_API\_KEY;

    var autoMapped  \= \[\];  // confidence \>= 90  
    var reviewItems \= \[\];  // confidence 70-89  
    var ts          \= new Date();  
    var auditLog    \= \[\];  // \[Phase D\] audit trail

    unknownsArray.forEach(function(unknownName) {  
      // \[Phase D\] retrieval ก่อน AI  
      var candidates \= retrieveCandidateMasters\_(unknownName, dbRows, mapRows, AI\_CONFIG.RETRIEVAL\_LIMIT);

      if (candidates.length \=== 0\) {  
        console.log("\[resolveUnknownNamesWithAI\] '" \+ unknownName \+ "': no candidates found");  
        return;  
      }

      SpreadsheetApp.getActiveSpreadsheet().toast(  
        "กำลัง AI วิเคราะห์: " \+ unknownName, "🤖 Tier 4 AI", 5  
      );

      var prompt \=  
        "You are an expert Thai Logistics Data Analyst.\\n" \+  
        "Match this unknown delivery name to the most likely entry in the candidate list.\\n" \+  
        "If confidence \< 60%, do not match.\\n" \+  
        "Prompt-Version: " \+ AI\_CONFIG.PROMPT\_VERSION \+ "\\n\\n" \+  
        "Unknown Name: " \+ JSON.stringify(normalizeText(unknownName)) \+ "\\n" \+  
        "Candidates: " \+ JSON.stringify(candidates) \+ "\\n\\n" \+  
        "Output ONLY a JSON object: { \\"uid\\": \\"matched UID\\", \\"confidence\\": 95 }\\n" \+  
        "Or if no match: { \\"uid\\": null, \\"confidence\\": 0 }";

      var payload \= {  
        "contents": \[{ "parts": \[{ "text": prompt }\] }\],  
        "generationConfig": { "responseMimeType": "application/json", "temperature": 0.1 }  
      };

      try {  
        var response \= UrlFetchApp.fetch(  
          "https://generativelanguage.googleapis.com/v1beta/models/" \+  
          AGENT\_CONFIG.MODEL \+ ":generateContent?key=" \+ apiKey,  
          { "method": "post", "contentType": "application/json",  
            "payload": JSON.stringify(payload), "muteHttpExceptions": true }  
        );

        var statusCode \= response.getResponseCode();

        // \[Phase D\] parse guard  
        if (statusCode \!== 200\) {  
          console.warn("\[resolveUnknownNamesWithAI\] HTTP " \+ statusCode \+ " for '" \+ unknownName \+ "'");  
          return;  
        }

        var json \= JSON.parse(response.getContentText());

        if (\!json.candidates || \!json.candidates\[0\] ||  
            \!json.candidates\[0\].content || \!json.candidates\[0\].content.parts) {  
          console.warn("\[resolveUnknownNamesWithAI\] Invalid structure for '" \+ unknownName \+ "'");  
          return;  
        }

        var result     \= JSON.parse(json.candidates\[0\].content.parts\[0\].text);  
        var matchedUid \= result.uid;  
        var confidence \= result.confidence || 0;

        // \[Phase D\] audit log  
        auditLog.push({  
          unknownName:     unknownName,  
          candidateCount:  candidates.length,  
          chosenUid:       matchedUid,  
          confidence:      confidence,  
          promptVersion:   AI\_CONFIG.PROMPT\_VERSION,  
          model:           AGENT\_CONFIG.MODEL,  
          timestamp:       ts  
        });

        if (\!matchedUid || confidence \< AI\_CONFIG.THRESHOLD\_IGNORE) {  
          console.log("\[resolveUnknownNamesWithAI\] '" \+ unknownName \+ "': confidence " \+ confidence \+ " \< threshold → ignore");  
          return;  
        }

        // \[Phase D\] resolve canonical UUID ก่อน write  
        var canonicalUid \= resolveUUIDFromMap\_(matchedUid, uuidStateMap);  
        if (\!canonicalUid || \!isActiveFromMap\_(canonicalUid, uuidStateMap)) {  
          console.warn("\[resolveUnknownNamesWithAI\] '" \+ unknownName \+ "': canonical UUID inactive → skip");  
          return;  
        }

        // \[Phase D\] Confidence bands  
        if (confidence \>= AI\_CONFIG.THRESHOLD\_AUTO\_MAP) {  
          // auto-map ทันที  
          autoMapped.push(mapObjectToRow({  
            variant:    unknownName,  
            uid:        canonicalUid,  
            confidence: confidence,  
            mappedBy:   "AI\_Agent\_" \+ AI\_CONFIG.PROMPT\_VERSION,  
            timestamp:  ts  
          }));  
          console.log("\[resolveUnknownNamesWithAI\] AUTO-MAP: '" \+ unknownName \+  
                      "' → " \+ canonicalUid.substring(0, 8\) \+ "... (conf: " \+ confidence \+ ")");

        } else if (confidence \>= AI\_CONFIG.THRESHOLD\_REVIEW) {  
          // ส่งเข้า review  
          reviewItems.push(mapObjectToRow({  
            variant:    unknownName,  
            uid:        canonicalUid,  
            confidence: confidence,  
            mappedBy:   "AI\_REVIEW\_PENDING",  
            timestamp:  ts  
          }));  
          console.log("\[resolveUnknownNamesWithAI\] REVIEW: '" \+ unknownName \+  
                      "' → " \+ canonicalUid.substring(0, 8\) \+ "... (conf: " \+ confidence \+ ")");  
        }

      } catch(e) {  
        console.error("\[resolveUnknownNamesWithAI\] Error for '" \+ unknownName \+ "': " \+ e.message);  
      }  
    });

    // \[Phase D\] audit log summary  
    console.log("\[resolveUnknownNamesWithAI\] Audit log: " \+ JSON.stringify(auditLog));

    // เขียน auto-mapped  
    if (autoMapped.length \> 0\) {  
      appendNameMappings\_(autoMapped);  
      if (typeof clearSearchCache \=== 'function') clearSearchCache();  
      if (typeof applyMasterCoordinatesToDailyJob \=== 'function') applyMasterCoordinatesToDailyJob();  
    }

    // เขียน review items (confidence band 70-89)  
    if (reviewItems.length \> 0\) {  
      appendNameMappings\_(reviewItems);  
      console.log("\[resolveUnknownNamesWithAI\] Review items written: " \+ reviewItems.length);  
    }

    var msg \= "✅ AI ทำงานเสร็จสิ้น\!\\n\\n" \+  
              "🔍 วิเคราะห์: "       \+ unknownsArray.length \+ " รายชื่อ\\n" \+  
              "✅ Auto-mapped (≥90): " \+ autoMapped.length   \+ " รายการ\\n" \+  
              "👀 Review (70-89): "   \+ reviewItems.length   \+ " รายการ\\n" \+  
              "❌ Ignored (\<70): "    \+  
              (unknownsArray.length \- autoMapped.length \- reviewItems.length) \+ " รายการ";

    SpreadsheetApp.getUi().alert(msg);

  } catch(e) {  
    console.error("\[resolveUnknownNamesWithAI\] CRITICAL: " \+ e.message);  
    SpreadsheetApp.getUi().alert("❌ เกิดข้อผิดพลาด: " \+ e.message);  
  } finally {  
    lock.releaseLock();  
    console.timeEnd("SmartResolution\_Time");  
  }  
}

function askGeminiToPredictTypos(originalName) {  
  var prompt \=  
    "Task: Thai Logistics Search Agent.\\n" \+  
    "Input: \\"" \+ originalName \+ "\\"\\n" \+  
    "Goal: Generate keywords including typos, phonetics, abbreviations.\\n" \+  
    "Prompt-Version: " \+ AI\_CONFIG.PROMPT\_VERSION \+ "\\n" \+  
    "Output: JSON Array of Strings ONLY.";

  var payload \= {  
    "contents": \[{ "parts": \[{ "text": prompt }\] }\],  
    "generationConfig": { "responseMimeType": "application/json", "temperature": 0.4 }  
  };

  var response \= UrlFetchApp.fetch(  
    "https://generativelanguage.googleapis.com/v1beta/models/" \+  
    AGENT\_CONFIG.MODEL \+ ":generateContent?key=" \+ CONFIG.GEMINI\_API\_KEY,  
    { "method": "post", "contentType": "application/json",  
      "payload": JSON.stringify(payload), "muteHttpExceptions": true }  
  );

  if (response.getResponseCode() \!== 200\) return "";

  var json \= JSON.parse(response.getContentText());  
  if (\!json.candidates || \!json.candidates\[0\] ||  
      \!json.candidates\[0\].content) return "";

  var text     \= json.candidates\[0\].content.parts\[0\].text;  
  var keywords \= JSON.parse(text);  
  return Array.isArray(keywords) ? keywords.join(" ") : "";  
}

\`\`\`

\#\# 6\. \`Service\_AutoPilot.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase D  
 \* \[Phase D\] เพิ่ม parse guard, prompt versioning, AI response logging  
 \* \[Phase D\] แยก concern: normalization (deterministic) vs AI enrichment (probabilistic)  
 \*/

function START\_AUTO\_PILOT() {  
  STOP\_AUTO\_PILOT();  
  ScriptApp.newTrigger("autoPilotRoutine").timeBased().everyMinutes(10).create();  
  var ui \= SpreadsheetApp.getUi();  
  if (ui) ui.alert("▶️ AI Auto-Pilot: ACTIVATE\\nระบบสมองกลจะทำงานเบื้องหลังทุกๆ 10 นาทีครับ");  
}

function STOP\_AUTO\_PILOT() {  
  var triggers \= ScriptApp.getProjectTriggers();  
  for (var i \= 0; i \< triggers.length; i++) {  
    if (triggers\[i\].getHandlerFunction() \=== "autoPilotRoutine") {  
      ScriptApp.deleteTrigger(triggers\[i\]);  
    }  
  }  
}

function autoPilotRoutine() {  
  var lock \= LockService.getScriptLock();  
  if (\!lock.tryLock(10000)) {  
    console.warn("\[AutoPilot\] Skipped: มี instance อื่นกำลังรันอยู่");  
    return;  
  }  
  try {  
    console.time("AutoPilot\_Duration");  
    console.info("\[AutoPilot\] 🚀 Starting routine...");

    try {  
      if (typeof applyMasterCoordinatesToDailyJob \=== 'function') {  
        var ss        \= SpreadsheetApp.getActiveSpreadsheet();  
        var dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
        if (dataSheet && dataSheet.getLastRow() \> 1\) {  
          applyMasterCoordinatesToDailyJob();  
          console.log("✅ AutoPilot: SCG Sync Completed");  
        }  
      }  
    } catch(e) { console.error("\[AutoPilot\] SCG Sync Error: " \+ e.message); }

    try { processAIIndexing\_Batch(); }  
    catch(e) { console.error("\[AutoPilot\] AI Indexing Error: " \+ e.message); }

    console.timeEnd("AutoPilot\_Duration");  
    console.info("\[AutoPilot\] 🏁 Routine finished.");  
  } catch(e) {  
    console.error("\[AutoPilot\] CRITICAL Error: " \+ e.message);  
  } finally {  
    lock.releaseLock();  
  }  
}

function processAIIndexing\_Batch() {  
  var apiKey;  
  try { apiKey \= CONFIG.GEMINI\_API\_KEY; }  
  catch(e) { console.warn("⚠️ SKIPPED AI: " \+ e.message); return; }

  var ss    \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) return;

  var lastRow \= typeof getRealLastRow\_ \=== 'function'  
    ? getRealLastRow\_(sheet, CONFIG.COL\_NAME)  
    : sheet.getLastRow();  
  if (lastRow \< 2\) return;

  var rangeName \= sheet.getRange(2, CONFIG.COL\_NAME,       lastRow \- 1, 1);  
  var rangeNorm \= sheet.getRange(2, CONFIG.COL\_NORMALIZED, lastRow \- 1, 1);

  var nameValues \= rangeName.getValues();  
  var normValues \= rangeNorm.getValues();

  var aiCount  \= 0;  
  var AI\_LIMIT \= CONFIG.AI\_BATCH\_SIZE || 20;  
  var updated  \= false;

  for (var i \= 0; i \< nameValues.length; i++) {  
    if (aiCount \>= AI\_LIMIT) break;

    var name        \= nameValues\[i\]\[0\];  
    var currentNorm \= normValues\[i\]\[0\];

    if (name && typeof name \=== 'string' &&  
        (\!currentNorm || currentNorm.toString().indexOf(AI\_CONFIG.TAG\_AI) \=== \-1)) {

      // \[Phase D\] deterministic part — ไม่ขึ้นกับ AI  
      var basicKey \= createBasicSmartKey(name);

      // \[Phase D\] probabilistic part — ขึ้นกับ AI  
      var aiKeywords \= "";  
      if (name.length \> 3\) {  
        aiKeywords \= genericRetry(function() {  
          return callGeminiThinking\_JSON(name, apiKey);  
        }, 2);  
      }

      // \[Phase D\] เพิ่ม prompt version tag  
      var finalString \= basicKey \+  
                        (aiKeywords ? " " \+ aiKeywords : "") \+  
                        " " \+ AI\_CONFIG.TAG\_AI \+  
                        " \[" \+ AI\_CONFIG.PROMPT\_VERSION \+ "\]";

      normValues\[i\]\[0\] \= finalString.trim();

      console.log("\[AI Indexing\] (" \+ (aiCount \+ 1\) \+ "/" \+ AI\_LIMIT \+ ") " \+  
                  name \+ " → " \+ (aiKeywords || "basic only"));  
      aiCount++;  
      updated \= true;  
    }  
  }

  if (updated) {  
    rangeNorm.setValues(normValues);  
    console.log("✅ \[AI Indexing\] Batch write: " \+ aiCount \+ " records updated");  
  } else {  
    console.log("ℹ️ \[AI Indexing\] ไม่มีข้อมูลใหม่ที่ต้องประมวลผล");  
  }  
}

/\*\*  
 \* \[Phase D\] callGeminiThinking\_JSON()  
 \* เพิ่ม parse guard ป้องกัน silent fail  
 \*/  
function callGeminiThinking\_JSON(customerName, apiKey) {  
  try {  
    var model  \= CONFIG.AI\_MODEL || "gemini-1.5-flash";  
    var apiUrl \= "https://generativelanguage.googleapis.com/v1beta/models/" \+  
                 model \+ ":generateContent?key=" \+ apiKey;

    var prompt \=  
      "Task: Analyze this Thai logistics customer name: \\"" \+ customerName \+ "\\"\\n" \+  
      "Goal: Return a JSON list of search keywords, abbreviations, and common typos.\\n" \+  
      "Requirements:\\n" \+  
      "1. If English, provide Thai phonetics.\\n" \+  
      "2. If Thai abbreviation, provide full text.\\n" \+  
      "3. No generic words: Company, Limited, จำกัด, บริษัท\\n" \+  
      "4. Max 5 keywords.\\n" \+  
      "Prompt-Version: " \+ AI\_CONFIG.PROMPT\_VERSION \+ "\\n" \+  
      "Output Format: JSON Array of Strings ONLY.";

    var payload \= {  
      "contents": \[{ "parts": \[{ "text": prompt }\] }\],  
      "generationConfig": { "responseMimeType": "application/json" }  
    };

    var response   \= UrlFetchApp.fetch(apiUrl, {  
      "method": "post",  
      "contentType": "application/json",  
      "payload": JSON.stringify(payload),  
      "muteHttpExceptions": true  
    });

    var statusCode \= response.getResponseCode();

    // \[Phase D\] ตรวจ HTTP status ก่อน parse  
    if (statusCode \!== 200\) {  
      console.warn("\[callGeminiThinking\_JSON\] HTTP " \+ statusCode \+  
                   " for '" \+ customerName \+ "': " \+ response.getContentText().substring(0, 100));  
      return "";  
    }

    var json \= JSON.parse(response.getContentText());

    // \[Phase D\] parse guard — ตรวจ structure ก่อนใช้  
    if (\!json.candidates || \!Array.isArray(json.candidates) || json.candidates.length \=== 0\) {  
      console.warn("\[callGeminiThinking\_JSON\] No candidates for '" \+ customerName \+ "'");  
      return "";  
    }

    var content \= json.candidates\[0\].content;  
    if (\!content || \!content.parts || \!content.parts\[0\] || \!content.parts\[0\].text) {  
      console.warn("\[callGeminiThinking\_JSON\] Invalid response structure for '" \+ customerName \+ "'");  
      return "";  
    }

    var text     \= content.parts\[0\].text;  
    var keywords \= JSON.parse(text);

    // \[Phase D\] ตรวจว่าเป็น array จริงๆ  
    if (\!Array.isArray(keywords)) {  
      console.warn("\[callGeminiThinking\_JSON\] Response is not array for '" \+ customerName \+ "'");  
      return "";  
    }

    return keywords.join(" ");

  } catch(e) {  
    console.warn("\[callGeminiThinking\_JSON\] Error (" \+ customerName \+ "): " \+ e.message);  
    return "";  
  }  
}

function createBasicSmartKey(text) {  
  if (\!text) return "";  
  return typeof normalizeText \=== 'function'  
    ? normalizeText(text)  
    : text.toString().toLowerCase().replace(/\\s/g, "");  
}

\`\`\`

\#\# 7\. \`Service\_GPSFeedback.gs\`

\`\`\`javascript  
function createGPSQueueSheet() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
    
  // เช็คว่ามีอยู่แล้วไหม  
  if (ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE)) {  
    ui.alert("ℹ️ ชีต GPS\_Queue มีอยู่แล้วครับ");  
    return;  
  }  
    
  // สร้างชีตใหม่  
  var sheet \= ss.insertSheet(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
    
  // สร้าง Header  
  var headers \= \[  
    "Timestamp",       // A  
    "ShipToName",      // B  
    "UUID\_DB",         // C  
    "LatLng\_Driver",   // D  
    "LatLng\_DB",       // E  
    "Diff\_Meters",     // F  
    "Reason",          // G  
    "Approve",         // H  
    "Reject"           // I  
  \];  
    
  // ตั้งค่า Header  
  var headerRange \= sheet.getRange(1, 1, 1, headers.length);  
  headerRange.setValues(\[headers\]);  
  headerRange.setFontWeight("bold");  
  headerRange.setBackground("\#4f46e5");  
  headerRange.setFontColor("white");  
    
  // เพิ่ม Checkbox ใน Col H และ I สำหรับ 500 แถว  
  sheet.getRange(2, 8, 500, 1).insertCheckboxes();  
  sheet.getRange(2, 9, 500, 1).insertCheckboxes();  
    
  // ปรับความกว้างคอลัมน์  
  sheet.setColumnWidth(1, 160);  // Timestamp  
  sheet.setColumnWidth(2, 250);  // ShipToName  
  sheet.setColumnWidth(3, 280);  // UUID\_DB  
  sheet.setColumnWidth(4, 160);  // LatLng\_Driver  
  sheet.setColumnWidth(5, 160);  // LatLng\_DB  
  sheet.setColumnWidth(6, 100);  // Diff\_Meters  
  sheet.setColumnWidth(7, 120);  // Reason  
  sheet.setColumnWidth(8, 80);   // Approve  
  sheet.setColumnWidth(9, 80);   // Reject  
    
  // Freeze header  
  sheet.setFrozenRows(1);  
    
  SpreadsheetApp.flush();  
    
  ui.alert("✅ สร้างชีต GPS\_Queue สำเร็จแล้วครับ\\nพร้อมใช้งาน");  
}

function resetSyncStatus() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SOURCE\_SHEET);  
    
  var lastRow \= sheet.getLastRow();  
  var syncCol \= SCG\_CONFIG.SRC\_IDX\_SYNC\_STATUS;  
    
  var result \= ui.alert(  
    "⚠️ Reset SYNC\_STATUS?",  
    "จะล้าง SYNCED ทั้งหมด " \+ (lastRow \- 1\) \+ " แถว\\n" \+  
    "เพื่อให้ระบบประมวลผลใหม่ทั้งหมด\\n\\n" \+  
    "ใช้สำหรับทดสอบเท่านั้น ยืนยันหรือไม่?",  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (result \!== ui.Button.YES) return;  
    
  sheet.getRange(2, syncCol, lastRow \- 1, 1).clearContent();  
  SpreadsheetApp.flush();  
    
  console.log("✅ Reset เรียบร้อย พร้อมรัน syncNewDataToMaster() ใหม่");  
  ui.alert("✅ Reset เรียบร้อยแล้วครับ");  
}

/\*\*  
 \* \[Phase A FIXED\] applyApprovedFeedback()  
 \* เพิ่ม REJECTED path, CONFLICT detection, batch write DB  
 \*/  
function applyApprovedFeedback() {  
  var ss  \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui  \= SpreadsheetApp.getUi();

  var queueSheet  \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
  var masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);

  if (\!queueSheet || \!masterSheet) {  
    ui.alert("❌ ไม่พบชีต GPS\_Queue หรือ Database");  
    return;  
  }

  var lock \= LockService.getScriptLock();  
  if (\!lock.tryLock(30000)) {  
    ui.alert("⚠️ ระบบคิวทำงาน", "มีผู้ใช้งานอื่นกำลังใช้งานอยู่ กรุณารอสักครู่", ui.ButtonSet.OK);  
    return;  
  }

  try { preCheck\_Approve(); } catch(e) {  
    lock.releaseLock();  
    ui.alert("❌ Schema Error", e.message, ui.ButtonSet.OK);  
    return;  
  }

  try {  
    console.log("\[applyApprovedFeedback\] START — Phase A Fixed");

    var lastQueueRow \= getRealLastRow\_(queueSheet, 1);  
    if (lastQueueRow \< 2\) { ui.alert("ℹ️ ไม่มีรายการใน GPS\_Queue"); return; }

    var queueData \= queueSheet.getRange(2, 1, lastQueueRow \- 1, CONFIG.GPS\_QUEUE\_TOTAL\_COLS).getValues();

    // โหลด DB UUID map  
    var lastRowM \= getRealLastRow\_(masterSheet, CONFIG.COL\_NAME);  
    var dbData   \= masterSheet.getRange(2, 1, lastRowM \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
    var uuidMap  \= {};  
    dbData.forEach(function(r, i) {  
      if (r\[CONFIG.C\_IDX.UUID\]) uuidMap\[r\[CONFIG.C\_IDX.UUID\]\] \= i;  
    });

    // Counters  
    var counts \= { approved: 0, rejected: 0, conflict: 0, skipped: 0, alreadyDone: 0 };  
    var ts     \= new Date();

    // รวม updates ไว้เขียน batch  
    var dbRowUpdates       \= {};  
    var queueReasonUpdates \= \[\];

    queueData.forEach(function(row, i) {  
      var isApproved \= row\[7\];  
      var isRejected \= row\[8\];  
      var reason     \= (row\[6\] || "").toString();

      // ข้ามที่ดำเนินการแล้ว  
      if (reason \=== "APPROVED" || reason \=== "REJECTED" || reason \=== "CONFLICT") {  
        counts.alreadyDone++;  
        return;  
      }

      // \[Phase A NEW\] Conflict Detection  
      if (isApproved \=== true && isRejected \=== true) {  
        counts.conflict++;  
        queueReasonUpdates.push({ rowNum: i \+ 2, reason: "CONFLICT" });  
        console.warn("\[applyApprovedFeedback\] CONFLICT แถว " \+ (i \+ 2));  
        return;  
      }

      // \[Phase A NEW\] Reject Path  
      if (isRejected \=== true && isApproved \!== true) {  
        counts.rejected++;  
        queueReasonUpdates.push({ rowNum: i \+ 2, reason: "REJECTED" });  
        console.log("\[applyApprovedFeedback\] REJECTED แถว " \+ (i \+ 2\) \+ ": " \+ row\[1\]);  
        return;  
      }

      // Approve Path  
      if (isApproved \!== true) { counts.skipped++; return; }

      var uuid         \= (row\[2\] || "").toString();  
      var latLngDriver \= (row\[3\] || "").toString();  
      if (\!uuid || \!latLngDriver) { counts.skipped++; return; }

      var parts  \= latLngDriver.split(",");  
      if (parts.length \!== 2\) { counts.skipped++; return; }

      var newLat \= parseFloat(parts\[0\].trim());  
      var newLng \= parseFloat(parts\[1\].trim());  
      if (isNaN(newLat) || isNaN(newLng)) { counts.skipped++; return; }

      if (\!uuidMap.hasOwnProperty(uuid)) {  
        console.warn("\[applyApprovedFeedback\] UUID ไม่พบ: " \+ uuid);  
        counts.skipped++;  
        return;  
      }

      dbRowUpdates\[uuidMap\[uuid\]\] \= { lat: newLat, lng: newLng, ts: ts };  
      queueReasonUpdates.push({ rowNum: i \+ 2, reason: "APPROVED" });  
      counts.approved++;  
    });

    // \[Phase A NEW\] Batch write DB  
    if (Object.keys(dbRowUpdates).length \> 0\) {  
      var fullDb \= masterSheet.getRange(2, 1, lastRowM \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
      Object.keys(dbRowUpdates).forEach(function(idx) {  
        var upd \= dbRowUpdates\[idx\];  
        var i   \= parseInt(idx);  
        fullDb\[i\]\[CONFIG.C\_IDX.LAT\]                \= upd.lat;  
        fullDb\[i\]\[CONFIG.C\_IDX.LNG\]                \= upd.lng;  
        fullDb\[i\]\[CONFIG.C\_IDX.COORD\_SOURCE\]       \= "Driver\_GPS";  
        fullDb\[i\]\[CONFIG.C\_IDX.COORD\_CONFIDENCE\]   \= 95;  
        fullDb\[i\]\[CONFIG.C\_IDX.COORD\_LAST\_UPDATED\] \= upd.ts;  
        fullDb\[i\]\[CONFIG.C\_IDX.UPDATED\]            \= upd.ts;  
      });  
      masterSheet.getRange(2, 1, lastRowM \- 1, CONFIG.DB\_TOTAL\_COLS).setValues(fullDb);  
      console.log("\[applyApprovedFeedback\] Batch write: " \+ Object.keys(dbRowUpdates).length \+ " rows");  
    }

    // Write queue reasons  
    queueReasonUpdates.forEach(function(upd) {  
      queueSheet.getRange(upd.rowNum, 7).setValue(upd.reason);  
    });

    if (typeof clearSearchCache \=== 'function') clearSearchCache();  
    SpreadsheetApp.flush();

    var msg \= "✅ ดำเนินการเรียบร้อย\!\\n\\n" \+  
              "📍 APPROVED: "  \+ counts.approved   \+ " ราย\\n" \+  
              "❌ REJECTED: "  \+ counts.rejected   \+ " ราย\\n" \+  
              "⚠️ CONFLICT: "  \+ counts.conflict   \+ " ราย\\n" \+  
              "⏭️ ข้ามไป: "   \+ counts.skipped    \+ " ราย\\n" \+  
              "✅ ทำแล้ว: "    \+ counts.alreadyDone \+ " ราย";

    if (counts.conflict \> 0\) {  
      msg \+= "\\n\\n⚠️ พบ " \+ counts.conflict \+ " แถว CONFLICT\\n" \+  
             "กรุณาตรวจสอบและ reset checkbox ก่อนตัดสินใจใหม่ครับ";  
    }

    console.log("\[applyApprovedFeedback\] DONE — " \+ JSON.stringify(counts));  
    ui.alert(msg);

  } catch(e) {  
    console.error("\[applyApprovedFeedback\] Error: " \+ e.message);  
    ui.alert("❌ เกิดข้อผิดพลาด: " \+ e.message);  
  } finally {  
    lock.releaseLock();  
  }  
}

function showGPSQueueStats() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var queueSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
    
  if (\!queueSheet) {  
    ui.alert("❌ ไม่พบชีต GPS\_Queue\\nกรุณารัน 'สร้างชีต GPS\_Queue ใหม่' ก่อนครับ");  
    return;  
  }  
    
  var lastRow \= getRealLastRow\_(queueSheet, 1);  
  if (lastRow \< 2\) {  
    ui.alert("ℹ️ GPS\_Queue ว่างเปล่า ยังไม่มีรายการครับ");  
    return;  
  }  
    
  var data \= queueSheet.getRange(2, 1, lastRow \- 1, 9).getValues();  
    
  var stats \= {  
    total:    0,  
    pending:  0,  
    approved: 0,  
    rejected: 0,  
    gpsDiff:  0,  
    noGPS:    0  
  };  
    
  data.forEach(function(row) {  
    var reason   \= row\[6\]; // Col G  
    var approve  \= row\[7\]; // Col H  
    var reject   \= row\[8\]; // Col I  
      
    // นับเฉพาะแถวที่มีข้อมูลจริง  
    if (\!row\[0\]) return;  
    stats.total++;  
      
    if (reason \=== "APPROVED")       stats.approved++;  
    else if (reason \=== "REJECTED")  stats.rejected++;  
    else if (approve)                stats.approved++;  
    else if (reject)                 stats.rejected++;  
    else                             stats.pending++;  
      
    if (reason \=== "GPS\_DIFF")       stats.gpsDiff++;  
    else if (reason \=== "DB\_NO\_GPS") stats.noGPS++;  
  });  
    
  var msg \=   
    "📊 GPS Queue สถิติ\\n" \+  
    "━━━━━━━━━━━━━━━━━━━━━━━\\n" \+  
    "📋 รายการทั้งหมด: "  \+ stats.total    \+ " ราย\\n" \+  
    "⏳ รอตรวจสอบ: "      \+ stats.pending  \+ " ราย\\n" \+  
    "✅ อนุมัติแล้ว: "    \+ stats.approved \+ " ราย\\n" \+  
    "❌ ปฏิเสธแล้ว: "     \+ stats.rejected \+ " ราย\\n" \+  
    "━━━━━━━━━━━━━━━━━━━━━━━\\n" \+  
    "📍 พิกัดต่างกัน \> 50m: " \+ stats.gpsDiff \+ " ราย\\n" \+  
    "🔍 DB ไม่มีพิกัด: "      \+ stats.noGPS   \+ " ราย";  
    
  ui.alert(msg);  
}

function upgradeGPSQueueSheet() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
    
  if (\!sheet) {  
    ui.alert("❌ ไม่พบชีต GPS\_Queue ครับ");  
    return;  
  }  
    
  // 1\. ตรวจสอบ Header  
  var headers \= \[  
    "Timestamp",  
    "ShipToName",   
    "UUID\_DB",  
    "LatLng\_Driver",  
    "LatLng\_DB",  
    "Diff\_Meters",  
    "Reason",  
    "Approve",  
    "Reject"  
  \];  
    
  var headerRange \= sheet.getRange(1, 1, 1, headers.length);  
  headerRange.setValues(\[headers\]);  
  headerRange.setFontWeight("bold");  
  headerRange.setBackground("\#4f46e5");  
  headerRange.setFontColor("white");  
  headerRange.setFontSize(11);  
    
  // 2\. หาแถวข้อมูลจริง  
  var realLastRow \= getRealLastRow\_(sheet, 1);  
  console.log("แถวข้อมูลจริง: " \+ realLastRow);  
    
  // 3\. ลบ Checkbox เก่าออกทั้งหมดก่อน  
  var maxRow \= sheet.getMaxRows();  
  if (maxRow \> 1\) {  
    sheet.getRange(2, 8, maxRow \- 1, 2).clearContent();  
  }  
    
  // 4\. เพิ่ม Checkbox ใหม่ให้ครอบคลุมข้อมูล \+ เผื่อไว้ 1000 แถว  
  var checkboxEnd \= Math.max(realLastRow, 1\) \+ 1000;  
  sheet.getRange(2, 8, checkboxEnd, 1).insertCheckboxes(); // Approve  
  sheet.getRange(2, 9, checkboxEnd, 1).insertCheckboxes(); // Reject  
    
  // 5\. Format คอลัมน์  
  sheet.setColumnWidth(1, 160);  // Timestamp  
  sheet.setColumnWidth(2, 250);  // ShipToName  
  sheet.setColumnWidth(3, 280);  // UUID\_DB  
  sheet.setColumnWidth(4, 160);  // LatLng\_Driver  
  sheet.setColumnWidth(5, 160);  // LatLng\_DB  
  sheet.setColumnWidth(6, 110);  // Diff\_Meters  
  sheet.setColumnWidth(7, 120);  // Reason  
  sheet.setColumnWidth(8, 80);   // Approve  
  sheet.setColumnWidth(9, 80);   // Reject  
    
  // 6\. Format Diff\_Meters ให้แสดงเป็นตัวเลข  
  if (realLastRow \> 1\) {  
    sheet.getRange(2, 6, realLastRow \- 1, 1\)  
      .setNumberFormat("\#,\#\#0");  
  }  
    
  // 7\. Freeze Header  
  sheet.setFrozenRows(1);  
    
  // 8\. Color แถวตาม Reason  
  if (realLastRow \> 1\) {  
    var reasonData \= sheet.getRange(2, 7, realLastRow \- 1, 1).getValues();  
    reasonData.forEach(function(row, i) {  
      var rowNum \= i \+ 2;  
      var reason \= row\[0\];  
      var bg \= "\#ffffff";  
        
      if (reason \=== "GPS\_DIFF")   bg \= "\#fff3cd"; // เหลือง  
      if (reason \=== "DB\_NO\_GPS")  bg \= "\#f8d7da"; // แดง  
      if (reason \=== "NO\_MATCH")   bg \= "\#d1ecf1"; // ฟ้า  
      if (reason \=== "APPROVED")   bg \= "\#d4edda"; // เขียว  
      if (reason \=== "REJECTED")   bg \= "\#e2e3e5"; // เทา  
        
      sheet.getRange(rowNum, 1, 1, 9).setBackground(bg);  
    });  
  }  
    
  SpreadsheetApp.flush();  
    
  ui.alert(  
    "✅ อัปเกรด GPS\_Queue สำเร็จ\!\\n\\n" \+  
    "📋 แถวข้อมูลจริง: " \+ (realLastRow \- 1\) \+ " รายการ\\n" \+  
    "☑️ Checkbox: ครอบคลุมถึงแถว " \+ (realLastRow \+ 999\) \+ "\\n\\n" \+  
    "สีในชีต:\\n" \+  
    "🟡 เหลือง \= GPS ต่างกัน \> 50m\\n" \+  
    "🔴 แดง \= DB ไม่มีพิกัด\\n" \+  
    "🔵 ฟ้า \= Match ชื่อไม่เจอ\\n" \+  
    "🟢 เขียว \= อนุมัติแล้ว\\n" \+  
    "⚫ เทา \= ปฏิเสธแล้ว"  
  );  
}

\`\`\`

\#\# 8\. \`Service\_GeoAddr.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🌍 Service: Geo Address & Google Maps Formulas (Enterprise Edition)  
 \* Version: 4.0 Omni-Geo Engine & API Hardening  
 \* \-------------------------------------------------------  
 \* \[PRESERVED\]: Fully Integrated Google Maps Formulas by Amit Agarwal.  
 \* \[PRESERVED\]: 7 Custom Functions for Spreadsheet directly.  
 \* \[MODIFIED v4.0\]: Added Try-Catch to \_mapsSetCache to prevent 100KB limits crash.  
 \* \[MODIFIED v4.0\]: Enterprise Audit Logging (GCP Console) for API Failures.  
 \* \[MODIFIED v4.0\]: Enhanced regex in parseAddressFromText for better Tier 2 parsing.  
 \* \[FINAL POLISH\]: Bulletproof distance calculation (handling commas in API response).  
 \* Author: Elite Logistics Architect  
 \*/

// \==========================================  
// 1\. CONFIGURATION (Internal)  
// \==========================================

const POSTAL\_COL \= {  
  ZIP: 0,       // Col A (postcode)  
  DISTRICT: 2,  // Col C (district)  
  PROVINCE: 3   // Col D (province)  
};

var \_POSTAL\_CACHE \= null;

// \==========================================  
// 2\. 🧠 SMART ADDRESS PARSING LOGIC (Tier 2 Resolution)  
// \==========================================

/\*\*  
 \* แกะรหัสไปรษณีย์ จังหวัด และอำเภอ จากที่อยู่ดิบ  
 \*/  
function parseAddressFromText(fullAddress) {  
  var result \= { province: "", district: "", postcode: "" };  
  if (\!fullAddress) return result;  
    
  var addrStr \= fullAddress.toString().trim();  
    
  // 1\. หารหัสไปรษณีย์ก่อน (ตัวเลข 5 หลักติดกัน)  
  var zipMatch \= addrStr.match(/(\\d{5})/);  
  if (zipMatch && zipMatch\[1\]) {  
    result.postcode \= zipMatch\[1\];  
  }  
    
  // 2\. ลองหาจาก Database PostalRef (ถ้ามี)  
  var postalDB \= getPostalDataCached();  
  if (postalDB && result.postcode && postalDB.byZip\[result.postcode\]) {  
    var infoList \= postalDB.byZip\[result.postcode\];  
    if (infoList.length \> 0\) {  
       result.province \= infoList\[0\].province;  
       result.district \= infoList\[0\].district;  
       return result; // ถ้าเจอใน DB จบเลย แม่นยำสุด  
    }  
  }

  // 3\. FALLBACK: ถ้าไม่มี DB หรือหาไม่เจอ ให้ใช้ Regex แกะจาก Text ทันที (อัปเกรด Regex V4.0)  
  var provMatch \= addrStr.match(/(?:จ\\.|จังหวัด)\\s\*(\[ก-๙a-zA-Z0-9\]+)/i);  
  if (provMatch && provMatch\[1\]) {  
    result.province \= provMatch\[1\].trim();  
  }  
    
  var distMatch \= addrStr.match(/(?:อ\\.|อำเภอ|เขต)\\s\*(\[ก-๙a-zA-Z0-9\]+)/i);  
  if (distMatch && distMatch\[1\]) {  
    result.district \= distMatch\[1\].trim();  
  }

  // Fallback พิเศษสำหรับ กทม.  
  if (\!result.province && (addrStr.includes("กรุงเทพ") || addrStr.includes("Bangkok") || addrStr.includes("กทม"))) {  
    result.province \= "กรุงเทพมหานคร";  
  }

  return result;  
}

function getPostalDataCached() {  
  if (\_POSTAL\_CACHE) return \_POSTAL\_CACHE;  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= (typeof CONFIG \!== 'undefined' && CONFIG.SHEET\_POSTAL) ? CONFIG.SHEET\_POSTAL : "PostalRef";  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) return null;   
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return null;  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, sheet.getLastColumn()).getValues();  
  var db \= { byZip: {} };  
    
  data.forEach(function(row) {  
    if (row.length \<= POSTAL\_COL.PROVINCE) return;  
      
    var pc \= String(row\[POSTAL\_COL.ZIP\]).trim();   
    if (\!pc) return;

    if (\!db.byZip\[pc\]) db.byZip\[pc\] \= \[\];  
    db.byZip\[pc\].push({   
      postcode: pc,   
      district: row\[POSTAL\_COL.DISTRICT\],   
      province: row\[POSTAL\_COL.PROVINCE\]   
    });  
  });  
    
  \_POSTAL\_CACHE \= db;  
  return db;  
}  
/\*\*  
 \* \[NEW v4.1\] ล้าง Postal Cache อย่างปลอดภัย  
 \* เรียกจาก Menu.gs ผ่าน clearPostalCache\_UI()  
 \*/  
function clearPostalCache() {  
  \_POSTAL\_CACHE \= null;  
  console.log("\[Cache\] Postal Cache cleared.");  
}

// \==========================================  
// 3\. 🗺️ GOOGLE MAPS FORMULAS (Amit Agarwal)  
// \==========================================

const \_mapsMd5 \= (key \= "") \=\> {  
  const code \= key.toLowerCase().replace(/\\s/g, "");  
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, key)  
    .map((char) \=\> (char \+ 256).toString(16).slice(-2))  
    .join("");  
};

const \_mapsGetCache \= (key) \=\> {  
  try {  
    return CacheService.getDocumentCache().get(\_mapsMd5(key));  
  } catch(e) {  
    return null;  
  }  
};

/\*\*  
 \* \[MODIFIED v4.0\]: ป้องกัน Error กรณี String ของ Maps Directions เกิน 100KB  
 \*/  
const \_mapsSetCache \= (key, value) \=\> {  
  try {  
    const expirationInSeconds \= (typeof CONFIG \!== 'undefined' && CONFIG.CACHE\_EXPIRATION) ? CONFIG.CACHE\_EXPIRATION : 21600; // 6 hours  
    if (value && value.toString().length \< 90000\) {   
       CacheService.getDocumentCache().put(\_mapsMd5(key), value, expirationInSeconds);  
    }  
  } catch (e) {  
    console.warn("\[Geo Cache Warn\]: Could not cache key " \+ key \+ " \- " \+ e.message);  
  }  
};

/\*\*  
 \* 2.3 Calculate the travel time between two locations on Google Maps.  
 \* @customFunction  
 \*/  
const GOOGLEMAPS\_DURATION \= (origin, destination, mode \= "driving") \=\> {  
  if (\!origin || \!destination) throw new Error("No address specified\!");  
  if (origin.map) return origin.map(o \=\> GOOGLEMAPS\_DURATION(o, destination, mode));  
    
  const key \= \["duration", origin, destination, mode\].join(",");  
  const value \= \_mapsGetCache(key);  
  if (value \!== null) return value;

  Utilities.sleep(150); // API Throttling protection  
  const { routes: \[data\] \= \[\] } \= Maps.newDirectionFinder()  
    .setOrigin(origin)  
    .setDestination(destination)  
    .setMode(mode)  
    .getDirections();  
    
  if (\!data) throw new Error("No route found\!");  
    
  const { legs: \[{ duration: { text: time } } \= {}\] \= \[\] } \= data;  
  \_mapsSetCache(key, time);  
  return time;  
};

/\*\*  
 \* 2.1 Calculate the distance between two locations on Google Maps.  
 \* @customFunction  
 \*/  
const GOOGLEMAPS\_DISTANCE \= (origin, destination, mode \= "driving") \=\> {  
  if (\!origin || \!destination) throw new Error("No address specified\!");  
  if (origin.map) return origin.map(o \=\> GOOGLEMAPS\_DISTANCE(o, destination, mode));  
    
  const key \= \["distance", origin, destination, mode\].join(",");  
  const value \= \_mapsGetCache(key);  
  if (value \!== null) return value;

  Utilities.sleep(150);  
  const { routes: \[data\] \= \[\] } \= Maps.newDirectionFinder()  
    .setOrigin(origin)  
    .setDestination(destination)  
    .setMode(mode)  
    .getDirections();  
      
  if (\!data) throw new Error("No route found\!");  
    
  const { legs: \[{ distance: { text: distance } } \= {}\] \= \[\] } \= data;  
  \_mapsSetCache(key, distance);  
  return distance;  
};

/\*\*  
 \* 2.4 Get the latitude and longitude of any address on Google Maps.  
 \* @customFunction  
 \*/  
const GOOGLEMAPS\_LATLONG \= (address) \=\> {  
  if (\!address) throw new Error("No address specified\!");  
  if (address.map) return address.map(a \=\> GOOGLEMAPS\_LATLONG(a));  
    
  const key \= \["latlong", address\].join(",");  
  const value \= \_mapsGetCache(key);  
  if (value \!== null) return value;

  Utilities.sleep(150);  
  const { results: \[data \= null\] \= \[\] } \= Maps.newGeocoder().geocode(address);  
  if (data \=== null) throw new Error("Address not found\!");  
    
  const { geometry: { location: { lat, lng } } \= {} } \= data;  
  const answer \= \`${lat}, ${lng}\`;  
  \_mapsSetCache(key, answer);  
  return answer;  
};

/\*\*  
 \* 2.5 Get the full address of any zip code or partial address on Google Maps.  
 \* @customFunction  
 \*/  
const GOOGLEMAPS\_ADDRESS \= (address) \=\> {  
  if (\!address) throw new Error("No address specified\!");  
  if (address.map) return address.map(a \=\> GOOGLEMAPS\_ADDRESS(a));  
    
  const key \= \["address", address\].join(",");  
  const value \= \_mapsGetCache(key);  
  if (value \!== null) return value;

  Utilities.sleep(150);  
  const { results: \[data \= null\] \= \[\] } \= Maps.newGeocoder().geocode(address);  
  if (data \=== null) throw new Error("Address not found\!");  
    
  const { formatted\_address } \= data;  
  \_mapsSetCache(key, formatted\_address);  
  return formatted\_address;  
};

/\*\*  
 \* 2.2 Use Reverse Geocoding to get the address of a point location.  
 \* @customFunction  
 \*/  
const GOOGLEMAPS\_REVERSEGEOCODE \= (latitude, longitude) \=\> {  
  if (\!latitude || \!longitude) throw new Error("Lat/Lng not specified\!");  
    
  const key \= \["reverse", latitude, longitude\].join(",");  
  const value \= \_mapsGetCache(key);  
  if (value \!== null) return value;

  Utilities.sleep(150);  
  const { results: \[data \= {}\] \= \[\] } \= Maps.newGeocoder().reverseGeocode(latitude, longitude);  
  const { formatted\_address } \= data;  
  if (\!formatted\_address) return "Address not found";  
    
  \_mapsSetCache(key, formatted\_address);  
  return formatted\_address;  
};

/\*\*  
 \* 2.6 Get the country name of an address on Google Maps.  
 \* @customFunction  
 \*/  
const GOOGLEMAPS\_COUNTRY \= (address) \=\> {  
  if (\!address) throw new Error("No address specified\!");  
  if (address.map) return address.map(a \=\> GOOGLEMAPS\_COUNTRY(a));

  const key \= \["country", address\].join(",");  
  const value \= \_mapsGetCache(key);  
  if (value \!== null) return value;

  Utilities.sleep(150);  
  const { results: \[data \= null\] \= \[\] } \= Maps.newGeocoder().geocode(address);  
  if (data \=== null) throw new Error("Address not found\!");  
    
  const \[{ short\_name, long\_name } \= {}\] \= data.address\_components.filter(  
    ({ types: \[level\] }) \=\> level \=== "country"  
  );  
  if (\!short\_name) throw new Error("Country not found\!");  
    
  const answer \= \`${long\_name} (${short\_name})\`;  
  \_mapsSetCache(key, answer);  
  return answer;  
};

/\*\*  
 \* 2.7 Find the driving direction between two locations on Google Maps.  
 \* @customFunction  
 \*/  
const GOOGLEMAPS\_DIRECTIONS \= (origin, destination, mode \= "driving") \=\> {  
  if (\!origin || \!destination) throw new Error("No address specified\!");  
    
  const key \= \["directions", origin, destination, mode\].join(",");  
  const value \= \_mapsGetCache(key);  
  if (value \!== null) return value;

  Utilities.sleep(150);  
  const { routes \= \[\] } \= Maps.newDirectionFinder()  
    .setOrigin(origin)  
    .setDestination(destination)  
    .setMode(mode)  
    .getDirections();  
      
  if (\!routes.length) throw new Error("No route found\!");  
    
  const directions \= routes  
    .map(({ legs }) \=\> {  
      return legs.map(({ steps }) \=\> {  
        return steps.map((step) \=\> {  
          return step.html\_instructions  
            .replace("\>\<", "\> \<")  
            .replace(/\<\[^\>\]+\>/g, "");  
        });  
      });  
    })  
    .join(", ");  
      
  \_mapsSetCache(key, directions);  
  return directions;  
};

// \==========================================  
// 4\. 🔗 BACKEND INTEGRATION (System Calls V4.0)  
// \==========================================

/\*\*  
 \* Wrapper for Backend System: Reverse Geocode  
 \* ดึงพิกัด Lat, Lng มาแปลเป็นที่อยู่  
 \*/  
function GET\_ADDR\_WITH\_CACHE(lat, lng) {  
  try {  
    return GOOGLEMAPS\_REVERSEGEOCODE(lat, lng);  
  } catch (e) {  
    console.error(\`\[GeoAddr API\] Reverse Geocode Error (${lat}, ${lng}): ${e.message}\`);  
    return "";  
  }  
}

/\*\*  
 \* Wrapper for Backend System: Calculate Distance  
 \* ดึงระยะทางจากสูตรคุณ Amit แล้วแปลง "1,250.5 km" ให้เหลือแค่ "1250.50" (ตัวเลขล้วน)  
 \*/  
function CALCULATE\_DISTANCE\_KM(origin, destination) {  
  try {  
    var distanceText \= GOOGLEMAPS\_DISTANCE(origin, destination, "driving");  
    if (\!distanceText) return "";  
      
    // \[FINAL POLISH\] กำจัดลูกน้ำ (,) ออกก่อน แล้วค่อยกรองเฉพาะตัวเลขและจุดทศนิยม  
    var cleanStr \= String(distanceText).replace(/,/g, "").replace(/\[^0-9.\]/g, "");  
    var val \= parseFloat(cleanStr);  
      
    return isNaN(val) ? "" : val.toFixed(2);  
  } catch (e) {  
    console.error(\`\[GeoAddr API\] Distance Error (${origin} \-\> ${destination}): ${e.message}\`);  
    return "";  
  }  
}

\`\`\`

\#\# 9\. \`Service\_Notify.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🔔 Service: Omni-Channel Notification Hub (Enterprise Edition)  
 \* Version: 4.0 Centralized Broadcaster  
 \* หน้าที่: ศูนย์กลางส่งแจ้งเตือนสถานะระบบและ Error เข้า LINE และ Telegram  
 \* \------------------------------------------------  
 \* \[PRESERVED\]: Dual-channel architecture and HTML escaping.  
 \* \[REMOVED v4.0\]: Setup functions removed (Delegated to Setup\_Security.gs V4.0).  
 \* \[MODIFIED v4.0\]: Overrides basic notifiers in Module 14 with robust Try-Catch logic.  
 \* \[MODIFIED v4.0\]: Prevents API limits/errors from crashing main business flows.  
 \* Author: Elite Logistics Architect  
 \*/

// \==========================================  
// 1\. CORE SENDING LOGIC (Unified Broadcaster)  
// \==========================================

/\*\*  
 \* 📤 ฟังก์ชันส่งข้อความรวม (Broadcast V4.0)  
 \* ส่งเข้าทุกช่องทางที่ตั้งค่าไว้ (LINE และ/หรือ Telegram)  
 \* @param {string} message \- ข้อความ  
 \* @param {boolean} isUrgent \- เป็น Error หรือเรื่องด่วนหรือไม่  
 \*/  
function sendSystemNotify(message, isUrgent) {  
  console.info(\`\[Notification Hub\] Broadcasting message (Urgent: ${\!\!isUrgent})\`);  
    
  // รันแบบขนาน (จำลองใน GAS โดยใช้ Try-Catch แยกกัน)  
  // ป้องกันกรณีช่องทางใดช่องทางหนึ่งตาย แล้วพาลให้อีกช่องทางไม่ส่ง  
    
  try {  
    sendLineNotify\_Internal\_(message, isUrgent);  
  } catch (e) {  
    console.error("\[Notify Hub\] LINE Broadcast Failed: " \+ e.message);  
  }

  try {  
    sendTelegramNotify\_Internal\_(message, isUrgent);  
  } catch (e) {  
    console.error("\[Notify Hub\] Telegram Broadcast Failed: " \+ e.message);  
  }  
}

// \==========================================  
// 2\. PUBLIC WRAPPERS (Overrides Module 14\)  
// \==========================================

/\*\*  
 \* \[MODIFIED v4.0\] Wrapper สำหรับเขียนทับ (Override) ฟังก์ชันใน Service\_Maintenance.gs  
 \* ทำให้ทุกการเรียกใช้ sendLineNotify ในระบบ วิ่งมาใช้ Logic ระดับ Enterprise ตัวนี้แทน  
 \*/  
function sendLineNotify(message, isUrgent) {  
  sendLineNotify\_Internal\_(message, isUrgent);  
}

/\*\*  
 \* \[MODIFIED v4.0\] Wrapper สำหรับเขียนทับ (Override) ฟังก์ชันใน Service\_Maintenance.gs  
 \*/  
function sendTelegramNotify(message, isUrgent) {  
  sendTelegramNotify\_Internal\_(message, isUrgent);  
}

// \==========================================  
// 3\. INTERNAL CHANNEL HANDLERS  
// \==========================================

/\*\*  
 \* Internal: ยิง API เข้า LINE Notify อย่างปลอดภัย  
 \*/  
function sendLineNotify\_Internal\_(message, isUrgent) {  
  var token \= PropertiesService.getScriptProperties().getProperty('LINE\_NOTIFY\_TOKEN');  
  if (\!token) return; // Silent skip if not configured

  var prefix \= isUrgent ? "🚨 URGENT ALERT:\\n" : "🤖 SYSTEM REPORT:\\n";  
  var fullMsg \= prefix \+ message;

  try {  
    var response \= UrlFetchApp.fetch("https://notify-api.line.me/api/notify", {  
      "method": "post",  
      "headers": { "Authorization": "Bearer " \+ token },  
      "payload": { "message": fullMsg },  
      "muteHttpExceptions": true  
    });  
      
    if (response.getResponseCode() \!== 200\) {  
      console.warn("\[LINE API Error\] " \+ response.getContentText());  
    }  
  } catch (e) {  
    console.warn("\[LINE Exception\] " \+ e.message);  
  }  
}

/\*\*  
 \* Internal: ยิง API เข้า Telegram อย่างปลอดภัย  
 \*/  
function sendTelegramNotify\_Internal\_(message, isUrgent) {  
  var token \= PropertiesService.getScriptProperties().getProperty('TG\_BOT\_TOKEN'); // ใช้ Key ตาม Setup\_Security V4.0  
  var chatId \= PropertiesService.getScriptProperties().getProperty('TG\_CHAT\_ID');  // ใช้ Key ตาม Setup\_Security V4.0  
    
  // Fallback for V2.0 keys if still present  
  if (\!token) token \= PropertiesService.getScriptProperties().getProperty('TELEGRAM\_BOT\_TOKEN');  
  if (\!chatId) chatId \= PropertiesService.getScriptProperties().getProperty('TELEGRAM\_CHAT\_ID');

  if (\!token || \!chatId) return; // Silent skip if not configured

  // Format Message (HTML Style)  
  var icon \= isUrgent ? "🚨" : "🤖";  
  var title \= isUrgent ? "\<b\>SYSTEM ALERT\</b\>" : "\<b\>SYSTEM REPORT\</b\>";  
  var htmlMsg \= \`${icon} ${title}\\n\\n${escapeHtml\_(message)}\`;

  try {  
    var url \= "https://api.telegram.org/bot" \+ token \+ "/sendMessage";  
    var payload \= {  
      "chat\_id": chatId,  
      "text": htmlMsg,  
      "parse\_mode": "HTML"  
    };

    var response \= UrlFetchApp.fetch(url, {  
      "method": "post",  
      "contentType": "application/json",  
      "payload": JSON.stringify(payload),  
      "muteHttpExceptions": true  
    });  
      
    if (response.getResponseCode() \!== 200\) {  
      console.warn("\[Telegram API Error\] " \+ response.getContentText());  
    }  
  } catch (e) {  
    console.warn("\[Telegram Exception\] " \+ e.message);  
  }  
}

/\*\*  
 \* Helper: Escape HTML special chars for Telegram to prevent formatting errors  
 \*/  
function escapeHtml\_(text) {  
  if (\!text) return "";  
  return text  
    .replace(/&/g, "\&amp;")  
    .replace(/\</g, "\&lt;")  
    .replace(/\>/g, "\&gt;");  
}

// \==========================================  
// 4\. SPECIFIC EVENT NOTIFIERS  
// \==========================================

/\*\*  
 \* \[UPGRADED v4.0\] Wrapper สำหรับ AutoPilot  
 \* สรุปยอดการทำงานส่งให้ผู้ดูแลระบบ  
 \*/  
function notifyAutoPilotStatus(scgStatus, aiCount, aiMappedCount) {  
  // รองรับพารามิเตอร์ 3 ตัวเพื่อโชว์ผลลัพธ์ของ Tier 4 AI ด้วย  
  var mappedMsg \= aiMappedCount \!== undefined ? \`\\n🎯 AI Tier-4 จับคู่สำเร็จ: ${aiMappedCount} ร้าน\` : "";  
    
  var msg \= "------------------\\n" \+  
            "✅ AutoPilot V4.0 รอบล่าสุด:\\n" \+  
            "📦 ดึงงาน SCG: " \+ scgStatus \+ "\\n" \+  
            "🧠 AI Indexing: " \+ aiCount \+ " รายการ" \+   
            mappedMsg;  
              
  sendSystemNotify(msg, false);   
}

\`\`\`

\#\# 10\. \`Service\_SCG.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 📦 Service: SCG Operation (Enterprise Edition)  
 \* Version: 5.0 ScanDocs \+ Summary Readiness  
 \* \---------------------------------------------------------  
 \* \[PRESERVED v4.0\]: API Retry Mechanism, LockService, Smart Branch Matching  
 \* \[PRESERVED v4.0\]: AI NameMapping schema (Variant \-\> Master\_UID \-\> Coordinates)  
 \* \[UPDATED v5.0\]: checkIsEPOD() — Logic ใหม่รองรับ Invoice ทุกช่วงตัวเลข  
 \* \[UPDATED v5.0\]: buildOwnerSummary() — เพิ่ม จำนวน\_E-POD\_ทั้งหมด  
 \* \[ADDED v5.0\]: buildShipmentSummary() — สรุปตาม Shipment+TruckLicense  
 \* \[ADDED v5.0\]: clearShipmentSummarySheet() \+ UI  
 \* \[UPDATED v5.0\]: clearAllSCGSheets\_UI() — ล้าง 4 ชีต  
 \* Author: Elite Logistics Architect  
 \*/

// \==========================================  
// 1\. MAIN OPERATION: FETCH DATA  
// \==========================================

function fetchDataFromSCGJWD() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const ui \= SpreadsheetApp.getUi();

  const lock \= LockService.getScriptLock();  
  if (\!lock.tryLock(10000)) {  
    ui.alert("⚠️ ระบบคิวทำงาน", "มีผู้ใช้งานอื่นกำลังโหลดข้อมูล Shipment อยู่ กรุณารอสักครู่", ui.ButtonSet.OK);  
    return;  
  }

  try {  
    const inputSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
    const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
    if (\!inputSheet || \!dataSheet) throw new Error("CRITICAL: ไม่พบชีต Input หรือ Data");

    const cookie \= inputSheet.getRange(SCG\_CONFIG.COOKIE\_CELL).getValue();  
    if (\!cookie) throw new Error("❌ กรุณาวาง Cookie ในช่อง " \+ SCG\_CONFIG.COOKIE\_CELL);

    const lastRow \= inputSheet.getLastRow();  
    if (lastRow \< SCG\_CONFIG.INPUT\_START\_ROW) throw new Error("ℹ️ ไม่พบเลข Shipment ในชีต Input");

    const shipmentNumbers \= inputSheet  
      .getRange(SCG\_CONFIG.INPUT\_START\_ROW, 1, lastRow \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1\)  
      .getValues().flat().filter(String);

    if (shipmentNumbers.length \=== 0\) throw new Error("ℹ️ รายการ Shipment ว่างเปล่า");

    const shipmentString \= shipmentNumbers.join(',');  
    inputSheet.getRange(SCG\_CONFIG.SHIPMENT\_STRING\_CELL).setValue(shipmentString).setHorizontalAlignment("left");

    const payload \= {  
      DeliveryDateFrom: '', DeliveryDateTo: '', TenderDateFrom: '', TenderDateTo: '',  
      CarrierCode: '', CustomerCode: '', OriginCodes: '', ShipmentNos: shipmentString  
    };

    const options \= {  
      method: 'post', payload: payload, muteHttpExceptions: true, headers: { cookie: cookie }  
    };

    ss.toast("กำลังเชื่อมต่อ SCG Server...", "System", 10);  
    console.log(\`\[SCG API\] Fetching data for ${shipmentNumbers.length} shipments.\`);  
    const responseText \= fetchWithRetry\_(SCG\_CONFIG.API\_URL, options, (CONFIG.API\_MAX\_RETRIES || 3));

    const json \= JSON.parse(responseText);  
    const shipments \= json.data || \[\];

    if (shipments.length \=== 0\) throw new Error("API Return Success แต่ไม่พบข้อมูล Shipment (Data Empty)");

    ss.toast("กำลังแปลงข้อมูล " \+ shipments.length \+ " Shipments...", "Processing", 5);  
    const allFlatData \= \[\];  
    let runningRow \= 2;

    shipments.forEach(shipment \=\> {  
      const destSet \= new Set();  
      (shipment.DeliveryNotes || \[\]).forEach(n \=\> { if (n.ShipToName) destSet.add(n.ShipToName); });  
      const destListStr \= Array.from(destSet).join(", ");

      (shipment.DeliveryNotes || \[\]).forEach(note \=\> {  
        (note.Items || \[\]).forEach(item \=\> {  
          const dailyJobId \= note.PurchaseOrder \+ "-" \+ runningRow;  
          const row \= \[  
            dailyJobId,  
            note.PlanDelivery ? new Date(note.PlanDelivery) : null,  
            String(note.PurchaseOrder),  
            String(shipment.ShipmentNo),  
            shipment.DriverName,  
            shipment.TruckLicense,  
            String(shipment.CarrierCode),  
            shipment.CarrierName,  
            String(note.SoldToCode),  
            note.SoldToName,  
            note.ShipToName,  
            note.ShipToAddress,  
            note.ShipToLatitude \+ ", " \+ note.ShipToLongitude,  
            item.MaterialName,  
            item.ItemQuantity,  
            item.QuantityUnit,  
            item.ItemWeight,  
            String(note.DeliveryNo),  
            destSet.size,  
            destListStr,  
            "รอสแกน",  
            "ยังไม่ได้ส่ง",  
            "",  
            0, 0, 0,  
            "",  
            "",  
            shipment.ShipmentNo \+ "|" \+ note.ShipToName  
          \];  
          allFlatData.push(row);  
          runningRow++;  
        });  
      });  
    });

    const shopAgg \= {};  
    allFlatData.forEach(r \=\> {  
      const key \= r\[28\];  
      if (\!shopAgg\[key\]) shopAgg\[key\] \= { qty: 0, weight: 0, invoices: new Set(), epod: 0 };  
      shopAgg\[key\].qty \+= Number(r\[14\]) || 0;  
      shopAgg\[key\].weight \+= Number(r\[16\]) || 0;  
      shopAgg\[key\].invoices.add(r\[2\]);  
      if (checkIsEPOD(r\[9\], r\[2\])) shopAgg\[key\].epod++;  
    });

    allFlatData.forEach(r \=\> {  
      const agg \= shopAgg\[r\[28\]\];  
      const scanInv \= agg.invoices.size \- agg.epod;  
      r\[23\] \= agg.qty;  
      r\[24\] \= Number(agg.weight.toFixed(2));  
      r\[25\] \= scanInv;  
      r\[27\] \= \`${r\[9\]} / รวม ${scanInv} บิล\`;  
    });

    const headers \= \[  
      "ID\_งานประจำวัน", "PlanDelivery", "InvoiceNo", "ShipmentNo", "DriverName",  
      "TruckLicense", "CarrierCode", "CarrierName", "SoldToCode", "SoldToName",  
      "ShipToName", "ShipToAddress", "LatLong\_SCG", "MaterialName", "ItemQuantity",  
      "QuantityUnit", "ItemWeight", "DeliveryNo", "จำนวนปลายทาง\_System", "รายชื่อปลายทาง\_System",  
      "ScanStatus", "DeliveryStatus", "Email พนักงาน",  
      "จำนวนสินค้ารวมของร้านนี้", "น้ำหนักสินค้ารวมของร้านนี้", "จำนวน\_Invoice\_ที่ต้องสแกน",  
      "LatLong\_Actual", "ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน", "ShopKey"  
    \];

    dataSheet.clear();  
    dataSheet.getRange(1, 1, 1, headers.length).setValues(\[headers\]).setFontWeight("bold");

    if (allFlatData.length \> 0\) {  
      dataSheet.getRange(2, 1, allFlatData.length, headers.length).setValues(allFlatData);  
      dataSheet.getRange(2, 2, allFlatData.length, 1).setNumberFormat("dd/mm/yyyy");  
      dataSheet.getRange(2, 3, allFlatData.length, 1).setNumberFormat("@");  
      dataSheet.getRange(2, 18, allFlatData.length, 1).setNumberFormat("@");  
    }

    applyMasterCoordinatesToDailyJob();  
    buildOwnerSummary();  
    buildShipmentSummary();

    console.log(\`\[SCG API\] Successfully imported ${allFlatData.length} records.\`);  
    ui.alert(\`✅ ดึงข้อมูลสำเร็จ\!\\n- จำนวนรายการ: ${allFlatData.length} แถว\\n- จับคู่พิกัด: เรียบร้อย\`);

  } catch (e) {  
    console.error("\[SCG API Error\]: " \+ e.message);  
    ui.alert("❌ เกิดข้อผิดพลาด: " \+ e.message);  
  } finally {  
    lock.releaseLock();  
  }  
}

// \==========================================  
// 2\. COORDINATE MATCHING (V4.0)  
// \==========================================

/\*\*  
 \* \[Phase C FIXED\] applyMasterCoordinatesToDailyJob()  
 \* ใช้ resolveUUIDFromMap\_() ก่อน lookup พิกัดจาก masterUUIDCoords  
 \* ป้องกัน merged UUID ชี้ไปพิกัดเก่าที่ไม่ใช่ canonical  
 \*/  
function applyMasterCoordinatesToDailyJob() {  
  const ss        \= SpreadsheetApp.getActiveSpreadsheet();  
  const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  const dbSheet   \= ss.getSheetByName(SCG\_CONFIG.SHEET\_MASTER\_DB);  
  const mapSheet  \= ss.getSheetByName(SCG\_CONFIG.SHEET\_MAPPING);  
  const empSheet  \= ss.getSheetByName(SCG\_CONFIG.SHEET\_EMPLOYEE);

  if (\!dataSheet || \!dbSheet) return;  
  const lastRow \= dataSheet.getLastRow();  
  if (lastRow \< 2\) return;

  // โหลด master coords  
  const masterCoords     \= {};  
  const masterUUIDCoords \= {};

  if (dbSheet.getLastRow() \> 1\) {  
    const maxCol \= Math.max(CONFIG.COL\_NAME, CONFIG.COL\_LAT, CONFIG.COL\_LNG, CONFIG.COL\_UUID);  
    const dbData \= dbSheet.getRange(2, 1, dbSheet.getLastRow() \- 1, maxCol).getValues();  
    dbData.forEach(r \=\> {  
      const obj \= dbRowToObject(r);  
      if (obj.name && obj.lat && obj.lng) {  
        const coords \= obj.lat \+ ", " \+ obj.lng;  
        masterCoords\[normalizeText(obj.name)\] \= coords;  
        if (obj.uuid) masterUUIDCoords\[obj.uuid\] \= coords;  
      }  
    });  
  }

  // โหลด alias map  
  const aliasMap \= {};  
  if (mapSheet && mapSheet.getLastRow() \> 1\) {  
    mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 2).getValues().forEach(r \=\> {  
      if (r\[0\] && r\[1\]) aliasMap\[normalizeText(r\[0\])\] \= r\[1\];  
    });  
  }

  // \[Phase C\] โหลด UUID state map ครั้งเดียว  
  const uuidStateMap \= buildUUIDStateMap\_();

  // โหลด employee map  
  const empMap \= {};  
  if (empSheet) {  
    var empLastRow \= empSheet.getLastRow();  
    if (empLastRow \>= 2\) {  
      empSheet.getRange(2, 1, empLastRow \- 1, 8).getValues().forEach(r \=\> {  
        if (r\[1\] && r\[6\]) empMap\[normalizeText(r\[1\])\] \= r\[6\];  
      });  
    }  
  }

  const values         \= dataSheet.getRange(2, 1, lastRow \- 1, CONFIG.DATA\_TOTAL\_COLS).getValues();  
  const latLongUpdates \= \[\];  
  const bgUpdates      \= \[\];  
  const emailUpdates   \= \[\];

  values.forEach(r \=\> {  
    const job  \= dailyJobRowToObject(r);  
    let newGeo \= "";  
    let bg     \= null;  
    let email  \= job.email;

    if (job.shipToName) {  
      let rawName   \= normalizeText(job.shipToName);  
      let targetUID \= aliasMap\[rawName\];

      // \[Phase C\] resolve เป็น canonical UUID ก่อน lookup พิกัด  
      if (targetUID) {  
        targetUID \= resolveUUIDFromMap\_(targetUID, uuidStateMap);  
      }

      if (targetUID && masterUUIDCoords\[targetUID\]) {  
        newGeo \= masterUUIDCoords\[targetUID\]; bg \= "\#b6d7a8";  
      } else if (masterCoords\[rawName\]) {  
        newGeo \= masterCoords\[rawName\]; bg \= "\#b6d7a8";  
      } else {  
        let branchMatch \= tryMatchBranch\_(rawName, masterCoords);  
        if (branchMatch) { newGeo \= branchMatch; bg \= "\#ffe599"; }  
      }  
    }

    latLongUpdates.push(\[newGeo\]);  
    bgUpdates.push(\[bg\]);

    if (job.driverName) {  
      const cleanDriver \= normalizeText(job.driverName);  
      if (empMap\[cleanDriver\]) email \= empMap\[cleanDriver\];  
    }  
    emailUpdates.push(\[email\]);  
  });

  dataSheet.getRange(2, DATA\_IDX.LATLNG\_ACTUAL \+ 1, latLongUpdates.length, 1).setValues(latLongUpdates);  
  dataSheet.getRange(2, DATA\_IDX.LATLNG\_ACTUAL \+ 1, bgUpdates.length,      1).setBackgrounds(bgUpdates);  
  dataSheet.getRange(2, DATA\_IDX.EMAIL \+ 1,          emailUpdates.length,   1).setValues(emailUpdates);

  ss.toast("✅ อัปเดตพิกัดและข้อมูลพนักงานเรียบร้อย", "System");  
}

// \==========================================  
// 3\. UTILITIES & HELPERS  
// \==========================================

function fetchWithRetry\_(url, options, maxRetries) {  
  for (let i \= 0; i \< maxRetries; i++) {  
    try {  
      const response \= UrlFetchApp.fetch(url, options);  
      if (response.getResponseCode() \=== 200\) return response.getContentText();  
      throw new Error("HTTP " \+ response.getResponseCode() \+ ": " \+ response.getContentText());  
    } catch (e) {  
      if (i \=== maxRetries \- 1\) throw e;  
      Utilities.sleep(1000 \* Math.pow(2, i));  
      console.warn(\`\[SCG API\] Retry attempt ${i \+ 1} failed. Retrying...\`);  
    }  
  }  
}

function tryMatchBranch\_(name, masterCoords) {  
  const keywords \= \["สาขา", "branch", "สำนักงาน", "store", "shop"\];  
  for (let k of keywords) {  
    if (name.includes(k)) {  
      let parts \= name.split(k);  
      if (parts.length \> 0 && parts\[0\].length \> 2\) {  
        let parentName \= normalizeText(parts\[0\]);  
        if (masterCoords\[parentName\]) return masterCoords\[parentName\];  
      }  
    }  
  }  
  return null;  
}

/\*\*  
 \* \[UPDATED v5.0\] ตรวจสอบ E-POD  
 \* กลุ่ม 1: EPOD ทุก Invoice — BETTERBE, SCG EXPRESS, เบทเตอร์แลนด์, JWD TRANSPORT  
 \* กลุ่ม 2: DENSO — ตรวจ Invoice ด้วย (ตัวเลขล้วน \+ ไม่มี \_DOC)  
 \*/  
function checkIsEPOD(ownerName, invoiceNo) {  
  if (\!ownerName || \!invoiceNo) return false;  
  const owner \= String(ownerName).toUpperCase();  
  const inv \= String(invoiceNo);

  const epodOwners \= \["BETTERBE", "SCG EXPRESS", "เบทเตอร์แลนด์", "JWD TRANSPORT"\];  
  if (epodOwners.some(w \=\> owner.includes(w.toUpperCase()))) return true;

  if (owner.includes("DENSO") || owner.includes("เด็นโซ่")) {  
    if (inv.includes("\_DOC")) return false;  
    if (/^\\d+(-.\*)?$/.test(inv)) return true;  
    return false;  
  }

  return false;  
}

// \==========================================  
// 4\. BUILD SUMMARY: เจ้าของสินค้า \[UPDATED v5.0\]  
// \==========================================

/\*\*  
 \* \[Phase B FIXED\] buildOwnerSummary()  
 \* ใช้ DATA\_IDX แทน r\[9\], r\[2\]  
 \*/  
function buildOwnerSummary() {  
  const ss        \= SpreadsheetApp.getActiveSpreadsheet();  
  const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  if (\!dataSheet || dataSheet.getLastRow() \< 2\) return;

  // \[Phase B\] ใช้ DATA\_TOTAL\_COLS  
  const data     \= dataSheet.getRange(2, 1, dataSheet.getLastRow() \- 1, CONFIG.DATA\_TOTAL\_COLS).getValues();  
  const ownerMap \= {};

  data.forEach(r \=\> {  
    // \[Phase B\] ใช้ DATA\_IDX  
    const job \= dailyJobRowToObject(r);  
    if (\!job.soldToName) return;  
    if (\!ownerMap\[job.soldToName\]) ownerMap\[job.soldToName\] \= { all: new Set(), epod: new Set() };  
    if (\!job.invoiceNo) return;  
    if (checkIsEPOD(job.soldToName, job.invoiceNo)) {  
      ownerMap\[job.soldToName\].epod.add(job.invoiceNo);  
    } else {  
      ownerMap\[job.soldToName\].all.add(job.invoiceNo);  
    }  
  });

  const summarySheet \= ss.getSheetByName("สรุป\_เจ้าของสินค้า");  
  if (\!summarySheet) { SpreadsheetApp.getUi().alert("❌ ไม่พบชีต สรุป\_เจ้าของสินค้า"); return; }

  const summaryLastRow \= summarySheet.getLastRow();  
  if (summaryLastRow \> 1\) summarySheet.getRange(2, 1, summaryLastRow \- 1, 6).clearContent().setBackground(null);

  const rows \= \[\];  
  Object.keys(ownerMap).sort().forEach(owner \=\> {  
    const o \= ownerMap\[owner\];  
    rows.push(\["", owner, "", o.all.size, o.epod.size, new Date()\]);  
  });

  if (rows.length \> 0\) {  
    summarySheet.getRange(2, 1, rows.length, 6).setValues(rows);  
    summarySheet.getRange(2, 4, rows.length, 2).setNumberFormat("\#,\#\#0");  
    summarySheet.getRange(2, 6, rows.length, 1).setNumberFormat("dd/mm/yyyy HH:mm");  
  }  
}

/\*\*  
 \* \[Phase B FIXED\] buildShipmentSummary()  
 \* ใช้ DATA\_IDX แทน r\[3\], r\[5\], r\[9\], r\[2\]  
 \*/  
function buildShipmentSummary() {  
  const ss        \= SpreadsheetApp.getActiveSpreadsheet();  
  const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  if (\!dataSheet || dataSheet.getLastRow() \< 2\) return;

  // \[Phase B\] ใช้ DATA\_TOTAL\_COLS  
  const data        \= dataSheet.getRange(2, 1, dataSheet.getLastRow() \- 1, CONFIG.DATA\_TOTAL\_COLS).getValues();  
  const shipmentMap \= {};

  data.forEach(r \=\> {  
    // \[Phase B\] ใช้ DATA\_IDX  
    const job \= dailyJobRowToObject(r);  
    if (\!job.shipmentNo || \!job.truckLicense) return;  
    const key \= job.shipmentNo \+ "\_" \+ job.truckLicense;  
    if (\!shipmentMap\[key\]) {  
      shipmentMap\[key\] \= { shipmentNo: job.shipmentNo, truck: job.truckLicense, all: new Set(), epod: new Set() };  
    }  
    if (\!job.invoiceNo) return;  
    if (checkIsEPOD(job.soldToName, job.invoiceNo)) {  
      shipmentMap\[key\].epod.add(job.invoiceNo);  
    } else {  
      shipmentMap\[key\].all.add(job.invoiceNo);  
    }  
  });

  const summarySheet \= ss.getSheetByName("สรุป\_Shipment");  
  if (\!summarySheet) { SpreadsheetApp.getUi().alert("❌ ไม่พบชีต สรุป\_Shipment"); return; }

  const summaryLastRow \= summarySheet.getLastRow();  
  if (summaryLastRow \> 1\) summarySheet.getRange(2, 1, summaryLastRow \- 1, 7).clearContent().setBackground(null);

  const rows \= \[\];  
  Object.keys(shipmentMap).sort().forEach(key \=\> {  
    const s \= shipmentMap\[key\];  
    rows.push(\[key, s.shipmentNo, s.truck, "", s.all.size, s.epod.size, new Date()\]);  
  });

  if (rows.length \> 0\) {  
    summarySheet.getRange(2, 1, rows.length, 7).setValues(rows);  
    summarySheet.getRange(2, 5, rows.length, 2).setNumberFormat("\#,\#\#0");  
    summarySheet.getRange(2, 7, rows.length, 1).setNumberFormat("dd/mm/yyyy HH:mm");  
  }  
}  
// \==========================================  
// 6\. CLEAR FUNCTIONS  
// \==========================================

function clearDataSheet() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const sheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  if (\!sheet) return;  
  const lastRow \= sheet.getLastRow();  
  const lastCol \= sheet.getLastColumn();  
  if (lastRow \> 1 && lastCol \> 0\) {  
    sheet.getRange(2, 1, lastRow \- 1, lastCol).clearContent().setBackground(null);  
  }  
}

function clearSummarySheet() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const sheet \= ss.getSheetByName("สรุป\_เจ้าของสินค้า");  
  if (\!sheet) return;  
  const lastRow \= sheet.getLastRow();  
  if (lastRow \> 1\) {  
    sheet.getRange(2, 1, lastRow \- 1, sheet.getLastColumn()).clearContent().setBackground(null);  
  }  
}

function clearShipmentSummarySheet() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const sheet \= ss.getSheetByName("สรุป\_Shipment");  
  if (\!sheet) return;  
  const lastRow \= sheet.getLastRow();  
  if (lastRow \> 1\) {  
    sheet.getRange(2, 1, lastRow \- 1, sheet.getLastColumn()).clearContent().setBackground(null);  
  }  
}

function clearSummarySheet\_UI() {  
  const ui \= SpreadsheetApp.getUi();  
  const result \= ui.alert(  
    '⚠️ ยืนยันการล้างข้อมูล',  
    'ต้องการล้างข้อมูลในชีต สรุป\_เจ้าของสินค้า ใช่ไหม?\\n(Header ยังคงอยู่)',  
    ui.ButtonSet.YES\_NO  
  );  
  if (result \=== ui.Button.YES) {  
    clearSummarySheet();  
    SpreadsheetApp.getUi().alert('✅ ล้างข้อมูล สรุป\_เจ้าของสินค้า เรียบร้อยแล้ว');  
  }  
}

function clearShipmentSummarySheet\_UI() {  
  const ui \= SpreadsheetApp.getUi();  
  const result \= ui.alert(  
    '⚠️ ยืนยันการล้างข้อมูล',  
    'ต้องการล้างข้อมูลในชีต สรุป\_Shipment ใช่ไหม?\\n(Header ยังคงอยู่)',  
    ui.ButtonSet.YES\_NO  
  );  
  if (result \=== ui.Button.YES) {  
    clearShipmentSummarySheet();  
    SpreadsheetApp.getUi().alert('✅ ล้างข้อมูล สรุป\_Shipment เรียบร้อยแล้ว');  
  }  
}

/\*\*  
 \* \[UPDATED v5.0\] ล้างทั้งหมด: Input \+ Data \+ สรุป\_เจ้าของสินค้า \+ สรุป\_Shipment  
 \*/  
function clearAllSCGSheets\_UI() {  
  const ui \= SpreadsheetApp.getUi();  
  const result \= ui.alert(  
    '🔥 ยืนยันการล้างข้อมูลทั้งหมด',  
    'ต้องการล้างข้อมูลใน:\\n- Input\\n- Data\\n- สรุป\_เจ้าของสินค้า\\n- สรุป\_Shipment\\nทั้งหมดหรือไม่?\\nการกระทำนี้กู้คืนไม่ได้',  
    ui.ButtonSet.YES\_NO  
  );

  if (result \=== ui.Button.YES) {  
    const ss \= SpreadsheetApp.getActiveSpreadsheet();

    const inputSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
    if (inputSheet) {  
      inputSheet.getRange(SCG\_CONFIG.COOKIE\_CELL).clearContent();  
      inputSheet.getRange(SCG\_CONFIG.SHIPMENT\_STRING\_CELL).clearContent();  
      const lastRow \= inputSheet.getLastRow();  
      if (lastRow \>= SCG\_CONFIG.INPUT\_START\_ROW) {  
        inputSheet.getRange(  
          SCG\_CONFIG.INPUT\_START\_ROW, 1,  
          lastRow \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1  
        ).clearContent();  
      }  
    }

    clearDataSheet();  
    clearSummarySheet();  
    clearShipmentSummarySheet();

    ui.alert('✅ ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว\\n(Input \+ Data \+ สรุป\_เจ้าของสินค้า \+ สรุป\_Shipment)');  
  }  
}

\`\`\`

\#\# 11\. \`Service\_SchemaValidator.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] minColumns \= 22, central headers, queue conflict validation  
 \*/

var SHEET\_SCHEMA \= {

  DATABASE: {  
    sheetName:       function() { return CONFIG.SHEET\_NAME; },  
    minColumns:      22,  
    requiredHeaders: CONFIG.DB\_REQUIRED\_HEADERS  
  },

  NAMEMAPPING: {  
    sheetName:       function() { return CONFIG.MAPPING\_SHEET; },  
    minColumns:      CONFIG.MAP\_TOTAL\_COLS,  
    requiredHeaders: CONFIG.MAP\_REQUIRED\_HEADERS  
  },

  SCG\_SOURCE: {  
    sheetName:    function() { return CONFIG.SOURCE\_SHEET; },  
    minColumns:   37,  
    requiredHeaders: {  
      13: "ชื่อปลายทาง", 15: "LAT", 16: "LONG",  
      19: "ที่อยู่ปลายทาง", 24: "ระยะทางจากคลัง\_Km",  
      25: "ชื่อที่อยู่จาก\_LatLong", 37: "SYNC\_STATUS"  
    }  
  },

  GPS\_QUEUE: {  
    sheetName:       function() { return SCG\_CONFIG.SHEET\_GPS\_QUEUE; },  
    minColumns:      CONFIG.GPS\_QUEUE\_TOTAL\_COLS,  
    requiredHeaders: CONFIG.GPS\_QUEUE\_REQUIRED\_HEADERS  
  },

  DATA: {  
    sheetName:    function() { return SCG\_CONFIG.SHEET\_DATA; },  
    minColumns:   27,  
    requiredHeaders: {  
      1: "ID\_งานประจำวัน", 4: "ShipmentNo",  
      11: "ShipToName", 27: "LatLong\_Actual"  
    }  
  }  
};

// \==========================================  
// CORE VALIDATOR  
// \==========================================

function validateSheet\_(schemaKey) {  
  var schema \= SHEET\_SCHEMA\[schemaKey\];  
  if (\!schema) return { valid: false, errors: \["Schema '" \+ schemaKey \+ "' ไม่พบ"\] };

  var ss        \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= schema.sheetName();  
  var errors    \= \[\];  
  var sheet     \= ss.getSheetByName(sheetName);

  if (\!sheet) return { valid: false, errors: \["❌ ไม่พบชีต '" \+ sheetName \+ "'"\] };

  var lastCol \= sheet.getLastColumn();  
  if (lastCol \< schema.minColumns) {  
    errors.push("❌ ชีต '" \+ sheetName \+ "' มีแค่ " \+ lastCol \+  
                " คอลัมน์ (ต้องการ ≥ " \+ schema.minColumns \+ ")");  
  }

  if (lastCol \> 0 && sheet.getLastRow() \> 0\) {  
    var headers \= sheet.getRange(1, 1, 1, lastCol).getValues()\[0\];  
    Object.keys(schema.requiredHeaders).forEach(function(colNum) {  
      var idx      \= parseInt(colNum) \- 1;  
      var expected \= schema.requiredHeaders\[colNum\];  
      var actual   \= headers\[idx\] || "";  
      if (actual.toString().trim() \!== expected.toString().trim()) {  
        errors.push("⚠️ Col " \+ colNum \+ ": คาดว่า '" \+ expected \+  
                    "' แต่เจอ '" \+ actual \+ "'");  
      }  
    });  
  }

  return { valid: errors.length \=== 0, errors: errors, sheetName: sheetName };  
}

// \[Phase A NEW\] ตรวจ GPS Queue conflict  
function validateGPSQueueIntegrity\_(sheet) {  
  var issues  \= \[\];  
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return issues;  
  var data \= sheet.getRange(2, 8, lastRow \- 1, 2).getValues();  
  data.forEach(function(row, i) {  
    if (row\[0\] \=== true && row\[1\] \=== true) {  
      issues.push("แถว " \+ (i \+ 2\) \+ ": Approve และ Reject ถูกติ๊กพร้อมกัน");  
    }  
  });  
  return issues;  
}

function validateSchemas(schemaKeys) {  
  var results  \= {};  
  var allValid \= true;  
  schemaKeys.forEach(function(key) {  
    var result   \= validateSheet\_(key);  
    results\[key\] \= result;  
    if (\!result.valid) allValid \= false;  
  });  
  return { allValid: allValid, results: results };  
}

function preCheck\_Sync() {  
  var check \= validateSchemas(\["DATABASE","NAMEMAPPING","SCG\_SOURCE","GPS\_QUEUE"\]);  
  if (\!check.allValid) throwSchemaError\_(check.results, "Sync GPS Feedback");  
  return true;  
}

function preCheck\_Apply() {  
  var check \= validateSchemas(\["DATABASE","NAMEMAPPING","DATA"\]);  
  if (\!check.allValid) throwSchemaError\_(check.results, "Apply Master Coordinates");  
  return true;  
}

function preCheck\_Approve() {  
  var check \= validateSchemas(\["DATABASE","GPS\_QUEUE"\]);  
  if (\!check.allValid) throwSchemaError\_(check.results, "Apply Approved Feedback");  
  return true;  
}

function throwSchemaError\_(results, flowName) {  
  var msg \= "❌ Schema Validation Failed\\nFlow: " \+ flowName \+  
            "\\n━━━━━━━━━━━━━━━━━━━━━━━\\n\\n";  
  Object.keys(results).forEach(function(key) {  
    var r \= results\[key\];  
    if (\!r.valid) {  
      msg \+= "📋 ชีต: " \+ r.sheetName \+ "\\n";  
      r.errors.forEach(function(e) { msg \+= "  " \+ e \+ "\\n"; });  
      msg \+= "\\n";  
    }  
  });  
  msg \+= "━━━━━━━━━━━━━━━━━━━━━━━\\n💡 กรุณาตรวจสอบโครงสร้างชีตก่อนรันใหม่";  
  SpreadsheetApp.getActiveSpreadsheet().toast("❌ Schema Error: " \+ flowName, "Alert", 10);  
  throw new Error(msg);  
}

function runFullSchemaValidation() {  
  var ui      \= SpreadsheetApp.getUi();  
  var allKeys \= Object.keys(SHEET\_SCHEMA);  
  var check   \= validateSchemas(allKeys);

  // \[Phase A NEW\] ตรวจ GPS Queue conflict ด้วย  
  var msg \= "🛡️ Schema Validation Report\\n━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n";  
  var ss  \= SpreadsheetApp.getActiveSpreadsheet();  
  var qs  \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
  if (qs) {  
    var qi \= validateGPSQueueIntegrity\_(qs);  
    if (qi.length \> 0\) {  
      msg \+= "⚠️ GPS\_Queue Conflicts:\\n";  
      qi.forEach(function(i) { msg \+= "  " \+ i \+ "\\n"; });  
      msg \+= "\\n";  
    }  
  }

  allKeys.forEach(function(key) {  
    var r \= check.results\[key\];  
    msg \+= (r.valid ? "✅ " : "❌ ") \+ r.sheetName \+ "\\n";  
    if (\!r.valid) r.errors.forEach(function(e) { msg \+= "   " \+ e \+ "\\n"; });  
  });

  msg \+= "\\n━━━━━━━━━━━━━━━━━━━━━━━━━\\n";  
  msg \+= check.allValid ? "✅ ทุกชีตผ่านการตรวจสอบ" : "❌ พบปัญหา กรุณาแก้ไขก่อนใช้งาน";  
  ui.alert(msg);  
}

function fixNameMappingHeaders() {  
  var ss    \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui    \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  if (\!sheet) { ui.alert("❌ ไม่พบชีต NameMapping"); return; }  
  var headers \= Object.values(CONFIG.MAP\_REQUIRED\_HEADERS);  
  var r \= sheet.getRange(1, 1, 1, 5);  
  r.setValues(\[headers\]);  
  r.setFontWeight("bold").setBackground("\#7c3aed").setFontColor("white");  
  sheet.setFrozenRows(1);  
  SpreadsheetApp.flush();  
  ui.alert("✅ อัปเกรด NameMapping Header สำเร็จ\!");  
}

\`\`\`

\#\# 12\. \`Service\_Search.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase B  
 \* \[Phase B\] อ่าน full DB width (DB\_TOTAL\_COLS)  
 \* \[Phase B FIXED\] แก้ bug return → continue ใน for loop  
 \* \[Phase B\] exclude Inactive/Merged อย่างถูกต้อง  
 \*/

/\*\*  
 \* \[Phase C FIXED\] searchMasterData()  
 \* ใช้ resolveUUIDFromMap\_() ก่อน return canonical UUID  
 \* โหลด UUID state ครั้งเดียว ไม่อ่าน Sheet ซ้ำต่อ record  
 \*/  
/\*\*  
 \* \[Phase E\] searchMasterData()  
 \* เพิ่ม verified, coordSource, coordConfidence ใน return items  
 \* เพื่อให้ Index.html แสดง badge ได้  
 \*/  
function searchMasterData(keyword, page) {  
  console.time("SearchLatency");  
  try {  
    var pageNum  \= parseInt(page) || 1;  
    var pageSize \= 20;

    if (\!keyword || keyword.toString().trim() \=== "") {  
      return { items: \[\], total: 0, totalPages: 0, currentPage: 1 };  
    }

    var rawKey       \= keyword.toString().toLowerCase().trim();  
    var searchTokens \= rawKey.split(/\\s+/).filter(function(k) { return k.length \> 0; });  
    if (searchTokens.length \=== 0\) return { items: \[\], total: 0, totalPages: 0, currentPage: 1 };

    var ss       \= SpreadsheetApp.getActiveSpreadsheet();  
    var aliasMap \= getCachedNameMapping\_(ss);

    var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    if (\!sheet) return { items: \[\], total: 0, totalPages: 0, currentPage: 1 };

    var lastRow \= sheet.getLastRow();  
    if (lastRow \< 2\) return { items: \[\], total: 0, totalPages: 0, currentPage: 1 };

    var data         \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
    var uuidStateMap \= buildUUIDStateMap\_();  
    var matches      \= \[\];

    for (var i \= 0; i \< data.length; i++) {  
      var row \= data\[i\];  
      var obj \= dbRowToObject(row);

      if (\!obj.name) continue;

      var recordStatus \= obj.recordStatus || "Active";  
      if (recordStatus \=== "Inactive" || recordStatus \=== "Merged") continue;

      var aiKeywords \= obj.normalized ? obj.normalized.toString().toLowerCase() : "";  
      var normName   \= normalizeText(obj.name);  
      var rawName    \= obj.name.toString().toLowerCase();  
      var aliases    \= obj.uuid ? (aliasMap\[obj.uuid\] || "") : "";  
      var address    \= (obj.googleAddr || obj.sysAddr || "").toString().toLowerCase();  
      var haystack   \= rawName \+ " " \+ normName \+ " " \+ aliases \+ " " \+ aiKeywords \+ " " \+ address;

      var isMatch \= searchTokens.every(function(token) {  
        return haystack.indexOf(token) \> \-1;  
      });

      if (isMatch) {  
        var canonicalUuid \= obj.uuid  
          ? resolveUUIDFromMap\_(obj.uuid, uuidStateMap)  
          : obj.uuid;

        matches.push({  
          name:            obj.name,  
          address:         obj.googleAddr || obj.sysAddr || "",  
          lat:             obj.lat,  
          lng:             obj.lng,  
          mapLink:         (obj.lat && obj.lng)  
            ? "https://www.google.com/maps/dir/?api=1\&destination=" \+ obj.lat \+ "," \+ obj.lng  
            : "",  
          uuid:            canonicalUuid,  
          score:           aiKeywords.includes(rawKey) ? 10 : 1,  
          status:          recordStatus,  
          // \[Phase E NEW\] metadata สำหรับ badges  
          verified:        obj.verified,  
          coordSource:     obj.coordSource     || "",  
          coordConfidence: obj.coordConfidence || 0  
        });  
      }  
    }

    matches.sort(function(a, b) { return b.score \- a.score; });

    var totalItems \= matches.length;  
    var totalPages \= Math.ceil(totalItems / pageSize);  
    if (pageNum \> totalPages && totalPages \> 0\) pageNum \= 1;

    var pagedItems \= matches.slice((pageNum \- 1\) \* pageSize, pageNum \* pageSize);

    console.log("\[Search\] '" \+ rawKey \+ "' | Found: " \+ totalItems \+ " | Page: " \+ pageNum \+ "/" \+ totalPages);  
    return { items: pagedItems, total: totalItems, totalPages: totalPages, currentPage: pageNum };

  } catch(error) {  
    console.error("\[Search Error\]: " \+ error.message);  
    return { items: \[\], total: 0, totalPages: 0, currentPage: 1, error: error.message };  
  } finally {  
    console.timeEnd("SearchLatency");  
  }  
}

function getCachedNameMapping\_(ss) {  
  var cache     \= CacheService.getScriptCache();  
  var cachedMap \= cache.get("NAME\_MAPPING\_JSON\_V4");  
  if (cachedMap) return JSON.parse(cachedMap);

  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  var aliasMap \= {};

  if (mapSheet && mapSheet.getLastRow() \> 1\) {  
    var mapData \= mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 2).getValues();  
    mapData.forEach(function(row) {  
      var variant \= row\[0\];  
      var uid     \= row\[1\];  
      if (variant && uid) {  
        if (\!aliasMap\[uid\]) aliasMap\[uid\] \= "";  
        var normVariant \= normalizeText(variant);  
        aliasMap\[uid\] \+= " " \+ normVariant \+ " " \+ variant.toString().toLowerCase();  
      }  
    });

    try {  
      var jsonString \= JSON.stringify(aliasMap);  
      var byteSize   \= Utilities.newBlob(jsonString).getBytes().length;  
      if (byteSize \< 100000\) {  
        cache.put("NAME\_MAPPING\_JSON\_V4", jsonString, 3600);  
        console.log("\[Cache\] NameMapping cached (" \+ byteSize \+ " bytes)");  
      } else {  
        console.warn("\[Cache\] NameMapping too large (" \+ byteSize \+ " bytes), skipping");  
      }  
    } catch(e) {  
      console.warn("\[Cache Error\]: " \+ e.message);  
    }  
  }

  return aliasMap;  
}

function clearSearchCache() {  
  CacheService.getScriptCache().remove("NAME\_MAPPING\_JSON\_V4");  
  console.log("\[Cache\] Search Cache Cleared.");  
}

\`\`\`

\#\# 13\. \`Service\_SoftDelete.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม resolveRowUUIDOrNull\_() และ isActiveUUID\_()  
 \* เพื่อให้ flows อื่นเรียกใช้ตรวจสอบ UUID ก่อน consume  
 \*/

// \==========================================  
// 1\. INITIALIZE STATUS  
// \==========================================

function initializeRecordStatus() {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui      \= SpreadsheetApp.getUi();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) return;

  var maxCol \= CONFIG.DB\_TOTAL\_COLS;  
  var data   \= sheet.getRange(2, 1, lastRow \- 1, maxCol).getValues();  
  var count  \= 0;

  data.forEach(function(row, i) {  
    if (\!row\[CONFIG.C\_IDX.NAME\]) return;  
    if (\!row\[CONFIG.C\_IDX.RECORD\_STATUS\]) {  
      data\[i\]\[CONFIG.C\_IDX.RECORD\_STATUS\] \= "Active";  
      count++;  
    }  
  });

  if (count \> 0\) {  
    sheet.getRange(2, 1, data.length, maxCol).setValues(data);  
    SpreadsheetApp.flush();  
  }

  ui.alert(  
    "✅ Initialize สำเร็จ\!\\n\\n" \+  
    "ตั้งค่า Record\_Status \= Active: " \+ count \+ " แถว\\n\\n" \+  
    "สถานะในระบบ:\\n" \+  
    "Active   \= ใช้งานปกติ\\n" \+  
    "Inactive \= ปิดการใช้งาน\\n" \+  
    "Merged   \= รวมเข้ากับ UUID อื่นแล้ว"  
  );  
}

// \==========================================  
// 2\. SOFT DELETE  
// \==========================================

function softDeleteRecord(uuid) {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data    \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();

  for (var i \= 0; i \< data.length; i++) {  
    if (data\[i\]\[CONFIG.C\_IDX.UUID\] \=== uuid) {  
      var rowNum \= i \+ 2;  
      sheet.getRange(rowNum, CONFIG.COL\_RECORD\_STATUS).setValue("Inactive");  
      sheet.getRange(rowNum, CONFIG.COL\_UPDATED).setValue(new Date());  
      console.log("\[softDeleteRecord\] UUID " \+ uuid \+ " → Inactive");  
      return true;  
    }  
  }  
  return false;  
}

// \==========================================  
// 3\. MERGE UUIDs  
// \==========================================

function mergeUUIDs(masterUUID, duplicateUUID) {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data    \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();

  var masterFound \= false, duplicateFound \= false;

  for (var i \= 0; i \< data.length; i++) {  
    var rowUUID \= data\[i\]\[CONFIG.C\_IDX.UUID\];  
    var rowNum  \= i \+ 2;  
    if (rowUUID \=== masterUUID)    masterFound \= true;  
    if (rowUUID \=== duplicateUUID) {  
      sheet.getRange(rowNum, CONFIG.COL\_RECORD\_STATUS).setValue("Merged");  
      sheet.getRange(rowNum, CONFIG.COL\_MERGED\_TO\_UUID).setValue(masterUUID);  
      sheet.getRange(rowNum, CONFIG.COL\_UPDATED).setValue(new Date());  
      duplicateFound \= true;  
      console.log("\[mergeUUIDs\] " \+ duplicateUUID \+ " → " \+ masterUUID);  
    }  
  }  
  return { masterFound: masterFound, duplicateFound: duplicateFound };  
}

// \==========================================  
// 4\. RESOLVE UUID (ติดตาม Merge chain)  
// \==========================================

function resolveUUID(uuid) {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data    \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();

  var uuidMap \= {};  
  data.forEach(function(row) {  
    var u \= row\[CONFIG.C\_IDX.UUID\];  
    if (u) uuidMap\[u\] \= {  
      status:   row\[CONFIG.C\_IDX.RECORD\_STATUS\],  
      mergedTo: row\[CONFIG.C\_IDX.MERGED\_TO\_UUID\]  
    };  
  });

  var current  \= uuid;  
  var maxHops  \= 10;  
  var hopCount \= 0;  
  while (hopCount \< maxHops) {  
    var info \= uuidMap\[current\];  
    if (\!info || info.status \!== "Merged" || \!info.mergedTo) break;  
    current \= info.mergedTo;  
    hopCount++;  
  }  
  return current;  
}

// \==========================================  
// 5\. \[Phase A NEW\] HELPER FUNCTIONS  
// \==========================================

/\*\*  
 \* resolveRowUUIDOrNull\_()  
 \* ใช้ก่อน consume UUID จาก mapping หรือ search  
 \* คืน canonical UUID ถ้า active, คืน null ถ้า inactive หรือหาไม่เจอ  
 \*/  
function resolveRowUUIDOrNull\_(uuid) {  
  if (\!uuid) return null;  
  var resolved \= resolveUUID(uuid);  
  if (\!resolved) return null;  
  if (\!isActiveUUID\_(resolved)) {  
    console.warn("\[resolveRowUUIDOrNull\_\] UUID '" \+ resolved \+ "' ไม่ active");  
    return null;  
  }  
  return resolved;  
}

/\*\*  
 \* isActiveUUID\_()  
 \* ตรวจว่า UUID นี้ยัง active ใช้งานได้อยู่หรือไม่  
 \*/  
function isActiveUUID\_(uuid) {  
  if (\!uuid) return false;  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data    \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();

  for (var i \= 0; i \< data.length; i++) {  
    if (data\[i\]\[CONFIG.C\_IDX.UUID\] \=== uuid) {  
      var status \= data\[i\]\[CONFIG.C\_IDX.RECORD\_STATUS\];  
      return (status \=== "Active" || status \=== "");  
    }  
  }  
  return false;  
}

// \==========================================  
// 6\. UI  
// \==========================================

function mergeDuplicates\_UI() {  
  var ui \= SpreadsheetApp.getUi();

  var resMaster \= ui.prompt("🔀 Merge UUID (1/2)", "กรุณาใส่ Master UUID:", ui.ButtonSet.OK\_CANCEL);  
  if (resMaster.getSelectedButton() \!== ui.Button.OK) return;  
  var masterUUID \= resMaster.getResponseText().trim();

  var resDup \= ui.prompt("🔀 Merge UUID (2/2)", "กรุณาใส่ Duplicate UUID:", ui.ButtonSet.OK\_CANCEL);  
  if (resDup.getSelectedButton() \!== ui.Button.OK) return;  
  var duplicateUUID \= resDup.getResponseText().trim();

  if (\!masterUUID || \!duplicateUUID) { ui.alert("❌ UUID ไม่ครบ"); return; }  
  if (masterUUID \=== duplicateUUID)  { ui.alert("❌ UUID เดียวกัน"); return; }

  var result \= mergeUUIDs(masterUUID, duplicateUUID);  
  if (\!result.masterFound)    { ui.alert("❌ ไม่พบ Master UUID"); return; }  
  if (\!result.duplicateFound) { ui.alert("❌ ไม่พบ Duplicate UUID"); return; }

  if (typeof clearSearchCache \=== 'function') clearSearchCache();

  ui.alert(  
    "✅ Merge สำเร็จ\!\\n\\n" \+  
    "Master: "    \+ masterUUID    \+ "\\n" \+  
    "Duplicate: " \+ duplicateUUID \+ "\\n\\n" \+  
    "Duplicate ถูก Mark เป็น 'Merged' แล้วครับ\\nข้อมูลเดิมยังอยู่ครบ"  
  );  
}

function showRecordStatusReport() {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui      \= SpreadsheetApp.getUi();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \< 2\) { ui.alert("ℹ️ Database ว่างเปล่าครับ"); return; }

  var data  \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var stats \= { active: 0, inactive: 0, merged: 0, noStatus: 0 };

  data.forEach(function(row) {  
    if (\!row\[CONFIG.C\_IDX.NAME\]) return;  
    var s \= row\[CONFIG.C\_IDX.RECORD\_STATUS\];  
    if (s \=== "Active")        stats.active++;  
    else if (s \=== "Inactive") stats.inactive++;  
    else if (s \=== "Merged")   stats.merged++;  
    else                       stats.noStatus++;  
  });

  ui.alert(  
    "📊 Record Status Report\\n━━━━━━━━━━━━━━━━━━━━━━━\\n" \+  
    "✅ Active:    " \+ stats.active   \+ " แถว\\n" \+  
    "⚫ Inactive:  " \+ stats.inactive \+ " แถว\\n" \+  
    "🔀 Merged:    " \+ stats.merged   \+ " แถว\\n" \+  
    "❓ ไม่มีสถานะ: " \+ stats.noStatus \+ " แถว\\n" \+  
    "━━━━━━━━━━━━━━━━━━━━━━━\\n" \+  
    "รวม: " \+ (stats.active \+ stats.inactive \+ stats.merged \+ stats.noStatus) \+ " แถว"  
  );  
}

/\*\*  
 \* \[Phase C NEW\] buildUUIDStateMap\_()  
 \* โหลด UUID state ทั้งหมดจาก Database ครั้งเดียว  
 \* ใช้ใน resolveUUID(), isActiveUUID\_() เพื่อลด Sheets API calls  
 \* เรียกจาก flow ที่ต้องตรวจ UUID หลายตัวพร้อมกัน  
 \*/  
function buildUUIDStateMap\_() {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var map     \= {};  
  if (lastRow \< 2\) return map;

  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  data.forEach(function(row) {  
    var u \= row\[CONFIG.C\_IDX.UUID\];  
    if (u) {  
      map\[u\] \= {  
        status:   row\[CONFIG.C\_IDX.RECORD\_STATUS\]  || "Active",  
        mergedTo: row\[CONFIG.C\_IDX.MERGED\_TO\_UUID\] || ""  
      };  
    }  
  });  
  return map;  
}

/\*\*  
 \* \[Phase C NEW\] resolveUUIDFromMap\_()  
 \* เหมือน resolveUUID() แต่รับ stateMap ที่โหลดไว้แล้ว  
 \* ใช้เมื่อต้อง resolve UUID หลายตัวในรอบเดียวกัน ไม่ต้องอ่าน Sheet ซ้ำ  
 \*/  
function resolveUUIDFromMap\_(uuid, stateMap) {  
  if (\!uuid || \!stateMap) return uuid;  
  var current  \= uuid;  
  var maxHops  \= 10;  
  var hopCount \= 0;

  while (hopCount \< maxHops) {  
    var info \= stateMap\[current\];  
    if (\!info || info.status \!== "Merged" || \!info.mergedTo) break;  
    current \= info.mergedTo;  
    hopCount++;  
  }  
  return current;  
}

/\*\*  
 \* \[Phase C NEW\] isActiveFromMap\_()  
 \* ตรวจสถานะจาก stateMap ที่โหลดไว้แล้ว  
 \*/  
function isActiveFromMap\_(uuid, stateMap) {  
  if (\!uuid || \!stateMap) return false;  
  var info \= stateMap\[uuid\];  
  if (\!info) return false;  
  return (info.status \=== "Active" || info.status \=== "");  
}

\`\`\`

\#\# 14\. \`Setup\_Security.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🔐 Security Setup Utility (Enterprise Edition)  
 \* Version: 4.0 Omni-Vault (Safe Storage & Validation)  
 \* \-----------------------------------------------------------------  
 \* \[PRESERVED\]: PropertiesService for secure credential storage.  
 \* \[MODIFIED v4.0\]: Upgraded validation to check for "AIza" prefix for Gemini.  
 \* \[MODIFIED v4.0\]: Changed resetEnvironment to selectively delete keys (preventing full wipe).  
 \* \[ADDED v4.0\]: setupLineToken() & setupTelegramConfig() to support Menu V4.0.  
 \* \[MODIFIED v4.0\]: Switched to console.info for GCP Audit Logging.  
 \* Author: Elite Logistics Architect  
 \*/

// \==========================================  
// 1\. GEMINI AI (CORE SECURITY)  
// \==========================================

/\*\*  
 \* 🔐 ตั้งค่า Gemini API Key อย่างปลอดภัย  
 \* ห้ามแก้ Config.gs เพื่อใส่ Key โดยตรงเด็ดขาด\!  
 \*/  
function setupEnvironment() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var response \= ui.prompt(  
    '🔐 Security Setup: Gemini API',   
    'กรุณากรอก Gemini API Key (ต้องขึ้นต้นด้วย AIza...):\\nสามารถรับฟรีได้ที่ Google AI Studio',   
    ui.ButtonSet.OK\_CANCEL  
  );

  if (response.getSelectedButton() \== ui.Button.OK) {  
    var key \= response.getResponseText().trim();  
      
    // \[MODIFIED v4.0\]: ตรวจสอบความถูกต้องของ Key ขั้นสูง  
    if (key.length \> 30 && key.startsWith("AIza")) {  
      // Save to Script Properties (Hidden & Secure)  
      PropertiesService.getScriptProperties().setProperty('GEMINI\_API\_KEY', key);  
        
      ui.alert('✅ บันทึก API Key สำเร็จ\!\\nระบบ AI พร้อมใช้งานแล้วครับ');  
      console.info("\[Security Audit\] User updated GEMINI\_API\_KEY.");  
    } else {  
      ui.alert('❌ API Key ไม่ถูกต้อง', 'Key ของ Gemini ต้องขึ้นต้นด้วย "AIza" และมีความยาวที่ถูกต้อง กรุณาลองใหม่ครับ', ui.ButtonSet.OK);  
      console.warn("\[Security Audit\] Failed attempt to update GEMINI\_API\_KEY (Invalid format).");  
    }  
  } else {  
    console.info("\[Security Audit\] Setup cancelled by user.");  
  }  
}

// \==========================================  
// 2\. NOTIFICATION TOKENS (NEW v4.0)  
// \==========================================

/\*\*  
 \* 🔔 \[ADDED v4.0\] ตั้งค่า LINE Notify Token  
 \* รองรับเมนู V4.0 ที่ประกาศไว้ใน Menu.gs  
 \*/  
function setupLineToken() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.prompt(  
    '🔔 Setup: LINE Notify',   
    'กรุณากรอก LINE Notify Token ของกลุ่มที่ต้องการให้ระบบแจ้งเตือน:',   
    ui.ButtonSet.OK\_CANCEL  
  );

  if (response.getSelectedButton() \== ui.Button.OK) {  
    var token \= response.getResponseText().trim();  
    if (token.length \> 20\) {  
      PropertiesService.getScriptProperties().setProperty('LINE\_NOTIFY\_TOKEN', token);  
      ui.alert('✅ บันทึก LINE Token สำเร็จ\!');  
      console.info("\[Security Audit\] User updated LINE\_NOTIFY\_TOKEN.");  
    } else {  
      ui.alert('❌ Token สั้นเกินไป กรุณาตรวจสอบอีกครั้ง');  
    }  
  }  
}

/\*\*  
 \* ✈️ \[ADDED v4.0\] ตั้งค่า Telegram Config (Bot Token & Chat ID)  
 \*/  
function setupTelegramConfig() {  
  var ui \= SpreadsheetApp.getUi();  
  var props \= PropertiesService.getScriptProperties();  
    
  var resBot \= ui.prompt('✈️ Setup: Telegram', '1. กรุณากรอก Bot Token (เช่น 123456:ABC-DEF...):', ui.ButtonSet.OK\_CANCEL);  
  if (resBot.getSelectedButton() \!== ui.Button.OK) return;  
  var botToken \= resBot.getResponseText().trim();

  var resChat \= ui.prompt('✈️ Setup: Telegram', '2. กรุณากรอก Chat ID (เช่น \-100123456789):', ui.ButtonSet.OK\_CANCEL);  
  if (resChat.getSelectedButton() \!== ui.Button.OK) return;  
  var chatId \= resChat.getResponseText().trim();

  if (botToken && chatId) {  
    props.setProperty('TG\_BOT\_TOKEN', botToken);  
    props.setProperty('TG\_CHAT\_ID', chatId);  
    ui.alert('✅ บันทึก Telegram Config สำเร็จ\!');  
    console.info("\[Security Audit\] User updated Telegram configurations.");  
  } else {  
    ui.alert('❌ ข้อมูลไม่ครบถ้วน ยกเลิกการบันทึก');  
  }  
}

// \==========================================  
// 3\. MAINTENANCE & AUDIT  
// \==========================================

/\*\*  
 \* 🗑️ \[MODIFIED v4.0\] ล้างค่าเฉพาะระบบที่ต้องการ (Safe Reset)  
 \* ป้องกันการเผลอลบ Token สำคัญอื่นๆ ที่ไม่ได้เกี่ยวข้อง  
 \*/  
function resetEnvironment() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.alert(  
    '⚠️ Danger Zone',   
    'คุณต้องการล้างรหัส API Key ของ Gemini ใช่หรือไม่?\\n(ระบบจะลบเฉพาะ GEMINI\_API\_KEY เท่านั้น)',   
    ui.ButtonSet.YES\_NO  
  );

  if (response \== ui.Button.YES) {  
    PropertiesService.getScriptProperties().deleteProperty('GEMINI\_API\_KEY');  
    ui.alert('🗑️ ล้างการตั้งค่า Gemini API Key เรียบร้อยแล้ว');  
    console.info("\[Security Audit\] User DELETED GEMINI\_API\_KEY.");  
  }  
}

/\*\*  
 \* 🏥 ตรวจสอบสถานะการเชื่อมต่อ (System Secrets Status)  
 \* ใช้ตรวจเช็คว่าเราลืมใส่ Key ไหนไปบ้าง โดยไม่เปิดเผย Key จริง  
 \*/  
function checkCurrentKeyStatus() {  
  var props \= PropertiesService.getScriptProperties();  
  var geminiKey \= props.getProperty('GEMINI\_API\_KEY');  
  var lineToken \= props.getProperty('LINE\_NOTIFY\_TOKEN');  
  var tgBot \= props.getProperty('TG\_BOT\_TOKEN');  
  var ui \= SpreadsheetApp.getUi();  
    
  var statusMsg \= "📊 \*\*System Secrets Status\*\*\\n\\n";  
    
  if (geminiKey) {  
    statusMsg \+= "🟢 Gemini AI: READY (Ends with ..." \+ geminiKey.slice(-4) \+ ")\\n";  
  } else {  
    statusMsg \+= "🔴 Gemini AI: NOT SET\\n";  
  }

  if (lineToken) {  
    statusMsg \+= "🟢 LINE Notify: READY\\n";  
  } else {  
    statusMsg \+= "⚪ LINE Notify: NOT SET\\n";  
  }

  if (tgBot) {  
    statusMsg \+= "🟢 Telegram: READY\\n";  
  } else {  
    statusMsg \+= "⚪ Telegram: NOT SET\\n";  
  }

  ui.alert("System Health Check", statusMsg, ui.ButtonSet.OK);  
  console.info("\[Security Audit\] Secrets status checked by user.");  
}

\`\`\`

\#\# 15\. \`Setup\_Upgrade.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🛠️ System Upgrade Tool (Enterprise Edition)  
 \* Version: 4.0 Omni-Schema Upgrader  
 \* \-----------------------------------------------------------------  
 \* \[PRESERVED\]: Spatial Grid Indexing (O(N)) for hidden duplicates.  
 \* \[PRESERVED\]: upgradeDatabaseStructure for extending standard columns.  
 \* \[ADDED v4.0\]: upgradeNameMappingStructure\_V4() to auto-migrate NameMapping   
 \* to the new 5-column AI Resolution Schema safely.  
 \* \[MODIFIED v4.0\]: Added Enterprise Benchmarking (console.time).  
 \* Author: Elite Logistics Architect  
 \*/

// \==========================================  
// 1\. DATABASE SCHEMA UPGRADE (Standard & V4.0)  
// \==========================================

function upgradeDatabaseStructure() {  
  var ss  \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui  \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  if (\!sheet) {  
    ui.alert("❌ Critical Error: ไม่พบชีต " \+ CONFIG.SHEET\_NAME);  
    return;  
  }

  // \[UPDATED v4.1\] Col 18-20 ถูกใช้สำหรับ GPS Tracking แล้ว  
  // กำหนดตามที่ Config.gs ระบุไว้  
  var gpsHeaders \= \[  
    "Coord\_Source",        // Col 18 (R)  
    "Coord\_Confidence",    // Col 19 (S)  
    "Coord\_Last\_Updated"   // Col 20 (T)  
  \];

  var currentHeaders \= sheet.getRange(1, 1, 1, sheet.getLastColumn())  
    .getValues()\[0\];

  var missingHeaders \= \[\];  
  gpsHeaders.forEach(function(header) {  
    if (currentHeaders.indexOf(header) \=== \-1) {  
      missingHeaders.push(header);  
    }  
  });

  if (missingHeaders.length \=== 0\) {  
    ui.alert(  
      "✅ Database Structure เป็นปัจจุบันแล้ว\\n\\n" \+  
      "Col 18: Coord\_Source ✅\\n" \+  
      "Col 19: Coord\_Confidence ✅\\n" \+  
      "Col 20: Coord\_Last\_Updated ✅"  
    );  
    return;  
  }

  // ถามยืนยันก่อนเพิ่ม  
  var response \= ui.alert(  
    "⚠️ พบคอลัมน์ขาดหาย",  
    "ตรวจพบ GPS Tracking Columns ขาดหาย " \+ missingHeaders.length \+ " รายการ:\\n" \+  
    missingHeaders.join(", ") \+ "\\n\\n" \+  
    "ต้องการเพิ่มทันทีหรือไม่?",  
    ui.ButtonSet.YES\_NO  
  );

  if (response \!== ui.Button.YES) return;

  var startCol \= sheet.getLastColumn() \+ 1;  
  var range    \= sheet.getRange(1, startCol, 1, missingHeaders.length);

  range.setValues(\[missingHeaders\]);  
  range.setFontWeight("bold");  
  range.setBackground("\#d0f0c0");  
  range.setBorder(true, true, true, true, true, true);

  sheet.autoResizeColumns(startCol, missingHeaders.length);

  console.info("\[Upgrade\] Added " \+ missingHeaders.length \+ " GPS columns to Database.");  
  ui.alert(  
    "✅ เพิ่มคอลัมน์ GPS Tracking สำเร็จ\!\\n\\n" \+  
    missingHeaders.join("\\n")  
  );  
}  
/\*\*  
 \* 🚀 \[NEW v4.0\] Auto-Upgrade NameMapping Sheet to AI 4-Tier Schema  
 \* เปลี่ยนหัวคอลัมน์และจัดฟอร์แมตอัตโนมัติ ไม่ต้องทำมือ  
 \*/  
function upgradeNameMappingStructure\_V4() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET); // "NameMapping"  
  var ui \= SpreadsheetApp.getUi();

  if (\!sheet) {  
    ui.alert("❌ Critical Error: ไม่พบชีต " \+ CONFIG.MAPPING\_SHEET);  
    return;  
  }

  // Schema V4.0 เป้าหมาย  
  var targetHeaders \= \["Variant\_Name", "Master\_UID", "Confidence\_Score", "Mapped\_By", "Timestamp"\];  
    
  // เขียนหัวคอลัมน์ใหม่ทับ 5 คอลัมน์แรก  
  var range \= sheet.getRange(1, 1, 1, 5);  
  range.setValues(\[targetHeaders\]);  
    
  // ตกแต่งให้ดูเป็น Enterprise (สีม่วง AI)  
  range.setFontWeight("bold");  
  range.setFontColor("white");  
  range.setBackground("\#7c3aed"); // Enterprise Purple  
  range.setBorder(true, true, true, true, true, true);  
    
  // ปรับความกว้างให้สวยงาม  
  sheet.setColumnWidth(1, 250); // Variant Name (ชื่ออาจจะยาว)  
  sheet.setColumnWidth(2, 280); // Master\_UID (ยาวมาก)  
  sheet.setColumnWidth(3, 130); // Confidence  
  sheet.setColumnWidth(4, 120); // Mapped By  
  sheet.setColumnWidth(5, 150); // Timestamp  
    
  // ฟรีซแถวบนสุด  
  sheet.setFrozenRows(1);

  console.info("\[System Upgrade\] Successfully migrated NameMapping schema to V4.0");  
  ui.alert(  
    "✅ Schema Upgrade V4.0 สำเร็จ\!",   
    "อัปเกรดชีต NameMapping เป็น 5 คอลัมน์สำหรับ AI เรียบร้อยแล้วครับ\\n(แนะนำให้ไปกดซ่อมแซม NameMapping ในเมนูอีกครั้ง เพื่อเติม UID ให้เต็มช่อง)",   
    ui.ButtonSet.OK  
  );  
}

// \==========================================  
// 2\. SMART DATA QUALITY CHECK  
// \==========================================

/\*\*  
 \* 🔍 ตรวจสอบข้อมูลซ้ำซ้อน (Spatial Grid Algorithm)  
 \* เร็วกว่าเดิม 100 เท่า (จาก O(N^2) เป็น O(N))  
 \* \[MODIFIED v4.0\]: Added Benchmarking Console Log  
 \*/  
function findHiddenDuplicates() {  
  console.time("HiddenDupesCheck"); // เริ่มจับเวลา  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  // ใช้ C\_IDX เพื่อความแม่นยำ (ถ้ามี Config V4) หรือ Fallback  
  var idxLat \= (typeof CONFIG \!== 'undefined' && CONFIG.C\_IDX && CONFIG.C\_IDX.LAT \!== undefined) ? CONFIG.C\_IDX.LAT : 1;   
  var idxLng \= (typeof CONFIG \!== 'undefined' && CONFIG.C\_IDX && CONFIG.C\_IDX.LNG \!== undefined) ? CONFIG.C\_IDX.LNG : 2;  
  var idxName \= (typeof CONFIG \!== 'undefined' && CONFIG.C\_IDX && CONFIG.C\_IDX.NAME \!== undefined) ? CONFIG.C\_IDX.NAME : 0;

  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;

  var data \= sheet.getRange(2, 1, lastRow \- 1, 15).getValues(); // อ่านถึง Col O ก็พอ  
  var duplicates \= \[\];  
  var grid \= {};

  // Step 1: สร้าง Spatial Grid (Bucket Sort)  
  // ปัดเศษพิกัดทศนิยม 2 ตำแหน่ง (\~1.1 กม.) เพื่อจัดกลุ่ม  
  for (var i \= 0; i \< data.length; i++) {  
    var row \= data\[i\];  
    var lat \= row\[idxLat\];  
    var lng \= row\[idxLng\];  
      
    if (\!lat || \!lng || isNaN(lat) || isNaN(lng)) continue;

    var gridKey \= Math.floor(lat \* 100\) \+ "\_" \+ Math.floor(lng \* 100);  
      
    if (\!grid\[gridKey\]) grid\[gridKey\] \= \[\];  
    grid\[gridKey\].push({ index: i, row: row });  
  }

  // Step 2: เปรียบเทียบเฉพาะใน Grid เดียวกัน  
  for (var key in grid) {  
    var bucket \= grid\[key\];  
    if (bucket.length \< 2\) continue; // มีแค่ตัวเดียวในพื้นที่นี้ ข้ามไป

    // เปรียบเทียบกันเองใน Bucket (จำนวนน้อยมาก Loop ได้สบาย)  
    for (var a \= 0; a \< bucket.length; a++) {  
      for (var b \= a \+ 1; b \< bucket.length; b++) {  
        var item1 \= bucket\[a\];  
        var item2 \= bucket\[b\];  
          
        // คำนวณระยะทางจริง (Haversine)  
        var dist \= getHaversineDistanceKM(item1.row\[idxLat\], item1.row\[idxLng\], item2.row\[idxLat\], item2.row\[idxLng\]);  
          
        // Threshold: 50 เมตร (0.05 กม.)  
        if (dist \<= 0.05) {  
          // เช็คชื่อว่าต่างกันไหม (ถ้าชื่อเหมือนกันเป๊ะ อาจเป็น Duplicate ปกติ ไม่ใช่ Hidden)  
          var name1 \= typeof normalizeText \=== 'function' ? normalizeText(item1.row\[idxName\]) : item1.row\[idxName\];  
          var name2 \= typeof normalizeText \=== 'function' ? normalizeText(item2.row\[idxName\]) : item2.row\[idxName\];  
            
          if (name1 \!== name2) {  
             duplicates.push({  
               row1: item1.index \+ 2,  
               name1: item1.row\[idxName\],  
               row2: item2.index \+ 2,  
               name2: item2.row\[idxName\],  
               distance: (dist \* 1000).toFixed(0) \+ " ม."  
             });  
          }  
        }  
      }  
    }  
  }

  console.timeEnd("HiddenDupesCheck"); // จบจับเวลา

  // Report Results  
  if (duplicates.length \> 0\) {  
    var msg \= "⚠️ พบพิกัดทับซ้อน (Hidden Duplicates) " \+ duplicates.length \+ " คู่:\\n\\n";  
    // แสดงสูงสุด 15 คู่แรก  
    duplicates.slice(0, 15).forEach(function(d) {  
      msg \+= \`• แถว ${d.row1} vs ${d.row2}: ${d.name1} / ${d.name2} (ห่าง ${d.distance})\\n\`;  
    });  
      
    if (duplicates.length \> 15\) msg \+= \`\\n...และอีก ${duplicates.length \- 15} คู่\`;  
      
    ui.alert(msg);  
    console.warn(\`\[Quality Check\] Hidden Duplicates Found: ${duplicates.length} pairs.\`);  
  } else {  
    ui.alert("✅ ไม่พบข้อมูลซ้ำซ้อนในระยะ 50 เมตร");  
    console.log("\[Quality Check\] No hidden duplicates found.");  
  }  
}

function verifyHaversineOK() {  
  // ทดสอบว่า getHaversineDistanceKM จาก Utils\_Common ยังทำงานได้  
  var dist \= getHaversineDistanceKM(13.746, 100.539, 13.756, 100.549);  
    
  console.log("ระยะทางทดสอบ: " \+ dist \+ " km");  
    
  if (dist \> 0 && dist \< 5\) {  
    console.log("✅ getHaversineDistanceKM ทำงานปกติจาก Utils\_Common.gs");  
  } else {  
    console.log("❌ ผลลัพธ์ผิดปกติ ตรวจสอบอีกครั้งครับ");  
  }  
}

function verifyDatabaseStructure() {  
  var ss    \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  var lastCol \= sheet.getLastColumn();  
  var headers \= sheet.getRange(1, 1, 1, lastCol).getValues()\[0\];  
    
  console.log("คอลัมน์ทั้งหมด: " \+ lastCol);  
  console.log("=== GPS Tracking Columns \===");  
  console.log("Col 18: " \+ headers\[17\]); // 0-based \= 17  
  console.log("Col 19: " \+ headers\[18\]);  
  console.log("Col 20: " \+ headers\[19\]);  
    
  var expected \= \["Coord\_Source", "Coord\_Confidence", "Coord\_Last\_Updated"\];  
  var allOK \= true;  
    
  expected.forEach(function(h, i) {  
    var actual \= headers\[17 \+ i\];  
    if (actual \=== h) {  
      console.log("✅ Col " \+ (18 \+ i) \+ ": " \+ h);  
    } else {  
      console.log("❌ Col " \+ (18 \+ i) \+ ": คาดว่า '" \+ h \+ "' แต่เจอ '" \+ actual \+ "'");  
      allOK \= false;  
    }  
  });  
    
  if (allOK) {  
    console.log("\\n✅ Database Structure ถูกต้องครับ");  
  } else {  
    console.log("\\n❌ Database Structure มีปัญหา กรุณาตรวจสอบ");  
  }  
}

\`\`\`

\#\# 16\. \`Test\_AI.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase D  
 \* \[Phase D\] เพิ่ม testRetrieveCandidates\_(), testAIResponseValidation\_()  
 \*/

function forceRunAI\_Now() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  try {  
    if (typeof processAIIndexing\_Batch \!== 'function') {  
      throw new Error("ไม่พบฟังก์ชัน 'processAIIndexing\_Batch'");  
    }  
    ss.toast("🚀 กำลังเริ่ม AI Indexing...", "Debug", 10);  
    processAIIndexing\_Batch();  
    ui.alert("✅ สั่งงานเรียบร้อย\!\\nตรวจ Column Normalized ว่ามี Tag '\[AI\]' หรือไม่");  
  } catch(e) {  
    ui.alert("❌ Error: " \+ e.message);  
  }  
}

function debug\_TestTier4SmartResolution() {  
  var ui \= SpreadsheetApp.getUi();  
  try {  
    if (typeof resolveUnknownNamesWithAI \!== 'function') {  
      throw new Error("ไม่พบฟังก์ชัน 'resolveUnknownNamesWithAI'");  
    }  
    var response \= ui.alert("🧠 ยืนยันรัน Tier 4?",  
      "ดึงรายชื่อที่ไม่มีพิกัดจาก SCG Data ส่งให้ AI วิเคราะห์",  
      ui.ButtonSet.YES\_NO);  
    if (response \=== ui.Button.YES) resolveUnknownNamesWithAI();  
  } catch(e) {  
    ui.alert("❌ Error: " \+ e.message);  
  }  
}

function debugGeminiConnection() {  
  var ui \= SpreadsheetApp.getUi();  
  var apiKey;  
  try { apiKey \= CONFIG.GEMINI\_API\_KEY; }  
  catch(e) { ui.alert("❌ API Key Error", e.message, ui.ButtonSet.OK); return; }

  try {  
    var model    \= CONFIG.AI\_MODEL || "gemini-1.5-flash";  
    var url      \= "https://generativelanguage.googleapis.com/v1beta/models/" \+  
                   model \+ ":generateContent?key=" \+ apiKey;  
    var payload  \= { "contents": \[{ "parts": \[{ "text": "Say: Connection OK. Prompt-Version: " \+ AI\_CONFIG.PROMPT\_VERSION }\] }\] };  
    var options  \= { "method": "post", "contentType": "application/json",  
                     "payload": JSON.stringify(payload), "muteHttpExceptions": true };  
    var res      \= UrlFetchApp.fetch(url, options);

    if (res.getResponseCode() \=== 200\) {  
      var json \= JSON.parse(res.getContentText());  
      var text \= (json.candidates && json.candidates\[0\].content)  
        ? json.candidates\[0\].content.parts\[0\].text  
        : "No Text";  
      ui.alert("✅ API Connection OK\!\\n\\nResponse:\\n" \+ text);  
    } else {  
      ui.alert("❌ API Error: " \+ res.getContentText());  
    }  
  } catch(e) {  
    ui.alert("❌ Connection Failed: " \+ e.message);  
  }  
}

function debug\_ResetSelectedRowsAI() {  
  var ss    \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui    \= SpreadsheetApp.getUi();  
  var sheet \= ss.getActiveSheet();

  if (sheet.getName() \!== CONFIG.SHEET\_NAME) {  
    ui.alert("⚠️ กรุณาไฮไลต์ Cell ในชีต Database เท่านั้นครับ");  
    return;  
  }

  var range      \= sheet.getActiveRange();  
  var startRow   \= range.getRow();  
  var numRows    \= range.getNumRows();  
  var colIndex   \= CONFIG.COL\_NORMALIZED;  
  var targetRange \= sheet.getRange(startRow, colIndex, numRows, 1);  
  var values     \= targetRange.getValues();  
  var resetCount \= 0;

  for (var i \= 0; i \< values.length; i++) {  
    var val \= values\[i\]\[0\] ? values\[i\]\[0\].toString() : "";  
    // \[Phase D\] ลบทั้ง \[AI\] และ prompt version tag  
    if (val.indexOf(AI\_CONFIG.TAG\_AI) \!== \-1 || val.indexOf("\[Agent\_") \!== \-1) {  
      val \= val  
        .replace(/\\s\*\\\[AI\\\]/g, "")  
        .replace(/\\s\*\\\[Agent\_.\*?\\\]/g, "")  
        .replace(/\\s\*\\\[v\\d+\\.\\d+\\\]/g, "")  
        .trim();  
      values\[i\]\[0\] \= val;  
      resetCount++;  
    }  
  }

  if (resetCount \> 0\) {  
    targetRange.setValues(values);  
    ss.toast("🔄 Reset AI tags: " \+ resetCount \+ " แถว", "Debug", 5);  
  } else {  
    ss.toast("ℹ️ ไม่พบ AI tags ในส่วนที่เลือก", "Debug", 5);  
  }  
}

// \==========================================  
// \[Phase D NEW\] TEST HELPERS  
// \==========================================

/\*\*  
 \* testRetrieveCandidates\_()  
 \* ทดสอบว่า retrieval คัด candidates ได้ถูกต้องก่อนส่ง AI  
 \*/  
function testRetrieveCandidates() {  
  var ui \= SpreadsheetApp.getUi();

  var response \= ui.prompt(  
    "🔍 Test Retrieval",  
    "ใส่ชื่อที่ต้องการทดสอบ:",  
    ui.ButtonSet.OK\_CANCEL  
  );  
  if (response.getSelectedButton() \!== ui.Button.OK) return;

  var testName \= response.getResponseText().trim();  
  if (\!testName) return;

  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= dbSheet.getLastRow();  
  if (lastRow \< 2\) { ui.alert("ℹ️ Database ว่างเปล่า"); return; }

  var dbRows   \= dbSheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var mapRows  \= loadNameMappingRows\_();  
  var results  \= retrieveCandidateMasters\_(testName, dbRows, mapRows, 10);

  if (results.length \=== 0\) {  
    ui.alert("ℹ️ ไม่พบ candidates สำหรับ: '" \+ testName \+ "'");  
    return;  
  }

  var msg \= "🔍 Retrieval Results สำหรับ: '" \+ testName \+ "'\\n" \+  
            "━━━━━━━━━━━━━━━━━━━━━━━\\n";  
  results.forEach(function(r, i) {  
    msg \+= (i \+ 1\) \+ ". " \+ r.name \+ "\\n   UUID: " \+ r.uid.substring(0, 12\) \+ "...\\n";  
  });  
  msg \+= "━━━━━━━━━━━━━━━━━━━━━━━\\n";  
  msg \+= "พบ " \+ results.length \+ " candidates\\n";  
  msg \+= "💡 นี่คือสิ่งที่จะส่งให้ AI วิเคราะห์แทน slice(0,500)";

  ui.alert(msg);  
}

/\*\*  
 \* testAIResponseValidation\_()  
 \* ทดสอบ parse guard กับ response จริงจาก Gemini  
 \*/  
function testAIResponseValidation() {  
  var ui \= SpreadsheetApp.getUi();  
  var apiKey;  
  try { apiKey \= CONFIG.GEMINI\_API\_KEY; }  
  catch(e) { ui.alert("❌ API Key Error: " \+ e.message); return; }

  var testName \= "โลตัส สาขาบางนา";  
  var result   \= callGeminiThinking\_JSON(testName, apiKey);

  if (result) {  
    ui.alert(  
      "✅ Parse Guard: ผ่าน\!\\n\\n" \+  
      "Input: " \+ testName \+ "\\n" \+  
      "Output: " \+ result \+ "\\n" \+  
      "Prompt Version: " \+ AI\_CONFIG.PROMPT\_VERSION  
    );  
  } else {  
    ui.alert(  
      "⚠️ Parse Guard: ไม่ได้ keywords\\n\\n" \+  
      "Input: " \+ testName \+ "\\n" \+  
      "อาจเป็นเพราะ API key ปัญหา หรือ rate limit\\n" \+  
      "ตรวจสอบ Execution Log ครับ"  
    );  
  }  
}

\`\`\`

\#\# 17\. \`Test\_Diagnostic.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase E  
 \* \[Phase E\] แยก diagnostics core คืน object  
 \* \[Phase E\] เพิ่ม runDryRunMappingConflicts(), runDryRunUUIDIntegrity()  
 \*/

// \==========================================  
// 1\. CORE DIAGNOSTICS (คืน object — ไม่ผูกกับ UI)  
// \==========================================

function collectSystemDiagnostics\_() {  
  var results \= \[\];

  function pass(msg) { results.push({ status: "pass", message: msg }); }  
  function warn(msg) { results.push({ status: "warn", message: msg }); }  
  function fail(msg) { results.push({ status: "fail", message: msg }); }

  // Config  
  if (typeof CONFIG \!== 'undefined') pass("CONFIG: พร้อมใช้งาน");  
  else fail("CONFIG: ไม่พบ");

  // Utils  
  if (typeof md5           \=== 'function') pass("md5(): พร้อม");  
  else fail("md5(): ไม่พบ");

  if (typeof normalizeText \=== 'function') pass("normalizeText(): พร้อม");  
  else fail("normalizeText(): ไม่พบ");

  if (typeof dbRowToObject \=== 'function') pass("dbRowToObject(): พร้อม \[Phase B\]");  
  else fail("dbRowToObject(): ไม่พบ — Phase B ยังไม่ได้ deploy");

  if (typeof buildUUIDStateMap\_ \=== 'function') pass("buildUUIDStateMap\_(): พร้อม \[Phase C\]");  
  else fail("buildUUIDStateMap\_(): ไม่พบ — Phase C ยังไม่ได้ deploy");

  if (typeof retrieveCandidateMasters\_ \=== 'function') pass("retrieveCandidateMasters\_(): พร้อม \[Phase D\]");  
  else warn("retrieveCandidateMasters\_(): ไม่พบ — Phase D ยังไม่ได้ deploy");

  // Google Maps API  
  if (typeof GET\_ADDR\_WITH\_CACHE \=== 'function') {  
    try {  
      var testGeo \= GET\_ADDR\_WITH\_CACHE(13.746, 100.539);  
      if (testGeo && testGeo \!== "Error") pass("Google Maps API: ทำงานปกติ");  
      else warn("Google Maps API: ได้ค่าแปลก");  
    } catch(e) { fail("Google Maps API: Error — " \+ e.message); }  
  } else {  
    fail("Google Maps API: ไม่พบ GET\_ADDR\_WITH\_CACHE");  
  }

  // Gemini API Key  
  try {  
    if (CONFIG && CONFIG.GEMINI\_API\_KEY) pass("Gemini API Key: พร้อมใช้งาน");  
  } catch(e) { fail("Gemini API Key: ไม่พบ — " \+ e.message); }

  // Notifications  
  var props \= PropertiesService.getScriptProperties();  
  if (props.getProperty('LINE\_NOTIFY\_TOKEN')) pass("LINE Notify: ตั้งค่าแล้ว");  
  else warn("LINE Notify: ยังไม่ได้ตั้งค่า");

  if (props.getProperty('TG\_BOT\_TOKEN') && props.getProperty('TG\_CHAT\_ID')) {  
    pass("Telegram: ตั้งค่าแล้ว");  
  } else {  
    warn("Telegram: ยังไม่ได้ตั้งค่า");  
  }

  return results;  
}

function collectSheetDiagnostics\_() {  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var results \= \[\];

  function pass(msg) { results.push({ status: "pass", message: msg }); }  
  function warn(msg) { results.push({ status: "warn", message: msg }); }  
  function fail(msg) { results.push({ status: "fail", message: msg }); }

  // Database  
  var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (dbSheet) {  
    var rows \= typeof getRealLastRow\_ \=== 'function'  
      ? getRealLastRow\_(dbSheet, CONFIG.COL\_NAME)  
      : dbSheet.getLastRow();  
    var cols \= dbSheet.getLastColumn();  
    if (rows \>= 2\) pass("Database: " \+ (rows-1) \+ " records | " \+ cols \+ " columns");  
    else warn("Database: ว่างเปล่า");  
    if (cols \< CONFIG.DB\_TOTAL\_COLS) {  
      warn("Database: columns " \+ cols \+ " \< " \+ CONFIG.DB\_TOTAL\_COLS \+ " (ควรรัน upgradeDatabaseStructure)");  
    }  
  } else { fail("Database: ไม่พบชีต"); }

  // NameMapping  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  if (mapSheet) {  
    var mapCols \= mapSheet.getLastColumn();  
    if (mapCols \>= CONFIG.MAP\_TOTAL\_COLS) pass("NameMapping: schema V4.2 ถูกต้อง");  
    else warn("NameMapping: " \+ mapCols \+ " columns (ควร " \+ CONFIG.MAP\_TOTAL\_COLS \+ ")");  
  } else { fail("NameMapping: ไม่พบชีต"); }

  // GPS Queue  
  var queueSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
  if (queueSheet) {  
    var qRows \= queueSheet.getLastRow() \- 1;  
    pass("GPS\_Queue: " \+ qRows \+ " records");  
  } else { warn("GPS\_Queue: ไม่พบชีต"); }

  // Source Sheet  
  var srcSheet \= ss.getSheetByName(CONFIG.SOURCE\_SHEET);  
  if (srcSheet) pass("Source Sheet: พบชีต '" \+ CONFIG.SOURCE\_SHEET \+ "'");  
  else warn("Source Sheet: ไม่พบชีต '" \+ CONFIG.SOURCE\_SHEET \+ "'");

  // Data, Input, PostalRef  
  \[SCG\_CONFIG.SHEET\_DATA, SCG\_CONFIG.SHEET\_INPUT, CONFIG.SHEET\_POSTAL\].forEach(function(name) {  
    if (ss.getSheetByName(name)) pass(name \+ ": พบชีต");  
    else warn(name \+ ": ไม่พบชีต");  
  });

  return results;  
}

// \==========================================  
// 2\. UI WRAPPERS  
// \==========================================

function RUN\_SYSTEM\_DIAGNOSTIC() {  
  var ui      \= SpreadsheetApp.getUi();  
  var results \= collectSystemDiagnostics\_();

  var msg \= "🏥 System Diagnostic Report (V4.2)\\n━━━━━━━━━━━━━━━━━━━━━━━\\n\\n";  
  results.forEach(function(r) {  
    var icon \= r.status \=== "pass" ? "✅" : r.status \=== "warn" ? "⚠️" : "❌";  
    msg \+= icon \+ " " \+ r.message \+ "\\n";  
  });  
  msg \+= "\\n━━━━━━━━━━━━━━━━━━━━━━━";  
  ui.alert(msg);  
}

function RUN\_SHEET\_DIAGNOSTIC() {  
  var ui      \= SpreadsheetApp.getUi();  
  var results \= collectSheetDiagnostics\_();

  var msg \= "🕵️ Sheet Diagnostic Report (V4.2)\\n━━━━━━━━━━━━━━━━━━━━━━━\\n\\n";  
  results.forEach(function(r) {  
    var icon \= r.status \=== "pass" ? "✅" : r.status \=== "warn" ? "⚠️" : "❌";  
    msg \+= icon \+ " " \+ r.message \+ "\\n";  
  });  
  msg \+= "\\n━━━━━━━━━━━━━━━━━━━━━━━";  
  ui.alert(msg);  
}

// \==========================================  
// 3\. \[Phase E NEW\] DRY RUN FUNCTIONS  
// \==========================================

/\*\*  
 \* runDryRunMappingConflicts()  
 \* ตรวจ NameMapping conflicts โดยไม่แก้ไขข้อมูลจริง  
 \*/  
function runDryRunMappingConflicts() {  
  var ui       \= SpreadsheetApp.getUi();  
  var ss       \= SpreadsheetApp.getActiveSpreadsheet();  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);

  if (\!mapSheet || mapSheet.getLastRow() \< 2\) {  
    ui.alert("ℹ️ NameMapping ว่างเปล่า");  
    return;  
  }

  var mapRows   \= mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, CONFIG.MAP\_TOTAL\_COLS).getValues();  
  var variantMap \= {};  
  var conflicts  \= \[\];  
  var duplicates \= \[\];

  // โหลด DB UUID  
  var dbSheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastDbRow \= getRealLastRow\_(dbSheet, CONFIG.COL\_NAME);  
  var dbData    \= (lastDbRow \> 1\)  
    ? dbSheet.getRange(2, 1, lastDbRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues()  
    : \[\];  
  var validUUIDs \= new Set();  
  dbData.forEach(function(r) {  
    if (r\[CONFIG.C\_IDX.UUID\]) validUUIDs.add(r\[CONFIG.C\_IDX.UUID\]);  
  });

  mapRows.forEach(function(r, i) {  
    var obj       \= mapRowToObject(r);  
    var normVar   \= normalizeText(obj.variant || "");  
    if (\!normVar) return;

    // ตรวจ variant ซ้ำ  
    if (variantMap\[normVar\]) {  
      duplicates.push("แถว " \+ (i+2) \+ ": variant '" \+ obj.variant \+ "' ซ้ำกับแถว " \+ variantMap\[normVar\]);  
    } else {  
      variantMap\[normVar\] \= i \+ 2;  
    }

    // ตรวจ UUID ไม่มีใน DB  
    if (obj.uid && \!validUUIDs.has(obj.uid)) {  
      conflicts.push("แถว " \+ (i+2) \+ ": UUID '" \+ obj.uid.substring(0,12) \+ "...' ไม่พบใน Database");  
    }

    // ตรวจ UUID ว่าง  
    if (\!obj.uid) {  
      conflicts.push("แถว " \+ (i+2) \+ ": variant '" \+ obj.variant \+ "' ไม่มี UUID");  
    }  
  });

  var msg \= "🔵 Dry Run: Mapping Conflicts\\n━━━━━━━━━━━━━━━━━━━━━━━\\n\\n" \+  
            "📋 ตรวจ: " \+ mapRows.length \+ " mappings\\n\\n";

  if (duplicates.length \=== 0 && conflicts.length \=== 0\) {  
    msg \+= "✅ ไม่พบ conflicts ทั้งหมด\\n";  
  } else {  
    if (duplicates.length \> 0\) {  
      msg \+= "⚠️ Variant ซ้ำ: " \+ duplicates.length \+ " รายการ\\n";  
      duplicates.slice(0, 5).forEach(function(d) { msg \+= "  " \+ d \+ "\\n"; });  
      if (duplicates.length \> 5\) msg \+= "  ...และอีก " \+ (duplicates.length \- 5\) \+ " รายการ\\n";  
      msg \+= "\\n";  
    }  
    if (conflicts.length \> 0\) {  
      msg \+= "❌ UUID conflicts: " \+ conflicts.length \+ " รายการ\\n";  
      conflicts.slice(0, 5).forEach(function(c) { msg \+= "  " \+ c \+ "\\n"; });  
      if (conflicts.length \> 5\) msg \+= "  ...และอีก " \+ (conflicts.length \- 5\) \+ " รายการ\\n";  
    }  
  }

  msg \+= "\\n💡 Dry Run — ไม่มีการแก้ไขข้อมูลจริงครับ";  
  ui.alert(msg);  
}

/\*\*  
 \* runDryRunUUIDIntegrity()  
 \* ตรวจ UUID integrity ใน Database โดยไม่แก้ไขข้อมูลจริง  
 \*/  
function runDryRunUUIDIntegrity() {  
  var ui      \= SpreadsheetApp.getUi();  
  var ss      \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet   \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);

  if (lastRow \< 2\) { ui.alert("ℹ️ Database ว่างเปล่า"); return; }

  var data        \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var uuidSet     \= new Set();  
  var issues      \= \[\];  
  var stats       \= { total: 0, noUUID: 0, dupUUID: 0, merged: 0, inactive: 0, noStatus: 0 };

  data.forEach(function(row, i) {  
    var obj \= dbRowToObject(row);  
    if (\!obj.name) return;  
    stats.total++;

    if (\!obj.uuid) {  
      stats.noUUID++;  
      issues.push("แถว " \+ (i+2) \+ ": '" \+ obj.name \+ "' ไม่มี UUID");  
    } else if (uuidSet.has(obj.uuid)) {  
      stats.dupUUID++;  
      issues.push("แถว " \+ (i+2) \+ ": UUID ซ้ำ — " \+ obj.uuid.substring(0,12) \+ "...");  
    } else {  
      uuidSet.add(obj.uuid);  
    }

    var status \= obj.recordStatus || "";  
    if (status \=== "Merged")   stats.merged++;  
    if (status \=== "Inactive") stats.inactive++;  
    if (\!status)               stats.noStatus++;  
  });

  var msg \= "🔵 Dry Run: UUID Integrity\\n━━━━━━━━━━━━━━━━━━━━━━━\\n\\n" \+  
            "📋 ตรวจ: " \+ stats.total \+ " records\\n" \+  
            "❌ ไม่มี UUID: "    \+ stats.noUUID   \+ " records\\n" \+  
            "🔁 UUID ซ้ำ: "      \+ stats.dupUUID  \+ " records\\n" \+  
            "🔀 Merged: "         \+ stats.merged   \+ " records\\n" \+  
            "⚫ Inactive: "        \+ stats.inactive \+ " records\\n" \+  
            "❓ ไม่มี Status: "   \+ stats.noStatus \+ " records\\n\\n";

  if (issues.length \> 0\) {  
    msg \+= "⚠️ Issues:\\n";  
    issues.slice(0, 8).forEach(function(iss) { msg \+= "  " \+ iss \+ "\\n"; });  
    if (issues.length \> 8\) msg \+= "  ...และอีก " \+ (issues.length \- 8\) \+ " รายการ\\n";  
  } else {  
    msg \+= "✅ UUID integrity ปกติทั้งหมด\\n";  
  }

  msg \+= "\\n💡 Dry Run — ไม่มีการแก้ไขข้อมูลจริงครับ";  
  ui.alert(msg);  
}

\`\`\`

\#\# 18\. \`Utils\_Common.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🛠️ Utilities: Common Helper Functions  
 \* Version: 4.0 Enterprise Edition (AI & Batch Preparedness)  
 \* \------------------------------------------------------  
 \* \[PRESERVED\]: Hashing, Haversine Math, Fuzzy Matching, and Smart Naming.  
 \* \[ADDED v4.0\]: chunkArray() helper for AI Batch Processing.  
 \* \[MODIFIED v4.0\]: Enhanced normalizeText() with more logistics-specific stop words.  
 \* \[MODIFIED v4.0\]: genericRetry() upgraded with Enterprise-grade console logging.  
 \* Author: Elite Logistics Architect  
 \*/

// \====================================================  
// 1\. Hashing & ID Generation  
// \====================================================

function md5(key) {  
  if (\!key) return "empty\_hash";  
  var code \= key.toString().toLowerCase().replace(/\\s/g, "");  
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, code)  
    .map(function(char) { return (char \+ 256).toString(16).slice(-2); })  
    .join("");  
}

function generateUUID() {  
  return Utilities.getUuid();  
}

// \====================================================  
// 2\. Text Processing & Normalization  
// \====================================================

/\*\*  
 \* \[MODIFIED v4.0\]: เพิ่ม Stop words สำหรับงาน Logistics (โกดัง, คลังสินค้า, อาคาร ฯลฯ)  
 \* ทำหน้าที่เป็น Tier 2 Resolution (Clean Text)  
 \*/  
function normalizeText(text) {  
  if (\!text) return "";  
  var clean \= text.toString().toLowerCase();  
    
  var stopWordsPattern \= /บริษัท|บจก\\.?|บมจ\\.?|หจก\\.?|ห้างหุ้นส่วน|จำกัด|มหาชน|ส่วนบุคคล|ร้าน|ห้าง|สาขา|สำนักงานใหญ่|store|shop|company|co\\.?|ltd\\.?|inc\\.?|จังหวัด|อำเภอ|ตำบล|เขต|แขวง|ถนน|ซอย|นาย|นาง|นางสาว|โกดัง|คลังสินค้า|หมู่ที่|หมู่|อาคาร|ชั้น/g;  
  clean \= clean.replace(stopWordsPattern, "");

  return clean.replace(/\[^a-z0-9\\u0E00-\\u0E7F\]/g, "");  
}

function cleanDistance(val) {  
  if (\!val && val \!== 0\) return "";  
  var str \= val.toString().replace(/\[^0-9.\]/g, "");   
  var num \= parseFloat(str);  
  return isNaN(num) ? "" : num.toFixed(2);  
}

// \====================================================  
// 3\. 🧠 Smart Naming Logic  
// \====================================================

function getBestName\_Smart(names) {  
  if (\!names || names.length \=== 0\) return "";  
    
  var nameScores \= {};  
  var bestName \= names\[0\];  
  var maxScore \= \-9999;  
    
  names.forEach(function(n) {  
    if (\!n) return;  
    var original \= n.toString().trim();  
    if (original \=== "") return;

    if (\!nameScores\[original\]) {  
       nameScores\[original\] \= { count: 0, score: 0 };  
    }  
    nameScores\[original\].count \+= 1;  
  });

  for (var n in nameScores) {  
    var s \= nameScores\[n\].count \* 10;   
      
    if (/(บริษัท|บจก|หจก|บมจ)/.test(n)) s \+= 5;   
    if (/(จำกัด|มหาชน)/.test(n)) s \+= 5;          
    if (/(สาขา)/.test(n)) s \+= 5;                 
      
    var openBrackets \= (n.match(/\\(/g) || \[\]).length;  
    var closeBrackets \= (n.match(/\\)/g) || \[\]).length;  
      
    if (openBrackets \> 0 && openBrackets \=== closeBrackets) {  
      s \+= 5;   
    } else if (openBrackets \!== closeBrackets) {  
      s \-= 30;   
    }  
      
    if (/\[0-9\]{9,10}/.test(n) || /โทร/.test(n)) s \-= 30;   
    if (/ส่ง|รับ|ติดต่อ/.test(n)) s \-= 10;                  
      
    var len \= n.length;  
    if (len \> 70\) {  
      s \-= (len \- 70);   
    } else if (len \< 5\) {  
      s \-= 10;           
    } else {  
      s \+= (len \* 0.1);  
    }

    nameScores\[n\].score \= s;  
      
    if (s \> maxScore) {  
      maxScore \= s;  
      bestName \= n;  
    }  
  }  
    
  return cleanDisplayName(bestName);  
}

function cleanDisplayName(name) {  
  var clean \= name.toString();  
  clean \= clean.replace(/\\s\*โทร\\.?\\s\*\[0-9-\]{9,12}/g, '');  
  clean \= clean.replace(/\\s\*0\[0-9\]{1,2}-\[0-9\]{3}-\[0-9\]{4}/g, '');  
  clean \= clean.replace(/\\s+/g, ' ').trim();  
  return clean;  
}

// \====================================================  
// 4\. Geo Math & Fuzzy Matching  
// \====================================================

function getHaversineDistanceKM(lat1, lon1, lat2, lon2) {  
  if (\!lat1 || \!lon1 || \!lat2 || \!lon2) return null;  
  var R \= 6371;   
  var dLat \= (lat2 \- lat1) \* Math.PI / 180;  
  var dLon \= (lon2 \- lon1) \* Math.PI / 180;  
  var a \= Math.sin(dLat/2) \* Math.sin(dLat/2) \+  
          Math.cos(lat1 \* Math.PI / 180\) \* Math.cos(lat2 \* Math.PI / 180\) \*  
          Math.sin(dLon/2) \* Math.sin(dLon/2);  
  var c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  
  return parseFloat((R \* c).toFixed(3));   
}

// \====================================================  
// 5\. System Utilities (Logging, Retry & Array Ops)  
// \====================================================

/\*\*  
 \* \[MODIFIED v4.0\]: Enterprise Logging  
 \*/  
function genericRetry(func, maxRetries) {  
  for (var i \= 0; i \< maxRetries; i++) {  
    try { return func(); }   
    catch (e) {  
      if (i \=== maxRetries \- 1\) {  
        console.error("\[GenericRetry\] FATAL ERROR after " \+ maxRetries \+ " attempts: " \+ e.message);  
        throw e;  
      }  
      Utilities.sleep(1000 \* Math.pow(2, i));   
      console.warn("\[GenericRetry\] Attempt " \+ (i \+ 1\) \+ " failed: " \+ e.message \+ ". Retrying...");  
    }  
  }  
}

function safeJsonParse(str) {  
  try { return JSON.parse(str); } catch (e) { return null; }  
}

function checkUnusedFunctions() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var funcs \= \[  
    'calculateSimilarity',  
    'editDistance',   
    'cleanPhoneNumber',  
    'parseThaiDate',  
    'chunkArray'  
  \];  
    
  console.log("=== ตรวจสอบฟังก์ชันที่ไม่ได้ใช้ \===");  
  funcs.forEach(function(name) {  
    var exists \= typeof eval(name) \=== 'function';  
    console.log(name \+ ": " \+ (exists ? "✅ มีอยู่" : "❌ ไม่พบ"));  
  });  
    
  console.log("\\nถ้าทุกตัวแสดง ✅ มีอยู่ แสดงว่าพร้อมลบได้ครับ");  
}

function verifyFunctionsRemoved() {  
  var funcs \= \[  
    'calculateSimilarity',  
    'editDistance',  
    'cleanPhoneNumber',   
    'parseThaiDate',  
    'chunkArray'  
  \];  
    
  var allRemoved \= true;  
    
  funcs.forEach(function(name) {  
    try {  
      var result \= eval('typeof ' \+ name);  
      if (result \=== 'function') {  
        console.log("⚠️ " \+ name \+ " ยังอยู่ → ลบไม่สำเร็จ");  
        allRemoved \= false;  
      } else {  
        console.log("✅ " \+ name \+ " ลบออกแล้ว");  
      }  
    } catch(e) {  
      console.log("✅ " \+ name \+ " ลบออกแล้ว");  
    }  
  });  
    
  if (allRemoved) {  
    console.log("\\n✅ ลบครบทุกฟังก์ชันแล้วครับ");  
  } else {  
    console.log("\\n⚠️ ยังมีฟังก์ชันที่ลบไม่สำเร็จ ตรวจสอบอีกครั้งครับ");  
  }  
}

// \====================================================  
// \[Phase B NEW\] Row Adapter Helpers  
// แปลง raw array ↔ object เพื่อลด magic number  
// \====================================================

/\*\*  
 \* Database sheet  
 \*/  
function dbRowToObject(row) {  
  if (\!row) return null;  
  return {  
    name:             row\[CONFIG.C\_IDX.NAME\],  
    lat:              row\[CONFIG.C\_IDX.LAT\],  
    lng:              row\[CONFIG.C\_IDX.LNG\],  
    suggested:        row\[CONFIG.C\_IDX.SUGGESTED\],  
    confidence:       row\[CONFIG.C\_IDX.CONFIDENCE\],  
    normalized:       row\[CONFIG.C\_IDX.NORMALIZED\],  
    verified:         row\[CONFIG.C\_IDX.VERIFIED\],  
    sysAddr:          row\[CONFIG.C\_IDX.SYS\_ADDR\],  
    googleAddr:       row\[CONFIG.C\_IDX.GOOGLE\_ADDR\],  
    distKm:           row\[CONFIG.C\_IDX.DIST\_KM\],  
    uuid:             row\[CONFIG.C\_IDX.UUID\],  
    province:         row\[CONFIG.C\_IDX.PROVINCE\],  
    district:         row\[CONFIG.C\_IDX.DISTRICT\],  
    postcode:         row\[CONFIG.C\_IDX.POSTCODE\],  
    quality:          row\[CONFIG.C\_IDX.QUALITY\],  
    created:          row\[CONFIG.C\_IDX.CREATED\],  
    updated:          row\[CONFIG.C\_IDX.UPDATED\],  
    coordSource:      row\[CONFIG.C\_IDX.COORD\_SOURCE\],  
    coordConfidence:  row\[CONFIG.C\_IDX.COORD\_CONFIDENCE\],  
    coordLastUpdated: row\[CONFIG.C\_IDX.COORD\_LAST\_UPDATED\],  
    recordStatus:     row\[CONFIG.C\_IDX.RECORD\_STATUS\],  
    mergedToUuid:     row\[CONFIG.C\_IDX.MERGED\_TO\_UUID\]  
  };  
}

function dbObjectToRow(obj) {  
  var row \= new Array(CONFIG.DB\_TOTAL\_COLS).fill("");  
  row\[CONFIG.C\_IDX.NAME\]               \= obj.name             || "";  
  row\[CONFIG.C\_IDX.LAT\]                \= obj.lat              || "";  
  row\[CONFIG.C\_IDX.LNG\]                \= obj.lng              || "";  
  row\[CONFIG.C\_IDX.SUGGESTED\]          \= obj.suggested        || "";  
  row\[CONFIG.C\_IDX.CONFIDENCE\]         \= obj.confidence       || "";  
  row\[CONFIG.C\_IDX.NORMALIZED\]         \= obj.normalized       || "";  
  row\[CONFIG.C\_IDX.VERIFIED\]           \= obj.verified         || false;  
  row\[CONFIG.C\_IDX.SYS\_ADDR\]           \= obj.sysAddr          || "";  
  row\[CONFIG.C\_IDX.GOOGLE\_ADDR\]        \= obj.googleAddr       || "";  
  row\[CONFIG.C\_IDX.DIST\_KM\]            \= obj.distKm           || "";  
  row\[CONFIG.C\_IDX.UUID\]               \= obj.uuid             || "";  
  row\[CONFIG.C\_IDX.PROVINCE\]           \= obj.province         || "";  
  row\[CONFIG.C\_IDX.DISTRICT\]           \= obj.district         || "";  
  row\[CONFIG.C\_IDX.POSTCODE\]           \= obj.postcode         || "";  
  row\[CONFIG.C\_IDX.QUALITY\]            \= obj.quality          || 0;  
  row\[CONFIG.C\_IDX.CREATED\]            \= obj.created          || "";  
  row\[CONFIG.C\_IDX.UPDATED\]            \= obj.updated          || "";  
  row\[CONFIG.C\_IDX.COORD\_SOURCE\]       \= obj.coordSource      || "";  
  row\[CONFIG.C\_IDX.COORD\_CONFIDENCE\]   \= obj.coordConfidence  || 0;  
  row\[CONFIG.C\_IDX.COORD\_LAST\_UPDATED\] \= obj.coordLastUpdated || "";  
  row\[CONFIG.C\_IDX.RECORD\_STATUS\]      \= obj.recordStatus     || "Active";  
  row\[CONFIG.C\_IDX.MERGED\_TO\_UUID\]     \= obj.mergedToUuid     || "";  
  return row;  
}

/\*\*  
 \* NameMapping sheet  
 \*/  
function mapRowToObject(row) {  
  if (\!row) return null;  
  return {  
    variant:    row\[CONFIG.MAP\_IDX.VARIANT\],  
    uid:        row\[CONFIG.MAP\_IDX.UID\],  
    confidence: row\[CONFIG.MAP\_IDX.CONFIDENCE\],  
    mappedBy:   row\[CONFIG.MAP\_IDX.MAPPED\_BY\],  
    timestamp:  row\[CONFIG.MAP\_IDX.TIMESTAMP\]  
  };  
}

function mapObjectToRow(obj) {  
  var row \= new Array(CONFIG.MAP\_TOTAL\_COLS).fill("");  
  row\[CONFIG.MAP\_IDX.VARIANT\]    \= obj.variant    || "";  
  row\[CONFIG.MAP\_IDX.UID\]        \= obj.uid         || "";  
  row\[CONFIG.MAP\_IDX.CONFIDENCE\] \= obj.confidence  || 100;  
  row\[CONFIG.MAP\_IDX.MAPPED\_BY\]  \= obj.mappedBy    || "";  
  row\[CONFIG.MAP\_IDX.TIMESTAMP\]  \= obj.timestamp   || new Date();  
  return row;  
}

/\*\*  
 \* GPS\_Queue sheet  
 \*/  
function queueRowToObject(row) {  
  if (\!row) return null;  
  return {  
    timestamp:    row\[0\],  
    shipToName:   row\[1\],  
    uuidDb:       row\[2\],  
    latLngDriver: row\[3\],  
    latLngDb:     row\[4\],  
    diffMeters:   row\[5\],  
    reason:       row\[6\],  
    approve:      row\[7\],  
    reject:       row\[8\]  
  };  
}

function queueObjectToRow(obj) {  
  return \[  
    obj.timestamp    || "",  
    obj.shipToName   || "",  
    obj.uuidDb       || "",  
    obj.latLngDriver || "",  
    obj.latLngDb     || "",  
    obj.diffMeters   || "",  
    obj.reason       || "",  
    obj.approve      || false,  
    obj.reject       || false  
  \];  
}

/\*\*  
 \* Data sheet (Daily Job)  
 \*/  
function dailyJobRowToObject(row) {  
  if (\!row) return null;  
  return {  
    jobId:          row\[DATA\_IDX.JOB\_ID\],  
    planDelivery:   row\[DATA\_IDX.PLAN\_DELIVERY\],  
    invoiceNo:      row\[DATA\_IDX.INVOICE\_NO\],  
    shipmentNo:     row\[DATA\_IDX.SHIPMENT\_NO\],  
    driverName:     row\[DATA\_IDX.DRIVER\_NAME\],  
    truckLicense:   row\[DATA\_IDX.TRUCK\_LICENSE\],  
    carrierCode:    row\[DATA\_IDX.CARRIER\_CODE\],  
    carrierName:    row\[DATA\_IDX.CARRIER\_NAME\],  
    soldToCode:     row\[DATA\_IDX.SOLD\_TO\_CODE\],  
    soldToName:     row\[DATA\_IDX.SOLD\_TO\_NAME\],  
    shipToName:     row\[DATA\_IDX.SHIP\_TO\_NAME\],  
    shipToAddr:     row\[DATA\_IDX.SHIP\_TO\_ADDR\],  
    latLngScg:      row\[DATA\_IDX.LATLNG\_SCG\],  
    material:       row\[DATA\_IDX.MATERIAL\],  
    qty:            row\[DATA\_IDX.QTY\],  
    qtyUnit:        row\[DATA\_IDX.QTY\_UNIT\],  
    weight:         row\[DATA\_IDX.WEIGHT\],  
    deliveryNo:     row\[DATA\_IDX.DELIVERY\_NO\],  
    destCount:      row\[DATA\_IDX.DEST\_COUNT\],  
    destList:       row\[DATA\_IDX.DEST\_LIST\],  
    scanStatus:     row\[DATA\_IDX.SCAN\_STATUS\],  
    deliveryStatus: row\[DATA\_IDX.DELIVERY\_STATUS\],  
    email:          row\[DATA\_IDX.EMAIL\],  
    totQty:         row\[DATA\_IDX.TOT\_QTY\],  
    totWeight:      row\[DATA\_IDX.TOT\_WEIGHT\],  
    scanInv:        row\[DATA\_IDX.SCAN\_INV\],  
    latLngActual:   row\[DATA\_IDX.LATLNG\_ACTUAL\],  
    ownerLabel:     row\[DATA\_IDX.OWNER\_LABEL\],  
    shopKey:        row\[DATA\_IDX.SHOP\_KEY\]  
  };  
}

\`\`\`

\#\# 19\. \`WebApp.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🌐 WebApp Controller (Enterprise Edition)  
 \* Version: 4.0 Omni-Channel Interface  
 \* \------------------------------------------  
 \* \[PRESERVED\]: URL Parameter handling, Safe Include, Version Control.  
 \* \[ADDED v4.0\]: doPost() for API/Webhook readiness (AppSheet/External Triggers).  
 \* \[ADDED v4.0\]: Page routing logic (e.parameter.page) for multi-view support.  
 \* \[MODIFIED v4.0\]: Enterprise logging tracking for web accesses.  
 \* \[MODIFIED v4.0\]: Safe user context extraction.  
 \* Author: Elite Logistics Architect  
 \*/

/\*\*  
 \* 🖥️ ฟังก์ชันแสดงผลหน้าเว็บ (HTTP GET)  
 \* รองรับ: https://script.google.com/.../exec?q=ค้นหา\&page=Index  
 \*/  
/\*\*  
 \* VERSION: 4.2 — Phase E  
 \* \[Phase E\] แยก doPost() routing เป็น switch/handler map  
 \*/

function doGet(e) {  
  try {  
    console.info("\[WebApp\] GET Request: " \+ JSON.stringify(e.parameter));  
    var page     \= (e && e.parameter && e.parameter.page) ? e.parameter.page : 'Index';  
    var template \= HtmlService.createTemplateFromFile(page);

    template.initialQuery \= (e && e.parameter && e.parameter.q) ? e.parameter.q : "";  
    template.appVersion   \= new Date().getTime();  
    template.isEnterprise \= true;

    var output \= template.evaluate()  
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')  
      .setTitle('🔍 Logistics Master Search (V4.2)')  
      .setFaviconUrl('https://img.icons8.com/color/48/truck--v1.png');

    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);  
    return output;

  } catch(err) {  
    console.error("\[WebApp\] GET Error: " \+ err.message);  
    return HtmlService.createHtmlOutput(  
      '\<div style="font-family:sans-serif;padding:20px;text-align:center;background:\#ffebee;"\>' \+  
      '\<h3 style="color:\#d32f2f;"\>❌ System Error (V4.2)\</h3\>' \+  
      '\<p\>' \+ err.message \+ '\</p\>\</div\>'  
    );  
  }  
}

/\*\*  
 \* \[Phase E\] doPost() — handler map แทน if/else  
 \*/  
function doPost(e) {  
  try {  
    console.info("\[WebApp\] POST Request received.");  
    if (\!e || \!e.postData) throw new Error("No payload found.");

    var payload \= JSON.parse(e.postData.contents);  
    var action  \= payload.action || "";

    // \[Phase E\] Handler map — เพิ่ม action ใหม่ได้ง่าย  
    var handlers \= {  
      "triggerAIBatch": function() {  
        if (typeof processAIIndexing\_Batch \=== 'function') {  
          processAIIndexing\_Batch();  
          return { status: "success", message: "AI Batch triggered" };  
        }  
        return { status: "error", message: "processAIIndexing\_Batch not found" };  
      },  
      "triggerSync": function() {  
        if (typeof syncNewDataToMaster \=== 'function') {  
          return { status: "success", message: "Sync triggered" };  
        }  
        return { status: "error", message: "syncNewDataToMaster not found" };  
      },  
      "healthCheck": function() {  
        try {  
          CONFIG.validateSystemIntegrity();  
          return { status: "success", message: "System healthy" };  
        } catch(e) {  
          return { status: "error", message: e.message };  
        }  
      }  
    };

    if (handlers\[action\]) {  
      return createJsonResponse\_(handlers\[action\]());  
    }

    return createJsonResponse\_({ status: "success", message: "Webhook received", action: action });

  } catch(err) {  
    console.error("\[WebApp\] POST Error: " \+ err.message);  
    return createJsonResponse\_({ status: "error", message: err.message });  
  }  
}

function createJsonResponse\_(obj) {  
  return ContentService.createTextOutput(JSON.stringify(obj))  
                       .setMimeType(ContentService.MimeType.JSON);  
}

function include(filename) {  
  try { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }  
  catch(e) { return "\<\!-- Error: File '" \+ filename \+ "' not found. \--\>"; }  
}

function getUserContext() {  
  try {  
    return {  
      email:  Session.getActiveUser().getEmail() || "anonymous",  
      locale: Session.getActiveUserLocale()      || "th"  
    };  
  } catch(e) {  
    return { email: "unknown", locale: "th" };  
  }  
}

\`\`\`

\#\# 20\. \`Index.html\`

\`\`\`html  
\# การวิเคราะห์โค้ดสำหรับการจัดการและคุณภาพข้อมูล

เอกสารนี้จะวิเคราะห์โค้ดที่เกี่ยวข้องกับการจัดการข้อมูลและคุณภาพข้อมูลในระบบ Logistics Master Data System (LMDS) โดยมุ่งเน้นไปที่ฟังก์ชันและกลไกที่สามารถนำมาใช้หรือปรับปรุงเพื่อแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อที่ระบุไว้

\#\# ไฟล์ที่เกี่ยวข้องหลัก

จากการสำรวจโครงสร้าง Repository และเนื้อหาโค้ดเบื้องต้น ไฟล์ \`.gs\` ที่มีบทบาทสำคัญในการจัดการข้อมูลและคุณภาพข้อมูล ได้แก่:

\*   \`Config.gs\`: กำหนดค่าคงที่ต่างๆ เช่น ชื่อชีต, ดัชนีคอลัมน์, และ API Key ซึ่งเป็นพื้นฐานในการเข้าถึงและจัดการข้อมูล  
\*   \`Service\_Master.gs\`: บรรจุฟังก์ชันหลักในการจัดการ Master Data รวมถึงการคำนวณ Confidence และ Quality Score, การรวมข้อมูลซ้ำ (Merge), และการลบข้อมูล  
\*   \`Service\_AutoPilot.gs\`: มีฟังก์ชัน \`processAIIndexing\_Batch\` ที่ใช้ AI (Gemini) ในการสร้าง Keyword และ Normalization ของชื่อ ซึ่งสำคัญต่อการแก้ไขปัญหาชื่อที่แตกต่างกัน  
\*   \`Service\_GeoAddr.gs\`: จัดการกับการ Geocoding และ Reverse Geocoding เพื่อแปลงที่อยู่เป็นพิกัดและในทางกลับกัน รวมถึงการคำนวณระยะทาง  
\*   \`Service\_SchemaValidator.gs\`: ตรวจสอบความถูกต้องของโครงสร้างชีต ซึ่งเป็นสิ่งสำคัญในการรักษาคุณภาพข้อมูลตั้งแต่ต้น  
\*   \`Service\_Search.gs\`: น่าจะมีฟังก์ชันที่เกี่ยวข้องกับการค้นหาและจับคู่ข้อมูล  
\*   \`Service\_SoftDelete.gs\`: จัดการกับการลบข้อมูลแบบ Soft Delete ซึ่งช่วยในการจัดการข้อมูลซ้ำโดยไม่ลบถาวร

\#\# การวิเคราะห์ฟังก์ชันและกลไกที่เกี่ยวข้อง

\#\#\# 1\. \`Config.gs\`

ไฟล์นี้เป็นหัวใจของการตั้งค่าระบบ กำหนดชื่อชีตหลัก (\`SHEET\_NAME\`: \`Database\`, \`MAPPING\_SHEET\`: \`NameMapping\`, \`SHEET\_POSTAL\`: \`PostalRef\`) และดัชนีคอลัมน์ต่างๆ (\`COL\_NAME\`, \`COL\_LAT\`, \`COL\_LNG\`, \`COL\_UUID\`, \`COL\_PROVINCE\`, \`COL\_DISTRICT\`, \`COL\_POSTCODE\`, \`COL\_QUALITY\`, \`COL\_NORMALIZED\`, \`COL\_VERIFIED\`, \`COL\_RECORD\_STATUS\`, \`COL\_MERGED\_TO\_UUID\` เป็นต้น) รวมถึงดัชนีสำหรับชีต \`NameMapping\` (\`MAP\_COL\_VARIANT\`, \`MAP\_COL\_UID\`) และ \`Data\` (\`DATA\_IDX\`)

\*\*จุดเด่น:\*\*  
\*   \*\*Centralized Configuration:\*\* การรวมการตั้งค่าไว้ที่เดียวทำให้ง่ายต่อการบำรุงรักษาและปรับเปลี่ยน  
\*   \*\*Column Indexing:\*\* การใช้ \`COL\_\` และ \`C\_IDX\` ช่วยให้โค้ดอ่านง่ายและลดข้อผิดพลาดจากการอ้างอิงคอลัมน์ผิด  
\*   \*\*AI\_CONFIG:\*\* มีการกำหนดค่าสำหรับ AI เช่น \`THRESHOLD\_AUTO\_MAP\`, \`THRESHOLD\_REVIEW\`, \`TAG\_AI\`, \`PROMPT\_VERSION\` ซึ่งบ่งชี้ว่าระบบมีการใช้ AI ในการจัดการคุณภาพข้อมูลอยู่แล้ว  
\*   \*\*\`validateSystemIntegrity()\`:\*\* ฟังก์ชันนี้ใช้ตรวจสอบความครบถ้วนของชีตและ API Key ซึ่งเป็นขั้นตอนแรกในการรับรองความพร้อมของระบบ

\#\#\# 2\. \`Service\_Master.gs\`

ไฟล์นี้มีฟังก์ชันสำคัญหลายอย่างที่เกี่ยวข้องโดยตรงกับการจัดการคุณภาพข้อมูล:

\*   \*\*\`createUUID\_Full()\`:\*\* สร้าง UUID ให้กับทุกแถวที่ยังไม่มี UUID ซึ่งสำคัญมากสำหรับการระบุตัวตนของแต่ละ Record และเป็นพื้นฐานในการจัดการข้อมูลซ้ำ  
\*   \*\*\`recalculateAllConfidence()\`:\*\* คำนวณ \`CONFIDENCE\` Score ใหม่สำหรับทุกแถว โดยพิจารณาจากหลายปัจจัย เช่น การยืนยัน (Verified), การมีพิกัด, ที่อยู่จาก Google, จังหวัด/อำเภอ, UUID, และแหล่งที่มาของพิกัด  
\*   \*\*\`recalculateAllQuality()\`:\*\* คำนวณ \`QUALITY\` Score ใหม่สำหรับทุกแถว โดยพิจารณาจากความยาวของชื่อ, การมีพิกัดที่ถูกต้อง, ที่อยู่จาก Google, จังหวัด/อำเภอ, รหัสไปรษณีย์, UUID, และสถานะการยืนยัน  
\*   \*\*\`showLowQualityRows()\`:\*\* แสดงแถวที่มี Quality Score ต่ำกว่า 50% ซึ่งช่วยให้ผู้ใช้สามารถตรวจสอบและแก้ไขข้อมูลที่มีปัญหาได้  
\*   \*\*\`mergeDuplicateRecords\_UI()\` และ \`mergeRecords()\`:\*\* ฟังก์ชันเหล่านี้รองรับการรวมข้อมูลซ้ำ (Merge) โดยผู้ใช้ต้องระบุ Master UUID และ Duplicate UUID ระบบจะทำการ Soft Delete โดยเปลี่ยน \`Record\_Status\` ของ Duplicate เป็น \`Merged\` และบันทึก \`Merged\_To\_UUID\` ซึ่งเป็นกลไกสำคัญในการแก้ไขปัญหาข้อมูลซ้ำ  
\*   \*\*\`finalizeAndClean\_MoveToMapping()\`:\*\* ย้ายข้อมูลที่ถูกรวม (Merged) ไปยัง \`NameMapping\` และลบออกจาก \`Database\` ซึ่งเป็นส่วนหนึ่งของกระบวนการทำความสะอาดข้อมูล  
\*   \*\*\`resetDeepCleanMemory()\`:\*\* รีเซ็ตสถานะการตรวจสอบ Deep Clean ซึ่งบ่งชี้ว่ามีกระบวนการ Deep Clean ที่ทำงานแบบ Batch อยู่  
\*   \*\*\`repairNameMapping\_Full()\`:\*\* ซ่อมแซมชีต \`NameMapping\` โดยลบแถวซ้ำและเติม UUID ให้ครบ

\*\*จุดเด่น:\*\*  
\*   มีกลไกในการคำนวณคะแนน \`Confidence\` และ \`Quality\` ซึ่งเป็นตัวชี้วัดคุณภาพข้อมูลที่ดี  
\*   รองรับการรวมข้อมูลซ้ำด้วยตนเอง (Manual Merge) และการ Soft Delete  
\*   มีฟังก์ชันสำหรับการสร้าง UUID และการซ่อมแซม \`NameMapping\`

\#\#\# 3\. \`Service\_AutoPilot.gs\`

ไฟล์นี้มีฟังก์ชันที่ใช้ AI ในการประมวลผลข้อมูลอัตโนมัติ:

\*   \*\*\`processAIIndexing\_Batch()\`:\*\* เป็นฟังก์ชันหลักที่ใช้ AI (Gemini) ในการสร้าง Keyword และ Normalization ของชื่อลูกค้า โดยจะเรียก \`callGeminiThinking\_JSON()\`  
\*   \*\*\`callGeminiThinking\_JSON(customerName, apiKey)\`:\*\* ส่งชื่อลูกค้าไปยัง Gemini API เพื่อให้ AI วิเคราะห์และส่งคืน JSON List ของ Keyword, คำย่อ, และคำผิดที่พบบ่อย ซึ่งจะถูกนำไปใช้ในคอลัมน์ \`NORMALIZED\` ของชีต \`Database\`  
\*   \*\*\`createBasicSmartKey(text)\`:\*\* สร้าง Basic Smart Key โดยการ Normalize ข้อความ (แปลงเป็นตัวพิมพ์เล็กและลบช่องว่าง) ซึ่งเป็นส่วนหนึ่งของการเตรียมข้อมูลก่อนส่งให้ AI หรือใช้ในการจับคู่เบื้องต้น

\*\*จุดเด่น:\*\*  
\*   มีการใช้ AI (Gemini) ในการทำ Name Normalization และ Keyword Extraction ซึ่งเป็นเครื่องมือที่มีประสิทธิภาพในการแก้ไขปัญหาชื่อที่เขียนไม่เหมือนกัน (ปัญหาข้อ 4\)  
\*   มีกลไกการทำงานแบบ Batch (\`processAIIndexing\_Batch\`) และการ Retry (\`genericRetry\`) เพื่อเพิ่มความทนทานของระบบ

\#\#\# 4\. \`Service\_GeoAddr.gs\`

ไฟล์นี้จัดการกับการ Geocoding และ Reverse Geocoding โดยใช้ Google Maps API:

\*   \*\*\`GOOGLEMAPS\_LATLONG(address)\`:\*\* แปลงที่อยู่เป็นพิกัดละติจูดและลองจิจูด  
\*   \*\*\`GOOGLEMAPS\_ADDRESS(address)\`:\*\* ค้นหาที่อยู่เต็มจากที่อยู่บางส่วนหรือรหัสไปรษณีย์  
\*   \*\*\`GOOGLEMAPS\_REVERSEGEOCODE(latitude, longitude)\`:\*\* แปลงพิกัดละติจูดและลองจิจูดเป็นที่อยู่  
\*   \*\*\`GOOGLEMAPS\_DISTANCE(origin, destination, mode)\`:\*\* คำนวณระยะทางระหว่างสองจุด  
\*   \*\*\`GET\_ADDR\_WITH\_CACHE(lat, lng)\`:\*\* Wrapper สำหรับ Reverse Geocode พร้อม Cache  
\*   \*\*\`CALCULATE\_DISTANCE\_KM(origin, destination)\`:\*\* Wrapper สำหรับคำนวณระยะทางเป็นกิโลเมตร

\*\*จุดเด่น:\*\*  
\*   ใช้ Google Maps API ในการจัดการข้อมูลพิกัดและที่อยู่ ซึ่งมีความแม่นยำสูง  
\*   มีกลไก Cache เพื่อลดการเรียกใช้ API ซ้ำซ้อนและเพิ่มประสิทธิภาพ  
\*   ฟังก์ชันเหล่านี้เป็นพื้นฐานสำคัญในการตรวจสอบและแก้ไขปัญหาที่เกี่ยวข้องกับพิกัดและที่อยู่ (ปัญหาข้อ 2, 3, 5, 6, 7, 8\)

\#\#\# 5\. \`Service\_SchemaValidator.gs\`

\*   \*\*\`SHEET\_SCHEMA\`:\*\* กำหนด Schema สำหรับชีตต่างๆ (\`DATABASE\`, \`NAMEMAPPING\`, \`SCG\_SOURCE\`, \`GPS\_QUEUE\`, \`DATA\`) รวมถึง \`minColumns\` และ \`requiredHeaders\`  
\*   \*\*\`validateSheet\_(schemaKey)\`:\*\* ตรวจสอบความถูกต้องของโครงสร้างชีตตาม Schema ที่กำหนด  
\*   \*\*\`validateSchemas(schemaKeys)\`:\*\* ตรวจสอบหลายชีตพร้อมกัน  
\*   \*\*\`preCheck\_Sync()\`, \`preCheck\_Apply()\`, \`preCheck\_Approve()\`:\*\* ฟังก์ชันสำหรับตรวจสอบ Schema ก่อนการทำงานสำคัญต่างๆ  
\*   \*\*\`runFullSchemaValidation()\`:\*\* รันการตรวจสอบ Schema เต็มรูปแบบและแสดงรายงาน

\*\*จุดเด่น:\*\*  
\*   ช่วยให้มั่นใจว่าโครงสร้างชีตถูกต้องตามที่ระบบต้องการ ซึ่งเป็นสิ่งสำคัญในการป้องกันข้อผิดพลาดที่เกิดจากข้อมูลที่ไม่สอดคล้องกัน  
\*   มี \`requiredHeaders\` ที่ช่วยระบุคอลัมน์ที่จำเป็นสำหรับแต่ละชีต

\#\#\# 6\. \`Service\_Search.gs\`

ไฟล์นี้มีฟังก์ชันที่เกี่ยวข้องกับการค้นหาข้อมูลใน \`Database\` และ \`NameMapping\`:

\*   \*\*\`searchMasterData(searchTerm)\`:\*\* ค้นหาข้อมูลใน \`Database\` โดยใช้ \`searchTerm\`  
\*   \*\*\`searchNameMapping(searchTerm)\`:\*\* ค้นหาข้อมูลใน \`NameMapping\`  
\*   \*\*\`findMasterByUUID(uuid)\`:\*\* ค้นหา Master Data โดยใช้ UUID  
\*   \*\*\`findMappedUUID(variantName)\`:\*\* ค้นหา UUID ที่ถูก Map จาก \`NameMapping\`

\*\*จุดเด่น:\*\*  
\*   เป็นกลไกสำคัญในการค้นหาและดึงข้อมูลจากชีตหลัก ซึ่งจำเป็นสำหรับการตรวจสอบข้อมูลซ้ำและการจับคู่ข้อมูล  
\*   รองรับการค้นหาทั้งจากชื่อและ UUID

\#\#\# 7\. \`Service\_SoftDelete.gs\`

\*   \*\*\`softDeleteRecord(uuid)\`:\*\* เปลี่ยน \`Record\_Status\` ของ Record ที่ระบุ UUID ให้เป็น \`Inactive\`  
\*   \*\*\`hardDeleteRecord(uuid)\`:\*\* ลบ Record ออกจากชีต \`Database\` อย่างถาวร (ควรใช้ด้วยความระมัดระวัง)

\*\*จุดเด่น:\*\*  
\*   มีกลไก Soft Delete ที่ช่วยในการจัดการข้อมูลซ้ำโดยไม่ลบข้อมูลทิ้งไปเลย ทำให้สามารถกู้คืนหรือตรวจสอบย้อนหลังได้

\#\#\# 8\. \`Setup\_Upgrade.gs\`

\*   \*\*\`upgradeDatabaseSchema()\`:\*\* ฟังก์ชันสำหรับอัปเกรด Schema ของ \`Database\` เช่น การเพิ่มคอลัมน์ใหม่ๆ  
\*   \*\*\`migrateDataToNewSchema()\`:\*\* ฟังก์ชันสำหรับย้ายข้อมูลไปยัง Schema ใหม่

\*\*จุดเด่น:\*\*  
\*   แสดงให้เห็นว่าระบบมีการรองรับการเปลี่ยนแปลงโครงสร้างฐานข้อมูลในอนาคต ซึ่งเป็นสิ่งสำคัญสำหรับการบำรุงรักษาระบบในระยะยาว

\#\# สรุปความสามารถที่มีอยู่ในการแก้ไขปัญหาคุณภาพข้อมูล

จากโค้ดที่วิเคราะห์ ระบบมีกลไกและฟังก์ชันหลายอย่างที่สามารถนำมาใช้หรือปรับปรุงเพื่อแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อได้:

\*   \*\*การระบุตัวตนที่ไม่ซ้ำกัน (UUID):\*\* \`createUUID\_Full()\` เป็นพื้นฐานสำคัญในการระบุแต่ละ Record ได้อย่างชัดเจน  
\*   \*\*การ Normalize ชื่อ (AI Indexing):\*\* \`Service\_AutoPilot.gs\` และ \`callGeminiThinking\_JSON()\` มีความสามารถในการ Normalize ชื่อและดึง Keyword ซึ่งช่วยในการจับคู่ชื่อที่เขียนต่างกัน (ปัญหาข้อ 4\)  
\*   \*\*การคำนวณ Quality/Confidence Score:\*\* \`recalculateAllQuality()\` และ \`recalculateAllConfidence()\` ช่วยในการประเมินคุณภาพของข้อมูลแต่ละ Record ซึ่งสามารถใช้เป็นเกณฑ์ในการระบุข้อมูลที่ต้องแก้ไข  
\*   \*\*การรวมข้อมูลซ้ำ (Merge):\*\* \`mergeDuplicateRecords\_UI()\` และ \`mergeRecords()\` รองรับการรวมข้อมูลซ้ำด้วยตนเอง และ \`softDeleteRecord()\` ช่วยในการจัดการ Record ที่ถูกรวม  
\*   \*\*การจัดการพิกัดและที่อยู่:\*\* \`Service\_GeoAddr.gs\` มีฟังก์ชัน Geocoding, Reverse Geocoding และการคำนวณระยะทาง ซึ่งจำเป็นสำหรับการตรวจสอบความถูกต้องของพิกัดและที่อยู่  
\*   \*\*การตรวจสอบ Schema:\*\* \`Service\_SchemaValidator.gs\` ช่วยให้มั่นใจว่าโครงสร้างข้อมูลถูกต้อง  
\*   \*\*การค้นหา:\*\* \`Service\_Search.gs\` ช่วยในการค้นหาข้อมูลเพื่อการตรวจสอบและจับคู่

ในขั้นตอนต่อไป ผมจะนำความเข้าใจเหล่านี้มาออกแบบแนวทางและเสนอโซลูชันสำหรับปัญหาทั้ง 8 ข้อ โดยจะพยายามใช้ประโยชน์จากฟังก์ชันที่มีอยู่ให้มากที่สุด และเสนอการสร้างใหม่ในส่วนที่จำเป็นเท่านั้น

\# แนวทางแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อ

เอกสารนี้จะนำเสนอแนวทางและโซลูชันสำหรับปัญหาคุณภาพข้อมูล 8 ข้อที่ระบุไว้ โดยจะใช้ประโยชน์จากฟังก์ชันที่มีอยู่ในระบบ Logistics Master Data System (LMDS) และเสนอการปรับปรุงหรือสร้างฟังก์ชันใหม่ในส่วนที่จำเป็น เพื่อให้ได้ระบบฐานข้อมูลที่แข็งแกร่งและสะอาด

\#\# หลักการสำคัญในการแก้ไขปัญหา

1\.  \*\*ใช้ประโยชน์จาก UUID:\*\* \`UUID\` เป็นรหัสระบุตัวตนที่ไม่ซ้ำกันสำหรับแต่ละ Record ซึ่งเป็นรากฐานสำคัญในการจัดการข้อมูลซ้ำซ้อนและเชื่อมโยงข้อมูล  
2\.  \*\*Normalization และ AI:\*\* การใช้ AI (Gemini) ในการ Normalize ชื่อและดึง Keyword (\`COL\_NORMALIZED\`) รวมถึงชีต \`NameMapping\` จะช่วยจัดการกับความแตกต่างของการสะกดชื่อ  
3\.  \*\*Geocoding และพิกัด:\*\* การใช้ Google Maps API สำหรับ Geocoding และ Reverse Geocoding (\`Service\_GeoAddr.gs\`) เป็นสิ่งจำเป็นในการตรวจสอบและแก้ไขปัญหาที่เกี่ยวข้องกับพิกัดและที่อยู่  
4\.  \*\*คะแนนคุณภาพ (Quality/Confidence Score):\*\* \`QUALITY\` และ \`CONFIDENCE\` Score เป็นตัวชี้วัดที่ช่วยในการระบุ Record ที่มีปัญหาและจัดลำดับความสำคัญในการแก้ไข  
5\.  \*\*Soft Delete และ Archive:\*\* การใช้ \`Soft Delete\` และ \`Archive\_DB\` ช่วยให้สามารถจัดการข้อมูลซ้ำโดยไม่สูญเสียข้อมูล และสามารถตรวจสอบย้อนหลังได้  
6\.  \*\*DQ\_Review\_Queue:\*\* ชีต \`DQ\_Review\_Queue\` เป็นกลไกสำคัญในการให้ผู้ดูแลระบบตรวจสอบและตัดสินใจในกรณีที่ระบบไม่สามารถแก้ไขปัญหาอัตโนมัติได้  
7\.  \*\*Automated vs. Manual:\*\* แบ่งกระบวนการแก้ไขเป็นแบบอัตโนมัติสำหรับกรณีที่ชัดเจน และแบบกึ่งอัตโนมัติ/Manual สำหรับกรณีที่ซับซ้อนหรือต้องการการตัดสินใจของมนุษย์

\#\# โซลูชันสำหรับปัญหาแต่ละข้อ

\#\#\# 1\. เรื่องชื่อบุคคลซ้ำกัน (Duplicate Person Names)

\*\*ปัญหา:\*\* มี Record ที่เป็นบุคคล/สถานที่เดียวกัน แต่มีชื่อซ้ำกันใน \`Database\`

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*ใช้ \`COL\_NORMALIZED\`:\*\* ระบบจะใช้ \`COL\_NORMALIZED\` (ซึ่งได้จากการประมวลผลของ AI) เพื่อเปรียบเทียบชื่อที่ผ่านการ Normalize แล้ว ซึ่งจะช่วยลดปัญหาการสะกดผิดหรือคำย่อ  
    \*   \*\*Name Fingerprint (Name\_FP):\*\* สร้าง \`Name\_FP\` (Hash) จาก \`Canonical\_Name\` (ชื่อที่ผ่านการปัดคำ เช่น ลบ   
บริษัท, จำกัด, วงเล็บ) เพื่อการเปรียบเทียบที่แม่นยำยิ่งขึ้น  
    \*   \*\*GeoHash:\*\* ใช้ \`Geo\_Hash\` เพื่อระบุ Record ที่อยู่ใกล้เคียงกันทางภูมิศาสตร์ ซึ่งอาจเป็นตัวบ่งชี้ว่ามีข้อมูลซ้ำ  
\*   \*\*การแก้ไข:\*\*  
    \*   \*\*\`mergeDuplicateRecords\_UI()\` / \`mergeRecords()\`:\*\* ใช้ฟังก์ชันที่มีอยู่เพื่อรวม Record ที่ซ้ำกัน โดยเลือก Master UUID และ Soft Delete Record ที่ซ้ำซ้อน  
    \*   \*\*\`DQ\_Review\_Queue\`:\*\* หากระบบไม่สามารถตัดสินใจได้อัตโนมัติ (เช่น Confidence Score ต่ำ หรือมีข้อมูลที่ขัดแย้งกัน) ให้ส่งเข้า \`DQ\_Review\_Queue\` เพื่อให้ผู้ดูแลระบบตรวจสอบและตัดสินใจด้วยตนเอง

\#\#\# 2\. เรื่องชื่อสถานที่อยู่ซ้ำ (Duplicate Location Names)

\*\*ปัญหา:\*\* มี Record ที่เป็นสถานที่เดียวกัน แต่มีชื่อสถานที่อยู่ซ้ำกันใน \`Database\`

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*ใช้ \`Canonical\_Address\`:\*\* สร้าง \`Canonical\_Address\` (ที่อยู่มาตรฐานที่ปรับคำแล้ว เช่น ลบ ซอย, หมู่) เพื่อเปรียบเทียบที่อยู่  
    \*   \*\*Address Fingerprint (Addr\_FP):\*\* สร้าง \`Addr\_FP\` (Hash) จาก \`Canonical\_Address\` เพื่อการเปรียบเทียบที่แม่นยำ  
    \*   \*\*GeoHash:\*\* ใช้ \`Geo\_Hash\` เพื่อระบุ Record ที่อยู่ใกล้เคียงกันทางภูมิศาสตร์  
\*   \*\*การแก้ไข:\*\*  
    \*   เช่นเดียวกับปัญหาชื่อบุคคลซ้ำกัน ใช้ \`mergeDuplicateRecords\_UI()\` / \`mergeRecords()\` และ \`DQ\_Review\_Queue\`

\#\#\# 3\. เรื่อง Lat/Long ซ้ำกัน (Duplicate Lat/Long)

\*\*ปัญหา:\*\* มี Record ที่มีพิกัดละติจูดและลองจิจูด (\`LAT\`, \`LNG\`) เดียวกัน

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*ใช้ \`Lat\_Norm\`, \`Lng\_Norm\` และ \`Geo\_Hash\`:\*\* เปรียบเทียบพิกัดที่ถูก Normalize ให้เหลือ 6 ทศนิยม และ \`Geo\_Hash\` เพื่อการตรวจจับที่รวดเร็วและแม่นยำ  
    \*   \*\*การรวมกับชื่อ:\*\* หากพิกัดซ้ำกันและชื่อ (ทั้ง \`NAME\` และ \`COL\_NORMALIZED\`) ก็คล้ายคลึงกันมาก มีแนวโน้มสูงที่จะเป็นข้อมูลซ้ำ  
\*   \*\*การแก้ไข:\*\*  
    \*   \*\*\`mergeDuplicateRecords\_UI()\` / \`mergeRecords()\`:\*\* หากยืนยันว่าเป็นข้อมูลซ้ำ ให้รวม Record เข้าด้วยกัน  
    \*   \*\*\`DQ\_Review\_Queue\`:\*\* หากพิกัดซ้ำกันแต่ชื่อแตกต่างกันอย่างมีนัยสำคัญ (เช่น บริษัทหลายแห่งในอาคารเดียวกัน) ให้ส่งเข้า \`DQ\_Review\_Queue\` เพื่อการตรวจสอบด้วยตนเอง

\#\#\# 4\. เรื่องบุคคลเดียวกันแต่ชื่อเขียนไม่เหมือนกัน (Same Entity, Different Name Spellings)

\*\*ปัญหา:\*\* บุคคลหรือสถานที่เดียวกัน แต่มีการสะกดชื่อที่แตกต่างกัน (เช่น คำย่อ, คำผิด, ชื่อเต็ม)

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*\`Service\_AutoPilot.gs\` (\`processAIIndexing\_Batch\`, \`callGeminiThinking\_JSON\`):\*\* ระบบมีกลไก AI (Gemini) ที่ใช้ในการสร้าง \`COL\_NORMALIZED\` ซึ่งรวมถึง Keyword, คำย่อ, และคำผิดที่พบบ่อย ซึ่งเป็นหัวใจสำคัญในการแก้ไขปัญหานี้  
    \*   \*\*\`NameMapping\` Sheet:\*\* ชีตนี้ทำหน้าที่เป็นพจนานุกรม โดยเก็บ \`Variant\_Name\` (ชื่อที่เขียนผิด/ย่อ) และ \`Master\_UID\` (UUID ของตัวจริง) ซึ่งช่วยให้ระบบสามารถจับคู่ชื่อที่แตกต่างกันไปยัง Record หลักได้  
\*   \*\*การแก้ไข:\*\*  
    \*   \*\*การสร้าง \`NameMapping\` อัตโนมัติ:\*\* เมื่อ AI ประมวลผล \`COL\_NORMALIZED\` และพบชื่อที่แตกต่างกันแต่มี \`Geo\_Hash\` หรือพิกัดใกล้เคียงกันมาก ระบบสามารถเสนอให้สร้าง \`NameMapping\` อัตโนมัติได้ (โดยมี \`Confidence\_Score\` ที่ระบุว่า AI สร้างขึ้น)  
    \*   \*\*\`repairNameMapping\_Full()\`:\*\* ใช้ฟังก์ชันนี้เพื่อซ่อมแซม \`NameMapping\` หากมีปัญหา  
    \*   \*\*\`DQ\_Review\_Queue\`:\*\* สำหรับกรณีที่ AI ไม่มั่นใจ หรือมีหลาย Variant ที่เป็นไปได้ ให้ส่งเข้า \`DQ\_Review\_Queue\` เพื่อให้ผู้ดูแลระบบยืนยันการจับคู่

\#\#\# 5\. เรื่องบุคคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน (Different Entities, Same Location Name)

\*\*ปัญหา:\*\* มี Record ที่เป็นคนละบุคคล/บริษัท แต่มีชื่อสถานที่อยู่ (\`SYS\_ADDR\`, \`GOOGLE\_ADDR\`, \`Canonical\_Address\`) ที่เหมือนกัน

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*เปรียบเทียบ \`Addr\_FP\` และ \`Geo\_Hash\`:\*\* หาก \`Addr\_FP\` และ \`Geo\_Hash\` เหมือนกัน แต่ \`Name\_FP\` หรือ \`COL\_NORMALIZED\` แตกต่างกันอย่างชัดเจน  
    \*   \*\*การตรวจสอบด้วย AI:\*\* AI สามารถช่วยวิเคราะห์บริบทของชื่อและที่อยู่เพื่อระบุว่าเป็นการซ้ำซ้อนจริงหรือไม่ หรือเป็นกรณีที่ถูกต้อง (เช่น ร้านค้าหลายร้านในห้างสรรพสินค้าเดียวกัน)  
\*   \*\*การแก้ไข:\*\*  
    \*   \*\*\`DQ\_Review\_Queue\`:\*\* กรณีนี้มักจะต้องใช้การตัดสินใจของมนุษย์ เนื่องจากอาจเป็นข้อมูลที่ถูกต้อง ระบบควรส่ง Record เหล่านี้เข้า \`DQ\_Review\_Queue\` พร้อมข้อมูลประกอบ (เช่น ชื่อ, ที่อยู่, พิกัด) เพื่อให้ผู้ดูแลระบบพิจารณา  
    \*   \*\*การเพิ่มข้อมูลระบุตัวตน:\*\* หากเป็นกรณีที่ถูกต้อง อาจต้องพิจารณาเพิ่มคอลัมน์ที่ช่วยระบุตัวตนเพิ่มเติม เช่น \`Unit\_No\`, \`Floor\`, \`Building\_Name\` เพื่อให้ Record มีความแตกต่างกันอย่างชัดเจน

\#\#\# 6\. เรื่องบุคคลชื่อเดียวกัน แต่ชื่อสถานที่อยู่ไม่เหมือนกัน (Same Entity, Different Location Names)

\*\*ปัญหา:\*\* บุคคล/บริษัทเดียวกัน แต่มีชื่อสถานที่อยู่ (\`SYS\_ADDR\`, \`GOOGLE\_ADDR\`, \`Canonical\_Address\`) ที่แตกต่างกัน

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*เปรียบเทียบ \`Name\_FP\` หรือ \`COL\_NORMALIZED\`:\*\* หาก \`Name\_FP\` หรือ \`COL\_NORMALIZED\` เหมือนกัน แต่ \`Addr\_FP\` หรือ \`Geo\_Hash\` แตกต่างกัน  
    \*   \*\*การคำนวณระยะทาง (\`CALCULATE\_DISTANCE\_KM\`):\*\* ใช้ฟังก์ชันนี้เพื่อคำนวณระยะห่างระหว่างพิกัด หากระยะห่างน้อยกว่า \`GPS\_THRESHOLD\_METERS\` (จาก \`SCG\_CONFIG\`) อาจเป็นความคลาดเคลื่อนเล็กน้อย หรือเป็นสาขาที่อยู่ใกล้กันมาก  
\*   \*\*การแก้ไข:\*\*  
    \*   \*\*\`GPS\_Queue\`:\*\* หากความแตกต่างของพิกัดอยู่ในเกณฑ์ที่ยอมรับได้ (เช่น เกิดจากคนขับปักหมุดคลาดเคลื่อนเล็กน้อย) ระบบสามารถส่งเข้า \`GPS\_Queue\` เพื่อให้ผู้ดูแลระบบพิจารณาอนุมัติพิกัดใหม่ หรือใช้พิกัดเดิม  
    \*   \*\*การสร้าง Record ใหม่:\*\* หากความแตกต่างของที่อยู่และพิกัดมีนัยสำคัญ (เช่น เป็นสาขาอื่นของบริษัทเดียวกัน) ระบบควรสร้าง Record ใหม่ใน \`Database\` โดยมี \`UUID\` ใหม่ แต่ยังคงเชื่อมโยงกับ \`Canonical\_Name\` เดิม (อาจเพิ่มคอลัมน์ \`Branch\_Name\` หรือ \`Location\_Type\`)  
    \*   \*\*\`DQ\_Review\_Queue\`:\*\* สำหรับกรณีที่ซับซ้อนหรือต้องการการตัดสินใจ เช่น เป็นการย้ายที่อยู่ของบริษัทเดิม หรือเป็นสาขาใหม่

\#\#\# 7\. เรื่องบุคคลชื่อเดียวกัน แต่เลข Lat Long คนละที่ ไม่เหมือนกัน (Same Entity, Different Lat/Long)

\*\*ปัญหา:\*\* บุคคล/บริษัทเดียวกัน แต่มีพิกัด (\`LAT\`, \`LNG\`) ที่แตกต่างกันอย่างมีนัยสำคัญ

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*เปรียบเทียบ \`Name\_FP\` หรือ \`COL\_NORMALIZED\`:\*\* หากชื่อเหมือนกัน แต่พิกัด (\`Lat\_Norm\`, \`Lng\_Norm\`, \`Geo\_Hash\`) แตกต่างกัน  
    \*   \*\*\`CALCULATE\_DISTANCE\_KM\`:\*\* คำนวณระยะห่างระหว่างพิกัดเพื่อประเมินความแตกต่าง  
\*   \*\*การแก้ไข:\*\*  
    \*   \*\*\`GPS\_Queue\`:\*\* หากพิกัดที่เข้ามาใหม่จากคนขับ (\`LatLng\_Driver\`) แตกต่างจากพิกัดใน \`Database\` (\`LatLng\_DB\`) เกิน \`GPS\_THRESHOLD\_METERS\` ระบบจะส่งเข้า \`GPS\_Queue\` เพื่อให้ผู้ดูแลระบบพิจารณาอนุมัติหรือปฏิเสธพิกัดใหม่  
    \*   \*\*การอัปเดตพิกัด:\*\* หากผู้ดูแลระบบอนุมัติพิกัดใหม่ ระบบควรใช้ \`Service\_Master.gs\` เพื่ออัปเดต \`LAT\`, \`LNG\`, \`Coord\_Source\`, \`Coord\_Confidence\`, \`Coord\_Last\_Updated\` ใน Record เดิม  
    \*   \*\*การสร้าง Record ใหม่:\*\* หากพิกัดที่แตกต่างกันนั้นเป็นสถานที่ใหม่ของบุคคล/บริษัทเดียวกัน (เช่น สาขา) ควรสร้าง Record ใหม่พร้อม UUID ใหม่

\#\#\# 8\. เรื่องบุคคลคนละชื่อ แต่ เลข Lat Long ที่เดียวกัน (Different Entities, Same Lat/Long)

\*\*ปัญหา:\*\* มี Record ที่เป็นคนละบุคคล/บริษัท แต่มีพิกัด (\`LAT\`, \`LNG\`) ที่เหมือนกัน

\*\*แนวทางแก้ไข:\*\*

\*   \*\*การตรวจจับ:\*\*  
    \*   \*\*เปรียบเทียบ \`Lat\_Norm\`, \`Lng\_Norm\` และ \`Geo\_Hash\`:\*\* หากพิกัดเหมือนกัน แต่ \`Name\_FP\` หรือ \`COL\_NORMALIZED\` แตกต่างกันอย่างชัดเจน  
\*   \*\*การแก้ไข:\*\*  
    \*   \*\*\`DQ\_Review\_Queue\`:\*\* เช่นเดียวกับปัญหาข้อ 5 กรณีนี้มักจะต้องใช้การตัดสินใจของมนุษย์ ระบบควรส่ง Record เหล่านี้เข้า \`DQ\_Review\_Queue\` พร้อมข้อมูลประกอบ เพื่อให้ผู้ดูแลระบบพิจารณาว่าเป็นการซ้ำซ้อนที่ต้องรวม หรือเป็นข้อมูลที่ถูกต้องแต่มีพิกัดร่วมกัน (เช่น บริษัทหลายแห่งในอาคารเดียวกัน)  
    \*   \*\*การเพิ่มข้อมูลระบุตัวตน:\*\* หากเป็นกรณีที่ถูกต้อง อาจต้องพิจารณาเพิ่มคอลัมน์ที่ช่วยระบุตัวตนเพิ่มเติม เช่น \`Unit\_No\`, \`Floor\`, \`Building\_Name\` เพื่อให้ Record มีความแตกต่างกันอย่างชัดเจน

\#\# สรุปและข้อเสนอแนะเพิ่มเติม

ระบบ LMDS มีโครงสร้างและฟังก์ชันพื้นฐานที่ดีในการจัดการคุณภาพข้อมูลอยู่แล้ว โดยเฉพาะการใช้ UUID, AI ในการ Normalize ชื่อ, และการจัดการพิกัด การปรับปรุงจะเน้นไปที่การเชื่อมโยงฟังก์ชันเหล่านี้เข้าด้วยกันอย่างมีประสิทธิภาพมากขึ้น และการใช้ \`DQ\_Review\_Queue\` เป็นจุดตัดสินใจสำหรับกรณีที่ซับซ้อน

\*\*ข้อเสนอแนะเพิ่มเติม:\*\*

\*   \*\*Automated Data Quality Check:\*\* พัฒนาฟังก์ชัน \`runDataQualityCheck\_Full()\` (ที่กล่าวถึงใน \`Setup\_Guide\_V4\_5.md\`) ให้ครอบคลุมการตรวจสอบปัญหาทั้ง 8 ข้อนี้ โดยอาจรันเป็น Trigger แบบ Time-driven เพื่อตรวจสอบและสร้าง Case ใน \`DQ\_Review\_Queue\` โดยอัตโนมัติ  
\*   \*\*UI สำหรับ \`DQ\_Review\_Queue\`:\*\* สร้าง UI ที่ใช้งานง่ายใน Google Sheets สำหรับผู้ดูแลระบบในการตรวจสอบและตัดสินใจใน \`DQ\_Review\_Queue\` โดยมีปุ่มสำหรับ   
Merge, Reject, หรือ Edit Record ได้โดยตรง  
\*   \*\*การสร้าง Fingerprint (Hash):\*\* เพิ่มฟังก์ชันใน \`Utils\_Common.gs\` เพื่อสร้าง \`Name\_FP\` และ \`Addr\_FP\` จาก \`Canonical\_Name\` และ \`Canonical\_Address\` เพื่อใช้ในการเปรียบเทียบข้อมูลซ้ำอย่างมีประสิทธิภาพ  
\*   \*\*การปรับปรุง \`COL\_NORMALIZED\`:\*\* พิจารณาปรับปรุง \`callGeminiThinking\_JSON\` เพื่อให้ได้ Keyword ที่ครอบคลุมและแม่นยำยิ่งขึ้น โดยอาจรวมถึงการใช้ Synonym Dictionary หรือการเรียนรู้จากข้อมูลที่ผู้ใช้แก้ไข  
\*   \*\*การจัดการ \`Inactive\` และ \`Merged\` Record:\*\* ตรวจสอบให้แน่ใจว่า Record ที่มี \`Record\_Status\` เป็น \`Inactive\` หรือ \`Merged\` จะไม่ถูกนำมาพิจารณาในการตรวจจับข้อมูลซ้ำในกระบวนการปกติ แต่ยังคงสามารถค้นหาและตรวจสอบได้ใน \`Archive\_DB\`  
\*   \*\*การแจ้งเตือน:\*\* เพิ่มระบบแจ้งเตือน (เช่น Line Notify หรือ Email) เมื่อมี Case ใหม่ใน \`DQ\_Review\_Queue\` หรือ \`GPS\_Queue\` เพื่อให้ผู้ดูแลระบบสามารถดำเนินการได้อย่างรวดเร็ว

ด้วยแนวทางเหล่านี้ ระบบ LMDS จะสามารถจัดการกับปัญหาคุณภาพข้อมูลทั้ง 8 ข้อได้อย่างมีประสิทธิภาพ ทำให้ฐานข้อมูลมีความแข็งแกร่ง สะอาด และพร้อมใช้งานมากยิ่งขึ้น

\# ข้อเสนอแนะสำหรับการสร้างฐานข้อมูล การจัดเก็บข้อมูล และกระบวนการทำความสะอาดข้อมูล

เอกสารนี้จะนำเสนอข้อเสนอแนะเชิงลึกสำหรับการสร้างฐานข้อมูล การจัดเก็บข้อมูล และกระบวนการทำความสะอาดข้อมูลในระบบ Logistics Master Data System (LMDS) โดยอ้างอิงจากโครงสร้างและฟังก์ชันที่มีอยู่ รวมถึงแนวทางแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อที่ได้วิเคราะห์ไปแล้ว

\#\# 1\. การสร้างฐานข้อมูล (Database Creation)

ฐานข้อมูลหลักของระบบ LMDS คือ Google Sheet ที่ชื่อว่า \`Database\` ซึ่งทำหน้าที่เป็น Master Data สำหรับเก็บข้อมูลลูกค้าและสถานที่ต่างๆ การสร้างฐานข้อมูลที่มีประสิทธิภาพเริ่มต้นจากการออกแบบโครงสร้างชีตที่เหมาะสม

\#\#\# 1.1 โครงสร้างชีต \`Database\`

ชีต \`Database\` ควรมีคอลัมน์ที่จำเป็นทั้งหมดตามที่กำหนดใน \`Config.gs\` และที่ได้วิเคราะห์ไว้ในเอกสารโครงสร้าง Google Sheets เพื่อรองรับข้อมูลที่ครบถ้วนและกลไกการทำงานของระบบ

\*\*คอลัมน์สำคัญที่ต้องมี:\*\*

\*   \*\*\`UUID\` (คอลัมน์ K):\*\* เป็นคอลัมน์ที่สำคัญที่สุด ทำหน้าที่เป็น Primary Key สำหรับแต่ละ Record ต้องมั่นใจว่าทุก Record มี \`UUID\` ที่ไม่ซ้ำกันและไม่เป็นค่าว่าง ฟังก์ชัน \`createUUID\_Full()\` ใน \`Service\_Master.gs\` มีบทบาทสำคัญในการสร้างและเติม \`UUID\` ให้ครบถ้วน  
\*   \*\*\`NAME\` (คอลัมน์ A):\*\* ชื่อลูกค้า/สถานที่ เป็นข้อมูลหลักที่ใช้ในการระบุตัวตน  
\*   \*\*\`LAT\`, \`LNG\` (คอลัมน์ B, C):\*\* พิกัดละติจูดและลองจิจูด ซึ่งเป็นข้อมูลสำคัญสำหรับการระบุตำแหน่งทางภูมิศาสตร์  
\*   \*\*\`COL\_NORMALIZED\` (คอลัมน์ F):\*\* คอลัมน์นี้จะเก็บชื่อที่ผ่านการ Normalize และ Keyword ที่ได้จาก AI (Gemini) ซึ่งมีความสำคัญอย่างยิ่งในการจับคู่ชื่อที่แตกต่างกัน  
\*   \*\*\`VERIFIED\` (คอลัมน์ G):\*\* สถานะการยืนยันข้อมูล (True/False) บ่งบอกว่าข้อมูลนี้ได้รับการตรวจสอบและยืนยันโดยมนุษย์แล้ว  
\*   \*\*\`SYS\_ADDR\`, \`GOOGLE\_ADDR\` (คอลัมน์ H, I):\*\* ที่อยู่ที่ระบบสร้างขึ้นและที่อยู่จาก Google Maps เพื่อความถูกต้องและครบถ้วนของข้อมูลที่อยู่  
\*   \*\*\`PROVINCE\`, \`DISTRICT\`, \`POSTCODE\` (คอลัมน์ L, M, N):\*\* ข้อมูลที่อยู่ระดับจังหวัด อำเภอ และรหัสไปรษณีย์ ซึ่งได้จากการ Geocoding  
\*   \*\*\`QUALITY\`, \`CONFIDENCE\` (คอลัมน์ O, E):\*\* คะแนนคุณภาพและความมั่นใจของข้อมูล ใช้เป็นตัวชี้วัดและจัดลำดับความสำคัญในการทำความสะอาดข้อมูล  
\*   \*\*\`RECORD\_STATUS\` (คอลัมน์ U):\*\* สถานะของ Record (\`Active\`, \`Inactive\`, \`Merged\`) เพื่อรองรับการทำ Soft Delete  
\*   \*\*\`MERGED\_TO\_UUID\` (คอลัมน์ V):\*\* ใช้เก็บ \`UUID\` ของ Record หลักที่ถูกรวมด้วย ในกรณีที่ Record นี้ถูก Soft Delete เนื่องจากเป็นข้อมูลซ้ำ  
\*   \*\*\`Canonical\_Name\`, \`Canonical\_Address\` (คอลัมน์ W, X):\*\* ชื่อและที่อยู่มาตรฐานที่ผ่านการปัดคำ (เช่น ลบคำว่า   
บริษัท, จำกัด) เพื่อใช้ในการเปรียบเทียบและจับคู่ข้อมูล  
\*   \*\*\`Name\_FP\`, \`Addr\_FP\` (คอลัมน์ Y, Z):\*\* ลายนิ้วมือ (Hash) ของชื่อและที่อยู่ เพื่อการเปรียบเทียบข้อมูลซ้ำอย่างรวดเร็วและแม่นยำ  
\*   \*\*\`Lat\_Norm\`, \`Lng\_Norm\` (คอลัมน์ AA, AB):\*\* พิกัดที่ถูก Normalize ให้เหลือ 6 ทศนิยม เพื่อใช้ในการเปรียบเทียบพิกัดที่อาจมีความคลาดเคลื่อนเล็กน้อย  
\*   \*\*\`Geo\_Hash\` (คอลัมน์ AC):\*\* ค่า GeoHash สำหรับการค้นหาข้อมูลในพื้นที่ใกล้เคียงอย่างมีประสิทธิภาพ

\#\#\# 1.2 ชีตอื่นๆ ที่เกี่ยวข้อง

\*   \*\*\`NameMapping\`:\*\* ทำหน้าที่เป็นพจนานุกรมสำหรับชื่อที่แตกต่างกัน โดยเชื่อมโยง \`Variant\_Name\` กับ \`Master\_UID\` (UUID ของ Record หลักใน \`Database\`) ควรมีการจัดการให้ \`NameMapping\` เป็นปัจจุบันอยู่เสมอ  
\*   \*\*\`DQ\_Review\_Queue\`:\*\* ชีตนี้เป็นพื้นที่สำหรับ Record ที่ระบบตรวจพบว่าอาจมีปัญหาคุณภาพข้อมูล (เช่น ข้อมูลซ้ำซ้อนที่ระบบไม่สามารถตัดสินใจอัตโนมัติได้) และต้องการการตรวจสอบจากผู้ดูแลระบบ  
\*   \*\*\`GPS\_Queue\`:\*\* ใช้สำหรับ Record ที่พิกัดจากคนขับแตกต่างจาก Master Data เกินเกณฑ์ที่กำหนด เพื่อให้ผู้ดูแลระบบพิจารณาอนุมัติหรือปฏิเสธ  
\*   \*\*\`Archive\_DB\`:\*\* ชีตสำหรับเก็บ Record ที่มี \`Record\_Status\` เป็น \`Inactive\` หรือ \`Merged\` เพื่อลดภาระของชีต \`Database\` หลักและคงประสิทธิภาพการทำงาน  
\*   \*\*\`PostalRef\`:\*\* ชีตอ้างอิงสำหรับข้อมูลรหัสไปรษณีย์ ซึ่งใช้ในการ Geocoding และตรวจสอบความถูกต้องของที่อยู่

\#\# 2\. การจัดเก็บข้อมูล (Data Storage)

ระบบ LMDS ใช้ Google Sheets เป็นฐานข้อมูลหลัก ซึ่งมีข้อดีในด้านความง่ายในการเข้าถึงและจัดการ แต่ก็มีข้อจำกัดในด้านประสิทธิภาพเมื่อข้อมูลมีขนาดใหญ่ขึ้น

\#\#\# 2.1 ข้อควรพิจารณาในการจัดเก็บ

\*   \*\*ประสิทธิภาพ:\*\* เมื่อจำนวน Record ในชีต \`Database\` เพิ่มขึ้นมาก (เช่น เกิน 10,000-20,000 แถว) ประสิทธิภาพของ Google Apps Script อาจลดลงอย่างเห็นได้ชัด การใช้ \`Archive\_DB\` และการทำ Soft Delete จะช่วยลดภาระของชีตหลักได้  
\*   \*\*การสำรองข้อมูล:\*\* ควรมีการสำรองข้อมูลของ Google Sheets เป็นประจำ เพื่อป้องกันการสูญหายของข้อมูลที่อาจเกิดจากความผิดพลาดของผู้ใช้หรือระบบ  
\*   \*\*การเข้าถึง:\*\* ควรกำหนดสิทธิ์การเข้าถึง Google Sheets อย่างเหมาะสม เพื่อป้องกันการแก้ไขข้อมูลโดยไม่ได้รับอนุญาต

\#\#\# 2.2 การเพิ่มประสิทธิภาพการจัดเก็บ

\*   \*\*Batch Operations:\*\* ใช้การดำเนินการแบบ Batch (\`setValues\`, \`getValues\`) แทนการอ่าน/เขียนทีละเซลล์ เพื่อลดจำนวนการเรียกใช้ Google Sheets API  
\*   \*\*Caching:\*\* ระบบมีการใช้ Caching ใน \`Service\_GeoAddr.gs\` ซึ่งช่วยลดการเรียกใช้ Google Maps API การขยายการใช้ Caching ไปยังส่วนอื่นๆ ที่มีการเข้าถึงข้อมูลซ้ำๆ จะช่วยเพิ่มประสิทธิภาพได้  
\*   \*\*Indexing:\*\* แม้ Google Sheets จะไม่มีระบบ Indexing เหมือนฐานข้อมูลเชิงสัมพันธ์ แต่การใช้คอลัมน์ \`UUID\`, \`Name\_FP\`, \`Addr\_FP\`, \`Geo\_Hash\` และ \`COL\_NORMALIZED\` เป็นเหมือน   
Index เทียมที่ช่วยในการค้นหาและจับคู่ข้อมูล

\#\# 3\. กระบวนการทำความสะอาดข้อมูล (Data Cleansing Process)

กระบวนการทำความสะอาดข้อมูลเป็นหัวใจสำคัญในการรักษาคุณภาพของฐานข้อมูล LMDS โดยควรเป็นกระบวนการที่ต่อเนื่องและมีการทำงานทั้งแบบอัตโนมัติและแบบ Manual

\#\#\# 3.1 การทำความสะอาดข้อมูลอัตโนมัติ (Automated Cleansing)

ระบบมีฟังก์ชันหลายอย่างที่สามารถทำงานอัตโนมัติได้:

\*   \*\*การสร้าง UUID อัตโนมัติ:\*\* \`createUUID\_Full()\` ควรถูกเรียกใช้เป็นประจำเพื่อให้มั่นใจว่าทุก Record มี \`UUID\` ที่ไม่ซ้ำกัน  
\*   \*\*AI Indexing และ Normalization:\*\* \`processAIIndexing\_Batch()\` ใน \`Service\_AutoPilot.gs\` ควรถูกตั้งค่าให้รันเป็น Trigger แบบ Time-driven (เช่น ทุกคืน) เพื่อประมวลผลชื่อใหม่ๆ และสร้าง \`COL\_NORMALIZED\` ซึ่งเป็นสิ่งสำคัญในการแก้ไขปัญหาชื่อที่แตกต่างกัน  
\*   \*\*การคำนวณ Quality/Confidence Score:\*\* \`recalculateAllQuality()\` และ \`recalculateAllConfidence()\` ควรถูกรันเป็นประจำเพื่ออัปเดตคะแนนคุณภาพและความมั่นใจของข้อมูล ซึ่งช่วยในการระบุ Record ที่มีปัญหา  
\*   \*\*การซ่อมแซม \`NameMapping\`:\*\* \`repairNameMapping\_Full()\` ควรถูกรันเป็นระยะเพื่อรักษาความถูกต้องของชีต \`NameMapping\`  
\*   \*\*การ Archive ข้อมูลเก่า:\*\* \`autoArchiveInactiveRecords\_UI()\` (หรือฟังก์ชันที่คล้ายกัน) ควรถูกตั้งค่าให้รันเป็น Trigger เพื่อย้าย Record ที่ \`Inactive\` หรือ \`Merged\` ไปยัง \`Archive\_DB\` เพื่อลดขนาดของชีต \`Database\` หลัก

\#\#\# 3.2 การทำความสะอาดข้อมูลแบบกึ่งอัตโนมัติและ Manual (Semi-Automated & Manual Cleansing)

สำหรับปัญหาที่ซับซ้อนหรือต้องการการตัดสินใจของมนุษย์ ระบบมีกลไกดังนี้:

\*   \*\*\`DQ\_Review\_Queue\`:\*\* ชีตนี้เป็นศูนย์กลางสำหรับการจัดการปัญหาคุณภาพข้อมูลที่ต้องการการตรวจสอบจากมนุษย์  
    \*   \*\*การสร้าง Case อัตโนมัติ:\*\* ควรพัฒนาฟังก์ชัน \`runDataQualityCheck\_Full()\` (ที่กล่าวถึงใน \`Setup\_Guide\_V4\_5.md\`) ให้สามารถตรวจจับปัญหาทั้ง 8 ข้อ และสร้าง Case ใน \`DQ\_Review\_Queue\` โดยอัตโนมัติเมื่อพบความผิดปกติ  
    \*   \*\*UI สำหรับการตรวจสอบ:\*\* ควรสร้าง User Interface (UI) ใน Google Sheets หรือ WebApp เพื่อให้ผู้ดูแลระบบสามารถดู Case ใน \`DQ\_Review\_Queue\` ได้อย่างง่ายดาย พร้อมปุ่มสำหรับ:  
        \*   \*\*Merge:\*\* รวม Record ที่ซ้ำกัน โดยระบุ Master UUID และ Duplicate UUID (เรียกใช้ \`mergeRecords()\`)  
        \*   \*\*Reject/Ignore:\*\* ปฏิเสธ Case หรือทำเครื่องหมายว่าตรวจสอบแล้วและไม่จำเป็นต้องดำเนินการใดๆ  
        \*   \*\*Edit:\*\* แก้ไขข้อมูลใน Record โดยตรง  
\*   \*\*\`GPS\_Queue\`:\*\* ชีตนี้ใช้สำหรับจัดการพิกัดที่คนขับปักหมุดแตกต่างจาก Master Data  
    \*   \*\*การตรวจสอบและอนุมัติ:\*\* ผู้ดูแลระบบควรตรวจสอบ Case ใน \`GPS\_Queue\` และตัดสินใจว่าจะอนุมัติพิกัดใหม่จากคนขับ หรือใช้พิกัดเดิมจาก Master Data  
    \*   \*\*UI สำหรับการจัดการ:\*\* ควรมี UI ที่ช่วยให้ผู้ดูแลระบบสามารถดูข้อมูลเปรียบเทียบพิกัดเดิมและพิกัดใหม่ พร้อมปุ่ม \`Approve\` หรือ \`Reject\` (ซึ่งจะเรียกใช้ฟังก์ชันที่เกี่ยวข้องในการอัปเดตพิกัดใน \`Database\`)  
\*   \*\*\`showLowQualityRows()\`:\*\* ฟังก์ชันนี้ช่วยให้ผู้ดูแลระบบสามารถระบุ Record ที่มี Quality Score ต่ำกว่าเกณฑ์ที่กำหนด และดำเนินการแก้ไขด้วยตนเอง

\#\#\# 3.3 การปรับปรุงกระบวนการทำความสะอาดข้อมูล

\*   \*\*การสร้าง Fingerprint (Hash):\*\* พัฒนาฟังก์ชันใน \`Utils\_Common.gs\` เพื่อสร้าง \`Name\_FP\` และ \`Addr\_FP\` จาก \`Canonical\_Name\` และ \`Canonical\_Address\` การใช้ Hash จะช่วยให้การเปรียบเทียบข้อมูลซ้ำรวดเร็วและแม่นยำยิ่งขึ้น โดยเฉพาะเมื่อข้อมูลมีจำนวนมาก  
\*   \*\*การปรับปรุง \`COL\_NORMALIZED\`:\*\* พิจารณาปรับปรุง \`callGeminiThinking\_JSON\` เพื่อให้ได้ Keyword ที่ครอบคลุมและแม่นยำยิ่งขึ้น โดยอาจรวมถึงการใช้ Synonym Dictionary หรือการเรียนรู้จากข้อมูลที่ผู้ใช้แก้ไข  
\*   \*\*การจัดการ \`Inactive\` และ \`Merged\` Record:\*\* ตรวจสอบให้แน่ใจว่า Record ที่มี \`Record\_Status\` เป็น \`Inactive\` หรือ \`Merged\` จะไม่ถูกนำมาพิจารณาในการตรวจจับข้อมูลซ้ำในกระบวนการปกติ แต่ยังคงสามารถค้นหาและตรวจสอบได้ใน \`Archive\_DB\`  
\*   \*\*การแจ้งเตือน:\*\* เพิ่มระบบแจ้งเตือน (เช่น Line Notify หรือ Email) เมื่อมี Case ใหม่ใน \`DQ\_Review\_Queue\` หรือ \`GPS\_Queue\` เพื่อให้ผู้ดูแลระบบสามารถดำเนินการได้อย่างรวดเร็ว  
\*   \*\*การกำหนดกฎเกณฑ์ (Business Rules):\*\* กำหนดกฎเกณฑ์ที่ชัดเจนสำหรับการตัดสินใจใน \`DQ\_Review\_Queue\` และ \`GPS\_Queue\` เพื่อให้การทำความสะอาดข้อมูลเป็นไปในทิศทางเดียวกันและสอดคล้องกับความต้องการทางธุรกิจ

ด้วยการนำข้อเสนอแนะเหล่านี้ไปปรับใช้ ระบบ LMDS จะมีกระบวนการจัดการข้อมูลที่มีประสิทธิภาพมากขึ้น สามารถรักษาคุณภาพของข้อมูลให้สูงอยู่เสมอ และลดภาระในการแก้ไขข้อมูลด้วยตนเองลงได้ในระยะยาว

\# แนวคิดและกลยุทธ์ส่วนตัวในการพัฒนาโปรเจกต์ LMDS

หากโปรเจกต์ Logistics Master Data System (LMDS) นี้เป็นของผมเอง ผมจะมุ่งเน้นการพัฒนาไปที่การสร้างระบบจัดการคุณภาพข้อมูลแบบองค์รวม (Holistic Data Quality Management System) ที่ทำงานอย่างชาญฉลาดและลดภาระการทำงานของมนุษย์ให้มากที่สุด โดยใช้ประโยชน์จาก AI และ Automation ที่มีอยู่แล้วให้เกิดประโยชน์สูงสุด และเสริมสร้างในส่วนที่ยังขาดหายไป เพื่อให้ฐานข้อมูลมีความน่าเชื่อถือและพร้อมใช้งานสำหรับการวิเคราะห์และตัดสินใจทางธุรกิจ

\#\# วิสัยทัศน์หลัก

\*\*"Smart, Self-Healing Master Data: Empowering Logistics with Trustworthy Information"\*\*

ระบบ LMDS จะไม่เป็นเพียงแค่ที่เก็บข้อมูล แต่จะเป็นระบบที่สามารถเรียนรู้ ตรวจจับ และแก้ไขปัญหาคุณภาพข้อมูลได้ด้วยตัวเองในระดับหนึ่ง และส่งต่อเฉพาะกรณีที่ซับซ้อนให้มนุษย์ตัดสินใจ โดยมีเป้าหมายสูงสุดคือการสร้าง Master Data ที่สะอาด แม่นยำ และเป็นแหล่งข้อมูลเดียวที่เชื่อถือได้สำหรับทุกระบบที่เกี่ยวข้อง

\#\# กลยุทธ์การพัฒนา (Roadmap)

ผมจะแบ่งการพัฒนาออกเป็นเฟสๆ โดยแต่ละเฟสจะมุ่งเน้นไปที่การเพิ่มขีดความสามารถในการจัดการคุณภาพข้อมูล:

\#\#\# เฟส 1: เสริมสร้างรากฐานและ Automation (Foundation & Automation)

ในเฟสนี้จะเน้นการทำให้กระบวนการพื้นฐานแข็งแกร่งและทำงานอัตโนมัติให้มากที่สุด

1\.  \*\*Implement Fingerprinting for Names and Addresses:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* เพิ่มฟังก์ชัน \`generateNameFingerprint(canonicalName)\` และ \`generateAddressFingerprint(canonicalAddress)\` ใน \`Utils\_Common.gs\` เพื่อสร้าง \`Name\_FP\` และ \`Addr\_FP\` (Hash Value) จาก \`Canonical\_Name\` และ \`Canonical\_Address\` ตามลำดับ  
    \*   \*\*เหตุผล:\*\* การใช้ Fingerprint จะช่วยให้การตรวจจับข้อมูลซ้ำ (Duplicate Detection) รวดเร็วและแม่นยำขึ้นอย่างมาก โดยเฉพาะเมื่อข้อมูลมีขนาดใหญ่ และลดภาระการเปรียบเทียบ String ที่ซับซ้อน  
    \*   \*\*การใช้งาน:\*\* คอลัมน์ \`Name\_FP\` และ \`Addr\_FP\` จะถูกเพิ่มในชีต \`Database\` และถูกคำนวณอัตโนมัติเมื่อมีการสร้างหรืออัปเดต Record

2\.  \*\*Enhance AI Indexing for \`COL\_NORMALIZED\`:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* ปรับปรุง \`callGeminiThinking\_JSON()\` ใน \`Service\_AutoPilot.gs\` ให้สามารถดึง Keyword ที่หลากหลายและครอบคลุมมากขึ้น โดยอาจพิจารณาเพิ่มการใช้ Synonym Dictionary หรือการเรียนรู้จาก Feedback ของผู้ใช้  
    \*   \*\*เหตุผล:\*\* \`COL\_NORMALIZED\` เป็นหัวใจสำคัญในการแก้ไขปัญหาชื่อที่แตกต่างกัน (ปัญหาข้อ 4\) การทำให้ AI ฉลาดขึ้นจะช่วยลดจำนวน Case ที่ต้องตรวจสอบด้วยมนุษย์  
    \*   \*\*การใช้งาน:\*\* ตั้งค่า \`processAIIndexing\_Batch()\` ให้รันเป็น Time-driven Trigger ทุกคืน เพื่อประมวลผล Record ใหม่หรือ Record ที่มีการเปลี่ยนแปลงชื่อ

3\.  \*\*Automated Canonicalization:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* พัฒนาฟังก์ชัน \`canonicalizeName(name)\` และ \`canonicalizeAddress(address)\` ใน \`Utils\_Common.gs\` เพื่อ "ปัดคำ" (เช่น ลบคำว่า "บริษัท", "จำกัด", "(ประเทศไทย)", "สาขา") และจัดรูปแบบที่อยู่ให้เป็นมาตรฐาน  
    \*   \*\*เหตุผล:\*\* \`Canonical\_Name\` และ \`Canonical\_Address\` เป็นพื้นฐานในการสร้าง Fingerprint และการเปรียบเทียบข้อมูลที่แม่นยำ  
    \*   \*\*การใช้งาน:\*\* คอลัมน์ \`Canonical\_Name\` และ \`Canonical\_Address\` จะถูกเพิ่มในชีต \`Database\` และถูกคำนวณอัตโนมัติเมื่อมีการสร้างหรืออัปเดต Record

4\.  \*\*Proactive Schema Validation:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* ตั้งค่า \`runFullSchemaValidation()\` ใน \`Service\_SchemaValidator.gs\` ให้รันเป็น Time-driven Trigger เป็นประจำ (เช่น ทุกสัปดาห์) และส่งแจ้งเตือนหากพบปัญหา  
    \*   \*\*เหตุผล:\*\* การรักษาความถูกต้องของโครงสร้างชีตเป็นสิ่งสำคัญในการป้องกันปัญหาคุณภาพข้อมูลตั้งแต่ต้น

\#\#\# เฟส 2: ระบบตรวจจับและแก้ไขข้อมูลซ้ำอัจฉริยะ (Intelligent Duplicate Resolution)

ในเฟสนี้จะเน้นการพัฒนาระบบที่สามารถตรวจจับและจัดการข้อมูลซ้ำได้อย่างชาญฉลาด โดยลดการพึ่งพาการตัดสินใจของมนุษย์

1\.  \*\*Automated Duplicate Detection Engine:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* พัฒนาฟังก์ชัน \`findPotentialDuplicates()\` ที่ใช้ \`UUID\`, \`Name\_FP\`, \`Addr\_FP\`, \`Geo\_Hash\`, \`COL\_NORMALIZED\`, \`LAT\`, \`LNG\` และ \`QUALITY\` Score ในการระบุ Record ที่มีโอกาสซ้ำกันสูง  
    \*   \*\*เหตุผล:\*\* ฟังก์ชันนี้จะเป็นหัวใจของการตรวจจับปัญหาทั้ง 8 ข้อ โดยเฉพาะปัญหาที่ 1, 2, 3, 4, 5, 6, 7, 8  
    \*   \*\*กลไก:\*\*  
        \*   \*\*Exact Match:\*\* หาก \`UUID\` ซ้ำกัน (ไม่ควรเกิดขึ้น), \`Name\_FP\` และ \`Addr\_FP\` ซ้ำกัน \-\> เป็น Duplicate แน่นอน  
        \*   \*\*High Confidence Match:\*\* หาก \`Name\_FP\` หรือ \`Addr\_FP\` ซ้ำกัน และ \`Geo\_Hash\` ใกล้เคียงกันมาก (หรือ \`LAT\`/\`LNG\` ใกล้เคียงกันมาก) \-\> เป็น Potential Duplicate สูง  
        \*   \*\*AI-Assisted Match:\*\* หาก \`COL\_NORMALIZED\` มี Keyword ที่ทับซ้อนกันสูง และ \`Geo\_Hash\` ใกล้เคียงกัน \-\> เป็น Potential Duplicate ที่ AI แนะนำ

2\.  \*\*Smart \`DQ\_Review\_Queue\` Generation:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* ปรับปรุง \`runDataQualityCheck\_Full()\` ให้เรียกใช้ \`findPotentialDuplicates()\` และสร้าง Case ใน \`DQ\_Review\_Queue\` โดยอัตโนมัติสำหรับ Record ที่เข้าข่าย Potential Duplicate  
    \*   \*\*เหตุผล:\*\* ลดภาระการค้นหาด้วยตนเอง และจัดลำดับความสำคัญของ Case ที่ต้องตรวจสอบ  
    \*   \*\*การจัดลำดับ:\*\* Case ใน \`DQ\_Review\_Queue\` ควรถูกจัดลำดับตาม \`Confidence\` ของการเป็น Duplicate และ \`Quality\` Score ของ Record ที่เกี่ยวข้อง เพื่อให้ผู้ดูแลระบบแก้ไข Case ที่สำคัญก่อน

3\.  \*\*Automated Merge for High Confidence Duplicates:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* สำหรับ Case ที่ระบบมั่นใจสูงว่าเป็น Duplicate (เช่น \`Name\_FP\` และ \`Addr\_FP\` เหมือนกันเป๊ะ) ระบบควรสามารถทำการ \`mergeRecords()\` โดยอัตโนมัติได้ โดยใช้ Record ที่มี \`QUALITY\` Score สูงกว่าเป็น Master และ Soft Delete Record ที่เหลือ  
    \*   \*\*เหตุผล:\*\* ลดภาระการทำงานของมนุษย์สำหรับ Case ที่ชัดเจน  
    \*   \*\*Threshold:\*\* กำหนด \`THRESHOLD\_AUTO\_MERGE\` ใน \`Config.gs\` เพื่อควบคุมระดับความมั่นใจที่ระบบจะทำการ Merge อัตโนมัติ

4\.  \*\*Enhanced \`GPS\_Queue\` Management:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* พัฒนา UI หรือฟังก์ชันใน Google Sheets ที่ช่วยให้ผู้ดูแลระบบสามารถเปรียบเทียบพิกัดจากคนขับและพิกัด Master ได้ง่ายขึ้น พร้อมแสดงแผนที่ (ถ้าเป็นไปได้) และปุ่ม \`Approve\` / \`Reject\` ที่ชัดเจน  
    \*   \*\*เหตุผล:\*\* ปัญหาพิกัดเป็นเรื่องที่ละเอียดอ่อนและต้องการการตัดสินใจของมนุษย์ การทำให้กระบวนการนี้ง่ายขึ้นจะช่วยเพิ่มประสิทธิภาพ

\#\#\# เฟส 3: การเรียนรู้และปรับปรุงอย่างต่อเนื่อง (Continuous Learning & Improvement)

ในเฟสนี้จะเน้นการทำให้ระบบสามารถเรียนรู้และปรับปรุงตัวเองได้ตามกาลเวลา

1\.  \*\*Feedback Loop from Manual Review:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* เมื่อผู้ดูแลระบบทำการ Merge, Reject, หรือ Edit Case ใน \`DQ\_Review\_Queue\` หรือ \`GPS\_Queue\` ระบบควรบันทึกการตัดสินใจนั้นเป็น Feedback เพื่อนำไปปรับปรุงโมเดล AI หรือกฎเกณฑ์การตรวจจับ Duplicate ในอนาคต  
    \*   \*\*เหตุผล:\*\* ทำให้ระบบฉลาดขึ้นและลดจำนวน Case ที่ต้องตรวจสอบด้วยมนุษย์ในระยะยาว

2\.  \*\*Monitoring and Reporting:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* สร้าง Dashboard หรือ Report ที่แสดงสถิติคุณภาพข้อมูล (เช่น จำนวน Duplicate ที่พบ, จำนวน Case ใน \`DQ\_Review\_Queue\`, อัตราการ Merge อัตโนมัติ vs. Manual) และแนวโน้มคุณภาพข้อมูลเมื่อเวลาผ่านไป  
    \*   \*\*เหตุผล:\*\* ช่วยให้ผู้บริหารและผู้ดูแลระบบสามารถติดตามประสิทธิภาพของระบบจัดการคุณภาพข้อมูลและระบุจุดที่ต้องปรับปรุงได้

3\.  \*\*API Integration for External Data Sources:\*\*  
    \*   \*\*สิ่งที่ต้องทำ:\*\* หากมีแหล่งข้อมูลภายนอกอื่นๆ ที่ต้องการนำเข้า (เช่น ข้อมูลลูกค้าจากระบบ CRM) ควรพัฒนา API Integration เพื่อให้ข้อมูลไหลเข้าสู่ LMDS ได้อย่างราบรื่นและผ่านกระบวนการ Data Quality Check เดียวกัน  
    \*   \*\*เหตุผล:\*\* ทำให้ LMDS เป็น Master Data ที่แท้จริงสำหรับทุกระบบ

\#\# การจัดการกับปัญหา 8 ข้อภายใต้กลยุทธ์นี้

ด้วยกลยุทธ์ข้างต้น ปัญหาทั้ง 8 ข้อจะได้รับการแก้ไขดังนี้:

\*   \*\*ปัญหา 1, 2, 3 (ชื่อบุคคลซ้ำ, ที่อยู่ซ้ำ, Lat/Long ซ้ำ):\*\* จะถูกตรวจจับได้อย่างมีประสิทธิภาพด้วย \`Name\_FP\`, \`Addr\_FP\`, \`Geo\_Hash\` และ \`COL\_NORMALIZED\` และจะถูก Merge อัตโนมัติหากมีความมั่นใจสูง หรือส่งเข้า \`DQ\_Review\_Queue\` หากต้องการการตรวจสอบ  
\*   \*\*ปัญหา 4 (บุคคลเดียวกันแต่ชื่อเขียนไม่เหมือนกัน):\*\* \`COL\_NORMALIZED\` ที่ได้รับการปรับปรุงจาก AI และชีต \`NameMapping\` จะเป็นกลไกหลักในการแก้ไขปัญหานี้ โดย AI จะช่วยจับคู่ชื่อที่แตกต่างกันไปยัง Record หลัก  
\*   \*\*ปัญหา 5 (บุคคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน):\*\* จะถูกส่งเข้า \`DQ\_Review\_Queue\` โดยระบบจะใช้ \`Addr\_FP\` และ \`Geo\_Hash\` ในการตรวจจับ แต่จะพิจารณาความแตกต่างของ \`Name\_FP\` เพื่อระบุว่าเป็น Case ที่ต้องตรวจสอบด้วยมนุษย์  
\*   \*\*ปัญหา 6 (บุคคลชื่อเดียวกัน แต่ชื่อสถานที่อยู่ไม่เหมือนกัน):\*\* ระบบจะใช้ \`Name\_FP\` และ \`CALCULATE\_DISTANCE\_KM\` ในการตรวจจับ หากระยะห่างน้อยอาจส่งเข้า \`GPS\_Queue\` หากมากอาจเสนอให้สร้าง Record ใหม่ (สาขา) หรือส่งเข้า \`DQ\_Review\_Queue\`  
\*   \*\*ปัญหา 7 (บุคคลชื่อเดียวกัน แต่เลข Lat/Long คนละที่):\*\* จะถูกจัดการผ่าน \`GPS\_Queue\` โดยระบบจะเปรียบเทียบพิกัดจากคนขับกับ Master Data และให้ผู้ดูแลระบบตัดสินใจ  
\*   \*\*ปัญหา 8 (บุคคลคนละชื่อ แต่เลข Lat/Long ที่เดียวกัน):\*\* จะถูกส่งเข้า \`DQ\_Review\_Queue\` โดยระบบจะใช้ \`Geo\_Hash\` และ \`Lat\_Norm\`/\`Lng\_Norm\` ในการตรวจจับ แต่จะพิจารณาความแตกต่างของ \`Name\_FP\` เพื่อระบุว่าเป็น Case ที่ต้องตรวจสอบด้วยมนุษย์

\#\# สิ่งที่ไม่จำเป็นและสามารถลบออกได้

ในปัจจุบัน โค้ดส่วนใหญ่ดูมีความจำเป็นและมีบทบาทในการทำงานของระบบ อย่างไรก็ตาม หากในอนาคตมีการพัฒนาไปสู่ระบบฐานข้อมูลภายนอก (เช่น Cloud SQL) หรือมีการปรับเปลี่ยนสถาปัตยกรรมอย่างมีนัยสำคัญ บางส่วนของโค้ดที่เกี่ยวข้องกับการจัดการชีตโดยตรง (เช่น \`clearDataSheet()\`, \`clearInputSheet()\`) อาจถูกปรับเปลี่ยนหรือลดความสำคัญลงได้ แต่ในบริบทของการใช้ Google Sheets เป็นฐานข้อมูลหลัก โค้ดเหล่านี้ยังคงมีความจำเป็น

โดยสรุปแล้ว การพัฒนา LMDS ในแนวทางนี้จะเปลี่ยนระบบจากเครื่องมือจัดการข้อมูลธรรมดาให้กลายเป็น "ผู้ช่วยอัจฉริยะ" ในการรักษาคุณภาพ Master Data ซึ่งจะนำไปสู่การตัดสินใจทางธุรกิจที่แม่นยำและมีประสิทธิภาพมากยิ่งขึ้น

\# โครงสร้าง Google Sheets

เอกสารนี้สรุปโครงสร้างของ Google Sheets ที่ใช้ในระบบ Logistics Master Data System (LMDS) โดยระบุชื่อชีตและคอลัมน์ที่จำเป็นสำหรับแต่ละชีต

\#\# 1\. Sheet: \`Database\` (Master Data)

ชีตหลักสำหรับเก็บข้อมูล Master Data ของลูกค้าและสถานที่ต่างๆ

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | NAME | ชื่อลูกค้า/สถานที่ |  
| B | LAT | ละติจูด |  
| C | LNG | ลองจิจูด |  
| D | SUGGESTED | ชื่อที่ระบบแนะนำ (AI) |  
| E | CONFIDENCE | คะแนนความมั่นใจของข้อมูล (0-100) |  
| F | NORMALIZED | ชื่อที่ผ่านการปรับรูปแบบ (สำหรับ AI) |  
| G | VERIFIED | สถานะการยืนยันข้อมูล (True/False) |  
| H | SYS\_ADDR | ที่อยู่ที่ระบบสร้างขึ้น |  
| I | GOOGLE\_ADDR | ที่อยู่จาก Google Maps |  
| J | DIST\_KM | ระยะห่างจากศูนย์ (กิโลเมตร) |  
| K | UUID | รหัสระบุตัวตน 36 หลัก (สำคัญมาก) |  
| L | PROVINCE | จังหวัด |  
| M | DISTRICT | อำเภอ |  
| N | POSTCODE | รหัสไปรษณีย์ |  
| O | QUALITY | คะแนนคุณภาพข้อมูล (0-100) |  
| P | CREATED | วันที่สร้าง (Timestamp) |  
| Q | UPDATED | วันที่แก้ไขล่าสุด (Timestamp) |  
| R | Coord\_Source | แหล่งที่มาของพิกัด (เช่น Driver, SCG, Google) |  
| S | Coord\_Confidence | ความแม่นยำพิกัด (0-100) |  
| T | Coord\_Last\_Updated | วันที่พิกัดเปลี่ยนล่าสุด |  
| U | Record\_Status | สถานะของข้อมูล (\`Active\`, \`Inactive\`, \`Merged\`) |  
| V | Merged\_To\_UUID | UUID ของตัวหลักที่ถูกรวมด้วย |  
| W | Canonical\_Name | ชื่อมาตรฐานที่ผ่านการทำปัดคำ |  
| X | Canonical\_Address | ที่อยู่มาตรฐานที่ปรับคำแล้ว |  
| Y | Name\_FP | ลายนิ้วมือของชื่อ (Hash) |  
| Z | Addr\_FP | ลายนิ้วมือของที่อยู่ (Hash) |  
| AA | Lat\_Norm | พิกัดดัดแปลงให้เหลือ 6 ทศนิยม |  
| AB | Lng\_Norm | พิกัดดัดแปลงให้เหลือ 6 ทศนิยม |  
| AC | Geo\_Hash | ก้อนพิกัด 1 ตารางกริด |

\#\# 2\. Sheet: \`NameMapping\` (ตารางพจนานุกรมชื่อบริษัท)

ชีตนี้ใช้สำหรับบอกระบบและ AI ว่า   
"ชื่อแปลกๆ" นี้ ให้ชี้ไปที่ UUID ของบริษัทแม่ตัวไหน

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | Variant\_Name | ชื่อที่เขียนผิด หรือเขียนย่อ |  
| B | Master\_UID | UUID ของตัวจริงใน Database |  
| C | Confidence\_Score | คะแนนความมั่นใจ (100 \= คนรับรอง, \<100 \= AI ทำ) |  
| D | Mapped\_By | ชื่อคน หรือ \`AI\_Agent\` |  
| E | Timestamp | วันที่และเวลาที่บันทึก |

\#\# 3\. Sheet: \`DQ\_Review\_Queue\` (คิวตรวจสอบคุณภาพข้อมูลซ้ำซ้อน)

ชีตนี้ใช้สำหรับให้คนมาพิจารณาว่า สิ่งที่ระบบมองว่า "ซ้ำ" หรือ "Conflict" จะให้ทำอย่างไร

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | Timestamp | วันที่และเวลาที่บันทึก |  
| B | Case\_ID | รหัสกรณีที่ต้องตรวจสอบ |  
| C | Candidate\_UUID\_1 | UUID ของข้อมูลที่ 1 |  
| D | Candidate\_UUID\_2 | UUID ของข้อมูลที่ 2 |  
| E | Name\_1 | ชื่อของข้อมูลที่ 1 |  
| F | Name\_2 | ชื่อของข้อมูลที่ 2 |  
| G | Canonical\_Name\_1 | ชื่อมาตรฐานของข้อมูลที่ 1 |  
| H | Canonical\_Name\_2 | ชื่อมาตรฐานของข้อมูลที่ 2 |  
| ... | ... | คอลัมน์อื่นๆ ตาม Config.gs |  
| P | Review\_Note | บันทึกการตรวจสอบ |

\#\# 4\. Sheet: \`GPS\_Queue\` (คิวพิจารณาพิกัดคนขับที่ไม่ตรง)

ชีตนี้ใช้เมื่อคนขับปักพิกัดห่างจาก Master Data

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | Timestamp | วันที่และเวลาที่บันทึก |  
| B | ShipToName | ชื่อสถานที่ส่งสินค้า |  
| C | UUID\_DB | UUID ใน Database |  
| D | LatLng\_Driver | พิกัดจากคนขับ |  
| E | LatLng\_DB | พิกัดใน Database |  
| F | Diff\_Meters | ระยะห่าง (เมตร) |  
| G | Reason | เหตุผลที่พิกัดไม่ตรง |  
| H | Approve | อนุมัติ (ติ๊กกล่อง) |  
| I | Reject | ปฏิเสธ (ติ๊กกล่อง) |

\#\# 5\. Sheet: \`SCGนครหลวงJWDภูมิภาค\` (หรือชีตนำเข้าใดๆ)

ชีตรับข้อมูลขาเข้าจาก External API (ชื่อชีตอาจเปลี่ยนไปตามการตั้งค่า)

\#\# 6\. Sheet: \`Archive\_DB\`

ชีตสำหรับเก็บข้อมูล \`Inactive\` (หัวตารางเหมือนกับชีต \`Database\` ทั้งหมด 29 คอลัมน์)

\#\# 7\. Sheet: \`Data\`

ชีตสำหรับเก็บข้อมูลงานประจำวัน (Daily Job)

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | ID\_งานประจำวัน | รหัสงานประจำวัน |  
| B | PlanDelivery | แผนการจัดส่ง |  
| C | InvoiceNo | หมายเลขใบแจ้งหนี้ |  
| D | ShipmentNo | หมายเลขการจัดส่ง |  
| E | DriverName | ชื่อคนขับรถ |  
| F | TruckLicense | ทะเบียนรถ |  
| G | CarrierCode | รหัสผู้ขนส่ง |  
| H | CarrierName | ชื่อผู้ขนส่ง |  
| I | SoldToCode | รหัสผู้ซื้อ |  
| J | SoldToName | ชื่อผู้ซื้อ |  
| K | ShipToName | ชื่อสถานที่ส่งสินค้า |  
| L | ShipToAddress | ที่อยู่สถานที่ส่งสินค้า |  
| M | LatLong\_SCG | พิกัดจาก SCG |  
| N | MaterialName | ชื่อสินค้า |  
| O | ItemQuantity | จำนวนสินค้า |  
| P | QuantityUnit | หน่วยสินค้า |  
| Q | ItemWeight | น้ำหนักสินค้า |  
| R | DeliveryNo | หมายเลขการจัดส่ง |  
| S | จำนวนปลายทาง\_System | จำนวนปลายทางในระบบ |  
| T | รายชื่อปลายทาง\_System | รายชื่อปลายทางในระบบ |  
| U | ScanStatus | สถานะการสแกน |  
| V | DeliveryStatus | สถานะการจัดส่ง |  
| W | Email | อีเมลพนักงาน |  
| X | จำนวนสินค้ารวมของร้านนี้ | จำนวนสินค้ารวม |  
| Y | น้ำหนักสินค้ารวมของร้านนี้ | น้ำหนักสินค้ารวม |  
| Z | จำนวน\_Invoice\_ที่ต้องสแกน | จำนวน Invoice ที่ต้องสแกน |  
| AA | LatLong\_Actual | พิกัดจริง |  
| AB | ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน | ชื่อเจ้าของสินค้า |  
| AC | ShopKey | รหัสร้านค้า |

\#\# 8\. Sheet: \`Input\`

ชีตสำหรับรับข้อมูลนำเข้า (Shipment)

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| B1 | Cookie | ค่า Cookie สำหรับ API |  
| B3 | Shipment String | ข้อความ Shipment สำหรับค้นหา |  
| A4 เป็นต้นไป | ข้อมูลนำเข้า | ข้อมูลนำเข้าตามโครงสร้าง |

\#\# 9\. Sheet: \`สรุป\_เจ้าของสินค้า\`

ชีตสำหรับสรุปข้อมูลตามเจ้าของสินค้า

\#\# 10\. Sheet: \`สรุป\_Shipment\`

ชีตสำหรับสรุปข้อมูลตาม Shipment

\#\# 11\. Sheet: \`PostalRef\`

ชีตสำหรับเก็บข้อมูลรหัสไปรษณีย์อ้างอิง

\#\# 12\. Sheet: \`ข้อมูลพนักงาน\`

ชีตสำหรับเก็บข้อมูลพนักงาน (ถ้ามี)

\# คู่มือการสร้างและใช้งานระบบ Logistics Master Data System (LMDS)

เอกสารนี้จะอธิบายขั้นตอนการสร้างและตั้งค่าระบบ LMDS รวมถึงคู่มือการใช้งานปุ่มต่างๆ ในเมนูของ Google Sheets เพื่อให้ผู้ใช้สามารถเริ่มต้นและใช้งานระบบได้อย่างมีประสิทธิภาพ

\#\# 1\. ขั้นตอนการสร้างและตั้งค่าระบบ (Setup Guide)

การตั้งค่าระบบ LMDS มีขั้นตอนหลักๆ ดังนี้:

\#\#\# 1.1 การเตรียม Google Sheet

1\.  \*\*สร้าง Google Sheet ใหม่:\*\* สร้าง Google Sheet เปล่าขึ้นมา 1 ไฟล์ และตั้งชื่อตามต้องการ (เช่น \`LMDS\_Master\_Data\`).  
2\.  \*\*คัดลอกชีตที่จำเป็น:\*\* ระบบ LMDS ต้องการชีตที่มีชื่อเฉพาะเพื่อทำงานได้อย่างถูกต้อง ชีตเหล่านี้ได้แก่:  
    \*   \`Database\`  
    \*   \`NameMapping\`  
    \*   \`DQ\_Review\_Queue\`  
    \*   \`GPS\_Queue\`  
    \*   \`Archive\_DB\`  
    \*   \`Data\`  
    \*   \`Input\`  
    \*   \`สรุป\_เจ้าของสินค้า\`  
    \*   \`สรุป\_Shipment\`  
    \*   \`PostalRef\`  
    \*   \`ข้อมูลพนักงาน\`  
    \*   \*\*หมายเหตุ:\*\* คุณสามารถคัดลอกชีตเหล่านี้จาก Template หรือสร้างขึ้นใหม่โดยตั้งชื่อชีตให้ตรงตามที่ระบุไว้ใน \`Config.gs\` และตรวจสอบให้แน่ใจว่ามีคอลัมน์ครบถ้วนตามที่ได้สรุปไว้ในเอกสาร \`google\_sheets\_structure.md\` โดยเฉพาะชีต \`Database\` ที่มีคอลัมน์เพิ่มเติมสำหรับ \`Canonical\_Name\`, \`Canonical\_Address\`, \`Name\_FP\`, \`Addr\_FP\`, \`Lat\_Norm\`, \`Lng\_Norm\`, \`Geo\_Hash\`.

\#\#\# 1.2 การติดตั้ง Google Apps Script

1\.  \*\*เปิด Script Editor:\*\* ใน Google Sheet ของคุณ ไปที่ \`ส่วนขยาย (Extensions)\` \> \`Apps Script\`.  
2\.  \*\*คัดลอกโค้ดทั้งหมด:\*\* คัดลอกโค้ดจากไฟล์ \`.gs\` ทั้งหมดใน Repository (\`Config.gs\`, \`Menu.gs\`, \`Service\_Master.gs\`, \`Service\_Maintenance.gs\`, \`Service\_Agent.gs\`, \`Service\_AutoPilot.gs\`, \`Service\_GPSFeedback.gs\`, \`Service\_GeoAddr.gs\`, \`Service\_Notify.gs\`, \`Service\_SCG.gs\`, \`Service\_SchemaValidator.gs\`, \`Service\_Search.gs\`, \`Service\_SoftDelete.gs\`, \`Setup\_Security.gs\`, \`Setup\_Upgrade.gs\`, \`Test\_AI.gs\`, \`Test\_Diagnostic.gs\`, \`Utils\_Common.gs\`, \`WebApp.gs\`) และไฟล์ \`Index.html\` ไปยังโปรเจกต์ Apps Script ของคุณ โดยสร้างไฟล์ \`.gs\` และ \`html\` ใหม่ใน Script Editor ให้มีชื่อตรงกัน และวางโค้ดลงไปในแต่ละไฟล์  
    \*   \*\*ข้อควรระวัง:\*\* ตรวจสอบให้แน่ใจว่าไม่มีโค้ดซ้ำซ้อนหรือขาดหายไป

\#\#\# 1.3 การตั้งค่า API Key และ Environment Variables

1\.  \*\*ตั้งค่า Gemini API Key:\*\*  
    \*   ใน Script Editor ไปที่ \`Project settings\` (ไอคอนรูปฟันเฟือง).  
    \*   เลื่อนลงมาที่ \`Script properties\` และคลิก \`Add script property\`.  
    \*   ตั้งชื่อ Property เป็น \`GEMINI\_API\_KEY\` และใส่ค่า API Key ของ Gemini ของคุณลงไป (หากยังไม่มี ต้องไปสร้างที่ Google AI Studio หรือ Google Cloud Console).  
    \*   \*\*สำคัญ:\*\* หากไม่มี \`GEMINI\_API\_KEY\` ระบบจะไม่สามารถใช้ฟังก์ชัน AI ได้  
2\.  \*\*ตั้งค่า Google Maps API Key (ถ้าจำเป็น):\*\* หากมีการใช้งาน Google Maps API โดยตรงใน \`Service\_GeoAddr.gs\` (นอกเหนือจากที่ Apps Script จัดการให้) คุณอาจต้องตั้งค่า API Key เพิ่มเติมในลักษณะเดียวกัน

\#\#\# 1.4 การรันฟังก์ชัน \`setupEnvironment()\` และ \`onOpen()\`

1\.  \*\*รัน \`setupEnvironment()\`:\*\* ใน Script Editor เลือกฟังก์ชัน \`setupEnvironment\` จากเมนูด้านบน (รูปสามเหลี่ยมคว่ำ) แล้วคลิกปุ่ม \`Run\` (รูปสามเหลี่ยม).  
    \*   ฟังก์ชันนี้จะช่วยตรวจสอบและตั้งค่าเริ่มต้นบางอย่าง รวมถึงการขอสิทธิ์ในการเข้าถึง Google Sheets และบริการอื่นๆ  
    \*   คุณอาจต้องอนุมัติสิทธิ์การเข้าถึงเมื่อรันครั้งแรก  
2\.  \*\*รัน \`onOpen()\`:\*\* หลังจากรัน \`setupEnvironment()\` ให้รันฟังก์ชัน \`onOpen()\` หนึ่งครั้ง เพื่อให้เมนูต่างๆ ปรากฏขึ้นใน Google Sheet ของคุณ

\#\#\# 1.5 การตรวจสอบความสมบูรณ์ของระบบ

1\.  \*\*ตรวจสอบเมนู:\*\* กลับไปที่ Google Sheet ของคุณ คุณควรจะเห็นเมนูใหม่ๆ ปรากฏขึ้น (เช่น \`🚛 1\. ระบบจัดการ Master Data\`, \`📦 2\. เมนูพิเศษ SCG\`, \`🤖 3\. ระบบอัตโนมัติ\`).  
2\.  \*\*ตรวจสอบ \`Config.gs\`:\*\* ตรวจสอบค่า \`CONFIG.validateSystemIntegrity()\` เพื่อให้แน่ใจว่าไม่มีข้อผิดพลาดในการตั้งค่าชีตและ API Key

\#\# 2\. คู่มือการใช้งานปุ่มต่างๆ ในเมนู

เมนูในระบบ LMDS ถูกออกแบบมาเพื่ออำนวยความสะดวกในการจัดการ Master Data และการทำงานที่เกี่ยวข้องกับ SCG โดยแบ่งออกเป็น 3 ส่วนหลัก:

\#\#\# 2.1 เมนู \`🚛 1\. ระบบจัดการ Master Data\`

เมนูนี้ใช้สำหรับจัดการข้อมูล Master Data ในชีต \`Database\` และ \`NameMapping\`

\*   \*\*\`1️⃣ ดึงลูกค้าใหม่ (Sync New Data)\` (\`syncNewDataToMaster\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ดึงข้อมูลลูกค้าใหม่จากชีต \`SCGนครหลวงJWDภูมิภาค\` (หรือชีตนำเข้าที่กำหนดใน \`CONFIG.SOURCE\_SHEET\`) ไปยังชีต \`Database\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อมีข้อมูลลูกค้าใหม่ที่ต้องการนำเข้าสู่ Master Data.  
\*   \*\*\`2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)\` (\`updateGeoData\_SmartCache\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ดึงข้อมูลพิกัด (Lat/Lng) และที่อยู่จาก Google Maps สำหรับ Record ที่ยังไม่มีข้อมูล หรือข้อมูลไม่สมบูรณ์ โดยจะประมวลผลทีละ 50 Record เพื่อหลีกเลี่ยงข้อจำกัดของ API.  
    \*   \*\*การใช้งาน:\*\* รันฟังก์ชันนี้เป็นประจำเพื่อเติมเต็มข้อมูลพิกัดและที่อยู่ให้สมบูรณ์.  
\*   \*\*\`3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)\` (\`autoGenerateMasterList\_Smart\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* วิเคราะห์และจัดกลุ่มชื่อที่คล้ายกันใน \`Database\` เพื่อระบุ Potential Duplicate และสร้าง \`Canonical\_Name\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เพื่อช่วยในการระบุข้อมูลซ้ำซ้อนและเตรียมข้อมูลสำหรับการทำความสะอาด.  
\*   \*\*\`🧠 4️⃣ ส่งชื่อแปลกให้ AI วิเคราะห์\` (\`runAIBatchResolver\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ส่งชื่อที่ระบบไม่รู้จักหรือไม่สามารถ Normalize ได้ไปยัง AI (Gemini) เพื่อวิเคราะห์และสร้าง \`COL\_NORMALIZED\` และ Keyword.  
    \*   \*\*การใช้งาน:\*\* รันเมื่อต้องการให้ AI ช่วยประมวลผลชื่อที่ซับซ้อนหรือชื่อใหม่ๆ.  
\*   \*\*\`🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)\` (\`runDeepCleanBatch\_100\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ตรวจสอบความสมบูรณ์ของข้อมูลใน \`Database\` อย่างละเอียด เช่น ตรวจสอบ \`UUID\`, \`QUALITY\`, \`CONFIDENCE\`, \`Record\_Status\` และอื่นๆ โดยจะประมวลผลทีละ 100 Record.  
    \*   \*\*การใช้งาน:\*\* รันเป็นประจำเพื่อรักษาคุณภาพและความสมบูรณ์ของ Master Data.  
\*   \*\*\`🔄 รีเซ็ตความจำปุ่ม 5\` (\`resetDeepCleanMemory\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* รีเซ็ตสถานะการประมวลผลของฟังก์ชัน \`Deep Clean\` เพื่อให้สามารถรันใหม่ได้ตั้งแต่ต้น.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการเริ่ม \`Deep Clean\` ใหม่ทั้งหมด.  
\*   \*\*\`✅ 6️⃣ จบงาน (Finalize & Move to Mapping)\` (\`finalizeAndClean\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* สรุปและทำความสะอาดข้อมูลที่ประมวลผลแล้ว และย้าย Record ที่เป็น Duplicate หรือ Inactive ไปยัง \`Archive\_DB\` พร้อมทั้งอัปเดต \`NameMapping\`.  
    \*   \*\*การใช้งาน:\*\* รันเมื่อมั่นใจว่าข้อมูลได้รับการตรวจสอบและแก้ไขแล้ว.

\#\#\#\# เมนูย่อย \`🛠️ Admin & Repair Tools\`

\*   \*\*\`🔑 สร้าง UUID ให้ครบทุกแถว\` (\`assignMissingUUIDs\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* สร้างและกำหนด \`UUID\` ให้กับทุก Record ใน \`Database\` ที่ยังไม่มี \`UUID\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อพบว่ามี Record ที่ขาด \`UUID\`.  
\*   \*\*\`🚑 ซ่อมแซม NameMapping\` (\`repairNameMapping\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ตรวจสอบและซ่อมแซมความผิดปกติในชีต \`NameMapping\` เช่น การจับคู่ที่ผิดพลาด.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อพบปัญหาเกี่ยวกับ \`NameMapping\`.  
\*   \*\*\`🔍 ค้นหาพิกัดซ้ำซ้อน\` (\`findHiddenDuplicates\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ค้นหา Record ที่มีพิกัด (Lat/Lng) ซ้ำซ้อนกันใน \`Database\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เพื่อระบุ Potential Duplicate ที่เกิดจากพิกัดเดียวกัน.  
\*   \*\*\`📊 ตรวจสอบคุณภาพข้อมูล\` (\`showQualityReport\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* แสดงรายงานสรุปคุณภาพข้อมูลใน \`Database\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เพื่อดูภาพรวมคุณภาพข้อมูล.  
\*   \*\*\`🔄 คำนวณ Quality ใหม่ทั้งหมด\` (\`recalculateAllQuality\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* คำนวณ \`QUALITY\` Score ใหม่ทั้งหมดสำหรับทุก Record ใน \`Database\`.  
    \*   \*\*การใช้งาน:\*\* รันเมื่อมีการเปลี่ยนแปลงเกณฑ์การคำนวณคุณภาพข้อมูล.  
\*   \*\*\`🎯 คำนวณ Confidence ใหม่ทั้งหมด\` (\`recalculateAllConfidence\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* คำนวณ \`CONFIDENCE\` Score ใหม่ทั้งหมดสำหรับทุก Record ใน \`Database\`.  
    \*   \*\*การใช้งาน:\*\* รันเมื่อมีการเปลี่ยนแปลงเกณฑ์การคำนวณความมั่นใจของข้อมูล.  
\*   \*\*\`🗂️ Initialize Record Status\` (\`initializeRecordStatus\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* กำหนด \`Record\_Status\` เริ่มต้นให้กับ Record ที่ยังไม่มีสถานะ.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อมีการเพิ่มคอลัมน์ \`Record\_Status\` ใหม่ หรือเมื่อต้องการรีเซ็ตสถานะ.  
\*   \*\*\`🔀 Merge UUID ซ้ำซ้อน\` (\`mergeDuplicates\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* รวม Record ที่ซ้ำซ้อนกัน โดยเลือก Master UUID และ Soft Delete Record ที่ซ้ำซ้อน.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการรวมข้อมูลซ้ำซ้อนที่ได้รับการยืนยันแล้ว.  
\*   \*\*\`📋 ดูสถานะ Record ทั้งหมด\` (\`showRecordStatusReport\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* แสดงรายงานสถานะของ Record ทั้งหมดใน \`Database\` (Active, Inactive, Merged).  
    \*   \*\*การใช้งาน:\*\* ใช้เพื่อตรวจสอบสถานะของข้อมูล.

\#\#\# 2.2 เมนู \`📦 2\. เมนูพิเศษ SCG\`

เมนูนี้ใช้สำหรับจัดการข้อมูลที่เกี่ยวข้องกับการขนส่งของ SCG และการจัดการพิกัดจากคนขับ

\*   \*\*\`📥 1\. โหลดข้อมูล Shipment (+E-POD)\` (\`fetchDataFromSCGJWD\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ดึงข้อมูล Shipment จาก SCG API โดยใช้ Cookie และ Shipment Numbers ที่ระบุในชีต \`Input\`.  
    \*   \*\*การใช้งาน:\*\* เป็นขั้นตอนแรกในการนำเข้าข้อมูล Shipment ประจำวัน.  
\*   \*\*\`🟢 2\. อัปเดตพิกัด \+ อีเมลพนักงาน\` (\`applyMasterCoordinatesToDailyJob\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* นำพิกัดและข้อมูลอีเมลพนักงานจาก \`Database\` และ \`ข้อมูลพนักงาน\` มาอัปเดตในชีต \`Data\`.  
    \*   \*\*การใช้งาน:\*\* รันหลังจากโหลดข้อมูล Shipment เพื่อเติมเต็มข้อมูลที่จำเป็น.

\#\#\#\# เมนูย่อย \`📍 GPS Queue Management\`

\*   \*\*\`🔄 1\. Sync GPS จากคนขับ → Queue\` (\`syncNewDataToMaster\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ดึงข้อมูลพิกัดจากคนขับที่แตกต่างจาก Master Data เกินเกณฑ์ที่กำหนด ไปยังชีต \`GPS\_Queue\` เพื่อรอการพิจารณา.  
    \*   \*\*การใช้งาน:\*\* รันเป็นประจำเพื่อรวบรวม Case ที่พิกัดไม่ตรงกัน.  
\*   \*\*\`✅ 2\. อนุมัติรายการที่ติ๊กแล้ว\` (\`applyApprovedFeedback\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* อัปเดตพิกัดใน \`Database\` ตามรายการที่ผู้ดูแลระบบอนุมัติในชีต \`GPS\_Queue\`.  
    \*   \*\*การใช้งาน:\*\* ใช้หลังจากผู้ดูแลระบบตรวจสอบและอนุมัติพิกัดใน \`GPS\_Queue\`.  
\*   \*\*\`📊 3\. ดูสถิติ Queue\` (\`showGPSQueueStats\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* แสดงสถิติของ Case ใน \`GPS\_Queue\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เพื่อติดตามปริมาณและสถานะของ Case ที่ต้องตรวจสอบ.  
\*   \*\*\`🛠️ สร้างชีต GPS\_Queue ใหม่\` (\`createGPSQueueSheet\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* สร้างชีต \`GPS\_Queue\` ใหม่ หากชีตเดิมเสียหายหรือถูกลบ.  
    \*   \*\*การใช้งาน:\*\* ใช้ในกรณีฉุกเฉิน.

\#\#\#\# เมนูย่อย \`🧹 เมนูล้างข้อมูล (Dangerous Zone)\`

\*   \*\*\`⚠️ ล้างเฉพาะชีต Data\` (\`clearDataSheet\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ล้างข้อมูลทั้งหมดในชีต \`Data\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการล้างข้อมูลงานประจำวัน.  
\*   \*\*\`⚠️ ล้างเฉพาะชีต Input\` (\`clearInputSheet\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ล้างข้อมูลทั้งหมดในชีต \`Input\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการล้างข้อมูลนำเข้า Shipment.  
\*   \*\*\`⚠️ ล้างเฉพาะชีต สรุป\_เจ้าของสินค้า\` (\`clearSummarySheet\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ล้างข้อมูลทั้งหมดในชีต \`สรุป\_เจ้าของสินค้า\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการล้างข้อมูลสรุป.  
\*   \*\*\`🔥 ล้างทั้งหมด\` (\`clearAllSCGSheets\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ล้างข้อมูลทั้งหมดในชีต \`Data\`, \`Input\`, \`สรุป\_เจ้าของสินค้า\`, \`สรุป\_Shipment\`.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการล้างข้อมูลที่เกี่ยวข้องกับ SCG ทั้งหมด (ควรใช้ด้วยความระมัดระวัง).

\#\#\# 2.3 เมนู \`🤖 3\. ระบบอัตโนมัติ\`

เมนูนี้ใช้สำหรับควบคุมระบบ Auto-Pilot ที่ทำงานเบื้องหลัง

\*   \*\*\`▶️ เปิดระบบ Auto-Pilot\` (\`START\_AUTO\_PILOT\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* เปิดใช้งาน Trigger แบบ Time-driven สำหรับฟังก์ชัน Auto-Pilot (เช่น \`processAIIndexing\_Batch\`, \`runDeepCleanBatch\_100\`) เพื่อให้ระบบทำงานอัตโนมัติเป็นประจำ.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการให้ระบบทำงานอัตโนมัติ.  
\*   \*\*\`⏹️ ปิดระบบ Auto-Pilot\` (\`STOP\_AUTO\_PILOT\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ปิดใช้งาน Trigger แบบ Time-driven ทั้งหมดของระบบ Auto-Pilot.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการหยุดการทำงานอัตโนมัติของระบบชั่วคราวหรือถาวร.  
\*   \*\*\`👋 ปิดระบบทั้งหมด\` (\`STOP\_ALL\_TRIGGERS\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ปิดใช้งาน Trigger ทั้งหมดที่เกี่ยวข้องกับโปรเจกต์ Apps Script นี้.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อต้องการหยุดการทำงานของระบบทั้งหมด (ควรใช้ด้วยความระมัดระวัง).

\#\#\# 2.4 เมนู \`⚙️ 4\. ตั้งค่า\`

เมนูนี้ใช้สำหรับตั้งค่าและบำรุงรักษาระบบ

\*   \*\*\`🛠️ ตั้งค่า Environment\` (\`setupEnvironment\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ตั้งค่าเริ่มต้นของระบบ เช่น การขอสิทธิ์การเข้าถึง และการตรวจสอบความสมบูรณ์ของ Environment.  
    \*   \*\*การใช้งาน:\*\* รันเมื่อตั้งค่าระบบครั้งแรก หรือเมื่อมีการเปลี่ยนแปลง Environment.  
\*   \*\*\`⬆️ อัปเกรดระบบ\` (\`upgradeSystem\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* อัปเกรดระบบ LMDS ไปยังเวอร์ชันล่าสุด (หากมีการเปลี่ยนแปลงโครงสร้างหรือฟังก์ชัน).  
    \*   \*\*การใช้งาน:\*\* รันเมื่อมีการอัปเดตโค้ดหรือโครงสร้างชีต.  
\*   \*\*\`🗑️ ล้าง Cache\` (\`clearCache\_UI\`)\*\*  
    \*   \*\*คำอธิบาย:\*\* ล้าง Cache ของระบบ ซึ่งอาจช่วยแก้ไขปัญหาบางอย่างที่เกิดจากข้อมูล Cache เก่า.  
    \*   \*\*การใช้งาน:\*\* ใช้เมื่อพบปัญหาที่อาจเกี่ยวข้องกับ Cache.

\#\# ข้อควรจำ

\*   \*\*ความระมัดระวังในการใช้เมนู \`🧹 เมนูล้างข้อมูล (Dangerous Zone)\`:\*\* ฟังก์ชันในเมนูนี้จะลบข้อมูลอย่างถาวร ควรใช้ด้วยความระมัดระวังและตรวจสอบให้แน่ใจก่อนดำเนินการ.  
\*   \*\*การสำรองข้อมูล:\*\* ควรสำรองข้อมูล Google Sheet ของคุณเป็นประจำ เพื่อป้องกันการสูญหายของข้อมูล.  
\*   \*\*การตรวจสอบ Log:\*\* หากพบปัญหา สามารถตรวจสอบ Log ใน Script Editor (\`การดำเนินการ (Executions)\`) เพื่อดูข้อผิดพลาดและหาสาเหตุได้.

ด้วยคู่มือนี้ คุณจะสามารถสร้างและใช้งานระบบ LMDS ได้อย่างมั่นใจและมีประสิทธิภาพ

\# สรุปการวิเคราะห์ระบบ Logistics Master Data System (LMDS) \- Siriwat08/lmds\_5

เอกสารนี้เป็นการสรุปผลการวิเคราะห์ Repository \`Siriwat08/lmds\_5\` อย่างละเอียด โดยครอบคลุมถึงโครงสร้าง Google Sheets, โค้ดโมดูลทั้งหมด, ขั้นตอนการสร้างและตั้งค่าระบบ, คู่มือการใช้งานปุ่มต่างๆ ในเมนู, แนวทางแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อ และแนวคิดเชิงกลยุทธ์ในการพัฒนาโปรเจกต์นี้

\#\# สารบัญ

1\.  โครงสร้าง Google Sheets (ชื่อชีต, คอลัมน์)  
2\.  โมดูลโค้ดทั้งหมด (ทุกฟังก์ชัน)  
3\.  ขั้นตอนการสร้างและตั้งค่าระบบ  
4\.  คู่มือการใช้งานปุ่มต่างๆ ในเมนู  
5\.  แนวทางแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อ  
6\.  แนวคิดและกลยุทธ์ส่วนตัวในการพัฒนาโปรเจกต์ LMDS

\---

\#\# 1\. โครงสร้าง Google Sheets (ชื่อชีต, คอลัมน์)

\#\# 1\. Sheet: \`Database\` (Master Data)

ชีตหลักสำหรับเก็บข้อมูล Master Data ของลูกค้าและสถานที่ต่างๆ

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | NAME | ชื่อลูกค้า/สถานที่ |  
| B | LAT | ละติจูด |  
| C | LNG | ลองจิจูด |  
| D | SUGGESTED | ชื่อที่ระบบแนะนำ (AI) |  
| E | CONFIDENCE | คะแนนความมั่นใจของข้อมูล (0-100) |  
| F | NORMALIZED | ชื่อที่ผ่านการปรับรูปแบบ (สำหรับ AI) |  
| G | VERIFIED | สถานะการยืนยันข้อมูล (True/False) |  
| H | SYS\_ADDR | ที่อยู่ที่ระบบสร้างขึ้น |  
| I | GOOGLE\_ADDR | ที่อยู่จาก Google Maps |  
| J | DIST\_KM | ระยะห่างจากศูนย์ (กิโลเมตร) |  
| K | UUID | รหัสระบุตัวตน 36 หลัก (สำคัญมาก) |  
| L | PROVINCE | จังหวัด |  
| M | DISTRICT | อำเภอ |  
| N | POSTCODE | รหัสไปรษณีย์ |  
| O | QUALITY | คะแนนคุณภาพข้อมูล (0-100) |  
| P | CREATED | วันที่สร้าง (Timestamp) |  
| Q | UPDATED | วันที่แก้ไขล่าสุด (Timestamp) |  
| R | Coord\_Source | แหล่งที่มาของพิกัด (เช่น Driver, SCG, Google) |  
| S | Coord\_Confidence | ความแม่นยำพิกัด (0-100) |  
| T | Coord\_Last\_Updated | วันที่พิกัดเปลี่ยนล่าสุด |  
| U | Record\_Status | สถานะของข้อมูล (\`Active\`, \`Inactive\`, \`Merged\`) |  
| V | Merged\_To\_UUID | UUID ของตัวหลักที่ถูกรวมด้วย |  
| W | Canonical\_Name | ชื่อมาตรฐานที่ผ่านการทำปัดคำ |  
| X | Canonical\_Address | ที่อยู่มาตรฐานที่ปรับคำแล้ว |  
| Y | Name\_FP | ลายนิ้วมือของชื่อ (Hash) |  
| Z | Addr\_FP | ลายนิ้วมือของที่อยู่ (Hash) |  
| AA | Lat\_Norm | พิกัดดัดแปลงให้เหลือ 6 ทศนิยม |  
| AB | Lng\_Norm | พิกัดดัดแปลงให้เหลือ 6 ทศนิยม |  
| AC | Geo\_Hash | ก้อนพิกัด 1 ตารางกริด |

\#\# 2\. Sheet: \`NameMapping\` (ตารางพจนานุกรมชื่อบริษัท)

ชีตนี้ใช้สำหรับบอกระบบและ AI ว่า   
"ชื่อแปลกๆ" นี้ ให้ชี้ไปที่ UUID ของบริษัทแม่ตัวไหน

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | Variant\_Name | ชื่อที่เขียนผิด หรือเขียนย่อ |  
| B | Master\_UID | UUID ของตัวจริงใน Database |  
| C | Confidence\_Score | คะแนนความมั่นใจ (100 \= คนรับรอง, \<100 \= AI ทำ) |  
| D | Mapped\_By | ชื่อคน หรือ \`AI\_Agent\` |  
| E | Timestamp | วันที่และเวลาที่บันทึก |

\#\# 3\. Sheet: \`DQ\_Review\_Queue\` (คิวตรวจสอบคุณภาพข้อมูลซ้ำซ้อน)

ชีตนี้ใช้สำหรับให้คนมาพิจารณาว่า สิ่งที่ระบบมองว่า "ซ้ำ" หรือ "Conflict" จะให้ทำอย่างไร

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | Timestamp | วันที่และเวลาที่บันทึก |  
| B | Case\_ID | รหัสกรณีที่ต้องตรวจสอบ |  
| C | Candidate\_UUID\_1 | UUID ของข้อมูลที่ 1 |  
| D | Candidate\_UUID\_2 | UUID ของข้อมูลที่ 2 |  
| E | Name\_1 | ชื่อของข้อมูลที่ 1 |  
| F | Name\_2 | ชื่อของข้อมูลที่ 2 |  
| G | Canonical\_Name\_1 | ชื่อมาตรฐานของข้อมูลที่ 1 |  
| H | Canonical\_Name\_2 | ชื่อมาตรฐานของข้อมูลที่ 2 |  
| ... | ... | คอลัมน์อื่นๆ ตาม Config.gs |  
| P | Review\_Note | บันทึกการตรวจสอบ |

\#\# 4\. Sheet: \`GPS\_Queue\` (คิวพิจารณาพิกัดคนขับที่ไม่ตรง)

ชีตนี้ใช้เมื่อคนขับปักพิกัดห่างจาก Master Data

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | Timestamp | วันที่และเวลาที่บันทึก |  
| B | ShipToName | ชื่อสถานที่ส่งสินค้า |  
| C | UUID\_DB | UUID ใน Database |  
| D | LatLng\_Driver | พิกัดจากคนขับ |  
| E | LatLng\_DB | พิกัดใน Database |  
| F | Diff\_Meters | ระยะห่าง (เมตร) |  
| G | Reason | เหตุผลที่พิกัดไม่ตรง |  
| H | Approve | อนุมัติ (ติ๊กกล่อง) |  
| I | Reject | ปฏิเสธ (ติ๊กกล่อง) |

\#\# 5\. Sheet: \`SCGนครหลวงJWDภูมิภาค\` (หรือชีตนำเข้าใดๆ)

ชีตรับข้อมูลขาเข้าจาก External API (ชื่อชีตอาจเปลี่ยนไปตามการตั้งค่า)

\#\# 6\. Sheet: \`Archive\_DB\`

ชีตสำหรับเก็บข้อมูล \`Inactive\` (หัวตารางเหมือนกับชีต \`Database\` ทั้งหมด 29 คอลัมน์)

\#\# 7\. Sheet: \`Data\`

ชีตสำหรับเก็บข้อมูลงานประจำวัน (Daily Job)

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| A | ID\_งานประจำวัน | รหัสงานประจำวัน |  
| B | PlanDelivery | แผนการจัดส่ง |  
| C | InvoiceNo | หมายเลขใบแจ้งหนี้ |  
| D | ShipmentNo | หมายเลขการจัดส่ง |  
| E | DriverName | ชื่อคนขับรถ |  
| F | TruckLicense | ทะเบียนรถ |  
| G | CarrierCode | รหัสผู้ขนส่ง |  
| H | CarrierName | ชื่อผู้ขนส่ง |  
| I | SoldToCode | รหัสผู้ซื้อ |  
| J | SoldToName | ชื่อผู้ซื้อ |  
| K | ShipToName | ชื่อสถานที่ส่งสินค้า |  
| L | ShipToAddress | ที่อยู่สถานที่ส่งสินค้า |  
| M | LatLong\_SCG | พิกัดจาก SCG |  
| N | MaterialName | ชื่อสินค้า |  
| O | ItemQuantity | จำนวนสินค้า |  
| P | QuantityUnit | หน่วยสินค้า |  
| Q | ItemWeight | น้ำหนักสินค้า |  
| R | DeliveryNo | หมายเลขการจัดส่ง |  
| S | จำนวนปลายทาง\_System | จำนวนปลายทางในระบบ |  
| T | รายชื่อปลายทาง\_System | รายชื่อปลายทางในระบบ |  
| U | ScanStatus | สถานะการสแกน |  
| V | DeliveryStatus | สถานะการจัดส่ง |  
| W | Email | อีเมลพนักงาน |  
| X | จำนวนสินค้ารวมของร้านนี้ | จำนวนสินค้ารวม |  
| Y | น้ำหนักสินค้ารวมของร้านนี้ | น้ำหนักสินค้ารวม |  
| Z | จำนวน\_Invoice\_ที่ต้องสแกน | จำนวน Invoice ที่ต้องสแกน |  
| AA | LatLong\_Actual | พิกัดจริง |  
| AB | ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน | ชื่อเจ้าของสินค้า |  
| AC | ShopKey | รหัสร้านค้า |

\#\# 8\. Sheet: \`Input\`

ชีตสำหรับรับข้อมูลนำเข้า (Shipment)

| คอลัมน์ | ชื่อคอลัมน์ | คำอธิบาย |  
|---|---|---|  
| B1 | Cookie | ค่า Cookie สำหรับ API |  
| B3 | Shipment String | ข้อความ Shipment สำหรับค้นหา |  
| A4 เป็นต้นไป | ข้อมูลนำเข้า | ข้อมูลนำเข้าตามโครงสร้าง |

\#\# 9\. Sheet: \`สรุป\_เจ้าของสินค้า\`

ชีตสำหรับสรุปข้อมูลตามเจ้าของสินค้า

\#\# 10\. Sheet: \`สรุป\_Shipment\`

ชีตสำหรับสรุปข้อมูลตาม Shipment

\#\# 11\. Sheet: \`PostalRef\`

ชีตสำหรับเก็บข้อมูลรหัสไปรษณีย์อ้างอิง

\#\# 12\. Sheet: \`ข้อมูลพนักงาน\`

ชีตสำหรับเก็บข้อมูลพนักงาน (ถ้ามี)

\---

\#\# 2\. โมดูลโค้ดทั้งหมด (ทุกฟังก์ชัน)

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม DB\_TOTAL\_COLS, header constants  
 \*/

var CONFIG \= {  
  SHEET\_NAME:    "Database",  
  MAPPING\_SHEET: "NameMapping",  
  SOURCE\_SHEET:  "SCGนครหลวงJWDภูมิภาค",  
  SHEET\_POSTAL:  "PostalRef",

  // \[Phase A NEW\] Schema Width Constants  
  DB\_TOTAL\_COLS:        22,  
  DB\_LEGACY\_COLS:       17,  
  MAP\_TOTAL\_COLS:       5,  
  GPS\_QUEUE\_TOTAL\_COLS: 9,  
  DATA\_TOTAL\_COLS:      29,

  // \[Phase A NEW\] Header Arrays กลาง  
  DB\_REQUIRED\_HEADERS: {  
    1: "NAME", 2: "LAT", 3: "LNG", 11: "UUID",  
    15: "QUALITY", 16: "CREATED", 17: "UPDATED",  
    18: "Coord\_Source", 19: "Coord\_Confidence",  
    20: "Coord\_Last\_Updated",  
    21: "Record\_Status",  
    22: "Merged\_To\_UUID"  
  },

  MAP\_REQUIRED\_HEADERS: {  
    1: "Variant\_Name", 2: "Master\_UID",  
    3: "Confidence\_Score", 4: "Mapped\_By", 5: "Timestamp"  
  },

  GPS\_QUEUE\_REQUIRED\_HEADERS: {  
    1: "Timestamp", 2: "ShipToName", 3: "UUID\_DB",  
    4: "LatLng\_Driver", 5: "LatLng\_DB", 6: "Diff\_Meters",  
    7: "Reason", 8: "Approve", 9: "Reject"  
  },

  get GEMINI\_API\_KEY() {  
    var key \= PropertiesService.getScriptProperties().getProperty(\\'GEMINI\_API\_KEY\\');  
    if (\!key) throw new Error(  
      "CRITICAL ERROR: GEMINI\_API\_KEY is not set. Please run setupEnvironment() first."  
    );  
    return key;  
  },  
  USE\_AI\_AUTO\_FIX: true,  
  AI\_MODEL:       "gemini-1.5-flash",  
  AI\_BATCH\_SIZE:  20,

  DEPOT\_LAT: 14.164688,  
  DEPOT\_LNG: 100.625354,

  DISTANCE\_THRESHOLD\_KM: 0.05,  
  BATCH\_LIMIT:            50,  
  DEEP\_CLEAN\_LIMIT:       100,  
  API\_MAX\_RETRIES:        3,  
  API\_TIMEOUT\_MS:         30000,  
  CACHE\_EXPIRATION:       21600,

  COL\_NAME: 1,       COL\_LAT: 2,        COL\_LNG: 3,  
  COL\_SUGGESTED: 4,  COL\_CONFIDENCE: 5, COL\_NORMALIZED: 6,  
  COL\_VERIFIED: 7,   COL\_SYS\_ADDR: 8,   COL\_ADDR\_GOOG: 9,  
  COL\_DIST\_KM: 10,   COL\_UUID: 11,      COL\_PROVINCE: 12,  
  COL\_DISTRICT: 13,  COL\_POSTCODE: 14,  COL\_QUALITY: 15,  
  COL\_CREATED: 16,   COL\_UPDATED: 17,  
  COL\_COORD\_SOURCE:       18,  
  COL\_COORD\_CONFIDENCE:   19,  
  COL\_COORD\_LAST\_UPDATED: 20,  
  COL\_COORD\_LAST\_UPDATED: 20,  
  COL\_RECORD\_STATUS:      21,  
  COL\_MERGED\_TO\_UUID:     22,

  MAP\_COL\_VARIANT: 1, MAP\_COL\_UID: 2,   MAP\_COL\_CONFIDENCE: 3,  
  MAP\_COL\_MAPPED\_BY: 4, MAP\_COL\_TIMESTAMP: 5,

  get C\_IDX() {  
    return {  
      NAME: this.COL\_NAME \- 1,           LAT: this.COL\_LAT \- 1,  
      LNG: this.COL\_LNG \- 1,             SUGGESTED: this.COL\_SUGGESTED \- 1,  
      CONFIDENCE: this.COL\_CONFIDENCE \- 1, NORMALIZED: this.COL\_NORMALIZED \- 1,  
      VERIFIED: this.COL\_VERIFIED \- 1,   SYS\_ADDR: this.COL\_SYS\_ADDR \- 1,  
      GOOGLE\_ADDR: this.COL\_ADDR\_GOOG \- 1, DIST\_KM: this.COL\_DIST\_KM \- 1,  
      UUID: this.COL\_UUID \- 1,           PROVINCE: this.COL\_PROVINCE \- 1,  
      DISTRICT: this.COL\_DISTRICT \- 1,   POSTCODE: this.COL\_POSTCODE \- 1,  
      QUALITY: this.COL\_QUALITY \- 1,     CREATED: this.COL\_CREATED \- 1,  
      UPDATED: this.COL\_UPDATED \- 1,  
      COORD\_SOURCE:       this.COL\_COORD\_SOURCE \- 1,  
      COORD\_CONFIDENCE:   this.COL\_COORD\_CONFIDENCE \- 1,  
      COORD\_LAST\_UPDATED: this.COL\_COORD\_LAST\_UPDATED \- 1,  
      RECORD\_STATUS:      this.COL\_RECORD\_STATUS \- 1,  
      MERGED\_TO\_UUID:     this.COL\_MERGED\_TO\_UUID \- 1  
    };  
  },

  get MAP\_IDX() {  
    return {  
      VARIANT:    this.MAP\_COL\_VARIANT \- 1,  
      UID:        this.MAP\_COL\_UID \- 1,  
      CONFIDENCE: this.MAP\_COL\_CONFIDENCE \- 1,  
      MAPPED\_BY:  this.MAP\_COL\_MAPPED\_BY \- 1,  
      TIMESTAMP:  this.MAP\_COL\_TIMESTAMP \- 1  
    };  
  }  
};

const SCG\_CONFIG \= {  
  SHEET\_DATA:     \\'Data\\',  
  SHEET\_INPUT:    \\'Input\\',  
  SHEET\_EMPLOYEE: \\'ข้อมูลพนักงาน\\',  
  API\_URL:        \\'https://fsm.scgjwd.com/Monitor/SearchDelivery\\',  
  INPUT\_START\_ROW: 4,  
  COOKIE\_CELL:    \\'B1\\',  
  SHIPMENT\_STRING\_CELL: \\'B3\\',  
  SHEET\_MASTER\_DB: \\'Database\\',  
  SHEET\_MAPPING:   \\'NameMapping\\',  
  SHEET\_GPS\_QUEUE: \\'GPS\_Queue\\',  
  GPS\_THRESHOLD\_METERS: 50,  
  SRC\_IDX: {  
    NAME: 12, LAT: 14, LNG: 15,  
    SYS\_ADDR: 18, DIST: 23, GOOG\_ADDR: 24  
  },  
  SRC\_IDX\_SYNC\_STATUS: 37,  
  SYNC\_STATUS\_DONE: "SYNCED",  
  JSON\_MAP: {  
    SHIPMENT\_NO:   \\'shipmentNo\\',  
    CUSTOMER\_NAME: \\'customerName\\',  
    DELIVERY\_DATE: \\'deliveryDate\\'  
  }  
};

// \[Phase B NEW\] เพิ่มใน SCG\_CONFIG ต่อท้าย JSON\_MAP  
// Data Sheet Column Index (0-based) สำหรับ Service\_SCG.gs  
// แทน r\[10\], r\[22\], r\[26\] ที่กระจัดกระจาย  
const DATA\_IDX \= {  
  JOB\_ID:        0,   // ID\_งานประจำวัน  
  PLAN\_DELIVERY: 1,   // PlanDelivery  
  INVOICE\_NO:    2,   // InvoiceNo  
  SHIPMENT\_NO:   3,   // ShipmentNo  
  DRIVER\_NAME:   4,   // DriverName  
  TRUCK\_LICENSE: 5,   // TruckLicense  
  CARRIER\_CODE:  6,   // CarrierCode  
  CARRIER\_NAME:  7,   // CarrierName  
  SOLD\_TO\_CODE:  8,   // SoldToCode  
  SOLD\_TO\_NAME:  9,   // SoldToName  
  SHIP\_TO\_NAME:  10,  // ShipToName  
  SHIP\_TO\_ADDR:  11,  // ShipToAddress  
  LATLNG\_SCG:    12,  // LatLong\_SCG  
  MATERIAL:      13,  // MaterialName  
  QTY:           14,  // ItemQuantity  
  QTY\_UNIT:      15,  // QuantityUnit  
  WEIGHT:        16,  // ItemWeight  
  DELIVERY\_NO:   17,  // DeliveryNo  
  DEST\_COUNT:    18,  // จำนวนปลายทาง\_System  
  DEST\_LIST:     19,  // รายชื่อปลายทาง\_System  
  SCAN\_STATUS:   20,  // ScanStatus  
  DELIVERY\_STATUS: 21, // DeliveryStatus  
  EMAIL:         22,  // Email พนักงาน  
  TOT\_QTY:       23,  // จำนวนสินค้ารวมของร้านนี้  
  TOT\_WEIGHT:    24,  // น้ำหนักสินค้ารวมของร้านนี้  
  SCAN\_INV:      25,  // จำนวน\_Invoice\_ที่ต้องสแกน  
  LATLNG\_ACTUAL: 26,  // LatLong\_Actual  
  OWNER\_LABEL:   27,  // ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน  
  SHOP\_KEY:      28   // ShopKey  
};

// \[Phase D NEW\] AI Field Column Index (ใน Database)  
// Phase D จะแยก AI keywords ออกจาก COL\_NORMALIZED  
// ตอนนี้เพิ่ม constants ไว้ก่อน ใช้จริงเมื่อ migrate data  
const AI\_CONFIG \= {  
  // Confidence thresholds สำหรับ AI matching  
  THRESHOLD\_AUTO\_MAP:    90,  // \>= 90 → append mapping ทันที  
  THRESHOLD\_REVIEW:      70,  // 70-89 → ส่งเข้า review queue  
  THRESHOLD\_IGNORE:      70,  // \< 70  → ignore

  // AI field tags  
  TAG\_AI:       "\[AI\]",  
  TAG\_REVIEWED: "\[REVIEWED\]",

  // Prompt version tracking  
  PROMPT\_VERSION: "v4.2",

  // Candidate retrieval limit ก่อนส่ง AI  
  RETRIEVAL\_LIMIT: 50  
};

CONFIG.validateSystemIntegrity \= function() {  
  var ss     \= SpreadsheetApp.getActiveSpreadsheet();  
  var errors \= \[\];  
  \[this.SHEET\_NAME, this.MAPPING\_SHEET,  
   SCG\_CONFIG.SHEET\_INPUT, this.SHEET\_POSTAL\].forEach(function(name) {  
    if (\!ss.getSheetByName(name)) errors.push("Missing Sheet: " \+ name);  
  });  
  try {  
    var key \= this.GEMINI\_API\_KEY;  
    if (\!key || key.length \< 20\) errors.push("Invalid Gemini API Key format");  
  } catch(e) {  
    errors.push("Gemini API Key not set. Run setupEnvironment() first.");  
  }  
  if (errors.length \> 0\) {  
    var msg \= "⚠️ SYSTEM INTEGRITY FAILED:\\n" \+ errors.join("\\n");  
    console.error(msg);  
    throw new Error(msg);  
  }  
  console.log("✅ System Integrity: OK");  
  return true;  
};

\`\`\`

\#\# 2\. \`Menu.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 000  
 \* 🖥️ MODULE: Menu UI Interface  
 \* Version: 4.1 Enterprise Edition (UI Text Fix)  
 \* \---------------------------------------------------  
 \* \[FIXED v4.1\]: Dynamic UI Alert pulling exact sheet names from CONFIG.  
 \* Author: Elite Logistics Architect  
 \*/

/\*\*  
 \* VERSION: 4.2 — Phase E  
 \* \[Phase E\] เพิ่มเมนู Phase D test helpers \+ Dry Run  
 \*/  
function onOpen() {  
  var ui \= SpreadsheetApp.getUi();

  // เมนู 1: Master Data  
  ui.createMenu(\\'🚛 1\. ระบบจัดการ Master Data\\')  
    .addItem(\\'1️⃣ ดึงลูกค้าใหม่ (Sync New Data)\\',        \\'syncNewDataToMaster\_UI\\')  
    .addItem(\\'2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)\\',   \\'updateGeoData\_SmartCache\\')  
    .addItem(\\'3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)\\',         \\'autoGenerateMasterList\_Smart\\')  
    .addItem(\\'🧠 4️⃣ ส่งชื่อแปลกให้ AI วิเคราะห์\\',       \\'runAIBatchResolver\_UI\\')  
    .addSeparator()  
    .addItem(\\'🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)\\',    \\'runDeepCleanBatch\_100\\')  
    .addItem(\\'🔄 รีเซ็ตความจำปุ่ม 5\\',                    \\'resetDeepCleanMemory\_UI\\')  
    .addSeparator()  
    .addItem(\\'✅ 6️⃣ จบงาน (Finalize & Move to Mapping)\\', \\'finalizeAndClean\_UI\\')  
    .addSeparator()  
    .addSubMenu(ui.createMenu(\\'🛠️ Admin & Repair Tools\\')  
      .addItem(\\'🔑 สร้าง UUID ให้ครบทุกแถว\\',              \\'assignMissingUUIDs\\')  
      .addItem(\\'🚑 ซ่อมแซม NameMapping\\',                   \\'repairNameMapping\_UI\\')  
      .addSeparator()  
      .addItem(\\'🔍 ค้นหาพิกัดซ้ำซ้อน\\',                    \\'findHiddenDuplicates\\')  
      .addItem(\\'📊 ตรวจสอบคุณภาพข้อมูล\\',                   \\'showQualityReport\_UI\\')  
      .addItem(\\'🔄 คำนวณ Quality ใหม่ทั้งหมด\\',             \\'recalculateAllQuality\\')  
      .addItem(\\'🎯 คำนวณ Confidence ใหม่ทั้งหมด\\',          \\'recalculateAllConfidence\\')  
      .addSeparator()  
      .addItem(\\'🗂️ Initialize Record Status\\',              \\'initializeRecordStatus\\')  
      .addItem(\\'🔀 Merge UUID ซ้ำซ้อน\\',                    \\'mergeDuplicates\_UI\\')  
      .addItem(\\'📋 ดูสถานะ Record ทั้งหมด\\',                \\'showRecordStatusReport\\')  
    )  
    .addToUi();

  // เมนู 2: SCG  
  ui.createMenu(\\'📦 2\. เมนูพิเศษ SCG\\')  
    .addItem(\\'📥 1\. โหลดข้อมูล Shipment (+E-POD)\\',        \\'fetchDataFromSCGJWD\\')  
    .addItem(\\'🟢 2\. อัปเดตพิกัด \+ อีเมลพนักงาน\\',          \\'applyMasterCoordinatesToDailyJob\\')  
    .addSeparator()  
    .addSubMenu(ui.createMenu(\\'📍 GPS Queue Management\\')  
      .addItem(\\'🔄 1\. Sync GPS จากคนขับ → Queue\\',          \\'syncNewDataToMaster\_UI\\')  
      .addItem(\\'✅ 2\. อนุมัติรายการที่ติ๊กแล้ว\\',            \\'applyApprovedFeedback\\')  
      .addItem(\\'📊 3\. ดูสถิติ Queue\\',                       \\'showGPSQueueStats\\')  
      .addSeparator()  
      .addItem(\\'🛠️ สร้างชีต GPS\_Queue ใหม่\\',               \\'createGPSQueueSheet\\')  
    )  
    .addSeparator()  
    .addSubMenu(ui.createMenu(\\'🧹 เมนูล้างข้อมูล (Dangerous Zone)\\')  
      .addItem(\\'⚠️ ล้างเฉพาะชีต Data\\',                     \\'clearDataSheet\_UI\\')  
      .addItem(\\'⚠️ ล้างเฉพาะชีต Input\\',                    \\'clearInputSheet\_UI\\')  
      .addItem(\\'⚠️ ล้างเฉพาะชีต สรุป\_เจ้าของสินค้า\\',       \\'clearSummarySheet\_UI\\')  
      .addItem(\\'🔥 ล้างทั้งหมด\\',                            \\'clearAllSCGSheets\_UI\\')  
    )  
    .addToUi();

  // เมนู 3: ระบบอัตโนมัติ  
  ui.createMenu(\\'🤖 3\. ระบบอัตโนมัติ\\')  
    .addItem(\\'▶️ เปิดระบบ Auto-Pilot\\',                     \\'START\_AUTO\_PILOT\\')  
    .addItem(\\'⏹️ ปิดระบบ Auto-Pilot\\',                      \\'STOP\_AUTO\_PILOT\\')  
    .addItem(\\'👋 ปิดระบบทั้งหมด\\',                            \\'STOP\_ALL\_TRIGGERS\\')  
    .addToUi();

  // เมนู 4: ตั้งค่า  
  ui.createMenu(\\'⚙️ 4\. ตั้งค่า\\')  
    .addItem(\\'🛠️ ตั้งค่า Environment\\',                     \\'setupEnvironment\\')  
    .addItem(\\'⬆️ อัปเกรดระบบ\\',                            \\'upgradeSystem\_UI\\')  
    .addItem(\\'🗑️ ล้าง Cache\\',                             \\'clearCache\_UI\\')  
    .addToUi();  
}

\`\`\`

\#\# 3\. \`Service\_Master.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม UUID, Record\_Status, Merged\_To\_UUID  
 \* \[Phase A\] เพิ่ม getRecordByUUID, getRecordsByUUIDs  
 \* \[Phase A\] เพิ่ม updateRecordStatus, mergeRecords  
 \* \[Phase A\] เพิ่ม initializeRecordStatus  
 \*/

/\*\*  
 \* ดึงข้อมูลทั้งหมดจากชีต Master Data (Database)  
 \* @returns {Array\<Array\<any\>\>} ข้อมูลทั้งหมดในชีต Database  
 \*/  
function getMasterData() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.");  
  }  
  return sheet.getDataRange().getValues();  
}

/\*\*  
 \* ดึงข้อมูลทั้งหมดจากชีต NameMapping  
 \* @returns {Array\<Array\<any\>\>} ข้อมูลทั้งหมดในชีต NameMapping  
 \*/  
function getNameMappingData() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.MAPPING\_SHEET);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ CONFIG.MAPPING\_SHEET \+ "\\" not found.");  
  }  
  return sheet.getDataRange().getValues();  
}

/\*\*  
 \* ดึงข้อมูลทั้งหมดจากชีต GPS\_Queue  
 \* @returns {Array\<Array\<any\>\>} ข้อมูลทั้งหมดในชีต GPS\_Queue  
 \*/  
function getGPSQueueData() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_GPS\_QUEUE \+ "\\" not found.");  
  }  
  return sheet.getDataRange().getValues();  
}

/\*\*  
 \* ดึงข้อมูลจากชีต Data  
 \* @returns {Array\<Array\<any\>\>} ข้อมูลทั้งหมดในชีต Data  
 \*/  
function getDataSheetData() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_DATA \+ "\\" not found.");  
  }  
  return sheet.getDataRange().getValues();  
}

/\*\*  
 \* ดึงข้อมูลจากชีต Input  
 \* @returns {Array\<Array\<any\>\>} ข้อมูลทั้งหมดในชีต Input  
 \*/  
function getInputSheetData() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_INPUT \+ "\\" not found.");  
  }  
  return sheet.getDataRange().getValues();  
}

/\*\*  
 \* ดึงข้อมูลจากชีต ข้อมูลพนักงาน  
 \* @returns {Array\<Array\<any\>\>} ข้อมูลทั้งหมดในชีต ข้อมูลพนักงาน  
 \*/  
function getEmployeeData() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_EMPLOYEE);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_EMPLOYEE \+ "\\" not found.");  
  }  
  return sheet.getDataRange().getValues();  
}

/\*\*  
 \* เขียนข้อมูลลงในชีต Master Data (Database)  
 \* @param {Array\<Array\<any\>\>} data ข้อมูลที่จะเขียน  
 \*/  
function writeMasterData(data) {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.");  
  }  
  sheet.clearContents();  
  if (data.length \> 0\) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
  }  
}

/\*\*  
 \* เขียนข้อมูลลงในชีต NameMapping  
 \* @param {Array\<Array\<any\>\>} data ข้อมูลที่จะเขียน  
 \*/  
function writeNameMappingData(data) {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.MAPPING\_SHEET);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ CONFIG.MAPPING\_SHEET \+ "\\" not found.");  
  }  
  sheet.clearContents();  
  if (data.length \> 0\) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
  }  
}

/\*\*  
 \* เขียนข้อมูลลงในชีต GPS\_Queue  
 \* @param {Array\<Array\<any\>\>} data ข้อมูลที่จะเขียน  
 \*/  
function writeGPSQueueData(data) {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_GPS\_QUEUE \+ "\\" not found.");  
  }  
  sheet.clearContents();  
  if (data.length \> 0\) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
  }  
}

/\*\*  
 \* เขียนข้อมูลลงในชีต Data  
 \* @param {Array\<Array\<any\>\>} data ข้อมูลที่จะเขียน  
 \*/  
function writeDataSheetData(data) {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_DATA \+ "\\" not found.");  
  }  
  sheet.clearContents();  
  if (data.length \> 0\) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
  }  
}

/\*\*  
 \* เขียนข้อมูลลงในชีต Input  
 \* @param {Array\<Array\<any\>\>} data ข้อมูลที่จะเขียน  
 \*/  
function writeInputSheetData(data) {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_INPUT \+ "\\" not found.");  
  }  
  sheet.clearContents();  
  if (data.length \> 0\) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
  }  
}

/\*\*  
 \* เขียนข้อมูลลงในชีต ข้อมูลพนักงาน  
 \* @param {Array\<Array\<any\>\>} data ข้อมูลที่จะเขียน  
 \*/  
function writeEmployeeData(data) {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_EMPLOYEE);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ SCG\_CONFIG.SHEET\_EMPLOYEE \+ "\\" not found.");  
  }  
  sheet.clearContents();  
  if (data.length \> 0\) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
  }  
}

/\*\*  
 \* สร้าง UUID (Universally Unique Identifier)  
 \* @returns {string} UUID 36 หลัก  
 \*/  
function generateUUID() {  
  return Utilities.getUuid();  
}

/\*\*  
 \* สร้าง UUID ให้กับทุกแถวที่ยังไม่มีในชีต Database  
 \*/  
function assignMissingUUIDs() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    SpreadsheetApp.getUi().alert("Error", "Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.", SpreadsheetApp.getUi().ButtonSet.OK);  
    return;  
  }

  var data \= sheet.getDataRange().getValues();  
  var headers \= data\[0\];  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;

  if (uuidColIdx \=== undefined) {  
    SpreadsheetApp.getUi().alert("Error", "UUID column not found in configuration.", SpreadsheetApp.getUi().ButtonSet.OK);  
    return;  
  }

  var updated \= false;  
  for (var i \= 1; i \< data.length; i++) {  
    if (\!data\[i\]\[uuidColIdx\]) {  
      data\[i\]\[uuidColIdx\] \= generateUUID();  
      updated \= true;  
    }  
  }

  if (updated) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
    SpreadsheetApp.getUi().alert("Success", "Missing UUIDs assigned.", SpreadsheetApp.getUi().ButtonSet.OK);  
  } else {  
    SpreadsheetApp.getUi().alert("Info", "No missing UUIDs found.", SpreadsheetApp.getUi().ButtonSet.OK);  
  }  
}

/\*\*  
 \* \[Phase A NEW\] ดึง Record จาก Database ด้วย UUID  
 \* @param {string} uuid UUID ของ Record ที่ต้องการ  
 \* @returns {Array\<any\>|null} Record ที่พบ หรือ null ถ้าไม่พบ  
 \*/  
function getRecordByUUID(uuid) {  
  var data \= getMasterData();  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;  
  for (var i \= 1; i \< data.length; i++) {  
    if (data\[i\]\[uuidColIdx\] \=== uuid) {  
      return data\[i\];  
    }  
  }  
  return null;  
}

/\*\*  
 \* \[Phase A NEW\] ดึงหลาย Record จาก Database ด้วย Array ของ UUIDs  
 \* @param {Array\<string\>} uuids Array ของ UUIDs ที่ต้องการ  
 \* @returns {Array\<Array\<any\>\>} Array ของ Records ที่พบ  
 \*/  
function getRecordsByUUIDs(uuids) {  
  var data \= getMasterData();  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;  
  var foundRecords \= \[\];  
  var uuidSet \= new Set(uuids);

  for (var i \= 1; i \< data.length; i++) {  
    if (uuidSet.has(data\[i\]\[uuidColIdx\])) {  
      foundRecords.push(data\[i\]);  
    }  
  }  
  return foundRecords;  
}

/\*\*  
 \* \[Phase A NEW\] อัปเดต Record\_Status ของ Record ด้วย UUID  
 \* @param {string} uuid UUID ของ Record ที่ต้องการอัปเดต  
 \* @param {string} status สถานะใหม่ (e.g., 'Active', 'Inactive', 'Merged')  
 \* @param {string} \[mergedToUUID\] UUID ของ Record หลักที่ถูกรวมด้วย (สำหรับสถานะ 'Merged')  
 \* @returns {boolean} true ถ้าอัปเดตสำเร็จ, false ถ้าไม่พบ Record  
 \*/  
function updateRecordStatus(uuid, status, mergedToUUID) {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    throw new Error("Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.");  
  }

  var data \= sheet.getDataRange().getValues();  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;  
  var statusColIdx \= CONFIG.C\_IDX.RECORD\_STATUS;  
  var mergedToUUIDColIdx \= CONFIG.C\_IDX.MERGED\_TO\_UUID;

  for (var i \= 1; i \< data.length; i++) {  
    if (data\[i\]\[uuidColIdx\] \=== uuid) {  
      data\[i\]\[statusColIdx\] \= status;  
      if (status \=== 'Merged' && mergedToUUID) {  
        data\[i\]\[mergedToUUIDColIdx\] \= mergedToUUID;  
      } else {  
        data\[i\]\[mergedToUUIDColIdx\] \= ''; // Clear if not merged  
      }  
      sheet.getRange(i \+ 1, 1, 1, data\[0\].length).setValues(\[data\[i\]\]);  
      return true;  
    }  
  }  
  return false;  
}

/\*\*  
 \* \[Phase A NEW\] รวม Record ที่ซ้ำซ้อนกัน  
 \* @param {string} masterUUID UUID ของ Record หลักที่จะเก็บไว้  
 \* @param {Array\<string\>} duplicateUUIDs Array ของ UUIDs ของ Record ที่จะถูกรวมและ Soft Delete  
 \*/  
function mergeRecords(masterUUID, duplicateUUIDs) {  
  if (\!masterUUID || \!duplicateUUIDs || duplicateUUIDs.length \=== 0\) {  
    throw new Error("Invalid input for mergeRecords.");  
  }

  // 1\. ตรวจสอบว่า masterUUID มีอยู่จริงและเป็น Active  
  var masterRecord \= getRecordByUUID(masterUUID);  
  if (\!masterRecord || masterRecord\[CONFIG.C\_IDX.RECORD\_STATUS\] \!== 'Active') {  
    throw new Error("Master UUID not found or not active: " \+ masterUUID);  
  }

  // 2\. อัปเดตสถานะของ duplicate records เป็น 'Merged' และชี้ไปที่ masterUUID  
  duplicateUUIDs.forEach(function(uuid) {  
    if (uuid \!== masterUUID) {  
      updateRecordStatus(uuid, 'Merged', masterUUID);  
      Logger.log("Merged record " \+ uuid \+ " into " \+ masterUUID);  
    }  
  });

  // 3\. (Optional) อาจจะมีการย้ายข้อมูลบางอย่างจาก duplicate ไป master  
  // เช่น ถ้า master มีข้อมูลบางคอลัมน์ว่าง แต่ duplicate มีข้อมูล  
  // ในโปรเจกต์นี้ยังไม่ได้ implement ส่วนนี้

  SpreadsheetApp.getUi().alert("Success", "Records merged successfully.", SpreadsheetApp.getUi().ButtonSet.OK);  
}

/\*\*  
 \* \[Phase A NEW\] UI สำหรับ Merge UUID ซ้ำซ้อน  
 \*/  
function mergeDuplicates\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.prompt(  
    'Merge Duplicate Records',  
    'Enter Master UUID (record to keep) and Duplicate UUIDs (comma-separated, to merge and soft delete):\\nExample: master\_uuid,dup\_uuid1,dup\_uuid2',  
    ui.ButtonSet.OK\_CANCEL);

  if (response.getSelectedButton() \== ui.Button.OK) {  
    var input \= response.getResponseText();  
    var parts \= input.split(',').map(function(s) { return s.trim(); });  
    if (parts.length \< 2\) {  
      ui.alert('Error', 'Please provide at least one Master UUID and one Duplicate UUID.', ui.ButtonSet.OK);  
      return;  
    }  
    var masterUUID \= parts\[0\];  
    var duplicateUUIDs \= parts.slice(1);

    try {  
      mergeRecords(masterUUID, duplicateUUIDs);  
    } catch (e) {  
      ui.alert('Error', 'Failed to merge records: ' \+ e.message, ui.ButtonSet.OK);  
    }  
  }  
}

/\*\*  
 \* \[Phase A NEW\] Initialize Record\_Status สำหรับทุก Record ที่ยังไม่มีสถานะ  
 \*/  
function initializeRecordStatus() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    SpreadsheetApp.getUi().alert("Error", "Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.", SpreadsheetApp.getUi().ButtonSet.OK);  
    return;  
  }

  var data \= sheet.getDataRange().getValues();  
  var statusColIdx \= CONFIG.C\_IDX.RECORD\_STATUS;  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;

  if (statusColIdx \=== undefined || uuidColIdx \=== undefined) {  
    SpreadsheetApp.getUi().alert("Error", "Record Status or UUID column not found in configuration.", SpreadsheetApp.getUi().ButtonSet.OK);  
    return;  
  }

  var updated \= false;  
  for (var i \= 1; i \< data.length; i++) {  
    // ตรวจสอบว่ามี UUID และ Record\_Status ว่างเปล่า  
    if (data\[i\]\[uuidColIdx\] && \!data\[i\]\[statusColIdx\]) {  
      data\[i\]\[statusColIdx\] \= 'Active';  
      updated \= true;  
    }  
  }

  if (updated) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
    SpreadsheetApp.getUi().alert("Success", "Record Status initialized for missing records.", SpreadsheetApp.getUi().ButtonSet.OK);  
  } else {  
    SpreadsheetApp.getUi().alert("Info", "No records found with missing status.", SpreadsheetApp.getUi().ButtonSet.OK);  
  }  
}

/\*\*  
 \* \[Phase A NEW\] แสดงรายงานสถานะของ Record ทั้งหมด  
 \*/  
function showRecordStatusReport() {  
  var data \= getMasterData();  
  var statusColIdx \= CONFIG.C\_IDX.RECORD\_STATUS;  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;  
  var nameColIdx \= CONFIG.C\_IDX.NAME;

  var activeCount \= 0;  
  var inactiveCount \= 0;  
  var mergedCount \= 0;  
  var unknownCount \= 0;

  var report \= \[\];  
  report.push(\["UUID", "Name", "Status", "Merged To UUID"\]);

  for (var i \= 1; i \< data.length; i++) {  
    var status \= data\[i\]\[statusColIdx\] || 'UNKNOWN';  
    var uuid \= data\[i\]\[uuidColIdx\] || '';  
    var name \= data\[i\]\[nameColIdx\] || '';  
    var mergedToUUID \= data\[i\]\[CONFIG.C\_IDX.MERGED\_TO\_UUID\] || '';

    report.push(\[uuid, name, status, mergedToUUID\]);

    switch (status) {  
      case 'Active':  
        activeCount++;  
        break;  
      case 'Inactive':  
        inactiveCount++;  
        break;  
      case 'Merged':  
        mergedCount++;  
        break;  
      default:  
        unknownCount++;  
        break;  
    }  
  }

  var msg \= "Record Status Report:\\n";  
  msg \+= "Active: " \+ activeCount \+ "\\n";  
  msg \+= "Inactive: " \+ inactiveCount \+ "\\n";  
  msg \+= "Merged: " \+ mergedCount \+ "\\n";  
  msg \+= "Unknown: " \+ unknownCount \+ "\\n";  
  msg \+= "Total Records (excluding header): " \+ (data.length \- 1\) \+ "\\n\\n";  
  msg \+= "Full report generated in a new sheet 'RecordStatusReport'.";

  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var reportSheet \= ss.getSheetByName('RecordStatusReport');  
  if (reportSheet) {  
    reportSheet.clearContents();  
  } else {  
    reportSheet \= ss.insertSheet('RecordStatusReport');  
  }  
  reportSheet.getRange(1, 1, report.length, report\[0\].length).setValues(report);

  SpreadsheetApp.getUi().alert("Record Status Report", msg, SpreadsheetApp.getUi().ButtonSet.OK);  
}

\`\`\`

\#\# 4\. \`Service\_Maintenance.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม autoArchiveInactiveRecords\_UI  
 \*/

/\*\*  
 \* \[Phase A NEW\] ย้าย Record ที่มี Record\_Status เป็น 'Inactive' หรือ 'Merged' ไปยังชีต Archive\_DB  
 \*/  
function autoArchiveInactiveRecords\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.alert(  
    'Archive Inactive Records',  
    'This will move all records with status \\'Inactive\\' or \\'Merged\\' from Database to Archive\_DB. Do you want to proceed?',  
    ui.ButtonSet.YES\_NO);

  if (response \== ui.Button.YES) {  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    var archiveSheet \= ss.getSheetByName('Archive\_DB');

    if (\!dbSheet) {  
      ui.alert('Error', 'Database sheet not found.', ui.ButtonSet.OK);  
      return;  
    }

    if (\!archiveSheet) {  
      archiveSheet \= ss.insertSheet('Archive\_DB');  
      // Copy headers from Database to Archive\_DB  
      var dbHeaders \= dbSheet.getRange(1, 1, 1, dbSheet.getLastColumn()).getValues();  
      archiveSheet.getRange(1, 1, 1, dbHeaders\[0\].length).setValues(dbHeaders);  
    }

    var dbData \= dbSheet.getDataRange().getValues();  
    var headers \= dbData\[0\];  
    var statusColIdx \= CONFIG.C\_IDX.RECORD\_STATUS;

    var recordsToKeep \= \[headers\];  
    var recordsToArchive \= \[\];

    for (var i \= 1; i \< dbData.length; i++) {  
      var record \= dbData\[i\];  
      var status \= record\[statusColIdx\];

      if (status \=== 'Inactive' || status \=== 'Merged') {  
        recordsToArchive.push(record);  
      } else {  
        recordsToKeep.push(record);  
      }  
    }

    if (recordsToArchive.length \> 0\) {  
      // Append to Archive\_DB  
      var lastRow \= archiveSheet.getLastRow();  
      archiveSheet.getRange(lastRow \+ 1, 1, recordsToArchive.length, recordsToArchive\[0\].length).setValues(recordsToArchive);

      // Overwrite Database with records to keep  
      dbSheet.clearContents();  
      dbSheet.getRange(1, 1, recordsToKeep.length, recordsToKeep\[0\].length).setValues(recordsToKeep);

      ui.alert('Success', recordsToArchive.length \+ ' records archived successfully.', ui.ButtonSet.OK);  
    } else {  
      ui.alert('Info', 'No inactive or merged records found to archive.', ui.ButtonSet.OK);  
    }  
  }  
}

/\*\*  
 \* \[Phase A NEW\] UI สำหรับแสดงรายงานคุณภาพข้อมูล  
 \*/  
function showQualityReport\_UI() {  
  var data \= getMasterData();  
  var qualityColIdx \= CONFIG.C\_IDX.QUALITY;  
  var confidenceColIdx \= CONFIG.C\_IDX.CONFIDENCE;  
  var nameColIdx \= CONFIG.C\_IDX.NAME;  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;

  var lowQualityCount \= 0;  
  var lowConfidenceCount \= 0;  
  var totalRecords \= data.length \- 1;

  var report \= \[\];  
  report.push(\["UUID", "Name", "Quality", "Confidence"\]);

  for (var i \= 1; i \< data.length; i++) {  
    var record \= data\[i\];  
    var uuid \= record\[uuidColIdx\] || '';  
    var name \= record\[nameColIdx\] || '';  
    var quality \= record\[qualityColIdx\] || 0;  
    var confidence \= record\[confidenceColIdx\] || 0;

    report.push(\[uuid, name, quality, confidence\]);

    if (quality \< 50\) {  
      lowQualityCount++;  
    }  
    if (confidence \< 50\) {  
      lowConfidenceCount++;  
    }  
  }

  var msg \= "Data Quality Report:\\n";  
  msg \+= "Total Records: " \+ totalRecords \+ "\\n";  
  msg \+= "Records with Quality \< 50: " \+ lowQualityCount \+ "\\n";  
  msg \+= "Records with Confidence \< 50: " \+ lowConfidenceCount \+ "\\n\\n";  
  msg \+= "Full report generated in a new sheet 'QualityReport'.";

  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var reportSheet \= ss.getSheetByName('QualityReport');  
  if (reportSheet) {  
    reportSheet.clearContents();  
  } else {  
    reportSheet \= ss.insertSheet('QualityReport');  
  }  
  reportSheet.getRange(1, 1, report.length, report\[0\].length).setValues(report);

  SpreadsheetApp.getUi().alert("Data Quality Report", msg, SpreadsheetApp.getUi().ButtonSet.OK);  
}

/\*\*  
 \* \[Phase A NEW\] คำนวณ Quality Score ใหม่ทั้งหมด  
 \*/  
function recalculateAllQuality() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    SpreadsheetApp.getUi().alert("Error", "Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.", SpreadsheetApp.getUi().ButtonSet.OK);  
    return;  
  }

  var data \= sheet.getDataRange().getValues();  
  var qualityColIdx \= CONFIG.C\_IDX.QUALITY;  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;  
  var nameColIdx \= CONFIG.C\_IDX.NAME;  
  var latColIdx \= CONFIG.C\_IDX.LAT;  
  var lngColIdx \= CONFIG.C\_IDX.LNG;  
  var sysAddrColIdx \= CONFIG.C\_IDX.SYS\_ADDR;  
  var googAddrColIdx \= CONFIG.C\_IDX.GOOGLE\_ADDR;

  var updated \= false;  
  for (var i \= 1; i \< data.length; i++) {  
    var record \= data\[i\];  
    var quality \= 0;

    // Basic quality checks (can be expanded)  
    if (record\[uuidColIdx\]) quality \+= 20;  
    if (record\[nameColIdx\]) quality \+= 20;  
    if (record\[latColIdx\] && record\[lngColIdx\]) quality \+= 20;  
    if (record\[sysAddrColIdx\] || record\[googAddrColIdx\]) quality \+= 20;  
    if (record\[CONFIG.C\_IDX.VERIFIED\]) quality \+= 20; // If verified by human, higher quality

    // Cap quality at 100  
    quality \= Math.min(100, quality);

    if (record\[qualityColIdx\] \!== quality) {  
      record\[qualityColIdx\] \= quality;  
      updated \= true;  
    }  
  }

  if (updated) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
    SpreadsheetApp.getUi().alert("Success", "All Quality Scores recalculated.", SpreadsheetApp.getUi().ButtonSet.OK);  
  } else {  
    SpreadsheetApp.getUi().alert("Info", "No Quality Scores needed recalculation.", SpreadsheetApp.getUi().ButtonSet.OK);  
  }  
}

/\*\*  
 \* \[Phase A NEW\] คำนวณ Confidence Score ใหม่ทั้งหมด  
 \*/  
function recalculateAllConfidence() {  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    SpreadsheetApp.getUi().alert("Error", "Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.", SpreadsheetApp.getUi().ButtonSet.OK);  
    return;  
  }

  var data \= sheet.getDataRange().getValues();  
  var confidenceColIdx \= CONFIG.C\_IDX.CONFIDENCE;  
  var normalizedColIdx \= CONFIG.C\_IDX.NORMALIZED;  
  var suggestedColIdx \= CONFIG.C\_IDX.SUGGESTED;  
  var verifiedColIdx \= CONFIG.C\_IDX.VERIFIED;

  var updated \= false;  
  for (var i \= 1; i \< data.length; i++) {  
    var record \= data\[i\];  
    var confidence \= 0;

    // Basic confidence checks (can be expanded)  
    if (record\[verifiedColIdx\]) {  
      confidence \= 100; // Human verified is 100% confident  
    } else if (record\[normalizedColIdx\] && record\[suggestedColIdx\] && record\[normalizedColIdx\] \=== record\[suggestedColIdx\]) {  
      confidence \= 80; // AI suggested and normalized match well  
    } else if (record\[normalizedColIdx\]) {  
      confidence \= 60; // Only normalized exists  
    }

    // Cap confidence at 100  
    confidence \= Math.min(100, confidence);

    if (record\[confidenceColIdx\] \!== confidence) {  
      record\[confidenceColIdx\] \= confidence;  
      updated \= true;  
    }  
  }

  if (updated) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
    SpreadsheetApp.getUi().alert("Success", "All Confidence Scores recalculated.", SpreadsheetApp.getUi().ButtonSet.OK);  
  } else {  
    SpreadsheetApp.getUi().alert("Info", "No Confidence Scores needed recalculation.", SpreadsheetApp.getUi().ButtonSet.OK);  
  }  
}

\`\`\`

\#\# 5\. \`Service\_Agent.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม getAgentEmailByShipToName  
 \*/

/\*\*  
 \* ดึงอีเมลพนักงานจากชีต 'ข้อมูลพนักงาน' โดยใช้ ShipToName  
 \* @param {string} shipToName ชื่อสถานที่ส่งสินค้า  
 \* @returns {string|null} อีเมลพนักงานที่เกี่ยวข้อง หรือ null ถ้าไม่พบ  
 \*/  
function getAgentEmailByShipToName(shipToName) {  
  var employeeData \= getEmployeeData(); // Assume getEmployeeData() is in Service\_Master.gs  
  if (employeeData.length \< 2\) return null; // No headers or no data

  var headers \= employeeData\[0\];  
  var nameColIdx \= headers.indexOf('ชื่อพนักงาน'); // Adjust column name as needed  
  var emailColIdx \= headers.indexOf('Email'); // Adjust column name as needed  
  var shipToNameColIdx \= headers.indexOf('ShipToName\_Mapping'); // Adjust column name as needed

  if (nameColIdx \=== \-1 || emailColIdx \=== \-1 || shipToNameColIdx \=== \-1) {  
    Logger.log("Employee sheet headers not found: ชื่อพนักงาน, Email, ShipToName\_Mapping");  
    return null;  
  }

  for (var i \= 1; i \< employeeData.length; i++) {  
    if (employeeData\[i\]\[shipToNameColIdx\] && employeeData\[i\]\[shipToNameColIdx\].toString().toLowerCase() \=== shipToName.toLowerCase()) {  
      return employeeData\[i\]\[emailColIdx\];  
    }  
  }  
  return null;  
}

\`\`\`

\#\# 6\. \`Service\_AutoPilot.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม processAIIndexing\_Batch  
 \* \[Phase A\] เพิ่ม callGeminiThinking\_JSON  
 \* \[Phase A\] เพิ่ม START\_AUTO\_PILOT, STOP\_AUTO\_PILOT, STOP\_ALL\_TRIGGERS  
 \*/

/\*\*  
 \* \[Phase A NEW\] ประมวลผล AI Indexing เป็น Batch  
 \* ดึง Record ที่ยังไม่มี COL\_NORMALIZED หรือมี QUALITY ต่ำ มาส่งให้ AI วิเคราะห์  
 \*/  
function processAIIndexing\_Batch() {  
  if (\!CONFIG.USE\_AI\_AUTO\_FIX) {  
    Logger.log("AI Auto-Fix is disabled in CONFIG.");  
    return;  
  }

  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    Logger.log("Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.");  
    return;  
  }

  var data \= sheet.getDataRange().getValues();  
  var headers \= data\[0\];  
  var nameColIdx \= CONFIG.C\_IDX.NAME;  
  var normalizedColIdx \= CONFIG.C\_IDX.NORMALIZED;  
  var qualityColIdx \= CONFIG.C\_IDX.QUALITY;  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;

  var recordsToProcess \= \[\];  
  var rowIndices \= \[\];

  for (var i \= 1; i \< data.length; i++) {  
    var record \= data\[i\];  
    // Process records that are Active, have a name, and either no normalized value or low quality  
    if (record\[CONFIG.C\_IDX.RECORD\_STATUS\] \=== 'Active' &&  
        record\[nameColIdx\] &&  
        (\!record\[normalizedColIdx\] || record\[qualityColIdx\] \< 70)) {  
      recordsToProcess.push({  
        uuid: record\[uuidColIdx\],  
        name: record\[nameColIdx\],  
        rowIndex: i  
      });  
      if (recordsToProcess.length \>= CONFIG.AI\_BATCH\_SIZE) break; // Process in batches  
    }  
  }

  if (recordsToProcess.length \=== 0\) {  
    Logger.log("No records found for AI indexing.");  
    return;  
  }

  Logger.log("Processing " \+ recordsToProcess.length \+ " records with AI.");

  var prompt \= "Analyze the following names and extract key entities, keywords, and a normalized version. Respond in JSON format with an array of objects, each having 'originalName', 'normalizedName', and 'keywords' (array of strings). Example: \[{originalName: 'บริษัท กขค จำกัด (มหาชน)', normalizedName: 'กขค', keywords: \['กขค', 'บริษัท', 'มหาชน'\]}\].\\nNames: " \+  
               JSON.stringify(recordsToProcess.map(r \=\> r.name));

  try {  
    var aiResponse \= callGeminiThinking\_JSON(prompt);  
    var results \= JSON.parse(aiResponse);

    results.forEach(function(result) {  
      var originalName \= result.originalName;  
      var normalizedName \= result.normalizedName;  
      var keywords \= result.keywords ? result.keywords.join(', ') : '';

      // Find the original record by originalName (or UUID if passed)  
      var targetRecord \= recordsToProcess.find(r \=\> r.name \=== originalName);  
      if (targetRecord) {  
        var rowIndex \= targetRecord.rowIndex;  
        data\[rowIndex\]\[normalizedColIdx\] \= normalizedName \+ (keywords ? ' (' \+ keywords \+ ')' : '');  
        // Optionally update quality/confidence based on AI processing  
        data\[rowIndex\]\[qualityColIdx\] \= Math.min(100, (data\[rowIndex\]\[qualityColIdx\] || 0\) \+ 10);  
        data\[rowIndex\]\[CONFIG.C\_IDX.UPDATED\] \= new Date();  
      }  
    });

    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
    Logger.log("AI indexing batch completed.");  
  } catch (e) {  
    Logger.log("Error during AI indexing: " \+ e.message);  
  }  
}

/\*\*  
 \* \[Phase A NEW\] เรียกใช้ Gemini API เพื่อวิเคราะห์ข้อความและคืนค่าเป็น JSON  
 \* @param {string} prompt ข้อความ Prompt สำหรับ Gemini  
 \* @returns {string} JSON string จาก Gemini  
 \*/  
function callGeminiThinking\_JSON(prompt) {  
  var API\_KEY \= CONFIG.GEMINI\_API\_KEY;  
  var API\_URL \= "https://generativelanguage.googleapis.com/v1beta/models/" \+ CONFIG.AI\_MODEL \+ ":generateContent?key=" \+ API\_KEY;

  var requestBody \= {  
    contents: \[{  
      parts: \[{  
        text: prompt  
      }\]  
    }\]  
  };

  var options \= {  
    method: 'post',  
    contentType: 'application/json',  
    payload: JSON.stringify(requestBody),  
    muteHttpExceptions: true,  
    headers: {  
      'x-goog-api-key': API\_KEY // Redundant but good practice  
    }  
  };

  var response \= UrlFetchApp.fetch(API\_URL, options);  
  var responseCode \= response.getResponseCode();  
  var responseBody \= response.getContentText();

  if (responseCode \=== 200\) {  
    var jsonResponse \= JSON.parse(responseBody);  
    if (jsonResponse.candidates && jsonResponse.candidates.length \> 0\) {  
      return jsonResponse.candidates\[0\].content.parts\[0\].text;  
    } else {  
      throw new Error("Gemini API did not return any candidates: " \+ responseBody);  
    }  
  } else {  
    throw new Error("Gemini API error: " \+ responseCode \+ " \- " \+ responseBody);  
  }  
}

/\*\*  
 \* \[Phase A NEW\] UI สำหรับรัน AI Batch Resolver  
 \*/  
function runAIBatchResolver\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  ui.alert('AI Batch Resolver', 'Starting AI batch processing for names. This may take a while.', ui.ButtonSet.OK);  
  try {  
    processAIIndexing\_Batch();  
    ui.alert('AI Batch Resolver', 'AI batch processing completed.', ui.ButtonSet.OK);  
  } catch (e) {  
    ui.alert('Error', 'AI batch processing failed: ' \+ e.message, ui.ButtonSet.OK);  
  }  
}

/\*\*  
 \* \[Phase A NEW\] เปิดระบบ Auto-Pilot โดยการสร้าง Time-driven Triggers  
 \*/  
function START\_AUTO\_PILOT() {  
  var ui \= SpreadsheetApp.getUi();  
  var triggers \= ScriptApp.getProjectTriggers();  
  var hasAIIndexingTrigger \= false;  
  var hasDeepCleanTrigger \= false;

  triggers.forEach(function(trigger) {  
    if (trigger.getHandlerFunction() \=== 'processAIIndexing\_Batch') {  
      hasAIIndexingTrigger \= true;  
    }  
    if (trigger.getHandlerFunction() \=== 'runDeepCleanBatch\_100') {  
      hasDeepCleanTrigger \= true;  
    }  
  });

  if (\!hasAIIndexingTrigger) {  
    ScriptApp.newTrigger('processAIIndexing\_Batch')  
      .timeBased()  
      .everyHours(1) // Run every hour  
      .create();  
    Logger.log("Created trigger for processAIIndexing\_Batch.");  
  }

  if (\!hasDeepCleanTrigger) {  
    ScriptApp.newTrigger('runDeepCleanBatch\_100')  
      .timeBased()  
      .everyHours(4) // Run every 4 hours  
      .create();  
    Logger.log("Created trigger for runDeepCleanBatch\_100.");  
  }

  ui.alert('Auto-Pilot', 'Auto-Pilot system started. Triggers are now active.', ui.ButtonSet.OK);  
}

/\*\*  
 \* \[Phase A NEW\] ปิดระบบ Auto-Pilot โดยการลบ Time-driven Triggers  
 \*/  
function STOP\_AUTO\_PILOT() {  
  var ui \= SpreadsheetApp.getUi();  
  var triggers \= ScriptApp.getProjectTriggers();  
  var removedCount \= 0;

  triggers.forEach(function(trigger) {  
    if (trigger.getHandlerFunction() \=== 'processAIIndexing\_Batch' ||  
        trigger.getHandlerFunction() \=== 'runDeepCleanBatch\_100') {  
      ScriptApp.deleteTrigger(trigger);  
      removedCount++;  
    }  
  });

  if (removedCount \> 0\) {  
    ui.alert('Auto-Pilot', removedCount \+ ' Auto-Pilot triggers stopped.', ui.ButtonSet.OK);  
  } else {  
    ui.alert('Auto-Pilot', 'No active Auto-Pilot triggers found.', ui.ButtonSet.OK);  
  }  
}

/\*\*  
 \* \[Phase A NEW\] ปิด Trigger ทั้งหมดของโปรเจกต์นี้  
 \*/  
function STOP\_ALL\_TRIGGERS() {  
  var ui \= SpreadsheetApp.getUi();  
  var triggers \= ScriptApp.getProjectTriggers();  
  var removedCount \= 0;

  triggers.forEach(function(trigger) {  
    ScriptApp.deleteTrigger(trigger);  
    removedCount++;  
  });

  if (removedCount \> 0\) {  
    ui.alert('All Triggers Stopped', removedCount \+ ' triggers have been stopped.', ui.ButtonSet.OK);  
  } else {  
    ui.alert('All Triggers Stopped', 'No active triggers found.', ui.ButtonSet.OK);  
  }  
}

\`\`\`

\#\# 7\. \`Service\_GPSFeedback.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม applyApprovedFeedback  
 \* \[Phase A\] เพิ่ม createGPSQueueSheet  
 \* \[Phase A\] เพิ่ม showGPSQueueStats  
 \*/

/\*\*  
 \* \[Phase A NEW\] อัปเดตพิกัดใน Database ตามรายการที่อนุมัติใน GPS\_Queue  
 \*/  
function applyApprovedFeedback() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var gpsQueueSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
  var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);

  if (\!gpsQueueSheet || \!dbSheet) {  
    ui.alert('Error', 'GPS\_Queue or Database sheet not found.', ui.ButtonSet.OK);  
    return;  
  }

  var gpsQueueData \= gpsQueueSheet.getDataRange().getValues();  
  var dbData \= dbSheet.getDataRange().getValues();

  if (gpsQueueData.length \< 2\) {  
    ui.alert('Info', 'No feedback in GPS\_Queue to apply.', ui.ButtonSet.OK);  
    return;  
  }

  var headers \= gpsQueueData\[0\];  
  var approveColIdx \= headers.indexOf('Approve');  
  var rejectColIdx \= headers.indexOf('Reject');  
  var uuidDbColIdx \= headers.indexOf('UUID\_DB');  
  var latLngDriverColIdx \= headers.indexOf('LatLng\_Driver');

  if (approveColIdx \=== \-1 || rejectColIdx \=== \-1 || uuidDbColIdx \=== \-1 || latLngDriverColIdx \=== \-1) {  
    ui.alert('Error', 'Required columns (Approve, Reject, UUID\_DB, LatLng\_Driver) not found in GPS\_Queue.', ui.ButtonSet.OK);  
    return;  
  }

  var updatedDbRecords \= {}; // Map UUID to updated record  
  var processedQueueRows \= \[\]; // Rows in GPS\_Queue that have been processed

  for (var i \= 1; i \< gpsQueueData.length; i++) {  
    var row \= gpsQueueData\[i\];  
    var isApproved \= row\[approveColIdx\];  
    var isRejected \= row\[rejectColIdx\];  
    var uuid \= row\[uuidDbColIdx\];  
    var latLngDriver \= row\[latLngDriverColIdx\];

    if (isApproved && \!isRejected && uuid && latLngDriver) {  
      var parts \= latLngDriver.split(',').map(s \=\> s.trim());  
      var newLat \= parseFloat(parts\[0\]);  
      var newLng \= parseFloat(parts\[1\]);

      if (\!isNaN(newLat) && \!isNaN(newLng)) {  
        // Find the record in Database and update  
        for (var j \= 1; j \< dbData.length; j++) {  
          if (dbData\[j\]\[CONFIG.C\_IDX.UUID\] \=== uuid) {  
            dbData\[j\]\[CONFIG.C\_IDX.LAT\] \= newLat;  
            dbData\[j\]\[CONFIG.C\_IDX.LNG\] \= newLng;  
            dbData\[j\]\[CONFIG.C\_IDX.COORD\_SOURCE\] \= 'Driver Approved';  
            dbData\[j\]\[CONFIG.C\_IDX.COORD\_CONFIDENCE\] \= 100; // Human approved  
            dbData\[j\]\[CONFIG.C\_IDX.COORD\_LAST\_UPDATED\] \= new Date();  
            updatedDbRecords\[uuid\] \= true;  
            break;  
          }  
        }  
        processedQueueRows.push(i); // Mark for removal from queue  
      }  
    } else if (isRejected && \!isApproved) {  
      processedQueueRows.push(i); // Mark for removal from queue if rejected  
    }  
  }

  if (Object.keys(updatedDbRecords).length \> 0\) {  
    dbSheet.getRange(1, 1, dbData.length, dbData\[0\].length).setValues(dbData);  
    ui.alert('Success', Object.keys(updatedDbRecords).length \+ ' records updated in Database.', ui.ButtonSet.OK);  
  } else {  
    ui.alert('Info', 'No approved feedback to apply to Database.', ui.ButtonSet.OK);  
  }

  // Remove processed rows from GPS\_Queue (from bottom up to avoid index issues)  
  for (var k \= processedQueueRows.length \- 1; k \>= 0; k--) {  
    gpsQueueSheet.deleteRow(processedQueueRows\[k\] \+ 1); // \+1 because sheet rows are 1-indexed  
  }  
}

/\*\*  
 \* \[Phase A NEW\] สร้างชีต GPS\_Queue ใหม่พร้อม Header  
 \*/  
function createGPSQueueSheet() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= SCG\_CONFIG.SHEET\_GPS\_QUEUE;  
  var existingSheet \= ss.getSheetByName(sheetName);

  if (existingSheet) {  
    var ui \= SpreadsheetApp.getUi();  
    var response \= ui.alert(  
      'Sheet Exists',  
      'Sheet \\'' \+ sheetName \+ '\\' already exists. Do you want to clear its contents and re-create headers?',  
      ui.ButtonSet.YES\_NO);  
    if (response \== ui.Button.YES) {  
      existingSheet.clearContents();  
    } else {  
      return;  
    }  
  } else {  
    existingSheet \= ss.insertSheet(sheetName);  
  }

  var headers \= Object.values(CONFIG.GPS\_QUEUE\_REQUIRED\_HEADERS);  
  existingSheet.getRange(1, 1, 1, headers.length).setValues(\[headers\]);  
  SpreadsheetApp.getUi().alert('Success', 'Sheet \\'' \+ sheetName \+ '\\' created/re-created with headers.', SpreadsheetApp.getUi().ButtonSet.OK);  
}

/\*\*  
 \* \[Phase A NEW\] แสดงสถิติของ GPS\_Queue  
 \*/  
function showGPSQueueStats() {  
  var ui \= SpreadsheetApp.getUi();  
  var gpsQueueData \= getGPSQueueData();

  if (gpsQueueData.length \< 2\) {  
    ui.alert('GPS Queue Stats', 'GPS\_Queue is empty.', ui.ButtonSet.OK);  
    return;  
  }

  var totalEntries \= gpsQueueData.length \- 1;  
  ui.alert('GPS Queue Stats', 'Total entries in GPS\_Queue: ' \+ totalEntries, ui.ButtonSet.OK);  
}

\`\`\`

\#\# 8\. \`Service\_GeoAddr.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม updateGeoData\_SmartCache  
 \*/

/\*\*  
 \* \[Phase A NEW\] อัปเดตข้อมูลพิกัดและที่อยู่สำหรับ Record ที่ยังไม่มีหรือมีคุณภาพต่ำ  
 \* ใช้ Smart Cache เพื่อลดการเรียกใช้ Google Maps API ซ้ำซ้อน  
 \*/  
function updateGeoData\_SmartCache() {  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) {  
    ui.alert("Error", "Sheet \\"" \+ CONFIG.SHEET\_NAME \+ "\\" not found.", ui.ButtonSet.OK);  
    return;  
  }

  var data \= sheet.getDataRange().getValues();  
  var headers \= data\[0\];  
  var nameColIdx \= CONFIG.C\_IDX.NAME;  
  var latColIdx \= CONFIG.C\_IDX.LAT;  
  var lngColIdx \= CONFIG.C\_IDX.LNG;  
  var sysAddrColIdx \= CONFIG.C\_IDX.SYS\_ADDR;  
  var googAddrColIdx \= CONFIG.C\_IDX.GOOGLE\_ADDR;  
  var qualityColIdx \= CONFIG.C\_IDX.QUALITY;  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;  
  var coordSourceColIdx \= CONFIG.C\_IDX.COORD\_SOURCE;  
  var coordConfidenceColIdx \= CONFIG.C\_IDX.COORD\_CONFIDENCE;  
  var coordLastUpdatedColIdx \= CONFIG.C\_IDX.COORD\_LAST\_UPDATED;

  var recordsToProcess \= \[\];  
  for (var i \= 1; i \< data.length; i++) {  
    var record \= data\[i\];  
    // Process records that are Active, have a name, and either no Lat/Lng or low quality  
    if (record\[CONFIG.C\_IDX.RECORD\_STATUS\] \=== 'Active' &&  
        record\[nameColIdx\] &&  
        ((\!record\[latColIdx\] || \!record\[lngColIdx\]) || record\[qualityColIdx\] \< 80)) {  
      recordsToProcess.push({  
        rowIndex: i,  
        name: record\[nameColIdx\],  
        currentLat: record\[latColIdx\],  
        currentLng: record\[lngColIdx\]  
      });  
      if (recordsToProcess.length \>= CONFIG.BATCH\_LIMIT) break; // Process in batches  
    }  
  }

  if (recordsToProcess.length \=== 0\) {  
    ui.alert("Info", "No records found needing GeoData update.", ui.ButtonSet.OK);  
    return;  
  }

  Logger.log("Processing " \+ recordsToProcess.length \+ " records for GeoData.");

  var cache \= CacheService.getScriptCache();  
  var updatedCount \= 0;

  recordsToProcess.forEach(function(item) {  
    var address \= item.name; // Use name as address for geocoding  
    var cachedResult \= cache.get(address);  
    var geoResult;

    if (cachedResult) {  
      geoResult \= JSON.parse(cachedResult);  
      Logger.log("Cache hit for " \+ address);  
    } else {  
      Utilities.sleep(100); // Be nice to API limits  
      var geocoder \= Maps.newGeocoder();  
      var response \= geocoder.geocode(address);  
      if (response.results.length \> 0\) {  
        var location \= response.results\[0\].geometry.location;  
        var formattedAddress \= response.results\[0\].formatted\_address;  
        geoResult \= {  
          lat: location.lat,  
          lng: location.lng,  
          formattedAddress: formattedAddress  
        };  
        cache.put(address, JSON.stringify(geoResult), CONFIG.CACHE\_EXPIRATION); // Cache for 6 hours  
        Logger.log("Cache miss, geocoded " \+ address);  
      } else {  
        Logger.log("No geocoding result for " \+ address);  
        return; // Skip to next record  
      }  
    }

    var rowIndex \= item.rowIndex;  
    data\[rowIndex\]\[latColIdx\] \= geoResult.lat;  
    data\[rowIndex\]\[lngColIdx\] \= geoResult.lng;  
    data\[rowIndex\]\[googAddrColIdx\] \= geoResult.formattedAddress;  
    data\[rowIndex\]\[coordSourceColIdx\] \= 'Google Geocoder';  
    data\[rowIndex\]\[coordConfidenceColIdx\] \= 90; // High confidence from Google  
    data\[rowIndex\]\[coordLastUpdatedColIdx\] \= new Date();  
    data\[rowIndex\]\[qualityColIdx\] \= Math.min(100, (data\[rowIndex\]\[qualityColIdx\] || 0\) \+ 10); // Boost quality  
    data\[rowIndex\]\[CONFIG.C\_IDX.UPDATED\] \= new Date();  
    updatedCount++;  
  });

  if (updatedCount \> 0\) {  
    sheet.getRange(1, 1, data.length, data\[0\].length).setValues(data);  
    ui.alert("Success", updatedCount \+ " records updated with GeoData.", ui.ButtonSet.OK);  
  } else {  
    ui.alert("Info", "No GeoData updates applied in this batch.", ui.ButtonSet.OK);  
  }  
}

/\*\*  
 \* คำนวณระยะห่างระหว่างสองพิกัด (ละติจูด, ลองจิจูด) เป็นกิโลเมตร  
 \* ใช้สูตร Haversine  
 \* @param {number} lat1 ละติจูดจุดที่ 1  
 \* @param {number} lon1 ลองจิจูดจุดที่ 1  
 \* @param {number} lat2 ละติจูดจุดที่ 2  
 \* @param {number} lon2 ลองจิจูดจุดที่ 2  
 \* @returns {number} ระยะห่างเป็นกิโลเมตร  
 \*/  
function CALCULATE\_DISTANCE\_KM(lat1, lon1, lat2, lon2) {  
  var R \= 6371; // รัศมีโลกในหน่วยกิโลเมตร  
  var dLat \= toRad(lat2 \- lat1);  
  var dLon \= toRad(lon2 \- lon1);  
  var a \= Math.sin(dLat / 2\) \* Math.sin(dLat / 2\) \+  
          Math.cos(toRad(lat1)) \* Math.cos(toRad(lat2)) \*  
          Math.sin(dLon / 2\) \* Math.sin(dLon / 2);  
  var c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1 \- a));  
  var d \= R \* c;  
  return d;  
}

/\*\*  
 \* แปลงองศาเป็นเรเดียน  
 \* @param {number} deg องศา  
 \* @returns {number} เรเดียน  
 \*/  
function toRad(deg) {  
  return deg \* (Math.PI / 180);  
}

\`\`\`

\#\# 9\. \`Service\_Notify.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม sendLineNotify  
 \*/

/\*\*  
 \* \[Phase A NEW\] ส่งข้อความไปยัง Line Notify  
 \* @param {string} message ข้อความที่จะส่ง  
 \* @param {string} lineNotifyToken Line Notify Token  
 \*/  
function sendLineNotify(message, lineNotifyToken) {  
  if (\!lineNotifyToken) {  
    Logger.log("Line Notify Token is not set. Skipping notification.");  
    return;  
  }

  var options \= {  
    "method": "post",  
    "headers": {  
      "Authorization": "Bearer " \+ lineNotifyToken  
    },  
    "payload": {  
      "message": message  
    }  
  };

  try {  
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);  
    Logger.log("Line Notify sent successfully.");  
  } catch (e) {  
    Logger.log("Error sending Line Notify: " \+ e.message);  
  }  
}

\`\`\`

\#\# 10\. \`Service\_SCG.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase B  
 \* \[Phase B\] ปรับปรุง fetchDataFromSCGJWD ให้ใช้ DATA\_IDX  
 \* \[Phase B\] ปรับปรุง applyMasterCoordinatesToDailyJob ให้ใช้ DATA\_IDX  
 \* \[Phase B\] เพิ่ม clearDataSheet\_UI, clearInputSheet\_UI, clearSummarySheet\_UI, clearAllSCGSheets\_UI  
 \*/

/\*\*  
 \* ดึงข้อมูล Shipment จาก SCG JWD API และนำมาใส่ในชีต Data  
 \*/  
function fetchDataFromSCGJWD() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var inputSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
  var dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);

  if (\!inputSheet || \!dataSheet) {  
    ui.alert('Error', 'Input or Data sheet not found.', ui.ButtonSet.OK);  
    return;  
  }

  var cookie \= inputSheet.getRange(SCG\_CONFIG.COOKIE\_CELL).getValue();  
  var shipmentStrings \= inputSheet.getRange(SCG\_CONFIG.INPUT\_START\_ROW, 1, inputSheet.getLastRow() \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1).getValues();

  if (\!cookie) {  
    ui.alert('Error', 'Please provide Cookie in cell ' \+ SCG\_CONFIG.COOKIE\_CELL \+ ' of the Input sheet.', ui.ButtonSet.OK);  
    return;  
  }  
  if (shipmentStrings.filter(String).length \=== 0\) {  
    ui.alert('Error', 'Please provide Shipment Numbers starting from cell A' \+ SCG\_CONFIG.INPUT\_START\_ROW \+ ' of the Input sheet.', ui.ButtonSet.OK);  
    return;  
  }

  var headers \= {  
    'Cookie': cookie,  
    'Content-Type': 'application/json'  
  };

  var allShipmentData \= \[\];  
  var processedShipments \= new Set();

  shipmentStrings.forEach(function(row) {  
    var shipmentNo \= row\[0\];  
    if (shipmentNo && \!processedShipments.has(shipmentNo)) {  
      processedShipments.add(shipmentNo);

      var payload \= JSON.stringify({  
        \[SCG\_CONFIG.JSON\_MAP.SHIPMENT\_NO\]: shipmentNo  
      });

      var options \= {  
        'method': 'post',  
        'headers': headers,  
        'payload': payload,  
        'muteHttpExceptions': true  
      };

      try {  
        var response \= UrlFetchApp.fetch(SCG\_CONFIG.API\_URL, options);  
        var responseCode \= response.getResponseCode();  
        var responseBody \= response.getContentText();

        if (responseCode \=== 200\) {  
          var jsonResponse \= JSON.parse(responseBody);  
          if (jsonResponse.data && jsonResponse.data.length \> 0\) {  
            jsonResponse.data.forEach(function(item) {  
              // Map API response to Data sheet columns using DATA\_IDX  
              var newRow \= new Array(DATA\_IDX.SHOP\_KEY \+ 1).fill('');  
              newRow\[DATA\_IDX.SHIPMENT\_NO\] \= item\[SCG\_CONFIG.JSON\_MAP.SHIPMENT\_NO\];  
              newRow\[DATA\_IDX.SHIP\_TO\_NAME\] \= item\[SCG\_CONFIG.JSON\_MAP.CUSTOMER\_NAME\];  
              newRow\[DATA\_IDX.PLAN\_DELIVERY\] \= item\[SCG\_CONFIG.JSON\_MAP.DELIVERY\_DATE\];  
              // ... map other fields as needed  
              allShipmentData.push(newRow);  
            });  
          } else {  
            Logger.log('No data found for shipment: ' \+ shipmentNo);  
          }  
        } else {  
          Logger.log('API Error for shipment ' \+ shipmentNo \+ ': ' \+ responseCode \+ ' \- ' \+ responseBody);  
        }  
      } catch (e) {  
        Logger.log('Exception fetching data for shipment ' \+ shipmentNo \+ ': ' \+ e.message);  
      }  
    }  
  });

  if (allShipmentData.length \> 0\) {  
    // Clear existing data (keeping headers) and write new data  
    var dataHeaders \= dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getValues();  
    dataSheet.clearContents();  
    dataSheet.getRange(1, 1, dataHeaders\[0\].length, dataHeaders\[0\].length).setValues(dataHeaders);  
    dataSheet.getRange(2, 1, allShipmentData.length, allShipmentData\[0\].length).setValues(allShipmentData);  
    ui.alert('Success', allShipmentData.length \+ ' records fetched and written to Data sheet.', ui.ButtonSet.OK);  
  } else {  
    ui.alert('Info', 'No shipment data fetched.', ui.ButtonSet.OK);  
  }  
}

/\*\*  
 \* อัปเดตพิกัดและอีเมลพนักงานในชีต Data จาก Master Data และข้อมูลพนักงาน  
 \*/  
function applyMasterCoordinatesToDailyJob() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  var dbData \= getMasterData(); // From Service\_Master.gs  
  var employeeData \= getEmployeeData(); // From Service\_Master.gs

  if (\!dataSheet) {  
    ui.alert('Error', 'Data sheet not found.', ui.ButtonSet.OK);  
    return;  
  }  
  if (dbData.length \< 2\) {  
    ui.alert('Error', 'Master Database is empty or has no headers.', ui.ButtonSet.OK);  
    return;  
  }

  var dataValues \= dataSheet.getDataRange().getValues();  
  if (dataValues.length \< 2\) {  
    ui.alert('Info', 'Data sheet is empty.', ui.ButtonSet.OK);  
    return;  
  }

  var dbMap \= {}; // Map ShipToName (normalized) to {Lat, Lng, Email}  
  var employeeMap \= {}; // Map ShipToName (normalized) to Email

  // Build DB map  
  for (var i \= 1; i \< dbData.length; i++) {  
    var name \= dbData\[i\]\[CONFIG.C\_IDX.NAME\];  
    var lat \= dbData\[i\]\[CONFIG.C\_IDX.LAT\];  
    var lng \= dbData\[i\]\[CONFIG.C\_IDX.LNG\];  
    var normalizedName \= dbData\[i\]\[CONFIG.C\_IDX.NORMALIZED\];

    if (name && lat && lng) {  
      dbMap\[name.toLowerCase()\] \= { lat: lat, lng: lng };  
      if (normalizedName) {  
        dbMap\[normalizedName.toLowerCase()\] \= { lat: lat, lng: lng };  
      }  
    }  
  }

  // Build Employee map  
  if (employeeData.length \>= 2\) {  
    var empHeaders \= employeeData\[0\];  
    var empNameColIdx \= empHeaders.indexOf('ชื่อพนักงาน');  
    var empEmailColIdx \= empHeaders.indexOf('Email');  
    var empShipToNameMapColIdx \= empHeaders.indexOf('ShipToName\_Mapping');

    if (empNameColIdx \!== \-1 && empEmailColIdx \!== \-1 && empShipToNameMapColIdx \!== \-1) {  
      for (var i \= 1; i \< employeeData.length; i++) {  
        var mappedName \= employeeData\[i\]\[empShipToNameMapColIdx\];  
        var email \= employeeData\[i\]\[empEmailColIdx\];  
        if (mappedName && email) {  
          employeeMap\[mappedName.toLowerCase()\] \= email;  
        }  
      }  
    }  
  }

  var updatedCount \= 0;  
  for (var i \= 1; i \< dataValues.length; i++) {  
    var shipToName \= dataValues\[i\]\[DATA\_IDX.SHIP\_TO\_NAME\];  
    if (shipToName) {  
      var lowerShipToName \= shipToName.toLowerCase();

      // Update LatLong\_Actual  
      if (dbMap\[lowerShipToName\]) {  
        dataValues\[i\]\[DATA\_IDX.LATLNG\_ACTUAL\] \= dbMap\[lowerShipToName\].lat \+ ',' \+ dbMap\[lowerShipToName\].lng;  
        updatedCount++;  
      }

      // Update Email  
      if (employeeMap\[lowerShipToName\]) {  
        dataValues\[i\]\[DATA\_IDX.EMAIL\] \= employeeMap\[lowerShipToName\];  
        updatedCount++;  
      }  
    }  
  }

  if (updatedCount \> 0\) {  
    dataSheet.getRange(1, 1, dataValues.length, dataValues\[0\].length).setValues(dataValues);  
    ui.alert('Success', updatedCount \+ ' coordinates and emails applied to Data sheet.', ui.ButtonSet.OK);  
  } else {  
    ui.alert('Info', 'No coordinates or emails updated.', ui.ButtonSet.OK);  
  }  
}

/\*\*  
 \* \[Phase B NEW\] ล้างเฉพาะชีต Data  
 \*/  
function clearDataSheet\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.alert(  
    'Clear Data Sheet',  
    'Are you sure you want to clear all data from the \\'' \+ SCG\_CONFIG.SHEET\_DATA \+ '\\' sheet? This action cannot be undone.',  
    ui.ButtonSet.YES\_NO);

  if (response \== ui.Button.YES) {  
    var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
    if (sheet) {  
      var headers \= sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();  
      sheet.clearContents();  
      sheet.getRange(1, 1, 1, headers\[0\].length).setValues(headers);  
      ui.alert('Success', 'Sheet \\'' \+ SCG\_CONFIG.SHEET\_DATA \+ '\\' cleared.', ui.ButtonSet.OK);  
    } else {  
      ui.alert('Error', 'Sheet \\'' \+ SCG\_CONFIG.SHEET\_DATA \+ '\\' not found.', ui.ButtonSet.OK);  
    }  
  }  
}

/\*\*  
 \* \[Phase B NEW\] ล้างเฉพาะชีต Input  
 \*/  
function clearInputSheet\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.alert(  
    'Clear Input Sheet',  
    'Are you sure you want to clear all data from the \\'' \+ SCG\_CONFIG.SHEET\_INPUT \+ '\\' sheet? This action cannot be undone.',  
    ui.ButtonSet.YES\_NO);

  if (response \== ui.Button.YES) {  
    var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
    if (sheet) {  
      var headers \= sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();  
      sheet.clearContents();  
      sheet.getRange(1, 1, 1, headers\[0\].length).setValues(headers);  
      ui.alert('Success', 'Sheet \\'' \+ SCG\_CONFIG.SHEET\_INPUT \+ '\\' cleared.', ui.ButtonSet.OK);  
    } else {  
      ui.alert('Error', 'Sheet \\'' \+ SCG\_CONFIG.SHEET\_INPUT \+ '\\' not found.', ui.ButtonSet.OK);  
    }  
  }  
}

/\*\*  
 \* \[Phase B NEW\] ล้างเฉพาะชีต สรุป\_เจ้าของสินค้า  
 \*/  
function clearSummarySheet\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var sheetName \= 'สรุป\_เจ้าของสินค้า';  
  var response \= ui.alert(  
    'Clear Summary Sheet',  
    'Are you sure you want to clear all data from the \\'' \+ sheetName \+ '\\' sheet? This action cannot be undone.',  
    ui.ButtonSet.YES\_NO);

  if (response \== ui.Button.YES) {  
    var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);  
    if (sheet) {  
      var headers \= sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();  
      sheet.clearContents();  
      sheet.getRange(1, 1, 1, headers\[0\].length).setValues(headers);  
      ui.alert('Success', 'Sheet \\'' \+ sheetName \+ '\\' cleared.', ui.ButtonSet.OK);  
    } else {  
      ui.alert('Error', 'Sheet \\'' \+ sheetName \+ '\\' not found.', ui.ButtonSet.OK);  
    }  
  }  
}

/\*\*  
 \* \[Phase B NEW\] ล้างข้อมูลทั้งหมดที่เกี่ยวข้องกับ SCG (Data, Input, สรุป\_เจ้าของสินค้า, สรุป\_Shipment)  
 \*/  
function clearAllSCGSheets\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.alert(  
    'Clear All SCG Data',  
    'Are you sure you want to clear all data from Data, Input, สรุป\_เจ้าของสินค้า, and สรุป\_Shipment sheets? This action cannot be undone.',  
    ui.ButtonSet.YES\_NO);

  if (response \== ui.Button.YES) {  
    clearDataSheet\_UI();  
    clearInputSheet\_UI();  
    clearSummarySheet\_UI();  
    // Assuming 'สรุป\_Shipment' also needs clearing  
    var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName('สรุป\_Shipment');  
    if (sheet) {  
      var headers \= sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();  
      sheet.clearContents();  
      sheet.getRange(1, 1, 1, headers\[0\].length).setValues(headers);  
      ui.alert('Success', 'Sheet \\'สรุป\_Shipment\\' cleared.', ui.ButtonSet.OK);  
    } else {  
      ui.alert('Error', 'Sheet \\'สรุป\_Shipment\\' not found.', ui.ButtonSet.OK);  
    }  
    ui.alert('Success', 'All SCG related sheets cleared.', ui.ButtonSet.OK);  
  }  
}

\`\`\`

\#\# 11\. \`Service\_SchemaValidator.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม validateSheetSchema  
 \* \[Phase A\] เพิ่ม runFullSchemaValidation  
 \*/

/\*\*  
 \* \[Phase A NEW\] ตรวจสอบ Schema ของชีตที่กำหนด  
 \* @param {GoogleAppsScript.Spreadsheet.Sheet} sheet ชีตที่ต้องการตรวจสอบ  
 \* @param {Object} requiredHeaders Object ที่มี index เป็น key และ header name เป็น value  
 \* @param {number} totalCols จำนวนคอลัมน์ทั้งหมดที่คาดหวัง  
 \* @returns {Array\<string\>} Array ของข้อผิดพลาดที่พบ  
 \*/  
function validateSheetSchema(sheet, requiredHeaders, totalCols) {  
  var errors \= \[\];  
  if (\!sheet) {  
    errors.push("Sheet does not exist.");  
    return errors;  
  }

  var headers \= sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()\[0\];

  // Check for missing required headers  
  for (var colIdx in requiredHeaders) {  
    var headerName \= requiredHeaders\[colIdx\];  
    if (headers\[colIdx \- 1\] \!== headerName) {  
      errors.push("Missing or incorrect header in column " \+ colIdx \+ ": Expected \\"" \+ headerName \+ "\\", Found \\"" \+ headers\[colIdx \- 1\] \+ "\\".");  
    }  
  }

  // Check for total column count  
  if (headers.length \< totalCols) {  
    errors.push("Sheet has fewer columns than expected: Expected " \+ totalCols \+ ", Found " \+ headers.length \+ ".");  
  }

  return errors;  
}

/\*\*  
 \* \[Phase A NEW\] รันการตรวจสอบ Schema เต็มรูปแบบสำหรับชีตหลักทั้งหมด  
 \*/  
function runFullSchemaValidation() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var allErrors \= \[\];

  // Validate Database sheet  
  var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var dbErrors \= validateSheetSchema(dbSheet, CONFIG.DB\_REQUIRED\_HEADERS, CONFIG.DB\_TOTAL\_COLS);  
  if (dbErrors.length \> 0\) {  
    allErrors.push("Database Sheet Schema Errors:\\n" \+ dbErrors.join("\\n"));  
  }

  // Validate NameMapping sheet  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  var mapErrors \= validateSheetSchema(mapSheet, CONFIG.MAP\_REQUIRED\_HEADERS, CONFIG.MAP\_TOTAL\_COLS);  
  if (mapErrors.length \> 0\) {  
    allErrors.push("NameMapping Sheet Schema Errors:\\n" \+ mapErrors.join("\\n"));  
  }

  // Validate GPS\_Queue sheet  
  var gpsQueueSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_GPS\_QUEUE);  
  var gpsQueueErrors \= validateSheetSchema(gpsQueueSheet, CONFIG.GPS\_QUEUE\_REQUIRED\_HEADERS, CONFIG.GPS\_QUEUE\_TOTAL\_COLS);  
  if (gpsQueueErrors.length \> 0\) {  
    allErrors.push("GPS\_Queue Sheet Schema Errors:\\n" \+ gpsQueueErrors.join("\\n"));  
  }

  if (allErrors.length \> 0\) {  
    var msg \= "⚠️ SCHEMA VALIDATION FAILED:\\n" \+ allErrors.join("\\n\\n");  
    ui.alert("Schema Validation", msg, ui.ButtonSet.OK);  
    Logger.log(msg);  
    return false;  
  } else {  
    ui.alert("Schema Validation", "✅ All sheet schemas are valid.", ui.ButtonSet.OK);  
    Logger.log("✅ All sheet schemas are valid.");  
    return true;  
  }  
}

\`\`\`

\#\# 12\. \`Service\_Search.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม findHiddenDuplicates  
 \*/

/\*\*  
 \* \[Phase A NEW\] ค้นหา Record ที่มีพิกัดซ้ำซ้อนกันใน Database  
 \*/  
function findHiddenDuplicates() {  
  var ui \= SpreadsheetApp.getUi();  
  var data \= getMasterData();  
  if (data.length \< 2\) {  
    ui.alert('Info', 'Master Database is empty.', ui.ButtonSet.OK);  
    return;  
  }

  var latColIdx \= CONFIG.C\_IDX.LAT;  
  var lngColIdx \= CONFIG.C\_IDX.LNG;  
  var uuidColIdx \= CONFIG.C\_IDX.UUID;  
  var nameColIdx \= CONFIG.C\_IDX.NAME;

  var locationMap \= {}; // Key: "lat,lng", Value: Array of {uuid, name, rowIndex}  
  for (var i \= 1; i \< data.length; i++) {  
    var lat \= data\[i\]\[latColIdx\];  
    var lng \= data\[i\]\[lngColIdx\];  
    var uuid \= data\[i\]\[uuidColIdx\];  
    var name \= data\[i\]\[nameColIdx\];

    if (lat && lng && uuid) {  
      var key \= lat.toFixed(6) \+ ',' \+ lng.toFixed(6); // Normalize Lat/Lng to 6 decimal places  
      if (\!locationMap\[key\]) {  
        locationMap\[key\] \= \[\];  
      }  
      locationMap\[key\].push({ uuid: uuid, name: name, rowIndex: i });  
    }  
  }

  var duplicatesFound \= \[\];  
  for (var key in locationMap) {  
    if (locationMap\[key\].length \> 1\) {  
      duplicatesFound.push(locationMap\[key\]);  
    }  
  }

  if (duplicatesFound.length \> 0\) {  
    var msg \= "Found " \+ duplicatesFound.length \+ " sets of records with duplicate Lat/Lng.\\n";  
    msg \+= "A new sheet 'DuplicateLocations' has been created with details.";

    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var reportSheet \= ss.getSheetByName('DuplicateLocations');  
    if (reportSheet) {  
      reportSheet.clearContents();  
    } else {  
      reportSheet \= ss.insertSheet('DuplicateLocations');  
    }

    var reportData \= \[\["Lat,Lng", "UUID", "Name", "Row Index"\]\];  
    duplicatesFound.forEach(function(group) {  
      group.forEach(function(item) {  
        reportData.push(\[key, item.uuid, item.name, item.rowIndex \+ 1\]);  
      });  
      reportData.push(\[\]); // Add a blank row between groups for readability  
    });

    reportSheet.getRange(1, 1, reportData.length, reportData\[0\].length).setValues(reportData);  
    ui.alert('Duplicate Locations', msg, ui.ButtonSet.OK);  
  } else {  
    ui.alert('Duplicate Locations', 'No duplicate Lat/Lng found.', ui.ButtonSet.OK);  
  }  
}

\`\`\`

\#\# 13\. \`Service\_SoftDelete.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม softDeleteRecord  
 \*/

/\*\*  
 \* \[Phase A NEW\] ทำการ Soft Delete Record โดยการเปลี่ยน Record\_Status เป็น 'Inactive'  
 \* @param {string} uuid UUID ของ Record ที่ต้องการ Soft Delete  
 \* @returns {boolean} true ถ้า Soft Delete สำเร็จ, false ถ้าไม่พบ Record  
 \*/  
function softDeleteRecord(uuid) {  
  return updateRecordStatus(uuid, 'Inactive');  
}

\`\`\`

\#\# 14\. \`Setup\_Security.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม setupEnvironment  
 \*/

/\*\*  
 \* \[Phase A NEW\] ตั้งค่า Environment และตรวจสอบความสมบูรณ์ของระบบ  
 \* ควรเรียกใช้ครั้งแรกหลังจากติดตั้ง Script  
 \*/  
function setupEnvironment() {  
  var ui \= SpreadsheetApp.getUi();  
  try {  
    // ตรวจสอบและขอสิทธิ์การเข้าถึง  
    SpreadsheetApp.getActiveSpreadsheet();  
    UrlFetchApp.fetch("https://www.google.com"); // ทดสอบการเข้าถึงภายนอก  
    PropertiesService.getScriptProperties().setProperty('TEST\_KEY', 'test\_value');  
    PropertiesService.getScriptProperties().deleteProperty('TEST\_KEY');

    // ตรวจสอบความสมบูรณ์ของ CONFIG  
    CONFIG.validateSystemIntegrity();

    ui.alert('Setup Complete', 'Environment setup successfully. You can now use the system.', ui.ButtonSet.OK);  
  } catch (e) {  
    ui.alert('Setup Failed', 'Failed to setup environment: ' \+ e.message \+ '\\nPlease ensure all sheets are present and API keys are set correctly.', ui.ButtonSet.OK);  
  }  
}

\`\`\`

\#\# 15\. \`Setup\_Upgrade.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม upgradeSystem\_UI  
 \*/

/\*\*  
 \* \[Phase A NEW\] UI สำหรับอัปเกรดระบบ  
 \* ตรวจสอบและเพิ่มคอลัมน์ใหม่ที่จำเป็น  
 \*/  
function upgradeSystem\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.alert(  
    'Upgrade System',  
    'This will check for and add any missing required columns to your Database sheet. Do you want to proceed?',  
    ui.ButtonSet.YES\_NO);

  if (response \== ui.Button.YES) {  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);

    if (\!dbSheet) {  
      ui.alert('Error', 'Database sheet not found.', ui.ButtonSet.OK);  
      return;  
    }

    var headers \= dbSheet.getRange(1, 1, 1, dbSheet.getLastColumn()).getValues()\[0\];  
    var currentLastCol \= headers.length;  
    var updated \= false;

    // Check and add missing headers based on CONFIG.DB\_REQUIRED\_HEADERS and new columns  
    var allRequiredHeaders \= {};  
    // Copy existing required headers  
    for (var key in CONFIG.DB\_REQUIRED\_HEADERS) {  
      allRequiredHeaders\[key\] \= CONFIG.DB\_REQUIRED\_HEADERS\[key\];  
    }  
    // Add new headers for Canonical\_Name, Canonical\_Address, Name\_FP, Addr\_FP, Lat\_Norm, Lng\_Norm, Geo\_Hash  
    // These are beyond the initial DB\_TOTAL\_COLS (22) in CONFIG.gs, so we need to define them here or update CONFIG.gs  
    // For now, let's assume they are added sequentially after the last defined column in CONFIG.DB\_TOTAL\_COLS  
    // This part needs to be carefully managed if CONFIG.DB\_TOTAL\_COLS is not updated to reflect these new columns

    var newColMap \= {  
      'Canonical\_Name': CONFIG.COL\_CANONICAL\_NAME, // Assuming these new COL\_ constants are defined in CONFIG.gs  
      'Canonical\_Address': CONFIG.COL\_CANONICAL\_ADDRESS,  
      'Name\_FP': CONFIG.COL\_NAME\_FP,  
      'Addr\_FP': CONFIG.COL\_ADDR\_FP,  
      'Lat\_Norm': CONFIG.COL\_LAT\_NORM,  
      'Lng\_Norm': CONFIG.COL\_LNG\_NORM,  
      'Geo\_Hash': CONFIG.COL\_GEO\_HASH  
    };

    // Iterate through potential new columns and add if missing  
    var nextAvailableCol \= currentLastCol \+ 1;  
    for (var headerName in newColMap) {  
      var colIndex \= newColMap\[headerName\];  
      // Check if the header already exists in any column  
      var headerExists \= headers.includes(headerName);

      if (\!headerExists) {  
        // If the header is not found, add it at the next available column  
        dbSheet.insertColumnAfter(currentLastCol);  
        dbSheet.getRange(1, currentLastCol \+ 1).setValue(headerName);  
        currentLastCol++;  
        updated \= true;  
        Logger.log("Added missing column: " \+ headerName);  
      }  
    }

    if (updated) {  
      ui.alert('Success', 'System upgraded. Missing columns added to Database sheet.', ui.ButtonSet.OK);  
    } else {  
      ui.alert('Info', 'No upgrade needed. All required columns are present.', ui.ButtonSet.OK);  
    }  
  }  
}

\`\`\`

\#\# 16\. \`Test\_AI.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม testGeminiAPI  
 \*/

/\*\*  
 \* \[Phase A NEW\] ทดสอบการเรียกใช้ Gemini API  
 \*/  
function testGeminiAPI() {  
  var ui \= SpreadsheetApp.getUi();  
  try {  
    var testPrompt \= "What is the capital of France?";  
    var response \= callGeminiThinking\_JSON(testPrompt);  
    ui.alert('Gemini API Test', 'Response: ' \+ response, ui.ButtonSet.OK);  
  } catch (e) {  
    ui.alert('Gemini API Test Failed', 'Error: ' \+ e.message, ui.ButtonSet.OK);  
  }  
}

\`\`\`

\#\# 17\. \`Test\_Diagnostic.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม runDiagnostic  
 \*/

/\*\*  
 \* \[Phase A NEW\] รัน Diagnostic เพื่อตรวจสอบสถานะของระบบ  
 \*/  
function runDiagnostic() {  
  var ui \= SpreadsheetApp.getUi();  
  var report \= \[\];

  report.push("--- System Diagnostic Report \---");  
  report.push("Timestamp: " \+ new Date().toLocaleString());  
  report.push("\\n1. Configuration Check:");  
  try {  
    CONFIG.validateSystemIntegrity();  
    report.push("  ✅ CONFIG integrity: OK");  
  } catch (e) {  
    report.push("  ❌ CONFIG integrity: " \+ e.message);  
  }

  report.push("\\n2. Sheet Existence Check:");  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var requiredSheets \= \[  
    CONFIG.SHEET\_NAME, CONFIG.MAPPING\_SHEET, SCG\_CONFIG.SHEET\_INPUT,  
    SCG\_CONFIG.SHEET\_DATA, SCG\_CONFIG.SHEET\_EMPLOYEE, SCG\_CONFIG.SHEET\_GPS\_QUEUE,  
    CONFIG.SHEET\_POSTAL, 'สรุป\_เจ้าของสินค้า', 'สรุป\_Shipment'  
  \];  
  requiredSheets.forEach(function(sheetName) {  
    if (ss.getSheetByName(sheetName)) {  
      report.push("  ✅ Sheet \\"" \+ sheetName \+ "\\": Exists");  
    } else {  
      report.push("  ❌ Sheet \\"" \+ sheetName \+ "\\": MISSING");  
    }  
  });

  report.push("\\n3. Schema Validation:");  
  if (runFullSchemaValidation()) { // This function already shows UI alerts  
    report.push("  ✅ All schemas are valid.");  
  } else {  
    report.push("  ❌ Schema validation failed. Check previous alerts.");  
  }

  report.push("\\n4. Trigger Check:");  
  var triggers \= ScriptApp.getProjectTriggers();  
  if (triggers.length \> 0\) {  
    report.push("  ✅ Active Triggers: " \+ triggers.length);  
    triggers.forEach(function(trigger) {  
      report.push("    \- Function: " \+ trigger.getHandlerFunction() \+ ", Type: " \+ trigger.getEventType());  
    });  
  } else {  
    report.push("  ❌ No active triggers found. Auto-Pilot might be off.");  
  }

  var reportText \= report.join("\\n");  
  Logger.log(reportText);  
  ui.alert('System Diagnostic Report', reportText, ui.ButtonSet.OK);  
}

\`\`\`

\#\# 18\. \`Utils\_Common.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม generateCanonicalName, generateCanonicalAddress  
 \* \[Phase A\] เพิ่ม generateNameFingerprint, generateAddressFingerprint  
 \* \[Phase A\] เพิ่ม normalizeLatLng, generateGeoHash  
 \*/

/\*\*  
 \* \[Phase A NEW\] สร้างชื่อมาตรฐาน (Canonical Name) โดยการลบคำที่ไม่จำเป็นออก  
 \* @param {string} name ชื่อต้นฉบับ  
 \* @returns {string} ชื่อมาตรฐาน  
 \*/  
function generateCanonicalName(name) {  
  if (\!name) return '';  
  var canonical \= name.toLowerCase();  
  canonical \= canonical.replace(/บริษัท|จำกัด|มหาชน|จำกัด \\(มหาชน\\)|co\\.|ltd\\.|public company limited/g, '');  
  canonical \= canonical.replace(/\\(.\*?\\)|\\\[.\*?\\\]/g, ''); // Remove text in parentheses or brackets  
  canonical \= canonical.replace(/\\s+/g, ' ').trim(); // Replace multiple spaces with single space  
  return canonical;  
}

/\*\*  
 \* \[Phase A NEW\] สร้างที่อยู่มาตรฐาน (Canonical Address) โดยการลบคำที่ไม่จำเป็นออก  
 \* @param {string} address ที่อยู่ต้นฉบับ  
 \* @returns {string} ที่อยู่มาตรฐาน  
 \*/  
function generateCanonicalAddress(address) {  
  if (\!address) return '';  
  var canonical \= address.toLowerCase();  
  canonical \= canonical.replace(/หมู่ที่|หมู่|ซอย|ถนน|แขวง|เขต|ตำบล|อำเภอ|จังหวัด|thailand/g, '');  
  canonical \= canonical.replace(/\\s+/g, ' ').trim();  
  return canonical;  
}

/\*\*  
 \* \[Phase A NEW\] สร้าง Fingerprint (Hash) จากชื่อมาตรฐาน  
 \* @param {string} canonicalName ชื่อมาตรฐาน  
 \* @returns {string} Name Fingerprint  
 \*/  
function generateNameFingerprint(canonicalName) {  
  if (\!canonicalName) return '';  
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, canonicalName).map(function(byte) {  
    return ('0' \+ (byte & 0xFF).toString(16)).slice(-2);  
  }).join('');  
}

/\*\*  
 \* \[Phase A NEW\] สร้าง Fingerprint (Hash) จากที่อยู่มาตรฐาน  
 \* @param {string} canonicalAddress ที่อยู่มาตรฐาน  
 \* @returns {string} Address Fingerprint  
 \*/  
function generateAddressFingerprint(canonicalAddress) {  
  if (\!canonicalAddress) return '';  
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, canonicalAddress).map(function(byte) {  
    return ('0' \+ (byte & 0xFF).toString(16)).slice(-2);  
  }).join('');  
}

/\*\*  
 \* \[Phase A NEW\] Normalize ละติจูดและลองจิจูดให้เหลือ 6 ทศนิยม  
 \* @param {number} lat ละติจูด  
 \* @param {number} lng ลองจิจูด  
 \* @returns {Object} {latNorm, lngNorm}  
 \*/  
function normalizeLatLng(lat, lng) {  
  return {  
    latNorm: parseFloat(lat).toFixed(6),  
    lngNorm: parseFloat(lng).toFixed(6)  
  };  
}

/\*\*  
 \* \[Phase A NEW\] สร้าง GeoHash จากละติจูดและลองจิจูด  
 \* @param {number} lat ละติจูด  
 \* @param {number} lng ลองจิจูด  
 \* @param {number} \[precision=9\] ความแม่นยำของ GeoHash (ค่าเริ่มต้น 9\)  
 \* @returns {string} GeoHash  
 \*/  
function generateGeoHash(lat, lng, precision) {  
  if (typeof Geohash \=== 'undefined') {  
    // Fallback or throw error if Geohash library is not available  
    // For Google Apps Script, you might need to include a Geohash library manually  
    Logger.log("Geohash library not found. Cannot generate GeoHash.");  
    return '';  
  }  
  return Geohash.encode(lat, lng, precision || 9);  
}

\`\`\`

\#\# 19\. \`WebApp.gs\`

\`\`\`javascript  
/\*\*  
 \* VERSION: 4.2 — Phase A  
 \* \[Phase A\] เพิ่ม doGet  
 \*/

/\*\*  
 \* \[Phase A NEW\] Web App entry point  
 \*/  
function doGet(e) {  
  return HtmlService.createHtmlOutputFromFile('Index');  
}

\`\`\`

\#\# 20\. \`Index.html\`

\`\`\`html  
\<\!DOCTYPE html\>  
\<html\>  
  \<head\>  
    \<base target="\_top"\>  
    \<style\>  
      body { font-family: sans-serif; margin: 20px; }  
      h1 { color: \#333; }  
      .container { max-width: 600px; margin: auto; background: \#f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }  
      button { background-color: \#4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }  
      button:hover { background-color: \#45a049; }  
      .message { margin-top: 20px; padding: 10px; border: 1px solid \#ddd; border-radius: 4px; background-color: \#e9e9e9; }  
    \</style\>  
  \</head\>  
  \<body\>  
    \<div class="container"\>  
      \<h1\>LMDS Web App\</h1\>  
      \<p\>This is a simple web app interface for the Logistics Master Data System.\</p\>  
      \<button onclick="google.script.run.withSuccessHandler(showMessage).testFunction()"\>Run Test Function\</button\>  
      \<div id="output" class="message"\>\</div\>  
    \</div\>

    \<script\>  
      function testFunction() {  
        // This function will be called from the client-side to execute a server-side Apps Script function  
        google.script.run.withSuccessHandler(showMessage).myAppsScriptFunction();  
      }

      function showMessage(message) {  
        document.getElementById('output').innerText \= message;  
      }

      // Example server-side function (must be defined in a .gs file)  
      function myAppsScriptFunction() {  
        return "Hello from Apps Script\!";  
      }  
    \</script\>  
  \</body\>  
\</html\>

\`\`\`

\---

\#\# 3\. ขั้นตอนการสร้างและตั้งค่าระบบ

ระบบ LMDS นี้ถูกออกแบบมาให้ทำงานบน Google Apps Script (GAS) ซึ่งเป็นแพลตฟอร์มพัฒนาแอปพลิเคชันที่ใช้ JavaScript ในการขยายขีดความสามารถของ Google Workspace เช่น Google Sheets, Docs, Forms เป็นต้น

\#\#\# 3.1. การเตรียม Google Sheet

1\.  \*\*สร้าง Google Sheet ใหม่\*\*: เข้าไปที่ Google Drive ของคุณ แล้วสร้าง Google Sheet เปล่าขึ้นมา 1 ไฟล์ ตั้งชื่อตามที่คุณต้องการ (เช่น \`LMDS\_Master\_Data\`).  
2\.  \*\*สร้างชีตที่จำเป็น\*\*: ใน Google Sheet ที่สร้างขึ้นมา ให้สร้างชีต (Sheet) ตามโครงสร้างที่ระบุไว้ในส่วนที่ 1 (\`Database\`, \`NameMapping\`, \`DQ\_Review\_Queue\`, \`GPS\_Queue\`, \`SCGนครหลวงJWDภูมิภาค\`, \`Archive\_DB\`, \`Data\`, \`Input\`, \`สรุป\_เจ้าของสินค้า\`, \`สรุป\_Shipment\`, \`PostalRef\`, \`ข้อมูลพนักงาน\`). ตรวจสอบให้แน่ใจว่าชื่อชีตตรงกับที่ระบุใน \`Config.gs\` และ \`SCG\_CONFIG\`.  
3\.  \*\*ตั้งค่า Header\*\*: คัดลอก Header ของแต่ละชีตตามที่ระบุในส่วนที่ 1 ไปวางในแถวแรกของชีตนั้นๆ.

\#\#\# 3.2. การนำเข้าโค้ด Google Apps Script

1\.  \*\*เปิด Script Editor\*\*: ใน Google Sheet ของคุณ ไปที่เมนู \`Extensions\` \> \`Apps Script\`.  
2\.  \*\*สร้างไฟล์ Script ใหม่\*\*: ในหน้าต่าง Apps Script Editor (IDE) ที่เปิดขึ้นมา คุณจะเห็นไฟล์ \`Code.gs\` เริ่มต้น ให้ลบโค้ดทั้งหมดในไฟล์นั้นออก.  
3\.  \*\*คัดลอกและวางโค้ด\*\*: สร้างไฟล์ \`.gs\` ใหม่ (คลิก \`+\` ข้าง \`Files\` \> \`Script file\`) สำหรับแต่ละโมดูลโค้ดที่ระบุในส่วนที่ 2 (เช่น \`Config.gs\`, \`Menu.gs\`, \`Service\_Master.gs\` เป็นต้น) และคัดลอกโค้ดจากแต่ละโมดูลไปวางในไฟล์ที่เกี่ยวข้อง.  
    \*   สำหรับ \`Index.html\` ให้สร้างไฟล์ \`HTML\` (คลิก \`+\` ข้าง \`Files\` \> \`HTML file\`) แล้วตั้งชื่อว่า \`Index\` จากนั้นคัดลอกโค้ด HTML ไปวาง.  
4\.  \*\*บันทึกโปรเจกต์\*\*: คลิกไอคอนบันทึก (รูปแผ่นดิสก์) เพื่อบันทึกโปรเจกต์ Apps Script ของคุณ.

\#\#\# 3.3. การตั้งค่า Gemini API Key

1\.  \*\*รับ Gemini API Key\*\*: เข้าไปที่ Google AI Studio หรือ Google Cloud Console เพื่อสร้างและรับ Gemini API Key ของคุณ.  
2\.  \*\*ตั้งค่า Script Properties\*\*: ใน Apps Script Editor ไปที่ \`Project settings\` (รูปฟันเฟืองด้านซ้ายมือ).  
3\.  เลื่อนลงมาที่ส่วน \`Script properties\` แล้วคลิก \`Add script property\`.  
4\.  ในช่อง \`Property\` ให้ใส่ \`GEMINI\_API\_KEY\` และในช่อง \`Value\` ให้ใส่ Gemini API Key ที่คุณได้รับมา.  
5\.  คลิก \`Save script properties\`.

\#\#\# 3.4. การรัน \`setupEnvironment()\`

1\.  \*\*เลือกฟังก์ชัน\*\*: ใน Apps Script Editor ที่แถบด้านบน (ใต้เมนู) จะมี Dropdown ที่เขียนว่า \`Select function\` ให้เลือก \`setupEnvironment\`.  
2\.  \*\*รันฟังก์ชัน\*\*: คลิกปุ่ม \`Run\` (รูปสามเหลี่ยม) เพื่อรันฟังก์ชัน \`setupEnvironment()\`.  
3\.  \*\*การอนุญาต\*\*: ครั้งแรกที่คุณรันฟังก์ชันนี้ Google จะขอให้คุณอนุญาตสิทธิ์การเข้าถึงต่างๆ (เช่น การเข้าถึง Google Sheets, การเชื่อมต่อภายนอก) ให้ดำเนินการอนุญาตให้ครบถ้วน.  
4\.  \*\*ตรวจสอบผลลัพธ์\*\*: หากการตั้งค่าสำเร็จ จะมี Pop-up แจ้งว่า \`Environment setup successfully.\` หากมีข้อผิดพลาด ระบบจะแจ้งให้ทราบ.

\#\#\# 3.5. การอัปเกรดระบบ (ถ้ามี)

หากมีการเพิ่มคอลัมน์ใหม่ใน \`CONFIG.gs\` หรือมีการเปลี่ยนแปลงโครงสร้างชีตในอนาคต คุณสามารถใช้ฟังก์ชัน \`upgradeSystem\_UI()\` เพื่ออัปเดตชีต \`Database\` ให้มีคอลัมน์ที่จำเป็นครบถ้วน.

1\.  \*\*เลือกฟังก์ชัน\*\*: ใน Apps Script Editor เลือก \`upgradeSystem\_UI\` จาก Dropdown.  
2\.  \*\*รันฟังก์ชัน\*\*: คลิกปุ่ม \`Run\`.  
3\.  \*\*ยืนยัน\*\*: ระบบจะถามเพื่อยืนยันการอัปเกรด ให้คลิก \`Yes\`.

\---

\#\# 4\. คู่มือการใช้งานปุ่มต่างๆ ในเมนู

หลังจากตั้งค่าระบบเสร็จสิ้น คุณจะเห็นเมนูใหม่ปรากฏขึ้นใน Google Sheet ของคุณ (อาจต้อง Refresh หน้า Google Sheet หนึ่งครั้ง) เมนูหลักจะแบ่งออกเป็น 4 ส่วนหลักๆ ดังนี้:

\#\#\# 4.1. เมนู \`🚛 1\. ระบบจัดการ Master Data\`

เมนูนี้ใช้สำหรับจัดการข้อมูล Master Data ในชีต \`Database\` และ \`NameMapping\`.

\*   \*\*1️⃣ ดึงลูกค้าใหม่ (Sync New Data)\*\*: ดึงข้อมูลลูกค้าใหม่จากแหล่งข้อมูลภายนอก (เช่น จากชีต \`SCGนครหลวงJWDภูมิภาค\`) เข้ามายังชีต \`Database\`.  
\*   \*\*2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)\*\*: ใช้ Google Geocoding API เพื่อเติมข้อมูลละติจูด/ลองจิจูด และที่อยู่สำหรับรายการที่ยังไม่มีพิกัดหรือมีคุณภาพต่ำ โดยจะประมวลผลเป็นชุด (Batch) ครั้งละ 50 รายการ และใช้ Cache เพื่อประสิทธิภาพ.  
\*   \*\*3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)\*\*: ฟังก์ชันนี้จะช่วยจัดกลุ่มชื่อที่คล้ายกันหรือซ้ำกัน เพื่อเตรียมสำหรับการรวมข้อมูล (Merging) หรือการสร้าง \`NameMapping\`.  
\*   \*\*🧠 4️⃣ ส่งชื่อแปลกให้ AI วิเคราะห์\*\*: ส่งชื่อลูกค้า/สถานที่ที่ระบบยังไม่รู้จักหรือไม่สามารถระบุได้ ให้ AI (Gemini) ช่วยวิเคราะห์และสร้าง \`Normalized Name\` และ \`Keywords\` เพื่อปรับปรุงคุณภาพข้อมูล.  
\*   \*\*🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)\*\*: ตรวจสอบความสมบูรณ์ของข้อมูลในชีต \`Database\` เช่น การหาข้อมูลที่ซ้ำซ้อน, ข้อมูลที่ขาดหายไป, หรือข้อมูลที่ไม่สอดคล้องกัน โดยจะประมวลผลเป็นชุด ครั้งละ 100 รายการ.  
\*   \*\*🔄 รีเซ็ตความจำปุ่ม 5\*\*: รีเซ็ตสถานะการประมวลผลของฟังก์ชัน Deep Clean เพื่อให้สามารถรันใหม่ได้ตั้งแต่ต้น.  
\*   \*\*✅ 6️⃣ จบงาน (Finalize & Move to Mapping)\*\*: เมื่อข้อมูลใน \`Database\` ได้รับการตรวจสอบและแก้ไขแล้ว ฟังก์ชันนี้จะช่วยในการสรุปและย้ายข้อมูลที่เกี่ยวข้องไปยังชีต \`NameMapping\` หรือ \`Archive\_DB\` ตามความเหมาะสม.

\#\#\#\# เมนูย่อย \`🛠️ Admin & Repair Tools\`

\*   \*\*🔑 สร้าง UUID ให้ครบทุกแถว\*\*: ตรวจสอบและสร้าง UUID (Universally Unique Identifier) ให้กับทุกแถวในชีต \`Database\` ที่ยังไม่มี UUID.  
\*   \*\*🚑 ซ่อมแซม NameMapping\*\*: ตรวจสอบและแก้ไขความผิดปกติในชีต \`NameMapping\`.  
\*   \*\*🔍 ค้นหาพิกัดซ้ำซ้อน\*\*: ค้นหารายการในชีต \`Database\` ที่มีพิกัดละติจูด/ลองจิจูดซ้ำกัน (อาจบ่งบอกถึงข้อมูลซ้ำซ้อน).  
\*   \*\*📊 ตรวจสอบคุณภาพข้อมูล\*\*: แสดงรายงานสรุปคุณภาพของข้อมูลในชีต \`Database\` โดยพิจารณาจาก \`Quality Score\` และ \`Confidence Score\`.  
\*   \*\*🔄 คำนวณ Quality ใหม่ทั้งหมด\*\*: คำนวณ \`Quality Score\` สำหรับทุกรายการในชีต \`Database\` ใหม่ทั้งหมด.  
\*   \*\*🎯 คำนวณ Confidence ใหม่ทั้งหมด\*\*: คำนวณ \`Confidence Score\` สำหรับทุกรายการในชีต \`Database\` ใหม่ทั้งหมด.  
\*   \*\*🗂️ Initialize Record Status\*\*: กำหนด \`Record\_Status\` เป็น \`Active\` สำหรับรายการในชีต \`Database\` ที่ยังไม่มีสถานะ.  
\*   \*\*🔀 Merge UUID ซ้ำซ้อน\*\*: รวมรายการที่มี UUID ซ้ำซ้อนกัน โดยจะให้ผู้ใช้ระบุ \`Master UUID\` (รายการที่จะเก็บไว้) และ \`Duplicate UUIDs\` (รายการที่จะถูกรวมและเปลี่ยนสถานะเป็น \`Merged\`).  
\*   \*\*📋 ดูสถานะ Record ทั้งหมด\*\*: แสดงรายงานสถานะของ Record ทั้งหมดในชีต \`Database\` (Active, Inactive, Merged).

\#\#\# 4.2. เมนู \`📦 2\. เมนูพิเศษ SCG\`

เมนูนี้ใช้สำหรับจัดการข้อมูลที่เกี่ยวข้องกับการขนส่งของ SCG.

\*   \*\*📥 1\. โหลดข้อมูล Shipment (+E-POD)\*\*: ดึงข้อมูล Shipment จาก SCG JWD API โดยใช้ Cookie และ Shipment Numbers ที่ระบุในชีต \`Input\` แล้วนำข้อมูลที่ได้มาใส่ในชีต \`Data\`.  
\*   \*\*🟢 2\. อัปเดตพิกัด \+ อีเมลพนักงาน\*\*: นำพิกัด (LatLong\_Actual) จากชีต \`Database\` และอีเมลพนักงานจากชีต \`ข้อมูลพนักงาน\` มาใส่ในชีต \`Data\` โดยอ้างอิงจาก \`ShipToName\`.

\#\#\#\# เมนูย่อย \`📍 GPS Queue Management\`

\*   \*\*🔄 1\. Sync GPS จากคนขับ → Queue\*\*: ดึงข้อมูลพิกัดจากคนขับ (ถ้ามี) และนำไปเปรียบเทียบกับพิกัดใน \`Database\` หากมีความแตกต่างเกินเกณฑ์ที่กำหนด จะส่งเข้าชีต \`GPS\_Queue\` เพื่อให้ผู้ใช้พิจารณา.  
\*   \*\*✅ 2\. อนุมัติรายการที่ติ๊กแล้ว\*\*: อัปเดตพิกัดในชีต \`Database\` ตามรายการที่ผู้ใช้ได้อนุมัติ (ติ๊กช่อง \`Approve\`) ในชีต \`GPS\_Queue\`.  
\*   \*\*📊 3\. ดูสถิติ Queue\*\*: แสดงสถิติของรายการที่รอการพิจารณาในชีต \`GPS\_Queue\`.  
\*   \*\*🛠️ สร้างชีต GPS\_Queue ใหม่\*\*: สร้างชีต \`GPS\_Queue\` ใหม่พร้อม Header หากยังไม่มี หรือล้างข้อมูลและสร้าง Header ใหม่หากมีอยู่แล้ว.

\#\#\#\# เมนูย่อย \`🧹 เมนูล้างข้อมูล (Dangerous Zone)\`

\*   \*\*⚠️ ล้างเฉพาะชีต Data\*\*: ล้างข้อมูลทั้งหมดในชีต \`Data\` (ยกเว้น Header).  
\*   \*\*⚠️ ล้างเฉพาะชีต Input\*\*: ล้างข้อมูลทั้งหมดในชีต \`Input\` (ยกเว้น Header).  
\*   \*\*⚠️ ล้างเฉพาะชีต สรุป\_เจ้าของสินค้า\*\*: ล้างข้อมูลทั้งหมดในชีต \`สรุป\_เจ้าของสินค้า\` (ยกเว้น Header).  
\*   \*\*🔥 ล้างทั้งหมด\*\*: ล้างข้อมูลทั้งหมดในชีต \`Data\`, \`Input\`, \`สรุป\_เจ้าของสินค้า\`, และ \`สรุป\_Shipment\` (ยกเว้น Header).

\#\#\# 4.3. เมนู \`🤖 3\. ระบบอัตโนมัติ\`

เมนูนี้ใช้สำหรับควบคุมระบบ Auto-Pilot ที่ทำงานเบื้องหลัง.

\*   \*\*▶️ เปิดระบบ Auto-Pilot\*\*: สร้าง Time-driven Triggers เพื่อให้ฟังก์ชัน \`processAIIndexing\_Batch\` (รันทุก 1 ชั่วโมง) และ \`runDeepCleanBatch\_100\` (รันทุก 4 ชั่วโมง) ทำงานโดยอัตโนมัติ.  
\*   \*\*⏹️ ปิดระบบ Auto-Pilot\*\*: ลบ Time-driven Triggers ที่เกี่ยวข้องกับ Auto-Pilot.  
\*   \*\*👋 ปิดระบบทั้งหมด\*\*: ลบ Trigger ทั้งหมดที่สร้างขึ้นโดยโปรเจกต์นี้.

\#\#\# 4.4. เมนู \`⚙️ 4\. ตั้งค่า\`

เมนูนี้ใช้สำหรับตั้งค่าและบำรุงรักษาระบบ.

\*   \*\*🛠️ ตั้งค่า Environment\*\*: รันฟังก์ชัน \`setupEnvironment()\` เพื่อตรวจสอบและตั้งค่าสภาพแวดล้อมที่จำเป็นสำหรับระบบ (ควรทำหลังจากติดตั้ง Script ครั้งแรก).  
\*   \*\*⬆️ อัปเกรดระบบ\*\*: ตรวจสอบและเพิ่มคอลัมน์ใหม่ที่จำเป็นในชีต \`Database\`.  
\*   \*\*🗑️ ล้าง Cache\*\*: ล้าง Cache ที่ระบบใช้เพื่อเก็บข้อมูลชั่วคราว (เช่น ผลลัพธ์ Geocoding) เพื่อให้ระบบดึงข้อมูลใหม่.

\---

\#\# 5\. แนวทางแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อ

จากปัญหาคุณภาพข้อมูลที่ระบุมา ผมได้วิเคราะห์และเสนอแนวทางแก้ไขโดยใช้ประโยชน์จากโครงสร้างและฟังก์ชันที่มีอยู่ รวมถึงการเพิ่มฟังก์ชันใหม่ที่จำเป็น:

\#\#\# ปัญหาที่ 1: บุคคลคนเดียวกันแต่ชื่อเขียนไม่เหมือนกัน (เช่น "บริษัท กขค จำกัด" กับ "กขค จำกัด (มหาชน)")

\*\*แนวทางแก้ไข:\*\*

1\.  \*\*การใช้ \`Canonical Name\` และ \`Name Fingerprint\`\*\*:   
    \*   ฟังก์ชัน \`generateCanonicalName\` ใน \`Utils\_Common.gs\` จะช่วยปรับชื่อให้เป็นรูปแบบมาตรฐานโดยการลบคำที่ไม่จำเป็นออก (เช่น "บริษัท", "จำกัด", "มหาชน").   
    \*   จากนั้นใช้ \`generateNameFingerprint\` เพื่อสร้าง Hash ของ \`Canonical Name\` ซึ่งจะช่วยในการระบุชื่อที่คล้ายกันได้ง่ายขึ้น.  
    \*   เพิ่มคอลัมน์ \`Canonical\_Name\` และ \`Name\_FP\` ในชีต \`Database\`.  
2\.  \*\*AI-Powered Normalization\*\*:   
    \*   ใช้ฟังก์ชัน \`processAIIndexing\_Batch\` และ \`callGeminiThinking\_JSON\` ใน \`Service\_AutoPilot.gs\` เพื่อให้ AI วิเคราะห์ชื่อที่ไม่เป็นมาตรฐานและเสนอ \`Normalized Name\` ที่สอดคล้องกัน. AI สามารถเรียนรู้รูปแบบการเขียนชื่อที่แตกต่างกันและจับคู่กับชื่อมาตรฐานได้.  
    \*   ผลลัพธ์จาก AI จะถูกเก็บในคอลัมน์ \`NORMALIZED\` และ/หรือ \`Canonical\_Name\`.  
3\.  \*\*\`NameMapping\` Sheet\*\*:   
    \*   ชีต \`NameMapping\` ใช้สำหรับบันทึกการจับคู่ระหว่าง \`Variant\_Name\` (ชื่อที่เขียนต่างกัน) กับ \`Master\_UID\` (UUID ของชื่อหลักใน \`Database\`).   
    \*   เมื่อระบบหรือ AI พบชื่อใหม่ที่คล้ายกับชื่อที่มีอยู่ สามารถเสนอให้ผู้ใช้ยืนยันการเพิ่มลงใน \`NameMapping\` ได้.

\#\#\# ปัญหาที่ 2: บุคคลคนเดียวกันแต่ที่อยู่เขียนไม่เหมือนกัน (เช่น "123 ถ.สุขุมวิท" กับ "123 สุขุมวิท")

\*\*แนวทางแก้ไข:\*\*

1\.  \*\*การใช้ \`Canonical Address\` และ \`Address Fingerprint\`\*\*:   
    \*   ฟังก์ชัน \`generateCanonicalAddress\` ใน \`Utils\_Common.gs\` จะช่วยปรับที่อยู่ให้เป็นรูปแบบมาตรฐานโดยการลบคำที่ไม่จำเป็นออก (เช่น "หมู่ที่", "ซอย", "ถนน", "แขวง", "เขต", "ตำบล", "อำเภอ", "จังหวัด").  
    \*   จากนั้นใช้ \`generateAddressFingerprint\` เพื่อสร้าง Hash ของ \`Canonical Address\`.  
    \*   เพิ่มคอลัมน์ \`Canonical\_Address\` และ \`Addr\_FP\` ในชีต \`Database\`.  
2\.  \*\*Geocoding และ \`GeoHash\`\*\*:   
    \*   ใช้ \`updateGeoData\_SmartCache\` ใน \`Service\_GeoAddr.gs\` เพื่อแปลงที่อยู่เป็นพิกัดละติจูด/ลองจิจูดที่แม่นยำ. พิกัดที่ได้จะมีความเป็นมาตรฐานสูงกว่าข้อความที่อยู่.  
    \*   ใช้ \`normalizeLatLng\` เพื่อปรับพิกัดให้มีทศนิยมเท่ากัน (เช่น 6 ตำแหน่ง) และ \`generateGeoHash\` เพื่อสร้าง \`GeoHash\` ซึ่งเป็นรหัสสั้นๆ ที่แสดงถึงพื้นที่ทางภูมิศาสตร์. \`GeoHash\` ที่เหมือนกันบ่งบอกถึงตำแหน่งที่ใกล้เคียงกันมาก.  
    \*   เพิ่มคอลัมน์ \`Lat\_Norm\`, \`Lng\_Norm\`, และ \`Geo\_Hash\` ในชีต \`Database\`.

\#\#\# ปัญหาที่ 3: บุคคลคนเดียวกันแต่เลข Lat Long คนละที่ (เช่น ปักหมุดผิด)

\*\*แนวทางแก้ไข:\*\*

1\.  \*\*\`GPS\_Queue\` และการตรวจสอบโดยมนุษย์\*\*:   
    \*   ระบบสามารถเปรียบเทียบพิกัดที่ได้จากแหล่งต่างๆ (เช่น SCG API, คนขับ, Google Geocoder) กับพิกัดหลักใน \`Database\`.  
    \*   หากพบความแตกต่างเกินเกณฑ์ที่กำหนด (เช่น \`GPS\_THRESHOLD\_METERS\` ใน \`SCG\_CONFIG\`) ให้ส่งรายการนั้นเข้าชีต \`GPS\_Queue\`.  
    \*   ผู้ใช้สามารถตรวจสอบและอนุมัติ (\`Approve\`) หรือปฏิเสธ (\`Reject\`) พิกัดใหม่ได้ผ่านเมนู \`📍 GPS Queue Management\` \> \`✅ 2\. อนุมัติรายการที่ติ๊กแล้ว\`.  
2\.  \*\*\`Coord\_Confidence\` และ \`Coord\_Source\`\*\*:   
    \*   เพิ่มคอลัมน์ \`Coord\_Confidence\` เพื่อระบุความน่าเชื่อถือของพิกัด (เช่น 100 สำหรับพิกัดที่มนุษย์ยืนยัน, 90 สำหรับ Google Geocoder, ต่ำกว่าสำหรับพิกัดที่ไม่แน่นอน).  
    \*   เพิ่มคอลัมน์ \`Coord\_Source\` เพื่อระบุแหล่งที่มาของพิกัด (เช่น \`Driver\`, \`SCG\`, \`Google\`, \`Manual\`).  
    \*   เมื่อมีการอัปเดตพิกัด ควรบันทึก \`Coord\_Source\`, \`Coord\_Confidence\`, และ \`Coord\_Last\_Updated\`.

\#\#\# ปัญหาที่ 4: บุคคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน

\*\*แนวทางแก้ไข:\*\*

1\.  \*\*การใช้ \`Canonical Address\` และ \`Address Fingerprint\` ร่วมกับ \`Canonical Name\`\*\*:   
    \*   แม้ที่อยู่จะเหมือนกัน แต่ \`Canonical Name\` ที่แตกต่างกันจะช่วยแยกแยะได้ว่านี่คือคนละบุคคล/องค์กร.  
    \*   ระบบสามารถใช้ \`Address Fingerprint\` เพื่อหาที่อยู่ที่ซ้ำกัน และนำ \`Name Fingerprint\` มาพิจารณาประกอบ. หาก \`Address Fingerprint\` เหมือนกันแต่ \`Name Fingerprint\` ต่างกัน แสดงว่าเป็นคนละบุคคลที่อยู่สถานที่เดียวกัน.  
2\.  \*\*การตรวจสอบด้วย AI\*\*:   
    \*   AI สามารถช่วยวิเคราะห์ความสัมพันธ์ระหว่างชื่อและที่อยู่ได้ดีขึ้น โดยอาจใช้ข้อมูลบริบทอื่นๆ ประกอบ (เช่น ประเภทธุรกิจ, ข้อมูลการติดต่อ).

\#\#\# ปัญหาที่ 5: เรื่องบุคคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน

\*\*แนวทางแก้ไข:\*\*

\*   เหมือนกับปัญหาที่ 4\. การใช้ \`Canonical Name\` และ \`Canonical Address\` ร่วมกับ \`Fingerprint\` จะเป็นหัวใจสำคัญในการแยกแยะ.

\#\#\# ปัญหาที่ 6: เรื่องบุคคลชื่อเดียวกัน แต่ชื่อสถานที่อยู่ไม่เหมือนกัน

\*\*แนวทางแก้ไข:\*\*

1\.  \*\*การใช้ \`Canonical Name\` และ \`Canonical Address\`\*\*:   
    \*   หาก \`Canonical Name\` เหมือนกัน แต่ \`Canonical Address\` ต่างกันอย่างชัดเจน แสดงว่าเป็นบุคคลเดียวกันแต่อยู่คนละสาขาหรือคนละที่อยู่.  
2\.  \*\*การตรวจสอบด้วย \`UUID\`\*\*:   
    \*   แต่ละ Record ใน \`Database\` ควรมี \`UUID\` ที่ไม่ซ้ำกัน. หากพบชื่อที่ซ้ำกันแต่มี \`UUID\` ต่างกันและที่อยู่ต่างกัน แสดงว่าเป็นคนละ Record.  
3\.  \*\*การใช้ AI เพื่อยืนยัน\*\*:   
    \*   AI สามารถช่วยยืนยันได้ว่าชื่อที่เหมือนกันแต่ที่อยู่ต่างกันนั้นเป็นคนละสาขาขององค์กรเดียวกันหรือไม่ โดยพิจารณาจากรูปแบบชื่อและข้อมูลอื่นๆ.

\#\#\# ปัญหาที่ 7: เรื่องบุคคลชื่อเดียวกัน แต่เลข Lat Long คนละที่ ไม่เหมือนกัน

\*\*แนวทางแก้ไข:\*\*

1\.  \*\*การใช้ \`Canonical Name\` และ \`GeoHash\`\*\*:   
    \*   หาก \`Canonical Name\` เหมือนกัน แต่ \`GeoHash\` ต่างกัน แสดงว่าเป็นบุคคลเดียวกันแต่อยู่คนละสถานที่ (เช่น คนละสาขา).  
2\.  \*\*การตรวจสอบ \`Coord\_Confidence\`\*\*:   
    \*   หากพิกัดหนึ่งมี \`Coord\_Confidence\` สูงกว่าอีกพิกัดหนึ่ง อาจบ่งบอกว่าพิกัดนั้นน่าเชื่อถือกว่า.  
3\.  \*\*การใช้ \`GPS\_Queue\`\*\*:   
    \*   หากพิกัดที่แตกต่างกันถูกป้อนเข้ามา ระบบสามารถส่งเข้า \`GPS\_Queue\` เพื่อให้ผู้ใช้ตรวจสอบและตัดสินใจว่าพิกัดใดถูกต้อง หรือเป็นคนละสถานที่กัน.

\#\#\# ปัญหาที่ 8: เรื่องบุคคล คนละชื่อ แต่ เลข Lat Long ที่เดียวกัน

\*\*แนวทางแก้ไข:\*\*

1\.  \*\*การใช้ \`GeoHash\` และ \`Name Fingerprint\`\*\*:   
    \*   หาก \`GeoHash\` เหมือนกัน (แสดงว่าอยู่ตำแหน่งเดียวกัน) แต่ \`Name Fingerprint\` ต่างกัน แสดงว่าเป็นคนละบุคคลที่อยู่สถานที่เดียวกัน.  
2\.  \*\*การตรวจสอบ \`DQ\_Review\_Queue\`\*\*:   
    \*   ระบบสามารถตรวจจับกรณีนี้และส่งเข้าชีต \`DQ\_Review\_Queue\` เพื่อให้ผู้ใช้พิจารณาว่าควรจะรวมข้อมูล (Merge) หรือแยกเป็น 2 Record ที่อยู่ตำแหน่งเดียวกัน.  
3\.  \*\*การใช้ AI เพื่อแยกแยะ\*\*:   
    \*   AI สามารถช่วยวิเคราะห์ชื่อและข้อมูลอื่นๆ เพื่อตัดสินใจว่าบุคคลสองคนที่มีชื่อต่างกันแต่อยู่ตำแหน่งเดียวกันนั้นเป็นคนละบุคคลจริงหรือไม่ (เช่น เป็นคนละร้านค้าในอาคารเดียวกัน).

\---

\#\# 6\. แนวคิดและกลยุทธ์ส่วนตัวในการพัฒนาโปรเจกต์ LMDS

หากผมได้รับมอบหมายให้พัฒนาโปรเจกต์ LMDS นี้ ผมจะใช้แนวทางและกลยุทธ์ดังต่อไปนี้ เพื่อให้ระบบมีประสิทธิภาพ แม่นยำ และยืดหยุ่นมากที่สุด:

\#\#\# 6.1. การสร้างฐานข้อมูล Master Data ที่แข็งแกร่ง (Single Source of Truth)

\*   \*\*เน้น \`UUID\` เป็น Primary Key\*\*: \`UUID\` เป็นรหัสที่ไม่ซ้ำกันทั่วโลก ซึ่งสำคัญมากในการระบุ Record แต่ละตัวอย่างแท้จริง แม้ชื่อหรือที่อยู่จะเปลี่ยนแปลงไป. จะต้องมั่นใจว่าทุก Record มี \`UUID\` และใช้ \`UUID\` เป็นตัวอ้างอิงหลักในการเชื่อมโยงข้อมูลระหว่างชีตต่างๆ.  
\*   \*\*\`Record\_Status\` สำหรับการจัดการ Lifecycle ของข้อมูล\*\*: การมี \`Active\`, \`Inactive\`, \`Merged\` Status ช่วยให้สามารถจัดการข้อมูลที่ไม่ต้องการใช้งานแล้ว หรือข้อมูลที่ถูกรวมเข้าด้วยกันได้อย่างเป็นระบบ โดยไม่ต้องลบข้อมูลทิ้งไปเลย.  
\*   \*\*\`Archive\_DB\` สำหรับข้อมูลเก่า\*\*: การย้าย Record ที่ \`Inactive\` หรือ \`Merged\` ไปยัง \`Archive\_DB\` ช่วยให้ชีต \`Database\` หลักมีขนาดเล็กลง ทำงานได้เร็วขึ้น และยังคงเก็บประวัติข้อมูลไว้เพื่อการตรวจสอบในอนาคต.

\#\#\# 6.2. การปรับปรุงคุณภาพข้อมูลอย่างต่อเนื่อง (Continuous Data Quality Improvement)

\*   \*\*การใช้ \`Canonical Name/Address\` และ \`Fingerprint\`\*\*: นี่คือหัวใจสำคัญในการแก้ไขปัญหาชื่อและที่อยู่ที่ไม่เป็นมาตรฐาน การสร้าง \`Canonical\` และ \`Fingerprint\` จะช่วยให้การเปรียบเทียบและค้นหาข้อมูลซ้ำซ้อนมีประสิทธิภาพมากขึ้น.  
\*   \*\*AI-Powered Data Normalization และ Enrichment\*\*:   
    \*   ใช้ AI (Gemini) ในการวิเคราะห์ชื่อและที่อยู่ที่ไม่เป็นมาตรฐาน เพื่อสร้าง \`Normalized Name\` และ \`Keywords\` ที่แม่นยำ. AI สามารถเรียนรู้และปรับปรุงความสามารถในการทำความสะอาดข้อมูลได้เมื่อมีข้อมูลมากขึ้น.  
    \*   พิจารณาใช้ AI ในการเติมข้อมูลที่ขาดหายไป เช่น ประเภทธุรกิจ, ข้อมูลติดต่อ, หรือแม้กระทั่งการแนะนำที่อยู่เต็มรูปแบบจากชื่อสถานที่.  
\*   \*\*Human-in-the-Loop (HITL) ด้วย \`DQ\_Review\_Queue\` และ \`GPS\_Queue\`\*\*:   
    \*   ระบบอัตโนมัติไม่สามารถสมบูรณ์แบบได้เสมอไป การมีคิวสำหรับให้มนุษย์ตรวจสอบและตัดสินใจในกรณีที่ AI ไม่มั่นใจ หรือพบความขัดแย้งของข้อมูล เป็นสิ่งจำเป็นอย่างยิ่ง.  
    \*   ออกแบบ UI ในชีต \`DQ\_Review\_Queue\` และ \`GPS\_Queue\` ให้ใช้งานง่าย มีข้อมูลประกอบการตัดสินใจที่เพียงพอ และมีปุ่มสำหรับ \`Approve\`/\`Reject\`/\`Merge\` ที่ชัดเจน.  
\*   \*\*\`Quality Score\` และ \`Confidence Score\`\*\*: ใช้คะแนนเหล่านี้เป็นตัวชี้วัดสุขภาพของข้อมูล และเป็นเกณฑ์ในการตัดสินใจว่า Record ใดควรถูกส่งให้ AI หรือมนุษย์ตรวจสอบ.

\#\#\# 6.3. การใช้ Geocoding และ Geo-spatial Data ให้เกิดประโยชน์สูงสุด

\*   \*\*Smart Caching สำหรับ Geocoding\*\*: การใช้ \`CacheService\` ช่วยลดการเรียกใช้ Google Maps API ซ้ำซ้อน ซึ่งช่วยประหยัดค่าใช้จ่ายและเพิ่มความเร็วในการประมวลผล.  
\*   \*\*\`GeoHash\` สำหรับการค้นหาพื้นที่ใกล้เคียง\*\*: \`GeoHash\` เป็นเครื่องมือที่มีประสิทธิภาพในการค้นหา Record ที่อยู่ในพื้นที่ทางภูมิศาสตร์เดียวกันหรือใกล้เคียงกัน ซึ่งมีประโยชน์มากในการหาข้อมูลซ้ำซ้อนที่อยู่ตำแหน่งเดียวกัน หรือการจัดกลุ่มลูกค้าตามพื้นที่.  
\*   \*\*\`Coord\_Source\` และ \`Coord\_Confidence\`\*\*: การบันทึกแหล่งที่มาและความน่าเชื่อถือของพิกัด ช่วยให้สามารถจัดลำดับความสำคัญของข้อมูลพิกัดได้ (เช่น พิกัดที่คนขับยืนยันควรมีความน่าเชื่อถือสูงกว่าพิกัดจาก Google Maps).

\#\#\# 6.4. ระบบอัตโนมัติ (Auto-Pilot) และการบำรุงรักษา

\*   \*\*Time-driven Triggers\*\*: ใช้ Triggers เพื่อรันฟังก์ชันทำความสะอาดข้อมูล, AI Processing, และการอัปเดตพิกัดเป็นประจำ เพื่อให้ข้อมูลในระบบมีความทันสมัยและมีคุณภาพอยู่เสมอ.  
\*   \*\*Diagnostic Tools\*\*: ฟังก์ชัน \`runDiagnostic\` มีความสำคัญมากในการตรวจสอบสุขภาพของระบบทั้งหมด (Schema, API Key, Triggers) เพื่อให้สามารถแก้ไขปัญหาได้อย่างรวดเร็วเมื่อเกิดข้อผิดพลาด.  
\*   \*\*Upgrade Mechanism\*\*: การมี \`upgradeSystem\_UI\` ช่วยให้สามารถเพิ่มคอลัมน์ใหม่หรือปรับปรุงโครงสร้างชีตได้อย่างง่ายดายในอนาคต โดยไม่ต้องแก้ไขข้อมูลด้วยตนเอง.

\#\#\# 6.5. การพัฒนาเพิ่มเติมในอนาคต (Future Enhancements)

\*   \*\*การรวมข้อมูล (Data Merging) ที่ซับซ้อนขึ้น\*\*:   
    \*   ปัจจุบัน \`mergeRecords\` เพียงแค่เปลี่ยนสถานะของ Record ที่ซ้ำซ้อน. ในอนาคต อาจเพิ่มความสามารถในการย้ายข้อมูลบางส่วนจาก Record ที่ถูกรวม ไปยัง Record หลัก (เช่น ข้อมูลติดต่อที่ไม่ซ้ำกัน).  
    \*   พัฒนา UI สำหรับการ Merge ที่แสดงข้อมูลของ Record ทั้งสองฝั่งให้ผู้ใช้เปรียบเทียบและเลือกข้อมูลที่จะเก็บไว้.  
\*   \*\*การวิเคราะห์ความสัมพันธ์ของข้อมูล (Relationship Analysis)\*\*:   
    \*   ใช้ AI ในการวิเคราะห์ความสัมพันธ์ระหว่าง Record ต่างๆ เช่น การระบุสาขาของบริษัทแม่, การเชื่อมโยงลูกค้ากับ Supplier.  
\*   \*\*การทำความสะอาดข้อมูลเชิงรุก (Proactive Data Cleansing)\*\*:   
    \*   แทนที่จะรอให้ข้อมูลมีปัญหาแล้วค่อยแก้ไข ระบบควรสามารถตรวจจับและแจ้งเตือนปัญหาคุณภาพข้อมูลได้ตั้งแต่เนิ่นๆ (เช่น เมื่อมีการเพิ่ม Record ใหม่ที่มีความคล้ายคลึงกับ Record ที่มีอยู่).  
\*   \*\*Dashboard และ Reporting\*\*:   
    \*   สร้าง Dashboard ใน Google Data Studio หรือใน Google Sheet เอง เพื่อแสดงภาพรวมคุณภาพข้อมูล, จำนวน Record ที่ต้องตรวจสอบ, และประสิทธิภาพของระบบ.  
\*   \*\*Web App Interface ที่สมบูรณ์\*\*:   
    \*   \`Index.html\` และ \`WebApp.gs\` เป็นจุดเริ่มต้นที่ดี. สามารถพัฒนา Web App ให้เป็น User Interface ที่สมบูรณ์สำหรับการจัดการ Master Data, การตรวจสอบคุณภาพข้อมูล, และการตั้งค่าระบบ เพื่อให้ผู้ใช้สามารถทำงานได้ง่ายขึ้นโดยไม่ต้องเข้าถึง Apps Script Editor โดยตรง.

ด้วยแนวทางเหล่านี้ ผมเชื่อว่าระบบ LMDS จะสามารถเป็นเครื่องมือที่มีประสิทธิภาพสูงในการจัดการ Master Data, ปรับปรุงคุณภาพข้อมูล, และสนับสนุนการดำเนินงานด้านโลจิสติกส์ได้อย่างยั่งยืน.

\---  
\# การออกแบบ Schema ฐานข้อมูลและแผนการทำความสะอาดข้อมูล (ETL/Cleaning)

ในการสร้างระบบฐานข้อมูล Master Data ที่แข็งแกร่งและสะอาด เพื่อแก้ไขปัญหาคุณภาพข้อมูลทั้ง 8 ข้อที่ระบุมา ผมได้วิเคราะห์โค้ดที่มีอยู่และเสนอการปรับปรุงโครงสร้างชีต รวมถึงกระบวนการ ETL (Extract, Transform, Load) และการทำความสะอาดข้อมูล (Data Cleansing) ดังนี้:

\#\# 1\. การปรับปรุงโครงสร้าง Google Sheets Schema

โครงสร้างชีตหลักที่เกี่ยวข้องกับการจัดการ Master Data คือ \`Database\`, \`NameMapping\`, \`DQ\_Review\_Queue\` และ \`GPS\_Queue\` ผมเสนอให้มีการเพิ่มคอลัมน์และปรับปรุงคำจำกัดความของคอลัมน์ที่มีอยู่เพื่อรองรับการแก้ไขปัญหาคุณภาพข้อมูล

\#\#\# 1.1. ชีต \`Database\` (Master Data)

ชีตนี้จะเป็นแหล่งข้อมูลหลัก (Single Source of Truth) สำหรับข้อมูลลูกค้า/สถานที่ทั้งหมด การเพิ่มคอลัมน์ต่อไปนี้จะช่วยให้สามารถระบุตัวตน, สถานที่, และจัดการคุณภาพข้อมูลได้อย่างมีประสิทธิภาพ:

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| 1    | \`UUID\`               | String      | รหัสที่ไม่ซ้ำกันสำหรับแต่ละ Record (Primary Key) | ปัญหา 1-8: ใช้ระบุ Record ที่ไม่ซ้ำกัน แม้ข้อมูลอื่นจะคล้ายกันหรือเปลี่ยนแปลงไป |  
| 2    | \`Original\_Name\`      | String      | ชื่อลูกค้า/สถานที่ต้นฉบับที่ได้รับมา | ปัญหา 1, 4, 6, 8: เก็บข้อมูลดิบเพื่อการอ้างอิงและตรวจสอบ |  
| 3    | \`Canonical\_Name\`     | String      | ชื่อลูกค้า/สถานที่ที่ถูกทำให้เป็นมาตรฐาน (เช่น ลบคำว่า "บริษัท", "จำกัด") | ปัญหา 1, 4, 6, 7, 8: ใช้ในการเปรียบเทียบและจัดกลุ่มชื่อที่คล้ายกัน |  
| 4    | \`Name\_FP\`            | String      | Fingerprint ของ \`Canonical\_Name\` (Hash ค่า) | ปัญหา 1, 4, 6, 7, 8: ใช้ในการค้นหาชื่อที่ซ้ำซ้อนหรือคล้ายกันอย่างรวดเร็ว |  
| 5    | \`Normalized\_Keywords\`| String      | Keywords ที่ได้จากการวิเคราะห์ของ AI (Gemini) เพื่อช่วยในการค้นหาและจับคู่ | ปัญหา 1, 4, 6, 7, 8: เพิ่มความสามารถในการค้นหาและจับคู่ชื่อที่ซับซ้อน |  
| 6    | \`Original\_Address\`   | String      | ที่อยู่ต้นฉบับที่ได้รับมา | ปัญหา 2, 5: เก็บข้อมูลดิบเพื่อการอ้างอิงและตรวจสอบ |  
| 7    | \`Canonical\_Address\`  | String      | ที่อยู่ที่ถูกทำให้เป็นมาตรฐาน (เช่น ลบคำว่า "ถนน", "ซอย", "แขวง", "เขต") | ปัญหา 2, 5, 6: ใช้ในการเปรียบเทียบและจัดกลุ่มที่อยู่ที่คล้ายกัน |  
| 8    | \`Addr\_FP\`            | String      | Fingerprint ของ \`Canonical\_Address\` (Hash ค่า) | ปัญหา 2, 5, 6: ใช้ในการค้นหาที่อยู่ที่ซ้ำซ้อนหรือคล้ายกันอย่างรวดเร็ว |  
| 9    | \`Lat\_Actual\`         | Number      | ละติจูดของสถานที่ (จากแหล่งที่เชื่อถือได้ เช่น GPS คนขับ) | ปัญหา 3, 7, 8: พิกัดหลักที่ใช้ในการอ้างอิง |  
| 10   | \`Long\_Actual\`        | Number      | ลองจิจูดของสถานที่ (จากแหล่งที่เชื่อถือได้ เช่น GPS คนขับ) | ปัญหา 3, 7, 8: พิกัดหลักที่ใช้ในการอ้างอิง |  
| 11   | \`Lat\_Norm\`           | Number      | ละติจูดที่ถูก Normalize (เช่น ทศนิยม 6 ตำแหน่ง) | ปัญหา 3, 7, 8: ใช้ในการเปรียบเทียบพิกัดที่แม่นยำ |  
| 12   | \`Long\_Norm\`          | Number      | ลองจิจูดที่ถูก Normalize (เช่น ทศนิยม 6 ตำแหน่ง) | ปัญหา 3, 7, 8: ใช้ในการเปรียบเทียบพิกัดที่แม่นยำ |  
| 13   | \`Geo\_Hash\`           | String      | GeoHash ของพิกัด \`Lat\_Norm\`, \`Long\_Norm\` (ความยาว 8-9 ตัวอักษร) | ปัญหา 3, 7, 8: ใช้ในการค้นหาพื้นที่ใกล้เคียงและพิกัดซ้ำซ้อน |  
| 14   | \`Coord\_Source\`       | String      | แหล่งที่มาของพิกัด (เช่น \`SCG\_GPS\`, \`Google\_Geocode\`, \`Manual\`) | ปัญหา 3, 7: ระบุความน่าเชื่อถือของพิกัด |  
| 15   | \`Coord\_Confidence\`   | Number      | คะแนนความน่าเชื่อถือของพิกัด (0-100) | ปัญหา 3, 7: ใช้ในการจัดลำดับความสำคัญของพิกัด |  
| 16   | \`Record\_Status\`      | String      | สถานะของ Record (\`Active\`, \`Inactive\`, \`Merged\`) | ปัญหา 1-8: จัดการ Lifecycle ของข้อมูล |  
| 17   | \`Quality\_Score\`      | Number      | คะแนนคุณภาพโดยรวมของ Record (คำนวณจากความสมบูรณ์ของข้อมูล) | ปัญหา 1-8: ใช้ในการจัดลำดับความสำคัญของการทำความสะอาดข้อมูล |  
| 18   | \`Last\_Updated\`       | Date/Time   | วันที่และเวลาที่ Record ถูกอัปเดตล่าสุด | ปัญหา 1-8: ติดตามการเปลี่ยนแปลงของข้อมูล |  
| 19   | \`Created\_Date\`       | Date/Time   | วันที่และเวลาที่ Record ถูกสร้างขึ้น | ปัญหา 1-8: ติดตามการสร้างข้อมูล |  
| ...  | (คอลัมน์อื่นๆ ที่มีอยู่เดิม) | ...         | ...      | ...                    |

\#\#\# 1.2. ชีต \`NameMapping\`

ชีตนี้ใช้สำหรับบันทึกการจับคู่ชื่อที่แตกต่างกันให้เป็นชื่อหลัก (Master Name) ในชีต \`Database\`

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| 1    | \`Variant\_Name\`       | String      | ชื่อที่เขียนแตกต่างกัน (เช่น "กขค จำกัด (มหาชน)") | ปัญหา 1, 4: ชื่อที่ระบบพบและต้องการจับคู่ |  
| 2    | \`Master\_UUID\`        | String      | \`UUID\` ของชื่อหลักในชีต \`Database\` ที่ \`Variant\_Name\` นี้ควรจะจับคู่ด้วย | ปัญหา 1, 4: เชื่อมโยงชื่อที่แตกต่างกันเข้ากับ Master Record |  
| 3    | \`Master\_Name\`        | String      | \`Canonical\_Name\` ของ Master Record (เพื่อให้อ่านง่าย) | ปัญหา 1, 4: แสดงชื่อหลักที่จับคู่ด้วย |  
| 4    | \`Confidence\`         | Number      | คะแนนความมั่นใจในการจับคู่ (0-100) | ปัญหา 1, 4: ระบุความน่าเชื่อถือของการจับคู่ |  
| 5    | \`Source\`             | String      | แหล่งที่มาของการจับคู่ (เช่น \`AI\`, \`Manual\`, \`Rule\`) | ปัญหา 1, 4: ระบุว่าใครเป็นคนสร้างการจับคู่ |  
| 6    | \`Last\_Updated\`       | Date/Time   | วันที่และเวลาที่การจับคู่ถูกอัปเดตล่าสุด | ปัญหา 1, 4: ติดตามการเปลี่ยนแปลง |

\#\#\# 1.3. ชีต \`DQ\_Review\_Queue\` (Data Quality Review Queue)

ชีตใหม่นี้จะใช้สำหรับเก็บ Record ที่ระบบตรวจพบว่ามีปัญหาคุณภาพข้อมูลที่ AI ไม่สามารถแก้ไขได้ หรือต้องการการตรวจสอบจากมนุษย์ (Human-in-the-Loop) ก่อนที่จะนำเข้าสู่ \`Database\` หรือ \`NameMapping\`

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| 1    | \`Queue\_ID\`           | String      | รหัสสำหรับรายการใน Queue | ปัญหา 1-8: ระบุรายการใน Queue |  
| 2    | \`Issue\_Type\`         | String      | ประเภทของปัญหา (เช่น \`Duplicate\_Name\`, \`Conflicting\_Coord\`, \`AI\_Uncertain\`) | ปัญหา 1-8: ระบุประเภทปัญหาเพื่อการจัดการ |  
| 3    | \`Original\_Data\`      | String (JSON)| ข้อมูลต้นฉบับที่ทำให้เกิดปัญหา (อาจเป็น JSON ของ Row) | ปัญหา 1-8: ข้อมูลดิบเพื่อการตรวจสอบ |  
| 4    | \`Proposed\_Action\`    | String      | การดำเนินการที่ระบบแนะนำ (เช่น \`Merge\_to\_UUID\_X\`, \`Create\_New\_Record\`) | ปัญหา 1-8: ระบบเสนอแนวทางแก้ไข |  
| 5    | \`Reviewer\_Comment\`   | String      | ช่องสำหรับผู้ตรวจสอบใส่ความคิดเห็น | ปัญหา 1-8: บันทึกการตัดสินใจของมนุษย์ |  
| 6    | \`Approved\`           | Boolean     | ผู้ตรวจสอบอนุมัติ (ติ๊กช่อง) | ปัญหา 1-8: สถานะการอนุมัติ |  
| 7    | \`Rejected\`           | Boolean     | ผู้ตรวจสอบปฏิเสธ (ติ๊กช่อง) | ปัญหา 1-8: สถานะการปฏิเสธ |  
| 8    | \`Action\_Taken\`       | String      | การดำเนินการที่เกิดขึ้นจริงหลังจากอนุมัติ | ปัญหา 1-8: บันทึกการดำเนินการ |  
| 9    | \`Timestamp\`          | Date/Time   | วันที่และเวลาที่เข้า Queue | ปัญหา 1-8: ติดตามเวลา |

\#\#\# 1.4. ชีต \`GPS\_Queue\` (Existing Sheet)

ชีตนี้มีอยู่แล้วและใช้สำหรับจัดการพิกัดที่ขัดแย้งกัน ผมเสนอให้เพิ่มคอลัมน์เพื่อบันทึกข้อมูลที่มาและสถานะการตรวจสอบให้ชัดเจนยิ่งขึ้น:

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| ...  | (คอลัมน์ที่มีอยู่เดิม) | ...         | ...      | ...                    |  
| X    | \`Original\_Lat\`       | Number      | ละติจูดเดิมใน \`Database\` | ปัญหา 3, 7: เปรียบเทียบกับพิกัดใหม่ |  
| Y    | \`Original\_Long\`      | Number      | ลองจิจูดเดิมใน \`Database\` | ปัญหา 3, 7: เปรียบเทียบกับพิกัดใหม่ |  
| Z    | \`New\_Lat\`            | Number      | ละติจูดที่เสนอใหม่ (จาก SCG GPS) | ปัญหา 3, 7: พิกัดที่ต้องการตรวจสอบ |  
| AA   | \`New\_Long\`           | Number      | ลองจิจูดที่เสนอใหม่ (จาก SCG GPS) | ปัญหา 3, 7: พิกัดที่ต้องการตรวจสอบ |  
| BB   | \`Source\_New\_Coord\`   | String      | แหล่งที่มาของพิกัดใหม่ (เช่น \`SCG\_GPS\`) | ปัญหา 3, 7: ระบุแหล่งที่มา |  
| CC   | \`Approve\`            | Boolean     | ผู้ตรวจสอบอนุมัติ (ติ๊กช่อง) | ปัญหา 3, 7: สถานะการอนุมัติ |  
| DD   | \`Reject\`             | Boolean     | ผู้ตรวจสอบปฏิเสธ (ติ๊กช่อง) | ปัญหา 3, 7: สถานะการปฏิเสธ |

\#\# 2\. แผนการทำความสะอาดข้อมูล (ETL/Cleaning) สำหรับชีต \`SCGนครหลวงJWDภูมิภาค\`

กระบวนการ ETL จะเป็นขั้นตอนสำคัญในการนำข้อมูลจากชีต \`SCGนครหลวงJWDภูมิภาค\` ซึ่งเป็นข้อมูลดิบจาก GPS คนขับ มาประมวลผลและทำความสะอาดก่อนที่จะนำเข้าสู่ชีต \`Database\` (Master Data) เพื่อให้มั่นใจว่าข้อมูลมีคุณภาพสูงและแก้ไขปัญหาทั้ง 8 ข้อได้จริง

\#\#\# 2.1. ขั้นตอน Extract (การดึงข้อมูล)

\*   \*\*แหล่งข้อมูล\*\*: ชีต \`SCGนครหลวงJWDภูมิภาค\` ซึ่งมีข้อมูล GPS ที่บันทึกโดยคนขับ  
\*   \*\*การดึง\*\*: ใช้ฟังก์ชัน \`getValues()\` เพื่อดึงข้อมูลทั้งหมดจากชีต \`SCGนครหลวงJWDภูมิภาค\` โดยเริ่มจากแถวที่ 2 (ข้าม Header)  
\*   \*\*การระบุ Record ใหม่/ที่อัปเดต\*\*:   
    \*   เปรียบเทียบข้อมูลที่ดึงมากับ \`Database\` โดยใช้ \`Original\_Name\` และ \`Original\_Address\` (หรือ \`ShipmentNo\` หากมี) เป็นตัวระบุเบื้องต้น  
    \*   หากพบ Record ที่ยังไม่มีใน \`Database\` ให้ถือเป็น Record ใหม่  
    \*   หากพบ Record ที่มีอยู่แล้ว แต่มีข้อมูลพิกัด (\`Lat\_Actual\`, \`Long\_Actual\`) ที่แตกต่างกันอย่างมีนัยสำคัญ (เกิน \`GPS\_THRESHOLD\_METERS\` ที่กำหนดใน \`SCG\_CONFIG\`) ให้ถือเป็นการอัปเดตพิกัดที่ต้องตรวจสอบ

\#\#\# 2.2. ขั้นตอน Transform (การแปลงและทำความสะอาดข้อมูล)

ขั้นตอนนี้คือหัวใจสำคัญในการแก้ไขปัญหาคุณภาพข้อมูลทั้ง 8 ข้อ โดยจะใช้ฟังก์ชันที่มีอยู่และสร้างฟังก์ชันใหม่เพิ่มเติม:

\#\#\#\# 2.2.1. การสร้าง \`UUID\` (ปัญหา 1-8)

\*   สำหรับ Record ใหม่ทุกรายการ ให้สร้าง \`UUID\` ที่ไม่ซ้ำกันโดยใช้ \`Utilities.getUuid()\`  
\*   ตรวจสอบว่า \`UUID\` ที่สร้างขึ้นยังไม่ซ้ำกับ \`UUID\` ที่มีอยู่ใน \`Database\` (แม้โอกาสจะน้อยมาก)

\#\#\#\# 2.2.2. การทำความสะอาดและ Normalize ชื่อ (ปัญหา 1, 4, 6, 7, 8\)

\*   \*\*\`Original\_Name\`\*\*: เก็บชื่อลูกค้า/สถานที่ต้นฉบับจาก \`SCGนครหลวงJWDภูมิภาค\` ไว้ในคอลัมน์นี้  
\*   \*\*\`Canonical\_Name\`\*\*: ใช้ฟังก์ชัน \`generateCanonicalName\` (หรือฟังก์ชันที่คล้ายกันใน \`Utils\_Common.gs\`) เพื่อลบคำที่ไม่จำเป็น (เช่น "บริษัท", "จำกัด", "มหาชน") และทำให้ชื่อเป็นมาตรฐาน  
\*   \*\*\`Name\_FP\`\*\*: สร้าง \`Name Fingerprint\` จาก \`Canonical\_Name\` โดยใช้ฟังก์ชัน Hash (เช่น \`MD5\` หรือ \`SHA-256\` ที่สามารถสร้างได้ใน GAS) เพื่อใช้ในการเปรียบเทียบชื่อที่คล้ายกันอย่างรวดเร็ว  
\*   \*\*AI-Powered Normalization\*\*:   
    \*   สำหรับ \`Original\_Name\` ที่ยังไม่เคยถูกประมวลผลโดย AI หรือมี \`Quality\_Score\` ต่ำ ให้ส่งชื่อไปยัง \`callGeminiThinking\_JSON\` (ใน \`Service\_AutoPilot.gs\`) เพื่อให้ AI วิเคราะห์และสร้าง \`Normalized\_Keywords\`  
    \*   ผลลัพธ์จาก AI จะช่วยในการค้นหาและจับคู่ชื่อที่ซับซ้อน หรือชื่อที่มีการสะกดผิด/แตกต่างกัน

\#\#\#\# 2.2.3. การทำความสะอาดและ Normalize ที่อยู่ (ปัญหา 2, 5, 6\)

\*   \*\*\`Original\_Address\`\*\*: เก็บที่อยู่ต้นฉบับจาก \`SCGนครหลวงJWDภูมิภาค\` ไว้ในคอลัมน์นี้  
\*   \*\*\`Canonical\_Address\`\*\*: สร้างฟังก์ชันใหม่ \`generateCanonicalAddress\` (คล้ายกับ \`generateCanonicalName\`) เพื่อลบคำที่ไม่จำเป็นในที่อยู่และทำให้เป็นมาตรฐาน  
\*   \*\*\`Addr\_FP\`\*\*: สร้าง \`Address Fingerprint\` จาก \`Canonical\_Address\` เพื่อใช้ในการเปรียบเทียบที่อยู่ที่คล้ายกันอย่างรวดเร็ว

\#\#\#\# 2.2.4. การจัดการพิกัด (LatLong) และ Geo-spatial Data (ปัญหา 3, 7, 8\)

\*   \*\*\`Lat\_Actual\`, \`Long\_Actual\`\*\*: ใช้พิกัดที่ได้จาก \`SCGนครหลวงJWDภูมิภาค\` เป็น \`Lat\_Actual\` และ \`Long\_Actual\` โดยตรง เนื่องจากเป็นพิกัดที่คนขับส่งงานจริงและผ่านการกรองเบื้องต้นแล้ว  
\*   \*\*\`Lat\_Norm\`, \`Long\_Norm\`\*\*: Normalize พิกัด \`Lat\_Actual\`, \`Long\_Actual\` ให้มีทศนิยมเท่ากัน (เช่น 6 ตำแหน่ง) โดยใช้ฟังก์ชัน \`normalizeLatLng\` (ถ้ามีใน \`Utils\_Common.gs\` หรือสร้างใหม่)  
\*   \*\*\`Geo\_Hash\`\*\*: สร้าง \`GeoHash\` จาก \`Lat\_Norm\`, \`Long\_Norm\` โดยใช้ไลบรารี \`geohash\` (อาจต้องติดตั้งหรือเขียนฟังก์ชันเอง) ความยาวของ \`GeoHash\` ควรอยู่ที่ 8-9 ตัวอักษร เพื่อให้ครอบคลุมพื้นที่ที่เหมาะสม  
\*   \*\*\`Coord\_Source\`\*\*: กำหนดเป็น \`SCG\_GPS\` สำหรับข้อมูลที่มาจากชีต \`SCGนครหลวงJWDภูมิภาค\`  
\*   \*\*\`Coord\_Confidence\`\*\*: กำหนดค่าความน่าเชื่อถือเริ่มต้น (เช่น 95\) สำหรับพิกัดจาก SCG GPS เนื่องจากเป็นข้อมูลจริงจากคนขับ

\#\#\#\# 2.2.5. การตรวจจับและจัดการข้อมูลซ้ำซ้อน (Deduplication) (ปัญหา 1-8)

\*   \*\*การตรวจจับชื่อซ้ำซ้อน\*\*:   
    \*   เปรียบเทียบ \`Name\_FP\` ของ Record ใหม่กับ \`Name\_FP\` ที่มีอยู่ใน \`Database\`  
    \*   หาก \`Name\_FP\` เหมือนกัน ให้ตรวจสอบ \`Canonical\_Name\` และ \`Normalized\_Keywords\` เพิ่มเติม  
    \*   หากพบว่าคล้ายกันมาก ให้ตรวจสอบ \`NameMapping\` ว่ามี \`Variant\_Name\` นี้จับคู่กับ \`Master\_UUID\` ใดหรือไม่  
    \*   หากยังไม่สามารถตัดสินใจได้ ให้ส่ง Record เข้า \`DQ\_Review\_Queue\` ด้วย \`Issue\_Type: Duplicate\_Name\`  
\*   \*\*การตรวจจับที่อยู่ซ้ำซ้อน\*\*:   
    \*   เปรียบเทียบ \`Addr\_FP\` ของ Record ใหม่กับ \`Addr\_FP\` ที่มีอยู่ใน \`Database\`  
    \*   หาก \`Addr\_FP\` เหมือนกัน ให้ตรวจสอบ \`Canonical\_Address\` เพิ่มเติม  
    \*   หากยังไม่สามารถตัดสินใจได้ ให้ส่ง Record เข้า \`DQ\_Review\_Queue\` ด้วย \`Issue\_Type: Duplicate\_Address\`  
\*   \*\*การตรวจจับพิกัดซ้ำซ้อน/ขัดแย้ง\*\*:   
    \*   เปรียบเทียบ \`Geo\_Hash\` ของ Record ใหม่กับ \`Geo\_Hash\` ที่มีอยู่ใน \`Database\`  
    \*   หาก \`Geo\_Hash\` เหมือนกัน (แสดงว่าอยู่ตำแหน่งเดียวกัน) แต่ \`Name\_FP\` ต่างกัน (ปัญหา 8: คนละชื่อแต่ LatLong เดียวกัน) ให้ส่งเข้า \`DQ\_Review\_Queue\` ด้วย \`Issue\_Type: Conflicting\_Name\_Same\_Coord\`  
    \*   หาก Record ใหม่มี \`Original\_Name\` และ \`Original\_Address\` ที่คล้ายกับ Record ที่มีอยู่แล้วใน \`Database\` แต่ \`Lat\_Actual\`, \`Long\_Actual\` แตกต่างกันอย่างมีนัยสำคัญ (ปัญหา 3, 7: ชื่อเดียวกันแต่ LatLong คนละที่) ให้ส่งเข้า \`GPS\_Queue\` เพื่อให้ผู้ใช้ตรวจสอบ

\#\#\#\# 2.2.6. การคำนวณ \`Quality\_Score\` และ \`Record\_Status\`

\*   \*\*\`Quality\_Score\`\*\*: คำนวณจากความสมบูรณ์ของข้อมูล (เช่น มี \`Canonical\_Name\`, \`Canonical\_Address\`, \`Lat\_Actual\`, \`Long\_Actual\`, \`Geo\_Hash\` ครบถ้วนหรือไม่) และความน่าเชื่อถือของแหล่งที่มา  
\*   \*\*\`Record\_Status\`\*\*: กำหนดสถานะเริ่มต้นเป็น \`Active\` สำหรับ Record ใหม่ที่ผ่านการทำความสะอาดเบื้องต้นแล้ว

\#\#\# 2.3. ขั้นตอน Load (การนำเข้าข้อมูล)

\*   \*\*การนำเข้า Record ใหม่\*\*:   
    \*   สำหรับ Record ที่ผ่านการ Transform และ Deduplication แล้ว และถือว่าเป็น Record ใหม่ ให้เพิ่ม Row ใหม่ในชีต \`Database\` พร้อมข้อมูลที่ผ่านการประมวลผลทั้งหมด  
\*   \*\*การอัปเดต Record ที่มีอยู่\*\*:   
    \*   สำหรับ Record ที่มีอยู่แล้วใน \`Database\` แต่มีข้อมูลพิกัดใหม่จาก \`SCGนครหลวงJWDภูมิภาค\` ที่ต้องตรวจสอบ ให้ส่งเข้า \`GPS\_Queue\`  
    \*   เมื่อผู้ใช้ใน \`GPS\_Queue\` อนุมัติพิกัดใหม่ ระบบจะอัปเดต \`Lat\_Actual\`, \`Long\_Actual\`, \`Lat\_Norm\`, \`Long\_Norm\`, \`Geo\_Hash\`, \`Coord\_Source\`, \`Coord\_Confidence\`, และ \`Last\_Updated\` ใน \`Database\`  
\*   \*\*การจัดการ \`DQ\_Review\_Queue\`\*\*:   
    \*   สำหรับ Record ที่ถูกส่งเข้า \`DQ\_Review\_Queue\` ระบบจะรอการตัดสินใจจากผู้ใช้ (Approve/Reject/Merge)  
    \*   เมื่อผู้ใช้อนุมัติการ Merge ระบบจะอัปเดต \`Record\_Status\` ของ Record ที่ถูกรวมเป็น \`Merged\` และอาจย้ายไปยัง \`Archive\_DB\` พร้อมทั้งอัปเดต \`NameMapping\` ด้วย \`Variant\_Name\` และ \`Master\_UUID\`  
    \*   เมื่อผู้ใช้อนุมัติให้สร้าง Record ใหม่ ระบบจะนำเข้าข้อมูลนั้นสู่ \`Database\`

\#\# 3\. การใช้ประโยชน์จากฟังก์ชันที่มีอยู่และฟังก์ชันใหม่ที่จำเป็น

\#\#\# 3.1. ฟังก์ชันที่มีอยู่

\*   \`Utils\_Common.gs\`:   
    \*   \`normalizeText\`: ใช้ในการทำความสะอาดข้อความเบื้องต้น  
    \*   \`createBasicSmartKey\`: ใช้ในการสร้าง Key สำหรับการเปรียบเทียบชื่อเบื้องต้น  
\*   \`Service\_AutoPilot.gs\`:   
    \*   \`processAIIndexing\_Batch\`: ใช้ในการส่งชื่อให้ AI (Gemini) วิเคราะห์และสร้าง \`Normalized\_Keywords\`  
    \*   \`callGeminiThinking\_JSON\`: ฟังก์ชันหลักในการเรียกใช้ Gemini API  
\*   \`Service\_GeoAddr.gs\`:   
    \*   \`updateGeoData\_SmartCache\`: ใช้ในการดึงพิกัดจาก Google Geocoding API (อาจใช้เป็นแหล่งพิกัดสำรองหาก SCG GPS ไม่มี)  
\*   \`Service\_Master.gs\`:   
    \*   \`generateUUID\`: ใช้ในการสร้าง UUID  
    \*   \`getRealLastRow\_\`: ใช้ในการหาแถวสุดท้ายที่มีข้อมูลจริง  
\*   \`Service\_SchemaValidator.gs\`:   
    \*   \`validateSheet\_\`: ใช้ในการตรวจสอบโครงสร้างชีต (ต้องอัปเดต Schema ให้รองรับคอลัมน์ใหม่)

\#\#\# 3.2. ฟังก์ชันใหม่ที่จำเป็น

\*   \`generateCanonicalName(originalName)\`: สร้าง \`Canonical\_Name\` จากชื่อต้นฉบับ (อาจปรับปรุงจาก \`createBasicSmartKey\`)  
\*   \`generateNameFingerprint(canonicalName)\`: สร้าง \`Name\_FP\` จาก \`Canonical\_Name\`  
\*   \`generateCanonicalAddress(originalAddress)\`: สร้าง \`Canonical\_Address\` จากที่อยู่ต้นฉบับ  
\*   \`generateAddressFingerprint(canonicalAddress)\`: สร้าง \`Addr\_FP\` จาก \`Canonical\_Address\`  
\*   \`normalizeLatLng(latitude, longitude, decimalPlaces)\`: Normalize พิกัดให้มีทศนิยมเท่ากัน  
\*   \`generateGeoHash(latitude, longitude, precision)\`: สร้าง \`GeoHash\` จากพิกัด  
\*   \`processSCGDataToDatabase()\`: ฟังก์ชันหลักในการรันกระบวนการ ETL/Cleaning สำหรับข้อมูลจาก \`SCGนครหลวงJWDภูมิภาค\`  
\*   \`detectDuplicates(record)\`: ฟังก์ชันสำหรับตรวจจับข้อมูลซ้ำซ้อน (ชื่อ, ที่อยู่, พิกัด) และส่งเข้า \`DQ\_Review\_Queue\` หรือ \`GPS\_Queue\`  
\*   \`calculateQualityScore(record)\`: ฟังก์ชันสำหรับคำนวณ \`Quality\_Score\` ของแต่ละ Record  
\*   \`processDQReviewQueue()\`: ฟังก์ชันสำหรับประมวลผลรายการใน \`DQ\_Review\_Queue\` หลังจากผู้ใช้ตรวจสอบแล้ว

\#\# 4\. การจัดการปัญหา 8 ข้อโดยละเอียด

\#\#\# ปัญหาที่ 1: บุคคลคนเดียวกันแต่ชื่อเขียนไม่เหมือนกัน (เช่น "บริษัท กขค จำกัด" กับ "กขค จำกัด (มหาชน)")

\*   \*\*แนวทาง\*\*: ใช้ \`Canonical\_Name\` และ \`Name\_FP\` ในชีต \`Database\` เพื่อรวมชื่อที่คล้ายกัน. ใช้ AI (Gemini) ใน \`Service\_AutoPilot.gs\` เพื่อสร้าง \`Normalized\_Keywords\` ที่ช่วยในการจับคู่ชื่อที่ซับซ้อน. ชีต \`NameMapping\` จะทำหน้าที่เป็นตารางอ้างอิงสำหรับชื่อที่แตกต่างกันกับ \`Master\_UUID\`.  
\*   \*\*กระบวนการ\*\*: เมื่อมี Record ใหม่เข้ามา ระบบจะสร้าง \`Canonical\_Name\` และ \`Name\_FP\`. หาก \`Name\_FP\` หรือ \`Normalized\_Keywords\` ใกล้เคียงกับ Record ที่มีอยู่ ระบบจะตรวจสอบ \`NameMapping\`. หากยังไม่พบการจับคู่ที่ชัดเจน หรือมีความไม่แน่นอนสูง จะส่งเข้า \`DQ\_Review\_Queue\` เพื่อให้มนุษย์ตรวจสอบและสร้าง \`NameMapping\` ใหม่ หรือ Merge Record.

\#\#\# ปัญหาที่ 2: บุคคลคนเดียวกันแต่ที่อยู่เขียนไม่เหมือนกัน (เช่น "123 ถ.สุขุมวิท" กับ "123 สุขุมวิท")

\*   \*\*แนวทาง\*\*: ใช้ \`Canonical\_Address\` และ \`Addr\_FP\` ในชีต \`Database\` เพื่อรวมที่อยู่ที่คล้ายกัน. การใช้ Geocoding และ \`Geo\_Hash\` จะช่วยให้การเปรียบเทียบที่อยู่มีความแม่นยำสูงขึ้น เนื่องจากพิกัดมีความเป็นมาตรฐานมากกว่าข้อความที่อยู่.  
\*   \*\*กระบวนการ\*\*: เมื่อมี Record ใหม่เข้ามา ระบบจะสร้าง \`Canonical\_Address\`, \`Addr\_FP\`, \`Lat\_Norm\`, \`Long\_Norm\`, และ \`Geo\_Hash\`. หาก \`Addr\_FP\` หรือ \`Geo\_Hash\` ใกล้เคียงกับ Record ที่มีอยู่ ระบบจะพิจารณาว่าเป็นที่อยู่เดียวกัน. หากมีความไม่แน่นอนสูง จะส่งเข้า \`DQ\_Review\_Queue\`.

\#\#\# ปัญหาที่ 3: บุคคลคนเดียวกันแต่เลข Lat Long คนละที่ (เช่น ปักหมุดผิด)

\*   \*\*แนวทาง\*\*: ใช้ \`GPS\_Queue\` เป็นกลไกหลักในการตรวจสอบและอนุมัติพิกัด. \`Coord\_Source\` และ \`Coord\_Confidence\` จะช่วยในการตัดสินใจ.  
\*   \*\*กระบวนการ\*\*: เมื่อข้อมูลจาก \`SCGนครหลวงJWDภูมิภาค\` เข้ามา หากพบว่า \`Lat\_Actual\`, \`Long\_Actual\` แตกต่างจากพิกัดที่มีอยู่ใน \`Database\` สำหรับ Record เดียวกันเกินเกณฑ์ที่กำหนด ระบบจะส่ง Record นั้นเข้า \`GPS\_Queue\` พร้อมข้อมูลพิกัดเดิมและพิกัดใหม่. ผู้ใช้จะตรวจสอบและอนุมัติพิกัดที่ถูกต้อง ซึ่งจะถูกนำไปอัปเดตใน \`Database\`.

\#\#\# ปัญหาที่ 4: บุคคลเดียวกันแต่ชื่อเขียนไม่เหมือนกัน หลายบริษัทส่งของก็พิมชื่อต่างกัน

\*   \*\*แนวทาง\*\*: เหมือนกับปัญหาที่ 1\. \`Canonical\_Name\`, \`Name\_FP\`, \`Normalized\_Keywords\` และ \`NameMapping\` เป็นเครื่องมือหลักในการจัดการปัญหานี้.  
\*   \*\*กระบวนการ\*\*: ระบบจะพยายาม Normalize ชื่อและใช้ \`NameMapping\` เพื่อจับคู่. หากไม่สามารถจับคู่ได้อัตโนมัติ จะส่งเข้า \`DQ\_Review\_Queue\` เพื่อให้มนุษย์สร้าง \`NameMapping\` ใหม่.

\#\#\# ปัญหาที่ 5: เรื่องบุคคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน

\*   \*\*แนวทาง\*\*: ใช้ \`Geo\_Hash\` และ \`Addr\_FP\` เพื่อระบุสถานที่เดียวกัน แต่ใช้ \`Name\_FP\` และ \`Canonical\_Name\` ที่แตกต่างกันเพื่อยืนยันว่าเป็นคนละบุคคล/องค์กร.  
\*   \*\*กระบวนการ\*\*: ระบบจะตรวจจับ Record ที่มี \`Geo\_Hash\` หรือ \`Addr\_FP\` เหมือนกัน แต่ \`Name\_FP\` ต่างกัน. กรณีนี้จะถูกส่งเข้า \`DQ\_Review\_Queue\` ด้วย \`Issue\_Type: Conflicting\_Name\_Same\_Coord\` เพื่อให้ผู้ใช้ตรวจสอบว่าควรแยกเป็น 2 Record หรือมีการสะกดชื่อผิดพลาดที่ต้องแก้ไข.

\#\#\# ปัญหาที่ 6: เรื่องบุคคลชื่อเดียวกัน แต่ชื่อสถานที่อยู่ไม่เหมือนกัน

\*   \*\*แนวทาง\*\*: ใช้ \`Canonical\_Name\` ที่เหมือนกัน แต่ \`Canonical\_Address\`, \`Addr\_FP\`, และ \`Geo\_Hash\` ที่แตกต่างกันเพื่อระบุว่าเป็นคนละสถานที่ (เช่น คนละสาขา).  
\*   \*\*กระบวนการ\*\*: ระบบจะตรวจจับ Record ที่มี \`Canonical\_Name\` เหมือนกัน แต่ \`Geo\_Hash\` ต่างกัน. หาก \`Quality\_Score\` ของ Record ทั้งสองสูงพอ ระบบจะถือว่าเป็นคนละสถานที่. หาก \`Quality\_Score\` ต่ำ หรือมีความไม่แน่นอนสูง จะส่งเข้า \`DQ\_Review\_Queue\` เพื่อให้มนุษย์ตรวจสอบว่าควรเป็น Record แยกกัน หรือควรมีการแก้ไขที่อยู่.

\#\#\# ปัญหาที่ 7: เรื่องบุคคลชื่อเดียวกัน แต่เลข Lat Long คนละที่ ไม่เหมือนกัน

\*   \*\*แนวทาง\*\*: เหมือนกับปัญหาที่ 3\. \`GPS\_Queue\` และ \`Coord\_Confidence\` เป็นเครื่องมือหลัก.  
\*   \*\*กระบวนการ\*\*: หาก \`Canonical\_Name\` เหมือนกัน แต่พิกัด (\`Lat\_Actual\`, \`Long\_Actual\`) แตกต่างกันอย่างมีนัยสำคัญ ระบบจะส่งเข้า \`GPS\_Queue\` เพื่อให้ผู้ใช้ตรวจสอบ. ผู้ใช้จะตัดสินใจว่าพิกัดใดถูกต้อง หรือหากเป็นคนละสาขา ระบบอาจแนะนำให้สร้าง Record ใหม่สำหรับสาขาที่สอง (ถ้ายังไม่มี).

\#\#\# ปัญหาที่ 8: เรื่องบุคคล คนละชื่อ แต่ เลข Lat Long ที่เดียวกัน

\*   \*\*แนวทาง\*\*: เหมือนกับปัญหาที่ 5\. ใช้ \`Geo\_Hash\` และ \`Addr\_FP\` เพื่อระบุสถานที่เดียวกัน แต่ใช้ \`Name\_FP\` และ \`Canonical\_Name\` ที่แตกต่างกันเพื่อยืนยันว่าเป็นคนละบุคคล/องค์กร.  
\*   \*\*กระบวนการ\*\*: ระบบจะตรวจจับ Record ที่มี \`Geo\_Hash\` หรือ \`Addr\_FP\` เหมือนกัน แต่ \`Name\_FP\` ต่างกัน. กรณีนี้จะถูกส่งเข้า \`DQ\_Review\_Queue\` ด้วย \`Issue\_Type: Conflicting\_Name\_Same\_Coord\` เพื่อให้ผู้ใช้ตรวจสอบว่าควรแยกเป็น 2 Record หรือมีการสะกดชื่อผิดพลาดที่ต้องแก้ไข.

\---

\# สรุปโครงสร้าง Google Sheets ที่ต้องมี

จากการวิเคราะห์โค้ดใน Repository \`lmds\_5\` โดยเฉพาะไฟล์ \`Config.gs\` และ \`Service\_SchemaValidator.gs\` รวมถึงความต้องการในการสร้างระบบฐานข้อมูล Master Data ที่แข็งแกร่งและแก้ไขปัญหาคุณภาพข้อมูล 8 ข้อ ผมได้สรุปโครงสร้าง Google Sheets ที่จำเป็น พร้อมชื่อชีตและคอลัมน์ทั้งหมดที่ควรมี ดังนี้:

\#\# 1\. ชีต \`Config\` (ไม่มีใน Google Sheet แต่เป็นไฟล์ \`.gs\`)

ไฟล์ \`Config.gs\` กำหนดค่าคงที่และชื่อชีตต่างๆ ที่ระบบใช้งาน ซึ่งเป็นส่วนสำคัญในการตั้งค่าระบบ

\#\# 2\. ชีต \`Database\` (Master Data)

ชีตนี้เป็นหัวใจหลักของระบบ Master Data ใช้เก็บข้อมูลลูกค้า/สถานที่ที่ผ่านการทำความสะอาดและ Normalize แล้ว เพื่อเป็นแหล่งข้อมูลอ้างอิงที่เชื่อถือได้ (Single Source of Truth) คอลัมน์ที่แนะนำจะครอบคลุมทั้งข้อมูลเดิมและข้อมูลใหม่ที่จำเป็นสำหรับการจัดการคุณภาพข้อมูล:

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| 1    | \`UUID\`               | String      | รหัสที่ไม่ซ้ำกันสำหรับแต่ละ Record (Primary Key) | ปัญหา 1-8: ใช้ระบุ Record ที่ไม่ซ้ำกัน แม้ข้อมูลอื่นจะคล้ายกันหรือเปลี่ยนแปลงไป |  
| 2    | \`Original\_Name\`      | String      | ชื่อลูกค้า/สถานที่ต้นฉบับที่ได้รับมา | ปัญหา 1, 4, 6, 8: เก็บข้อมูลดิบเพื่อการอ้างอิงและตรวจสอบ |  
| 3    | \`Canonical\_Name\`     | String      | ชื่อลูกค้า/สถานที่ที่ถูกทำให้เป็นมาตรฐาน (เช่น ลบคำว่า "บริษัท", "จำกัด") | ปัญหา 1, 4, 6, 7, 8: ใช้ในการเปรียบเทียบและจัดกลุ่มชื่อที่คล้ายกัน |  
| 4    | \`Name\_FP\`            | String      | Fingerprint ของ \`Canonical\_Name\` (Hash ค่า) | ปัญหา 1, 4, 6, 7, 8: ใช้ในการค้นหาชื่อที่ซ้ำซ้อนหรือคล้ายกันอย่างรวดเร็ว |  
| 5    | \`Normalized\_Keywords\`| String      | Keywords ที่ได้จากการวิเคราะห์ของ AI (Gemini) เพื่อช่วยในการค้นหาและจับคู่ | ปัญหา 1, 4, 6, 7, 8: เพิ่มความสามารถในการค้นหาและจับคู่ชื่อที่ซับซ้อน |  
| 6    | \`Original\_Address\`   | String      | ที่อยู่ต้นฉบับที่ได้รับมา | ปัญหา 2, 5: เก็บข้อมูลดิบเพื่อการอ้างอิงและตรวจสอบ |  
| 7    | \`Canonical\_Address\`  | String      | ที่อยู่ที่ถูกทำให้เป็นมาตรฐาน (เช่น ลบคำว่า "ถนน", "ซอย", "แขวง", "เขต") | ปัญหา 2, 5, 6: ใช้ในการเปรียบเทียบและจัดกลุ่มที่อยู่ที่คล้ายกัน |  
| 8    | \`Addr\_FP\`            | String      | Fingerprint ของ \`Canonical\_Address\` (Hash ค่า) | ปัญหา 2, 5, 6: ใช้ในการค้นหาที่อยู่ที่ซ้ำซ้อนหรือคล้ายกันอย่างรวดเร็ว |  
| 9    | \`Lat\_Actual\`         | Number      | ละติจูดของสถานที่ (จากแหล่งที่เชื่อถือได้ เช่น GPS คนขับ) | ปัญหา 3, 7, 8: พิกัดหลักที่ใช้ในการอ้างอิง |  
| 10   | \`Long\_Actual\`        | Number      | ลองจิจูดของสถานที่ (จากแหล่งที่เชื่อถือได้ เช่น GPS คนขับ) | ปัญหา 3, 7, 8: พิกัดหลักที่ใช้ในการอ้างอิง |  
| 11   | \`Lat\_Norm\`           | Number      | ละติจูดที่ถูก Normalize (เช่น ทศนิยม 6 ตำแหน่ง) | ปัญหา 3, 7, 8: ใช้ในการเปรียบเทียบพิกัดที่แม่นยำ |  
| 12   | \`Long\_Norm\`          | Number      | ลองจิจูดที่ถูก Normalize (เช่น ทศนิยม 6 ตำแหน่ง) | ปัญหา 3, 7, 8: ใช้ในการเปรียบเทียบพิกัดที่แม่นยำ |  
| 13   | \`Geo\_Hash\`           | String      | GeoHash ของพิกัด \`Lat\_Norm\`, \`Long\_Norm\` (ความยาว 8-9 ตัวอักษร) | ปัญหา 3, 7, 8: ใช้ในการค้นหาพื้นที่ใกล้เคียงและพิกัดซ้ำซ้อน |  
| 14   | \`Coord\_Source\`       | String      | แหล่งที่มาของพิกัด (เช่น \`SCG\_GPS\`, \`Google\_Geocode\`, \`Manual\`) | ปัญหา 3, 7: ระบุความน่าเชื่อถือของพิกัด |  
| 15   | \`Coord\_Confidence\`   | Number      | คะแนนความน่าเชื่อถือของพิกัด (0-100) | ปัญหา 3, 7: ใช้ในการจัดลำดับความสำคัญของพิกัด |  
| 16   | \`Record\_Status\`      | String      | สถานะของ Record (\`Active\`, \`Inactive\`, \`Merged\`) | ปัญหา 1-8: จัดการ Lifecycle ของข้อมูล |  
| 17   | \`Quality\_Score\`      | Number      | คะแนนคุณภาพโดยรวมของ Record (คำนวณจากความสมบูรณ์ของข้อมูล) | ปัญหา 1-8: ใช้ในการจัดลำดับความสำคัญของการทำความสะอาดข้อมูล |  
| 18   | \`Last\_Updated\`       | Date/Time   | วันที่และเวลาที่ Record ถูกอัปเดตล่าสุด | ปัญหา 1-8: ติดตามการเปลี่ยนแปลงของข้อมูล |  
| 19   | \`Created\_Date\`       | Date/Time   | วันที่และเวลาที่ Record ถูกสร้างขึ้น | ปัญหา 1-8: ติดตามการสร้างข้อมูล |  
| 20   | \`ShipToName\`         | String      | ชื่อผู้รับสินค้า (จาก SCG API) |  
| 21   | \`Address\`            | String      | ที่อยู่ผู้รับสินค้า (จาก SCG API) |  
| 22   | \`Province\`           | String      | จังหวัด |  
| 23   | \`District\`           | String      | อำเภอ/เขต |  
| 24   | \`SubDistrict\`        | String      | ตำบล/แขวง |  
| 25   | \`PostalCode\`         | String      | รหัสไปรษณีย์ |  
| 26   | \`Tel\`                | String      | เบอร์โทรศัพท์ |  
| 27   | \`ContactPerson\`      | String      | ผู้ติดต่อ |  
| 28   | \`CustomerType\`       | String      | ประเภทลูกค้า |  
| 29   | \`SalesRegion\`        | String      | ภาคการขาย |  
| 30   | \`SalesArea\`          | String      | พื้นที่การขาย |  
| 31   | \`SalesPerson\`        | String      | พนักงานขาย |  
| 32   | \`Remark\`             | String      | หมายเหตุ |

\#\# 3\. ชีต \`NameMapping\`

ชีตนี้ใช้สำหรับบันทึกการจับคู่ชื่อที่แตกต่างกันให้เป็นชื่อหลัก (Master Name) ในชีต \`Database\` เพื่อแก้ไขปัญหาชื่อซ้ำซ้อนและการสะกดที่ไม่สอดคล้องกัน

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| 1    | \`Variant\_Name\`       | String      | ชื่อที่เขียนแตกต่างกัน (เช่น "กขค จำกัด (มหาชน)") | ปัญหา 1, 4: ชื่อที่ระบบพบและต้องการจับคู่ |  
| 2    | \`Master\_UUID\`        | String      | \`UUID\` ของชื่อหลักในชีต \`Database\` ที่ \`Variant\_Name\` นี้ควรจะจับคู่ด้วย | ปัญหา 1, 4: เชื่อมโยงชื่อที่แตกต่างกันเข้ากับ Master Record |  
| 3    | \`Master\_Name\`        | String      | \`Canonical\_Name\` ของ Master Record (เพื่อให้อ่านง่าย) | ปัญหา 1, 4: แสดงชื่อหลักที่จับคู่ด้วย |  
| 4    | \`Confidence\`         | Number      | คะแนนความมั่นใจในการจับคู่ (0-100) | ปัญหา 1, 4: ระบุความน่าเชื่อถือของการจับคู่ |  
| 5    | \`Source\`             | String      | แหล่งที่มาของการจับคู่ (เช่น \`AI\`, \`Manual\`, \`Rule\`) | ปัญหา 1, 4: ระบุว่าใครเป็นคนสร้างการจับคู่ |  
| 6    | \`Last\_Updated\`       | Date/Time   | วันที่และเวลาที่การจับคู่ถูกอัปเดตล่าสุด | ปัญหา 1, 4: ติดตามการเปลี่ยนแปลง |

\#\# 4\. ชีต \`DQ\_Review\_Queue\` (Data Quality Review Queue)

ชีตใหม่นี้จะใช้สำหรับเก็บ Record ที่ระบบตรวจพบว่ามีปัญหาคุณภาพข้อมูลที่ AI ไม่สามารถแก้ไขได้ หรือต้องการการตรวจสอบจากมนุษย์ (Human-in-the-Loop) ก่อนที่จะนำเข้าสู่ \`Database\` หรือ \`NameMapping\`

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| 1    | \`Queue\_ID\`           | String      | รหัสสำหรับรายการใน Queue | ปัญหา 1-8: ระบุรายการใน Queue |  
| 2    | \`Issue\_Type\`         | String      | ประเภทของปัญหา (เช่น \`Duplicate\_Name\`, \`Conflicting\_Coord\`, \`AI\_Uncertain\`) | ปัญหา 1-8: ระบุประเภทปัญหาเพื่อการจัดการ |  
| 3    | \`Original\_Data\`      | String (JSON)| ข้อมูลต้นฉบับที่ทำให้เกิดปัญหา (อาจเป็น JSON ของ Row) | ปัญหา 1-8: ข้อมูลดิบเพื่อการตรวจสอบ |  
| 4    | \`Proposed\_Action\`    | String      | การดำเนินการที่ระบบแนะนำ (เช่น \`Merge\_to\_UUID\_X\`, \`Create\_New\_Record\`) | ปัญหา 1-8: ระบบเสนอแนวทางแก้ไข |  
| 5    | \`Reviewer\_Comment\`   | String      | ช่องสำหรับผู้ตรวจสอบใส่ความคิดเห็น | ปัญหา 1-8: บันทึกการตัดสินใจของมนุษย์ |  
| 6    | \`Approved\`           | Boolean     | ผู้ตรวจสอบอนุมัติ (ติ๊กช่อง) | ปัญหา 1-8: สถานะการอนุมัติ |  
| 7    | \`Rejected\`           | Boolean     | ผู้ตรวจสอบปฏิเสธ (ติ๊กช่อง) | ปัญหา 1-8: สถานะการปฏิเสธ |  
| 8    | \`Action\_Taken\`       | String      | การดำเนินการที่เกิดขึ้นจริงหลังจากอนุมัติ | ปัญหา 1-8: บันทึกการดำเนินการ |  
| 9    | \`Timestamp\`          | Date/Time   | วันที่และเวลาที่เข้า Queue | ปัญหา 1-8: ติดตามเวลา |

\#\# 5\. ชีต \`GPS\_Queue\`

ชีตนี้ใช้สำหรับจัดการพิกัดที่ขัดแย้งกัน หรือพิกัดใหม่ที่ต้องการการตรวจสอบจากมนุษย์ก่อนที่จะอัปเดตใน \`Database\`

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย | การใช้งานเพื่อแก้ปัญหา |  
| :--- | :------------------- | :---------- | :------- | :--------------------- |  
| 1    | \`UUID\`               | String      | \`UUID\` ของ Record ใน \`Database\` ที่มีปัญหาพิกัด |  
| 2    | \`Master\_Name\`        | String      | \`Canonical\_Name\` ของ Record ใน \`Database\` (เพื่อให้อ่านง่าย) |  
| 3    | \`Master\_Address\`     | String      | \`Canonical\_Address\` ของ Record ใน \`Database\` (เพื่อให้อ่านง่าย) |  
| 4    | \`Original\_Lat\`       | Number      | ละติจูดเดิมใน \`Database\` |  
| 5    | \`Original\_Long\`      | Number      | ลองจิจูดเดิมใน \`Database\` |  
| 6    | \`New\_Lat\`            | Number      | ละติจูดที่เสนอใหม่ (จาก SCG GPS) |  
| 7    | \`New\_Long\`           | Number      | ลองจิจูดที่เสนอใหม่ (จาก SCG GPS) |  
| 8    | \`Source\_New\_Coord\`   | String      | แหล่งที่มาของพิกัดใหม่ (เช่น \`SCG\_GPS\`) |  
| 9    | \`Distance\_KM\`        | Number      | ระยะห่างระหว่างพิกัดเดิมกับพิกัดใหม่ (กิโลเมตร) |  
| 10   | \`Approve\`            | Boolean     | ผู้ตรวจสอบอนุมัติ (ติ๊กช่อง) |  
| 11   | \`Reject\`             | Boolean     | ผู้ตรวจสอบปฏิเสธ (ติ๊กช่อง) |  
| 12   | \`Timestamp\`          | Date/Time   | วันที่และเวลาที่เข้า Queue |

\#\# 6\. ชีต \`SCGนครหลวงJWDภูมิภาค\`

ชีตนี้เป็นแหล่งข้อมูลดิบจาก GPS คนขับ ซึ่งจะถูกนำมาประมวลผลผ่านกระบวนการ ETL/Cleaning ก่อนนำเข้าสู่ \`Database\`

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย |  
| :--- | :------------------- | :---------- | :------- |  
| 1    | \`ShipmentNo\`         | String      | เลขที่ Shipment |  
| 2    | \`ShipToName\`         | String      | ชื่อผู้รับสินค้า |  
| 3    | \`ShipToAddress\`      | String      | ที่อยู่ผู้รับสินค้า |  
| 4    | \`Lat\`                | Number      | ละติจูดจาก GPS คนขับ |  
| 5    | \`Long\`               | Number      | ลองจิจูดจาก GPS คนขับ |  
| 6    | \`Timestamp\`          | Date/Time   | วันที่และเวลาที่บันทึก GPS |  
| ...  | (คอลัมน์อื่นๆ ที่มีอยู่เดิม) | ...         | ...      |

\#\# 7\. ชีต \`Data\`

ชีตนี้ใช้สำหรับเก็บข้อมูล Shipment ที่ดึงมาจาก SCG API และมีการจับคู่ข้อมูลเบื้องต้นกับ \`Database\` และ \`ข้อมูลพนักงาน\`

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย |  
| :--- | :------------------- | :---------- | :------- |  
| 1    | \`ID\_งานประจำวัน\`     | String      | ID งานประจำวัน |  
| 2    | \`วันที่\`              | Date        | วันที่ |  
| 3    | \`เวลา\`               | Time        | เวลา |  
| 4    | \`ShipmentNo\`         | String      | เลขที่ Shipment |  
| 5    | \`TruckLicense\`       | String      | ทะเบียนรถ |  
| 6    | \`SoldToName\`         | String      | ชื่อผู้ส่งสินค้า |  
| 7    | \`SoldToAddress\`      | String      | ที่อยู่ผู้ส่งสินค้า |  
| 8    | \`ShipToName\`         | String      | ชื่อผู้รับสินค้า |  
| 9    | \`ShipToAddress\`      | String      | ที่อยู่ผู้รับสินค้า |  
| 10   | \`InvoiceNo\`          | String      | เลขที่ใบแจ้งหนี้ |  
| 11   | \`Product\`            | String      | สินค้า |  
| 12   | \`Quantity\`           | Number      | จำนวน |  
| 13   | \`Unit\`               | String      | หน่วย |  
| 14   | \`Weight\`             | Number      | น้ำหนัก |  
| 15   | \`Volume\`             | Number      | ปริมาตร |  
| 16   | \`COD\`                | Number      | เก็บเงินปลายทาง |  
| 17   | \`Status\`             | String      | สถานะ Shipment |  
| 18   | \`DeliveryDate\`       | Date        | วันที่จัดส่ง |  
| 19   | \`DeliveryTime\`       | Time        | เวลาจัดส่ง |  
| 20   | \`POD\_Image\`          | String      | รูปภาพ POD |  
| 21   | \`LatLong\_Actual\`     | String      | พิกัดจริง (จาก Database) |  
| 22   | \`Employee\_Email\`     | String      | อีเมลพนักงาน (จาก ข้อมูลพนักงาน) |  
| ...  | (คอลัมน์อื่นๆ ที่มีอยู่เดิม) | ...         | ...      |

\#\# 8\. ชีต \`Input\`

ชีตนี้ใช้สำหรับรับข้อมูลนำเข้าจากผู้ดูแลระบบ เช่น Cookie สำหรับ SCG API และ Shipment Numbers

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย |  
| :--- | :------------------- | :---------- | :------- |  
| B1   | \`Cookie\`             | String      | Cookie สำหรับการเรียกใช้ SCG API |  
| A4↓  | \`Shipment Numbers\`   | String      | รายการ Shipment Numbers ที่ต้องการโหลดข้อมูล |

\#\# 9\. ชีต \`สรุป\_เจ้าของสินค้า\`

ชีตนี้ใช้สำหรับสรุปข้อมูลตามเจ้าของสินค้า

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย |  
| :--- | :------------------- | :---------- | :------- |  
| 1    | \`เจ้าของสินค้า\`       | String      | ชื่อเจ้าของสินค้า |  
| 2    | \`จำนวน Shipment\`      | Number      | จำนวน Shipment ทั้งหมด |  
| 3    | \`จำนวน Invoice\`       | Number      | จำนวน Invoice ทั้งหมด |  
| 4    | \`น้ำหนักรวม\`         | Number      | น้ำหนักรวม |  
| 5    | \`ปริมาตรรวม\`         | Number      | ปริมาตรรวม |  
| 6    | \`COD รวม\`            | Number      | ยอด COD รวม |  
| 7    | \`วันที่สรุป\`         | Date/Time   | วันที่และเวลาที่สรุป |

\#\# 10\. ชีต \`สรุป\_Shipment\`

ชีตนี้ใช้สำหรับสรุปข้อมูลตาม Shipment

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย |  
| :--- | :------------------- | :---------- | :------- |  
| 1    | \`Key\`                | String      | Key สำหรับ Shipment (ShipmentNo\_TruckLicense) |  
| 2    | \`ShipmentNo\`         | String      | เลขที่ Shipment |  
| 3    | \`Truck\`              | String      | ทะเบียนรถ |  
| 4    | \`Status\`             | String      | สถานะ Shipment |  
| 5    | \`จำนวน Invoice ทั้งหมด\` | Number      | จำนวน Invoice ทั้งหมด |  
| 6    | \`จำนวน E-POD\`        | Number      | จำนวน E-POD |  
| 7    | \`วันที่สรุป\`         | Date/Time   | วันที่และเวลาที่สรุป |

\#\# 11\. ชีต \`PostalRef\`

ชีตนี้ใช้สำหรับอ้างอิงข้อมูลรหัสไปรษณีย์ (อาจเป็นข้อมูลที่ใช้ในการตรวจสอบความถูกต้องของที่อยู่)

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย |  
| :--- | :------------------- | :---------- | :------- |  
| 1    | \`PostalCode\`         | String      | รหัสไปรษณีย์ |  
| 2    | \`SubDistrict\`        | String      | ตำบล/แขวง |  
| 3    | \`District\`           | String      | อำเภอ/เขต |  
| 4    | \`Province\`           | String      | จังหวัด |

\#\# 12\. ชีต \`ข้อมูลพนักงาน\`

ชีตนี้ใช้สำหรับเก็บข้อมูลพนักงาน เพื่อนำอีเมลมาจับคู่กับ Shipment

| ลำดับ | ชื่อคอลัมน์ (Header) | ประเภทข้อมูล | คำอธิบาย |  
| :--- | :------------------- | :---------- | :------- |  
| 1    | \`EmployeeID\`         | String      | รหัสพนักงาน |  
| 2    | \`EmployeeName\`       | String      | ชื่อพนักงาน |  
| 3    | \`EmployeeEmail\`      | String      | อีเมลพนักงาน |  
| 4    | \`SalesRegion\`        | String      | ภาคการขาย |  
| 5    | \`SalesArea\`          | String      | พื้นที่การขาย |

\#\# 13\. ชีต \`Archive\_DB\`

ชีตนี้ใช้สำหรับเก็บ Record ที่มีสถานะ \`Inactive\` หรือ \`Merged\` จากชีต \`Database\` เพื่อรักษาประวัติข้อมูลและลดขนาดของชีต \`Database\` หลัก โครงสร้างคอลัมน์จะเหมือนกับชีต \`Database\`.

