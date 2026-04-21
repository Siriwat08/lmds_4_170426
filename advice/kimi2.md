 ผมเข้าใจครับว่าคุณต้องการให้ระบบนี้ทำงานได้จริง โดยเฉพาะการสร้างฐานข้อมูลที่สมบูรณ์ ผมจะวิเคราะห์โค้ดชุดนี้และแก้ไขจุดที่ขาดหายไปครับ

\#\# 🔍 วิเคราะห์ปัญหาที่พบ

จากการตรวจสอบโค้ด มีหลายจุดที่ต้องแก้ไขเพื่อให้ระบบทำงานได้สมบูรณ์:

\#\#\# 1\. \*\*Config.gs\*\* \- ขาด \`SCG\_CONFIG\` นิยามซ้ำ  
\#\#\# 2\. \*\*Service\_Master.gs\*\* \- \`processClustering()\` อ้างอิงคอลัมน์ผิด (อ่านถึง Col 15 แต่ใช้งานถึง Col 17\)  
\#\#\# 3\. \*\*Service\_GeoAddr.gs\*\* \- \`parseAddressFromText()\` มีบั๊ก index array  
\#\#\# 4\. \*\*Service\_SCG.gs\*\* \- \`applyMasterCoordinatesToDailyJob()\` อ้างอิงคอลัมน์ผิดหลายจุด  
\#\#\# 5\. \*\*Service\_Agent.gs\*\* \- \`CONFIG.COL\_UUID\` อาจเป็น undefined

\---

\#\# 🛠️ โค้ดที่แก้ไขแล้ว (Full Code)

\#\#\# \*\*Config.gs\*\* (แก้ไข: เพิ่มการตรวจสอบ SCG\_CONFIG ซ้ำ)  
\`\`\`javascript  
/\*\*  
 \* ⚙️ รายชื่อตัวแปรและค่าคงที่ (Global Config)  
 \* อ้างอิงจากเอกสาร (V1) Logistics Master Data System  
 \*   
 \* \[แก้ไขล่าสุด: ป้องกันการประกาศตัวแปรซ้ำ\]  
 \*/

var CONFIG \= {  
  SHEET\_NAME: "Database",  
  MAPPING\_SHEET: "NameMapping",  
  SOURCE\_SHEET: "SCGนครหลวงJWDภูมิภาค",  
    
  // 🧠 AI CONFIGURATION  
  // ไปขอ Key ฟรีได้ที่: https://aistudio.google.com/app/apikey  
  GEMINI\_API\_KEY: "AIzaSyCBCwpiLQWuSJy37Y0lrkWLLdcHE5CU4sU",   
  USE\_AI\_AUTO\_FIX: true,

  // 🔴 พิกัดคลังสินค้า (Center Point)  
  DEPOT\_LAT: 14.164688,     
  DEPOT\_LNG: 100.625354,

  // คอลัมน์ Master (Index เริ่มที่ 1 \= A)  
  COL\_NAME: 1,      // A: ชื่อลูกค้า  
  COL\_LAT: 2,       // B: Latitude  
  COL\_LNG: 3,       // C: Longitude  
  COL\_SUGGESTED: 4, // D: ชื่อที่ระบบแนะนำ  
  COL\_CONFIDENCE: 5,// E: ความมั่นใจ  
  COL\_NORMALIZED: 6,// F: ชื่อที่ Clean แล้ว  
  COL\_VERIFIED: 7,  // G: สถานะตรวจสอบ (Checkbox)  
  COL\_SYS\_ADDR: 8,  // H: ที่อยู่จากระบบต้นทาง  
  COL\_ADDR\_GOOG: 9, // I: ที่อยู่จาก Google Maps  
  COL\_DIST\_KM: 10,  // J: ระยะทางจากคลัง  
    
  // Enterprise Columns (UUID & Meta)  
  COL\_UUID: 11,     // K: Unique ID  
  COL\_PROVINCE: 12, // L: จังหวัด  
  COL\_DISTRICT: 13, // M: อำเภอ  
  COL\_POSTCODE: 14, // N: รหัสไปรษณีย์  
  COL\_QUALITY: 15,  // O: Quality Score  
  COL\_CREATED: 16,  // P: วันที่สร้าง (Created)  
  COL\_UPDATED: 17,  // Q: วันที่แก้ไขล่าสุด (Updated)

  DISTANCE\_THRESHOLD\_KM: 0.05,     
  BATCH\_LIMIT: 50,      
  DEEP\_CLEAN\_LIMIT: 100     
};

// Config สำหรับ SCG API & Daily Operation  
// \[แก้ไข\]: ใช้ typeof ตรวจสอบก่อนประกาศ เพื่อป้องกันการซ้ำ  
if (typeof SCG\_CONFIG \=== 'undefined') {  
  var SCG\_CONFIG \= {  
    SHEET\_DATA: 'Data',  
    SHEET\_INPUT: 'Input',  
    SHEET\_EMPLOYEE: 'ข้อมูลพนักงาน',  
    API\_URL: 'https://fsm.scgjwd.com/Monitor/SearchDelivery',  
    INPUT\_START\_ROW: 4,  
    COOKIE\_CELL: 'B1',  
    SHIPMENT\_STRING\_CELL: 'B3',  
    SHEET\_MASTER\_DB: 'Database',  
    SHEET\_MAPPING: 'NameMapping'  
  };  
}  
\`\`\`

\---

\#\#\# \*\*Service\_Master.gs\*\* (แก้ไข: อ่านข้อมูลให้ครบถึง Col Q)  
\`\`\`javascript  
/\*\*  
 \* 🧠 Service: Master Data Management  
 \*/

// \==========================================  
// 1\. IMPORT & SYNC  
// \==========================================

function syncNewDataToMaster() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sourceSheet \= ss.getSheetByName(CONFIG.SOURCE\_SHEET);  
  var masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
      
  if (\!sourceSheet || \!masterSheet) {   
    Browser.msgBox("❌ ไม่พบ Sheet (Source หรือ Database)");   
    return;   
  }

  // Mapping Column จาก Source (SCGนครหลวง...)  
  var SRC \= { NAME: 13, LAT: 15, LNG: 16, SYS\_ADDR: 19, DIST: 24, GOOG\_ADDR: 25 };

  var lastRowM \= masterSheet.getLastRow();  
  var existingNames \= {};  
      
  // โหลดชื่อเดิมเพื่อกันซ้ำ  
  if (lastRowM \> 1\) {  
    var mData \= masterSheet.getRange(2, CONFIG.COL\_NAME, lastRowM \- 1, 1).getValues();  
    mData.forEach(function(r) {   
      if (r\[0\]) existingNames\[normalizeText(r\[0\])\] \= true;   
    });  
  }

  var lastRowS \= sourceSheet.getLastRow();  
  if (lastRowS \< 2\) return;  
      
  var sData \= sourceSheet.getRange(2, 1, lastRowS \- 1, 25).getValues();  
  var newEntries \= \[\];  
  var currentBatch \= {};

  sData.forEach(function(row) {  
    var name \= row\[SRC.NAME \- 1\];  
    var lat \= row\[SRC.LAT \- 1\];  
    var lng \= row\[SRC.LNG \- 1\];  
        
    if (\!name || \!lat || \!lng) return;  
        
    var clean \= normalizeText(name);  
    // เช็คซ้ำทั้งใน DB และใน Batch ปัจจุบัน  
    if (\!existingNames\[clean\] && \!currentBatch\[clean\]) {  
      // \[แก้ไข\]: จองพื้นที่ถึง Col Q (17 คอลัมน์) ตาม Config  
      var newRow \= new Array(17).fill("");  
          
      newRow\[CONFIG.COL\_NAME \- 1\] \= name;  
      newRow\[CONFIG.COL\_LAT \- 1\] \= lat;  
      newRow\[CONFIG.COL\_LNG \- 1\] \= lng;  
      newRow\[CONFIG.COL\_VERIFIED \- 1\] \= false;     
      newRow\[CONFIG.COL\_SYS\_ADDR \- 1\] \= row\[SRC.SYS\_ADDR \- 1\];     
      newRow\[CONFIG.COL\_ADDR\_GOOG \- 1\] \= row\[SRC.GOOG\_ADDR \- 1\];     
      newRow\[CONFIG.COL\_DIST\_KM \- 1\] \= cleanDistance(row\[SRC.DIST \- 1\]);     
          
      // Enterprise Data  
      newRow\[CONFIG.COL\_UUID \- 1\] \= generateUUID();     
      newRow\[CONFIG.COL\_CREATED \- 1\] \= new Date();     
      newRow\[CONFIG.COL\_UPDATED \- 1\] \= new Date();  
          
      newEntries.push(newRow);  
      currentBatch\[clean\] \= true;  
    }  
  });

  if (newEntries.length \> 0\) {  
    masterSheet.getRange(lastRowM \+ 1, 1, newEntries.length, 17).setValues(newEntries);  
    Browser.msgBox("✅ นำเข้าข้อมูลใหม่ " \+ newEntries.length \+ " รายการ");  
  } else {  
    Browser.msgBox("👌 ไม่มีข้อมูลใหม่ที่ต้องนำเข้า");  
  }  
}

// \==========================================  
// 2\. DATA ENRICHMENT (GEO & CLUSTER)  
// \==========================================

function updateGeoData\_SmartCache() {     
  runDeepCleanBatch\_100();  
}

function autoGenerateMasterList\_Smart() {     
  processClustering();  
}

// \==========================================  
// 3\. DEEP CLEAN & VALIDATION  
// \==========================================

function runDeepCleanBatch\_100() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) return;

  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;

  var props \= PropertiesService.getScriptProperties();  
  var startRow \= parseInt(props.getProperty('DEEP\_CLEAN\_POINTER') || '2');  
      
  if (startRow \> lastRow) {  
    Browser.msgBox("🎉 ตรวจครบทุกแถวแล้วครับ\! (กดรีเซ็ตถ้าต้องการเริ่มใหม่)");  
    return;  
  }

  var endRow \= Math.min(startRow \+ CONFIG.DEEP\_CLEAN\_LIMIT \- 1, lastRow);  
  var numRows \= endRow \- startRow \+ 1;  
      
  // \[แก้ไข\]: อ่านข้อมูลถึง Col Q (17) ให้ครบตามโครงสร้าง  
  var range \= sheet.getRange(startRow, 1, numRows, 17);  
  var values \= range.getValues();  
      
  var origin \= CONFIG.DEPOT\_LAT \+ "," \+ CONFIG.DEPOT\_LNG;  
  var updatedCount \= 0;

  for (var i \= 0; i \< values.length; i++) {  
    var row \= values\[i\];  
    var lat \= row\[CONFIG.COL\_LAT \- 1\];  
    var lng \= row\[CONFIG.COL\_LNG \- 1\];  
    var googleAddr \= row\[CONFIG.COL\_ADDR\_GOOG \- 1\];  
    var distKM \= row\[CONFIG.COL\_DIST\_KM \- 1\];  
    var hasCoord \= (lat && lng && \!isNaN(lat) && \!isNaN(lng));  
    var changed \= false;

    // Task A: เติมที่อยู่และระยะทาง (ถ้าขาด)  
    if (hasCoord) {  
      if (\!googleAddr || googleAddr \=== "") {  
        var addr \= GET\_ADDR\_WITH\_CACHE(lat, lng);  
        if (addr && addr \!== "Error") {  
          row\[CONFIG.COL\_ADDR\_GOOG \- 1\] \= addr;  
          googleAddr \= addr;  
          changed \= true;  
        }  
      }  
      if (\!distKM || distKM \=== "") {  
        var km \= CALCULATE\_DISTANCE\_KM(origin, lat \+ "," \+ lng);  
        if (km) {   
          row\[CONFIG.COL\_DIST\_KM \- 1\] \= km;   
          changed \= true;   
        }  
      }  
    }  
        
    // Task B: เติม UUID (ถ้าขาด)  
    if (\!row\[CONFIG.COL\_UUID \- 1\]) {   
      row\[CONFIG.COL\_UUID \- 1\] \= generateUUID();   
      row\[CONFIG.COL\_CREATED \- 1\] \= row\[CONFIG.COL\_CREATED \- 1\] || new Date();   
      changed \= true;   
    }

    // Task C: แกะที่อยู่ลง Col L, M, N  
    if (googleAddr && (\!row\[CONFIG.COL\_PROVINCE \- 1\] || \!row\[CONFIG.COL\_DISTRICT \- 1\])) {  
       var parsed \= parseAddressFromText(googleAddr);  
       if (parsed.province) {  
         row\[CONFIG.COL\_PROVINCE \- 1\] \= parsed.province;  
         row\[CONFIG.COL\_DISTRICT \- 1\] \= parsed.district;  
         row\[CONFIG.COL\_POSTCODE \- 1\] \= parsed.postcode;  
         changed \= true;  
       }  
    }

    if (changed) {  
       row\[CONFIG.COL\_UPDATED \- 1\] \= new Date();  
       updatedCount++;  
    }  
  }

  if (updatedCount \> 0\) {  
    range.setValues(values);  
  }  
      
  props.setProperty('DEEP\_CLEAN\_POINTER', (endRow \+ 1).toString());  
  ss.toast("✅ ตรวจสอบช่วงแถว " \+ startRow \+ " ถึง " \+ endRow \+ "\\n(แก้ไข " \+ updatedCount \+ " รายการ)", "Deep Clean Status");  
}

function resetDeepCleanMemory() {  
  PropertiesService.getScriptProperties().deleteProperty('DEEP\_CLEAN\_POINTER');  
  Browser.msgBox("🔄 รีเซ็ตความจำแล้ว เริ่มต้นใหม่ที่แถว 2");  
}

// \==========================================  
// 4\. FINALIZE & MAPPING  
// \==========================================

function finalizeAndClean\_MoveToMapping() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
      
  if (\!masterSheet || \!mapSheet) {   
    Browser.msgBox("❌ ไม่พบ Sheet");   
    return;   
  }  
    
  var lastRow \= masterSheet.getLastRow();  
  if (lastRow \< 2\) return;

  var uuidMap \= {};  
  // \[แก้ไข\]: อ่านข้อมูลถึง Col Q (17)  
  var allData \= masterSheet.getRange(2, 1, lastRow \- 1, 17).getValues();  
      
  allData.forEach(function(row) {  
    var name \= normalizeText(row\[CONFIG.COL\_NAME \- 1\]);  
    var suggested \= normalizeText(row\[CONFIG.COL\_SUGGESTED \- 1\]);  
    var uuid \= row\[CONFIG.COL\_UUID \- 1\];  
        
    if (uuid) {  
      if (name) uuidMap\[name\] \= uuid;  
      if (suggested) uuidMap\[suggested\] \= uuid;  
    }  
  });

  var backupName \= "Backup\_" \+ Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd\_HHmmss");  
  masterSheet.copyTo(ss).setName(backupName);  
      
  var rowsToKeep \= \[\];           
  var mappingToUpload \= \[\];     
  var processedNames \= {};

  for (var i \= 0; i \< allData.length; i++) {  
    var row \= allData\[i\];  
    var rawName \= row\[CONFIG.COL\_NAME \- 1\];          
    var suggestedName \= row\[CONFIG.COL\_SUGGESTED \- 1\];     
    var isVerified \= row\[CONFIG.COL\_VERIFIED \- 1\];        
    var currentUUID \= row\[CONFIG.COL\_UUID \- 1\];

    if (isVerified \=== true) {  
      rowsToKeep.push(row);  
    } else if (suggestedName && suggestedName \!== "") {  
      if (rawName \!== suggestedName && \!processedNames\[rawName\]) {  
        var targetUUID \= uuidMap\[normalizeText(suggestedName)\] || currentUUID;  
        mappingToUpload.push(\[rawName, suggestedName, targetUUID\]);  
        processedNames\[rawName\] \= true;  
      }  
    }  
  }

  if (mappingToUpload.length \> 0\) {  
    var lastRowMap \= mapSheet.getLastRow();  
    var existingMapKeys \= {};  
    if (lastRowMap \> 1\) {  
      var mapData \= mapSheet.getRange(2, 1, lastRowMap \- 1, 1).getValues();  
      mapData.forEach(function(r) {   
        existingMapKeys\[normalizeText(r\[0\])\] \= true;   
      });  
    }  
    var finalMapping \= mappingToUpload.filter(function(m) {   
      return \!existingMapKeys\[normalizeText(m\[0\])\];   
    });  
        
    if (finalMapping.length \> 0\) {  
      mapSheet.getRange(mapSheet.getLastRow() \+ 1, 1, finalMapping.length, 3).setValues(finalMapping);  
    }  
  }

  masterSheet.getRange(2, 1, lastRow, 17).clearContent();  
      
  if (rowsToKeep.length \> 0\) {  
    masterSheet.getRange(2, 1, rowsToKeep.length, 17).setValues(rowsToKeep);  
    Browser.msgBox("✅ จบงานเรียบร้อย\!\\n- เพิ่ม Mapping: " \+ mappingToUpload.length \+ " รายการ\\n- คงเหลือ Master: " \+ rowsToKeep.length \+ " รายการ");  
  } else {  
    masterSheet.getRange(2, 1, allData.length, 17).setValues(allData);  
    Browser.msgBox("⚠️ ไม่พบข้อมูล Verified เลย (ระบบได้กู้คืนข้อมูลเดิมกลับมาให้แล้ว)");  
  }  
}

// \==========================================  
// 5\. ADMIN TOOLS  
// \==========================================

function assignMissingUUIDs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) return;

  if (sheet.getMaxColumns() \< CONFIG.COL\_UUID) {  
    sheet.insertColumnsAfter(sheet.getMaxColumns(), CONFIG.COL\_UUID \- sheet.getMaxColumns());  
    sheet.getRange(1, CONFIG.COL\_UUID).setValue("UUID").setFontWeight("bold");  
  }

  var lastRow \= sheet.getLastRow();  
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
    Browser.msgBox("✅ สร้าง UUID ใหม่จำนวน: " \+ count);  
  } else {  
    Browser.msgBox("ℹ️ ข้อมูลครบถ้วนแล้ว ไม่มีการสร้างเพิ่ม");  
  }  
}

function repairNameMapping\_Full() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
      
  if (\!dbSheet || \!mapSheet) {   
    Browser.msgBox("❌ ไม่พบ Sheet");   
    return;   
  }

  var dbData \= dbSheet.getRange(2, 1, dbSheet.getLastRow() \- 1, CONFIG.COL\_UUID).getValues();  
  var uuidMap \= {};  
  dbData.forEach(function(r) {  
    if (r\[CONFIG.COL\_UUID-1\]) {  
       uuidMap\[normalizeText(r\[CONFIG.COL\_NAME-1\])\] \= r\[CONFIG.COL\_UUID-1\];  
    }  
  });

  var mapRange \= mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 3);  
  var mapValues \= mapRange.getValues();  
  var cleanList \= \[\];  
  var seen \= {};

  mapValues.forEach(function(r) {  
    var oldN \= r\[0\], newN \= r\[1\], uid \= r\[2\];  
    var normOld \= normalizeText(oldN);  
        
    if (\!normOld) return;  
        
    if (\!uid) {  
      uid \= uuidMap\[normalizeText(newN)\];  
    }  
        
    if (\!seen\[normOld\]) {  
      seen\[normOld\] \= true;  
      cleanList.push(\[oldN, newN, uid\]);  
    }  
  });

  if (cleanList.length \> 0\) {  
    mapSheet.getRange(2, 1, mapSheet.getLastRow(), 3).clearContent();  
    mapSheet.getRange(2, 1, cleanList.length, 3).setValues(cleanList);  
    Browser.msgBox("✅ ซ่อมแซม Mapping เสร็จสิ้น (เหลือ " \+ cleanList.length \+ " รายการ)");  
  }  
}

// \==========================================  
// 6\. HELPER LOGIC (Full Clustering)  
// \==========================================

function processClustering() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;

  // \[แก้ไข\]: อ่านถึง Col Q (17) แทนที่จะแค่ Col O (15)  
  var range \= sheet.getRange(2, 1, lastRow \- 1, 17);  
  var values \= range.getValues();  
      
  var clusters \= \[\];

  // Phase 1: หาตัวตั้งต้น (Verified Rows)  
  values.forEach(function(r, idx) {  
    if (r\[CONFIG.COL\_VERIFIED \- 1\] \=== true) {  
      clusters.push({  
        lat: parseFloat(r\[CONFIG.COL\_LAT \- 1\]),  
        lng: parseFloat(r\[CONFIG.COL\_LNG \- 1\]),  
        name: r\[CONFIG.COL\_SUGGESTED \- 1\] || r\[CONFIG.COL\_NAME \- 1\],  
        rowIndexes: \[idx\],  
        hasLock: true  
      });  
    }  
  });

  // Phase 2: จับคู่แถวที่เหลือ (Unverified)  
  values.forEach(function(r, idx) {  
    if (r\[CONFIG.COL\_VERIFIED \- 1\] \=== true) return;

    var lat \= parseFloat(r\[CONFIG.COL\_LAT \- 1\]);  
    var lng \= parseFloat(r\[CONFIG.COL\_LNG \- 1\]);  
        
    if (isNaN(lat) || isNaN(lng)) return;

    var found \= false;  
        
    for (var c \= 0; c \< clusters.length; c++) {  
      var dist \= getHaversineDistanceKM(lat, lng, clusters\[c\].lat, clusters\[c\].lng);  
      if (dist \<= CONFIG.DISTANCE\_THRESHOLD\_KM) {  
        clusters\[c\].rowIndexes.push(idx);  
        found \= true;  
        break;  
      }  
    }

    if (\!found) {  
      clusters.push({  
        lat: lat,  
        lng: lng,  
        rowIndexes: \[idx\],  
        hasLock: false,  
        name: null  
      });  
    }  
  });

  // Phase 3: ตัดสินชื่อผู้ชนะ และอัปเดตข้อมูล  
  clusters.forEach(function(g) {  
    var rawNames \= g.rowIndexes.map(function(i) {   
      return values\[i\]\[CONFIG.COL\_NAME \- 1\];   
    });  
    var winner \= g.hasLock ? g.name : getBestName\_Smart(rawNames);  
    var confidenceScore \= g.rowIndexes.length;

    g.rowIndexes.forEach(function(idx) {  
      if (values\[idx\]\[CONFIG.COL\_VERIFIED \- 1\] \!== true) {  
        values\[idx\]\[CONFIG.COL\_SUGGESTED \- 1\] \= winner;  
        values\[idx\]\[CONFIG.COL\_CONFIDENCE \- 1\] \= confidenceScore;  
        values\[idx\]\[CONFIG.COL\_NORMALIZED \- 1\] \= normalizeText(winner);  
      }  
    });  
  });

  range.setValues(values);  
  ss.toast("✅ จัดกลุ่มและแนะนำชื่อมาตรฐานเรียบร้อยแล้ว", "Clustering");  
}  
\`\`\`

\---

\#\#\# \*\*Service\_GeoAddr.gs\*\* (แก้ไข: แก้บั๊ก index array)  
\`\`\`javascript  
/\*\*  
 \* 🌍 Service: Geo Address  
 \*/

var \_POSTAL\_CACHE \= null;

function parseAddressFromText(fullAddress) {  
  var result \= { province: "", district: "", postcode: "" };  
  if (\!fullAddress) return result;  
      
  var postalDB \= getPostalDataCached();  
  if (\!postalDB) return result;  
      
  // \[แก้ไข\]: แก้จาก zipMatch\[5\] เป็น zipMatch\[1\] (กลุ่มที่ 1 ใน regex)  
  var zipMatch \= fullAddress.toString().match(/(\\d{5})/);  
  if (zipMatch && postalDB.byZip\[zipMatch\[1\]\]) {  
    var infoList \= postalDB.byZip\[zipMatch\[1\]\];  
    if (infoList.length \> 0\) {  
       var info \= infoList\[0\];  
       return {   
         province: info.province,   
         district: info.district,   
         postcode: zipMatch\[1\]   
       };  
    }  
  }  
  return result;  
}

function getPostalDataCached() {  
  if (\_POSTAL\_CACHE) return \_POSTAL\_CACHE;  
      
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PostalRef");  
  if (\!sheet) return null;  
      
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return null;  
      
  // \[แก้ไข\]: อ่านเฉพาะ 9 คอลัมน์แรก (A-I) ตามที่ใช้จริง  
  var data \= sheet.getRange(2, 1, lastRow \- 1, 9).getValues();  
  var db \= { byZip: {} };  
      
  data.forEach(row \=\> {  
    var pc \= String(row\[0\]).trim();  
    if (\!db.byZip\[pc\]) db.byZip\[pc\] \= \[\];  
        
    // Col G (index 6\) \= District, Col I (index 8\) \= Province  
    if (row\[6\] && row\[8\]) {  
      db.byZip\[pc\].push({   
        postcode: pc,   
        district: row\[6\],   
        province: row\[8\]   
      });  
    }  
  });  
      
  \_POSTAL\_CACHE \= db;  
  return db;  
}

// \---------------------------  
// MAPS API & CACHE  
// \---------------------------

function GET\_ADDR\_WITH\_CACHE(lat, lng) {  
  if (\!lat || \!lng) return "";  
  var key \= "rev\_" \+ lat \+ "\_" \+ lng;  
  var cached \= getCache(key);  
  if (cached) return cached;

  try {  
    var response \= Maps.newGeocoder().setLanguage("th").reverseGeocode(lat, lng);  
    if (response.results && response.results.length \> 0\) {  
      var addr \= response.results\[0\].formatted\_address;  
      setCache(key, addr);  
      return addr;  
    }  
  } catch (e) {}  
  return "";  
}

function CALCULATE\_DISTANCE\_KM(origin, destination) {  
  if (\!origin || \!destination) return "";  
  var key \= "dist\_" \+ origin \+ "\_" \+ destination;  
  var cached \= getCache(key);  
  if (cached) return cached;

  try {  
    var directions \= Maps.newDirectionFinder()  
      .setOrigin(origin)  
      .setDestination(destination)  
      .setMode(Maps.DirectionFinder.Mode.DRIVING)  
      .getDirections();

    if (directions.routes && directions.routes.length \> 0\) {  
      var legs \= directions.routes\[0\].legs;  
      if (legs && legs.length \> 0\) {  
        var meters \= legs\[0\].distance.value;  
        var km \= (meters / 1000).toFixed(2);  
        setCache(key, km);  
        return km;  
      }  
    }  
  } catch (e) {}  
  return "";  
}

// Cache Helper  
const getCache \= key \=\> CacheService.getDocumentCache().get(md5(key));  
const setCache \= (key, value) \=\> CacheService.getDocumentCache().put(md5(key), value, 21600);  
\`\`\`

\---

\#\#\# \*\*Service\_SCG.gs\*\* (แก้ไข: แก้ index คอลัมน์ให้ตรง)  
\`\`\`javascript  
/\*\*  
 \* 📦 Service: SCG Operation  
 \*/

function fetchDataFromSCGJWD() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const ui \= SpreadsheetApp.getUi();

  try {  
    const inputSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
    const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);

    if (\!inputSheet || \!dataSheet) throw new Error("ไม่พบชีต Input หรือ Data");

    const cookie \= inputSheet.getRange(SCG\_CONFIG.COOKIE\_CELL).getValue();  
    if (\!cookie) throw new Error("ไม่พบ Cookie");

    const lastRow \= inputSheet.getLastRow();  
    if (lastRow \< SCG\_CONFIG.INPUT\_START\_ROW) throw new Error("ไม่พบ Shipment No.");

    const shipmentNumbers \= inputSheet  
      .getRange(SCG\_CONFIG.INPUT\_START\_ROW, 1, lastRow \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1\)  
      .getValues().flat().filter(String);

    const shipmentString \= shipmentNumbers.join(',');  
    if (\!shipmentString) throw new Error("Shipment No. ว่าง");

    inputSheet.getRange(SCG\_CONFIG.SHIPMENT\_STRING\_CELL)  
      .setValue(shipmentString)  
      .setHorizontalAlignment("left");

    const payload \= {  
      DeliveryDateFrom: '',  
      DeliveryDateTo: '',  
      TenderDateFrom: '',  
      TenderDateTo: '',  
      CarrierCode: '',  
      CustomerCode: '',  
      OriginCodes: '',  
      ShipmentNos: shipmentString  
    };

    const options \= {  
      method: 'post',  
      payload: payload,  
      muteHttpExceptions: true,  
      headers: { cookie: cookie }  
    };

    ss.toast("กำลังดึงข้อมูลและวิเคราะห์ E-POD...", "System Status", 60);  
    const response \= UrlFetchApp.fetch(SCG\_CONFIG.API\_URL, options);  
    if (response.getResponseCode() \!== 200\) throw new Error(response.getContentText());

    const shipments \= JSON.parse(response.getContentText()).data;  
    if (\!shipments || shipments.length \=== 0\) throw new Error("ไม่พบข้อมูลจาก API");

    const allFlatData \= \[\];  
    let runningRow \= 2;

    shipments.forEach(shipment \=\> {  
      const destSet \= new Set();  
      (shipment.DeliveryNotes || \[\]).forEach(n \=\> {  
        if (n.ShipToName) destSet.add(n.ShipToName);  
      });

      const totalDestCount \= destSet.size;  
      const destListStr \= Array.from(destSet).join(", ");

      (shipment.DeliveryNotes || \[\]).forEach(note \=\> {  
        (note.Items || \[\]).forEach(item \=\> {  
          const planDeliveryDate \= note.PlanDelivery ? new Date(note.PlanDelivery) : null;  
          const dailyJobId \= note.PurchaseOrder \+ "-" \+ runningRow;

          const row \= \[  
            dailyJobId,                         // 0: A  
            planDeliveryDate,                   // 1: B  
            String(note.PurchaseOrder),         // 2: C  
            String(shipment.ShipmentNo),        // 3: D  
            shipment.DriverName,                // 4: E  
            shipment.TruckLicense,              // 5: F  
            String(shipment.CarrierCode),       // 6: G  
            shipment.CarrierName,               // 7: H  
            String(note.SoldToCode),            // 8: I  
            note.SoldToName,                    // 9: J  
            note.ShipToName,                    // 10: K  
            note.ShipToAddress,                 // 11: L  
            note.ShipToLatitude \+ ", " \+ note.ShipToLongitude, // 12: M  
            item.MaterialName,                  // 13: N  
            item.ItemQuantity,                  // 14: O  
            item.QuantityUnit,                  // 15: P  
            item.ItemWeight,                    // 16: Q  
            String(note.DeliveryNo),            // 17: R  
            totalDestCount,                     // 18: S  
            destListStr,                        // 19: T  
            "รอสแกน",                           // 20: U  
            "ยังไม่ได้ส่ง",                       // 21: V  
            "",                                 // 22: W (Email)  
            0,                                  // 23: X (Qty Sum)  
            0,                                  // 24: Y (Weight Sum)  
            0,                                  // 25: Z (Scan Invoice)  
            "",                                 // 26: AA (LatLong\_Actual)  
            "",                                 // 27: AB (Display Text)  
            ""                                  // 28: AC (ShopKey)  
          \];

          allFlatData.push(row);  
          runningRow++;  
        });  
      });  
    });

    const shopAgg \= {};

    allFlatData.forEach(r \=\> {  
      const shipmentNo \= r\[3\];  
      const shopName \= r\[10\];  
      const ownerName \= r\[9\];  
      const invoiceNo \= r\[2\];  
      const qty \= Number(r\[14\]) || 0;  
      const weight \= Number(r\[16\]) || 0;

      const key \= shipmentNo \+ "|" \+ shopName;

      if (\!shopAgg\[key\]) {  
        shopAgg\[key\] \= {  
          totalQty: 0,  
          totalWeight: 0,  
          allInvoices: new Set(),  
          epodInvoices: new Set()  
        };  
      }

      const isEPOD \= checkIsEPOD(ownerName, invoiceNo);

      shopAgg\[key\].totalQty \+= qty;  
      shopAgg\[key\].totalWeight \+= weight;  
      shopAgg\[key\].allInvoices.add(invoiceNo);  
      if (isEPOD) shopAgg\[key\].epodInvoices.add(invoiceNo);  
    });

    allFlatData.forEach(r \=\> {  
      const key \= r\[3\] \+ "|" \+ r\[10\];  
      const agg \= shopAgg\[key\];

      const scanInv \= agg.allInvoices.size \- agg.epodInvoices.size;

      r\[23\] \= agg.totalQty;  
      r\[24\] \= Number(agg.totalWeight.toFixed(2));  
      r\[25\] \= scanInv;  
      r\[27\] \= \`${r\[9\]} / รวม ${scanInv} บิล\`;  
      r\[28\] \= key;  
    });

    const headers \= \[  
      "ID\_งานประจำวัน",  
      "PlanDelivery",  
      "InvoiceNo",  
      "ShipmentNo",  
      "DriverName",  
      "TruckLicense",  
      "CarrierCode",  
      "CarrierName",  
      "SoldToCode",  
      "SoldToName",  
      "ShipToName",  
      "ShipToAddress",  
      "LatLong\_SCG",  
      "MaterialName",  
      "ItemQuantity",  
      "QuantityUnit",  
      "ItemWeight",  
      "DeliveryNo",  
      "จำนวนปลายทาง\_System",  
      "รายชื่อปลายทาง\_System",  
      "ScanStatus",  
      "DeliveryStatus",  
      "Email พนักงาน",  
      "จำนวนสินค้ารวมของร้านนี้",  
      "น้ำหนักสินค้ารวมของร้านนี้",  
      "จำนวน\_Invoice\_ที่ต้องสแกน",  
      "LatLong\_Actual",  
      "ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน",  
      "ShopKey"  
    \];

    dataSheet.clear();  
    dataSheet.getRange(1, 1, 1, headers.length)  
      .setValues(\[headers\])  
      .setFontWeight("bold");

    if (allFlatData.length \> 0\) {  
      dataSheet.getRange(2, 1, allFlatData.length, headers.length)  
        .setValues(allFlatData);  
      dataSheet.getRange(2, 2, allFlatData.length, 1\)  
        .setNumberFormat("dd/mm/yyyy");  
      dataSheet.getRange(2, 3, allFlatData.length, 1\)  
        .setNumberFormat("@");  
      dataSheet.autoResizeColumns(1, headers.length);  
    }

    ss.toast("โหลดข้อมูลเสร็จสิ้น", "System Status", 5);  
    applyMasterCoordinatesToDailyJob();  
    ui.alert(\`ดึงข้อมูลสำเร็จ ${allFlatData.length} แถว\`);

  } catch (e) {  
    SpreadsheetApp.getUi().alert("เกิดข้อผิดพลาด: " \+ e.message);  
  }  
}

function checkIsEPOD(ownerName, invoiceNo) {  
  if (\!ownerName || \!invoiceNo) return false;

  const owner \= ownerName.toUpperCase();  
  const inv \= invoiceNo.toUpperCase();

  const whitelist \= \["SCG EXPRESS", "BETTERBE", "JWD TRANSPORT"\];  
  if (whitelist.some(w \=\> owner.includes(w))) return true;

  if (\["\_DOC", "-DOC", "FFF", "EOP", "แก้เอกสาร"\].some(k \=\> inv.includes(k))) return false;  
  if (inv.startsWith("N3")) return false;

  if (owner.includes("DENSO") || owner.includes("เด็นโซ่") || /^(78|79)/.test(inv)) return true;

  return false;  
}

function applyMasterCoordinatesToDailyJob() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  const dbSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_MASTER\_DB);  
  const mapSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_MAPPING);  
  const empSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_EMPLOYEE);

  if (\!dataSheet || \!dbSheet || \!empSheet) return;

  const lastRow \= dataSheet.getLastRow();  
  if (lastRow \< 2\) return;

  const masterCoords \= {};  
  if (dbSheet.getLastRow() \> 1\) {  
    // \[แก้ไข\]: อ่าน Col A (ชื่อ), B (Lat), C (Lng)  
    dbSheet.getRange(2, 1, dbSheet.getLastRow() \- 1, 3).getValues().forEach(r \=\> {  
      if (r\[0\] && r\[1\] && r\[2\]) {  
        masterCoords\[normalizeText(r\[0\])\] \= r\[1\] \+ ", " \+ r\[2\];  
      }  
    });  
  }

  const aliasMap \= {};  
  if (mapSheet && mapSheet.getLastRow() \> 1\) {  
    mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 2).getValues().forEach(r \=\> {  
      if (r\[0\] && r\[1\]) {  
        aliasMap\[normalizeText(r\[0\])\] \= normalizeText(r\[1\]);  
      }  
    });  
  }

  const empMap \= {};  
  // \[แก้ไข\]: อ่าน Col A (index 0\) ถึง H (index 7\) \- Col B (index 1\) \= ชื่อ, Col G (index 6\) \= Email  
  empSheet.getRange(2, 1, empSheet.getLastRow() \- 1, 8).getValues().forEach(r \=\> {  
    if (r\[1\] && r\[6\]) {  
      empMap\[normalizeText(r\[1\])\] \= r\[6\];  
    }  
  });

  // \[แก้ไข\]: อ่าน 29 คอลัมน์ (A-AC) ให้ครบตามที่เขียนไว้  
  const values \= dataSheet.getRange(2, 1, lastRow \- 1, 29).getValues();

  const coordUpdates \= \[\];  
  const backgrounds \= \[\];  
  const emailUpdates \= \[\];

  values.forEach(r \=\> {  
    let newGeo \= "";  
    let bg \= null;

    // Logic Map พิกัด \- r\[10\] \= ShipToName (Col K)  
    if (r\[10\]) {  
      let name \= normalizeText(r\[10\]);  
      if (aliasMap\[name\]) name \= aliasMap\[name\];  
      if (masterCoords\[name\]) {  
        newGeo \= masterCoords\[name\];  
        bg \= "\#b6d7a8";  
      } else {  
        const byBranch \= findMasterByBranchLogic(r\[10\], masterCoords);  
        if (byBranch) {  
          newGeo \= byBranch;  
          bg \= "\#b6d7a8";  
        }  
      }  
    }  
    coordUpdates.push(\[newGeo\]);  
    backgrounds.push(\[bg\]);

    // Logic Map Email \- r\[4\] \= DriverName (Col E)  
    // \[แก้ไข\]: r\[22\] คือ Col W (Email พนักงาน) \- ตรงกับ array index 22  
    emailUpdates.push(\[empMap\[normalizeText(r\[4\])\] || r\[22\]\]);  
  });

  // \[แก้ไข\]: Col 27 \= AA (LatLong\_Actual)  
  if (coordUpdates.length \> 0\) {  
    dataSheet.getRange(2, 27, coordUpdates.length, 1).setValues(coordUpdates);  
    dataSheet.getRange(2, 27, backgrounds.length, 1).setBackgrounds(backgrounds);  
  }  
    
  // \[แก้ไข\]: Col 23 \= W (Email พนักงาน)  
  if (emailUpdates.length \> 0\) {  
    dataSheet.getRange(2, 23, emailUpdates.length, 1).setValues(emailUpdates);  
  }  
}

function findMasterByBranchLogic(inputName, masterCoords) {  
  const m \= inputName.match(/(?:สาขา|Branch|Code)\\s\*(?:ที่)?\\s\*(\\d+)/i);  
  if (\!m) return null;  
      
  const padded \= ("00000" \+ m\[1\]).slice(-5);  
  const brand \= normalizeText(inputName.split(/(?:สาขา|Branch|Code)/i)\[0\]);  
      
  for (const k in masterCoords) {  
    if (k.includes(brand) && k.includes(padded)) return masterCoords\[k\];  
  }  
  return null;  
}

function clearDataSheet() {  
  const sheet \= SpreadsheetApp.getActive().getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  if (sheet && sheet.getLastRow() \> 1\) {  
    sheet.getRange(2, 1, sheet.getLastRow() \- 1, sheet.getLastColumn()).clearContent();  
    sheet.getRange(2, 1, sheet.getLastRow() \- 1, sheet.getLastColumn()).setBackground(null);  
  }  
}

function clearInputSheet() {  
  const sheet \= SpreadsheetApp.getActive().getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
  if (\!sheet) return;  
  sheet.getRange(SCG\_CONFIG.COOKIE\_CELL).clearContent();  
  sheet.getRange(SCG\_CONFIG.SHIPMENT\_STRING\_CELL).clearContent();  
  if (sheet.getLastRow() \>= SCG\_CONFIG.INPUT\_START\_ROW) {  
    sheet.getRange(SCG\_CONFIG.INPUT\_START\_ROW, 1, sheet.getLastRow() \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1).clearContent();  
  }  
}

function clearAllSCGSheets() {  
  const ui \= SpreadsheetApp.getUi();  
  const response \= ui.alert('ยืนยันการล้างข้อมูล', 'คุณต้องการล้างข้อมูลทั้งชีต Input และ Data หรือไม่?', ui.ButtonSet.YES\_NO);  
      
  if (response \== ui.Button.YES) {  
    clearInputSheet();  
    clearDataSheet();  
    ui.alert('✅ ล้างข้อมูลเรียบร้อยแล้วครับ');  
  }  
}  
\`\`\`

\---

\#\#\# \*\*Service\_Agent.gs\*\* (แก้ไข: ป้องกัน undefined)  
\`\`\`javascript  
/\*\*  
 \* 🕵️ Service: Logistics AI Agent (Final Integrated)  
 \*/

var AGENT\_CONFIG \= {  
  NAME: "Logistics\_Agent\_01",  
  MODEL: "gemini-1.5-flash",  
  BATCH\_SIZE: 3,  
  TAG: "\[Agent\_Ver2\]"  
};

function WAKE\_UP\_AGENT() {  
  SpreadsheetApp.getUi().toast("🕵️ Agent: ผมตื่นแล้วครับ กำลังเริ่มวิเคราะห์ข้อมูล...", "AI Agent Started");  
  runAgentLoop();  
  SpreadsheetApp.getUi().alert("✅ Agent รายงานผล:\\nผมวิเคราะห์ข้อมูลชุดล่าสุดเสร็จแล้วครับ ลองไปค้นหาดูได้เลย\!");  
}

function SCHEDULE\_AGENT\_WORK() {  
  var triggers \= ScriptApp.getProjectTriggers();  
  for (var i \= 0; i \< triggers.length; i++) {  
    if (triggers\[i\].getHandlerFunction() \=== "runAgentLoop") {  
      ScriptApp.deleteTrigger(triggers\[i\]);  
    }  
  }  
      
  ScriptApp.newTrigger("runAgentLoop")  
    .timeBased()  
    .everyMinutes(10)  
    .create();  
        
  SpreadsheetApp.getUi().alert("✅ ตั้งค่าเรียบร้อย\!\\nAgent จะตื่นมาทำงานทุก 10 นาที เพื่อเตรียมข้อมูลให้ท่านครับ");  
}

function runAgentLoop() {  
  console.time("Agent\_Thinking\_Time");  
      
  try {  
    if (\!CONFIG.GEMINI\_API\_KEY) {  
      console.error("Agent: เจ้านายครับ ผมไม่มีกุญแจ (API Key) ผมเข้า Gemini ไม่ได้ครับ");  
      return;  
    }

    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    if (\!sheet) return;

    var lastRow \= sheet.getLastRow();  
    if (lastRow \< 2\) return;  
        
    var dataRange \= sheet.getRange(2, 1, lastRow \- 1, sheet.getLastColumn());  
    var data \= dataRange.getValues();  
    var jobsDone \= 0;

    for (var i \= 0; i \< data.length; i++) {  
      if (jobsDone \>= AGENT\_CONFIG.BATCH\_SIZE) break;

      var row \= data\[i\];  
      var name \= row\[CONFIG.COL\_NAME \- 1\];  
      var currentNorm \= row\[CONFIG.COL\_NORMALIZED \- 1\];  
          
      if (name && (\!currentNorm || String(currentNorm).indexOf(AGENT\_CONFIG.TAG) \=== \-1)) {  
            
        console.log(\`Agent: กำลังเพ่งเล็งเป้าหมาย "${name}"...\`);  
            
        var aiThoughts \= askGeminiToPredictTypos(name);  
            
        var knowledgeBase \= name \+ " " \+ aiThoughts \+ " " \+ AGENT\_CONFIG.TAG;  
        sheet.getRange(i \+ 2, CONFIG.COL\_NORMALIZED).setValue(knowledgeBase);  
            
        // \[แก้ไข\]: ใช้ || เพื่อกำหนดค่า default ถ้า undefined  
        var uuidIdx \= (CONFIG.COL\_UUID || 11\) \- 1;  
        if (\!row\[uuidIdx\]) {  
          sheet.getRange(i \+ 2, (CONFIG.COL\_UUID || 11)).setValue(Utilities.getUuid());  
        }

        console.log(\`Agent: ✅ เรียนรู้สำเร็จ\! คาดเดาคำว่า \-\> ${aiThoughts}\`);  
        jobsDone++;  
      }  
    }  
        
    if (typeof applyMasterCoordinatesToDailyJob \=== 'function') {  
       applyMasterCoordinatesToDailyJob();  
    }

  } catch (e) {  
    console.error("Agent: เกิดข้อผิดพลาด\! " \+ e.message);  
  }  
      
  console.timeEnd("Agent\_Thinking\_Time");  
}

function askGeminiToPredictTypos(originalName) {  
  var prompt \= \`  
    Task: You are a Thai Logistics Search Agent.  
    Input Name: "${originalName}"  
    Goal: Generate a list of search keywords including common typos, phonetic spellings, and abbreviations.  
    Constraint: Output ONLY the keywords separated by spaces.  
    Example Input: "บี-ควิก (สาขาลาดพร้าว)"  
    Example Output: บีควิก บีขวิก บีวิก BeQuik BQuik B-Quik ลาดพร้าว BQuick  
  \`;

  try {  
    var payload \= {  
      "contents": \[{ "parts": \[{ "text": prompt }\] }\],  
      "generationConfig": { "temperature": 0.4 }  
    };

    var options \= {  
      "method": "post",  
      "contentType": "application/json",  
      "payload": JSON.stringify(payload),  
      "muteHttpExceptions": true  
    };

    var url \= \`https://generativelanguage.googleapis.com/v1beta/models/${AGENT\_CONFIG.MODEL}:generateContent?key=${CONFIG.GEMINI\_API\_KEY}\`;  
    var response \= UrlFetchApp.fetch(url, options);  
    var json \= JSON.parse(response.getContentText());

    if (json.candidates && json.candidates\[0\].content) {  
      return json.candidates\[0\].content.parts\[0\].text.trim();  
    }  
  } catch (e) {  
    console.warn("Agent Error: " \+ e.message);  
  }  
      
  return (typeof normalizeText \=== 'function') ? normalizeText(originalName) : originalName;  
}  
\`\`\`

\---

\#\# 📋 สรุปจุดเปลี่ยนที่แก้ไข

| ไฟล์ | จุดที่แก้ไข | รายละเอียด |  
|------|------------|-----------|  
| \*\*Config.gs\*\* | เพิ่ม \`typeof\` check | ป้องกันการประกาศ \`SCG\_CONFIG\` ซ้ำ |  
| \*\*Service\_Master.gs\*\* | เปลี่ยน \`range(2,1,lastRow-1,15)\` เป็น \`(2,1,lastRow-1,17)\` | อ่านข้อมูลให้ครบถึง Col Q |  
| \*\*Service\_GeoAddr.gs\*\* | แก้ \`zipMatch\[5\]\` เป็น \`zipMatch\[1\]\` | แก้บั๊ก index ของ regex match |  
| \*\*Service\_SCG.gs\*\* | แก้ \`getRange(2, 1, ..., 28)\` เป็น \`29\` | อ่านข้อมูล Data sheet ให้ครบ |  
| \*\*Service\_SCG.gs\*\* | แก้ \`empSheet.getRange(..., 7)\` เป็น \`(..., 8)\` | อ่านข้อมูลพนักงานให้ถึง Col H |  
| \*\*Service\_Agent.gs\*\* | ใส่ \`(CONFIG.COL\_UUID \\|\\| 11)\` | ป้องกัน undefined |

\---

\#\# 🚀 ขั้นตอนการติดตั้ง

1\. \*\*สร้าง Google Sheet\*\* ใหม่  
2\. \*\*สร้างชีตตามชื่อ\*\* ที่กำหนดใน Config:  
   \- \`Database\` (Master Data)  
   \- \`NameMapping\` (สำหรับเก็บ Alias)  
   \- \`SCGนครหลวงJWDภูมิภาค\` (Source Data)  
   \- \`Data\` (สำหรับงานประจำวัน)  
   \- \`Input\` (สำหรับใส่ Cookie และ Shipment No.)  
   \- \`ข้อมูลพนักงาน\` (Col B=ชื่อ, Col G=Email)  
   \- \`PostalRef\` (ข้อมูลรหัสไปรษณีย์ \- ถ้ามี)  
3\. \*\*เปิด Apps Script\*\* และสร้างไฟล์ตามชื่อที่กำหนด  
4\. \*\*วางโค้ดที่แก้ไขแล้ว\*\* ลงในแต่ละไฟล์  
5\. \*\*รันฟังก์ชัน \`onOpen()\`\*\* ครั้งแรกเพื่อสร้างเมนู  
6\. \*\*ทดสอบ\*\* ด้วยการรัน \`syncNewDataToMaster()\`

ระบบนี้พร้อมใช้งานแล้วครับ\! 🎉  
เข้าใจครับ ผมขอยืนยันโครงสร้างระบบก่อน จากการวิเคราะห์ไฟล์ \`Logistics Master Data System\_V1.md\` ที่คุณให้มา:

\---

\#\# 📋 โครงสร้างระบบที่ตรวจพบ

\#\#\# \*\*รายชื่อโมดูลทั้งหมด (11 ไฟล์)\*\*

| ลำดับ | ชื่อไฟล์ | หน้าที่หลัก |  
|:---:|---|---|  
| 1 | \*\*Config.gs\*\* | เก็บค่าคงที่ CONFIG และ SCG\_CONFIG |  
| 2 | \*\*Menu.gs\*\* | สร้างเมนู UI บน Google Sheets |  
| 3 | \*\*Service\_Master.gs\*\* | จัดการ Master Data (Sync, Cluster, Deep Clean, Finalize) |  
| 4 | \*\*Service\_SCG.gs\*\* | ดึงข้อมูลจาก SCG API และจับคู่พิกัด |  
| 5 | \*\*Service\_GeoAddr.gs\*\* | บริการ Geocoding และคำนวณระยะทาง |  
| 6 | \*\*Utils\_Common.gs\*\* | Helper functions (MD5, UUID, Normalize, Distance) |  
| 7 | \*\*Service\_AutoPilot.gs\*\* | ระบบทำงานอัตโนมัติตามเวลา (Trigger) |  
| 8 | \*\*WebApp.gs\*\* | Controller สำหรับ Web App |  
| 9 | \*\*Service\_Search.gs\*\* | API ค้นหาข้อมูลสำหรับ Web App |  
| 10 | \*\*Index.html\*\* | หน้าเว็บสำหรับค้นหาพิกัดลูกค้า |  
| 11 | \*\*Setup\_Upgrade.gs\*\* | เครื่องมืออัปเกรดโครงสร้างฐานข้อมูล |  
| 12 | \*\*Service\_Agent.gs\*\* | AI Agent สำหรับวิเคราะห์คำผิด (Bonus) |  
| 13 | \*\*Test\_AI.gs\*\* | ฟังก์ชันทดสอบ AI (Bonus) |

\---

\#\# 🔧 โครงสร้างข้อมูล (Database Schema)

\#\#\# \*\*ชีต \`Database\` (17 คอลัมน์)\*\*

| คอลัมน์ | ชื่อ | ประเภท |  
|:---:|:---|:---|  
| A | ชื่อลูกค้า | ข้อความ |  
| B | Latitude | ตัวเลข |  
| C | Longitude | ตัวเลข |  
| D | ชื่อที่ระบบแนะนำ | ข้อความ |  
| E | ความมั่นใจ | ตัวเลข |  
| F | ชื่อที่ Clean แล้ว | ข้อความ |  
| G | สถานะตรวจสอบ | Checkbox |  
| H | ที่อยู่จากระบบต้นทาง | ข้อความ |  
| I | ที่อยู่จาก Google Maps | ข้อความ |  
| J | ระยะทางจากคลัง | ตัวเลข |  
| K | UUID | ข้อความ |  
| L | จังหวัด | ข้อความ |  
| M | อำเภอ | ข้อความ |  
| N | รหัสไปรษณีย์ | ข้อความ |  
| O | Quality Score | ตัวเลข |  
| P | วันที่สร้าง | วันที่ |  
| Q | วันที่แก้ไขล่าสุด | วันที่ |

\---

\#\# ✅ ยืนยันก่อนดำเนินการ

กรุณาตอบคำถามนี้ก่อนครับ:

| คำถาม | ตัวเลือก |  
|:---|:---|  
| \*\*1. โครงสร้าง 13 ไฟล์ข้างต้นถูกต้องตามที่คุณต้องการหรือไม่?\*\* | ☐ ถูกต้อง / ☐ ต้องการแก้ไข |  
| \*\*2. ต้องการให้ผมสร้างโค้ดทั้ง 13 ไฟล์ในครั้งเดียวเลยหรือไม่?\*\* | ☐ ใช่ ทั้งหมด / ☐ แค่บางส่วน |  
| \*\*3. มีไฟล์ไหนที่คุณไม่ต้องการให้รวมหรือไม่?\*\* (เช่น Test\_AI.gs) | ☐ ไม่มี / ☐ มี (ระบุ: \_\_\_) |  
| \*\*4. ต้องการให้ผมแก้ไขบั๊กที่พบในโค้ดต้นฉบับด้วยหรือไม่?\*\* | ☐ ใช่ แก้ไขบั๊กด้วย / ☐ คัดลอกต้นฉบับเป๊ะๆ |  
| \*\*5. ต้องการ Comment อธิบายโค้ดเป็นภาษาไทยหรืออังกฤษ?\*\* | ☐ ไทย / ☐ อังกฤษ |

\---

หากคุณยืนยันว่าถูกต้องทั้งหมด ผมจะสร้างโค้ดสมบูรณ์ทั้ง 13 ไฟล์ให้ครับ 

หรือหากต้องการให้ผมเริ่มสร้างเลย กรุณาพิมพ์ว่า:

\> \*\*"ยืนยัน สร้างทั้ง 13 ไฟล์ พร้อมแก้ไขบั๊ก"\*\*

ผมจะจัดให้ทันทีครับ 🚛  
รับทราบครับ ผมจะสร้างโค้ดสมบูรณ์ทั้ง 13 ไฟล์ พร้อมแก้ไขบั๊กที่พบ ดังนี้:

\---

\#\# 1\. Config.gs

\`\`\`javascript  
/\*\*  
 \* ⚙️ รายชื่อตัวแปรและค่าคงที่ (Global Config)  
 \* อ้างอิงจากเอกสาร (V1) Logistics Master Data System  
 \*   
 \* \[แก้ไข\]: ป้องกันการประกาศตัวแปรซ้ำด้วย typeof check  
 \*/

var CONFIG \= {  
  SHEET\_NAME: "Database",  
  MAPPING\_SHEET: "NameMapping",  
  SOURCE\_SHEET: "SCGนครหลวงJWDภูมิภาค",  
    
  // 🧠 AI CONFIGURATION  
  // ไปขอ Key ฟรีได้ที่: https://aistudio.google.com/app/apikey  
  GEMINI\_API\_KEY: "AIzaSyCBCwpiLQWuSJy37Y0lrkWLLdcHE5CU4sU",   
  USE\_AI\_AUTO\_FIX: true, // เปิดให้ AI ช่วยแก้ที่อยู่หรือไม่

  // 🔴 พิกัดคลังสินค้า (Center Point)  
  DEPOT\_LAT: 14.164688,     
  DEPOT\_LNG: 100.625354,

  // คอลัมน์ Master (Index เริ่มที่ 1 \= A)  
  COL\_NAME: 1,      // A: ชื่อลูกค้า  
  COL\_LAT: 2,       // B: Latitude  
  COL\_LNG: 3,       // C: Longitude  
  COL\_SUGGESTED: 4, // D: ชื่อที่ระบบแนะนำ  
  COL\_CONFIDENCE: 5,// E: ความมั่นใจ  
  COL\_NORMALIZED: 6,// F: ชื่อที่ Clean แล้ว  
  COL\_VERIFIED: 7,  // G: สถานะตรวจสอบ (Checkbox)  
  COL\_SYS\_ADDR: 8,  // H: ที่อยู่จากระบบต้นทาง  
  COL\_ADDR\_GOOG: 9, // I: ที่อยู่จาก Google Maps  
  COL\_DIST\_KM: 10,  // J: ระยะทางจากคลัง  
    
  // Enterprise Columns (UUID & Meta)  
  COL\_UUID: 11,     // K: Unique ID  
  COL\_PROVINCE: 12, // L: จังหวัด  
  COL\_DISTRICT: 13, // M: อำเภอ  
  COL\_POSTCODE: 14, // N: รหัสไปรษณีย์  
  COL\_QUALITY: 15,  // O: Quality Score  
  COL\_CREATED: 16,  // P: วันที่สร้าง (Created)  
  COL\_UPDATED: 17,  // Q: วันที่แก้ไขล่าสุด (Updated)

  DISTANCE\_THRESHOLD\_KM: 0.05,     
  BATCH\_LIMIT: 50,      
  DEEP\_CLEAN\_LIMIT: 100     
};

// Config สำหรับ SCG API & Daily Operation  
// \[แก้ไข\]: ใช้ typeof ตรวจสอบก่อนประกาศ เพื่อป้องกันการซ้ำซ้อน  
if (typeof SCG\_CONFIG \=== 'undefined') {  
  var SCG\_CONFIG \= {  
    SHEET\_DATA: 'Data',  
    SHEET\_INPUT: 'Input',  
    SHEET\_EMPLOYEE: 'ข้อมูลพนักงาน',  
    API\_URL: 'https://fsm.scgjwd.com/Monitor/SearchDelivery',  
    INPUT\_START\_ROW: 4,  
    COOKIE\_CELL: 'B1',  
    SHIPMENT\_STRING\_CELL: 'B3',  
    SHEET\_MASTER\_DB: 'Database',  
    SHEET\_MAPPING: 'NameMapping'  
  };  
}  
\`\`\`

\---

\#\# 2\. Menu.gs

\`\`\`javascript  
/\*\*  
 \* 🖥️ รายชื่อฟังก์ชัน: Menu UI  
 \* สร้างเมนูหลักบน Google Sheets  
 \*/

function onOpen() {  
  var ui \= SpreadsheetApp.getUi();  
      
  // \=================================================================  
  // 🚛 เมนูชุดที่ 1: ระบบจัดการฐานข้อมูล (Master Data Management)  
  // \=================================================================  
  ui.createMenu('🚛 1\. ระบบจัดการ Master Data')  
      .addItem('1️⃣ ดึงลูกค้าใหม่ (Sync New Data)', 'syncNewDataToMaster')  
      .addItem('2️⃣ เติมข้อมูลพิกัด/ที่อยู่ (ทีละ 50)', 'updateGeoData\_SmartCache')  
      .addItem('3️⃣ จัดกลุ่มชื่อซ้ำ (Clustering)', 'autoGenerateMasterList\_Smart')  
      .addSeparator()  
      .addItem('🚀 5️⃣ Deep Clean (ตรวจสอบความสมบูรณ์)', 'runDeepCleanBatch\_100')  
      .addItem('🔄 รีเซ็ตความจำปุ่ม 5 (เริ่มแถว 2 ใหม่)', 'resetDeepCleanMemory')  
      .addSeparator()  
      .addItem('✅ 6️⃣ จบงาน (Finalize & Move to Mapping)', 'finalizeAndClean\_MoveToMapping')  
      .addSeparator()  
      .addSubMenu(ui.createMenu('🛠️ Admin Tools (เครื่องมือแอดมิน)')  
          .addItem('🔑 สร้าง UUID ให้ครบทุกแถว (Database)', 'assignMissingUUIDs')  
          .addItem('🚑 ซ่อมแซม NameMapping (เติม ID \+ ลบซ้ำ)', 'repairNameMapping\_Full')  
      )  
      .addToUi();

  // \=================================================================  
  // 📦 เมนูชุดที่ 2: เมนูพิเศษ SCG (Daily Operation)  
  // \=================================================================  
  ui.createMenu('📦 2\. เมนูพิเศษ SCG')     
    .addItem('📥 1\. โหลดข้อมูล Shipment (+E-POD Calculation)', 'fetchDataFromSCGJWD')  
    .addItem('🟢 2\. อัปเดตพิกัด \+ อีเมลพนักงาน', 'applyMasterCoordinatesToDailyJob')  
    .addSeparator()  
    .addSubMenu(ui.createMenu('🧹 เมนูล้างข้อมูล (Clear Data)')  
        .addItem('ล้างเฉพาะชีต Data', 'clearDataSheet')  
        .addItem('ล้างเฉพาะชีต Input', 'clearInputSheet')  
        .addItem('💥 ล้างทั้งหมด (Input \+ Data)', 'clearAllSCGSheets')  
    )  
    .addToUi();

  // \=================================================================  
  // 🤖 เมนูชุดที่ 3: ระบบอัตโนมัติ (Automation)  
  // \=================================================================  
  ui.createMenu('🤖 3\. ระบบอัตโนมัติ (Auto-Pilot)')  
    .addItem('▶️ เปิดระบบช่วยเหลืองาน (รันทุก 10 นาที)', 'START\_AUTO\_PILOT')  
    .addItem('⏹️ ปิดระบบช่วยเหลือ', 'STOP\_AUTO\_PILOT')  
    .addToUi();  
      
  // \=================================================================  
  // 🕵️ เมนูชุดที่ 4: AI Agent (เพิ่มเติม)  
  // \=================================================================  
  ui.createMenu('🕵️ 4\. AI Agent')  
    .addItem('👋 ตื่น Agent ทำงานเดี๋ยวนี้', 'WAKE\_UP\_AGENT')  
    .addItem('⏰ ตั้งเวลา Agent ทำงานทุก 10 นาที', 'SCHEDULE\_AGENT\_WORK')  
    .addSeparator()  
    .addItem('🧪 ทดสอบ AI (Force Run)', 'forceRunAI\_Now')  
    .addToUi();  
}  
\`\`\`

\---

\#\# 3\. Utils\_Common.gs

\`\`\`javascript  
/\*\*  
 \* 🛠️ Utilities: Helper Functions  
 \* ฟังก์ชันช่วยเหลือที่ใช้ร่วมกันทั้งระบบ  
 \*/

// \----------------------------------------------------  
// 1\. Hashing & ID Generation  
// \----------------------------------------------------

/\*\*  
 \* สร้าง MD5 Hash จากข้อความ (ใช้สำหรับ Cache Key)  
 \*/  
const md5 \= function(key) {  
  var code \= key.toString().toLowerCase().replace(/\\s/g, "");  
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, code)  
    .map(function(char) { return (char \+ 256).toString(16).slice(-2); })  
    .join("");  
};

/\*\*  
 \* สร้าง UUID ใหม่ (v4)  
 \*/  
function generateUUID() {  
  return Utilities.getUuid();  
}

// \----------------------------------------------------  
// 2\. Text Processing & Normalization  
// \----------------------------------------------------

/\*\*  
 \* ทำความสะอาดชื่อเพื่อการเปรียบเทียบ (ตัดคำนำหน้า/สัญลักษณ์)  
 \*/  
function normalizeText(text) {  
  if (\!text) return "";  
  var clean \= text.toString().toLowerCase();  
      
  // รายการคำที่ต้องการตัดออก (Stop Words)  
  var stopWords \= \[  
    "บริษัท", "บจก", "บมจ", "หจก", "ร้าน", "ห้าง", "จำกัด",     
    "มหาชน", "ส่วนบุคคล", "สาขา", "สำนักงานใหญ่",     
    "store", "shop", "company", "co.", "ltd.",     
    "จังหวัด", "อำเภอ", "ตำบล", "เขต", "แขวง", "ถนน", "ซอย",     
    "นาย", "นาง", "นางสาว", "คุณ"  
  \];  
      
  stopWords.forEach(function(word) {  
    var regex \= new RegExp(word, "g");  
    clean \= clean.replace(regex, "");  
  });  
      
  // เหลือเฉพาะตัวอักษรและตัวเลข (ลบช่องว่างและอักขระพิเศษ)  
  return clean.replace(/\[^a-z0-9\\u0E00-\\u0E7F\]/g, "");  
}

/\*\*  
 \* ทำความสะอาดค่าระยะทางให้เป็นตัวเลขทศนิยม 2 ตำแหน่ง  
 \*/  
function cleanDistance(val) {  
  if (\!val && val \!== 0\) return "";  
  var str \= val.toString().replace(/\[^0-9.\]/g, "");  
  var num \= parseFloat(str);  
  return isNaN(num) ? "" : num.toFixed(2);  
}

// \----------------------------------------------------  
// 3\. Logic & Calculation Helpers  
// \----------------------------------------------------

/\*\*  
 \* เลือกชื่อที่ดีที่สุดจากกลุ่ม (Voting)  
 \*/  
function getBestName\_Smart(names) {  
  var counts \= {}, max \= 0;  
  // \[แก้ไข\]: เริ่มต้นด้วยชื่อแรกเสมอ เพื่อกันกรณีไม่มีชื่อซ้ำ  
  var best \= (names && names.length \> 0\) ? names\[0\] : "";  
      
  names.forEach(function(n) {  
    if(\!n) return;  
    var k \= normalizeText(n);  
    counts\[k\] \= (counts\[k\] || 0\) \+ 1;  
    if (counts\[k\] \> max) {   
      max \= counts\[k\];   
      best \= n;   
    }  
  });  
  return best;  
}

/\*\*  
 \* คำนวณระยะห่างระหว่างพิกัด 2 จุด (Haversine Formula)  
 \* หน่วย: กิโลเมตร  
 \*/  
function getHaversineDistanceKM(lat1, lon1, lat2, lon2) {  
  var R \= 6371; // รัศมีโลก (กม.)  
  var dLat \= (lat2 \- lat1) \* Math.PI / 180;  
  var dLon \= (lon2 \- lon1) \* Math.PI / 180;  
  var a \= Math.sin(dLat/2) \* Math.sin(dLat/2) \+  
          Math.cos(lat1 \* Math.PI / 180\) \* Math.cos(lat2 \* Math.PI / 180\) \*  
          Math.sin(dLon/2) \* Math.sin(dLon/2);  
  var c \= 2 \* Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  
  return R \* c;  
}

/\*\*  
 \* คำนวณความเหมือนของสตริง (0.0 \- 1.0)  
 \*/  
function calculateSimilarity(s1, s2) {  
  var longer \= s1;  
  var shorter \= s2;  
  if (s1.length \< s2.length) {  
    longer \= s2;  
    shorter \= s1;  
  }  
  var longerLength \= longer.length;  
  if (longerLength \=== 0\) {  
    return 1.0;  
  }  
  return (longerLength \- editDistance(longer, shorter)) / parseFloat(longerLength);  
}

/\*\*  
 \* Levenshtein Edit Distance Algorithm  
 \*/  
function editDistance(s1, s2) {  
  s1 \= s1.toLowerCase();  
  s2 \= s2.toLowerCase();

  var costs \= new Array();  
  for (var i \= 0; i \<= s1.length; i++) {  
    var lastValue \= i;  
    for (var j \= 0; j \<= s2.length; j++) {  
      if (i \== 0\)  
        costs\[j\] \= j;  
      else {  
        if (j \> 0\) {  
          var newValue \= costs\[j \- 1\];  
          if (s1.charAt(i \- 1\) \!= s2.charAt(j \- 1))  
            newValue \= Math.min(Math.min(newValue, lastValue), costs\[j\]) \+ 1;  
          costs\[j \- 1\] \= lastValue;  
          lastValue \= newValue;  
        }  
      }  
    }  
    if (i \> 0\)  
      costs\[s2.length\] \= lastValue;  
  }  
  return costs\[s2.length\];  
}  
\`\`\`

\---

\#\# 4\. Service\_GeoAddr.gs

\`\`\`javascript  
/\*\*  
 \* 🌍 Service: Geo Address  
 \* บริการเกี่ยวกับที่อยู่ พิกัด และการคำนวณระยะทาง  
 \*/

var \_POSTAL\_CACHE \= null;

/\*\*  
 \* แยกวิเคราะห์ที่อยู่จากข้อความเต็ม  
 \* \[แก้ไข\]: แก้บั๊ก zipMatch\[5\] เป็น zipMatch\[1\]  
 \*/  
function parseAddressFromText(fullAddress) {  
  var result \= { province: "", district: "", postcode: "" };  
  if (\!fullAddress) return result;  
      
  var postalDB \= getPostalDataCached();  
  if (\!postalDB) return result;  
      
  // ค้นหารหัสไปรษณีย์ 5 หลัก  
  var zipMatch \= fullAddress.toString().match(/(\\d{5})/);  
  // \[แก้ไข\]: ใช้ zipMatch\[1\] แทน zipMatch\[5\] (กลุ่มที่ 1 ใน regex)  
  if (zipMatch && postalDB.byZip\[zipMatch\[1\]\]) {  
    var infoList \= postalDB.byZip\[zipMatch\[1\]\];  
    if (infoList.length \> 0\) {  
       var info \= infoList\[0\];  
       return {   
         province: info.province,   
         district: info.district,   
         postcode: zipMatch\[1\]   
       };  
    }  
  }  
  return result;  
}

/\*\*  
 \* โหลดข้อมูลรหัสไปรษณีย์จากชีต PostalRef  
 \*/  
function getPostalDataCached() {  
  if (\_POSTAL\_CACHE) return \_POSTAL\_CACHE;  
      
  var sheet \= SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PostalRef");  
  if (\!sheet) return null;  
      
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return null;  
      
  // \[แก้ไข\]: อ่านเฉพาะ 9 คอลัมน์แรก (A-I) ตามที่ใช้จริง  
  var data \= sheet.getRange(2, 1, lastRow \- 1, 9).getValues();  
  var db \= { byZip: {} };  
      
  data.forEach(row \=\> {  
    var pc \= String(row\[0\]).trim();  
    if (\!db.byZip\[pc\]) db.byZip\[pc\] \= \[\];  
        
    // Col G (index 6\) \= District, Col I (index 8\) \= Province  
    if (row\[6\] && row\[8\]) {  
      db.byZip\[pc\].push({   
        postcode: pc,   
        district: row\[6\],   
        province: row\[8\]   
      });  
    }  
  });  
      
  \_POSTAL\_CACHE \= db;  
  return db;  
}

// \---------------------------  
// MAPS API & CACHE  
// \---------------------------

/\*\*  
 \* ดึงที่อยู่จากพิกัด (Reverse Geocoding) พร้อม Cache  
 \*/  
function GET\_ADDR\_WITH\_CACHE(lat, lng) {  
  if (\!lat || \!lng) return "";  
  var key \= "rev\_" \+ lat \+ "\_" \+ lng;  
  var cached \= getCache(key);  
  if (cached) return cached;

  try {  
    var response \= Maps.newGeocoder().setLanguage("th").reverseGeocode(lat, lng);  
    if (response.results && response.results.length \> 0\) {  
      var addr \= response.results\[0\].formatted\_address;  
      setCache(key, addr);  
      return addr;  
    }  
  } catch (e) {  
    console.error("Geocoding Error: " \+ e.message);  
  }  
  return "";  
}

/\*\*  
 \* คำนวณระยะทางขับรถ พร้อม Cache  
 \*/  
function CALCULATE\_DISTANCE\_KM(origin, destination) {  
  if (\!origin || \!destination) return "";  
  var key \= "dist\_" \+ origin \+ "\_" \+ destination;  
  var cached \= getCache(key);  
  if (cached) return cached;

  try {  
    var directions \= Maps.newDirectionFinder()  
      .setOrigin(origin)  
      .setDestination(destination)  
      .setMode(Maps.DirectionFinder.Mode.DRIVING)  
      .getDirections();

    if (directions.routes && directions.routes.length \> 0\) {  
      var legs \= directions.routes\[0\].legs;  
      if (legs && legs.length \> 0\) {  
        var meters \= legs\[0\].distance.value;  
        var km \= (meters / 1000).toFixed(2);  
        setCache(key, km);  
        return km;  
      }  
    }  
  } catch (e) {  
    console.error("Distance Calculation Error: " \+ e.message);  
  }  
  return "";  
}

// Cache Helper  
const getCache \= key \=\> CacheService.getDocumentCache().get(md5(key));  
const setCache \= (key, value) \=\> CacheService.getDocumentCache().put(md5(key), value, 21600);  
\`\`\`

\---

\#\# 5\. Service\_Master.gs

\`\`\`javascript  
/\*\*  
 \* 🧠 Service: Master Data Management  
 \* จัดการข้อมูลหลักของระบบ  
 \*/

// \==========================================  
// 1\. IMPORT & SYNC  
// \==========================================

/\*\*  
 \* ซิงค์ข้อมูลใหม่จาก Source Sheet เข้า Database  
 \*/  
function syncNewDataToMaster() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sourceSheet \= ss.getSheetByName(CONFIG.SOURCE\_SHEET);  
  var masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
      
  if (\!sourceSheet || \!masterSheet) {   
    Browser.msgBox("❌ ไม่พบ Sheet (Source หรือ Database)");   
    return;   
  }

  // Mapping Column จาก Source (SCGนครหลวง...)  
  var SRC \= { NAME: 13, LAT: 15, LNG: 16, SYS\_ADDR: 19, DIST: 24, GOOG\_ADDR: 25 };

  var lastRowM \= masterSheet.getLastRow();  
  var existingNames \= {};  
      
  // โหลดชื่อเดิมเพื่อกันซ้ำ  
  if (lastRowM \> 1\) {  
    var mData \= masterSheet.getRange(2, CONFIG.COL\_NAME, lastRowM \- 1, 1).getValues();  
    mData.forEach(function(r) {   
      if (r\[0\]) existingNames\[normalizeText(r\[0\])\] \= true;   
    });  
  }

  var lastRowS \= sourceSheet.getLastRow();  
  if (lastRowS \< 2\) return;  
      
  var sData \= sourceSheet.getRange(2, 1, lastRowS \- 1, 25).getValues();  
  var newEntries \= \[\];  
  var currentBatch \= {};

  sData.forEach(function(row) {  
    var name \= row\[SRC.NAME \- 1\];  
    var lat \= row\[SRC.LAT \- 1\];  
    var lng \= row\[SRC.LNG \- 1\];  
        
    if (\!name || \!lat || \!lng) return;  
        
    var clean \= normalizeText(name);  
    // เช็คซ้ำทั้งใน DB และใน Batch ปัจจุบัน  
    if (\!existingNames\[clean\] && \!currentBatch\[clean\]) {  
      // \[แก้ไข\]: จองพื้นที่ถึง Col Q (17 คอลัมน์) ตาม Config  
      var newRow \= new Array(17).fill("");  
          
      newRow\[CONFIG.COL\_NAME \- 1\] \= name;  
      newRow\[CONFIG.COL\_LAT \- 1\] \= lat;  
      newRow\[CONFIG.COL\_LNG \- 1\] \= lng;  
      newRow\[CONFIG.COL\_VERIFIED \- 1\] \= false;     
      newRow\[CONFIG.COL\_SYS\_ADDR \- 1\] \= row\[SRC.SYS\_ADDR \- 1\];     
      newRow\[CONFIG.COL\_ADDR\_GOOG \- 1\] \= row\[SRC.GOOG\_ADDR \- 1\];     
      newRow\[CONFIG.COL\_DIST\_KM \- 1\] \= cleanDistance(row\[SRC.DIST \- 1\]);     
          
      // Enterprise Data  
      newRow\[CONFIG.COL\_UUID \- 1\] \= generateUUID();     
      newRow\[CONFIG.COL\_CREATED \- 1\] \= new Date();     
      newRow\[CONFIG.COL\_UPDATED \- 1\] \= new Date();  
          
      newEntries.push(newRow);  
      currentBatch\[clean\] \= true;  
    }  
  });

  if (newEntries.length \> 0\) {  
    masterSheet.getRange(lastRowM \+ 1, 1, newEntries.length, 17).setValues(newEntries);  
    Browser.msgBox("✅ นำเข้าข้อมูลใหม่ " \+ newEntries.length \+ " รายการ");  
  } else {  
    Browser.msgBox("👌 ไม่มีข้อมูลใหม่ที่ต้องนำเข้า");  
  }  
}

// \==========================================  
// 2\. DATA ENRICHMENT (GEO & CLUSTER)  
// \==========================================

function updateGeoData\_SmartCache() {     
  runDeepCleanBatch\_100();  
}

function autoGenerateMasterList\_Smart() {     
  processClustering();  
}

// \==========================================  
// 3\. DEEP CLEAN & VALIDATION  
// \==========================================

/\*\*  
 \* ตรวจสอบและแก้ไขข้อมูลทีละ 100 แถว  
 \* \[แก้ไข\]: อ่านข้อมูลถึง Col Q (17) ให้ครบ  
 \*/  
function runDeepCleanBatch\_100() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) return;

  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;

  var props \= PropertiesService.getScriptProperties();  
  var startRow \= parseInt(props.getProperty('DEEP\_CLEAN\_POINTER') || '2');  
      
  if (startRow \> lastRow) {  
    Browser.msgBox("🎉 ตรวจครบทุกแถวแล้วครับ\! (กดรีเซ็ตถ้าต้องการเริ่มใหม่)");  
    return;  
  }

  var endRow \= Math.min(startRow \+ CONFIG.DEEP\_CLEAN\_LIMIT \- 1, lastRow);  
  var numRows \= endRow \- startRow \+ 1;  
      
  // \[แก้ไข\]: อ่านข้อมูลถึง Col Q (17) ให้ครบตามโครงสร้าง  
  var range \= sheet.getRange(startRow, 1, numRows, 17);  
  var values \= range.getValues();  
      
  var origin \= CONFIG.DEPOT\_LAT \+ "," \+ CONFIG.DEPOT\_LNG;  
  var updatedCount \= 0;

  for (var i \= 0; i \< values.length; i++) {  
    var row \= values\[i\];  
    var lat \= row\[CONFIG.COL\_LAT \- 1\];  
    var lng \= row\[CONFIG.COL\_LNG \- 1\];  
    var googleAddr \= row\[CONFIG.COL\_ADDR\_GOOG \- 1\];  
    var distKM \= row\[CONFIG.COL\_DIST\_KM \- 1\];  
    var hasCoord \= (lat && lng && \!isNaN(lat) && \!isNaN(lng));  
    var changed \= false;

    // Task A: เติมที่อยู่และระยะทาง (ถ้าขาด)  
    if (hasCoord) {  
      if (\!googleAddr || googleAddr \=== "") {  
        var addr \= GET\_ADDR\_WITH\_CACHE(lat, lng);  
        if (addr && addr \!== "Error") {  
          row\[CONFIG.COL\_ADDR\_GOOG \- 1\] \= addr;  
          googleAddr \= addr;  
          changed \= true;  
        }  
      }  
      if (\!distKM || distKM \=== "") {  
        var km \= CALCULATE\_DISTANCE\_KM(origin, lat \+ "," \+ lng);  
        if (km) {   
          row\[CONFIG.COL\_DIST\_KM \- 1\] \= km;   
          changed \= true;   
        }  
      }  
    }  
        
    // Task B: เติม UUID (ถ้าขาด)  
    if (\!row\[CONFIG.COL\_UUID \- 1\]) {   
      row\[CONFIG.COL\_UUID \- 1\] \= generateUUID();   
      row\[CONFIG.COL\_CREATED \- 1\] \= row\[CONFIG.COL\_CREATED \- 1\] || new Date();   
      changed \= true;   
    }

    // Task C: แกะที่อยู่ลง Col L, M, N  
    if (googleAddr && (\!row\[CONFIG.COL\_PROVINCE \- 1\] || \!row\[CONFIG.COL\_DISTRICT \- 1\])) {  
       var parsed \= parseAddressFromText(googleAddr);  
       if (parsed.province) {  
         row\[CONFIG.COL\_PROVINCE \- 1\] \= parsed.province;  
         row\[CONFIG.COL\_DISTRICT \- 1\] \= parsed.district;  
         row\[CONFIG.COL\_POSTCODE \- 1\] \= parsed.postcode;  
         changed \= true;  
       }  
    }

    if (changed) {  
       row\[CONFIG.COL\_UPDATED \- 1\] \= new Date();  
       updatedCount++;  
    }  
  }

  if (updatedCount \> 0\) {  
    range.setValues(values);  
  }  
      
  props.setProperty('DEEP\_CLEAN\_POINTER', (endRow \+ 1).toString());  
  ss.toast("✅ ตรวจสอบช่วงแถว " \+ startRow \+ " ถึง " \+ endRow \+ "\\n(แก้ไข " \+ updatedCount \+ " รายการ)", "Deep Clean Status");  
}

function resetDeepCleanMemory() {  
  PropertiesService.getScriptProperties().deleteProperty('DEEP\_CLEAN\_POINTER');  
  Browser.msgBox("🔄 รีเซ็ตความจำแล้ว เริ่มต้นใหม่ที่แถว 2");  
}

// \==========================================  
// 4\. FINALIZE & MAPPING  
// \==========================================

/\*\*  
 \* จบงาน: ย้ายข้อมูลที่ Verified ไป Mapping และลบข้อมูลที่ไม่ผ่าน  
 \* \[แก้ไข\]: อ่านข้อมูลถึง Col Q (17)  
 \*/  
function finalizeAndClean\_MoveToMapping() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
      
  if (\!masterSheet || \!mapSheet) {   
    Browser.msgBox("❌ ไม่พบ Sheet");   
    return;   
  }  
    
  var lastRow \= masterSheet.getLastRow();  
  if (lastRow \< 2\) return;

  var uuidMap \= {};  
  // \[แก้ไข\]: อ่านข้อมูลถึง Col Q (17)  
  var allData \= masterSheet.getRange(2, 1, lastRow \- 1, 17).getValues();  
      
  allData.forEach(function(row) {  
    var name \= normalizeText(row\[CONFIG.COL\_NAME \- 1\]);  
    var suggested \= normalizeText(row\[CONFIG.COL\_SUGGESTED \- 1\]);  
    var uuid \= row\[CONFIG.COL\_UUID \- 1\];  
        
    if (uuid) {  
      if (name) uuidMap\[name\] \= uuid;  
      if (suggested) uuidMap\[suggested\] \= uuid;  
    }  
  });

  var backupName \= "Backup\_" \+ Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd\_HHmmss");  
  masterSheet.copyTo(ss).setName(backupName);  
      
  var rowsToKeep \= \[\];           
  var mappingToUpload \= \[\];     
  var processedNames \= {};

  for (var i \= 0; i \< allData.length; i++) {  
    var row \= allData\[i\];  
    var rawName \= row\[CONFIG.COL\_NAME \- 1\];          
    var suggestedName \= row\[CONFIG.COL\_SUGGESTED \- 1\];     
    var isVerified \= row\[CONFIG.COL\_VERIFIED \- 1\];        
    var currentUUID \= row\[CONFIG.COL\_UUID \- 1\];

    if (isVerified \=== true) {  
      rowsToKeep.push(row);  
    } else if (suggestedName && suggestedName \!== "") {  
      if (rawName \!== suggestedName && \!processedNames\[rawName\]) {  
        var targetUUID \= uuidMap\[normalizeText(suggestedName)\] || currentUUID;  
        mappingToUpload.push(\[rawName, suggestedName, targetUUID\]);  
        processedNames\[rawName\] \= true;  
      }  
    }  
  }

  if (mappingToUpload.length \> 0\) {  
    var lastRowMap \= mapSheet.getLastRow();  
    var existingMapKeys \= {};  
    if (lastRowMap \> 1\) {  
      var mapData \= mapSheet.getRange(2, 1, lastRowMap \- 1, 1).getValues();  
      mapData.forEach(function(r) {   
        existingMapKeys\[normalizeText(r\[0\])\] \= true;   
      });  
    }  
    var finalMapping \= mappingToUpload.filter(function(m) {   
      return \!existingMapKeys\[normalizeText(m\[0\])\];   
    });  
        
    if (finalMapping.length \> 0\) {  
      mapSheet.getRange(mapSheet.getLastRow() \+ 1, 1, finalMapping.length, 3).setValues(finalMapping);  
    }  
  }

  masterSheet.getRange(2, 1, lastRow, 17).clearContent();  
      
  if (rowsToKeep.length \> 0\) {  
    masterSheet.getRange(2, 1, rowsToKeep.length, 17).setValues(rowsToKeep);  
    Browser.msgBox("✅ จบงานเรียบร้อย\!\\n- เพิ่ม Mapping: " \+ mappingToUpload.length \+ " รายการ\\n- คงเหลือ Master: " \+ rowsToKeep.length \+ " รายการ");  
  } else {  
    masterSheet.getRange(2, 1, allData.length, 17).setValues(allData);  
    Browser.msgBox("⚠️ ไม่พบข้อมูล Verified เลย (ระบบได้กู้คืนข้อมูลเดิมกลับมาให้แล้ว)");  
  }  
}

// \==========================================  
// 5\. ADMIN TOOLS  
// \==========================================

/\*\*  
 \* สร้าง UUID ให้แถวที่ยังไม่มี  
 \*/  
function assignMissingUUIDs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) return;

  if (sheet.getMaxColumns() \< CONFIG.COL\_UUID) {  
    sheet.insertColumnsAfter(sheet.getMaxColumns(), CONFIG.COL\_UUID \- sheet.getMaxColumns());  
    sheet.getRange(1, CONFIG.COL\_UUID).setValue("UUID").setFontWeight("bold");  
  }

  var lastRow \= sheet.getLastRow();  
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
    Browser.msgBox("✅ สร้าง UUID ใหม่จำนวน: " \+ count);  
  } else {  
    Browser.msgBox("ℹ️ ข้อมูลครบถ้วนแล้ว ไม่มีการสร้างเพิ่ม");  
  }  
}

/\*\*  
 \* ซ่อมแซมชีต NameMapping  
 \*/  
function repairNameMapping\_Full() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
      
  if (\!dbSheet || \!mapSheet) {   
    Browser.msgBox("❌ ไม่พบ Sheet");   
    return;   
  }

  var dbData \= dbSheet.getRange(2, 1, dbSheet.getLastRow() \- 1, CONFIG.COL\_UUID).getValues();  
  var uuidMap \= {};  
  dbData.forEach(function(r) {  
    if (r\[CONFIG.COL\_UUID-1\]) {  
       uuidMap\[normalizeText(r\[CONFIG.COL\_NAME-1\])\] \= r\[CONFIG.COL\_UUID-1\];  
    }  
  });

  var mapRange \= mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 3);  
  var mapValues \= mapRange.getValues();  
  var cleanList \= \[\];  
  var seen \= {};

  mapValues.forEach(function(r) {  
    var oldN \= r\[0\], newN \= r\[1\], uid \= r\[2\];  
    var normOld \= normalizeText(oldN);  
        
    if (\!normOld) return;  
        
    if (\!uid) {  
      uid \= uuidMap\[normalizeText(newN)\];  
    }  
        
    if (\!seen\[normOld\]) {  
      seen\[normOld\] \= true;  
      cleanList.push(\[oldN, newN, uid\]);  
    }  
  });

  if (cleanList.length \> 0\) {  
    mapSheet.getRange(2, 1, mapSheet.getLastRow(), 3).clearContent();  
    mapSheet.getRange(2, 1, cleanList.length, 3).setValues(cleanList);  
    Browser.msgBox("✅ ซ่อมแซม Mapping เสร็จสิ้น (เหลือ " \+ cleanList.length \+ " รายการ)");  
  }  
}

// \==========================================  
// 6\. HELPER LOGIC (Full Clustering)  
// \==========================================

/\*\*  
 \* จัดกลุ่มชื่อร้านค้าที่อยู่ใกล้กัน  
 \* \[แก้ไข\]: อ่านถึง Col Q (17) แทนที่จะแค่ Col O (15)  
 \*/  
function processClustering() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return;

  // \[แก้ไข\]: อ่านถึง Col Q (17) แทนที่จะแค่ Col O (15)  
  var range \= sheet.getRange(2, 1, lastRow \- 1, 17);  
  var values \= range.getValues();  
      
  var clusters \= \[\];

  // Phase 1: หาตัวตั้งต้น (Verified Rows)  
  values.forEach(function(r, idx) {  
    if (r\[CONFIG.COL\_VERIFIED \- 1\] \=== true) {  
      clusters.push({  
        lat: parseFloat(r\[CONFIG.COL\_LAT \- 1\]),  
        lng: parseFloat(r\[CONFIG.COL\_LNG \- 1\]),  
        name: r\[CONFIG.COL\_SUGGESTED \- 1\] || r\[CONFIG.COL\_NAME \- 1\],  
        rowIndexes: \[idx\],  
        hasLock: true  
      });  
    }  
  });

  // Phase 2: จับคู่แถวที่เหลือ (Unverified)  
  values.forEach(function(r, idx) {  
    if (r\[CONFIG.COL\_VERIFIED \- 1\] \=== true) return;

    var lat \= parseFloat(r\[CONFIG.COL\_LAT \- 1\]);  
    var lng \= parseFloat(r\[CONFIG.COL\_LNG \- 1\]);  
        
    if (isNaN(lat) || isNaN(lng)) return;

    var found \= false;  
        
    for (var c \= 0; c \< clusters.length; c++) {  
      var dist \= getHaversineDistanceKM(lat, lng, clusters\[c\].lat, clusters\[c\].lng);  
      if (dist \<= CONFIG.DISTANCE\_THRESHOLD\_KM) {  
        clusters\[c\].rowIndexes.push(idx);  
        found \= true;  
        break;  
      }  
    }

    if (\!found) {  
      clusters.push({  
        lat: lat,  
        lng: lng,  
        rowIndexes: \[idx\],  
        hasLock: false,  
        name: null  
      });  
    }  
  });

  // Phase 3: ตัดสินชื่อผู้ชนะ และอัปเดตข้อมูล  
  clusters.forEach(function(g) {  
    var rawNames \= g.rowIndexes.map(function(i) {   
      return values\[i\]\[CONFIG.COL\_NAME \- 1\];   
    });  
    var winner \= g.hasLock ? g.name : getBestName\_Smart(rawNames);  
    var confidenceScore \= g.rowIndexes.length;

    g.rowIndexes.forEach(function(idx) {  
      if (values\[idx\]\[CONFIG.COL\_VERIFIED \- 1\] \!== true) {  
        values\[idx\]\[CONFIG.COL\_SUGGESTED \- 1\] \= winner;  
        values\[idx\]\[CONFIG.COL\_CONFIDENCE \- 1\] \= confidenceScore;  
        values\[idx\]\[CONFIG.COL\_NORMALIZED \- 1\] \= normalizeText(winner);  
      }  
    });  
  });

  range.setValues(values);  
  ss.toast("✅ จัดกลุ่มและแนะนำชื่อมาตรฐานเรียบร้อยแล้ว", "Clustering");  
}  
\`\`\`

\---

\#\# 6\. Service\_SCG.gs

\`\`\`javascript  
/\*\*  
 \* 📦 Service: SCG Operation  
 \* ดึงข้อมูลจาก SCG API และประมวลผล  
 \*/

/\*\*  
 \* ดึงข้อมูล Shipment จาก SCG API  
 \*/  
function fetchDataFromSCGJWD() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const ui \= SpreadsheetApp.getUi();

  try {  
    const inputSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
    const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);

    if (\!inputSheet || \!dataSheet) throw new Error("ไม่พบชีต Input หรือ Data");

    const cookie \= inputSheet.getRange(SCG\_CONFIG.COOKIE\_CELL).getValue();  
    if (\!cookie) throw new Error("ไม่พบ Cookie");

    const lastRow \= inputSheet.getLastRow();  
    if (lastRow \< SCG\_CONFIG.INPUT\_START\_ROW) throw new Error("ไม่พบ Shipment No.");

    const shipmentNumbers \= inputSheet  
      .getRange(SCG\_CONFIG.INPUT\_START\_ROW, 1, lastRow \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1\)  
      .getValues().flat().filter(String);

    const shipmentString \= shipmentNumbers.join(',');  
    if (\!shipmentString) throw new Error("Shipment No. ว่าง");

    inputSheet.getRange(SCG\_CONFIG.SHIPMENT\_STRING\_CELL)  
      .setValue(shipmentString)  
      .setHorizontalAlignment("left");

    const payload \= {  
      DeliveryDateFrom: '',  
      DeliveryDateTo: '',  
      TenderDateFrom: '',  
      TenderDateTo: '',  
      CarrierCode: '',  
      CustomerCode: '',  
      OriginCodes: '',  
      ShipmentNos: shipmentString  
    };

    const options \= {  
      method: 'post',  
      payload: payload,  
      muteHttpExceptions: true,  
      headers: { cookie: cookie }  
    };

    ss.toast("กำลังดึงข้อมูลและวิเคราะห์ E-POD...", "System Status", 60);  
    const response \= UrlFetchApp.fetch(SCG\_CONFIG.API\_URL, options);  
    if (response.getResponseCode() \!== 200\) throw new Error(response.getContentText());

    const shipments \= JSON.parse(response.getContentText()).data;  
    if (\!shipments || shipments.length \=== 0\) throw new Error("ไม่พบข้อมูลจาก API");

    const allFlatData \= \[\];  
    let runningRow \= 2;

    // \===============================  
    // Phase 1: Flatten Data  
    // \===============================  
    shipments.forEach(shipment \=\> {  
      const destSet \= new Set();  
      (shipment.DeliveryNotes || \[\]).forEach(n \=\> {  
        if (n.ShipToName) destSet.add(n.ShipToName);  
      });

      const totalDestCount \= destSet.size;  
      const destListStr \= Array.from(destSet).join(", ");

      (shipment.DeliveryNotes || \[\]).forEach(note \=\> {  
        (note.Items || \[\]).forEach(item \=\> {  
          const planDeliveryDate \= note.PlanDelivery ? new Date(note.PlanDelivery) : null;  
          const dailyJobId \= note.PurchaseOrder \+ "-" \+ runningRow;

          const row \= \[  
            dailyJobId,                         // 0: A  
            planDeliveryDate,                   // 1: B  
            String(note.PurchaseOrder),         // 2: C  
            String(shipment.ShipmentNo),        // 3: D  
            shipment.DriverName,                // 4: E  
            shipment.TruckLicense,              // 5: F  
            String(shipment.CarrierCode),       // 6: G  
            shipment.CarrierName,               // 7: H  
            String(note.SoldToCode),            // 8: I  
            note.SoldToName,                    // 9: J  
            note.ShipToName,                    // 10: K  
            note.ShipToAddress,                 // 11: L  
            note.ShipToLatitude \+ ", " \+ note.ShipToLongitude, // 12: M  
            item.MaterialName,                  // 13: N  
            item.ItemQuantity,                  // 14: O  
            item.QuantityUnit,                  // 15: P  
            item.ItemWeight,                    // 16: Q  
            String(note.DeliveryNo),            // 17: R  
            totalDestCount,                     // 18: S  
            destListStr,                        // 19: T  
            "รอสแกน",                           // 20: U  
            "ยังไม่ได้ส่ง",                       // 21: V  
            "",                                 // 22: W (Email)  
            0,                                  // 23: X (Qty Sum)  
            0,                                  // 24: Y (Weight Sum)  
            0,                                  // 25: Z (Scan Invoice)  
            "",                                 // 26: AA (LatLong\_Actual)  
            "",                                 // 27: AB (Display Text)  
            ""                                  // 28: AC (ShopKey)  
          \];

          allFlatData.push(row);  
          runningRow++;  
        });  
      });  
    });

    // \===============================  
    // Phase 2: Grouping \+ E-POD  
    // \===============================  
    const shopAgg \= {};

    allFlatData.forEach(r \=\> {  
      const shipmentNo \= r\[3\];  
      const shopName \= r\[10\];  
      const ownerName \= r\[9\];  
      const invoiceNo \= r\[2\];  
      const qty \= Number(r\[14\]) || 0;  
      const weight \= Number(r\[16\]) || 0;

      const key \= shipmentNo \+ "|" \+ shopName;

      if (\!shopAgg\[key\]) {  
        shopAgg\[key\] \= {  
          totalQty: 0,  
          totalWeight: 0,  
          allInvoices: new Set(),  
          epodInvoices: new Set()  
        };  
      }

      const isEPOD \= checkIsEPOD(ownerName, invoiceNo);

      shopAgg\[key\].totalQty \+= qty;  
      shopAgg\[key\].totalWeight \+= weight;  
      shopAgg\[key\].allInvoices.add(invoiceNo);  
      if (isEPOD) shopAgg\[key\].epodInvoices.add(invoiceNo);  
    });

    // \===============================  
    // Phase 3: Write Aggregation  
    // \===============================  
    allFlatData.forEach(r \=\> {  
      const key \= r\[3\] \+ "|" \+ r\[10\];  
      const agg \= shopAgg\[key\];

      const scanInv \= agg.allInvoices.size \- agg.epodInvoices.size;

      r\[23\] \= agg.totalQty;  
      r\[24\] \= Number(agg.totalWeight.toFixed(2));  
      r\[25\] \= scanInv;  
      r\[27\] \= \`${r\[9\]} / รวม ${scanInv} บิล\`;  
      r\[28\] \= key;  
    });

    // \===============================  
    // Phase 4: Write Sheet  
    // \===============================  
    const headers \= \[  
      "ID\_งานประจำวัน",  
      "PlanDelivery",  
      "InvoiceNo",  
      "ShipmentNo",  
      "DriverName",  
      "TruckLicense",  
      "CarrierCode",  
      "CarrierName",  
      "SoldToCode",  
      "SoldToName",  
      "ShipToName",  
      "ShipToAddress",  
      "LatLong\_SCG",  
      "MaterialName",  
      "ItemQuantity",  
      "QuantityUnit",  
      "ItemWeight",  
      "DeliveryNo",  
      "จำนวนปลายทาง\_System",  
      "รายชื่อปลายทาง\_System",  
      "ScanStatus",  
      "DeliveryStatus",  
      "Email พนักงาน",  
      "จำนวนสินค้ารวมของร้านนี้",  
      "น้ำหนักสินค้ารวมของร้านนี้",  
      "จำนวน\_Invoice\_ที่ต้องสแกน",  
      "LatLong\_Actual",  
      "ชื่อเจ้าของสินค้า\_Invoice\_ที่ต้องสแกน",  
      "ShopKey"  
    \];

    dataSheet.clear();  
    dataSheet.getRange(1, 1, 1, headers.length)  
      .setValues(\[headers\])  
      .setFontWeight("bold");

    if (allFlatData.length \> 0\) {  
      dataSheet.getRange(2, 1, allFlatData.length, headers.length)  
        .setValues(allFlatData);  
      dataSheet.getRange(2, 2, allFlatData.length, 1\)  
        .setNumberFormat("dd/mm/yyyy");  
      dataSheet.getRange(2, 3, allFlatData.length, 1\)  
        .setNumberFormat("@");  
      dataSheet.autoResizeColumns(1, headers.length);  
    }

    ss.toast("โหลดข้อมูลเสร็จสิ้น", "System Status", 5);  
    applyMasterCoordinatesToDailyJob();  
    ui.alert(\`ดึงข้อมูลสำเร็จ ${allFlatData.length} แถว\`);

  } catch (e) {  
    SpreadsheetApp.getUi().alert("เกิดข้อผิดพลาด: " \+ e.message);  
  }  
}

/\*\*  
 \* 🧠 E-POD Logic  
 \* ตรวจสอบว่าเป็น E-POD หรือไม่  
 \*/  
function checkIsEPOD(ownerName, invoiceNo) {  
  if (\!ownerName || \!invoiceNo) return false;

  const owner \= ownerName.toUpperCase();  
  const inv \= invoiceNo.toUpperCase();

  const whitelist \= \["SCG EXPRESS", "BETTERBE", "JWD TRANSPORT"\];  
  if (whitelist.some(w \=\> owner.includes(w))) return true;

  if (\["\_DOC", "-DOC", "FFF", "EOP", "แก้เอกสาร"\].some(k \=\> inv.includes(k))) return false;  
  if (inv.startsWith("N3")) return false;

  if (owner.includes("DENSO") || owner.includes("เด็นโซ่") || /^(78|79)/.test(inv)) return true;

  return false;  
}

/\*\*  
 \* 🛰️ ฟังก์ชันจับคู่พิกัดและอีเมลพนักงาน  
 \* \[แก้ไข\]: แก้ index คอลัมน์ให้ตรงกับโครงสร้างจริง  
 \*/  
function applyMasterCoordinatesToDailyJob() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  const dbSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_MASTER\_DB);  
  const mapSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_MAPPING);  
  const empSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_EMPLOYEE);

  if (\!dataSheet || \!dbSheet || \!empSheet) return;

  const lastRow \= dataSheet.getLastRow();  
  if (lastRow \< 2\) return;

  // โหลด Master DB  
  const masterCoords \= {};  
  if (dbSheet.getLastRow() \> 1\) {  
    // \[แก้ไข\]: อ่าน Col A (ชื่อ), B (Lat), C (Lng)  
    dbSheet.getRange(2, 1, dbSheet.getLastRow() \- 1, 3).getValues().forEach(r \=\> {  
      if (r\[0\] && r\[1\] && r\[2\]) {  
        masterCoords\[normalizeText(r\[0\])\] \= r\[1\] \+ ", " \+ r\[2\];  
      }  
    });  
  }

  // โหลด Name Mapping  
  const aliasMap \= {};  
  if (mapSheet && mapSheet.getLastRow() \> 1\) {  
    mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 2).getValues().forEach(r \=\> {  
      if (r\[0\] && r\[1\]) {  
        aliasMap\[normalizeText(r\[0\])\] \= normalizeText(r\[1\]);  
      }  
    });  
  }

  // โหลดข้อมูลพนักงาน  
  const empMap \= {};  
  // \[แก้ไข\]: อ่าน Col A (index 0\) ถึง H (index 7\) \- Col B (index 1\) \= ชื่อ, Col G (index 6\) \= Email  
  empSheet.getRange(2, 1, empSheet.getLastRow() \- 1, 8).getValues().forEach(r \=\> {  
    if (r\[1\] && r\[6\]) {  
      empMap\[normalizeText(r\[1\])\] \= r\[6\];  
    }  
  });

  // \[แก้ไข\]: อ่าน 29 คอลัมน์ (A-AC) ให้ครบตามที่เขียนไว้  
  const values \= dataSheet.getRange(2, 1, lastRow \- 1, 29).getValues();

  const coordUpdates \= \[\];  
  const backgrounds \= \[\];  
  const emailUpdates \= \[\];

  values.forEach(r \=\> {  
    let newGeo \= "";  
    let bg \= null;

    // Logic Map พิกัด \- r\[10\] \= ShipToName (Col K)  
    if (r\[10\]) {  
      let name \= normalizeText(r\[10\]);  
      if (aliasMap\[name\]) name \= aliasMap\[name\];  
      if (masterCoords\[name\]) {  
        newGeo \= masterCoords\[name\];  
        bg \= "\#b6d7a8";  
      } else {  
        const byBranch \= findMasterByBranchLogic(r\[10\], masterCoords);  
        if (byBranch) {  
          newGeo \= byBranch;  
          bg \= "\#b6d7a8";  
        }  
      }  
    }  
    coordUpdates.push(\[newGeo\]);  
    backgrounds.push(\[bg\]);

    // Logic Map Email \- r\[4\] \= DriverName (Col E)  
    // \[แก้ไข\]: r\[22\] คือ Col W (Email พนักงาน) \- ตรงกับ array index 22  
    emailUpdates.push(\[empMap\[normalizeText(r\[4\])\] || r\[22\]\]);  
  });

  // \[แก้ไข\]: Col 27 \= AA (LatLong\_Actual)  
  if (coordUpdates.length \> 0\) {  
    dataSheet.getRange(2, 27, coordUpdates.length, 1).setValues(coordUpdates);  
    dataSheet.getRange(2, 27, backgrounds.length, 1).setBackgrounds(backgrounds);  
  }  
    
  // \[แก้ไข\]: Col 23 \= W (Email พนักงาน)  
  if (emailUpdates.length \> 0\) {  
    dataSheet.getRange(2, 23, emailUpdates.length, 1).setValues(emailUpdates);  
  }  
}

/\*\*  
 \* หาพิกัดจากรหัสสาขา  
 \*/  
function findMasterByBranchLogic(inputName, masterCoords) {  
  const m \= inputName.match(/(?:สาขา|Branch|Code)\\s\*(?:ที่)?\\s\*(\\d+)/i);  
  if (\!m) return null;  
      
  const padded \= ("00000" \+ m\[1\]).slice(-5);  
  const brand \= normalizeText(inputName.split(/(?:สาขา|Branch|Code)/i)\[0\]);  
      
  for (const k in masterCoords) {  
    if (k.includes(brand) && k.includes(padded)) return masterCoords\[k\];  
  }  
  return null;  
}

/\*\*  
 \* ล้างข้อมูลชีต Data  
 \*/  
function clearDataSheet() {  
  const sheet \= SpreadsheetApp.getActive().getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  if (sheet && sheet.getLastRow() \> 1\) {  
    sheet.getRange(2, 1, sheet.getLastRow() \- 1, sheet.getLastColumn()).clearContent();  
    sheet.getRange(2, 1, sheet.getLastRow() \- 1, sheet.getLastColumn()).setBackground(null);  
  }  
}

/\*\*  
 \* ล้างข้อมูลชีต Input  
 \*/  
function clearInputSheet() {  
  const sheet \= SpreadsheetApp.getActive().getSheetByName(SCG\_CONFIG.SHEET\_INPUT);  
  if (\!sheet) return;  
  sheet.getRange(SCG\_CONFIG.COOKIE\_CELL).clearContent();  
  sheet.getRange(SCG\_CONFIG.SHIPMENT\_STRING\_CELL).clearContent();  
  if (sheet.getLastRow() \>= SCG\_CONFIG.INPUT\_START\_ROW) {  
    sheet.getRange(SCG\_CONFIG.INPUT\_START\_ROW, 1, sheet.getLastRow() \- SCG\_CONFIG.INPUT\_START\_ROW \+ 1, 1).clearContent();  
  }  
}

/\*\*  
 \* ล้างข้อมูลทั้งหมด  
 \*/  
function clearAllSCGSheets() {  
  const ui \= SpreadsheetApp.getUi();  
  const response \= ui.alert('ยืนยันการล้างข้อมูล', 'คุณต้องการล้างข้อมูลทั้งชีต Input และ Data หรือไม่?', ui.ButtonSet.YES\_NO);  
      
  if (response \== ui.Button.YES) {  
    clearInputSheet();  
    clearDataSheet();  
    ui.alert('✅ ล้างข้อมูลเรียบร้อยแล้วครับ');  
  }  
}  
\`\`\`

\---

\#\# 7\. Service\_AutoPilot.gs

\`\`\`javascript  
/\*\*  
 \* 🤖 Service: Auto Pilot  
 \* ระบบทำงานอัตโนมัติตามเวลา  
 \*/

/\*\*  
 \* ▶️ ฟังก์ชันเปิดระบบ Auto-Pilot  
 \* ตั้งเวลาให้ทำงานทุกๆ 10 นาที  
 \*/  
function START\_AUTO\_PILOT() {  
  // 1\. ลบ Trigger เดิมก่อนเพื่อป้องกันการซ้ำซ้อน  
  STOP\_AUTO\_PILOT();  
      
  // 2\. สร้าง Trigger ใหม่  
  ScriptApp.newTrigger("autoPilotRoutine")  
    .timeBased()  
    .everyMinutes(10)  
    .create();  
        
  // 3\. แจ้งเตือนผู้ใช้  
  var ui \= SpreadsheetApp.getUi();  
  ui.alert("✅ เปิดระบบ Auto-Pilot เรียบร้อย\\nระบบจะตรวจสอบข้อมูลทุกๆ 10 นาทีครับ");  
}

/\*\*  
 \* ⏹️ ฟังก์ชันปิดระบบ Auto-Pilot  
 \* ลบ Trigger ทั้งหมดที่เกี่ยวข้อง  
 \*/  
function STOP\_AUTO\_PILOT() {  
  var triggers \= ScriptApp.getProjectTriggers();  
  for (var i \= 0; i \< triggers.length; i++) {  
    if (triggers\[i\].getHandlerFunction() \=== "autoPilotRoutine") {  
      ScriptApp.deleteTrigger(triggers\[i\]);  
    }  
  }  
      
  // เช็คว่าถูกเรียกจากเมนูหรือไม่  
  try {  
     var caller \= arguments.callee.caller;  
     if (\!caller || caller.name \!== "START\_AUTO\_PILOT") {  
        SpreadsheetApp.getUi().alert("⏹️ ปิดระบบ Auto-Pilot แล้ว");  
     }  
  } catch(e) {}  
}

/\*\*  
 \* ⚙️ Routine Function (ทำงานเบื้องหลัง)  
 \* ห้ามเปลี่ยนชื่อฟังก์ชันนี้  
 \*/  
function autoPilotRoutine() {  
  // \---------------------------------------------------------  
  // ภารกิจที่ 1: ตรวจสอบและเติม UUID ใน Database ถ้าขาดหายไป  
  // \---------------------------------------------------------  
  try {  
    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
        
    if (dbSheet) {  
      var lastRow \= dbSheet.getLastRow();  
      if (lastRow \> 1\) {  
         // อ่านเฉพาะคอลัมน์ UUID (K)  
         var range \= dbSheet.getRange(2, CONFIG.COL\_UUID, lastRow \- 1, 1);  
         var values \= range.getValues();  
         var changed \= false;  
             
         for(var i \= 0; i \< values.length; i++) {  
           // ถ้าเจอช่องว่าง ให้สร้าง UUID ใหม่ใส่เข้าไป  
           if(\!values\[i\]\[0\] || values\[i\]\[0\] \=== "") {   
             values\[i\]\[0\] \= Utilities.getUuid();   
             changed \= true;   
           }  
         }  
             
         // บันทึกกลับเฉพาะเมื่อมีการเปลี่ยนแปลง  
         if(changed) {  
           range.setValues(values);  
           console.log("AutoPilot: Generated missing UUIDs.");  
         }  
      }  
    }  
  } catch (e) {  
    console.error("AutoPilot Error (UUID): " \+ e.message);  
  }  
      
  // \---------------------------------------------------------  
  // ภารกิจที่ 2: อัปเดตพิกัด/อีเมล ในงานประจำวัน (SCG Data)  
  // \---------------------------------------------------------  
  try {  
     // ตรวจสอบว่ามีชีต Data และมีข้อมูลอยู่หรือไม่  
     var ss \= SpreadsheetApp.getActiveSpreadsheet();  
     var dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
     if (dataSheet && dataSheet.getLastRow() \> 1\) {  
        applyMasterCoordinatesToDailyJob();  
        console.log("AutoPilot: Updated SCG Coordinates.");  
     }  
  } catch(e) {  
    console.error("AutoPilot Error (SCG): " \+ e.message);  
  }  
}  
\`\`\`

\---

\#\# 8\. WebApp.gs

\`\`\`javascript  
/\*\*  
 \* 🌐 WebApp Controller  
 \* ควบคุมการทำงานของ Web Application  
 \*/

/\*\*  
 \* จัดการคำขอ GET  
 \*/  
function doGet(e) {  
  return HtmlService.createTemplateFromFile('Index')  
      .evaluate()  
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')  
      .setTitle('🔍 Logistics Search Engine')  
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);  
}

/\*\*  
 \* ฟังก์ชันสำหรับดึง CSS/JS เข้ามาใน HTML (ถ้าแยกไฟล์)  
 \*/  
function include(filename) {  
  return HtmlService.createHtmlOutputFromFile(filename).getContent();  
}  
\`\`\`

\---

\#\# 9\. Service\_Search.gs

\`\`\`javascript  
/\*\*  
 \* 🔍 Service: Search API  
 \* API สำหรับค้นหาข้อมูลจาก Web App  
 \*/

/\*\*  
 \* ค้นหาข้อมูลลูกค้า  
 \* @param {string} keyword \- คำค้นหา  
 \* @returns {Array} ผลลัพธ์การค้นหา  
 \*/  
function searchMasterData(keyword) {  
  // 1\. ตรวจสอบ Keyword  
  if (\!keyword || keyword.trim() \=== "") return \[\];  
  var rawKey \= keyword.trim().toLowerCase();  
  var searchKey \= normalizeText(keyword); // ใช้ฟังก์ชันตัดคำฟุ่มเฟือยช่วย

  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
      
  // \----------------------------------------------------  
  // ส่วนที่ 1: โหลดข้อมูล Alias จาก NameMapping  
  // \----------------------------------------------------  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
  var aliasMap \= {}; // เก็บว่า Master Name นี้ มีชื่อเล่นอะไรบ้าง  
      
  if (mapSheet) {  
    var lastRowMap \= mapSheet.getLastRow();  
    if (lastRowMap \> 1\) {  
      // อ่าน Col A (Alias) และ Col B (Master Name)  
      var mapData \= mapSheet.getRange(2, 1, lastRowMap \- 1, 2).getValues();  
          
      mapData.forEach(function(row) {  
        var alias \= row\[0\];  
        var master \= row\[1\];  
        if (alias && master) {  
          var cleanMaster \= normalizeText(master);  
          var cleanAlias \= normalizeText(alias);  
              
          // เก็บข้อมูลแบบ: { "ชื่อจริง": "ชื่อเล่น1 ชื่อเล่น2 ..." }  
          if (\!aliasMap\[cleanMaster\]) {  
            aliasMap\[cleanMaster\] \= cleanAlias;  
          } else {  
            aliasMap\[cleanMaster\] \+= " " \+ cleanAlias;  
          }  
              
          // เก็บแบบ Raw Text ด้วยเผื่อค้นหาตรงๆ  
          aliasMap\[cleanMaster\] \+= " " \+ alias.toString().toLowerCase();  
        }  
      });  
    }  
  }

  // \----------------------------------------------------  
  // ส่วนที่ 2: ค้นหาใน Database (ชีตหลัก)  
  // \----------------------------------------------------  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  if (\!sheet) return \[\];

  var lastRow \= sheet.getLastRow();  
  if (lastRow \< 2\) return \[\];

  // อ่านข้อมูล Col A-Q  
  var data \= sheet.getRange(2, 1, lastRow \- 1, 17).getValues();  
  var results \= \[\];  
  var limit \= 100;

  for (var i \= 0; i \< data.length; i++) {  
    if (results.length \>= limit) break;

    var row \= data\[i\];  
    var name \= row\[CONFIG.COL\_NAME \- 1\];      // ชื่อลูกค้า (Master)  
    var address \= row\[CONFIG.COL\_ADDR\_GOOG \- 1\] || row\[CONFIG.COL\_SYS\_ADDR \- 1\];  
    var lat \= row\[CONFIG.COL\_LAT \- 1\];  
    var lng \= row\[CONFIG.COL\_LNG \- 1\];  
    var uuid \= row\[CONFIG.COL\_UUID \- 1\];

    if (\!name) continue;

    // เตรียมข้อมูลสำหรับตรวจสอบ  
    var normName \= normalizeText(name);  
    var normAddr \= address ? normalizeText(address) : "";  
    var rawName \= name.toString().toLowerCase();  
        
    // ดึงชื่อเล่นจาก NameMapping (ถ้ามี)  
    var aliases \= aliasMap\[normName\] || "";

    // \----------------------------------------------------  
    // 🎯 Logic การค้นหาแบบฉลาด (Smart Search)  
    // 1\. ตรงกับชื่อจริง (ใน Database)  
    // 2\. ตรงกับที่อยู่  
    // 3\. ตรงกับชื่อเล่น/ชื่อย่อ (ใน NameMapping)  
    // \----------------------------------------------------  
    if (  
      normName.includes(searchKey) ||   
      rawName.includes(rawKey) ||  
      normAddr.includes(searchKey) ||   
      aliases.includes(searchKey) || // ค้นเจอในชื่อเล่น  
      aliases.includes(rawKey)  
    ) {  
      results.push({  
        name: name,  
        address: address,  
        lat: lat,  
        lng: lng,  
        // ลิงก์นำทางทันที  
        mapLink: (lat && lng) ? "https://www.google.com/maps/dir/?api=1\&destination=" \+ lat \+ "," \+ lng : "",  
        uuid: uuid,  
        // ส่ง Alias กลับไปโชว์ด้วย  
        matchType: aliases.includes(searchKey) ? "เจอจากชื่อเล่น" : "เจอจากชื่อหลัก"  
      });  
    }  
  }

  return results;  
}  
\`\`\`

\---

\#\# 10\. Index.html

\`\`\`html  
\<\!DOCTYPE html\>  
\<html lang="th" class="h-full"\>  
 \<head\>  
  \<base target="\_top"\>  
  \<meta charset="UTF-8"\>  
  \<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"\>  
  \<title\>ค้นหาพิกัดลูกค้า\</title\>  
  \<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700\&display=swap" rel="stylesheet"\>  
  \<style\>  
    /\* \--- Base Reset & Layout \--- \*/  
    \* { margin: 0; padding: 0; box-sizing: border-box; }  
    html, body { height: 100%; width: 100%; }  
        
    body {  
      font-family: 'Kanit', \-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;  
      background: linear-gradient(135deg, \#667eea 0%, \#764ba2 100%);     
      overflow-y: hidden;     
      display: flex;  
      flex-direction: column;  
    }  
        
    .app-container {  
      width: 100%;  
      height: 100%;  
      padding: 20px;  
      display: flex;  
      flex-direction: column;  
      max-width: 800px;  
      margin: 0 auto;  
    }  
        
    /\* \--- Search Section (Sticky Top) \--- \*/  
    .search-card {  
      background: rgba(255, 255, 255, 0.95);  
      backdrop-filter: blur(10px);  
      border-radius: 24px;  
      padding: 24px;  
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);  
      animation: slideDown 0.5s ease-out;  
      flex-shrink: 0;     
      z-index: 100;  
    }

    @keyframes slideDown {  
      from { opacity: 0; transform: translateY(-30px); }  
      to { opacity: 1; transform: translateY(0); }  
    }  
        
    .app-header { text-align: center; margin-bottom: 20px; }  
    .app-title { font-size: 28px; font-weight: 700; color: \#2d3748; margin-bottom: 4px; }  
    .app-subtitle { font-size: 14px; font-weight: 300; color: \#718096; }  
        
    .search-wrapper { position: relative; display: flex; gap: 10px; }  
        
    .search-input {  
      flex: 1;  
      padding: 16px 20px;  
      padding-left: 45px; /\* เผื่อที่ให้ icon \*/  
      font-size: 16px;  
      border: 2px solid \#e2e8f0;  
      border-radius: 16px;  
      background: \#f8f9fa;  
      transition: all 0.3s ease;  
      font-family: 'Kanit', sans-serif;  
    }  
    .search-input:focus { outline: none; border-color: \#667eea; background: white; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15); }  
        
    .search-icon-inside {  
      position: absolute;  
      left: 15px;  
      top: 50%;  
      transform: translateY(-50%);  
      color: \#a0aec0;  
      pointer-events: none;  
    }

    .search-btn {  
      padding: 0 24px;  
      font-size: 16px;  
      font-weight: 600;  
      background: linear-gradient(135deg, \#667eea 0%, \#764ba2 100%);  
      color: white;  
      border: none;  
      border-radius: 16px;  
      cursor: pointer;  
      transition: all 0.3s ease;  
      font-family: 'Kanit', sans-serif;  
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);  
      white-space: nowrap;  
    }  
    .search-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); }  
    .search-btn:active { transform: translateY(0); }

    /\* \--- Results Section (Scrollable) \--- \*/  
    .results-wrapper {  
      flex-grow: 1;  
      overflow-y: auto;  
      margin-top: 20px;  
      padding-bottom: 40px;  
      padding-right: 5px;     
      \-webkit-overflow-scrolling: touch;  
    }  
    .results-wrapper::-webkit-scrollbar { width: 6px; }  
    .results-wrapper::-webkit-scrollbar-track { background: transparent; }  
    .results-wrapper::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.3); border-radius: 20px; }

    .result-card {  
      background: white;  
      border-radius: 20px;  
      padding: 20px;  
      margin-bottom: 16px;  
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);  
      border-left: 6px solid \#667eea;  
      transition: all 0.2s ease;  
      animation: fadeIn 0.4s ease-out backwards;  
    }  
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .result-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; }  
    .result-info { flex: 1; min-width: 0; }  
        
    .result-name {  
      font-size: 18px;  
      font-weight: 600;  
      margin-bottom: 6px;  
      color: \#2d3748;  
      line-height: 1.3;  
    }  
        
    .result-address {  
      font-size: 14px;  
      color: \#718096;  
      margin-bottom: 12px;  
      line-height: 1.5;  
      display: flex;  
      align-items: flex-start;  
      gap: 6px;  
    }  
        
    .coord-badge {  
      display: inline-flex;  
      align-items: center;  
      padding: 8px 12px;  
      background: \#f7fafc;  
      border: 1px solid \#e2e8f0;  
      border-radius: 10px;  
      font-size: 13px;  
      font-weight: 500;  
      color: \#4a5568;  
      cursor: pointer;  
      transition: all 0.2s;  
    }  
    .coord-badge:hover { background: \#edf2f7; border-color: \#cbd5e0; color: \#2d3748; }  
        
    .map-btn {  
      display: inline-flex;  
      align-items: center;  
      justify-content: center;  
      padding: 10px 16px;  
      background: linear-gradient(135deg, \#48bb78 0%, \#38a169 100%);  
      border-radius: 12px;  
      font-size: 14px;  
      font-weight: 500;  
      color: white;  
      text-decoration: none;  
      transition: all 0.2s;  
      box-shadow: 0 4px 6px rgba(72, 187, 120, 0.2);  
      white-space: nowrap;  
    }  
    .map-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(72, 187, 120, 0.3); }

    /\* \--- Loading & States \--- \*/  
    .loading-container { display: none; text-align: center; padding: 20px; color: white; }  
    .spinner {  
      width: 30px; height: 30px;  
      border: 3px solid rgba(255, 255, 255, 0.3);  
      border-top-color: white;  
      border-radius: 50%;  
      animation: spin 0.8s linear infinite;  
      margin: 0 auto 10px;  
    }  
    @keyframes spin { to { transform: rotate(360deg); } }  
        
    .no-results {  
      background: rgba(255,255,255,0.9);  
      border-radius: 20px;  
      padding: 30px;  
      text-align: center;  
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);  
      margin-top: 20px;  
    }  
    .no-results-icon { font-size: 48px; opacity: 0.5; margin-bottom: 10px; }

    /\* \--- Toast Notification \--- \*/  
    .toast-notification {  
      position: fixed; top: 20px; right: 20px;  
      background: \#38a169; color: white;  
      padding: 12px 20px; border-radius: 12px;  
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);  
      z-index: 1000;  
      display: none;  
      animation: slideInRight 0.3s ease-out;  
      font-size: 14px; font-weight: 500;  
      display: flex; align-items: center; gap: 8px;  
    }  
    @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

    /\* \--- Responsive \--- \*/  
    @media (max-width: 480px) {  
      .app-container { padding: 10px; }  
      .search-card { padding: 16px; border-radius: 20px; }  
      .app-title { font-size: 24px; }  
      .result-header { align-items: flex-start; }  
      .map-btn span { display: none; } /\* ซ่อน text ปุ่ม map ในมือถือเล็กๆ \*/  
      .map-btn { padding: 8px 12px; }  
      .map-btn i { margin: 0; font-size: 16px; }  
    }  
  \</style\>  
  \<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"\>  
 \</head\>  
 \<body\>

  \<div class="app-container"\>  
        
    \<div class="search-card"\>  
      \<div class="app-header"\>  
        \<h1 class="app-title"\>\<i class="fas fa-map-marked-alt text-primary me-2"\>\</i\>ค้นหาพิกัดลูกค้า\</h1\>  
        \<p class="app-subtitle"\>พิมพ์ชื่อร้าน และกดค้นหา (จาก Database)\</p\>  
      \</div\>  
          
      \<div class="search-wrapper"\>  
        \<i class="fas fa-search search-icon-inside"\>\</i\>  
        \<\!-- 🔴 กลับมาใช้ onkeyup เพื่อจับปุ่ม Enter แทน \--\>  
        \<input type="text" id="searchInput" class="search-input"   
               placeholder="พิมพ์ชื่อร้าน หรือ ที่อยู่..."   
               autocomplete="off"  
               onkeyup="handleEnter(event)"\>  
        \<\!-- 🔴 ปุ่มค้นหาต้องกดได้ \--\>  
        \<button class="search-btn" id="searchBtn" onclick="doSearch()"\>   
          \<i class="fas fa-search"\>\</i\> \<span class="d-none d-sm-inline"\>ค้นหา\</span\>   
        \</button\>  
      \</div\>  
    \</div\>

    \<div class="loading-container" id="loadingContainer"\>  
      \<div class="spinner"\>\</div\>  
      \<p class="small"\>กำลังค้นหา...\</p\>  
    \</div\>

    \<div class="results-wrapper" id="resultsContainer"\>  
      \<div class="text-center text-white opacity-75 mt-5"\>  
        \<i class="fas fa-keyboard fa-3x mb-3"\>\</i\>\<br\>  
        พิมพ์คำค้นหา แล้วกด Enter  
      \</div\>  
    \</div\>

  \</div\>

  \<div class="toast-notification" id="toast" style="display: none;"\>  
    \<i class="fas fa-check-circle"\>\</i\> \<span id="toastText"\>\</span\>  
  \</div\>

  \<script\>  
    // \--- ฟังก์ชันหลัก (แบบกดค้นหาเอง) \---

    // 1\. จับปุ่ม Enter  
    function handleEnter(event) {  
      if (event.key \=== 'Enter') {  
        doSearch();  
      }  
    }

    // 2\. ฟังก์ชันค้นหา (เรียกเมื่อกดปุ่ม หรือ Enter)  
    function doSearch() {  
      const keyword \= document.getElementById('searchInput').value.trim();  
          
      if (\!keyword) {  
        showToast('กรุณาพิมพ์คำค้นหาก่อนครับ', true);  
        document.getElementById('searchInput').focus();  
        return;  
      }  
          
      // UI Reset & Loading  
      document.getElementById('searchInput').blur();  
      document.getElementById('loadingContainer').style.display \= 'block';  
      document.getElementById('resultsContainer').innerHTML \= '';  
          
      // เรียก Backend  
      google.script.run  
        .withSuccessHandler(showResults)  
        .withFailureHandler(showError)  
        .searchMasterData(keyword);  
    }

    function showResults(data) {  
      document.getElementById('loadingContainer').style.display \= 'none';  
      const container \= document.getElementById('resultsContainer');  
      const inputVal \= document.getElementById('searchInput').value.trim();  
          
      if (\!data || data.length \=== 0\) {  
        container.innerHTML \= \`  
          \<div class="no-results"\>  
            \<div class="no-results-icon"\>🤔\</div\>  
            \<p class="text-muted fw-bold"\>ไม่พบข้อมูล "${inputVal}"\</p\>  
            \<p class="small text-secondary"\>ลองตรวจสอบตัวสะกดอีกครั้ง\</p\>  
          \</div\>  
        \`;  
        return;  
      }  
          
      let html \= '';  
      if (data.length \>= 100\) {  
         html \+= \`\<div class="text-center text-white mb-2 small" style="opacity:0.8"\>\<i class="fas fa-info-circle"\>\</i\> แสดง 100 รายการแรก\</div\>\`;  
      }

      data.forEach((item, index) \=\> {  
        const hasCoord \= (item.lat && item.lng);  
            
        // ปุ่มพิกัด  
        const coordDisplay \= hasCoord     
          ? \`\<div class="coord-badge" onclick="copyToClipboard('${item.lat}, ${item.lng}')"\>  
               \<i class="fas fa-crosshairs text-danger me-1"\>\</i\> ${item.lat}, ${item.lng}  
             \</div\>\`  
          : \`\<span class="badge bg-light text-danger border"\>ไม่มีพิกัด\</span\>\`;  
            
        // ปุ่มนำทาง (Google Maps Direction Mode)  
        const mapButton \= hasCoord  
          ? \`\<a href="https://www.google.com/maps/dir/?api=1\&destination=${item.lat},${item.lng}" target="\_blank" class="map-btn"\>  
               \<i class="fas fa-location-arrow me-2"\>\</i\> \<span\>นำทาง\</span\>  
             \</a\>\`  
          : '';  
            
        html \+= \`  
          \<div class="result-card" style="animation-delay: ${index \* 0.05}s"\>  
            \<div class="result-header"\>  
              \<div class="result-info"\>  
                \<h3 class="result-name"\>${item.name}\</h3\>  
                \<p class="result-address"\>  
                  \<i class="fas fa-map-marker-alt text-muted mt-1"\>\</i\>  
                  \<span\>${item.address || 'ไม่ระบุที่อยู่'}\</span\>  
                \</p\>  
                ${coordDisplay}  
              \</div\>  
              \<div class="result-actions"\>  
                ${mapButton}  
              \</div\>  
            \</div\>  
          \</div\>  
        \`;  
      });  
          
      container.innerHTML \= html;  
    }

    function showError(err) {  
      document.getElementById('loadingContainer').style.display \= 'none';  
      alert("เกิดข้อผิดพลาด: " \+ err.message);  
    }

    // \--- Utilities \---

    function copyToClipboard(text) {  
      navigator.clipboard.writeText(text).then(() \=\> {  
        showToast(\`คัดลอกพิกัดแล้ว: ${text}\`);  
      }).catch(() \=\> {  
        // Fallback  
        const textArea \= document.createElement('textarea');  
        textArea.value \= text;  
        document.body.appendChild(textArea);  
        textArea.select();  
        try {  
          document.execCommand('copy');  
          showToast(\`คัดลอกพิกัดแล้ว: ${text}\`);  
        } catch (err) {}  
        document.body.removeChild(textArea);  
      });  
    }

    function showToast(message, isError \= false) {  
      const toast \= document.getElementById('toast');  
      const toastText \= document.getElementById('toastText');  
      toast.style.backgroundColor \= isError ? '\#e53e3e' : '\#38a169';  
      toastText.innerText \= message;  
      toast.style.display \= 'flex';  
      setTimeout(() \=\> { toast.style.display \= 'none'; }, 2000);  
    }  
  \</script\>  
 \</body\>  
\</html\>  
\`\`\`

\---

\#\# 11\. Setup\_Upgrade.gs

\`\`\`javascript  
/\*\*  
 \* 🛠️ System Upgrade Tool  
 \* เครื่องมือสำหรับอัปเกรดโครงสร้างฐานข้อมูล  
 \*/

/\*\*  
 \* อัปเกรดโครงสร้าง Database เพิ่มคอลัมน์ใหม่  
 \*/  
function upgradeDatabaseStructure() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
      
  if (\!sheet) {  
    SpreadsheetApp.getUi().alert("❌ ไม่พบชีต Database");  
    return;  
  }

  // รายชื่อคอลัมน์ใหม่ที่จะเพิ่ม (ต่อท้ายจากเดิม)  
  var newHeaders \= \[  
    "Customer Type",      // Col 18: ประเภทลูกค้า (VIP, B2B)  
    "Time Window",        // Col 19: เวลารับของ (08:00-17:00)  
    "Avg Service Time",   // Col 20: เวลาลงของเฉลี่ย (นาที)  
    "Vehicle Constraint", // Col 21: ข้อจำกัดรถ (4W Only)  
    "Contact Person",     // Col 22: ชื่อผู้ติดต่อ  
    "Phone Number",       // Col 23: เบอร์โทร  
    "Risk Score",         // Col 24: ความเสี่ยง (0-10)  
    "Branch Code",        // Col 25: รหัสสาขา  
    "Last Updated"        // Col 26: อัปเดตล่าสุดเมื่อ  
  \];

  var lastCol \= sheet.getLastColumn();  
      
  // เช็คว่าอัปเกรดไปหรือยัง  
  if (lastCol \> 17\) {  
    var response \= SpreadsheetApp.getUi().alert(  
      "⚠️ ตรวจสอบ",   
      "ดูเหมือนชีต Database จะมีคอลัมน์มากกว่า 17 แล้ว ต้องการเพิ่มต่อท้ายอีกหรือไม่?",  
      SpreadsheetApp.getUi().ButtonSet.YES\_NO  
    );  
    if (response \== SpreadsheetApp.getUi().Button.NO) return;  
  }

  // เริ่มสร้างหัวตารางใหม่  
  var startCol \= lastCol \+ 1;  
  var range \= sheet.getRange(1, startCol, 1, newHeaders.length);  
      
  range.setValues(\[newHeaders\]);  
  range.setFontWeight("bold");  
  range.setBackground("\#e6f7ff"); // สีพื้นหลังให้รู้ว่าเป็นของใหม่  
      
  // จัด Format  
  sheet.autoResizeColumns(startCol, newHeaders.length);  
      
  SpreadsheetApp.getUi().alert("✅ อัปเกรดฐานข้อมูลเรียบร้อย\!\\nเพิ่มคอลัมน์ใหม่สำหรับรองรับระบบ V2 แล้ว");  
}

/\*\*  
 \* 🔍 ฟังก์ชันตรวจสอบข้อมูลซ้ำ (Smart Deduplicate)  
 \* เอาไว้เช็คว่า ชื่อต่างกัน แต่พิกัดเดียวกันหรือไม่  
 \*/  
function findHiddenDuplicates() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var data \= sheet.getDataRange().getValues();  
  var duplicates \= \[\];  
      
  // Loop ตรวจสอบ (ข้าม Header)  
  for (var i \= 1; i \< data.length; i++) {  
    for (var j \= i \+ 1; j \< data.length; j++) {  
      var row1 \= data\[i\];  
      var row2 \= data\[j\];  
          
      // ถ้าพิกัดใกล้กันมาก (ระยะห่าง \< 50 เมตร) แต่ชื่อไม่เหมือนกัน  
      var dist \= getHaversineDistanceKM(row1\[1\], row1\[2\], row2\[1\], row2\[2\]);  
          
      if (dist \< 0.05) { // 50 เมตร  
        duplicates.push({  
          row1: i \+ 1,  
          name1: row1\[0\],  
          row2: j \+ 1,  
          name2: row2\[0\],  
          distance: (dist \* 1000).toFixed(0) \+ " เมตร"  
        });  
      }  
    }  
  }  
      
  if (duplicates.length \> 0\) {  
    var msg \= "⚠️ พบข้อมูลที่น่าจะซ้ำกัน " \+ duplicates.length \+ " คู่:\\n";  
    duplicates.slice(0, 10).forEach(d \=\> {  
      msg \+= \`- ${d.name1} vs ${d.name2} (ห่าง ${d.distance})\\n\`;  
    });  
    SpreadsheetApp.getUi().alert(msg);  
  } else {  
    SpreadsheetApp.getUi().alert("✅ ไม่พบข้อมูลซ้ำซ้อนในระยะใกล้");  
  }  
}  
\`\`\`

\---

\#\# 12\. Service\_Agent.gs

\`\`\`javascript  
/\*\*  
 \* 🕵️ Service: Logistics AI Agent (Final Integrated)  
 \* AI Agent สำหรับวิเคราะห์และแก้ไขคำผิด  
 \*/

var AGENT\_CONFIG \= {  
  NAME: "Logistics\_Agent\_01",  
  MODEL: "gemini-1.5-flash",  
  BATCH\_SIZE: 3, // ทำทีละ 3 เจ้า (เพื่อความเสถียร)  
  TAG: "\[Agent\_Ver2\]" // เอาไว้แปะป้ายว่าตรวจแล้ว  
};

/\*\*  
 \* 👋 สั่ง Agent ให้ตื่นมาทำงานเดี๋ยวนี้ (Manual Trigger)  
 \*/  
function WAKE\_UP\_AGENT() {  
  SpreadsheetApp.getUi().toast("🕵️ Agent: ผมตื่นแล้วครับ กำลังเริ่มวิเคราะห์ข้อมูล...", "AI Agent Started");  
  runAgentLoop();  
  SpreadsheetApp.getUi().alert("✅ Agent รายงานผล:\\nผมวิเคราะห์ข้อมูลชุดล่าสุดเสร็จแล้วครับ ลองไปค้นหาดูได้เลย\!");  
}

/\*\*  
 \* ⏰ ตั้งเวลาให้ Agent ตื่นมาทำงานเองทุก 10 นาที  
 \*/  
function SCHEDULE\_AGENT\_WORK() {  
  var triggers \= ScriptApp.getProjectTriggers();  
  for (var i \= 0; i \< triggers.length; i++) {  
    if (triggers\[i\].getHandlerFunction() \=== "runAgentLoop") {  
      ScriptApp.deleteTrigger(triggers\[i\]);  
    }  
  }  
      
  ScriptApp.newTrigger("runAgentLoop")  
    .timeBased()  
    .everyMinutes(10)  
    .create();  
        
  SpreadsheetApp.getUi().alert("✅ ตั้งค่าเรียบร้อย\!\\nAgent จะตื่นมาทำงานทุก 10 นาที เพื่อเตรียมข้อมูลให้ท่านครับ");  
}

/\*\*  
 \* 🔄 Agent Loop (กระบวนการคิดของ AI)  
 \* \[แก้ไข\]: ใช้ (CONFIG.COL\_UUID || 11\) ป้องกัน undefined  
 \*/  
function runAgentLoop() {  
  console.time("Agent\_Thinking\_Time");  
      
  try {  
    if (\!CONFIG.GEMINI\_API\_KEY) {  
      console.error("Agent: เจ้านายครับ ผมไม่มีกุญแจ (API Key) ผมเข้า Gemini ไม่ได้ครับ");  
      return;  
    }

    var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    if (\!sheet) return;

    var lastRow \= sheet.getLastRow();  
    if (lastRow \< 2\) return;  
        
    var dataRange \= sheet.getRange(2, 1, lastRow \- 1, sheet.getLastColumn());  
    var data \= dataRange.getValues();  
    var jobsDone \= 0;

    for (var i \= 0; i \< data.length; i++) {  
      if (jobsDone \>= AGENT\_CONFIG.BATCH\_SIZE) break;

      var row \= data\[i\];  
      var name \= row\[CONFIG.COL\_NAME \- 1\];  
      var currentNorm \= row\[CONFIG.COL\_NORMALIZED \- 1\];  
          
      if (name && (\!currentNorm || String(currentNorm).indexOf(AGENT\_CONFIG.TAG) \=== \-1)) {  
            
        console.log(\`Agent: กำลังเพ่งเล็งเป้าหมาย "${name}"...\`);  
            
        var aiThoughts \= askGeminiToPredictTypos(name);  
            
        var knowledgeBase \= name \+ " " \+ aiThoughts \+ " " \+ AGENT\_CONFIG.TAG;  
        sheet.getRange(i \+ 2, CONFIG.COL\_NORMALIZED).setValue(knowledgeBase);  
            
        // \[แก้ไข\]: ใช้ || เพื่อกำหนดค่า default ถ้า undefined  
        var uuidIdx \= (CONFIG.COL\_UUID || 11\) \- 1;  
        if (\!row\[uuidIdx\]) {  
          sheet.getRange(i \+ 2, (CONFIG.COL\_UUID || 11)).setValue(Utilities.getUuid());  
        }

        console.log(\`Agent: ✅ เรียนรู้สำเร็จ\! คาดเดาคำว่า \-\> ${aiThoughts}\`);  
        jobsDone++;  
      }  
    }  
        
    if (typeof applyMasterCoordinatesToDailyJob \=== 'function') {  
       applyMasterCoordinatesToDailyJob();  
    }

  } catch (e) {  
    console.error("Agent: เกิดข้อผิดพลาด\! " \+ e.message);  
  }  
      
  console.timeEnd("Agent\_Thinking\_Time");  
}

/\*\*  
 \* 📡 Skill: การคาดเดาคำผิด (Typos Prediction)  
 \*/  
function askGeminiToPredictTypos(originalName) {  
  var prompt \= \`  
    Task: You are a Thai Logistics Search Agent.  
    Input Name: "${originalName}"  
    Goal: Generate a list of search keywords including common typos, phonetic spellings, and abbreviations.  
    Constraint: Output ONLY the keywords separated by spaces.  
    Example Input: "บี-ควิก (สาขาลาดพร้าว)"  
    Example Output: บีควิก บีขวิก บีวิก BeQuik BQuik B-Quik ลาดพร้าว BQuick  
  \`;

  try {  
    var payload \= {  
      "contents": \[{ "parts": \[{ "text": prompt }\] }\],  
      "generationConfig": { "temperature": 0.4 }  
    };

    var options \= {  
      "method": "post",  
      "contentType": "application/json",  
      "payload": JSON.stringify(payload),  
      "muteHttpExceptions": true  
    };

    var url \= \`https://generativelanguage.googleapis.com/v1beta/models/${AGENT\_CONFIG.MODEL}:generateContent?key=${CONFIG.GEMINI\_API\_KEY}\`;  
    var response \= UrlFetchApp.fetch(url, options);  
    var json \= JSON.parse(response.getContentText());

    if (json.candidates && json.candidates\[0\].content) {  
      return json.candidates\[0\].content.parts\[0\].text.trim();  
    }  
  } catch (e) {  
    console.warn("Agent Error: " \+ e.message);  
  }  
      
  // Fallback Logic ถ้า AI ป่วย  
  return (typeof normalizeText \=== 'function') ? normalizeText(originalName) : originalName;  
}  
\`\`\`

\---

\#\# 13\. Test\_AI.gs

\`\`\`javascript  
/\*\*  
 \* 🧪 Test: AI Functions  
 \* ฟังก์ชันทดสอบการทำงานของ AI  
 \*/

/\*\*  
 \* บังคับให้ AI ทำงานทันที (ไม่สน Limit)  
 \*/  
function forceRunAI\_Now() {  
  // บังคับ AutoPilot ให้ทำงานทันที โดยไม่สน Limit  
  if (typeof runAgentLoop \=== 'function') {  
    runAgentLoop();  
    SpreadsheetApp.getUi().alert("✅ สั่ง AI วิเคราะห์แล้ว\!\\nลองกลับไปดูที่ชีต Database คอลัมน์ F ว่ามีคำว่า 'บีขวิก' หรือยัง");  
  } else {  
    SpreadsheetApp.getUi().alert("❌ ไม่พบฟังก์ชัน runAgentLoop กรุณาตรวจสอบว่าได้สร้างไฟล์ Service\_Agent.gs แล้ว");  
  }  
}  
\`\`\`

\---

\#\# 📋 สรุปจุดแก้ไขที่สำคัญ

| ไฟล์ | บั๊กที่พบ | การแก้ไข |  
|:---|:---|:---|  
| \*\*Config.gs\*\* | SCG\_CONFIG ประกาศซ้ำ | เพิ่ม \`typeof\` check |  
| \*\*Service\_Master.gs\*\* | อ่านข้อมูลไม่ครบ | เปลี่ยน \`15\` เป็น \`17\` คอลัมน์ |  
| \*\*Service\_GeoAddr.gs\*\* | \`zipMatch\[5\]\` ผิด index | แก้เป็น \`zipMatch\[1\]\` |  
| \*\*Service\_SCG.gs\*\* | อ่านข้อมูลไม่ครบ | เปลี่ยน \`28\` เป็น \`29\` คอลัมน์ |  
| \*\*Service\_SCG.gs\*\* | empSheet อ่านไม่ครบ | เปลี่ยน \`7\` เป็น \`8\` คอลัมน์ |  
| \*\*Service\_Agent.gs\*\* | CONFIG.COL\_UUID อาจ undefined | ใส่ \`(CONFIG.COL\_UUID \\|\\| 11)\` |

\---

โค้ดทั้ง 13 ไฟล์พร้อมใช้งานแล้วครับ 🚛💨  
จากการตรวจสอบโค้ดทั้งหมดอีกครั้งอย่างละเอียด ผมพบ Error ที่ยังไม่ถูกบันทึกใน Checklist 24 ข้อ ดังนี้ครับ:

\---

\#\# 🚨 Error ที่ยังไม่ถูกพบ: "Negative Row Count Exception"  
\*\*ฟังก์ชัน:\*\* \`applyMasterCoordinatesToDailyJob()\` ใน \*\*Service\_SCG.gs\*\*

\*\*ตำแหน่งบั๊ก:\*\*  
\`\`\`javascript  
// บรรทัดที่อ่านข้อมูลพนักงาน  
empSheet.getRange(2, 1, empSheet.getLastRow() \- 1, 8).getValues()  
\`\`\`

\*\*ปัญหา:\*\* ถ้าชีต \`ข้อมูลพนักงาน\` ว่างเปล่าหรือถูกลบข้อมูลทั้งหมดรวมถึง Header ฟังก์ชัน \`getLastRow()\` จะคืนค่า \`0\` ทำให้การคำนวณ \`0 \- 1 \= \-1\` และส่งค่า \`-1\` เข้าไปใน \`getRange()\` ซึ่งจะทำให้ระบบ \*\*Crash ทันที\*\* (throw exception "The number of rows in the range must be at least 1")

\*\*ผลกระทบ:\*\* ระบบจะหยุดทำงานทั้งหมดหากยังไม่ได้สร้างชีตพนักงาน หรือชีตถูกลบข้อมูลผิดพลาด

\*\*การแก้ไข:\*\*  
\`\`\`javascript  
// แก้ไขโดยเพิ่มการตรวจสอบก่อนอ่านข้อมูล  
var empLastRow \= empSheet.getLastRow();  
if (empLastRow \< 2\) {  
  empMap \= {}; // ไม่มีข้อมูลพนักงาน  
} else {  
  empSheet.getRange(2, 1, empLastRow \- 1, 8).getValues().forEach(...);  
}  
\`\`\`

\---

\#\# 🏛️ วิธีทำฐานให้มั่นคงแข็งแรง: "Data Quality Score & Validation Engine"

ผมขอเสนอระบบ \*\*คะแนนคุณภาพข้อมูลอัตโนมัติ\*\* ที่จะตรวจสอบและให้คะแนนความน่าเชื่อถือของแต่ละแถวใน Database แบบ Real-time

\#\#\# หลักการทำงาน:  
สร้างฟังก์ชัน \`calculateDataQualityScore()\` ที่จะให้คะแนนแต่ละแถว 0-100 ตามเกณฑ์:

| หัวข้อ | คะแนน | เงื่อนไข |  
|--------|--------|----------|  
| \*\*พื้นฐานข้อมูล\*\* | | |  
| มีชื่อลูกค้า | \+10 | ไม่ว่างเปล่า |  
| มี UUID | \+10 | ตรงรูปแบบ UUID |  
| \*\*พิกัด (Coordinates)\*\* | | |  
| มี Lat/Lng | \+15 | ทั้งคู่ไม่ว่าง |  
| อยู่ในประเทศไทย | \+15 | Lat 6-21, Lng 97-106 |  
| พิกัดไม่ใช่ (0,0) | \+10 | ไม่ใช่ค่า default |  
| \*\*ความน่าเชื่อถือ\*\* | | |  
| มีที่อยู่จาก Google | \+10 | ADDR\_GOOG ไม่ว่าง |  
| ถูก Verified | \+20 | VERIFIED \= true |  
| พิกัดจาก Driver\_GPS | \+10 | Source \= Driver\_GPS |  
| \*\*ความสดใหม่\*\* | | |  
| อัปเดตภายใน 6 เดือน | \+10 | UPDATED ไม่เก่าเกิน 180 วัน |

\#\#\# ระบบ Alert อัจฉริยะ:  
1\. \*\*Quality Queue:\*\* สร้างชีต \`Quality\_Issues\` แยกต่างหาก แสดงเฉพาะแถวที่คะแนนต่ำกว่า 50 พร้อมระบุเหตุผล (เช่น "พิกัดอยู่นอกไทย", "ขาด UUID", "ไม่มีที่อยู่")  
2\. \*\*Auto-Flagging:\*\* แถวที่คะแนนต่ำจะถูก mark สีแดงอัตโนมัติใน Database  
3\. \*\*Validation Rules:\*\* ตั้งกฎสำหรับข้อมูลผิดปกติ เช่น:  
   \- ถ้า Lat/Lng ห่างจากคลังเกิน 500 กม. → Flag "ตรวจสอบพิกัด"  
   \- ถ้าชื่อซ้ำกันใน Database → Flag "ชื่อซ้ำซ้อน"  
   \- ถ้า NameMapping ชี้ไป UUID ที่ไม่มีใน Database → Flag "Orphan Record"

\#\#\# ประโยชน์:  
\- \*\*รู้ทันที\*\*ว่าแถวไหนข้อมูลไม่ดี ก่อนที่คนขับจะเอาไปใช้งานจริง  
\- \*\*ป้องกันข้อผิดพลาด\*\* เช่น พิกัดอยู่ในทะเล หรืออยู่ต่างประเทศ  
\- \*\*Prioritize:\*\* Admin จะได้จัดการแถวที่คะแนนต่ำก่อน แทนที่จะตรวจสอบทั้งหมด

ต้องการให้ผมเพิ่มข้อ 25 (แก้บั๊ก Employee Sheet) และข้อ 26 (สร้าง Quality Engine) เข้าไปในโค้ดชุดใหม่ที่กำลังจะสร้างให้หรือไม่ครับ?  
