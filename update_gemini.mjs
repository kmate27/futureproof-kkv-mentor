import fs from 'fs';
let code = fs.readFileSync('src/lib/gemini.js', 'utf8');

// Replace standard generateContent blocks with OpenAI fetch
code = code.replace(
  /const model = genAI\.getGenerativeModel\(\{ model: "gemini-[^"]+" \}\);\s*const result = await model\.generateContent\((?:\{[\s\S]*?\}|prompt)\);\s*return result\.response\.text\(\);/g,
  `const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Te egy profi magyar pénzügyi AI asszisztens vagy."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    return data.text;`
);

// Specifically for generateMonthlyPulse (JSON output)
code = code.replace(
  /const model = genAI\.getGenerativeModel\(\{ model: "gemini-[^"]+" \}\);\s*const result = await model\.generateContent\((?:\{[\s\S]*?\}|prompt)\);\s*let rawText = result\.response\.text\(\)\.trim\(\);[\s\S]*?return JSON\.parse\(rawText\.trim\(\)\);/,
  `const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Te egy profi pénzügyi elemző AI vagy, kizárólag JSON formátumban válaszolsz."
      })
    });
    if (!response.ok) throw new Error('API hiba a Havi Pulzus generálásakor');
    const data = await response.json();
    const cleanJson = data.text.replace(/\\`\\`\\`json\\n?|\\`\\`\\`/g, '').trim();
    return JSON.parse(cleanJson);`
);

fs.writeFileSync('src/lib/gemini.js', code);
console.log('gemini.js updated successfully.');
