// Callback endpoint para autenticación de Shopify
export default async function handler(req, res) {
  try {
    // TODO: implementar lógica de callback OAuth
    res.status(200).json({ ok: true, message: 'Callback de Shopify recibido' });
  } catch (error) {
    console.error('Error en callback de Shopify:', error);
    res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}
