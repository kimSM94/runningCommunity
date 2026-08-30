import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function MarathonSchedule() {
  const [marathons, setMarathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarathons = async () => {
      const { data, error } = await supabase.from('marathons').select('*').order('event_date', { ascending: true });
      if (!error && data) {
        setMarathons(data);
      }
      setLoading(false);
    };
    fetchMarathons();
  }, []);

  // 날씨 확인 페이지로 날짜를 들고 이동하는 함수
  const goToWeatherCheck = (dateString) => {
    navigate('/weather', { state: { targetDate: dateString } });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link to="/" className="text-xl font-black">⬅️ 홈</Link>
        <h1 className="text-lg font-bold text-blue-600">전국 마라톤 일정 ⚡</h1>
        <div className="w-8"></div>
      </header>

      <div className="p-5">
        <h2 className="text-xl font-extrabold mb-1">접수예정 및 진행 대회</h2>
        <p className="text-xs text-gray-500 mb-5">대회일을 누르면 당일 기상 컨디션을 바로 확인할 수 있습니다.</p>

        {loading ? (
          <p className="text-center text-gray-400 py-10 animate-pulse">마라톤 일정을 불러오는 중... 🏃‍♂️</p>
        ) : (
          <div className="flex flex-col gap-4">
            {marathons.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${item.color} text-white text-xs font-bold px-2.5 py-1 rounded-md text-center`}>
                      {item.d_day}
                    </span>
                    <h3 className="font-extrabold text-base text-gray-800">{item.title}</h3>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p>📅 일시: <span className="font-bold text-gray-700">{item.event_date}</span></p>
                    <p className="mt-0.5">📍 장소: <span className="font-bold text-gray-700">{item.location}</span></p>
                  </div>
                 <button 
      onClick={() => {
        console.log("출발하는 날짜 데이터:", item.event_date); // 💡
        navigate('/weather', { 
          state: { 
            targetDate: item.event_date,     // 실제 마라톤 데이터의 날짜 변수
            targetRegion: item.location  // 실제 마라톤 데이터의 지역 변수
          } 
        });
      }}
      className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
    >
      ⛅ 날씨 보기
    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}