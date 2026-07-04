# Spec: Vaybchess xavfsizlik auditi va tuzatish rejasi

## Maqsad
Loyihaning to'liq xavfsizlik auditidan o'tkazish, topilgan zaifliklarni jiddiylik bo'yicha
tartiblash va ularni tuzatish uchun aniq spec berish. Asosiy e'tibor: publik deploy qilingan
statik Mini App'da maxfiy ma'lumot sizishi, autentifikatsiyasiz Firebase RTDB va premium/admin
himoyasining faqat UI darajasida bo'lishi.

## Nega kerak
- `admin.html` va Firebase RTDB egasi uchun tahliliy panel + premium boshqaruvini ta'minlaydi.
- Hozir premium (pullik kirish) va admin panel **faqat brauzer UI** darajasida himoyalangan —
  server-side tekshiruv yo'q. Bu to'lovni butunlay chetlab o'tish va foydalanuvchi PII (Telegram
  ID, ism, username) sizishiga olib keladi.

---

## Topilmalar (jiddiylik bo'yicha)

### 🔴 CRITICAL-1 — Admin paroli klient kodida ochiq (`admin.html:46`)
`const ADMIN_KEY = "admin0777";` — publik Vercel deploy'da har kim `admin.html` manbasini ko'rib
parolni oladi. Undan tashqari parol zaif. Natija: istalgan odam admin panelga kirib, istalgan
foydalanuvchiga premium bera oladi va barcha foydalanuvchilar ro'yxatini (PII) ko'radi.

**Ta'sir**: to'liq admin kirish + PII sizishi.

### 🔴 CRITICAL-2 — Firebase RTDB autentifikatsiyasiz ochiq
`track.js` va `admin.html` `users`/`stats`ga o'qish/yozishni talab qiladi; README'dagi tavsiya
qoidalar (`$other: read/write:false`) ularni bloklagani uchun jonli RTDB deyarli aniq **to'liq
ochiq** (root `.read/.write:true`). Natija:
- Har kim `users/{istalgan_id}/premium=true` yozib **to'lovni butunlay chetlab o'tadi** (to'g'ridan
  Firebase REST orqali, admin paneldan ham oldin).
- Har kim butun `users` tugunini o'qiydi → **barcha foydalanuvchilar PII sizishi** (Telegram ID,
  ism, username, til, kirish vaqtlari).
- Har kim `games/{code}` va `checkers/{code}` yozadi/o'chiradi → online o'yinlarni buzish.

**Ta'sir**: to'lov chetlab o'tish + ommaviy PII sizishi + o'yin butunligini buzish.

### 🟠 HIGH-3 — Premiumni klientdan lokal ochish (`track.js:52-62`)
`vaybGetPremium` o'qish xato bo'lganda `localStorage.vayb_packs_unlocked==='1'`ga tayanadi.
Foydalanuvchi shu kalitni qo'lda qo'yib premiumni lokal ochadi. RTDB himoyalangach ham bu yo'l
qoladi (fallback yumshoq). Hozir hammasi bepul bo'lgani uchun ta'sir past, lekin to'lov yoqilganda
bu bypass.

### 🟡 MEDIUM-4 — Online o'yin ma'lumoti tekshirilmaydi (`chess.html`, `checkers.html`)
Xona kodini bilgan hujumchi `fen`, `lastMove`, `hostColor`, `timeSeconds`ga ixtiyoriy qiymat
yozib raqib doskasini buzishi/aldashi mumkin (autentifikatsiya va server-side validatsiya yo'q).
Jiddiylik past (o'yin butunligi, ma'lumot emas), lekin CRITICAL-2 tuzatilgach ham qoladi.

### 🟡 MEDIUM-5 — Firebase Web API key ochiq (`track.js`, `admin.html`, `chess.html`)
Firebase klient `apiKey` publik bo'lishi normal (o'zi maxfiy emas). Lekin **ochiq RTDB rules bilan
birga** u zaiflik enabler'i bo'ladi. Asosiy tuzatish — rules, key emas.

### 🟢 LOW-6 — index.html greeting to'liq escape qilmaydi (`index.html:102`)
`name.replace(/</g,'&lt;')` faqat `<` ni escape qiladi. Matn `<b></b>` ichida bo'lgani uchun
yetarli, lekin loyihadagi `esc()` bilan nomuvofiq. Kelajakda `esc()`ga o'tkazish tavsiya etiladi.

### 🟢 LOW-7 — CDN skriptlarida SRI yo'q + CSP header yo'q
Telegram, gstatic (Firebase), lichess, cloudflare (Stockfish) skriptlari `integrity` (SRI)siz
yuklanadi. CDN buzilsa supply-chain xavfi. `Content-Security-Policy` header ham yo'q.

---

## Qamrov ICHIDA (tuzatish)
- **Firebase RTDB Security Rules** (Firebase Console — kod emas): `users.premium` faqat Admin SDK
  (bot/Cloud Function) yozsin; klient `users/{id}`ga faqat o'z profil maydonlarini (name/username/
  lang/lastSeen/usage) yozsin, `premium`ni **yozolmasin**; `stats` faqat increment; `users` to'liq
  o'qishni bloklab, admin o'qishini Cloud Function/token orqali berish.
- **`admin.html`**: hardcoded `ADMIN_KEY`ni **olib tashlash**. Admin gate faqat Telegram ID
  allowlist (`ADMIN_IDS`) + RTDB rules'da admin ID tekshiruviga tayansin. (Brauzerdan test kerak
  bo'lsa — kalit repo'ga emas, env/manual.)
- **`track.js`**: `vaybGetPremium` fallback'ni yumshoqlik o'rniga xavfsizroq qilish (to'lov yoqilganda
  lokal unlock'ka ishonmaslik) — kamida izoh + kelajakda server tasdiq.
- **Telegram Stars oqimi** (mavjud reja, `docs/specs`da): premium **faqat bot** `successful_payment`
  da REST orqali yozadi — bu to'g'ri yo'l; RTDB rules klient premium yozuvini bloklagach kuchga kiradi.

## Qamrov TASHQARISIDA (hozir emas)
- Online o'yin ma'lumotini to'liq server-side validatsiya (MEDIUM-4) — alohida backend talab qiladi,
  keyingi bosqich.
- SRI/CSP (LOW-7) — alohida kichik ish, `vercel.json` header + `integrity` atributlari.
- index.html `esc()` migratsiyasi (LOW-6) — kichik, alohida.

## Texnik
- Fayllar: `admin.html`, `track.js` (klient tuzatish); Firebase Console Rules (kod tashqarisida);
  `Vayb chess bot/bot.py` + `api/create-invoice.js` (Telegram Stars oqimi — alohida reja).
- DB/migration: yo'q. Locale: yo'q.

## Acceptance criteria
- [ ] `admin.html`da hardcoded parol yo'q (grep `ADMIN_KEY.*=.*"` → bo'sh yoki placeholder).
- [ ] RTDB rules yoqilganda: klient `users/{id}/premium` yozolmaydi (403); `track.js` analitika va
      admin o'qish esa ishlaydi.
- [ ] Boshqa Telegram ID bilan `admin.html` → "Ruxsat yo'q".
- [ ] Klient to'g'ridan REST orqali begona `users`ni o'qiy olmaydi (PII himoyalangan).
- [ ] Online o'yin avvalgidek ishlaydi (rules `games`/`checkers`ni bloklamaydi).

## Test (pul/xavfsizlikka tegadi — MAJBURIY)
1. **Admin parol**: deploy manbasida `admin0777` yo'qligini tekshirish; brauzerdan (Telegram IDsiz)
   admin panel ochilmasligi.
2. **Premium yozuv bypass**: rules yoqilgach, `curl -X PUT .../users/TEST/premium.json -d true` → 401/403.
3. **PII o'qish**: `curl .../users.json` → ruxsat rad etilishi (admin token'siz).
4. **Analitika regressiyasi**: `puzzles.html` ochilganda `stats/puzzles` +1 (rules increment'ga ruxsat).
5. **Admin panel**: admin Telegram ID bilan ro'yxat ko'rinishi va premium toggle ishlashi.
6. **Online**: xona yaratish/kirish avvalgidek (rules `games` write'ni bloklamaydi).

## Qo'llaniladigan RTDB Rules (Variant A — premium bypass yopiq)
Egasi **Variant A**ni tanladi: klient (va `admin.html` ham) `premium` yoza olmaydi; premium'ni
faqat bot (Firebase Admin/REST privileged token) yozadi. Bu to'lov chetlab o'tishni to'liq yopadi.
Savdo: Stars to'lov boti kelguncha `admin.html`dagi qo'lda "Premium ber" toggle ishlamaydi.
`users` **o'qish ochiq** qoladi (PII himoyasi keyingi bosqichga — Anonymous Auth/Cloud Function).

```json
{
  "rules": {
    "games":    { "$code": { ".read": true, ".write": true } },
    "checkers": { "$code": { ".read": true, ".write": true } },
    "stats":    { "$g": { ".read": true, ".write": "newData.isNumber() && (!data.exists() || newData.val() === data.val()+1)" } },
    "users": {
      ".read": true,
      "$id": {
        ".write": "newData.child('premium').val() === data.child('premium').val()"
      }
    },
    "$other": { ".read": false, ".write": false }
  }
}
```
> Eslatma: `$id` dagi shartli `.write` (`newData.child('premium').val() === data.child('premium').val()`)
> — premium yozuvdan oldingi va keyingi qiymati bir xil bo'lsagina ruxsat beradi, ya'ni klient
> premium'ni yarata/o'zgartira olmaydi (bot privileged token bilan chetlab o'tadi). MUHIM: RTDB
> kaskad qoidasi tufayli `$id`da `.write: true` qo'yib pastda `premium: {".write":"false"}` bilan
> bekor qilib BO'LMAYDI — yuqoridagi `true` premium'ga ham tarqaladi (bu dastlabki Variant A xatosi
> edi, `curl -X PUT .../users/TEST/premium.json -d true` → 200 bilan tasdiqlandi). `users` `.read: true`
> — PII hozircha ochiq; to'liq himoya uchun keyingi bosqichda Firebase Anonymous Auth yoqib `.read`ni
> `auth != null`ga o'tkazish kerak.

## Mendan kerak (egasidan) — qaror talab qiladi
1. **Admin o'qish qanday himoyalansin?** (a) Firebase Anonymous Auth + admin ID rules, yoki
   (b) Cloud Function/bot orqali. Bu tanlov qolgan ishni belgilaydi.
2. **`ADMIN_KEY`ni olib tashlashga rozilikmi?** (brauzerdan test kirish yo'qoladi — faqat Telegram ID).
3. Rules'ni Console'da men bera olmayman (kirish yo'q) — matnni beraman, siz qo'llaysiz.
