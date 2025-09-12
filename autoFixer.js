// autoFixer.js
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const watchDir = path.resolve(__dirname, 'scripts'); // Cambia esto si tus scripts están en otra carpeta

function fixSyntaxError(filePath, errorMsg) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (errorMsg.includes('Unexpected token') && content.includes('import')) {
    const fixed = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"']+)['"]/g, 'const { $1 } = require("$2")');
    fs.writeFileSync(filePath, fixed, 'utf8');
    logFix(filePath, 'Reemplazo de import por require');
  }
}

function logFix(file, msg) {
  const log = `[${new Date().toISOString()}] ${file}: ${msg}\n`;
  // Ensure logs directory exists
  const logDir = path.resolve(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  fs.appendFileSync(path.resolve(logDir, 'autoFix.log'), log);
}

function runScript(filePath) {
  const proc = spawn('node', [filePath]);

  let errorOutput = '';
  proc.stderr.on('data', data => {
    errorOutput += data.toString();
  });

  proc.on('close', code => {
    if (code !== 0) {
      fixSyntaxError(filePath, errorOutput);
      runScript(filePath); // Reintenta después de corregir
    }
  });
}

function startWatcher() {
  // Ensure watch directory exists
  if (!fs.existsSync(watchDir)) {
      console.log(`Directorio a vigilar no encontrado: ${watchDir}. Creándolo...`);
      fs.mkdirSync(watchDir, { recursive: true });
  }
  fs.watch(watchDir, (event, filename) => {
    if (filename && filename.endsWith('.js')) {
      const fullPath = path.join(watchDir, filename);
      if (fs.existsSync(fullPath)) {
        runScript(fullPath);
      }
    }
  });
  console.log(`👀 autoFixer vigilando la carpeta: ${watchDir}`);
}

startWatcher();