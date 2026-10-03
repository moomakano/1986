Thai TV PWA V4 Stable
เพิ่ม:
- Auto/Manual HLS quality selector
- Buffer monitor
- Bitrate/quality display
- Automatic reconnect
- Backup stream failover after repeated failures
- Manual reconnect
- HLS retry/recovery tuning
- Native HLS fallback on Safari/iOS
- EPG support
- PWA

Backup stream:
ใส่ URL สำรองทีละ 1 บรรทัดใน Settings > Backup Stream
ระบบจะสลับไป backup หลังการเชื่อมต่อหลักล้มเหลวหลายครั้ง

ข้อจำกัด:
ความเสถียรยังขึ้นกับต้นทาง, CDN, bandwidth, latency และคุณภาพเครือข่าย
ระบบนี้ไม่สามารถทำให้ต้นทางที่ล่มหรือสตรีมที่มีปัญหาโดยตัวมันเองกลับมาใช้งานได้
ใช้เฉพาะ stream ที่ได้รับอนุญาตให้ใช้งานหรือเผยแพร่


V5 Diagnostic
- เพิ่มปุ่ม "ตรวจสอบ" ใน Player
- ตรวจ Mixed Content (HTTPS page + HTTP stream)
- ตรวจรูปแบบ URL HLS/MP4/WebM/OGG
- แสดงคำอธิบาย CORS/403/404/401/Network/Manifest/Codec/Media
- แสดงรายละเอียด HLS error เมื่อ fatal
- เชื่อมต่อใหม่พร้อมแจ้งเหตุผล


V6 Hybrid
- เพิ่มปุ่ม TrueID Direct
- เปิด https://tv.trueid.net/th-en/live โดยตรงในหน้าต่างใหม่
- ไม่ดึง/แยก/พร็อกซี stream URL ภายในของ TrueID
- Local M3U channels continue using the V5 Smart Player

V7 In-App TrueID
- เพิ่มแท็บ TrueID ในแอป
- แสดงหน้า TrueID Live ใน iframe แบบ sandbox เพื่อเป็น navigation surface
- มีปุ่มเปิดภายนอก
- ไม่ดึง แยก หรือ proxy URL สตรีมภายในของ TrueID
หมายเหตุ: ถ้า TrueID ตั้ง X-Frame-Options/CSP ไม่ให้ฝังหน้า เว็บจะไม่แสดงใน iframe และปุ่ม ↗ ใช้เปิดภายนอกแทน
