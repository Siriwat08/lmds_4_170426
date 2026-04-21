

| โมดูล | สิ่งที่เปลี่ยน | เหตุผล |
| ----- | ----- | ----- |
| **Config.gs** | เพิ่ม C\_IDX, MAP\_IDX computed helpers | แก้ off-by-one errors |
| **Utils\_Common.gs** | md5() fix null, Chunked Cache, Inverted Index, Trigram, Jaro-Winkler, createTimer(), isValidThaiCoords(), getRealLastRow\_() global | Performance \+ Bug fix |
| **Service\_GeoAddr.gs** | Daily quota guard ผ่าน PropertiesService | ป้องกัน Maps API bust |
| **Service\_Search.gs** | 4-Tier ใช้ Inverted Index O(1) | แทน O(n) linear scan |
| **Service\_Agent.gs** | Execution Budget Guard \+ Dynamic batch sizing | ป้องกัน 6-min timeout |
| **Service\_Notify.gs** | **Critical Fix:** ลบ `; [21], [8]` syntax error | Bug ใน V4.0 |
| **Service\_AutoPilot.gs** | ลบ `arguments.callee.caller` (deprecated) | Strict mode compat |
| **Service\_Master.gs** | Spatial Grid clustering, Rolling Backup 5 รุ่น | Performance \+ Safety |
| โมดูลอื่น | VERSION: 001 ทุกตัว | Module Versioning Rule |

ส่งออกไปยังชีต  
