# Spec: chess.html'dan mashqlar tugmasini olib tashlash + AI kuchini yengil kamaytirish

## Maqsad
`chess.html` bosh menyusidagi "Shaxmat mashqlari" tugmasini olib tashlash (mashqlarga faqat
bosh menyu `index.html` orqali kiriladi) va AI bilan o'yin darajalari kuchini yengil kamaytirish.

## Nega kerak
- Mashqlarga ikkita kirish nuqtasi (bosh menyu + shaxmat ichi) ortiqcha — bittasi qoladi.
- AI darajalari juda kuchli deb hisoblanadi — yengilroq bo'lsa qiziqarli.

## Qamrov ICHIDA
- `chess.html` bosh menyudan "Shaxmat mashqlari" tugmasini olib tashlash.
- `eloConfigs` qiymatlarini yengil pasaytirish: `skill` 2–3 pog'ona, past darajalarda `rand`
  biroz oshadi, `movetime`/`depth` biroz qisqaradi. Tugma raqamlari (500–1800) o'zgarmaydi.

## Qamrov TASHQARISIDA
- `index.html` va `puzzles.html` — tegilmaydi.
- `puzzles` i18n kalitlari (`chess.html`) — qoladi (zararsiz).
- Yangi daraja qo'shish yoki raqamlarni o'zgartirish — yo'q.

## Texnik
- Fayl: `chess.html` (yagona). DB / migration / config / locale: yo'q.

## eloConfigs (eski → yangi)
| Elo | skill | movetime | depth | rand |
|-----|-------|----------|-------|------|
| 500  | 0→0  | 150→120  | 5→4  | .30→.40 |
| 800  | 2→1  | 250→200  | 6→5  | .15→.25 |
| 1000 | 5→3  | 400→300  | 8→7  | .06→.12 |
| 1200 | 8→6  | 600→500  | 10→9 | .02→.05 |
| 1400 | 12→9 | 900→700  | 14→12| 0→.02 |
| 1600 | 16→13| 1300→1000| 18→15| 0→0 |
| 1800 | 20→17| 2000→1500| 22→18| 0→0 |

## Acceptance criteria
- [ ] `chess.html` bosh menyuda faqat "AI ga qarshi" + "Online o'ynash" (mashqlar yo'q).
- [ ] `index.html`da mashqlar tugmasi ishlaydi.
- [ ] AI har darajada yengilroq; javob vaqti oshmaydi.
- [ ] `vayb_elo` saqlangan qiymat ishlaydi, konsol xatosiz.
