export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, systemInstruction, maxTokens } = req.body;
    
    // Vercel környezeti változó
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY hiányzik a Vercel beállításokból.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022', // vagy claude-3-5-sonnet-20241022
        max_tokens: maxTokens || 1024,
        system: systemInstruction,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Anthropic API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return res.status(200).json({ text: data.content[0].text });
  } catch (error) {
    console.error('Claude API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
