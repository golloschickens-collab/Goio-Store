import fetch from 'node-fetch';

const META_GRAPH_VERSION = 'v19.0';

function getWhatsAppConfig() {
  const phoneId = process.env.META_WHATSAPP_PHONE_ID;
  const token = process.env.META_WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN_GOIO || process.env.META_ACCESS_TOKEN_GOLLOS;

  return { phoneId, token };
}

export async function enviar(copy, telefonoDestino = process.env.WHATSAPP_DEFAULT_RECIPIENT) {
  if (!copy) {
    throw new Error('Mensaje vacío. No se puede enviar a WhatsApp.');
  }

  if (process.env.DRY_RUN === 'true') {
    return {
      dryRun: true,
      canal: 'whatsapp',
      copy,
      telefonoDestino,
    };
  }

  const { phoneId, token } = getWhatsAppConfig();
  if (!phoneId || !token) {
    throw new Error('Faltan configuraciones META_WHATSAPP_PHONE_ID o META_WHATSAPP_TOKEN para enviar mensajes.');
  }

  if (!telefonoDestino) {
    throw new Error('No se especificó destinatario para WhatsApp.');
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${phoneId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: telefonoDestino,
      type: 'text',
      text: { body: copy },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data?.error?.message ?? 'Error desconocido al enviar mensaje por WhatsApp.';
    throw new Error(errorMessage);
  }

  return data;
}

export default { enviar };
