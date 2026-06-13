# Spec: Shaxmat AI kuchi va tezligi (Elo bo'yicha)

## Maqsad
chess.html'dagi Stockfish AI'ni har bir tanlangan Elo darajasida o'z kuchida to'g'ri o'ynaydigan va yuqori darajalarda tez javob beradigan qilish.

## Nega kerak
Hozir AI yuqori Elo'da (1600-1800) `go depth 12-15` bilan qidiradi. Stockfish.js bitta yadroda ishlaganda chuqurlik vaqtni eksponensial oshiradi — AI o'nlab soniya "o'ylaydi". Bundan tashqari Skill Level va chuqur depth birga ishlatilgani qarama-qarshi (Skill Level allaqachon zaiflashtiradi).

## Qamrov ICHIDA
- 7 ta Elo darajasi saqlanadi (500, 800, 1000, 1200, 1400, 1600, 1800)
- Har bir Elo uchun: Skill Level (kuch) + movetime (vaqt byudjeti) + depth cap (xavfsizlik chegarasi)
- `go depth` o'rniga `go depth D movetime T` — qaysi chegara avval kelsa, o'sha to'xtatadi
- Eng yuqori daraja (1800) maksimal ~2000ms o'ylaydi
- Past Elo'da (500-1000) insonga o'xshash xato (tasodifiy yurish) ehtimoli moslashtirilgan
- showHint ham movetime ga o'tkaziladi (chegaralangan vaqt)

## Qamrov TASHQARISIDA (bularni qilma!)
- Daraja menyusini 4 ta nomli darajaga almashtirish — foydalanuvchi 7 ta Elo'ni saqlashni tanladi
- UCI_LimitStrength/UCI_Elo ishlatish — sf10 asm.js da ishonchsiz, Skill Level barqarorroq
- Yangi shaxmat dvigateli yoki MultiPV murakkab modeli — keyingi versiyaga

## Texnik
- Fayl: `chess.html` (bitta fayl)
- Funksiyalar: `eloConfigs` (731-742), `askStockfish` (817-823), `doAIMove` (1131), `showHint` (1191)
- Dvigatel: Stockfish.js 10.0.2 (CDN)
- DB: yo'q
- Locale: yo'q (o'zgarish UI matniga tegmaydi)

## Qoidalar (logika)
- QACHON AI yurish navbati keladi
  TIZIM tanlangan Elo cfg'sini olishi SHART
  VA `setoption name Skill Level value <skill>` yuborishi SHART
  VA `go depth <depth> movetime <movetime>` yuborishi SHART

- QACHON Elo past (rand > 0)
  VA Math.random() < cfg.rand
  TIZIM tasodifiy qonuniy yurish qilishi SHART (insonga o'xshash xato)

- AGAR stockfish yuklanmagan
  TIZIM tasodifiy yurishga o'tishi SHART
  VA xato bermasligi SHART

## Yangi konfiguratsiya
| Elo  | skill | movetime | depth cap | rand |
|------|-------|----------|-----------|------|
| 500  | 0     | 150      | 5         | .30  |
| 800  | 2     | 250      | 6         | .15  |
| 1000 | 5     | 400      | 8         | .06  |
| 1200 | 8     | 600      | 10        | .02  |
| 1400 | 12    | 900      | 14        | 0    |
| 1600 | 16    | 1300     | 18        | 0    |
| 1800 | 20    | 2000     | 22        | 0    |

## Acceptance criteria (tugadi deganda)
- [ ] 1800 Elo'da AI ~2s ichida yuradi (oldin 10-30s edi)
- [ ] Har bir Elo oshgani sayin AI sezilarli kuchliroq o'ynaydi
- [ ] 500 Elo boshlovchiga o'xshab xato qiladi, 1800 deyarli xatosiz
- [ ] showHint chegaralangan vaqtda javob beradi
- [ ] Stockfish yuklanmasa ham o'yin ishlaydi (random fallback)
