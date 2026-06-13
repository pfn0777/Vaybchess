# Spec: Shashka AI darajalari (Easy/Medium/Hard)

## Maqsad
checkers.html'dagi minimax AI'ni 3 daraja uchun to'g'ri sozlash: interfeys muzlamasin, har daraja sezilarli farq qilsin, Easy boshlovchidek xato qilsin.

## Nega kerak
Hozirgi muammolar:
1. **Interfeys muzlaydi** — `getBestMove` minimax'ni asosiy oqimda sinxron ishlatadi; Hard (depth 7) brauzerni qotiradi, vaqt chegarasi yo'q.
2. **Move ordering yo'q** — alpha-beta yaxshi kesmaydi, sekin.
3. **Tasodifiylik yo'q** — Easy doim ochko'z, hech qachon xato qilmaydi; teng yurishlarda doim birinchisini tanlaydi → har o'yin bir xil.
4. **Darajalar tafovuti tartibsiz** — Easy juda sayoz lekin xatosiz.

## Qamrov ICHIDA
- 3 daraja saqlanadi (easy/medium/hard), `aiDepths` → boy `aiLevels` config
- **Iterativ chuqurlashtirish + vaqt byudjeti** — har daraja maksimal vaqtga ega, muzlash yo'qoladi
- **Move ordering** — capture'lar va kuchli yurishlar avval qidiriladi (tezlik)
- **Easy uchun insonga o'xshash xato** — top-N yurishdan tasodifiy tanlash, ba'zan zaif yurish
- **Tie-break randomization** — teng baholi yurishlarda variativlik (har o'yin boshqacha)
- `minimax`'ga deadline tekshiruvi (vaqt tugasa qidiruvni to'xtatadi)

## Qamrov TASHQARISIDA (bularni qilma!)
- Move generation / multi-jump logikasini qayta yozish — mavjud `getAllMovesForColor`/`applyMove` ishlatiladi
- Web Worker'ga ko'chirish — iterativ chuqurlashtirish + vaqt cap yetarli, oddiyroq
- evaluate funksiyasini tubdan o'zgartirish — hozirgi material+pozitsiya yetarli (kichik yaxshilash mumkin)
- 4-daraja yoki Elo raqamlari qo'shish — foydalanuvchi 3 darajani saqladi

## Texnik
- Fayl: `checkers.html` (bitta fayl)
- Funksiyalar: `aiDepths` (535), `getBestMove` (1096), `minimax` (1109), `doAIMove` (1083)
- Algoritm: o'z minimax + alpha-beta (CDN dvigatel yo'q)
- DB: yo'q
- Locale: yo'q

## Yangi konfiguratsiya
| Daraja | maxDepth | maxTime | randomness | topN |
|--------|----------|---------|------------|------|
| easy   | 3        | 200ms   | .35        | 3    |
| medium | 6        | 600ms   | .08        | 2    |
| hard   | 12       | 1200ms  | 0          | 1    |

- maxDepth = iterativ chuqurlashtirish yuqori chegarasi
- maxTime = bitta yurishga ajratilgan vaqt (ms) — qidiruvni CHEGARALAYDI
- randomness = eng yaxshi o'rniga top-N dan tasodifiy tanlash ehtimoli (Easy xato qiladi)
- topN = nechta eng yaxshi yurish orasidan tanlanadi

## Qoidalar (logika)
- QACHON AI yurish navbati keladi
  TIZIM tanlangan daraja cfg'sini olishi SHART
  VA iterativ chuqurlashtirish bilan maxDepth gacha qidirishi SHART
  VA Date.now() > deadline bo'lsa qidiruvni to'xtatishi SHART
  VA eng oxirgi tugagan chuqurlikning natijasini qaytarishi SHART

- QACHON randomness > 0 VA Math.random() < cfg.randomness
  TIZIM eng yaxshi o'rniga top-N yurishdan tasodifiy birini tanlashi SHART

- QACHON bir nechta yurish teng baholi
  TIZIM ular orasidan tasodifiy tanlashi SHART (variativlik)

- AGAR faqat bitta qonuniy yurish bor (majburiy capture)
  TIZIM qidirmasdan o'sha yurishni darrov qaytarishi SHART

## Acceptance criteria (tugadi deganda)
- [ ] Hard darajada interfeys muzlamaydi, AI ~1.2s ichida yuradi
- [ ] Har daraja oshgani sayin AI sezilarli kuchliroq o'ynaydi
- [ ] Easy ba'zan zaif yuradi — boshlovchi yutib chiqishi mumkin
- [ ] Bir xil pozitsiyada AI har doim aynan bir xil yurmaydi (variativlik)
- [ ] Majburiy capture holatida AI to'g'ri va tez yuradi
