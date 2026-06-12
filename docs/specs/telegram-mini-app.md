# Spec: Vaybchess — Telegram Mini App (Shaxmat + Shashka)

## Maqsad
Mavjud `chess.html` va `checkers.html` o'yinlarini xatolardan tozalab, bitta professional Telegram Mini App qilish. Yangi alohida bot orqali ochiladi, Vercel'da hosting qilinadi.

## Nega kerak
Hozir ikkala HTML mustaqil fayl, Telegram bilan integratsiyasi yo'q, bir nechta bug bor (`index.html` mavjud emas, `alert/confirm` Telegram'da ishlamaydi, va h.k.). Mini App qilinsa foydalanuvchilar to'g'ridan-to'g'ri Telegram ichida o'ynaydi.

## Qamrov ICHIDA

### 1. Bosh sahifa (`index.html`) — YANGI
- Ikkala o'yin kartochkasi: ♟ Shaxmat, ⬤ Shashka
- Til tanlash (UZ/RU/EN) — bitta umumiy, ikkala o'yinga ta'sir qiladi
- Telegram foydalanuvchi ismi bilan salomlashish

### 2. Telegram Mini App integratsiyasi (ikkala o'yin + bosh sahifa)
- `telegram-web-app.js` SDK ulanadi
- `Telegram.WebApp.ready()` + `expand()` — to'liq ekran
- Foydalanuvchi ismi `initDataUnsafe.user` dan olinadi (player bar'da "Siz" o'rniga ism)
- `BackButton` — Telegram'ning orqaga tugmasi ekranlar bo'ylab ishlaydi
- `HapticFeedback` — yurish, yutish, xato bosishda titrash
- `disableVerticalSwipes` / fullscreen swipe muammosi hal qilinadi (o'yin paytida tortib yopilib ketmasin)
- Til avtomatik: `initDataUnsafe.user.language_code` → uz/ru/en (birinchi kirishda)

### 3. Xatolarni tuzatish
- `alert()`/`confirm()` → `Telegram.WebApp.showPopup/showConfirm` (fallback: ichki modal)
- chess.html: ikkilangan `resignGame` funksiyasi birlashtiriladi
- checkers.html: `id="t0" id="txUnlimited"` dublikat id tuzatiladi
- `window.location.href='index.html'` endi mavjud bosh sahifaga ishlaydi
- chess.html: chess.js va Stockfish yuklanmasa xato xabari (CDN fallback)
- checkers.html: durang holati (draw) aniqlash qo'shiladi (uzoq vaqt yurishsiz qoidasi — 30 yurish soddalashtirilgan)
- Modal tugmalari uchunchi tugma (▶) ma'nosi: shaxmatda → shashkaga, shashkada → shaxmatga o'tish

### 4. Shaxmat: Elo reyting tanlash (chess.com uslubi)
- Oson/O'rta/Qiyin O'RNIGA raqib reytingi tanlanadi: **500, 800, 1000, 1200, 1400, 1600, 1800**
- Har Elo Stockfish parametrlariga moslanadi (Skill Level + depth + ataylab xato qilish ehtimoli past Elo'da)
- Tanlangan Elo o'yin ekranida raqib nomida ko'rinadi: "AI (1200)"
- Oxirgi tanlangan Elo eslab qolinadi (localStorage)

### 5. Ovoz effektlari (ikkala o'yin)
- WebAudio orqali sintez qilinadi — tashqi fayl YO'Q
- Tovushlar: yurish, donani olish (capture), shoh (check), yutish, yutqazish, vaqt oz qolganda
- Sozlamalardagi "Ovoz" tugmasi haqiqiy ishlaydi, holati localStorage'da saqlanadi

### 6. Online rejim (Firebase, mavjud logika saqlanadi)
- Xona yaratish/kirish kod bilan — ishlashda qoladi
- YANGI: "Do'stga yuborish" tugmasi — Telegram share orqali xona kodi bilan taklif xabari yuboriladi
- Raqib uzilsa/chiqsa aniqlanadi (onDisconnect) va g'alaba beriladi
- Firebase xavfsizlik: kalit ochiqligi qoladi (RTDB shunday ishlaydi), lekin database rules tavsiyasi README'ga yoziladi

### 7. Vercel deploy
- Statik sayt sifatida deploy (index.html + chess.html + checkers.html)
- HTTPS URL olinadi → BotFather'ga ulanadi

### 8. BotFather yo'riqnoma
- Yangi bot ochish, Menu Button / Mini App ulash — qadamma-qadam yo'riqnoma (README.md)

## Qamrov TASHQARISIDA (bularni qilma!)
- Reyting/leaderboard tizimi — keyingi versiya
- O'yinlar tarixi va statistika — keyingi versiya
- To'lov (Telegram Stars) — keyingi versiya
- Yangi o'yinlar qo'shish — keyingi versiya
- Python bot kodi — kerak emas, BotFather'ning o'zi yetadi
- Foydalanuvchi reytingini hisoblash (faqat AI raqib kuchi tanlanadi, o'z reytinging yo'q)
- Server-side backend — hammasi static + Firebase

## Texnik
- Fayllar: `index.html` (yangi), `chess.html` (tuzatish + yangilash), `checkers.html` (tuzatish + yangilash)
- Umumiy kod (Telegram init, ovoz, i18n asosi) har faylda inline qoladi — single-file uslub saqlanadi
- Hosting: Vercel static deploy
- DB: Firebase RTDB (mavjud `chess-game-aba31` loyihasi)
- AI: Stockfish.js (CDN) — shaxmat; minimax (mavjud) — shashka
- Saqlash: localStorage (til, ovoz, Elo, vaqt tanlovi)

## Qoidalar (EARS uslubida)
- QACHON foydalanuvchi Mini App'ni ochsa
  TIZIM Telegram SDK'ni init qilib to'liq ekranga o'tishi SHART
  VA foydalanuvchi ismini player bar'da ko'rsatishi SHART

- QACHON foydalanuvchi shaxmatda Elo (masalan 1200) tanlasa
  TIZIM Stockfish'ni shu kuchga mos sozlashi SHART
  VA raqib nomida tanlangan Elo ko'rinishi SHART

- QACHON o'yinda dona yursa
  VA ovoz yoqilgan bo'lsa
  TIZIM yurish tovushini chalishi SHART
  VA haptic berishi SHART

- AGAR Stockfish CDN'dan yuklanmasa
  TIZIM tasodifiy-yurish rejimiga o'tishi SHART
  VA foydalanuvchiga bildirishi SHART (jim qolMASLIK SHART)

- AGAR foydalanuvchi mavjud bo'lmagan xona kodini kiritsa
  TIZIM Telegram popup orqali "Xona topilmadi" deyishi SHART
  VA alert() ishlatMASLIK SHART

- QACHON online o'yinda raqib uzilsa
  TIZIM qolgan o'yinchiga g'alaba berishi SHART

## Acceptance criteria (tugadi deganda)
- [ ] Telegram'da bot ochilganda Mini App to'liq ekranda ochiladi
- [ ] Bosh sahifadan ikkala o'yinga kirib, orqaga qaytib bo'ladi (Telegram BackButton bilan ham)
- [ ] Shaxmatda 500 va 1800 Elo sezilarli farq qiladi
- [ ] alert/confirm hech qayerda yo'q — hammasi Telegram popup/ichki modal
- [ ] Taslim, vaqt tugashi, mat, durang — barcha holatlarda modal to'g'ri chiqadi
- [ ] Online: A xona yaratadi → share tugmasi bilan B ga yuboradi → B kiradi → o'ynaladi
- [ ] Ovoz yoqilganda tovushlar eshitiladi, o'chirilganda yo'q, holati saqlanadi
- [ ] Til almashtirilganda barcha matnlar o'zgaradi (3 tilda)
- [ ] Vercel URL'da ishlaydi, README'da BotFather yo'riqnomasi bor
