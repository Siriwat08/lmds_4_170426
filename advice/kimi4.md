ผมจะวิเคราะห์ระบบนี้อย่างละเอียด 100% เพื่อหาแนวทางสร้างฐานข้อมูลให้ได้จริง

\#\# 🔍 วิเคราะห์โครงสร้างระบบ

\#\#\# 1\. สถาปัตยกรรมหลัก (3-Layer Architecture)

\`\`\`  
┌─────────────────────────────────────────┐  
│  LAYER 1: Data Sources (Input)          │  
│  • SCG API (Shipment/Delivery data)     │  
│  • Manual Input (Spreadsheet)           │  
│  • GPS from Drivers (Mobile/EPOD)       │  
└─────────────────────────────────────────┘  
                    ↓  
┌─────────────────────────────────────────┐  
│  LAYER 2: Core Database (Master Data)   │  
│  • Database Sheet (22 columns)          │  
│  • NameMapping Sheet (Alias resolution) │  
│  • GPS\_Queue Sheet (Pending approvals)  │  
└─────────────────────────────────────────┘  
                    ↓  
┌─────────────────────────────────────────┐  
│  LAYER 3: Output & Interfaces           │  
│  • WebApp Search (Index.html)           │  
│  • Daily Job Data (SCG Operations)      │  
│  • Notifications (LINE/Telegram)        │  
└─────────────────────────────────────────┘  
\`\`\`

\---

\#\# 📊 โครงสร้างฐานข้อมูลหลัก

\#\#\# Database Sheet (22 Columns) \- ตารางหลัก

| Col | ชื่อ | ประเภท | ความสำคัญ |  
|:---:|------|--------|-----------|  
| 1 | NAME | String | 🎯 Primary identifier |  
| 2 | LAT | Float | 📍 พิกัดละติจูด |  
| 3 | LNG | Float | 📍 พิกัดลองจิจูด |  
| 4 | SUGGESTED | String | 🤖 AI แนะนำชื่อมาตรฐาน |  
| 5 | CONFIDENCE | Number | % ความมั่นใจในการจับคู่ |  
| 6 | NORMALIZED | String | 🔤 คำค้นหาอัจฉริยะ (มี \[AI\] tag) |  
| 7 | VERIFIED | Boolean | ✅ ตรวจสอบแล้ว |  
| 8 | SYS\_ADDR | String | 🏢 ที่อยู่จากระบบ SCG |  
| 9 | GOOGLE\_ADDR | String | 🗺️ ที่อยู่จาก Google Maps |  
| 10 | DIST\_KM | Number | 📏 ระยะห่างจากคลัง |  
| 11 | UUID | String | 🔑 Unique identifier (Primary Key) |  
| 12 | PROVINCE | String | 🏛️ จังหวัด |  
| 13 | DISTRICT | String | 🏘️ อำเภอ/เขต |  
| 14 | POSTCODE | String | 📮 รหัสไปรษณีย์ |  
| 15 | QUALITY | Number (0-100) | ⭐ คะแนนคุณภาพข้อมูล |  
| 16 | CREATED | DateTime | 🕐 วันที่สร้าง |  
| 17 | UPDATED | DateTime | 🕐 วันที่อัปเดตล่าสุด |  
| 18 | Coord\_Source | String | 📡 แหล่งที่มาของพิกัด |  
| 19 | Coord\_Confidence | Number | % ความมั่นใจพิกัด |  
| 20 | Coord\_Last\_Updated | DateTime | 🕐 พิกัดอัปเดตล่าสุด |  
| 21 | Record\_Status | String | 🚦 Active/Inactive/Merged |  
| 22 | Merged\_To\_UUID | String | 🔀 ชี้ไปยัง UUID หลัก |

\---

\#\# 🔄 Data Flow การทำงานของระบบ

\`\`\`  
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐  
│   SCG\_IMPORT    │────→│  NAME\_RESOLVE   │────→│  COORDINATE     │  
│  (ดึงจาก API)   │     │  (จับคู่ชื่อ)    │     │  (หาพิกัด)      │  
└─────────────────┘     └─────────────────┘     └─────────────────┘  
         │                       │                       │  
         ↓                       ↓                       ↓  
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐  
│  • Shipment No  │     │  Tier 1: Exact  │     │  • Master DB    │  
│  • Invoice No   │     │  Tier 2: Alias  │     │  • Google Maps  │  
│  • Customer Name│     │  Tier 3: Fuzzy  │     │  • Driver GPS   │  
│  • ShipToName   │     │  Tier 4: AI     │     │                 │  
└─────────────────┘     └─────────────────┘     └─────────────────┘  
                                                        │  
                              ┌─────────────────────────┘  
                              ↓  
                    ┌─────────────────┐  
                    │  GPS\_FEEDBACK   │  
                    │  (ตรวจสอบพิกัด)  │  
                    └─────────────────┘  
                              │  
           ┌──────────────────┼──────────────────┐  
           ↓                  ↓                  ↓  
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  
    │   APPROVE   │    │   REJECT    │    │   QUEUE     │  
    │ (อัปเดต DB)  │    │ (เก็บไว้ดู)  │    │ (รอตัดสิน)  │  
    └─────────────┘    └─────────────┘    └─────────────┘  
\`\`\`

\---

\#\# 🎯 กลไกการจับคู่ชื่อ (4-Tier Resolution)

\#\#\# Tier 1: Exact Match (100%)  
\`\`\`javascript  
// normalizeText() ทำให้ "บริษัท ABC จำกัด" \= "abc"  
if (existingNames\[normalizeText(inputName)\]) {  
  matchIdx \= existingNames\[cleanName\];  
}  
\`\`\`

\#\#\# Tier 2: NameMapping (Alias)  
\`\`\`javascript  
// NameMapping Sheet: Variant\_Name → Master\_UID  
if (aliasToUUID\[cleanName\]) {  
  var uid \= aliasToUUID\[cleanName\];  
  matchIdx \= existingUUIDs\[uid\];  
}  
\`\`\`

\#\#\# Tier 3: Spatial Clustering (Geographic)  
\`\`\`javascript  
// จับกลุ่มตาม Grid 1x1 กม.  
var gridKey \= Math.floor(lat \* 10\) \+ "\_" \+ Math.floor(lng \* 10);  
// เปรียบเทียบระยะทาง Haversine \< 50 เมตร  
\`\`\`

\#\#\# Tier 4: AI Resolution (Gemini)  
\`\`\`javascript  
// ส่งชื่อที่ไม่รู้จักให้ AI วิเคราะห์  
// Confidence ≥ 90% → Auto-map  
// Confidence 70-89% → Review queue  
// Confidence \< 70% → Ignore  
\`\`\`

\---

\#\# 🛡️ ระบบควบคุมคุณภาพข้อมูล

\#\#\# Quality Score Calculation (0-100)

\`\`\`javascript  
var qualityScore \= 0;  
if (name.length \>= 3\)           qualityScore \+= 10;  // ชื่อสมบูรณ์  
if (validLatLng)                qualityScore \+= 20;  // มีพิกัด  
if (coordinatesInThailand)        qualityScore \+= 10;  // พิกัดในประเทศ  
if (googleAddress)              qualityScore \+= 15;  // มีที่อยู่ Google  
if (province && district)         qualityScore \+= 10;  // มีข้อมูลภูมิศาสตร์  
if (postcode)                   qualityScore \+= 5;   // มีรหัสไปรษณีย์  
if (UUID)                       qualityScore \+= 10;  // มี UUID  
if (verified \=== true)            qualityScore \+= 20;  // ตรวจสอบแล้ว  
// MAX \= 100  
\`\`\`

\#\#\# Record Status Lifecycle

\`\`\`  
┌─────────┐    ┌─────────┐    ┌─────────┐  
│  NEW    │───→│ ACTIVE  │───→│ INACTIVE│  
│ (สร้างใหม่)│    │(ใช้งาน)  │    │(ปิดการใช้งาน)│  
└─────────┘    └────┬────┘    └─────────┘  
                    │  
                    ↓  
              ┌─────────┐  
              │ MERGED  │────→ ชี้ไป UUID หลัก  
              │(รวมข้อมูล)│  
              └─────────┘  
\`\`\`

\---

\#\# 🚀 ขั้นตอนสร้างฐานข้อมูลจริง (Implementation Roadmap)

\#\#\# Phase 1: โครงสร้างพื้นฐาน (Week 1-2)

\`\`\`  
□ 1.1 สร้าง Google Sheet ตาม Template  
   ├── Database (22 columns)  
   ├── NameMapping (5 columns)  
   ├── GPS\_Queue (9 columns)  
   ├── Data (SCG Daily Job \- 29 columns)  
   ├── Input (SCG Import)  
   └── PostalRef (Reference data)

□ 1.2 ติดตั้ง Apps Script Modules  
   ├── Config.gs (Constants)  
   ├── Utils\_Common.gs (Helpers)  
   ├── Service\_Master.gs (Core DB)  
   ├── Service\_SCG.gs (Import)  
   └── Menu.gs (UI)  
\`\`\`

\#\#\# Phase 2: นำเข้าข้อมูลเริ่มต้น (Week 3\)

\`\`\`  
□ 2.1 Import ข้อมูลลูกค้าดิบ  
   └── ใช้ syncNewDataToMaster() ดึงจาก Source Sheet

□ 2.2 รัน Deep Clean รอบแรก  
   └── updateGeoData\_SmartCache() \- เติมพิกัด/ที่อยู่

□ 2.3 สร้าง UUID ให้ครบทุกแถว  
   └── assignMissingUUIDs()  
\`\`\`

\#\#\# Phase 3: AI Enrichment (Week 4\)

\`\`\`  
□ 3.1 ตั้งค่า Gemini API Key  
   └── Setup\_Security.gs → setupEnvironment()

□ 3.2 รัน AI Indexing  
   └── processAIIndexing\_Batch() \- สร้าง normalized keywords

□ 3.3 รัน Clustering  
   └── autoGenerateMasterList\_Smart() \- จับกลุ่มชื่อซ้ำ  
\`\`\`

\#\#\# Phase 4: Validation & Go-Live (Week 5\)

\`\`\`  
□ 4.1 ตรวจสอบคุณภาพ  
   ├── recalculateAllQuality()  
   ├── showLowQualityRows()  
   └── findHiddenDuplicates()

□ 4.2 ตรวจสอบ Schema  
   └── runFullSchemaValidation()

□ 4.3 Finalize  
   └── finalizeAndClean\_MoveToMapping()  
\`\`\`

\---

\#\# 💡 Key Success Factors

| ปัญหาที่มักเจอ | วิธีแก้ในระบบนี้ |  
|---------------|----------------|  
| ชื่อลูกค้าซ้ำซ้อน | 4-Tier Resolution \+ Spatial Clustering |  
| พิกัดไม่ตรง | GPS Feedback Loop \+ Driver verification |  
| ข้อมูลไม่สมบูรณ์ | Quality Score \+ Deep Clean automation |  
| ค้นหาไม่เจอ | AI Normalized Keywords \+ Alias mapping |  
| ระบบล่ม | LockService \+ Retry mechanism \+ Cache |

\---

\#\# 📈 Metrics ติดตามความสำเร็จ

\`\`\`javascript  
// ควรตั้งเป้าหมายดังนี้:  
{  
  "total\_records": "\> 1000 รายการ",  
  "quality\_distribution": {  
    "high\_80\_100": "\> 60%",  
    "medium\_50\_79": "\< 30%",  
    "low\_0\_49": "\< 10%"  
  },  
  "coverage": {  
    "with\_coordinates": "\> 95%",  
    "with\_uuid": "100%",  
    "verified": "\> 40%"  
  },  
  "search\_performance": {  
    "avg\_response\_time": "\< 2 วินาที",  
    "match\_accuracy": "\> 90%"  
  }  
}  
\`\`\`

\---

\#\# 🔧 การ Deploy จริง

\#\#\# ขั้นตอนการติดตั้ง:

1\. \*\*สร้าง Spreadsheet ใหม่\*\* → ตั้งชื่อ "Logistics Master DB"

2\. \*\*สร้าง Sheets ตามลำดับ:\*\*  
   \- Database  
   \- NameMapping    
   \- GPS\_Queue  
   \- Data  
   \- Input  
   \- PostalRef (ดาวน์โหลดข้อมูลรหัสไปรษณีย์ไทย)

3\. \*\*เปิด Apps Script\*\* (Extensions → Apps Script)

4\. \*\*สร้างไฟล์ .gs ตามชื่อในเอกสาร:\*\*  
   \- คัดลอกโค้ดจากแต่ละไฟล์ที่ให้มา  
   \- วางในไฟล์ที่ชื่อตรงกัน

5\. \*\*รัน Setup ครั้งแรก:\*\*  
   \- \`setupEnvironment()\` → ใส่ Gemini API Key  
   \- \`upgradeDatabaseStructure()\` → สร้างโครงสร้างคอลัมน์  
   \- \`upgradeNameMappingStructure\_V4()\` → สร้าง NameMapping

6\. \*\*ทดสอบระบบ:\*\*  
   \- \`RUN\_SYSTEM\_DIAGNOSTIC()\`  
   \- \`debugGeminiConnection()\`

7\. \*\*เริ่มใช้งาน:\*\*  
   \- ใส่ข้อมูลใน Source Sheet  
   \- รัน \`syncNewDataToMaster\_UI()\`

\---

ระบบนี้ออกแบบมาให้ \*\*self-healing\*\* และ \*\*continuously improving\*\* \- ยิ่งใช้งานมาก ข้อมูลยิ่งแม่นยำขึ้นผ่าน AI Feedback Loop และ GPS Verification จากคนขับรถจริง  
