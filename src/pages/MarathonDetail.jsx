import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export default function MarathonDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⛅ 날씨 팝업 상태 관리
  const [weatherData, setWeatherData] = useState({ isOpen: false, loading: false, info: null });

  useEffect(() => {
    const fetchDetail = async () => {
      const { data, error } = await supabase
        .from('marathons')
        .select('*')
        .eq('id', id)
        .single(); 

      if (data) setEvent(data);
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  // 💡 날씨 버튼 클릭 로직
  const handleWeatherClick = () => {
    setWeatherData({ isOpen: true, loading: true, info: null });
    
    // 대표님의 날씨 API 호출 코드 연동
    setTimeout(() => {
      setWeatherData({
        isOpen: true,
        loading: false,
        info: { temp: '18°C', condition: '맑음 ☀️', text: '달리기 딱 좋은 날씨예요!' }
      });
    }, 800);
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500 mt-20">대회 정보를 불러오는 중입니다...</div>;
  if (!event) return <div className="p-10 text-center font-bold text-gray-500 mt-20">대회 정보가 없습니다.</div>;

  return (
    <div className="max-w-2xl mx-auto p-5 bg-white min-h-screen">
      
      {/* 상단 뒤로가기 버튼 */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 text-gray-500 font-bold hover:text-gray-900 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl"
      >
        ← 목록으로 돌아가기
      </button>

      {/* 대회 제목 & 설명 */}
      <h1 className="text-2xl font-black text-gray-900 mb-6 leading-tight pr-4">
        {event.title}
      </h1>
      
      {event.description && (
        <p className="text-[14px] text-gray-700 mb-8 bg-blue-50 p-5 rounded-2xl font-medium leading-relaxed whitespace-pre-wrap">
          {event.description}
        </p>
      )}

      {/* 진짜 신청 버튼 (외부 공식 사이트) */}
      <a 
        href={event.apply_url || event.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full bg-blue-500 text-white text-center font-bold py-4 rounded-2xl hover:bg-blue-600 transition-colors shadow-lg mb-8 text-lg"
      >
        대회 공식 사이트에서 신청하기
      </a>

      {/* 상세 정보 테이블 */}
      <div className="bg-gray-50 border border-gray-100 p-5 rounded-3xl space-y-5 text-[14px] font-bold text-gray-700">
        <div className="flex items-start gap-4">
          <span className="text-gray-400 w-12 shrink-0">📍 장소</span>
          <span className="leading-tight">{event.location || '미정'}</span>
        </div>
        
        {/* 💡 일자 & 날씨 보기 버튼! */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 w-12 shrink-0">🗓️ 일자</span>
            <span className="text-gray-900">{event.event_date}</span>
          </div>
          <button 
            onClick={handleWeatherClick}
            className="bg-blue-100 text-blue-600 text-[12px] font-black px-4 py-2 rounded-xl shadow-sm hover:bg-blue-200 transition-colors"
          >
            ⛅ 날씨 예측보기
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 w-12 shrink-0">⏰ 시간</span>
          <span>{event.event_time || '홈페이지 참조'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 w-12 shrink-0">📝 접수</span>
          <span>{event.reg_period || '홈페이지 참조'}</span>
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <span className="text-gray-400 w-12 shrink-0">📌 상태</span>
          <span className={`px-3 py-1 rounded-lg text-[12px] ${event.status === '접수중' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'}`}>
            {event.status}
          </span>
        </div>
      </div>

      {/* ⛅ 날씨 팝업 모달 */}
      {weatherData.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center relative animate-fade-in">
            <button 
              onClick={() => setWeatherData({ isOpen: false, loading: false, info: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-gray-800 mb-4">대회일 날씨 예측</h3>
            
            {weatherData.loading ? (
              <div className="py-6 text-gray-500 font-bold animate-pulse">날씨 데이터를 불러오는 중...</div>
            ) : weatherData.info?.error ? (
              <div className="py-6 text-red-500 font-bold">{weatherData.info.error}</div>
            ) : (
              <div className="py-4 space-y-2">
                <div className="text-4xl mb-3">{weatherData.info.condition}</div>
                <div className="text-2xl font-black text-gray-900">{weatherData.info.temp}</div>
                <div className="text-sm font-bold text-blue-500">{weatherData.info.text}</div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}