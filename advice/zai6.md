### ส่วนที่ 1: การวิเคราะห์ระบบเดิม (Analysis)

จากที่คุณอธิบาย ระบบเดิม (Part 1\) เป็นระบบแบบ Transaction-based (รายวัน) ซึ่งทำงานได้ดีสำหรับการปฏิบัติงานประจำวัน

* Input: Cookie และ Shipment Number  
* Process: ดึง API \-\> จับคู่พิกัดจาก Database (เดิม) \-\> แปะ Email  
* Output: Data ชีตสำหรับงานวันนั้น

ปัญหาที่พบ: ชีต SCGนครหลวงJWDภูมิภาค ทำหน้าที่เป็น Data Lake (บ่อเก็บข้อมูล) โดยตรง ข้อมูลที่ถูกบันทึกเข้าไปเป็นข้อมูล Raw (ดิบ) จากหลายวันหลายเดือน ทำให้เกิดปัญหา "ข้อมูลสกปรก" (Dirty Data) เช่น ชื่อซ้ำ ชื่อสะกดผิด พิกัดลอยตัว ฯลฯ

เป้าหมาย Part 2: เราต้องการสร้าง Master Data Management (MDM) ขึ้นมาเพื่อ "ทำความสะอาด" และ "รวมกลุ่ม" ข้อมูลเหล่านี้ให้กลายเป็นข้อมูลมาตรฐาน (Golden Record) สำหรับนำไปวิเคราะห์ต่อ

---

### ส่วนที่ 2: การออกแบบฐานข้อมูล (Database Design)

เพื่อแก้ปัญหา 8 ข้อ เราต้องแยกประเภทข้อมูลออกจากกัน (Normalization) โดยใช้หลักการ "สิ่งที่เปลี่ยนแปลงได้ ไม่ควรเป็นคีย์หลัก" (ชื่อสถานที่/ชื่อคนเปลี่ยนแปลงได้ แต่ Lat/Long ควรคงที่)

ผมขอแนะนำให้สร้างชีตใหม่ 3 ชีตหลัก (นอกเหนือจากชีตเดิม) ดังนี้:

1. Master\_Location (ฐานข้อมูลสถานที่):  
   * ใช้รวมกลุ่มสถานที่ที่เหมือนกัน แม้ชื่อจะต่างกัน  
   * *Key:* Loc\_ID (Auto Generate), Clean\_Lat, Clean\_Long  
   * *Attributes:* Standard\_Name (ชื่อที่ถูกที่สุด), All\_Aliases (ชื่อเดิมๆ ทั้งหมด), Address, Region  
2. Master\_Person (ฐานข้อมูลบุคคล/เจ้าของสินค้า):  
   * ใช้รวมกลุ่มคนที่เหมือนกัน แม้สะกดต่างกัน  
   * *Key:* Person\_ID  
   * *Attributes:* Standard\_Name, Phone, Email, Company  
3. Data\_Cleaned (ข้อมูลที่ผ่านการทำความสะอาด):  
   * ตารางข้อมูลหลักที่จะเอาไปใช้วิเคราะห์  
   * *Columns:* Date, Shipment\_No, Person\_ID, Loc\_ID, Raw\_Name (เก็บไว้เผื่อเช็ค), Raw\_LatLong

---

### ส่วนที่ 3: แนวทางแก้ปัญหา 8 ข้อ (Logic Strategy)

เราจะใช้เทคนิค Geospatial Clustering การจัดกลุ่มตามพิกัดภูมิศาสตร์เป็นหลัก เพราะ Lat/Long คือความจริงทางกายภาพที่แม่นยำที่สุด

| ปัญหา | แนวทางการแก้ (Solution Logic) |
| :---- | :---- |
| 1\. ชื่อบุคคลซ้ำ | ใช้ Master\_Person เชื่อมโยงด้วย Person\_ID ถ้าชื่อซ้ำ ให้ถือว่าเป็นคนคนเดียว (เว้นแต่มีข้อมูลอื่นคัดออกได้) |
| 2\. ชื่อสถานที่ซ้ำ | ใช้ Master\_Location รวมเป็น Loc\_ID เดียว |
| 3\. LatLong ซ้ำ | เคสพิเศษ: ถ้าพิกัดเหมือนกัน แต่ชื่อต่างกัน \-\> ให้ตรวจสอบระยะห่าง ถ้า \< 50 เมตร ถือว่าเป็นสถานที่เดียวกัน (แก้ข้อ 2 และ 5 ได้) |
| 4\. ชื่อเขียนไม่เหมือนกัน | ใช้ Fuzzy Matching (การจับคู่แบบคลุมเครือ) เปรียบเทียบ String ทำ N-Gram หรือ Levenshtein Distance หากชื่อคล้ายกัน \+ พิกัดใกล้เคียง \-\> ให้ Merge กัน |
| 5\. คนละชื่อ แต่สถานที่เดียวกัน | ให้สร้าง Loc\_ID ร่วมกัน แต่มี Person\_ID แยกกัน (หมายถึง โกดังแห่งนี้มีหลายร้านค้า) |
| 6\. ชื่อเดียวกัน แต่สถานที่ไม่เหมือนกัน | ให้สร้าง Loc\_ID คนละตัว (เป็นสาขา) แต่ใช้ Person\_ID เดียวกัน |
| 7\. ชื่อเดียวกัน แต่ LatLong คนละที่ | ตรวจสอบระยะทาง ถ้าห่างกันเกิน 500 เมตร \-\> ถือว่าเป็นสถานที่คนละแห่ง (สาขา) (แก้ข้อ 6 ได้) |
| 8\. คนละชื่อ แต่ LatLong เดียวกัน | จัดกลุ่มให้อยู่ Loc\_ID เดียวกัน (ร่วมทำเล) และแยก Person\_ID ตามบุคคล (แก้ข้อ 5 ได้) |

---

### ส่วนที่ 4: โครงสร้างโค้ด (Full Code Module)

ผมได้เขียน Google Apps Script ให้ครบถ้วนทั้งฟังก์ชันการทำงาน คุณสามารถสร้าง Script ใหม่แล้ววางโค้ดนี้ลงไปได้เลยครับ

javascript  
/\*\*  
\* \=================================================================  
\* KOPLMDS4-1 PART 2: DATABASE CLEANING SYSTEM  
\* \=================================================================  
\* หน้าที่: อ่านข้อมูลจาก 'SCGนครหลวงJWDภูมิภาค' \-\> ทำความสะอาด \-\> บันทึกลง Master DB  
\*/

// \--- CONFIGURATION \---  
const SHEET\_RAW \= 'SCGนครหลวงJWDภูมิภาค';  
const SHEET\_MASTER\_LOC \= 'Master\_Location';  
const SHEET\_MASTER\_PERSON \= 'Master\_Person';  
const SHEET\_DATA\_CLEANED \= 'Data\_Cleaned';

// ระยะห่างสูงสุดที่ถือว่าเป็นสถานที่เดียวกัน (หน่วย เมตร)  
const LOCATION\_THRESHOLD\_METERS \= 50;

function onOpen() {  
 const ui \= SpreadsheetApp.getUi();  
 ui.createMenu('🔧 System Part 2 (Cleaning)')  
   .addItem('🚀 รันระบบทำความสะอาดข้อมูล (Run ETL)', 'runETLProcess')  
   .addItem('🗑️ รีเซ็ตฐานข้อมูล (Reset Masters)', 'resetMasterDB')  
   .addToUi();  
}

/\*\*  
\* MAIN FUNCTION: ฟังก์ชันหลักที่ทำงานทุกอย่าง  
\*/  
function runETLProcess() {  
 const startTime \= new Date();  
 const ui \= SpreadsheetApp.getUi();  
  try {  
   // 1\. เตรียมชีต  
   const ss \= SpreadsheetApp.getActiveSpreadsheet();  
   const rawData \= getRawData(ss);  
    
   if (rawData.length \=== 0) {  
     ui.alert('ไม่พบข้อมูลในชีต Raw');  
     return;  
   }

   // 2\. โหลด Master ของเดิม (ถ้ามี) เพื่อเช็คความต่อเนื่อง  
   const masterLoc \= loadMasterData(ss, SHEET\_MASTER\_LOC);  
   const masterPerson \= loadMasterData(ss, SHEET\_MASTER\_PERSON);

   // 3\. กระบวนการทำความสะอาด (Cleaning Logic)  
   const processedData \= processCleaningLogic(rawData, masterLoc, masterPerson);

   // 4\. อัปเดต Master DB  
   saveMasterData(ss, SHEET\_MASTER\_LOC, processedData.newLocations);  
   saveMasterData(ss, SHEET\_MASTER\_PERSON, processedData.newPersons);

   // 5\. บันทึก Data ที่สะอาดแล้ว  
   saveCleanedData(ss, SHEET\_DATA\_CLEANED, processedData.cleanRecords);

   const endTime \= new Date();  
   ui.alert(\`✅ เสร็จสิ้นการทำงาน\!\\nใช้เวลา: ${(endTime \- startTime) / 1000} วินาที\\nประมวลผล: ${processedData.cleanRecords.length} รายการ\`);

 } catch (e) {  
   ui.alert('❌ เกิดข้อผิดพลาด: ' \+ e.toString());  
   Logger.log(e);  
 }  
}

/\*\*  
\* 1\. ดึงข้อมูลดิบจากชีต  
\*/  
function getRawData(ss) {  
 const sheet \= ss.getSheetByName(SHEET\_RAW);  
 if (\!sheet) throw new Error('ไม่พบชีต: ' \+ SHEET\_RAW);  
  // สมมติโครงสร้างหลัก: \[Date, Shipment, OwnerName, LocName, Lat, Long\]  
 // \*กรุณาตรวจสอบ Index ให้ตรงกับชีตจริงของคุณ\*  
 const data \= sheet.getDataRange().getValues();  
 const headers \= data.shift(); // เอาหัวตารางออก  
  // แปลงเป็น Array of Objects เพื่อง่ายต่อการจัดการ  
 return data.map(row \=\> ({  
   date: row\[0\],  
---

### ส่วนที่ 5: คู่มือการใช้งานและขั้นตอนการสร้าง (Manual)

ขั้นตอนการติดตั้งและใช้งานระบบใหม่:

1. เปิด Google Sheet ของโปรเจกต์  
2. ไปที่เมนู Extensions (ส่วนขยาย) \> Apps Script  
3. สร้างไฟล์ Script ใหม่ (ชื่ออะไรก็ได้ เช่น Part2\_CleaningSystem)  
4. ลบโค้ดเก่าทิ้ง แล้ว Copy โค้ดทั้งหมดจากด้านบน ไปวางแทนที่  
5. บันทึกไฟล์ (Save icon รูปดิสก์) และกลับไปที่หน้า Sheet  
6. รีเฟรชหน้าจอ Sheet หนึ่งครั้ง คุณจะเห็นเมนูใหม่ปรากฏขึ้นมาชื่อ "🔧 System Part 2 (Cleaning)"

วิธีใช้งาน:

1. นำข้อมูลเข้า SCGนครหลวงJWDภูมิภาค (ตามปกติ)  
2. ไปที่เมนู 🔧 System Part 2 (Cleaning) \> คลิก "🚀 รันระบบทำความสะอาดข้อมูล"  
3. ระบบจะ:  
   * อ่านข้อมูล Raw  
   * สร้าง/อัปเดต ชีต Master\_Location (กำหนดสถานที่มาตรฐาน)  
   * สร้าง/อัปเดต ชีต Master\_Person  
   * สร้าง ชีต Data\_Cleaned (ตารางสุดท้ายที่พร้อมใช้)  
4. ถ้าข้อมูลยุ่งเหยิงเกินไป แนะนำให้กด "รีเซ็ตฐานข้อมูล" ก่อน แล้วค่อยรันใหม่ เพื่อให้ระบบเรียงข้อมูลใหม่หมด

---

### ส่วนที่ 6: สรุปชีตที่ต้องมี (Summary)

ในระบบใหม่นี้ คุณจะมีชีตหลักทั้งหมดนี้ (รวมชีตเดิม):

1. Input (เดิม: สำหรับรับค่า Cookie/Shipment)  
2. Data (เดิม: สำหรับงานรายวัน Part 1\)  
3. SCGนครหลวงJWDภูมิภาค (เดิม: Data Lake แหล่งรวบรวมประวัติ)  
4. Master\_Location (ใหม่: รายชื่อสถานที่มาตรฐาน, พิกัดจริง, รายการชื่อเก่า(Alias))  
5. Master\_Person (ใหม่: รายชื่อลูกค้า/คนขับมาตรฐาน)  
6. Data\_Cleaned (ใหม่: ข้อมูลสุดท้ายที่ตัดปัญหาทั้ง 8 ข้อแล้ว พร้อมใช้)

### ส่วนที่ 7: ถ้าโปรเจกต์นี้เป็นของผม ผมจะทำอย่างไร? (Recommendation)

ถ้าเป็นโปรเจกต์ของผม เพื่อให้แข็งแกร่งในระยะยาว ผมจะทำต่อไปนี้:

1. เปลี่ยนจาก Sheet เป็น Cloud SQL: ข้อมูล Logistics มักจะเยอะมาก เมื่อข้อมูลใน SCG... ถึง 100,000 รายการ Google Sheet จะเริ่มช้าและเกิดบัค (Script timeout) ผมจะย้ายฐานข้อมูลไปเก็บใน Google BigQuery หรือ MySQL แทน และใช้ Sheet เพียงแค่ดูผลลัพธ์  
2. ใช้ Geocoding API: ปัญหาสถานที่ไม่ชัดเจน ผมจะส่งชื่อสถานที่ไปถาม Google Maps API ให้ตอบ Lat/Long กลับมาอีกครั้ง เพื่อเช็คความถูกต้อง ไม่พึ่งพาข้อมูลจาก Driver 100%  
3. Implement Machine Learning (Fuzzy Matching): การใช้ if (name \== name) อาจไม่พอ ผมจะใช้ Algorithm ที่ชื่อว่า Levenshtein distance ในโค้ด Python เพื่อตรวจจับว่า "โกดังจอมเกล้า" กับ "จอมเกล้าโกดัง" คือคนเดียวกันแม้สะกดไม่เหมือน (ในโค้ดด้านบนผมใช้วิธีตัด Space และพิมพ์ใหญ่ช่วย ซึ่งใช้ได้ดีในระดับพื้นฐาน)

คำแนะนำสุดท้าย:  
ระบบ Part 1 ของคุณทำงานได้ดีมากสำหรับ Operation ส่วน Part 2 นี้จะช่วยให้ Data Analyst หรือคุณเองสามารถวิเคราะห์พฤติกรรมการส่งของได้แม่นยำขึ้นมาก ลองนำโค้ดนี้ไปใช้ดูครับ ระบบจะช่วยแยกแยะ "คน" กับ "ที่" ให้คุณอัตโนมัติครับ

