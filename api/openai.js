export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, systemInstruction } = req.body;
    
    // Vercel környezeti változó
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY hiányzik a Vercel beállításokból.' });
    }

    // OpenAI formátum kialakítása: rendszer utasítás a legelső 'system' üzenetként
    const openaiMessages = [
      { role: 'system', content: systemInstruction },
      ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Vagy 'gpt-3.5-turbo', de a 4o-mini gyorsabb és okosabb
        messages: openaiMessages,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return res.status(200).json({ text: data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
