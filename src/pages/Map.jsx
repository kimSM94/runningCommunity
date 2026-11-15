import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Map() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('급수대'); // 급수대, 화장실, 편의점

  // 📦 내 주변 오아시스 가짜 데이터
  const oasisList = [
    { id: 1, type: '급수대', name: '반포대교 남단 달빛광장 아리수', distance: '320m', status: '사용 가능 🔵', address: '서초구 반포동 115-5' },
    { id: 2, type: '화장실', name: '잠원한강공원 제3화장실', distance: '450m', status: '열림 🟢', address: '서초구 잠원동 121' },
    { id: 3, type: '급수대', name: '잠수교 북단 횡단보도 앞', distance: '890m', status: '동파 방지 단수 🔴', address: '용산구 서빙고동 287-3' },
    { id: 4, type: '편의점', name: 'GS25 한강반포1호점', distance: '1.2km', status: '24시간 🟡', address: '서초구 반포동 115-5' },
  ];

  const filteredOasis = oasisList.filter(item => item.type === activeFilter);

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 relative overflow-hidden">
      
      {/* 🗺️ 상단 헤더 (지도 위에 떠있는 느낌) */}
      <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-white/90 to-transparent">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-xl font-black">
          ⬅️
        </button>
        <div className="bg-white px-4 py-2 rounded-full shadow-md">
          <h1 className="text-sm font-extrabold text-blue-600">내 주변 오아시스 찾기 💧</h1>
        </div>
        <div className="w-10"></div>
      </header>

      {/* 🗺️ 지도 배경 영역 (가짜 지도 이미지 + 마커 애니메이션) */}
      <div className="relative w-full h-[60vh] bg-blue-100">
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
          alt="Map Background" 
          className="w-full h-full object-cover opacity-60 grayscale-[30%]"
        />
        
        {/* 내 위치 마커 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute"></div>
          <div className="w-5 h-5 bg-blue-600 border-4 border-white rounded-full shadow-lg relative z-10"></div>
          <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded mt-2 shadow-md">현위치</span>
        </div>

        {/* 주변 급수대 가짜 마커들 */}
        <div className="absolute top-[30%] left-[60%] text-3xl drop-shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>💧</div>
        <div className="absolute top-[60%] left-[30%] text-3xl drop-shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>🚽</div>
        <div className="absolute top-[45%] left-[20%] text-3xl drop-shadow-lg animate-bounce" style={{ animationDelay: '0.7s' }}>💧</div>

        {/* 우측 하단 현위치로 가기 버튼 */}
        <button className="absolute bottom-6 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl border border-gray-100 active:scale-95 transition-transform">
          🎯
        </button>
      </div>

      {/* 📋 하단 바텀 시트 (리스트 영역) */}
      <div className="absolute bottom-0 left-0 w-full h-[45vh] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col z-40">
        {/* 시트 손잡이 */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* 필터 버튼들 */}
        <div className="flex px-5 py-3 gap-2 overflow-x-auto hide-scrollbar border-b border-gray-100">
          {['급수대', '화장실', '편의점'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                activeFilter === filter ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {filter === '급수대' ? '💧' : filter === '화장실' ? '🚽' : '🏪'} {filter}
            </button>
          ))}
        </div>

        {/* 장소 리스트 */}
        <div className="flex-1 overflow-y-auto px-5 py-2 pb-10">
          {filteredOasis.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10 font-bold">주변에 검색된 시설이 없습니다.</p>
          ) : (
            filteredOasis.map(place => (
              <div key={place.id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600 font-black text-sm">{place.distance}</span>
                    <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{place.status}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm mb-1">{place.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium">{place.address}</p>
                </div>
                <button className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold hover:bg-blue-100 transition-colors">
                  ➡️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}