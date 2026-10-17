import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export default function Home() {
  const navigate = useNavigate();

  // ⏱️ 페이스 계산기 상태
  const [distance, setDistance] = useState('10K');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [calculatedPace, setCalculatedPace] = useState(null);

  // 🏃‍♂️ 마라톤 대회 및 커뮤니티 상태
  const [upcomingMarathons, setUpcomingMarathons] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  // 💬 실시간 익명 채팅 상태 (로컬 스토리지 연동)
  const chatEndRef = useRef(null);
  const [newChat, setNewChat] = useState('');
  
  // 💡 닉네임을 로컬 스토리지에서 불러오거나 기본값 설정
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('runner_nickname') || '익명러너';
  });

  // 💡 채팅 내역을 로컬 스토리지에서 불러오거나 기본값 설정
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('runner_chats');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 1, name: '달리는 야돈', text: '오늘 날씨 진짜 뛰기 좋네요! 다들 어디 뛰시나요?', isMine: false, time: '18:30' },
      { id: 2, name: '초보러너', text: '저는 이따 퇴근하고 한강공원 가려구요 ㅎㅎ', isMine: false, time: '18:31' },
      { id: 3, name: '서브3도전자', text: '인터벌 하러 트랙 갑니다 ㅠㅠ 다들 화이팅', isMine: false, time: '18:32' },
    ];
  });

  // 💡 닉네임이나 채팅이 변경될 때마다 로컬 스토리지에 자동 저장
  useEffect(() => {
    localStorage.setItem('runner_nickname', nickname);
  }, [nickname]);

  useEffect(() => {
    localStorage.setItem('runner_chats', JSON.stringify(chatMessages));
    // 채팅이 추가될 때마다 맨 아래로 자동 스크롤
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChat.trim()) return;
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChatMessages([
      ...chatMessages,
      { id: Date.now(), name: nickname, text: newChat, isMine: true, time: timeString }
    ]);
    setNewChat('');
  };

  useEffect(() => {
    const fetchUpcomingMarathons = async () => {
      const { data, error } = await supabase.from('marathons').select('*');
      if (!error && data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const processed = data
          .map(event => {
            const eventDate = new Date(event.event_date);
            eventDate.setHours(0, 0, 0, 0);
            const diffTime = eventDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const formattedDate = `${eventDate.getMonth() + 1}.${eventDate.getDate()}`;
            return { ...event, d_day_calc: diffDays, display_date: formattedDate };
          })
          .filter(event => event.d_day_calc >= 0)
          .sort((a, b) => a.d_day_calc - b.d_day_calc)
          .slice(0, 3);

        setUpcomingMarathons(processed);
      }
    };

    const fetchRecentPosts = async () => {
      try {
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(3);
        if (!error && data && data.length > 0) {
          setRecentPosts(data);
        } else {
          setRecentPosts([
            { id: 1, tag: '러닝인증', title: '오늘 저녁 반포 한강공원 10km 뛰실 분 계신가요?', likes: 12, comments: 5 },
            { id: 2, tag: '장비추천', title: '첫 하프 마라톤 나가는데 카본화 꼭 신어야 할까요?', likes: 24, comments: 18 },
            { id: 3, tag: '대회후기', title: '드디어 10km 50분 언더(Sub-50) 달성했습니다 ㅠㅠ', likes: 45, comments: 22 },
          ]);
        }
      } catch (err) {
        // Fallback
      }
    };

    fetchUpcomingMarathons();
    fetchRecentPosts();
  }, []);

  // 페이스 계산 로직
  useEffect(() => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const totalSeconds = (h * 3600) + (m * 60) + s;

    if (totalSeconds === 0) {
      setCalculatedPace(null);
      return;
    }

    let distKm = 10;
    if (distance === 'HALF') distKm = 21.0975;
    if (distance === 'FULL') distKm = 42.195;

    const paceSeconds = totalSeconds / distKm;
    const pMin = Math.floor(paceSeconds / 60);
    const pSec = Math.round(paceSeconds % 60);

    setCalculatedPace(`${pMin}'${pSec < 10 ? '0' : ''}${pSec}"`);
  }, [hours, minutes, seconds, distance]);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[#F8FAFC] min-h-screen pb-24 font-sans">
      
      {/* 👋 1. 웰컴 그리팅 & 오늘의 러닝 팁 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5 flex items-center justify-between">
        <div>
          <span className="inline-block bg-blue-50 text-blue-600 text-[11px] font-extrabold px-2.5 py-1 rounded-full mb-2">
            🏃‍♂️ 러너스테이션에 오신 것을 환영해요!
          </span>
          <h1 className="text-lg font-black text-gray-900 leading-snug">
            오늘도 부상 없이<br />즐거운 러닝 되세요!
          </h1>
          <button 
            onClick={() => navigate('/guide')}
            className="mt-3 text-xs font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <span>📋 대회 D-21 준비 가이드 보러가기</span>
            <span>→</span>
          </button>
        </div>
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0">
          👟
        </div>
      </div>

      {/* 🧩 2. 핵심 기능 퀵 메뉴 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div onClick={() => navigate('/training')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
          <h3 className="font-black text-gray-900 text-sm mb-0.5">AI 런-코치 분석</h3>
          <p className="text-[11px] font-bold text-gray-400">기록 캡처 올리고 숙제 받기</p>
        </div>
        <div onClick={() => navigate('/match')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-pink-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">💖</div>
          <h3 className="font-black text-gray-900 text-sm mb-0.5">러닝 짝꿍 찾기</h3>
          <p className="text-[11px] font-bold text-gray-400">우리 동네 같은 페이스 매칭</p>
        </div>
        <div onClick={() => navigate('/map')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">💧</div>
          <h3 className="font-black text-gray-900 text-sm mb-0.5">러닝 오아시스</h3>
          <p className="text-[11px] font-bold text-gray-400">한강/하천 아리수 위치 확인</p>
        </div>
        <div onClick={() => navigate('/crew')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">🔥</div>
          <h3 className="font-black text-gray-900 text-sm mb-0.5">우리 동네 크루</h3>
          <p className="text-[11px] font-bold text-gray-400">함께 달리는 즐거움 찾기</p>
        </div>
      </div>

      {/* 💬 3. 실시간 익명 러너 톡 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <h2 className="text-base font-black text-gray-900">실시간 러너 톡</h2>
          </div>
          <span className="text-[10px] font-bold text-gray-400">익명 접속 중 🕵️</span>
        </div>

        {/* 채팅창 영역 */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 h-64 overflow-y-auto flex flex-col gap-3 border border-gray-100/50">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
              <span className={`text-[10px] font-bold text-gray-500 mb-1 ${msg.isMine ? 'mr-1' : 'ml-1'}`}>
                {msg.name}
              </span>
              <div className="flex items-end gap-1.5">
                {msg.isMine && <span className="text-[9px] text-gray-400 font-bold mb-1">{msg.time}</span>}
                <div className={`px-3.5 py-2 max-w-[220px] text-[13px] font-bold leading-relaxed shadow-sm ${
                  msg.isMine 
                    ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl' 
                    : 'bg-white border border-gray-200/60 text-gray-800 rounded-r-2xl rounded-tl-2xl'
                }`}>
                  {msg.text}
                </div>
                {!msg.isMine && <span className="text-[9px] text-gray-400 font-bold mb-1">{msg.time}</span>}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* 채팅 입력 영역 (닉네임 설정 포함) */}
        <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
          {/* 💡 닉네임 입력칸 추가 */}
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            maxLength={8}
            className="w-20 bg-gray-50 text-[12px] font-bold border border-gray-200 rounded-xl px-2 py-2.5 outline-none focus:border-blue-500 transition-colors text-center shrink-0"
          />
          <input 
            type="text" 
            value={newChat}
            onChange={(e) => setNewChat(e.target.value)}
            placeholder="메시지를 입력하세요!" 
            className="flex-1 bg-gray-50 text-[13px] font-bold border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            className="bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-4 py-2.5 rounded-xl text-sm font-black transition-colors shrink-0"
          >
            전송
          </button>
        </form>
      </div>

      {/* 📝 4. 커뮤니티 프리뷰 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <h2 className="text-base font-black text-gray-900">오늘의 인기글</h2>
          </div>
          <button onClick={() => navigate('/community')} className="text-xs font-bold text-blue-600 hover:underline">
            더보기
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentPosts.map((post) => (
            <div key={post.id} onClick={() => navigate('/community')} className="py-3 first:pt-0 last:pb-0 cursor-pointer group flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0">{post.tag || '자유'}</span>
                <p className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{post.title}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 shrink-0">
                <span>❤️ {post.likes || 0}</span>
                <span>💬 {post.comments || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⏱️ 5. 컴팩트 페이스 계산기 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
              <span>⏱️</span> 간편 페이스 계산기
            </h2>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['10K', 'HALF', 'FULL'].map(dist => (
              <button
                key={dist}
                onClick={() => setDistance(dist)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                  distance === dist ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 flex items-center justify-center gap-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
            <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="0" className="w-10 bg-transparent text-gray-900 text-lg font-black outline-none border-b-2 border-gray-300 focus:border-blue-500 text-center" />
            <span className="text-gray-500 text-xs font-bold mr-1">시간</span>
            <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="50" className="w-10 bg-transparent text-gray-900 text-lg font-black outline-none border-b-2 border-gray-300 focus:border-blue-500 text-center" />
            <span className="text-gray-500 text-xs font-bold mr-1">분</span>
            <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} placeholder="0" className="w-10 bg-transparent text-gray-900 text-lg font-black outline-none border-b-2 border-gray-300 focus:border-blue-500 text-center" />
            <span className="text-gray-500 text-xs font-bold">초</span>
          </div>
          <div className="w-full sm:w-auto bg-blue-50 border border-blue-100 px-5 py-3 rounded-2xl flex items-center justify-between sm:justify-center gap-3 shrink-0">
            <span className="text-[11px] font-extrabold text-blue-500">목표 페이스</span>
            <span className="text-xl font-black text-blue-700">{calculatedPace ? `${calculatedPace}/km` : `5'00"/km`}</span>
          </div>
        </div>
      </div>

      {/* 📅 6. 다가오는 마라톤 일정 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h2 className="text-base font-black text-gray-900">임박한 마라톤 대회</h2>
          </div>
          <button onClick={() => navigate('/marathons')} className="text-xs font-bold text-gray-400 hover:text-gray-900">전체일정 →</button>
        </div>
        <div className="space-y-2.5">
          {upcomingMarathons.length > 0 ? (
            upcomingMarathons.map((event) => (
              <div key={event.id} onClick={() => navigate(`/marathon/${event.id}`)} className="flex items-center justify-between p-3 bg-gray-50/70 hover:bg-blue-50/50 rounded-2xl border border-gray-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`px-2.5 py-1 text-[11px] font-black text-white rounded-lg shrink-0 ${event.d_day_calc <= 7 ? 'bg-orange-500' : 'bg-blue-500'}`}>
                    {event.d_day_calc === 0 ? 'D-Day' : `D-${event.d_day_calc}`}
                  </span>
                  <span className="font-extrabold text-gray-800 text-xs sm:text-sm truncate">{event.title}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold shrink-0 pl-2">
                  <span>🗓️</span>
                  <span>{event.display_date}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-2xl">
              <span className="text-gray-400 text-xs font-bold">현재 예정된 대회가 없습니다.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}