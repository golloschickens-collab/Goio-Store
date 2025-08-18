import { api, headersJSON } from './_shopify.js';
import fetch from 'node-fetch';

const target = process.env.WEBHOOK_BASE_URL || 'https://example.com';

const topics = [
  { topic: 'orders/create',           path: '/whk/orders-create' },
  { topic: 'inventory_levels/update', path: '/whk/inventory-update' },
  { topic: 'refunds/create',          path: '/whk/refunds-create' },
  { topic: 'carts/update',            path: '/whk/carts-update' }
];

for (const t of topics) {
  const res = await fetch(api('webhooks.json'), {
    method: 'POST', headers: headersJSON,
    body: JSON.stringify({ webhook: { topic: t.topic, address: `${target}${t.path}`, format: 'json' } })
  });
  console.log(t.topic, res.status, await res.text());
}