import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

// 필터 옵션 리스트
const REGIONS = ['전체 지역', '서울', '경기', '인천', '강원', '대전', '충남', '충북', '부산', '울산', '대구', '경남', '경북', '광주', '전남', '전북', '제주'];
const STATUSES = ['전체 보기', '접수중', '접수마감', '접수예정'];

export default function MarathonSchedule() {
  const navigate = useNavigate();
  const [marathons, setMarathons] = useState([]);
  
  // 💡 지역 및 상태 필터 (기본값: 전체)
  const [filterRegion, setFilterRegion] = useState('전체 지역'); 
  const [filterStatus, setFilterStatus] = useState('전체 보기'); 
  
  // 커스텀 드롭다운 열림/닫힘 상태
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  const [weatherData, setWeatherData] = useState({ isOpen: false, loading: false, info: null });

  useEffect(() => {
    const fetchMarathons = async () => {
      const { data, error } = await supabase
        .from('marathons')
        .select('*');

      if (!error && data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 자정 기준으로 정확한 날짜 차이 계산

        const processed = data
          .map(event => {
            const eventDate = new Date(event.event_date);
            eventDate.setHours(0, 0, 0, 0);
            
            const diffTime = eventDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 데이터베이스의 고정된 d_day 대신 실시간으로 계산한 real_d_day 주입
            return { ...event, real_d_day: diffDays };
          })
          // 💡 이미 종료된 과거 대회는 숨기고 오늘(D-0) 이후 대회만 노출
          .filter(event => event.real_d_day >= 0)
          // 💡 가장 날짜가 가까운 대회가 맨 위로 오도록 정렬
          .sort((a, b) => a.real_d_day - b.real_d_day);

        setMarathons(processed);
      }
    };
    fetchMarathons();
  }, []);

  // 필터링 로직
  const filteredMarathons = marathons.filter(event => {
    const passStatus = filterStatus === '전체 보기' ? true : event.status === filterStatus;
    const passRegion = filterRegion === '전체 지역' 
      ? true 
      : (event.location && event.location.includes(filterRegion));

    return passStatus && passRegion;
  });

  const handleWeatherClick = async (e, event) => {
    e.stopPropagation(); 
    setWeatherData({ isOpen: true, loading: true, info: null });

    try {
      setTimeout(() => {
        setWeatherData({
          isOpen: true,
          loading: false,
          info: { temp: '18°C', condition: '맑음 ☀️', text: '달리기 딱 좋은 날씨예요!' }
        });
      }, 800);
    } catch (error) {
      setWeatherData({ isOpen: true, loading: false, info: { error: '날씨 정보를 불러올 수 없습니다.' } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#F8FAFC] min-h-screen pb-24 font-sans relative">
      
      {/* 💡 드롭다운 닫기용 투명 배경 */}
      {(isRegionOpen || isStatusOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setIsRegionOpen(false); setIsStatusOpen(false); }}
        />
      )}

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5">
        <h2 className="text-xl font-black text-gray-900 mb-1">🏃‍♂️ 마라톤 일정</h2>
        <p className="text-xs font-bold text-gray-500 mb-5">다가오는 대회 일정과 날씨를 확인하세요.</p>

        {/* 🚀 상단 컨트롤 바 */}
        <div className="flex flex-col gap-3 relative z-50">
          
          {/* 1. 지역 커스텀 필터 */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200/80 relative">
            <span className="text-sm font-bold text-gray-500 ml-1 flex items-center gap-2">
              <span>📍</span> 지역 필터
            </span>
            <div className="relative">
              <button 
                onClick={() => { setIsRegionOpen(!isRegionOpen); setIsStatusOpen(false); }}
                className="flex items-center gap-2 border-none font-bold text-gray-700 bg-white px-3 py-1.5 rounded-xl shadow-sm outline-none"
              >
                {filterRegion}
                <span className="text-[10px] text-gray-400">▼</span>
              </button>
              
              {isRegionOpen && (
                <ul className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-y-auto max-h-64 z-50 py-1">
                  {REGIONS.map(region => (
                    <li 
                      key={region}
                      onClick={() => { setFilterRegion(region); setIsRegionOpen(false); }}
                      className={`px-4 py-2.5 text-sm font-bold cursor-pointer text-right transition-colors ${
                        filterRegion === region ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-500'
                      }`}
                    >
                      {region}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* 2. 상태 커스텀 필터 */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200/80 relative">
            <span className="text-sm font-bold text-gray-500 ml-1 flex items-center gap-2">
              <span>📌</span> 모집 상태 필터
            </span>
            <div className="relative">
              <button 
                onClick={() => { setIsStatusOpen(!isStatusOpen); setIsRegionOpen(false); }}
                className="flex items-center gap-2 border-none font-bold text-gray-700 bg-white px-3 py-1.5 rounded-xl shadow-sm outline-none"
              >
                {filterStatus}
                <span className="text-[10px] text-gray-400">▼</span>
              </button>
              
              {isStatusOpen && (
                <ul className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
                  {STATUSES.map(status => (
                    <li 
                      key={status}
                      onClick={() => { setFilterStatus(status); setIsStatusOpen(false); }}
                      className={`px-4 py-2.5 text-sm font-bold cursor-pointer text-right transition-colors ${
                        filterStatus === status ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-500'
                      }`}
                    >
                      {status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 리스트 화면 */}
      <div className="space-y-4">
        {filteredMarathons.map((event) => (
          <div 
            key={event.id} 
            onClick={() => navigate(`/marathon/${event.id}`)}
            className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm cursor-pointer hover:border-blue-200 hover:shadow-md transition-all flex flex-col gap-3 group"
          >
            <div className="flex items-center gap-2">
              {/* 💡 실시간으로 계산된 D-Day 뱃지 렌더링 */}
              <span className={`px-2.5 py-1 text-[11px] font-black text-white rounded-lg ${event.real_d_day <= 7 ? 'bg-orange-500' : 'bg-blue-500'}`}>
                {event.real_d_day === 0 ? 'D-Day' : `D-${event.real_d_day}`}
              </span>
              <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg ${event.status === '접수중' ? 'bg-green-100 text-green-700' : event.status === '접수마감' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                {event.status}
              </span>
            </div>
            
            <h3 className="font-extrabold text-gray-900 text-[15px] group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            
            <div className="flex justify-between items-end mt-1 pt-3 border-t border-gray-50">
              <div className="text-[12px] font-bold text-gray-500 space-y-1">
                <p className="flex items-center gap-1"><span>🗓️</span> {event.event_date}</p>
                <p className="flex items-center gap-1"><span>📍</span> {event.location || '상세페이지 참조'}</p>
              </div>
              <button 
                onClick={(e) => handleWeatherClick(e, event)}
                className="bg-blue-50 text-blue-600 text-[11px] font-black px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                ⛅ 날씨 보기
              </button>
            </div>
          </div>
        ))}

        {filteredMarathons.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
            <span className="text-4xl block mb-3 opacity-50">📭</span>
            <span className="text-gray-500 font-bold block text-sm">진행 예정인 마라톤 대회가 없습니다.</span>
            <button 
              onClick={() => { setFilterRegion('전체 지역'); setFilterStatus('전체 보기'); }}
              className="mt-4 text-[12px] font-bold text-blue-500 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* ⛅ 날씨 팝업 모달 */}
      {weatherData.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center relative animate-fade-in">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setWeatherData({ isOpen: false, loading: false, info: null });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-gray-900 mb-4">대회일 날씨 예측</h3>
            
            {weatherData.loading ? (
              <div className="py-6 text-blue-500 font-bold animate-pulse">날씨 데이터를 불러오는 중...</div>
            ) : weatherData.info?.error ? (
              <div className="py-6 text-red-500 font-bold">{weatherData.info.error}</div>
            ) : (
              <div className="py-4 space-y-2 bg-blue-50 rounded-2xl">
                <div className="text-5xl mb-3 pt-3">{weatherData.info.condition.split(' ')[1]}</div>
                <div className="text-2xl font-black text-gray-900">{weatherData.info.temp}</div>
                <div className="text-sm font-bold text-blue-600 pb-3">{weatherData.info.text}</div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}