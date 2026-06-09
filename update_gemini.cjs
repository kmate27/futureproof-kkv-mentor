const fs = require('fs');

let code = fs.readFileSync('src/lib/gemini.js', 'utf8');

// 1. Remove all Gemini imports and genAI initialization
code = code.replace(/import \{ GoogleGenerativeAI \} from "@google\/generative-ai";\s*/g, '');
code = code.replace(/\/\/ A kulcsot a \.env fájlból olvassuk be \(VITE_GEMINI_API_KEY\)\s*const apiKey = import\.meta\.env\.VITE_GEMINI_API_KEY;\s*/g, '');
code = code.replace(/\/\/ Inicializáljuk a Gemini klienst, ha van kulcs\s*export const genAI = apiKey \? new GoogleGenerativeAI\(apiKey\) : null;\s*/g, '');

// 2. Remove all `if (!genAI) { ... }` blocks
const genAiIfBlockRegex = /if \(!genAI\) \{[\s\S]*?\}\s*(?=\s*const prompt|\s*const systemInstruction)/g;
code = code.replace(genAiIfBlockRegex, '');

// 3. Replace any remaining getGenerativeModel blocks that weren't caught
code = code.replace(
  /try\s*\{\s*const model = genAI\.getGenerativeModel\(\{ model: "gemini[^"]*" \}\);\s*const result = await model\.generateContent\([\s\S]*?\);\s*return result\.response\.text\(\);\s*\}\s*catch\s*\(error\)\s*\{/g,
  `try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Te egy professzionális magyar üzleti és pénzügyi asszisztens vagy."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    return data.text;
  } catch (error) {`
);

fs.writeFileSync('src/lib/gemini.js', code);
console.log('Script ran successfully!');
