ขอบคุณที่อธิบายความต้องการแบบละเอียด\! ผมเข้าใจระบบของคุณแล้ว นี่คือการวิเคราะห์อย่างลึกซึ้งและแนวทางการปรับปรุงที่ครอบคลุม:

\---

\# 📊 \*\*การวิเคราะห์ระบบ LMDS v4.1 ของคุณ\*\*

\#\# \*\*ส่วนที่ 1: สรุปการทำงานปัจจุบัน\*\*

ระบบของคุณแยกออกเป็น \*\*2 กระบวนการหลัก\*\*:

\#\#\# \*\*กระบวนการที่ 1: SCG Data Pipeline (Daily Operation)\*\*  
\`\`\`  
Input Sheet (Cookie \+ Shipment)   
    ↓  
fetchDataFromSCGJWD() \[Service\_SCG.gs\]  
    ↓  
SCG API → Data Sheet ✅  
    ↓  
applyMasterCoordinatesToDailyJob() → ค้นหาพิกัด  
    ↓  
Data Sheet \+ สรุป\_เจ้าของสินค้า \+ สรุป\_Shipment  
\`\`\`

\#\#\# \*\*กระบวนการที่ 2: Master Database Management (SCGนครหลวงJWDภูมิภาค)\*\*  
\`\`\`  
SCGนครหลวงJWDภูมิภาค (ข้อมูล GPS จริงจากคนขับ)  
    ↓  
syncNewDataToMaster() \[Service\_Master.gs\]  
    ↓  
ตรวจสอบซ้ำ → Database Sheet  
    ↓  
GPS\_Queue (รอ Admin อนุมัติ)  
\`\`\`

\---

\#\# \*\*ส่วนที่ 2: วิเคราะห์โค้ด & ปัญหาทั้ง 8 ข้อ\*\*

\#\#\# \*\*🔍 ปัญหาที่วิเคราะห์ได้จากโค้ด:\*\*

\`\`\`javascript  
// ❌ ปัญหา: normalizeText() ในไฟล์หลายตัว  
function normalizeText(text) {  
  return String(text)  
    .toLowerCase()  
    .trim()  
    .replace(/\\s+/g, ' ') // ← ปัญหา: "abc  def" → "abc def" ยังถือว่าต่างกัน  
}

// ❌ ปัญหา: ข้อมูล GPS จากแหล่งต่างๆมีความแม่นยำต่าง  
// SCG System: 14.164688, 100.625354  
// Driver GPS: 14.164689, 100.625355  ← 0-5 เมตร ต่างกัน  
// Database:   14.164700, 100.625300  ← 10+ เมตร ต่างกัน

// ❌ ปัญหา: UUID ซ้ำจากการ merge ไม่สะอาด  
if (uuidNameIndex\[uuid\]) {  
  conflicts.push("UUID ซ้ำ: " \+ uuid); // ← รายงานแต่ไม่แก้  
}  
\`\`\`

\---

\#\# \*\*🎯 การแก้ไขปัญหา 8 ข้อ \- แนวทางแบบ Holistic\*\*

\#\#\# \*\*1️⃣ ปัญหา: ชื่อบุคคลซ้ำกัน\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: ใช้ normalized name เท่านั้น  
existingNames\[normalizeText(name)\] \= i;

// ❌ ปัญหา: "นาย ก" vs "นายก" → ซ้ำกัน  
// ❌ ปัญหา: "abc\_def-123" vs "abc def 123" → ต่างกัน  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution: Fuzzy Matching \+ Levenshtein Distance  
function isSimilarEnough(name1, name2, threshold \= 0.85) {  
  const dist \= levenshteinDistance(  
    normalizeText(name1),  
    normalizeText(name2)  
  );  
  const maxLen \= Math.max(name1.length, name2.length);  
  const similarity \= 1 \- (dist / maxLen);  
  return similarity \>= threshold;  
}

// ✅ Solution: ลบ non-alphanumeric characters ก่อน  
function deepNormalize(text) {  
  return normalizeText(text)  
    .replace(/\[^\\u0E00-\\u0E7F\\u0030-\\u0039a-z0-9\]/g, '') // เก็บแต่ไทย+ตัวเลข+อังกฤษ  
    .replace(/\\s+/g, '');  
}  
\`\`\`

\---

\#\#\# \*\*2️⃣ ปัญหา: ชื่อสถานที่อยู่ซ้ำ\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: ใช้ normalizeText(name) ตรงๆ  
// ❌ "ร้าน ABC" vs "ร้าน ABC สาขา 1" → ต่างกัน  
// ❌ "Chiang Mai" vs "CHIANG MAI" → ต่างกัน  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution 1: Trie-based Duplicate Detection  
class AddressTrieDB {  
  constructor() {  
    this.trie \= {};  
    this.signatures \= {}; // hash → UUID map  
  }  
    
  addAddress(name, uuid) {  
    const sig \= this.generateSignature(name);  
    if (this.signatures\[sig\] && this.signatures\[sig\] \!== uuid) {  
      return { isDuplicate: true, conflictUUID: this.signatures\[sig\] };  
    }  
    this.signatures\[sig\] \= uuid;  
    return { isDuplicate: false };  
  }  
    
  generateSignature(text) {  
    // ตัดคำสถานที่ออกแล้วหา hash  
    const tokens \= text  
      .split(/\[,\\/\\\\|\]+/)  
      .map(t \=\> deepNormalize(t))  
      .filter(t \=\> t.length \> 2\)  
      .sort();  
    return Utilities.computeDigest(  
      Utilities.DigestAlgorithm.SHA\_256,  
      tokens.join('|')  
    );  
  }  
}

// ✅ Solution 2: Geographic Clustering (ถ้ามีพิกัด)  
if (hasCoordinates) {  
  const existingInArea \= findNearbyPlaces(lat, lng, radiusMeter \= 100);  
  // ถ้าพบชื่อคล้ายกันในพื้นที่ 100 เมตร → ถือว่าซ้ำกัน  
}  
\`\`\`

\---

\#\#\# \*\*3️⃣ ปัญหา: Lat/Long ซ้ำกัน\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: มี GPS\_Queue แต่ไม่มีการ merge UUID  
queueEntries.push(\[ts, name, dbUUID, ...\]);  
// → Queue อยู่แต่ไม่รู้ว่า UUID ซ้ำกับตัวไหน  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution: Spatial Hash Index  
class SpatialIndex {  
  constructor() {  
    this.grid \= {}; // "lat\_lng\_precision" → \[UUIDs\]  
    this.precision \= 5; // 5 decimal places ≈ 1 เมตร  
  }  
    
  addPoint(lat, lng, uuid) {  
    const key \= this.gridKey(lat, lng);  
    if (\!this.grid\[key\]) this.grid\[key\] \= \[\];  
      
    // ตรวจสอบ exact duplicates และ near-duplicates  
    const nearbyUUIDs \= this.grid\[key\];  
    if (nearbyUUIDs.includes(uuid)) {  
      return { status: 'EXACT\_DUPLICATE', conflictUUIDs: nearbyUUIDs };  
    }  
      
    // ตรวจสอบ radius (5 เมตร)  
    const dupeRadius \= this.findWithinRadius(lat, lng, meters \= 5);  
    if (dupeRadius.length \> 0\) {  
      return { status: 'NEAR\_DUPLICATE', conflictUUIDs: dupeRadius };  
    }  
      
    this.grid\[key\].push(uuid);  
    return { status: 'UNIQUE' };  
  }  
    
  gridKey(lat, lng) {  
    const p \= this.precision;  
    return Math.floor(lat \* Math.pow(10, p)) \+ "\_" \+   
           Math.floor(lng \* Math.pow(10, p));  
  }  
    
  findWithinRadius(lat, lng, meters) {  
    const radiusLat \= meters / 111000; // ≈ 1 degree latitude  
    const radiusLng \= meters / (111000 \* Math.cos(lat \* Math.PI / 180));  
      
    const results \= \[\];  
    for (let dlat \= \-1; dlat \<= 1; dlat++) {  
      for (let dlng \= \-1; dlng \<= 1; dlng++) {  
        const testKey \= this.gridKey(lat \+ dlat \* radiusLat, lng \+ dlng \* radiusLng);  
        if (this.grid\[testKey\]) results.push(...this.grid\[testKey\]);  
      }  
    }  
    return \[...new Set(results)\];  
  }  
}

// ✅ ใช้ใน syncNewDataToMaster()  
const spatialDB \= new SpatialIndex();  
dbData.forEach(r \=\> {  
  const result \= spatialDB.addPoint(r\[LAT\], r\[LNG\], r\[UUID\]);  
  if (result.status \!== 'UNIQUE') {  
    // ส่งเข้า Merge Queue  
  }  
});  
\`\`\`

\---

\#\#\# \*\*4️⃣ ปัญหา: บุคคลเดียวกันแต่ชื่อไม่เหมือนกัน (Spelling Variations)\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: NameMapping ใช้ UUID lookup  
if (aliasToUUID.hasOwnProperty(cleanName)) {  
  // → แต่ไม่มีกลไกหา spelling variants แบบอัตโนมัติ  
}  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution: n-gram based fuzzy matching \+ AI enhancement  
class NameVariationDetector {  
  constructor() {  
    this.variants \= {}; // canonical UUID → \[variant names\]  
  }  
    
  // แนวทาง A: Statistical n-gram matching  
  detectVariants(name1, name2) {  
    const ngrams1 \= this.extractNGrams(name1, n \= 3);  
    const ngrams2 \= this.extractNGrams(name2, n \= 3);  
      
    const intersection \= ngrams1.filter(ng \=\> ngrams2.includes(ng));  
    const union \= \[...new Set(\[...ngrams1, ...ngrams2\])\];  
      
    const jaccardIndex \= intersection.length / union.length;  
    return jaccardIndex \>= 0.65; // ≥65% similar  
  }  
    
  extractNGrams(text, n) {  
    const clean \= deepNormalize(text);  
    const grams \= \[\];  
    for (let i \= 0; i \<= clean.length \- n; i++) {  
      grams.push(clean.substring(i, i \+ n));  
    }  
    return grams;  
  }  
    
  // แนวทาง B: Gemini AI (ถ้ามี API budget)  
  async askAIForVariant(officialName, questionableName) {  
    const prompt \= \`  
      เป็นชื่อเดียวกันหรือไม่?  
      ชื่ออย่างเป็นทางการ: "${officialName}"  
      ชื่อรับคำถาม: "${questionableName}"  
        
      ตอบแค่ JSON: { "isSamePerson": true/false, "confidence": 0-100 }  
    \`;  
      
    const result \= await askGemini(prompt);  
    return result.isSamePerson && result.confidence \>= 85;  
  }  
    
  // แนวทาง C: Phonetic matching (สำหรับชื่อไทย)  
  getPhonetic(thaiBig5Name) {  
    // ใช้ Thai Romanization หรือ Soundex  
    // เช่น "นาย ชัชชวาล" \= "chatchawal"  
    const romanized \= convertToRomanization(thaiBig5Name);  
    return soundex(romanized);  
  }  
}

// ใช้ใน Service\_Master.gs  
const detector \= new NameVariationDetector();  
const fuzzyMatches \= dbData.filter(r \=\>   
  detector.detectVariants(newName, r\[NAME\]) ||  
  detector.getPhonetic(newName) \=== detector.getPhonetic(r\[NAME\])  
);

if (fuzzyMatches.length \> 0\) {  
  // ส่งให้ Admin ยืนยัน หรือใช้ AI ทันที  
}  
\`\`\`

\---

\#\#\# \*\*5️⃣ ปัญหา: บุคคลคนละชื่อ แต่สถานที่อยู่เดียวกัน\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: Match ตาม name หรือ GPS แยกกัน  
// ❌ ไม่มีตรรมชาติเชื่อมโยง name \+ address together  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution: Composite Key with Address Deduplication  
class AddressAnomalyDetector {  
  constructor() {  
    this.addressToNames \= {}; // normalized\_address → Set\[names\]  
  }  
    
  detectMultipleNamesAtSameAddress(records) {  
    const anomalies \= \[\];  
      
    records.forEach(r \=\> {  
      const addrKey \= this.normalizeAddress(r.address);  
      if (\!this.addressToNames\[addrKey\]) {  
        this.addressToNames\[addrKey\] \= new Set();  
      }  
        
      this.addressToNames\[addrKey\].add(r.name);  
    });  
      
    // หา address ที่มี ≥2 ชื่อต่างกัน  
    Object.entries(this.addressToNames).forEach((\[addr, names\]) \=\> {  
      if (names.size \>= 2\) {  
        anomalies.push({  
          type: 'MULTIPLE\_NAMES\_SAME\_ADDRESS',  
          address: addr,  
          names: Array.from(names),  
          suspectMerge: names.size \>= 3 ? 'LIKELY' : 'POSSIBLE'  
        });  
      }  
    });  
      
    return anomalies;  
  }  
    
  normalizeAddress(addr) {  
    if (\!addr) return '';  
      
    // แยก address ออกเป็น components  
    const parts \= addr.split(/\[,\\/\]/);  
    const tokens \= parts  
      .map(p \=\> deepNormalize(p).replace(/^(no|no\\.|หมายเลข|เลขที่)/i, ''))  
      .filter(p \=\> p.length \> 2\)  
      .sort();  
      
    return tokens.join('|');  
  }  
}

// ใช้ใน syncNewDataToMaster()  
const detector \= new AddressAnomalyDetector();  
const anomalies \= detector.detectMultipleNamesAtSameAddress(allRecords);

anomalies.forEach(anom \=\> {  
  // ตัวเลือก 1: ส่งเข้า Manual Review Queue  
  // ตัวเลือก 2: ใช้ AI เพื่อขอ cluster names เหล่านี้  
  // ตัวเลือก 3: Mark เป็น SUSPECTED\_MERGE (แต่ไม่ merge โดยอัตโนมัติ)  
});  
\`\`\`

\---

\#\#\# \*\*6️⃣ ปัญหา: บุคคลชื่อเดียวกัน แต่สถานที่อยู่ไม่เหมือนกัน\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: Match ตาม NAME แล้วทะเลาะกับ ADDRESS  
if (existingNames.hasOwnProperty(cleanName)) {  
  // ← assume ชื่อเดียวกัน \= คนเดียวกัน ❌  
}  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution: Name-Address Validation  
class PersonIdentityEngine {  
  constructor() {  
    this.identities \= \[\]; // { uuid, name, addresses\[\], confidenceScore }  
  }  
    
  canMergeByName(name1, name2, address1, address2, lat1, lng1, lat2, lng2) {  
    // Step 1: Name similarity  
    if (\!this.areNamesSimilar(name1, name2)) return false;  
      
    // Step 2: Address similarity (if available)  
    const addressScore \= this.addressSimilarity(address1, address2);  
    const gpsScore \= this.gpsSimilarity(lat1, lng1, lat2, lng2);  
      
    // Step 3: Composite decision  
    // \- ถ้าชื่อเหมือน \+ (address เหมือน OR GPS \< 100m) → SAFE\_MERGE  
    // \- ถ้าชื่อเหมือน \+ address เหมือน \+ GPS \> 100m → SUSPECT (ส่งตรวจสอบ)  
    // \- ถ้าชื่อเหมือน \+ address ต่างกัน \+ GPS ต่างกันมาก → DANGEROUS (ไม่ merge)  
      
    const addressMatch \= addressScore \>= 0.8;  
    const gpsMatch \= gpsScore \>= 0.95; // \< 100 meters  
      
    if (addressMatch || gpsMatch) {  
      return { canMerge: true, confidence: 95 };  
    }  
      
    if (addressScore \>= 0.6 && gpsScore \>= 0.8) {  
      return { canMerge: false, reason: 'REVIEW\_NEEDED', confidence: 60 };  
    }  
      
    return { canMerge: false, confidence: 0 };  
  }  
    
  addressSimilarity(addr1, addr2) {  
    if (\!addr1 || \!addr2) return 0;  
      
    const normalized1 \= this.normalizeAddress(addr1);  
    const normalized2 \= this.normalizeAddress(addr2);  
      
    // เก็บแค่ 3-5 token สำคัญที่สุด (street \+ district \+ province)  
    const key1 \= normalized1.split('|').slice(-3).join('|');  
    const key2 \= normalized2.split('|').slice(-3).join('|');  
      
    return this.stringSimilarity(key1, key2);  
  }  
    
  gpsSimilarity(lat1, lng1, lat2, lng2) {  
    const dist \= getHaversineDistanceKM(lat1, lng1, lat2, lng2) \* 1000; // เมตร  
      
    // dist \= 0m → 100%, dist \= 500m → 0%  
    return Math.max(0, 1 \- (dist / 500));  
  }  
    
  stringSimilarity(s1, s2) {  
    // Jaro-Winkler or Levenshtein  
    const lev \= levenshteinDistance(s1, s2);  
    const maxLen \= Math.max(s1.length, s2.length);  
    return 1 \- (lev / maxLen);  
  }  
}  
\`\`\`

\---

\#\#\# \*\*7️⃣ ปัญหา: บุคคลชื่อเดียวกัน แต่ Lat/Long ต่างกัน\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: match by name แล้วเก็บแค่ UUID  
// ❌ ไม่รู้ว่า "นาย ก" ไปส่งของแต่ละวัน location ต่างกันเนื่องจาก:  
// \- คนละที่สำนักงาน (เปลี่ยนงาน)  
// \- ใช้ phone GPS ที่ไม่แม่นยำ  
// \- ส่งข้อมูลจากจุดอื่น (คลังสินค้า)  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution: Temporal \+ Spatial Clustering  
class DynamicPersonProfile {  
  constructor() {  
    this.profiles \= {}; // uuid → { name, primaryLoc, alternateLocations\[\], metadata }  
  }  
    
  registerOrUpdate(uuid, name, lat, lng, timestamp, context \= {}) {  
    if (\!this.profiles\[uuid\]) {  
      this.profiles\[uuid\] \= {  
        uuid: uuid,  
        name: name,  
        primaryLocation: { lat, lng, timestamp, frequency: 1 },  
        alternateLocations: \[\],  
        history: \[{ lat, lng, timestamp, context }\],  
        metadata: {}  
      };  
      return;  
    }  
      
    const profile \= this.profiles\[uuid\];  
    const distToPrimary \= getHaversineDistanceKM(  
      lat, lng,  
      profile.primaryLocation.lat,  
      profile.primaryLocation.lng  
    ) \* 1000; // convert to meters  
      
    // Step 1: ถ้า GPS ประมาณว่า location เดียวกัน (\< 100m) → อัปเดต frequency  
    if (distToPrimary \< 100\) {  
      profile.primaryLocation.frequency \+= 1;  
      profile.primaryLocation.timestamp \= timestamp; // update last seen  
      return;  
    }  
      
    // Step 2: ถ้า GPS ต่างกัน 100-500m → alternate location (ทำงานหลายที่)  
    const altLoc \= profile.alternateLocations.find(alt \=\>  
      getHaversineDistanceKM(lat, lng, alt.lat, alt.lng) \* 1000 \< 100  
    );  
      
    if (altLoc) {  
      altLoc.frequency \+= 1;  
      altLoc.timestamp \= timestamp;  
    } else {  
      profile.alternateLocations.push({  
        lat, lng, timestamp, frequency: 1, context  
      });  
    }  
      
    profile.history.push({ lat, lng, timestamp, context });  
      
    // Step 3: ตรวจสอบ Anomaly  
    if (profile.alternateLocations.length \> 3\) {  
      // ⚠️ ส่งแจ้งเตือน: คนนี้มี location เกิน 3 ที่ → อาจเป็นข้อมูลผิด หรือหลายคน?  
      this.flagForReview(uuid, 'MULTIPLE\_LOCATIONS');  
    }  
  }  
    
  getRecommendedLocation(uuid, context \= {}) {  
    const profile \= this.profiles\[uuid\];  
    if (\!profile) return null;  
      
    // ถ้า context เกี่ยวกับจังหวัด/สาขา → ส่งคืน alternate location ที่เกี่ยวข้อง  
    if (context.province) {  
      const alt \= profile.alternateLocations.find(a \=\>  
        this.getProvinceFromCoords(a.lat, a.lng) \=== context.province  
      );  
      if (alt && alt.frequency \>= 2\) return { lat: alt.lat, lng: alt.lng };  
    }  
      
    // Default: primary location  
    return {  
      lat: profile.primaryLocation.lat,  
      lng: profile.primaryLocation.lng,  
      confidence: Math.min(100, profile.primaryLocation.frequency \* 20\)  
    };  
  }  
    
  flagForReview(uuid, reason) {  
    // ส่งเข้า GPS\_Queue เพื่อ Admin ตรวจสอบ  
    // หรือส่งเข้า AI เพื่อวิเคราะห์  
  }  
}

// ใช้ใน Service\_Master.gs  
const personProfiles \= new DynamicPersonProfile();

// ทุกครั้งที่มีข้อมูลมา  
srcDataArray.forEach(r \=\> {  
  personProfiles.registerOrUpdate(  
    r.uuid || generateUUID(),  
    r.name,  
    r.lat, r.lng,  
    new Date(r.timestamp),  
    { source: 'SCG\_API', invoiceNo: r.invoiceNo }  
  );  
});

// Query  
const recommendedLoc \= personProfiles.getRecommendedLocation(uuid, { province: 'Bangkok' });  
\`\`\`

\---

\#\#\# \*\*8️⃣ ปัญหา: บุคคลคนละชื่อ แต่ Lat/Long เดียวกัน\*\*

\*\*ต้นเหตุ:\*\*  
\`\`\`javascript  
// ปัจจุบัน: ไม่มีการตรวจสอบ "หลายชื่อที่สถานที่เดียว"  
// ❌ "ร้านหลวง" vs "ร้าน หลวง" vs "ร้านหลวงจำหน่าย" → สถานที่เดียว แต่ชื่อต่าง  
\`\`\`

\*\*แนวทางการแก้:\*\*  
\`\`\`javascript  
// ✅ Solution: Business Entity Deduplication  
class BusinessEntityDB {  
  constructor() {  
    this.locationIndex \= {}; // "lat,lng" (3 decimal places) → { canonicalName, aliases, uuids }  
  }  
    
  registerBusinessAtLocation(name, lat, lng, uuid, source \= 'SYSTEM') {  
    const locKey \= this.getLocationKey(lat, lng);  
      
    if (\!this.locationIndex\[locKey\]) {  
      this.locationIndex\[locKey\] \= {  
        canonicalName: name,  
        aliases: new Set(\[name\]),  
        uuids: new Set(\[uuid\]),  
        sources: \[source\],  
        lastUpdate: new Date()  
      };  
      return { status: 'NEW', uuid };  
    }  
      
    const existing \= this.locationIndex\[locKey\];  
      
    // Step 1: ตรวจว่าชื่อนี้เป็น alias ของชื่ออยู่แล้วหรือ  
    const isSameName \= Array.from(existing.aliases).some(alias \=\>  
      this.areSimilarBusinessNames(name, alias)  
    );  
      
    if (isSameName) {  
      // ✅ นี่เป็นชื่อของ entity เดียวกัน  
      existing.aliases.add(name);  
      if (source \=== 'DRIVER\_GPS') {  
        existing.canonicalName \= name; // update ชื่อจากที่มา  
      }  
      return { status: 'MATCHED\_EXISTING', uuid: Array.from(existing.uuids)\[0\] };  
    }  
      
    // Step 2: ชื่อต่างกัน แต่สถานที่เดียว → ตัวเลือก  
    if (existing.uuids.size \=== 1\) {  
      // ⚠️ SUSPECT\_DUPLICATE (เช่น ร้านเหล้า vs ร้านอาหาร ที่สถานที่เดียว)  
      return {  
        status: 'POTENTIAL\_DUPLICATE',  
        existingUUID: Array.from(existing.uuids)\[0\],  
        existingName: existing.canonicalName,  
        newName: name,  
        action: 'MANUAL\_REVIEW' // Admin ต้องตรวจสอบว่าชื่อเดียวกันมั้ย  
      };  
    } else {  
      // หลายชื่อที่สถานที่เดียว → อาจเป็น mall หรือ building complex  
      return {  
        status: 'COMPLEX\_LOCATION',  
        existingNames: Array.from(existing.aliases),  
        newName: name,  
        action: 'ASK\_ADMIN' // "สถานที่นี้มี \> 1 ชื่อธุรกิจจริงหรือ?"  
      };  
    }  
  }  
    
  areSimilarBusinessNames(name1, name2) {  
    const n1 \= this.normalizeBusinessName(name1);  
    const n2 \= this.normalizeBusinessName(name2);  
      
    // ตัดคำ "ร้าน", "ร้านค้า", "บริษัท" ออก  
    const cleaned1 \= n1  
      .replace(/^(ร้าน|ร้านค้า|บริษัท|ห้างหุ้นส่วน|สำนักงาน|สาขา|shop|store|company)/i, '')  
      .trim();  
    const cleaned2 \= n2  
      .replace(/^(ร้าน|ร้านค้า|บริษัท|ห้างหุ้นส่วน|สำนักงาน|สาขา|shop|store|company)/i, '')  
      .trim();  
      
    // เทียบเฉพาะส่วน "ชื่อหลัก" (core name)  
    const similarity \= stringSimilarity(cleaned1, cleaned2);  
    return similarity \>= 0.9; // 90% match  
  }  
    
  normalizeBusinessName(name) {  
    return deepNormalize(name)  
      .replace(/\[\\u0E31-\\u0E3A\]/g, '') // ลบ Thai diacritics  
      .replace(/\\s+/g, ' ');  
  }  
    
  getLocationKey(lat, lng) {  
    // Precision \= 3 decimal places ≈ 100 เมตร  
    return Math.round(lat \* 1000\) / 1000 \+ "," \+ Math.round(lng \* 1000\) / 1000;  
  }  
}

// ใช้  
const businessDB \= new BusinessEntityDB();

srcData.forEach(r \=\> {  
  const result \= businessDB.registerBusinessAtLocation(  
    r.shipToName, r.lat, r.lng, generateUUID(), 'SCG\_API'  
  );  
    
  if (result.status \=== 'POTENTIAL\_DUPLICATE') {  
    // ส่งเข้า GPS\_Queue ให้ Admin ปักหมุด  
    queueForAdminReview({  
      type: 'DUPLICATE\_CHECK',  
      existing: result.existingName,  
      new: result.newName,  
      location: \`${r.lat}, ${r.lng}\`,  
      action: 'DECIDE\_IF\_SAME\_ENTITY'  
    });  
  }  
});  
\`\`\`

\---

\#\# \*\*🗂️ สรุปโครงสร้างฐานข้อมูลที่แนะนำ\*\*

ถ้าฉันเป็นเจ้าโปรเจคนี้ ฉันจะออกแบบแบบนี้:

\`\`\`  
┌─────────────────────────────────────────────────────────┐  
│           MASTER DATABASE ARCHITECTURE                  │  
├─────────────────────────────────────────────────────────┤

1️⃣ CANONICAL TABLE (ชีต "Database")  
   ├─ Core Fields  
   │  ├─ \[A\] UUID (Primary Key) ✅ Immutable  
   │  ├─ \[B\] Name\_Canonical (ชื่อที่ verified)  
   │  ├─ \[C-D\] Lat/Lng (Primary Location)  
   │  └─ \[E\] Quality\_Score (0-100%)  
   │  
   ├─ Metadata  
   │  ├─ \[F\] Record\_Status (ACTIVE|MERGED|DELETED|DISPUTED)  
   │  ├─ \[G\] Merged\_To\_UUID (ถ้า MERGED)  
   │  ├─ \[H\] Created\_At  
   │  ├─ \[I\] Updated\_At  
   │  ├─ \[J\] Data\_Source (SCG\_API|DRIVER\_GPS|MANUAL)  
   │  └─ \[K\] Confidence\_Score  
   │  
   └─ Enrichment  
      ├─ \[L\] Address\_Google  
      ├─ \[M-O\] Province/District/Postcode  
      ├─ \[P\] Distance\_From\_Depot\_KM  
      └─ \[Q\] Last\_Delivery\_Date

2️⃣ NAME VARIANTS TABLE (ชีต "NameMapping")  
   ├─ \[A\] Variant\_Name (ชื่อทั้งหมดที่เห็นแล้ว)  
   ├─ \[B\] Master\_UUID (ชี้ไปยัง canonical record)  
   ├─ \[C\] Confidence\_Score (90-100%)  
   ├─ \[D\] Detection\_Method (FUZZY\_MATCH|AI|HUMAN|PHONETIC)  
   └─ \[E\] Last\_Updated

3️⃣ ALTERNATE LOCATIONS TABLE (ชีต "LocationVariants" — NEW)  
   ├─ \[A\] UUID (reference to Database)  
   ├─ \[B\] Alternate\_Lat/Lng  
   ├─ \[C\] Location\_Type (PRIMARY|WAREHOUSE|BRANCH|OFFICE)  
   ├─ \[D\] Frequency (กี่ครั้งที่เห็น)  
   ├─ \[E\] Last\_Seen\_Date  
   └─ \[F\] Confidence\_Score

4️⃣ SPATIAL DUPLICATES QUEUE (ชีต "DuplicateQueue" — NEW)  
   ├─ \[A\] Timestamp  
   ├─ \[B\] Conflict\_Type (SAME\_NAME|SAME\_LOCATION|SAME\_GPS|...)  
   ├─ \[C\] UUID\_1  
   ├─ \[D\] UUID\_2 (or NULL if new record)  
   ├─ \[E\] Reason  
   ├─ \[F\] Admin\_Decision (NULL|MERGE|KEEP\_SEPARATE|DELETE)  
   └─ \[G\] Resolved\_By / Resolved\_At

5️⃣ SYNC CHECKPOINT (ชีต "SyncState" — NEW)  
   ├─ \[A\] Source\_Sheet  
   ├─ \[B\] Last\_Row\_Processed  
   ├─ \[C\] Last\_Sync\_Timestamp  
   ├─ \[D\] Status (SUCCESS|PARTIAL|ERROR)  
   ├─ \[E\] Error\_Message  
   └─ \[F\] Retry\_Count  
\`\`\`

\---

\#\# \*\*🔧 ขั้นตอนการสร้างฐานข้อมูลใหม่ที่แข็งแกร่ง\*\*

\#\#\# \*\*Phase 1: Data Cleanup (สัปดาห์ที่ 1-2)\*\*

\`\`\`javascript  
// Step 1: วิเคราะห์ข้อมูลปัจจุบัน  
function analyzeCurrentData() {  
  const db \= SpreadsheetApp.getActiveSpreadsheet()  
    .getSheetByName('Database');  
  const data \= db.getRange(2, 1, db.getLastRow() \- 1, 22).getValues();  
    
  const report \= {  
    totalRecords: data.length,  
    duplicateNames: 0,  
    duplicateLocations: 0,  
    duplicateGPS: 0,  
    naMissingGPS: 0,  
    lowQuality: 0,  
    issues: \[\]  
  };  
    
  // analyze...  
  return report;  
}

// Step 2: Migrate เป็น schema ใหม่  
function migrateToNewSchema() {  
  // Create new Database sheet with 22 columns  
  // Copy core data  
  // Generate UUIDs สำหรับแถวที่ไม่มี  
  // Calculate quality scores  
}

// Step 3: Deduplication Pass 1 — Exact Duplicates  
function cleanExactDuplicates() {  
  // Name exact match \+ GPS exact match → MERGE  
}

// Step 4: Deduplication Pass 2 — Fuzzy Duplicates  
function cleanFuzzyDuplicates() {  
  // Name fuzzy match \+ GPS within 100m → QUEUE\_FOR\_REVIEW  
}

// Step 5: Deduplication Pass 3 — Data Quality  
function improveDataQuality() {  
  // Call Google Geocoding API  
  // Extract Province/District/Postcode  
  // Calculate Quality Score  
}  
\`\`\`

\---

\#\#\# \*\*Phase 2: Real-time Validation (สัปดาห์ที่ 3-4)\*\*

\`\`\`javascript  
// ทรกั sync ใหม่ที่มี validation  
function syncNewDataToMaster\_v2() {  
  const spatialDB \= new SpatialIndex();  
  const nameVariants \= new NameVariationDetector();  
  const businessDB \= new BusinessEntityDB();  
  const personProfiles \= new DynamicPersonProfile();  
    
  // Load existing data  
  const existingRecords \= loadDatabaseAsObjects();  
  existingRecords.forEach(r \=\> {  
    spatialDB.addPoint(r.lat, r.lng, r.uuid);  
    personProfiles.registerOrUpdate(r.uuid, r.name, r.lat, r.lng, r.updated);  
  });  
    
  // Process new data  
  const newRecords \= sourceSheet.getRange(...).getValues();  
    
  const results \= {  
    added: \[\],  
    merged: \[\],  
    queued: \[\],  
    errors: \[\]  
  };  
    
  newRecords.forEach(r \=\> {  
    try {  
      const name \= r\[NAME\_COL\];  
      const lat \= parseFloat(r\[LAT\_COL\]);  
      const lng \= parseFloat(r\[LNG\_COL\]);  
        
      // Validation 1: GPS Check  
      const spatialResult \= spatialDB.addPoint(lat, lng, null);  
      if (spatialResult.status \=== 'NEAR\_DUPLICATE') {  
        results.queued.push({  
          record: r,  
          reason: 'GPS\_NEAR\_DUPLICATE',  
          conflictUUIDs: spatialResult.conflictUUIDs  
        });  
        return;  
      }  
        
      // Validation 2: Name Check  
      const nameMatches \= nameVariants.detectVariants(name, ...);  
      if (nameMatches.length \> 0\) {  
        results.queued.push({  
          record: r,  
          reason: 'NAME\_VARIANT\_DETECTED',  
          potentialMatches: nameMatches  
        });  
        return;  
      }  
        
      // Validation 3: Business Entity Check  
      const businessResult \= businessDB.registerBusinessAtLocation(name, lat, lng, null);  
      if (businessResult.status \=== 'POTENTIAL\_DUPLICATE') {  
        results.queued.push({  
          record: r,  
          reason: 'BUSINESS\_DUPLICATE',  
          existingBusiness: businessResult.existingName  
        });  
        return;  
      }  
        
      // ✅ All checks passed → ADD as new record  
      results.added.push({  
        uuid: generateUUID(),  
        record: r  
      });  
        
    } catch (e) {  
      results.errors.push({ record: r, error: e.message });  
    }  
  });  
    
  return results;  
}  
\`\`\`

\---

\#\#\# \*\*Phase 3: Ongoing Maintenance (Weekly)\*\*

\`\`\`javascript  
// Weekly automated checks  
function weeklyMaintenanceRoutine() {  
  const db \= loadDatabase();  
    
  // 1\. Check for data drift  
  const driftReport \= checkDataDrift();  
  if (driftReport.issues.length \> 0\) {  
    // Send alert to admin  
  }  
    
  // 2\. Recompute quality scores  
  recomputeAllQualityScores();  
    
  // 3\. Process GPS\_Queue (อนุมัติ/ปฏิเสธ)  
  processGPSQueueApprovals();  
    
  // 4\. Backup  
  createDailyBackup();  
}  
\`\`\`

\---

\#\# \*\*📋 สรุปคำแนะนำปลายน้อย\*\*

| ปัญหา | สาเหตุ | วิธีแก้ | ลำดับความสำคัญ |  
|------|--------|--------|----------------|  
| 1️⃣ ชื่อบุคคลซ้ำ | Fuzzy matching ไม่เพียงพอ | Levenshtein \+ Gemini AI | 🔴 CRITICAL |  
| 2️⃣ สถานที่ซ้ำ | Normalization ไม่ดี | Trie-based \+ signature hash | 🔴 CRITICAL |  
| 3️⃣ GPS ซ้ำ | Spatial index ไม่มี | SpatialIndex class | 🔴 CRITICAL |  
| 4️⃣ Spelling variations | Alias lookup ไม่อัตโนมัติ | n-gram fuzzy \+ AI | 🟡 HIGH |  
| 5️⃣ หลายชื่อ \+ สถานที่ | ไม่มีระบบตรวจสอบ | AddressAnomalyDetector | 🟡 HIGH |  
| 6️⃣ ชื่อเดียว \+ สถานที่ต่าง | ไม่มี identity validation | PersonIdentityEngine | 🟡 HIGH |  
| 7️⃣ ชื่อเดียว \+ GPS ต่าง | ไม่มี temporal clustering | DynamicPersonProfile | 🟢 MEDIUM |  
| 8️⃣ หลายชื่อ \+ GPS เดียว | ไม่มี business dedup | BusinessEntityDB | 🟢 MEDIUM |

\---

\#\# \*\*🎯 ขั้นตอนถัดไป\*\*

1\. \*\*ส่วนหนึ่ง: ข้อมูล Deep Dive\*\*  
   \- หากคุณอัปโหลดตัวอย่างข้อมูลจริง ฉันสามารถให้ SQL queries ที่จะค้นหาปัญหาแบบตัดตัว

2\. \*\*ส่วนสอง: Implementation Code\*\*  
   \- ฉันจะเขียนไฟล์ \`Service\_Deduplication.gs\` ที่มี class ทั้งหมด พร้อม unit tests

3\. \*\*ส่วนสาม: Data Migration\*\*  
   \- ขั้นตอนการ migrate จากระบบปัจจุบันแบบปลอดภัยไม่หาย

คุณต้องการให้ผมลงลึกในส่วนไหนก่อนหรือครับ? 🚀  
