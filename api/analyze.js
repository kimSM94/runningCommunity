// api/analyze.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
  }

  // Vercel 서버에 Secret으로 안전하게 저장된 키를 꺼내 씁니다.
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 서버에 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: req.body.messages,
        response_format: { type: "json_object" },
        max_tokens: 1200,
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('OpenAI Request Error:', error);
    res.status(500).json({ error: 'AI 분석 중 서버 오류가 발생했습니다.' });
  }
}