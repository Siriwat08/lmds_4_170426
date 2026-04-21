นี่คือรายงานการค้นคว้าและข้อเสนอแนะทางเทคนิคเพื่อแก้ไขปัญหาคุณภาพข้อมูล (Data Quality) ที่ครอบคลุมทุกประเด็นที่คุณระบุมาครับ

---

# รายงานการค้นคว้า: การแก้ไขปัญหาข้อมูลซ้ำซ้อนและความขัดแย้งในฐานข้อมูล

หัวข้อ: การออกแบบโครงสร้างข้อมูลและอัลกอริทึมตรวจจับความผิดปกติ (Deduplication & Entity Resolution)

## 1\. การวิเคราะห์ปัญหา (Problem Analysis)

จาก 8 ปัญหาที่ยกมา สามารถจัดกลุ่มเป็น 3 หมวดหลักทางเทคนิคได้ดังนี้:

กลุ่ม A: การซ้ำซ้อนแบบตรงตัว (Exact Duplication)

* ข้อ 1, 2, 3: ชื่อซ้ำ, ที่อยู่ซ้ำ, LatLong ซ้ำ  
* *สาเหตุ:* การบันทึกข้อมูลซ้ำจาก User หรือระบบ Import ที่ไม่มีการตรวจสอบ Primary Key  
* *ความยาก:* ตรวจจับง่าย แต่ต้องตัดสินใจว่าจะลบตัวไหน (Soft Delete หรือ Merge)

กลุ่ม B: ความขัดแย้งของตำแหน่งทางกายภาพ (Spatial Conflict)

* ข้อ 7: ชื่อเดียวกันแต่ LatLong คนละที่  
* ข้อ 8: คนละชื่อแต่ LatLong เดียวกัน  
* *สาเหตุ:* ข้อ 7 อาจเป็นสาขาของร้านเดียวกัน หรือข้อมูลผิดพลาด ส่วนข้อ 8 มักเป็นอาคารแฟลต คอนโด หรือจุดร่วมกัน (Shared Location)  
* *เทคนิค:* ต้องใช้การคำนวณระยะทาง (Haversine Formula) และการกรองความแม่นยำของทศนิยม

กลุ่ม C: ความซ้ำซ้อนเชิงความหมายและการสะกด (Fuzzy Matching & Semantic Conflict)

* ข้อ 4: ชื่อเขียนไม่เหมือนกัน (เช่น "บริษัท กก" vs "บจก. กก")  
* ข้อ 5: คนละชื่อแต่ที่อยู่เดียวกัน  
* ข้อ 6: ชื่อเดียวกันแต่ที่อยู่ไม่เหมือนกัน  
* *สาเหตุ:* ความผิดพลาดในการพิมพ์ (Typo), การใช้คำย่อ, หรือการเปลี่ยนแปลงที่อยู่จริง  
* *เทคนิค:* ต้องใช้การทำ Normalization (ปรับคำย่อ) และ Fuzzy String Matching (เปรียบเทียบความคล้ายคลึง)

---

## 2\. การออกแบบ Google Sheet (Schema Design)

เพื่อรองรับการแก้ไขปัญหาขั้นสูง ผมแนะนำให้แบ่ง Sheet ออกเป็น 3 ส่วน ไม่ควรเก็บปนกันในชีทเดียว

### Sheet 1: Raw\_Data (ข้อมูลดิบ)

เก็บข้อมูลที่ User กรอกเข้ามาทั้งหมด ห้ามลบ

| Column | Description |
| :---- | :---- |
| ID | รหัสอ้างอิงหลัก (Auto Generate) |
| Name\_Input | ชื่อที่กรอกมา (ตัวพิมพ์ใหญ่/เล็ก) |
| Address\_Input | ที่อยู่ที่กรอกมา |
| Lat\_Input | ละติจูด |
| Long\_Input | ลองจิจูด |
| Timestamp | วันเวลาที่กรอก |

### Sheet 2: Master\_Process (ข้อมูลที่ผ่านการปรับแต่ง)

ใช้สำหรับรัน Script ประมวลผล มีฟิลด์ช่วยตรวจจับ

| Column | Description | วัตถุประสงค์ |
| :---- | :---- | :---- |
| ID | (Ref from Raw) |  |
| Name\_Clean | ชื่อที่ตัดคำนำหน้า/ช่องว่างแล้ว | แก้ปัญหาข้อ 4 |
| Address\_Key | ที่อยู่ที่ตัดช่องว่าง/ตัดคำไม่จำเป็นแล้ว | แก้ปัญหาข้อ 2 |
| GeoHash | รหัสแฮชจาก Lat/Long (7 ตัวแรก) | แก้ปัญหาข้อ 3, 7, 8 (จัดกลุ่มพื้นที่ใกล้เคียง) |
| Status | Valid, Duplicate, Conflict, Review | สถานะข้อมูล |

### Sheet 3: Issue\_Report (รายงานปัญหา)

เก็บ Log ของปัญหาที่พบเพื่อ Admin มาตรวจสอบ

| Column | Description |
| :---- | :---- |
| Issue\_ID | รหัสปัญหา |
| Ref\_ID\_1 | ID ที่ 1 ที่มีปัญหา |
| Ref\_ID\_2 | ID ที่ 2 ที่มีปัญหา |
| Issue\_Type | ประเภทปัญหา (เช่น "Same Name Diff Location", "Fuzzy Name Match") |
| Similarity\_Score | ระดับความคล้ายคลึง (0-1) |

---

## 3\. Google Apps Script Solution (เทคนิคขั้นสูง)

เราจะใช้ Google Apps Script (GAS) ในการประมวลผล โดยใช้หลักการ "Batch Processing" (อ่านมาประมวลผลใน Memory ทีเดียว ไม่อ่านทีละแถว เพื่อความเร็ว)

### ฟังก์ชันหลักที่ต้องเขียน

#### 1\. ฟังก์ชัน Normalize (ทำข้อมูลให้เป็นมาตรฐาน)

ใช้แก้ปัญหาข้อ 4 (ชื่อเขียนไม่เหมือนกัน) และเตรียมข้อมูลเปรียบเทียบ

javascript  
function normalizeText(text) {  
 if (\!text) return "";  
 // 1\. ตัดช่องว่างหน้าหลัง  
 let clean \= text.trim();  
 // 2\. แปลงเป็นตัวพิมพ์เล็ก (Case Insensitive)  
 clean \= clean.toLowerCase();  
 // 3\. แทนที่คำย่อที่พบบ่อย (ต้องมี Dictionary ช่วย)  
 clean \= clean.replace(/บจก\\./g, "บริษัท");  
 clean \= clean.replace(/บริษัทจำกัด/g, "บริษัท");  
 // 4\. ตัดอักขระพิเศษออก เก็บแค่ตัวอักษรและตัวเลข  
 clean \= clean.replace(/\[^a-z0-9ก-๛\]/g, "");  
 return clean;  
}

#### 2\. ฟังก์ชันคำนวณระยะทาง (Haversine Distance)

ใช้แก้ปัญหาข้อ 3, 7, 8 (เรื่อง LatLong)

javascript  
function getDistanceInMeters(lat1, lon1, lat2, lon2) {  
 // คำนวณระยะทางระหว่างจุดพิกัด 2 จุด  
 const R \= 6371e3; // รัศมีโลก (เมตร)  
 const φ1 \= lat1 \* Math.PI / 180;  
 const φ2 \= lat2 \* Math.PI / 180;  
 const Δφ \= (lat2 \- lat1) \* Math.PI / 180;  
 const Δλ \= (lon2 \- lon1) \* Math.PI / 180;

 const a \= Math.sin(Δφ / 2) \* Math.sin(Δφ / 2) \+  
           Math.cos(φ1) \* Math.cos(φ2) \*  
           Math.sin(Δλ / 2) \* Math.sin(Δλ / 2);  
 const c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1 \- a));

 return R \* c; // คืนค่าเป็นเมตร  
}

#### 3\. ฟังก์ชันตรวจจับความคล้ายคลึง (Levenshtein Distance)

ใช้แก้ปัญหาข้อ 1, 4, 5 (การสะกดต่างกันเล็กน้อย)

javascript  
function calculateSimilarity(s1, s2) {  
 // ใช้ Levenshtein Distance Algorithm  
 // คืนค่า 0-1 (1 คือเหมือนมาก)  
 // โค้ดนี้เป็นแนวคิด ใช้ Library มาตรฐานหรือเขียนเองได้  
 // ... (Implementation มาตรฐาน) ...  
 return similarityScore;  
}

#### 4\. ฟังก์ชัน GeoHash Generator (เทคนิคขั้นสูง)

แทนที่จะเปรียบเทียบ Lat/Long ทีละคู่ (ซึ่งช้ามาก O(n^2)) เราจะแปลงพิกัดเป็น "รหัสพื้นที่"

javascript  
function getGeoHash(lat, lng, precision \= 7) {  
 // แปลง Lat/Long เป็น String เช่น "w3r8g2k"  
 // พื้นที่ใกล้เคียงกันจะมี Prefix ตรงกัน  
 // ใช้ Library ภายนอกหรือเขียน Logic เองใน GAS ได้  
 return geoHashString;  
}  
---

## 4\. โครงสร้าง Logic การตรวจสอบ (Detection Logic Workflow)

เมื่อผู้ใช้กดปุ่ม "ตรวจสอบข้อมูล" Script จะทำงานดังนี้:

1. Load Data: ดึงข้อมูลจาก Raw\_Data มาเก็บใน Array (Memory)  
2. Pre-processing:  
   * สร้าง Name\_Clean จาก Name\_Input  
   * สร้าง GeoHash จาก LatLong  
3. Grouping (Data Structuring):  
   * สร้าง Object Map ที่ Key เป็น Name\_Clean \-\> เก็บ Array ของ ID ที่ชื่อซ้ำกัน  
   * สร้าง Object Map ที่ Key เป็น GeoHash \-\> เก็บ Array ของ ID ที่อยู่ใกล้กัน  
   * สร้าง Object Map ที่ Key เป็น Address\_Key \-\> เก็บ Array ของ ID  
4. Analysis Loop (ตรวจสอบเงื่อนไข):  
   * Case 1: Exact Duplicate (ข้อ 1, 2, 3\)  
     * วิธี: ตรวจสอบว่า Name\_Clean, Address\_Key หรือ GeoHash ตรงกันทั้งหมดหรือไม่  
     * Action: ระบุว่าเป็น Duplicate, ซ่อนแถวหรือเก็บเข้า Log  
   * Case 2: Name Conflict (ข้อ 7\)  
     * วิธี: ดูใน Map ของ Name\_Clean ที่มี ID มากกว่า 1 ตัว  
     * Logic: นำ LatLong ของ ID ทั้งสองมาหาระยะทาง (ใช้ฟังก์ชัน getDistanceInMeters)  
     * Action: ถ้าระยะทาง \> 100 เมตร \-\> Log: "ชื่อเดียวกันแต่ที่อยู่ห่างกัน"  
   * Case 3: Location Conflict (ข้อ 8\)  
     * วิธี: ดูใน Map ของ GeoHash (หรือตำแหน่งใกล้เคียงกัน)  
     * Logic: ถ้า GeoHash เดียวกันแต่ Name\_Clean ต่างกัน  
     * Action: Log: "คนละชื่อแต่ LatLong เดียวกัน" (อาจเป็นคอนโด/ตึกแถว)  
   * Case 4: Fuzzy Matching (ข้อ 4, 5, 6\)  
     * วิธี: สำหรับชื่อที่ยังไม่ได้จับคู่ ให้วิ่งเช็คกับ Fuzzy String Matching  
     * Logic: if (calculateSimilarity(nameA, nameB) \> 0.85)  
     * Action: Log: "ชื่อคล้ายกัน (อาจสะกดผิด)" หรือ "ที่อยู่เดียวกันแต่ชื่อต่าง"

---

## 5\. สรุปคำสั่ง Google Apps Script ที่แนะนำ

ถ้าคุณต้องการเขียน Script ขึ้นมาจริง นี่คือส่วนประกอบที่ต้องใช้:

1. SpreadsheetApp.getActiveSpreadsheet(): เข้าถึงไฟล์  
2. getDataRange().getValues(): ดึงข้อมูลทั้งหมดมาเป็น 2D Array (เร็วกว่า getValue ทีละช่อง)  
3. map() และ filter(): ใช้กรองข้อมูลและแปลงข้อมูลใน Array (Functional Programming)  
4. Custom Algorithms:  
   * levenshteinDistance() (สำหรับเช็คชื่อผิด/ถูก)  
   * calculateDistance() (สำหรับเช็คพิกัด)  
5. setValues(): เขียนผลลัพธ์ลง Sheet Issue\_Report

ตัวอย่าง Workflow Code (Pseudo-code):

javascript  
function runDataValidation() {  
 const ss \= SpreadsheetApp.getActiveSpreadsheet();  
 const rawSheet \= ss.getSheetByName("Raw\_Data");  
 const reportSheet \= ss.getSheetByName("Issue\_Report");  
  // 1\. ดึงข้อมูล  
 const data \= rawSheet.getDataRange().getValues();  
  // 2\. สร้าง Index Maps (เทคนิค Indexing เพื่อความเร็ว)  
 let nameMap \= {};  
 let geoMap \= {};  
  data.forEach((row, index) \=\> {  
   let cleanName \= normalizeText(row\[1\]); // Column ชื่อ  
   let geoKey \= row\[3\] \+ "," \+ row\[4\]; // Lat,Long หรือ GeoHash  
    
   // เก็บประวัติชื่อซ้ำ  
   if (\!nameMap\[cleanName\]) nameMap\[cleanName\] \= \[\];  
   nameMap\[cleanName\].push(index);  
    
   // เก็บประวัติพิกัดซ้ำ  
   if (\!geoMap\[geoKey\]) geoMap\[geoKey\] \= \[\];  
   geoMap\[geoKey\].push(index);  
 });

 // 3\. วิเคราะห์ปัญหา (Detection)  
 let issues \= \[\];  
  // เช็คปัญหาข้อ 7: ชื่อเดียวกัน แต่ที่อยู่ต่างกัน (ใช้ Name Map)  
 for (let name in nameMap) {  
   if (nameMap\[name\].length \> 1) {  
     // มีชื่อซ้ำ ให้เช็ค LatLong ของแต่ละตัวว่าห่างกันไหม  
     // ... Logic การวัดระยะ ...  
     issues.push(\["Duplicate Name Conflict", name, "รายละเอียด..."\]);  
   }  
 }  
  // เช็คปัญหาข้อ 8: ชื่อต่างกัน แต่พิกัดเดียวกัน (ใช้ Geo Map)  
 for (let geo in geoMap) {  
   if (geoMap\[geo\].length \> 1) {  
     // มีพิกัดซ้ำ ให้เช็คชื่อว่าต่างกันไหม  
     // ... Logic การเปรียบเทียบชื่อ ...  
     issues.push(\["Same Location Conflict", geo, "พบหลายชื่อในจุดเดียว"\]);  
   }  
 }

 // 4\. เขียนรายงาน  
 if (issues.length \> 0) {  
   reportSheet.getRange(1, 1, issues.length, 3).setValues(issues);  
 }  
}

### สรุป

การออกแบบนี้แก้ปัญหาโดยใช้หลักการ Entity Resolution ครับ

1. ใช้ Normalization จัดการเรื่องการเขียนไม่เหมือนกัน (ข้อ 4\)  
2. ใช้ Map/Dictionary จัดการเรื่องการซ้ำแบบตรงตัว (ข้อ 1, 2, 5, 6\)  
3. ใช้ Geospatial Logic (Distance/GeoHash) จัดการเรื่องพิกัด (ข้อ 3, 7, 8\)

วิธีนี้จะช่วยให้คุณจัดการข้อมูลได้อัตโนมัติและแม่นยำครับ

