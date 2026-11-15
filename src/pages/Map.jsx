import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Map() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('급수대'); // 급수대, 화장실, 편의점

  // 📦 내 주변 오아시스 데이터
  const oasisList = [
    { id: 1, type: '급수대', name: '반포대교 남단 달빛광장 아리수', distance: '320m', status: '사용 가능', statusColor: 'text-sky-600 bg-sky-50', address: '서초구 반포동 115-5' },
    { id: 2, type: '화장실', name: '잠원한강공원 제3화장실', distance: '450m', status: '개방 중', statusColor: 'text-emerald-600 bg-emerald-50', address: '서초구 잠원동 121' },
    { id: 3, type: '급수대', name: '잠수교 북단 횡단보도 앞', distance: '890m', status: '동파 방지 단수', statusColor: 'text-rose-600 bg-rose-50', address: '용산구 서빙고동 287-3' },
    { id: 4, type: '편의점', name: 'GS25 한강반포1호점', distance: '1.2km', status: '24시간', statusColor: 'text-amber-700 bg-amber-50', address: '서초구 반포동 115-5' },
  ];

  const filteredOasis = oasisList.filter(item => item.type === activeFilter);

  return (
    <div className="max-w-lg mx-auto w-full h-[100dvh] bg-[#FAF9F6] font-sans text-[#18181B] relative overflow-hidden border-x border-[#E6E4DD]">
      
      {/* 🗺️ 상단 플로팅 헤더 (모바일 상단 바/URL 영역에 가려지지 않도록 top-14로 여유 있게 배치) */}
      <header className="fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 flex justify-between items-center z-50 pointer-events-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pointer-events-auto w-11 h-11 bg-white/95 backdrop-blur-sm border border-[#E6E4DD] rounded-full shadow-md flex items-center justify-center text-sm font-black text-[#18181B] active:scale-95 transition-transform"
          aria-label="뒤로가기"
        >
          ←
        </button>

        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-[#E6E4DD] px-5 py-2.5 rounded-full shadow-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-[#18181B]">
            내 주변 오아시스 찾기
          </h1>
        </div>

        <div className="w-11" />
      </header>

      {/* 🗺️ 지도 배경 영역 (상단 58% 차지) */}
      <div className="relative w-full h-[58%] bg-sky-100">
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
          alt="Map Background" 
          className="w-full h-full object-cover opacity-70 grayscale-[20%]"
        />
        
        {/* 내 위치 마커 */}
        <div className="absolute top-[52%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-16 h-16 bg-sky-500/25 rounded-full animate-ping absolute" />
          <div className="w-4 h-4 bg-[#18181B] border-[3px] border-white rounded-full shadow-lg relative z-10" />
          <span className="bg-[#18181B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 shadow-md">
            현위치
          </span>
        </div>

        {/* 주변 시설 마커들 */}
        <div className="absolute top-[36%] left-[62%] bg-white px-2.5 py-1 rounded-full shadow-md text-xs font-bold border border-[#E6E4DD] animate-bounce" style={{ animationDelay: '0.2s' }}>
          💧 아리수
        </div>
        <div className="absolute top-[62%] left-[26%] bg-white px-2.5 py-1 rounded-full shadow-md text-xs font-bold border border-[#E6E4DD] animate-bounce" style={{ animationDelay: '0.5s' }}>
          🚻 화장실
        </div>
        <div className="absolute top-[46%] left-[18%] bg-white px-2.5 py-1 rounded-full shadow-md text-xs font-bold border border-[#E6E4DD] animate-bounce" style={{ animationDelay: '0.7s' }}>
          💧 아리수
        </div>

        {/* 우측 하단 현위치로 가기 버튼 (바텀시트 바로 위에 겹치지 않게 배치) */}
        <button
          type="button"
          onClick={() => alert('현재 위치를 기준으로 주변 오아시스를 다시 탐색합니다.')}
          className="absolute bottom-8 right-4 z-30 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-lg border border-[#E6E4DD] active:scale-95 transition-transform"
          title="현위치 재탐색"
        >
          ◎
        </button>
      </div>

      {/* 📋 하단 바텀 시트 (리스트 영역 - 하단 46% 차지하며 지도와 자연스럽게 겹침) */}
      <div className="absolute bottom-0 left-0 w-full h-[46%] bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t border-[#E6E4DD] flex flex-col z-40 pb-[env(safe-area-inset-bottom)]">
        {/* 시트 손잡이 */}
        <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-[#D4D4D8] rounded-full" />
        </div>

        {/* 필터 버튼들 */}
        <div className="flex px-5 py-2.5 gap-2 overflow-x-auto border-b border-[#F4F4F5] shrink-0">
          {['급수대', '화장실', '편의점'].map(filter => (
            <button 
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                activeFilter === filter
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'bg-[#FAF9F6] border border-[#E6E4DD] text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 장소 리스트 */}
        <div className="flex-1 overflow-y-auto px-5 py-2 pb-12">
          {filteredOasis.length === 0 ? (
            <p className="text-center text-xs text-[#71717A] py-10 font-bold">
              주변에 검색된 시설이 없습니다.
            </p>
          ) : (
            filteredOasis.map(place => (
              <div key={place.id} className="flex justify-between items-center py-3.5 border-b border-[#F4F4F5] last:border-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#18181B] font-mono font-black text-xs">{place.distance}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${place.statusColor}`}>
                      {place.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#18181B] text-sm mb-0.5">{place.name}</h3>
                  <p className="text-[11px] text-[#71717A]">{place.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`${place.name} (${place.address}) 길안내를 시작합니다.`)}
                  className="w-9 h-9 bg-[#FAF9F6] border border-[#E6E4DD] hover:border-[#18181B] text-[#18181B] rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0"
                >
                  →
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}