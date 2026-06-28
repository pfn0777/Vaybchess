# Spec: admin.html — 3 ta kritik xavfsizlik tuzatishi

## Maqsad
admin.html dagi XSS zaifligini, ADMIN_KEY URL'da ochiq turish muammosini va Firebase rules yo'qligiga doir ogohlantirishni bartaraf etish.

## Nega kerak
Code review 8 ta zaiflik aniqladi. Eng xavflilari: (1) Firebase'dan kelgan user nomi to'g'ridan-to'g'ri innerHTML'ga qo'yiladi — XSS; (2) ADMIN_KEY URL'da turib browser tarixiga, Referer headerga va server loglariga tushadi; (3) Firebase Security Rules bo'lmasa isAdmin() client-only check bo'lib qoladi.

## Qamrov ICHIDA
- `esc()` HTML escape helper — barcha user-controlled ma'lumotlarni `innerHTML`ga qo'yishdan avval o'tkazish (`u.name`, `u.username`, `u.id`, `u.usage` sonlari)
- `onclick` attributidan string concatenation olib tashlash — `data-id` + event delegation bilan almashtirish
- URL param (`?key=`) o'rniga `prompt()` dialog — kalit URL'da ko'rinmaydi
- `sessionStorage` cache — admin bir marta kalit kiritsа, sahifani yangilasa qayta so'ralmaydi
- `console.warn` Firebase Security Rules haqida — dasturchi uchun eslatma

## Qamrov TASHQARISIDA (bularni qilma!)
- Firebase Security Rules'ni o'zgartirish — bu Firebase Console'dan qilinadi, HTML faylda bo'lmaydi
- Server-side auth qo'shish — loyiha hozir static HTML, server yo'q
- ADMIN_KEY'ni source koddan olib chiqarish — bu alohida arxitektura qaroriga bog'liq
- tg.initDataUnsafe HMAC verifikatsiyasi — server kerak, hozirgi scope'da yo'q

## Texnik
- Fayl: `admin.html` (yagona fayl)
- DB o'zgarishi: yo'q
- Migration: kerak emas
- Yangi dependency: yo'q

## Qoidalar (logika)

### Fix 1 — XSS (esc helper)
- QACHON `renderList()` HTML qurayotganda
  TIZIM barcha `u.name`, `u.username`, `u.id` ni `esc()` orqali o'tkazishi SHART
- `esc(s)` funksiyasi `&`, `<`, `>`, `"`, `'` belgilarni HTML entity bilan almashtirishi SHART
- `onclick` string concatenation o'rniga `data-uid` va `data-premium` attributlari ishlatilishi SHART
- Event delegation `document.getElementById('list')` `click` event'ini ushlab `togglePremium` chaqirishi SHART

### Fix 2 — ADMIN_KEY prompt()
- QACHON sahifa yuklanganda `isAdmin()` chaqirilganda
  VA `ADMIN_KEY` o'rnatilgan bo'lsa
  TIZIM avval `sessionStorage.getItem('ak')` ni tekshirishi SHART
- AGAR `sessionStorage`'da kalit to'g'ri bo'lsa — `prompt()` ko'rsatmasdan kirish berishi SHART
- AGAR `sessionStorage`'da kalit yo'q bo'lsa — `prompt('Admin kaliti:')` ko'rsatishi SHART
- AGAR kiritilgan kalit `ADMIN_KEY` ga teng bo'lsa — `sessionStorage.setItem('ak', kalit)` va kirish SHART
- AGAR noto'g'ri yoki `null` bo'lsa — kirish berilmasligi SHART
- URL `?key=` parametri butunlay olib tashlanishi SHART (`urlKey()` funksiyasi o'chiriladi)

### Fix 3 — Firebase Rules ogohlantirish
- QACHON `db()` funksiyasi Firebase'ni initialize qilganda
  TIZIM `console.warn` chiqarishi SHART: Firebase RTDB rules tekshirilsin

## Acceptance criteria
- [ ] `<script>alert(1)</script>` nomli Firebase user admin sahifasida alert chiqarmaydi
- [ ] `onclick` attribute'da apostrof bo'lgan user nomi JS breakout qilmaydi
- [ ] Admin `?key=vayb-2026-buxoro` URL bilan kirmaydi — faqat prompt orqali
- [ ] Admin kalit kiritgach sahifani yangilasa prompt qayta chiqmaydi (sessionStorage)
- [ ] Noto'g'ri kalit kiritilsa `gate()` ko'rinadi
- [ ] Console'da Firebase rules haqida `warn` chiqadi

## Test — XAVFSIZLIK
- `u.name = '<img src=x onerror=alert(1)>'` → render'dan keyin alert YO'Q
- `u.id = "');alert(1);//"` → onclick trigger bo'lganda alert YO'Q
- `?key=vayb-2026-buxoro` URL bilan kirish → RUXSAT YO'Q (prompt ko'rinadi)
- `prompt()` da to'g'ri kalit → kirish bor, sessionStorage'da saqlanadi
- `prompt()` da noto'g'ri kalit → `gate()` ko'rinadi
- `sessionStorage` clear + sahifani yangilash → prompt qayta chiqadi
