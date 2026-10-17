import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

// 필터 옵션 리스트
const REGIONS = ['서울', '전체 지역', '경기', '인천', '강원', '대전', '충남', '충북', '부산', '울산', '대구', '경남', '경북', '광주', '전남', '전북', '제주'];
const STATUSES = ['전체 보기', '접수중', '접수마감', '접수예정'];

export default function MarathonSchedule() {
  const navigate = useNavigate();
  const [marathons, setMarathons] = useState([]);
  
  // 💡 지역 필터(기본값 '서울')와 상태 필터 
  const [filterRegion, setFilterRegion] = useState('서울'); 
  const [filterStatus, setFilterStatus] = useState('전체 보기'); 
  
  // 💡 커스텀 드롭다운 열림/닫힘 상태
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  const [weatherData, setWeatherData] = useState({ isOpen: false, loading: false, info: null });

  useEffect(() => {
    const fetchMarathons = async () => {
      const { data, error } = await supabase
        .from('marathons')
        .select('*')
        .order('event_date', { ascending: true });
      if (!error && data) setMarathons(data);
    };
    fetchMarathons();
  }, []);

  // 💡 지역과 상태를 동시에 필터링
  const filteredMarathons = marathons.filter(event => {
    const passStatus = filterStatus === '전체 보기' ? true : event.status === filterStatus;
    const passRegion = (filterRegion === '전체 지역' || filterRegion === '전체')
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
    <div className="max-w-2xl mx-auto p-5 bg-gray-50 min-h-screen relative">
      
      {/* 💡 드롭다운이 열려있을 때 바깥을 클릭하면 닫히게 해주는 투명 배경 */}
      {(isRegionOpen || isStatusOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => { setIsRegionOpen(false); setIsStatusOpen(false); }}
        />
      )}

      {/* 🚀 상단 컨트롤 바 */}
      <div className="flex flex-col gap-3 mb-6 relative z-50">
        
        {/* 1. 지역 커스텀 필터 */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative">
          <span className="text-sm font-bold text-gray-500">📍 지역 필터</span>
          <div className="relative">
            <button 
              onClick={() => { setIsRegionOpen(!isRegionOpen); setIsStatusOpen(false); }}
              className="flex items-center gap-1 border-none font-bold text-gray-700 bg-transparent outline-none"
            >
              {filterRegion}
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            
            {/* 커스텀 드롭다운 메뉴 */}
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
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative">
          <span className="text-sm font-bold text-gray-500">📌 모집 상태 필터</span>
          <div className="relative">
            <button 
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsRegionOpen(false); }}
              className="flex items-center gap-1 border-none font-bold text-gray-700 bg-transparent outline-none"
            >
              {filterStatus}
              <span className="text-[10px] text-gray-400">▼</span>
            </button>
            
            {/* 커스텀 드롭다운 메뉴 */}
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

      <h2 className="text-xl font-black mb-1">접수예정 및 진행 대회</h2>
      <p className="text-xs text-gray-500 font-bold mb-6">대회를 누르면 상세 페이지로 이동합니다.</p>

      {/* 리스트 화면 */}
      <div className="space-y-4">
        {filteredMarathons.map((event) => (
          <div 
            key={event.id} 
            onClick={() => navigate(`/marathon/${event.id}`)}
            className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-[10px] font-black text-white rounded-md ${event.status === '접수중' ? 'bg-orange-500' : 'bg-gray-400'}`}>
                D-{event.d_day}
              </span>
              <span className={`px-2 py-1 text-[10px] font-black rounded-md ${event.status === '접수중' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                {event.status}
              </span>
              <h3 className="font-extrabold text-gray-900 text-base truncate flex-1 pl-1">{event.title}</h3>
            </div>
            
            <div className="flex justify-between items-end mt-1">
              <div className="text-[12px] font-bold text-gray-500 space-y-1">
                <p>🗓️ 일시: {event.event_date}</p>
                <p className="truncate w-48">📍 장소: {event.location || '상세페이지 참조'}</p>
              </div>
              <button 
                onClick={(e) => handleWeatherClick(e, event)}
                className="bg-blue-50 text-blue-500 text-[11px] font-black px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                ⛅ 날씨 보기
              </button>
            </div>
          </div>
        ))}

        {filteredMarathons.length === 0 && (
          <div className="text-center py-10">
            <span className="text-4xl block mb-3">📭</span>
            <span className="text-gray-500 font-bold block">해당 조건의 마라톤 대회가 없습니다.</span>
            <button 
              onClick={() => { setFilterRegion('전체 지역'); setFilterStatus('전체 보기'); }}
              className="mt-4 text-[12px] font-bold text-blue-500 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
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