import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // 💡 Supabase 연동을 위해 꼭 필요합니다!

export default function Home() {
  // 💡 상태 관리는 반드시 함수 안쪽에 있어야 합니다!
  const [crews, setCrews] = useState([]);
  const [loadingCrews, setLoadingCrews] = useState(true);

  // 💡 화면이 켜질 때 Supabase에서 진짜 크루 데이터를 가져오는 마법!
  useEffect(() => {
    const fetchCrews = async () => {
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .order('created_at', { ascending: false }); // 최신순 정렬
      
      if (!error && data) {
        setCrews(data);
      }
      setLoadingCrews(false);
    };

    fetchCrews();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans pb-10 text-gray-800">
      
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl cursor-pointer">≡</span>
          <h1 className="text-xl font-bold">RUN</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl cursor-pointer">🔍</span>
          <button className="text-xs font-bold bg-blue-700 px-2 py-1 rounded">간편 로그인·가입</button>
        </div>
      </header>

      {/* 🚀 네비게이션 메뉴 */}
      <nav className="flex overflow-x-auto whitespace-nowrap bg-white border-b border-gray-200 text-sm font-bold text-gray-600 p-3 gap-5 hide-scrollbar">
        <Link to="/map" className="cursor-pointer hover:text-blue-600">💧아리수</Link>
        <Link to="/weather" className="cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-1">🌤️날씨확인</Link>
        <Link to="/marathons" className="cursor-pointer hover:text-blue-600">⚡마라톤일정</Link>
        <Link to="/shoes" className="cursor-pointer hover:text-blue-600">👟러닝화계급도</Link>
        <Link to="/community" className="cursor-pointer hover:text-blue-600">👽커뮤니티</Link>
        <Link to="/course" className="cursor-pointer hover:text-blue-600 border-b-2 border-blue-600 pb-1 text-blue-600">🤖AI아트코스</Link>
        <Link to="/crew" className="cursor-pointer hover:text-blue-600 border-b-2 border-blue-600 pb-1 text-blue-600">러닝크루</Link>
        <Link to="/crew" className="cursor-pointer hover:text-blue-600 border-b-2 border-blue-600 pb-1 text-blue-600">러닝크루</Link>
      </nav>

      <div className="bg-gradient-to-r from-teal-300 to-cyan-400 h-40 flex flex-col items-center justify-center relative overflow-hidden">
        <img src="https://cdn-icons-png.flaticon.com/512/5038/5038590.png" alt="running shoe" className="h-24 z-10 animate-bounce" />
        <span className="absolute right-2 bottom-2 text-xs font-bold text-teal-800 opacity-70">김러닝</span>
      </div>
      {/* 🔥 [신규] 런-미팅 VIP 배너 (홈 화면에서 가장 눈에 띄게!) */}
      <div className="p-4 bg-white mt-2 border-b border-gray-200">
        <Link to="/match" className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-4 text-center shadow-md hover:opacity-90 transition-opacity relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-6xl opacity-20 transform rotate-12">💘</div>
          <h2 className="text-lg font-black text-white flex items-center justify-center gap-2 drop-shadow-sm">
            ❤️ 내 러닝 짝꿍 찾기 (런-미팅)
          </h2>
          <p className="text-[11px] text-pink-100 mt-1 font-bold">
            같은 페이스, 같은 동네 러너와 매칭을 시작하세요!
          </p>
        </Link>
      </div>
      <div className="p-4 bg-white mt-2 border-b border-gray-200">
        <Link to="/map" className="block w-full bg-blue-50 border-2 border-blue-500 rounded-xl p-4 text-center shadow-sm hover:bg-blue-100 transition-colors">
          <h2 className="text-lg font-black text-blue-700 flex items-center justify-center gap-2">
            💧 내 주변 러닝 오아시스 찾기 🏃‍♂️
          </h2>
          <p className="text-xs text-blue-500 mt-1">GPS 기반 한강/하천 아리수 위치 확인</p>
        </Link>
      </div>

      <section className="bg-white mt-2 p-4">
        <div className="flex justify-between items-center border-b-2 border-gray-800 pb-2 mb-3">
          <h3 className="font-extrabold text-lg">접수예정 마라톤대회</h3>
          <span className="text-gray-400 font-light">+</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {[
            { tag: 'D-1', title: '2026 T1 WISH RUN 티원위시런...', date: '9.19', color: 'bg-orange-500' },
            { tag: 'D-1', title: '2026 핑크런', date: '10.11', color: 'bg-orange-500' },
            { tag: 'D-2', title: '2026 SBS RUN&MUSIC FESTIVAL...', date: '10.24', color: 'bg-orange-600' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className={`${item.color} text-white text-[10px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center`}>{item.tag}</span>
                <span className="text-sm font-semibold truncate">{item.title}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 min-w-[50px] justify-end">
                <span>🏃</span> {item.date}
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 러닝 크루 홍보 섹션 */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">우리 동네 러닝 크루 🏃‍♂️</h2>
              <p className="text-xs text-gray-500 mt-1">혼자 뛰기 심심하다면 크루와 함께하세요!</p>
            </div>
            <div className="flex gap-2">
              <Link to="/crew/new" className="bg-blue-50 text-blue-600 text-xs font-extrabold px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                + 크루 개설
              </Link>
              <button className="text-xs font-bold text-gray-400 hover:text-gray-600">전체보기</button>
            </div>
          </div>

          {/* 가로 스크롤 영역 (실제 데이터 렌더링) */}
          <div className="flex overflow-x-auto gap-4 snap-x hide-scrollbar pb-4">
            {loadingCrews ? (
              <p className="text-xs text-gray-400">크루 목록을 불러오는 중...</p>
            ) : crews.length === 0 ? (
              <p className="text-xs text-gray-400">아직 등록된 크루가 없습니다. 첫 크루를 개설해보세요!</p>
            ) : (
              crews.map(crew => (
                <Link 
                    to="/crew" 
                    state={{ crewInfo: crew }} 
                    key={crew.id} 
                    className="min-w-[200px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden snap-start flex-shrink-0 hover:shadow-md transition-shadow"
                  >
                  <div className="h-28 bg-gray-200 relative">
                    <img src={crew.image_url} alt={crew.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">
                      {crew.location}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-extrabold text-sm text-gray-900 mb-1">{crew.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold mb-2">멤버 {crew.members_count}명</p>
                    <div className="flex gap-1 flex-wrap">
                      {crew.tags && crew.tags.map(tag => (
                        <span key={tag} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}