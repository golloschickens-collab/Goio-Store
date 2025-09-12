import { api, headersJSON } from './_shopify.js';
import fetch from 'node-fetch'; // Using node-fetch for consistency with other scripts, can be changed to axios if preferred

const customerEmail = process.argv[2];
const variantId = process.argv[3];
const quantity = parseInt(process.argv[4], 10);

if (!customerEmail || !variantId || isNaN(quantity) || quantity <= 0) {
  console.error('Uso: node scripts/create-draft-invoice.js <email_cliente> <variant_id> <cantidad>');
  process.exit(1);
}

async function createDraftInvoice(email, variantId, quantity) {
  console.log(`Creando borrador de factura para ${email} con variant_id ${variantId} y cantidad ${quantity}...`);

  try {
    // 1. Crear borrador de pedido
    const draftOrderUrl = api('draft_orders.json');
    const draftOrderBody = {
      draft_order: {
        line_items: [
          {
            variant_id: variantId,
            quantity: quantity
          }
        ],
        customer: {
          email: email
        }
      }
    };

    const draftOrderResponse = await fetch(draftOrderUrl, {
      method: 'POST',
      headers: headersJSON,
      body: JSON.stringify(draftOrderBody)
    });

    const draftOrderData = await draftOrderResponse.json();

    if (!draftOrderResponse.ok) {
      console.error('❌ Error al crear borrador de pedido:', draftOrderData.errors ? JSON.stringify(draftOrderData.errors) : draftOrderResponse.statusText);
      return null;
    }

    const draftOrderId = draftOrderData.draft_order.id;
    console.log(`✅ Borrador de pedido creado. ID: ${draftOrderId}`);

    // 2. Enviar factura
    const sendInvoiceUrl = api(`draft_orders/${draftOrderId}/send_invoice.json`);
    const sendInvoiceBody = {
      draft_order_invoice: {
        to: email
      }
    };

    const sendInvoiceResponse = await fetch(sendInvoiceUrl, {
      method: 'POST',
      headers: headersJSON,
      body: JSON.stringify(sendInvoiceBody)
    });

    const sendInvoiceData = await sendInvoiceResponse.json();

    if (!sendInvoiceResponse.ok) {
      console.error('❌ Error al enviar factura:', sendInvoiceData.errors ? JSON.stringify(sendInvoiceData.errors) : sendInvoiceResponse.statusText);
      return null;
    }

    console.log(`✅ Factura enviada a ${email}.`);
    return draftOrderData.draft_order;

  } catch (error) {
    console.error('❌ Excepción al crear o enviar factura:', error.message);
    return null;
  }
}

createDraftInvoice(customerEmail, variantId, quantity);