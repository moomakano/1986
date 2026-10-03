# Thai TV PWA V12 — TrueID Free TV
เฉพาะช่องฟรี/ฟรีทีวี ไม่รวมช่อง Premium หรือแพ็กเกจสมาชิก
จำนวนรายการ: 58
ตัดออก: True Sports, SPOTV, beIN SPORTS, Golf, True Ball Thai, True Film, True Series, Event และช่องพรีเมียมอื่นๆ


UI v2: ปรับธีมให้ใช้งานง่ายขึ้น การ์ดช่องมีปุ่ม ▶ ดูช่องชัดเจน, Hero ใหม่, spacing และ navigation แบบ premium โดยคงระบบช่องฟรีของ V12.


V6 clean rebuild from V12 UI base. Fixed the broken JavaScript introduced by prior logo patch, added real channel logos, MONO29, and reliable direct opening of official TrueID channel pages.


V8 MONO29: MONO29 now opens the official MONOMAX Live TV page (https://www.monomax.me/livetv). Very TV and ช่อง 8 logo mappings were separated/cleared so they cannot display each other's logo.


V9 MONO29 Added: MONO29 is now explicitly included at the top of CHANNELS and has a featured card in the หนังฟรี section. Its Watch action opens https://www.monomax.me/livetv directly.

V10 Logo Fix:
- WorkPoint TV no longer uses the incorrect TrueID image asset; it uses a dedicated WorkPoint logo asset.
- Channel 8 uses the logo asset currently exposed by the official TrueID Channel 8 page.
- Very TV uses a dedicated logo asset.
This prevents WorkPoint/Channel 8/Very TV from sharing or displaying each other's logos.


V11: เพิ่มหมวด 🎬 หนังฟรี โดยเปิดไปยังหน้า MONOMAX ทางการ และคงการนำทางช่องทีวีผ่านหน้าเว็บทางการ

V12: เพิ่มรางโปสเตอร์หนังฟรี/ทดลองดูฟรีจาก MONOMAX พร้อมปุ่มเปิดหน้าทางการ ไม่โฮสต์หรือดึงไฟล์วิดีโอมาเอง

V13: เอาโปสเตอร์หนัง MONOMAX ออก และเพิ่มปุ่มลิงก์ภายนอกไปยัง NUNGHD4K โดยไม่ฝังหรือโฮสต์วิดีโอ

V14: แก้ปุ่ม NUNGHD4K เป็นลิงก์ <a> โดยตรง เพื่อให้กดได้บน PWA/Safari และเปิดเว็บไซต์ในแท็บใหม่

V15: เปลี่ยน NUNGHD4K เป็น <a> แบบคลิกได้ทั้งการ์ด ไม่มี JavaScript handler และตั้ง z-index/pointer-events ให้เหมาะกับ PWA
