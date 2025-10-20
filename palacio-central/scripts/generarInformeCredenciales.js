import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'logs', 'imperial', 'operations');

const ensureLatestAudit = () => {
  if (!fs.existsSync(reportDir)) {
    throw new Error('No existe el directorio de auditorías. Ejecuta primero auditarCredenciales.');
  }
  const files = fs
    .readdirSync(reportDir)
    .filter((name) => name.startsWith('AUDITORIA_CREDENCIALES-') && name.endsWith('.json'))
    .sort();
  if (!files.length) {
    throw new Error('No se encontró ningún reporte AUDITORIA_CREDENCIALES.');
  }
  return path.join(reportDir, files[files.length - 1]);
};

const actionMap = {
  'meta_business.system_user_id': 'Localizar el ID numérico del System User activo en Meta Business Manager (Configuración empresarial → Usuarios → Usuarios del sistema) y copiarlo tal cual.',
  'meta_business.system_user_token': 'Generar un token de usuario del sistema de larga duración con permisos pages_manage_posts, pages_manage_metadata, pages_read_engagement, instagram_basic, instagram_content_publish, instagram_manage_messages, whatsapp_business_messaging.',
  'meta_business.webhook.callback_url': 'Configurar la URL HTTPS pública del webhook imperial (por ejemplo https://api.goio.com/imperio/meta/webhook) asegurando disponibilidad 24/7.',
  'meta_business.webhook.verify_token': 'Definir una cadena secreta aleatoria (32+ caracteres) para validación de webhooks y actualizar tanto en Meta como en el backend.',
  'instagram.gollos_chickens.user_access_token': 'Obtener un token de usuario de Instagram para @gollos_chickens mediante la app Facebook correspondiente y extenderlo a long-lived.',
  'instagram.gollos_chickens.long_lived_user_token': 'Intercambiar el token de usuario por una versión long-lived (60 días) para @gollos_chickens utilizando la API Graph.',
  'instagram.goio_store.user_access_token': 'Generar token de usuario de Instagram para @goio_store autorizado por la app correcta y extenderlo.',
  'instagram.goio_store.long_lived_user_token': 'Intercambiar el token de @goio_store por un long-lived (60 días) mediante endpoint /access_token.',
  'facebook.goio_store.app_secret': 'Copiar el App Secret real del Facebook App "Goio Store" desde Meta for Developers → Settings → Basic.',
  'facebook.goio_store.page_access_token': 'Generar un token de página de larga duración para la página de Facebook Goio Store con permisos pages_manage_posts, pages_read_engagement, pages_show_list.',
  'whatsapp_business.gollos_chickens.waba_id': 'Ingresar el WABA ID (ID del administrador de WhatsApp Business) asociado a @gollos_chickens desde Meta Business Manager.',
  'whatsapp_business.gollos_chickens.phone_number_id': 'Configurar el Phone Number ID del número conectado en WhatsApp Cloud API (Meta Business Manager → WhatsApp → Número).',
  'whatsapp_business.gollos_chickens.api_key': 'Copiar el token de acceso (permanent access token) del número de WhatsApp Cloud API usado para @gollos_chickens.',
  'shopify.gollos_chickens.api_key': 'Registrar la Admin API access token (API key) de la app privada/personalizada en la tienda Shopify gollos-chickens con scopes read_products, write_products, read_inventory, write_inventory, read_fulfillments, write_fulfillments.',
  'shopify.gollos_chickens.access_token': 'Registrar la Admin API access token (password) de la app en gollos-chickens con los mismos scopes de productos e inventario.',
  'shopify.goio_store.api_key': 'Registrar la Admin API access token (API key) de la app para la tienda Shopify goio-store con scopes read_products, write_products, read_inventory, write_inventory, read_orders, write_orders.',
  'shopify.goio_store.access_token': 'Capturar la Admin API access token (password) de la app en goio-store con scopes anteriores.',
  'shopify.api_key': 'Sincronizar la API key utilizada por la app centralizada en configuracion-real.json con scopes de productos, inventario y pedidos.',
  'shopify.access_token': 'Sincronizar el token de acceso Admin API correspondiente en configuracion-real.json con los mismos scopes definidos.',
  'aws.access_key_id': 'Crear o recuperar una Access Key ID para un usuario IAM con políticas AmazonS3FullAccess, AmazonEC2FullAccess y AmazonSNSFullAccess, según manual imperial.',
  'aws.secret_access_key': 'Registrar el Secret Access Key asociado a la Access Key ID anterior de IAM y almacenarlo cifrado.'
};

const systemBuckets = {
  meta: new Set([
    'meta_business.system_user_id',
    'meta_business.system_user_token',
    'meta_business.webhook.callback_url',
    'meta_business.webhook.verify_token',
    'instagram.gollos_chickens.user_access_token',
    'instagram.gollos_chickens.long_lived_user_token',
    'instagram.goio_store.user_access_token',
    'instagram.goio_store.long_lived_user_token',
    'facebook.goio_store.app_secret',
    'facebook.goio_store.page_access_token',
    'whatsapp_business.gollos_chickens.waba_id',
    'whatsapp_business.gollos_chickens.phone_number_id',
    'whatsapp_business.gollos_chickens.api_key'
  ]),
  shopify: new Set([
    'shopify.gollos_chickens.api_key',
    'shopify.gollos_chickens.access_token',
    'shopify.goio_store.api_key',
    'shopify.goio_store.access_token',
    'shopify.api_key',
    'shopify.access_token'
  ]),
  aws: new Set([
    'aws.access_key_id',
    'aws.secret_access_key'
  ])
};

const normalizePath = (p) => p.replace(/\\/g, '/');

const generateReport = () => {
  const auditPath = ensureLatestAudit();
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  const deduped = new Map();
  for (const entry of audit.entries) {
    if (entry.status === 'vigente' || !entry.key) continue;
    const normalizedFile = normalizePath(entry.file);
    const key = `${normalizedFile}|${entry.line ?? ''}|${entry.key}`;
    if (!deduped.has(key)) {
      deduped.set(key, {
        ...entry,
        file: normalizedFile
      });
    }
  }

  const pending = Array.from(deduped.values()).sort((a, b) => {
    if (a.file === b.file) {
      return (a.line || 0) - (b.line || 0);
    }
    return a.file.localeCompare(b.file);
  });

  const lines = [];
  const metaMissing = new Set();
  const shopifyMissing = new Set();
  const awsMissing = new Set();
  const envMissing = [];

  for (const entry of pending) {
    const action = actionMap[entry.key] || 'Definir instrucción específica pendiente con el equipo técnico.';
    if (systemBuckets.meta.has(entry.key)) metaMissing.add(entry.key);
    if (systemBuckets.shopify.has(entry.key)) shopifyMissing.add(entry.key);
    if (systemBuckets.aws.has(entry.key)) awsMissing.add(entry.key);
    if (entry.file.endsWith('.env')) envMissing.push(entry.key);

    lines.push(`Archivo: ${entry.file}`);
    lines.push(`Línea: ${entry.line ?? 'N/D'}`);
    lines.push(`Clave: ${entry.key}`);
    lines.push(`Estado: ${entry.status}`);
    lines.push(`Acción requerida: ${action}`);
    lines.push('');
  }

  lines.push('Resumen por sistema:');
  lines.push('- Meta (Facebook/Instagram/WhatsApp):');
  if (metaMissing.size) {
    lines.push(`  Claves pendientes (${metaMissing.size}):`);
    for (const key of metaMissing) {
      lines.push(`  • ${key}: ${actionMap[key]}`);
    }
    lines.push('  Permisos mínimos: pages_manage_posts, pages_manage_metadata, pages_read_engagement, instagram_basic, instagram_content_publish, instagram_manage_messages, whatsapp_business_messaging.');
  } else {
    lines.push('  No hay claves Meta pendientes.');
  }

  lines.push('- Shopify:');
  if (shopifyMissing.size) {
    lines.push(`  Claves pendientes (${shopifyMissing.size}):`);
    for (const key of shopifyMissing) {
      lines.push(`  • ${key}: ${actionMap[key]}`);
    }
    lines.push('  Scopes requeridos: read_products, write_products, read_inventory, write_inventory, read_orders, write_orders, read_fulfillments, write_fulfillments.');
  } else {
    lines.push('  No hay claves Shopify pendientes.');
  }

  lines.push('- AWS/Infraestructura:');
  if (awsMissing.size) {
    lines.push(`  Claves pendientes (${awsMissing.size}):`);
    for (const key of awsMissing) {
      lines.push(`  • ${key}: ${actionMap[key]}`);
    }
    lines.push('  Políticas sugeridas: AmazonS3FullAccess, AmazonEC2FullAccess, AmazonSNSFullAccess (ajustar según mínimo privilegio).');
  } else {
    lines.push('  No hay credenciales AWS pendientes.');
  }

  lines.push('-.env:');
  if (envMissing.length) {
    const uniqueEnv = Array.from(new Set(envMissing));
    lines.push('  Variables críticas aún pendientes:');
    for (const key of uniqueEnv) {
      lines.push(`  • ${key}`);
    }
  } else {
    lines.push('  Todas las variables críticas del .env están completas.');
  }

  const outputName = `INFORME_ACCIONES_CREDENCIALES-${audit.generated_at.slice(0, 10)}.txt`;
  const outputPath = path.join(reportDir, outputName);
  fs.writeFileSync(outputPath, lines.join('\n'));
  console.log(JSON.stringify({
    audit: path.basename(auditPath),
    informe: path.basename(outputPath),
    pendientes: pending.length
  }, null, 2));
};

generateReport();
