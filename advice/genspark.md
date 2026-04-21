ได้วิเคราะห์โค้ดทั้งหมดเรียบร้อยแล้ว ขอเสนอรายงานแบบละเอียดดังนี้:

---

# **📊 รายงานวิเคราะห์ระบบ Logistics Master Data System V4.2 (lmds4\_4)**

---

## **🗂️ ส่วนที่ 1: สรุปโมดูลทั้งหมด**

ระบบมี **12 โมดูลหลัก (.gs files)** และ **1 หน้า UI (.html)**

| \# | ชื่อไฟล์ | บทบาท | จำนวนฟังก์ชัน |
| ----- | ----- | ----- | ----- |
| 1 | `Config.gs` | ศูนย์กลาง Configuration & Constants | 1 (validateSystemIntegrity) |
| 2 | `Menu.gs` | UI Menu & Safety Wrappers | 13 |
| 3 | `Utils_Common.gs` | Helper Functions กลาง \+ Row Adapters | 20 |
| 4 | `Service_Master.gs` | Master Data: Sync, Deep Clean, Finalize | 12 |
| 5 | `Service_Agent.gs` | AI Agent (Tier 4 / Gemini Resolution) | 4 |
| 6 | `Service_GeoAddr.gs` | Google Maps API \+ Postal Lookup | 11 |
| 7 | `Service_SCG.gs` | SCG API Fetch \+ Summary Builder | 10 |
| 8 | `Service_GPSFeedback.gs` | GPS Queue Management | 5 |
| 9 | `Service_Dedup.gs` | Duplicate Detection | 8 |
| 10 | `Service_SoftDelete.gs` | Soft Delete \+ UUID Merge \+ Auto-Merge | 12 |
| 11 | `Service_SchemaValidator.gs` | Schema Validation \+ Pre-checks | 9 |
| 12 | `Service_Search.gs` | Full-text Search \+ Cache | 3 |
| 13 | `Service_AutoPilot.gs` | Scheduler \+ Nightly Batch \+ AI Indexing | 7 |
| 14 | `Service_Maintenance.gs` | Housekeeping \+ Notification Hub (LINE/TG) | 9 |
| 15 | `Setup_Security.gs` | API Key/Token Setup | \~5 |
| 16 | `Setup_Upgrade.gs` | Schema Migration \+ Hidden Dupe Detection | 6 |
| 17 | `Test_AI.gs` | AI Debug Tools | 5 |
| 18 | `Test_Diagnostic.gs` | System/Sheet Diagnostics \+ Dry Run | 8 |
| 19 | `WebApp.gs` | HTTP Web App (doGet/doPost) | 4 |
| 20 | `Index.html` | Search UI Frontend | \- |

---

## **🔧 ส่วนที่ 2: ฟังก์ชันทั้งหมดในแต่ละโมดูล**

### **📦 [Config.gs](http://config.gs/)**

validateSystemIntegrity()   — ตรวจสอบชีตและ API Key ว่าครบหรือไม่

**Constants หลัก:** CONFIG, SCG\_CONFIG, DATA\_IDX, AI\_CONFIG

---

### **🖥️ [Menu.gs](http://menu.gs/) (13 ฟังก์ชัน)**

onOpen()                    — สร้างเมนู 4 หมวด  
syncNewDataToMaster\_UI()    — Wrapper ถาม confirm ก่อน Sync  
runAIBatchResolver\_UI()     — Wrapper ถาม confirm ก่อนรัน AI  
finalizeAndClean\_UI()       — Wrapper ถาม confirm ก่อน Finalize  
resetDeepCleanMemory\_UI()   — Reset pointer Deep Clean  
clearDataSheet\_UI()         — ล้าง Data Sheet  
clearInputSheet\_UI()        — ล้าง Input Sheet  
repairNameMapping\_UI()      — ซ่อมแซม NameMapping  
confirmAction()             — Generic confirm dialog  
runSystemHealthCheck()      — ตรวจสุขภาพระบบ  
showQualityReport\_UI()      — แสดง Quality Report  
clearPostalCache\_UI()       — ล้าง Postal Cache  
clearSearchCache\_UI()       — ล้าง Search Cache

---

### **🛠️ Utils\_Common.gs (20 ฟังก์ชัน)**

md5()                       — Hash MD5  
generateUUID()              — สร้าง UUID  
normalizeText()             — ทำความสะอาด+ปกติข้อความ (Tier 2\)  
cleanDistance()             — แปลงตัวเลขระยะทาง  
getBestName\_Smart()         — เลือกชื่อที่ดีที่สุดจาก array  
cleanDisplayName()          — ลบเบอร์โทรออกจากชื่อ  
getHaversineDistanceKM()    — คำนวณระยะ 2 พิกัด (km)  
genericRetry()              — Retry loop พร้อม Exponential Backoff  
safeJsonParse()             — Parse JSON ปลอดภัย  
checkUnusedFunctions()      — ตรวจฟังก์ชันที่ไม่ได้ใช้  
verifyFunctionsRemoved()    — ยืนยันว่าลบแล้ว  
dbRowToObject()             — Array → DB Object  
dbObjectToRow()             — DB Object → Array  
mapRowToObject()            — Array → NameMapping Object  
mapObjectToRow()            — NameMapping Object → Array  
queueRowToObject()          — Array → GPS Queue Object  
queueObjectToRow()          — GPS Queue Object → Array  
dailyJobRowToObject()       — Array → Daily Job Object

---

### **🧠 Service\_Master.gs (12 ฟังก์ชัน)**

getRealLastRow\_()                   — หาแถวสุดท้ายจริง (ข้าม Checkbox)  
loadDatabaseIndexByUUID\_()          — โหลด DB Index ด้วย UUID  
loadDatabaseIndexByNormalizedName\_()— โหลด DB Index ด้วย normalized name  
loadNameMappingRows\_()              — โหลด NameMapping rows  
appendNameMappings\_()               — เพิ่ม mapping ใหม่  
syncNewDataToMaster()               — Sync ข้อมูลจาก Source→Database  
cleanDistance\_Helper()              — Helper แปลงระยะ  
updateGeoData\_SmartCache()          — Alias → runDeepCleanBatch\_100  
autoGenerateMasterList\_Smart()      — Alias → processClustering\_GridOptimized  
runDeepCleanBatch\_100()             — ทำความสะอาดข้อมูล 100 แถว/ครั้ง  
resetDeepCleanMemory()              — รีเซ็ต pointer  
finalizeAndClean\_MoveToMapping()    — ย้ายข้อมูลที่ Verified → NameMapping  
scanAndTagCoLocatedHubs()           — หาบริษัทหลายชื่อในตึกเดียว

---

### **🤖 Service\_Agent.gs (4 ฟังก์ชัน)**

WAKE\_UP\_AGENT()                     — เรียก processAIIndexing\_Batch ทันที  
SCHEDULE\_AGENT\_WORK()               — ตั้ง Time Trigger 10 นาที  
retrieveCandidateMasters\_()         — RAG: คัด Candidates ก่อนส่ง AI  
resolveUnknownNamesWithAI()         — Tier 4: ส่งชื่อแปลกให้ Gemini จับคู่  
askGeminiToPredictTypos()           — ให้ Gemini สร้าง typo variants

---

### **🌍 Service\_GeoAddr.gs (11 ฟังก์ชัน)**

parseAddressFromText()              — แกะจังหวัด/อำเภอ/ไปรษณีย์จากข้อความ  
getPostalDataCached()               — โหลด PostalRef พร้อม Cache  
clearPostalCache()                  — ล้าง Cache ไปรษณีย์  
GOOGLEMAPS\_DURATION()               — เวลาเดินทาง (Custom Function)  
GOOGLEMAPS\_DISTANCE()               — ระยะทาง (Custom Function)  
GOOGLEMAPS\_LATLONG()                — Geocode ที่อยู่→พิกัด (Custom Function)  
GOOGLEMAPS\_ADDRESS()                — Geocode พิกัด→ที่อยู่ (Custom Function)  
GOOGLEMAPS\_REVERSEGEOCODE()         — Reverse Geocode (Custom Function)  
GOOGLEMAPS\_COUNTRY()                — หาชื่อประเทศ (Custom Function)  
GOOGLEMAPS\_DIRECTIONS()             — เส้นทาง (Custom Function)  
GET\_ADDR\_WITH\_CACHE()               — Wrapper Reverse Geocode พร้อม Error Handling  
CALCULATE\_DISTANCE\_KM()             — Wrapper คำนวณระยะทาง (km)

---

### **📦 Service\_SCG.gs (10 ฟังก์ชัน)**

fetchDataFromSCGJWD()               — ดึงข้อมูล Shipment จาก SCG API  
applyMasterCoordinatesToDailyJob()  — จับคู่พิกัดจาก Master→ Data Sheet  
fetchWithRetry\_()                   — HTTP Fetch พร้อม Retry  
tryMatchBranch\_()                   — ค้นหาชื่อสาขา  
checkIsEPOD()                       — ตรวจว่า Invoice ต้อง E-POD หรือไม่  
buildOwnerSummary()                 — สร้างสรุปตาม SoldToName  
buildShipmentSummary()              — สร้างสรุปตาม Shipment+Truck  
clearDataSheet()                    — ล้าง Data Sheet  
clearSummarySheet()                 — ล้าง สรุป\_เจ้าของสินค้า  
clearShipmentSummarySheet()         — ล้าง สรุป\_Shipment  
clearAllSCGSheets\_UI()              — ล้างทุกชีต SCG

---

### **📍 Service\_GPSFeedback.gs (5 ฟังก์ชัน)**

createGPSQueueSheet()               — สร้างชีต GPS\_Queue  
resetSyncStatus()                   — รีเซ็ต SYNCED ทั้งหมด (TEST ONLY)  
applyApprovedFeedback()             — ยืนยัน GPS จาก Queue → อัปเดต DB  
showGPSQueueStats()                 — แสดงสถิติ Queue  
upgradeGPSQueueSheet()              — อัปเกรด Format ชีต GPS\_Queue

---

### **🗃️ Service\_SoftDelete.gs (12 ฟังก์ชัน)**

initializeRecordStatus()            — ตั้งค่า Record\_Status \= Active ทุกแถว  
softDeleteRecord()                  — Mark UUID เป็น Inactive  
mergeUUIDs()                        — Mark Duplicate → Merged \+ ชี้ไป Master  
resolveUUID()                       — ติดตาม Merge Chain หา Canonical UUID  
resolveRowUUIDOrNull\_()             — ตรวจ UUID และคืน Canonical/null  
isActiveUUID\_()                     — ตรวจว่า UUID ยัง Active อยู่  
autoMergeExactNames()               — Auto-merge ชื่อซ้ำ 100% ที่ GPS ใกล้กัน  
mergeDuplicates\_UI()                — UI สำหรับ Manual Merge UUID  
showRecordStatusReport()            — แสดงสรุปสถานะ Record  
buildUUIDStateMap\_()                — โหลด UUID State ทั้งหมดครั้งเดียว  
resolveUUIDFromMap\_()               — ติดตาม Merge Chain จาก Map (ไม่ต้องอ่าน Sheet)  
isActiveFromMap\_()                  — ตรวจสถานะจาก Map (ไม่ต้องอ่าน Sheet)

---

### **✅ Service\_SchemaValidator.gs (9 ฟังก์ชัน)**

validateSheet\_()                    — ตรวจสอบ Schema ชีตเดียว  
validateGPSQueueIntegrity\_()        — ตรวจ Approve+Reject ติ๊กพร้อมกัน  
validateSchemas()                   — ตรวจหลายชีตพร้อมกัน  
preCheck\_Sync()                     — Pre-check ก่อน Sync  
preCheck\_Apply()                    — Pre-check ก่อน Apply Coordinates  
preCheck\_Approve()                  — Pre-check ก่อน Approve GPS  
throwSchemaError\_()                 — โยน Error พร้อม Format  
runFullSchemaValidation()           — รัน Validate ทุกชีต \+ GPS Conflicts  
fixNameMappingHeaders()             — แก้ไข Header NameMapping

---

### **🔍 Service\_Search.gs (3 ฟังก์ชัน)**

searchMasterData()                  — Full-text Search พร้อม Pagination  
getCachedNameMapping\_()             — โหลด NameMapping พร้อม Script Cache  
clearSearchCache()                  — ล้าง Cache Search

---

### **🤖 Service\_AutoPilot.gs (7 ฟังก์ชัน)**

START\_AUTO\_PILOT()                  — เปิด Trigger: 10min \+ Nightly 2AM  
STOP\_AUTO\_PILOT()                   — ลบ Trigger ทั้งหมด  
checkQueueCount\_()                  — นับรายการรอใน GPS\_Queue  
autoPilotRoutine()                  — รันทุก 10 นาที (Sync Coordinates)  
runNightlyBatchRoutine()            — รันตี 2 (Full: Sync+Merge+AI+Hub+Notify)  
processAIIndexing\_Batch()           — AI Indexing: สร้าง Keywords บน Database  
callGeminiThinking\_JSON()           — เรียก Gemini API สร้าง Keywords  
createBasicSmartKey()               — สร้าง Key พื้นฐาน (non-AI)

---

### **🔔 Service\_Maintenance.gs / Service\_Notify.gs (9 ฟังก์ชัน)**

cleanupOldBackups()                 — ลบ Backup \> 30 วัน  
checkSpreadsheetHealth()            — ตรวจ Cell Usage Limit  
sendSystemNotify()                  — Broadcast ทุกช่องทาง  
sendLineNotify()                    — Public Wrapper LINE  
sendTelegramNotify()                — Public Wrapper Telegram  
sendLineNotify\_Internal\_()          — ยิง LINE Notify API  
sendTelegramNotify\_Internal\_()      — ยิง Telegram API  
escapeHtml\_()                       — Escape HTML Telegram  
notifyAutoPilotStatus()             — แจ้งผล AutoPilot

---

## **🗺️ ส่วนที่ 3: แผนภาพความสัมพันธ์ฟังก์ชัน (Dependency Map)**

┌─────────────────────────────────────────────────────────────────────┐  
│                        ENTRY POINTS                                  │  
├────────────┬────────────┬───────────────┬────────────────────────────┤  
│  onOpen()  │  doGet()   │  doPost()     │  Triggers (AutoPilot)      │  
│  (Menu.gs) │ (WebApp.gs)│ (WebApp.gs)   │  (Service\_AutoPilot.gs)    │  
└─────┬──────┴─────┬──────┴───────┬───────┴──────────┬─────────────────┘  
      │             │              │                   │  
      ▼             ▼              ▼                   ▼  
┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────────────────┐  
│  UI Wrappers│ │searchMaster  │ │processAI    │ │  autoPilotRoutine()   │  
│  (Menu.gs)  │ │  Data()      │ │Indexing\_    │ │  runNightlyBatch      │  
│             │ │(Search.gs)   │ │Batch()      │ │  Routine()            │  
└──────┬──────┘ └──────┬───────┘ └──────┬──────┘ └────────┬──────────────┘  
       │               │                │                   │  
       ▼               ▼                ▼                   ▼  
┌──────────────────────────────────────────────────────────────────────┐  
│               CORE SERVICES LAYER                                     │  
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │  
│  │ Service\_Master │  │ Service\_Agent   │  │ Service\_SoftDelete   │  │  
│  │                │  │                 │  │                      │  │  
│  │syncNewData()   │  │resolveUnknown   │  │autoMergeExact()      │  │  
│  │finalizeAndClean│  │NamesWithAI()    │  │mergeUUIDs()          │  │  
│  │runDeepClean()  │  │retrieveCandidate│  │buildUUIDStateMap\_()  │  │  
│  │scanCoLocated() │  │Masters\_()       │  │resolveUUIDFromMap\_() │  │  
│  └───────┬────────┘  └────────┬────────┘  └──────────┬───────────┘  │  
│          │                    │                       │               │  
│  ┌───────┴────────┐  ┌────────┴────────┐  ┌──────────┴───────────┐  │  
│  │ Service\_SCG    │  │Service\_GeoAddr  │  │Service\_GPSFeedback   │  │  
│  │                │  │                 │  │                      │  │  
│  │fetchDataFromSCG│  │GET\_ADDR\_WITH    │  │applyApprovedFeedback │  │  
│  │applyMasterCoord│  │\_CACHE()         │  │createGPSQueueSheet() │  │  
│  │buildSummary()  │  │parseAddressFrom │  │showGPSQueueStats()   │  │  
│  └────────────────┘  │ Text()          │  └──────────────────────┘  │  
│                      └─────────────────┘                             │  
└──────────────────────────────────────────────────────────────────────┘  
       │                    │                       │  
       ▼                    ▼                       ▼  
┌──────────────────────────────────────────────────────────────────────┐  
│               FOUNDATION LAYER                                        │  
│  ┌────────────────────┐  ┌─────────────────────────────────────────┐ │  
│  │   Utils\_Common.gs  │  │    Config.gs (CONFIG / SCG\_CONFIG /     │ │  
│  │                    │  │     DATA\_IDX / AI\_CONFIG)               │ │  
│  │normalizeText()     │  │                                         │ │  
│  │getHaversineKM()    │  │DB\_TOTAL\_COLS, COL\_NAME, C\_IDX, MAP\_IDX │ │  
│  │dbRowToObject()     │  │GEMINI\_API\_KEY, AI\_MODEL, BATCH\_SIZE     │ │  
│  │generateUUID()      │  │                                         │ │  
│  │genericRetry()      │  │                                         │ │  
│  └────────────────────┘  └─────────────────────────────────────────┘ │  
└──────────────────────────────────────────────────────────────────────┘  
       │  
       ▼  
┌──────────────────────────────────────────────────────────────────────┐  
│               SUPPORT LAYER                                           │  
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │  
│  │ Schema         │  │ Maintenance /   │  │ Setup Layer          │  │  
│  │ Validator      │  │ Notify          │  │                      │  │  
│  │                │  │                 │  │Setup\_Security.gs     │  │  
│  │preCheck\_Sync() │  │cleanupOldBackup │  │Setup\_Upgrade.gs      │  │  
│  │validateSheet\_()│  │sendLineNotify() │  │upgradeDatabaseStruct │  │  
│  │runFullSchema() │  │sendTelegram()   │  │findHiddenDuplicates()│  │  
│  └────────────────┘  └─────────────────┘  └──────────────────────┘  │  
└──────────────────────────────────────────────────────────────────────┘

---

## **📋 ส่วนที่ 4: สรุปตำแหน่งชีตและการใช้งาน**

| ชีต | ใช้ใน Module | บทบาท |
| ----- | ----- | ----- |
| **Database** | Master, Agent, SCG, SoftDelete, Search, AutoPilot | ฐานข้อมูลกลาง (22 คอลัมน์) |
| **NameMapping** | Master, Agent, SCG, Search | ตาราง Alias → UUID (5 คอลัมน์) |
| **SCGนครหลวงJWDภูมิภาค** | Master, SchemaValidator | ชีตต้นทางข้อมูล Shipment |
| **GPS\_Queue** | Master, GPSFeedback, SchemaValidator | คิวตรวจสอบ GPS ต่างกัน |
| **Data** | SCG, Agent, AutoPilot | งานประจำวัน (29 คอลัมน์) |
| **Input** | SCG | รับ Shipment Numbers \+ Cookie |
| **PostalRef** | GeoAddr | Reference รหัสไปรษณีย์ |
| **ข้อมูลพนักงาน** | SCG | Map พนักงาน → Email |
| **สรุป\_เจ้าของสินค้า** | SCG | รายงานตาม SoldToName |
| **สรุป\_Shipment** | SCG | รายงานตาม Shipment+Truck |
| **Backup\_DB\_yyyyMMdd\_** | Master, Maintenance | Backup อัตโนมัติก่อน Finalize |

---

## **🔬 ส่วนที่ 5: การตรวจสอบความสมบูรณ์ (Integrity Check)**

### **✅ สิ่งที่มีและทำงานได้ดีแล้ว**

| ระบบ | สถานะ |
| ----- | ----- |
| UUID Generation | ✅ ครบ |
| Soft Delete / Merge Chain | ✅ ครบ ติดตามได้ 10 hops |
| Schema Validation (Pre-check) | ✅ ครบ 4 ชีต |
| LockService (Race Condition Guard) | ✅ ครบทุก critical function |
| GPS Distance Check (Haversine) | ✅ ใช้ได้ |
| AI Retrieval (RAG) | ✅ Phase D ทำแล้ว |
| Backup ก่อน Finalize | ✅ อัตโนมัติ |
| Notification (LINE/Telegram) | ✅ ครบ |
| Cache (Postal/Search/Maps) | ✅ ครบ |
| AutoPilot Trigger | ✅ ครบ |

### **⚠️ จุดที่ยังไม่สมบูรณ์หรือมีปัญหา**

| \# | ปัญหา | ระดับ | ไฟล์ |
| ----- | ----- | ----- | ----- |
| 1 | `Service_Dedup.gs` — ฟังก์ชัน 5 ใน 8 ตัวยังว่างเปล่า (`detectSimilarityDuplicates`, `detectSemanticDuplicates`, `detectFormatDuplicates`, `detectTimestampDuplicates`, `getSimilarity`) | 🔴 Critical | Service\_Dedup.gs |
| 2 | `autoGenerateMasterList_Smart()` เป็นแค่ Alias ไปยัง `processClustering_GridOptimized()` ซึ่ง**ไม่มีอยู่ในโค้ด** | 🔴 Critical | Service\_Master.gs |
| 3 | `recalculateAllQuality()`, `recalculateAllConfidence()`, `assignMissingUUIDs()` ถูกเรียกจากเมนูแต่**หาไม่พบในโค้ด** | 🔴 Critical | [Menu.gs](http://menu.gs/) |
| 4 | `repairNameMapping_Full()` ถูกเรียกจาก Menu แต่**ไม่พบในโค้ด** | 🔴 Critical | [Menu.gs](http://menu.gs/) |
| 5 | `clearInputSheet()` ถูกเรียกจาก Menu แต่**ไม่พบในโค้ด** | 🔴 Critical | [Menu.gs](http://menu.gs/) |
| 6 | ปัญหาซ้ำ 8 ข้อ (ชื่อ/พิกัด/LatLong) ยังไม่มีระบบจัดการแบบ Automated อย่างสมบูรณ์ | 🟠 High | หลายไฟล์ |
| 7 | `processAIIndexing_Batch()` เก็บ AI keywords รวมไว้ใน COL\_NORMALIZED คอลัมน์เดียวกับ search key | 🟡 Medium | Service\_AutoPilot.gs |
| 8 | ไม่มีการจัดการ Conflict เมื่อบุคคลเดียวกันมีหลาย UUID ที่ GPS ต่างกัน (ปัญหาข้อ 7\) แบบ automated | 🟡 Medium | Service\_SoftDelete.gs |

---

## **💾 ส่วนที่ 6: การวิเคราะห์ปัญหาทั้ง 8 ข้อ \+ แนวทางแก้ไข**

---

### **🔴 ปัญหาที่ 1: ชื่อบุคคลซ้ำกัน (Exact Name Duplicate)**

**สถานะปัจจุบัน:** มี `autoMergeExactNames()` ใน Service\_SoftDelete.gs แต่ทำงานแบบ **batch manual** เท่านั้น

**ระบบปัจจุบัน:**

* Normalize ชื่อ → เปรียบเทียบ → ถ้าซ้ำและ GPS \< 2km → Merge อัตโนมัติ ✅  
* ถ้า GPS \> 2km → **ไม่ Merge** (ถูกต้อง แต่ยังไม่แจ้งเตือน)

**สิ่งที่ควรเพิ่ม:**

// ใน runNightlyBatchRoutine() ควรรัยง DuplicateReport หลัง autoMerge  
function generateDuplicateReport\_() {  
  // ตรวจหาชื่อซ้ำที่ GPS \> 2km และยังไม่ได้ Merge  
  // ส่ง Report ผ่าน LINE/Telegram เพื่อให้มนุษย์ตัดสิน  
}

---

### **🔴 ปัญหาที่ 2: ชื่อสถานที่อยู่ซ้ำกัน**

**สถานะปัจจุบัน:** `parseAddressFromText()` แกะที่อยู่ได้ แต่ **ไม่มีระบบตรวจ Address Duplicate**

**สิ่งที่ขาด:** ยังไม่มีการ normalize ชื่อที่อยู่และ compare address string

// ควรสร้าง normalizeAddress() แยกต่างหาก  
function normalizeAddress(addr) {  
  // ลบ ถ./ซ./แขวง/เขต/จ. และ normalize  
  // ใช้ LevenshteinDistance หรือ Jaro-Winkler เปรียบเทียบ  
}

---

### **🔴 ปัญหาที่ 3: LatLong ซ้ำกัน (บุคคลต่างกัน พิกัดเดียวกัน)**

**สถานะปัจจุบัน:** มี `scanAndTagCoLocatedHubs()` ทำงานได้ ✅ (ตรวจ GPS \< 10 เมตร \+ ชื่อต่างกัน)  
 แต่แค่ **แท็ก** ใน Google Address Column ไม่ได้ทำอะไรต่อ

**สิ่งที่ควรเพิ่ม:**

* สร้างรายงาน Hub ส่งให้ผู้ดูแล  
* เพิ่ม Tag ลงใน Record\_Status หรือ Field พิเศษ เช่น `Hub_Group_ID`

---

### **🔴 ปัญหาที่ 4: บุคคลเดียวกัน ชื่อเขียนต่างกัน (Fuzzy Name Match)**

**สถานะปัจจุบัน:** มีครบที่สุด\!

* **Tier 1:** normalizeText() เปรียบเทียบ exact  
* **Tier 2:** NameMapping → aliasToUUID lookup  
* **Tier 3:** Branch matching (สาขา, branch)  
* **Tier 4:** Gemini AI → resolveUnknownNamesWithAI() ✅

**จุดอ่อน:** `Service_Dedup.gs` — `getSimilarity()` ยังเป็น stub (return 1 เสมอ) ต้องใส่ Levenshtein/Jaro-Winkler จริง

---

### **🔴 ปัญหาที่ 5: บุคคลต่างชื่อ แต่สถานที่เดียวกัน (Same Location, Different Name)**

**สถานะปัจจุบัน:** มี `scanAndTagCoLocatedHubs()` ✅ ตรวจได้ แต่:

* Threshold ≤ 10 เมตร ซึ่งอาจเข้มเกินไป (ควรปรับได้จาก CONFIG)  
* ไม่มี Report ที่ชัดเจน

---

### **🔴 ปัญหาที่ 6: บุคคลชื่อเดียวกัน แต่ที่อยู่ไม่เหมือนกัน**

**สถานะปัจจุบัน:** `syncNewDataToMaster()` มี Logic แยก Branch อัตโนมัติ:

* GPS diff \> 2km → สร้างแถวใหม่: `"ชื่อ (สาขา ละ.ลง)"` ✅  
* GPS diff 50m-2km → ส่งเข้า GPS\_Queue ✅

**จุดอ่อน:** ชื่อ Branch สร้างออกมาเป็น `"ABC (สาขา 13.74,100.53)"` ดูไม่สวย ควรพยายาม reverse geocode ก่อน

---

### **🔴 ปัญหาที่ 7: บุคคลชื่อเดียวกัน แต่ LatLong ต่างกัน**

**สถานะปัจจุบัน:** ส่งเข้า GPS\_Queue ให้มนุษย์ตัดสินใจ ✅  
 แต่ถ้า diff \> 2km → Auto-branch โดยไม่ถาม → **อาจสร้าง noise** ถ้าเป็น GPS error

**แนวทางแก้ไข:** เพิ่ม Coord\_Confidence threshold — ถ้า Confidence ของ DB ต่ำ ควร override ได้

---

### **🔴 ปัญหาที่ 8: บุคคลต่างชื่อ แต่ LatLong เดียวกัน**

**สถานะปัจจุบัน:** ตรวจได้ผ่าน `findHiddenDuplicates()` (Spatial Grid O(N)) ✅  
 และ `scanAndTagCoLocatedHubs()` ✅

**จุดอ่อน:** ทั้งสองฟังก์ชันทำงานแยกกัน และต้องรันด้วยตนเอง — ควรรวมเข้า Nightly Batch

---

## **🏗️ ส่วนที่ 7: แนวทางสร้างฐานข้อมูลใหม่ที่แนะนำ**

### **โครงสร้างชีต Database ที่แนะนำ (V5.0)**

คอลัมน์ปัจจุบัน (22 คอลัมน์) → ควรเพิ่มเป็น 27 คอลัมน์

A  NAME                  — ชื่อลูกค้า (Canonical)  
B  LAT                   — ละติจูด  
C  LNG                   — ลองจิจูด  
D  SUGGESTED             — ชื่อที่ AI แนะนำ  
E  CONFIDENCE            — ความมั่นใจในการจับคู่  
F  NORMALIZED            — AI Keywords Index  
G  VERIFIED              — ✅ มนุษย์ยืนยันแล้ว (Checkbox)  
H  SYS\_ADDR              — ที่อยู่จากระบบต้นทาง  
I  ADDR\_GOOGLE           — ที่อยู่จาก Google Maps  
J  DIST\_KM               — ระยะจาก Depot  
K  UUID                  — รหัสประจำตัวไม่ซ้ำ  
L  PROVINCE              — จังหวัด  
M  DISTRICT              — อำเภอ/เขต  
N  POSTCODE              — รหัสไปรษณีย์  
O  QUALITY               — คะแนนคุณภาพ (0-100)  
P  CREATED               — วันที่สร้าง  
Q  UPDATED               — วันที่อัปเดตล่าสุด  
R  COORD\_SOURCE          — แหล่งที่มาพิกัด  
S  COORD\_CONFIDENCE      — ความน่าเชื่อถือพิกัด  
T  COORD\_LAST\_UPDATED    — วันอัปเดตพิกัดล่าสุด  
U  RECORD\_STATUS         — Active / Inactive / Merged  
V  MERGED\_TO\_UUID        — ชี้ไป Master UUID (ถ้า Merged)  
\--- เพิ่มใหม่ \---  
W  HUB\_GROUP\_ID          — \[ใหม่\] ID กลุ่ม Hub เดียวกัน  
X  ADDRESS\_NORMALIZED    — \[ใหม่\] ที่อยู่ที่ Normalize แล้ว  
Y  DUPLICATE\_FLAG        — \[ใหม่\] ติดแฟล็ก: EXACT/FUZZY/HUB/CONFLICT  
Z  LAST\_SEEN\_DATE        — \[ใหม่\] ครั้งสุดท้ายที่เจอในข้อมูลจริง  
AA BRANCH\_OF\_UUID        — \[ใหม่\] UUID ของร้านหลัก (ถ้าเป็นสาขา)

---

## **🚀 ส่วนที่ 8: ถ้าโปรเจกต์นี้เป็นของผม ผมจะทำอะไรก่อน?**

### **🥇 Phase 1: ซ่อมสิ่งที่พัง (1-2 วัน)**

**1\. ซ่อม Service\_Dedup.gs — `getSimilarity()` ที่เป็น Stub**

// ใส่ Jaro-Winkler Distance จริง ๆ  
function getSimilarity(str1, str2) {  
  // Jaro-Winkler: เหมาะมากกับชื่อไทย/ภาษาผสม  
  var s1 \= normalizeText(str1);  
  var s2 \= normalizeText(str2);  
  return jaroWinklerDistance(s1, s2); // implement จาก algorithm  
}

**2\. สร้างฟังก์ชันที่หายไปจากเมนู:**

* `recalculateAllQuality()` — วนลูปทุกแถว คำนวณ Quality Score ใหม่  
* `recalculateAllConfidence()` — คำนวณ Confidence ใหม่  
* `assignMissingUUIDs()` — สร้าง UUID ให้แถวที่ขาด  
* `repairNameMapping_Full()` — ลบ duplicate rows ใน NameMapping  
* `clearInputSheet()` — ล้าง Input Sheet  
* `processClustering_GridOptimized()` — ฟังก์ชัน Clustering จริง

---

### **🥈 Phase 2: แก้ปัญหาทั้ง 8 ข้อแบบ Systematic (3-5 วัน)**

สร้าง **`Service_DataQuality.gs`** ใหม่:

/\*\*  
 \* Service\_DataQuality.gs — ระบบตรวจคุณภาพข้อมูลแบบครบวงจร  
 \* จัดการปัญหาทั้ง 8 ข้อในที่เดียว  
 \*/

// \===== ปัญหา 1: ชื่อซ้ำกัน \=====  
function detectNameDuplicates() {  
  // Group by normalizeText(name)  
  // แยก: GPS ใกล้ (\<2km) → แนะนำ Merge  
  //       GPS ไกล (\>2km) → แนะนำ Branch / ถือว่าคนละคน  
  // ส่งผลลัพธ์ไปชีต "DQ\_Report"  
}

// \===== ปัญหา 2: ที่อยู่ซ้ำกัน \=====  
function detectAddressDuplicates() {  
  // Normalize address → เปรียบเทียบ similarity \> 85%  
  // Flag ADDR\_DUPLICATE  
}

// \===== ปัญหา 3+8: LatLong ซ้ำ \=====  
function detectLatLngDuplicates() {  
  // ใช้ Spatial Grid (มีแล้วใน findHiddenDuplicates)  
  // รวมเข้า Nightly Batch อัตโนมัติ  
  // เขียนลง HUB\_GROUP\_ID column  
}

// \===== ปัญหา 4: ชื่อคล้ายกัน \=====  
function detectFuzzyNameMatches() {  
  // Jaro-Winkler \>= 0.85 → แนะนำ Review  
  // Jaro-Winkler \>= 0.95 → Auto-flag FUZZY\_DUPLICATE  
}

// \===== ปัญหา 5+6+7: ชื่อ/ที่อยู่/GPS ไม่ตรงกัน \=====  
function detectConflicts() {  
  // Group by normalizedName  
  // ตรวจ: ที่อยู่ต่างกัน, GPS ต่างกัน  
  // Flag CONFLICT ส่งเข้า Review Queue  
}

// \===== รันทั้งหมดในครั้งเดียว \=====  
function runFullDataQualityCheck() {  
  detectNameDuplicates();  
  detectAddressDuplicates();  
  detectLatLngDuplicates();  
  detectFuzzyNameMatches();  
  detectConflicts();  
  generateDQReport(); // สร้าง Report Sheet  
  sendSystemNotify("DQ Check Complete");  
}

---

### **🥉 Phase 3: ปรับ Database Schema \+ Nightly Batch (2-3 วัน)**

**เพิ่มคอลัมน์ใหม่ใน Database:**

* `HUB_GROUP_ID` — สำหรับรวมกลุ่ม Hub  
* `DUPLICATE_FLAG` — EXACT / FUZZY / HUB / CONFLICT / BRANCH  
* `LAST_SEEN_DATE` — วันล่าสุดที่เห็นในข้อมูลจริง  
* `BRANCH_OF_UUID` — UUID ของร้านแม่

**เพิ่มใน Nightly Batch:**

// runNightlyBatchRoutine() — เพิ่ม Step 7  
// 7\. ตรวจคุณภาพข้อมูล (Data Quality Check)  
if (typeof runFullDataQualityCheck \=== 'function') {  
  try { runFullDataQualityCheck(); }  
  catch(e) { console.error("DQ Error: " \+ e.message); }  
}

---

### **🔧 Phase 4: ทำความสะอาดโค้ด (1-2 วัน)**

**ลบออก / ไม่จำเป็น:**

* `Service_Dedup.gs` ทั้งไฟล์ (stub ที่ไม่ทำงาน) → ย้ายเข้า `Service_DataQuality.gs` ใหม่  
* `verifyFunctionsRemoved()` และ `checkUnusedFunctions()` ใน Utils\_Common — ใช้แค่ตอน Dev

**รวม:**

* `Service_Maintenance.gs` \+ `Service_Notify.gs` → ไฟล์เดียว (ปัจจุบันซ้ำซ้อน)  
* `Service_GPSFeedback.gs` ย้าย `upgradeGPSQueueSheet()` ไปอยู่ใน `Setup_Upgrade.gs`

---

## **📊 สรุปสถาปัตยกรรมระบบแบบสมบูรณ์**

┌──────────────────────────────────────────────────────────────┐  
│                    DATA FLOW                                  │  
│                                                              │  
│  SCG API ──→ Data Sheet ──→ syncNewDataToMaster()           │  
│                 │                    │                        │  
│                 ▼                    ▼                        │  
│            applyMaster        Database Sheet (22 cols)        │  
│           Coordinates()            │                          │  
│                                    ├── NameMapping Sheet      │  
│                                    ├── GPS\_Queue Sheet        │  
│                                    └── PostalRef Sheet        │  
│                                                              │  
│  Nightly Batch (2 AM):                                       │  
│  1\. syncNewDataToMaster()                                     │  
│  2\. autoMergeExactNames()                                     │  
│  3\. resolveUnknownNamesWithAI() \[Tier 4\]                     │  
│  4\. scanAndTagCoLocatedHubs()                                 │  
│  5\. processAIIndexing\_Batch()                                 │  
│  6\. sendSystemNotify() \[LINE/Telegram\]                        │  
│                                                              │  
│  10-Min AutoPilot:                                           │  
│  applyMasterCoordinatesToDailyJob()                          │  
│                                                              │  
│  WebApp Search:                                              │  
│  searchMasterData() → getCachedNameMapping\_()                │  
│                     → Full-text Haystack Search              │  
│                     → Pagination (20/page)                   │  
└──────────────────────────────────────────────────────────────┘

---

## **🎯 สรุปลำดับความสำคัญในการแก้ไข**

| ลำดับ | งาน | เหตุผล |
| ----- | ----- | ----- |
| 1 | ซ่อม `getSimilarity()` ใน Service\_Dedup | พัง → ทำให้ Fuzzy matching ไม่ทำงาน |
| 2 | สร้างฟังก์ชันที่หายไปจากเมนู 5 ตัว | เมนูพัง → UX เสีย |
| 3 | สร้าง `processClustering_GridOptimized()` | ปุ่มที่ 3 ในเมนูพัง |
| 4 | สร้าง `Service_DataQuality.gs` | รวมการแก้ปัญหาทั้ง 8 ข้อ |
| 5 | เพิ่มคอลัมน์ใหม่ใน Database | รองรับ Hub/Branch/Flag |
| 6 | รวม Maintenance \+ Notify | ลดความซ้ำซ้อน |
| 7 | เพิ่ม DQ Check ใน Nightly Batch | ทำงานอัตโนมัติทุกคืน |
| 8 | เพิ่ม Branch Name Improvement | ชื่อ Branch ดูดีขึ้น |

---

**ความเห็นโดยรวม:** ระบบนี้มีสถาปัตยกรรมที่ออกแบบมาดีมาก โดยเฉพาะ UUID Management, LockService, Schema Validation, และ AI Integration แต่ **Service\_Dedup.gs** คือจุดอ่อนที่สำคัญที่สุด เพราะเป็น stub ทั้งไฟล์ และมีฟังก์ชันหลายตัวในเมนูที่ถูกเรียกแต่ไม่มีในโค้ด ซึ่งควรแก้ไขเป็นอันดับแรกก่อนขยายระบบ

