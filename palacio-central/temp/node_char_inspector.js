import fs from 'fs/promises';
import path from 'path';

async function inspectFile() {
    try {
        const filePath = path.resolve(process.cwd(), 'ops', 'products-to-upload', 'cama-ansiedad-mascotas.md');
        const content = await fs.readFile(filePath, 'utf-8');

        if (content.length > 0) {
            const firstCharCode = content.charCodeAt(0);
            console.log(`El código del primer carácter es: ${firstCharCode}`);

            if (firstCharCode === 65279) {
                console.log("¡PROBLEMA CONFIRMADO! El archivo contiene un Byte Order Mark (BOM) de UTF-8.");
                console.log("Este carácter invisible es casi con toda seguridad la causa del fallo de la extracción.");
            } else {
                console.log("No se ha detectado un BOM. El primer carácter es normal.");
            }

            console.log("\nPrimeros 30 caracteres del archivo para inspección visual:");
            console.log(content.substring(0, 30));

        } else {
            console.log("El archivo está vacío.");
        }
    } catch (error) {
        console.error("Error al inspeccionar el archivo:", error);
    }
}

inspectFile();
