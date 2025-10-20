export async function publicar(copy, media = null) {
  if (process.env.DRY_RUN === 'true') {
    return {
      dryRun: true,
      canal: 'tiktok',
      copy,
      media,
    };
  }

  throw new Error('Integración con TikTok no implementada. Configure las credenciales y API antes de publicar.');
}

export default { publicar };
