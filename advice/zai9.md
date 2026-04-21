  
GLM-5  
Share Session  
สร้างรายงานการค้นคว้าเกี่ยวกับ   
ปัญหาที่เจออยู่ตอนนี้ครับ  
1.เรื่องชื่อซ้ำ   
2.เรื่องที่อยู่ซ้ำ   
3.เรื่องLatLongซ้ำ   
4.เรื่องชื่อเขียนไม่เหมือนกัน  
5.เรื่องคนละชื่อแต่ที่อยู่เดียวกัน   
6.เรื่องชื่อเดียวกันแต่ที่อยู่ไม่เหมือนกัน   
7.เรื่องชื่อเดียวกันแต่LatLongคนละที่   
8.เรื่องคนละชื่อแต่LatLongเดียวกัน

ถ้าเป็นคุณ  
จะออกแบบGoogleSheet ตารางการเก็บข้อมูลยังไง และ ใช้ GoogleAppsceipt ฟังชั่นอะไร เพื่อแก้ไขปัญหา ขอแบบเทคนิคขั้นสูงนะ

ช่วยสอนผมหน่อย

Show full message

Thought Process

1.   
2.   
3.   
4.   
5.   
6.   
7.   
8.   
1.   
2.   
*   
*   
*   
*   
*   
*   
*   
*   
*   
*   
*   
*   
*   
*   
*   
  *   
  *   
1.   
2.   
3.   
   *   
     *   
     *   
   *   
4.   
*   
*   
*   
*   
*   
*   
  *   
  *   
  *   
  *   
  *   
*   
*   
*   
*   
*   
*   
*   
*   
*   
*   
1.   
2.   
3.   
4.   
*   
*   
*   
*   
*   
* 

นี่คือรายงานการค้นคว้าและข้อเสนอแนะทางเทคนิคสำหรับการแก้ไขปัญหาคุณภาพข้อมูล (Data Quality) ที่ครอบคลุมทั้ง 8 ประเด็นที่คุณเจอะอยู่ครับ

---

# รายงานการค้นคว้า: การจัดการข้อมูลซ้ำซ้อนและความขัดแย้งของข้อมูล (Data Deduplication & Conflict Resolution)

## 1\. การวิเคราะห์ปัญหา (Problem Analysis)

จาก 8 ประเด็นที่เจอ สามารถจัดกลุ่มเพื่อการแก้ไขได้ 3 กลุ่มใหญ่ ดังนี้:

กลุ่มที่ 1: ข้อมูลซ้ำซ้อนแบบตรงไปตรงมา (Exact Duplicates)

* ข้อ 1, 2, 3: ชื่อซ้ำ, ที่อยู่ซ้ำ, LatLong ซ้ำ  
* *ลักษณะ:* ข้อมูลถูกป้อนเข้ามาทั้งแถวเหมือนกันหรือบางฟิลด์เหมือนกันทุกประการ  
* *วิธีแก้:* ใช้การสร้าง Key หรือ Hashing เพื่อตรวจจับและลบหรือตั้งสถานะซ้ำ

กลุ่มที่ 2: ความผิดเพี้ยนของข้อความ (Fuzzy Matching / Text Similarity)

* ข้อ 4: ชื่อเขียนไม่เหมือนกัน (เช่น "บริษัท ABC จำกัด" vs "บจก. เอบีซี")  
* *ลักษณะ:* ใจความเดียวกันแต่สะกดต่างกัน, ใช้คำย่อต่างกัน  
* *วิธีแก้:* ใช้ Algorithm การเปรียบเทียบข้อความ (Levenshtein Distance) เพื่อหาความคล้ายคลึงในรูปแบบ %

กลุ่มที่ 3: ความขัดแย้งของตำแหน่งและเอกลักษณ์ (Geo-Location & Identity Conflict)

* ข้อ 5: คนละชื่อ ที่อยู่เดียวกัน (อาจเป็นคนในบ้านเดียวกัน หรือข้อมูลผิดพลาด)  
* ข้อ 6: ชื่อเดียวกัน ที่อยู่ไม่เหมือนกัน (สาขา หรือย้ายที่อยู่)  
* ข้อ 7: ชื่อเดียวกัน LatLong คนละที่ (ข้อมูลซ้ำที่พิกัดผิด)  
* ข้อ 8: คนละชื่อ LatLong เดียวกัน (ตึกแถว/คอนโด หรือการขโมยพิกัด)  
* *วิธีแก้:* ใช้การคำนวณระยะทาง (Haversine Formula) ร่วมกับ Logic การตัดสินใจ (Business Logic)

---

## 2\. การออกแบบ Google Sheet (Database Schema Design)

เพื่อรองรับการแก้ไขปัญหาขั้นสูง โครงสร้างตารางไม่ควรเก็บแค่ข้อมูลดิบ แต่ต้องมีฟิลด์สำหรับการประมวลผล (Metadata) ครับ

แนะนำให้สร้าง Sheet ชื่อว่า Data\_Pool มีโครงสร้างดังนี้:

| Column | Header Name | คำอธิบาย | ใช้แก้ปัญหาข้อ |
| :---- | :---- | :---- | :---- |
| A | Raw\_ID | ID ดั้งเดิม | \- |
| B | Name\_Raw | ชื่อดิบที่กรอกเข้ามา | 4 |
| C | Name\_Clean | ชื่อที่ผ่านการตัดคำซ้ำ/ย่อแล้ว (Normalized) | 1, 4, 6 |
| D | Address\_Raw | ที่อยู่ดิบ | 2 |
| E | Address\_Clean | ที่อยู่ที่ตัดช่องว่าง/จัดรูปแบบแล้ว | 2, 5 |
| F | Latitude | ค่าละติจูด | 3, 7, 8 |
| G | Longitude | ค่าลองจิจูด | 3, 7, 8 |
| H | GeoHash | รหัสแทนตำแหน่ง (เช่น 6 หลักแรก) เพื่อจับกลุ่มพื้นที่ใกล้เคียง | 3, 7, 8 |
| I | Dup\_Status | สถานะข้อมูล (New, Unique, Duplicate, Conflict) | ทุกข้อ |
| J | Match\_Score | คะแนนความเหมือน (0-100%) | 4 |
| K | Master\_Ref | ID ของข้อมูลต้นแบบที่ถูกต้อง (กรณีเป็น Duplicate) | 1-8 |

---

## 3\. การออกแบบ Google Apps Script (Advanced Technical Solution)

เพื่อแก้ไขปัญหาเหล่านี้ เราจะไม่ใช้การวน Loop ซ้อนกันแบบง่ายๆ เพราะข้อมูลเยอะๆ จะทำงานช้ามาก (Time Out) แต่จะใช้ Object Hashing และ Algorithm เข้ามาช่วยครับ

### เทคนิคขั้นสูงที่ใช้:

1. Text Normalization: ลบคำนำหน้า, ช่องว่าง, ตัวอักษรพิเศษเพื่อเปรียบเทียบชื่อและที่อยู่  
2. Levenshtein Distance: ใช้คำนวณความคล้ายคลึงของชื่อ (แก้ปัญหาข้อ 4\)  
3. Haversine Formula: คำนวณระยะทางระหว่าง 2 พิกัด (เมตร) เพื่อดูว่าใกล้กันเกินไปหรือไม่ (แก้ปัญหาข้อ 7, 8\)

### โค้ดตัวอย่าง Google Apps Script (แบบเจาะจงปัญหา)

javascript

// 1\. Helper Function: ทำความสะอาดข้อความ (Normalization)

function normalizeText(text) {

 if (\!text) return "";

 return text.toString()

   .toLowerCase()

   .replace(/^(บริษัท|บจก|จำกัด|มหาชน|จำกัด|บมจ|the|co|ltd)\\s\*/gi, "") // ตัดคำนำหน้าบริษัททิ้ง

   .replace(/\[^a-z0-9ก-ฮ\]/g, "") // เก็บเฉพาะตัวอักษรและตัวเลข

   .trim();

}

// 2\. Helper Function: หาระยะห่างระหว่างพิกัด (Haversine Formula) \- แก้ปัญหา LatLong

function getDistanceMeters(lat1, lon1, lat2, lon2) {

 const R \= 6371000; // Radius of the earth in meters

 const dLat \= (lat2 \- lat1) \* Math.PI / 180;

 const dLon \= (lon2 \- lon1) \* Math.PI / 180;

 const a \= Math.sin(dLat / 2) \* Math.sin(dLat / 2) \+

           Math.cos(lat1 \* Math.PI / 180) \* Math.cos(lat2 \* Math.PI / 180) \*

           Math.sin(dLon / 2) \* Math.sin(dLon / 2);

 const c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1 \- a));

 return R \* c; // Distance in meters

}

// 3\. Helper Function: วัดความคล้ายคลึงของข้อความ (Levenshtein) \- แก้ปัญหาชื่อเขียนไม่เหมือนกัน

function similarity(s1, s2) {

 let longer \= s1;

 let shorter \= s2;

 if (s1.length \< s2.length) { longer \= s2; shorter \= s1; }

 const longerLength \= longer.length;

 if (longerLength \=== 0) return 1.0;

 return (longerLength \- editDistance(longer, shorter)) / longerLength;

}

function editDistance(s1, s2) {

 s1 \= s1.toLowerCase(); s2 \= s2.toLowerCase();

 const costs \= new Array();

 for (let i \= 0; i \<= s1.length; i\++) {

   let lastValue \= i;

   for (let j \= 0; j \<= s2.length; j\++) {

     if (i \=== 0) costs\[j\] \= j;

     else if (j \> 0) {

       let newValue \= costs\[j \- 1\];

       if (s1.charAt(i \- 1) \!== s2.charAt(j \- 1))

         newValue \= Math.min(Math.min(newValue, lastValue), costs\[j\]) \+ 1;

       costs\[j \- 1\] \= lastValue;

       lastValue \= newValue;

     }

   }

   if (i \> 0) costs\[s2.length\] \= lastValue;

 }

 return costs\[s2.length\];

}

// 4\. MAIN FUNCTION: ประมวลผลข้อมูลหลัก

function processDuplicationCheck() {

 const ss \= SpreadsheetApp.getActiveSpreadsheet();

 const sheet \= ss.getSheetByName("Data\_Pool");

  // ดึงข้อมูลทั้งหมดมาใส่ Array (Performance ดีกว่า getValue ทีละ cell)

 const dataRange \= sheet.getDataRange();

 const data \= dataRange.getValues();

  // สร้าง Object เก็บ Reference สำหรับการเช็คซ้ำ (Hash Map)

 let nameMap \= {};     // เก็บชื่อที่ทำความสะอาดแล้ว: row index

 let addressMap \= {};  // เก็บที่อยู่ที่ทำความสะอาดแล้ว: row index

 let latLongMap \= {};  // เก็บ Lat,Long: row index

 // ตัวแปรเก็บผลลัพธ์

 let outputData \= \[\];

---

## 4\. สรุปวิธีแก้ไขปัญหาแต่ละข้อด้วยเทคนิคข้างต้น

1. เรื่องชื่อซ้ำ: ใช้ normalizeText ตัดช่องว่างและตัวพิมพ์เล็ก/ใหญ่ออก แล้วเก็บใส่ Object Map เพื่อเช็คความเร็วสูง O(1) แทนการวนลูปเทียบทุกแถว  
2. เรื่องที่อยู่ซ้ำ: ใช้หลักการเดียวกับข้อ 1 แต่เพิ่มการตัดคำนำหน้า เช่น "ถนน", "ตรอก" ออกเพื่อเพิ่มโอกาสจับคู่ที่ถูกต้อง  
3. เรื่อง LatLong ซ้ำ: ใช้การ toFixed(4) เพื่อกำหนดขอบเขตความแม่นยำ (รัศมีประมาณ 11 เมตร) ข้อมูลที่ตรงกันในระดับนี้ถือว่าพิกัดเดียวกัน  
4. เรื่องชื่อเขียนไม่เหมือนกัน: ใช้ Levenshtein Distance (ฟังก์ชัน similarity) หากคะแนนความคล้าย \> 85% ให้ระบบแจ้งเตือนให้คนมาตรวจสอบ (Human Review)  
5. เรื่องคนละชื่อแต่ที่อยู่เดียวกัน: ระบบจะตั้งสถานะเป็น Review\_Needed เพราะอาจเป็นสามีภรรยา หรืออาจเป็นข้อมูลซ้ำที่พิมพ์ชื่อผิด  
6. เรื่องชื่อเดียวกันแต่ที่อยู่ไม่เหมือนกัน: ตรรกะจะไม่ฟ้องว่าซ้ำ (เพราะ Key ไม่ตรง) แต่ถ้าเป็นธุรกิจอาจเป็น "สาขา" ต้องใช้ Logic ความสัมพันธ์อื่นเข้ามาช่วย  
7. เรื่องชื่อเดียวกันแต่ LatLong คนละที่: ใช้ getDistanceMeters คำนวณว่าห่างกันกี่เมตร ถ้าชื่อเหมือนกันทุกตัวแต่พิกัดห่างกันมาก ให้ Flag เป็น Conflict  
8. เรื่องคนละชื่อแต่ LatLong เดียวกัน: จะถูกจับคู่โดย latLongMap และระบบจะแจ้งว่า "พิกัดนี้ถูกใช้แล้วโดย ID อื่น"

## 5\. ข้อแนะนำในการใช้งาน

1. Trigger: ไม่ควรให้ Script ทำงานทุกครั้งที่พิมพ์ (OnEdit) เพราะหนักเครื่อง ให้สร้างปุ่ม (Button) หรือตั้งเวลา (Time-driven Trigger) รันทุกคืน  
2. Sheet แยก: ควรแยก Sheet Raw\_Data (ข้อมูลดิบ) กับ Sheet Verified\_Data (ข้อมูลที่ผ่านการตรวจสอบแล้ว) เพื่อความปลอดภัยของข้อมูล

นี่คือแนวทางแบบเทคนิคขั้นสูงที่ใช้ได้จริงกับ Google Sheets ครับ ลองนำไปปรับใช้ดูนะครับ

