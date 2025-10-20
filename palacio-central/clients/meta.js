import fetch from 'node-fetch';
import { config as globalConfig } from '../scripts/config.js';

const META_GRAPH_VERSION = 'v19.0';

export async function publicar(copy, media = null) {
  const pageId = globalConfig.socialMedia?.facebook?.pageId;
  const accessToken = globalConfig.socialMedia?.facebook?.accessToken;

  if (!pageId || !accessToken) {
    throw new Error('Credenciales de Facebook no configuradas (FACEBOOK_PAGE_ID / FACEBOOK_ACCESS_TOKEN).');
  }

  if (!copy || typeof copy !== 'string') {
    throw new Error('Contenido de copy inválido para publicar en Meta.');
  }

  if (process.env.DRY_RUN === 'true') {
    return {
      dryRun: true,
      canal: 'meta',
      copy,
      media,
    };
  }

  const endpoint = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pageId}/feed`;
  const body = {
    message: copy,
    access_token: accessToken,
  };

  if (media?.link) {
    body.link = media.link;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data?.error?.message ?? 'Error desconocido al publicar en Meta.';
    throw new Error(errorMessage);
  }

  return data;
}

export default { publicar };
