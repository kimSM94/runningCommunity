// api/verify-record.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageBase64 } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API 키가 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '이 이미지는 러닝 앱(나이키런, 가민, 스트라바 등)의 운동 기록 화면인가요? 맞다면 평균 페이스(예: 5\'30")와 거리(숫자만, km 단위)를 추출해서 반드시 아래 JSON 형식으로만 응답해 주세요. 러닝 기록 화면이 아니라면 isRunningRecord를 false로 주세요.\n{"isRunningRecord": true, "pace": "5\'30\\"", "distance": 10}'
              },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '기록 분석 중 오류가 발생했습니다.' });
  }
}