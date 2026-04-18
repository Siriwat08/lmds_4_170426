โครงสร้างฐานข้อมูล (Google Sheets - 14 ชีต)

ระบบมีการเก็บข้อมูลแบ่งเป็น 14 ชีตหลัก (พร้อมรายละเอียดคอลัมน์):

1.Input: COOKIE, ShipmentNos

2.Data (ผลลัพธ์จากส่วนที่ 1): ID_งานประจำวัน, PlanDelivery, InvoiceNo, ShipmentNo, DriverName, TruckLicense, CarrierCode, CarrierName, SoldToCode, SoldToName, ShipToName, ShipToAddress, LatLong_SCG, MaterialName, ItemQuantity, QuantityUnit, ItemWeight, DeliveryNo, จำนวนปลายทาง_System, รายชื่อปลายทาง_System, ScanStatus, DeliveryStatus, Email พนักงาน, จำนวนสินค้ารวมของร้านนี้, น้ำหนักสินค้ารวมของร้านนี้, จำนวน_Invoice_ที่ต้องสแกน, LatLong_Actual, ชื่อเจ้าของสินค้า_Invoice_ที่ต้องสแกน, ShopKey

3.ข้อมูลพนักงาน: ID_พนักงาน, ชื่อ - นามสกุล, เบอร์โทรศัพท์, เลขที่บัตรประชาชน, ทะเบียนรถ, เลือกประเภทรถยนต์, Email พนักงาน, ROLE

4.สรุป_Shipment: ShipmentKey, ShipmentNo, TruckLicense, PlanDelivery, จำนวน_ทั้งหมด, จำนวน_E-POD_ทั้งหมด, LastUpdated

5.สรุป_เจ้าของสินค้า: SummaryKey, SoldToName, PlanDelivery, จำนวน_ทั้งหมด, จำนวน_E-POD_ทั้งหมด, LastUpdated

6.SCGนครหลวงJWDภูมิภาค (แหล่งข้อมูลดิบสำหรับส่วนที่ 2): head, ID_SCGนครหลวงJWDภูมิภาค, วันที่ส่งสินค้า, เวลาที่ส่งสินค้า, จุดส่งสินค้าปลายทาง, ชื่อ - นามสกุล, ทะเบียนรถ, Shipment No, Invoice No, รูปถ่ายบิลส่งสินค้า, รหัสลูกค้า, ชื่อเจ้าของสินค้า, ชื่อปลายทาง, Email พนักงาน, LAT, LONG, ID_Doc_Return, คลังสินค้า..., ที่อยู่ปลายทาง, รูปสินค้าตอนส่ง, รูปหน้าร้าน / บ้าน, หมายเหตุ, เดือน, ระยะทางจากคลัง_Km, ชื่อที่อยู่จาก_LatLong, SM_Link_SCG, ID_พนักงาน, พิกัดตอนกดบันทึกงาน, เวลาเริ่มกรอกงาน, เวลาบันทึกงานสำเร็จ, ระยะขยับจากจุดเริ่มต้น_เมตร, ระยะเวลาใช้งาน_นาที, ความเร็วการเคลื่อนที่_เมตร_นาที, ผลการตรวจสอบงานส่ง, เหตุผิดปกติที่ตรวจพบ, เวลาถ่ายรูปหน้าร้าน_หน้าบ้าน, SYNC_STATUS

7.Database (ฐานข้อมูลเป้าหมายที่ต้องการทำให้แข็งแกร่ง): NAME, LAT, LNG, SUGGESTED, CONFIDENCE, NORMALIZED, VERIFIED, SYS_ADDR, ADDR_GOOG, DIST_KM, UUID, PROVINCE, DISTRICT, POSTCODE, QUALITY, CREATED, UPDATED, Coord_Source, Coord_Confidence, Coord_Last_Updated, Record_Status, Merged_To_UUID

8.NameMapping (ชีตสำคัญสำหรับการแก้ชื่อซ้ำซ้อน): Variant_Name, Master_UID, Confidence_Score, Mapped_By, Timestamp

9.GPS_Queue (ระบบตรวจสอบพิกัดที่ผิดปกติ): Timestamp, ShipToName, UUID_DB, LatLng_Driver, LatLng_DB, Diff_Meters, Reason, Approve, Reject

10.PostalRef: postcode, subdistrict, district, province, province_code, district_code, lat, lng, notes

11.Blacklist: Name

12.SystemLogs: Timestamp, User, Action, Details

13.ErrorLogs: Timestamp, Function, Message, คอลัมน์ 1, คอลัมน์ 2

14.Dashboard: Metric, Value
