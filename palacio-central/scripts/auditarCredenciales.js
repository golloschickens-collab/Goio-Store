import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const keyMatchers = [
  'app_id',
  'app_secret',
  'access_token',
  'user_access_token',
  'long_lived_user_token',
  'page_access_token',
  'system_user_id',
  'system_user_token',
  'callback_url',
  'verify_token',
  'waba_id',
  'phone_number_id',
  'api_key',
  'aws.access_key_id',
  'aws.secret_access_key',
  'shopify_api_key',
  'shopify_api_secret',
  'shopify_admin_token',
  'shopify_admin_token_prod',
  'shopify_admin_token_dev',
  'shopify_domain_prod',
  'shopify_domain_dev'
];

const placeholderPatterns = /(TO_FILL|CONFIGURAR|PENDIENTE|TU_|RELLENAR|TO_COMPLETE|TBD|TO_DO|POR_COMPLETAR)/i;

const maskValue = (val) => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (trimmed.length <= 8) {
    return '*'.repeat(trimmed.length);
  }
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
};

const stripComments = (content) =>
  content
    .replace(/\/\/[^\n]*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

const matchesKey = (keyPath) => {
  const lower = keyPath.toLowerCase();
  return keyMatchers.some((matcher) => {
    if (matcher.includes('.')) {
      return matcher
        .split('.')
        .every((part) => lower.includes(part));
    }
    return lower.endsWith(matcher);
  });
};

const inspectValue = (value, pathParts, fileRel, entries, fileStates) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      inspectValue(v, pathParts.concat(k), fileRel, entries, fileStates);
    }
    return;
  }
  if (typeof value === 'string') {
    const keyPath = pathParts.join('.');
    if (matchesKey(keyPath)) {
      const status = placeholderPatterns.test(value) ? 'placeholder' : 'vigente';
      const lastKey = pathParts[pathParts.length - 1];
      let line = null;
      const state = fileStates[fileRel];
      if (state && state.type === 'json') {
        const pattern = `"${lastKey}"`;
        let idx = state.sanitized.indexOf(pattern, state.searchIndex);
        if (idx === -1) {
          idx = state.sanitized.indexOf(pattern);
        }
        if (idx !== -1) {
          state.searchIndex = idx + pattern.length;
          const snippet = state.sanitized.slice(0, idx);
          line = snippet.split(/\r?\n/).length;
        }
      }
      entries.push({
        file: fileRel,
        key: keyPath,
        line,
        valuePreview: maskValue(value),
        status
      });
    }
  }
};

const collectTargets = () => {
  const targets = [];
  const addFile = (rel, type = 'json') => {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs)) {
      targets.push({ rel, abs, type });
    }
  };

  addFile('config/social_credentials.json');
  addFile('config/keys.json');

  const envPath = '.env';
  if (fs.existsSync(envPath)) {
    addFile(envPath, 'env');
  }

  const collectJson = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const abs = path.join(dir, entry);
      const rel = path.relative(root, abs);
      if (fs.statSync(abs).isFile()) {
        const ext = path.extname(entry).toLowerCase();
        if (ext === '.json' || ext === '.jsonc') {
          if (!targets.find((t) => t.abs === abs)) {
            targets.push({ rel, abs, type: 'json' });
          }
        }
      }
    }
  };

  collectJson('config');
  collectJson('ops');

  return targets;
};

const run = () => {
  const targets = collectTargets();
  const entries = [];
  const fileStates = {};

  for (const target of targets) {
    try {
      if (target.type === 'json') {
        let content = fs.readFileSync(target.abs, 'utf8');
        content = stripComments(content);
        const data = JSON.parse(content);
        fileStates[target.rel] = {
          type: 'json',
          sanitized: content,
          searchIndex: 0
        };
        inspectValue(data, [], target.rel, entries, fileStates);
      } else if (target.type === 'env') {
        const lines = fs.readFileSync(target.abs, 'utf8').split(/\r?\n/);
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const [rawKey, ...rest] = trimmed.split('=');
          const value = rest.join('=').trim();
          const keyPath = rawKey.trim();
          if (matchesKey(keyPath)) {
            const status = placeholderPatterns.test(value) ? 'placeholder' : 'vigente';
            entries.push({
              file: target.rel,
              key: keyPath,
              line: index + 1,
              valuePreview: maskValue(value),
              status
            });
          }
        });
      }
    } catch (error) {
      entries.push({ file: target.rel, error: error.message });
    }
  }

  const timestamp = new Date().toISOString();
  const report = {
    generated_at: timestamp,
    root,
    entries
  };

  const reportDir = path.join(root, 'logs', 'imperial', 'operations');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportName = `AUDITORIA_CREDENCIALES-${timestamp.slice(0, 10)}.json`;
  const reportPath = path.join(reportDir, reportName);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify({ entries: entries.length, report: reportName }, null, 2));
};

run();
