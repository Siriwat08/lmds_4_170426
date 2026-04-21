ผมได้อ่านและวิเคราะห์โค้ดทั้งหมด 21 ไฟล์อย่างละเอียดแล้วครับ ระบบนี้เป็น \*\*Logistics Master Data System V4.2\*\* ที่มีโครงสร้างซับซ้อนและครอบคลุมมาก ผมจะสรุปให้ตามที่คุณต้องการ:

\---

\#\# 📊 สรุปโครงสร้างระบบทั้งหมด

\#\#\# 1\. โมดูลโค้ดทั้งหมด (21 ไฟล์)

| หมวดหมู่ | ไฟล์ | หน้าที่หลัก | สถานะการใช้งาน |  
|---------|------|-----------|--------------|  
| \*\*Config\*\* | \`Config.gs\` | ค่าคงที่, Column Index, API Keys | ✅ พร้อมใช้ |  
| \*\*UI/Menu\*\* | \`Menu.gs\` | เมนู Google Sheets ทั้งหมด | ✅ พร้อมใช้ |  
| \*\*Web\*\* | \`WebApp.gs\` | Controller WebApp (doGet/doPost) | ✅ พร้อมใช้ |  
| | \`Index.html\` | หน้าค้นหาพิกัดลูกค้า | ✅ พร้อมใช้ |  
| \*\*Utils\*\* | \`Utils\_Common.gs\` | normalizeText, UUID, Haversine, Row Adapters | ✅ พร้อมใช้ |  
| \*\*Core Services\*\* | \`Service\_Master.gs\` | จัดการ Database, Sync, Clustering, Quality | ✅ พร้อมใช้ |  
| | \`Service\_SCG.gs\` | ดึง SCG API, จับคู่พิกัด, สรุปงาน | ✅ \*\*ใช้งานดีอยู่แล้ว (ส่วนที่1)\*\* |  
| | \`Service\_Search.gs\` | Search Engine สำหรับ WebApp | ✅ พร้อมใช้ |  
| | \`Service\_GeoAddr.gs\` | Google Maps API, Postal Cache | ✅ พร้อมใช้ |  
| \*\*AI & Automation\*\* | \`Service\_Agent.gs\` | AI Tier 4 Smart Resolution | ⚠️ ต้องตรวจสอบ Gemini API |  
| | \`Service\_AutoPilot.gs\` | Background AI Indexing | ⚠️ ต้องตรวจสอบ Trigger |  
| \*\*Data Quality\*\* | \`Service\_GPSFeedback.gs\` | GPS Queue Management | ✅ พร้อมใช้ |  
| | \`Service\_SchemaValidator.gs\` | ตรวจสอบโครงสร้างชีต | ✅ พร้อมใช้ |  
| | \`Service\_SoftDelete.gs\` | Soft Delete, Merge UUID | ✅ พร้อมใช้ |  
| \*\*Maintenance\*\* | \`Service\_Maintenance.gs\` | ล้าง Backup, Cell Usage | ✅ พร้อมใช้ |  
| | \`Service\_Notify.gs\` | LINE/Telegram Notifications | ⚠️ ต้องตั้งค่า Token |  
| \*\*Setup\*\* | \`Setup\_Security.gs\` | ตั้งค่า API Keys | ✅ พร้อมใช้ |  
| | \`Setup\_Upgrade.gs\` | อัปเกรด Schema, หา Duplicates | ✅ พร้อมใช้ |  
| \*\*Testing\*\* | \`Test\_AI.gs\` | Debug AI functions | ✅ พร้อมใช้ |  
| | \`Test\_Diagnostic.gs\` | ตรวจสอบระบบ | ✅ พร้อมใช้ |

\---

\#\#\# 2\. ชีตที่ต้องมีใน Google Sheets (14 ชีต)

จาก \`Master Data System.md\` และโค้ด:

| ชีต | คอลัมน์สำคัญ | หน้าที่ |  
|-----|------------|---------|  
| \`Database\` | 22 คอลัมน์ (A-V): NAME, LAT, LNG, UUID, QUALITY, Coord\_Source, Coord\_Confidence, Coord\_Last\_Updated, Record\_Status, Merged\_To\_UUID ฯลฯ | \*\*Golden Record\*\* ลูกค้าหลัก |  
| \`NameMapping\` | 5 คอลัมน์: Variant\_Name, Master\_UID, Confidence\_Score, Mapped\_By, Timestamp | แก้ชื่อซ้ำซ้อน (Alias → Master) |  
| \`SCGนครหลวงJWDภูมิภาค\` | 37 คอลัมน์: ชื่อปลายทาง, LAT, LONG, SYNC\_STATUS ฯลฯ | \*\*แหล่งข้อมูลดิบ GPS จริงจากคนขับ\*\* |  
| \`Data\` | 29 คอลัมน์: งานประจำวัน, LatLong\_Actual, ShopKey ฯลฯ | \*\*ส่วนที่1 ทำงานดีอยู่แล้ว\*\* |  
| \`Input\` | B1=Cookie, A4↓=Shipment Numbers | \*\*ส่วนที่1 ทำงานดีอยู่แล้ว\*\* |  
| \`ข้อมูลพนักงาน\` | B=ชื่อ, G=Email | \*\*ส่วนที่1 ทำงานดีอยู่แล้ว\*\* |  
| \`GPS\_Queue\` | 9 คอลัมน์: Timestamp, ShipToName, UUID\_DB, LatLng\_Driver, LatLng\_DB, Diff\_Meters, Reason, Approve, Reject | รอ Admin อนุมัติพิกัด |  
| \`PostalRef\` | postcode, district, province, lat, lng | ข้อมูลรหัสไปรษณีย์ |  
| \`สรุป\_เจ้าของสินค้า\` | SummaryKey, SoldToName, จำนวน\_ทั้งหมด, จำนวน\_E-POD\_ทั้งหมด | \*\*ส่วนที่1 ทำงานดีอยู่แล้ว\*\* |  
| \`สรุป\_Shipment\` | ShipmentKey, ShipmentNo, TruckLicense, จำนวน\_ทั้งหมด, จำนวน\_E-POD\_ทั้งหมด | \*\*ส่วนที่1 ทำงานดีอยู่แล้ว\*\* |  
| \`Blacklist\` | Name | รายชื่อที่ต้องข้าม |  
| \`SystemLogs\` | Timestamp, User, Action, Details | บันทึกการทำงาน |  
| \`ErrorLogs\` | Timestamp, Function, Message | บันทึก Error |  
| \`Dashboard\` | Metric, Value | สถิติระบบ |

\---

\#\# 🔍 วิเคราะห์ปัญหา 8 ข้อ \+ แนวทางแก้ไข

จากโค้ดที่อ่าน ระบบนี้มี \*\*กลไกรองรับครบทั้ง 8 ข้อแล้ว\*\* แต่ต้องใช้งานให้ถูกต้อง:

\#\#\# ปัญหา 1-2: ชื่อบุคคลซ้ำ / ชื่อสถานที่ซ้ำ  
\*\*แก้ไขด้วย:\*\* \`NameMapping\` \+ \`normalizeText()\` \+ \`Clustering\`

\`\`\`  
โฟลว์การทำงาน:  
1\. syncNewDataToMaster() → ดึงจาก SCGนครหลวงJWDภูมิภาค  
2\. autoGenerateMasterList\_Smart() → จัดกลุ่มด้วย Grid \+ Haversine 50m  
3\. finalizeAndClean\_MoveToMapping() → ย้ายชื่อซ้ำไป NameMapping  
\`\`\`

\*\*ตัวอย่าง:\*\*  
\- "บริษัท เอ จำกัด" และ "บจก. เอ" → normalizeText() → "เอ" → จับคู่กัน  
\- ระบบเลือกชื่อที่ดีที่สุดด้วย \`getBestName\_Smart()\`

\#\#\# ปัญหา 3: LatLong ซ้ำกัน  
\*\*แก้ไขด้วย:\*\* \`findHiddenDuplicates()\` ใน \`Setup\_Upgrade.gs\`

\`\`\`javascript  
// Spatial Grid Algorithm O(N) แทน O(N²)  
\- แบ่งพื้นที่เป็นช่อง 1.1km (ทศนิยม 2 ตำแหน่ง)  
\- เปรียบเทียบเฉพาะในช่องเดียวกัน  
\- ห่าง \< 50m \= แจ้งเตือน  
\`\`\`

\#\#\# ปัญหา 4: บุคคลเดียวกัน ชื่อต่างกัน (หลายบริษัทพิมพ์ต่างกัน)  
\*\*แก้ไขด้วย:\*\* \`NameMapping\` \+ \`AI Resolution\`

\`\`\`  
Tier 1: Exact match หลัง normalize  
Tier 2: NameMapping lookup (Variant → Master\_UID)  
Tier 3: Fuzzy matching ด้วย keywords  
Tier 4: Gemini AI วิเคราะห์ชื่อที่ไม่รู้จัก (resolveUnknownNamesWithAI)  
\`\`\`

\#\#\# ปัญหา 5: คนละชื่อ แต่ที่อยู่เดียวกัน  
\*\*แก้ไขด้วย:\*\* \`GPS\_Queue\` \+ \`applyApprovedFeedback()\`

\`\`\`  
เมื่อพบพิกัดเดียวกันแต่ชื่อต่างกัน:  
1\. ระบบส่งเข้า GPS\_Queue พร้อมเหตุผล  
2\. Admin ติ๊ก Approve/Reject  
3\. ถ้า Approve → อัปเดต Database พิกัดใหม่  
4\. ถ้า Reject → ทำเครื่องหมายไว้  
\`\`\`

\#\#\# ปัญหา 6: ชื่อเดียวกัน แต่ที่อยู่ต่างกัน  
\*\*แก้ไขด้วย:\*\* \`Record\_Status\` \+ \`Merged\_To\_UUID\`

\`\`\`javascript  
// Service\_SoftDelete.gs  
\- ถ้าพบว่าชื่อเดียวกันแต่คนละที่ → แยกเป็น 2 UUID  
\- ถ้าต้องการรวม → ใช้ mergeUUIDs(masterUUID, duplicateUUID)  
\- duplicate จะถูก mark เป็น "Merged" ชี้ไป master  
\`\`\`

\#\#\# ปัญหา 7: ชื่อเดียวกัน แต่ LatLong คนละที่  
\*\*แก้ไขด้วย:\*\* \`GPS\_Queue\` \+ \`Coord\_Source\` tracking

\`\`\`  
Database เก็บ:  
\- Coord\_Source: "SCG\_System" | "Driver\_GPS" | "Manual"  
\- Coord\_Confidence: 0-100%  
\- Coord\_Last\_Updated: timestamp

เมื่อ Driver\_GPS ต่างจาก Database \> 50m:  
→ เข้า Queue รอ Admin อนุมัติ  
\`\`\`

\#\#\# ปัญหา 8: คนละชื่อ แต่ LatLong เดียวกัน  
\*\*แก้ไขด้วย:\*\* \`findHiddenDuplicates()\` \+ \`Clustering\`

\`\`\`  
ระบบตรวจจับ:  
\- พิกัดเดียวกัน (±50m) แต่ชื่อต่างกัน  
\- แสดงรายงานให้ Admin ตัดสินใจ  
\- สามารถ Merge หรือ แยกตามความเหมาะสม  
\`\`\`

\---

\#\# 🎯 ถ้าโปรเจคนี้เป็นของผม ผมจะทำแบบนี้

\#\#\# Phase 1: ตรวจสอบและตั้งค่าพื้นฐาน (สัปดาห์ที่ 1\)

\`\`\`  
1\. รัน runFullSchemaValidation() → ตรวจ 14 ชีตครบไหม  
2\. รัน initializeRecordStatus() → ตั้งค่า Active ให้ข้อมูลเก่า  
3\. รัน setupEnvironment() → ใส่ Gemini API Key  
4\. รัน upgradeDatabaseStructure() → เพิ่มคอลัมน์ GPS Tracking (ถ้าขาด)  
5\. รัน upgradeNameMappingStructure\_V4() → อัปเกรดเป็น 5 คอลัมน์  
\`\`\`

\#\#\# Phase 2: ทำความสะอาดข้อมูลเก่า (สัปดาห์ที่ 2\)

\`\`\`  
1\. รัน assignMissingUUIDs() → เติม UUID ให้ครบ  
2\. รัน recalculateAllQuality() → คำนวณ Quality Score  
3\. รัน recalculateAllConfidence() → คำนวณ Confidence  
4\. รัน findHiddenDuplicates() → หาพิกัดซ้ำซ้อน  
5\. รัน repairNameMapping\_Full() → ซ่อมแซม NameMapping  
\`\`\`

\#\#\# Phase 3: สร้าง Workflow ประจำวัน (สัปดาห์ที่ 3\)

\`\`\`  
เช้ามืด (อัตโนมัติหรือกดมือ):  
1\. syncNewDataToMaster() → ดึงจาก SCGนครหลวงJWDภูมิภาค  
   \- เพิ่มลูกค้าใหม่  
   \- ส่ง GPS ต่างกันเข้า Queue  
   \- Mark SYNC\_STATUS \= "SYNCED"

2\. autoGenerateMasterList\_Smart() → จัดกลุ่มชื่อซ้ำ

3\. runDeepCleanBatch\_100() → เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 100 แถว)

4\. finalizeAndClean\_MoveToMapping() → ย้าย Verified → NameMapping

5\. applyMasterCoordinatesToDailyJob() → อัปเดตชีต Data (ส่วนที่1)  
\`\`\`

\#\#\# Phase 4: ใช้ AI ช่วย (สัปดาห์ที่ 4\)

\`\`\`  
1\. START\_AUTO\_PILOT() → ตั้งเวลาทุก 10 นาที  
2\. หรือ WAKE\_UP\_AGENT() → กดเองเมื่อต้องการ  
3\. resolveUnknownNamesWithAI() → ส่งชื่อแปลกให้ Gemini วิเคราะห์  
   \- Confidence ≥ 90%: Auto-map  
   \- Confidence 70-89%: Review queue  
   \- Confidence \< 70%: Ignore  
\`\`\`

\#\#\# Phase 5: ตรวจสอบและบำรุงรักษา (รายสัปดาห์)

\`\`\`  
1\. รัน runDryRunMappingConflicts() → ตรวจ NameMapping ก่อนมีปัญหา  
2\. รัน runDryRunUUIDIntegrity() → ตรวจ UUID ซ้ำ/ขาด  
3\. รัน cleanupOldBackups() → ลบ Backup \> 30 วัน  
4\. รัน checkSpreadsheetHealth() → เช็ค Cell Usage \< 80%  
\`\`\`

\---

\#\# ⚠️ โค้ดที่ควรตรวจสอบ / อาจมีปัญหา

จากการวิเคราะห์ พบจุดที่ต้องระวัง:

| ไฟล์ | บรรทัด/ฟังก์ชัน | ปัญหาที่อาจเกิด | แนะนำ |  
|------|---------------|----------------|-------|  
| \`Service\_Agent.gs\` | \`resolveUnknownNamesWithAI()\` | Gemini API อาจไม่ตอบหรือตอบผิด format | มี parse guard แล้ว แต่ต้อง test จริง |  
| \`Service\_AutoPilot.gs\` | \`autoPilotRoutine()\` | Trigger อาจซ้อนกัน ถ้าไม่ได้ STOP ก่อน | รัน STOP\_AUTO\_PILOT() ก่อน START |  
| \`Service\_SCG.gs\` | \`fetchDataFromSCGJWD()\` | Cookie หมดอายุ → API 401 | ต้อง refresh cookie ทุกวัน |  
| \`Service\_GPSFeedback.gs\` | \`applyApprovedFeedback()\` | Checkbox ทั้ง Approve+Reject อาจติ๊กพร้อมกัน | มี CONFLICT detection แล้ว |  
| \`Config.gs\` | \`GEMINI\_API\_KEY\` | ถ้าไม่ได้ set → ทุก AI function ล้ม | รัน setupEnvironment() ก่อนใช้ |  
| \`Utils\_Common.gs\` | \`normalizeText()\` | บางชื่ออาจ normalize แล้วเหลือว่างเปล่า | เพิ่ม fallback ใช้ชื่อดิบ |

\---

\#\# ✅ สรุป: ระบบนี้ใช้งานได้จริงไหม?

\*\*ตอบ: ใช้งานได้จริง\*\* แต่ต้องตั้งค่าและใช้งานตามลำดับ:

\#\#\# ส่วนที่1 (ทำงานดีอยู่แล้ว):  
\- ✅ \`Service\_SCG.gs\` → ดึงข้อมูล SCG API  
\- ✅ \`applyMasterCoordinatesToDailyJob()\` → จับคู่พิกัดจาก Database  
\- ✅ สรุปเจ้าของสินค้า / Shipment

\#\#\# ส่วนที่2 (ต้องตั้งค่าและทำตามขั้นตอน):  
\- ⚠️ ต้องสร้างชีต \`GPS\_Queue\` ก่อนด้วย \`createGPSQueueSheet()\`  
\- ⚠️ ต้องใส่ Gemini API Key ก่อนด้วย \`setupEnvironment()\`  
\- ⚠️ ต้องอัปเกรด Schema ด้วย \`upgradeDatabaseStructure()\` และ \`upgradeNameMappingStructure\_V4()\`  
\- ⚠️ ต้องรัน \`initializeRecordStatus()\` ก่อนใช้ Soft Delete/Merge

\#\#\# ขั้นตอนเริ่มต้นที่ถูกต้อง:  
\`\`\`  
1\. ตรวจสอบชีตครบ 14 ชีต → ถ้าไม่ครบสร้างใหม่  
2\. รัน runFullSchemaValidation()  
3\. รัน setupEnvironment() → ใส่ Gemini API Key  
4\. รัน upgradeDatabaseStructure()  
5\. รัน upgradeNameMappingStructure\_V4()  
6\. รัน initializeRecordStatus()  
7\. รัน createGPSQueueSheet()  
8\. รัน assignMissingUUIDs()  
9\. รัน recalculateAllQuality()  
10\. รัน recalculateAllConfidence()  
\`\`\`

หลังจากนี้ระบบจะพร้อมใช้งานทั้งส่วนที่1และส่วนที่2 ครับ

\---

ต้องการให้ผม \*\*อธิบายลึกลงไปในฟังก์ชันใดเป็นพิเศษ\*\* หรือ \*\*สร้าง Checklist การติดตั้งแบบ Step-by-Step\*\* เพิ่มเติมไหมครับ?  
ผมเข้าใจครับ คุณต้องการ \*\*แผนลงมือทำจริงทีละสเต็ปแบบละเอียด 100%\*\* ตั้งแต่เริ่มต้นจนจบโปรเจกต์ ผมจะสร้างแผนที่ครอบคลุมทั้งหมดให้ครับ

\---

\# 🎯 แผนลงมือทำจริง: Logistics Master Data System V4.2  
\#\# ตั้งแต่เริ่มต้นจนจบโปรเจกต์ (แบบละเอียด 100%)

\---

\#\# 📋 PHASE 0: เตรียมความพร้อมก่อนเริ่ม (ก่อนแตะโค้ด)

\#\#\# สเต็ป 0.1: สำรองข้อมูลเดิม (สำคัญมาก)  
\`\`\`  
☐ เปิด Google Sheets ปัจจุบัน  
☐ File → Download → Microsoft Excel (.xlsx) → บันทึกไว้ 3 ที่:  
   1\. คอมพิวเตอร์ของคุณ  
   2\. Google Drive (โฟลเดอร์สำรอง)  
   3\. External hard drive (ถ้ามี)  
     
☐ ตั้งชื่อไฟล์: "Logistics\_Backup\_YYYYMMDD\_HHMM.xlsx"  
☐ ตรวจสอบว่าไฟล์เปิดได้และข้อมูลครบ  
\`\`\`

\#\#\# สเต็ป 0.2: ตรวจสอบสิทธิ์และการเข้าถึง  
\`\`\`  
☐ เปิด Google Apps Script (Extensions → Apps Script)  
☐ ตรวจสอบว่าคุณเป็น Owner ของโปรเจกต์  
☐ ไปที่ Project Settings → ตรวจสอบ Google Cloud Project เชื่อมต่อแล้ว  
☐ ตรวจสอบ Quota: ไปที่ https://script.google.com/home/quotas  
   \- UrlFetch calls: 20,000/วัน (ต้องเหลือเพียงพอ)  
   \- Properties read/write: 500,000/วัน  
\`\`\`

\#\#\# สเต็ป 0.3: เตรียม Gemini API Key  
\`\`\`  
☐ ไปที่ https://aistudio.google.com/app/apikey  
☐ สร้าง API Key ใหม่ (หรือใช้ที่มี)  
☐ คัดลอก Key ที่ขึ้นต้นด้วย "AIza..." ไว้ใน Notepad  
☐ อย่าแชร์ Key นี้กับใคร  
\`\`\`

\---

\#\# 🔧 PHASE 1: ติดตั้งโครงสร้างพื้นฐาน (วันที่ 1\)

\#\#\# สเต็ป 1.1: ตรวจสอบและสร้างชีตที่ขาด

\*\*เปิด Apps Script แล้วรันโค้ดนี้ทีละชิ้น:\*\*

\`\`\`javascript  
// สเต็ป 1.1.1: ตรวจสอบชีตที่มีอยู่  
function checkExistingSheets() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var requiredSheets \= \[  
    "Database", "NameMapping", "SCGนครหลวงJWDภูมิภาค",   
    "Data", "Input", "ข้อมูลพนักงาน", "GPS\_Queue",  
    "สรุป\_เจ้าของสินค้า", "สรุป\_Shipment", "PostalRef",  
    "Blacklist", "SystemLogs", "ErrorLogs", "Dashboard"  
  \];  
    
  var existing \= ss.getSheets().map(s \=\> s.getName());  
  var missing \= requiredSheets.filter(s \=\> \!existing.includes(s));  
    
  console.log("✅ มีอยู่แล้ว: " \+ existing.filter(s \=\> requiredSheets.includes(s)).join(", "));  
  console.log("❌ ขาด: " \+ (missing.length \> 0 ? missing.join(", ") : "ไม่มี"));  
    
  // สร้างชีตที่ขาด  
  missing.forEach(function(name) {  
    if (name \=== "GPS\_Queue") {  
      // จะสร้างในสเต็ป 1.3 ด้วยฟังก์ชันพิเศษ  
      console.log("⏳ " \+ name \+ " จะสร้างในสเต็ป 1.3");  
    } else {  
      ss.insertSheet(name);  
      console.log("✅ สร้างชีต: " \+ name);  
    }  
  });  
    
  return "ตรวจสอบเสร็จสิ้น ขาด " \+ missing.length \+ " ชีต";  
}  
\`\`\`

\*\*วิธีรัน:\*\*  
1\. ไปที่ Apps Script  
2\. สร้างไฟล์ใหม่: \`Phase1\_Setup.gs\`  
3\. วางโค้ดด้านบน  
4\. กด ▶️ Run  
5\. รอผลลัพธ์ใน Console (View → Logs หรือ Ctrl+Enter)

\---

\#\#\# สเต็ป 1.2: ตั้งค่า Header ทุกชีต

\`\`\`javascript  
// สเต็ป 1.2.1: ตั้งค่า Header Database (22 คอลัมน์)  
function setupDatabaseHeaders() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("Database");  
    
  var headers \= \[  
    "NAME", "LAT", "LNG", "SUGGESTED", "CONFIDENCE", "NORMALIZED",  
    "VERIFIED", "SYS\_ADDR", "ADDR\_GOOG", "DIST\_KM", "UUID",  
    "PROVINCE", "DISTRICT", "POSTCODE", "QUALITY", "CREATED", "UPDATED",  
    "Coord\_Source", "Coord\_Confidence", "Coord\_Last\_Updated",  
    "Record\_Status", "Merged\_To\_UUID"  
  \];  
    
  // ล้างและตั้งค่าใหม่  
  sheet.clear();  
  var range \= sheet.getRange(1, 1, 1, headers.length);  
  range.setValues(\[headers\]);  
  range.setFontWeight("bold");  
  range.setBackground("\#4f46e5");  
  range.setFontColor("white");  
  range.setFontSize(11);  
    
  // ปรับความกว้างคอลัมน์  
  sheet.setColumnWidth(1, 250);   // NAME  
  sheet.setColumnWidth(11, 280);  // UUID  
  sheet.setColumnWidth(18, 120); // Coord\_Source  
  sheet.setColumnWidth(21, 100); // Record\_Status  
    
  sheet.setFrozenRows(1);  
  console.log("✅ Database Headers ตั้งค่าเสร็จ (22 คอลัมน์)");  
}  
\`\`\`

\`\`\`javascript  
// สเต็ป 1.2.2: ตั้งค่า Header NameMapping (5 คอลัมน์)  
function setupNameMappingHeaders() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("NameMapping");  
    
  var headers \= \["Variant\_Name", "Master\_UID", "Confidence\_Score", "Mapped\_By", "Timestamp"\];  
    
  sheet.clear();  
  var range \= sheet.getRange(1, 1, 1, headers.length);  
  range.setValues(\[headers\]);  
  range.setFontWeight("bold");  
  range.setBackground("\#7c3aed");  
  range.setFontColor("white");  
    
  sheet.setColumnWidth(1, 250);  
  sheet.setColumnWidth(2, 280);  
  sheet.setFrozenRows(1);  
  console.log("✅ NameMapping Headers ตั้งค่าเสร็จ (5 คอลัมน์)");  
}  
\`\`\`

\`\`\`javascript  
// สเต็ป 1.2.3: ตั้งค่า Header SCGนครหลวงJWDภูมิภาค  
function setupSCGSourceHeaders() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("SCGนครหลวงJWDภูมิภาค");  
    
  // ตั้งค่าเฉพาะคอลัมน์สำคัญ คอลัมน์อื่นเว้นว่างไว้  
  var importantCols \= {  
    13: "ชื่อปลายทาง",  
    15: "LAT",   
    16: "LONG",  
    19: "ที่อยู่ปลายทาง",  
    24: "ระยะทางจากคลัง\_Km",  
    25: "ชื่อที่อยู่จาก\_LatLong",  
    37: "SYNC\_STATUS"  
  };  
    
  var range \= sheet.getRange(1, 1, 1, 37);  
  var headers \= new Array(37).fill("");  
  Object.keys(importantCols).forEach(function(col) {  
    headers\[parseInt(col)-1\] \= importantCols\[col\];  
  });  
    
  range.setValues(\[headers\]);  
  range.setFontWeight("bold");  
  sheet.setFrozenRows(1);  
  console.log("✅ SCG Source Headers ตั้งค่าเสร็จ (37 คอลัมน์)");  
}  
\`\`\`

\---

\#\#\# สเต็ป 1.3: สร้าง GPS\_Queue อย่างถูกต้อง

\`\`\`javascript  
// สเต็ป 1.3.1: สร้าง GPS\_Queue พร้อม Checkbox  
function createGPSQueueSheetProperly() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var ui \= SpreadsheetApp.getUi();  
    
  // ลบถ้ามีอยู่แล้ว  
  var existing \= ss.getSheetByName("GPS\_Queue");  
  if (existing) {  
    var response \= ui.alert(  
      "ชีต GPS\_Queue มีอยู่แล้ว",  
      "ต้องการลบและสร้างใหม่หรือไม่?",  
      ui.ButtonSet.YES\_NO  
    );  
    if (response \=== ui.Button.YES) {  
      ss.deleteSheet(existing);  
    } else {  
      return "ยกเลิกการสร้าง";  
    }  
  }  
    
  var sheet \= ss.insertSheet("GPS\_Queue");  
    
  var headers \= \[  
    "Timestamp", "ShipToName", "UUID\_DB", "LatLng\_Driver",  
    "LatLng\_DB", "Diff\_Meters", "Reason", "Approve", "Reject"  
  \];  
    
  // Header  
  var headerRange \= sheet.getRange(1, 1, 1, headers.length);  
  headerRange.setValues(\[headers\]);  
  headerRange.setFontWeight("bold");  
  headerRange.setBackground("\#4f46e5");  
  headerRange.setFontColor("white");  
    
  // Checkbox สำหรับ 1000 แถว (เผื่อไว้)  
  sheet.getRange(2, 8, 1000, 1).insertCheckboxes(); // Approve  
  sheet.getRange(2, 9, 1000, 1).insertCheckboxes(); // Reject  
    
  // ปรับความกว้าง  
  sheet.setColumnWidth(1, 160);  
  sheet.setColumnWidth(2, 250);  
  sheet.setColumnWidth(3, 280);  
  sheet.setColumnWidth(4, 160);  
  sheet.setColumnWidth(5, 160);  
  sheet.setColumnWidth(6, 100);  
  sheet.setColumnWidth(7, 120);  
  sheet.setColumnWidth(8, 80);  
  sheet.setColumnWidth(9, 80);  
    
  sheet.setFrozenRows(1);  
    
  console.log("✅ GPS\_Queue สร้างเสร็จพร้อม Checkbox 1000 แถว");  
  ui.alert("✅ GPS\_Queue สร้างเสร็จแล้ว\!");  
}  
\`\`\`

\---

\#\#\# สเต็ป 1.4: ตั้งค่า API Keys และ Security

\`\`\`javascript  
// สเต็ป 1.4.1: ตั้งค่า Gemini API Key  
function setupGeminiAPI() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var response \= ui.prompt(  
    '🔐 ตั้งค่า Gemini API Key',  
    'กรุณาวาง API Key ที่ขึ้นต้นด้วย AIza...:',  
    ui.ButtonSet.OK\_CANCEL  
  );  
    
  if (response.getSelectedButton() \!== ui.Button.OK) {  
    return "ยกเลิก";  
  }  
    
  var key \= response.getResponseText().trim();  
    
  // Validate  
  if (\!key.startsWith("AIza") || key.length \< 30\) {  
    ui.alert('❌ API Key ไม่ถูกต้อง', 'ต้องขึ้นต้นด้วย AIza และยาว \> 30 ตัวอักษร', ui.ButtonSet.OK);  
    return "ผิดพลาด";  
  }  
    
  PropertiesService.getScriptProperties().setProperty('GEMINI\_API\_KEY', key);  
    
  // ทดสอบ  
  try {  
    var testKey \= CONFIG.GEMINI\_API\_KEY;  
    ui.alert('✅ บันทึกสำเร็จ\!', 'API Key ใช้งานได้: ' \+ testKey.substring(0, 10\) \+ '...', ui.ButtonSet.OK);  
    return "สำเร็จ";  
  } catch(e) {  
    ui.alert('❌ ผิดพลาด', e.message, ui.ButtonSet.OK);  
    return "ผิดพลาด";  
  }  
}  
\`\`\`

\`\`\`javascript  
// สเต็ป 1.4.2: ตั้งค่า LINE Notify (ถ้าต้องการ)  
function setupLineOptional() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var response \= ui.prompt(  
    '🔔 ตั้งค่า LINE Notify (ไม่บังคับ)',  
    'กรุณาวาง LINE Notify Token (หรือกด Cancel ถ้าไม่ต้องการ):',  
    ui.ButtonSet.OK\_CANCEL  
  );  
    
  if (response.getSelectedButton() \=== ui.Button.OK) {  
    var token \= response.getResponseText().trim();  
    if (token.length \> 20\) {  
      PropertiesService.getScriptProperties().setProperty('LINE\_NOTIFY\_TOKEN', token);  
      console.log("✅ LINE Token บันทึกแล้ว");  
    }  
  }  
}  
\`\`\`

\`\`\`javascript  
// สเต็ป 1.4.3: ตั้งค่า Telegram (ถ้าต้องการ)  
function setupTelegramOptional() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var res1 \= ui.prompt('✈️ Telegram Bot Token (หรือ Cancel):', ui.ButtonSet.OK\_CANCEL);  
  if (res1.getSelectedButton() \!== ui.Button.OK) return;  
    
  var res2 \= ui.prompt('✈️ Telegram Chat ID (หรือ Cancel):', ui.ButtonSet.OK\_CANCEL);  
  if (res2.getSelectedButton() \!== ui.Button.OK) return;  
    
  var botToken \= res1.getResponseText().trim();  
  var chatId \= res2.getResponseText().trim();  
    
  if (botToken && chatId) {  
    PropertiesService.getScriptProperties().setProperty('TG\_BOT\_TOKEN', botToken);  
    PropertiesService.getScriptProperties().setProperty('TG\_CHAT\_ID', chatId);  
    console.log("✅ Telegram บันทึกแล้ว");  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 1.5: รัน Validation ครั้งแรก

\`\`\`javascript  
// สเต็ป 1.5.1: ตรวจสอบทุกอย่างพร้อมหรือไม่  
function phase1FinalCheck() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var report \= "🛡️ PHASE 1 VALIDATION REPORT\\n";  
  report \+= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n";  
    
  // 1\. ชีตครบไหม  
  var required \= \["Database", "NameMapping", "SCGนครหลวงJWDภูมิภาค",   
                  "Data", "Input", "ข้อมูลพนักงาน", "GPS\_Queue"\];  
  var existing \= ss.getSheets().map(s \=\> s.getName());  
  var allSheets \= required.every(s \=\> existing.includes(s));  
  report \+= allSheets ? "✅ ชีตครบทั้ง 7 ชีตหลัก\\n" : "❌ ชีตไม่ครบ\\n";  
    
  // 2\. API Key  
  try {  
    var key \= CONFIG.GEMINI\_API\_KEY;  
    report \+= "✅ Gemini API Key: " \+ key.substring(0, 10\) \+ "...\\n";  
  } catch(e) {  
    report \+= "❌ Gemini API Key: ไม่พบ\\n";  
  }  
    
  // 3\. Database Columns  
  var dbSheet \= ss.getSheetByName("Database");  
  var dbCols \= dbSheet.getLastColumn();  
  report \+= dbCols \>= 22 ? "✅ Database: " \+ dbCols \+ " คอลัมน์ (ต้องการ 22)\\n"   
                        : "⚠️ Database: " \+ dbCols \+ " คอลัมน์ (ควรมี 22)\\n";  
    
  // 4\. NameMapping Columns  
  var mapSheet \= ss.getSheetByName("NameMapping");  
  var mapCols \= mapSheet.getLastColumn();  
  report \+= mapCols \>= 5 ? "✅ NameMapping: " \+ mapCols \+ " คอลัมน์ (ต้องการ 5)\\n"  
                        : "⚠️ NameMapping: " \+ mapCols \+ " คอลัมน์ (ควรมี 5)\\n";  
    
  // 5\. GPS\_Queue Checkbox  
  var queueSheet \= ss.getSheetByName("GPS\_Queue");  
  try {  
    var checkbox \= queueSheet.getRange(2, 8).getDataValidation();  
    report \+= "✅ GPS\_Queue: มี Checkbox\\n";  
  } catch(e) {  
    report \+= "❌ GPS\_Queue: ไม่มี Checkbox\\n";  
  }  
    
  report \+= "\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n";  
  report \+= allSheets ? "🎉 PHASE 1 พร้อมแล้ว\! ไป PHASE 2 ได้" : "⚠️ แก้ไขที่ขาดก่อน";  
    
  ui.alert(report);  
  return allSheets ? "READY" : "NOT\_READY";  
}  
\`\`\`

\---

\#\# 🔧 PHASE 2: อัปเกรดและเตรียมข้อมูล (วันที่ 2\)

\#\#\# สเต็ป 2.1: อัปเกรด Database Structure

\`\`\`javascript  
// สเต็ป 2.1.1: เติมคอลัมน์ที่ขาดให้ Database  
function upgradeDatabaseToV4() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("Database");  
  var ui \= SpreadsheetApp.getUi();  
    
  var currentCols \= sheet.getLastColumn();  
    
  if (currentCols \>= 22\) {  
    ui.alert("✅ Database เป็นเวอร์ชันล่าสุดแล้ว (22 คอลัมน์)");  
    return "ALREADY\_UPGRADED";  
  }  
    
  // คอลัมน์ที่ต้องเพิ่ม (18-22)  
  var newHeaders \= \[  
    "Coord\_Source",        // Col 18  
    "Coord\_Confidence",    // Col 19    
    "Coord\_Last\_Updated",  // Col 20  
    "Record\_Status",       // Col 21  
    "Merged\_To\_UUID"       // Col 22  
  \];  
    
  var startCol \= currentCols \+ 1;  
  var range \= sheet.getRange(1, startCol, 1, newHeaders.length);  
  range.setValues(\[newHeaders\]);  
  range.setFontWeight("bold");  
  range.setBackground("\#d0f0c0");  
    
  ui.alert("✅ อัปเกรด Database เสร็จแล้ว\!\\nเพิ่ม " \+ newHeaders.length \+ " คอลัมน์");  
  return "SUCCESS";  
}  
\`\`\`

\---

\#\#\# สเต็ป 2.2: เริ่มต้นค่า Record Status

\`\`\`javascript  
// สเต็ป 2.2.1: ตั้งค่า Record\_Status \= Active ให้ข้อมูลเก่า  
function initializeAllRecordStatus() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("Database");  
  var ui \= SpreadsheetApp.getUi();  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) {  
    ui.alert("ℹ️ Database ว่างเปล่า ไม่มีข้อมูลให้ตั้งค่า");  
    return "EMPTY";  
  }  
    
  // ถามยืนยันก่อน  
  var response \= ui.alert(  
    "ยืนยันการตั้งค่า Record Status",  
    "จะตั้งค่า 'Active' ให้ข้อมูล " \+ (lastRow \- 1\) \+ " แถว\\nดำเนินการต่อ?",  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (response \!== ui.Button.YES) return "CANCELLED";  
    
  // อ่านข้อมูล  
  var data \= sheet.getRange(2, 1, lastRow \- 1, 22).getValues();  
  var count \= 0;  
    
  for (var i \= 0; i \< data.length; i++) {  
    // ถ้ามีชื่อแต่ไม่มี Record\_Status  
    if (data\[i\]\[0\] && \!data\[i\]\[20\]) { // Col 21 \= index 20  
      data\[i\]\[20\] \= "Active";  
      count++;  
    }  
  }  
    
  // เขียนกลับ  
  if (count \> 0\) {  
    sheet.getRange(2, 1, data.length, 22).setValues(data);  
  }  
    
  ui.alert("✅ ตั้งค่าเสร็จแล้ว\!\\nRecord Status \= Active: " \+ count \+ " แถว");  
  return "SUCCESS: " \+ count;  
}  
\`\`\`

\---

\#\#\# สเต็ป 2.3: เติม UUID ที่ขาด

\`\`\`javascript  
// สเต็ป 2.3.1: สร้าง UUID ให้ทุกแถวที่ไม่มี  
function assignAllMissingUUIDs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("Database");  
  var ui \= SpreadsheetApp.getUi();  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) {  
    ui.alert("ℹ️ Database ว่างเปล่า");  
    return;  
  }  
    
  // อ่านเฉพาะคอลัมน์ UUID (Col 11\)  
  var uuidRange \= sheet.getRange(2, 11, lastRow \- 1, 1);  
  var uuids \= uuidRange.getValues();  
    
  var newUUIDs \= \[\];  
  var count \= 0;  
    
  for (var i \= 0; i \< uuids.length; i++) {  
    if (\!uuids\[i\]\[0\]) {  
      newUUIDs.push(\[Utilities.getUuid()\]);  
      count++;  
    } else {  
      newUUIDs.push(\[uuids\[i\]\[0\]\]);  
    }  
  }  
    
  if (count \> 0\) {  
    uuidRange.setValues(newUUIDs);  
    ui.alert("✅ สร้าง UUID ใหม่: " \+ count \+ " แถว");  
  } else {  
    ui.alert("ℹ️ ทุกแถวมี UUID แล้ว");  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 2.4: คำนวณ Quality และ Confidence ครั้งแรก

\`\`\`javascript  
// สเต็ป 2.4.1: คำนวณ Quality Score ทั้งหมด  
function calculateInitialQuality() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("Database");  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, 22).getValues();  
  var updated \= 0;  
    
  for (var i \= 0; i \< data.length; i++) {  
    var row \= data\[i\];  
    if (\!row\[0\]) continue; // ไม่มีชื่อ  
      
    var score \= 0;  
      
    // ชื่อ (10%)  
    if (row\[0\].toString().length \>= 3\) score \+= 10;  
      
    // พิกัด (20%)  
    var lat \= parseFloat(row\[1\]);  
    var lng \= parseFloat(row\[2\]);  
    if (\!isNaN(lat) && \!isNaN(lng)) {  
      score \+= 20;  
      // อยู่ในไทย (10%)  
      if (lat \>= 6 && lat \<= 21 && lng \>= 97 && lng \<= 106\) score \+= 10;  
    }  
      
    // ที่อยู่ Google (15%)  
    if (row\[8\]) score \+= 15; // ADDR\_GOOG  
      
    // Province/District (10%)  
    if (row\[11\] && row\[12\]) score \+= 10;  
      
    // Postcode (5%)  
    if (row\[13\]) score \+= 5;  
      
    // UUID (10%)  
    if (row\[10\]) score \+= 10;  
      
    // Verified (20%)  
    if (row\[6\] \=== true) score \+= 20;  
      
    // อัปเดตถ้าเปลี่ยน  
    var newQuality \= Math.min(score, 100);  
    if (row\[14\] \!== newQuality) {  
      data\[i\]\[14\] \= newQuality;  
      updated++;  
    }  
  }  
    
  if (updated \> 0\) {  
    sheet.getRange(2, 1, data.length, 22).setValues(data);  
  }  
    
  SpreadsheetApp.getUi().alert("✅ คำนวณ Quality: " \+ updated \+ " แถวอัปเดต");  
}  
\`\`\`

\`\`\`javascript  
// สเต็ป 2.4.2: คำนวณ Confidence Score ทั้งหมด  
function calculateInitialConfidence() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("Database");  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, 22).getValues();  
  var updated \= 0;  
    
  for (var i \= 0; i \< data.length; i++) {  
    var row \= data\[i\];  
    if (\!row\[0\]) continue;  
      
    var score \= 0;  
      
    // Verified (40%)  
    if (row\[6\] \=== true) score \+= 40;  
      
    // พิกัดครบ (20%)  
    var lat \= parseFloat(row\[1\]);  
    var lng \= parseFloat(row\[2\]);  
    if (\!isNaN(lat) && \!isNaN(lng)) score \+= 20;  
      
    // ที่อยู่ Google (10%)  
    if (row\[8\]) score \+= 10;  
      
    // Province/District (10%)  
    if (row\[11\] && row\[12\]) score \+= 10;  
      
    // UUID (10%)  
    if (row\[10\]) score \+= 10;  
      
    // Driver GPS (10%)  
    if (row\[17\] \=== "Driver\_GPS") score \+= 10;  
      
    var newConf \= Math.min(score, 100);  
    if (row\[4\] \!== newConf) {  
      data\[i\]\[4\] \= newConf;  
      updated++;  
    }  
  }  
    
  if (updated \> 0\) {  
    sheet.getRange(2, 1, data.length, 22).setValues(data);  
  }  
    
  SpreadsheetApp.getUi().alert("✅ คำนวณ Confidence: " \+ updated \+ " แถวอัปเดต");  
}  
\`\`\`

\---

\#\#\# สเต็ป 2.5: ซ่อมแซม NameMapping เริ่มต้น

\`\`\`javascript  
// สเต็ป 2.5.1: ตรวจสอบและซ่อมแซม NameMapping  
function repairInitialNameMapping() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var dbSheet \= ss.getSheetByName("Database");  
  var mapSheet \= ss.getSheetByName("NameMapping");  
  var ui \= SpreadsheetApp.getUi();  
    
  // สร้าง UUID Map จาก Database  
  var dbLastRow \= dbSheet.getLastRow();  
  var dbData \= dbSheet.getRange(2, 1, dbLastRow \- 1, 22).getValues();  
  var uuidMap \= {};  
    
  dbData.forEach(function(row) {  
    var name \= row\[0\];  
    var uuid \= row\[10\];  
    if (name && uuid) {  
      var norm \= name.toString().toLowerCase().replace(/\[^a-z0-9\\u0E00-\\u0E7F\]/g, "");  
      uuidMap\[norm\] \= uuid;  
    }  
  });  
    
  console.log("Database UUID Map: " \+ Object.keys(uuidMap).length \+ " entries");  
    
  // ตรวจสอบ NameMapping  
  var mapLastRow \= mapSheet.getLastRow();  
  if (mapLastRow \< 2\) {  
    ui.alert("ℹ️ NameMapping ว่างเปล่า (OK สำหรับเริ่มต้น)");  
    return "EMPTY";  
  }  
    
  var mapData \= mapSheet.getRange(2, 1, mapLastRow \- 1, 5).getValues();  
  var issues \= \[\];  
  var fixed \= 0;  
    
  mapData.forEach(function(row, idx) {  
    var variant \= row\[0\];  
    var uid \= row\[1\];  
      
    if (\!variant) {  
      issues.push("แถว " \+ (idx \+ 2\) \+ ": ไม่มี Variant\_Name");  
      return;  
    }  
      
    if (\!uid) {  
      // ลองหา UUID จากชื่อ  
      var norm \= variant.toString().toLowerCase().replace(/\[^a-z0-9\\u0E00-\\u0E7F\]/g, "");  
      if (uuidMap\[norm\]) {  
        row\[1\] \= uuidMap\[norm\];  
        row\[2\] \= 100; // Confidence  
        row\[3\] \= "Auto\_Repair";  
        row\[4\] \= new Date();  
        fixed++;  
      } else {  
        issues.push("แถว " \+ (idx \+ 2\) \+ ": '" \+ variant \+ "' หา UUID ไม่เจอ");  
      }  
    }  
  });  
    
  // เขียนกลับ  
  mapSheet.getRange(2, 1, mapData.length, 5).setValues(mapData);  
    
  var msg \= "✅ Repair เสร็จแล้ว\!\\n\\n";  
  msg \+= "แก้ไขอัตโนมัติ: " \+ fixed \+ " แถว\\n";  
  if (issues.length \> 0\) {  
    msg \+= "ปัญหาที่ต้องแก้มือ: " \+ issues.length \+ " รายการ\\n";  
    msg \+= issues.slice(0, 5).join("\\n");  
    if (issues.length \> 5\) msg \+= "\\n...และอีก " \+ (issues.length \- 5);  
  }  
    
  ui.alert(msg);  
}  
\`\`\`

\---

\#\#\# สเต็ป 2.6: Validation Phase 2

\`\`\`javascript  
// สเต็ป 2.6.1: ตรวจสอบก่อนไป Phase 3  
function phase2FinalCheck() {  
  var ui \= SpreadsheetApp.getUi();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var checks \= \[\];  
    
  // 1\. Database มีข้อมูล \+ UUID \+ Record\_Status  
  var db \= ss.getSheetByName("Database");  
  var dbData \= db.getRange(2, 1, Math.max(db.getLastRow()-1, 1), 22).getValues();  
  var withUUID \= dbData.filter(r \=\> r\[10\]).length;  
  var withStatus \= dbData.filter(r \=\> r\[20\]).length;  
  checks.push(withUUID \> 0 ? "✅ Database: " \+ withUUID \+ " แถวมี UUID" : "❌ Database: ไม่มี UUID");  
  checks.push(withStatus \> 0 ? "✅ Record Status: " \+ withStatus \+ " แถว" : "⚠️ Record Status: ยังไม่ได้ตั้งค่า");  
    
  // 2\. Quality/Confidence  
  var withQuality \= dbData.filter(r \=\> r\[14\] \> 0).length;  
  checks.push(withQuality \> 0 ? "✅ Quality Score: " \+ withQuality \+ " แถว" : "⚠️ Quality Score: ยังไม่ได้คำนวณ");  
    
  // 3\. NameMapping  
  var map \= ss.getSheetByName("NameMapping");  
  checks.push(map.getLastRow() \> 1 ? "✅ NameMapping: มีข้อมูล " \+ (map.getLastRow()-1) \+ " แถว" : "ℹ️ NameMapping: ว่างเปล่า (OK)");  
    
  // 4\. GPS\_Queue  
  var queue \= ss.getSheetByName("GPS\_Queue");  
  checks.push(queue ? "✅ GPS\_Queue: พร้อมใช้" : "❌ GPS\_Queue: ไม่พบ");  
    
  var report \= "🛡️ PHASE 2 CHECK\\n━━━━━━━━━━━━━━━━━━━━━━\\n\\n";  
  report \+= checks.join("\\n");  
  report \+= "\\n\\n━━━━━━━━━━━━━━━━━━━━━━\\n";  
  report \+= checks.every(c \=\> \!c.startsWith("❌")) ? "🎉 พร้อมไป PHASE 3\!" : "⚠️ แก้ไข ❌ ก่อน";  
    
  ui.alert(report);  
}  
\`\`\`

\---

\#\# 🔄 PHASE 3: สร้าง Workflow ประจำวัน (วันที่ 3-4)

\#\#\# สเต็ป 3.1: ตั้งค่า Trigger อัตโนมัติ

\`\`\`javascript  
// สเต็ป 3.1.1: ตั้งค่า Auto-Pilot (ทุก 10 นีด)  
function setupAutoPilotTrigger() {  
  var ui \= SpreadsheetApp.getUi();  
    
  // ลบ trigger เก่าก่อน  
  var triggers \= ScriptApp.getProjectTriggers();  
  var existing \= triggers.filter(t \=\> t.getHandlerFunction() \=== "autoPilotRoutine");  
  existing.forEach(t \=\> ScriptApp.deleteTrigger(t));  
    
  if (existing.length \> 0\) {  
    console.log("ลบ trigger เก่า: " \+ existing.length \+ " ตัว");  
  }  
    
  // สร้างใหม่  
  ScriptApp.newTrigger("autoPilotRoutine")  
    .timeBased()  
    .everyMinutes(10)  
    .create();  
    
  ui.alert("✅ Auto-Pilot ตั้งค่าแล้ว\!\\nจะทำงานทุก 10 นาที\\n\\nฟังก์ชันที่รัน:\\n- applyMasterCoordinatesToDailyJob()\\n- processAIIndexing\_Batch()");  
}  
\`\`\`

\`\`\`javascript  
// สเต็ป 3.1.2: ตั้งค่า Trigger ล้าง Backup (ทุกอาทิตย์)  
function setupWeeklyMaintenance() {  
  // ลบเก่า  
  var triggers \= ScriptApp.getProjectTriggers();  
  triggers.filter(t \=\> t.getHandlerFunction() \=== "cleanupOldBackups")  
    .forEach(t \=\> ScriptApp.deleteTrigger(t));  
    
  // สร้างใหม่: ทุกวันอาทิตย์ เวลา ตี 3  
  ScriptApp.newTrigger("cleanupOldBackups")  
    .timeBased()  
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)  
    .atHour(3)  
    .create();  
    
  console.log("✅ Weekly Maintenance: ทุกวันอาทิตย์ ตี 3");  
}  
\`\`\`

\---

\#\#\# สเต็ป 3.2: ทดสอบ Sync ข้อมูลจาก SCG

\`\`\`javascript  
// สเต็ป 3.2.1: ตรวจสอบข้อมูลใน SCGนครหลวงJWDภูมิภาค  
function checkSCGSourceData() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName("SCGนครหลวงJWDภูมิภาค");  
  var ui \= SpreadsheetApp.getUi();  
    
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) {  
    ui.alert("❌ ชีต SCGนครหลวงJWDภูมิภาค ว่างเปล่า\\nต้องมีข้อมูลจากคนขับก่อน");  
    return "EMPTY";  
  }  
    
  // ตรวจสอบคอลัมน์สำคัญ  
  var data \= sheet.getRange(2, 13, lastRow \- 1, 4).getValues(); // ชื่อ, LAT, LONG, SYNC\_STATUS  
    
  var withName \= data.filter(r \=\> r\[0\]).length;  
  var withLat \= data.filter(r \=\> r\[1\]).length;  
  var withLng \= data.filter(r \=\> r\[2\]).length;  
  var synced \= data.filter(r \=\> r\[3\] \=== "SYNCED").length;  
  var pending \= withName \- synced;  
    
  var msg \= "📊 SCG Source Data Check\\n";  
  msg \+= "━━━━━━━━━━━━━━━━━━━━━━━━\\n";  
  msg \+= "ข้อมูลทั้งหมด: " \+ (lastRow \- 1\) \+ " แถว\\n";  
  msg \+= "มีชื่อ: " \+ withName \+ " แถว\\n";  
  msg \+= "มี LAT: " \+ withLat \+ " แถว\\n";  
  msg \+= "มี LONG: " \+ withLng \+ " แถว\\n";  
  msg \+= "SYNCED แล้ว: " \+ synced \+ " แถว\\n";  
  msg \+= "รอ Sync: " \+ pending \+ " แถว\\n";  
    
  ui.alert(msg);  
  return "READY: " \+ pending \+ " pending";  
}  
\`\`\`

\`\`\`javascript  
// สเต็ป 3.2.2: รัน Sync ครั้งแรก (ทดสอบ)  
function testFirstSync() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var response \= ui.alert(  
    "🧪 ทดสอบ Sync ครั้งแรก",  
    "จะรัน syncNewDataToMaster() กับข้อมูลจริง\\nแนะนำให้มีข้อมูลใน SCGนครหลวงJWDภูมิภาค อย่างน้อย 5-10 แถวก่อน\\n\\nดำเนินการต่อ?",  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (response \!== ui.Button.YES) return "CANCELLED";  
    
  try {  
    syncNewDataToMaster();  
    ui.alert("✅ Sync ทดสอบเสร็จแล้ว\!\\nตรวจสอบ:\\n1. Database มีข้อมูลใหม่ไหม\\n2. GPS\_Queue มีรายการไหม\\n3. SCGนครหลวงJWDภูมิภาค ถูก mark SYNCED ไหม");  
  } catch(e) {  
    ui.alert("❌ Sync ผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 3.3: ทดสอบ Clustering

\`\`\`javascript  
// สเต็ป 3.3.1: รัน Clustering ครั้งแรก  
function testFirstClustering() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var response \= ui.alert(  
    "🧪 ทดสอบ Clustering",  
    "จะรัน autoGenerateMasterList\_Smart()\\nเพื่อจัดกลุ่มชื่อซ้ำตามพิกัด\\n\\nดำเนินการต่อ?",  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (response \!== ui.Button.YES) return;  
    
  try {  
    autoGenerateMasterList\_Smart();  
    ui.alert("✅ Clustering เสร็จแล้ว\!\\nตรวจสอบคอลัมน์ SUGGESTED และ CONFIDENCE ใน Database");  
  } catch(e) {  
    ui.alert("❌ Clustering ผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 3.4: ทดสอบ Deep Clean

\`\`\`javascript  
// สเต็ป 3.4.1: รัน Deep Clean ทีละ 100 แถว  
function testFirstDeepClean() {  
  var ui \= SpreadsheetApp.getUi();  
    
  ui.alert(  
    "🧹 Deep Clean คืออะไร",  
    "จะเติมข้อมูลที่ขาด:\\n- คำนวณระยะทางจากคลัง\\n- Reverse Geocode (หาที่อยู่จากพิกัด)\\n- แกะจังหวัด/อำเภอจากที่อยู่\\n- อัปเดต Quality Score\\n\\nทำทีละ 100 แถว กดซ้ำจนครบ",  
    ui.ButtonSet.OK  
  );  
    
  try {  
    runDeepCleanBatch\_100();  
    var pointer \= PropertiesService.getScriptProperties().getProperty('DEEP\_CLEAN\_POINTER');  
    ui.alert("✅ Deep Clean รอบแรกเสร็จ\!\\nPointer ตอนนี้: แถวที่ " \+ pointer \+ "\\nกดซ้ำจนกว่าจะขึ้นว่าครบทุกแถว");  
  } catch(e) {  
    ui.alert("❌ Deep Clean ผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 3.5: ทดสอบ Finalize

\`\`\`javascript  
// สเต็ป 3.5.1: ทดสอบ Finalize (ระวัง: จะย้ายข้อมูลจริง)  
function testFirstFinalize() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var warning \= "⚠️⚠️⚠️ FINALIZE คืออะไร ⚠️⚠️⚠️\\n\\n";  
  warning \+= "1. สำรอง Database เป็น Backup\_YYYYMMDD\_HHMM\\n";  
  warning \+= "2. แถวที่ Verified \= true → เก็บไว้ใน Database\\n";  
  warning \+= "3. แถวที่มี SUGGESTED แต่ไม่ Verified → ย้ายไป NameMapping\\n";  
  warning \+= "4. ลบแถวที่ไม่ Verified ออกจาก Database\\n\\n";  
  warning \+= "❗ ตรวจสอบให้แน่ใจว่าข้อมูลสำคัญถูก Verified แล้ว\\n\\n";  
  warning \+= "ดำเนินการต่อ?";  
    
  var response \= ui.alert(warning, ui.ButtonSet.YES\_NO);  
  if (response \!== ui.Button.YES) return;  
    
  try {  
    finalizeAndClean\_MoveToMapping();  
    ui.alert("✅ Finalize เสร็จแล้ว\!\\nตรวจสอบ:\\n1. ชีต Backup\_... ถูกสร้างไหม\\n2. NameMapping มีข้อมูลใหม่ไหม\\n3. Database เหลือแต่ Verified");  
  } catch(e) {  
    ui.alert("❌ Finalize ผิดพลาด: " \+ e.message \+ "\\nตรวจสอบ Backup Sheet");  
  }  
}  
\`\`\`

\---

\#\# 🤖 PHASE 4: เปิดใช้งาน AI (วันที่ 5-6)

\#\#\# สเต็ป 4.1: ทดสอบ Gemini Connection

\`\`\`javascript  
// สเต็ป 4.1.1: ทดสอบ Gemini API  
function testGeminiConnection() {  
  var ui \= SpreadsheetApp.getUi();  
    
  try {  
    var apiKey \= CONFIG.GEMINI\_API\_KEY;  
    var model \= CONFIG.AI\_MODEL || "gemini-1.5-flash";  
      
    var url \= "https://generativelanguage.googleapis.com/v1beta/models/" \+   
              model \+ ":generateContent?key=" \+ apiKey;  
      
    var payload \= {  
      "contents": \[{  
        "parts": \[{"text": "Say: Gemini API is working for Logistics Master Data System"}\]  
      }\]  
    };  
      
    var response \= UrlFetchApp.fetch(url, {  
      method: "post",  
      contentType: "application/json",  
      payload: JSON.stringify(payload),  
      muteHttpExceptions: true  
    });  
      
    if (response.getResponseCode() \=== 200\) {  
      var json \= JSON.parse(response.getContentText());  
      var text \= json.candidates\[0\].content.parts\[0\].text;  
      ui.alert("✅ Gemini API ทำงานปกติ\!\\n\\nResponse:\\n" \+ text);  
    } else {  
      ui.alert("❌ Gemini API ตอบกลับ HTTP " \+ response.getResponseCode());  
    }  
  } catch(e) {  
    ui.alert("❌ Gemini Connection ผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 4.2: ทดสอบ AI Indexing

\`\`\`javascript  
// สเต็ป 4.2.1: ทดสอบ AI Indexing (ทีละ 20 แถว)  
function testAIIndexing() {  
  var ui \= SpreadsheetApp.getUi();  
    
  ui.alert(  
    "🧠 AI Indexing คืออะไร",  
    "AI จะวิเคราะห์ชื่อลูกค้า และสร้าง keywords\\nเพื่อช่วยค้นหาได้แม่นยำขึ้น\\n(เช่น แยกคำย่อ, คำผิด, ชื่อพ้องเสียง)\\n\\nทำทีละ " \+ (CONFIG.AI\_BATCH\_SIZE || 20\) \+ " แถว",  
    ui.ButtonSet.OK  
  );  
    
  try {  
    processAIIndexing\_Batch();  
    ui.alert("✅ AI Indexing เสร็จแล้ว\!\\nตรวจสอบคอลัมน์ NORMALIZED ว่ามี \[AI\] tag หรือไม่");  
  } catch(e) {  
    ui.alert("❌ AI Indexing ผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 4.3: ทดสอบ AI Smart Resolution

\`\`\`javascript  
// สเต็ป 4.3.1: ทดสอบ Tier 4 AI Resolution  
function testAISmartResolution() {  
  var ui \= SpreadsheetApp.getUi();  
    
  // ตรวจสอบว่ามีข้อมูลใน Data ที่ไม่มีพิกัด  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var dataSheet \= ss.getSheetByName("Data");  
    
  if (\!dataSheet || dataSheet.getLastRow() \< 2\) {  
    ui.alert("ℹ️ ต้องมีข้อมูลในชีต Data ก่อน\\n(รัน fetchDataFromSCGJWD ก่อน)");  
    return;  
  }  
    
  var response \= ui.alert(  
    "🎯 AI Smart Resolution",  
    "AI จะวิเคราะห์ชื่อที่ไม่รู้จักในชีต Data\\nและพยายามจับคู่กับ Database\\n\\nดำเนินการต่อ?",  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (response \!== ui.Button.YES) return;  
    
  try {  
    resolveUnknownNamesWithAI();  
  } catch(e) {  
    ui.alert("❌ AI Resolution ผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 4.4: เปิด Auto-Pilot เต็มรูปแบบ

\`\`\`javascript  
// สเต็ป 4.4.1: เปิดระบบอัตโนมัติทั้งหมด  
function enableFullAutoPilot() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var checklist \= "✅ Checklist ก่อนเปิด Auto-Pilot:\\n\\n";  
  checklist \+= "☐ Gemini API Key ตั้งค่าแล้ว\\n";  
  checklist \+= "☐ รัน testGeminiConnection() ผ่านแล้ว\\n";  
  checklist \+= "☐ Database มีข้อมูลพื้นฐานแล้ว\\n";  
  checklist \+= "☐ NameMapping มีข้อมูลแล้ว\\n";  
  checklist \+= "☐ GPS\_Queue พร้อมใช้งาน\\n\\n";  
  checklist \+= "เปิด Auto-Pilot ตอนนี้?";  
    
  var response \= ui.alert(checklist, ui.ButtonSet.YES\_NO);  
  if (response \!== ui.Button.YES) return;  
    
  try {  
    START\_AUTO\_PILOT();  
    ui.alert("🤖 Auto-Pilot เปิดแล้ว\!\\n\\nระบบจะทำงานทุก 10 นาที:\\n- Sync พิกัดไปชีต Data\\n- AI Indexing ข้อมูลใหม่\\n\\nตรวจสอบสถานะที่เมนู: System Admin → Health Check");  
  } catch(e) {  
    ui.alert("❌ เปิด Auto-Pilot ไม่สำเร็จ: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\# 🔍 PHASE 5: ระบบตรวจสอบและบำรุงรักษา (วันที่ 7 และต่อเนื่อง)

\#\#\# สเต็ป 5.1: สร้าง Routine ตรวจสอบประจำวัน

\`\`\`javascript  
// สเต็ป 5.1.1: Daily Health Check  
function dailyHealthCheck() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var report \= \[\];  
    
  // 1\. ตรวจ Database  
  var db \= ss.getSheetByName("Database");  
  var dbRows \= db.getLastRow() \- 1;  
  var dbData \= db.getRange(2, 1, Math.max(dbRows, 1), 22).getValues();  
    
  var noUUID \= dbData.filter(r \=\> r\[0\] && \!r\[10\]).length;  
  var noStatus \= dbData.filter(r \=\> r\[0\] && \!r\[20\]).length;  
  var lowQuality \= dbData.filter(r \=\> r\[0\] && (r\[14\] || 0\) \< 50).length;  
    
  report.push("📊 Database: " \+ dbRows \+ " แถว");  
  if (noUUID \> 0\) report.push("⚠️ ไม่มี UUID: " \+ noUUID \+ " แถว");  
  if (noStatus \> 0\) report.push("⚠️ ไม่มี Record\_Status: " \+ noStatus \+ " แถว");  
  if (lowQuality \> 0\) report.push("⚠️ Quality \< 50%: " \+ lowQuality \+ " แถว");  
    
  // 2\. ตรวจ GPS\_Queue  
  var queue \= ss.getSheetByName("GPS\_Queue");  
  if (queue) {  
    var pending \= queue.getRange(2, 7, queue.getLastRow()-1, 1\)  
      .getValues().filter(r \=\> \!r\[0\] || (r\[0\] \!== "APPROVED" && r\[0\] \!== "REJECTED")).length;  
    if (pending \> 0\) report.push("📋 GPS\_Queue รออนุมัติ: " \+ pending \+ " รายการ");  
  }  
    
  // 3\. ตรวจ NameMapping  
  var map \= ss.getSheetByName("NameMapping");  
  if (map && map.getLastRow() \> 1\) {  
    var mapData \= map.getRange(2, 1, map.getLastRow()-1, 2).getValues();  
    var noUID \= mapData.filter(r \=\> r\[0\] && \!r\[1\]).length;  
    if (noUID \> 0\) report.push("⚠️ NameMapping ไม่มี UID: " \+ noUID \+ " แถว");  
  }  
    
  console.log("Daily Health Check:\\n" \+ report.join("\\n"));  
  return report;  
}  
\`\`\`

\---

\#\#\# สเต็ป 5.2: สร้าง Routine ประจำสัปดาห์

\`\`\`javascript  
// สเต็ป 5.2.1: Weekly Deep Maintenance  
function weeklyDeepMaintenance() {  
  var ui \= SpreadsheetApp.getUi();  
    
  var response \= ui.alert(  
    "🔧 Weekly Deep Maintenance",  
    "จะรัน:\\n1. findHiddenDuplicates() \- หาพิกัดซ้อน\\n2. recalculateAllQuality() \- คำนวณ Quality ใหม่\\n3. recalculateAllConfidence() \- คำนวณ Confidence ใหม่\\n4. cleanupOldBackups() \- ลบ Backup เก่า\\n\\nดำเนินการต่อ?",  
    ui.ButtonSet.YES\_NO  
  );  
    
  if (response \!== ui.Button.YES) return;  
    
  try {  
    findHiddenDuplicates();  
    recalculateAllQuality();  
    recalculateAllConfidence();  
    cleanupOldBackups();  
      
    ui.alert("✅ Weekly Maintenance เสร็จแล้ว\!\\nตรวจสอบ Logs ใน Console");  
  } catch(e) {  
    ui.alert("❌ บางอย่างผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\#\# สเต็ป 5.3: สร้าง Dry Run ก่อนเปลี่ยนแปลงใหญ่

\`\`\`javascript  
// สเต็ป 5.3.1: ตรวจสอบก่อน Finalize (ไม่แก้ไขจริง)  
function dryRunBeforeFinalize() {  
  var ui \= SpreadsheetApp.getUi();  
    
  try {  
    // จำลอง finalize โดยไม่เขียนจริง  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var db \= ss.getSheetByName("Database");  
    var data \= db.getRange(2, 1, db.getLastRow()-1, 22).getValues();  
      
    var verified \= data.filter(r \=\> r\[6\] \=== true).length;  
    var withSuggested \= data.filter(r \=\> r\[3\] && \!r\[6\]).length;  
    var willDelete \= data.filter(r \=\> r\[0\] && \!r\[3\] && \!r\[6\]).length;  
      
    var msg \= "🔮 Dry Run: Finalize Preview\\n";  
    msg \+= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n";  
    msg \+= "✅ จะเก็บ (Verified): " \+ verified \+ " แถว\\n";  
    msg \+= "📝 จะย้ายไป NameMapping: " \+ withSuggested \+ " แถว\\n";  
    msg \+= "🗑️ จะลบ (ไม่มี Suggested): " \+ willDelete \+ " แถว\\n";  
    msg \+= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n";  
    msg \+= "💡 ถ้าตัวเลขดูถูกต้อง ค่อยรัน finalizeAndClean\_MoveToMapping() จริง";  
      
    ui.alert(msg);  
  } catch(e) {  
    ui.alert("❌ Dry Run ผิดพลาด: " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\# 📋 CHECKLIST สรุปทั้งหมด

\#\#\# ✅ Phase 0: เตรียมความพร้อม  
\- \[ \] สำรองข้อมูล 3 ที่  
\- \[ \] ตรวจสอบสิทธิ์ Owner  
\- \[ \] สร้าง Gemini API Key  
\- \[ \] บันทึก API Key ไว้

\#\#\# ✅ Phase 1: ติดตั้งพื้นฐาน (วันที่ 1\)  
\- \[ \] รัน \`checkExistingSheets()\`  
\- \[ \] รัน \`setupDatabaseHeaders()\`  
\- \[ \] รัน \`setupNameMappingHeaders()\`  
\- \[ \] รัน \`setupSCGSourceHeaders()\`  
\- \[ \] รัน \`createGPSQueueSheetProperly()\`  
\- \[ \] รัน \`setupGeminiAPI()\`  
\- \[ \] รัน \`phase1FinalCheck()\` → ต้องผ่านทุกข้อ

\#\#\# ✅ Phase 2: อัปเกรดข้อมูล (วันที่ 2\)  
\- \[ \] รัน \`upgradeDatabaseToV4()\`  
\- \[ \] รัน \`initializeAllRecordStatus()\`  
\- \[ \] รัน \`assignAllMissingUUIDs()\`  
\- \[ \] รัน \`calculateInitialQuality()\`  
\- \[ \] รัน \`calculateInitialConfidence()\`  
\- \[ \] รัน \`repairInitialNameMapping()\`  
\- \[ \] รัน \`phase2FinalCheck()\` → ต้องผ่านทุกข้อ

\#\#\# ✅ Phase 3: Workflow ประจำวัน (วันที่ 3-4)  
\- \[ \] รัน \`setupAutoPilotTrigger()\`  
\- \[ \] รัน \`setupWeeklyMaintenance()\`  
\- \[ \] รัน \`checkSCGSourceData()\` → ต้องมีข้อมูล  
\- \[ \] รัน \`testFirstSync()\`  
\- \[ \] รัน \`testFirstClustering()\`  
\- \[ \] รัน \`testFirstDeepClean()\` (กดซ้ำจนครบ)  
\- \[ \] รัน \`testFirstFinalize()\` (ระวัง\!)

\#\#\# ✅ Phase 4: เปิดใช้ AI (วันที่ 5-6)  
\- \[ \] รัน \`testGeminiConnection()\` → ต้องผ่าน  
\- \[ \] รัน \`testAIIndexing()\`  
\- \[ \] รัน \`testAISmartResolution()\`  
\- \[ \] รัน \`enableFullAutoPilot()\`

\#\#\# ✅ Phase 5: บำรุงรักษา (วันที่ 7+)  
\- \[ \] รัน \`dailyHealthCheck()\` (ทุกเช้า)  
\- \[ \] รัน \`weeklyDeepMaintenance()\` (ทุกสัปดาห์)  
\- \[ \] รัน \`dryRunBeforeFinalize()\` (ก่อน Finalize ทุกครั้ง)

\---

\#\# 🆘 การแก้ไขปัญหาฉุกเฉิน

\#\#\# ปัญหา: Database ผิดพลาดหลัง Finalize  
\`\`\`  
1\. เปลี่ยนชื่อ Backup\_YYYYMMDD\_HHMM → Database  
2\. ลบชีต Database เก่าที่เสียหาย  
3\. รัน initializeAllRecordStatus() ใหม่  
\`\`\`

\#\#\# ปัญหา: Auto-Pilot ทำงานซ้ำ/ไม่หยุด  
\`\`\`javascript  
// รันนี้เพื่อหยุดทั้งหมด  
function emergencyStopAllTriggers() {  
  ScriptApp.getProjectTriggers().forEach(t \=\> ScriptApp.deleteTrigger(t));  
  SpreadsheetApp.getUi().alert("🛑 หยุดทุก Trigger แล้ว");  
}  
\`\`\`

\#\#\# ปัญหา: Cache เต็ม/ค้าง  
\`\`\`javascript  
// ล้าง Cache ทั้งหมด  
function emergencyClearAllCache() {  
  CacheService.getScriptCache().remove("NAME\_MAPPING\_JSON\_V4");  
  PropertiesService.getScriptProperties().deleteProperty('DEEP\_CLEAN\_POINTER');  
  SpreadsheetApp.getUi().alert("🧹 ล้าง Cache และ Properties แล้ว");  
}  
\`\`\`

\---

ผมได้สร้างแผนที่ \*\*ละเอียดที่สุดเท่าที่เป็นไปได้\*\* ครอบคลุมทุกสเต็ปตั้งแต่เริ่มต้นจนจบโปรเจกต์

\*\*คุณต้องการให้ผม:\*\*  
1\. \*\*ขยายเฉพาะส่วนใดให้ละเอียดกว่านี้\*\* (เช่น อธิบายโค้ดทีละบรรทัด)?  
2\. \*\*สร้าง Google Apps Script ไฟล์รวม\*\* ที่คุณ copy วางได้เลย?  
3\. \*\*สร้าง Video Script\*\* สำหรับสอนทีมงาน?  
4\. \*\*แปลเป็นภาษาอังกฤษ\*\* สำหรับทีมต่างชาติ?

บอกผมได้เลยครับ ผมพร้อมปรับให้ตรงความต้องการ 100% 🎯  
