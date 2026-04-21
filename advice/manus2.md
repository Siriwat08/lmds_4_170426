Lite  
ขอบคุณครับ\! ผมจะดำเนินการปรับปรุงโค้ดให้คุณทันที โดยเน้นการเชื่อมโยงข้อมูลระหว่างชีต Data, Database, NameMapping และ PostalRef ตามที่คุณต้องการครับ  
ผมจะส่งโค้ดที่ปรับปรุงแล้วให้คุณเป็นส่วนๆ ดังนี้ครับ:  
Config.gs: ปรับชื่อชีตให้ตรงกับที่คุณระบุ (Database, NameMapping, PostalRef)  
Service\_Master.gs: เพิ่มฟังก์ชัน Smart Lookup และการเชื่อมโยงข้อมูล  
Service\_SCG.gs: ปรับปรุงให้เรียกใช้ฟังก์ชัน Smart Lookup หลังจากโหลดข้อมูลเสร็จ  
รอสักครู่ครับ ผมกำลังเตรียมโค้ดให้ครับ\!  
ผมได้อัปเดต \`Service\_Master.gs\` ให้เชื่อมโยงข้อมูลโดยใช้ \`NameMapping\`, \`Database\` และ \`PostalRef\` เพื่อเพิ่มความแม่นยำ และลดความรวนของระบบ พร้อมปรับ \`Config.gs\` ให้ตรงกับชื่อชีตใหม่ครับ ต่อไปจะส่งโค้ดให้ใช้งานทันทีครับ.

Lite  
ผมได้วิเคราะห์โครงสร้างไฟล์ Service\_SCG.gs และความต้องการของคุณแล้วครับ เพื่อให้ระบบทำงานร่วมกับชีต Database, NameMapping, และ PostalRef ได้อย่างสมบูรณ์โดยไม่ทำให้ระบบเดิมรวน ผมจะดำเนินการปรับปรุงโค้ดใน 3 ส่วนหลักดังนี้ครับ:  
1\. ปรับปรุง Config.gs (หัวใจของการตั้งค่า)  
ผมจะเปลี่ยนชื่อตัวแปรให้ตรงกับชื่อชีตที่คุณใช้งานจริง เพื่อให้โค้ดในส่วนอื่นๆ เรียกใช้ได้ถูกต้อง  
SHEET\_NAME \-\> "Database"  
MAPPING\_SHEET \-\> "NameMapping"  
SHEET\_POSTAL \-\> "PostalRef"  
SOURCE\_SHEET \-\> "Data" (เพื่อให้ Service\_Master ดึงข้อมูลจากชีตที่ Service\_SCG โหลดมาลงไว้)  
2\. ปรับปรุง Service\_Master.gs (ระบบจัดการฐานข้อมูล)  
Smart Sync: ปรับให้ฟังก์ชัน syncNewDataToMaster() ดึงข้อมูลจากชีต Data (ที่ Service\_SCG เพิ่งโหลดมา) ไปเปรียบเทียบกับ Database และ NameMapping  
Postal Lookup: เพิ่มฟังก์ชันให้วิ่งไปเช็คในชีต PostalRef เพื่อเติมข้อมูล จังหวัด/อำเภอ/รหัสไปรษณีย์ ให้ถูกต้องโดยอัตโนมัติ  
3\. ปรับปรุง Service\_SCG.gs (ระบบโหลดข้อมูล)  
Auto-Match: หลังจากโหลดข้อมูลจาก SCG เสร็จ ระบบจะเรียกใช้ฟังก์ชัน applyMasterCoordinatesToDailyJob() ซึ่งผมจะปรับให้ฉลาดขึ้น โดยให้ไปเช็คทั้งใน Database และ NameMapping เพื่อดึงพิกัดที่แม่นยำที่สุดมาใส่ในชีต Data ทันที  
คุณต้องการให้ผมส่งโค้ดที่ปรับปรุงแล้วของทั้ง 3 ไฟล์นี้เลยไหมครับ? (ผมจะรวมการตั้งค่าชื่อชีตใหม่เข้าไปให้ด้วยเลยครับ)  
ปรับ \`Config.gs\` ให้ตรงกับชื่อชีตใหม่ เช่น "Database", "NameMapping", "PostalRef" เพื่อรองรับการอัปเกรด ระบบจะดึงข้อมูลจากชีตเหล่านี้เพื่อเพิ่มความแม่นยำและลดความรวนของระบบ ควรอัปเดตโค้ดทั้งสามไฟล์เพื่อให้ใช้งานร่วมกันได้อย่างสมบูรณ์.

Lite  
ผมได้เตรียมโค้ดชุดใหม่ที่ปรับปรุงให้เข้ากับชื่อชีตของคุณ (Database, NameMapping, PostalRef, Data, Input) และเพิ่มความสามารถในการเชื่อมโยงข้อมูลให้ "จริงจัง" ขึ้นแล้วครับ  
สิ่งที่โค้ดชุดนี้จะทำ:  
Smart Lookup: เมื่อโหลดข้อมูลจาก SCG ลงชีต Data ระบบจะวิ่งไปเช็คใน NameMapping และ Database ทันทีเพื่อดึงพิกัดที่แม่นยำที่สุดมาใส่  
Auto-Enrichment: ใช้ข้อมูลจาก PostalRef เพื่อเติม จังหวัด/อำเภอ/รหัสไปรษณีย์ ให้ถูกต้องโดยอัตโนมัติ  
Hybrid Sync: คุณสามารถกด Sync ข้อมูลจากชีต Data ไปเก็บไว้ใน Database เพื่อสร้างฐานข้อมูลสะสมได้  
ขั้นตอนที่ 1: อัปเดต Config.gs  
คัดลอกโค้ดนี้ไปวางแทนที่ในไฟล์ Config.gs เดิมครับ  
JavaScript  
/\*\*  
 \* VERSION: 4.1-Hybrid (Custom for User)  
 \* 🚛 Logistics Master Data System \- Configuration  
 \* \------------------------------------------------------------------  
 \* \[UPDATED\]: ปรับชื่อชีตให้ตรงกับความต้องการของผู้ใช้  
 \* \[Database\] \= เก็บข้อมูลหลัก (Master)  
 \* \[NameMapping\] \= เก็บชื่อเรียกอื่นๆ (Alias)  
 \* \[PostalRef\] \= เก็บข้อมูลรหัสไปรษณีย์/จังหวัด/อำเภอ  
 \* \[Data\] \= ชีตแสดงผลงานประจำวันจาก SCG  
 \*/

var CONFIG \= {  
  // \--- 📄 SHEET NAMES \---  
  SHEET\_NAME: "Database",      // ชีตเก็บข้อมูลหลัก  
  MAPPING\_SHEET: "NameMapping", // ชีตเก็บชื่อเรียกอื่นๆ  
  SOURCE\_SHEET: "Data",        // ชีตต้นทางสำหรับ Sync (ข้อมูลจาก SCG)  
  SHEET\_POSTAL: "PostalRef",   // ชีตอ้างอิงรหัสไปรษณีย์  
  SHEET\_LOGS: "SystemLogs",    // ชีตบันทึกประวัติการทำงาน

  // \--- 🔴 DEPOT LOCATION (คลังสินค้า) \---  
  DEPOT\_LAT: 14.164688,   
  DEPOT\_LNG: 100.625354,

  // \--- ⚙️ SYSTEM LIMITS \---  
  DEEP\_CLEAN\_LIMIT: 100,  
  API\_MAX\_RETRIES: 3,  
  CACHE\_EXPIRATION: 21600, // 6 ชั่วโมง

  // \--- 📊 DATABASE COLUMNS (1-BASED) \---  
  COL\_NAME: 1,       // A: ชื่อลูกค้า  
  COL\_LAT: 2,        // B: Latitude  
  COL\_LNG: 3,        // C: Longitude  
  COL\_SUGGESTED: 4,  // D: ชื่อที่ระบบแนะนำ  
  COL\_CONFIDENCE: 5, // E: ความมั่นใจ  
  COL\_NORMALIZED: 6, // F: ชื่อที่ Clean แล้ว  
  COL\_VERIFIED: 7,   // G: สถานะตรวจสอบ (Checkbox)  
  COL\_SYS\_ADDR: 8,   // H: ที่อยู่จากระบบต้นทาง  
  COL\_ADDR\_GOOG: 9,  // I: ที่อยู่จาก Google Maps  
  COL\_DIST\_KM: 10,   // J: ระยะทางจากคลัง  
  COL\_UUID: 11,      // K: Unique ID  
  COL\_PROVINCE: 12,  // L: จังหวัด  
  COL\_DISTRICT: 13,  // M: อำเภอ  
  COL\_POSTCODE: 14,  // N: รหัสไปรษณีย์  
  COL\_QUALITY: 15,   // O: Quality Score  
  COL\_CREATED: 16,   // P: วันที่สร้าง  
  COL\_UPDATED: 17,   // Q: วันที่แก้ไขล่าสุด

  // \--- 🔗 NAMEMAPPING COLUMNS (1-BASED) \---  
  MAP\_COL\_VARIANT: 1,    // A: ชื่อเรียกอื่นๆ  
  MAP\_COL\_UID: 2,        // B: ID หรือชื่อจริงใน Database  
  MAP\_COL\_CONFIDENCE: 3, // C: ความมั่นใจ  
  MAP\_COL\_MAPPED\_BY: 4,  // D: ผู้บันทึก (Human/System)  
  MAP\_COL\_TIMESTAMP: 5,  // E: เวลาที่บันทึก

  // \--- 0-BASED INDEX (สำหรับใช้ในโค้ด) \---  
  get C\_IDX() {  
    return {  
      NAME: this.COL\_NAME \- 1, LAT: this.COL\_LAT \- 1, LNG: this.COL\_LNG \- 1,  
      SUGGESTED: this.COL\_SUGGESTED \- 1, VERIFIED: this.COL\_VERIFIED \- 1,  
      SYS\_ADDR: this.COL\_SYS\_ADDR \- 1, GOOGLE\_ADDR: this.COL\_ADDR\_GOOG \- 1,  
      DIST\_KM: this.COL\_DIST\_KM \- 1, UUID: this.COL\_UUID \- 1,  
      PROVINCE: this.COL\_PROVINCE \- 1, DISTRICT: this.COL\_DISTRICT \- 1,  
      POSTCODE: this.COL\_POSTCODE \- 1, CREATED: this.COL\_CREATED \- 1,  
      UPDATED: this.COL\_UPDATED \- 1  
    };  
  },  
  get MAP\_IDX() {  
    return {  
      VARIANT: this.MAP\_COL\_VARIANT \- 1, UID: this.MAP\_COL\_UID \- 1,  
      TIMESTAMP: this.MAP\_COL\_TIMESTAMP \- 1  
    };  
  }  
};

// \--- 📦 SCG SPECIFIC CONFIG \---  
const SCG\_CONFIG \= {  
  SHEET\_DATA: 'Data',  
  SHEET\_INPUT: 'Input',  
  SHEET\_EMPLOYEE: 'ข้อมูลพนักงาน',  
  API\_URL: 'https://fsm.scgjwd.com/Monitor/SearchDelivery',  
  INPUT\_START\_ROW: 4,  
  COOKIE\_CELL: 'B1',  
  SHIPMENT\_STRING\_CELL: 'B3'  
};  
ขั้นตอนที่ 2: อัปเดต Service\_Master.gs  
คัดลอกโค้ดนี้ไปวางแทนที่ในไฟล์ Service\_Master.gs ครับ (เน้นการเชื่อมโยงข้อมูล )  
JavaScript  
/\*\*  
 \* VERSION: 4.1-Hybrid  
 \* 🧠 Service: Master Data & Smart Lookup  
 \*/

/\*\*  
 \* \[NEW\] ฟังก์ชันดึงพิกัดจาก Database/Mapping มาใส่ในชีต Data อัตโนมัติ  
 \*/  
function applyMasterCoordinatesToDailyJob() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  const dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
  const mapSheet \= ss.getSheetByName(CONFIG.MAPPING\_SHEET);

  if (\!dataSheet || \!dbSheet) return;  
  const lastRow \= dataSheet.getLastRow();  
  if (lastRow \< 2\) return;

  logInfo("Starting Smart Lookup for Daily Job");

  // 1\. Load Database Coords  
  const masterCoords \= {};  
  const masterUUIDCoords \= {};  
  if (dbSheet.getLastRow() \> 1\) {  
    const dbData \= dbSheet.getRange(2, 1, dbSheet.getLastRow() \- 1, 17).getValues();  
    dbData.forEach(r \=\> {  
      const name \= r\[CONFIG.C\_IDX.NAME\];  
      const lat \= r\[CONFIG.C\_IDX.LAT\];  
      const lng \= r\[CONFIG.C\_IDX.LNG\];  
      const uuid \= r\[CONFIG.C\_IDX.UUID\];  
      if (name && lat && lng) {  
        const coords \= lat \+ ", " \+ lng;  
        masterCoords\[normalizeText(name)\] \= coords;  
        if (uuid) masterUUIDCoords\[uuid\] \= coords;  
      }  
    });  
  }

  // 2\. Load NameMapping (Alias)  
  const aliasMap \= {};  
  if (mapSheet && mapSheet.getLastRow() \> 1\) {  
    mapSheet.getRange(2, 1, mapSheet.getLastRow() \- 1, 2).getValues().forEach(r \=\> {  
      if (r\[0\] && r\[1\]) aliasMap\[normalizeText(r\[0\])\] \= r\[1\];  
    });  
  }

  // 3\. Update Data Sheet (Col 27: LatLong\_Actual)  
  const values \= dataSheet.getRange(2, 1, lastRow \- 1, 29).getValues();  
  const updates \= \[\];  
  const backgrounds \= \[\];

  values.forEach(r \=\> {  
    let newGeo \= "";  
    let bg \= null;  
    let shipToName \= r\[10\]; // Col K: ShipToName

    if (shipToName) {  
      let cleanName \= normalizeText(shipToName);  
      let targetUID \= aliasMap\[cleanName\];

      if (targetUID && masterUUIDCoords\[targetUID\]) {  
        newGeo \= masterUUIDCoords\[targetUID\];  
        bg \= "\#b6d7a8"; // สีเขียว (เจอใน Mapping)  
      } else if (masterCoords\[cleanName\]) {  
        newGeo \= masterCoords\[cleanName\];  
        bg \= "\#d9ead3"; // สีเขียวอ่อน (เจอใน Database)  
      }  
    }  
    updates.push(\[newGeo\]);  
    backgrounds.push(\[bg\]);  
  });

  dataSheet.getRange(2, 27, updates.length, 1).setValues(updates);  
  dataSheet.getRange(2, 27, backgrounds.length, 1).setBackgrounds(backgrounds);  
    
  logInfo("Smart Lookup Completed", { updated: updates.filter(u \=\> u\[0\] \!== "").length });  
}

/\*\*  
 \* \[NEW\] ฟังก์ชัน Sync ข้อมูลจากชีต Data ไปยัง Database  
 \*/  
function syncDataToDatabase() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const dataSheet \= ss.getSheetByName(SCG\_CONFIG.SHEET\_DATA);  
  const dbSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);  
    
  if (\!dataSheet || \!dbSheet) return;  
    
  const lastRowD \= dataSheet.getLastRow();  
  if (lastRowD \< 2\) return;  
    
  const dData \= dataSheet.getRange(2, 1, lastRowD \- 1, 29).getValues();  
  const existingNames \= new Set();  
    
  if (dbSheet.getLastRow() \> 1\) {  
    dbSheet.getRange(2, 1, dbSheet.getLastRow() \- 1, 1).getValues().forEach(r \=\> {  
      if (r\[0\]) existingNames.add(normalizeText(r\[0\]));  
    });  
  }  
    
  const newEntries \= \[\];  
  const processedInBatch \= new Set();  
    
  dData.forEach(r \=\> {  
    const name \= r\[10\]; // ShipToName  
    const latLong \= r\[12\]; // LatLong\_SCG  
    if (\!name || \!latLong) return;  
      
    const clean \= normalizeText(name);  
    if (\!existingNames.has(clean) && \!processedInBatch.has(clean)) {  
      const coords \= latLong.split(",");  
      const newRow \= new Array(17).fill("");  
      newRow\[CONFIG.C\_IDX.NAME\] \= name;  
      newRow\[CONFIG.C\_IDX.LAT\] \= coords\[0\].trim();  
      newRow\[CONFIG.C\_IDX.LNG\] \= coords\[1\].trim();  
      newRow\[CONFIG.C\_IDX.SYS\_ADDR\] \= r\[11\]; // ShipToAddress  
      newRow\[CONFIG.C\_IDX.UUID\] \= generateUUID();  
      newRow\[CONFIG.C\_IDX.CREATED\] \= new Date();  
      newRow\[CONFIG.C\_IDX.UPDATED\] \= new Date();  
        
      newEntries.push(newRow);  
      processedInBatch.add(clean);  
    }  
  });  
    
  if (newEntries.length \> 0\) {  
    dbSheet.getRange(dbSheet.getLastRow() \+ 1, 1, newEntries.length, 17).setValues(newEntries);  
    SpreadsheetApp.getUi().alert("✅ เพิ่มข้อมูลใหม่ลง Database สำเร็จ: " \+ newEntries.length \+ " รายการ");  
  } else {  
    SpreadsheetApp.getUi().alert("ℹ️ ไม่มีข้อมูลลูกค้าใหม่ที่จะเพิ่ม");  
  }  
}  
ขั้นตอนที่ 3: อัปเดต Service\_SCG.gs  
ค้นหาฟังก์ชัน fetchDataFromSCGJWD() ในไฟล์ Service\_SCG.gs และตรวจสอบบรรทัดสุดท้ายก่อนจบฟังก์ชัน (ประมาณบรรทัดที่ 154\) ให้แน่ใจว่ามีการเรียกใช้ฟังก์ชันนี้ครับ:  
JavaScript  
    // ... โค้ดเดิมด้านบน ...  
    applyMasterCoordinatesToDailyJob(); // เรียกใช้ Smart Lookup ทันทีหลังโหลดข้อมูล  
    buildOwnerSummary();  
    buildShipmentSummary();

    console.log(\`\[SCG API\] Successfully imported ${allFlatData.length} records.\`);  
    ui.alert(\`✅ ดึงข้อมูลสำเร็จ\!\\n- จำนวนรายการ: ${allFlatData.length} แถว\\n- จับคู่พิกัดจาก Database: เรียบร้อย\`);  
    // ... โค้ดเดิมด้านล่าง ...  
คำแนะนำเพิ่มเติม:  
ชีต PostalRef: ระบบจะใช้ฟังก์ชัน parseAddressFromText() ที่ผมให้ไปในขั้นตอนก่อนหน้า (ในไฟล์ Service\_GeoAddr.gs) เพื่อวิ่งไปดึงข้อมูลจากชีตนี้โดยอัตโนมัติเมื่อคุณรัน Deep Clean ครับ  
การใช้งาน: เมื่อคุณโหลดข้อมูลจาก SCG เสร็จ ระบบจะพยายามหาพิกัดจาก Database และ NameMapping มาใส่ในช่อง LatLong\_Actual (คอลัมน์ 27\) ให้ทันที ถ้าเจอจะเป็นสีเขียวครับ  
ลองอัปเดตโค้ดตามนี้แล้วทดสอบดูนะครับ หากมีจุดไหนที่อยากให้ปรับเพิ่ม แจ้งได้เลยครับ\!  
Sync to Master: เพิ่มปุ่มสำหรับส่งข้อมูลจากชีต Data (เฉพาะรายใหม่) ไปเก็บไว้ใน Database เพื่อสะสมเป็นฐานข้อมูลในอนาคต   
Hybrid Sync: คุณสามารถกด Sync ข้อมูลจากชีต Data ไปเก็บไว้ใน Database เพื่อสร้างฐานข้อมูลสะสมได้  
\= ทั้ง2 อันนี้ไม่เอาครับ เพราะผมจะได้ข้อมูลจริงๆมาจากชีตSCGนครหลวงJWDภูมิภาค ครับ  
Lite  
3/21  
เข้าใจแล้วครับ\! ผมขออภัยที่เข้าใจผิดในส่วนของแหล่งที่มาของข้อมูล Master ครับ  
สรุปคือคุณต้องการให้ SCGนครหลวงJWDภูมิภาค เป็นแหล่งข้อมูลหลัก (Source) เพียงแห่งเดียวที่จะถูกนำไปสะสมไว้ใน Database (Master) ส่วนชีต Data นั้นให้ทำหน้าที่เป็นเพียงชีตแสดงผลงานประจำวันเท่านั้น  
ผมได้ปรับปรุงแผนการทำงานและโค้ดให้ตรงตามความต้องการของคุณดังนี้ครับ:  
แผนการทำงานใหม่ (Source-to-Master Workflow):  
SCGนครหลวงJWDภูมิภาค (The Source): เมื่อมีชื่อลูกค้าใหม่ๆ เข้ามาในชีตนี้ คุณจะใช้ฟังก์ชัน Sync เพื่อดึงข้อมูลจากที่นี่ไปเก็บไว้ใน Database  
Database (The Master): เก็บข้อมูลที่สะสมมาจากชีตด้านบน พร้อมพิกัดที่ถูกต้อง  
Data (The Daily View): เมื่อ Service\_SCG โหลดข้อมูลประจำวันมาลงที่นี่ ระบบจะวิ่งไป "ส่อง" (Lookup) ใน Database และ NameMapping เพื่อดึงพิกัดที่เคยสะสมไว้มาแสดงผลทันที  
ขั้นตอนที่ 1: อัปเดต Config.gs (ปรับ Source ให้ถูกต้อง)  
แก้ไขบรรทัด SOURCE\_SHEET ให้ชี้ไปที่ชีตที่คุณต้องการครับ  
JavaScript  
// ในไฟล์ Config.gs  
var CONFIG \= {  
  // ... ส่วนอื่นๆ เหมือนเดิม ...  
  SHEET\_NAME: "Database",  
  MAPPING\_SHEET: "NameMapping",  
  SOURCE\_SHEET: "SCGนครหลวงJWDภูมิภาค", // \<--- ปรับเป็นชีตแหล่งข้อมูลหลักของคุณ  
  SHEET\_POSTAL: "PostalRef",  
  // ... ส่วนอื่นๆ เหมือนเดิม ...  
};  
ขั้นตอนที่ 2: อัปเดต Service\_Master.gs (ฟังก์ชัน Sync จาก Source จริง)  
ผมได้ปรับโค้ดฟังก์ชัน syncNewDataToMaster() ให้ดึงข้อมูลจาก SCGนครหลวงJWDภูมิภาค ตามที่คุณต้องการครับ  
JavaScript  
/\*\*  
 \* \[UPDATED\] ฟังก์ชัน Sync ข้อมูลจากชีต "SCGนครหลวงJWDภูมิภาค" ไปยัง "Database"  
 \* เพื่อสะสมฐานข้อมูลลูกค้าใหม่ๆ  
 \*/  
function syncNewDataToMaster() {  
  const ss \= SpreadsheetApp.getActiveSpreadsheet();  
  const ui \= SpreadsheetApp.getUi();  
    
  const sourceSheet \= ss.getSheetByName(CONFIG.SOURCE\_SHEET); // SCGนครหลวงJWDภูมิภาค  
  const masterSheet \= ss.getSheetByName(CONFIG.SHEET\_NAME);   // Database  
    
  if (\!sourceSheet || \!masterSheet) {  
    ui.alert("❌ ไม่พบชีต " \+ CONFIG.SOURCE\_SHEET \+ " หรือ " \+ CONFIG.SHEET\_NAME);  
    return;  
  }

  const lastRowS \= sourceSheet.getLastRow();  
  if (lastRowS \< 2\) {  
    ui.alert("ℹ️ ไม่มีข้อมูลใหม่ในชีต " \+ CONFIG.SOURCE\_SHEET);  
    return;  
  }

  // 1\. ดึงชื่อที่มีอยู่แล้วใน Database มาเช็คเพื่อไม่ให้ซ้ำ  
  const existingNames \= new Set();  
  if (masterSheet.getLastRow() \> 1\) {  
    masterSheet.getRange(2, CONFIG.COL\_NAME, masterSheet.getLastRow() \- 1, 1\)  
      .getValues().forEach(r \=\> { if (r\[0\]) existingNames.add(normalizeText(r\[0\])); });  
  }

  // 2\. อ่านข้อมูลจาก Source (ปรับ Index ตามโครงสร้างชีต SCGนครหลวงJWDภูมิภาค ของคุณ)  
  // สมมติว่าโครงสร้างเหมือน V4 เดิม (ชื่ออยู่ Col 13, Lat Col 15, Lng Col 16\)  
  const sData \= sourceSheet.getRange(2, 1, lastRowS \- 1, 25).getValues();  
  const newEntries \= \[\];  
  const currentBatch \= new Set();

  sData.forEach(row \=\> {  
    const name \= row\[12\]; // Col M (Index 12\)  
    const lat \= row\[14\];  // Col O (Index 14\)  
    const lng \= row\[15\];  // Col P (Index 15\)  
      
    if (\!name || \!lat || \!lng) return;  
      
    const clean \= normalizeText(name);  
    if (\!existingNames.has(clean) && \!currentBatch.has(clean)) {  
      const newRow \= new Array(17).fill("");  
      newRow\[CONFIG.C\_IDX.NAME\] \= name;  
      newRow\[CONFIG.C\_IDX.LAT\] \= lat;  
      newRow\[CONFIG.C\_IDX.LNG\] \= lng;  
      newRow\[CONFIG.C\_IDX.SYS\_ADDR\] \= row\[18\]; // Col S (ที่อยู่จากระบบ)  
      newRow\[CONFIG.C\_IDX.UUID\] \= generateUUID();  
      newRow\[CONFIG.C\_IDX.CREATED\] \= new Date();  
      newRow\[CONFIG.C\_IDX.UPDATED\] \= new Date();  
        
      newEntries.push(newRow);  
      currentBatch.add(clean);  
    }  
  });

  if (newEntries.length \> 0\) {  
    masterSheet.getRange(masterSheet.getLastRow() \+ 1, 1, newEntries.length, 17).setValues(newEntries);  
    ui.alert("✅ สะสมข้อมูลใหม่จาก " \+ CONFIG.SOURCE\_SHEET \+ " ลง Database สำเร็จ: " \+ newEntries.length \+ " รายการ");  
  } else {  
    ui.alert("👌 ฐานข้อมูลเป็นปัจจุบันแล้ว (ไม่มีรายชื่อใหม่จาก " \+ CONFIG.SOURCE\_SHEET \+ ")");  
  }  
}  
สรุปการใช้งาน:  
สะสมข้อมูล: เมื่อคุณมีข้อมูลใหม่ในชีต SCGนครหลวงJWDภูมิภาค ให้กดรันฟังก์ชัน syncNewDataToMaster() ระบบจะดึงรายชื่อที่ยังไม่เคยมีไปเก็บไว้ใน Database ให้เองครับ  
แสดงผลรายวัน: เมื่อคุณรัน fetchDataFromSCGJWD() ในชีต Data ระบบจะไปดึงพิกัดที่เคยสะสมไว้ใน Database มาแสดงผลให้ทันที (ผ่านฟังก์ชัน applyMasterCoordinatesToDailyJob())  
ด้วยวิธีนี้ ข้อมูลใน Database ของคุณจะค่อยๆ เพิ่มขึ้นและแม่นยำขึ้นเรื่อยๆ โดยอ้างอิงจากแหล่งข้อมูลที่คุณเชื่อถือที่สุดครับ\! หากต้องการให้ปรับแก้จุดไหนเพิ่มเติม แจ้งได้เลยครับ