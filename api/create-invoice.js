// Vercel serverless function: create a Telegram Stars invoice link for premium.
// The bot token stays server-side (Vercel env BOT_TOKEN). The client never sees it.
const crypto = require('crypto');

const ALL_PRICE = 500;    // "Unlock all" premium bundle (Stars)
const PACK_PRICE = 100;   // single pack (Stars)
const MAX_PACK_INDEX = 8; // SHOP_PACKS has 9 packs (0..8)

// Validate Telegram WebApp initData per the official spec. Returns the parsed
// user object on success, or null if the signature does not match.
function verifyInitData(initData, botToken) {
  if (!initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (computed !== hash) return null;
  try {
    return JSON.parse(params.get('user'));
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    res.status(500).json({ error: 'bot_token_missing' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const user = verifyInitData(body.initData, botToken);
  if (!user || !user.id) {
    res.status(403).json({ error: 'invalid_init_data' });
    return;
  }

  // Server-side price table — never trust an amount sent by the client.
  const packId = body.packId;
  let amount, title;
  if (packId === 'all') {
    amount = ALL_PRICE;
    title = 'Vaybchess Premium';
  } else {
    const idx = Number(packId);
    if (!Number.isInteger(idx) || idx < 0 || idx > MAX_PACK_INDEX) {
      res.status(400).json({ error: 'invalid_pack' });
      return;
    }
    amount = PACK_PRICE;
    title = 'Vaybchess Premium';
  }

  const payload = `premium:${user.id}:${packId}`;
  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description: 'Vaybchess — unlock all puzzle packs & unlimited practice',
      payload,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: title, amount }],
    }),
  });
  const data = await tgRes.json();
  if (!data.ok) {
    res.status(502).json({ error: 'telegram_error', detail: data.description });
    return;
  }
  res.status(200).json({ link: data.result });
};
