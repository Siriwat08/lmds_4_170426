ผมเข้าใจปัญหาที่คุณเจอครับ เป็นปัญหาคลาสสิกมากในการจัดการข้อมูลสถานที่/ลูกค้า ผมจะออกแบบโครงสร้าง Google Sheet พร้อม Google Apps Script ให้ครับ

\---

\#\# 📊 โครงสร้าง Google Sheets (4 Sheets)

\#\#\# \*\*Sheet 1: Raw\_Data\*\* (ข้อมูลดิบที่รับเข้ามา)  
| คอลัมน์ | รายละเอียด |  
|---------|-----------|  
| A: ID | รหัสอัตโนมัติ (Auto-generated) |  
| B: ชื่อที่รับเข้า | ชื่อที่ผู้ใช้กรอก |  
| C: ที่อยู่ที่รับเข้า | ที่อยู่ที่ผู้ใช้กรอก |  
| D: Latitude | พิกัดละติจูด |  
| E: Longitude | พิกัดลองจิจูด |  
| F: Timestamp | เวลาที่บันทึก |  
| G: Status | สถานะ: NEW / DUPLICATE / MERGED |

\---

\#\#\# \*\*Sheet 2: Master\_Data\*\* (ข้อมูลสะอาด ไม่ซ้ำ)  
| คอลัมน์ | รายละเอียด |  
|---------|-----------|  
| A: Master\_ID | รหัสหลัก (M001, M002...) |  
| B: Standard\_Name | ชื่อมาตรฐาน (หลัง Clean) |  
| C: Standard\_Address | ที่อยู่มาตรฐาน |  
| D: Latitude | พิกัด |  
| E: Longitude | พิกัด |  
| F: Source\_IDs | รวม ID ดิบที่เชื่อมโยง (ID1,ID2,ID3) |  
| G: Name\_Variations | ชื่อทางเลือกที่พบ (JSON) |  
| H: Address\_Variations | ที่อยู่ทางเลือกที่พบ |  
| I: Confidence\_Score | คะแนนความมั่นใจ (0-100%) |  
| J: Last\_Updated | อัปเดตล่าสุด |

\---

\#\#\# \*\*Sheet 3: Duplicates\_Log\*\* (บันทึกการตรวจพบซ้ำ)  
| คอลัมน์ | รายละเอียด |  
|---------|-----------|  
| A: Log\_ID | รหัสบันทึก |  
| B: Raw\_ID | ID ข้อมูลดิบ |  
| C: Matched\_Master\_ID | เชื่อมกับ Master ไหน |  
| D: Duplicate\_Type | ประเภทซ้ำ (Name/Address/LatLng/Combined) |  
| E: Match\_Score | คะแนนการจับคู่ |  
| F: Action\_Taken | การดำเนินการ (Merge/Review/Ignore) |

\---

\#\#\# \*\*Sheet 4: Validation\_Rules\*\* (กฎการตรวจสอบ)  
| คอลัมน์ | รายละเอียด |  
|---------|-----------|  
| A: Rule\_ID | รหัสกฎ |  
| B: Rule\_Name | ชื่อกฎ |  
| C: Threshold | ค่าขีดแบ่ง (เช่น 80% similarity) |  
| D: LatLng\_Radius\_Meters | รัศมีที่ถือว่าเป็นที่เดียวกัน (เช่น 100m) |

\---

\#\# 🔧 Google Apps Script \- ฟังก์ชันหลัก

\#\#\# \*\*ไฟล์: Code.gs\*\*

\`\`\`javascript  
/\*\*  
 \* \============================================  
 \* DATA CLEANING & DEDUPLICATION SYSTEM  
 \* \============================================  
 \*/

// \============ CONFIGURATION \============  
const CONFIG \= {  
  SHEET\_NAMES: {  
    RAW: 'Raw\_Data',  
    MASTER: 'Master\_Data',  
    LOG: 'Duplicates\_Log',  
    RULES: 'Validation\_Rules'  
  },  
  THRESHOLDS: {  
    NAME\_SIMILARITY: 0.85,      // 85% ชื่อเหมือนกัน  
    ADDRESS\_SIMILARITY: 0.80,   // 80% ที่อยู่เหมือนกัน  
    LATLNG\_DISTANCE\_METERS: 100 // 100 เมตร \= ที่เดียวกัน  
  }  
};

// \============ 1\. TRIGGER: รันทุกครั้งที่มีการเพิ่มข้อมูล \============  
function onEdit(e) {  
  const sheet \= e.source.getActiveSheet();  
  if (sheet.getName() \=== CONFIG.SHEET\_NAMES.RAW) {  
    processNewEntry(e.range.getRow());  
  }  
}

// \============ 2\. MAIN FUNCTION: ประมวลผลข้อมูลใหม่ \============  
function processNewEntry(row) {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const rawSheet \= ss.getSheetByName(CONFIG.SHEET\_NAMES.RAW);  
    
  // ดึงข้อมูลแถวที่เพิ่ม  
  const data \= rawSheet.getRange(row, 1, 1, 5).getValues()\[0\];  
  const newRecord \= {  
    id: data\[0\],  
    name: cleanText(data\[1\]),  
    address: cleanText(data\[2\]),  
    lat: parseFloat(data\[3\]),  
    lng: parseFloat(data\[4\])  
  };  
    
  // ตรวจสอบซ้ำ  
  const duplicateCheck \= checkForDuplicates(newRecord);  
    
  if (duplicateCheck.isDuplicate) {  
    // อัปเดตสถานะเป็น DUPLICATE  
    rawSheet.getRange(row, 7).setValue('DUPLICATE');  
    // บันทึกลง Log  
    logDuplicate(newRecord, duplicateCheck);  
    // เชื่อมโยงกับ Master  
    linkToMaster(newRecord, duplicateCheck.masterId);  
  } else {  
    // สร้าง Master ใหม่  
    rawSheet.getRange(row, 7).setValue('NEW');  
    createNewMaster(newRecord);  
  }  
}

// \============ 3\. DUPLICATE DETECTION ENGINE \============  
function checkForDuplicates(record) {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAMES.MASTER);  
  const masterData \= masterSheet.getDataRange().getValues();  
    
  let bestMatch \= {  
    isDuplicate: false,  
    masterId: null,  
    matchType: \[\],  
    confidence: 0  
  };  
    
  // วนลูปตรวจสอบกับ Master ทั้งหมด  
  for (let i \= 1; i \< masterData.length; i++) {  
    const master \= {  
      id: masterData\[i\]\[0\],  
      name: masterData\[i\]\[1\],  
      address: masterData\[i\]\[2\],  
      lat: masterData\[i\]\[3\],  
      lng: masterData\[i\]\[4\]  
    };  
      
    // ตรวจสอบหลายมิติ  
    const nameScore \= calculateSimilarity(record.name, master.name);  
    const addressScore \= calculateSimilarity(record.address, master.address);  
    const distance \= calculateDistance(record.lat, record.lng, master.lat, master.lng);  
      
    // เงื่อนไขการจับคู่ (แก้ปัญหาทั้ง 8 ข้อ)  
    const isNameMatch \= nameScore \>= CONFIG.THRESHOLDS.NAME\_SIMILARITY;  
    const isAddressMatch \= addressScore \>= CONFIG.THRESHOLDS.ADDRESS\_SIMILARITY;  
    const isLocationMatch \= distance \<= CONFIG.THRESHOLDS.LATLNG\_DISTANCE\_METERS;  
      
    // คำนวณคะแนนรวม  
    let matchTypes \= \[\];  
    if (isNameMatch) matchTypes.push('NAME');  
    if (isAddressMatch) matchTypes.push('ADDRESS');  
    if (isLocationMatch) matchTypes.push('LATLNG');  
      
    // ถ้าตรงกันอย่างน้อย 2 อย่าง \= น่าจะเป็นข้อมูลเดียวกัน  
    if (matchTypes.length \>= 2\) {  
      const confidence \= (nameScore \+ addressScore \+ (isLocationMatch ? 1 : 0)) / 3;  
        
      if (confidence \> bestMatch.confidence) {  
        bestMatch \= {  
          isDuplicate: true,  
          masterId: master.id,  
          matchType: matchTypes,  
          confidence: confidence,  
          details: {  
            nameScore: nameScore,  
            addressScore: addressScore,  
            distance: distance  
          }  
        };  
      }  
    }  
  }  
    
  return bestMatch;  
}

// \============ 4\. STRING SIMILARITY (Levenshtein Distance) \============  
function calculateSimilarity(str1, str2) {  
  if (\!str1 || \!str2) return 0;  
    
  str1 \= cleanText(str1);  
  str2 \= cleanText(str2);  
    
  // ถ้าตรงกันเป๊ะ  
  if (str1 \=== str2) return 1;  
    
  // คำนวณ Levenshtein Distance  
  const len1 \= str1.length;  
  const len2 \= str2.length;  
  const matrix \= \[\];  
    
  for (let i \= 0; i \<= len1; i++) {  
    matrix\[i\] \= \[i\];  
  }  
  for (let j \= 0; j \<= len2; j++) {  
    matrix\[0\]\[j\] \= j;  
  }  
    
  for (let i \= 1; i \<= len1; i++) {  
    for (let j \= 1; j \<= len2; j++) {  
      const cost \= str1\[i-1\] \=== str2\[j-1\] ? 0 : 1;  
      matrix\[i\]\[j\] \= Math.min(  
        matrix\[i-1\]\[j\] \+ 1,      // deletion  
        matrix\[i\]\[j-1\] \+ 1,      // insertion  
        matrix\[i-1\]\[j-1\] \+ cost  // substitution  
      );  
    }  
  }  
    
  const distance \= matrix\[len1\]\[len2\];  
  return 1 \- (distance / Math.max(len1, len2));  
}

// \============ 5\. GEO DISTANCE CALCULATION (Haversine Formula) \============  
function calculateDistance(lat1, lng1, lat2, lng2) {  
  const R \= 6371000; // รัศมีโลกในเมตร  
  const φ1 \= lat1 \* Math.PI / 180;  
  const φ2 \= lat2 \* Math.PI / 180;  
  const Δφ \= (lat2 \- lat1) \* Math.PI / 180;  
  const Δλ \= (lng2 \- lng1) \* Math.PI / 180;  
    
  const a \= Math.sin(Δφ/2) \* Math.sin(Δφ/2) \+  
            Math.cos(φ1) \* Math.cos(φ2) \*  
            Math.sin(Δλ/2) \* Math.sin(Δλ/2);  
  const c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  
    
  return R \* c; // ระยะทางเป็นเมตร  
}

// \============ 6\. TEXT CLEANING (แก้ปัญหาข้อ 4\) \============  
function cleanText(text) {  
  if (\!text) return '';  
    
  return text  
    .toString()  
    .toLowerCase()  
    .replace(/\[.,\\/\#\!$%\\^&\\\*;:{}=\\-\_\`\~()\]/g, '') // ลบเครื่องหมายพิเศษ  
    .replace(/\\s+/g, ' ')                        // ลบ space ซ้ำ  
    .replace(/^(ร้าน|บริษัท|ห้าง|สถานี|วัด)/, '') // ลบคำนำหน้าที่อาจหายไป  
    .replace(/(จังหวัด|อำเภอ|ตำบล|เขต)/, '')     // ลบคำบรรยายที่อยู่  
    .trim();  
}

// \============ 7\. CREATE NEW MASTER RECORD \============  
function createNewMaster(record) {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAMES.MASTER);  
    
  const newId \= 'M' \+ Utilities.formatString('%03d', masterSheet.getLastRow());  
  const now \= new Date();  
    
  masterSheet.appendRow(\[  
    newId,  
    record.name,           // Standard Name  
    record.address,        // Standard Address  
    record.lat,  
    record.lng,  
    record.id,             // Source\_IDs  
    JSON.stringify(\[record.name\]),   // Name\_Variations  
    JSON.stringify(\[record.address\]), // Address\_Variations  
    100,                   // Confidence 100% (ข้อมูลแรก)  
    now  
  \]);  
}

// \============ 8\. LINK TO EXISTING MASTER \============  
function linkToMaster(record, masterId) {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAMES.MASTER);  
  const data \= masterSheet.getDataRange().getValues();  
    
  // หาแถวของ Master  
  for (let i \= 1; i \< data.length; i++) {  
    if (data\[i\]\[0\] \=== masterId) {  
      // อัปเดต Source\_IDs  
      const currentSources \= data\[i\]\[5\].toString();  
      const newSources \= currentSources \+ ',' \+ record.id;  
        
      // อัปเดต Name Variations (ถ้าชื่อต่าง)  
      let nameVars \= JSON.parse(data\[i\]\[6\] || '\[\]');  
      if (\!nameVars.includes(record.name)) {  
        nameVars.push(record.name);  
      }  
        
      // อัปเดต Address Variations (ถ้าที่อยู่ต่าง)  
      let addrVars \= JSON.parse(data\[i\]\[7\] || '\[\]');  
      if (\!addrVars.includes(record.address)) {  
        addrVars.push(record.address);  
      }  
        
      // เขียนกลับ  
      masterSheet.getRange(i+1, 6).setValue(newSources);  
      masterSheet.getRange(i+1, 7).setValue(JSON.stringify(nameVars));  
      masterSheet.getRange(i+1, 8).setValue(JSON.stringify(addrVars));  
      masterSheet.getRange(i+1, 10).setValue(new Date());  
        
      break;  
    }  
  }  
}

// \============ 9\. LOG DUPLICATE \============  
function logDuplicate(record, checkResult) {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const logSheet \= ss.getSheetByName(CONFIG.SHEET\_NAMES.LOG);  
    
  const logId \= 'L' \+ Utilities.formatString('%04d', logSheet.getLastRow());  
    
  logSheet.appendRow(\[  
    logId,  
    record.id,  
    checkResult.masterId,  
    checkResult.matchType.join('+'),  
    (checkResult.confidence \* 100).toFixed(2) \+ '%',  
    'Auto-Merged',  
    new Date(),  
    JSON.stringify(checkResult.details)  
  \]);  
}

// \============ 10\. BATCH PROCESS (รันทั้งหมด) \============  
function batchProcessAll() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const rawSheet \= ss.getSheetByName(CONFIG.SHEET\_NAMES.RAW);  
  const lastRow \= rawSheet.getLastRow();  
    
  // เริ่มจากแถว 2 (ข้าม header)  
  for (let row \= 2; row \<= lastRow; row++) {  
    const status \= rawSheet.getRange(row, 7).getValue();  
    if (\!status) { // ถ้ายังไม่ประมวลผล  
      processNewEntry(row);  
      Utilities.sleep(100); // ป้องกัน timeout  
    }  
  }  
}

// \============ 11\. MANUAL REVIEW INTERFACE \============  
function showReviewUI() {  
  const html \= HtmlService.createHtmlOutputFromFile('ReviewPanel')  
    .setWidth(800)  
    .setHeight(600);  
  SpreadsheetApp.getUi().showModalDialog(html, 'Review Potential Duplicates');  
}

// \============ 12\. GET CONFLICTS FOR REVIEW \============  
function getConflictsForReview() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const logSheet \= ss.getSheetByName(CONFIG.SHEET\_NAMES.LOG);  
  const data \= logSheet.getDataRange().getValues();  
    
  const conflicts \= \[\];  
  for (let i \= 1; i \< data.length; i++) {  
    if (data\[i\]\[5\] \=== 'Pending Review') {  
      conflicts.push({  
        logId: data\[i\]\[0\],  
        rawId: data\[i\]\[1\],  
        masterId: data\[i\]\[2\],  
        type: data\[i\]\[3\],  
        confidence: data\[i\]\[4\]  
      });  
    }  
  }  
  return conflicts;  
}  
\`\`\`

\---

\#\# 🎨 HTML Interface (ReviewPanel.html)

\`\`\`html  
\<\!DOCTYPE html\>  
\<html\>  
\<head\>  
  \<base target="\_top"\>  
  \<style\>  
    body { font-family: 'Sarabun', sans-serif; padding: 20px; }  
    .conflict-card {   
      border: 1px solid \#ddd;   
      border-radius: 8px;   
      padding: 15px;   
      margin-bottom: 15px;  
      background: \#f9f9f9;  
    }  
    .match-high { border-left: 4px solid \#4CAF50; }  
    .match-medium { border-left: 4px solid \#FF9800; }  
    .match-low { border-left: 4px solid \#f44336; }  
    button {   
      padding: 8px 16px;   
      margin: 5px;   
      border: none;   
      border-radius: 4px;  
      cursor: pointer;  
    }  
    .btn-merge { background: \#4CAF50; color: white; }  
    .btn-separate { background: \#f44336; color: white; }  
    .btn-review { background: \#FF9800; color: white; }  
  \</style\>  
\</head\>  
\<body\>  
  \<h2\>🔍 ตรวจสอบข้อมูลที่อาจซ้ำกัน\</h2\>  
  \<div id="conflicts-container"\>  
    \<p\>กำลังโหลด...\</p\>  
  \</div\>  
    
  \<script\>  
    function loadConflicts() {  
      google.script.run  
        .withSuccessHandler(renderConflicts)  
        .getConflictsForReview();  
    }  
      
    function renderConflicts(data) {  
      const container \= document.getElementById('conflicts-container');  
      if (data.length \=== 0\) {  
        container.innerHTML \= '\<p\>✅ ไม่มีข้อมูลรอการตรวจสอบ\</p\>';  
        return;  
      }  
        
      let html \= '';  
      data.forEach(item \=\> {  
        const confidence \= parseFloat(item.confidence);  
        let className \= confidence \> 90 ? 'match-high' :   
                       confidence \> 70 ? 'match-medium' : 'match-low';  
          
        html \+= \`  
          \<div class="conflict-card ${className}"\>  
            \<h4\>ประเภท: ${item.type} (ความมั่นใจ: ${item.confidence})\</h4\>  
            \<p\>\<strong\>Raw ID:\</strong\> ${item.rawId}\</p\>  
            \<p\>\<strong\>Master ID:\</strong\> ${item.masterId}\</p\>  
            \<div\>  
              \<button class="btn-merge" onclick="resolve('${item.logId}', 'merge')"\>  
                ✅ รวมเป็นข้อมูลเดียวกัน  
              \</button\>  
              \<button class="btn-separate" onclick="resolve('${item.logId}', 'separate')"\>  
                ❌ เป็นคนละข้อมูล  
              \</button\>  
              \<button class="btn-review" onclick="resolve('${item.logId}', 'review')"\>  
                🔍 ตรวจสอบเพิ่มเติม  
              \</button\>  
            \</div\>  
          \</div\>  
        \`;  
      });  
      container.innerHTML \= html;  
    }  
      
    function resolve(logId, action) {  
      google.script.run.resolveConflict(logId, action);  
      loadConflicts(); // โหลดใหม่  
    }  
      
    // โหลดตอนเปิด  
    loadConflicts();  
  \</script\>  
\</body\>  
\</html\>  
\`\`\`

\---

\#\# 📋 วิธีใช้งาน

\#\#\# \*\*ขั้นตอนที่ 1: ตั้งค่า Sheet\*\*  
1\. สร้าง Google Sheet ใหม่  
2\. สร้าง 4 Sheets ตามชื่อด้านบน  
3\. ใส่ Header ตามที่ระบุ

\#\#\# \*\*ขั้นตอนที่ 2: ติดตั้ง Apps Script\*\*  
1\. เมนู \*\*Extensions → Apps Script\*\*  
2\. ลบโค้ดเดิม วางโค้ดด้านบนลงไป  
3\. บันทึก (Ctrl+S)

\#\#\# \*\*ขั้นตอนที่ 3: ตั้งค่า Trigger\*\*  
1\. ใน Apps Script คลิก \*\*Triggers\*\* (นาฬิกาซ้ายล่าง)  
2\. \*\*Add Trigger\*\* → เลือกฟังก์ชัน \`onEdit\`  
3\. เลือก \*\*From spreadsheet\*\* → \*\*On edit\*\*

\#\#\# \*\*ขั้นตอนที่ 4: ทดสอบ\*\*  
1\. ใส่ข้อมูลใน Sheet Raw\_Data  
2\. ระบบจะทำงานอัตโนมัติ  
3\. ตรวจสอบผลใน Master\_Data และ Duplicates\_Log

\---

\#\# 🎯 แก้ปัญหาทั้ง 8 ข้ออย่างไร?

| ปัญหา | วิธีแก้ในระบบ |  
|-------|--------------|  
| 1\. ชื่อซ้ำ | \`calculateSimilarity()\` \+ Threshold 85% |  
| 2\. ที่อยู่ซ้ำ | \`calculateSimilarity()\` สำหรับ address |  
| 3\. LatLong ซ้ำ | \`calculateDistance()\` \< 100m |  
| 4\. ชื่อเขียนไม่เหมือนกัน | \`cleanText()\` มาตรฐานก่อนเปรียบเทียบ |  
| 5\. คนละชื่อ ที่อยู่เดียวกัน | จับคู่ที่อยู่ \+ เก็บ name variations |  
| 6\. ชื่อเดียวกัน ที่อยู่ต่างกัน | จับคู่ชื่อ \+ เก็บ address variations |  
| 7\. ชื่อเดียวกัน LatLong ต่างกัน | ตรวจสอบระยะทาง อาจเป็นสาขา |  
| 8\. คนละชื่อ LatLong เดียวกัน | ตรวจสอบว่าเป็นชื่อย่อ/ชื่อเต็ม |

\---

ต้องการให้ผมอธิบายส่วนไหนเพิ่มเติม หรือปรับแต่งฟังก์ชันให้เหมาะกับ use case ของคุณมากขึ้นไหมครับ? 🛠️  
