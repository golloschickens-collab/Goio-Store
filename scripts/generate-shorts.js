import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateShorts() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "La variable de entorno GEMINI_API_KEY no está definida. Por favor, añádela a tu archivo .env."
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const promptPath = path.join(__dirname, "..", "prompts", "shorts-prompt.md");
    const prompt = await fs.readFile(promptPath, "utf-8");

    console.log("Generando contenido con la IA de Gemini... Esto puede tardar unos momentos.");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const outputPath = path.join(__dirname, "..", "ops", "artifacts", "generated-shorts.md");
    await fs.writeFile(outputPath, text);

    console.log(`\n✅ ¡Contenido generado con éxito!`);
    console.log(`El resultado ha sido guardado en: ${outputPath}`);
    console.log("\n--- INICIO DEL CONTENIDO GENERADO ---\n");
    console.log(text);
    console.log("\n--- FIN DEL CONTENIDO GENERADO ---");

  } catch (error) {
    console.error("❌ Error al generar el contenido:", error.message);
  }
}

generateShorts();
