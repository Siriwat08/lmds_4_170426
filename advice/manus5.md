\# รายงานการวิเคราะห์ระบบ Logistics Master Data System (LMDS) V4.1 อย่างละเอียด

รายงานฉบับนี้เป็นการวิเคราะห์โครงสร้างซอฟต์แวร์ของโปรเจกต์ \*\*Claude LMDS V4.1\*\* ซึ่งเป็นระบบจัดการฐานข้อมูลพิกัดลูกค้าสำหรับการขนส่งของ SCG JWD โดยใช้ Google Apps Script (GAS) เป็นหลัก

\---

\#\# 1\. ภาพรวมของระบบ (System Overview)  
ระบบ LMDS V4.1 ถูกออกแบบมาเพื่อแก้ปัญหาความไม่ถูกต้องของพิกัดลูกค้าในระบบขนส่ง โดยมีกลไกหลัก 3 ส่วน:  
1\.  \*\*Master Data Engine\*\*: จัดเก็บและทำความสะอาดข้อมูลลูกค้า (Golden Record)  
2\.  \*\*Daily Operation\*\*: ดึงข้อมูลงานจาก SCG API และเติมพิกัดที่ถูกต้องให้โดยอัตโนมัติ  
3\.  \*\*AI & Automation\*\*: ใช้ Gemini AI ในการวิเคราะห์ชื่อร้านค้าที่พิมพ์ผิดและสร้างดัชนีการค้นหาอัจฉริยะ

\---

\#\# 2\. การวิเคราะห์รายโมดูล (Module-by-Module Analysis)

\#\#\# 📂 Configuration & Setup  
| ไฟล์ | หน้าที่และฟังก์ชันสำคัญ | การวิเคราะห์เชิงลึก |  
| :--- | :--- | :--- |  
| \`Config.gs\` | เก็บค่าคงที่, ดัชนีคอลัมน์, และการตั้งค่าระบบ | ใช้ \`PropertiesService\` เก็บ API Key เพื่อความปลอดภัย มีฟังก์ชัน \`validateSystemIntegrity\` ตรวจสอบความพร้อมของชีตก่อนเริ่มงาน |  
| \`Setup\_Security.gs\` | จัดการการตั้งค่า API Keys และ Tokens | มีฟังก์ชัน \`setupEnvironment\` สำหรับรับค่า Gemini Key และ \`setupLineToken\`/\`setupTelegramConfig\` สำหรับระบบแจ้งเตือน |  
| \`Setup\_Upgrade.gs\` | จัดการการอัปเกรดโครงสร้างชีต (Schema Migration) | มีฟังก์ชัน \`upgradeDatabaseStructure\` เพื่อเพิ่มคอลัมน์ใหม่ใน V4.1 และ \`findHiddenDuplicates\` ค้นหาข้อมูลซ้ำซ้อนเชิงพื้นที่ (Spatial Duplicates) |

\#\#\# 🧠 Core Services (Engine)  
\#\#\#\# \`Service\_Master.gs\` (หัวใจของระบบ)  
\*   \*\*\`syncNewDataToMaster()\`\*\*: ฟังก์ชันหลักในการนำข้อมูลจากคนขับ (Source) เข้าสู่ฐานข้อมูลหลัก มีระบบ \`LockService\` ป้องกันการเขียนทับ และระบบ \`GPS Feedback Loop\` ที่จะส่งพิกัดไปรอการอนุมัติหากพบว่าพิกัดจากคนขับต่างจากฐานข้อมูลเกิน 50 เมตร  
\*   \*\*\`runDeepCleanBatch\_100()\`\*\*: ระบบทำความสะอาดข้อมูลอัตโนมัติ โดยจะดึงที่อยู่จาก Google Maps (Reverse Geocoding), คำนวณระยะทางจากคลัง, และแยกจังหวัด/อำเภอ/รหัสไปรษณีย์  
\*   \*\*\`processClustering\_GridOptimized()\`\*\*: อัลกอริทึมจัดกลุ่มลูกค้าที่อยู่ใกล้กัน (Clustering) โดยใช้ Grid-based approach เพื่อลดภาระการคำนวณ และใช้ \`getBestName\_Smart\` เพื่อเลือกชื่อร้านที่เหมาะสมที่สุดเป็นชื่อหลัก

\#\#\#\# \`Service\_SCG.gs\` (การเชื่อมต่อภายนอก)  
\*   \*\*\`fetchDataFromSCGJWD()\`\*\*: เชื่อมต่อกับ SCG FSM API โดยใช้ Cookie และเลข Shipment เพื่อดึงข้อมูลงานรายวัน มีระบบ Retry อัตโนมัติหาก API ขัดข้อง  
\*   \*\*\`applyMasterCoordinatesToDailyJob()\`\*\*: นำพิกัดจากฐานข้อมูลหลักมาเติมในงานรายวัน โดยมีระบบ \`tryMatchBranch\_\` เพื่อจับคู่ร้านค้าสาขาย่อยกับร้านหลัก

\#\#\# 🔍 Search & Web Interface  
| ไฟล์ | การทำงาน |  
| :--- | :--- |  
| \`Service\_Search.gs\` | Backend ของระบบค้นหา ใช้ \`CacheService\` เก็บข้อมูล NameMapping เพื่อความรวดเร็ว (V4.1 แก้ไขปัญหา Cache ภาษาไทยด้วยการวัดขนาดเป็น Bytes) |  
| \`WebApp.gs\` | Controller ของ Web App จัดการ \`doGet\` เพื่อแสดงหน้าเว็บ และ \`doPost\` สำหรับรับ Webhook |  
| \`Index.html\` | Frontend ที่ใช้ Tailwind CSS และ FontAwesome ออกแบบมาให้ใช้งานง่ายบนมือถือ (Mobile-First) |

\#\#\# 🤖 AI & Automation  
\*   \*\*\`Service\_AutoPilot.gs\`\*\*: รันงานเบื้องหลังทุก 10 นาที เพื่ออัปเดตพิกัดงานรายวันและทำ AI Indexing  
\*   \*\*\`Service\_Agent.gs\`\*\*: ใช้ Gemini AI (Tier 4\) ในการจับคู่ชื่อร้านค้าที่ระบบปกติหาไม่เจอ (Smart Resolution) โดยส่งรายชื่อไปให้ AI วิเคราะห์ความน่าจะเป็น

\---

\#\# 3\. การวิเคราะห์โค้ดและอัลกอริทึมสำคัญ (Key Algorithms)

\#\#\# 3.1 การทำ Text Normalization (\`Utils\_Common.gs\`)  
ฟังก์ชัน \`normalizeText(text)\` ทำหน้าที่ลบคำฟุ่มเฟือย (Stop Words) เช่น "บริษัท", "จำกัด", "หจก.", "สาขา" และลบอักขระพิเศษออกทั้งหมด เพื่อให้เหลือเพียง "แก่นของชื่อ" สำหรับการเปรียบเทียบที่แม่นยำ

\#\#\# 3.2 ระบบให้คะแนนความเชื่อมั่น (Confidence & Quality Score)  
ระบบมีการคำนวณคะแนนใน \`recalculateAllConfidence\` และ \`recalculateAllQuality\`:  
\*   \*\*Confidence\*\*: ให้คะแนนตามแหล่งที่มา (เช่น ถ้ามาจาก Driver GPS จะได้คะแนนเพิ่ม) และสถานะการตรวจสอบ (Verified)  
\*   \*\*Quality\*\*: ให้คะแนนตามความครบถ้วนของข้อมูล (มีพิกัด, มีที่อยู่ Google, มีรหัสไปรษณีย์)

\#\#\# 3.3 การจัดการหน่วยความจำและ Cache (V4.1 Fix)  
ใน \`Service\_Search.gs\` มีการปรับปรุงการเก็บ Cache:  
\`\`\`javascript  
var byteSize \= Utilities.newBlob(jsonString).getBytes().length;  
if (byteSize \< 100000\) { ... }  
\`\`\`  
\> \*\*การวิเคราะห์\*\*: นี่เป็นการแก้ปัญหาที่สำคัญมากใน Google Apps Script เนื่องจาก \`CacheService\` จำกัดที่ 100KB แต่ตัวอักษรไทย 1 ตัวใช้พื้นที่ 3 Bytes การวัดด้วย \`.length\` แบบเดิมจะทำให้ Cache พังเมื่อมีข้อมูลภาษาไทยจำนวนมาก

\---

\#\# 4\. สรุปฟีเจอร์ใหม่ใน V4.1 (What's New in V4.1)  
1\.  \*\*GPS Feedback Loop\*\*: ระบบรับพิกัดจริงจากหน้างานผ่านคนขับ และมีหน้าจอ \`GPS\_Queue\` ให้ Admin อนุมัติก่อนอัปเดตฐานข้อมูล  
2\.  \*\*Schema Validator\*\*: ระบบตรวจสอบโครงสร้างชีตก่อนทำงาน เพื่อป้องกัน Error จากการลบคอลัมน์ผิด  
3\.  \*\*Soft Delete\*\*: การลบข้อมูลแบบไม่ทำลาย (Record\_Status \= 'Inactive') และระบบ \`Merged\_To\_UUID\` เพื่อเชื่อมโยงข้อมูลที่ซ้ำซ้อน  
4\.  \*\*AI Indexing\*\*: การใช้ Gemini สร้าง Keyword สำหรับการค้นหา (เช่น คำสะกดผิด, ตัวย่อ) เก็บไว้ในคอลัมน์ \`NORMALIZED\`

\---

\#\# 5\. ข้อเสนอแนะเชิงเทคนิค (Technical Recommendations)  
\*   \*\*Scalability\*\*: ระบบปัจจุบันโหลดข้อมูล Database เข้า Memory ทั้งหมด ซึ่งจะทำงานได้ดีจนถึงประมาณ 10,000 \- 20,000 แถว หากข้อมูลมากกว่านี้ควรพิจารณาใช้ระบบ Indexing ที่ซับซ้อนขึ้นหรือย้ายไปใช้ BigQuery  
\*   \*\*Security\*\*: การใช้ Cookie ในการดึงข้อมูล SCG API มีความเสี่ยงเรื่อง Session หมดอายุ ควรมีการแจ้งเตือนผ่าน LINE เมื่อ API ส่งค่า Error 401  
\*   \*\*Performance\*\*: การทำ Clustering แบบ Grid-optimized ช่วยได้มาก แต่การรัน \`DeepClean\` ทุก 100 แถวอาจจะช้าหากฐานข้อมูลใหญ่ขึ้น ควรปรับ Batch Size ตามความเหมาะสม

\---  
\*\*วิเคราะห์โดย: Manus AI\*\*  
\*\*วันที่: 22 มีนาคม 2026\*\*

