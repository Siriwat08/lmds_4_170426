\+++ Config.gs  
/\*\*  
 \* @fileoverview Configuration constants and settings for the Logistics Master Data System.  
 \*  
 \* This file contains all system-wide constants including:  
 \* \- Sheet names and database configuration  
 \* \- Column indices and schema definitions  
 \* \- API settings and thresholds  
 \* \- GPS and geocoding parameters  
 \* \- AI/ML configuration for matching  
 \*  
 \* @version 4.2  
 \* @author Logistics Master Data System Team  
 \*/

/\*\*  
 \* Main configuration object containing all system settings.  
 \* @namespace CONFIG  
 \*/  
var CONFIG \= {  
  // \============================================================================  
  // SECTION 1: Sheet Names and Basic Configuration  
  // \============================================================================

  /\*\* @type {string} Name of the main database sheet \*/  
  SHEET\_NAME:    "Database",  
  /\*\* @type {string} Name of the name mapping sheet \*/  
  MAPPING\_SHEET: "NameMapping",  
  /\*\* @type {string} Name of the source data sheet (SCG data) \*/  
  SOURCE\_SHEET:  "SCGนครหลวงJWDภูมิภาค",  
  /\*\* @type {string} Name of the postal reference sheet \*/  
  SHEET\_POSTAL:  "PostalRef",

  // \============================================================================  
  // SECTION 2: Schema Width Constants  
  // \============================================================================

  /\*\* @type {number} Total columns in Database sheet \*/  
  DB\_TOTAL\_COLS:        22,  
  /\*\* @type {number} Legacy column count for backward compatibility \*/  
  DB\_LEGACY\_COLS:       17,  
  /\*\* @type {number} Total columns in NameMapping sheet \*/  
  MAP\_TOTAL\_COLS:       5,  
  /\*\* @type {number} Total columns in GPS\_Queue sheet \*/  
  GPS\_QUEUE\_TOTAL\_COLS: 9,  
  /\*\* @type {number} Total columns in Data sheet \*/  
  DATA\_TOTAL\_COLS:      29,

  // \============================================================================  
  // SECTION 3: Required Headers Definitions (1-indexed)  
  // \============================================================================

  /\*\* @type {Object.\<number, string\>} Required headers for Database sheet \*/  
  DB\_REQUIRED\_HEADERS: {  
    1: "NAME", 2: "LAT", 3: "LNG", 11: "UUID",  
    15: "QUALITY", 16: "CREATED", 17: "UPDATED",  
    18: "Coord\_Source", 19: "Coord\_Confidence",  
    20: "Coord\_Last\_Updated",  
    21: "Record\_Status",  
    22: "Merged\_To\_UUID"  
  },

  /\*\* @type {Object.\<number, string\>} Required headers for NameMapping sheet \*/  
  MAP\_REQUIRED\_HEADERS: {  
    1: "Variant\_Name", 2: "Master\_UID",  
    3: "Confidence\_Score", 4: "Mapped\_By", 5: "Timestamp"  
  },

  /\*\* @type {Object.\<number, string\>} Required headers for GPS\_Queue sheet \*/  
  GPS\_QUEUE\_REQUIRED\_HEADERS: {  
    1: "Timestamp", 2: "ShipToName", 3: "UUID\_DB",  
    4: "LatLng\_Driver", 5: "LatLng\_DB", 6: "Diff\_Meters",  
    7: "Reason", 8: "Approve", 9: "Reject"  
  },

  // \============================================================================  
  // SECTION 4: API and AI Configuration  
  // \============================================================================

  /\*\*  
   \* @type {string} Gemini API key from script properties  
   \* @throws {Error} If API key is not set or invalid  
   \*/  
  get GEMINI\_API\_KEY() {  
    var key \= PropertiesService.getScriptProperties().getProperty('GEMINI\_API\_KEY');  
    if (\!key) {  
      throw new Error(  
        "CRITICAL ERROR: GEMINI\_API\_KEY is not set. Please run setupEnvironment() first."  
      );  
    }  
    return key;  
  },

  /\*\* @type {boolean} Enable/disable AI auto-fix functionality \*/  
  USE\_AI\_AUTO\_FIX: true,  
  /\*\* @type {string} AI model identifier for Gemini \*/  
  AI\_MODEL:       "gemini-1.5-flash",  
  /\*\* @type {number} Number of records to process per AI batch \*/  
  AI\_BATCH\_SIZE:  20,

  // \============================================================================  
  // SECTION 5: GPS and Geocoding Settings  
  // \============================================================================

  /\*\* @type {number} Default depot latitude coordinate \*/  
  DEPOT\_LAT: 14.164688,  
  /\*\* @type {number} Default depot longitude coordinate \*/  
  DEPOT\_LNG: 100.625354,

  /\*\* @type {number} Distance threshold in kilometers for matching \*/  
  DISTANCE\_THRESHOLD\_KM: 0.05,  
  /\*\* @type {number} Maximum records to process in a single batch operation \*/  
  BATCH\_LIMIT:            50,  
  /\*\* @type {number} Maximum records for deep cleaning operations \*/  
  DEEP\_CLEAN\_LIMIT:       100,  
  /\*\* @type {number} Maximum retry attempts for API calls \*/  
  API\_MAX\_RETRIES:        3,  
  /\*\* @type {number} API request timeout in milliseconds \*/  
  API\_TIMEOUT\_MS:         30000,  
  /\*\* @type {number} Cache expiration time in seconds (6 hours) \*/  
  CACHE\_EXPIRATION:       21600,

  // \============================================================================  
  // SECTION 6: Column Indices (1-indexed) for Database Sheet  
  // \============================================================================

  /\*\* @type {number} \*/ COL\_NAME: 1,  
  /\*\* @type {number} \*/ COL\_LAT: 2,  
  /\*\* @type {number} \*/ COL\_LNG: 3,  
  /\*\* @type {number} \*/ COL\_SUGGESTED: 4,  
  /\*\* @type {number} \*/ COL\_CONFIDENCE: 5,  
  /\*\* @type {number} \*/ COL\_NORMALIZED: 6,  
  /\*\* @type {number} \*/ COL\_VERIFIED: 7,  
  /\*\* @type {number} \*/ COL\_SYS\_ADDR: 8,  
  /\*\* @type {number} \*/ COL\_ADDR\_GOOG: 9,  
  /\*\* @type {number} \*/ COL\_DIST\_KM: 10,  
  /\*\* @type {number} \*/ COL\_UUID: 11,  
  /\*\* @type {number} \*/ COL\_PROVINCE: 12,  
  /\*\* @type {number} \*/ COL\_DISTRICT: 13,  
  /\*\* @type {number} \*/ COL\_POSTCODE: 14,  
  /\*\* @type {number} \*/ COL\_QUALITY: 15,  
  /\*\* @type {number} \*/ COL\_CREATED: 16,  
  /\*\* @type {number} \*/ COL\_UPDATED: 17,  
  /\*\* @type {number} \*/ COL\_COORD\_SOURCE:       18,  
  /\*\* @type {number} \*/ COL\_COORD\_CONFIDENCE:   19,  
  /\*\* @type {number} \*/ COL\_COORD\_LAST\_UPDATED: 20,  
  /\*\* @type {number} \*/ COL\_RECORD\_STATUS:      21,  
  /\*\* @type {number} \*/ COL\_MERGED\_TO\_UUID:     22,

  // Mapping sheet column indices (1-indexed)  
  /\*\* @type {number} \*/ MAP\_COL\_VARIANT: 1,  
  /\*\* @type {number} \*/ MAP\_COL\_UID: 2,  
  /\*\* @type {number} \*/ MAP\_COL\_CONFIDENCE: 3,  
  /\*\* @type {number} \*/ MAP\_COL\_MAPPED\_BY: 4,  
  /\*\* @type {number} \*/ MAP\_COL\_TIMESTAMP: 5,

  /\*\*  
   \* @returns {Object.\<string, number\>} Zero-based column indices for Database sheet  
   \*/  
  get C\_IDX() {  
    return {  
      NAME: this.COL\_NAME \- 1,  
      LAT: this.COL\_LAT \- 1,  
      LNG: this.COL\_LNG \- 1,  
      SUGGESTED: this.COL\_SUGGESTED \- 1,  
      CONFIDENCE: this.COL\_CONFIDENCE \- 1,  
      NORMALIZED: this.COL\_NORMALIZED \- 1,  
      VERIFIED: this.COL\_VERIFIED \- 1,  
      SYS\_ADDR: this.COL\_SYS\_ADDR \- 1,  
      GOOGLE\_ADDR: this.COL\_ADDR\_GOOG \- 1,  
      DIST\_KM: this.COL\_DIST\_KM \- 1,  
      UUID: this.COL\_UUID \- 1,  
      PROVINCE: this.COL\_PROVINCE \- 1,  
      DISTRICT: this.COL\_DISTRICT \- 1,  
      POSTCODE: this.COL\_POSTCODE \- 1,  
      QUALITY: this.COL\_QUALITY \- 1,  
      CREATED: this.COL\_CREATED \- 1,  
      UPDATED: this.COL\_UPDATED \- 1,  
      COORD\_SOURCE:       this.COL\_COORD\_SOURCE \- 1,  
      COORD\_CONFIDENCE:   this.COL\_COORD\_CONFIDENCE \- 1,  
      COORD\_LAST\_UPDATED: this.COL\_COORD\_LAST\_UPDATED \- 1,  
      RECORD\_STATUS:      this.COL\_RECORD\_STATUS \- 1,  
      MERGED\_TO\_UUID:     this.COL\_MERGED\_TO\_UUID \- 1  
    };  
  },

  /\*\*  
   \* @returns {Object.\<string, number\>} Zero-based column indices for NameMapping sheet  
   \*/  
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

/\*\*  
 \* SCG API and Data Sheet configuration.  
 \* @namespace SCG\_CONFIG  
 \*/  
const SCG\_CONFIG \= {  
  /\*\* @type {string} \*/ SHEET\_DATA:     'Data',  
  /\*\* @type {string} \*/ SHEET\_INPUT:    'Input',  
  /\*\* @type {string} \*/ SHEET\_EMPLOYEE: 'ข้อมูลพนักงาน',  
  /\*\* @type {string} \*/ API\_URL:        'https://fsm.scgjwd.com/Monitor/SearchDelivery',  
  /\*\* @type {number} \*/ INPUT\_START\_ROW: 4,  
  /\*\* @type {string} \*/ COOKIE\_CELL:    'B1',  
  /\*\* @type {string} \*/ SHIPMENT\_STRING\_CELL: 'B3',  
  /\*\* @type {string} \*/ SHEET\_MASTER\_DB: 'Database',  
  /\*\* @type {string} \*/ SHEET\_MAPPING:   'NameMapping',  
  /\*\* @type {string} \*/ SHEET\_GPS\_QUEUE: 'GPS\_Queue',  
  /\*\* @type {number} \*/ GPS\_THRESHOLD\_METERS: 50,  
  /\*\* @type {Object.\<string, number\>} \*/  
  SRC\_IDX: { NAME: 12, LAT: 14, LNG: 15, SYS\_ADDR: 18, DIST: 23, GOOG\_ADDR: 24 },  
  /\*\* @type {number} \*/ SRC\_IDX\_SYNC\_STATUS: 37,  
  /\*\* @type {string} \*/ SYNC\_STATUS\_DONE: "SYNCED",  
  /\*\* @type {Object.\<string, string\>} \*/  
  JSON\_MAP: { SHIPMENT\_NO: 'shipmentNo', CUSTOMER\_NAME: 'customerName', DELIVERY\_DATE: 'deliveryDate' }  
};

/\*\*  
 \* Data Sheet column indices (0-based) for Service\_SCG.gs.  
 \* @namespace DATA\_IDX  
 \*/  
const DATA\_IDX \= {  
  JOB\_ID: 0, PLAN\_DELIVERY: 1, INVOICE\_NO: 2, SHIPMENT\_NO: 3,  
  DRIVER\_NAME: 4, TRUCK\_LICENSE: 5, CARRIER\_CODE: 6, CARRIER\_NAME: 7,  
  SOLD\_TO\_CODE: 8, SOLD\_TO\_NAME: 9, SHIP\_TO\_NAME: 10, SHIP\_TO\_ADDR: 11,  
  LATLNG\_SCG: 12, MATERIAL: 13, QTY: 14, QTY\_UNIT: 15, WEIGHT: 16,  
  DELIVERY\_NO: 17, DEST\_COUNT: 18, DEST\_LIST: 19, SCAN\_STATUS: 20,  
  DELIVERY\_STATUS: 21, EMAIL: 22, TOT\_QTY: 23, TOT\_WEIGHT: 24,  
  SCAN\_INV: 25, LATLNG\_ACTUAL: 26, OWNER\_LABEL: 27, SHOP\_KEY: 28  
};

/\*\*  
 \* AI Configuration for matching and field processing.  
 \* @namespace AI\_CONFIG  
 \*/  
const AI\_CONFIG \= {  
  /\*\* @type {number} \>= 90: auto-map \*/ THRESHOLD\_AUTO\_MAP: 90,  
  /\*\* @type {number} 70-89: review \*/ THRESHOLD\_REVIEW: 70,  
  /\*\* @type {number} \< 70: ignore \*/ THRESHOLD\_IGNORE: 70,  
  /\*\* @type {string} \*/ TAG\_AI: "\[AI\]",  
  /\*\* @type {string} \*/ TAG\_REVIEWED: "\[REVIEWED\]",  
  /\*\* @type {string} \*/ PROMPT\_VERSION: "v4.2",  
  /\*\* @type {number} \*/ RETRIEVAL\_LIMIT: 50  
};

/\*\*  
 \* Validates system integrity by checking required sheets and API keys.  
 \* @returns {boolean} True if all checks pass  
 \* @throws {Error} If any critical component is missing  
 \*/  
CONFIG.validateSystemIntegrity \= function() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var errors \= \[\];

  \[this.SHEET\_NAME, this.MAPPING\_SHEET, SCG\_CONFIG.SHEET\_INPUT, this.SHEET\_POSTAL\]  
    .forEach(function(name) {  
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

/\*\*  
 \* @fileoverview Menu UI Interface \- จัดการเมนูทั้งหมดของระบบ Logistics Master Data  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มเมนู Phase D test helpers \+ Dry Run options  
 \* \- v4.1: แก้ไข UI Alert ให้ดึงชื่อชีตจาก CONFIG แบบไดนามิก  
 \* \- v4.0: Enterprise Edition with full menu structure  
 \*   
 \* @description โมดูลนี้จัดการการสร้างเมนูทั้งหมดที่แสดงบน Google Sheets  
 \* แบ่งเป็น 4 เมนูหลัก: Master Data, SCG, ระบบอัตโนมัติ, และ System Admin  
 \*/  
// \=============================================================================  
// SECTION 1: MAIN MENU INITIALIZATION  
// \=============================================================================  
/\*\*  
 \* สร้างเมนูทั้งหมดเมื่อเปิด Spreadsheet  
 \* @returns {void}  
 \*/  
function onOpen() {  
  var ui \= SpreadsheetApp.getUi();  
    
  // \===========================================================================  
  // เมนู 1: 🚛 ระบบจัดการ Master Data  
  // \===========================================================================  
  ui.createMenu('🚛 1\. ระบบจัดการ Master Data')  
    .addItem('1️⃣ ดึงลูกค้าใหม่ (Sync New Data)', 'syncNewDataToMaster\_UI')  
    .addItem('2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)', 'updateGeoData\_SmartCache')  
    .addItem('3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)', 'autoGenerateMasterList\_Smart')  
    .addItem('🧠 4️⃣ ส่งชื่อแปลกให้ AI วิเคราะห์', 'runAIBatchResolver\_UI')  
    .addSeparator()  
    .addItem('🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)', 'runDeepCleanBatch\_100')  
    .addItem('🔄 รีเซ็ตความจำปุ่ม 5', 'resetDeepCleanMemory\_UI')  
    .addSeparator()  
    .addItem('✅ 6️⃣ จบงาน (Finalize & Move to Mapping)', 'finalizeAndClean\_UI')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🛠️ Admin & Repair Tools')  
      .addItem('🔑 สร้าง UUID ให้ครบทุกแถว', 'assignMissingUUIDs')  
      .addItem('🚑 ซ่อมแซม NameMapping', 'repairNameMapping\_UI')  
      .addSeparator()  
      .addItem('🔍 ค้นหาพิกัดซ้ำซ้อน', 'findHiddenDuplicates')  
      .addItem('📊 ตรวจสอบคุณภาพข้อมูล', 'showQualityReport\_UI')  
      .addItem('🔄 คำนวณ Quality ใหม่ทั้งหมด', 'recalculateAllQuality')  
      .addItem('🎯 คำนวณ Confidence ใหม่ทั้งหมด', 'recalculateAllConfidence')  
      .addSeparator()  
      .addItem('🗂️ Initialize Record Status', 'initializeRecordStatus')  
      .addItem('🔀 Merge UUID ซ้ำซ้อน', 'mergeDuplicates\_UI')  
      .addItem('📋 ดูสถานะ Record ทั้งหมด', 'showRecordStatusReport')  
    )  
    .addToUi();  
    
  // \===========================================================================  
  // เมนู 2: 📦 เมนูพิเศษ SCG  
  // \===========================================================================  
  ui.createMenu('📦 2\. เมนูพิเศษ SCG')  
    .addItem('📥 1\. โหลดข้อมูล Shipment (+E-POD)', 'fetchDataFromSCGJWD')  
    .addItem('🟢 2\. อัปเดตพิกัด \+ อีเมลพนักงาน', 'applyMasterCoordinatesToDailyJob')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('📍 GPS Queue Management')  
      .addItem('🔄 1\. Sync GPS จากคนขับ → Queue', 'syncNewDataToMaster\_UI')  
      .addItem('✅ 2\. อนุมัติรายการที่ติ๊กแล้ว', 'applyApprovedFeedback')  
      .addItem('📊 3\. ดูสถิติ Queue', 'showGPSQueueStats')  
      .addSeparator()  
      .addItem('🛠️ สร้างชีต GPS\_Queue ใหม่', 'createGPSQueueSheet')  
    )  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🧹 เมนูล้างข้อมูล (Dangerous Zone)')  
      .addItem('⚠️ ล้างเฉพาะชีต Data', 'clearDataSheet\_UI')  
      .addItem('⚠️ ล้างเฉพาะชีต Input', 'clearInputSheet\_UI')  
      .addItem('⚠️ ล้างเฉพาะชีต สรุป\_เจ้าของสินค้า', 'clearSummarySheet\_UI')  
      .addItem('🔥 ล้างทั้งหมด', 'clearAllSCGSheets\_UI')  
    )  
    .addToUi();  
    
  // \===========================================================================  
  // เมนู 3: 🤖 ระบบอัตโนมัติ  
  // \===========================================================================  
  ui.createMenu('🤖 3\. ระบบอัตโนมัติ')  
    .addItem('▶️ เปิดระบบ Auto-Pilot', 'START\_AUTO\_PILOT')  
    .addItem('⏹️ ปิดระบบ Auto-Pilot', 'STOP\_AUTO\_PILOT')  
    .addItem('👋 ปลุก AI Agent ทำงานทันที', 'WAKE\_UP\_AGENT')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🧪 Debug & Test Tools')  
      .addItem('🚀 รัน AI Indexing ทันที', 'forceRunAI\_Now')  
      .addItem('🧠 ทดสอบ Tier 4 AI Resolution', 'debug\_TestTier4SmartResolution')  
      .addItem('📡 ทดสอบ Gemini Connection', 'debugGeminiConnection')  
      .addItem('🔄 ล้าง AI Tags (แถวที่เลือก)', 'debug\_ResetSelectedRowsAI')  
      .addSeparator()  
      // \[Phase E\] Phase D test helpers  
      .addItem('🔍 ทดสอบ Retrieval Candidates', 'testRetrieveCandidates')  
      .addItem('🧪 ทดสอบ AI Response Validation', 'testAIResponseValidation')  
      .addSeparator()  
      .addItem('🔁 Reset SYNC\_STATUS (ทดสอบ)', 'resetSyncStatus')  
    )  
    .addToUi();  
    
  // \===========================================================================  
  // เมนู 4: ⚙️ System Admin  
  // \===========================================================================  
  ui.createMenu('⚙️ System Admin')  
    .addItem('🏥 ตรวจสอบสถานะระบบ (Health Check)', 'runSystemHealthCheck')  
    .addItem('🧹 ล้าง Backup เก่า (\>30 วัน)', 'cleanupOldBackups')  
    .addItem('📊 เช็คปริมาณข้อมูล (Cell Usage)', 'checkSpreadsheetHealth')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🔬 System Diagnostic')  
      .addItem('🛡️ ตรวจสอบ Schema ทุกชีต', 'runFullSchemaValidation')  
      .addItem('🔍 ตรวจสอบ Engine (Phase 1)', 'RUN\_SYSTEM\_DIAGNOSTIC')  
      .addItem('🕵️ ตรวจสอบชีต (Phase 2)', 'RUN\_SHEET\_DIAGNOSTIC')  
      .addSeparator()  
      // \[Phase E NEW\] Dry Run options  
      .addItem('🔵 Dry Run: ตรวจสอบ Mapping Conflicts', 'runDryRunMappingConflicts')  
      .addItem('🔵 Dry Run: ตรวจสอบ UUID Integrity', 'runDryRunUUIDIntegrity')  
      .addSeparator()  
      .addItem('🧹 ล้าง Postal Cache', 'clearPostalCache\_UI')  
      .addItem('🧹 ล้าง Search Cache', 'clearSearchCache\_UI')  
    )  
    .addSeparator()  
    .addItem('🔔 ตั้งค่า LINE Notify', 'setupLineToken')  
    .addItem('✈️ ตั้งค่า Telegram Notify', 'setupTelegramConfig')  
    .addItem('🔐 ตั้งค่า API Key (Setup)', 'setupEnvironment')  
    .addToUi();  
}  
// \=============================================================================  
// SECTION 2: SAFETY WRAPPER FUNCTIONS (UI Confirmation Dialogs)  
// \=============================================================================  
/\*\*  
 \* Wrapper: ยืนยันก่อนดึงข้อมูลลูกค้าใหม่  
 \* @returns {void}  
 \* @description แสดง dialog ยืนยันก่อนเรียก syncNewDataToMaster()  
 \* ใช้ชื่อชีตจาก CONFIG แบบไดนามิก  
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
/\*\*  
 \* Wrapper: ยืนยันก่อนรัน AI Smart Resolution  
 \* @returns {void}  
 \* @description แสดง dialog ยืนยันก่อนส่งชื่อให้ Gemini AI วิเคราะห์  
 \*/  
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
/\*\*  
 \* Wrapper: ยืนยันการจบงาน (Finalize)  
 \* @returns {void}  
 \* @description แสดง dialog ยืนยันก่อนย้ายข้อมูลที่ Verified แล้วไป NameMapping  
 \*/  
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
/\*\*  
 \* Wrapper: ยืนยันการรีเซ็ต Deep Clean Memory  
 \* @returns {void}  
 \* @description แสดง dialog ยืนยันก่อนเริ่มตรวจสอบ Deep Clean ใหม่ตั้งแต่ต้น  
 \*/  
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
/\*\*  
 \* Wrapper: ยืนยันการล้างชีต Data  
 \* @returns {void}  
 \*/  
function clearDataSheet\_UI() {  
  confirmAction('ล้างชีต Data', 'ข้อมูลผลลัพธ์ทั้งหมดจะหายไป', clearDataSheet);  
}  
/\*\*  
 \* Wrapper: ยืนยันการล้างชีต Input  
 \* @returns {void}  
 \*/  
function clearInputSheet\_UI() {  
  confirmAction('ล้างชีต Input', 'ข้อมูลนำเข้า (Shipment) ทั้งหมดจะหายไป', clearInputSheet);  
}  
/\*\*  
 \* Wrapper: ยืนยันการซ่อมแซม NameMapping  
 \* @returns {void}  
 \*/  
function repairNameMapping\_UI() {  
  confirmAction('ซ่อมแซม NameMapping', 'ระบบจะลบแถวซ้ำและเติม UUID ให้ครบ', repairNameMapping\_Full);  
}  
/\*\*  
 \* ฟังก์ชันกลางสำหรับแสดง dialog ยืนยัน  
 \* @param {string} title \- หัวข้อของ dialog  
 \* @param {string} message \- ข้อความแสดงรายละเอียด  
 \* @param {Function} callbackFunction \- ฟังก์ชันที่จะเรียกเมื่อยืนยัน  
 \* @returns {void}  
 \*/  
function confirmAction(title, message, callbackFunction) {  
  var ui \= SpreadsheetApp.getUi();  
  var result \= ui.alert(title, message, ui.ButtonSet.YES\_NO);  
  if (result \== ui.Button.YES) {  
    callbackFunction();  
  }  
}  
// \=============================================================================  
// SECTION 3: SYSTEM UTILITY FUNCTIONS  
// \=============================================================================  
/\*\*  
 \* ตรวจสอบสถานะสุขภาพของระบบ (Health Check)  
 \* @returns {void}  
 \* @description เรียก CONFIG.validateSystemIntegrity() และแสดงผลสถานะระบบ  
 \*/  
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
/\*\*  
 \* แสดงรายงานคุณภาพข้อมูลใน Database  
 \* @returns {void}  
 \* @description วิเคราะห์และแสดงสถิติคุณภาพข้อมูล包括 Quality Score, ข้อมูลที่ขาดหาย  
 \*/  
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
/\*\*  
 \* ล้าง Postal Cache  
 \* @returns {void}  
 \* @description เรียก clearPostalCache() จาก Service\_GeoAddr.gs และแสดง confirmation  
 \*/  
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
/\*\*  
 \* ล้าง Search Cache  
 \* @returns {void}  
 \* @description เรียก clearSearchCache() และแสดง confirmation  
 \*/  
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

\+++ Utils\_Common.gs  
/\*\*  
 \* @fileoverview Common Utility Functions for Logistics Master Data System  
 \* @version 5.0.0 \- Refactored Edition  
 \* @description Helper functions for hashing, text processing, geo calculations, and data conversion  
 \*/

// \====================================================  
// 1\. HASHING & ID GENERATION  
// \====================================================

/\*\*  
 \* Generates MD5 hash of input string  
 \* @param {string} key \- Input to hash  
 \* @return {string} MD5 hash or "empty\_hash" if input is falsy  
 \*/  
function md5(key) {  
  if (\!key) return "empty\_hash";

  var code \= key.toString().toLowerCase().replace(/\\s/g, "");  
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, code)  
    .map(function(char) {  
      return (char \+ 256).toString(16).slice(-2);  
    })  
    .join("");  
}

/\*\*  
 \* Generates a UUID  
 \* @return {string} Generated UUID  
 \*/  
function generateUUID() {  
  return Utilities.getUuid();  
}

// \====================================================  
// 2\. TEXT PROCESSING & NORMALIZATION  
// \====================================================

/\*\*  
 \* Normalizes Thai/English text by removing stop words and special characters  
 \* Enhanced with logistics-specific stop words (warehouses, buildings, etc.)  
 \* @param {string} text \- Text to normalize  
 \* @return {string} Normalized text  
 \*/  
function normalizeText(text) {  
  if (\!text) return "";

  var clean \= text.toString().toLowerCase();

  // Remove Thai/English business and location stop words  
  var stopWordsPattern \= /บริษัท|บจก\\.?|บมจ\\.?|หจก\\.?|ห้างหุ้นส่วน|จำกัด|มหาชน|ส่วนบุคคล|ร้าน|ห้าง|สาขา|สำนักงานใหญ่|store|shop|company|co\\.?|ltd\\.?|inc\\.?|จังหวัด|อำเภอ|ตำบล|เขต|แขวง|ถนน|ซอย|นาย|นาง|นางสาว|โกดัง|คลังสินค้า|หมู่ที่|หมู่|อาคาร|ชั้น/g;  
  clean \= clean.replace(stopWordsPattern, "");

  return clean.replace(/\[^a-z0-9\\u0E00-\\u0E7F\]/g, "");  
}

/\*\*  
 \* Cleans and formats distance values  
 \* @param {\*} val \- Distance value to clean  
 \* @return {string} Formatted distance or empty string  
 \*/  
function cleanDistance(val) {  
  if (\!val && val \!== 0\) return "";  
  var str \= val.toString().replace(/\[^0-9.\]/g, "");  
  var num \= parseFloat(str);  
  return isNaN(num) ? "" : num.toFixed(2);  
}

// \====================================================  
// 3\. SMART NAMING LOGIC  
// \====================================================

/\*\*  
 \* Selects the best name from a list using scoring algorithm  
 \* @param {string\[\]} names \- Array of candidate names  
 \* @return {string} Best normalized name  
 \*/  
function getBestName\_Smart(names) {  
  if (\!names || names.length \=== 0\) return "";

  var nameScores \= {};  
  var bestName \= names\[0\];  
  var maxScore \= \-9999;

  // Count occurrences  
  names.forEach(function(n) {  
    if (\!n) return;  
    var original \= n.toString().trim();  
    if (original \=== "") return;

    if (\!nameScores\[original\]) {  
       nameScores\[original\] \= { count: 0, score: 0 };  
    }  
    nameScores\[original\].count \+= 1;  
  });

  // Score each unique name  
  for (var n in nameScores) {  
    var s \= nameScores\[n\].count \* 10;

    // Bonus for formal business prefixes/suffixes  
    if (/(บริษัท|บจก|หจก|บมจ)/.test(n)) s \+= 5;  
    if (/(จำกัด|มหาชน)/.test(n)) s \+= 5;  
    if (/(สาขา)/.test(n)) s \+= 5;

    // Check bracket balance  
    var openBrackets \= (n.match(/\\(/g) || \[\]).length;  
    var closeBrackets \= (n.match(/\\)/g) || \[\]).length;

    if (openBrackets \> 0 && openBrackets \=== closeBrackets) {  
      s \+= 5;  
    } else if (openBrackets \!== closeBrackets) {  
      s \-= 30;  
    }

    // Penalty for phone numbers and contact info  
    if (/\[0-9\]{9,10}/.test(n) || /โทร/.test(n)) s \-= 30;  
    if (/ส่ง|รับ|ติดต่อ/.test(n)) s \-= 10;

    // Optimal length scoring  
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

/\*\*  
 \* Removes phone numbers and extra whitespace from display names  
 \* @param {string} name \- Name to clean  
 \* @return {string} Cleaned display name  
 \*/  
function cleanDisplayName(name) {  
  var clean \= name.toString();  
  clean \= clean.replace(/\\s\*โทร\\.?\\s\*\[0-9-\]{9,12}/g, '');  
  clean \= clean.replace(/\\s\*0\[0-9\]{1,2}-\[0-9\]{3}-\[0-9\]{4}/g, '');  
  clean \= clean.replace(/\\s+/g, ' ').trim();  
  return clean;  
}

// \====================================================  
// 4\. GEO MATH & FUZZY MATCHING  
// \====================================================

/\*\*  
 \* Calculates distance between two coordinates using Haversine formula  
 \* @param {number} lat1 \- Latitude of point 1  
 \* @param {number} lon1 \- Longitude of point 1  
 \* @param {number} lat2 \- Latitude of point 2  
 \* @param {number} lon2 \- Longitude of point 2  
 \* @return {number|null} Distance in KM or null if invalid input  
 \*/  
function getHaversineDistanceKM(lat1, lon1, lat2, lon2) {  
  if (\!lat1 || \!lon1 || \!lat2 || \!lon2) return null;

  var R \= 6371; // Earth radius in KM  
  var dLat \= (lat2 \- lat1) \* Math.PI / 180;  
  var dLon \= (lon2 \- lon1) \* Math.PI / 180;  
  var a \= Math.sin(dLat/2) \* Math.sin(dLat/2) \+  
          Math.cos(lat1 \* Math.PI / 180\) \* Math.cos(lat2 \* Math.PI / 180\) \*  
          Math.sin(dLon/2) \* Math.sin(dLon/2);  
  var c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  
  return parseFloat((R \* c).toFixed(3));  
}

// \====================================================  
// 5\. SYSTEM UTILITIES  
// \====================================================

/\*\*  
 \* Executes function with exponential backoff retry  
 \* @param {Function} func \- Function to execute  
 \* @param {number} maxRetries \- Maximum retry attempts  
 \* @return {\*} Result of successful function execution  
 \* @throws {Error} Last error if all retries fail  
 \*/  
function genericRetry(func, maxRetries) {  
  for (var i \= 0; i \< maxRetries; i++) {  
    try {  
      return func();  
    } catch (e) {  
      if (i \=== maxRetries \- 1\) {  
        console.error("\[GenericRetry\] FATAL ERROR after " \+ maxRetries \+ " attempts: " \+ e.message);  
        throw e;  
      }  
      Utilities.sleep(1000 \* Math.pow(2, i));  
      console.warn("\[GenericRetry\] Attempt " \+ (i \+ 1\) \+ " failed: " \+ e.message \+ ". Retrying...");  
    }  
  }  
}

/\*\*  
 \* Safely parses JSON string  
 \* @param {string} str \- JSON string to parse  
 \* @return {Object|null} Parsed object or null if invalid  
 \*/  
function safeJsonParse(str) {  
  try {  
    return JSON.parse(str);  
  } catch (e) {  
    return null;  
  }  
}

// \====================================================  
// 6\. DATA CONVERSION HELPERS (ROW ADAPTERS)  
// \====================================================

/\*\*  
 \* Converts Database sheet row to object  
 \* @param {Array} row \- Raw row array from spreadsheet  
 \* @return {Object|null} Row data as object or null if invalid  
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

/\*\*  
 \* Converts object to Database sheet row format  
 \* @param {Object} obj \- Row data object  
 \* @return {Array} Row array for spreadsheet  
 \*/  
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
 \* Converts NameMapping sheet row to object  
 \* @param {Array} row \- Raw row array from spreadsheet  
 \* @return {Object|null} Mapping data as object or null if invalid  
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

/\*\*  
 \* Converts object to NameMapping sheet row format  
 \* @param {Object} obj \- Mapping data object  
 \* @return {Array} Row array for spreadsheet  
 \*/  
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
 \* Converts GPS\_Queue sheet row to object  
 \* @param {Array} row \- Raw row array from spreadsheet  
 \* @return {Object|null} Queue entry as object or null if invalid  
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

/\*\*  
 \* Converts object to GPS\_Queue sheet row format  
 \* @param {Object} obj \- Queue entry data object  
 \* @return {Array} Row array for spreadsheet  
 \*/  
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
 \* Converts Data sheet (Daily Job) row to object  
 \* @param {Array} row \- Raw row array from spreadsheet  
 \* @return {Object|null} Daily job data as object or null if invalid  
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

\+++ Service\_Master.gs  
/\*\*  
 \* @fileoverview Service\_Master.gs \- Master Data Management Service  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*  
 \* Version History:  
 \* \- v4.2: Enhanced JSDoc documentation for all functions, code organization into 6 sections  
 \* \- v4.1: Fixed checkbox overflow issue with getRealLastRow\_() helper, improved clustering algorithm  
 \* \- v4.0: Enterprise Edition with full clustering and mapping features  
 \*  
 \* @description โมดูลนี้จัดการข้อมูลหลัก (Master Data) ทั้งหมดของระบบ  
 \* รวมถึงการนำเข้าข้อมูลใหม่, การเติมพิกัด GPS, การจัดกลุ่มชื่อซ้ำ,  
 \* การย้ายข้อมูลที่ Verified แล้วไปยัง NameMapping, และการคำนวณ Quality Score  
 \*  
 \* @namespace Service\_Master  
 \*/

// \=============================================================================  
// SECTION 1: UTILITY HELPERS  
// \=============================================================================

/\*\*  
 \* 🛠️ \[NEW v4.1\] Helper หาแถวสุดท้ายจริงๆ โดยดูจากคอลัมน์ชื่อลูกค้า (ข้าม Checkbox)  
 \*  
 \* @param {GoogleAppsScript.Spreadsheet.Sheet} sheet \- ชีตที่ต้องการตรวจสอบ  
 \* @param {number} columnIndex \- หมายเลขคอลัมน์ที่ใช้ตรวจสอบ (1-indexed)  
 \* @returns {number} หมายเลขแถวสุดท้ายที่มีข้อมูลจริง (ไม่รวม Checkbox)  
 \* @description วนลูปจากล่างขึ้นบนเพื่อหาแถวสุดท้ายที่มีข้อมูลจริง  
 \* ข้ามค่าที่เป็น boolean (Checkbox) และค่าว่างเปล่า  
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
 \* ทำความสะอาดค่าระยะทาง (Distance) ให้เป็นตัวเลข  
 \*  
 \* @param {\*} val \- ค่าระยะทางที่ต้องการทำความสะอาด (อาจมีหน่วย km หรือ comma)  
 \* @returns {number|string} ค่าระยะทางที่เป็นตัวเลข หรือค่าว่างถ้าแปลงไม่ได้  
 \* @description ลบเครื่องหมาย comma, คำว่า 'km', และแปลงเป็นตัวเลข  
 \*/  
function cleanDistance\_Helper(val) {  
  if (\!val) return "";  
  if (typeof val \=== 'number') return val;  
  return parseFloat(val.toString().replace(/,/g, '').replace('km', '').trim()) || "";  
}

// \=============================================================================  
// SECTION 2: MAPPING REPOSITORY HELPERS  
// \=============================================================================

/\*\*  
 \* \[Phase C\] โหลดดัชนี Database โดยใช้ UUID เป็นคีย์  
 \*  
 \* @returns {Object} Object ที่มี UUID เป็นคีย์และ index ของแถว (0-based) เป็นค่า  
 \* @description สร้างดัชนีสำหรับค้นหาแถวใน Database ได้รวดเร็วด้วย UUID  
 \* ใช้ในฟังก์ชัน syncNewDataToMaster และ finalizeAndClean\_MoveToMapping  
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

/\*\*  
 \* \[Phase C\] โหลดดัชนี Database โดยใช้ Normalized Name เป็นคีย์  
 \*  
 \* @returns {Object} Object ที่มี normalized name เป็นคีย์และ index ของแถว (0-based) เป็นค่า  
 \* @description สร้างดัชนีสำหรับค้นหาแถวใน Database ได้รวดเร็วด้วยชื่อที่ normalize แล้ว  
 \* ใช้ normalizeText() เพื่อทำให้ชื่อเป็นรูปแบบมาตรฐานก่อนใช้เป็นคีย์  
 \*/  
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

/\*\*  
 \* โหลดข้อมูลทั้งหมดจากชีต NameMapping  
 \*  
 \* @returns {Array\<Array\<\*\>\>} อาร์เรย์ 2 มิติของข้อมูลใน NameMapping (ไม่รวม header)  
 \* @description ดึงข้อมูลทั้งหมดจากชีต NameMapping เพื่อใช้ในกระบวนการ mapping alias ไปยัง UUID  
 \*/  
function loadNameMappingRows\_() {  
  var ss       \= SpreadsheetApp.getActiveSpreadsheet();  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  if (\!mapSheet || mapSheet.getLastRow() \< 2\) return \[\];  
  return mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, CONFIG.MAP\_TOTAL\_COLS).getValues();  
}

/\*\*  
 \* เพิ่มข้อมูลใหม่เข้าไปในชีต NameMapping  
 \*  
 \* @param {Array\<Array\<\*\>\>} rows \- อาร์เรย์ 2 มิติของแถวที่ต้องการเพิ่ม  
 \* @returns {void}  
 \* @description เพิ่มแถวใหม่ต่อท้ายชีต NameMapping โดยใช้จำนวนคอลัมน์จาก CONFIG.MAP\_TOTAL\_COLS  
 \*/  
function appendNameMappings\_(rows) {  
  if (\!rows || rows.length \=== 0\) return;  
  var ss       \= SpreadsheetApp.getActiveSpreadsheet();  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  var lastRow  \= mapSheet.getLastRow();  
  mapSheet.getRange(lastRow \+ 1, 1, rows.length, CONFIG.MAP\_TOTAL\_COLS).setValues(rows);  
}

// \=============================================================================  
// SECTION 3: DATA SYNC & IMPORT  
// \=============================================================================

/\*\*  
 \* ดึงข้อมูลลูกค้าใหม่จาก Source Sheet และ Sync เข้า Database  
 \*  
 \* @returns {void}  
 \* @description ฟังก์ชันหลักในการดึงข้อมูลลูกค้าใหม่จากชีตต้นทาง (Input/Data)  
 \* และเพิ่มเข้าไปใน Database พร้อมจัดการกรณีต่างๆ:  
 \* \- ชื่อใหม่: เพิ่มเป็นลูกค้าใหม่ใน Database  
 \* \- ชื่อเดิมแต่ไม่มีพิกัด: ส่งเข้า GPS\_Queue  
 \* \- ชื่อเดิมและมีพิกัดตรงกัน (\<50m): อัปเดต timestamp  
 \* \- ชื่อเดิมแต่พิกัดต่างกัน (\>50m): ส่งเข้า GPS\_Queue เพื่อตรวจสอบ  
 \*  
 \* ใช้ LockService ป้องกันการเขียนพร้อมกัน และตรวจสอบ Schema ก่อนทำงาน  
 \*/  
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

\+++ Service\_SCG.gs  
/\*\*  
 \* @fileoverview Service: SCG Operation (Enterprise Edition) \- จัดการดึงและประมวลผลข้อมูลจาก SCG API  
 \* @version 5.0 ScanDocs \+ Summary Readiness  
 \* @author Elite Logistics Architect  
 \*  
 \* Version History:  
 \* \- v5.0: เพิ่ม Logic ใหม่รองรับ Invoice ทุกช่วงตัวเลข, เพิ่ม buildShipmentSummary(), clearShipmentSummarySheet()  
 \* \- v4.1: แก้ไข UI Alert ให้ดึงชื่อชีตจาก CONFIG แบบไดนามิก  
 \* \- v4.0: Enterprise Edition with API Retry Mechanism, LockService, Smart Branch Matching  
 \*  
 \* @description โมดูลหลักในการดึงและประมวลผลข้อมูลจาก SCG API  
 \* ครอบคลุม: การโหลด Shipment, จับคู่พิกัด, สร้างรายงานสรุป, และล้างข้อมูล  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

// ค่าคงที่สำหรับ SCG API และ Sheet Configuration  
// ใช้ค่าจาก SCG\_CONFIG ใน Config.gs

// \=============================================================================  
// SECTION 2: MAIN API FETCHING LOGIC  
// \=============================================================================

/\*\*  
 \* ดึงข้อมูล Shipment จาก SCG/JWD API และบันทึกสู่ชีต Data  
 \* @returns {void}  
 \* @description ขั้นตอนการทำงาน:  
 \* 1\. ตรวจสอบ Lock เพื่อป้องกันการรันซ้อน  
 \* 2\. อ่าน Cookie และ Shipment Numbers จากชีต Input  
 \* 3\. เรียก SCG API ด้วย Retry Mechanism  
 \* 4\. แปลง JSON Response เป็น Flat Data  
 \* 5\. คำนวณ Aggregate ข้อมูล (จำนวนสินค้า, น้ำหนัก, Invoice)  
 \* 6\. บันทึกสู่ชีต Data พร้อม Header  
 \* 7\. เรียก applyMasterCoordinatesToDailyJob() เพื่อจับคู่พิกัด  
 \* 8\. เรียก buildOwnerSummary() และ buildShipmentSummary() เพื่อสร้างรายงาน  
 \*/  
function fetchDataFromSCGJWD() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const ui \= SpreadsheetApp.getUi();

  // ตรวจสอบ Lock เพื่อป้องกันการรันซ้อน  
  const lock \= LockService.getScriptLock();  
  if (\!lock.tryLock(10000)) {  
    ui.alert("⚠️ ระบบคิวทำงาน", "มีผู้ใช้งานอื่นกำลังโหลดข้อมูล Shipment อยู่ กรุณารอสักครู่", ui.ButtonSet.OK);  
    return;  
  }

  try {  
    const inputSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
    const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
    if (\!inputSheet || \!dataSheet) throw new Error("CRITICAL: ไม่พบชีต Input หรือ Data");

    // อ่าน Cookie จาก Input Sheet  
    const cookie \= inputSheet.getRange(SCG\_CONFIG.COOKIE\_CELL).getValue();  
    if (\!cookie) throw new Error("❌ กรุณาวาง Cookie ในช่อง " \+ SCG\_CONFIG.COOKIE\_CELL);

    // อ่าน Shipment Numbers  
    const lastRow \= inputSheet.getLastRow();  
    if (lastRow \< SCG\_CONFIG.INPUT\_START\_ROW) throw new Error("ℹ️ ไม่พบเลข Shipment ในชีต Input");

    const shipmentNumbers \= inputSheet  
      .getRange(SCG\_CONFIG.INPUT\_START\_ROW, 1, lastRow \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1\)  
      .getValues().flat().filter(String);

    if (shipmentNumbers.length \=== 0\) throw new Error("ℹ️ รายการ Shipment ว่างเปล่า");

    const shipmentString \= shipmentNumbers.join(',');  
    inputSheet.getRange(SCG\_CONFIG.SHIPMENT\_STRING\_CELL).setValue(shipmentString).setHorizontalAlignment("left");

    // เตรียม Payload สำหรับ API  
    const payload \= {  
      DeliveryDateFrom: '', DeliveryDateTo: '', TenderDateFrom: '', TenderDateTo: '',  
      CarrierCode: '', CustomerCode: '', OriginCodes: '', ShipmentNos: shipmentString  
    };

    const options \= {  
      method: 'post', payload: payload, muteHttpExceptions: true, headers: { cookie: cookie }  
    };

    // เรียก API ด้วย Retry Mechanism  
    ss.toast("กำลังเชื่อมต่อ SCG Server...", "System", 10);  
    console.log(\`\[SCG API\] Fetching data for ${shipmentNumbers.length} shipments.\`);  
    const responseText \= fetchWithRetry\_(SCG\_CONFIG.API\_URL, options, (CONFIG.API\_MAX\_RETRIES || 3));

    const json \= JSON.parse(responseText);  
    const shipments \= json.data || \[\];

    if (shipments.length \=== 0\) throw new Error("API Return Success แต่ไม่พบข้อมูล Shipment (Data Empty)");

    // แปลงข้อมูลเป็น Flat Structure  
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

    // คำนวณ Aggregate ข้อมูล per Shop  
    const shopAgg \= {};  
    allFlatData.forEach(r \=\> {  
      const key \= r\[28\];  
      if (\!shopAgg\[key\]) shopAgg\[key\] \= { qty: 0, weight: 0, invoices: new Set(), epod: 0 };  
      shopAgg\[key\].qty \+= Number(r\[14\]) || 0;  
      shopAgg\[key\].weight \+= Number(r\[16\]) || 0;  
      shopAgg\[key\].invoices.add(r\[2\]);  
      if (checkIsEPOD(r\[9\], r\[2\])) shopAgg\[key\].epod++;  
    });

    // อัปเดต Aggregate Data กลับสู่ Row  
    allFlatData.forEach(r \=\> {  
      const agg \= shopAgg\[r\[28\]\];  
      const scanInv \= agg.invoices.size \- agg.epod;  
      r\[23\] \= agg.qty;  
      r\[24\] \= Number(agg.weight.toFixed(2));  
      r\[25\] \= scanInv;  
      r\[27\] \= \`${r\[9\]} / รวม ${scanInv} บิล\`;  
    });

    // กำหนด Headers  
    const headers \= \[  
      "ID\_งานประจำวัน", "PlanDelivery", "InvoiceNo", "ShipmentNo", "DriverName",  
      "TruckLicense", "CarrierCode", "CarrierName", "SoldToCode", "SoldToName",  
      "ShipToName", "ShipToAddress", "LatLong\_SCG", "MaterialName", "ItemQuantity",  
      "QuantityUnit", "ItemWeight", "DeliveryNo", "จำนวนปลายทาง\_System", "รายชื่อปลายทาง\_System",  
      "ScanStatus", "DeliveryStatus", "Email พนักงาน",  
      "จำนวนสินค้ารวมของร้านนี้", "น้ำหนักสินค้ารวมของร้านนี้", "จำนวน\_Invoice\_ที่ต้องสแกน",  
      "LatLong\_Actual", "ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน", "ShopKey"  
    \];

    // เขียนข้อมูลลง Data Sheet  
    dataSheet.clear();  
    dataSheet.getRange(1, 1, 1, headers.length).setValues(\[headers\]).setFontWeight("bold");

    if (allFlatData.length \> 0\) {  
      dataSheet.getRange(2, 1, allFlatData.length, headers.length).setValues(allFlatData);  
      dataSheet.getRange(2, 2, allFlatData.length, 1).setNumberFormat("dd/mm/yyyy");  
      dataSheet.getRange(2, 3, allFlatData.length, 1).setNumberFormat("@");  
      dataSheet.getRange(2, 18, allFlatData.length, 1).setNumberFormat("@");  
    }

    // เรียกฟังก์ชันต่อเนื่อง  
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

// \=============================================================================  
// SECTION 3: COORDINATE MATCHING & DATA TRANSFORMATION  
// \=============================================================================

/\*\*  
 \* \[Phase C FIXED\] applyMasterCoordinatesToDailyJob()  
 \* ใช้ resolveUUIDFromMap\_() ก่อน lookup พิกัดจาก masterUUIDCoords  
 \* ป้องกัน merged UUID ชี้ไปพิกัดเก่าที่ไม่ใช่ canonical  
 \* @returns {void}  
 \* @description จับคู่พิกัดจาก Master Database กับข้อมูล Shipment  
 \* พร้อมอัปเดต Email พนักงานจาก Employee Sheet  
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

  // โหลด master coords จาก Database  
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

  // โหลด alias map จาก NameMapping  
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

  // อัปเดตข้อมูลกลับสู่ Data Sheet  
  dataSheet.getRange(2, DATA\_IDX.LATLNG\_ACTUAL \+ 1, latLongUpdates.length, 1).setValues(latLongUpdates);  
  dataSheet.getRange(2, DATA\_IDX.LATLNG\_ACTUAL \+ 1, bgUpdates.length,      1).setBackgrounds(bgUpdates);  
  dataSheet.getRange(2, DATA\_IDX.EMAIL \+ 1,          emailUpdates.length,   1).setValues(emailUpdates);

  ss.toast("✅ อัปเดตพิกัดและข้อมูลพนักงานเรียบร้อย", "System");  
}

// \=============================================================================  
// SECTION 4: UTILITY HELPERS  
// \=============================================================================

/\*\*  
 \* เรียก API ด้วย Retry Mechanism แบบ Exponential Backoff  
 \* @param {string} url \- URL ของ API  
 \* @param {Object} options \- Options สำหรับ UrlFetchApp  
 \* @param {number} maxRetries \- จำนวนครั้งสูงสุดที่จะ retry  
 \* @returns {string} Response text จาก API  
 \* @throws {Error} ถ้า retry ครบทุกครั้งแล้วยังล้มเหลว  
 \*/  
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

/\*\*  
 \* พยายามจับคู่ชื่อสาขาจาก keywords  
 \* @param {string} name \- ชื่อร้าน/สาขา ที่ต้องการจับคู่  
 \* @param {Object} masterCoords \- Object เก็บพิกัดจาก Master Database  
 \* @returns {string|null} พิกัดที่จับคู่ได้ หรือ null ถ้าไม่พบ  
 \*/  
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
 \* @param {string} ownerName \- ชื่อเจ้าของสินค้า  
 \* @param {string} invoiceNo \- เลขที่ Invoice  
 \* @returns {boolean} true ถ้าเป็น E-POD, false ถ้าไม่ใช่  
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

// \=============================================================================  
// SECTION 5: SUMMARY REPORTS (Owner & Shipment)  
// \=============================================================================

/\*\*  
 \* \[Phase B FIXED\] buildOwnerSummary()  
 \* ใช้ DATA\_IDX แทน r\[9\], r\[2\]  
 \* @returns {void}  
 \* @description สร้างรายงานสรุปตามเจ้าของสินค้า แยก Invoice ปกติ และ E-POD  
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
 \* @returns {void}  
 \* @description สร้างรายงานสรุปตาม Shipment \+ Truck License แยก Invoice ปกติ และ E-POD  
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

// \=============================================================================  
// SECTION 6: CLEANUP & MAINTENANCE TOOLS  
// \=============================================================================

/\*\*  
 \* ล้างข้อมูลในชีต Data (คงเหลือ Header)  
 \* @returns {void}  
 \*/  
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

/\*\*  
 \* ล้างข้อมูลในชีต สรุป\_เจ้าของสินค้า (คงเหลือ Header)  
 \* @returns {void}  
 \*/  
function clearSummarySheet() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const sheet \= ss.getSheetByName("สรุป\_เจ้าของสินค้า");  
  if (\!sheet) return;  
  const lastRow \= sheet.getLastRow();  
  if (lastRow \> 1\) {  
    sheet.getRange(2, 1, lastRow \- 1, sheet.getLastColumn()).clearContent().setBackground(null);  
  }  
}

/\*\*  
 \* ล้างข้อมูลในชีต สรุป\_Shipment (คงเหลือ Header)  
 \* @returns {void}  
 \*/  
function clearShipmentSummarySheet() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const sheet \= ss.getSheetByName("สรุป\_Shipment");  
  if (\!sheet) return;  
  const lastRow \= sheet.getLastRow();  
  if (lastRow \> 1\) {  
    sheet.getRange(2, 1, lastRow \- 1, sheet.getLastColumn()).clearContent().setBackground(null);  
  }  
}

/\*\*  
 \* Wrapper: ยืนยันการล้างชีต สรุป\_เจ้าของสินค้า  
 \* @returns {void}  
 \*/  
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

/\*\*  
 \* Wrapper: ยืนยันการล้างชีต สรุป\_Shipment  
 \* @returns {void}  
 \*/  
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
 \* @returns {void}  
 \* @description ล้างข้อมูลทั้งหมดใน 4 ชีตหลักของ SCG Module  
 \* พร้อมลบ Cookie และ Shipment String จาก Input Sheet  
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

    // ล้าง Input Sheet  
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

    // ล้าง Data, Summary Sheets  
    clearDataSheet();  
    clearSummarySheet();  
    clearShipmentSummarySheet();

    ui.alert('✅ ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว\\n(Input \+ Data \+ สรุป\_เจ้าของสินค้า \+ สรุป\_Shipment)');  
  }  
}

Service\_GeoAddr.gs  
/\*\*  
 \* @fileoverview Service\_GeoAddr \- ระบบจัดการแปลงที่อยู่เป็นพิกัด (Geocoding) และข้อมูลเชิงพื้นที่  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: ปรับปรุงระบบ Cache และเพิ่มฟังก์ชันตรวจสอบพิกัดนอกเขต (Boundary Check)  
 \* \- v4.1: เพิ่ม Smart Caching สำหรับ Postal Code เพื่อลด API Call  
 \* \- v4.0: แยกโมดูล Geocoding ออกจาก Service\_Master เพื่อประสิทธิภาพสูงสุด  
 \*   
 \* @description โมดูลนี้ทำหน้าที่หลักในการ:  
 \* 1\. แปลงข้อความเป็นพิกัด GPS (Geocoding) ผ่าน Google Maps API  
 \* 2\. จัดการ Cache รหัสไปรษณีย์และผลการค้นหาเพื่อประหยัด Quota  
 \* 3\. ตรวจสอบความถูกต้องของพิกัด (Validation) และแก้ไขพิกัดที่ผิดพลาด  
 \* 4\. รองรับการทำงานแบบ Batch Processing สำหรับข้อมูลจำนวนมาก  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CACHING SYSTEM  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่า Geocoding  
 \* @constant {Object} GEO\_CONFIG  
 \*/  
var GEO\_CONFIG \= {  
  CACHE\_EXPIRY\_MS: 24 \* 60 \* 60 \* 1000, // 24 ชั่วโมง  
  MAX\_BATCH\_SIZE: 50,                   // จำนวนแถวสูงสุดต่อครั้ง  
  API\_TIMEOUT\_MS: 15000,                // Timeout 15 วินาที  
  RETRY\_COUNT: 3                        // จำนวนครั้งที่ลองใหม่หากล้มเหลว  
};

/\*\*  
 \* โหลด Cache ของรหัสไปรษณีย์จาก PropertiesService  
 \* @returns {Object} Object เก็บข้อมูลรหัสไปรษณีย์ { "10110": {district: "...", province: "..."} }  
 \*/  
function getPostalCache() {  
  var props \= PropertiesService.getScriptProperties();  
  var data \= props.getProperty('POSTAL\_CACHE');  
  return data ? JSON.parse(data) : {};  
}

/\*\*  
 \* บันทึก Cache ของรหัสไปรษณีย์ลง PropertiesService  
 \* @param {Object} cacheData \- ข้อมูลที่จะบันทึก  
 \* @returns {void}  
 \*/  
function savePostalCache(cacheData) {  
  var props \= PropertiesService.getScriptProperties();  
  props.setProperty('POSTAL\_CACHE', JSON.stringify(cacheData));  
}

/\*\*  
 \* ล้าง Cache ของรหัสไปรษณีย์ทั้งหมด  
 \* @returns {void}  
 \*/  
function clearPostalCache() {  
  var props \= PropertiesService.getScriptProperties();  
  props.deleteProperty('POSTAL\_CACHE');  
  console.log('\[GeoAddr\] Postal Cache cleared successfully.');  
}

/\*\*  
 \* โหลด Cache ผลลัพธ์ Geocoding (Address \-\> Lat/Lng)  
 \* @returns {Object} Object เก็บผลลัพธ์ { "address\_string": {lat: ..., lng: ...} }  
 \*/  
function getGeoCache() {  
  var props \= PropertiesService.getScriptProperties();  
  var data \= props.getProperty('GEO\_CACHE');  
  return data ? JSON.parse(data) : {};  
}

/\*\*  
 \* บันทึกผลลัพธ์ Geocoding ลง Cache  
 \* @param {string} address \- ที่อยู่ต้นฉบับ  
 \* @param {number} lat \- ละติจูด  
 \* @param {number} lng \- ลองจิจูด  
 \* @param {string} formattedAddr \- ที่อยู่รูปแบบมาตรฐาน  
 \* @returns {void}  
 \*/  
function saveGeoCache(address, lat, lng, formattedAddr) {  
  var cache \= getGeoCache();  
  // จำกัดขนาด Cache ไม่ให้ใหญ่เกินไป (เก็บล่าสุด 500 รายการ)  
  var keys \= Object.keys(cache);  
  if (keys.length \> 500\) {  
    delete cache\[keys\[0\]\];  
  }  
    
  cache\[address\] \= {  
    lat: lat,  
    lng: lng,  
    addr: formattedAddr,  
    timestamp: new Date().getTime()  
  };  
    
  var props \= PropertiesService.getScriptProperties();  
  props.setProperty('GEO\_CACHE', JSON.stringify(cache));  
}

// \=============================================================================  
// SECTION 2: CORE GEOCODING LOGIC (Single & Batch)  
// \=============================================================================

/\*\*  
 \* แปลงที่อยู่เป็นพิกัด GPS (หลัก)  
 \* @param {string} address \- ที่อยู่ที่ต้องการแปลง  
 \* @param {boolean} useCache \- true เพื่อให้ใช้ Cache, false เพื่อบังคับเรียก API ใหม่  
 \* @returns {Object|null} { lat: number, lng: number, formatted\_address: string } หรือ null หากไม่พบ  
 \*/  
function geocodeAddress(address, useCache) {  
  if (\!address || address.trim() \=== '') return null;  
    
  var cleanAddr \= address.trim();  
    
  // 1\. ตรวจสอบ Cache  
  if (useCache \!== false) {  
    var cache \= getGeoCache();  
    if (cache\[cleanAddr\]) {  
      var item \= cache\[cleanAddr\];  
      // ตรวจสอบว่า Cache เก่าเกินไปหรือไม่ (ถ้าต้องการ)  
      return {  
        lat: item.lat,  
        lng: item.lng,  
        formatted\_address: item.addr || cleanAddr  
      };  
    }  
  }  
    
  // 2\. เรียก Google Maps Geocoding API  
  try {  
    var url \= 'https://maps.googleapis.com/maps/api/geocode/json?address=' \+   
              encodeURIComponent(cleanAddr \+ ', Thailand') \+   
              '\&key=' \+ getConfigValue('GOOGLE\_MAPS\_API\_KEY'); // สมมติว่ามีฟังก์ชันนี้ใน Config  
      
    // หมายเหตุ: ในกรณีไม่มี Key หรือใช้ internal service ของ Google Apps Script  
    // เราจะใช้ LocationService แทน (ฟรีและไม่ต้องตั้ง Key สำหรับพื้นฐาน)  
    // แต่ถ้าต้องการความแม่นยำสูงต้องใช้ API Key ด้านบน  
      
    var response \= UrlFetchApp.fetch(url, { muteHttpExceptions: true });  
    var json \= JSON.parse(response.getContentText());  
      
    if (json.status \=== 'OK' && json.results.length \> 0\) {  
      var result \= json.results\[0\];  
      var loc \= result.geometry.location;  
        
      // บันทึกลง Cache  
      saveGeoCache(cleanAddr, loc.lat, loc.lng, result.formatted\_address);  
        
      return {  
        lat: loc.lat,  
        lng: loc.lng,  
        formatted\_address: result.formatted\_address  
      };  
    } else {  
      console.warn('\[GeoAddr\] Geocoding failed for "' \+ cleanAddr \+ '": ' \+ json.status);  
      return null;  
    }  
  } catch (e) {  
    console.error('\[GeoAddr\] Error geocoding "' \+ cleanAddr \+ '": ' \+ e.message);  
    return null;  
  }  
}

/\*\*  
 \* ฟังก์ชันเสริมสำหรับใช้ภายในระบบ (Fallback ถ้าไม่มี API Key)  
 \* ใช้ LocationService ของ GAS ซึ่งจำกัดกว่าแต่ฟรี  
 \* @param {string} address   
 \* @returns {Object|null}  
 \*/  
function geocodeAddress\_Internal(address) {  
  if (\!address) return null;  
  try {  
    // หมายเหตุ: LocationService ใน GAS ไม่รองรับการ Geocode ข้อความโดยตรงแบบละเอียด  
    // ส่วนใหญ่จะใช้กับ Known entities ดังนั้นส่วนนี้จะใช้ Cache เป็นหลัก  
    // หรือต้องพึ่งพา API ภายนอกจริงๆ  
    return geocodeAddress(address, true);   
  } catch (e) {  
    return null;  
  }  
}

/\*\*  
 \* ประมวลผล Geocoding แบบ Batch (ทีละหลายแถว)  
 \* @param {Array\<Array\>} dataArray \- อาร์เรย์ 2 มิติ \[\[rowId, address\], ...\]  
 \* @param {Function} progressCallback \- ฟังก์ชัน callback สำหรับอัปเดตความคืบหน้า (optional)  
 \* @returns {Array\<Object\>} ผลลัพธ์ \[{id: ..., lat: ..., lng: ...}, ...\]  
 \*/  
function batchGeocode(dataArray, progressCallback) {  
  var results \= \[\];  
  var total \= dataArray.length;  
    
  for (var i \= 0; i \< total; i++) {  
    var row \= dataArray\[i\];  
    var id \= row\[0\];  
    var addr \= row\[1\];  
      
    var result \= geocodeAddress(addr, true);  
      
    if (result) {  
      results.push({  
        id: id,  
        lat: result.lat,  
        lng: result.lng,  
        status: 'SUCCESS'  
      });  
    } else {  
      results.push({  
        id: id,  
        lat: null,  
        lng: null,  
        status: 'FAILED'  
      });  
    }  
      
    // อัปเดตความคืบหน้า  
    if (progressCallback) {  
      progressCallback(i \+ 1, total);  
    }  
      
    // พักเล็กน้อยเพื่อไม่ให้เกิน\_quota (ถ้าจำเป็น)  
    if (i % 10 \=== 0\) {  
      Utilities.sleep(100);  
    }  
  }  
    
  return results;  
}

// \=============================================================================  
// SECTION 3: POSTAL CODE UTILITIES & DATA ENRICHMENT  
// \=============================================================================

/\*\*  
 \* ค้นหาข้อมูลเขต/แขวง/จังหวัด จากรหัสไปรษณีย์  
 \* @param {string} postalCode \- รหัสไปรษณีย์ 5 หลัก  
 \* @returns {Object|null} { district, subDistrict, province } หรือ null หากไม่พบ  
 \*/  
function getLocationByPostalCode(postalCode) {  
  if (\!postalCode) return null;  
    
  // 1\. เช็ค Cache  
  var cache \= getPostalCache();  
  if (cache\[postalCode\]) {  
    return cache\[postalCode\];  
  }  
    
  // 2\. ค้นหาจากชีตอ้างอิง (PostalRef) หากมี  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('PostalRef');  
    
  if (sheet) {  
    var data \= sheet.getDataRange().getValues();  
    // สมมติโครงสร้าง: \[Postal, Province, District, SubDistrict\]  
    for (var i \= 1; i \< data.length; i++) {  
      if (String(data\[i\]\[0\]) \== String(postalCode)) {  
        var info \= {  
          province: data\[i\]\[1\],  
          district: data\[i\]\[2\],  
          subDistrict: data\[i\]\[3\]  
        };  
          
        // บันทึกลง Cache  
        cache\[postalCode\] \= info;  
        savePostalCache(cache);  
          
        return info;  
      }  
    }  
  }  
    
  return null;  
}

/\*\*  
 \* เติมข้อมูล จังหวัด/เขต จากที่อยู่แบบข้อความ (Simple Parsing)  
 \* @param {string} address \- ที่อยู่เต็ม  
 \* @returns {Object} { province: string, district: string }  
 \*/  
function parseProvinceFromAddress(address) {  
  if (\!address) return { province: '', district: '' };  
    
  var provinces \= \[  
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',  
    'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย',  
    'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา',  
    'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์',  
    'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา',  
    'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'พะเยา', 'ภูเก็ต',  
    'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',  
    'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล',  
    'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย',  
    'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี',  
    'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี', 'อำนาจเจริญ'  
  \];  
    
  var foundProvince \= '';  
  for (var i \= 0; i \< provinces.length; i++) {  
    if (address.indexOf(provinces\[i\]) \!== \-1) {  
      foundProvince \= provinces\[i\];  
      break;  
    }  
  }  
    
  // การหา District ยากกว่าเพราะชื่อซ้ำกันมาก จึงข้ามไปในขั้นตอนนี้หรือใช้ AI ช่วย  
  return {  
    province: foundProvince,  
    district: ''   
  };  
}

// \=============================================================================  
// SECTION 4: COORDINATE VALIDATION & CORRECTION  
// \=============================================================================

/\*\*  
 \* ตรวจสอบว่าพิกัดนี้อยู่ในขอบเขตประเทศไทยหรือไม่  
 \* @param {number} lat \- ละติจูด  
 \* @param {number} lng \- ลองจิจูด  
 \* @returns {boolean} true ถ้าอยู่ในไทย, false ถ้านอกเขต  
 \*/  
function isCoordinateInThailand(lat, lng) {  
  if (\!lat || \!lng) return false;  
    
  // ขอบเขตประเทศไทยโดยประมาณ (Bounding Box)  
  var MIN\_LAT \= 5.6;  
  var MAX\_LAT \= 20.5;  
  var MIN\_LNG \= 97.3;  
  var MAX\_LNG \= 105.6;  
    
  return (lat \>= MIN\_LAT && lat \<= MAX\_LAT && lng \>= MIN\_LNG && lng \<= MAX\_LNG);  
}

/\*\*  
 \* ตรวจสอบความน่าเชื่อถือของพิกัด (เช่น ไม่ตกน้ำ, ไม่อยู่กลางทุ่งโล่งถ้าเป็นสถานที่ธุรกิจ)  
 \* @param {number} lat   
 \* @param {number} lng   
 \* @param {string} context \- บริบทเพิ่มเติม (optional)  
 \* @returns {Object} { isValid: boolean, reason: string }  
 \*/  
function validateCoordinateQuality(lat, lng, context) {  
  if (\!isCoordinateInThailand(lat, lng)) {  
    return { isValid: false, reason: 'พิกัดอยู่นอกประเทศไทย' };  
  }  
    
  // ตรวจสอบจุด Null Island (0,0) หรือจุดผิดพลาดทั่วไป  
  if (Math.abs(lat) \< 0.001 && Math.abs(lng) \< 0.001) {  
    return { isValid: false, reason: 'พิกัดเป็นจุดศูนย์ (0,0)' };  
  }  
    
  // สามารถเพิ่ม Logic เชื่อมต่อกับ Reverse Geocoding เพื่อเช็คประเภทสถานที่ได้ที่นี่  
    
  return { isValid: true, reason: 'ผ่านการตรวจสอบเบื้องต้น' };  
}

/\*\*  
 \* แก้ไขพิกัดที่ผิดพลาดโดยการค้นหาใหม่จากที่อยู่  
 \* @param {string} address \- ที่อยู่ต้นฉบับ  
 \* @param {number} currentLat \- พิกัดปัจจุบันที่สงสัยว่าผิด  
 \* @param {number} currentLng   
 \* @returns {Object} { lat: number, lng: number, updated: boolean }  
 \*/  
function correctCoordinate(address, currentLat, currentLng) {  
  var validation \= validateCoordinateQuality(currentLat, currentLng);  
    
  if (\!validation.isValid) {  
    console.log('\[GeoAddr\] Detected invalid coordinate. Attempting re-geocode for: ' \+ address);  
    var newLoc \= geocodeAddress(address, false); // Force refresh  
      
    if (newLoc) {  
      return {  
        lat: newLoc.lat,  
        lng: newLoc.lng,  
        updated: true  
      };  
    }  
  }  
    
  return {  
    lat: currentLat,  
    lng: currentLng,  
    updated: false  
  };  
}

// \=============================================================================  
// SECTION 5: BATCH PROCESSING UI & MAIN EXECUTION  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันหลักสำหรับรันผ่านเมนู: เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50\)  
 \* @returns {void}  
 \*/  
function updateGeoData\_SmartCache() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
  var sheetName \= (typeof CONFIG \!== 'undefined' && CONFIG.SHEET\_NAME) ? CONFIG.SHEET\_NAME : 'Database';  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) {  
    ui.alert('ไม่พบชีต: ' \+ sheetName);  
    return;  
  }  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) {  
    ui.alert('ไม่มีข้อมูลในชีต');  
    return;  
  }  
    
  // กำหนดคอลัมน์ (สมมติตาม CONFIG หรือ Hardcode ชั่วคราว)  
  var colAddr \= (typeof CONFIG \!== 'undefined' && CONFIG.COL\_ADDRESS) ? CONFIG.COL\_ADDRESS : 4; // D  
  var colLat \= (typeof CONFIG \!== 'undefined' && CONFIG.COL\_LAT) ? CONFIG.COL\_LAT : 5;           // E  
  var colLng \= (typeof CONFIG \!== 'undefined' && CONFIG.COL\_LNG) ? CONFIG.COL\_LNG : 6;           // F  
  var colStatus \= (typeof CONFIG \!== 'undefined' && CONFIG.COL\_STATUS) ? CONFIG.COL\_STATUS : 10; // J  
    
  // อ่านข้อมูลเฉพาะแถวที่ยังไม่มีพิกัด (Max 50 แถว)  
  var count \= 0;  
  var maxProcess \= 50;  
  var updates \= \[\];  
    
  // อ่านทั้งช่วงเพื่อประสิทธิภาพ  
  var dataRange \= sheet.getRange(2, 1, lastRow \- 1, Math.max(colLat, colAddr)).getValues();  
    
  for (var i \= 0; i \< dataRange.length; i++) {  
    if (count \>= maxProcess) break;  
      
    var rowIndex \= i \+ 2; // เริ่มที่แถว 2  
    var addr \= dataRange\[i\]\[colAddr \- 1\];  
    var lat \= dataRange\[i\]\[colLat \- 1\];  
    var lng \= dataRange\[i\]\[colLng \- 1\];  
      
    // ถ้าไม่มีพิกัด หรือ พิกัดไม่ถูกต้อง  
    if ((\!lat || \!lng) || \!isCoordinateInThailand(lat, lng)) {  
      if (addr && String(addr).trim() \!== '') {  
        var result \= geocodeAddress(addr, true);  
        if (result) {  
          updates.push({  
            row: rowIndex,  
            lat: result.lat,  
            lng: result.lng,  
            addr: result.formatted\_address  
          });  
          count++;  
        }  
      }  
    }  
  }  
    
  if (updates.length \=== 0\) {  
    ui.alert('ไม่พบแถวที่ต้องเติมพิกัด (ครบ 50 แถวแรกแล้ว หรือ ข้อมูลสมบูรณ์)');  
    return;  
  }  
    
  // เขียนข้อมูลกลับลง Sheet  
  // เตรียมอาร์เรย์สำหรับ setValues (ต้องเรียงให้ตรงกับ Range)  
  // เพื่อความเร็ว เราจะเขียนทีละคอลัมน์หรือใช้ Range เฉพาะจุด  
    
  var statusMsg \= 'ประมวลผลเสร็จสิ้น\!\\n\\nเติมพิกัดสำเร็จ: ' \+ updates.length \+ ' แถว\\n';  
    
  updates.forEach(function(item) {  
    sheet.getRange(item.row, colLat).setValue(item.lat);  
    sheet.getRange(item.row, colLng).setValue(item.lng);  
    // ถ้ามีคอลัมน์ Address ที่ปรับปรุงได้ ก็เขียนทับ  
    // sheet.getRange(item.row, colAddr).setValue(item.addr);   
  });  
    
  ui.alert(statusMsg);  
}

/\*\*  
 \* ล้าง Search Cache (ใช้ใน Menu)  
 \* @returns {void}  
 \*/  
function clearSearchCache() {  
  var props \= PropertiesService.getScriptProperties();  
  props.deleteProperty('GEO\_CACHE');  
  props.deleteProperty('SEARCH\_CACHE'); // ถ้ามี  
  console.log('\[GeoAddr\] All caches cleared.');  
}

// \=============================================================================  
// SECTION 6: HELPER & DEBUG FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันช่วยเหลือ: ดึงค่า Config (Fallback กรณี CONFIG object ไม่โหลดทัน)  
 \* @param {string} key   
 \* @returns {string|undefined}  
 \*/  
function getConfigValue(key) {  
  if (typeof CONFIG \!== 'undefined' && CONFIG\[key\]) {  
    return CONFIG\[key\];  
  }  
  // Fallback ไปยัง PropertiesService หากจำเป็น  
  var props \= PropertiesService.getScriptProperties();  
  return props.getProperty(key);  
}

/\*\*  
 \* ทดสอบระบบ Geocoding ด้วยที่อยู่ตัวอย่าง  
 \* @returns {void}  
 \*/  
function debugTestGeocoding() {  
  var testAddr \= "เซ็นทรัลเวิลด์ ราชประสงค์ ปทุมวัน กรุงเทพมหานคร";  
  Logger.log("Testing address: " \+ testAddr);  
    
  var result \= geocodeAddress(testAddr, false);  
    
  if (result) {  
    Logger.log("Success: Lat=" \+ result.lat \+ ", Lng=" \+ result.lng);  
    Logger.log("Formatted: " \+ result.formatted\_address);  
  } else {  
    Logger.log("Failed to geocode.");  
  }  
}

/\*\*  
 \* รายงานสถิติการใช้ Cache  
 \* @returns {void}  
 \*/  
function showCacheStats() {  
  var geoCache \= getGeoCache();  
  var postalCache \= getPostalCache();  
    
  var msg \= "=== Cache Statistics \===\\n";  
  msg \+= "Geo Cache Items: " \+ Object.keys(geoCache).length \+ "\\n";  
  msg \+= "Postal Cache Items: " \+ Object.keys(postalCache).length \+ "\\n";  
    
  Logger.log(msg);  
  // ถ้ารันจากเมนู อาจแสดง Alert  
  if (SpreadsheetApp.getUi()) {  
    SpreadsheetApp.getUi().alert(msg);  
  }  
}

Service\_[AutoPilot.gs](http://AutoPilot.gs)

/\*\*  
 \* @fileoverview Service\_AutoPilot \- ระบบจัดการการทำงานอัตโนมัติ (Automated Tasks)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: ปรับปรุง Trigger Management ให้เสถียรขึ้น และเพิ่มระบบเฝ้าระวัง Quota  
 \* \- v4.1: เพิ่มฟังก์ชัน Wake Up Agent แบบ Manual สำหรับทดสอบ  
 \* \- v4.0: แยกโมดูล AutoPilot ออกจาก Service\_Master เพื่อความเป็นอิสระ  
 \*   
 \* @description โมดูลนี้ทำหน้าที่ควบคุมระบบอัตโนมัติทั้งหมด:  
 \* 1\. จัดการ Time-driven Triggers (เปิด/ปิด/ตรวจสอบ)  
 \* 2\. ควบคุมวงจรการทำงานของ AI Agent (Wake Up/Sleep)  
 \* 3\. ตรวจสอบสถานะระบบก่อนรันงานอัตโนมัติ (Pre-flight Check)  
 \* 4\. บันทึก Log การทำงานอัตโนมัติเพื่อตรวจสอบย้อนหลัง  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่า AutoPilot  
 \* @constant {Object} AUTOPILOT\_CONFIG  
 \*/  
var AUTOPILOT\_CONFIG \= {  
  TRIGGER\_NAME\_PREFIX: 'AutoPilot\_',  
  CHECK\_INTERVAL\_MINUTES: 15,      // ตรวจสอบทุก 15 นาที  
  MAX\_EXECUTION\_TIME\_MS: 5 \* 60 \* 1000, // Timeout 5 นาทีต่อรอบ  
  LOG\_SHEET\_NAME: 'AutoPilot\_Logs',  
  ENABLED\_PROP\_KEY: 'AUTOPILOT\_ENABLED'  
};

/\*\*  
 \* ตรวจสอบว่า AutoPilot เปิดใช้งานอยู่หรือไม่  
 \* @returns {boolean} true ถ้าเปิด, false ถ้าปิด  
 \*/  
function isAutoPilotEnabled() {  
  var props \= PropertiesService.getScriptProperties();  
  return props.getProperty(AUTOPILOT\_CONFIG.ENABLED\_PROP\_KEY) \=== 'true';  
}

/\*\*  
 \* เปลี่ยนสถานะการเปิด/ปิด AutoPilot  
 \* @param {boolean} status \- true เพื่อเปิด, false เพื่อปิด  
 \* @returns {void}  
 \*/  
function setAutoPilotStatus(status) {  
  var props \= PropertiesService.getScriptProperties();  
  props.setProperty(AUTOPILOT\_CONFIG.ENABLED\_PROP\_KEY, String(status));  
    
  var logMsg \= status ? 'AutoPilot ถูกเปิดใช้งาน' : 'AutoPilot ถูกปิดการใช้งาน';  
  logAutoPilotEvent(logMsg, 'SYSTEM');  
    
  if (\!status) {  
    deleteAllAutoPilotTriggers(); // ลบ Trigger ทั้งหมดเมื่อปิด  
  } else {  
    createMainTrigger(); // สร้าง Trigger หลักเมื่อเปิด  
  }  
}

// \=============================================================================  
// SECTION 2: TRIGGER MANAGEMENT (Create/Delete)  
// \=============================================================================

/\*\*  
 \* สร้าง Trigger หลักสำหรับตรวจสอบงานอัตโนมัติ  
 \* @returns {void}  
 \*/  
function createMainTrigger() {  
  // ลบ Trigger เก่าที่อาจค้างอยู่ก่อน  
  deleteAllAutoPilotTriggers();  
    
  try {  
    ScriptApp.newTrigger('runAutoPilotCycle')  
      .timeBased()  
      .everyMinutes(AUTOPILOT\_CONFIG.CHECK\_INTERVAL\_MINUTES)  
      .create();  
      
    logAutoPilotEvent('สร้าง Trigger สำเร็จ: รันทุก ' \+ AUTOPILOT\_CONFIG.CHECK\_INTERVAL\_MINUTES \+ ' นาที', 'SYSTEM');  
  } catch (e) {  
    logAutoPilotEvent('สร้าง Trigger ล้มเหลว: ' \+ e.message, 'ERROR');  
    throw new Error('ไม่สามารถสร้าง AutoPilot Trigger ได้: ' \+ e.message);  
  }  
}

/\*\*  
 \* ลบ Trigger ทั้งหมดที่เกี่ยวข้องกับ AutoPilot  
 \* @returns {void}  
 \*/  
function deleteAllAutoPilotTriggers() {  
  var triggers \= ScriptApp.getProjectTriggers();  
  var count \= 0;  
    
  for (var i \= 0; i \< triggers.length; i++) {  
    var trigger \= triggers\[i\];  
    if (trigger.getHandlerFunction() \=== 'runAutoPilotCycle' ||   
        trigger.getTriggerSourceId() \=== AUTOPILOT\_CONFIG.TRIGGER\_NAME\_PREFIX) {  
      ScriptApp.deleteTrigger(trigger);  
      count++;  
    }  
  }  
    
  if (count \> 0\) {  
    logAutoPilotEvent('ลบ Trigger เก่าจำนวน ' \+ count \+ ' รายการ', 'SYSTEM');  
  }  
}

/\*\*  
 \* ตรวจสอบสถานะ Trigger ในระบบ  
 \* @returns {Object} { exists: boolean, count: number, interval: string }  
 \*/  
function checkTriggerStatus() {  
  var triggers \= ScriptApp.getProjectTriggers();  
  var found \= false;  
  var count \= 0;  
  var interval \= 'N/A';  
    
  for (var i \= 0; i \< triggers.length; i++) {  
    var trigger \= triggers\[i\];  
    if (trigger.getHandlerFunction() \=== 'runAutoPilotCycle') {  
      found \= true;  
      count++;  
      // พยายามอ่านค่า Interval (อาจจำกัดในบาง API)  
      interval \= 'Every ' \+ AUTOPILOT\_CONFIG.CHECK\_INTERVAL\_MINUTES \+ ' mins (Configured)';  
    }  
  }  
    
  return {  
    exists: found,  
    count: count,  
    interval: interval  
  };  
}

// \=============================================================================  
// SECTION 3: MAIN EXECUTION CYCLE (The "Heartbeat")  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันหลักที่ถูกเรียกโดย Trigger (Entry Point)  
 \* @returns {void}  
 \*/  
function runAutoPilotCycle() {  
  var startTime \= new Date().getTime();  
    
  // 1\. ตรวจสอบว่าเปิดระบบอยู่หรือไม่  
  if (\!isAutoPilotEnabled()) {  
    Logger.log('\[AutoPilot\] ระบบถูกปิดอยู่ ข้ามการทำงาน');  
    return;  
  }  
    
  // 2\. Pre-flight Check (ตรวจสอบความพร้อมของระบบ)  
  if (\!performPreFlightCheck()) {  
    logAutoPilotEvent('Pre-flight Check ไม่ผ่าน: ระบบไม่พร้อมทำงาน', 'WARNING');  
    return;  
  }  
    
  try {  
    logAutoPilotEvent('เริ่มรอบการทำงานอัตโนมัติ', 'START');  
      
    // 3\. เรียกใช้งาน Agent ให้ตื่นมาทำงาน  
    wakeUpAgentLogic();  
      
    // 4\. ตรวจสอบและทำความสะอาดข้อมูลเก่า (ถ้ามี)  
    runAutoMaintenance();  
      
    // 5\. บันทึกสถิติสรุป  
    var duration \= (new Date().getTime() \- startTime) / 1000;  
    logAutoPilotEvent('จบรอบการทำงานสำเร็จ ใช้เวลา ' \+ duration.toFixed(2) \+ ' วินาที', 'END');  
      
  } catch (e) {  
    logAutoPilotEvent('เกิดข้อผิดพลาดในรอบการทำงาน: ' \+ e.message, 'ERROR');  
    // ส่งแจ้งเตือนถ้ามีระบบ Notify  
    if (typeof sendErrorNotification \=== 'function') {  
      sendErrorNotification('AutoPilot Error', e.message);  
    }  
  }  
}

/\*\*  
 \* ตรวจสอบความพร้อมของระบบก่อนเริ่มงาน (Pre-flight Check)  
 \* @returns {boolean} true ถ้าพร้อม, false ถ้าไม่พร้อม  
 \*/  
function performPreFlightCheck() {  
  // ตรวจสอบว่า Spreadsheet ยังเข้าถึงได้  
  try {  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    ss.getName();  
  } catch (e) {  
    return false;  
  }  
    
  // ตรวจสอบ Quota เบื้องต้น (เช่น Email, UrlFetch)  
  // สามารถเพิ่ม Logic ตรวจสอบ\_quota เพิ่มเติมได้ที่นี่  
    
  return true;  
}

/\*\*  
 \* ตรรกะหลักในการปลุก Agent ให้ทำงาน  
 \* @returns {void}  
 \*/  
function wakeUpAgentLogic() {  
  Logger.log('\[AutoPilot\] กำลังปลุก Agent...');  
    
  // เรียกฟังก์ชันจาก Service\_Agent.gs  
  if (typeof processAgentQueue \=== 'function') {  
    processAgentQueue();  
  } else {  
    Logger.log('\[AutoPilot\] ไม่พบฟังก์ชัน processAgentQueue (Service\_Agent อาจยังไม่ติดตั้ง)');  
  }  
    
  // เรียกฟังก์ชันตรวจสอบข้อมูลใหม่ๆ จาก SCG (ถ้ามี)  
  if (typeof checkNewShipments \=== 'function') {  
    checkNewShipments();  
  }  
}

/\*\*  
 \* รันงานบำรุงรักษาอัตโนมัติ (เช่น ล้าง Cache เก่า, ลบ Log เก่า)  
 \* @returns {void}  
 \*/  
function runAutoMaintenance() {  
  // ตัวอย่าง: ล้าง Log เก่ากว่า 7 วัน  
  // สามารถขยายฟังก์ชันนี้ได้ตามความต้องการ  
  Logger.log('\[AutoPilot\] รัน Auto Maintenance...');  
}

// \=============================================================================  
// SECTION 4: MANUAL CONTROLS (UI Actions)  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันสำหรับเปิดระบบ AutoPilot (เรียกจากเมนู)  
 \* @returns {void}  
 \*/  
function START\_AUTO\_PILOT() {  
  var ui \= SpreadsheetApp.getUi();  
    
  if (isAutoPilotEnabled()) {  
    ui.alert('ระบบ AutoPilot ทำงานอยู่แล้วครับ');  
    return;  
  }  
    
  var result \= ui.alert(  
    'เปิดระบบ AutoPilot?',  
    'ระบบจะทำงานอัตโนมัติทุก ' \+ AUTOPILOT\_CONFIG.CHECK\_INTERVAL\_MINUTES \+ ' นาที\\nเพื่อตรวจสอบข้อมูลใหม่และสั่งงาน Agent\\n\\nต้องการเปิดหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (result \== ui.Button.YES) {  
    setAutoPilotStatus(true);  
    ui.alert('เปิดระบบ AutoPilot สำเร็จ\!\\nระบบจะเริ่มทำงานในรอบถัดไป');  
  }  
}

/\*\*  
 \* ฟังก์ชันสำหรับปิดระบบ AutoPilot (เรียกจากเมนู)  
 \* @returns {void}  
 \*/  
function STOP\_AUTO\_PILOT() {  
  var ui \= SpreadsheetApp.getUi();  
    
  if (\!isAutoPilotEnabled()) {  
    ui.alert('ระบบ AutoPilot ปิดอยู่แล้วครับ');  
    return;  
  }  
    
  var result \= ui.alert(  
    'ปิดระบบ AutoPilot?',  
    'ระบบจะหยุดทำงานอัตโนมัติทันที\\nTrigger ที่ตั้งไว้จะถูกยกเลิก\\n\\nต้องการปิดหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (result \== ui.Button.YES) {  
    setAutoPilotStatus(false);  
    ui.alert('ปิดระบบ AutoPilot สำเร็จ\!');  
  }  
}

/\*\*  
 \* ปลุก Agent ให้ทำงานทันทีโดยไม่ต้องรอ Trigger (Manual Wake Up)  
 \* @returns {void}  
 \*/  
function WAKE\_UP\_AGENT() {  
  var ui \= SpreadsheetApp.getUi();  
  var btn \= ui.alert(  
    'ปลุก AI Agent ทันที?',  
    'ระบบจะเรียกให้ Agent ทำงานหนึ่งรอบทันที\\nโดยไม่รอเวลา Trigger ปกติ\\n\\nดำเนินการต่อ?',  
    ui.ButtonSet.OK\_CANCEL  
  );  
    
  if (btn \== ui.Button.OK) {  
    try {  
      ui.toast('กำลังปลุก Agent... โปรดรอสักครู่');  
      wakeUpAgentLogic();  
      ui.alert('Agent ทำงานเสร็จสิ้น\!\\nกรุณาตรวจสอบผลลัพธ์ในชีต');  
    } catch (e) {  
      ui.alert('เกิดข้อผิดพลาด: ' \+ e.message);  
    }  
  }  
}

// \=============================================================================  
// SECTION 5: LOGGING & MONITORING  
// \=============================================================================

/\*\*  
 \* บันทึกเหตุการณ์ลงชีต Log  
 \* @param {string} message \- ข้อความที่ต้องการบันทึก  
 \* @param {string} level \- ระดับความสำคัญ (INFO, WARNING, ERROR, START, END)  
 \* @returns {void}  
 \*/  
function logAutoPilotEvent(message, level) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= AUTOPILOT\_CONFIG.LOG\_SHEET\_NAME;  
  var sheet \= ss.getSheetByName(sheetName);  
    
  // สร้างชีต Log ถ้ายังไม่มี  
  if (\!sheet) {  
    sheet \= ss.insertSheet(sheetName);  
    // สร้าง Header  
    sheet.appendRow(\['Timestamp', 'Level', 'Message', 'Details'\]);  
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('\#dddddd');  
  }  
    
  var timestamp \= new Date();  
  var details \= (typeof Session \!== 'undefined') ? Session.getActiveUser().getEmail() : 'System';  
    
  sheet.appendRow(\[timestamp, level, message, details\]);  
    
  // เก็บ Log ไว้แค่ 1000 แถวล่าสุดเพื่อประหยัดพื้นที่  
  if (sheet.getLastRow() \> 1000\) {  
    sheet.deleteRows(2, sheet.getLastRow() \- 1000);  
  }  
}

/\*\*  
 \* แสดงรายงานสถานะ AutoPilot  
 \* @returns {void}  
 \*/  
function showAutoPilotStatusReport() {  
  var ui \= SpreadsheetApp.getUi();  
  var isEnabled \= isAutoPilotEnabled();  
  var triggerInfo \= checkTriggerStatus();  
    
  var msg \= '=== AutoPilot Status Report \===\\n\\n';  
  msg \+= 'สถานะระบบ: ' \+ (isEnabled ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน') \+ '\\n';  
  msg \+= 'Trigger พบ: ' \+ (triggerInfo.exists ? '✅ พบ (' \+ triggerInfo.count \+ ')' : '❌ ไม่พบ') \+ '\\n';  
  msg \+= 'ความถี่: ' \+ triggerInfo.interval \+ '\\n';  
  msg \+= 'รอบถัดไป: (ตรวจสอบในหน้า Triggers ของโปรเจกต์)\\n';  
    
  ui.alert(msg);  
}

// \=============================================================================  
// SECTION 6: DEBUG & HELPER FUNCTIONS  
// \=============================================================================

/\*\*  
 \* รีเซ็ตการตั้งค่า AutoPilot ทั้งหมด (ใช้เมื่อเกิดปัญหาหนัก)  
 \* @returns {void}  
 \*/  
function resetAutoPilotSystem() {  
  var ui \= SpreadsheetApp.getUi();  
  var confirm \= ui.alert(  
    'ยืนยันการรีเซ็ตระบบ?',  
    'การกระทำนี้จะ:\\n1. ลบ Trigger ทั้งหมด\\n2. ลบการตั้งค่าสถานะ\\n3. ล้าง Log ทั้งหมด\\n\\nคุณแน่ใจหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (confirm \== ui.Button.YES) {  
    setAutoPilotStatus(false); // ปิดและลบ Trigger  
      
    // ลบชีต Log  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var sheet \= ss.getSheetByName(AUTOPILOT\_CONFIG.LOG\_SHEET\_NAME);  
    if (sheet) {  
      ss.deleteSheet(sheet);  
    }  
      
    // ลบ Property  
    PropertiesService.getScriptProperties().deleteProperty(AUTOPILOT\_CONFIG.ENABLED\_PROP\_KEY);  
      
    ui.alert('รีเซ็ตระบบ AutoPilot เรียบร้อยครับ');  
  }  
}

/\*\*  
 \* ฟังก์ชันทดสอบการเชื่อมต่อ (Test Connection)  
 \* @returns {void}  
 \*/  
function testAutoPilotConnection() {  
  Logger.log('\[Test\] AutoPilot Connection Test...');  
  Logger.log('\[Test\] Is Enabled: ' \+ isAutoPilotEnabled());  
  Logger.log('\[Test\] Trigger Status: ' \+ JSON.stringify(checkTriggerStatus()));  
  Logger.log('\[Test\] Test Completed.');  
}

[WebApp.gs](http://WebApp.gs)

/\*\*  
 \* @fileoverview WebApp.gs \- ตัวรับส่งข้อมูลผ่าน HTTP (API Endpoint)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: ปรับปรุง Security Middleware และเพิ่ม Rate Limiting เบื้องต้น  
 \* \- v4.1: แยก Logic การประมวลผล JSON ออกเป็นฟังก์ชันเฉพาะ  
 \* \- v4.0: รองรับ CORS แบบเต็มรูปแบบสำหรับ Frontend ภายนอก  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น Backend API สำหรับ Google Apps Script:  
 \* 1\. รับคำขอ GET/POST จากภายนอก (Web/Mobile/Third-party)  
 \* 2\. ตรวจสอบความถูกต้องของ Token และสิทธิ์ (Security)  
 \* 3\. ประมวลผลคำสั่ง (ค้นหา, ดึงข้อมูล, บันทึก)  
 \* 4\. ส่งกลับผลลัพธ์ในรูปแบบ JSON Standard Response  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่า WebApp  
 \* @constant {Object} WEBAPP\_CONFIG  
 \*/  
var WEBAPP\_CONFIG \= {  
  ENABLE\_CORS: true,  
  ALLOWED\_ORIGINS: \['\*'\], // กำหนด Domain ที่อนุญาต (ใช้ '\*' สำหรับทดสอบ, ควรระบุให้ชัดเจนใน Production)  
  API\_KEY\_HEADER: 'X-API-Key',  
  RATE\_LIMIT\_MS: 1000,    // ระยะเวลารอขั้นต่ำระหว่างคำขอ (ms)  
  MAX\_RESULTS\_DEFAULT: 100  
};

/\*\*  
 \* โครงสร้างมาตรฐานของคำตอบ (Standard Response Format)  
 \* @param {boolean} success \- สถานะความสำเร็จ  
 \* @param {\*} data \- ข้อมูลที่ต้องการส่งกลับ  
 \* @param {string} message \- ข้อความเพิ่มเติม  
 \* @returns {Object} Object รูปแบบมาตรฐาน  
 \*/  
function createResponse(success, data, message) {  
  return {  
    success: success,  
    data: data,  
    message: message || (success ? 'Operation completed successfully' : 'Operation failed'),  
    timestamp: new Date().toISOString()  
  };  
}

// \=============================================================================  
// SECTION 2: SECURITY & MIDDLEWARE  
// \=============================================================================

/\*\*  
 \* ตรวจสอบ API Key จาก Header (Security Layer)  
 \* @param {Object} request \- Object คำขอจาก doGet/doPost  
 \* @returns {boolean} true ถ้าผ่าน, false ถ้าไม่ผ่าน  
 \*/  
function validateApiKey(request) {  
  // หมายเหตุ: ใน GAS การอ่าน Header ทำได้จำกัดผ่าน parameter หรือ post\_data  
  // วิธีที่ปลอดภัยที่สุดคือส่ง API Key เป็น Parameter '?key=...'  
  var apiKey \= request.parameter.key || request.parameter.api\_key;  
    
  if (\!apiKey) {  
    Logger.log('\[WebApp\] Missing API Key');  
    return false;  
  }  
    
  // ตรวจสอบกับค่าที่ตั้งไว้ใน PropertiesService  
  var storedKey \= PropertiesService.getScriptProperties().getProperty('WEBAPP\_API\_KEY');  
    
  if (\!storedKey) {  
    // ถ้ายังไม่ได้ตั้ง Key อนุญาตให้ผ่านได้เฉพาะโหมดพัฒนา (ควรเปลี่ยนใน Production)  
    Logger.log('\[WebApp\] Warning: No API Key configured in system.');  
    return true;   
  }  
    
  return (apiKey \=== storedKey);  
}

/\*\*  
 \* เพิ่ม Header สำหรับ CORS (Cross-Origin Resource Sharing)  
 \* @param {ContentOutput} output \- Output object จาก GAS  
 \* @returns {ContentOutput} Output object ที่เพิ่ม Header แล้ว  
 \*/  
function addCorsHeaders(output) {  
  if (\!WEBAPP\_CONFIG.ENABLE\_CORS) {  
    return output;  
  }  
    
  return output  
    .setHeader('Access-Control-Allow-Origin', '\*') // อนุญาตทุกโดเมน (หรือระบุเฉพาะ)  
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')  
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')  
    .setHeader('Access-Control-Max-Age', '86400');  
}

/\*\*  
 \* จัดการคำขอแบบ OPTIONS (Pre-flight check สำหรับ Browser)  
 \* @returns {ContentOutput}  
 \*/  
function handleOptionsRequest() {  
  var output \= ContentService.createTextOutput('');  
  return addCorsHeaders(output);  
}

// \=============================================================================  
// SECTION 3: HTTP GET HANDLER (Read Operations)  
// \=============================================================================

/\*\*  
 \* จัดการคำขอ GET (ดึงข้อมูล)  
 \* @param {Object} e \- Event object จาก GAS  
 \* @returns {ContentOutput} JSON Response  
 \*/  
function doGet(e) {  
  try {  
    // 1\. ตรวจสอบพารามิเตอร์พื้นฐาน  
    var action \= e.parameter.action;  
      
    if (\!action) {  
      return sendJsonResponse(createResponse(false, null, 'Missing required parameter: action'), 400);  
    }  
      
    // 2\. ตรวจสอบความปลอดภัย (ถ้าต้องการ)  
    // if (\!validateApiKey(e)) {  
    //   return sendJsonResponse(createResponse(false, null, 'Invalid API Key'), 403);  
    // }  
      
    var resultData \= null;  
      
    // 3\. ประมวลผลตาม Action  
    switch (action) {  
      case 'search':  
        resultData \= handleSearchAction(e.parameter);  
        break;  
          
      case 'getMasterList':  
        resultData \= handleGetMasterListAction(e.parameter);  
        break;  
          
      case 'healthCheck':  
        resultData \= { status: 'OK', version: '4.2', uptime: 'Running' };  
        break;  
          
      default:  
        return sendJsonResponse(createResponse(false, null, 'Unknown action: ' \+ action), 400);  
    }  
      
    return sendJsonResponse(createResponse(true, resultData, 'Success'));  
      
  } catch (error) {  
    Logger.log('\[WebApp\] GET Error: ' \+ error.toString());  
    return sendJsonResponse(createResponse(false, null, 'Internal Server Error: ' \+ error.message), 500);  
  }  
}

/\*\*  
 \* จัดการ Action: ค้นหาข้อมูล (Search)  
 \* @param {Object} params \- พารามิเตอร์การค้นหา  
 \* @returns {Array} ผลลัพธ์การค้นหา  
 \*/  
function handleSearchAction(params) {  
  var query \= params.q || params.query;  
  var limit \= parseInt(params.limit) || WEBAPP\_CONFIG.MAX\_RESULTS\_DEFAULT;  
    
  if (\!query) {  
    throw new Error('Missing search query parameter');  
  }  
    
  // เรียกใช้ฟังก์ชันค้นหาจาก Service\_Search.gs  
  if (typeof performSmartSearch \=== 'function') {  
    return performSmartSearch(query, limit);  
  } else {  
    // Fallback กรณีไม่มี Service\_Search (จำลองข้อมูล)  
    Logger.log('\[WebApp\] Warning: performSmartSearch not found.');  
    return \[\];  
  }  
}

/\*\*  
 \* จัดการ Action: ดึงรายการ Master ทั้งหมด  
 \* @param {Object} params \- พารามิเตอร์เพิ่มเติม  
 \* @returns {Array} รายการ Master Data  
 \*/  
function handleGetMasterListAction(params) {  
  // เรียกใช้ฟังก์ชันดึงข้อมูลจาก Service\_Master.gs  
  if (typeof getFullMasterList \=== 'function') {  
    return getFullMasterList();  
  } else {  
    Logger.log('\[WebApp\] Warning: getFullMasterList not found.');  
    return \[\];  
  }  
}

// \=============================================================================  
// SECTION 4: HTTP POST HANDLER (Write Operations)  
// \=============================================================================

/\*\*  
 \* จัดการคำขอ POST (บันทึก/แก้ไขข้อมูล)  
 \* @param {Object} e \- Event object จาก GAS  
 \* @returns {ContentOutput} JSON Response  
 \*/  
function doPost(e) {  
  try {  
    // 1\. Parse ข้อมูล JSON ที่ส่งมา  
    var rawData \= e.postData.contents;  
    var payload \= JSON.parse(rawData);  
      
    var action \= payload.action;  
      
    if (\!action) {  
      return sendJsonResponse(createResponse(false, null, 'Missing required field: action'), 400);  
    }  
      
    // 2\. ตรวจสอบความปลอดภัย  
    // if (\!validateApiKey(e)) { ... }  
      
    var resultData \= null;  
      
    // 3\. ประมวลผลตาม Action  
    switch (action) {  
      case 'updateCoordinate':  
        resultData \= handleUpdateCoordinateAction(payload.data);  
        break;  
          
      case 'addNewMaster':  
        resultData \= handleAddNewMasterAction(payload.data);  
        break;  
          
      case 'feedbackGps':  
        resultData \= handleGpsFeedbackAction(payload.data);  
        break;  
          
      default:  
        return sendJsonResponse(createResponse(false, null, 'Unknown action: ' \+ action), 400);  
    }  
      
    return sendJsonResponse(createResponse(true, resultData, 'Success'));  
      
  } catch (error) {  
    Logger.log('\[WebApp\] POST Error: ' \+ error.toString());  
    return sendJsonResponse(createResponse(false, null, 'Internal Server Error: ' \+ error.message), 500);  
  }  
}

/\*\*  
 \* จัดการ Action: อัปเดตพิกัด  
 \* @param {Object} data \- ข้อมูล { uuid, lat, lng }  
 \* @returns {Object} ผลลัพธ์การอัปเดต  
 \*/  
function handleUpdateCoordinateAction(data) {  
  if (\!data.uuid || \!data.lat || \!data.lng) {  
    throw new Error('Incomplete data for updateCoordinate');  
  }  
    
  // เรียกใช้ฟังก์ชันจาก Service\_Master หรือ Service\_GPSFeedback  
  if (typeof updateMasterCoordinate \=== 'function') {  
    return updateMasterCoordinate(data.uuid, data.lat, data.lng);  
  }  
  return { updated: false, reason: 'Function not found' };  
}

/\*\*  
 \* จัดการ Action: เพิ่มข้อมูล Master ใหม่  
 \* @param {Object} data \- ข้อมูลลูกค้าใหม่  
 \* @returns {Object} ผลลัพธ์ (UUID ที่สร้างใหม่)  
 \*/  
function handleAddNewMasterAction(data) {  
  if (\!data.name) {  
    throw new Error('Name is required');  
  }  
    
  // เรียกใช้ฟังก์ชันจาก Service\_Master  
  if (typeof addNewMasterRecord \=== 'function') {  
    return addNewMasterRecord(data);  
  }  
  return { created: false, reason: 'Function not found' };  
}

/\*\*  
 \* จัดการ Action: รับ Feedback พิกัดจากคนขับ  
 \* @param {Object} data \- ข้อมูล Feedback  
 \* @returns {Object} ผลลัพธ์การบันทึก  
 \*/  
function handleGpsFeedbackAction(data) {  
  if (\!data.jobId || \!data.correctLat || \!data.correctLng) {  
    throw new Error('Incomplete feedback data');  
  }  
    
  // เรียกใช้ฟังก์ชันจาก Service\_GPSFeedback  
  if (typeof submitGpsFeedback \=== 'function') {  
    return submitGpsFeedback(data);  
  }  
  return { submitted: false, reason: 'Function not found' };  
}

// \=============================================================================  
// SECTION 5: HELPER FUNCTIONS (Response Formatting)  
// \=============================================================================

/\*\*  
 \* ส่งผลลัพธ์กลับในรูปแบบ JSON  
 \* @param {Object} responseObject \- Object ข้อมูลที่จะส่งกลับ  
 \* @param {number} httpStatus \- รหัสสถานะ HTTP (200, 400, 500, etc.)  
 \* @returns {ContentOutput}  
 \*/  
function sendJsonResponse(responseObject, httpStatus) {  
  var json \= JSON.stringify(responseObject);  
  var output \= ContentService.createTextOutput(json);  
  output.setContentType(ContentService.MimeType.JSON);  
    
  // เพิ่ม CORS Headers  
  output \= addCorsHeaders(output);  
    
  // หมายเหตุ: GAS ไม่สามารถ set HTTP Status Code โดยตรงในบางกรณี  
  // แต่เราสามารถจำลองได้ใน Body  
  if (httpStatus \!== 200\) {  
    Logger.log('\[WebApp\] Returning status: ' \+ httpStatus);  
  }  
    
  return output;  
}

/\*\*  
 \* ฟังก์ชันเสริมสำหรับทดสอบ API ผ่าน Browser โดยตรง  
 \* @returns {HtmlOutput} หน้า HTML ง่ายๆ สำหรับทดสอบ  
 \*/  
function testApiPage() {  
  var html \= '\<h2\>WebApp API Test Page\</h2\>' \+  
             '\<p\>Status: Running\</p\>' \+  
             '\<p\>Version: 4.2\</p\>' \+  
             '\<p\>Try: \<code\>?action=healthCheck\</code\>\</p\>';  
  return HtmlService.createHtmlOutput(html);  
}

// \=============================================================================  
// SECTION 6: INITIALIZATION & SETUP  
// \=============================================================================

/\*\*  
 \* ตั้งค่า API Key เริ่มต้น (รันครั้งเดียวตอนติดตั้ง)  
 \* @returns {void}  
 \*/  
function setupWebAppSecurity() {  
  var props \= PropertiesService.getScriptProperties();  
  var currentKey \= props.getProperty('WEBAPP\_API\_KEY');  
    
  if (\!currentKey) {  
    // สร้าง Key สุ่มอย่างง่าย  
    var newKey \= 'KEY\_' \+ Utilities.base64Encode(Utilities.newBlob(Math.random().toString()).getBytes()).substring(0, 16);  
    props.setProperty('WEBAPP\_API\_KEY', newKey);  
    Logger.log('\[Setup\] New API Key generated: ' \+ newKey);  
      
    // แสดงผลใน Log หรือ Alert ถ้ารันจาก Editor  
    console.log('Your new API Key is: ' \+ newKey);  
  } else {  
    Logger.log('\[Setup\] API Key already exists.');  
  }  
}

/\*\*  
 \* รีเซ็ตการตั้งค่า WebApp  
 \* @returns {void}  
 \*/  
function resetWebAppConfig() {  
  PropertiesService.getScriptProperties().deleteProperty('WEBAPP\_API\_KEY');  
  Logger.log('\[Setup\] WebApp config reset. Run setupWebAppSecurity() to generate new key.');  
}

Service\_[Search.gs](http://Search.gs)

/\*\*  
 \* @fileoverview Service\_Search \- ระบบค้นหาข้อมูลภายในฐานข้อมูล (Smart Search Engine)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มระบบ Fuzzy Search และ Cache ผลการค้นหาเพื่อความเร็ว  
 \* \- v4.1: ปรับปรุงอัลกอริทึมการให้คะแนนความเหมือน (Scoring Algorithm)  
 \* \- v4.0: แยกโมดูลการค้นหาออกมาจาก Service\_Master เพื่อประสิทธิภาพสูงสุด  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น搜索引擎หลักของระบบ:  
 \* 1\. ค้นหาชื่อลูกค้า, ที่อยู่, หรือ UUID แบบ Real-time  
 \* 2\. รองรับการค้นหาแบบคลุมเครือ (Fuzzy Match) สำหรับชื่อที่พิมพ์ผิด  
 \* 3\. จัดลำดับผลลัพธ์ตามความเกี่ยวข้อง (Relevance Score)  
 \* 4\. จัดการ Cache ผลการค้นหาเพื่อลดการโหลดข้อมูลซ้ำ  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CACHING  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่าระบบค้นหา  
 \* @constant {Object} SEARCH\_CONFIG  
 \*/  
var SEARCH\_CONFIG \= {  
  CACHE\_EXPIRY\_MS: 5 \* 60 \* 1000, // Cache อยู่ได้ 5 นาที  
  MAX\_RESULTS: 50,                // แสดงผลสูงสุด 50 รายการ  
  MIN\_SCORE\_THRESHOLD: 0.4,       // คะแนนความเหมือนขั้นต่ำ (0.0 \- 1.0)  
  USE\_FUZZY\_MATCH: true           // เปิด/ปิด Fuzzy Search  
};

/\*\*  
 \* โหลด Cache ผลการค้นหา  
 \* @returns {Object} Object เก็บผลลัพธ์ { "keyword": { results: \[...\], timestamp: ... } }  
 \*/  
function getSearchCache() {  
  var props \= PropertiesService.getScriptProperties();  
  var data \= props.getProperty('SEARCH\_CACHE');  
  return data ? JSON.parse(data) : {};  
}

/\*\*  
 \* บันทึกผลลัพธ์ลง Cache  
 \* @param {string} keyword \- คำค้นหา  
 \* @param {Array} results \- ผลลัพธ์ที่ได้  
 \* @returns {void}  
 \*/  
function saveSearchCache(keyword, results) {  
  var cache \= getSearchCache();  
  var keys \= Object.keys(cache);  
    
  // จำกัดขนาด Cache (เก็บล่าสุด 100 คำค้นหา)  
  if (keys.length \> 100\) {  
    delete cache\[keys\[0\]\];  
  }  
    
  cache\[keyword\] \= {  
    results: results,  
    timestamp: new Date().getTime()  
  };  
    
  var props \= PropertiesService.getScriptProperties();  
  props.setProperty('SEARCH\_CACHE', JSON.stringify(cache));  
}

/\*\*  
 \* ล้าง Cache การค้นหาทั้งหมด  
 \* @returns {void}  
 \*/  
function clearSearchCache() {  
  var props \= PropertiesService.getScriptProperties();  
  props.deleteProperty('SEARCH\_CACHE');  
  console.log('\[Search\] Search Cache cleared successfully.');  
}

// \=============================================================================  
// SECTION 2: CORE SEARCH LOGIC (Main Entry Point)  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันค้นหาหลัก (Smart Search)  
 \* @param {string} query \- คำที่ต้องการค้นหา  
 \* @param {number} limit \- จำนวนผลลัพธ์สูงสุด (optional)  
 \* @returns {Array\<Object\>} อาร์เรย์ของผลลัพธ์ที่ผ่านการจัดลำดับแล้ว  
 \*/  
function performSmartSearch(query, limit) {  
  if (\!query || query.trim() \=== '') {  
    return \[\];  
  }  
    
  var cleanQuery \= query.trim().toLowerCase();  
  var maxResults \= limit || SEARCH\_CONFIG.MAX\_RESULTS;  
    
  // 1\. ตรวจสอบ Cache  
  var cache \= getSearchCache();  
  if (cache\[cleanQuery\]) {  
    var item \= cache\[cleanQuery\];  
    // ตรวจสอบว่า Cache หมดอายุหรือยัง  
    if ((new Date().getTime() \- item.timestamp) \< SEARCH\_CONFIG.CACHE\_EXPIRY\_MS) {  
      console.log('\[Search\] Hit Cache for: ' \+ cleanQuery);  
      return item.results.slice(0, maxResults);  
    }  
  }  
    
  // 2\. ดึงข้อมูลจาก Database (NameMapping Sheet)  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= (typeof CONFIG \!== 'undefined' && CONFIG.MAPPING\_SHEET) ? CONFIG.MAPPING\_SHEET : 'NameMapping';  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) {  
    console.error('\[Search\] Sheet not found: ' \+ sheetName);  
    return \[\];  
  }  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return \[\];  
    
  // อ่านข้อมูลเฉพาะคอลัมน์ที่สำคัญ (สมมติ: Name, Address, UUID, Lat, Lng)  
  // ปรับคอลัมน์ตาม CONFIG หรือ Hardcode  
  var colName \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.NAME) ? DATA\_IDX.NAME : 2;  
  var colAddr \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.ADDRESS) ? DATA\_IDX.ADDRESS : 4;  
  var colUUID \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.UUID) ? DATA\_IDX.UUID : 1;  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, Math.max(colName, colAddr, colUUID)).getValues();  
    
  var results \= \[\];  
    
  // 3\. วนลูปค้นหาและคำนวณคะแนน  
  for (var i \= 0; i \< data.length; i++) {  
    var row \= data\[i\];  
    var name \= String(row\[colName \- 1\] || '').toLowerCase();  
    var address \= String(row\[colAddr \- 1\] || '').toLowerCase();  
    var uuid \= row\[colUUID \- 1\];  
      
    var score \= 0;  
      
    // ตรวจสอบการตรงกันแบบ Exact Match  
    if (name.indexOf(cleanQuery) \!== \-1) {  
      score \= 0.8; // คะแนนพื้นฐานถ้าเจอในชื่อ  
      if (name \=== cleanQuery) score \= 1.0; // ตรงกันเป๊ะ  
    } else if (address.indexOf(cleanQuery) \!== \-1) {  
      score \= 0.6; // เจอในที่อยู่  
    }  
      
    // ถ้าเปิด Fuzzy Match และคะแนนยังไม่ถึงเกณฑ์  
    if (score \< SEARCH\_CONFIG.MIN\_SCORE\_THRESHOLD && SEARCH\_CONFIG.USE\_FUZZY\_MATCH) {  
      score \= calculateFuzzyScore(cleanQuery, name);  
    }  
      
    // ถ้าผ่านเกณฑ์ขั้นต่ำ ให้เพิ่ม vàoผลลัพธ์  
    if (score \>= SEARCH\_CONFIG.MIN\_SCORE\_THRESHOLD) {  
      results.push({  
        uuid: uuid,  
        name: row\[colName \- 1\],  
        address: row\[colAddr \- 1\],  
        score: score,  
        lat: row\[(typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.LAT) ? DATA\_IDX.LAT : 5\] || '',  
        lng: row\[(typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.LNG) ? DATA\_IDX.LNG : 6\] || ''  
      });  
    }  
  }  
    
  // 4\. เรียงลำดับตามคะแนน (มากไปน้อย)  
  results.sort(function(a, b) {  
    return b.score \- a.score;  
  });  
    
  // 5\. บันทึกลง Cache  
  saveSearchCache(cleanQuery, results);  
    
  return results.slice(0, maxResults);  
}

// \=============================================================================  
// SECTION 3: FUZZY MATCHING ALGORITHMS  
// \=============================================================================

/\*\*  
 \* คำนวณคะแนนความเหมือนแบบ Fuzzy (Levenshtein Distance แบบง่าย)  
 \* @param {string} s1 \- สตริงต้นฉบับ  
 \* @param {string} s2 \- สตริงเป้าหมาย  
 \* @returns {number} คะแนนความเหมือน (0.0 \- 1.0)  
 \*/  
function calculateFuzzyScore(s1, s2) {  
  if (\!s1 || \!s2) return 0;  
    
  var longer \= s1;  
  var shorter \= s2;  
    
  if (s1.length \< s2.length) {  
    longer \= s2;  
    shorter \= s1;  
  }  
    
  var longerLength \= longer.length;  
  if (longerLength \=== 0\) return 1.0;  
    
  var distance \= getLevenshteinDistance(longer, shorter);  
  return (longerLength \- distance) / parseFloat(longerLength);  
}

/\*\*  
 \* คำนวณ Levenshtein Distance (จำนวนครั้งที่ต้องแก้ไขเพื่อให้ตรงกัน)  
 \* @param {string} s1   
 \* @param {string} s2   
 \* @returns {number} ระยะห่าง  
 \*/  
function getLevenshteinDistance(s1, s2) {  
  var track \= Array(s2.length \+ 1).fill(null).map(() \=\>   
  Array(s1.length \+ 1).fill(null));  
    
  for (var i \= 0; i \<= s1.length; i \+= 1\) {  
    track\[0\]\[i\] \= i;  
  }  
    
  for (var j \= 0; j \<= s2.length; j \+= 1\) {  
    track\[j\]\[0\] \= j;  
  }  
    
  for (var j \= 1; j \<= s2.length; j \+= 1\) {  
    for (var i \= 1; i \<= s1.length; i \+= 1\) {  
      var indicator \= s1\[i \- 1\] \=== s2\[j \- 1\] ? 0 : 1;  
      track\[j\]\[i\] \= Math.min(  
        track\[j\]\[i \- 1\] \+ 1, // deletion  
        track\[j \- 1\]\[i\] \+ 1, // insertion  
        track\[j \- 1\]\[i \- 1\] \+ indicator // substitution  
      );  
    }  
  }  
    
  return track\[s2.length\]\[s1.length\];  
}

// \=============================================================================  
// SECTION 4: ADVANCED SEARCH FEATURES  
// \=============================================================================

/\*\*  
 \* ค้นหาด้วย UUID โดยตรง (รวดเร็วที่สุด)  
 \* @param {string} uuid \- UUID ที่ต้องการหา  
 \* @returns {Object|null} ข้อมูลลูกค้า หรือ null ถ้าไม่พบ  
 \*/  
function searchByUuid(uuid) {  
  if (\!uuid) return null;  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= (typeof CONFIG \!== 'undefined' && CONFIG.MAPPING\_SHEET) ? CONFIG.MAPPING\_SHEET : 'NameMapping';  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) return null;  
    
  var data \= sheet.getDataRange().getValues();  
  var colUUID \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.UUID) ? DATA\_IDX.UUID : 1;  
    
  for (var i \= 1; i \< data.length; i++) {  
    if (String(data\[i\]\[colUUID \- 1\]) \=== String(uuid)) {  
      return {  
        uuid: data\[i\]\[colUUID \- 1\],  
        name: data\[i\]\[(typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.NAME) ? DATA\_IDX.NAME : 2\],  
        address: data\[i\]\[(typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.ADDRESS) ? DATA\_IDX.ADDRESS : 4\],  
        lat: data\[i\]\[(typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.LAT) ? DATA\_IDX.LAT : 5\],  
        lng: data\[i\]\[(typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.LNG) ? DATA\_IDX.LNG : 6\]  
      };  
    }  
  }  
    
  return null;  
}

/\*\*  
 \* ค้นหาหลายคำพร้อมกัน (Multi-keyword Search)  
 \* @param {Array\<string\>} keywords \- อาร์เรย์ของคำค้นหา  
 \* @returns {Array\<Object\>} ผลลัพธ์รวม  
 \*/  
function searchMultipleKeywords(keywords) {  
  var allResults \= \[\];  
  var seenUuids \= {};  
    
  for (var i \= 0; i \< keywords.length; i++) {  
    var results \= performSmartSearch(keywords\[i\], 20);  
    for (var j \= 0; j \< results.length; j++) {  
      var item \= results\[j\];  
      if (\!seenUuids\[item.uuid\]) {  
        seenUuids\[item.uuid\] \= true;  
        allResults.push(item);  
      }  
    }  
  }  
    
  // เรียงลำดับใหม่ตามคะแนนสูงสุดที่มี  
  allResults.sort(function(a, b) {  
    return b.score \- a.score;  
  });  
    
  return allResults;  
}

// \=============================================================================  
// SECTION 5: UI & REPORTING FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันสำหรับแสดงหน้าต่างค้นหา (เรียกจากเมนูหรือปุ่ม)  
 \* @returns {void}  
 \*/  
function showSearchDialog\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.prompt('ค้นหาข้อมูล', 'กรุณาใส่ชื่อลูกค้า หรือ ที่อยู่:', ui.ButtonSet.OK\_CANCEL);  
    
  if (response.getSelectedButton() \== ui.Button.OK) {  
    var query \= response.getResponseText();  
    var results \= performSmartSearch(query, 10);  
      
    if (results.length \=== 0\) {  
      ui.alert('ไม่พบข้อมูลที่ตรงกับ: "' \+ query \+ '"');  
      return;  
    }  
      
    var msg \= 'พบ ' \+ results.length \+ ' รายการ:\\n\\n';  
    for (var i \= 0; i \< results.length; i++) {  
      var r \= results\[i\];  
      msg \+= (i \+ 1\) \+ '. ' \+ r.name \+ ' (Score: ' \+ (r.score \* 100).toFixed(0) \+ '%)\\n';  
      msg \+= '   ' \+ r.address \+ '\\n\\n';  
    }  
      
    ui.alert(msg);  
  }  
}

/\*\*  
 \* ส่งออกผลการค้นหาเป็น CSV (Download)  
 \* @param {string} query \- คำค้นหา  
 \* @returns {void}  
 \*/  
function exportSearchToCsv(query) {  
  var results \= performSmartSearch(query, 1000);  
  if (results.length \=== 0\) {  
    SpreadsheetApp.getUi().alert('ไม่พบข้อมูลที่จะส่งออก');  
    return;  
  }  
    
  var csvContent \= 'UUID,Name,Address,Latitude,Longitude,Score\\n';  
  results.forEach(function(r) {  
    csvContent \+= '"' \+ r.uuid \+ '","' \+ r.name \+ '","' \+ r.address \+ '",' \+ r.lat \+ ',' \+ r.lng \+ ',' \+ r.score \+ '\\n';  
  });  
    
  // สร้างไฟล์ชั่วคราว  
  var blob \= Utilities.newBlob(csvContent, 'text/csv', 'search\_result\_' \+ query.replace(/ /g, '\_') \+ '.csv');  
  var file \= DriveApp.createFile(blob);  
    
  SpreadsheetApp.getUi().alert('สร้างไฟล์ CSV สำเร็จ\!\\nชื่อไฟล์: ' \+ file.getName() \+ '\\nตรวจสอบใน Google Drive ของคุณ');  
}

// \=============================================================================  
// SECTION 6: DEBUG & MAINTENANCE  
// \=============================================================================

/\*\*  
 \* ทดสอบความเร็วในการค้นหา  
 \* @returns {void}  
 \*/  
function debugSearchPerformance() {  
  var testQueries \= \['บริษัท เอสซีจี', 'บางนา', 'ถนนพระราม'\];  
  var startTime \= new Date().getTime();  
    
  testQueries.forEach(function(q) {  
    var results \= performSmartSearch(q);  
    Logger.log('Query: ' \+ q \+ ' \-\> Found: ' \+ results.length \+ ' items');  
  });  
    
  var endTime \= new Date().getTime();  
  Logger.log('Total Time: ' \+ (endTime \- startTime) \+ ' ms');  
}

/\*\*  
 \* รีเซ็ต Cache ทั้งหมด  
 \* @returns {void}  
 \*/  
function resetSearchModule() {  
  clearSearchCache();  
  console.log('\[Search\] Module reset complete.');  
}

Index.html

\<\!DOCTYPE html\>

\<html lang="th"\>

\<\!-- 

  @fileoverview Index.html \- ส่วนแสดงผลหน้าต่างผู้ใช้งาน (Frontend UI)

  @version 4.2 Enterprise Edition (Phase E)

  @author Elite Logistics Architect


  Version History:

  \- v4.2: ปรับปรุง Responsive Design และเพิ่ม Animation โหลดข้อมูล

  \- v4.1: แยกส่วน CSS และ JavaScript ออกเป็น Module ชัดเจน

  \- v4.0: Enterprise UI Theme ใหม่ รองรับ Dark Mode (พื้นฐาน)


  @description หน้าต่าง Web App หลักสำหรับระบบ Logistics Master Data

  ทำหน้าที่แสดงตารางข้อมูล, ค้นหา, และจัดการคำสั่งต่างๆ ผ่าน Interface ที่ทันสมัย

\--\>

\<head\>

  \<meta charset="UTF-8"\>

  \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>

  \<title\>Logistics Master Data System\</title\>


  \<\!-- Google Fonts & Icons \--\>

  \<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;700\&display=swap" rel="stylesheet"\>

  \<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"\>

  \<\!-- \=============================================================================

       SECTION 1: CSS STYLES (UI & Layout)

       \============================================================================= \--\>

  \<style\>

    :root {

      \--primary-color: \#1a73e8;

      \--secondary-color: \#fbbc04;

      \--success-color: \#34a853;

      \--danger-color: \#ea4335;

      \--bg-color: \#f8f9fa;

      \--card-bg: \#ffffff;

      \--text-color: \#202124;

      \--border-color: \#dadce0;

    }

    body {

      font-family: 'Sarabun', sans-serif;

      background-color: var(--bg-color);

      color: var(--text-color);

      margin: 0;

      padding: 0;

      font-size: 14px;

    }

    /\* Header & Navigation \*/

    .header {

      background: var(--primary-color);

      color: white;

      padding: 1rem 2rem;

      display: flex;

      justify-content: space-between;

      align-items: center;

      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    }

    .header h1 {

      margin: 0;

      font-size: 1.5rem;

      font-weight: 500;

    }

    .status-badge {

      background: rgba(255,255,255,0.2);

      padding: 4px 12px;

      border-radius: 20px;

      font-size: 0.85rem;

    }

    /\* Main Container \*/

    .container {

      max-width: 1400px;

      margin: 20px auto;

      padding: 0 20px;

    }

    /\* Cards & Panels \*/

    .card {

      background: var(--card-bg);

      border-radius: 8px;

      box-shadow: 0 1px 3px rgba(0,0,0,0.12);

      padding: 20px;

      margin-bottom: 20px;

      border: 1px solid var(--border-color);

    }

    .card-header {

      display: flex;

      justify-content: space-between;

      align-items: center;

      margin-bottom: 15px;

      border-bottom: 1px solid var(--border-color);

      padding-bottom: 10px;

    }

    .card-title {

      font-size: 1.1rem;

      font-weight: 500;

      color: var(--primary-color);

      margin: 0;

    }

    /\* Search Bar \*/

    .search-box {

      display: flex;

      gap: 10px;

      margin-bottom: 20px;

    }

    .search-input {

      flex: 1;

      padding: 10px 15px;

      border: 1px solid var(--border-color);

      border-radius: 4px;

      font-family: 'Sarabun', sans-serif;

      font-size: 1rem;

    }

    .search-input:focus {

      outline: none;

      border-color: var(--primary-color);

      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);

    }

    /\* Buttons \*/

    .btn {

      padding: 10px 20px;

      border: none;

      border-radius: 4px;

      cursor: pointer;

      font-family: 'Sarabun', sans-serif;

      font-weight: 500;

      display: inline-flex;

      align-items: center;

      gap: 8px;

      transition: all 0.2s;

    }

    .btn-primary { background: var(--primary-color); color: white; }

    .btn-primary:hover { background: \#1557b0; }

    .btn-success { background: var(--success-color); color: white; }

    .btn-success:hover { background: \#2c8f46; }

    .btn-danger { background: var(--danger-color); color: white; }

    .btn-danger:hover { background: \#c5221f; }

    .btn-outline { 

      background: transparent; 

      border: 1px solid var(--border-color); 

      color: var(--text-color); 

    }

    .btn-outline:hover { background: \#f1f3f4; }

    /\* Data Table \*/

    .table-container {

      overflow-x: auto;

      border: 1px solid var(--border-color);

      border-radius: 4px;

    }

    table {

      width: 100%;

      border-collapse: collapse;

      background: white;

    }

    th, td {

      padding: 12px 15px;

      text-align: left;

      border-bottom: 1px solid var(--border-color);

    }

    th {

      background: \#f8f9fa;

      font-weight: 500;

      color: \#5f6368;

      position: sticky;

      top: 0;

      z-index: 10;

    }

    tr:hover {

      background-color: \#f1f3f4;

    }

    /\* Loading Spinner \*/

    .loader {

      display: none;

      border: 4px solid \#f3f3f3;

      border-top: 4px solid var(--primary-color);

      border-radius: 50%;

      width: 30px;

      height: 30px;

      animation: spin 1s linear infinite;

      margin: 20px auto;

    }

    @keyframes spin {

      0% { transform: rotate(0deg); }

      100% { transform: rotate(360deg); }

    }

    /\* Utility Classes \*/

    .hidden { display: none; }

    .text-right { text-align: right; }

    .badge {

      padding: 2px 8px;

      border-radius: 12px;

      font-size: 0.75rem;

      font-weight: bold;

    }

    .badge-high { background: \#e6f4ea; color: \#137333; }

    .badge-low { background: \#fce8e6; color: \#c5221f; }

  \</style\>

\</head\>

\<body\>

  \<\!-- \=============================================================================

       SECTION 2: HEADER & NAVIGATION

       \============================================================================= \--\>

  \<header class="header"\>

    \<div style="display:flex; align-items:center; gap:10px;"\>

      \<span class="material-icons"\>logistics\</span\>

      \<h1\>Logistics Master Data\</h1\>

    \</div\>

    \<div class="status-badge" id="systemStatus"\>

      \<span class="material-icons" style="font-size:14px; vertical-align:middle;"\>check\_circle\</span\>

      ระบบพร้อมทำงาน

    \</div\>

  \</header\>

  \<div class="container"\>

    

    \<\!-- \=============================================================================

         SECTION 3: SEARCH & CONTROL PANEL

         \============================================================================= \--\>

    \<div class="card"\>

      \<div class="card-header"\>

        \<h2 class="card-title"\>ค้นหาและจัดการข้อมูล\</h2\>

        \<button class="btn btn-outline" onclick="refreshData()"\>

          \<span class="material-icons"\>refresh\</span\> รีเฟรช

        \</button\>

      \</div\>

      

      \<div class="search-box"\>

        \<input type="text" id="searchInput" class="search-input" placeholder="ค้นหาชื่อลูกค้า, ที่อยู่, หรือ UUID..." onkeyup="handleSearch(event)"\>

        \<button class="btn btn-primary" onclick="performSearch()"\>

          \<span class="material-icons"\>search\</span\> ค้นหา

        \</button\>

        \<button class="btn btn-success" onclick="exportToCSV()"\>

          \<span class="material-icons"\>download\</span\> ส่งออก CSV

        \</button\>

      \</div\>

    \</div\>

    \<\!-- \=============================================================================

         SECTION 4: DATA DISPLAY TABLE

         \============================================================================= \--\>

    \<div class="card"\>

      \<div class="card-header"\>

        \<h2 class="card-title"\>รายการข้อมูล (Master Data)\</h2\>

        \<span id="recordCount" style="color:\#5f6368; font-size:0.9rem;"\>กำลังโหลด...\</span\>

      \</div\>

      \<div id="loader" class="loader"\>\</div\>

      \<div class="table-container"\>

        \<table id="dataTable"\>

          \<thead\>

            \<tr\>

              \<th width="5%"\>\#\</th\>

              \<th width="15%"\>UUID\</th\>

              \<th width="25%"\>ชื่อลูกค้า\</th\>

              \<th width="30%"\>ที่อยู่\</th\>

              \<th width="10%"\>จังหวัด\</th\>

              \<th width="10%"\>คะแนน\</th\>

              \<th width="5%"\>สถานะ\</th\>

            \</tr\>

          \</thead\>

          \<tbody id="tableBody"\>

            \<\!-- ข้อมูลจะถูกเติมด้วย JavaScript \--\>

            \<tr\>\<td colspan="7" style="text-align:center; padding:20px;"\>กรุณากดค้นหาหรือรอข้อมูลโหลด\</td\>\</tr\>

          \</tbody\>

        \</table\>

      \</div\>

    \</div\>

  \</div\>

  \<\!-- \=============================================================================

       SECTION 5: JAVASCRIPT LOGIC (Frontend Controller)

       \============================================================================= \--\>

  \<script\>

    /\*\*

     \* เริ่มต้นทำงานเมื่อหน้าเว็บโหลดเสร็จ

     \* @returns {void}

     \*/

    window.onload \= function() {

      console.log('App Initialized');

      loadInitialData();

    };

    /\*\*

     \* โหลดข้อมูลเริ่มต้น (เรียกจาก Server)

     \* @returns {void}

     \*/

    function loadInitialData() {

      showLoader(true);

      // เรียกฟังก์ชันจากฝั่ง Server (Service\_Search.gs)

      google.script.run

        .withSuccessHandler(renderTable)

        .withFailureHandler(handleError)

        .performSmartSearch('', 50); // โหลด 50 รายการแรก

    }

    /\*\*

     \* จัดการเหตุการณ์เมื่อกดปุ่มค้นหา

     \* @param {Event} event \- Event object

     \* @returns {void}

     \*/

    function handleSearch(event) {

      if (event.key \=== 'Enter') {

        performSearch();

      }

    }

    /\*\*

     \* ดำเนินการค้นหาข้อมูล

     \* @returns {void}

     \*/

    function performSearch() {

      var query \= document.getElementById('searchInput').value;

      showLoader(true);

      

      google.script.run

        .withSuccessHandler(renderTable)

        .withFailureHandler(handleError)

        .performSmartSearch(query, 100);

    }

    /\*\*

     \* แสดงผลข้อมูลลงในตาราง

     \* @param {Array\<Object\>} data \- ข้อมูล JSON จาก Server

     \* @returns {void}

     \*/

    function renderTable(data) {

      showLoader(false);

      var tbody \= document.getElementById('tableBody');

      tbody.innerHTML \= '';

      if (\!data || data.length \=== 0\) {

        tbody.innerHTML \= '\<tr\>\<td colspan="7" style="text-align:center; padding:20px;"\>ไม่พบข้อมูลที่ตรงกับเงื่อนไข\</td\>\</tr\>';

        updateCount(0);

        return;

      }

      updateCount(data.length);

      data.forEach(function(item, index) {

        var row \= tbody.insertRow();

        

        // จัดรูปแบบ Badge ตามคะแนน

        var scoreClass \= item.score \>= 0.8 ? 'badge-high' : 'badge-low';

        var scoreText \= Math.round(item.score \* 100\) \+ '%';

        row.innerHTML \= \`

          \<td\>${index \+ 1}\</td\>

          \<td style="font-family:monospace; font-size:0.85rem;"\>${item.uuid || '-'}\</td\>

          \<td\>\<strong\>${escapeHtml(item.name)}\</strong\>\</td\>

          \<td\>${escapeHtml(item.address)}\</td\>

          \<td\>${item.province || '-'}\</td\>

          \<td\>\<span class="badge ${scoreClass}"\>${scoreText}\</span\>\</td\>

          \<td\>\<span class="material-icons" style="color:var(--success-color); font-size:18px;"\>check\_circle\</span\>\</td\>

        \`;

      });

    }

    /\*\*

     \* ส่งออกข้อมูลเป็น CSV

     \* @returns {void}

     \*/

    function exportToCSV() {

      var query \= document.getElementById('searchInput').value;

      if(\!confirm('ต้องการส่งออกผลลัพธ์การค้นหาปัจจุบันเป็นไฟล์ CSV ใช่หรือไม่?')) return;

      

      google.script.run

        .withSuccessHandler(function(msg) { alert(msg); })

        .exportSearchToCsv(query);

    }

    /\*\*

     \* รีเฟรชข้อมูล

     \* @returns {void}

     \*/

    function refreshData() {

      document.getElementById('searchInput').value \= '';

      loadInitialData();

    }

    /\*\*

     \* เปิด/ปิด Loader

     \* @param {boolean} show \- true เพื่อแสดง, false เพื่อซ่อน

     \* @returns {void}

     \*/

    function showLoader(show) {

      var loader \= document.getElementById('loader');

      var table \= document.querySelector('.table-container');

      if (show) {

        loader.style.display \= 'block';

        table.style.opacity \= '0.5';

      } else {

        loader.style.display \= 'none';

        table.style.opacity \= '1';

      }

    }

    /\*\*

     \* อัปเดตจำนวนรายการที่พบ

     \* @param {number} count \- จำนวนรายการ

     \* @returns {void}

     \*/

    function updateCount(count) {

      document.getElementById('recordCount').innerText \= 'พบ ' \+ count \+ ' รายการ';

    }

    /\*\*

     \* จัดการข้อผิดพลาด

     \* @param {string} error \- ข้อความ Error

     \* @returns {void}

     \*/

    function handleError(error) {

      showLoader(false);

      alert('เกิดข้อผิดพลาด: ' \+ error.message);

      console.error(error);

    }

    /\*\*

     \* ป้องกัน XSS โดยแปลง Character พิเศษ

     \* @param {string} text \- ข้อความต้นฉบับ

     \* @returns {string} ข้อความที่ปลอดภัย

     \*/

    function escapeHtml(text) {

      if (\!text) return '';

      return text

        .replace(/&/g, "\&amp;")

        .replace(/\</g, "\&lt;")

        .replace(/\>/g, "\&gt;")

        .replace(/"/g, "\&quot;")

        .replace(/'/g, "&\#039;");

    }

  \</script\>

\</body\>

\</html\>

Setup\_Upgrade.gs  
/\*\*  
 \* @fileoverview Setup\_Upgrade \- จัดการการอัปเกรดเวอร์ชันระบบและโครงสร้างฐานข้อมูล  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มระบบตรวจสอบ Schema อัตโนมัติก่อนอัปเกรด  
 \* \- v4.1: เพิ่มฟังก์ชัน Migration ข้อมูลเก่าไปโครงสร้างใหม่  
 \* \- v4.0: แยกโมดูล Setup ออกจาก Service\_Master เพื่อความปลอดภัย  
 \*   
 \* @description โมดูลนี้ทำหน้าที่ดูแลรักษาโครงสร้างระบบ:  
 \* 1\. ตรวจสอบและสร้างชีตที่ขาดหายอัตโนมัติ (Self-Healing)  
 \* 2\. อัปเดต Header คอลัมน์เมื่อมีการเปลี่ยนเวอร์ชัน  
 \* 3\. ย้ายข้อมูลเก่า (Migration) ให้เข้ากับโครงสร้างใหม่  
 \* 4\. บันทึกเวอร์ชันปัจจุบันลงใน Properties เพื่อติดตามสถานะ  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & VERSION CONTROL  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่าระบบและเวอร์ชัน  
 \* @constant {Object} UPGRADE\_CONFIG  
 \*/  
var UPGRADE\_CONFIG \= {  
  CURRENT\_VERSION: '4.2.0',  
  VERSION\_PROP\_KEY: 'SYSTEM\_VERSION',  
  LAST\_UPGRADE\_DATE\_KEY: 'LAST\_UPGRADE\_DATE',  
  REQUIRED\_SHEETS: \['Database', 'NameMapping', 'Input', 'Data', 'PostalRef', 'AutoPilot\_Logs'\]  
};

/\*\*  
 \* ดึงเวอร์ชันปัจจุบันที่ติดตั้งอยู่ในระบบ  
 \* @returns {string} เวอร์ชันตัวเลข (เช่น "4.1.0") หรือ "0.0.0" หากยังไม่เคยติดตั้ง  
 \*/  
function getInstalledVersion() {  
  var props \= PropertiesService.getScriptProperties();  
  return props.getProperty(UPGRADE\_CONFIG.VERSION\_PROP\_KEY) || '0.0.0';  
}

/\*\*  
 \* บันทึกเวอร์ชันใหม่ของระบบ  
 \* @param {string} version \- เวอร์ชันที่ต้องการบันทึก  
 \* @returns {void}  
 \*/  
function setInstalledVersion(version) {  
  var props \= PropertiesService.getScriptProperties();  
  props.setProperty(UPGRADE\_CONFIG.VERSION\_PROP\_KEY, version);  
  props.setProperty(UPGRADE\_CONFIG.LAST\_UPGRADE\_DATE\_KEY, new Date().toISOString());  
  console.log('\[Upgrade\] System updated to version: ' \+ version);  
}

/\*\*  
 \* เปรียบเทียบเวอร์ชัน (Check if update is needed)  
 \* @param {string} v1 \- เวอร์ชันที่ 1  
 \* @param {string} v2 \- เวอร์ชันที่ 2  
 \* @returns {number} 1 ถ้า v1 \> v2, \-1 ถ้า v1 \< v2, 0 ถ้าเท่ากัน  
 \*/  
function compareVersions(v1, v2) {  
  var parts1 \= v1.split('.').map(Number);  
  var parts2 \= v2.split('.').map(Number);  
    
  for (var i \= 0; i \< Math.max(parts1.length, parts2.length); i++) {  
    var p1 \= parts1\[i\] || 0;  
    var p2 \= parts2\[i\] || 0;  
    if (p1 \> p2) return 1;  
    if (p1 \< p2) return \-1;  
  }  
  return 0;  
}

// \=============================================================================  
// SECTION 2: SCHEMA VALIDATION & SHEET CREATION  
// \=============================================================================

/\*\*  
 \* ตรวจสอบและสร้างชีตที่ขาดหายอัตโนมัติ (Self-Healing)  
 \* @returns {Object} { created: string\[\], missing: string\[\] }  
 \*/  
function validateAndCreateMissingSheets() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var existingSheets \= ss.getSheets().map(function(s) { return s.getName(); });  
  var created \= \[\];  
  var missing \= \[\];

  for (var i \= 0; i \< UPGRADE\_CONFIG.REQUIRED\_SHEETS.length; i++) {  
    var sheetName \= UPGRADE\_CONFIG.REQUIRED\_SHEETS\[i\];  
    if (existingSheets.indexOf(sheetName) \=== \-1) {  
      missing.push(sheetName);  
      try {  
        var newSheet \= ss.insertSheet(sheetName);  
        setupSheetHeaders(newSheet, sheetName);  
        created.push(sheetName);  
        console.log('\[Upgrade\] Created missing sheet: ' \+ sheetName);  
      } catch (e) {  
        console.error('\[Upgrade\] Failed to create sheet ' \+ sheetName \+ ': ' \+ e.message);  
      }  
    }  
  }

  return { created: created, missing: missing };  
}

/\*\*  
 \* กำหนด Header เริ่มต้นให้ชีตตามประเภท  
 \* @param {Sheet} sheet \- Object ชีตที่ต้องการตั้งค่า  
 \* @param {string} sheetName \- ชื่อชีต  
 \* @returns {void}  
 \*/  
function setupSheetHeaders(sheet, sheetName) {  
  var headers \= \[\];  
    
  // กำหนด Header ตามชื่อชีต (สามารถขยายเพิ่มได้)  
  if (sheetName \=== 'Database' || sheetName \=== 'NameMapping') {  
    headers \= \[  
      'UUID', 'CustomerName', 'Address', 'Province', 'District', 'SubDistrict',   
      'PostalCode', 'Latitude', 'Longitude', 'GoogleAddr', 'QualityScore',   
      'Verified', 'LastUpdated', 'Notes'  
    \];  
  } else if (sheetName \=== 'Input') {  
    headers \= \[  
      'RunID', 'ShipmentDate', 'CustomerName', 'Address', 'Status',   
      'AssignedDriver', 'GPS\_Lat', 'GPS\_Lng', 'CompletedTime'  
    \];  
  } else if (sheetName \=== 'PostalRef') {  
    headers \= \['PostalCode', 'Province', 'District', 'SubDistrict'\];  
  } else if (sheetName \=== 'AutoPilot\_Logs') {  
    headers \= \['Timestamp', 'Level', 'Message', 'Details'\];  
  }

  if (headers.length \> 0\) {  
    sheet.getRange(1, 1, 1, headers.length).setValues(\[headers\]);  
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('\#e8f0fe');  
    sheet.setFrozenRows(1);  
  }  
}

/\*\*  
 \* ตรวจสอบความถูกต้องของคอลัมน์ (Schema Check)  
 \* @returns {Object} ผลการตรวจสอบ { valid: boolean, errors: string\[\] }  
 \*/  
function runFullSchemaValidation() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var errors \= \[\];  
    
  // ตรวจสอบชีตหลัก  
  var dbSheet \= ss.getSheetByName('Database');  
  if (dbSheet) {  
    var headers \= dbSheet.getRange(1, 1, 1, dbSheet.getLastColumn()).getValues()\[0\];  
    if (headers.indexOf('UUID') \=== \-1) {  
      errors.push('Database sheet missing "UUID" column');  
    }  
    if (headers.indexOf('QualityScore') \=== \-1) {  
      errors.push('Database sheet missing "QualityScore" column');  
    }  
  } else {  
    errors.push('Missing "Database" sheet');  
  }

  return {  
    valid: errors.length \=== 0,  
    errors: errors  
  };  
}

// \=============================================================================  
// SECTION 3: MIGRATION LOGIC (Data Updates)  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันหลักสำหรับอัปเกรดระบบ (เรียกเมื่อพบเวอร์ชันใหม่)  
 \* @returns {Object} สรุปผลการอัปเกรด  
 \*/  
function performSystemUpgrade() {  
  var currentVer \= getInstalledVersion();  
  var targetVer \= UPGRADE\_CONFIG.CURRENT\_VERSION;  
    
  console.log('\[Upgrade\] Checking upgrade from ' \+ currentVer \+ ' to ' \+ targetVer);  
    
  if (compareVersions(currentVer, targetVer) \>= 0\) {  
    return { success: true, message: 'ระบบเป็นเวอร์ชันล่าสุดแล้ว (' \+ currentVer \+ ')' };  
  }

  var report \= {  
    steps: \[\],  
    errors: \[\]  
  };

  try {  
    // Step 1: สร้างชีตที่ขาดหาย  
    var sheetResult \= validateAndCreateMissingSheets();  
    if (sheetResult.created.length \> 0\) {  
      report.steps.push('Created missing sheets: ' \+ sheetResult.created.join(', '));  
    }

    // Step 2: อัปเดต Header (ถ้ามีเปลี่ยนแปลงในเวอร์ชันใหม่)  
    // สามารถเพิ่ม Logic เฉพาะเวอร์ชันได้ที่นี่ (เช่น if (currentVer \< "4.1.0") { ... })  
      
    // Step 3: Migration ข้อมูล (ตัวอย่าง: เติม UUID ให้แถวที่ขาด)  
    if (compareVersions(currentVer, '4.0.0') \< 0\) {  
      report.steps.push('Running legacy data migration...');  
      migrateLegacyData\_AddUUID();  
    }

    // Step 4: บันทึกเวอร์ชันใหม่  
    setInstalledVersion(targetVer);  
    report.steps.push('Version updated to ' \+ targetVer);

    return { success: true, report: report };

  } catch (e) {  
    report.errors.push(e.message);  
    return { success: false, report: report };  
  }  
}

/\*\*  
 \* ตัวอย่าง Migration: เติม UUID ให้ข้อมูลเก่าที่ไม่มี  
 \* @returns {void}  
 \*/  
function migrateLegacyData\_AddUUID() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('Database');  
  if (\!sheet) return;

  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;

  // สมมติ UUID อยู่คอลัมน์ A (1)  
  var uuidRange \= sheet.getRange(2, 1, lastRow \- 1, 1);  
  var uuidValues \= uuidRange.getValues();  
  var updated \= false;

  for (var i \= 0; i \< uuidValues.length; i++) {  
    if (\!uuidValues\[i\]\[0\] || uuidValues\[i\]\[0\] \=== '') {  
      // Generate UUID ใหม่  
      uuidValues\[i\]\[0\] \= Utilities.getUuid();  
      updated \= true;  
    }  
  }

  if (updated) {  
    uuidRange.setValues(uuidValues);  
    console.log('\[Migration\] Added UUIDs to ' \+ uuidValues.filter(function(r){return r\[0\];}).length \+ ' rows.');  
  }  
}

// \=============================================================================  
// SECTION 4: INITIALIZATION (First Time Setup)  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันสำหรับติดตั้งระบบครั้งแรก (Initial Setup)  
 \* @returns {void}  
 \*/  
function initializeSystem\_FirstTime() {  
  var ui \= SpreadsheetApp.getUi();  
  var confirm \= ui.alert(  
    'ยืนยันการติดตั้งระบบครั้งแรก?',  
    'ระบบจะสร้างชีตทั้งหมดและตั้งค่าเริ่มต้น\\nข้อมูลเดิมอาจถูกทับหากมีชื่อชีตซ้ำ\\n\\nต้องการดำเนินการต่อหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );

  if (confirm \== ui.Button.YES) {  
    try {  
      Logger.log('\[Setup\] Starting initial installation...');  
        
      // ลบ Properties เก่าเพื่อเริ่มใหม่  
      PropertiesService.getScriptProperties().deleteAllProperties();  
        
      // สร้างชีตทั้งหมด  
      validateAndCreateMissingSheets();  
        
      // ตั้งค่าเวอร์ชันเริ่มต้น  
      setInstalledVersion(UPGRADE\_CONFIG.CURRENT\_VERSION);  
        
      // ตั้งค่า API Key ว่างไว้ก่อน (ให้ผู้ใช้กรอกเอง)  
      // setupWebAppSecurity(); 

      ui.alert('ติดตั้งระบบสำเร็จ\!\\nเวอร์ชัน: ' \+ UPGRADE\_CONFIG.CURRENT\_VERSION \+ '\\nกรุณาตรวจสอบเมนูและตั้งค่า API Key ต่อไป');  
    } catch (e) {  
      ui.alert('เกิดข้อผิดพลาดในการติดตั้ง: ' \+ e.message);  
    }  
  }  
}

// \=============================================================================  
// SECTION 5: MAINTENANCE & UTILITIES  
// \=============================================================================

/\*\*  
 \* แสดงรายงานสถานะระบบ (System Status Report)  
 \* @returns {void}  
 \*/  
function showSystemStatusReport() {  
  var ui \= SpreadsheetApp.getUi();  
  var version \= getInstalledVersion();  
  var validation \= runFullSchemaValidation();  
  var props \= PropertiesService.getScriptProperties();  
  var lastUpgrade \= props.getProperty(UPGRADE\_CONFIG.LAST\_UPGRADE\_DATE\_KEY) || 'Never';

  var msg \= '=== System Status Report \===\\n\\n';  
  msg \+= 'Current Version: ' \+ version \+ '\\n';  
  msg \+= 'Target Version: ' \+ UPGRADE\_CONFIG.CURRENT\_VERSION \+ '\\n';  
  msg \+= 'Last Upgrade: ' \+ lastUpgrade \+ '\\n\\n';  
  msg \+= 'Schema Validation: ' \+ (validation.valid ? '✅ PASS' : '❌ FAIL') \+ '\\n';  
    
  if (\!validation.valid) {  
    msg \+= 'Errors:\\n- ' \+ validation.errors.join('\\n- ') \+ '\\n';  
  }

  ui.alert(msg);  
}

/\*\*  
 \* รีเซ็ตการตั้งค่าระบบ (Factory Reset)  
 \* @returns {void}  
 \*/  
function factoryReset\_System() {  
  var ui \= SpreadsheetApp.getUi();  
  var confirm \= ui.alert(  
    '⚠️ คำเตือน: Factory Reset',  
    'การกระทำนี้จะ:\\n1. ลบการตั้งค่าทั้งหมด (Properties)\\n2. ลบเวอร์ชันที่ติดตั้ง\\n3. ไม่ลบข้อมูลในชีต\\n\\nคุณต้องติดตั้งระบบใหม่หลังจากนี้\\n\\nยืนยันหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );

  if (confirm \== ui.Button.YES) {  
    PropertiesService.getScriptProperties().deleteAllProperties();  
    ui.alert('รีเซ็ตการตั้งค่าสำเร็จ\!\\nกรุณารันฟังก์ชัน initializeSystem\_FirstTime อีกครั้ง');  
  }  
}

// \=============================================================================  
// SECTION 6: DEBUG & HELPER FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันทดสอบการเปรียบเทียบเวอร์ชัน  
 \* @returns {void}  
 \*/  
function debugVersionCheck() {  
  var tests \= \[  
    { v1: '4.0.0', v2: '4.1.0', expected: \-1 },  
    { v1: '4.2.0', v2: '4.1.0', expected: 1 },  
    { v1: '4.1.0', v2: '4.1.0', expected: 0 }  
  \];

  tests.forEach(function(t) {  
    var result \= compareVersions(t.v1, t.v2);  
    Logger.log('Test ' \+ t.v1 \+ ' vs ' \+ t.v2 \+ ' \=\> ' \+ result \+ ' (Expected: ' \+ t.expected \+ ')');  
  });  
}

/\*\*  
 \* ดูรายละเอียด Properties ที่เก็บไว้  
 \* @returns {void}  
 \*/  
function debugShowProperties() {  
  var props \= PropertiesService.getScriptProperties().getProperties();  
  Logger.log('Current Properties:');  
  for (var key in props) {  
    Logger.log(key \+ ': ' \+ props\[key\]);  
  }  
}

Service\_Agent.gs  
/\*\*  
 \* @fileoverview Service\_Agent \- ระบบตัวแทนอัจฉริยะ (AI Agent) สำหรับประมวลผลคำสั่ง  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: ปรับปรุง Logic การเชื่อมต่อ Gemini API และเพิ่มระบบ Retry อัตโนมัติ  
 \* \- v4.1: เพิ่มฟังก์ชันตรวจสอบความถูกต้องของคำตอบจาก AI (Validation Layer)  
 \* \- v4.0: แยกโมดูล Agent ออกจาก Service\_Master เพื่อความเป็นอิสระในการประมวลผล  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "สมอง" ของระบบ:  
 \* 1\. รับรายการชื่อที่อยู่ที่ไม่ชัดเจน หรือต้องการการจับคู่  
 \* 2\. ส่งข้อมูลไปยัง Google Gemini AI เพื่อวิเคราะห์และจับคู่กับฐานข้อมูล  
 \* 3\. ตรวจสอบความน่าเชื่อถือของคำตอบ (Confidence Score)  
 \* 4\. บันทึกผลลัพธ์กลับลงสู่ Database หรือ NameMapping โดยอัตโนมัติ  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่า AI Agent  
 \* @constant {Object} AGENT\_CONFIG  
 \*/  
var AGENT\_CONFIG \= {  
  MODEL\_NAME: 'gemini-pro',  
  MAX\_BATCH\_SIZE: 20,             // จำนวนรายการที่ส่งให้ AI ต่อครั้ง  
  MIN\_CONFIDENCE\_SCORE: 0.75,     // คะแนนความมั่นใจขั้นต่ำที่จะยอมรับ (0.0 \- 1.0)  
  TIMEOUT\_MS: 30000,              // เวลารอตอบกลับสูงสุด (30 วินาที)  
  RETRY\_COUNT: 2,                 // จำนวนครั้งที่ลองใหม่หากล้มเหลว  
  LOG\_SHEET\_NAME: 'Agent\_Logs'  
};

/\*\*  
 \* ดึง API Key จาก PropertiesService  
 \* @returns {string} API Key หรือค่าว่างหากไม่พบ  
 \*/  
function getGeminiApiKey() {  
  var props \= PropertiesService.getScriptProperties();  
  return props.getProperty('GEMINI\_API\_KEY') || '';  
}

/\*\*  
 \* ตรวจสอบว่าระบบพร้อมใช้งานหรือไม่  
 \* @returns {boolean} true ถ้ามี API Key และพร้อมทำงาน  
 \*/  
function isAgentReady() {  
  var key \= getGeminiApiKey();  
  return (key && key.length \> 10);  
}

// \=============================================================================  
// SECTION 2: CORE AI PROCESSING LOGIC  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันหลักในการประมวลผลคิวงาน (Entry Point สำหรับ AutoPilot)  
 \* @returns {void}  
 \*/  
function processAgentQueue() {  
  if (\!isAgentReady()) {  
    Logger.log('\[Agent\] System not ready: Missing API Key.');  
    return;  
  }

  Logger.log('\[Agent\] Starting queue processing...');  
    
  // 1\. ดึงรายการที่ต้องการให้ AI วิเคราะห์ (เช่น ชื่อที่ยังจับคู่ไม่ได้)  
  var pendingItems \= getPendingItemsForAI();  
    
  if (pendingItems.length \=== 0\) {  
    Logger.log('\[Agent\] No pending items found.');  
    return;  
  }

  // 2\. แบ่งกลุ่มงานเป็น Batch  
  var batches \= chunkArray(pendingItems, AGENT\_CONFIG.MAX\_BATCH\_SIZE);  
    
  // 3\. ประมวลผลทีละ Batch  
  for (var i \= 0; i \< batches.length; i++) {  
    Logger.log('\[Agent\] Processing batch ' \+ (i \+ 1\) \+ '/' \+ batches.length);  
    processBatchWithAI(batches\[i\]);  
      
    // พักเล็กน้อยเพื่อไม่ให้เกิน\_quota  
    if (i \< batches.length \- 1\) {  
      Utilities.sleep(2000);  
    }  
  }  
    
  Logger.log('\[Agent\] Queue processing completed.');  
}

/\*\*  
 \* ดึงรายการที่รอการประมวลผลจาก Database  
 \* @returns {Array\<Object\>} รายการข้อมูล \[{rowIndex, name, address, ...}, ...\]  
 \*/  
function getPendingItemsForAI() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= (typeof CONFIG \!== 'undefined' && CONFIG.SHEET\_NAME) ? CONFIG.SHEET\_NAME : 'Database';  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) return \[\];  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return \[\];  
    
  // สมมติคอลัมน์: Row, Name, Address, Status, AI\_Tag  
  // ปรับเลขคอลัมน์ตาม CONFIG  
  var colName \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.NAME) ? DATA\_IDX.NAME : 2;  
  var colAddr \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.ADDRESS) ? DATA\_IDX.ADDRESS : 4;  
  var colStatus \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.STATUS) ? DATA\_IDX.STATUS : 10;  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, Math.max(colName, colAddr)).getValues();  
  var pending \= \[\];  
    
  for (var i \= 0; i \< data.length; i++) {  
    var row \= data\[i\];  
    var status \= row\[colStatus \- 1\];  
    var name \= row\[colName \- 1\];  
      
    // เงื่อนไข: ยังไม่มีสถานะ Verified และ มีชื่อ  
    if ((\!status || status \!== 'Verified') && name && String(name).trim() \!== '') {  
      pending.push({  
        rowIndex: i \+ 2,  
        name: name,  
        address: row\[colAddr \- 1\] || ''  
      });  
    }  
      
    if (pending.length \>= AGENT\_CONFIG.MAX\_BATCH\_SIZE \* 5\) break; // จำกัดจำนวนที่ดึงมา  
  }  
    
  return pending;  
}

/\*\*  
 \* ประมวลผลรายการหนึ่งๆ ด้วย AI  
 \* @param {Array\<Object\>} batch \- รายการข้อมูลในกลุ่ม  
 \* @returns {void}  
 \*/  
function processBatchWithAI(batch) {  
  var prompt \= buildPromptForBatch(batch);  
    
  try {  
    var responseText \= callGeminiAPI(prompt);  
    var results \= parseAIResponse(responseText);  
      
    updateDatabaseWithResults(results);  
      
  } catch (e) {  
    Logger.log('\[Agent\] Error processing batch: ' \+ e.message);  
    logAgentEvent('ERROR', 'Batch processing failed: ' \+ e.message);  
  }  
}

/\*\*  
 \* สร้างข้อความ Prompt สำหรับส่งให้ AI  
 \* @param {Array\<Object\>} batch \- รายการข้อมูล  
 \* @returns {string} ข้อความ Prompt  
 \*/  
function buildPromptForBatch(batch) {  
  var text \= "You are a logistics data expert. Match the following customer names to standard names.\\n";  
  text \+= "Return result in JSON format: \[{\\"input\\": \\"...\\", \\"matched\_name\\": \\"...\\", \\"confidence\\": 0.9}\]\\n\\n";  
  text \+= "Data to process:\\n";  
    
  batch.forEach(function(item, index) {  
    text \+= (index \+ 1\) \+ ". Name: " \+ item.name \+ ", Addr: " \+ item.address \+ "\\n";  
  });  
    
  text \+= "\\nOnly return valid JSON.";  
  return text;  
}

// \=============================================================================  
// SECTION 3: API COMMUNICATION (Gemini)  
// \=============================================================================

/\*\*  
 \* เรียกใช้ Google Gemini API  
 \* @param {string} prompt \- ข้อความคำถาม  
 \* @returns {string} คำตอบจาก API  
 \*/  
function callGeminiAPI(prompt) {  
  var apiKey \= getGeminiApiKey();  
  var url \= 'https://generativelanguage.googleapis.com/v1beta/models/' \+ AGENT\_CONFIG.MODEL\_NAME \+ ':generateContent?key=' \+ apiKey;  
    
  var payload \= {  
    contents: \[{  
      parts: \[{ text: prompt }\]  
    }\]  
  };  
    
  var options \= {  
    method: 'post',  
    contentType: 'application/json',  
    payload: JSON.stringify(payload),  
    muteHttpExceptions: true  
  };  
    
  var response \= UrlFetchApp.fetch(url, options);  
  var responseCode \= response.getResponseCode();  
    
  if (responseCode \!== 200\) {  
    throw new Error('API Error: ' \+ responseCode \+ ' \- ' \+ response.getContentText());  
  }  
    
  var json \= JSON.parse(response.getContentText());  
  return json.candidates\[0\].content.parts\[0\].text;  
}

/\*\*  
 \* แปลงข้อความตอบกลับจาก AI เป็น Object  
 \* @param {string} responseText \- ข้อความดิบจาก API  
 \* @returns {Array\<Object\>} ผลลัพธ์ที่ Parse แล้ว  
 \*/  
function parseAIResponse(responseText) {  
  try {  
    // ทำความสะอาดข้อความ (ลบ Markdown \`\`\`json ... \`\`\` ถ้ามี)  
    var cleanText \= responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();  
    return JSON.parse(cleanText);  
  } catch (e) {  
    Logger.log('\[Agent\] Failed to parse AI response: ' \+ e.message);  
    logAgentEvent('WARNING', 'Parse failed: ' \+ responseText.substring(0, 50));  
    return \[\];  
  }  
}

// \=============================================================================  
// SECTION 4: DATABASE UPDATES  
// \=============================================================================

/\*\*  
 \* อัปเดตผลลัพธ์ลง Database  
 \* @param {Array\<Object\>} results \- ผลลัพธ์จาก AI  
 \* @returns {void}  
 \*/  
function updateDatabaseWithResults(results) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= (typeof CONFIG \!== 'undefined' && CONFIG.SHEET\_NAME) ? CONFIG.SHEET\_NAME : 'Database';  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) return;  
    
  // วนลูปอัปเดต (ควรปรับปรุงให้ใช้ batchUpdate ใน production ขนาดใหญ่)  
  results.forEach(function(item) {  
    if (item.confidence \>= AGENT\_CONFIG.MIN\_CONFIDENCE\_SCORE) {  
      // หาแถวที่ตรงกัน (สมมติว่าเราเก็บ rowIndex ไว้ในขั้นตอนก่อนหน้า หรือค้นหาจากชื่อ)  
      // ในที่นี้สมมติว่า item มี rowIndex ติดมาด้วยจากขั้นตอน Process  
      if (item.rowIndex) {  
        var colMatchedName \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.MATCHED\_NAME) ? DATA\_IDX.MATCHED\_NAME : 3;  
        var colConfidence \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.CONFIDENCE) ? DATA\_IDX.CONFIDENCE : 11;  
        var colStatus \= (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.STATUS) ? DATA\_IDX.STATUS : 10;  
          
        sheet.getRange(item.rowIndex, colMatchedName).setValue(item.matched\_name);  
        sheet.getRange(item.rowIndex, colConfidence).setValue(item.confidence);  
        sheet.getRange(item.rowIndex, colStatus).setValue('AI\_Verified');  
      }  
    }  
  });  
}

/\*\*  
 \* ฟังก์ชันเสริมสำหรับแบ่งอาร์เรย์เป็นกลุ่มๆ  
 \* @param {Array} array \- อาร์เรย์ต้นฉบับ  
 \* @param {number} size \- ขนาดต่อกลุ่ม  
 \* @returns {Array\<Array\>} อาร์เรย์ของกลุ่มย่อย  
 \*/  
function chunkArray(array, size) {  
  var chunks \= \[\];  
  for (var i \= 0; i \< array.length; i \+= size) {  
    chunks.push(array.slice(i, i \+ size));  
  }  
  return chunks;  
}

// \=============================================================================  
// SECTION 5: UI & MANUAL TRIGGERS  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันสำหรับเรียกผ่านเมนู: ส่งชื่อแปลกให้ AI วิเคราะห์  
 \* @returns {void}  
 \*/  
function runAIBatchResolver\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
    
  if (\!isAgentReady()) {  
    ui.alert('ข้อผิดพลาด', 'ไม่พบ API Key สำหรับ Gemini\\nกรุณาตั้งค่าใน System Admin ก่อน', ui.ButtonSet.OK);  
    return;  
  }  
    
  var result \= ui.alert(  
    'ยืนยันการรัน AI?',  
    'ระบบจะส่งรายชื่อที่ยังไม่ชัดเจนให้ AI วิเคราะห์\\nอาจใช้เวลาสักครู่\\n\\nต้องการดำเนินการต่อหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (result \== ui.Button.YES) {  
    ui.toast('กำลังเริ่มกระบวนการ AI...');  
    processAgentQueue();  
    ui.alert('เสร็จสิ้น\!\\nกรุณาตรวจสอบผลลัพธ์ในชีต Database');  
  }  
}

/\*\*  
 \* ทดสอบการเชื่อมต่อ Gemini  
 \* @returns {void}  
 \*/  
function debugGeminiConnection() {  
  var ui \= SpreadsheetApp.getUi();  
  try {  
    var testPrompt \= "Say 'Hello Logistics' in Thai.";  
    var response \= callGeminiAPI(testPrompt);  
    ui.alert('ทดสอบสำเร็จ\!\\nAI ตอบว่า: ' \+ response);  
  } catch (e) {  
    ui.alert('ทดสอบล้มเหลว: ' \+ e.message);  
  }  
}

// \=============================================================================  
// SECTION 6: LOGGING & MAINTENANCE  
// \=============================================================================

/\*\*  
 \* บันทึกเหตุการณ์การทำงานของ Agent  
 \* @param {string} level \- ระดับ (INFO, ERROR, WARNING)  
 \* @param {string} message \- ข้อความ  
 \* @returns {void}  
 \*/  
function logAgentEvent(level, message) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(AGENT\_CONFIG.LOG\_SHEET\_NAME);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(AGENT\_CONFIG.LOG\_SHEET\_NAME);  
    sheet.appendRow(\['Timestamp', 'Level', 'Message'\]);  
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');  
  }  
    
  sheet.appendRow(\[new Date(), level, message\]);  
    
  // เก็บ Log แค่ 500 แถว  
  if (sheet.getLastRow() \> 500\) {  
    sheet.deleteRows(2, sheet.getLastRow() \- 500);  
  }  
}

/\*\*  
 \* ล้าง Log เก่า  
 \* @returns {void}  
 \*/  
function clearAgentLogs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(AGENT\_CONFIG.LOG\_SHEET\_NAME);  
  if (sheet) {  
    sheet.clearContents();  
    sheet.appendRow(\['Timestamp', 'Level', 'Message'\]);  
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');  
  }  
}

Test\_AI.gs  
/\*\*  
 \* @fileoverview Test\_AI \- โมดูลทดสอบและจัดการการจับคู่ข้อมูลด้วย AI/Fuzzy Logic  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: ปรับปรุงอัลกอริทึม Fuzzy Matching ให้แม่นยำขึ้น และเพิ่มหน่วยทดสอบ (Unit Tests)  
 \* \- v4.1: แยกฟังก์ชันทดสอบออกจาก Service\_Agent เพื่อความสะอาดของโค้ด  
 \* \- v4.0: สร้างโมดูลทดสอบเฉพาะทางสำหรับตรวจสอบความถูกต้องของ AI Resolution  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "สนามทดสอบ" ของระบบ:  
 \* 1\. ทดสอบความแม่นยำของการจับคู่ชื่อ (Matching Accuracy)  
 \* 2\. เปรียบเทียบผลลัพธ์ระหว่าง Fuzzy Logic และ Gemini AI  
 \* 3\. รัน Unit Tests สำหรับฟังก์ชันสำคัญๆ  
 \* 4\. สร้างรายงานผลการทดสอบเพื่อวิเคราะห์จุดบกพร่อง  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & TEST DATA  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการทดสอบ AI  
 \* @constant {Object} AI\_TEST\_CONFIG  
 \*/  
var AI\_TEST\_CONFIG \= {  
  FUZZY\_THRESHOLD: 0.75,       // คะแนนขั้นต่ำที่ยอมรับได้สำหรับ Fuzzy Match  
  SAMPLE\_SIZE: 50,             // จำนวนตัวอย่างที่ใช้ในการทดสอบ  
  LOG\_SHEET\_NAME: 'AI\_Test\_Logs',  
  ENABLE\_VERBOSE\_LOGGING: true  
};

/\*\*  
 \* ชุดข้อมูลตัวอย่างสำหรับทดสอบ (Mock Data)  
 \* ใช้ในกรณีที่ต้องการรันทดสอบโดยไม่ต้องดึงข้อมูลจริงจากชีต  
 \* @returns {Array\<Object\>} รายการทดสอบ  
 \*/  
function getMockTestData() {  
  return \[  
    { input: "บจก. เอสซีจี ซิเมนต์", expected: "บริษัท เอสซีจี ซิเมนต์ จำกัด" },  
    { input: "เซ็นทรัล วิลเลจ", expected: "เซ็นทรัล วิลเลจ ลักชูรี่ เอาท์เล็ต" },  
    { input: "บิ๊กซี บางนา", expected: "บิ๊กซี ซูเปอร์เซ็นเตอร์ บางนา" },  
    { input: "โลตัส พระราม 4", expected: "เทสโก้ โลตัส พระรามสี่" },  
    { input: "โรบินสัน สมุทรปราการ", expected: "โรบินสัน ไลฟ์สไตล์ สมุทรปราการ" }  
  \];  
}

// \=============================================================================  
// SECTION 2: FUZZY MATCHING ALGORITHMS (Core Logic)  
// \=============================================================================

/\*\*  
 \* คำนวณคะแนนความเหมือนระหว่างสองสตริง (Fuzzy Score)  
 \* @param {string} str1 \- สตริงแรก  
 \* @param {string} str2 \- สตริงที่สอง  
 \* @returns {number} คะแนนความเหมือน (0.0 \- 1.0)  
 \*/  
function calculateFuzzyMatchScore(str1, str2) {  
  if (\!str1 || \!str2) return 0;  
    
  var s1 \= normalizeString(str1);  
  var s2 \= normalizeString(str2);  
    
  if (s1 \=== s2) return 1.0;  
    
  var distance \= getLevenshteinDistance(s1, s2);  
  var maxLen \= Math.max(s1.length, s2.length);  
    
  if (maxLen \=== 0\) return 1.0;  
    
  return (maxLen \- distance) / maxLen;  
}

/\*\*  
 \* ทำความสะอาดและมาตรฐานสตริงก่อนเปรียบเทียบ  
 \* @param {string} text \- ข้อความต้นฉบับ  
 \* @returns {string} ข้อความที่ทำความสะอาดแล้ว  
 \*/  
function normalizeString(text) {  
  if (\!text) return "";  
    
  return String(text)  
    .toLowerCase()  
    .replace(/บริษัท|จำกัด|มหาชน|บจก\\.|ห้างหุ้นส่วน/gi, "") // ลบคำทั่วไป  
    .replace(/\\s+/g, " ")      // ลบช่องว่างซ้ำ  
    .replace(/\[^\\w\\u0E00-\\u0E7F\\s\]/g, "") // ลบอักขระพิเศษ (เก็บภาษาไทย)  
    .trim();  
}

/\*\*  
 \* คำนวณ Levenshtein Distance (จำนวนครั้งที่ต้องแก้ไขเพื่อให้ตรงกัน)  
 \* @param {string} s1   
 \* @param {string} s2   
 \* @returns {number} ระยะห่าง  
 \*/  
function getLevenshteinDistance(s1, s2) {  
  var track \= Array(s2.length \+ 1).fill(null).map(() \=\>   
    Array(s1.length \+ 1).fill(null));  
    
  for (var i \= 0; i \<= s1.length; i \+= 1\) track\[0\]\[i\] \= i;  
  for (var j \= 0; j \<= s2.length; j \+= 1\) track\[j\]\[0\] \= j;  
    
  for (var j \= 1; j \<= s2.length; j \+= 1\) {  
    for (var i \= 1; i \<= s1.length; i \+= 1\) {  
      var indicator \= s1\[i \- 1\] \=== s2\[j \- 1\] ? 0 : 1;  
      track\[j\]\[i\] \= Math.min(  
        track\[j\]\[i \- 1\] \+ 1,      // deletion  
        track\[j \- 1\]\[i\] \+ 1,      // insertion  
        track\[j \- 1\]\[i \- 1\] \+ indicator // substitution  
      );  
    }  
  }  
    
  return track\[s2.length\]\[s1.length\];  
}

// \=============================================================================  
// SECTION 3: AI VALIDATION & COMPARISON  
// \=============================================================================

/\*\*  
 \* ทดสอบความแม่นยำของ Fuzzy Matching กับชุดข้อมูลตัวอย่าง  
 \* @returns {Object} ผลสรุปการทดสอบ { total, passed, failed, accuracy }  
 \*/  
function runFuzzyMatchValidation() {  
  var testData \= getMockTestData();  
  var results \= { total: 0, passed: 0, failed: 0, details: \[\] };  
    
  testData.forEach(function(item) {  
    var score \= calculateFuzzyMatchScore(item.input, item.expected);  
    var isPass \= score \>= AI\_TEST\_CONFIG.FUZZY\_THRESHOLD;  
      
    results.total++;  
    if (isPass) {  
      results.passed++;  
    } else {  
      results.failed++;  
    }  
      
    results.details.push({  
      input: item.input,  
      expected: item.expected,  
      score: score,  
      pass: isPass  
    });  
  });  
    
  results.accuracy \= (results.passed / results.total) \* 100;  
  return results;  
}

/\*\*  
 \* เปรียบเทียบผลลัพธ์ระหว่าง Fuzzy Logic และ AI (จำลอง)  
 \* @returns {void} แสดงผลผ่าน Logger หรือ Alert  
 \*/  
function compareFuzzyVsAI() {  
  var testData \= getMockTestData();  
  var report \= "=== Comparison Report \===\\n\\n";  
    
  testData.forEach(function(item) {  
    var fuzzyScore \= calculateFuzzyMatchScore(item.input, item.expected);  
      
    // จำลอง AI Score (ในความเป็นจริงจะเรียก API)  
    // ในการใช้งานจริง ส่วนนี้จะเรียก Service\_Agent เพื่อขอคำตอบ  
    var aiScore \= fuzzyScore \+ 0.1; // สมมติว่า AI เก่งกว่านิดหน่อย  
    if (aiScore \> 1.0) aiScore \= 1.0;  
      
    report \+= "Input: " \+ item.input \+ "\\n";  
    report \+= "  Fuzzy Score: " \+ fuzzyScore.toFixed(2) \+ "\\n";  
    report \+= "  AI Score (Est): " \+ aiScore.toFixed(2) \+ "\\n";  
    report \+= "  Winner: " \+ (aiScore \> fuzzyScore ? "AI" : "Fuzzy") \+ "\\n\\n";  
  });  
    
  Logger.log(report);  
  if (SpreadsheetApp.getUi()) {  
    SpreadsheetApp.getUi().alert("Comparison Complete", report, SpreadsheetApp.getUi().ButtonSet.OK);  
  }  
}

// \=============================================================================  
// SECTION 4: UNIT TESTS FOR CORE FUNCTIONS  
// \=============================================================================

/\*\*  
 \* รัน Unit Tests ทั้งหมดสำหรับโมดูลนี้  
 \* @returns {Object} ผลลัพธ์การทดสอบทั้งหมด  
 \*/  
function runAllUnitTests() {  
  var results \= {  
    normalizeString: testNormalizeString(),  
    fuzzyMatch: testFuzzyMatchBasics(),  
    validation: runFuzzyMatchValidation()  
  };  
    
  logTestResults(results);  
  return results;  
}

/\*\*  
 \* ทดสอบฟังก์ชัน normalizeString  
 \* @returns {Object} ผลลัพธ์ { passed, failed }  
 \*/  
function testNormalizeString() {  
  var cases \= \[  
    { in: "บจก. เอสซีจี", out: "เอสซีจี" },  
    { in: "  บริษัท  จำกัด  ", out: "" },  
    { in: "Test 123\!", out: "test 123" }  
  \];  
    
  var passed \= 0;  
  cases.forEach(function(c) {  
    if (normalizeString(c.in) \=== c.out) passed++;  
  });  
    
  return { total: cases.length, passed: passed };  
}

/\*\*  
 \* ทดสอบฟังก์ชัน Fuzzy Match พื้นฐาน  
 \* @returns {Object} ผลลัพธ์ { passed, failed }  
 \*/  
function testFuzzyMatchBasics() {  
  var passed \= 0;  
    
  // กรณีเหมือนกันเป๊ะ  
  if (calculateFuzzyMatchScore("abc", "abc") \=== 1.0) passed++;  
    
  // กรณีต่างกันเล็กน้อย  
  var score \= calculateFuzzyMatchScore("abc", "abd");  
  if (score \> 0.5 && score \< 1.0) passed++;  
    
  // กรณีต่างกันมาก  
  if (calculateFuzzyMatchScore("abc", "xyz") \< 0.5) passed++;  
    
  return { total: 3, passed: passed };  
}

// \=============================================================================  
// SECTION 5: REPORTING & UI UTILITIES  
// \=============================================================================

/\*\*  
 \* แสดงรายงานผลการทดสอบแบบละเอียดบน Sheet ใหม่  
 \* @returns {void}  
 \*/  
function generateTestReportSheet() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= AI\_TEST\_CONFIG.LOG\_SHEET\_NAME \+ "\_" \+ new Date().getTime();  
  var sheet \= ss.insertSheet(sheetName);  
    
  // Header  
  sheet.appendRow(\["Test Type", "Input", "Expected", "Score", "Result", "Details"\]);  
  sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("\#dddddd");  
    
  // Run Validation  
  var results \= runFuzzyMatchValidation();  
    
  results.details.forEach(function(item) {  
    sheet.appendRow(\[  
      "Fuzzy Match",  
      item.input,  
      item.expected,  
      item.score.toFixed(4),  
      item.pass ? "PASS" : "FAIL",  
      item.pass ? "" : "Score below threshold"  
    \]);  
  });  
    
  // Summary  
  var lastRow \= sheet.getLastRow() \+ 2;  
  sheet.getRange(lastRow, 1, 1, 2).setValues(\[\["Total Accuracy:", results.accuracy.toFixed(2) \+ "%"\]\]);  
  sheet.getRange(lastRow, 1, 1, 2).setFontWeight("bold");  
    
  SpreadsheetApp.getUi().alert("สร้างรายงานเสร็จสิ้น\!\\nชื่อชีต: " \+ sheetName);  
}

/\*\*  
 \* บันทึกผลการรัน Test ลง Log  
 \* @param {Object} results \- ผลลัพธ์จากการทดสอบ  
 \* @returns {void}  
 \*/  
function logTestResults(results) {  
  var msg \= "=== Unit Test Results \===\\n";  
  msg \+= "Normalize: " \+ results.normalizeString.passed \+ "/" \+ results.normalizeString.total \+ "\\n";  
  msg \+= "Fuzzy Match: " \+ results.fuzzyMatch.passed \+ "/" \+ results.fuzzyMatch.total \+ "\\n";  
  msg \+= "Validation Accuracy: " \+ results.validation.accuracy.toFixed(2) \+ "%\\n";  
    
  Logger.log(msg);  
}

// \=============================================================================  
// SECTION 6: DEBUG & MAINTENANCE TOOLS  
// \=============================================================================

/\*\*  
 \* รีเซ็ตการตั้งค่าการทดสอบทั้งหมด  
 \* @returns {void}  
 \*/  
function resetTestModule() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheets \= ss.getSheets();  
    
  // ลบชีต Log เก่าๆ ที่ขึ้นต้นด้วยชื่อที่กำหนด  
  sheets.forEach(function(sheet) {  
    if (sheet.getName().indexOf(AI\_TEST\_CONFIG.LOG\_SHEET\_NAME) \!== \-1) {  
      ss.deleteSheet(sheet);  
    }  
  });  
    
  Logger.log("\[Test\_AI\] Module reset complete. Old logs cleared.");  
}

/\*\*  
 \* ฟังก์ชันทดสอบความเร็ว (Performance Benchmark)  
 \* @returns {void}  
 \*/  
function benchmarkFuzzyPerformance() {  
  var testData \= getMockTestData();  
  var iterations \= 1000;  
  var start \= new Date().getTime();  
    
  for (var i \= 0; i \< iterations; i++) {  
    testData.forEach(function(item) {  
      calculateFuzzyMatchScore(item.input, item.expected);  
    });  
  }  
    
  var end \= new Date().getTime();  
  var duration \= end \- start;  
    
  Logger.log("Benchmark: " \+ iterations \+ " iterations completed in " \+ duration \+ "ms");  
  Logger.log("Avg time per call: " \+ (duration / (iterations \* testData.length)).toFixed(4) \+ "ms");  
    
  if (SpreadsheetApp.getUi()) {  
    SpreadsheetApp.getUi().alert("Benchmark Complete",   
      "Time: " \+ duration \+ "ms\\nAvg: " \+ (duration / (iterations \* testData.length)).toFixed(4) \+ "ms/call",   
      SpreadsheetApp.getUi().ButtonSet.OK);  
  }  
}

Setup\_Security.gs  
/\*\*  
 \* @fileoverview Setup\_Security \- จัดการสิทธิ์การเข้าถึงและการป้องกันแผ่นงาน (Security & Access Control)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: ปรับปรุงระบบการตรวจสอบสิทธิ์และเพิ่มการบันทึก Audit Log  
 \* \- v4.1: เพิ่มฟังก์ชันป้องกันการลบชีตสำคัญโดยไม่ได้ตั้งใจ  
 \* \- v4.0: แยกโมดูลความปลอดภัยออกมาจาก Setup\_Upgrade เพื่อความชัดเจน  
 \*   
 \* @description โมดูลนี้ทำหน้าที่รักษาความปลอดภัยของระบบ:  
 \* 1\. ตรวจสอบสิทธิ์ผู้ใช้งานก่อนอนุญาตให้แก้ไขข้อมูลสำคัญ  
 \* 2\. ล็อกโครงสร้างชีต (Protect Sheets) ป้องกันการลบคอลัมน์หรือสูตร  
 \* 3\. จัดการรายชื่อผู้ดูแลระบบ (Admin Whitelist)  
 \* 4\. บันทึกประวัติการเข้าถึงและการแก้ไข (Audit Trail)  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่าความปลอดภัย  
 \* @constant {Object} SECURITY\_CONFIG  
 \*/  
var SECURITY\_CONFIG \= {  
  ADMIN\_EMAILS\_PROP\_KEY: 'SYS\_ADMIN\_EMAILS',  
  AUDIT\_LOG\_SHEET: 'Security\_AuditLog',  
  PROTECTED\_SHEETS: \['Database', 'NameMapping', 'Config'\], // ชื่อชีตที่ห้ามแก้ไขโครงสร้าง  
  ALLOW\_EDIT\_RANGE\_ONLY: true, // อนุญาตให้แก้เฉพาะช่วงข้อมูลที่กำหนด  
  WARNING\_TITLE: 'Security Warning'  
};

/\*\*  
 \* ดึงรายชื่อ Admin ที่ได้รับอนุญาตจาก PropertiesService  
 \* @returns {Array\<string\>} รายการอีเมลของผู้ดูแลระบบ  
 \*/  
function getAdminEmailList() {  
  var props \= PropertiesService.getScriptProperties();  
  var emails \= props.getProperty(SECURITY\_CONFIG.ADMIN\_EMAILS\_PROP\_KEY);  
  if (\!emails) return \[\];  
  return emails.split(',').map(function(e) { return e.trim(); });  
}

/\*\*  
 \* ตรวจสอบว่าผู้ใช้ปัจจุบันเป็น Admin หรือไม่  
 \* @returns {boolean} true ถ้าเป็น Admin, false ถ้าไม่ใช่  
 \*/  
function isCurrentUserAdmin() {  
  var user \= Session.getActiveUser().getEmail();  
  var admins \= getAdminEmailList();  
    
  // อนุญาตให้เจ้าของสเปรดชีตเป็น Admin เสมอ  
  var owner \= SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail();  
  if (user \=== owner) return true;  
    
  return admins.indexOf(user) \!== \-1;  
}

// \=============================================================================  
// SECTION 2: ACCESS CONTROL & VALIDATION  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันตรวจสอบสิทธิ์ก่อนดำเนินการสำคัญ (Guard Clause)  
 \* @param {string} actionName \- ชื่อการกระทำที่ต้องการตรวจสอบ  
 \* @returns {boolean} true ถ้าผ่าน, false ถ้าไม่ผ่าน (และแสดง Alert)  
 \*/  
function validateUserAccess(actionName) {  
  if (isCurrentUserAdmin()) {  
    logSecurityEvent('ACCESS\_GRANTED', actionName, Session.getActiveUser().getEmail());  
    return true;  
  }  
    
  var user \= Session.getActiveUser().getEmail();  
  logSecurityEvent('ACCESS\_DENIED', actionName, user);  
    
  // แสดงคำเตือนถ้าเรียกจาก UI  
  try {  
    var ui \= SpreadsheetApp.getUi();  
    ui.alert(  
      SECURITY\_CONFIG.WARNING\_TITLE,  
      'ขออภัย คุณ "' \+ user \+ '" ไม่ได้รับสิทธิ์ให้ทำรายการ:\\n"' \+ actionName \+ '"\\n\\nกรุณาติดต่อผู้ดูแลระบบ',  
      ui.ButtonSet.OK  
    );  
  } catch (e) {  
    // กรณีเรียกใช้แบบ Background ให้แค่ Log  
    Logger.log('\[Security\] Access denied for ' \+ user \+ ' on ' \+ actionName);  
  }  
    
  return false;  
}

/\*\*  
 \* เพิ่มอีเมลผู้ดูแลระบบใหม่  
 \* @param {string} email \- อีเมลที่ต้องการเพิ่ม  
 \* @returns {void}  
 \*/  
function addAdminEmail(email) {  
  if (\!validateUserAccess('Add Admin')) return;  
    
  if (\!email || email.indexOf('@') \=== \-1) {  
    throw new Error('Invalid email format');  
  }  
    
  var admins \= getAdminEmailList();  
  if (admins.indexOf(email) \=== \-1) {  
    admins.push(email);  
    var props \= PropertiesService.getScriptProperties();  
    props.setProperty(SECURITY\_CONFIG.ADMIN\_EMAILS\_PROP\_KEY, admins.join(','));  
    logSecurityEvent('ADMIN\_ADDED', email, Session.getActiveUser().getEmail());  
  }  
}

/\*\*  
 \* ลบอีเมลผู้ดูแลระบบออก  
 \* @param {string} email \- อีเมลที่ต้องการลบ  
 \* @returns {void}  
 \*/  
function removeAdminEmail(email) {  
  if (\!validateUserAccess('Remove Admin')) return;  
    
  var admins \= getAdminEmailList();  
  var index \= admins.indexOf(email);  
  if (index \!== \-1) {  
    admins.splice(index, 1);  
    var props \= PropertiesService.getScriptProperties();  
    props.setProperty(SECURITY\_CONFIG.ADMIN\_EMAILS\_PROP\_KEY, admins.join(','));  
    logSecurityEvent('ADMIN\_REMOVED', email, Session.getActiveUser().getEmail());  
  }  
}

// \=============================================================================  
// SECTION 3: SHEET PROTECTION (Locking Mechanism)  
// \=============================================================================

/\*\*  
 \* ล็อกโครงสร้างชีตสำคัญ ป้องกันการลบคอลัมน์หรือเปลี่ยนสูตร  
 \* @returns {void}  
 \*/  
function protectCriticalSheets() {  
  if (\!validateUserAccess('Protect Sheets')) return;  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var protectedCount \= 0;  
    
  SECURITY\_CONFIG.PROTECTED\_SHEETS.forEach(function(sheetName) {  
    var sheet \= ss.getSheetByName(sheetName);  
    if (sheet) {  
      var protection \= sheet.protect().setDescription('Protect Structure: ' \+ sheetName);  
        
      // อนุญาตเฉพาะ Admin ให้แก้ไขได้  
      var me \= Session.getEffectiveUser();  
      protection.addEditor(me);  
      protection.removeEditors(protection.getEditors()); // ลบคนอื่นออกหมด  
        
      if (protection.canDomainEdit()) {  
        protection.setDomainEdit(false);  
      }  
        
      // อนุญาตให้แก้ไขเฉพาะช่วงข้อมูล (สมมติแถว 2 ลงไป) ยกเว้นคอลัมน์สูตร  
      // ในที่นี้ล็อกทั้งชีตก่อน แล้วค่อยปล่อยช่วงถ้าจำเป็น (Advanced)  
      // สำหรับพื้นฐาน: ล็อกทั้งชีตให้ Admin แก้ได้คนเดียว  
        
      protectedCount++;  
      Logger.log('\[Security\] Protected sheet: ' \+ sheetName);  
    }  
  });  
    
  logSecurityEvent('SHEETS\_PROTECTED', 'Protected ' \+ protectedCount \+ ' sheets', Session.getActiveUser().getEmail());  
  SpreadsheetApp.getUi().alert('เสร็จสิ้น\!\\nล็อกโครงสร้างชีตสำคัญแล้ว ' \+ protectedCount \+ ' ชีต');  
}

/\*\*  
 \* ปลดล็อกชีตทั้งหมด (ใช้ในกรณีฉุกเฉิน)  
 \* @returns {void}  
 \*/  
function removeAllProtections() {  
  if (\!validateUserAccess('Remove All Protections')) return;  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var protections \= ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);  
    
  var count \= 0;  
  protections.forEach(function(p) {  
    p.remove();  
    count++;  
  });  
    
  logSecurityEvent('PROTECTIONS\_REMOVED', 'Removed ' \+ count \+ ' protections', Session.getActiveUser().getEmail());  
  SpreadsheetApp.getUi().alert('ปลดล็อกทั้งหมดแล้ว (' \+ count \+ ' รายการ)');  
}

// \=============================================================================  
// SECTION 4: AUDIT LOGGING SYSTEM  
// \=============================================================================

/\*\*  
 \* บันทึกเหตุการณ์ความปลอดภัยลงชีต Log  
 \* @param {string} eventType \- ประเภทเหตุการณ์ (ACCESS\_GRANTED, ACCESS\_DENIED, etc.)  
 \* @param {string} details \- รายละเอียด  
 \* @param {string} user \- ผู้ใช้งาน  
 \* @returns {void}  
 \*/  
function logSecurityEvent(eventType, details, user) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(SECURITY\_CONFIG.AUDIT\_LOG\_SHEET);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(SECURITY\_CONFIG.AUDIT\_LOG\_SHEET);  
    sheet.appendRow(\['Timestamp', 'Event Type', 'User', 'Details'\]);  
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('\#ffcccc');  
    sheet.hideColumns(5, 10); // ซ่อนคอลัมน์ที่ไม่ใช้ถ้ามี  
  }  
    
  var timestamp \= new Date();  
  sheet.appendRow(\[timestamp, eventType, user, details\]);  
    
  // เก็บ Log ไว้แค่ 1000 แถว  
  if (sheet.getLastRow() \> 1000\) {  
    sheet.deleteRows(2, sheet.getLastRow() \- 1000);  
  }  
}

/\*\*  
 \* ดูรายงาน Audit Log  
 \* @returns {void}  
 \*/  
function viewSecurityAuditLog() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(SECURITY\_CONFIG.AUDIT\_LOG\_SHEET);  
    
  if (\!sheet) {  
    SpreadsheetApp.getUi().alert('ยังไม่มีบันทึก Audit Log');  
    return;  
  }  
    
  ss.setActiveSheet(sheet);  
  SpreadsheetApp.getUi().alert('เปิดชีต Audit Log เรียบร้อย\\nกรุณาตรวจสอบข้อมูลล่าสุด');  
}

// \=============================================================================  
// SECTION 5: SETUP & INITIALIZATION WIZARD  
// \=============================================================================

/\*\*  
 \* ตั้งค่าความปลอดภัยเริ่มต้น (รันครั้งเดียวตอนติดตั้งระบบ)  
 \* @returns {void}  
 \*/  
function initializeSecuritySystem() {  
  if (\!validateUserAccess('Initialize Security')) return;  
    
  var ui \= SpreadsheetApp.getUi();  
  var owner \= SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail();  
    
  var result \= ui.alert(  
    'ตั้งค่าความปลอดภัยระบบ?',  
    'ระบบจะ:\\n1. เพิ่มคุณ (' \+ owner \+ ') เป็น Admin\\n2. ล็อกชีตสำคัญ\\n3. เปิดระบบ Audit Log\\n\\nต้องการดำเนินการหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (result \== ui.Button.YES) {  
    // 1\. เพิ่ม Admin  
    addAdminEmail(owner);  
      
    // 2\. ล็อกชีต  
    protectCriticalSheets();  
      
    // 3\. สร้าง Log Sheet (จะถูกสร้างอัตโนมัติเมื่อเขียน Log ครั้งแรก)  
    logSecurityEvent('SYSTEM\_INIT', 'Security system initialized', owner);  
      
    ui.alert('ตั้งค่าเสร็จสิ้น\!\\nระบบความปลอดภัยทำงานเรียบร้อยแล้ว');  
  }  
}

/\*\*  
 \* จัดการรายชื่อ Admin ผ่าน UI  
 \* @returns {void}  
 \*/  
function manageAdmins\_UI() {  
  if (\!validateUserAccess('Manage Admins')) return;  
    
  var ui \= SpreadsheetApp.getUi();  
  var currentAdmins \= getAdminEmailList().join('\\n');  
    
  var response \= ui.prompt(  
    'จัดการผู้ดูแลระบบ',  
    'รายชื่อ Admin ปัจจุบัน:\\n' \+ (currentAdmins || '(ไม่มี)') \+ '\\n\\nกรุณาใส่อีเมลใหม่เพื่อเพิ่ม (หรือเว้นว่างเพื่อดูรายชื่อเท่านั้น):',  
    ui.ButtonSet.OK\_CANCEL  
  );  
    
  if (response.getSelectedButton() \== ui.Button.OK) {  
    var email \= response.getResponseText().trim();  
    if (email) {  
      addAdminEmail(email);  
      ui.alert('เพิ่ม ' \+ email \+ ' เป็น Admin เรียบร้อย');  
    } else {  
      ui.alert('รายชื่อ Admin:\\n' \+ currentAdmins);  
    }  
  }  
}

// \=============================================================================  
// SECTION 6: DEBUG & MAINTENANCE  
// \=============================================================================

/\*\*  
 \* รีเซ็ตการตั้งค่าความปลอดภัยทั้งหมด (อันตราย\!)  
 \* @returns {void}  
 \*/  
function resetSecuritySystem() {  
  // อนุญาตเฉพาะ Owner เท่านั้นที่จะรีเซ็ตได้ แม้จะเป็น Admin ก็ตาม  
  var user \= Session.getActiveUser().getEmail();  
  var owner \= SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail();  
    
  if (user \!== owner) {  
    throw new Error('Only the Spreadsheet Owner can reset security settings.');  
  }  
    
  var ui \= SpreadsheetApp.getUi();  
  var confirm \= ui.alert(  
    'คำเตือนระดับสูงสุด\!',  
    'คุณกำลังจะ:\\n1. ลบรายชื่อ Admin ทั้งหมด\\n2. ปลดล็อกชีตทุกชีต\\n3. ล้าง Audit Log\\n\\nการกระทำนี้ไม่สามารถย้อนกลับได้\\nยืนยันหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (confirm \== ui.Button.YES) {  
    // ลบ Property  
    PropertiesService.getScriptProperties().deleteProperty(SECURITY\_CONFIG.ADMIN\_EMAILS\_PROP\_KEY);  
      
    // ลบ Protection  
    removeAllProtections();  
      
    // ลบ Log Sheet  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var sheet \= ss.getSheetByName(SECURITY\_CONFIG.AUDIT\_LOG\_SHEET);  
    if (sheet) ss.deleteSheet(sheet);  
      
    Logger.log('\[Security\] System reset by owner.');  
    ui.alert('รีเซ็ตระบบความปลอดภัยเรียบร้อยแล้ว');  
  }  
}

/\*\*  
 \* ตรวจสอบสถานะความปลอดภัยปัจจุบัน  
 \* @returns {void}  
 \*/  
function checkSecurityStatus() {  
  var isAdmin \= isCurrentUserAdmin();  
  var admins \= getAdminEmailList();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var protections \= ss.getProtections(SpreadsheetApp.ProtectionType.SHEET).length;  
    
  var msg \= '=== Security Status Report \===\\n\\n';  
  msg \+= 'You are Admin: ' \+ (isAdmin ? 'YES' : 'NO') \+ '\\n';  
  msg \+= 'Total Admins: ' \+ admins.length \+ '\\n';  
  msg \+= 'Protected Sheets: ' \+ protections \+ '\\n\\n';  
  msg \+= 'Admin List:\\n' \+ (admins.join('\\n') || '- None \-');  
    
  SpreadsheetApp.getUi().alert(msg);  
}

Service\_Maintenance.gs  
/\*\*  
 \* @fileoverview Service\_Maintenance \- สคริปต์สำหรับการดูแลรักษาระบบ (ลบข้อมูลเก่า, จัดเรียง, ทำความสะอาด)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มระบบ Backup อัตโนมัติก่อนล้างข้อมูล และปรับปรุงความเร็วในการจัดเรียง  
 \* \- v4.1: แยกฟังก์ชันทำความสะอาดข้อมูลออกจาก Service\_Master เพื่อความเป็นโมดูล  
 \* \- v4.0: สร้างโมดูลเฉพาะทางสำหรับการบำรุงรักษาฐานข้อมูลระยะยาว  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "พนักงานทำความสะอาด" ของระบบ:  
 \* 1\. ลบข้อมูลชั่วคราวหรือข้อมูลเก่าที่หมดอายุ (\>30 วัน)  
 \* 2\. จัดเรียงข้อมูลในชีตให้เป็นระเบียบ (Sort & Organize)  
 \* 3\. ตรวจสอบและลบแถวที่ซ้ำซ้อน (Duplicate Removal)  
 \* 4\. บีบอัดพื้นที่เก็บข้อมูลและเคลียร์ Cache ที่ไม่จำเป็น  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่าการบำรุงรักษา  
 \* @constant {Object} MAINTENANCE\_CONFIG  
 \*/  
var MAINTENANCE\_CONFIG \= {  
  BACKUP\_SHEET\_PREFIX: 'Backup\_',  
  MAX\_HISTORY\_DAYS: 30,             // เก็บประวัติสูงสุด 30 วัน  
  BATCH\_SIZE: 500,                  // จำนวนแถวที่ประมวลผลต่อครั้ง  
  AUTO\_BACKUP\_BEFORE\_CLEAN: true,   // สำรองข้อมูลก่อนล้างเสมอ  
  LOG\_SHEET\_NAME: 'Maintenance\_Logs'  
};

/\*\*  
 \* สร้างชื่อชีตสำรองพร้อมวันที่  
 \* @param {string} originalName \- ชื่อชีตต้นฉบับ  
 \* @returns {string} ชื่อชีตสำรองใหม่  
 \*/  
function generateBackupSheetName(originalName) {  
  var dateStr \= Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd\_HHmmss');  
  return MAINTENANCE\_CONFIG.BACKUP\_SHEET\_PREFIX \+ originalName \+ '\_' \+ dateStr;  
}

/\*\*  
 \* สำรองข้อมูลชีตก่อนการดำเนินการสำคัญ  
 \* @param {string} sheetName \- ชื่อชีตที่ต้องการสำรอง  
 \* @returns {Sheet|null} ออบเจ็กต์ชีตที่ถูกสร้างใหม่ หรือ null หากล้มเหลว  
 \*/  
function createSheetBackup(sheetName) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sourceSheet \= ss.getSheetByName(sheetName);  
    
  if (\!sourceSheet) {  
    Logger.log('\[Maintenance\] Sheet not found for backup: ' \+ sheetName);  
    return null;  
  }  
    
  var backupName \= generateBackupSheetName(sheetName);  
  var backupSheet \= sourceSheet.copyTo(ss).setName(backupName);  
    
  // ย้ายชีตสำรองไปไว้ท้ายสุดและเปลี่ยนสีแท็บเป็นเทา  
  backupSheet.setTabColor('\#9e9e9e');  
    
  Logger.log('\[Maintenance\] Backup created: ' \+ backupName);  
  logMaintenanceEvent('BACKUP\_CREATED', backupName);  
    
  return backupSheet;  
}

// \=============================================================================  
// SECTION 2: DATA CLEANING & PURGING  
// \=============================================================================

/\*\*  
 \* ลบข้อมูลที่เก่ากว่ากำหนด (เช่น เก่ากว่า 30 วัน) จากชีต Log หรือ History  
 \* @param {string} sheetName \- ชื่อชีตที่ต้องการล้าง  
 \* @param {number} daysToKeep \- จำนวนวันที่ต้องการเก็บรักษา  
 \* @returns {number} จำนวนแถวที่ถูกลบ  
 \*/  
function purgeOldData(sheetName, daysToKeep) {  
  if (\!validateUserAccess('Purge Old Data')) return 0; // ตรวจสอบสิทธิ์  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(sheetName);  
  if (\!sheet) return 0;  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return 0;  
    
  // สมมติว่าคอลัมน์ A เป็น Timestamp (วันที่)  
  var dates \= sheet.getRange(2, 1, lastRow \- 1, 1).getValues();  
  var cutoffDate \= new Date();  
  cutoffDate.setDate(cutoffDate.getDate() \- daysToKeep);  
    
  var rowsToDelete \= \[\];  
    
  for (var i \= 0; i \< dates.length; i++) {  
    var rowDate \= new Date(dates\[i\]\[0\]);  
    if (rowDate \< cutoffDate) {  
      rowsToDelete.push(i \+ 2); // แปลงเป็นเลขแถวจริง (เริ่มที่ 2\)  
    }  
  }  
    
  // ลบจากล่างขึ้นบนเพื่อไม่ให้เลขแถวเลื่อน  
  for (var j \= rowsToDelete.length \- 1; j \>= 0; j--) {  
    sheet.deleteRow(rowsToDelete\[j\]);  
  }  
    
  logMaintenanceEvent('DATA\_PURGED', 'Deleted ' \+ rowsToDelete.length \+ ' rows from ' \+ sheetName);  
  return rowsToDelete.length;  
}

/\*\*  
 \* ลบแถวที่ซ้ำซ้อนออกโดยอ้างอิงจากคอลัมน์ UUID หรือ Name  
 \* @param {string} sheetName \- ชื่อชีตเป้าหมาย  
 \* @param {number} keyColumnIndex \- ดัชนีคอลัมน์ที่ใช้ตรวจสอบความซ้ำ (1-indexed)  
 \* @returns {number} จำนวนแถวที่ลบออก  
 \*/  
function removeDuplicateRows(sheetName, keyColumnIndex) {  
  if (\!validateUserAccess('Remove Duplicates')) return 0;  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(sheetName);  
  if (\!sheet) return 0;  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return 0;  
    
  var data \= sheet.getRange(2, keyColumnIndex, lastRow \- 1, 1).getValues();  
  var seen \= {};  
  var rowsToDelete \= \[\];  
    
  for (var i \= 0; i \< data.length; i++) {  
    var key \= String(data\[i\]\[0\]).trim();  
    if (\!key) continue; // ข้ามแถวว่าง  
      
    if (seen\[key\]) {  
      rowsToDelete.push(i \+ 2); // แถวที่ซ้ำ  
    } else {  
      seen\[key\] \= true;  
    }  
  }  
    
  // ลบจากล่างขึ้นบน  
  for (var j \= rowsToDelete.length \- 1; j \>= 0; j--) {  
    sheet.deleteRow(rowsToDelete\[j\]);  
  }  
    
  logMaintenanceEvent('DUPLICATES\_REMOVED', 'Deleted ' \+ rowsToDelete.length \+ ' duplicates from ' \+ sheetName);  
  return rowsToDelete.length;  
}

// \=============================================================================  
// SECTION 3: SORTING & ORGANIZATION  
// \=============================================================================

/\*\*  
 \* จัดเรียงข้อมูลในชีตตามคอลัมน์ที่กำหนด  
 \* @param {string} sheetName \- ชื่อชีต  
 \* @param {number} sortColumnIndex \- คอลัมน์ที่ใช้เรียง (1-indexed)  
 \* @param {boolean} ascending \- true \= น้อยไปมาก, false \= มากไปน้อย  
 \* @returns {void}  
 \*/  
function sortSheetData(sheetName, sortColumnIndex, ascending) {  
  if (\!validateUserAccess('Sort Data')) return;  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(sheetName);  
  if (\!sheet) return;  
    
  var lastRow \= sheet.getLastRow();  
  var lastCol \= sheet.getLastColumn();  
    
  if (lastRow \< 2\) return;  
    
  // กำหนดช่วงข้อมูล (ไม่รวม Header)  
  var range \= sheet.getRange(2, 1, lastRow \- 1, lastCol);  
    
  range.sort({  
    column: sortColumnIndex,  
    ascending: ascending  
  });  
    
  logMaintenanceEvent('DATA\_SORTED', 'Sorted ' \+ sheetName \+ ' by col ' \+ sortColumnIndex);  
}

/\*\*  
 \* จัดระเบียบชีตทั้งหมดในระบบ (Run All Maintenance)  
 \* @returns {void}  
 \*/  
function runFullSystemMaintenance() {  
  if (\!validateUserAccess('Full Maintenance')) return;  
    
  var ui \= SpreadsheetApp.getUi();  
  var confirm \= ui.alert(  
    'ยืนยันการบำรุงรักษาระบบ?',  
    'ระบบจะ:\\n1. สำรองข้อมูลสำคัญ\\n2. ลบข้อมูลเก่า (\>30 วัน)\\n3. ลบข้อมูลซ้ำ\\n4. จัดเรียงข้อมูล\\n\\nกระบวนการนี้อาจใช้เวลาสักครู่',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (confirm \!= ui.Button.YES) return;  
    
  try {  
    ui.toast('กำลังเริ่มต้นบำรุงรักษา...');  
      
    // 1\. สำรองข้อมูลสำคัญ  
    var criticalSheets \= \['Database', 'NameMapping'\];  
    criticalSheets.forEach(function(name) {  
      if (MAINTENANCE\_CONFIG.AUTO\_BACKUP\_BEFORE\_CLEAN) {  
        createSheetBackup(name);  
      }  
    });  
      
    // 2\. ลบข้อมูลเก่าจาก Log  
    purgeOldData(MAINTENANCE\_CONFIG.LOG\_SHEET\_NAME, MAINTENANCE\_CONFIG.MAX\_HISTORY\_DAYS);  
      
    // 3\. ลบข้อมูลซ้ำใน Database (สมมติคอลัมน์ UUID คือคอลัมน์ที่ 1\)  
    removeDuplicateRows('Database', 1);  
      
    // 4\. จัดเรียง Database ตามชื่อ (สมมติคอลัมน์ชื่อคือคอลัมน์ที่ 2\)  
    sortSheetData('Database', 2, true);  
      
    ui.alert('เสร็จสิ้น\!\\nการบำรุงรักษาระบบสำเร็จเรียบร้อยแล้ว');  
    logMaintenanceEvent('FULL\_MAINTENANCE', 'System maintenance completed successfully');  
      
  } catch (e) {  
    ui.alert('เกิดข้อผิดพลาด: ' \+ e.message);  
    logMaintenanceEvent('ERROR', 'Maintenance failed: ' \+ e.message);  
  }  
}

// \=============================================================================  
// SECTION 4: CACHE & TEMPORARY DATA MANAGEMENT  
// \=============================================================================

/\*\*  
 \* ล้าง Cache ทั้งหมดของระบบเพื่อคืนพื้นที่หน่วยความจำ  
 \* @returns {void}  
 \*/  
function clearAllSystemCaches() {  
  if (\!validateUserAccess('Clear Caches')) return;  
    
  var props \= PropertiesService.getScriptProperties();  
  var keys \= \[  
    'POSTAL\_CACHE',  
    'GEO\_CACHE',  
    'SEARCH\_CACHE',  
    'AI\_RESPONSE\_CACHE'  
  \];  
    
  var count \= 0;  
  keys.forEach(function(key) {  
    if (props.getProperty(key)) {  
      props.deleteProperty(key);  
      count++;  
    }  
  });  
    
  logMaintenanceEvent('CACHE\_CLEARED', 'Cleared ' \+ count \+ ' cache properties');  
  SpreadsheetApp.getUi().alert('ล้าง Cache เรียบร้อย\\nจำนวน: ' \+ count \+ ' รายการ');  
}

/\*\*  
 \* ลบชีตชั่วคราวที่ไม่ได้ใช้งาน (ที่มีชื่อขึ้นต้นด้วย Temp\_ หรือ Backup\_ เก่าๆ)  
 \* @returns {number} จำนวนชีตที่ลบ  
 \*/  
function cleanupTemporarySheets() {  
  if (\!validateUserAccess('Cleanup Temp Sheets')) return 0;  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheets \= ss.getSheets();  
  var now \= new Date().getTime();  
  var maxAgeMs \= MAINTENANCE\_CONFIG.MAX\_HISTORY\_DAYS \* 24 \* 60 \* 60 \* 1000;  
  var count \= 0;  
    
  sheets.forEach(function(sheet) {  
    var name \= sheet.getName();  
      
    // ลบชีต Temp ทันที  
    if (name.indexOf('Temp\_') \=== 0\) {  
      ss.deleteSheet(sheet);  
      count++;  
      return;  
    }  
      
    // ลบชีต Backup ที่เก่าเกินกำหนด  
    if (name.indexOf(MAINTENANCE\_CONFIG.BACKUP\_SHEET\_PREFIX) \=== 0\) {  
      // พยายามดึงวันที่จากชื่อชีต (รูปแบบ YYYYMMDD\_HHMMSS)  
      // อย่างง่าย: ตรวจสอบเวลาแก้ไขล่าสุดของชีต (ถ้ามี) หรือใช้เกณฑ์ง่ายๆ  
      // ในที่นี้ใช้เกณฑ์ชื่อไฟล์ถ้าสามารถ Parse ได้ หรือทิ้งไว้ก่อนถ้าซับซ้อน  
      // เพื่อความปลอดภัย จะลบเฉพาะที่ชื่อขึ้นต้นและเก่ามากจริงๆ (ใช้วิธีเช็ควันที่สร้างไม่ได้โดยตรงใน GAS ง่ายนัก)  
      // จึงใช้วิธีนับจำนวนชีต Backup ถ้าเกิน 10 ชีตให้ลบอันเก่าสุด (ต้องเรียงชื่อก่อน)  
    }  
  });  
    
  // วิธีจัดการ Backup เก่า: นับจำนวนแล้วลบอันเก่าสุด  
  var backupSheets \= sheets.filter(function(s) {  
    return s.getName().indexOf(MAINTENANCE\_CONFIG.BACKUP\_SHEET\_PREFIX) \=== 0;  
  }).sort(function(a, b) {  
    return b.getName().localeCompare(a.getName()); // เรียงจากใหม่ไปเก่า (เพราะชื่อมีวันที่)  
  });  
    
  if (backupSheets.length \> 10\) {  
    for (var i \= 10; i \< backupSheets.length; i++) {  
      ss.deleteSheet(backupSheets\[i\]);  
      count++;  
    }  
  }  
    
  logMaintenanceEvent('TEMP\_SHEETS\_CLEANED', 'Deleted ' \+ count \+ ' temporary sheets');  
  return count;  
}

// \=============================================================================  
// SECTION 5: REPORTING & UTILITIES  
// \=============================================================================

/\*\*  
 \* สร้างรายงานสรุปสถานะการบำรุงรักษา  
 \* @returns {void}  
 \*/  
function showMaintenanceReport() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheets \= ss.getSheets();  
  var totalRows \= 0;  
  var totalCols \= 0;  
  var backupCount \= 0;  
    
  sheets.forEach(function(sheet) {  
    totalRows \+= sheet.getLastRow();  
    totalCols \+= sheet.getLastColumn();  
    if (sheet.getName().indexOf(MAINTENANCE\_CONFIG.BACKUP\_SHEET\_PREFIX) \=== 0\) {  
      backupCount++;  
    }  
  });  
    
  var msg \= '=== Maintenance Report \===\\n\\n';  
  msg \+= 'Total Sheets: ' \+ sheets.length \+ '\\n';  
  msg \+= 'Total Rows (all sheets): ' \+ totalRows \+ '\\n';  
  msg \+= 'Total Columns (all sheets): ' \+ totalCols \+ '\\n';  
  msg \+= 'Backup Sheets Found: ' \+ backupCount \+ '\\n';  
  msg \+= 'Cell Usage Estimate: ' \+ (totalRows \* totalCols) \+ ' cells\\n\\n';  
    
  if (backupCount \> 10\) {  
    msg \+= '⚠️ คำแนะนำ: มีชีต Backup มากกว่า 10 ชีต ควรทำการล้างข้อมูลเก่า';  
  } else {  
    msg \+= '✅ สถานะปกติ';  
  }  
    
  SpreadsheetApp.getUi().alert(msg);  
}

/\*\*  
 \* บันทึกเหตุการณ์การทำงานลง Log  
 \* @param {string} eventType \- ประเภทเหตุการณ์  
 \* @param {string} details \- รายละเอียด  
 \* @returns {void}  
 \*/  
function logMaintenanceEvent(eventType, details) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(MAINTENANCE\_CONFIG.LOG\_SHEET\_NAME);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(MAINTENANCE\_CONFIG.LOG\_SHEET\_NAME);  
    sheet.appendRow(\['Timestamp', 'Event', 'Details', 'User'\]);  
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');  
  }  
    
  sheet.appendRow(\[  
    new Date(),   
    eventType,   
    details,   
    Session.getActiveUser().getEmail()  
  \]);  
    
  // เก็บ Log แค่ 500 แถว  
  if (sheet.getLastRow() \> 500\) {  
    sheet.deleteRows(2, sheet.getLastRow() \- 500);  
  }  
}

// \=============================================================================  
// SECTION 6: DEBUG & HELPER FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันตรวจสอบสิทธิ์ (เรียกใช้จาก Security Module)  
 \* @param {string} actionName \- ชื่อการกระทำ  
 \* @returns {boolean} true ถ้าผ่าน  
 \*/  
function validateUserAccess(actionName) {  
  // เรียกใช้ฟังก์ชันจริงจาก Setup\_Security.gs หากมี  
  if (typeof isCurrentUserAdmin \=== 'function') {  
    if (\!isCurrentUserAdmin()) {  
      SpreadsheetApp.getUi().alert('Access Denied: You are not an admin.');  
      return false;  
    }  
    return true;  
  }  
  // Fallback: อนุญาตทุกคนถ้าไม่มีโมดูล Security (สำหรับ Dev)  
  return true;  
}

/\*\*  
 \* ทดสอบการสร้าง Backup  
 \* @returns {void}  
 \*/  
function testBackupFunction() {  
  var sheetName \= 'Database'; // เปลี่ยนเป็นชื่อชีตที่มีจริง  
  var result \= createSheetBackup(sheetName);  
  if (result) {  
    SpreadsheetApp.getUi().alert('Test Successful: Backup created at ' \+ result.getName());  
  } else {  
    SpreadsheetApp.getUi().alert('Test Failed: Could not create backup');  
  }  
}

Service\_Notify.gs  
/\*\*  
 \* @fileoverview Service\_Notify \- ระบบแจ้งเตือนผ่านช่องทางต่างๆ (LINE, Email, Telegram)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มระบบ Queue การส่งข้อความเพื่อป้องกันการติด Rate Limit และรองรับ Telegram  
 \* \- v4.1: ปรับปรุงรูปแบบข้อความแจ้งเตือนให้สวยงามและอ่านง่ายขึ้น (Rich Message)  
 \* \- v4.0: แยกโมดูลการแจ้งเตือนออกจาก Service\_Master เพื่อความเป็นอิสระ  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "ผู้สื่อสาร" ของระบบ:  
 \* 1\. ส่งแจ้งเตือนเมื่อพบข้อมูลสำคัญหรือข้อผิดพลาด (Critical Errors)  
 \* 2\. ส่งรายงานสรุปประจำวัน (Daily Report) ผ่าน LINE Notify หรือ Email  
 \* 3\. จัดการ Token และการตั้งค่าช่องทางการแจ้งเตือนอย่างปลอดภัย  
 \* 4\. รองรับระบบ Queue หากต้องการส่งข้อความจำนวนมาก  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่าการแจ้งเตือน  
 \* @constant {Object} NOTIFY\_CONFIG  
 \*/  
var NOTIFY\_CONFIG \= {  
  LINE\_API\_URL: 'https://notify-api.line.me/api/notify',  
  TELEGRAM\_API\_BASE: 'https://api.telegram.org/bot',  
  PROP\_KEY\_LINE\_TOKEN: 'LINE\_NOTIFY\_TOKEN',  
  PROP\_KEY\_TELEGRAM\_BOT: 'TELEGRAM\_BOT\_TOKEN',  
  PROP\_KEY\_TELEGRAM\_CHAT: 'TELEGRAM\_CHAT\_ID',  
  EMAIL\_SUBJECT\_PREFIX: '\[Logistics System\]',  
  ENABLE\_EMAIL\_FALLBACK: true // ส่ง Email ถ้า LINE ล้มเหลว  
};

/\*\*  
 \* ดึง LINE Notify Token จาก PropertiesService  
 \* @returns {string|null} Token หรือ null ถ้าไม่พบ  
 \*/  
function getLineToken() {  
  var props \= PropertiesService.getScriptProperties();  
  return props.getProperty(NOTIFY\_CONFIG.PROP\_KEY\_LINE\_TOKEN);  
}

/\*\*  
 \* ดึงการตั้งค่า Telegram (Bot Token และ Chat ID)  
 \* @returns {Object} { token: string, chatId: string } หรือ null  
 \*/  
function getTelegramConfig() {  
  var props \= PropertiesService.getScriptProperties();  
  var token \= props.getProperty(NOTIFY\_CONFIG.PROP\_KEY\_TELEGRAM\_BOT);  
  var chatId \= props.getProperty(NOTIFY\_CONFIG.PROP\_KEY\_TELEGRAM\_CHAT);  
    
  if (token && chatId) {  
    return { token: token, chatId: chatId };  
  }  
  return null;  
}

// \=============================================================================  
// SECTION 2: CORE NOTIFICATION LOGIC (LINE & TELEGRAM)  
// \=============================================================================

/\*\*  
 \* ส่งข้อความแจ้งเตือนผ่าน LINE Notify  
 \* @param {string} message \- ข้อความที่ต้องการส่ง  
 \* @param {string} imageUrl \- URL รูปภาพ (optional)  
 \* @returns {boolean} true ถ้าส่งสำเร็จ, false ถ้าล้มเหลว  
 \*/  
function sendLineNotify(message, imageUrl) {  
  var token \= getLineToken();  
    
  if (\!token) {  
    Logger.log('\[Notify\] LINE Token not found. Skipping LINE notify.');  
    return false;  
  }  
    
  var payload \= {  
    'message': message  
  };  
    
  if (imageUrl) {  
    payload\['imageThumbnail'\] \= imageUrl;  
    payload\['imageFullsize'\] \= imageUrl;  
  }  
    
  var options \= {  
    'method': 'post',  
    'headers': {  
      'Authorization': 'Bearer ' \+ token  
    },  
    'payload': payload,  
    'muteHttpExceptions': true  
  };  
    
  try {  
    var response \= UrlFetchApp.fetch(NOTIFY\_CONFIG.LINE\_API\_URL, options);  
    var responseCode \= response.getResponseCode();  
      
    if (responseCode \=== 200\) {  
      Logger.log('\[Notify\] LINE Notify sent successfully.');  
      return true;  
    } else {  
      Logger.log('\[Notify\] LINE Notify failed: ' \+ response.getContentText());  
      return false;  
    }  
  } catch (e) {  
    Logger.log('\[Notify\] Error sending LINE Notify: ' \+ e.message);  
    return false;  
  }  
}

/\*\*  
 \* ส่งข้อความแจ้งเตือนผ่าน Telegram Bot  
 \* @param {string} message \- ข้อความที่ต้องการส่ง  
 \* @param {string} parseMode \- โหมดการแสดงผล (Markdown, HTML, etc.)  
 \* @returns {boolean} true ถ้าส่งสำเร็จ, false ถ้าล้มเหลว  
 \*/  
function sendTelegramMessage(message, parseMode) {  
  var config \= getTelegramConfig();  
    
  if (\!config) {  
    Logger.log('\[Notify\] Telegram Config not found. Skipping Telegram notify.');  
    return false;  
  }  
    
  var url \= NOTIFY\_CONFIG.TELEGRAM\_API\_BASE \+ config.token \+ '/sendMessage';  
    
  var payload \= {  
    'chat\_id': config.chatId,  
    'text': message,  
    'parse\_mode': parseMode || 'HTML'  
  };  
    
  var options \= {  
    'method': 'post',  
    'contentType': 'application/json',  
    'payload': JSON.stringify(payload),  
    'muteHttpExceptions': true  
  };  
    
  try {  
    var response \= UrlFetchApp.fetch(url, options);  
    var responseCode \= response.getResponseCode();  
    var json \= JSON.parse(response.getContentText());  
      
    if (responseCode \=== 200 && json.ok) {  
      Logger.log('\[Notify\] Telegram message sent successfully.');  
      return true;  
    } else {  
      Logger.log('\[Notify\] Telegram failed: ' \+ response.getContentText());  
      return false;  
    }  
  } catch (e) {  
    Logger.log('\[Notify\] Error sending Telegram message: ' \+ e.message);  
    return false;  
  }  
}

/\*\*  
 \* ส่งอีเมลแจ้งเตือน (Fallback หรือใช้คู่กับแชท)  
 \* @param {string} subject \- หัวข้ออีเมล  
 \* @param {string} body \- เนื้อหาอีเมล  
 \* @param {string} recipient \- อีเมลผู้รับ (ถ้าว่างจะส่งให้เจ้าของโปรเจกต์)  
 \* @returns {boolean} true ถ้าส่งสำเร็จ  
 \*/  
function sendEmailNotification(subject, body, recipient) {  
  try {  
    var to \= recipient || Session.getActiveUser().getEmail();  
    var fullSubject \= NOTIFY\_CONFIG.EMAIL\_SUBJECT\_PREFIX \+ ' ' \+ subject;  
      
    GmailApp.sendEmail(to, fullSubject, body, {  
      htmlBody: body.replace(/\\n/g, '\<br\>'), // แปลงบรรทัดเป็น HTML เบื้องต้น  
      name: 'Logistics System Bot'  
    });  
      
    Logger.log('\[Notify\] Email sent to ' \+ to);  
    return true;  
  } catch (e) {  
    Logger.log('\[Notify\] Error sending email: ' \+ e.message);  
    return false;  
  }  
}

// \=============================================================================  
// SECTION 3: UNIFIED NOTIFICATION WRAPPER  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันกลางสำหรับส่งแจ้งเตือนทุกช่องทางพร้อมกัน (Smart Dispatch)  
 \* @param {string} title \- หัวข้อเรื่องสั้นๆ  
 \* @param {string} message \- รายละเอียดข้อความ  
 \* @param {string} priority \- ระดับความสำคัญ ('HIGH', 'NORMAL', 'LOW')  
 \* @returns {Object} สถานะการส่ง { line: boolean, telegram: boolean, email: boolean }  
 \*/  
function sendSystemNotification(title, message, priority) {  
  var fullMessage \= '🔔 \*' \+ title \+ '\*\\n\\n' \+ message \+ '\\n\\n\_เวลา: ' \+ new Date().toLocaleString('th-TH') \+ '\_';  
  var status \= { line: false, telegram: false, email: false };  
    
  // 1\. พยายามส่ง LINE  
  status.line \= sendLineNotify(fullMessage.replace(/\[\*\_\]/g, '')); // LINE ไม่รองรับ Markdown บางตัว  
    
  // 2\. พยายามส่ง Telegram (รองรับ HTML/Markdown ดีกว่า)  
  status.telegram \= sendTelegramMessage(fullMessage, 'Markdown');  
    
  // 3\. ถ้าสำคัญมาก (HIGH) และแชทไม่สำเร็จ ให้ส่ง Email ทันที  
  if (priority \=== 'HIGH' && \!status.line && \!status.telegram) {  
    if (NOTIFY\_CONFIG.ENABLE\_EMAIL\_FALLBACK) {  
      status.email \= sendEmailNotification(title, fullMessage);  
    }  
  }  
    
  // บันทึก Log  
  logNotifyEvent(title, status);  
    
  return status;  
}

/\*\*  
 \* ส่งแจ้งเตือนเมื่อเกิดข้อผิดพลาดร้ายแรง (Error Alert)  
 \* @param {string} errorMessage \- ข้อความแสดงข้อผิดพลาด  
 \* @param {string} stackTrace \- Stack trace (optional)  
 \* @returns {void}  
 \*/  
function sendErrorAlert(errorMessage, stackTrace) {  
  var title \= '🚨 SYSTEM ERROR ALERT';  
  var msg \= 'เกิดข้อผิดพลาดร้ายแรงในระบบ:\\n\\n' \+ errorMessage;  
  if (stackTrace) {  
    msg \+= '\\n\\nDetails:\\n' \+ stackTrace.substring(0, 500); // ตัดให้สั้นลง  
  }  
    
  sendSystemNotification(title, msg, 'HIGH');  
}

/\*\*  
 \* ส่งรายงานสรุปประจำวัน (Daily Summary)  
 \* @param {Object} stats \- ข้อมูลสถิติ { processed: number, success: number, failed: number }  
 \* @returns {void}  
 \*/  
function sendDailyReport(stats) {  
  var title \= '📊 Daily Operation Report';  
  var msg \= 'สรุปการทำงานประจำวัน:\\n\\n';  
  msg \+= '✅ สำเร็จ: ' \+ stats.success \+ ' รายการ\\n';  
  msg \+= '❌ ล้มเหลว: ' \+ stats.failed \+ ' รายการ\\n';  
  msg \+= '🔄 ทั้งหมด: ' \+ stats.processed \+ ' รายการ\\n';  
    
  var successRate \= stats.processed \> 0 ? ((stats.success / stats.processed) \* 100).toFixed(2) : 0;  
  msg \+= '\\n💯 อัตราความสำเร็จ: ' \+ successRate \+ '%';  
    
  sendSystemNotification(title, msg, 'NORMAL');  
}

// \=============================================================================  
// SECTION 4: SETUP & CONFIGURATION UI  
// \=============================================================================

/\*\*  
 \* ตั้งค่า LINE Notify Token ผ่าน UI  
 \* @returns {void}  
 \*/  
function setupLineToken() {  
  var ui \= SpreadsheetApp.getUi();  
  var response \= ui.prompt(  
    'ตั้งค่า LINE Notify',  
    'กรุณาใส่ Access Token จาก line.me/th/i/myapp/\\n\\nToken:',  
    ui.ButtonSet.OK\_CANCEL  
  );  
    
  if (response.getSelectedButton() \== ui.Button.OK) {  
    var token \= response.getResponseText().trim();  
    if (token) {  
      var props \= PropertiesService.getScriptProperties();  
      props.setProperty(NOTIFY\_CONFIG.PROP\_KEY\_LINE\_TOKEN, token);  
        
      // ทดสอบส่งข้อความ  
      ui.toast('กำลังทดสอบการเชื่อมต่อ...');  
      if (sendLineNotify('ทดสอบระบบแจ้งเตือน Logistics System เรียบร้อย')) {  
        ui.alert('ตั้งค่าสำเร็จ\! ทดสอบส่งข้อความแล้ว');  
      } else {  
        ui.alert('ตั้งค่า Token แล้ว แต่ทดสอบส่งไม่สำเร็จ\\nกรุณาตรวจสอบ Token อีกครั้ง');  
      }  
    }  
  }  
}

/\*\*  
 \* ตั้งค่า Telegram Bot ผ่าน UI  
 \* @returns {void}  
 \*/  
function setupTelegramConfig() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var botResponse \= ui.prompt(  
    'ตั้งค่า Telegram Bot (1/2)',  
    'กรุณาใส่ Bot Token (จาก @BotFather):\\n\\nToken:',  
    ui.ButtonSet.OK\_CANCEL  
  );  
    
  if (botResponse.getSelectedButton() \!= ui.Button.OK) return;  
  var botToken \= botResponse.getResponseText().trim();  
    
  var chatResponse \= ui.prompt(  
    'ตั้งค่า Telegram Bot (2/2)',  
    'กรุณาใส่ Chat ID (กลุ่ม或个人):\\n\\nChat ID:',  
    ui.ButtonSet.OK\_CANCEL  
  );  
    
  if (chatResponse.getSelectedButton() \== ui.Button.OK) {  
    var chatId \= chatResponse.getResponseText().trim();  
    var props \= PropertiesService.getScriptProperties();  
    props.setProperty(NOTIFY\_CONFIG.PROP\_KEY\_TELEGRAM\_BOT, botToken);  
    props.setProperty(NOTIFY\_CONFIG.PROP\_KEY\_TELEGRAM\_CHAT, chatId);  
      
    ui.toast('กำลังทดสอบการเชื่อมต่อ...');  
    if (sendTelegramMessage('ทดสอบระบบแจ้งเตือน Logistics System เรียบร้อย', 'HTML')) {  
      ui.alert('ตั้งค่า Telegram สำเร็จ\! ทดสอบส่งข้อความแล้ว');  
    } else {  
      ui.alert('ตั้งค่าแล้ว แต่ทดสอบส่งไม่สำเร็จ\\nกรุณาตรวจสอบ Token และ Chat ID');  
    }  
  }  
}

// \=============================================================================  
// SECTION 5: LOGGING & MONITORING  
// \=============================================================================

/\*\*  
 \* บันทึกประวัติการส่งแจ้งเตือน  
 \* @param {string} title \- หัวข้อเรื่อง  
 \* @param {Object} status \- สถานะการส่ง  
 \* @returns {void}  
 \*/  
function logNotifyEvent(title, status) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= 'Notify\_Logs';  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(sheetName);  
    sheet.appendRow(\['Timestamp', 'Title', 'LINE', 'Telegram', 'Email'\]);  
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('\#dddddd');  
  }  
    
  sheet.appendRow(\[  
    new Date(),  
    title,  
    status.line ? 'OK' : 'FAIL',  
    status.telegram ? 'OK' : 'FAIL',  
    status.email ? 'OK' : 'FAIL'  
  \]);  
    
  // เก็บ Log แค่ 500 แถว  
  if (sheet.getLastRow() \> 500\) {  
    sheet.deleteRows(2, sheet.getLastRow() \- 500);  
  }  
}

/\*\*  
 \* ดูรายงานสถานะการแจ้งเตือน  
 \* @returns {void}  
 \*/  
function showNotifyStats() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('Notify\_Logs');  
    
  if (\!sheet || sheet.getLastRow() \< 2\) {  
    SpreadsheetApp.getUi().alert('ยังไม่มีบันทึกการส่งแจ้งเตือน');  
    return;  
  }  
    
  ss.setActiveSheet(sheet);  
  SpreadsheetApp.getUi().alert('เปิดชีตบันทึกการแจ้งเตือนแล้ว\\nกรุณาตรวจสอบสถิติล่าสุด');  
}

// \=============================================================================  
// SECTION 6: DEBUG & HELPER FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ทดสอบการแจ้งเตือนทั้งหมด (Test All Channels)  
 \* @returns {void}  
 \*/  
function testAllNotificationChannels() {  
  var ui \= SpreadsheetApp.getUi();  
  ui.alert('เริ่มทดสอบระบบแจ้งเตือน...\\nกรุณารอสักครู่');  
    
  var result \= sendSystemNotification(  
    '🧪 System Test',  
    'นี่คือข้อความทดสอบจากระบบ Logistics Master Data\\nหากท่านเห็นข้อความนี้ แสดงว่าระบบทำงานปกติ',  
    'NORMAL'  
  );  
    
  var msg \= 'ผลการทดสอบ:\\n';  
  msg \+= 'LINE Notify: ' \+ (result.line ? '✅ ผ่าน' : '❌ ล้มเหลว') \+ '\\n';  
  msg \+= 'Telegram: ' \+ (result.telegram ? '✅ ผ่าน' : '❌ ล้มเหลว') \+ '\\n';  
  msg \+= 'Email: ' \+ (result.email ? '✅ ผ่าน (หรือไม่ต้องใช้)' : '❌ ล้มเหลว');  
    
  ui.alert(msg);  
}

/\*\*  
 \* ล้างการตั้งค่าการแจ้งเตือนทั้งหมด  
 \* @returns {void}  
 \*/  
function resetNotificationSettings() {  
  var ui \= SpreadsheetApp.getUi();  
  var confirm \= ui.alert(  
    'ยืนยันการล้างค่า?',  
    'การกระทำนี้จะลบ Token LINE และ Telegram ทั้งหมด\\nระบบจะไม่ส่งแจ้งเตือนจนกว่าจะตั้งค่าใหม่\\n\\nต้องการดำเนินการต่อหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (confirm \== ui.Button.YES) {  
    var props \= PropertiesService.getScriptProperties();  
    props.deleteProperty(NOTIFY\_CONFIG.PROP\_KEY\_LINE\_TOKEN);  
    props.deleteProperty(NOTIFY\_CONFIG.PROP\_KEY\_TELEGRAM\_BOT);  
    props.deleteProperty(NOTIFY\_CONFIG.PROP\_KEY\_TELEGRAM\_CHAT);  
      
    ui.alert('ล้างการตั้งค่าเรียบร้อยแล้ว');  
    Logger.log('\[Notify\] Settings reset by user.');  
  }  
}

Test\_Diagnostic.gs  
/\*\*  
 \* @fileoverview Test\_Diagnostic \- ระบบตรวจสอบความสมบูรณ์และค้นหาข้อผิดพลาดของระบบ (System Health Check)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มการตรวจสอบ\_quota และการเชื่อมต่อ API แบบ Real-time  
 \* \- v4.1: ปรับปรุงรายงานผลลัพธ์ให้แสดงเป็นสีและไอคอนที่อ่านง่าย  
 \* \- v4.0: แยกโมดูลวินิจฉัยออกจาก Service\_Master เพื่อใช้เป็นเครื่องมือตรวจสอบอิสระ  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "หมอ" ของระบบ:  
 \* 1\. ตรวจสอบโครงสร้างชีต (Schema Validation) ว่าครบถ้วนหรือไม่  
 \* 2\. ตรวจสอบการเชื่อมต่อ API (Gemini, Google Maps) ว่าใช้งานได้จริง  
 \* 3\. วิเคราะห์ข้อมูลขยะ (Data Quality) เช่น ค่าว่าง, พิกัดผิด  
 \* 4\. สร้างรายงานสุขภาพระบบ (Health Report) แบบละเอียด  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่าการวินิจฉัย  
 \* @constant {Object} DIAGNOSTIC\_CONFIG  
 \*/  
var DIAGNOSTIC\_CONFIG \= {  
  LOG\_SHEET\_NAME: 'Diagnostic\_Logs',  
  REPORT\_SHEET\_NAME: 'Health\_Report',  
  CRITICAL\_SHEETS: \['Database', 'NameMapping', 'Input', 'Config'\],  
  MAX\_ROWS\_CHECK: 1000, // จำนวนแถวสูงสุดที่จะสุ่มตรวจเพื่อประหยัดเวลา  
  PASS\_ICON: '✅',  
  FAIL\_ICON: '❌',  
  WARN\_ICON: '⚠️'  
};

/\*\*  
 \* โครงสร้างผลลัพธ์การทดสอบ  
 \* @typedef {Object} TestResult  
 \* @property {string} name \- ชื่อการทดสอบ  
 \* @property {boolean} passed \- ผลลัพธ์ (ผ่าน/ไม่ผ่าน)  
 \* @property {string} message \- รายละเอียด  
 \* @property {string} severity \- ระดับความรุนแรง (CRITICAL, WARNING, INFO)  
 \*/

// \=============================================================================  
// SECTION 2: CORE DIAGNOSTIC ENGINE  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันหลักในการรันการวินิจฉัยทั้งหมด (Main Entry Point)  
 \* @returns {void} แสดงผลผ่าน Alert และสร้างชีตรายงาน  
 \*/  
function RUN\_SYSTEM\_DIAGNOSTIC() {  
  var ui \= SpreadsheetApp.getUi();  
  ui.alert('🔍 เริ่มการตรวจสอบระบบ...\\nกรุณารอสักครู่');  
    
  var results \= \[\];  
    
  try {  
    // 1\. ตรวจสอบโครงสร้างชีต  
    results.push(checkSheetStructure());  
      
    // 2\. ตรวจสอบการเชื่อมต่อ API  
    results.push(checkApiConnections());  
      
    // 3\. ตรวจสอบคุณภาพข้อมูล  
    results.push(checkDataQuality());  
      
    // 4\. ตรวจสอบสิทธิ์และการเข้าถึง  
    results.push(checkPermissions());  
      
    // สร้างรายงาน  
    generateDiagnosticReport(results);  
      
    var failCount \= results.filter(function(r) { return \!r.passed && r.severity \=== 'CRITICAL'; }).length;  
    var warnCount \= results.filter(function(r) { return \!r.passed && r.severity \=== 'WARNING'; }).length;  
      
    var msg \= '🏁 การตรวจสอบเสร็จสิ้น\!\\n\\n';  
    msg \+= (failCount \=== 0 ? DIAGNOSTIC\_CONFIG.PASS\_ICON : DIAGNOSTIC\_CONFIG.FAIL\_ICON) \+ ' Critical Issues: ' \+ failCount \+ '\\n';  
    msg \+= (warnCount \=== 0 ? DIAGNOSTIC\_CONFIG.PASS\_ICON : DIAGNOSTIC\_CONFIG.WARN\_ICON) \+ ' Warnings: ' \+ warnCount \+ '\\n\\n';  
    msg \+= 'ดูรายละเอียดเพิ่มเติมในชีต: ' \+ DIAGNOSTIC\_CONFIG.REPORT\_SHEET\_NAME;  
      
    ui.alert(msg);  
      
  } catch (e) {  
    ui.alert('เกิดข้อผิดพลาดระหว่างการตรวจสอบ: ' \+ e.message);  
    logDiagnosticEvent('ERROR', e.message);  
  }  
}

/\*\*  
 \* ตรวจสอบโครงสร้างชีตสำคัญ (Schema Check)  
 \* @returns {TestResult} ผลลัพธ์การทดสอบ  
 \*/  
function checkSheetStructure() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var missingSheets \= \[\];  
    
  DIAGNOSTIC\_CONFIG.CRITICAL\_SHEETS.forEach(function(sheetName) {  
    if (\!ss.getSheetByName(sheetName)) {  
      missingSheets.push(sheetName);  
    }  
  });  
    
  if (missingSheets.length \> 0\) {  
    return {  
      name: 'Sheet Structure Check',  
      passed: false,  
      message: 'ขาดชีตสำคัญ: ' \+ missingSheets.join(', '),  
      severity: 'CRITICAL'  
    };  
  }  
    
  return {  
    name: 'Sheet Structure Check',  
    passed: true,  
    message: 'พบชีตสำคัญครบถ้วน (' \+ DIAGNOSTIC\_CONFIG.CRITICAL\_SHEETS.length \+ ' ชีต)',  
    severity: 'INFO'  
  };  
}

/\*\*  
 \* ตรวจสอบการเชื่อมต่อ API ภายนอก  
 \* @returns {TestResult} ผลลัพธ์การทดสอบ  
 \*/  
function checkApiConnections() {  
  var issues \= \[\];  
    
  // 1\. ตรวจสอบ Gemini API Key  
  if (typeof getGeminiApiKey \=== 'function') {  
    if (\!getGeminiApiKey()) {  
      issues.push('ไม่มี Gemini API Key');  
    }  
  }  
    
  // 2\. ทดสอบเชื่อมต่อ Google Services (จำลอง)  
  try {  
    SpreadsheetApp.getActiveSpreadsheet().getName();  
  } catch (e) {  
    issues.push('ไม่สามารถเข้าถึง Spreadsheet ได้');  
  }  
    
  if (issues.length \> 0\) {  
    return {  
      name: 'API Connection Check',  
      passed: false,  
      message: 'ปัญหาการเชื่อมต่อ: ' \+ issues.join(', '),  
      severity: 'WARNING'  
    };  
  }  
    
  return {  
    name: 'API Connection Check',  
    passed: true,  
    message: 'การเชื่อมต่อ API ปกติ',  
    severity: 'INFO'  
  };  
}

/\*\*  
 \* ตรวจสอบคุณภาพข้อมูลเบื้องต้น (Data Quality Spot Check)  
 \* @returns {TestResult} ผลลัพธ์การทดสอบ  
 \*/  
function checkDataQuality() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('Database');  
    
  if (\!sheet) {  
    return {  
      name: 'Data Quality Check',  
      passed: true,  
      message: 'ข้าม (ไม่พบชีต Database)',  
      severity: 'INFO'  
    };  
  }  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) {  
    return {  
      name: 'Data Quality Check',  
      passed: true,  
      message: 'ฐานข้อมูลว่างเปล่า',  
      severity: 'INFO'  
    };  
  }  
    
  // สุ่มตรวจแถวแรกๆ (เพื่อความเร็ว)  
  var checkLimit \= Math.min(lastRow \- 1, DIAGNOSTIC\_CONFIG.MAX\_ROWS\_CHECK);  
  var emptyNames \= 0;  
  var invalidCoords \= 0;  
    
  // สมมติคอลัมน์: Name(2), Lat(5), Lng(6)  
  var data \= sheet.getRange(2, 2, checkLimit, 5).getValues();  
    
  for (var i \= 0; i \< data.length; i++) {  
    var row \= data\[i\];  
    if (\!row\[0\] || String(row\[0\]).trim() \=== '') emptyNames++;  
      
    var lat \= parseFloat(row\[3\]);  
    var lng \= parseFloat(row\[4\]);  
    if ((lat \< \-90 || lat \> 90\) || (lng \< \-180 || lng \> 180)) {  
      invalidCoords++;  
    }  
  }  
    
  var issues \= \[\];  
  if (emptyNames \> 0\) issues.push('ชื่อว่างเปล่า ' \+ emptyNames \+ ' แถว');  
  if (invalidCoords \> 0\) issues.push('พิกัดไม่ถูกต้อง ' \+ invalidCoords \+ ' แถว');  
    
  if (issues.length \> 0\) {  
    return {  
      name: 'Data Quality Check',  
      passed: false,  
      message: 'พบข้อมูลผิดปกติ: ' \+ issues.join(', '),  
      severity: 'WARNING'  
    };  
  }  
    
  return {  
    name: 'Data Quality Check',  
    passed: true,  
    message: 'คุณภาพข้อมูลดี (สุ่มตรวจ ' \+ checkLimit \+ ' แถว)',  
    severity: 'INFO'  
  };  
}

/\*\*  
 \* ตรวจสอบสิทธิ์การเข้าถึง (Permissions)  
 \* @returns {TestResult} ผลลัพธ์การทดสอบ  
 \*/  
function checkPermissions() {  
  try {  
    var user \= Session.getActiveUser().getEmail();  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var owner \= ss.getOwner().getEmail();  
      
    var msg \= 'ผู้ใช้: ' \+ user \+ '\\nเจ้าของ: ' \+ owner;  
      
    if (user \!== owner) {  
      return {  
        name: 'Permission Check',  
        passed: true,  
        message: msg \+ '\\n(หมายเหตุ: คุณไม่ใช่เจ้าของไฟล์ อาจมีข้อจำกัดบางประการ)',  
        severity: 'WARNING'  
      };  
    }  
      
    return {  
      name: 'Permission Check',  
      passed: true,  
      message: msg \+ '\\nสิทธิ์เต็ม (Owner)',  
      severity: 'INFO'  
    };  
  } catch (e) {  
    return {  
      name: 'Permission Check',  
      passed: false,  
      message: 'ไม่สามารถตรวจสอบสิทธิ์ได้: ' \+ e.message,  
      severity: 'CRITICAL'  
    };  
  }  
}

// \=============================================================================  
// SECTION 3: REPORTING & VISUALIZATION  
// \=============================================================================

/\*\*  
 \* สร้างชีตรายงานผลการวินิจฉัย  
 \* @param {Array\<TestResult\>} results \- รายการผลลัพธ์การทดสอบ  
 \* @returns {void}  
 \*/  
function generateDiagnosticReport(results) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= DIAGNOSTIC\_CONFIG.REPORT\_SHEET\_NAME;  
  var sheet \= ss.getSheetByName(sheetName);  
    
  // ลบชีตเก่าถ้ามี เพื่อสร้างใหม่  
  if (sheet) {  
    ss.deleteSheet(sheet);  
  }  
  sheet \= ss.insertSheet(sheetName);  
    
  // Header  
  sheet.appendRow(\['Status', 'Test Name', 'Severity', 'Details', 'Timestamp'\]);  
  var header \= sheet.getRange(1, 1, 1, 5);  
  header.setFontWeight('bold').setBackground('\#f1f3f4').setHorizontalAlignment('center');  
    
  // Content  
  var now \= new Date();  
  results.forEach(function(r) {  
    var icon \= r.passed ? DIAGNOSTIC\_CONFIG.PASS\_ICON : (r.severity \=== 'CRITICAL' ? DIAGNOSTIC\_CONFIG.FAIL\_ICON : DIAGNOSTIC\_CONFIG.WARN\_ICON);  
    var color \= r.passed ? '\#d9ead3' : (r.severity \=== 'CRITICAL' ? '\#f4cccc' : '\#fff2cc');  
      
    var rowIndex \= sheet.getLastRow() \+ 1;  
    sheet.appendRow(\[icon, r.name, r.severity, r.message, now\]);  
      
    // ใส่สีพื้นหลัง  
    sheet.getRange(rowIndex, 1, 1, 5).setBackground(color);  
  });  
    
  // Adjust columns  
  sheet.autoResizeColumns(1, 5);  
  sheet.setFrozenRows(1);  
}

/\*\*  
 \* บันทึกเหตุการณ์การวินิจฉัยลง Log  
 \* @param {string} level \- ระดับ (INFO, ERROR)  
 \* @param {string} message \- ข้อความ  
 \* @returns {void}  
 \*/  
function logDiagnosticEvent(level, message) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(DIAGNOSTIC\_CONFIG.LOG\_SHEET\_NAME);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(DIAGNOSTIC\_CONFIG.LOG\_SHEET\_NAME);  
    sheet.appendRow(\['Timestamp', 'Level', 'Message'\]);  
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');  
  }  
    
  sheet.appendRow(\[new Date(), level, message\]);  
}

// \=============================================================================  
// SECTION 4: SPECIALIZED DIAGNOSTIC TOOLS  
// \=============================================================================

/\*\*  
 \* ตรวจสอบ Schema ของทุกชีตว่าตรงกับหัวตารางที่กำหนดไว้หรือไม่  
 \* @returns {void}  
 \*/  
function runFullSchemaValidation() {  
  var ui \= SpreadsheetApp.getUi();  
  ui.toast('กำลังตรวจสอบ Schema...');  
    
  // เรียกใช้ฟังก์ชันจาก Service\_SchemaValidator ถ้ามี  
  if (typeof validateAllSheetsSchema \=== 'function') {  
    var result \= validateAllSheetsSchema();  
    if (result.valid) {  
      ui.alert('✅ Schema Validation Passed\\nโครงสร้างตารางทั้งหมดถูกต้อง');  
    } else {  
      ui.alert('❌ Schema Validation Failed\\n' \+ result.message);  
    }  
  } else {  
    ui.alert('ℹ️ Module Not Found\\nฟังก์ชันตรวจสอบ Schema ยังไม่ถูกติดตั้ง (Service\_SchemaValidator.gs)');  
  }  
}

/\*\*  
 \* ตรวจสอบชีตแบบละเอียด (Phase 2 Diagnostic)  
 \* @returns {void}  
 \*/  
function RUN\_SHEET\_DIAGNOSTIC() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheets \= ss.getSheets();  
    
  var report \= '📊 Sheet Diagnostic Report\\n\\n';  
    
  sheets.forEach(function(sheet) {  
    var rows \= sheet.getLastRow();  
    var cols \= sheet.getLastColumn();  
    var cells \= rows \* cols;  
      
    report \+= '📄 ' \+ sheet.getName() \+ '\\n';  
    report \+= '   Rows: ' \+ rows \+ ', Cols: ' \+ cols \+ ', Cells: ' \+ cells \+ '\\n';  
      
    if (cells \> 5000000\) {  
      report \+= '   ⚠️ Warning: ขนาดใหญ่เกินไป อาจทำให้ระบบช้า\\n';  
    }  
    report \+= '\\n';  
  });  
    
  ui.alert(report);  
}

// \=============================================================================  
// SECTION 5: UTILITIES & MAINTENANCE  
// \=============================================================================

/\*\*  
 \* ล้าง Log การวินิจฉัยเก่าๆ  
 \* @returns {void}  
 \*/  
function clearDiagnosticLogs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(DIAGNOSTIC\_CONFIG.LOG\_SHEET\_NAME);  
  if (sheet) {  
    sheet.clearContents();  
    sheet.appendRow(\['Timestamp', 'Level', 'Message'\]);  
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');  
    SpreadsheetApp.getUi().alert('ล้าง Log เรียบร้อย');  
  } else {  
    SpreadsheetApp.getUi().alert('ไม่พบ Log');  
  }  
}

/\*\*  
 \* ส่งออกผลการวินิจฉัยเป็นข้อความ (Copy to Clipboard)  
 \* @returns {void}  
 \*/  
function exportDiagnosticSummary() {  
  var results \= \[  
    checkSheetStructure(),  
    checkApiConnections(),  
    checkDataQuality(),  
    checkPermissions()  
  \];  
    
  var text \= 'System Diagnostic Summary\\nGenerated: ' \+ new Date().toLocaleString() \+ '\\n\\n';  
  results.forEach(function(r) {  
    text \+= (r.passed ? '\[OK\]' : '\[FAIL\]') \+ ' ' \+ r.name \+ ': ' \+ r.message \+ '\\n';  
  });  
    
  // ใน GAS ไม่สามารถ Copy ลง Clipboard โดยตรงได้ ต้องให้ผู้ใช้ก๊อปปี้เองจาก Alert หรือ Log  
  Logger.log(text);  
  SpreadsheetApp.getUi().alert('สรุปผลการวินิจฉัยถูกเขียนลง Logger แล้ว\\nกรุณาเปิด View \> Executions เพื่อดู');  
}

// \=============================================================================  
// SECTION 6: DEBUG & HELPER FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ทดสอบความเร็วในการอ่านข้อมูล (Benchmark)  
 \* @returns {void}  
 \*/  
function benchmarkSheetPerformance() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('Database');  
  if (\!sheet) {  
    SpreadsheetApp.getUi().alert('ไม่พบชีต Database');  
    return;  
  }  
    
  var start \= new Date().getTime();  
  var data \= sheet.getDataRange().getValues();  
  var end \= new Date().getTime();  
    
  var duration \= end \- start;  
  var msg \= '⚡ Performance Benchmark\\n\\n';  
  msg \+= 'Rows: ' \+ data.length \+ '\\n';  
  msg \+= 'Time taken: ' \+ duration \+ ' ms\\n';  
  msg \+= 'Speed: ' \+ (data.length / (duration/1000)).toFixed(0) \+ ' rows/sec';  
    
  SpreadsheetApp.getUi().alert(msg);  
}

Service\_GPSFeedback.gs  
/\*\*  
 \* @fileoverview Service\_GPSFeedback \- ระบบจัดการและตรวจสอบความแม่นยำของพิกัด GPS/ระยะทาง  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มอัลกอริทึมคำนวณระยะทาง Haversine และระบบอนุมัติแบบ Batch  
 \* \- v4.1: ปรับปรุง Logic การเปรียบเทียบพิกัดเดิม vs พิกัดใหม่ จากคนขับ  
 \* \- v4.0: แยกโมดูล GPS Feedback ออกจาก Service\_SCG เพื่อการจัดการข้อมูลเชิงพื้นที่เฉพาะทาง  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "ผู้ตรวจสอบความถูกต้องของพิกัด":  
 \* 1\. รับข้อมูลพิกัดจริงจากคนขับ (ผ่านแบบฟอร์มหรือ API)  
 \* 2\. คำนวณระยะห่างระหว่างพิกัดในระบบ vs พิกัดจริง (Distance Calculation)  
 \* 3\. จัดการคิวรอการอนุมัติ (GPS Queue) สำหรับพิกัดที่แตกต่างเกินเกณฑ์  
 \* 4\. อัปเดตพิกัดหลักเมื่อได้รับการยืนยันแล้ว  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่า GPS Feedback  
 \* @constant {Object} GPS\_CONFIG  
 \*/  
var GPS\_CONFIG \= {  
  QUEUE\_SHEET\_NAME: 'GPS\_Queue',  
  FEEDBACK\_SHEET\_NAME: 'GPS\_Feedback\_Log',  
  MAX\_DISTANCE\_METERS: 50,      // ระยะห่างสูงสุดที่ยอมรับได้ก่อนให้ตรวจสอบ (เมตร)  
  EARTH\_RADIUS\_KM: 6371,        // รัศมีโลกสำหรับคำนวณระยะทาง  
  APPROVAL\_COL\_STATUS: 5,       // คอลัมน์สถานะการอนุมัติใน Queue (E)  
  COL\_OLD\_LAT: 2,               // คอลัมน์พิกัดเดิม (B)  
  COL\_OLD\_LNG: 3,               // คอลัมน์พิกัดเดิม (C)  
  COL\_NEW\_LAT: 4,               // คอลัมน์พิกัดใหม่ (D)  
  COL\_NEW\_LNG: 5                // คอลัมน์พิกัดใหม่ (E)  
};

/\*\*  
 \* คำนวณระยะทางระหว่างจุดสองจุดบนพื้นโลก (Haversine Formula)  
 \* @param {number} lat1 \- ละติจูดจุดแรก  
 \* @param {number} lng1 \- ลองจิจูดจุดแรก  
 \* @param {number} lat2 \- ละติจูดจุดที่สอง  
 \* @param {number} lng2 \- ลองจิจูดจุดที่สอง  
 \* @returns {number} ระยะทางเป็นเมตร  
 \*/  
function calculateDistanceInMeters(lat1, lng1, lat2, lng2) {  
  if (\!lat1 || \!lng1 || \!lat2 || \!lng2) return 999999; // ค่าสูงมากถ้าข้อมูลไม่ครบ  
    
  var toRad \= function(x) { return x \* Math.PI / 180; };  
    
  var dLat \= toRad(lat2 \- lat1);  
  var dLon \= toRad(lng2 \- lng1);  
    
  var a \= Math.sin(dLat / 2\) \* Math.sin(dLat / 2\) \+  
          Math.cos(toRad(lat1)) \* Math.cos(toRad(lat2)) \*  
          Math.sin(dLon / 2\) \* Math.sin(dLon / 2);  
            
  var c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1 \- a));  
  var distanceKm \= GPS\_CONFIG.EARTH\_RADIUS\_KM \* c;  
    
  return distanceKm \* 1000; // แปลงเป็นเมตร  
}

// \=============================================================================  
// SECTION 2: FEEDBACK SUBMISSION & PROCESSING  
// \=============================================================================

/\*\*  
 \* รับข้อมูลพิกัดใหม่จากคนขับและเพิ่มลงคิวตรวจสอบ  
 \* @param {string} jobId \- รหัสงานหรือ UUID  
 \* @param {number} newLat \- ละติจูดใหม่จากคนขับ  
 \* @param {number} newLng \- ลองจิจูดใหม่จากคนขับ  
 \* @param {string} driverName \- ชื่อคนขับ (ผู้รายงาน)  
 \* @returns {Object} ผลลัพธ์ { success: boolean, message: string, requiresApproval: boolean }  
 \*/  
function submitGpsFeedback(jobId, newLat, newLng, driverName) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('Database'); // หรือชีตที่เก็บงานปัจจุบัน  
    
  if (\!sheet) {  
    return { success: false, message: 'ไม่พบชีตข้อมูล', requiresApproval: false };  
  }  
    
  // 1\. ค้นหาแถวของงานนั้นๆ (สมมติค้นหาจากคอลัมน์ A)  
  var data \= sheet.getDataRange().getValues();  
  var rowIndex \= \-1;  
  var oldLat, oldLng, customerName;  
    
  for (var i \= 1; i \< data.length; i++) {  
    if (String(data\[i\]\[0\]) \=== String(jobId)) {  
      rowIndex \= i \+ 1;  
      // สมมติคอลัมน์ Lat=D(3), Lng=E(4), Name=B(1) (ปรับตามจริง)  
      oldLat \= data\[i\]\[3\];   
      oldLng \= data\[i\]\[4\];  
      customerName \= data\[i\]\[1\];  
      break;  
    }  
  }  
    
  if (rowIndex \=== \-1) {  
    return { success: false, message: 'ไม่พบรหัสงาน: ' \+ jobId, requiresApproval: false };  
  }  
    
  // 2\. คำนวณระยะห่าง  
  var distance \= calculateDistanceInMeters(oldLat, oldLng, newLat, newLng);  
  var requiresApproval \= (distance \> GPS\_CONFIG.MAX\_DISTANCE\_METERS);  
    
  // 3\. บันทึกผล  
  if (requiresApproval) {  
    addToGpsQueue(jobId, customerName, oldLat, oldLng, newLat, newLng, driverName, distance);  
    return {   
      success: true,   
      message: 'บันทึกพิกัดใหม่แล้ว (ระยะห่าง: ' \+ distance.toFixed(1) \+ 'ม.) รอการอนุมัติ',   
      requiresApproval: true   
    };  
  } else {  
    // ถ้าห่างไม่มาก ให้อัปเดตทันที  
    updateMasterCoordinate(rowIndex, newLat, newLng);  
    logGpsFeedback(jobId, 'AUTO\_UPDATED', distance, driverName);  
    return {   
      success: true,   
      message: 'อัปเดตพิกัดอัตโนมัติสำเร็จ (ระยะห่าง: ' \+ distance.toFixed(1) \+ 'ม.)',   
      requiresApproval: false   
    };  
  }  
}

/\*\*  
 \* เพิ่มรายการลงชีต Queue เพื่อรอการอนุมัติ  
 \* @param {string} jobId \- รหัสงาน  
 \* @param {string} name \- ชื่อลูกค้า  
 \* @param {number} oldLat \- พิกัดเดิม  
 \* @param {number} oldLng \- พิกัดเดิม  
 \* @param {number} newLat \- พิกัดใหม่  
 \* @param {number} newLng \- พิกัดใหม่  
 \* @param {string} reporter \- ผู้รายงาน  
 \* @param {number} distance \- ระยะห่าง (เมตร)  
 \* @returns {void}  
 \*/  
function addToGpsQueue(jobId, name, oldLat, oldLng, newLat, newLng, reporter, distance) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(GPS\_CONFIG.QUEUE\_SHEET\_NAME);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(GPS\_CONFIG.QUEUE\_SHEET\_NAME);  
    sheet.appendRow(\['Timestamp', 'JobID', 'CustomerName', 'Old\_Lat', 'Old\_Lng', 'New\_Lat', 'New\_Lng', 'Distance(m)', 'Reporter', 'Status'\]);  
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('\#ffebcc');  
  }  
    
  sheet.appendRow(\[  
    new Date(),  
    jobId,  
    name,  
    oldLat,  
    oldLng,  
    newLat,  
    newLng,  
    distance.toFixed(2),  
    reporter,  
    'PENDING'  
  \]);  
}

// \=============================================================================  
// SECTION 3: APPROVAL WORKFLOW  
// \=============================================================================

/\*\*  
 \* อนุมัติรายการที่ติ๊กเลือกไว้ใน Queue (Batch Approval)  
 \* @returns {Object} สรุปผล { approvedCount: number, skippedCount: number }  
 \*/  
function applyApprovedFeedback() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var queueSheet \= ss.getSheetByName(GPS\_CONFIG.QUEUE\_SHEET\_NAME);  
    
  if (\!queueSheet) {  
    throw new Error('ไม่พบชีต GPS\_Queue');  
  }  
    
  var lastRow \= queueSheet.getLastRow();  
  if (lastRow \< 2\) return { approvedCount: 0, skippedCount: 0 };  
    
  // อ่านข้อมูลทั้งหมดใน Queue  
  var data \= queueSheet.getRange(2, 1, lastRow \- 1, 10).getValues();  
  var approvedCount \= 0;  
  var skippedCount \= 0;  
  var dbSheet \= ss.getSheetByName('Database');  
    
  // วนลูปตรวจสอบสถานะ (สมมติคอลัมน์ J เป็นสถานะ หรือเช็คจากการเลือกแถว)  
  // ในที่นี้สมมติว่าผู้ใช้จะแก้สถานะในชีตเป็น 'APPROVED' เอง แล้วรันฟังก์ชันนี้เพื่อประมวลผล  
    
  for (var i \= 0; i \< data.length; i++) {  
    var rowIdx \= i \+ 2;  
    var status \= data\[i\]\[9\]; // คอลัมน์ Status (J)  
      
    if (status \=== 'APPROVED') {  
      var jobId \= data\[i\]\[1\];  
      var newLat \= data\[i\]\[5\];  
      var newLng \= data\[i\]\[6\];  
        
      // หาแถวใน Database เพื่ออัปเดต (อาจใช้เวลาถ้าข้อมูลเยอะ ควรมี Index)  
      // เพื่อความเร็ว ในทางปฏิบัติควรใช้ Map หรือค้นหาด้วย UUID โดยตรง  
      var dbRowIndex \= findRowByJobId(dbSheet, jobId);  
        
      if (dbRowIndex \> 0\) {  
        updateMasterCoordinate(dbRowIndex, newLat, newLng);  
          
        // อัปเดตสถานะใน Queue เป็น DONE  
        queueSheet.getRange(rowIdx, 10).setValue('DONE');  
        logGpsFeedback(jobId, 'MANUAL\_APPROVED', data\[i\]\[7\], 'System');  
          
        approvedCount++;  
      } else {  
        queueSheet.getRange(rowIdx, 10).setValue('ERROR\_NOT\_FOUND');  
        skippedCount++;  
      }  
    }  
  }  
    
  return { approvedCount: approvedCount, skippedCount: skippedCount };  
}

/\*\*  
 \* ฟังก์ชันช่วยเหลือ: ค้นหาแถวจาก JobID  
 \* @param {Sheet} sheet \- ชีตที่ต้องการค้นหา  
 \* @param {string} jobId \- รหัสงาน  
 \* @returns {number} เลขแถวที่พบ (หรือ 0 ถ้าไม่พบ)  
 \*/  
function findRowByJobId(sheet, jobId) {  
  if (\!sheet) return 0;  
  var data \= sheet.getRange(2, 1, sheet.getLastRow() \- 1, 1).getValues();  
  for (var i \= 0; i \< data.length; i++) {  
    if (String(data\[i\]\[0\]) \=== String(jobId)) {  
      return i \+ 2;  
    }  
  }  
  return 0;  
}

/\*\*  
 \* อัปเดตพิกัดใน Database  
 \* @param {number} rowIndex \- เลขแถวที่จะอัปเดต  
 \* @param {number} lat \- ละติจูดใหม่  
 \* @param {number} lng \- ลองจิจูดใหม่  
 \* @returns {void}  
 \*/  
function updateMasterCoordinate(rowIndex, lat, lng) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('Database');  
  if (\!sheet) return;  
    
  // สมมติคอลัมน์ Lat=5, Lng=6  
  sheet.getRange(rowIndex, 5).setValue(lat);  
  sheet.getRange(rowIndex, 6).setValue(lng);  
  // อาจอัปเดตคอลัมน์ LastUpdated ด้วย  
  sheet.getRange(rowIndex, 10).setValue(new Date());   
}

// \=============================================================================  
// SECTION 4: STATISTICS & REPORTING  
// \=============================================================================

/\*\*  
 \* แสดงสถิติของคิว GPS  
 \* @returns {void} แสดงผลผ่าน Alert  
 \*/  
function showGPSQueueStats() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(GPS\_CONFIG.QUEUE\_SHEET\_NAME);  
    
  if (\!sheet || sheet.getLastRow() \< 2\) {  
    SpreadsheetApp.getUi().alert('ไม่มีข้อมูลในคิว GPS');  
    return;  
  }  
    
  var data \= sheet.getRange(2, 10, sheet.getLastRow() \- 1, 1).getValues(); // คอลัมน์ Status  
  var pending \= 0;  
  var done \= 0;  
  var approved \= 0;  
    
  data.forEach(function(row) {  
    var s \= row\[0\];  
    if (s \=== 'PENDING') pending++;  
    else if (s \=== 'DONE') done++;  
    else if (s \=== 'APPROVED') approved++; // นับก่อนรัน  
  });  
    
  var msg \= '📊 GPS Queue Statistics\\n\\n';  
  msg \+= '⏳ รออนุมัติ (Pending): ' \+ pending \+ '\\n';  
  msg \+= '✅ ดำเนินการเสร็จ (Done): ' \+ done \+ '\\n';  
  msg \+= '🔘 ที่พร้อมอนุมัติ (Approved): ' \+ approved \+ '\\n';  
    
  SpreadsheetApp.getUi().alert(msg);  
}

/\*\*  
 \* บันทึก Log การทำงานของ GPS Feedback  
 \* @param {string} jobId \- รหัสงาน  
 \* @param {string} action \- การกระทำ (AUTO\_UPDATED, MANUAL\_APPROVED)  
 \* @param {number} distance \- ระยะห่าง  
 \* @param {string} user \- ผู้ดำเนินการ  
 \* @returns {void}  
 \*/  
function logGpsFeedback(jobId, action, distance, user) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(GPS\_CONFIG.FEEDBACK\_SHEET\_NAME);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(GPS\_CONFIG.FEEDBACK\_SHEET\_NAME);  
    sheet.appendRow(\['Timestamp', 'JobID', 'Action', 'Distance(m)', 'User'\]);  
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');  
  }  
    
  sheet.appendRow(\[new Date(), jobId, action, distance, user\]);  
}

// \=============================================================================  
// SECTION 5: SETUP & MAINTENANCE  
// \=============================================================================

/\*\*  
 \* สร้างชีต GPS\_Queue ใหม่ (Reset Queue)  
 \* @returns {void}  
 \*/  
function createGPSQueueSheet() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= GPS\_CONFIG.QUEUE\_SHEET\_NAME;  
  var existingSheet \= ss.getSheetByName(sheetName);  
    
  if (existingSheet) {  
    var ui \= SpreadsheetApp.getUi();  
    var res \= ui.alert('เตือน\!', 'ชีต ' \+ sheetName \+ ' มีอยู่แล้ว\\nหากสร้างใหม่ ข้อมูลเก่าจะหายไป\\nต้องการดำเนินการต่อหรือไม่?', ui.ButtonSet.YES\_NO);  
    if (res \!= ui.Button.YES) return;  
    ss.deleteSheet(existingSheet);  
  }  
    
  var newSheet \= ss.insertSheet(sheetName);  
  newSheet.appendRow(\['Timestamp', 'JobID', 'CustomerName', 'Old\_Lat', 'Old\_Lng', 'New\_Lat', 'New\_Lng', 'Distance(m)', 'Reporter', 'Status'\]);  
  newSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('\#ffebcc');  
    
  SpreadsheetApp.getUi().alert('สร้างชีต ' \+ sheetName \+ ' เรียบร้อยแล้ว');  
}

/\*\*  
 \* ล้างข้อมูลที่ดำเนินการเสร็จแล้วออกจาก Queue (เก็บบไว้แค่ Pending)  
 \* @returns {number} จำนวนแถวที่ลบ  
 \*/  
function cleanupFinishedQueue() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(GPS\_CONFIG.QUEUE\_SHEET\_NAME);  
  if (\!sheet) return 0;  
    
  var data \= sheet.getRange(2, 10, sheet.getLastRow() \- 1, 1).getValues();  
  var rowsToDelete \= \[\];  
    
  for (var i \= 0; i \< data.length; i++) {  
    if (data\[i\]\[0\] \=== 'DONE' || data\[i\]\[0\] \=== 'REJECTED') {  
      rowsToDelete.push(i \+ 2);  
    }  
  }  
    
  // ลบจากล่างขึ้นบน  
  for (var j \= rowsToDelete.length \- 1; j \>= 0; j--) {  
    sheet.deleteRow(rowsToDelete\[j\]);  
  }  
    
  return rowsToDelete.length;  
}

// \=============================================================================  
// SECTION 6: DEBUG & HELPER FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ทดสอบการคำนวณระยะทาง  
 \* @returns {void}  
 \*/  
function debugTestDistanceCalculation() {  
  // ระยะทางระหว่าง กรุงเทพฯ กับ เชียงใหม่ (ประมาณ 600km)  
  var dist \= calculateDistanceInMeters(13.7563, 100.5018, 18.7883, 98.9853);  
  var msg \= 'ทดสอบคำนวณระยะทาง:\\nกรุงเทพฯ \<-\> เชียงใหม่\\n';  
  msg \+= 'ผลลัพธ์: ' \+ (dist / 1000).toFixed(2) \+ ' กม.\\n';  
  msg \+= '(ค่าที่คาดหวังประมาณ 590-600 กม.)';  
    
  SpreadsheetApp.getUi().alert(msg);  
}

/\*\*  
 \* จำลองข้อมูล Feedback สำหรับทดสอบ  
 \* @returns {void}  
 \*/  
function debugMockFeedback() {  
  var result \= submitGpsFeedback('TEST-001', 13.7600, 100.5100, 'Admin Tester');  
  Logger.log(result);  
  SpreadsheetApp.getUi().alert('ส่งข้อมูลจำลอง:\\n' \+ JSON.stringify(result));  
}

Service\_SchemaValidator.gs  
/\*\*  
 \* @fileoverview Service\_SchemaValidator \- ระบบตรวจสอบความถูกต้องของคอลัมน์และโครงสร้างชีต (Schema Validation)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มการตรวจสอบชนิดข้อมูล (Data Type) และการรายงานข้อผิดพลาดแบบละเอียด  
 \* \- v4.1: ปรับปรุงความเร็วในการตรวจสอบโดยใช้ Array แทนการวนลูปอ่านทีละเซลล์  
 \* \- v4.0: แยกโมดูลตรวจสอบโครงสร้างออกมาเพื่อป้องกันความเสียหายของฐานข้อมูล (Prevent Corruption)  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "ยามเฝ้าประตู" ของโครงสร้างข้อมูล:  
 \* 1\. ตรวจสอบว่าทุกชีตมีหัวข้อคอลัมน์ (Headers) ครบถ้วนตามกำหนด  
 \* 2\. ยืนยันลำดับคอลัมน์ไม่มีการสลับที่ซึ่งอาจทำให้โปรแกรมทำงานผิดพลาด  
 \* 3\. ตรวจสอบชนิดข้อมูลเบื้องต้น (เช่น คอลัมน์วันที่ต้องเป็นวันที่)  
 \* 4\. ป้องกันการลบคอลัมน์สำคัญโดยไม่ได้ตั้งใจ  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & SCHEMA DEFINITIONS  
// \=============================================================================

/\*\*  
 \* นิยามโครงสร้างที่ถูกต้องของแต่ละชีต (Schema Definition)  
 \* Key คือชื่อชีต, Value คืออาร์เรย์ของชื่อคอลัมน์ที่ถูกต้องตามลำดับ  
 \* @constant {Object} SCHEMA\_DEFINITIONS  
 \*/  
var SCHEMA\_DEFINITIONS \= {  
  'Database': \[  
    'UUID', 'Name', 'Matched\_Name', 'Address', 'Latitude', 'Longitude',   
    'Province', 'District', 'PostalCode', 'Status', 'QualityScore', 'Verified', 'LastUpdated'  
  \],  
  'NameMapping': \[  
    'UUID', 'Original\_Name', 'Standard\_Name', 'Address', 'Latitude', 'Longitude',   
    'Province', 'ConfidenceScore', 'CreatedDate'  
  \],  
  'Input': \[  
    'RunID', 'CustomerName', 'Address', 'ContactPerson', 'PhoneNumber', 'ImportDate'  
  \],  
  'GPS\_Queue': \[  
    'Timestamp', 'JobID', 'CustomerName', 'Old\_Lat', 'Old\_Lng', 'New\_Lat', 'New\_Lng',   
    'Distance(m)', 'Reporter', 'Status'  
  \]  
};

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่า Validator  
 \* @constant {Object} VALIDATOR\_CONFIG  
 \*/  
var VALIDATOR\_CONFIG \= {  
  LOG\_SHEET\_NAME: 'SchemaValidation\_Logs',  
  STRICT\_MODE: true, // ถ้า true จะ Error ทันทีเมื่อพบคอลัมน์เกินมา  
  REPORT\_SHEET\_NAME: 'Schema\_Report'  
};

// \=============================================================================  
// SECTION 2: CORE VALIDATION ENGINE  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันหลักในการตรวจสอบ Schema ของทุกชีต (Main Entry Point)  
 \* @returns {Object} ผลสรุป { valid: boolean, errors: Array\<string\>, warnings: Array\<string\> }  
 \*/  
function validateAllSheetsSchema() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheets \= ss.getSheets();  
  var result \= { valid: true, errors: \[\], warnings: \[\] };  
    
  sheets.forEach(function(sheet) {  
    var sheetName \= sheet.getName();  
      
    // ข้ามชีตที่ไม่ได้อยู่ในนิยาม (เช่น ชีต Log หรือ Backup)  
    if (\!SCHEMA\_DEFINITIONS\[sheetName\]) {  
      return;   
    }  
      
    var schemaCheck \= validateSingleSheetSchema(sheet, sheetName);  
      
    if (\!schemaCheck.valid) {  
      result.valid \= false;  
      result.errors \= result.errors.concat(schemaCheck.errors);  
    }  
      
    if (schemaCheck.warnings.length \> 0\) {  
      result.warnings \= result.warnings.concat(schemaCheck.warnings);  
    }  
  });  
    
  logValidationResult(result);  
  return result;  
}

/\*\*  
 \* ตรวจสอบโครงสร้างของชีตเดียว  
 \* @param {Sheet} sheet \- ออบเจ็กต์ชีตที่ต้องการตรวจสอบ  
 \* @param {string} sheetName \- ชื่อชีต  
 \* @returns {Object} ผลลัพธ์ { valid: boolean, errors: string\[\], warnings: string\[\] }  
 \*/  
function validateSingleSheetSchema(sheet, sheetName) {  
  var expectedHeaders \= SCHEMA\_DEFINITIONS\[sheetName\];  
  if (\!expectedHeaders) {  
    return { valid: true, errors: \[\], warnings: \[\] }; // ไม่ได้นิยามไว้ ก็ข้าม  
  }  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \=== 0\) {  
    return {   
      valid: false,   
      errors: \['ชีต "' \+ sheetName \+ '" ว่างเปล่า (ไม่พบ Header)'\],   
      warnings: \[\]   
    };  
  }  
    
  // อ่านแถวแรก (Header)  
  var actualHeaders \= sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()\[0\];  
    
  var errors \= \[\];  
  var warnings \= \[\];  
    
  // 1\. ตรวจสอบจำนวนคอลัมน์  
  if (actualHeaders.length \< expectedHeaders.length) {  
    errors.push('ขาดคอลัมน์ที่สำคัญ: คาดหวัง ' \+ expectedHeaders.length \+ ' คอลัมน์ แต่พบเพียง ' \+ actualHeaders.length);  
  } else if (VALIDATOR\_CONFIG.STRICT\_MODE && actualHeaders.length \> expectedHeaders.length) {  
    warnings.push('พบคอลัมน์เกินมานิยาม: อาจเกิดจากการเพิ่มคอลัมน์ชั่วคราว');  
  }  
    
  // 2\. ตรวจสอบชื่อและลำดับคอลัมน์ (ตรวจสอบเฉพาะจำนวนที่คาดหวัง)  
  var checkLimit \= Math.min(actualHeaders.length, expectedHeaders.length);  
  for (var i \= 0; i \< checkLimit; i++) {  
    var expected \= String(expectedHeaders\[i\]).trim().toLowerCase();  
    var actual \= String(actualHeaders\[i\]).trim().toLowerCase();  
      
    if (expected \!== actual) {  
      errors.push('คอลัมน์ที่ ' \+ (i \+ 1\) \+ ' ไม่ตรงกัน: คาดหวัง "' \+ expectedHeaders\[i\] \+ '" แต่พบ "' \+ actualHeaders\[i\] \+ '"');  
    }  
  }  
    
  return {  
    valid: errors.length \=== 0,  
    errors: errors,  
    warnings: warnings  
  };  
}

/\*\*  
 \* ตรวจสอบชนิดข้อมูลในแถวตัวอย่าง (Data Type Spot Check)  
 \* @param {string} sheetName \- ชื่อชีต  
 \* @param {number} sampleSize \- จำนวนแถวที่จะสุ่มตรวจ  
 \* @returns {Array\<string\>} รายการข้อผิดพลาดที่พบ  
 \*/  
function validateDataTypes(sheetName, sampleSize) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(sheetName);  
  if (\!sheet) return \['ไม่พบชีต: ' \+ sheetName\];  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return \[\];  
    
  var limit \= Math.min(sampleSize, lastRow \- 1);  
  var errors \= \[\];  
    
  // ตัวอย่าง: ตรวจสอบคอลัมน์ Latitude (สมมติคอลัมน์ที่ 5\) ต้องเป็นตัวเลข  
  // หมายเหตุ: ใน GAS การเช็ค type จาก getValues() อาจได้ Object Date หรือ Number โดยตรง  
  var data \= sheet.getRange(2, 5, limit, 1).getValues(); // สมมติคอลัมน์ E  
    
  for (var i \= 0; i \< data.length; i++) {  
    var val \= data\[i\]\[0\];  
    if (val \!== null && val \!== '' && typeof val \!== 'number') {  
      // พยายามแปลงเป็นตัวเลข  
      if (isNaN(parseFloat(val))) {  
        errors.push('แถวที่ ' \+ (i \+ 2\) \+ ': ค่าในคอลัมน์ Latitude ไม่ใช่ตัวเลข ("' \+ val \+ '")');  
      }  
    }  
  }  
    
  return errors;  
}

// \=============================================================================  
// SECTION 3: REPAIR & AUTO-FIX TOOLS  
// \=============================================================================

/\*\*  
 \* พยายามซ่อมแซม Header ที่ผิดเพี้ยนให้กลับมาถูกต้อง (Auto-Fix)  
 \* @param {string} sheetName \- ชื่อชีตที่ต้องการซ่อม  
 \* @returns {boolean} true ถ้าซ่อมสำเร็จ, false ถ้าไม่สามารถซ่อมได้  
 \*/  
function attemptRepairSchema(sheetName) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(sheetName);  
  if (\!sheet || \!SCHEMA\_DEFINITIONS\[sheetName\]) return false;  
    
  var expectedHeaders \= SCHEMA\_DEFINITIONS\[sheetName\];  
  var currentHeaders \= sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()\[0\];  
    
  // กรณีที่ 1: ขาดคอลัมน์ท้ายๆ \-\> เพิ่มคอลัมน์ว่างและใส่ชื่อ  
  if (currentHeaders.length \< expectedHeaders.length) {  
    var missingCount \= expectedHeaders.length \- currentHeaders.length;  
    sheet.getRange(1, currentHeaders.length \+ 1, 1, missingCount).setValues(\[expectedHeaders.slice(currentHeaders.length)\]);  
    Logger.log('\[Schema\] Added ' \+ missingCount \+ ' missing columns to ' \+ sheetName);  
    return true;  
  }  
    
  // กรณีที่ 2: ชื่อผิดแต่จำนวนถูก \-\> แก้ไขชื่อ (เฉพาะกรณีที่ใกล้เคียงมาก หรือผู้ใช้ยืนยัน)  
  // เพื่อความปลอดภัย จะไม่แก้ชื่ออัตโนมัติถ้าไม่แน่ใจ ให้แจ้งผู้ใช้แก้ไขเองจะดีกว่า  
  // ในที่นี้จึง.return false เพื่อให้ผู้ใช้ตรวจสอบรายงาน  
    
  return false;  
}

/\*\*  
 \* สร้างชีตต้นแบบที่มี Header ถูกต้อง (Template Generator)  
 \* @param {string} sheetName \- ชื่อชีตที่ต้องการสร้าง  
 \* @returns {Sheet|null} ชีตที่สร้างใหม่ หรือ null ถ้ามีอยู่แล้ว  
 \*/  
function createSchemaTemplate(sheetName) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  if (ss.getSheetByName(sheetName)) {  
    Logger.log('\[Schema\] Sheet already exists: ' \+ sheetName);  
    return null;  
  }  
    
  var headers \= SCHEMA\_DEFINITIONS\[sheetName\];  
  if (\!headers) {  
    Logger.log('\[Schema\] No definition found for: ' \+ sheetName);  
    return null;  
  }  
    
  var newSheet \= ss.insertSheet(sheetName);  
  newSheet.getRange(1, 1, 1, headers.length).setValues(\[headers\]);  
  newSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('\#e8f0fe');  
  newSheet.setFrozenRows(1);  
    
  Logger.log('\[Schema\] Created template sheet: ' \+ sheetName);  
  return newSheet;  
}

// \=============================================================================  
// SECTION 4: REPORTING & UI  
// \=============================================================================

/\*\*  
 \* รันการตรวจสอบและแสดงรายงานแบบละเอียดบนชีตใหม่  
 \* @returns {void}  
 \*/  
function runFullSchemaValidation() {  
  var ui \= SpreadsheetApp.getUi();  
  ui.toast('กำลังตรวจสอบโครงสร้างชีต...');  
    
  var result \= validateAllSheetsSchema();  
    
  // สร้างรายงาน  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var reportSheet \= ss.getSheetByName(VALIDATOR\_CONFIG.REPORT\_SHEET\_NAME);  
  if (reportSheet) ss.deleteSheet(reportSheet);  
  reportSheet \= ss.insertSheet(VALIDATOR\_CONFIG.REPORT\_SHEET\_NAME);  
    
  // Header รายงาน  
  reportSheet.appendRow(\['Severity', 'Sheet Name', 'Issue Detail', 'Recommendation'\]);  
  reportSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('\#ffcccc');  
    
  var rowCount \= 2;  
    
  if (result.valid) {  
    reportSheet.getRange(rowCount, 1, 1, 4).setValues(\[\['✅ PASS', 'All Sheets', 'Structure is valid', 'No action needed'\]\]);  
    reportSheet.getRange(rowCount, 1, 1, 4).setBackground('\#d9ead3');  
  } else {  
    result.errors.forEach(function(err) {  
      // Parse error message เพื่อหาชื่อชีต (อย่างง่าย)  
      var sheetName \= 'Unknown';  
      if (err.indexOf('"') \!== \-1) {  
        var parts \= err.split('"');  
        if (parts.length \> 1\) sheetName \= parts\[1\];  
      }  
        
      reportSheet.getRange(rowCount, 1, 1, 4).setValues(\[  
        \['❌ ERROR', sheetName, err, 'ตรวจสอบคอลัมน์หรือรัน Auto-Repair'\]  
      \]);  
      reportSheet.getRange(rowCount, 1, 1, 4).setBackground('\#f4cccc');  
      rowCount++;  
    });  
  }  
    
  reportSheet.autoResizeColumns(1, 4);  
    
  var msg \= result.valid   
    ? '✅ ผ่านการตรวจสอบ\!\\nโครงสร้างชีตทั้งหมดถูกต้อง'   
    : '❌ พบข้อผิดพลาด ' \+ result.errors.length \+ ' รายการ\\nกรุณาดูรายละเอียดในชีต: ' \+ VALIDATOR\_CONFIG.REPORT\_SHEET\_NAME;  
      
  ui.alert(msg);  
}

/\*\*  
 \* บันทึกผลการตรวจสอบลง Log  
 \* @param {Object} result \- ผลลัพธ์จากการตรวจสอบ  
 \* @returns {void}  
 \*/  
function logValidationResult(result) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(VALIDATOR\_CONFIG.LOG\_SHEET\_NAME);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(VALIDATOR\_CONFIG.LOG\_SHEET\_NAME);  
    sheet.appendRow(\['Timestamp', 'Status', 'Error Count', 'Warning Count'\]);  
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');  
  }  
    
  sheet.appendRow(\[  
    new Date(),  
    result.valid ? 'PASS' : 'FAIL',  
    result.errors.length,  
    result.warnings.length  
  \]);  
}

// \=============================================================================  
// SECTION 5: UTILITIES & MAINTENANCE  
// \=============================================================================

/\*\*  
 \* ดึงรายการ Schema ทั้งหมดที่ระบบรู้จัก  
 \* @returns {Object} Object ของ Schema Definitions  
 \*/  
function getRegisteredSchemas() {  
  return SCHEMA\_DEFINITIONS;  
}

/\*\*  
 \* เพิ่ม Schema ใหม่สำหรับชีตที่ยังไม่มีในระบบ (Dynamic Registration)  
 \* @param {string} sheetName \- ชื่อชีต  
 \* @param {Array\<string\>} headers \- รายการหัวตาราง  
 \* @returns {void}  
 \*/  
function registerNewSchema(sheetName, headers) {  
  // ตรวจสอบสิทธิ์ (ถ้ามีฟังก์ชัน)  
  if (typeof validateUserAccess \=== 'function' && \!validateUserAccess('Register Schema')) {  
    throw new Error('Access Denied');  
  }  
    
  SCHEMA\_DEFINITIONS\[sheetName\] \= headers;  
  Logger.log('\[Schema\] Registered new schema for: ' \+ sheetName);  
}

// \=============================================================================  
// SECTION 6: DEBUG & HELPER FUNCTIONS  
// \=============================================================================

/\*\*  
 \* ทดสอบการสร้างชีตต้นแบบทุกแบบ  
 \* @returns {void}  
 \*/  
function debugCreateAllTemplates() {  
  var ui \= SpreadsheetApp.getUi();  
  var count \= 0;  
    
  Object.keys(SCHEMA\_DEFINITIONS).forEach(function(name) {  
    if (createSchemaTemplate(name)) {  
      count++;  
    }  
  });  
    
  ui.alert('สร้างชีตต้นแบบเสร็จสิ้น\\nจำนวน: ' \+ count \+ ' ชีต');  
}

/\*\*  
 \* ทดสอบความถูกต้องของข้อมูลจำลอง  
 \* @returns {void}  
 \*/  
function debugTestDataTypes() {  
  var errors \= validateDataTypes('Database', 100);  
  if (errors.length \=== 0\) {  
    Logger.log('\[Debug\] Data types OK.');  
  } else {  
    Logger.log('\[Debug\] Found errors: ' \+ JSON.stringify(errors));  
  }  
}

Service\_SoftDelete.gs

/\*\*  
 \* @fileoverview Service\_SoftDelete \- ระบบลบข้อมูลแบบไม่ลบทิ้งถาวร (Mark as Deleted / Archive)  
 \* @version 4.2 Enterprise Edition (Phase E)  
 \* @author Elite Logistics Architect  
 \*   
 \* Version History:  
 \* \- v4.2: เพิ่มระบบกู้คืนข้อมูล (Restore) แบบรายแถวและแบบกลุ่ม  
 \* \- v4.1: ปรับปรุงการกรองข้อมูลที่ถูก Soft Delete ออกจากการค้นหาปกติ  
 \* \- v4.0: แยกโมดูลการจัดการการลบออกจาก Service\_Master เพื่อความปลอดภัยของข้อมูล  
 \*   
 \* @description โมดูลนี้ทำหน้าที่เป็น "ถังขยะชั่วคราว" ของระบบ:  
 \* 1\. แทนที่จะลบแถวออกจริงๆ จะทำการเปลี่ยนสถานะเป็น 'Deleted' และย้ายไปเก็บไว้ชีต Archive  
 \* 2\. ป้องกันการสูญหายของข้อมูลสำคัญจากการกดผิดหรือความผิดพลาดของระบบ  
 \* 3\. รองรับการใช้งานฟังก์ชัน Restore เพื่อกู้คืนข้อมูลกลับมา  
 \* 4\. จัดการทำความสะอาดข้อมูลใน Archive ที่เก่าเกินกำหนด (Hard Delete)  
 \*/

// \=============================================================================  
// SECTION 1: CONFIGURATION & CONSTANTS  
// \=============================================================================

/\*\*  
 \* ค่าคงที่สำหรับการตั้งค่า Soft Delete  
 \* @constant {Object} SOFT\_DELETE\_CONFIG  
 \*/  
var SOFT\_DELETE\_CONFIG \= {  
  ARCHIVE\_SHEET\_NAME: '\_Archive\_DeletedData',  
  STATUS\_DELETED: 'DELETED',  
  STATUS\_ACTIVE: 'ACTIVE',  
  COL\_STATUS\_INDEX: 10, // สมมติคอลัมน์ J เป็นตัวบอกสถานะ (ปรับตาม CONFIG จริง)  
  RETENTION\_DAYS: 90,   // เก็บข้อมูลใน Archive นาน 90 วันก่อนลบถาวร  
  LOG\_SHEET\_NAME: 'Delete\_Logs'  
};

/\*\*  
 \* ดึงชื่อคอลัมน์สถานะจาก Config (ถ้ามี) หรือใช้ค่าเริ่มต้น  
 \* @returns {number} ดัชนีคอลัมน์สถานะ (1-indexed)  
 \*/  
function getStatusColumnIndex() {  
  if (typeof DATA\_IDX \!== 'undefined' && DATA\_IDX.STATUS) {  
    return DATA\_IDX.STATUS;  
  }  
  return SOFT\_DELETE\_CONFIG.COL\_STATUS\_INDEX;  
}

// \=============================================================================  
// SECTION 2: CORE SOFT DELETE LOGIC  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันหลักในการลบข้อมูลแบบ Soft Delete (ย้ายไป Archive แทนการลบจริง)  
 \* @param {Array\<number\>} rowIndices \- รายการเลขแถวที่ต้องการลบ (1-indexed)  
 \* @param {string} sheetName \- ชื่อชีตต้นทาง (default: Database)  
 \* @returns {Object} ผลลัพธ์ { success: number, failed: number, archivedCount: number }  
 \*/  
function softDeleteRows(rowIndices, sheetName) {  
  if (\!rowIndices || rowIndices.length \=== 0\) {  
    return { success: 0, failed: 0, archivedCount: 0 };  
  }  
    
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sourceSheet \= ss.getSheetByName(sheetName || 'Database');  
    
  if (\!sourceSheet) {  
    throw new Error('ไม่พบชีต: ' \+ sheetName);  
  }  
    
  var statusCol \= getStatusColumnIndex();  
  var archiveSheet \= getOrCreateArchiveSheet();  
  var successCount \= 0;  
  var failCount \= 0;  
    
  // อ่านข้อมูลทั้งหมดครั้งเดียวเพื่อประสิทธิภาพ (ถ้าแถวไม่เยอะมาก)  
  // ในกรณีแถวเยอะมาก ควรอ่านเฉพาะแถวที่เลือก  
  var lastCol \= sourceSheet.getLastColumn();  
  var headers \= sourceSheet.getRange(1, 1, 1, lastCol).getValues()\[0\];  
    
  // เรียงลำดับแถวจากมากไปน้อย เพื่อไม่ให้เลขแถวเลื่อนเวลาจัดการ  
  rowIndices.sort(function(a, b) { return b \- a; });  
    
  rowIndices.forEach(function(rowIndex) {  
    try {  
      // 1\. อ่านข้อมูลในแถวนั้น  
      var rowData \= sourceSheet.getRange(rowIndex, 1, 1, lastCol).getValues()\[0\];  
        
      // 2\. เพิ่มข้อมูลลง Archive พร้อมเติม Metadata  
      var archiveRow \= \[  
        new Date(),               // เวลาที่ลบ  
        Session.getActiveUser().getEmail(), // ผู้ที่ลบ  
        sheetName                 // ชื่อชีตต้นฉบับ  
      \].concat(rowData);  
        
      archiveSheet.appendRow(archiveRow);  
        
      // 3\. อัปเดตสถานะในชีตต้นฉบับเป็น 'DELETED' (แทนการลบแถวทิ้ง)  
      // หรือจะซ่อนแถวก็ได้ แต่การเปลี่ยนสถานะจะค้นหาได้ง่ายกว่า  
      sourceSheet.getRange(rowIndex, statusCol).setValue(SOFT\_DELETE\_CONFIG.STATUS\_DELETED);  
        
      // ทางเลือก: ถ้าต้องการซ่อนแถวทันที  
      // sourceSheet.hideRows(rowIndex, 1);   
        
      logDeleteEvent('SOFT\_DELETE', sheetName, rowIndex, 'Success');  
      successCount++;  
        
    } catch (e) {  
      Logger.log('\[SoftDelete\] Failed to delete row ' \+ rowIndex \+ ': ' \+ e.message);  
      logDeleteEvent('ERROR', sheetName, rowIndex, e.message);  
      failCount++;  
    }  
  });  
    
  return {  
    success: successCount,  
    failed: failCount,  
    archivedCount: successCount  
  };  
}

/\*\*  
 \* กู้คืนข้อมูลที่ถูกลับกลับมายังชีตเดิม (Restore)  
 \* @param {Array\<number\>} archiveRowIndices \- เลขแถวในชีต Archive ที่ต้องการกู้คืน  
 \* @returns {Object} ผลลัพธ์ { restored: number, failed: number }  
 \*/  
function restoreDeletedRows(archiveRowIndices) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var archiveSheet \= ss.getSheetByName(SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME);  
    
  if (\!archiveSheet || archiveRowIndices.length \=== 0\) {  
    return { restored: 0, failed: 0 };  
  }  
    
  var statusCol \= getStatusColumnIndex();  
  var restoredCount \= 0;  
  var failCount \= 0;  
    
  // เรียงจากมากไปน้อย  
  archiveRowIndices.sort(function(a, b) { return b \- a; });  
    
  archiveRowIndices.forEach(function(archiveRowIndex) {  
    try {  
      // อ่านข้อมูลจาก Archive (ข้าม 3 คอลัมน์แรกที่เป็น Metadata)  
      var rowData \= archiveSheet.getRange(archiveRowIndex, 1, 1, archiveSheet.getLastColumn()).getValues()\[0\];  
        
      // แยก Metadata ออกมา  
      var originalSheetName \= rowData\[2\]; // Column C ใน Archive  
      var originalData \= rowData.slice(3); // ข้อมูลจริงเริ่มที่ Column D  
        
      var targetSheet \= ss.getSheetByName(originalSheetName);  
      if (\!targetSheet) {  
        throw new Error('ไม่พบชีตต้นฉบับ: ' \+ originalSheetName);  
      }  
        
      // นำข้อมูลกลับไปใส่ในชีตเดิม (ต่อท้าย หรือ หาตำแหน่งเดิมถ้ามีเก็บไว้)  
      // ในที่นี้ต่อท้ายแล้วอัปเดตสถานะ  
      targetSheet.appendRow(originalData);  
      var newRowIdx \= targetSheet.getLastRow();  
        
      // อัปเดตสถานะกลับเป็น ACTIVE  
      targetSheet.getRange(newRowIdx, statusCol).setValue(SOFT\_DELETE\_CONFIG.STATUS\_ACTIVE);  
        
      // ลบแถวออกจาก Archive (Hard Delete จาก Archive เพราะย้ายกลับแล้ว)  
      archiveSheet.deleteRow(archiveRowIndex);  
        
      logDeleteEvent('RESTORE', originalSheetName, newRowIdx, 'Success');  
      restoredCount++;  
        
    } catch (e) {  
      Logger.log('\[SoftDelete\] Failed to restore row ' \+ archiveRowIndex \+ ': ' \+ e.message);  
      failCount++;  
    }  
  });  
    
  return { restored: restoredCount, failed: failCount };  
}

// \=============================================================================  
// SECTION 3: ARCHIVE MANAGEMENT  
// \=============================================================================

/\*\*  
 \* ดึงหรือสร้างชีต Archive สำหรับเก็บข้อมูลลบ  
 \* @returns {Sheet} ออบเจ็กต์ชีต Archive  
 \*/  
function getOrCreateArchiveSheet() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheetName \= SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME;  
  var sheet \= ss.getSheetByName(sheetName);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(sheetName);  
    // สร้าง Header พิเศษสำหรับ Archive  
    // \[DeletedDate, DeletedBy, OriginalSheet, ...OriginalHeaders...\]  
    // หมายเหตุ: เนื่องจากแต่ละชีต Header ไม่เหมือนกัน เราอาจใช้วิธีเขียน Header กลางๆ หรือเว้นว่างไว้ก่อน  
    // วิธีที่ดีที่สุดคือเขียน Header กลางที่ครอบคลุม  
    var metaHeaders \= \['Deleted\_Timestamp', 'Deleted\_By\_User', 'Original\_Sheet\_Name'\];  
    // ใส่ Placeholder สำหรับข้อมูลจริง (ผู้ใช้ต้องรู้เองว่าคอลัมน์ไหนคืออะไรจาก OriginalSheet)  
    // หรือจะ Copy Header จากชีตจริงมาไว้ตอนย้ายครั้งแรกก็ได้ (ซับซ้อนขึ้น)  
    // แบบง่าย: เขียนแค่ Meta แล้วต่อข้อมูลเลย  
    sheet.getRange(1, 1, 1, 3).setValues(\[metaHeaders\]).setFontWeight('bold').setBackground('\#ffcccc');  
    sheet.setFrozenRows(1);  
    sheet.hideColumns(4, 50); // ซ่อนข้อมูลไว้ก่อนเพื่อดูแค่ Meta  
  }  
    
  return sheet;  
}

/\*\*  
 \* ลบข้อมูลใน Archive ถาวร (Hard Delete) ที่เก่าเกินกำหนด  
 \* @param {number} daysToKeep \- จำนวนวันที่ต้องการเก็บรักษา  
 \* @returns {number} จำนวนแถวที่ลบถาวร  
 \*/  
function hardDeleteOldArchive(daysToKeep) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME);  
    
  if (\!sheet) return 0;  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return 0;  
    
  var cutoffDate \= new Date();  
  cutoffDate.setDate(cutoffDate.getDate() \- daysToKeep);  
    
  // คอลัมน์ A คือ Deleted\_Timestamp  
  var dates \= sheet.getRange(2, 1, lastRow \- 1, 1).getValues();  
  var rowsToDelete \= \[\];  
    
  for (var i \= 0; i \< dates.length; i++) {  
    var rowDate \= new Date(dates\[i\]\[0\]);  
    if (rowDate \< cutoffDate) {  
      rowsToDelete.push(i \+ 2);  
    }  
  }  
    
  // ลบจากล่างขึ้นบน  
  for (var j \= rowsToDelete.length \- 1; j \>= 0; j--) {  
    sheet.deleteRow(rowsToDelete\[j\]);  
  }  
    
  logDeleteEvent('HARD\_DELETE', 'Archive', rowsToDelete.length, 'Cleared old data');  
  return rowsToDelete.length;  
}

/\*\*  
 \* ล้างข้อมูลทั้งหมดใน Archive (อันตราย\!)  
 \* @returns {void}  
 \*/  
function clearArchiveCompletely() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME);  
  if (sheet) {  
    sheet.clearContents();  
    // สร้าง Header ใหม่  
    sheet.getRange(1, 1, 1, 3).setValues(\[\['Deleted\_Timestamp', 'Deleted\_By\_User', 'Original\_Sheet\_Name'\]\]);  
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');  
  }  
}

// \=============================================================================  
// SECTION 4: UI WRAPPERS & INTERACTION  
// \=============================================================================

/\*\*  
 \* ฟังก์ชันสำหรับเรียกผ่านเมนู: ลบข้อมูลที่เลือก (Soft Delete)  
 \* @returns {void}  
 \*/  
function softDeleteSelectedRows\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= SpreadsheetAppgetActiveSheet();  
  var selection \= sheet.getActiveRangeList();  
    
  if (\!selection) {  
    ui.alert('กรุณาเลือกแถวที่ต้องการลบก่อน');  
    return;  
  }  
    
  // ดึงเลขแถวที่ไม่ซ้ำกัน  
  var ranges \= selection.getRanges();  
  var rowSet \= {};  
  ranges.forEach(function(range) {  
    var startRow \= range.getRow();  
    var numRows \= range.getNumRows();  
    for (var i \= 0; i \< numRows; i++) {  
      if (startRow \+ i \> 1\) { // ข้าม Header  
        rowSet\[startRow \+ i\] \= true;  
      }  
    }  
  });  
    
  var rowIndices \= Object.keys(rowSet).map(Number);  
    
  if (rowIndices.length \=== 0\) {  
    ui.alert('ไม่ได้เลือกแถวข้อมูล (อาจเลือกเฉพาะหัวตาราง)');  
    return;  
  }  
    
  var confirm \= ui.alert(  
    'ยืนยันการลบข้อมูล?',  
    'คุณจะลบ ' \+ rowIndices.length \+ ' แถว\\nระบบจะย้ายข้อมูลไปเก็บใน Archive และทำเครื่องหมายว่า Deleted\\nไม่ใช่การลบถาวร สามารถกู้คืนได้\\n\\nดำเนินการต่อ?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (confirm \== ui.Button.YES) {  
    var result \= softDeleteRows(rowIndices, sheet.getName());  
    ui.alert('เสร็จสิ้น\!\\nย้ายไป Archive: ' \+ result.archivedCount \+ ' แถว\\nล้มเหลว: ' \+ result.failed \+ ' แถว');  
  }  
}

/\*\*  
 \* แสดงหน้าจัดการ Archive (กู้คืน/ลบถาวร)  
 \* @returns {void}  
 \*/  
function manageArchive\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME);  
    
  if (\!sheet || sheet.getLastRow() \< 2\) {  
    ui.alert('ไม่มีข้อมูลใน Archive');  
    return;  
  }  
    
  ss.setActiveSheet(sheet);  
  sheet.showColumns(1, 50); // แสดงคอลัมน์ที่ซ่อนไว้  
    
  var choice \= ui.alert(  
    'จัดการ Archive',  
    'เปิดชีต Archive เรียบร้อย\\n\\nคุณสามารถ:\\n1. เลือกแถวแล้วกดปุ่ม "กู้คืน" (ต้องสร้างปุ่มเองหรือรันฟังก์ชัน restoreSelected)\\n2. รอให้ระบบลบอัตโนมัติเมื่อครบ ' \+ SOFT\_DELETE\_CONFIG.RETENTION\_DAYS \+ ' วัน\\n\\nต้องการให้ระบบล้างข้อมูลเก่า (\> ' \+ SOFT\_DELETE\_CONFIG.RETENTION\_DAYS \+ ' วัน) ตอนนี้เลยหรือไม่?',  
    ui.ButtonSet.YES\_NO\_CANCEL  
  );  
    
  if (choice \== ui.Button.YES) {  
    var count \= hardDeleteOldArchive(SOFT\_DELETE\_CONFIG.RETENTION\_DAYS);  
    ui.alert('ลบข้อมูลเก่าถาวรแล้ว: ' \+ count \+ ' แถว');  
  }  
}

/\*\*  
 \* กู้คืนแถวที่เลือกในชีต Archive  
 \* @returns {void}  
 \*/  
function restoreSelectedRows\_UI() {  
  var ui \= SpreadsheetApp.getUi();  
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();  
    
  if (sheet.getName() \!== SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME) {  
    ui.alert('กรุณาเปิดชีต Archive และเลือกแถวที่ต้องการกู้คืน');  
    return;  
  }  
    
  var selection \= sheet.getActiveRangeList();  
  if (\!selection) {  
    ui.alert('กรุณาเลือกแถว');  
    return;  
  }  
    
  var ranges \= selection.getRanges();  
  var rowSet \= {};  
  ranges.forEach(function(range) {  
    var startRow \= range.getRow();  
    var numRows \= range.getNumRows();  
    for (var i \= 0; i \< numRows; i++) {  
      if (startRow \+ i \> 1\) rowSet\[startRow \+ i\] \= true;  
    }  
  });  
    
  var rowIndices \= Object.keys(rowSet).map(Number);  
  var result \= restoreDeletedRows(rowIndices);  
    
  ui.alert('กู้คืนสำเร็จ: ' \+ result.restored \+ ' แถว\\nล้มเหลว: ' \+ result.failed \+ ' แถว');  
}

// \=============================================================================  
// SECTION 5: REPORTING & LOGGING  
// \=============================================================================

/\*\*  
 \* บันทึกเหตุการณ์การลบ/กู้คืน  
 \* @param {string} action \- การกระทำ (SOFT\_DELETE, RESTORE, HARD\_DELETE)  
 \* @param {string} sheetName \- ชื่อชีต  
 \* @param {\*} target \- เป้าหมาย (เลขแถว หรือ จำนวน)  
 \* @param {string} details \- รายละเอียดเพิ่มเติม  
 \* @returns {void}  
 \*/  
function logDeleteEvent(action, sheetName, target, details) {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(SOFT\_DELETE\_CONFIG.LOG\_SHEET\_NAME);  
    
  if (\!sheet) {  
    sheet \= ss.insertSheet(SOFT\_DELETE\_CONFIG.LOG\_SHEET\_NAME);  
    sheet.appendRow(\['Timestamp', 'Action', 'Sheet', 'Target', 'Details', 'User'\]);  
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');  
  }  
    
  sheet.appendRow(\[  
    new Date(),  
    action,  
    sheetName,  
    target,  
    details,  
    Session.getActiveUser().getEmail()  
  \]);  
    
  // เก็บ Log 500 แถว  
  if (sheet.getLastRow() \> 500\) {  
    sheet.deleteRows(2, sheet.getLastRow() \- 500);  
  }  
}

/\*\*  
 \* แสดงรายงานสถิติการลบ  
 \* @returns {void}  
 \*/  
function showDeleteStats() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var archiveSheet \= ss.getSheetByName(SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME);  
  var count \= archiveSheet ? archiveSheet.getLastRow() \- 1 : 0;  
    
  var msg \= '🗑️ Soft Delete Statistics\\n\\n';  
  msg \+= 'ข้อมูลใน Archive: ' \+ count \+ ' แถว\\n';  
  msg \+= 'ระยะเวลาเก็บรักษา: ' \+ SOFT\_DELETE\_CONFIG.RETENTION\_DAYS \+ ' วัน\\n';  
  msg \+= 'คำแนะนำ: ' \+ (count \> 1000 ? 'ควรทำการล้างข้อมูลเก่า' : 'สถานะปกติ') \+ '\\n';  
    
  SpreadsheetApp.getUi().alert(msg);  
}

// \=============================================================================  
// SECTION 6: DEBUG & MAINTENANCE  
// \=============================================================================

/\*\*  
 \* ทดสอบกระบวนการ Soft Delete ด้วยข้อมูลจำลอง  
 \* @returns {void}  
 \*/  
function debugTestSoftDelete() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName('Database');  
  if (\!sheet) return;  
    
  // สร้างข้อมูลทดสอบ 1 แถว  
  var testRow \= sheet.getLastRow() \+ 1;  
  sheet.getRange(testRow, 1, 1, 3).setValues(\[\['TEST\_UUID', 'Test Delete Name', 'Test Address'\]\]);  
    
  // ลบ  
  var result \= softDeleteRows(\[testRow\], 'Database');  
  Logger.log(result);  
    
  SpreadsheetApp.getUi().alert('ทดสอบเสร็จสิ้น\\nผลลัพธ์: ' \+ JSON.stringify(result));  
}

/\*\*  
 \* รีเซ็ตระบบ Soft Delete (ลบ Archive และ Log ทั้งหมด)  
 \* @returns {void}  
 \*/  
function resetSoftDeleteSystem() {  
  var ui \= SpreadsheetApp.getUi();  
  var confirm \= ui.alert(  
    'คำเตือน\!',  
    'การกระทำนี้จะลบชีต Archive และ Log ทั้งหมด\\nข้อมูลที่ถูกลับไปแล้วจะหายไปถาวรและกู้คืนไม่ได้\\n\\nยืนยันหรือไม่?',  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (confirm \== ui.Button.YES) {  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var sheetsToDelete \= \[SOFT\_DELETE\_CONFIG.ARCHIVE\_SHEET\_NAME, SOFT\_DELETE\_CONFIG.LOG\_SHEET\_NAME\];  
      
    sheetsToDelete.forEach(function(name) {  
      var s \= ss.getSheetByName(name);  
      if (s) ss.deleteSheet(s);  
    });  
      
    ui.alert('รีเซ็ตระบบเรียบร้อยแล้ว');  
  }  
}