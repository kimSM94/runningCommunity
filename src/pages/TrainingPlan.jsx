import React, { useState } from 'react';

export default function TrainingPlan() {
  const [distance, setDistance] = useState('FULL');
  const [dDay, setDDay] = useState(30);
  const [targetHours, setTargetHours] = useState(3);
  const [targetMinutes, setTargetMinutes] = useState(59);
  
  // 💡 여러 장의 이미지를 관리하는 상태 배열
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // AI 분석 상태 관리
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // 💡 1. 여러 장의 이미지 선택 핸들러
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // 기존 이미지에 새로 선택한 이미지들 추가 (최대 5장 제한 등 필요시 조절 가능)
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // 💡 2. 특정 이미지 삭제 핸들러
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 💡 3. 파일을 Base64로 변환하는 유틸 함수
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 💡 4. Vercel 백엔드를 통한 안전한 AI 분석 요청
  const analyzeWithOpenAI = async () => {
    if (imageFiles.length === 0) {
      alert('러닝 기록이나 랩 통계 캡처본을 최소 1장 이상 업로드해주세요!');
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const base64Images = await Promise.all(
        imageFiles.map(file => convertFileToBase64(file))
      );

      const contentArray = [
        {
          type: "text",
          text: `목표 코스: ${distance}\n목표 기록: ${targetHours}시간 ${targetMinutes}분\n대회까지 남은 기간: D-${dDay}\n첨부된 여러 장의 러닝 기록 및 랩 통계 스크린샷들을 종합적으로 분석하여 현재 페이스 유지력, 강약 조절 능력, 목표 달성 가능성을 진단하고 앞으로 지켜야 할 일일 훈련 숙제 4가지를 JSON으로 짜주세요.\n\n반드시 아래 JSON 형식만 반환하세요:\n{\n  "feedback": "종합 분석 및 가능성 진단 코멘트 (3~4문장)",\n  "plan": [\n    { "dayLabel": "D-30 (오늘)", "title": "훈련 제목", "description": "상세 내용" },\n    { "dayLabel": "D-29 (내일)", "title": "훈련 제목", "description": "상세 내용" },\n    { "dayLabel": "D-28", "title": "훈련 제목", "description": "상세 내용" },\n    { "dayLabel": "D-27", "title": "훈련 제목", "description": "상세 내용" }\n  ]\n}`
        }
      ];

      base64Images.forEach((base64Str) => {
        contentArray.push({
          type: "image_url",
          image_url: { url: base64Str }
        });
      });

      // 🚨 OpenAI 대신 나의 Vercel 백엔드 API로 요청 (키 노출 X)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "당신은 전문 마라톤 수석 코치입니다. 사용자가 올린 여러 장의 러닝 랩 통계와 기록 사진을 면밀히 분석하여 JSON 포맷으로만 답변합니다."
            },
            {
              role: "user",
              content: contentArray
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        alert(`AI 분석 오류: ${data.error}`);
        setIsAnalyzing(false);
        return;
      }

      const parsedResult = JSON.parse(data.choices[0].message.content);
      setAiResult(parsedResult);

    } catch (error) {
      console.error(error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5 bg-gray-50 min-h-screen relative pb-20">
      
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <span>🤖</span> AI 런-코치 정밀 분석실
        </h2>
        <p className="text-sm font-bold text-gray-500 mt-2">
          랩 통계, 페이스 그래프 등 여러 장의 스크린샷을 올리고<br/>AI에게 심층 진단과 맞춤 숙제를 받아보세요.
        </p>
      </div>

      {/* 🚀 입력 폼 카드 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8 space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-black text-gray-700 mb-2">목표 코스</label>
            <select 
              value={distance} 
              onChange={(e) => setDistance(e.target.value)}
              className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 font-bold text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="10K">10K</option>
              <option value="HALF">하프 코스</option>
              <option value="FULL">풀 코스</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-black text-gray-700 mb-2">남은 기간</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-400 font-black">D-</span>
              <input type="number" value={dDay} onChange={(e) => setDDay(e.target.value)} className="w-full bg-transparent text-gray-900 font-black outline-none text-center" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-black text-gray-700 mb-2">목표 기록</label>
          <div className="flex items-center justify-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <input type="number" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className="w-12 bg-transparent text-gray-900 text-lg font-black outline-none border-b-2 border-blue-200 focus:border-blue-500 text-center" />
            <span className="text-gray-500 font-bold text-sm">시간</span>
            <input type="number" value={targetMinutes} onChange={(e) => setTargetMinutes(e.target.value)} className="w-12 bg-transparent text-gray-900 text-lg font-black outline-none border-b-2 border-blue-200 focus:border-blue-500 text-center" />
            <span className="text-gray-500 font-bold text-sm">분</span>
          </div>
        </div>

        {/* 📸 여러 장의 스크린샷 업로드 영역 */}
        <div>
          <label className="block text-[13px] font-black text-gray-700 mb-2">
            러닝 기록 & 랩 통계 스크린샷 <span className="text-blue-500">({imagePreviews.length}장 선택됨)</span>
          </label>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 group">
                <img src={preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* 이미지 추가 버튼 박스 */}
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <span className="text-2xl mb-1">➕</span>
              <span className="text-[11px] font-bold text-gray-500">사진 추가</span>
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
            </label>
          </div>
          <p className="text-[11px] text-gray-400 font-bold">* 랩타입, 심박수, 페이스 그래프 등 여러 장을 한 번에 올릴 수 있습니다.</p>
        </div>

        <button 
          onClick={analyzeWithOpenAI}
          disabled={isAnalyzing}
          className={`w-full text-white font-black py-4 rounded-2xl shadow-md transition-all text-lg flex items-center justify-center gap-2 ${
            isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg'
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="animate-spin text-xl">⏳</span> AI가 여러 장의 기록을 정밀 분석 중...
            </>
          ) : (
            'AI 심층 분석 및 맞춤 숙제 받기 📝'
          )}
        </button>
      </div>

      {/* 🚀 AI 분석 결과 화면 */}
      {aiResult && (
        <div className="space-y-6 animate-fade-in">
          
          {/* AI 진단 코멘트 */}
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl relative shadow-sm">
            <span className="absolute -top-4 left-6 text-4xl">🧑‍🏫</span>
            <h3 className="text-[15px] font-black text-blue-800 mb-2 mt-2">코치 AI의 종합 진단 및 가능성</h3>
            <p className="text-[13px] text-gray-700 font-bold leading-relaxed whitespace-pre-wrap">
              {aiResult.feedback}
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <h3 className="text-lg font-black text-gray-900">🔥 나의 완주 숙제장</h3>
            <span className="text-[11px] text-gray-500 font-bold">완료 시 체크!</span>
          </div>
          
          {/* 일일 훈련 숙제 리스트 */}
          <div className="space-y-3">
            {aiResult.plan.map((task, index) => (
              <label key={index} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-blue-500 cursor-pointer shrink-0" />
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-600">
                      {task.dayLabel}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-black text-gray-900">{task.title}</h4>
                  <p className="text-[12px] text-gray-500 font-bold mt-1 leading-snug">{task.description}</p>
                </div>
              </label>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}