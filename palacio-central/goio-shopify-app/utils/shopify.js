// Utilidades para integrar con Shopify
export const getShopifyAuthUrl = ({ shop, clientId, scopes, redirectUri }) => {
  const base = `https://${shop}/admin/oauth/authorize`;
  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes.join(','),
    redirect_uri: redirectUri,
  });
  return `${base}?${params.toString()}`;
};

export const verifyHmac = (params, secret) => {
  // TODO: implementar verificación HMAC
  return true;
};
