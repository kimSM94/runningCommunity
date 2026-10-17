// api/map-key.js
export default function handler(req, res) {
  const apiKey = process.env.KAKAO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '카카오 API 키가 서버에 설정되지 않았습니다.' });
  }

  res.status(200).json({ apiKey });
}