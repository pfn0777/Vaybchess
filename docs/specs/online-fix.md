# Spec: Shaxmat online rejim xatosini tuzatish

## Maqsad
Shaxmatda online o'yin ishlamayapti: yurishlar sinxronlanmaydi va raqib o'rniga AI o'ynab yuboradi. Buni tuzatish.

## Sabab (aniqlandi)
`chess.html` → `startOnlineGame()` funksiyasida `gameMode = 'online'` o'rnatilmagan:
- Oldin AI o'ynagan bo'lsa `gameMode='ai'` qolib ketadi → `doMove()` ichida `setTimeout(doAIMove)` ishlab, AI raqib o'rniga yuradi
- `pushOnlineMove()` faqat `gameMode==='online'`da chaqiriladi → yurishlar Firebase'ga yozilmaydi
- `canMove`/`handleSquareClick`dagi online navbat tekshiruvi ham ishlamaydi

Shashkada (`checkers.html` 1383-qator) bu to'g'ri qilingan — faqat shaxmat muammosi.

## Qamrov ICHIDA
- `startOnlineGame()`ga `gameMode='online'` qo'shish
- Share link'ni yaxshilash: `t.me/vaybchess_bot/play?startapp=<KOD>` formatida yuborish (short link endi mavjud)
- Auto-join: do'st link bosganda `start_param`dan kodni olib avtomatik xonaga qo'shilish
- Online o'yin tugaganda/chiqilganda `gameMode` toza holatga qaytishi

## Qamrov TASHQARISIDA (bularni qilma!)
- Shashka share/auto-join — keyingi versiyada (hozir shashka online o'zi ishlaydi)
- Reconnect/qayta ulanish logikasi — keyingi versiya
- Vaqt (timer) serverda sinxronlash — keyingi versiya

## Texnik
- Fayl: `chess.html` (faqat shu fayl)
- DB: o'zgarish yo'q
- Deploy: Vercel'ga qayta deploy kerak (git push yoki dashboard Redeploy)

## Qoidalar (EARS)
- QACHON `startOnlineGame()` chaqirilsa
  TIZIM `gameMode`ni `'online'` qilishi SHART
  VA AI yurish rejalashtirMASLIGI SHART

- QACHON o'yinchi online rejimda yursa
  TIZIM yurishni `pushOnlineMove()` orqali Firebase'ga yozishi SHART

- QACHON Mini App `start_param` (6 belgili xona kodi) bilan ochilsa
  TIZIM avtomatik shu xonaga qo'shilishi SHART
  VA xona topilmasa xabar ko'rsatishi SHART

- QACHON "Do'stga yuborish" bosilsa
  TIZIM `t.me/vaybchess_bot/play?startapp=<KOD>` linkini ulashishi SHART

## Acceptance criteria
- [ ] Ikki qurilmada bir xonaga kirib, yurishlar ikkala tomonda real ko'rinadi
- [ ] Online o'yinda AI umuman aralashmaydi (oldin AI o'ynagan bo'lsa ham)
- [ ] Share link bosilganda do'st avtomatik xonaga tushadi
- [ ] Online o'yindan chiqib AI o'ynasa — AI normal ishlaydi
