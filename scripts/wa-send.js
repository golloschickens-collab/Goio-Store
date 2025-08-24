// scripts/wa-send.js
import 'dotenv/config'
import fetch from 'node-fetch'

export async function sendWA({to, text}) {
  if (process.env.DRY_RUN === 'true') {
    console.log(`[DRY RUN] 模擬發送 WhatsApp 訊息至 ${to}:`);
    console.log(`訊息內容: ${text}`);
    return {ok: true, dry: true}
  }
  const provider = process.env.WA_PROVIDER
  if (provider === 'meta') {
    const url = `https://graph.facebook.com/v20.0/${process.env.META_WA_PHONE_ID}/messages`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.META_WA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text }
      })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }
  if (provider === 'twilio') {
    // Implementar Twilio SDK o REST aquí (placeholder)
    console.log(`[INFO] Twilio provider no implementado. Enviando a ${to}: ${text}`);
    return {ok: true, provider: 'twilio', to, text}
  }
  throw new Error('WA_PROVIDER no configurado o no soportado.')
}
