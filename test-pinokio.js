// test-pinokio.js
const { ejecutarPinokio } = require('./utils/pinokio-helper.cjs');

// Ruta al script de Pinokio que queremos probar
const scriptDeAgentes = 'goio-agents-pinokio/pinokio.json';

console.log('🚀 Iniciando prueba de integración de Pinokio...');
console.log('Se llamará a la función para ejecutar los agentes a través de Pinokio.');
console.log('Deberías ver mensajes de Pinokio y de los agentes si todo funciona correctamente.');

ejecutarPinokio(scriptDeAgentes);
