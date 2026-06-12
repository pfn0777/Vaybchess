# Spec: Shashka online rejim xatosini tuzatish

## Maqsad
Shashkada online o'yin ishlamayapti: yurishlar raqibga yetib bormaydi. Buni tuzatish.

## Sabab (aniqlandi)
`checkers.html`da ikkita bug:

1. **Teskari guard** — `syncFromFirebase()` (1409-qator):
   `if(d.turn===playerColor) return;`
   Raqib yurganda navbat bizga o'tadi (`turn = playerColor`) — aynan shu payt
   yangilanish kerak, lekin shart uni tashlab yuboradi. Hech kim raqib
   yurishini ko'rmaydi.

2. **Firebase null pruning** — `serializeBoard()` doskani `null`li 8x8
   massiv qilib yozadi. Firebase RTDB `null`larni saqlamaydi: bo'sh kataklar
   va to'liq bo'sh qatorlar (3-4) yo'qoladi, qatorlar obyektga aylanadi.
   `deserializeBoard()` (`r.map`) o'qishda xato beradi.

## Qamrov ICHIDA
- `syncFromFirebase()` guard'ini `moveCount` taqqoslashga almashtirish
  (faqat yangiroq holat qabul qilinadi; o'z echo'miz e'tiborsiz qoladi,
  multi-jump holati buzilmaydi)
- `serializeBoard`/`deserializeBoard`ni 64 belgili string formatga o'tkazish
  (`-` bo'sh, `w/W/b/B` dona/damka) — Firebase'da null muammosi yo'qoladi
- `createRoom()` boshlang'ich yozuvga `moveCount:0` qo'shish

## Qamrov TASHQARISIDA (bularni qilma!)
- Share link / auto-join shashka uchun — keyingi versiya
- Reconnect logikasi — keyingi versiya
- Timer sinxronlash — keyingi versiya
- Eski formatdagi mavjud xonalar bilan moslik — kerak emas (xonalar vaqtinchalik)

## Texnik
- Fayl: `checkers.html` (faqat shu fayl)
- DB: Firebase RTDB sxemasi o'zgaradi (`board` endi string) — migration kerak emas
- Deploy: Vercel'ga qayta deploy

## Qoidalar (EARS)
- QACHON raqib yurib Firebase'ga yangi holat yozsa (`moveCount` lokaldan katta)
  TIZIM doskani yangilashi SHART
  VA yurish ovozi/haptic berishi SHART

- QACHON o'z yurishimiz echo bo'lib qaytsa (`moveCount` lokal bilan teng)
  TIZIM hech narsa qilMASLIGI SHART
  VA multi-jump holatini (mustJumpFrom) buzMASLIGI SHART

- QACHON doska Firebase'ga yozilsa
  TIZIM uni null'siz string formatda yozishi SHART

## Acceptance criteria
- [ ] Ikki qurilma/tabda bir xonaga kirib, yurishlar ikkala tomonda real ko'rinadi
- [ ] Multi-jump (ketma-ket olish) o'z navbatida ham, raqib tomonida ham to'g'ri sinxronlanadi
- [ ] Damka (king) holati sinxronda saqlanadi
- [ ] O'yin tugashi (yutish/mag'lubiyat) ikkala tomonda ko'rinadi
- [ ] AI rejimi buzilmaydi
