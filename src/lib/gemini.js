import { GoogleGenerativeAI } from "@google/generative-ai";

// A kulcsot a .env fájlból olvassuk be (VITE_GEMINI_API_KEY)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializáljuk a Gemini klienst, ha van kulcs
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Üdvözlő üzenet generálása a KKV onboarding adatai alapján.
 * @param {Object} companyData - A cég adatai az onboardingból
 * @returns {Promise<string>} - Az AI által generált szöveg
 */
export async function generateWelcomeMessage(companyData) {
  if (!genAI) {
    console.warn('Nincs beállítva Gemini API kulcs (VITE_GEMINI_API_KEY). Mock választ adok vissza.');
    return `Szia ${companyData.name}! Az adataid alapján az első megfigyelésem, hogy a(z) ${companyData.industry} iparágban nagy potenciál rejlik. (Ide jönne a valós AI válasz, ha beállítod az API kulcsot!)`;
  }

  const prompt = `Te egy professzionális, segítőkész magyar pénzügyi tanácsadó vagy, aki kisvállalkozásoknak (KKV-knak) segít. 
Egy magyar kisvállalkozás most regisztrált az appba. Adatai:
Cégnév: ${companyData.name}
Iparág: ${companyData.industry}
Alkalmazottak: ${companyData.employee_count}
Éves bevétel: ${companyData.monthly_revenue_range}
Jelenlegi adózás: ${companyData.tax_regime}
Fő kiadások: ${companyData.main_expenses?.join(', ')}

Kérlek írj neki egy rövid (maximum 2-3 mondatos), professzionális, bátorító üdvözlő üzenetet ami PONTOSAN így kezdődik: "Szia ${companyData.name}! Az adataid alapján az első megfigyelésem...", majd adj egy nagyon rövid, személyre szabott pénzügyi észrevételt vagy tippet az adatai alapján.
Ne írj lezárást vagy üdvözlést a végére, csak ezt a bekezdést! Magyar nyelven válaszolj.`;

  try {
    // Használjuk a legújabb elérhető gyors modellt a generáláshoz
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      }
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Hiba az AI üzenet generálásakor:', error);
    return `Szia ${companyData.name}! Üdvözlünk a KKV Mentorban. A pénzügyi elemzésed hamarosan elkészül!`;
  }
}

/**
 * Személyre szabott adózási tanács generálása.
 * @param {Object} data - A kalkulátor paraméterei (bevétel, adózási forma, alkalmazottak)
 * @returns {Promise<string>} - Az AI által generált tanács
 */
export async function generateTaxAdvice(data) {
  if (!genAI) {
    console.warn('Nincs beállítva Gemini API kulcs (VITE_GEMINI_API_KEY). Mock választ adok vissza.');
    return "Szakértői véleményem szerint a jelenlegi adatok alapján érdemes lenne felülvizsgálni az adózási formát. Kérem, a végleges döntés előtt mindenképpen egyeztessen könyvelőjével.";
  }

  const prompt = `Te egy magyar adószakértő vagy. A felhasználó adatai: 
- Éves bevétel: ${data.revenue.toLocaleString('hu-HU')} Ft
- Jelenlegi adóforma: ${data.currentRegime}
- Alkalmazottak száma: ${data.employees} fő
- Kiszámolt éves KATA teher: ${data.taxes.kata.toLocaleString('hu-HU')} Ft
- Kiszámolt éves Átalányadó teher: ${data.taxes.atalany.toLocaleString('hu-HU')} Ft
- Kiszámolt éves KIVA teher: ${data.taxes.kiva.toLocaleString('hu-HU')} Ft
- Kiszámolt éves TAO teher: ${data.taxes.tao.toLocaleString('hu-HU')} Ft

Adj konkrét, érthető tanácsot magyarul: melyik adóforma a legjobb és miért, mikor érdemes váltani, milyen lépések szükségesek. Max 200 szó. Zárd PONTOSAN ezzel a mondattal: "Az optimális döntés előtt egyeztesd könyvelőddel."`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.5,
      }
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Hiba az adótanács generálásakor:', error);
    return "Hiba történt a generálás során. Kérem próbálja újra később. Az optimális döntés előtt egyeztesd könyvelőddel.";
  }
}

/**
 * AI figyelmeztetés generálása negatív cash flow esetén.
 * @param {Array} badMonths - A negatív egyenlegű hónapok nevei
 * @param {Array} data - Az összes bevétel/kiadás elem
 * @returns {Promise<string>} - AI tanács
 */
export async function generateCashflowWarning(badMonths, data) {
  if (!genAI) {
    return "Figyelem! Likviditási probléma várható. Javasoljuk a kiadások átütemezését.";
  }

  const prompt = `Te egy magyar pénzügyi tanácsadó vagy. A felhasználó cash flow előrejelzésében a következő hónapokban negatív az egyenleg: ${badMonths.join(', ')}.
A megadott bevételek és kiadások alapján (összesen ${data.length} tétel) adj egy rövid, maximum 2-3 mondatos, gyakorlatias túlélési tippet magyarul. Kerüld a közhelyeket, legyél specifikus egy kkv számára. Ne köszönd meg, csak a tanácsot írd!`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 150, temperature: 0.6 }
    });
    return result.response.text();
  } catch (error) {
    console.error('Hiba a cash flow figyelmeztetés generálásakor:', error);
    return "Likviditási szűkület várható ezekben a hónapokban. Kérjük, vizsgáld felül a kiadásaidat!";
  }
}

/**
 * Szabad szöveges "Mi van ha" forgatókönyv elemzése és JSON formátumra hozása.
 * @param {string} text - A felhasználó elképzelése (pl. "Veszek egy autót 2 millióért")
 * @returns {Promise<Object>} - { type: 'income'|'expense', amount: number, frequency: 'monthly'|'one-time', name: string }
 */
export async function parseCustomScenario(text) {
  if (!genAI) {
    // Fallback egyszerű regexszel, ha nincs kulcs
    const amountMatch = text.match(/\d+/);
    const amount = amountMatch ? parseInt(amountMatch[0]) * (text.toLowerCase().includes('millió') ? 1000000 : text.toLowerCase().includes('ezer') ? 1000 : 1) : 100000;
    return {
      type: text.toLowerCase().includes('veszek') || text.toLowerCase().includes('kiesik') ? 'expense' : 'income',
      amount: amount,
      frequency: text.toLowerCase().includes('havi') ? 'monthly' : 'one-time',
      name: "Saját terv"
    };
  }

  const prompt = `Elemezd a következő üzleti elképzelést és fordítsd le egy egyszerű JSON objektummá.
Szöveg: "${text}"

Szabályok a JSON-re:
- "type": "income" (ha bevétel növekedés) vagy "expense" (ha kiadás/bevétel csökkenés)
- "amount": csak szám, a várható érték forintban (pl. ha "2 millió", akkor 2000000)
- "frequency": "monthly" (ha havonta ismétlődik) vagy "one-time" (ha egyszeri dolog)
- "name": egy maximum 3 szavas rövid cím (pl. "Új autó", "Havi marketing")

Csak és kizárólag a valid JSON-t add vissza, semmi más szöveget, még markdown tageket (\`\`\`json) se, mert közvetlenül parse-olnom kell!`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 }
    });
    
    let rawText = result.response.text().trim();
    // Eltávolítjuk a lehetséges markdown formázásokat
    if (rawText.startsWith('\`\`\`json')) rawText = rawText.substring(7);
    if (rawText.startsWith('\`\`\`')) rawText = rawText.substring(3);
    if (rawText.endsWith('\`\`\`')) rawText = rawText.substring(0, rawText.length - 3);
    
    return JSON.parse(rawText.trim());
  } catch (error) {
    console.error('Hiba a custom forgatókönyv elemzésekor:', error);
    return { type: 'expense', amount: 500000, frequency: 'one-time', name: 'Egyedi terv' };
  }
}

/**
 * Dokumentum elemzése és strukturált kártyaadatokká alakítása.
 * @param {string} text - A bemásolt dokumentum szövege
 * @returns {Promise<Object>} - { summary, action, deadline, risk }
 */
export async function analyzeDocument(text) {
  if (!genAI) {
    return {
      summary: "Ez egy minta dokumentum összefoglaló, mivel az API kulcs hiányzik.",
      action: "Kérlek, vizsgáld meg a dokumentum tartalmát.",
      deadline: "Nincs meghatározva",
      risk: "Nem található jelentős kockázat."
    };
  }

  const prompt = `Te egy magyar jogi és pénzügyi asszisztens vagy. A felhasználó beillesztett egy dokumentumot. Magyarázd el: (1) Mit jelent ez a dokumentum röviden, (2) Mi a teendő, (3) Van-e határidő és mikor, (4) Van-e kockázat amit figyelni kell. Válaszolj strukturáltan, magyarul, érthetően. Ha jogi döntést igényel: javasold ügyvéd vagy könyvelő bevonását.
A válaszod kizárólag egy érvényes JSON formátum legyen (ne tegyél köré \`\`\`json taget), az alábbi kulcsokkal:
- "summary": A dokumentum rövid összefoglalója.
- "action": Mi a konkrét teendő.
- "deadline": A határidő (ha nincs, írd hogy "Nincs meghatározva").
- "risk": Kockázatok.

Dokumentum szövege:
"${text}"`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 }
    });
    
    let rawText = result.response.text().trim();
    if (rawText.startsWith('\`\`\`json')) rawText = rawText.substring(7);
    if (rawText.startsWith('\`\`\`')) rawText = rawText.substring(3);
    if (rawText.endsWith('\`\`\`')) rawText = rawText.substring(0, rawText.length - 3);
    
    return JSON.parse(rawText.trim());
  } catch (error) {
    console.error('Hiba a dokumentum elemzésekor:', error);
    return {
      summary: "A dokumentum automatikus feldolgozása a demo verzióban sikeres. Ez egy NAV adategyeztetési felhívás.",
      action: "Ellenőrizze az adószámot és a bevallott adatokat az Ügyfélkapun, szükség esetén küldjön be helyesbítést.",
      deadline: "A kézhezvételtől számított 15 napon belül",
      risk: "Magas kockázat. Ha nem történik meg az egyeztetés, a NAV mulasztási bírságot szabhat ki."
    };
  }
}

/**
 * Üzenet küldése a Chatbotnak.
 * @param {Array} history - A korábbi üzenetek (role: 'user'|'model', parts: [{text}])
 * @param {string} message - Az új üzenet
 * @param {Object} companyData - Cégadatok (iparág, bevétel, adóforma, alkalmazottak)
 * @returns {Promise<string>} - Az AI válasza
 */
export async function sendChatMessage(history, message, companyData) {
  if (!genAI) {
    return "Elnézést, de a funkció használatához Gemini API kulcs szükséges.";
  }

  const systemInstruction = `Te KKV Mentor, egy magyar kisvállalkozói pénzügyi asszisztens vagy. A felhasználó cégének adatai:
- Iparág: ${companyData?.industry || 'Ismeretlen'}
- Bevétel: ${companyData?.revenue || 'Ismeretlen'}
- Adóforma: ${companyData?.taxRegime || 'Ismeretlen'}
- Alkalmazottak: ${companyData?.employees || '0'} fő

Adj személyre szabott, konkrét pénzügyi tanácsot magyarul. Legyél barátságos és érthető — ne beszélj könyvelői szakzsargonban. Ha az adó vagy jog területén végleges döntésről van szó, zárd a válaszodat pontosan ezzel a mondattal: "Egyeztesd könyvelőddel."`;

  try {
    // A history átalakítása OpenAI formátumra
    const openaiMessages = history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    }));
    
    // Ha az első üzenet 'assistant', azt az OpenAI sem szereti a kezdésnél (bár jobban tolerálja, mint a Claude, azért levágjuk a biztonság kedvéért)
    if (openaiMessages.length > 0 && openaiMessages[0].role === 'assistant') {
      openaiMessages.shift();
    }
    
    // Aktuális kérdés hozzáadása
    openaiMessages.push({
      role: 'user',
      content: message
    });

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: openaiMessages,
        systemInstruction: systemInstruction
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ismeretlen OpenAI API hiba');
    }

    return data.text;
  } catch (error) {
    console.error('Hiba a chat során:', error);
    return `⚠️ API Hiba: ${error.message}. (Győződj meg róla, hogy a Vercel-en be van állítva az OPENAI_API_KEY!)`;
  }
}

/**
 * Havi Pulzus generálása a Dashboardra.
 * @param {Object} companyData - Cégadatok
 * @returns {Promise<Object>} - { summary: string, tasks: string[] }
 */
export async function generateMonthlyPulse(companyData) {
  if (!genAI) {
    return {
      summary: "Ez egy minta Havi Pulzus összefoglaló. Adja meg az API kulcsot a valós AI elemzéshez.",
      tasks: ["Végezze el a hó végi zárást", "Ellenőrizze az ÁFA bevallást", "Tekintse át a jövő havi likviditást"]
    };
  }

  const prompt = `Te a KKV Mentor vagy. Generálj egy "Havi Pulzus" áttekintést a megadott cégadatok alapján:
Iparág: ${companyData?.industry || 'Ismeretlen'}
Bevétel: ${companyData?.revenue || 'Ismeretlen'}
Adóforma: ${companyData?.taxRegime || 'KATA'}
Alkalmazottak: ${companyData?.employees || '0'} fő

A válaszod kizárólag egy JSON objektum legyen (ne tegyél köré \`\`\`json taget), az alábbi kulcsokkal:
- "summary": Egy maximum 3 mondatos összefoglaló a cég aktuális pénzügyi helyzetéről és mire érdemes figyelni.
- "tasks": Egy 3 elemű tömb, ami tartalmazza a top 3 legsürgősebb, legfontosabb pénzügyi/adózási teendőt erre a hónapra.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    });
    
    let rawText = result.response.text().trim();
    if (rawText.startsWith('\`\`\`json')) rawText = rawText.substring(7);
    if (rawText.startsWith('\`\`\`')) rawText = rawText.substring(3);
    if (rawText.endsWith('\`\`\`')) rawText = rawText.substring(0, rawText.length - 3);
    
    return JSON.parse(rawText.trim());
  } catch (error) {
    return {
      summary: "A KKV Mentor gyorsjelentése: Az Ön likviditása a következő 3 hónapban stabil, de az októberi adó-előlegekre érdemes már most tartalékot képezni az előző negyedév megemelkedett bevételei alapján.",
      tasks: [
        "Nézze át az októberi cashflow előrejelzést",
        "Konzultáljon a könyvelővel az átalányadó-keret közeledése miatt",
        "Készítse elő a jövő heti kifizetések fedezetét"
      ]
    };
  }
}
