ขอบคุณมากที่ส่งข้อมูลมา 🙏 ผมได้ศึกษาโค้ดของคุณแล้ว นี่คือการวิเคราะห์โดยละเอียดและแนวทางการแก้ไขปัญหาทั้ง 8 ข้อ พร้อมคำแนะนำครอบคลุม:

\---

\# 📊 การวิเคราะห์ระบบ Logistics Master Data System V4.1

\#\# 🔍 สรุปสถานการณ์ปัจจุบัน

โปรเจคของคุณเป็น \*\*Google Sheets-based Logistics Database\*\* ที่ดึงข้อมูล GPS จากคนขับและ SCG API โดยมีโครงสร้าง:  
\- \*\*Database Sheet\*\*: Golden Record ของลูกค้า (22 คอลัมน์)  
\- \*\*NameMapping Sheet\*\*: แม่พิมพ์ชื่อเพื่อสรุปชื่อเหมือนกัน  
\- \*\*GPS\_Queue\*\*: รอ Admin ตรวจสอบและอนุมัติพิกัดที่ขัดแย้ง  
\- \*\*SCG Source Sheet\*\*: ข้อมูลจริงจากระบบ SCG

\---

\#\# ⚠️ ปัญหา 8 ประการที่ระบุ

\#\#\# 🔴 \*\*ปัญหาที่ 1: ชื่อบุคคลซ้ำกัน\*\*  
\*\*สาเหตุ:\*\*  
\- ข้อมูลพิมพ์ด้วยตัวพิมพ์ต่างกัน เช่น "สมชาย" vs "Somchai" vs "สม ชาย"  
\- ไม่มีการ normalize ข้อมูลตั้งแต่เก็บ

\*\*แนวทางแก้ไข:\*\*  
\`\`\`javascript  
// \[Phase A\] ปรับปรุง normalizeText()  
function normalizeText(text) {  
  if (\!text) return "";  
  // 1\. เปลี่ยนเป็น lowercase  
  // 2\. ลบ whitespace ซ้ำ  
  // 3\. ลบเครื่องหมายพิเศษ  
  // 4\. แทน Thai vowels ตามหลัก TDPF standard  
  return text.toString()  
    .trim()  
    .toLowerCase()  
    .replace(/\\s+/g, ' ')  
    .replace(/\[^\\u0E00-\\u0E7Fa-z0-9\\s\]/g, ''); // เก็บแค่ Thai/Latin/numbers  
}

// \[Phase A\] สร้าง Deduplication Index  
function buildDuplicateIndex() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
    
  var duplicates \= {};  
  var normalized \= {};  
    
  data.forEach(function(row, idx) {  
    var rawName \= row\[CONFIG.C\_IDX.NAME\];  
    var normName \= normalizeText(rawName);  
      
    if (\!normalized\[normName\]) {  
      normalized\[normName\] \= \[\];  
    }  
    normalized\[normName\].push({  
      row: idx \+ 2,  
      name: rawName,  
      uuid: row\[CONFIG.C\_IDX.UUID\]  
    });  
  });  
    
  // ตรวจหากลุ่มซ้ำ  
  Object.keys(normalized).forEach(function(norm) {  
    if (normalized\[norm\].length \> 1\) {  
      duplicates\[norm\] \= normalized\[norm\];  
    }  
  });  
    
  return duplicates;  
}  
\`\`\`

\---

\#\#\# 🔴 \*\*ปัญหาที่ 2: ชื่อสถานที่อยู่ซ้ำกัน\*\*  
\*\*สาเหตุ:\*\*  
\- ที่อยู่เขียนแบบไม่สม่ำเสมอ "อ.สายไหม เขต" vs "อ.สายไหม"  
\- ไม่มี canonical address format

\*\*แนวทางแก้ไข:\*\*  
\`\`\`javascript  
// \[Phase A\] สร้าง Postal Reference Index  
function normalizeAddress(address) {  
  if (\!address) return "";  
    
  var postalSheet \= SpreadsheetApp.getActiveSpreadsheet()  
    .getSheetByName(CONFIG.SHEET\_POSTAL);  
    
  // ลบ whitespace ซ้ำ  
  var cleaned \= address.toString().trim().replace(/\\s+/g, ' ');  
    
  // Parse Thai address components  
  var components \= parseThaiAddress(cleaned);  
    
  // Validate against Postal Reference  
  var postalData \= postalSheet.getRange(2, 1, postalSheet.getLastRow() \- 1, 3).getValues();  
  var validPostal \= false;  
    
  postalData.forEach(function(row) {  
    if (row\[1\] \=== components.district && row\[2\] \=== components.province) {  
      validPostal \= true;  
    }  
  });  
    
  return {  
    raw: cleaned,  
    normalized: components,  
    isValid: validPostal,  
    hash: Utilities.computeDigest(Utilities.DigestAlgorithm.SHA\_1, cleaned)  
  };  
}

// \[Phase B\] สร้าง Address Dedup Report  
function generateAddressDuplicateReport() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data \= sheet.getRange(2, 1, lastRow \- 1,   
    Math.max(CONFIG.COL\_SYS\_ADDR, CONFIG.COL\_GOOGLE\_ADDR)).getValues();  
    
  var addressIndex \= {};  
  var duplicates \= \[\];  
    
  data.forEach(function(row, idx) {  
    var sysAddr \= row\[CONFIG.C\_IDX.SYS\_ADDR\] || "";  
    var normAddr \= normalizeAddress(sysAddr);  
    var key \= Utilities.computeDigest(  
      Utilities.DigestAlgorithm.SHA\_256,   
      normAddr.raw  
    );  
      
    if (\!addressIndex\[key\]) {  
      addressIndex\[key\] \= \[\];  
    }  
    addressIndex\[key\].push({  
      row: idx \+ 2,  
      address: sysAddr,  
      name: row\[CONFIG.C\_IDX.NAME\],  
      uuid: row\[CONFIG.C\_IDX.UUID\]  
    });  
  });  
    
  Object.keys(addressIndex).forEach(function(key) {  
    if (addressIndex\[key\].length \> 1\) {  
      duplicates.push(addressIndex\[key\]);  
    }  
  });  
    
  return duplicates;  
}  
\`\`\`

\---

\#\#\# 🔴 \*\*ปัญหาที่ 3: LatLong ซ้ำกัน\*\*  
\*\*สาเหตุ:\*\*  
\- หลายบริษัทส่งของไปที่จุดเดียวกัน (warehouse ร่วม)  
\- ควร link เป็น hub แทนการลบ

\*\*แนวทางแก้ไข:\*\*  
\`\`\`javascript  
// \[Phase B\] สร้าง GPS Clustering Index  
function identifyCoLocatedHubs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var validRecords \= \[\];  
    
  // Filter only records with valid coordinates  
  data.forEach(function(row, idx) {  
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
    if (\!isNaN(lat) && \!isNaN(lng)) {  
      validRecords.push({  
        idx: idx,  
        lat: lat,  
        lng: lng,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        addr: row\[CONFIG.C\_IDX.SYS\_ADDR\],  
        coordSource: row\[CONFIG.C\_IDX.COORD\_SOURCE\]  
      });  
    }  
  });  
    
  // Find exact GPS matches (within 5 meters)  
  var gpsIndex \= {};  
  var duplicates \= \[\];  
    
  for (var i \= 0; i \< validRecords.length; i++) {  
    var r1 \= validRecords\[i\];  
    var found \= false;  
      
    for (var j \= i \+ 1; j \< validRecords.length; j++) {  
      var r2 \= validRecords\[j\];  
      var dist \= getHaversineDistanceKM(r1.lat, r1.lng, r2.lat, r2.lng) \* 1000;  
        
      // Same GPS point (\< 5m \= probably human error/warehouse)  
      if (dist \< 5\) {  
        if (\!found) {  
          duplicates.push({  
            lat: r1.lat,  
            lng: r1.lng,  
            distance: 0,  
            records: \[r1\]  
          });  
          found \= true;  
        }  
        duplicates\[duplicates.length \- 1\].records.push(r2);  
      }  
    }  
  }  
    
  return duplicates;  
}

// \[Phase C\] ทำ HUB Linking แทนการลบ  
function linkCoLocatedAsHub() {  
  var hubDuplicates \= identifyCoLocatedHubs();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  hubDuplicates.forEach(function(hub) {  
    if (hub.records.length \> 1\) {  
      // เลือก Primary record (verified หรือ quality สูงสุด)  
      var primaryIdx \= 0;  
      var maxQuality \= \-1;  
        
      hub.records.forEach(function(rec, i) {  
        var row \= sheet.getRange(rec.idx \+ 2, 1, 1, CONFIG.DB\_TOTAL\_COLS).getValues()\[0\];  
        var quality \= parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0;  
        if (quality \> maxQuality) {  
          maxQuality \= quality;  
          primaryIdx \= i;  
        }  
      });  
        
      var primaryRec \= hub.records\[primaryIdx\];  
      var primaryUUID \= primaryRec.uuid;  
        
      // Link ลูกค้าอื่นเข้า primary เป็น HUB  
      hub.records.forEach(function(rec, i) {  
        if (i \=== primaryIdx) return; // ข้าม primary  
          
        var rowNum \= rec.idx \+ 2;  
        var tagName \= rec.name \+ " \[ศูนย์กลาง: " \+ primaryRec.name \+ "\]";  
          
        // Mark as merged  
        sheet.getRange(rowNum, CONFIG.COL\_RECORD\_STATUS)  
          .setValue("MERGED\_TO\_HUB");  
        sheet.getRange(rowNum, CONFIG.COL\_MERGED\_TO\_UUID)  
          .setValue(primaryUUID);  
          
        // Keep NameMapping หลังจาก finalize  
      });  
    }  
  });  
}  
\`\`\`

\---

\#\#\# 🔴 \*\*ปัญหาที่ 4: บุคคลเดียวกันแต่ชื่อเขียนไม่เหมือนกัน\*\* (Multi-vendor name variance)  
\*\*สาเหตุ:\*\*  
\- "SCG" สั่งจากบริษัท A เป็น "สุรชัย"  
\- ผู้ส่งฝั่ง B เรียกเขา "ส. สมชายกิจ"  
\- ทำ mapping ผ่าน NameMapping Sheet

\*\*แนวทางแก้ไข (ใช้ AI \+ Manual):\*\*  
\`\`\`javascript  
// \[Phase C\] AI-Assisted Duplicate Detection  
function detectNameVariants\_AI() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
    
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
    
  // เก็บ main names ที่ verified  
  var mainNames \= \[\];  
  data.forEach(function(row) {  
    if (row\[CONFIG.C\_IDX.VERIFIED\] \=== true) {  
      mainNames.push({  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\]  
      });  
    }  
  });  
    
  // ใช้ Gemini AI หา variant  
  var unverifiedNames \= \[\];  
  data.forEach(function(row) {  
    if (row\[CONFIG.C\_IDX.VERIFIED\] \!== true && row\[CONFIG.C\_IDX.NAME\]) {  
      unverifiedNames.push(row\[CONFIG.C\_IDX.NAME\]);  
    }  
  });  
    
  // Batch query ไป Gemini API  
  var batches \= chunkArray(unverifiedNames, 20);  
  batches.forEach(function(batch) {  
    var prompt \= \`  
    Main customer names (verified): ${JSON.stringify(mainNames.map(m \=\> m.name))}  
      
    Unknown names to match: ${JSON.stringify(batch)}  
      
    For each unknown name, output JSON:  
    {  
      "name": "...",  
      "match": "main\_name" or null,  
      "confidence": 0-100,  
      "reason": "..."  
    }  
    Return only JSON array, no markdown.  
    \`;  
      
    var response \= callGeminiAPI(prompt, "json");  
    var matches \= JSON.parse(response);  
      
    // Save to NameMapping  
    matches.forEach(function(m) {  
      if (m.match && m.confidence \>= 70\) {  
        var targetUUID \= mainNames.find(x \=\> x.name \=== m.match).uuid;  
          
        mapSheet.appendRow(\[  
          m.name,                    // Variant\_Name  
          targetUUID,                // Master\_UID  
          m.confidence,              // Confidence\_Score  
          "AI\_Match",               // Mapped\_By  
          new Date()                // Timestamp  
        \]);  
      }  
    });  
  });  
}

// \[Phase D\] Manual Review Queue สำหรับ AI ที่ไม่แน่ใจ  
function createAIReviewQueue() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
    
  // ตรวจหา mappings ที่ confidence \< 80  
  var mapData \= mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 5).getValues();  
  var needsReview \= \[\];  
    
  mapData.forEach(function(row, idx) {  
    var conf \= parseFloat(row\[2\]);  
    if (conf \< 80 && row\[3\] \=== "AI\_Match") {  
      needsReview.push({  
        row: idx \+ 2,  
        variant: row\[0\],  
        masterUUID: row\[1\],  
        confidence: conf  
      });  
    }  
  });  
    
  // Create review queue sheet  
  var reviewSheet \= ss.getSheetByName("AI\_Review\_Queue");  
  if (\!reviewSheet) {  
    reviewSheet \= ss.insertSheet("AI\_Review\_Queue");  
    reviewSheet.appendRow(\["Variant", "Master\_UID", "AI\_Confidence", "Human\_Decision", "Status"\]);  
  }  
    
  needsReview.forEach(function(item) {  
    reviewSheet.appendRow(\[  
      item.variant,  
      item.masterUUID,  
      item.confidence,  
      "", // เว้นไว้ให้ human fill  
      "PENDING"  
    \]);  
  });  
    
  return needsReview.length;  
}  
\`\`\`

\---

\#\#\# 🔴 \*\*ปัญหาที่ 5: บุคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน\*\*  
\*\*สาเหตุ:\*\*  
\- ที่เดียวกัน แต่คนเก็บของคนละคน (warehouse sharing)  
\- หรือหลายสาขาของบริษัทเดียว

\*\*แนวทางแก้ไข:\*\*  
\`\`\`javascript  
// \[Phase B\] Address-based Linking  
function identifyDifferentPeopleAtSameAddress() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var addressIndex \= {};  
  var potentialIssues \= \[\];  
    
  // Group by normalized address  
  data.forEach(function(row, idx) {  
    var addr \= normalizeAddress(row\[CONFIG.C\_IDX.SYS\_ADDR\]);  
    var key \= addr.hash;  
      
    if (\!addressIndex\[key\]) {  
      addressIndex\[key\] \= \[\];  
    }  
      
    addressIndex\[key\].push({  
      row: idx \+ 2,  
      name: row\[CONFIG.C\_IDX.NAME\],  
      uuid: row\[CONFIG.C\_IDX.UUID\],  
      verified: row\[CONFIG.C\_IDX.VERIFIED\],  
      quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\])  
    });  
  });  
    
  // ตรวจหากรณี Multiple Names @ Same Address  
  Object.keys(addressIndex).forEach(function(key) {  
    var group \= addressIndex\[key\];  
    if (group.length \> 1\) {  
      var uniqueNames \= {};  
      group.forEach(function(rec) {  
        var normName \= normalizeText(rec.name);  
        if (\!uniqueNames\[normName\]) {  
          uniqueNames\[normName\] \= \[\];  
        }  
        uniqueNames\[normName\].push(rec);  
      });  
        
      // If multiple names at same address  
      if (Object.keys(uniqueNames).length \> 1\) {  
        potentialIssues.push({  
          address: key,  
          names: Object.keys(uniqueNames),  
          records: group,  
          type: "MULTIPLE\_NAMES\_SAME\_ADDRESS"  
        });  
      }  
    }  
  });  
    
  return potentialIssues;  
}

// \[Phase C\] Manual Tagging สำหรับ warehouse sharing  
function tagWarehouseSharings() {  
  var issues \= identifyDifferentPeopleAtSameAddress();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  issues.forEach(function(issue) {  
    var sharedTag \= " \[ร่วม Warehouse\]";  
      
    issue.records.forEach(function(rec) {  
      var rowNum \= rec.row;  
      var currentAddr \= sheet.getRange(rowNum, CONFIG.COL\_SYS\_ADDR).getValue();  
        
      if (currentAddr.indexOf("\[ร่วม Warehouse") \=== \-1) {  
        sheet.getRange(rowNum, CONFIG.COL\_SYS\_ADDR)  
          .setValue(currentAddr \+ sharedTag);  
      }  
    });  
  });  
}  
\`\`\`

\---

\#\#\# 🔴 \*\*ปัญหาที่ 6: บุคคลชื่อเดียวกัน แต่ชื่อสถานที่อยู่ไม่เหมือนกัน\*\*  
\*\*สาเหตุ:\*\*  
\- ลูกค้า "สมชาย" มีหลายสาขา (Khlong Toei, Yannawa, etc.)  
\- ควร keep แยกตามที่อยู่ แต่ link เป็น siblings

\*\*แนวทางแก้ไข:\*\*  
\`\`\`javascript  
// \[Phase C\] Branch Detection & Linking  
function detectAndLinkBranches() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var nameIndex \= {};  
  var branchGroups \= \[\];  
    
  // Group by normalized name  
  data.forEach(function(row, idx) {  
    var normName \= normalizeText(row\[CONFIG.C\_IDX.NAME\]);  
      
    if (\!nameIndex\[normName\]) {  
      nameIndex\[normName\] \= \[\];  
    }  
      
    nameIndex\[normName\].push({  
      row: idx \+ 2,  
      name: row\[CONFIG.C\_IDX.NAME\],  
      uuid: row\[CONFIG.C\_IDX.UUID\],  
      lat: parseFloat(row\[CONFIG.C\_IDX.LAT\]),  
      lng: parseFloat(row\[CONFIG.C\_IDX.LNG\]),  
      addr: row\[CONFIG.C\_IDX.SYS\_ADDR\],  
      verified: row\[CONFIG.C\_IDX.VERIFIED\]  
    });  
  });  
    
  // Find groups with same name but different locations  
  Object.keys(nameIndex).forEach(function(norm) {  
    var group \= nameIndex\[norm\];  
      
    if (group.length \> 1\) {  
      // Check if they are distinct locations (\>500m apart)  
      var branches \= \[\];  
      var processed \= new Set();  
        
      for (var i \= 0; i \< group.length; i++) {  
        if (processed.has(group\[i\].uuid)) continue;  
          
        var mainBranch \= group\[i\];  
        var cluster \= \[mainBranch\];  
          
        for (var j \= i \+ 1; j \< group.length; j++) {  
          if (\!processed.has(group\[j\].uuid)) {  
            var dist \= getHaversineDistanceKM(  
              mainBranch.lat, mainBranch.lng,  
              group\[j\].lat, group\[j\].lng  
            ) \* 1000;  
              
            // If \> 500m apart → separate branch  
            if (dist \> 500\) {  
              branches.push({  
                main: mainBranch,  
                siblings: cluster.concat(\[group\[j\]\])  
              });  
                
              cluster.forEach(r \=\> processed.add(r.uuid));  
            } else {  
              cluster.push(group\[j\]);  
            }  
          }  
        }  
      }  
        
      branchGroups \= branchGroups.concat(branches);  
    }  
  });  
    
  // Link branches via new column BRANCH\_PARENT\_UUID  
  branchGroups.forEach(function(branch) {  
    var mainUUID \= branch.main.uuid;  
      
    branch.siblings.forEach(function(sib) {  
      if (sib.uuid \!== mainUUID) {  
        var rowNum \= sib.row;  
        // Add column for branch parent  
        sheet.getRange(rowNum, 23).setValue(mainUUID); // Assuming col 23 available  
      }  
    });  
  });  
    
  return branchGroups;  
}  
\`\`\`

\---

\#\#\# 🔴 \*\*ปัญหาที่ 7: บุคคลชื่อเดียวกัน แต่เลข Lat Long ต่างกัน\*\* (กรณีเดียวกับ \#6)  
\*\*สาเหตุ:\*\* เหมือนปัญหา 6 \- หลายสาขา  
\*\*แนวทางแก้ไข:\*\* ใช้ \`detectAndLinkBranches()\` ข้างต้น

\---

\#\#\# 🔴 \*\*ปัญหาที่ 8: บุคคลคนละชื่อ แต่เลข Lat Long ที่เดียวกัน\*\*  
\*\*สาเหตุ:\*\*  
\- ที่อยู่เดียวกัน แต่ชื่อบริษัทต่างกัน  
\- อาจเป็น epartment เดียวกัน หรือ DBA/subsidiary

\*\*แนวทางแก้ไข:\*\*  
\`\`\`javascript  
// \[Phase B\] GPS-based Duplicate Detection  
function identifyDifferentNamesAtExactGPS() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var gpsIndex \= {};  
  var duplicates \= \[\];  
    
  // Create GPS coordinate hash  
  data.forEach(function(row, idx) {  
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
      
    if (\!isNaN(lat) && \!isNaN(lng)) {  
      // Round to 6 decimals for exact match (≈ 10cm precision)  
      var key \= lat.toFixed(6) \+ "," \+ lng.toFixed(6);  
        
      if (\!gpsIndex\[key\]) {  
        gpsIndex\[key\] \= \[\];  
      }  
        
      gpsIndex\[key\].push({  
        row: idx \+ 2,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        addr: row\[CONFIG.C\_IDX.SYS\_ADDR\],  
        verified: row\[CONFIG.C\_IDX.VERIFIED\],  
        coordSource: row\[CONFIG.C\_IDX.COORD\_SOURCE\]  
      });  
    }  
  });  
    
  // Find GPS points with multiple different names  
  Object.keys(gpsIndex).forEach(function(key) {  
    var group \= gpsIndex\[key\];  
      
    if (group.length \> 1\) {  
      var uniqueNames \= new Set();  
      group.forEach(r \=\> uniqueNames.add(normalizeText(r.name)));  
        
      // Multiple different names at same exact GPS  
      if (uniqueNames.size \> 1\) {  
        duplicates.push({  
          gps: key,  
          records: group,  
          type: "SAME\_GPS\_DIFFERENT\_NAMES"  
        });  
      }  
    }  
  });  
    
  return duplicates;  
}

// \[Phase C\] Merge recommendation engine  
function generateMergeRecommendations() {  
  var exactGPS \= identifyDifferentNamesAtExactGPS();  
  var mapSheet \= SpreadsheetApp.getActiveSpreadsheet()  
    .getSheetByName(CONFIG.MAPPING\_SHEET);  
    
  var recommendations \= \[\];  
    
  exactGPS.forEach(function(dup) {  
    // Select primary (verified or highest quality)  
    var primary \= dup.records\[0\];  
    var maxQuality \= 0;  
      
    dup.records.forEach(function(rec) {  
      var rowNum \= rec.row;  
      var row \= SpreadsheetApp.getActiveSpreadsheet()  
        .getSheetByName(CONFIG.SHEET\_NAME)  
        .getRange(rowNum, 1, 1, CONFIG.DB\_TOTAL\_COLS)  
        .getValues()\[0\];  
        
      var q \= parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0;  
      if (q \> maxQuality) {  
        maxQuality \= q;  
        primary \= rec;  
      }  
    });  
      
    // Create merge recommendation  
    dup.records.forEach(function(rec) {  
      if (rec.uuid \!== primary.uuid) {  
        recommendations.push({  
          from\_name: rec.name,  
          to\_uuid: primary.uuid,  
          reason: "Exact GPS match at " \+ dup.gps,  
          confidence: 95  
        });  
      }  
    });  
  });  
    
  // เขียนลง sheet  
  if (\!mapSheet.getRange(1, 1).getValue().includes("Recommendation")) {  
    mapSheet.insertRows(1);  
    mapSheet.getRange(1, 1, 1, 4).setValues(\[  
      \["Recommendation\_From", "Recommendation\_To", "Reason", "Confidence"\]  
    \]);  
  }  
    
  return recommendations;  
}  
\`\`\`

\---

\#\# 🎯 แนวทางการสร้างฐานข้อมูลรวมและทำความสะอาดข้อมูล

\#\#\# \*\*Phase A: Data Cleansing\*\* (สัปดาห์ 1-2)  
\`\`\`  
1\. Normalize ทั้ง Names & Addresses  
2\. Generate Duplicate Index (ปัญหา 1-8)  
3\. Build Deduplication Report  
\`\`\`

\#\#\# \*\*Phase B: Deduplication\*\* (สัปดาห์ 3-4)  
\`\`\`  
1\. Identify & Tag Co-located Hubs (ปัญหา 3\)  
2\. Find Multi-branch Customers (ปัญหา 6-7)  
3\. Detect Exact GPS Duplicates (ปัญหา 8\)  
4\. Create Merge Queue  
\`\`\`

\#\#\# \*\*Phase C: Manual Review \+ AI Verification\*\* (สัปดาห์ 5-6)  
\`\`\`  
1\. AI-assisted name matching (ปัญหา 4\)  
2\. Manual review queue for borderline cases  
3\. Create NameMapping records  
4\. Validate postal data  
\`\`\`

\#\#\# \*\*Phase D: Finalization\*\* (สัปดาห์ 7-8)  
\`\`\`  
1\. Merge records (Soft Delete)  
2\. Update all References  
3\. Create Golden Record  
4\. Archive & Backup  
\`\`\`

\---

\#\# 💡 \*\*ถ้าโปรเจคนี้เป็นของฉัน ฉันจะทำแบบนี้:\*\*

\#\#\# \*\*ขั้นที่ 1: สร้าง Data Quality Dashboard\*\*  
\`\`\`javascript  
// Dashboard Sheet แสดง Real-time Issues  
function createDataQualityDashboard() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var dashSheet \= ss.insertSheet("DQ\_Dashboard");  
    
  // Header  
  dashSheet.appendRow(\["📊 Data Quality Report", "", "Last Updated: " \+ new Date()\]);  
  dashSheet.appendRow(\["", ""\]);  
    
  // Metrics  
  var metrics \= {  
    "Total Records": getTotalRecordCount(),  
    "Verified Records": getVerifiedCount(),  
    "Quality Score (Avg)": getAverageQualityScore(),  
    "With GPS": getRecordsWithGPS(),  
    "With Address": getRecordsWithAddress(),  
    "Duplicates Found": buildDuplicateIndex().length,  
    "Low Quality (\<50%)": getLowQualityCount(),  
    "Missing Data": getMissingDataCount()  
  };  
    
  Object.keys(metrics).forEach(function(key) {  
    dashSheet.appendRow(\[key, metrics\[key\]\]);  
  });  
    
  // Issues breakdown  
  dashSheet.appendRow(\["", ""\]);  
  dashSheet.appendRow(\["⚠️ Issues by Type"\]);  
    
  var issues \= \[  
    \["Duplicate Names", buildDuplicateIndex().length\],  
    \["Duplicate Addresses", generateAddressDuplicateReport().length\],  
    \["Duplicate GPS", identifyCoLocatedHubs().length\],  
    \["Multi-branch Customers", detectAndLinkBranches().length\],  
    \["Warehouse Sharing", identifyDifferentPeopleAtSameAddress().length\],  
    \["Same GPS Different Names", identifyDifferentNamesAtExactGPS().length\]  
  \];  
    
  issues.forEach(item \=\> dashSheet.appendRow(item));  
}  
\`\`\`

\#\#\# \*\*ขั้นที่ 2: Automated Nightly Cleaning\*\*  
\`\`\`javascript  
function setupNightlyCleaningTrigger() {  
  // ลบ trigger เก่า  
  var triggers \= ScriptApp.getProjectTriggers();  
  triggers.forEach(t \=\> ScriptApp.deleteTrigger(t));  
    
  // สร้าง trigger รัน 23:00 น. ทุกวัน  
  ScriptApp.newTrigger("runNightlyMaintenance")  
    .timeBased()  
    .atHour(23)  
    .everyDays(1)  
    .create();  
}

function runNightlyMaintenance() {  
  try {  
    console.log("🌙 \[23:00\] Nightly Maintenance Started");  
      
    // 1\. Deep Clean Batch 100 rows  
    runDeepCleanBatch\_100();  
      
    // 2\. Recalculate Quality/Confidence  
    recalculateAllQuality();  
    recalculateAllConfidence();  
      
    // 3\. Scan for new duplicates  
    var newDuplicates \= buildDuplicateIndex();  
      
    // 4\. Tag Co-located hubs  
    scanAndTagCoLocatedHubs();  
      
    // 5\. Send Summary Report  
    sendMaintenanceReport({  
      duplicatesFound: Object.keys(newDuplicates).length,  
      deepCleanRows: 100,  
      timestamp: new Date()  
    });  
      
    console.log("✅ \[23:00\] Nightly Maintenance Completed");  
  } catch(e) {  
    console.error("❌ Nightly Maintenance Error: " \+ e.message);  
    sendErrorAlert(e);  
  }  
}  
\`\`\`

\#\#\# \*\*ขั้นที่ 3: Weekly Deduplication Review\*\*  
\`\`\`javascript  
// Every Monday 08:00 \- ส่ง report duplicates ไปให้ Admin review  
function setupWeeklyDedup() {  
  ScriptApp.newTrigger("sendWeeklyDedupReport")  
    .timeBased()  
    .onWeeksDay(ScriptApp.WeeksDay.MONDAY)  
    .atHour(8)  
    .create();  
}

function sendWeeklyDedupReport() {  
  var report \= generateComprehensiveDedupReport();  
    
  var htmlBody \= \`  
    \<h2\>📋 Weekly Deduplication Review\</h2\>  
    \<p\>Generation: ${new Date()}\</p\>  
      
    \<h3\>Critical Issues (Need Manual Review)\</h3\>  
    \<ul\>  
      \<li\>Duplicate Names: ${report.duplicateNames.length}\</li\>  
      \<li\>Same GPS Different Names: ${report.sameGPSDiffNames.length}\</li\>  
      \<li\>Multi-branch Untagged: ${report.multiBranch.length}\</li\>  
    \</ul\>  
      
    \<h3\>Recommended Actions\</h3\>  
    ${generateRecommendations(report)}  
      
    \<p\>\<a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}"\>  
      Open Spreadsheet  
    \</a\>\</p\>  
  \`;  
    
  GmailApp.sendEmail("admin@scgjwd.com",   
    "📊 Weekly Deduplication Report",  
    "",  
    { htmlBody: htmlBody }  
  );  
}  
\`\`\`

\#\#\# \*\*ขั้นที่ 4: Integration with SCG API\*\*  
\`\`\`javascript  
// ปรับ Service\_Master.gs ให้สมาร์ท  
function enhancedSyncNewDataToMaster() {  
  var syncData \= {  
    startTime: new Date(),  
    newRecords: 0,  
    mergedRecords: 0,  
    gpsQueueItems: 0,  
    errors: \[\]  
  };  
    
  try {  
    // 1\. ดึง data จาก SCG API  
    var scgData \= fetchSCGData();  
      
    // 2\. ทำ Advanced Matching  
    scgData.forEach(function(record) {  
      // Exact name match  
      var exactMatch \= findExactMatch(record.name);  
        
      // Fuzzy name match (70%+)  
      var fuzzyMatch \= findFuzzyMatch(record.name);  
        
      // GPS-based match  
      var gpsMatch \= findGPSNearby(record.lat, record.lng);  
        
      // ตัดสิน  
      if (exactMatch) {  
        // Update existing  
        syncData.mergedRecords++;  
      } else if (fuzzyMatch && fuzzyMatch.confidence \>= 80\) {  
        // Add to mapping  
        createNameMapping(record.name, fuzzyMatch.uuid);  
      } else if (gpsMatch) {  
        // Send to GPS\_Queue for review  
        addToGPSQueue(record);  
        syncData.gpsQueueItems++;  
      } else {  
        // Brand new record  
        createNewRecord(record);  
        syncData.newRecords++;  
      }  
    });  
      
    // 3\. Generate summary  
    sendSyncSummary(syncData);  
      
  } catch(e) {  
    syncData.errors.push(e.message);  
    console.error("Sync Error:", e);  
  }  
}  
\`\`\`

\---

\#\# 📋 \*\*สรุปการใช้งานทั้งหมด\*\*

สร้างเพิ่มเติมในโปรเจคนี้ 5 ไฟล์ .gs:

\`\`\`  
1\. Service\_Dedup.gs        ← หลัก deduplication logic  
2\. Service\_Validation.gs   ← Data quality checks  
3\. Dashboard\_Report.gs     ← Real-time metrics dashboard  
4\. Scheduler\_Maintenance.gs ← Automated cleaning  
5\. Utils\_Matching.gs       ← Helper functions สำหรับ fuzzy matching  
\`\`\`

\---

ต้องการให้ฉันช่วย:  
1\. ✍️ \*\*เขียนรหัสโดยละเอียด\*\* สำหรับไฟล์เหล่านี้ไหม?  
2\. 🧪 \*\*สร้าง test cases\*\* เพื่อ validate ระบบ?  
3\. 📊 \*\*ออกแบบ Dashboard\*\* ที่เข้าใจง่าย?  
4\. 🔄 \*\*Setup automation triggers\*\* ทั้งหมด?

โอเค จะเขียนรหัสทั้งหมดให้นะ ผมจะสร้างไฟล์ 5 ตัว \+ Dashboard \+ Test Cases \+ Automation Triggers

\---

\# 🎯 ส่วนที่ 1: Service\_Dedup.gs

\`\`\`javascript  
/\*\*  
 \* SERVICE: DEDUPLICATION ENGINE  
 \* VERSION: 4.2 \- Phase A  
 \*   
 \* ✍️ ไฟล์หลักสำหรับแก้ปัญหา Duplicate ทั้ง 8 ประการ  
 \*   
 \* ปัญหา 1-8:  
 \* 1\. ชื่อบุคคลซ้ำกัน  
 \* 2\. ชื่อสถานที่อยู่ซ้ำกัน  
 \* 3\. LatLong ซ้ำกัน  
 \* 4\. บุคคลเดียวกันแต่ชื่อเขียนต่างกัน (vendor variants)  
 \* 5\. บุคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน (warehouse sharing)  
 \* 6\. บุคคลชื่อเดียวกัน แต่ชื่อสถานที่อยู่ไม่เหมือนกัน (branches)  
 \* 7\. บุคคลชื่อเดียวกัน แต่LatLong ต่างกัน (branches again)  
 \* 8\. บุคคลคนละชื่อ แต่LatLong เดียวกัน (subsidiary/DBA)  
 \*/

// \============================================================  
// 🔍 ISSUE \#1: ชื่อบุคคลซ้ำกัน  
// \============================================================

/\*\*  
 \* \[ISSUE \#1\] สร้าง Duplicate Names Index  
 \* @return {Object} { normalizedName: \[{ row, rawName, uuid, verified, quality }, ...\] }  
 \*/  
function buildDuplicateNameIndex\_() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return {};  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var normalized \= {};  
    
  data.forEach(function(row, idx) {  
    var rawName \= row\[CONFIG.C\_IDX.NAME\];  
    if (\!rawName) return;  
      
    var normName \= normalizeText(rawName);  
      
    if (\!normalized\[normName\]) {  
      normalized\[normName\] \= \[\];  
    }  
      
    normalized\[normName\].push({  
      row: idx \+ 2,  
      rawName: rawName,  
      uuid: row\[CONFIG.C\_IDX.UUID\],  
      verified: row\[CONFIG.C\_IDX.VERIFIED\],  
      quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0,  
      coordSource: row\[CONFIG.C\_IDX.COORD\_SOURCE\],  
      createdDate: row\[CONFIG.C\_IDX.CREATED\]  
    });  
  });  
    
  var duplicates \= {};  
  Object.keys(normalized).forEach(function(key) {  
    if (normalized\[key\].length \> 1\) {  
      duplicates\[key\] \= normalized\[key\];  
    }  
  });  
    
  return duplicates;  
}

/\*\*  
 \* \[ISSUE \#1\] เลือก Primary record ตามกฎ Priority  
 \* Priority: Verified \> High Quality \> Oldest Created Date  
 \*/  
function selectPrimaryRecord\_(records) {  
  if (records.length \=== 0\) return null;  
  if (records.length \=== 1\) return records\[0\];  
    
  var sorted \= records.sort(function(a, b) {  
    // Verified ได้ priority 1  
    if (a.verified \=== true && b.verified \!== true) return \-1;  
    if (a.verified \!== true && b.verified \=== true) return 1;  
      
    // Quality score  
    if (a.quality \!== b.quality) return b.quality \- a.quality;  
      
    // Oldest created date  
    var dateA \= new Date(a.createdDate);  
    var dateB \= new Date(b.createdDate);  
    return dateA \- dateB;  
  });  
    
  return sorted\[0\];  
}

/\*\*  
 \* \[ISSUE \#1\] Generate Duplicate Names Report  
 \*/  
function generateDuplicateNamesReport() {  
  var duplicates \= buildDuplicateNameIndex\_();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  var report \= {  
    totalDuplicateGroups: Object.keys(duplicates).length,  
    totalAffectedRecords: 0,  
    details: \[\],  
    timestamp: new Date()  
  };  
    
  Object.keys(duplicates).forEach(function(normName) {  
    var group \= duplicates\[normName\];  
    report.totalAffectedRecords \+= group.length;  
      
    var primary \= selectPrimaryRecord\_(group);  
    var secondaries \= group.filter(r \=\> r.uuid \!== primary.uuid);  
      
    report.details.push({  
      normalizedName: normName,  
      primaryRecord: primary,  
      duplicates: secondaries,  
      action: "KEEP\_" \+ primary.uuid \+ "\_MERGE\_" \+ secondaries.map(s \=\> s.uuid).join(",")  
    });  
  });  
    
  return report;  
}

/\*\*  
 \* \[ISSUE \#1\] เขียน Report ลง Sheet "Dedup\_Names\_Report"  
 \*/  
function writeIssue1Report() {  
  var report \= generateDuplicateNamesReport();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var reportSheet \= ss.getSheetByName("Dedup\_Names\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Dedup\_Names\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  // Header  
  reportSheet.appendRow(\["🔴 ISSUE \#1: Duplicate Names Report"\]);  
  reportSheet.appendRow(\["Generated: " \+ report.timestamp\]);  
  reportSheet.appendRow(\["Total Duplicate Groups: " \+ report.totalDuplicateGroups\]);  
  reportSheet.appendRow(\["Total Affected Records: " \+ report.totalAffectedRecords\]);  
  reportSheet.appendRow(\[""\]);  
    
  // Details header  
  reportSheet.appendRow(\[  
    "Normalized Name",  
    "Primary UUID",  
    "Primary Name",  
    "Primary Quality",  
    "Duplicate Count",  
    "Duplicate UUIDs",  
    "Action",  
    "Status"  
  \]);  
    
  // Details rows  
  report.details.forEach(function(detail) {  
    reportSheet.appendRow(\[  
      detail.normalizedName,  
      detail.primaryRecord.uuid,  
      detail.primaryRecord.rawName,  
      detail.primaryRecord.quality,  
      detail.duplicates.length,  
      detail.duplicates.map(d \=\> d.uuid).join(", "),  
      detail.action,  
      "PENDING\_REVIEW"  
    \]);  
  });  
    
  reportSheet.autoResizeColumns(1, 8);  
  console.log("✅ \[ISSUE \#1\] Report written: " \+ report.totalDuplicateGroups \+ " groups");  
}

// \============================================================  
// 🔍 ISSUE \#2: ชื่อสถานที่อยู่ซ้ำกัน  
// \============================================================

/\*\*  
 \* \[ISSUE \#2\] เก็บ Address Hash Index  
 \* ใช้ SHA-256 hash เพื่อเปรียบเทียบที่อยู่ที่ normalize แล้ว  
 \*/  
function buildDuplicateAddressIndex\_() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return {};  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var addressIndex \= {};  
    
  data.forEach(function(row, idx) {  
    var sysAddr \= row\[CONFIG.C\_IDX.SYS\_ADDR\] || "";  
    var googleAddr \= row\[CONFIG.C\_IDX.GOOGLE\_ADDR\] || "";  
      
    // ใช้ SysAddr เป็น primary, fallback เป็น GoogleAddr  
    var addrToUse \= sysAddr || googleAddr;  
    if (\!addrToUse) return;  
      
    // Normalize & Hash  
    var normalized \= normalizeAddress\_(addrToUse);  
    var hash \= Utilities.computeDigest(  
      Utilities.DigestAlgorithm.SHA\_256,  
      normalized  
    );  
    var hashStr \= hash.toString();  
      
    if (\!addressIndex\[hashStr\]) {  
      addressIndex\[hashStr\] \= \[\];  
    }  
      
    addressIndex\[hashStr\].push({  
      row: idx \+ 2,  
      rawAddress: addrToUse,  
      normalizedAddress: normalized,  
      name: row\[CONFIG.C\_IDX.NAME\],  
      uuid: row\[CONFIG.C\_IDX.UUID\],  
      verified: row\[CONFIG.C\_IDX.VERIFIED\],  
      quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0,  
      lat: parseFloat(row\[CONFIG.C\_IDX.LAT\]),  
      lng: parseFloat(row\[CONFIG.C\_IDX.LNG\])  
    });  
  });  
    
  var duplicates \= {};  
  Object.keys(addressIndex).forEach(function(hash) {  
    if (addressIndex\[hash\].length \> 1\) {  
      duplicates\[hash\] \= addressIndex\[hash\];  
    }  
  });  
    
  return duplicates;  
}

/\*\*  
 \* \[ISSUE \#2\] Normalize Thai Address  
 \* "อ.สายไหม เขต..." → "สายไหม"  
 \*/  
function normalizeAddress\_(address) {  
  if (\!address) return "";  
    
  var cleaned \= address.toString()  
    .trim()  
    .toLowerCase()  
    .replace(/\\s+/g, " ")  
    .replace(/อ\\./g, "") // ลบอักษรย่อ "อ."  
    .replace(/เขต/g, "")  
    .replace(/จังหวัด/g, "")  
    .replace(/ต\\./g, "")  
    .replace(/ส\\./g, "")  
    .replace(/\[^\\u0E00-\\u0E7Fa-z0-9\\s\]/g, "");  
    
  return cleaned;  
}

/\*\*  
 \* \[ISSUE \#2\] Generate Address Duplicates Report  
 \*/  
function generateDuplicateAddressReport() {  
  var duplicates \= buildDuplicateAddressIndex\_();  
    
  var report \= {  
    totalDuplicateGroups: Object.keys(duplicates).length,  
    totalAffectedRecords: 0,  
    details: \[\],  
    timestamp: new Date()  
  };  
    
  Object.keys(duplicates).forEach(function(hash) {  
    var group \= duplicates\[hash\];  
    report.totalAffectedRecords \+= group.length;  
      
    report.details.push({  
      address: group\[0\].normalizedAddress,  
      recordCount: group.length,  
      records: group,  
      type: "DUPLICATE\_ADDRESS"  
    });  
  });  
    
  return report;  
}

/\*\*  
 \* \[ISSUE \#2\] เขียน Report  
 \*/  
function writeIssue2Report() {  
  var report \= generateDuplicateAddressReport();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var reportSheet \= ss.getSheetByName("Dedup\_Address\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Dedup\_Address\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  reportSheet.appendRow(\["🔴 ISSUE \#2: Duplicate Addresses Report"\]);  
  reportSheet.appendRow(\["Generated: " \+ report.timestamp\]);  
  reportSheet.appendRow(\["Total Duplicate Groups: " \+ report.totalDuplicateGroups\]);  
  reportSheet.appendRow(\["Total Affected Records: " \+ report.totalAffectedRecords\]);  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\[  
    "Normalized Address",  
    "Customer Count",  
    "Customer Names",  
    "Customer UUIDs",  
    "Status"  
  \]);  
    
  report.details.forEach(function(detail) {  
    reportSheet.appendRow(\[  
      detail.address,  
      detail.recordCount,  
      detail.records.map(r \=\> r.name).join(" | "),  
      detail.records.map(r \=\> r.uuid).join(" | "),  
      "REVIEW\_NEEDED"  
    \]);  
  });  
    
  reportSheet.autoResizeColumns(1, 5);  
  console.log("✅ \[ISSUE \#2\] Report written: " \+ report.totalDuplicateGroups \+ " groups");  
}

// \============================================================  
// 🔍 ISSUE \#3: LatLong ซ้ำกัน (Co-located Hubs)  
// \============================================================

/\*\*  
 \* \[ISSUE \#3\] ค้นหา GPS Points ที่ซ้ำกัน (\< 5 meters)  
 \*/  
function identifyCoLocatedHubs\_() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var validRecords \= \[\];  
    
  // Filter records with valid GPS  
  data.forEach(function(row, idx) {  
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
      
    if (\!isNaN(lat) && \!isNaN(lng)) {  
      validRecords.push({  
        row: idx \+ 2,  
        lat: lat,  
        lng: lng,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        verified: row\[CONFIG.C\_IDX.VERIFIED\],  
        quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0,  
        addr: row\[CONFIG.C\_IDX.SYS\_ADDR\],  
        coordSource: row\[CONFIG.C\_IDX.COORD\_SOURCE\]  
      });  
    }  
  });  
    
  var hubGroups \= \[\];  
  var processed \= new Set();  
    
  for (var i \= 0; i \< validRecords.length; i++) {  
    if (processed.has(validRecords\[i\].uuid)) continue;  
      
    var hub \= validRecords\[i\];  
    var cluster \= \[hub\];  
      
    for (var j \= i \+ 1; j \< validRecords.length; j++) {  
      if (processed.has(validRecords\[j\].uuid)) continue;  
        
      var dist \= getHaversineDistanceKM(  
        hub.lat, hub.lng,  
        validRecords\[j\].lat, validRecords\[j\].lng  
      ) \* 1000; // convert to meters  
        
      // ถ้า \< 5 meters → co-located  
      if (dist \< 5\) {  
        cluster.push(validRecords\[j\]);  
        processed.add(validRecords\[j\].uuid);  
      }  
    }  
      
    if (cluster.length \> 1\) {  
      cluster.forEach(r \=\> processed.add(r.uuid));  
      hubGroups.push({  
        lat: hub.lat,  
        lng: hub.lng,  
        records: cluster,  
        clusterSize: cluster.length,  
        primary: selectPrimaryRecord\_(cluster)  
      });  
    }  
  }  
    
  return hubGroups;  
}

/\*\*  
 \* \[ISSUE \#3\] Generate Co-located Hubs Report  
 \*/  
function generateCoLocatedHubsReport() {  
  var hubs \= identifyCoLocatedHubs\_();  
    
  var report \= {  
    totalHubs: hubs.length,  
    totalAffectedRecords: 0,  
    details: hubs,  
    timestamp: new Date()  
  };  
    
  hubs.forEach(h \=\> report.totalAffectedRecords \+= h.records.length);  
    
  return report;  
}

/\*\*  
 \* \[ISSUE \#3\] เขียน Report  
 \*/  
function writeIssue3Report() {  
  var report \= generateCoLocatedHubsReport();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var reportSheet \= ss.getSheetByName("Dedup\_CoLocatedHubs\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Dedup\_CoLocatedHubs\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  reportSheet.appendRow(\["🔴 ISSUE \#3: Co-located Hubs (Same GPS) Report"\]);  
  reportSheet.appendRow(\["Generated: " \+ report.timestamp\]);  
  reportSheet.appendRow(\["Total Hub Clusters: " \+ report.totalHubs\]);  
  reportSheet.appendRow(\["Total Affected Records: " \+ report.totalAffectedRecords\]);  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\[  
    "Hub GPS (Lat,Lng)",  
    "Record Count",  
    "Primary Name",  
    "Primary UUID",  
    "Other Names",  
    "Other UUIDs",  
    "Distance",  
    "Action"  
  \]);  
    
  report.details.forEach(function(hub) {  
    var primary \= hub.primary;  
    var others \= hub.records.filter(r \=\> r.uuid \!== primary.uuid);  
      
    reportSheet.appendRow(\[  
      hub.lat.toFixed(6) \+ "," \+ hub.lng.toFixed(6),  
      hub.clusterSize,  
      primary.name,  
      primary.uuid,  
      others.map(o \=\> o.name).join(" | "),  
      others.map(o \=\> o.uuid).join(" | "),  
      "\< 5 meters",  
      "LINK\_AS\_HUB"  
    \]);  
  });  
    
  reportSheet.autoResizeColumns(1, 8);  
  console.log("✅ \[ISSUE \#3\] Report written: " \+ report.totalHubs \+ " hubs");  
}

// \============================================================  
// 🔍 ISSUE \#4: บุคคลเดียวกันแต่ชื่อต่างกัน (Vendor Variants)  
// \============================================================

/\*\*  
 \* \[ISSUE \#4\] ใช้ Gemini AI หา Vendor Name Variants  
 \* Batch process 20 names ต่อครั้ง  
 \*/  
function detectNameVariants\_AI() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
    
  // Collect verified names (ground truth)  
  var verifiedNames \= \[\];  
  data.forEach(function(row) {  
    if (row\[CONFIG.C\_IDX.VERIFIED\] \=== true && row\[CONFIG.C\_IDX.NAME\]) {  
      verifiedNames.push({  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\]  
      });  
    }  
  });  
    
  // Collect unverified names  
  var unverifiedNames \= \[\];  
  data.forEach(function(row) {  
    if (row\[CONFIG.C\_IDX.VERIFIED\] \!== true && row\[CONFIG.C\_IDX.NAME\]) {  
      unverifiedNames.push({  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\]  
      });  
    }  
  });  
    
  console.log("Verified: " \+ verifiedNames.length \+ " | Unverified: " \+ unverifiedNames.length);  
    
  if (verifiedNames.length \=== 0 || unverifiedNames.length \=== 0\) {  
    return \[\];  
  }  
    
  // Batch into groups of 20  
  var batches \= \[\];  
  for (var i \= 0; i \< unverifiedNames.length; i \+= 20\) {  
    batches.push(unverifiedNames.slice(i, Math.min(i \+ 20, unverifiedNames.length)));  
  }  
    
  var matches \= \[\];  
    
  batches.forEach(function(batch, batchIdx) {  
    try {  
      var prompt \= \`  
      You are a logistics expert. Match customer name variants to their primary names.  
        
      PRIMARY VERIFIED NAMES (Ground Truth):  
      ${verifiedNames.map((v, i) \=\> (i \+ 1\) \+ ". " \+ v.name).join("\\n")}  
        
      VARIANT NAMES TO MATCH:  
      ${batch.map((b, i) \=\> (i \+ 1\) \+ '. "' \+ b.name \+ '"').join("\\n")}  
        
      For each variant, output JSON:  
      \[  
        {  
          "variant": "exact name from list",  
          "match": "matched primary name or null",  
          "confidence": 0-100,  
          "reason": "why you think it matches"  
        }  
      \]  
        
      Only output valid JSON array. No markdown. Be strict: only match if confident \>= 70\.  
      \`;  
        
      var response \= callGeminiAPI\_(prompt);  
        
      // Parse response  
      try {  
        var aiMatches \= JSON.parse(response);  
          
        aiMatches.forEach(function(match) {  
          var variantRecord \= batch.find(b \=\> b.name \=== match.variant);  
          if (variantRecord) {  
            matches.push({  
              variantName: match.variant,  
              variantUUID: variantRecord.uuid,  
              matchedName: match.match,  
              matchedUUID: verifiedNames.find(v \=\> v.name \=== match.match)?.uuid,  
              confidence: match.confidence,  
              reason: match.reason  
            });  
          }  
        });  
      } catch(parseErr) {  
        console.warn("Parse error in batch " \+ batchIdx \+ ": " \+ parseErr.message);  
      }  
        
    } catch(e) {  
      console.error("Batch " \+ batchIdx \+ " error: " \+ e.message);  
    }  
  });  
    
  return matches;  
}

/\*\*  
 \* \[ISSUE \#4\] Call Gemini API  
 \*/  
function callGeminiAPI\_(prompt) {  
  try {  
    var apiKey \= CONFIG.GEMINI\_API\_KEY;  
    var url \= "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" \+ apiKey;  
      
    var payload \= {  
      contents: \[{  
        parts: \[{  
          text: prompt  
        }\]  
      }\],  
      generationConfig: {  
        temperature: 0.3,  
        topP: 1,  
        topK: 1,  
        maxOutputTokens: 2048  
      }  
    };  
      
    var options \= {  
      method: 'post',  
      contentType: 'application/json',  
      payload: JSON.stringify(payload),  
      muteHttpExceptions: true,  
      timeout: 30000  
    };  
      
    var response \= UrlFetchApp.fetch(url, options);  
    var result \= JSON.parse(response.getContentText());  
      
    if (result.contents && result.contents\[0\] && result.contents\[0\].parts && result.contents\[0\].parts\[0\]) {  
      return result.contents\[0\].parts\[0\].text;  
    } else {  
      throw new Error("Invalid Gemini response: " \+ response.getContentText());  
    }  
  } catch(e) {  
    console.error("Gemini API Error: " \+ e.message);  
    throw e;  
  }  
}

/\*\*  
 \* \[ISSUE \#4\] Save AI Matches to NameMapping  
 \*/  
function saveAIMatches\_ToMapping() {  
  var matches \= detectNameVariants\_AI();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
    
  var savedCount \= 0;  
  var reviewCount \= 0;  
  var createReviewSheet \= false;  
  var reviewSheet \= null;  
    
  matches.forEach(function(match) {  
    if (match.confidence \>= 90\) {  
      // High confidence → Save to NameMapping  
      mapSheet.appendRow(\[  
        match.variantName,           // Variant\_Name  
        match.matchedUUID,           // Master\_UID  
        match.confidence,            // Confidence\_Score  
        "AI\_Auto\_Match",            // Mapped\_By  
        new Date()                  // Timestamp  
      \]);  
      savedCount++;  
    } else if (match.confidence \>= 70\) {  
      // Medium confidence → Create review queue  
      if (\!createReviewSheet) {  
        reviewSheet \= ss.getSheetByName("AI\_Review\_Queue");  
        if (\!reviewSheet) {  
          reviewSheet \= ss.insertSheet("AI\_Review\_Queue");  
          reviewSheet.appendRow(\[  
            "Variant\_Name",  
            "Matched\_Name",  
            "AI\_Confidence",  
            "Reason",  
            "Human\_Decision",  
            "Timestamp",  
            "Status"  
          \]);  
        }  
        createReviewSheet \= true;  
      }  
        
      reviewSheet.appendRow(\[  
        match.variantName,  
        match.matchedName,  
        match.confidence,  
        match.reason,  
        "", // human review  
        new Date(),  
        "PENDING"  
      \]);  
      reviewCount++;  
    }  
  });  
    
  console.log("✅ AI Matches: Saved=" \+ savedCount \+ " | Review=" \+ reviewCount);  
  return { saved: savedCount, review: reviewCount };  
}

/\*\*  
 \* \[ISSUE \#4\] Generate Report  
 \*/  
function writeIssue4Report() {  
  var matches \= detectNameVariants\_AI();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var reportSheet \= ss.getSheetByName("Dedup\_AIVariants\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Dedup\_AIVariants\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  reportSheet.appendRow(\["🔴 ISSUE \#4: AI-Detected Name Variants Report"\]);  
  reportSheet.appendRow(\["Generated: " \+ new Date()\]);  
  reportSheet.appendRow(\["Total Matches Found: " \+ matches.length\]);  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\[  
    "Variant Name",  
    "Matched Primary Name",  
    "AI Confidence",  
    "Reason",  
    "Status",  
    "Recommendation"  
  \]);  
    
  matches.forEach(function(match) {  
    var status \= match.confidence \>= 90 ? "AUTO\_SAVED" : "PENDING\_REVIEW";  
    var recommendation \= match.confidence \>= 90 ? "✅ Accepted" : "⚠️ Review";  
      
    reportSheet.appendRow(\[  
      match.variantName,  
      match.matchedName,  
      match.confidence \+ "%",  
      match.reason,  
      status,  
      recommendation  
    \]);  
  });  
    
  reportSheet.autoResizeColumns(1, 6);  
  console.log("✅ \[ISSUE \#4\] Report written: " \+ matches.length \+ " variants");  
}

// \============================================================  
// 🔍 ISSUE \#5: บุคลคนละชื่อ แต่ชื่อสถานที่อยู่เดียวกัน  
// \============================================================

/\*\*  
 \* \[ISSUE \#5\] ค้นหา Different Names @ Same Address  
 \*/  
function identifyDifferentNamesAtSameAddress\_() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var addressIndex \= {};  
    
  data.forEach(function(row, idx) {  
    var addr \= row\[CONFIG.C\_IDX.SYS\_ADDR\] || "";  
    if (\!addr) return;  
      
    var normalized \= normalizeAddress\_(addr);  
    var hash \= Utilities.computeDigest(  
      Utilities.DigestAlgorithm.SHA\_256,  
      normalized  
    ).toString();  
      
    if (\!addressIndex\[hash\]) {  
      addressIndex\[hash\] \= \[\];  
    }  
      
    addressIndex\[hash\].push({  
      row: idx \+ 2,  
      name: row\[CONFIG.C\_IDX.NAME\],  
      normName: normalizeText(row\[CONFIG.C\_IDX.NAME\]),  
      uuid: row\[CONFIG.C\_IDX.UUID\],  
      verified: row\[CONFIG.C\_IDX.VERIFIED\],  
      quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0,  
      rawAddr: addr,  
      normAddr: normalized  
    });  
  });  
    
  var issues \= \[\];  
    
  Object.keys(addressIndex).forEach(function(hash) {  
    var group \= addressIndex\[hash\];  
    if (group.length \> 1\) {  
      // Check if multiple different names  
      var uniqueNormNames \= {};  
      group.forEach(r \=\> {  
        if (\!uniqueNormNames\[r.normName\]) {  
          uniqueNormNames\[r.normName\] \= 0;  
        }  
        uniqueNormNames\[r.normName\]++;  
      });  
        
      if (Object.keys(uniqueNormNames).length \> 1\) {  
        issues.push({  
          address: group\[0\].normAddr,  
          rawAddress: group\[0\].rawAddr,  
          recordCount: group.length,  
          uniqueNames: Object.keys(uniqueNormNames).length,  
          records: group,  
          type: "WAREHOUSE\_SHARING"  
        });  
      }  
    }  
  });  
    
  return issues;  
}

/\*\*  
 \* \[ISSUE \#5\] Tag Warehouse Sharings in Database  
 \*/  
function tagWarehouseSharings() {  
  var issues \= identifyDifferentNamesAtSameAddress\_();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  var taggedCount \= 0;  
    
  issues.forEach(function(issue) {  
    var warehouseTag \= " \[🏢 Warehouse Shared: " \+ issue.uniqueNames \+ " entities\]";  
      
    issue.records.forEach(function(rec) {  
      var rowNum \= rec.row;  
      var currentAddr \= sheet.getRange(rowNum, CONFIG.COL\_SYS\_ADDR).getValue() || "";  
        
      if (currentAddr.indexOf("\[🏢 Warehouse Shared") \=== \-1) {  
        sheet.getRange(rowNum, CONFIG.COL\_SYS\_ADDR)  
          .setValue(currentAddr \+ warehouseTag);  
        taggedCount++;  
      }  
    });  
  });  
    
  console.log("✅ Tagged " \+ taggedCount \+ " records as warehouse sharing");  
  return taggedCount;  
}

/\*\*  
 \* \[ISSUE \#5\] Generate Report  
 \*/  
function writeIssue5Report() {  
  var issues \= identifyDifferentNamesAtSameAddress\_();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var reportSheet \= ss.getSheetByName("Dedup\_WarehouseSharing\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Dedup\_WarehouseSharing\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  reportSheet.appendRow(\["🔴 ISSUE \#5: Warehouse Sharing (Different Names, Same Address)"\]);  
  reportSheet.appendRow(\["Generated: " \+ new Date()\]);  
  reportSheet.appendRow(\["Total Shared Locations: " \+ issues.length\]);  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\[  
    "Address",  
    "Entity Count",  
    "Entity Names",  
    "Entity UUIDs",  
    "Action",  
    "Status"  
  \]);  
    
  issues.forEach(function(issue) {  
    reportSheet.appendRow(\[  
      issue.rawAddress,  
      issue.recordCount,  
      issue.records.map(r \=\> r.name).join(" | "),  
      issue.records.map(r \=\> r.uuid).join(" | "),  
      "TAG\_AS\_SHARED\_WAREHOUSE",  
      "COMPLETED"  
    \]);  
  });  
    
  reportSheet.autoResizeColumns(1, 6);  
  console.log("✅ \[ISSUE \#5\] Report written: " \+ issues.length \+ " locations");  
}

// \============================================================  
// 🔍 ISSUE \#6 & \#7: Same Name @ Different Locations (BRANCHES)  
// \============================================================

/\*\*  
 \* \[ISSUE \#6 & \#7\] Detect Multi-branch Customers  
 \* Same normalized name but different GPS locations (\> 500m apart)  
 \*/  
function detectMultiBranchCustomers\_() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var nameIndex \= {};  
    
  // Group by normalized name  
  data.forEach(function(row, idx) {  
    var normName \= normalizeText(row\[CONFIG.C\_IDX.NAME\]);  
    if (\!normName) return;  
      
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
      
    if (\!nameIndex\[normName\]) {  
      nameIndex\[normName\] \= \[\];  
    }  
      
    nameIndex\[normName\].push({  
      row: idx \+ 2,  
      rawName: row\[CONFIG.C\_IDX.NAME\],  
      normName: normName,  
      uuid: row\[CONFIG.C\_IDX.UUID\],  
      lat: lat,  
      lng: lng,  
      addr: row\[CONFIG.C\_IDX.SYS\_ADDR\],  
      verified: row\[CONFIG.C\_IDX.VERIFIED\],  
      quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0  
    });  
  });  
    
  var branchGroups \= \[\];  
    
  // For each name group, find clusters (branches)  
  Object.keys(nameIndex).forEach(function(norm) {  
    var group \= nameIndex\[norm\];  
      
    if (group.length \> 1\) {  
      // Validate all have valid GPS  
      var withGPS \= group.filter(r \=\> \!isNaN(r.lat) && \!isNaN(r.lng));  
        
      if (withGPS.length \> 1\) {  
        // Find clusters of locations \> 500m apart  
        var clusters \= \[\];  
        var processed \= new Set();  
          
        for (var i \= 0; i \< withGPS.length; i++) {  
          if (processed.has(withGPS\[i\].uuid)) continue;  
            
          var mainBranch \= withGPS\[i\];  
          var branchCluster \= \[mainBranch\];  
          processed.add(mainBranch.uuid);  
            
          for (var j \= i \+ 1; j \< withGPS.length; j++) {  
            if (processed.has(withGPS\[j\].uuid)) continue;  
              
            var dist \= getHaversineDistanceKM(  
              mainBranch.lat, mainBranch.lng,  
              withGPS\[j\].lat, withGPS\[j\].lng  
            ) \* 1000; // meters  
              
            if (dist \> 500\) {  
              // Different branch  
              clusters.push({  
                name: norm,  
                mainRecord: mainBranch,  
                otherRecords: \[withGPS\[j\]\],  
                distance: dist  
              });  
              processed.add(withGPS\[j\].uuid);  
            } else {  
              // Same branch  
              branchCluster.push(withGPS\[j\]);  
            }  
          }  
        }  
          
        if (clusters.length \> 0\) {  
          branchGroups.push({  
            name: norm,  
            totalRecords: group.length,  
            totalBranches: clusters.length \+ 1,  
            mainLocation: mainBranch,  
            branches: clusters,  
            allRecords: group  
          });  
        }  
      }  
    }  
  });  
    
  return branchGroups;  
}

/\*\*  
 \* \[ISSUE \#6 & \#7\] Link Branch Records  
 \*/  
function linkBranchCustomers() {  
  var branches \= detectMultiBranchCustomers\_();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  var linkedCount \= 0;  
    
  branches.forEach(function(branch) {  
    var primaryUUID \= branch.mainLocation.uuid;  
    var branchTag \= " \[สาขา: " \+ branch.totalBranches \+ " ที่\]";  
      
    branch.allRecords.forEach(function(rec) {  
      if (rec.uuid \!== primaryUUID) {  
        var rowNum \= rec.row;  
          
        // Add branch indicator  
        var currentName \= sheet.getRange(rowNum, CONFIG.COL\_NAME).getValue() || "";  
        if (currentName.indexOf("\[สาขา:") \=== \-1) {  
          sheet.getRange(rowNum, CONFIG.COL\_NAME)  
            .setValue(currentName \+ branchTag);  
        }  
          
        // Mark as linked in new column (if available)  
        // BRANCH\_PARENT\_UUID could be column 23+  
        linkedCount++;  
      }  
    });  
  });  
    
  console.log("✅ Linked " \+ linkedCount \+ " branch records");  
  return linkedCount;  
}

/\*\*  
 \* \[ISSUE \#6 & \#7\] Generate Report  
 \*/  
function writeIssue67Report() {  
  var branches \= detectMultiBranchCustomers\_();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var reportSheet \= ss.getSheetByName("Dedup\_Branches\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Dedup\_Branches\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  reportSheet.appendRow(\["🔴 ISSUE \#6 & \#7: Multi-branch Customers (Same Name, Different Location)"\]);  
  reportSheet.appendRow(\["Generated: " \+ new Date()\]);  
  reportSheet.appendRow(\["Total Companies with Branches: " \+ branches.length\]);  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\[  
    "Company Name",  
    "Total Locations",  
    "Primary Location GPS",  
    "Primary Address",  
    "Branch Details",  
    "Total Records",  
    "Action",  
    "Status"  
  \]);  
    
  branches.forEach(function(branch) {  
    var branchDetails \= branch.branches.map(b \=\>   
      b.mainRecord.normName \+ " (" \+ b.distance.toFixed(0) \+ "m)"  
    ).join(" | ");  
      
    reportSheet.appendRow(\[  
      branch.name,  
      branch.totalBranches,  
      branch.mainLocation.lat.toFixed(6) \+ "," \+ branch.mainLocation.lng.toFixed(6),  
      branch.mainLocation.addr,  
      branchDetails,  
      branch.totalRecords,  
      "LINK\_BRANCHES",  
      "PENDING"  
    \]);  
  });  
    
  reportSheet.autoResizeColumns(1, 8);  
  console.log("✅ \[ISSUE \#6 & \#7\] Report written: " \+ branches.length \+ " companies");  
}

// \============================================================  
// 🔍 ISSUE \#8: Different Names @ Exact Same GPS (Subsidiary/DBA)  
// \============================================================

/\*\*  
 \* \[ISSUE \#8\] Detect Different Names at Exact GPS  
 \*/  
function identifyDifferentNamesAtExactGPS\_() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var gpsIndex \= {};  
    
  // Create exact GPS hash  
  data.forEach(function(row, idx) {  
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
      
    if (\!isNaN(lat) && \!isNaN(lng)) {  
      // 6 decimal places \= \~10cm precision (exact enough)  
      var key \= lat.toFixed(6) \+ "," \+ lng.toFixed(6);  
        
      if (\!gpsIndex\[key\]) {  
        gpsIndex\[key\] \= \[\];  
      }  
        
      gpsIndex\[key\].push({  
        row: idx \+ 2,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        normName: normalizeText(row\[CONFIG.C\_IDX.NAME\]),  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        verified: row\[CONFIG.C\_IDX.VERIFIED\],  
        quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0,  
        addr: row\[CONFIG.C\_IDX.SYS\_ADDR\],  
        lat: lat,  
        lng: lng  
      });  
    }  
  });  
    
  var duplicates \= \[\];  
    
  Object.keys(gpsIndex).forEach(function(key) {  
    var group \= gpsIndex\[key\];  
      
    if (group.length \> 1\) {  
      // Check if different names  
      var uniqueNormNames \= {};  
      group.forEach(r \=\> {  
        if (\!uniqueNormNames\[r.normName\]) {  
          uniqueNormNames\[r.normName\] \= \[\];  
        }  
        uniqueNormNames\[r.normName\].push(r);  
      });  
        
      // Multiple different names at same exact GPS  
      if (Object.keys(uniqueNormNames).length \> 1\) {  
        duplicates.push({  
          gps: key,  
          recordCount: group.length,  
          uniqueNames: Object.keys(uniqueNormNames).length,  
          records: group,  
          type: "SUBSIDIARY\_OR\_DBA"  
        });  
      }  
    }  
  });  
    
  return duplicates;  
}

/\*\*  
 \* \[ISSUE \#8\] Generate Merge Recommendations  
 \*/  
function generateMergeRecommendations\_Issue8() {  
  var exactGPS \= identifyDifferentNamesAtExactGPS\_();  
    
  var recommendations \= \[\];  
    
  exactGPS.forEach(function(dup) {  
    // Select primary (verified or highest quality)  
    var primary \= selectPrimaryRecord\_(dup.records);  
      
    dup.records.forEach(function(rec) {  
      if (rec.uuid \!== primary.uuid) {  
        recommendations.push({  
          fromName: rec.name,  
          fromUUID: rec.uuid,  
          toName: primary.name,  
          toUUID: primary.uuid,  
          gps: dup.gps,  
          reason: "Same exact GPS location \- likely subsidiary or DBA",  
          confidence: 95  
        });  
      }  
    });  
  });  
    
  return recommendations;  
}

/\*\*  
 \* \[ISSUE \#8\] Write Report  
 \*/  
function writeIssue8Report() {  
  var duplicates \= identifyDifferentNamesAtExactGPS\_();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var reportSheet \= ss.getSheetByName("Dedup\_ExactGPS\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Dedup\_ExactGPS\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  reportSheet.appendRow(\["🔴 ISSUE \#8: Different Names @ Exact GPS (Subsidiary/DBA)"\]);  
  reportSheet.appendRow(\["Generated: " \+ new Date()\]);  
  reportSheet.appendRow(\["Total GPS Points: " \+ duplicates.length\]);  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\[  
    "GPS Coordinates",  
    "Entity Count",  
    "Entity Names",  
    "Entity UUIDs",  
    "Type",  
    "Recommendation",  
    "Status"  
  \]);  
    
  duplicates.forEach(function(dup) {  
    reportSheet.appendRow(\[  
      dup.gps,  
      dup.recordCount,  
      dup.records.map(r \=\> r.name).join(" | "),  
      dup.records.map(r \=\> r.uuid).join(" | "),  
      "SUBSIDIARY\_OR\_DBA",  
      "MERGE\_SECONDARY\_INTO\_PRIMARY",  
      "PENDING\_REVIEW"  
    \]);  
  });  
    
  reportSheet.autoResizeColumns(1, 7);  
  console.log("✅ \[ISSUE \#8\] Report written: " \+ duplicates.length \+ " GPS points");  
}

// \============================================================  
// 📊 MASTER REPORT: Generate All Issues  
// \============================================================

/\*\*  
 \* Generate Complete Deduplication Report (All 8 Issues)  
 \*/  
function generateComprehensiveDedupReport() {  
  var report \= {  
    timestamp: new Date(),  
    issues: {  
      issue1: generateDuplicateNamesReport(),  
      issue2: generateDuplicateAddressReport(),  
      issue3: generateCoLocatedHubsReport(),  
      issue4: detectNameVariants\_AI().length,  
      issue5: identifyDifferentNamesAtSameAddress\_().length,  
      issue67: detectMultiBranchCustomers\_().length,  
      issue8: identifyDifferentNamesAtExactGPS\_().length  
    }  
  };  
    
  return report;  
}

/\*\*  
 \* Write All Reports at Once  
 \*/  
function writeAllDedupReports() {  
  console.log("📊 Generating all deduplication reports...");  
    
  writeIssue1Report();  
  writeIssue2Report();  
  writeIssue3Report();  
  writeIssue4Report();  
  writeIssue5Report();  
  writeIssue67Report();  
  writeIssue8Report();  
    
  console.log("✅ All reports generated successfully\!");  
}

// \============================================================  
// 🔗 HELPER: Map Object to Row  
// \============================================================

function mapObjectToRow(obj) {  
  var row \= new Array(CONFIG.MAP\_TOTAL\_COLS).fill("");  
  row\[CONFIG.MAP\_IDX.VARIANT\] \= obj.variant || "";  
  row\[CONFIG.MAP\_IDX.UID\] \= obj.uid || "";  
  row\[CONFIG.MAP\_IDX.CONFIDENCE\] \= obj.confidence || 0;  
  row\[CONFIG.MAP\_IDX.MAPPED\_BY\] \= obj.mappedBy || "System";  
  row\[CONFIG.MAP\_IDX.TIMESTAMP\] \= obj.timestamp || new Date();  
  return row;  
}  
\`\`\`

\---

ตอนนี้ผมจะสร้างไฟล์ที่ 2 ต่อ:

\# 🎯 ส่วนที่ 2: Service\_Validation.gs

\`\`\`javascript  
/\*\*  
 \* SERVICE: DATA QUALITY VALIDATION  
 \* VERSION: 4.2 \- Phase A  
 \*   
 \* ✅ ฟังก์ชันตรวจสอบคุณภาพข้อมูลต่างๆ  
 \* \- Schema validation  
 \* \- Missing data detection  
 \* \- Data type checking  
 \* \- Consistency checks  
 \*/

// \============================================================  
// ✅ SCHEMA VALIDATION  
// \============================================================

/\*\*  
 \* Validate Database Sheet Schema  
 \*/  
function validateDatabaseSchema() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  if (\!sheet) {  
    return { valid: false, errors: \["Database sheet not found"\] };  
  }  
    
  var errors \= \[\];  
  var warnings \= \[\];  
    
  // Check headers  
  var headerRow \= sheet.getRange(1, 1, 1, CONFIG.DB\_TOTAL\_COLS).getValues()\[0\];  
  var requiredHeaders \= CONFIG.DB\_REQUIRED\_HEADERS;  
    
  Object.keys(requiredHeaders).forEach(function(colNum) {  
    var colIdx \= parseInt(colNum) \- 1;  
    var expectedHeader \= requiredHeaders\[colNum\];  
    var actualHeader \= headerRow\[colIdx\] || "";  
      
    if (\!actualHeader.includes(expectedHeader)) {  
      errors.push("Column " \+ colNum \+ ": expected '" \+ expectedHeader \+   
                  "', got '" \+ actualHeader \+ "'");  
    }  
  });  
    
  // Check data types in sample rows  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  if (lastRow \> 2\) {  
    var sampleData \= sheet.getRange(2, 1, Math.min(10, lastRow \- 1), CONFIG.DB\_TOTAL\_COLS).getValues();  
      
    sampleData.forEach(function(row, idx) {  
      var lat \= row\[CONFIG.C\_IDX.LAT\];  
      var lng \= row\[CONFIG.C\_IDX.LNG\];  
      var created \= row\[CONFIG.C\_IDX.CREATED\];  
        
      // Validate coordinates  
      if (lat && typeof lat \!== 'number') {  
        warnings.push("Row " \+ (idx \+ 2\) \+ ": LAT is not numeric");  
      }  
      if (lng && typeof lng \!== 'number') {  
        warnings.push("Row " \+ (idx \+ 2\) \+ ": LNG is not numeric");  
      }  
        
      // Validate date  
      if (created && \!(created instanceof Date)) {  
        warnings.push("Row " \+ (idx \+ 2\) \+ ": CREATED is not a date");  
      }  
    });  
  }  
    
  return {  
    valid: errors.length \=== 0,  
    errors: errors,  
    warnings: warnings,  
    totalColumns: CONFIG.DB\_TOTAL\_COLS,  
    totalRows: lastRow  
  };  
}

/\*\*  
 \* Validate NameMapping Schema  
 \*/  
function validateNameMappingSchema() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);  
    
  if (\!sheet) {  
    return { valid: false, errors: \["NameMapping sheet not found"\] };  
  }  
    
  var errors \= \[\];  
  var warnings \= \[\];  
    
  var headerRow \= sheet.getRange(1, 1, 1, CONFIG.MAP\_TOTAL\_COLS).getValues()\[0\];  
  var requiredHeaders \= CONFIG.MAP\_REQUIRED\_HEADERS;  
    
  Object.keys(requiredHeaders).forEach(function(colNum) {  
    var colIdx \= parseInt(colNum) \- 1;  
    var expectedHeader \= requiredHeaders\[colNum\];  
    var actualHeader \= headerRow\[colIdx\] || "";  
      
    if (\!actualHeader.includes(expectedHeader)) {  
      errors.push("Column " \+ colNum \+ ": expected '" \+ expectedHeader \+   
                  "', got '" \+ actualHeader \+ "'");  
    }  
  });  
    
  var lastRow \= sheet.getLastRow();  
    
  // Check for orphaned mappings (UUID not in Database)  
  if (lastRow \> 1\) {  
    var mapData \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.MAP\_TOTAL\_COLS).getValues();  
    var dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    var dbLastRow \= getRealLastRow\_(dbSheet, CONFIG.COL\_NAME);  
    var dbData \= dbLastRow \> 1 ?   
      dbSheet.getRange(2, 1, dbLastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues() : \[\];  
      
    var existingUUIDs \= {};  
    dbData.forEach(r \=\> {  
      if (r\[CONFIG.C\_IDX.UUID\]) {  
        existingUUIDs\[r\[CONFIG.C\_IDX.UUID\]\] \= true;  
      }  
    });  
      
    mapData.forEach(function(row, idx) {  
      var uuid \= row\[CONFIG.MAP\_IDX.UID\];  
      if (uuid && \!existingUUIDs\[uuid\]) {  
        warnings.push("Row " \+ (idx \+ 2\) \+ ": UUID '" \+ uuid \+ "' not found in Database");  
      }  
    });  
  }  
    
  return {  
    valid: errors.length \=== 0,  
    errors: errors,  
    warnings: warnings,  
    totalRows: lastRow  
  };  
}

// \============================================================  
// ✅ MISSING DATA DETECTION  
// \============================================================

/\*\*  
 \* Find Records with Missing Critical Data  
 \*/  
function findMissingCriticalData() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var missing \= \[\];  
    
  data.forEach(function(row, idx) {  
    var issues \= \[\];  
      
    // Missing Name  
    if (\!row\[CONFIG.C\_IDX.NAME\]) {  
      issues.push("NAME");  
    }  
      
    // Missing LAT or LNG  
    if (\!row\[CONFIG.C\_IDX.LAT\] || isNaN(parseFloat(row\[CONFIG.C\_IDX.LAT\]))) {  
      issues.push("LAT");  
    }  
    if (\!row\[CONFIG.C\_IDX.LNG\] || isNaN(parseFloat(row\[CONFIG.C\_IDX.LNG\]))) {  
      issues.push("LNG");  
    }  
      
    // Missing UUID  
    if (\!row\[CONFIG.C\_IDX.UUID\]) {  
      issues.push("UUID");  
    }  
      
    if (issues.length \> 0\) {  
      missing.push({  
        row: idx \+ 2,  
        name: row\[CONFIG.C\_IDX.NAME\] || "(blank)",  
        missingFields: issues  
      });  
    }  
  });  
    
  return missing;  
}

/\*\*  
 \* Find Low Quality Records  
 \*/  
function findLowQualityRecords() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var lowQuality \= \[\];  
    
  data.forEach(function(row, idx) {  
    var quality \= parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0;  
      
    if (quality \< 50\) {  
      lowQuality.push({  
        row: idx \+ 2,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        quality: quality,  
        hasLat: \!\!row\[CONFIG.C\_IDX.LAT\],  
        hasLng: \!\!row\[CONFIG.C\_IDX.LNG\],  
        hasAddr: \!\!row\[CONFIG.C\_IDX.SYS\_ADDR\],  
        hasProvince: \!\!row\[CONFIG.C\_IDX.PROVINCE\],  
        verified: row\[CONFIG.C\_IDX.VERIFIED\]  
      });  
    }  
  });  
    
  return lowQuality;  
}

/\*\*  
 \* Find Unverified Records  
 \*/  
function findUnverifiedRecords() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var unverified \= \[\];  
    
  data.forEach(function(row, idx) {  
    if (row\[CONFIG.C\_IDX.VERIFIED\] \!== true) {  
      unverified.push({  
        row: idx \+ 2,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        quality: parseFloat(row\[CONFIG.C\_IDX.QUALITY\]) || 0,  
        confidence: parseFloat(row\[CONFIG.C\_IDX.CONFIDENCE\]) || 0  
      });  
    }  
  });  
    
  return unverified;  
}

// \============================================================  
// ✅ DATA CONSISTENCY CHECKS  
// \============================================================

/\*\*  
 \* Find Invalid GPS Coordinates (outside Thailand)  
 \*/  
function findInvalidGPS() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var invalid \= \[\];  
    
  // Thailand bounds: LAT 6-21, LNG 97-106  
  var THAILAND\_BOUNDS \= {  
    minLat: 6,  
    maxLat: 21,  
    minLng: 97,  
    maxLng: 106  
  };  
    
  data.forEach(function(row, idx) {  
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
      
    if (\!isNaN(lat) && \!isNaN(lng)) {  
      if (lat \< THAILAND\_BOUNDS.minLat || lat \> THAILAND\_BOUNDS.maxLat ||  
          lng \< THAILAND\_BOUNDS.minLng || lng \> THAILAND\_BOUNDS.maxLng) {  
        invalid.push({  
          row: idx \+ 2,  
          name: row\[CONFIG.C\_IDX.NAME\],  
          uuid: row\[CONFIG.C\_IDX.UUID\],  
          lat: lat,  
          lng: lng,  
          reason: "Outside Thailand boundaries"  
        });  
      }  
    }  
  });  
    
  return invalid;  
}

/\*\*  
 \* Find Conflicting Data (inconsistency between addr and GPS)  
 \*/  
function findConflictingData() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return \[\];  
    
  var data \= sheet.getRange(2, 1, lastRow \- 1, CONFIG.DB\_TOTAL\_COLS).getValues();  
  var conflicts \= \[\];  
    
  data.forEach(function(row, idx) {  
    var lat \= parseFloat(row\[CONFIG.C\_IDX.LAT\]);  
    var lng \= parseFloat(row\[CONFIG.C\_IDX.LNG\]);  
    var sysAddr \= row\[CONFIG.C\_IDX.SYS\_ADDR\] || "";  
    var googleAddr \= row\[CONFIG.C\_IDX.GOOGLE\_ADDR\] || "";  
      
    // If has GPS but no address  
    if (\!isNaN(lat) && \!isNaN(lng) && \!sysAddr && \!googleAddr) {  
      conflicts.push({  
        row: idx \+ 2,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        issue: "GPS present but missing both addresses"  
      });  
    }  
      
    // If has address but no GPS  
    if ((sysAddr || googleAddr) && (isNaN(lat) || isNaN(lng))) {  
      conflicts.push({  
        row: idx \+ 2,  
        name: row\[CONFIG.C\_IDX.NAME\],  
        uuid: row\[CONFIG.C\_IDX.UUID\],  
        issue: "Address present but missing GPS"  
      });  
    }  
  });  
    
  return conflicts;  
}

// \============================================================  
// ✅ GENERATE VALIDATION REPORT  
// \============================================================

/\*\*  
 \* Write Complete Validation Report  
 \*/  
function writeValidationReport() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
    
  var dbSchema \= validateDatabaseSchema();  
  var mapSchema \= validateNameMappingSchema();  
  var missingData \= findMissingCriticalData();  
  var lowQuality \= findLowQualityRecords();  
  var unverified \= findUnverifiedRecords();  
  var invalidGPS \= findInvalidGPS();  
  var conflicts \= findConflictingData();  
    
  // Create report sheet  
  var reportSheet \= ss.getSheetByName("Validation\_Report");  
  if (\!reportSheet) {  
    reportSheet \= ss.insertSheet("Validation\_Report");  
  } else {  
    reportSheet.clearContents();  
  }  
    
  // Summary  
  reportSheet.appendRow(\["✅ DATA QUALITY VALIDATION REPORT"\]);  
  reportSheet.appendRow(\["Generated: " \+ new Date()\]);  
  reportSheet.appendRow(\[""\]);  
    
  // Schema validation  
  reportSheet.appendRow(\["📋 SCHEMA VALIDATION"\]);  
  reportSheet.appendRow(\["Database Sheet Schema", dbSchema.valid ? "✅ PASS" : "❌ FAIL"\]);  
  if (dbSchema.errors.length \> 0\) {  
    reportSheet.appendRow(\["Errors:"\]);  
    dbSchema.errors.forEach(e \=\> reportSheet.appendRow(\["  \- " \+ e\]));  
  }  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\["NameMapping Sheet Schema", mapSchema.valid ? "✅ PASS" : "❌ FAIL"\]);  
  if (mapSchema.errors.length \> 0\) {  
    reportSheet.appendRow(\["Errors:"\]);  
    mapSchema.errors.forEach(e \=\> reportSheet.appendRow(\["  \- " \+ e\]));  
  }  
  if (mapSchema.warnings.length \> 0\) {  
    reportSheet.appendRow(\["Warnings:"\]);  
    mapSchema.warnings.slice(0, 5).forEach(w \=\> reportSheet.appendRow(\["  \- " \+ w\]));  
    if (mapSchema.warnings.length \> 5\) {  
      reportSheet.appendRow(\["  ... and " \+ (mapSchema.warnings.length \- 5\) \+ " more"\]);  
    }  
  }  
  reportSheet.appendRow(\[""\]);  
    
  // Data issues  
  reportSheet.appendRow(\["📊 DATA ISSUES FOUND"\]);  
  reportSheet.appendRow(\["Missing Critical Data", missingData.length, "records"\]);  
  reportSheet.appendRow(\["Low Quality (\<50%)", lowQuality.length, "records"\]);  
  reportSheet.appendRow(\["Unverified", unverified.length, "records"\]);  
  reportSheet.appendRow(\["Invalid GPS (outside Thailand)", invalidGPS.length, "records"\]);  
  reportSheet.appendRow(\["Conflicting Data", conflicts.length, "records"\]);  
  reportSheet.appendRow(\[""\]);  
    
  // Sample issues  
  reportSheet.appendRow(\["🔍 SAMPLE ISSUES (First 5 of each type)"\]);  
    
  reportSheet.appendRow(\["Missing Critical Data:"\]);  
  missingData.slice(0, 5).forEach(m \=\> {  
    reportSheet.appendRow(\["  Row " \+ m.row \+ ": " \+ m.name \+ " → Missing: " \+ m.missingFields.join(", ")\]);  
  });  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\["Low Quality Records:"\]);  
  lowQuality.slice(0, 5).forEach(l \=\> {  
    reportSheet.appendRow(\["  Row " \+ l.row \+ ": " \+ l.name \+ " (Quality: " \+ l.quality \+ "%)"\]);  
  });  
  reportSheet.appendRow(\[""\]);  
    
  reportSheet.appendRow(\["Invalid GPS:"\]);  
  invalidGPS.slice(0, 5).forEach(g \=\> {  
    reportSheet.appendRow(\["  Row " \+ g.row \+ ": " \+ g.name \+ " (" \+ g.lat \+ "," \+ g.lng \+ ")"\]);  
  });  
    
  reportSheet.autoResizeColumns(1, 5);  
  console.log("✅ Validation report written");  
}

// \============================================================  
// ✅ AUTO-REPAIR FUNCTIONS  
// \============================================================

/\*\*  
 \* Auto-repair missing UUIDs  
 \*/  
function autoRepairMissingUUIDs() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  var repaired \= 0;  
  var range \= sheet.getRange(2, CONFIG.COL\_UUID, lastRow \- 1, 1);  
  var values \= range.getValues();  
    
  values.forEach(function(row, idx) {  
    if (\!row\[0\]) {  
      values\[idx\]\[0\] \= generateUUID();  
      repaired++;  
    }  
  });  
    
  if (repaired \> 0\) {  
    range.setValues(values);  
    console.log("✅ Auto-repaired " \+ repaired \+ " missing UUIDs");  
  }  
    
  return repaired;  
}

/\*\*  
 \* Auto-repair invalid GPS (outside Thailand)  
 \* Clear them (will be refilled by Google Maps)  
 \*/  
function autoRepairInvalidGPS() {  
  var invalidGPS \= findInvalidGPS();  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  invalidGPS.forEach(function(record) {  
    sheet.getRange(record.row, CONFIG.COL\_LAT).clearContent();  
    sheet.getRange(record.row, CONFIG.COL\_LNG).clearContent();  
  });  
    
  console.log("✅ Cleared " \+ invalidGPS.length \+ " invalid GPS coordinates");  
  return invalidGPS.length;  
}

/\*\*  
 \* Auto-repair low quality records  
 \* Recalculate quality scores  
 \*/  
function autoRepairLowQuality() {  
  recalculateAllQuality();  
}  
\`\`\`

\---

ต่อไปผมจะสร้างไฟล์ 3: Dashboard  
ขอโทษครับ ผมจะแก้ไข ให้ผมสร้างไฟล์อย่างเรียบร้อย ตอนนี้ผมได้สร้างโค้ด Service\_Dedup.gs ที่ครบครัน ตอนนี้ผมจะเขียนส่วนที่เหลือให้แบบทั้งหมด:

\---

\# 🎯 ส่วนที่ 3: Dashboard\_Report.gs

\`\`\`javascript  
/\*\*  
 \* DASHBOARD & REPORTING ENGINE  
 \* VERSION: 4.2 \- Phase A  
 \*   
 \* 📊 สร้าง Real-time Dashboard สำหรับจัดการ Data Quality  
 \* \- Metrics summary  
 \* \- Issue breakdown  
 \* \- Quality distribution  
 \* \- Recommendation engine  
 \*/

// \============================================================  
// 📊 DASHBOARD DATA COLLECTION  
// \============================================================

/\*\*  
 \* Collect All Dashboard Metrics  
 \*/  
function collectDashboardMetrics() {  
  var metrics \= {  
    timestamp: new Date(),  
    database: {  
      totalRecords: getTotalRecordCount(),  
      verifiedRecords: getVerifiedCount(),  
      unverifiedRecords: getUnverifiedCount(),  
      withGPS: getRecordsWithGPS(),  
      withAddress: getRecordsWithAddress(),  
      avgQualityScore: getAverageQualityScore(),  
      avgConfidenceScore: getAverageConfidenceScore()  
    },  
    qualityDistribution: getQualityDistribution(),  
    duplicates: {  
      duplicateNames: buildDuplicateNameIndex\_().length || 0,  
      duplicateAddresses: buildDuplicateAddressIndex\_().length || 0,  
      coLocatedHubs: identifyCoLocatedHubs\_().length || 0,  
      multiNameVariants: (detectNameVariants\_AI() || \[\]).length || 0,  
      warehouseSharings: (identifyDifferentNamesAtSameAddress\_() || \[\]).length || 0,  
      multiBranches: (detectMultiBranchCustomers\_() || \[\]).length || 0,  
      sameGPSDiffNames: (identifyDifferentNamesAtExactGPS\_() || \[\]).length || 0  
    },  
    dataQuality: {  
      missingCriticalData: (findMissingCriticalData() || \[\]).length || 0,  
      lowQualityRecords: (findLowQualityRecords() || \[\]).length || 0,  
      invalidGPS: (findInvalidGPS() || \[\]).length || 0,  
      conflictingData: (findConflictingData() || \[\]).length || 0  
    }  
  };  
    
  return metrics;  
}

/\*\*  
 \* Get Total Record Count  
 \*/  
function getTotalRecordCount() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
  return lastRow \- 1;  
}

/\*\*  
 \* Get Verified Count  
 \*/  
function getVerifiedCount() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return 0;  
    
  var data \= sheet.getRange(2, CONFIG.COL\_VERIFIED, lastRow \- 1, 1).getValues();  
  var count \= 0;  
  data.forEach(row \=\> {  
    if (row\[0\] \=== true) count++;  
  });  
  return count;  
}

/\*\*  
 \* Get Unverified Count  
 \*/  
function getUnverifiedCount() {  
  return getTotalRecordCount() \- getVerifiedCount();  
}

/\*\*  
 \* Get Records with GPS  
 \*/  
function getRecordsWithGPS() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return 0;  
    
  var data \= sheet.getRange(2, CONFIG.COL\_LAT, lastRow \- 1, 2).getValues();  
  var count \= 0;  
  data.forEach(row \=\> {  
    var lat \= parseFloat(row\[0\]);  
    var lng \= parseFloat(row\[1\]);  
    if (\!isNaN(lat) && \!isNaN(lng)) count++;  
  });  
  return count;  
}

/\*\*  
 \* Get Records with Address  
 \*/  
function getRecordsWithAddress() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return 0;  
    
  var data \= sheet.getRange(2, CONFIG.COL\_SYS\_ADDR, lastRow \- 1, 1).getValues();  
  var count \= 0;  
  data.forEach(row \=\> {  
    if (row\[0\]) count++;  
  });  
  return count;  
}

/\*\*  
 \* Get Average Quality Score  
 \*/  
function getAverageQualityScore() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return 0;  
    
  var data \= sheet.getRange(2, CONFIG.COL\_QUALITY, lastRow \- 1, 1).getValues();  
  var sum \= 0;  
  var count \= 0;  
  data.forEach(row \=\> {  
    var q \= parseFloat(row\[0\]);  
    if (\!isNaN(q)) {  
      sum \+= q;  
      count++;  
    }  
  });  
  return count \> 0 ? Math.round((sum / count) \* 100\) / 100 : 0;  
}

/\*\*  
 \* Get Average Confidence Score  
 \*/  
function getAverageConfidenceScore() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return 0;  
    
  var data \= sheet.getRange(2, CONFIG.COL\_CONFIDENCE, lastRow \- 1, 1).getValues();  
  var sum \= 0;  
  var count \= 0;  
  data.forEach(row \=\> {  
    var c \= parseFloat(row\[0\]);  
    if (\!isNaN(c)) {  
      sum \+= c;  
      count++;  
    }  
  });  
  return count \> 0 ? Math.round((sum / count) \* 100\) / 100 : 0;  
}

/\*\*  
 \* Get Quality Score Distribution  
 \*/  
function getQualityDistribution() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var sheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  var lastRow \= getRealLastRow\_(sheet, CONFIG.COL\_NAME);  
    
  if (lastRow \< 2\) return { high: 0, medium: 0, low: 0 };  
    
  var data \= sheet.getRange(2, CONFIG.COL\_QUALITY, lastRow \- 1, 1).getValues();  
  var distribution \= { high: 0, medium: 0, low: 0 };  
    
  data.forEach(row \=\> {  
    var q \= parseFloat(row\[0\]);  
    if (\!isNaN(q)) {  
      if (q \>= 80\) distribution.high++;  
      else if (q \>= 50\) distribution.medium++;  
      else distribution.low++;  
    }  
  });  
    
  return distribution;  
}

// \============================================================  
// 📊 CREATE DASHBOARD SHEET  
// \============================================================

/\*\*  
 \* Create or Update Dashboard Sheet  
 \*/  
function createDashboardSheet() {  
  var ss \= SpreadsheetApp.getActiveSpreadsheet();  
  var metrics \= collectDashboardMetrics();  
    
  var dashSheet \= ss.getSheetByName("📊 Dashboard");  
  if (\!dashSheet) {  
    dashSheet \= ss.insertSheet("📊 Dashboard", 0); // Insert as first sheet  
  } else {  
    dashSheet.clearContents();  
  }  
    
  // \========== HEADER \==========  
  dashSheet.appendRow(\["🚛 LOGISTICS MASTER DATA SYSTEM \- DATA QUALITY DASHBOARD"\]);  
  dashSheet.getRange(1, 1).setFontSize(16).setBold(true);  
  dashSheet.appendRow(\["Generated: " \+ Utilities.formatDate(metrics.timestamp, "GMT+7", "yyyy-MM-dd HH:mm:ss")\]);  
  dashSheet.appendRow(\[""\]);  
    
  // \========== DATABASE OVERVIEW \==========  
  dashSheet.appendRow(\["📈 DATABASE OVERVIEW"\]);  
  dashSheet.appendRow(\["Metric", "Value", "Status"\]);  
    
  var totalRecs \= metrics.database.totalRecords;  
  var verifiedRecs \= metrics.database.verifiedRecords;  
  var verificationRate \= totalRecs \> 0 ? Math.round((verifiedRecs / totalRecs) \* 100\) : 0;  
    
  dashSheet.appendRow(\["Total Records", totalRecs, "ℹ️"\]);  
  dashSheet.appendRow(\["Verified Records", verifiedRecs \+ " (" \+ verificationRate \+ "%)", verificationRate \>= 80 ? "✅" : "⚠️"\]);  
  dashSheet.appendRow(\["Unverified Records", metrics.database.unverifiedRecords, "❌"\]);  
  dashSheet.appendRow(\["With GPS Coordinates", metrics.database.withGPS, metrics.database.withGPS \>= totalRecs \* 0.9 ? "✅" : "⚠️"\]);  
  dashSheet.appendRow(\["With Address", metrics.database.withAddress, metrics.database.withAddress \>= totalRecs \* 0.8 ? "✅" : "⚠️"\]);  
  dashSheet.appendRow(\["Avg Quality Score", metrics.database.avgQualityScore.toFixed(2) \+ "%", metrics.database.avgQualityScore \>= 70 ? "✅" : "⚠️"\]);  
  dashSheet.appendRow(\["Avg Confidence Score", metrics.database.avgConfidenceScore.toFixed(2) \+ "%", metrics.database.avgConfidenceScore \>= 70 ? "✅" : "⚠️"\]);  
  dashSheet.appendRow(\[""\]);  
    
  // \========== QUALITY DISTRIBUTION \==========  
  dashSheet.appendRow(\["📊 QUALITY SCORE DISTRIBUTION"\]);  
  dashSheet.appendRow(\["Category", "Count", "Percentage"\]);  
    
  var totalQuality \= metrics.qualityDistribution.high \+ metrics.qualityDistribution.medium \+ metrics.qualityDistribution.low;  
  var highPct \= totalQuality \> 0 ? Math.round((metrics.qualityDistribution.high / totalQuality) \* 100\) : 0;  
  var medPct \= totalQuality \> 0 ? Math.round((metrics.qualityDistribution.medium / totalQuality) \* 100\) : 0;  
  var lowPct \= totalQuality \> 0 ? Math.round((metrics.qualityDistribution.low / totalQuality) \* 100\) : 0;  
    
  dashSheet.appendRow(\["🟢 High (≥80%)", metrics.qualityDistribution.high, highPct \+ "%"\]);  
  dashSheet.appendRow(\["🟡 Medium (50-79%)", metrics.qualityDistribution.medium, medPct \+ "%"\]);  
  dashSheet.appendRow(\["🔴 Low (\<50%)", metrics.qualityDistribution.low, lowPct \+ "%"\]);  
  dashSheet.appendRow(\[""\]);  
    
  // \========== DUPLICATES SUMMARY \==========  
  dashSheet.appendRow(\["🔴 DUPLICATES & ISSUES FOUND"\]);  
  dashSheet.appendRow(\["Issue Type", "Count", "Severity", "Action Required"\]);  
    
  var issues \= metrics.duplicates;  
  dashSheet.appendRow(\["\#1 \- Duplicate Names", issues.duplicateNames, issues.duplicateNames \> 0 ? "🔴 HIGH" : "✅", issues.duplicateNames \> 0 ? "MERGE\_NEEDED" : "OK"\]);  
  dashSheet.appendRow(\["\#2 \- Duplicate Addresses", issues.duplicateAddresses, issues.duplicateAddresses \> 0 ? "🟠 MEDIUM" : "✅", issues.duplicateAddresses \> 0 ? "REVIEW\_NEEDED" : "OK"\]);  
  dashSheet.appendRow(\["\#3 \- Co-located Hubs", issues.coLocatedHubs, issues.coLocatedHubs \> 0 ? "🟠 MEDIUM" : "✅", issues.coLocatedHubs \> 0 ? "TAG\_AS\_HUB" : "OK"\]);  
  dashSheet.appendRow(\["\#4 \- Name Variants (AI detected)", issues.multiNameVariants, issues.multiNameVariants \> 0 ? "🟡 LOW" : "✅", issues.multiNameVariants \> 0 ? "MAPPING\_NEEDED" : "OK"\]);  
  dashSheet.appendRow(\["\#5 \- Warehouse Sharing", issues.warehouseSharings, issues.warehouseSharings \> 0 ? "🟡 LOW" : "✅", issues.warehouseSharings \> 0 ? "TAG\_NEEDED" : "OK"\]);  
  dashSheet.appendRow(\["\#6-7 \- Multi-branch Customers", issues.multiBranches, issues.multiBranches \> 0 ? "🟡 LOW" : "✅", issues.multiBranches \> 0 ? "LINK\_NEEDED" : "OK"\]);  
  dashSheet.appendRow(\["\#8 \- Same GPS Different Names", issues.sameGPSDiffNames, issues.sameGPSDiffNames \> 0 ? "🔴 HIGH" : "✅", issues.sameGPSDiffNames \> 0 ? "MERGE\_NEEDED" : "OK"\]);  
  dashSheet.appendRow(\[""\]);  
    
  // \========== DATA QUALITY ISSUES \==========  
  dashSheet.appendRow(\["🚨 DATA QUALITY ISSUES"\]);  
  dashSheet.appendRow(\["Issue", "Count", "Impact"\]);  
    
  var dq \= metrics.dataQuality;  
  dashSheet.appendRow(\["Missing Critical Data", dq.missingCriticalData, dq.missingCriticalData \> 0 ? "🔴 HIGH" : "✅"\]);  
  dashSheet.appendRow(\["Low Quality Records (\<50%)", dq.lowQualityRecords, dq.lowQualityRecords \> 0 ? "🟠 MEDIUM" : "✅"\]);  
  dashSheet.appendRow(\["Invalid GPS (outside Thailand)", dq.invalidGPS, dq.invalidGPS \> 0 ? "🔴 HIGH" : "✅"\]);  
  dashSheet.appendRow(\["Conflicting Data", dq.conflictingData, dq.conflictingData \> 0 ? "🟡 LOW" : "✅"\]);  
  dashSheet.appendRow(\[""\]);  
    
  // \========== RECOMMENDATIONS \==========  
  dashSheet.appendRow(\["💡 RECOMMENDED ACTIONS (Priority Order)"\]);  
  dashSheet.appendRow(\["\#", "Action", "Expected Impact", "Effort"\]);  
    
  var recommendationIndex \= 1;  
    
  if (dq.missingCriticalData \> 0\) {  
    dashSheet.appendRow(\[recommendationIndex++, "Fill missing critical data", "Improve data completeness", "High"\]);  
  }  
  if (issues.sameGPSDiffNames \> 0\) {  
    dashSheet.appendRow(\[recommendationIndex++, "Merge same GPS different names (Issue \#8)", "Reduce duplication", "Medium"\]);  
  }  
  if (issues.duplicateNames \> 0\) {  
    dashSheet.appendRow(\[recommendationIndex++, "Merge duplicate names (Issue \#1)", "Reduce duplication", "High"\]);  
  }  
  if (dq.lowQualityRecords \> 0\) {  
    dashSheet.appendRow(\[recommendationIndex++, "Improve low quality records", "Increase data reliability", "Medium"\]);  
  }  
  if (issues.coLocatedHubs \> 0\) {  
    dashSheet.appendRow(\[recommendationIndex++, "Tag co-located hubs (Issue \#3)", "Better hub identification", "Low"\]);  
  }  
  if (issues.multiNameVariants \> 0\) {  
    dashSheet.appendRow(\[recommendationIndex++, "Create name mappings (Issue \#4)", "Improve matching accuracy", "Low"\]);  
  }  
    
  dashSheet.appendRow(\[""\]);  
  dashSheet.appendRow(\["📊 Last Updated: " \+ Utilities.formatDate(metrics.timestamp, "GMT+7", "yyyy-MM-dd HH:mm:ss")\]);  
    
  // Format dashboard  
  dashSheet.setColumnWidth(1, 40);  
  dashSheet.setColumnWidth(2, 20);  
  dashSheet.setColumnWidth(3, 20);  
  dashSheet.setColumnWidth(4, 30);  
    
  // Color the header  
  var headerRange \= dashSheet.getRange(1, 1, 1, 4);  
  headerRange.setBackground("\#1f77b4");  
  headerRange.setFontColor("\#ffffff");  
    
  console.log("✅ Dashboard sheet created/updated");  
}

// \============================================================  
// 📧 GENERATE WEEKLY REPORT EMAIL  
// \============================================================

/\*\*  
 \* Generate and Send Weekly Report  
 \*/  
function sendWeeklyDashboardReport() {  
  var metrics \= collectDashboardMetrics();  
    
  var htmlBody \= \`  
    \<html\>  
    \<head\>  
      \<style\>  
        body { font-family: Arial, sans-serif; }  
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }  
        th { background-color: \#1f77b4; color: white; padding: 10px; text-align: left; }  
        td { padding: 8px; border-bottom: 1px solid \#ddd; }  
        tr:hover { background-color: \#f5f5f5; }  
        h2 { color: \#1f77b4; margin-top: 30px; }  
        .metric { font-weight: bold; }  
        .good { color: green; }  
        .warning { color: orange; }  
        .critical { color: red; }  
      \</style\>  
    \</head\>  
    \<body\>  
      \<h1\>📊 Weekly Data Quality Report\</h1\>  
      \<p\>Generated: \` \+ Utilities.formatDate(metrics.timestamp, "GMT+7", "yyyy-MM-dd HH:mm:ss") \+ \`\</p\>  
        
      \<h2\>📈 Database Overview\</h2\>  
      \<table\>  
        \<tr\>\<th\>Metric\</th\>\<th\>Value\</th\>\<th\>Status\</th\>\</tr\>  
        \<tr\>  
          \<td\>Total Records\</td\>  
          \<td class="metric"\>\` \+ metrics.database.totalRecords \+ \`\</td\>  
          \<td\>ℹ️\</td\>  
        \</tr\>  
        \<tr\>  
          \<td\>Verified Records\</td\>  
          \<td class="metric"\>\` \+ metrics.database.verifiedRecords \+ \` (\` \+   
            Math.round((metrics.database.verifiedRecords / metrics.database.totalRecords) \* 100\) \+ \`%)\</td\>  
          \<td\>\<span class="\` \+ (metrics.database.verifiedRecords / metrics.database.totalRecords \>= 0.8 ? "good" : "warning") \+ \`"\>  
            \` \+ (metrics.database.verifiedRecords / metrics.database.totalRecords \>= 0.8 ? "✅" : "⚠️") \+ \`  
          \</span\>\</td\>  
        \</tr\>  
        \<tr\>  
          \<td\>With GPS\</td\>  
          \<td class="metric"\>\` \+ metrics.database.withGPS \+ \`\</td\>  
          \<td\>\<span class="\` \+ (metrics.database.withGPS / metrics.database.totalRecords \>= 0.9 ? "good" : "warning") \+ \`"\>  
            \` \+ (metrics.database.withGPS / metrics.database.totalRecords \>= 0.9 ? "✅" : "⚠️") \+ \`  
          \</span\>\</td\>  
        \</tr\>  
        \<tr\>  
          \<td\>Avg Quality Score\</td\>  
          \<td class="metric"\>\` \+ metrics.database.avgQualityScore.toFixed(2) \+ \`%\</td\>  
          \<td\>\<span class="\` \+ (metrics.database.avgQualityScore \>= 70 ? "good" : "warning") \+ \`"\>  
            \` \+ (metrics.database.avgQualityScore \>= 70 ? "✅" : "⚠️") \+ \`  
          \</span\>\</td\>  
        \</tr\>  
      \</table\>  
        
      \<h2\>🔴 Duplicates Found\</h2\>  
      \<table\>  
        \<tr\>\<th\>Issue\</th\>\<th\>Count\</th\>\<th\>Action\</th\>\</tr\>  
        \<tr\>\<td\>\#1 \- Duplicate Names\</td\>\<td\>\` \+ metrics.duplicates.duplicateNames \+ \`\</td\>\<td\>Merge needed\</td\>\</tr\>  
        \<tr\>\<td\>\#2 \- Duplicate Addresses\</td\>\<td\>\` \+ metrics.duplicates.duplicateAddresses \+ \`\</td\>\<td\>Review needed\</td\>\</tr\>  
        \<tr\>\<td\>\#3 \- Co-located Hubs\</td\>\<td\>\` \+ metrics.duplicates.coLocatedHubs \+ \`\</td\>\<td\>Tag as hub\</td\>\</tr\>  
        \<tr\>\<td\>\#4 \- Name Variants (AI)\</td\>\<td\>\` \+ metrics.duplicates.multiNameVariants \+ \`\</td\>\<td\>Mapping needed\</td\>\</tr\>  
        \<tr\>\<td\>\#5 \- Warehouse Sharing\</td\>\<td\>\` \+ metrics.duplicates.warehouseSharings \+ \`\</td\>\<td\>Tag needed\</td\>\</tr\>  
        \<tr\>\<td\>\#6-7 \- Multi-branch\</td\>\<td\>\` \+ metrics.duplicates.multiBranches \+ \`\</td\>\<td\>Link needed\</td\>\</tr\>  
        \<tr\>\<td\>\#8 \- Same GPS Diff Names\</td\>\<td\>\` \+ metrics.duplicates.sameGPSDiffNames \+ \`\</td\>\<td\>Merge needed\</td\>\</tr\>  
      \</table\>  
        
      \<h2\>🚨 Data Quality Issues\</h2\>  
      \<table\>  
        \<tr\>\<th\>Issue\</th\>\<th\>Count\</th\>\<th\>Severity\</th\>\</tr\>  
        \<tr\>\<td\>Missing Critical Data\</td\>\<td\>\` \+ metrics.dataQuality.missingCriticalData \+ \`\</td\>\<td class="critical"\>HIGH\</td\>\</tr\>  
        \<tr\>\<td\>Low Quality Records\</td\>\<td\>\` \+ metrics.dataQuality.lowQualityRecords \+ \`\</td\>\<td class="warning"\>MEDIUM\</td\>\</tr\>  
        \<tr\>\<td\>Invalid GPS\</td\>\<td\>\` \+ metrics.dataQuality.invalidGPS \+ \`\</td\>\<td class="critical"\>HIGH\</td\>\</tr\>  
        \<tr\>\<td\>Conflicting Data\</td\>\<td\>\` \+ metrics.dataQuality.conflictingData \+ \`\</td\>\<td class="warning"\>LOW\</td\>\</tr\>  
      \</table\>  
        
      \<h2\>💡 Recommended Actions\</h2\>  
      \<ol\>  
        \<li\>Fill missing critical data (\` \+ metrics.dataQuality.missingCriticalData \+ \` records)\</li\>  
        \<li\>Merge duplicate names (\` \+ metrics.duplicates.duplicateNames \+ \` groups)\</li\>  
        \<li\>Resolve same GPS conflicts (\` \+ metrics.duplicates.sameGPSDiffNames \+ \` points)\</li\>  
        \<li\>Improve low quality records (\` \+ metrics.dataQuality.lowQualityRecords \+ \` records)\</li\>  
        \<li\>Fix invalid GPS coordinates (\` \+ metrics.dataQuality.invalidGPS \+ \` records)\</li\>  
      \</ol\>  
        
      \<p\>\<a href="\` \+ SpreadsheetApp.getActiveSpreadsheet().getUrl() \+ \`"\>📊 Open Dashboard\</a\>\</p\>  
        
      \<hr\>  
      \<p\>\<small\>This report was automatically generated. Please do not reply to this email.\</small\>\</p\>  
    \</body\>  
    \</html\>  
  \`;  
    
  var recipients \= "admin@scgjwd.com"; // แก้ไข email ตามต้องการ  
    
  GmailApp.sendEmail(recipients,  
    "📊 Weekly Data Quality Report \- " \+ Utilities.formatDate(metrics.timestamp, "GMT+7", "yyyy-MM-dd"),  
    "",  
    { htmlBody: htmlBody }  
  );  
    
  console.log("✅ Weekly report sent to " \+ recipients);  
}

// \============================================================  
// 💾 EXPORT METRICS TO CSV  
// \============================================================

/\*\*  
 \* Export Dashboard Metrics to CSV  
 \*/  
function exportMetricsToCSV() {  
  var metrics \= collectDashboardMetrics();  
    
  var csv \= "Data Quality Metrics Export\\n";  
  csv \+= "Generated: " \+ metrics.timestamp \+ "\\n\\n";  
    
  csv \+= "DATABASE OVERVIEW\\n";  
  csv \+= "Metric,Value\\n";  
  csv \+= "Total Records," \+ metrics.database.totalRecords \+ "\\n";  
  csv \+= "Verified Records," \+ metrics.database.verifiedRecords \+ "\\n";  
  csv \+= "With GPS," \+ metrics.database.withGPS \+ "\\n";  
  csv \+= "Avg Quality Score," \+ metrics.database.avgQualityScore \+ "%\\n\\n";  
    
  csv \+= "DUPLICATES\\n";  
  csv \+= "Issue Type,Count\\n";  
  csv \+= "Duplicate Names," \+ metrics.duplicates.duplicateNames \+ "\\n";  
  csv \+= "Duplicate Addresses," \+ metrics.duplicates.duplicateAddresses \+ "\\n";  
  csv \+= "Co-located Hubs," \+ metrics.duplicates.coLocatedHubs \+ "\\n";  
  csv \+= "Name Variants," \+ metrics.duplicates.multiNameVariants \+ "\\n";  
  csv \+= "Warehouse Sharing," \+ metrics.duplicates.warehouseSharings \+ "\\n";  
  csv \+= "Multi-branch," \+ metrics.duplicates.multiBranches \+ "\\n";  
  csv \+= "Same GPS Diff Names," \+ metrics.duplicates.sameGPSDiffNames \+ "\\n\\n";  
    
  csv \+= "DATA QUALITY ISSUES\\n";  
  csv \+= "Issue,Count\\n";  
  csv \+= "Missing Critical Data," \+ metrics.dataQuality.missingCriticalData \+ "\\n";  
  csv \+= "Low Quality Records," \+ metrics.dataQuality.lowQualityRecords \+ "\\n";  
  csv \+= "Invalid GPS," \+ metrics.dataQuality.invalidGPS \+ "\\n";  
  csv \+= "Conflicting Data," \+ metrics.dataQuality.conflictingData \+ "\\n";  
    
  return csv;  
}  
\`\`\`

\---

เนื่องจากความจำนวนอักขระมาก ผมจะสร้างเรื่องมีหลายกรรมการ ให้ผมสร้างไฟล์เหลือทั้งหมดและ Test Cases ในข้อความแยก:  
