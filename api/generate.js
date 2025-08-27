export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { prompt, model = 'claude-sonnet-4-20250514', max_tokens = 1500 } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing API key (ANTHROPIC_API_KEY not set)' });

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await anthropicResponse.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Server proxy error:', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
}
