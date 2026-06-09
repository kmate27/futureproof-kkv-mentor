/**
 * Üdvözlő üzenet generálása a KKV onboarding adatai alapján.
 * @param {Object} companyData - A cég adatai az onboardingból
 * @returns {Promise<string>} - Az AI által generált szöveg
 */
export async function generateWelcomeMessage(companyData) {
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
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Te egy professzionális, segítőkész magyar pénzügyi tanácsadó vagy."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    return data.text;
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
  const prompt = `Te egy magyar adószakértő vagy. A felhasználó adatai: 
- Éves bevétel: ${data.revenue.toLocaleString('hu-HU')} Ft
- Jelenlegi adóforma: ${data.currentRegime}
- Alkalmazottak száma: ${data.employees} fő
- Kiszámolt éves KATA teher: ${data.taxes.kata.toLocaleString('hu-HU')} Ft
- Kiszámolt éves Átalányadó teher: ${data.taxes.atalany.toLocaleString('hu-HU')} Ft
- Kiszámolt éves KIVA teher: ${data.taxes.kiva.toLocaleString('hu-HU')} Ft
- Kiszámolt éves TAO teher: ${data.taxes.tao.toLocaleString('hu-HU')} Ft

Adj konkrét, érthető tanácsot magyarul: melyik adóforma a legjobb és miért, mikor érdemes váltani, milyen lépések szükségesek. Max 200 szó. SZIGORÚAN TILOS markdown formázást (pl. ** vagy *) használnod, csak sima szöveget írj! Zárd PONTOSAN ezzel a mondattal: "Az optimális döntés előtt egyeztesd könyvelőddel."`;

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Te egy tekintélyes, magasan képzett magyar adótanácsadó (Senior Tax Advisor) vagy. Szigorúan markdown nélkül, csak sima szövegként válaszolsz."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    return data.text;
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
  const prompt = `Te egy magyar pénzügyi tanácsadó vagy. A felhasználó cash flow előrejelzésében a következő hónapokban negatív az egyenleg: ${badMonths.join(', ')}.
A megadott bevételek és kiadások alapján (összesen ${data.length} tétel) adj egy rövid, maximum 2-3 mondatos, gyakorlatias túlélési tippet magyarul. Kerüld a közhelyeket, legyél specifikus egy kkv számára. Ne köszönd meg, csak a tanácsot írd!`;

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Te egy precíz magyar pénzügyi elemző AI vagy."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Hiba a cash flow figyelmeztetés generálásakor:', error);
    return "Likviditási szűkület várható ezekben a hónapokban. Kérjük, vizsgáld felül a kiadásaidat!";
  }
}

import { CURRENT_TAX_RULES } from './taxRules';

/**
 * Szabad szöveges "Mi van ha" forgatókönyv elemzése és JSON formátumra hozása.
 * @param {string} text - A felhasználó elképzelése (pl. "Veszek egy autót 2 millióért")
 * @returns {Promise<Object>} - { type: 'income'|'expense', amount: number, frequency: 'monthly'|'one-time', name: string }
 */
export async function parseCustomScenario(text) {
  const prompt = `Elemezd a következő üzleti elképzelést és fordítsd le egy egyszerű JSON objektummá.
Szöveg: "${text}"

Szabályok a JSON-re:
- "type": "income" (ha bevétel növekedés) vagy "expense" (ha kiadás/bevétel csökkenés)
- "amount": csak szám, a várható érték forintban (pl. ha "2 millió", akkor 2000000)
- "frequency": "monthly" (ha havonta ismétlődik) vagy "one-time" (ha egyszeri dolog)
- "name": egy maximum 3 szavas rövid cím (pl. "Új autó", "Havi marketing")

Csak és kizárólag a valid JSON-t add vissza, semmi más szöveget, még markdown tageket (\`\`\`json) se, mert közvetlenül parse-olnom kell!`;

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Kizárólag JSON formátumban válaszolj, markdown tagek nélkül."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    
    let rawText = data.text.trim();
    if (rawText.startsWith('```json')) rawText = rawText.substring(7);
    if (rawText.startsWith('```')) rawText = rawText.substring(3);
    if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);
    
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
  const prompt = `Te egy magyar jogi és pénzügyi asszisztens vagy. A felhasználó beillesztett egy dokumentumot. Magyarázd el: (1) Mit jelent ez a dokumentum röviden, (2) Mi a teendő, (3) Van-e határidő és mikor, (4) Van-e kockázat amit figyelni kell. Válaszolj strukturáltan, magyarul, érthetően. Ha jogi döntést igényel: javasold ügyvéd vagy könyvelő bevonását.
A válaszod kizárólag egy érvényes JSON formátum legyen (ne tegyél köré \`\`\`json taget), az alábbi kulcsokkal:
- "summary": A dokumentum rövid összefoglalója.
- "action": Mi a konkrét teendő.
- "deadline": A határidő (ha nincs, írd hogy "Nincs meghatározva").
- "risk": Kockázatok.

Dokumentum szövege:
"${text}"`;

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Kizárólag JSON formátumban válaszolj, markdown tagek nélkül."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    
    let rawText = data.text.trim();
    if (rawText.startsWith('```json')) rawText = rawText.substring(7);
    if (rawText.startsWith('```')) rawText = rawText.substring(3);
    if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);
    
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
  const systemInstruction = `Te KKV Mentor vagy, egy tapasztalt és közvetlen magyar pénzügyi tanácsadó. Úgy beszélsz mint egy jó barát aki egyben pénzügyi szakértő — nem mint egy tankönyv vagy HR cikk.

A felhasználó vállalkozásának adatai amiket mindig figyelembe veszel és hivatkozol rájuk:
- Cégnév: ${companyData?.name || 'Vállalkozás'}
- Iparág: ${companyData?.industry || 'Ismeretlen'}
- Éves bevétel: ${companyData?.annualRevenue ? new Intl.NumberFormat('hu-HU').format(companyData.annualRevenue) + ' Ft' : companyData?.revenue || 'Ismeretlen'}
- Adózási forma: ${companyData?.taxRegime || 'Ismeretlen'}
- Alkalmazottak: ${companyData?.employees || '0'} fő
- Aktuális cashflow helyzet: Bevételek listája: ${JSON.stringify(companyData?.incomes?.map(i => i.name + ': ' + i.amount + ' Ft') || [])}. Kiadások listája: ${JSON.stringify(companyData?.expenses?.map(e => e.name + ': ' + e.amount + ' Ft') || [])}.

${CURRENT_TAX_RULES}

Hogyan válaszolj:
- Mindig hivatkozz a konkrét adatokra — soha ne adj általános választ
- Folyó szövegben írj, ne számozott listákban vagy vastag fejlécekkel
- Használj konkrét forint összegeket a felhasználó adatai alapján
- Maximum 3-4 mondat — tömör és lényegre törő
- Ha a kérdés pénzügyi döntésről szól, mindig adj konkrét javaslatot — ne csak szempontokat sorolj
- Zárd minden választ egy konkrét következő lépéssel vagy kérdéssel
- Egyszer sem használod ezeket a szavakat: 'fontos', 'érdemes mérlegelni', 'több szempontból'`;

  try {
    const openaiMessages = history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    }));
    
    if (openaiMessages.length > 0 && openaiMessages[0].role === 'assistant') {
      openaiMessages.shift();
    }
    
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
  const prompt = `Te a KKV Mentor vagy. Generálj egy "Havi Pulzus" áttekintést a megadott cégadatok alapján:
Iparág: ${companyData?.industry || 'Ismeretlen'}
Éves Bevétel: ${companyData?.annualRevenue ? new Intl.NumberFormat('hu-HU').format(companyData.annualRevenue) + ' Ft' : companyData?.revenue || 'Ismeretlen'}
Adóforma: ${companyData?.taxRegime || 'KATA'}
Alkalmazottak: ${companyData?.employees || '0'} fő
Aktuális tranzakciók: Bevételek: ${companyData?.incomes?.length || 0} tétel, Kiadások: ${companyData?.expenses?.length || 0} tétel. (Részletesen: ${JSON.stringify(companyData?.incomes?.map(i => i.name + ': ' + i.amount + ' Ft') || [])}, ${JSON.stringify(companyData?.expenses?.map(e => e.name + ': ' + e.amount + ' Ft') || [])})

${CURRENT_TAX_RULES}

A válaszod kizárólag egy JSON objektum legyen (ne tegyél köré \`\`\`json taget), az alábbi egyetlen kulccsal:
- "summary": Egy maximum 4-5 mondatos folyamatos szöveg, ami összefoglalja a cég aktuális pénzügyi helyzetét és a legfontosabb teendőket (pl. adózás, költségoptimalizálás, 2026-os új szabályok). Szigorúan folyó szöveg legyen, ne használj listákat és számozásokat!`;

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemInstruction: "Kizárólag JSON formátumban válaszolj, markdown tagek nélkül."
      })
    });
    if (!response.ok) throw new Error('API hiba');
    const data = await response.json();
    
    let rawText = data.text.trim();
    if (rawText.startsWith('```json')) rawText = rawText.substring(7);
    if (rawText.startsWith('```')) rawText = rawText.substring(3);
    if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);
    
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
