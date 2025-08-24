import fetch from 'node-fetch';
import config from './config.js';

async function postToFacebook(message, link) {
    const { pageId, accessToken } = config.socialMedia.facebook;

    if (!pageId || !accessToken) {
        console.warn("Advertencia: Las credenciales de Facebook no están configuradas. Saltando publicación.");
        return;
    }

    const url = `https://graph.facebook.com/${pageId}/feed`;

    const params = new URLSearchParams({
        message: message,
        link: link,
        access_token: accessToken,
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'POST',
        });

        const data = await response.json();

        if (data.error) {
            console.error('Error al publicar en Facebook:', data.error);
            throw new Error(data.error.message);
        }

        console.log('Publicado en Facebook con éxito:', data);
        return data;
    } catch (error) {
        console.error('Error en la función postToFacebook:', error);
        throw error;
    }
}

export { postToFacebook };
