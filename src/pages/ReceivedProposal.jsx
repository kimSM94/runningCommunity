import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RunnerMatch() {
  const navigate = useNavigate();
  const [isPhotoRevealed, setIsPhotoRevealed] = useState(false);

  // 📦 나에게 호감을 보낸 상대방 데이터
  const matchProfile = {
    id: '러너_F_6595',
    age: '97년생',
    pace: '6\'00"',
    location: '서울 관악구',
    job: '제약회사 사무직',
    mbti: 'ISFJ',
    tags: ['다정한', '섬세한', '영화보기', '아이를 원함'],
    shoes: '나이키 페가수스 40',
    lifestyle: {
      religion: '무교',
      smoking: '비흡연',
      tattoo: '없음',
      drinking: '가끔 즐김'
    },
    dating: {
      last: '1년 이내',
      count: '1~3회',
      marriage: '1년 이내'
    },
    bio: '내 사람에게 다정하고 애교도 많아요! 리액션이 좋고 꼬북상이라는 말 많이 들어요 ㅎㅎ 같이 한강 뛰고 나서 시원한 치맥 하는 소소한 행복을 함께 하고 싶어요 🍻',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
  };

  const handleAccept = () => {
    alert("러닝 파트너 수락 완료! 🎉\n상대방과의 카카오톡 오픈채팅방으로 이동합니다.");
  };

  const handleReject = () => {
    alert("러닝을 정중히 거절했습니다.\n당신의 페이스에 맞는 다른 러너를 찾아드릴게요!");
    navigate(-1);
  };

  // 🔵 스포티한 대시보드 위젯 컴포넌트
  const StatWidget = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex-1">
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-[10px] font-bold text-slate-400">{label}</span>
      <span className="text-sm font-black text-slate-800">{value}</span>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      
      {/* 👑 에너제틱한 상단 배너 */}
      <div className="w-full bg-orange-500 p-3 text-center shadow-md relative z-50">
        <p className="text-white text-xs font-black tracking-wide">
          ⚡ NEW PACE-MAKER FOUND!
        </p>
      </div>

      {/* 헤더 바 */}
      <div className="flex justify-between items-center p-4 sticky top-0 bg-slate-50/90 backdrop-blur-md z-40">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100">
          ←
        </button>
        <h1 className="text-sm font-black text-slate-800">새로운 러닝 제안</h1>
        <Link to="/match/setup" className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-100">
          ⚙️
        </Link>
      </div>

      <div className="p-4 sm:p-5 max-w-lg mx-auto flex flex-col gap-5">
        
        {/* 📸 사진 영역 (스포츠 앱 감성의 라운드 처리) */}
        <div className="relative w-full aspect-[4/5] bg-slate-200 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
          <img 
            src={matchProfile.image} 
            alt="profile" 
            className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
              isPhotoRevealed ? 'blur-none scale-100' : 'blur-xl scale-110 saturate-50'
            }`}
          />
          
          {/* 상단 뱃지 */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full flex items-center px-3 py-1.5 shadow-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-slate-800 text-xs font-black">{matchProfile.id}</span>
          </div>

          {/* 👆 사진 잠금 해제 오버레이 (NRC 느낌의 투명하고 깔끔한 UI) */}
          {!isPhotoRevealed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30">
                <span className="text-3xl">👟</span>
              </div>
              <h3 className="text-white font-black text-xl mb-2 drop-shadow-md">나와 페이스가 맞는 러너</h3>
              <p className="text-slate-200 text-xs font-bold mb-6 drop-shadow-md">
                상대방의 러닝 프로필과 사진을 확인하고<br/>함께 달릴 준비가 되셨나요?
              </p>
              <button 
                onClick={() => setIsPhotoRevealed(true)}
                className="bg-orange-500 text-white font-black text-sm px-8 py-4 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform"
              >
                프로필 잠금 해제하기
              </button>
            </div>
          )}
        </div>

        {/* 📊 러너 대시보드 (스트라바 느낌의 3단 위젯) */}
        <div className="flex gap-3 w-full">
          <StatWidget icon="⏱️" label="평균 페이스" value={matchProfile.pace} />
          <StatWidget icon="📍" label="주 활동" value={matchProfile.location} />
          <StatWidget icon="💼" label="직업" value={matchProfile.job} />
        </div>

        {/* 🏷️ 러너 키워드 (해시태그 스타일) */}
        <div className="flex flex-wrap gap-2 px-1">
          <span className="bg-slate-200 text-slate-700 text-[11px] font-black px-3 py-1.5 rounded-full">
            {matchProfile.age}
          </span>
          <span className="bg-slate-200 text-slate-700 text-[11px] font-black px-3 py-1.5 rounded-full">
            {matchProfile.mbti}
          </span>
          {matchProfile.tags.map(tag => (
            <span key={tag} className="bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
              # {tag}
            </span>
          ))}
        </div>

        {/* 💬 러닝 노트 (소개글) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
          <h3 className="text-xs font-bold text-orange-500 mb-2">RUNNER'S NOTE</h3>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            "{matchProfile.bio}"
          </p>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
            <span className="text-lg">👟</span>
            <span className="text-xs font-bold text-slate-500">주력 러닝화 : <span className="text-slate-800">{matchProfile.shoes}</span></span>
          </div>
        </div>

        {/* 📋 라이프스타일 & 연애 가치관 (깔끔한 테이블 형식) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-100 pb-3">라이프스타일 & 가치관</h3>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-bold">흡연/음주</span>
              <span className="text-slate-800 font-bold">{matchProfile.lifestyle.smoking} / {matchProfile.lifestyle.drinking}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-bold">종교/타투</span>
              <span className="text-slate-800 font-bold">{matchProfile.lifestyle.religion} / {matchProfile.lifestyle.tattoo}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-bold">마지막 연애</span>
              <span className="text-slate-800 font-bold">{matchProfile.dating.last}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 font-bold">결혼 계획</span>
              <span className="text-slate-800 font-bold">{matchProfile.dating.marriage}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 🎮 하단 액션 버튼 (스포츠 앱 감성의 플로팅 버튼) */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4 flex gap-3 z-50 max-w-lg mx-auto right-0">
        <button 
          onClick={handleReject}
          className="w-16 h-16 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-2xl hover:bg-slate-50 transition-colors"
        >
          👋
        </button>
        <button 
          onClick={handleAccept}
          className="flex-1 h-16 bg-slate-900 rounded-full shadow-xl flex items-center justify-center gap-2 text-white hover:bg-black transition-colors"
        >
          <span className="font-black text-base">함께 뛰러 가기</span> 
          <span className="text-xl">🏃‍♂️</span>
        </button>
      </div>

    </div>
  );
}