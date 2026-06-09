const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.js', 'utf8');

const regex = /try\s*\{\s*const model = genAI\.getGenerativeModel\(\{ model: "gemini-[^"]+" \}\);\s*const result = await model\.generateContent\((?:\{[\s\S]*?\}|prompt)\);\s*.*?return (?:JSON\.parse\(rawText\.trim\(\)\)|result\.response\.text\(\));\s*\}\s*catch\s*\(error\)\s*\{/g;

// Unfortunately the code inside catch varies (returning strings vs objects), so a simple global regex is risky.
// Let's just manually replace the entire file with a cleanly rewritten version.
