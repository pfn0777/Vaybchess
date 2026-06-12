# Vaybchess — Telegram Mini App

Shaxmat (Stockfish AI, 500–1800 Elo) + Shashka (minimax AI) — bitta Telegram Mini App ichida. Online rejim Firebase RTDB orqali.

## Fayllar

| Fayl | Vazifa |
|------|--------|
| `index.html` | Bosh sahifa — o'yin tanlash, til (UZ/RU/EN) |
| `chess.html` | Shaxmat — AI (Elo tanlash) yoki online |
| `checkers.html` | Shashka — AI yoki online |
| `vercel.json` | Vercel static sozlamalari |

## BotFather orqali Mini App ochish (qadamma-qadam)

1. Telegram'da **@BotFather** ni oching.
2. `/newbot` yuboring.
   - Bot nomini kiriting (masalan: `Vaybchess`).
   - Username kiriting — `bot` bilan tugashi shart (masalan: `VaybchessBot`).
   - BotFather sizga **token** beradi — uni saqlang (bizga kerak emas, lekin yo'qotmang).
3. `/mybots` → botingizni tanlang → **Bot Settings** → **Menu Button** → **Configure menu button**.
   - URL so'raganda Vercel URL'ni kiriting (masalan: `https://vaybchess.vercel.app`).
   - Tugma nomini kiriting (masalan: `O'ynash 🎮`).
4. Tayyor! Botga kirib pastdagi **Menu** tugmasini bossangiz — Mini App ochiladi.

### Qo'shimcha (tavsiya): to'liq Mini App sifatida ro'yxatdan o'tkazish

1. @BotFather → `/newapp` → botingizni tanlang.
2. Nomi: `Vaybchess`, qisqa tavsif, rasm (640×360 px) yuklang.
3. Web App URL: Vercel URL.
4. Qisqa nom (short name) kiriting — masalan `play`.
5. Endi `https://t.me/VaybchessBot/play` havolasi orqali ham ochiladi va do'stlarga yuborish mumkin.

## Vercel'ga qayta deploy qilish

Fayllarni o'zgartirgach:
- Vercel dashboard (vercel.com) → loyiha → **Redeploy**, yoki
- `npx vercel --prod` (papka ichida).

## Firebase xavfsizlik qoidalari (tavsiya)

Hozir RTDB ochiq. Minimal cheklov uchun Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "games": {
      "$code": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['status'])"
      }
    },
    "checkers": {
      "$code": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['status'])"
      }
    },
    "$other": { ".read": false, ".write": false }
  }
}
```

Bu boshqa yo'llarga yozishni bloklaydi. To'liq xavfsizlik uchun keyingi versiyada Telegram initData tekshiruvi bilan backend kerak bo'ladi.

## Texnik eslatmalar

- **Til**: `localStorage.vayb_lang` — uchala sahifa uchun umumiy. Birinchi kirishda Telegram tilidan avto-aniqlanadi.
- **Ovoz**: WebAudio sintez, `vayb_sound` kalitida saqlanadi.
- **Elo**: `vayb_elo` — oxirgi tanlov eslab qolinadi. Stockfish Skill Level + depth + past Elo'da ataylab tasodifiy yurish.
- **Stockfish CDN yuklanmasa**: tasodifiy-yurish rejimi ishlaydi va foydalanuvchiga bildiriladi.
- **Online uzilish**: Firebase `onDisconnect` presence — raqib chiqsa qolganga g'alaba.
