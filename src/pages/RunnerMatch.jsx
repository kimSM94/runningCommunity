import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RunnerMatch() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      
      {/* 👑 헤더 */}
      <header className="flex justify-between items-center p-5">
        <div className="flex items-center gap-2">
           <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
           <span className="font-extrabold text-sm tracking-tight text-gray-700">run-meet.official</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl text-gray-400 hover:text-gray-900 transition-colors">🏠</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-12 px-5 pb-20">
        
        {/* 📢 메인 카피라이팅 영역 */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-[1.3] mb-4 tracking-tight">
            페이스를 알려주시면<br/>
            완벽한 짝꿍을 찾아드립니다.
          </h1>
          <p className="text-sm font-medium text-gray-500">
            러닝 메이트는 생각보다 가까운 트랙에 있습니다.
          </p>
        </div>

        {/* 🖱️ 메인 액션 버튼 */}
        <div className="flex gap-3 w-full max-w-md mx-auto mb-16">
          <button 
            onClick={() => navigate('/match/setup')} 
            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors text-sm"
          >
            무료 러닝 짝꿍 등록 →
          </button>
          <button 
            onClick={() => navigate('/match/received')} 
            className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors text-sm relative"
          >
            도착한 러너 제안 확인
            {/* 🔴 알림 뱃지 (읽지 않은 제안이 있을 때) */}
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
          </button>
        </div>

        {/* 🔗 하단 바로가기 링크 리스트 */}
        <div className="w-full max-w-md mx-auto">
          <div className="mb-4">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded">LINKS</span>
            <h2 className="text-xl font-black text-gray-900 mt-2 tracking-tight">바로가기</h2>
          </div>

          <div className="flex flex-col gap-3">
            
            <Link to="/match/setup" className="flex items-center p-4 border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group bg-white">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl mr-4 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                📝
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-gray-900 mb-0.5">러닝 짝꿍 무료 등록</h3>
                <p className="text-xs text-gray-400 font-medium">무료 · 내 페이스에 맞는 무제한 매칭</p>
              </div>
              <span className="text-gray-300 font-bold">↗</span>
            </Link>

            <Link to="/match/setup" className="flex items-center p-4 border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group bg-white">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl mr-4 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                🔍
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[15px] text-gray-900 mb-0.5">기존 회원 정보 조회</h3>
                <p className="text-xs text-gray-400 font-medium">간편 로그인 후 내 프로필 정보 확인 및 수정</p>
              </div>
              <span className="text-gray-300 font-bold">↗</span>
            </Link>

            <Link to="/match/received" className="flex items-center p-4 border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group bg-white">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl mr-4 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                💌
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-[15px] text-gray-900">도착한 매칭 제안 확인</h3>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">나에게 호감을 보낸 러너 프로필 확인</p>
              </div>
              <span className="text-gray-300 font-bold">↗</span>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}