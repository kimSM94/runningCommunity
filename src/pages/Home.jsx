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

  // 🏃‍♂️ 마라톤 대회, 커뮤니티, 소개팅 프리뷰 상태
  const [upcomingMarathons, setUpcomingMarathons] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [featuredRunners, setFeaturedRunners] = useState([]);

  // 💬 실시간 익명 채팅 상태 (로컬 스토리지 연동)
  const chatEndRef = useRef(null);
  const [newChat, setNewChat] = useState('');
  
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('runner_nickname') || '익명러너';
  });

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

  useEffect(() => {
    localStorage.setItem('runner_nickname', nickname);
  }, [nickname]);

  useEffect(() => {
    localStorage.setItem('runner_chats', JSON.stringify(chatMessages));
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
    // 1. 러닝 소개팅 등록 러너 프리뷰 불러오기
    const fetchFeaturedRunners = async () => {
      const { data, error } = await supabase
        .from('runner_profiles')
        .select('id, nickname, age, region, course, pace, verified, image_url')
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data && data.length > 0) {
        setFeaturedRunners(data);
      } else {
        setFeaturedRunners([
          { id: 'r1', nickname: '지은', age: 28, region: '성동구', course: '서울숲·뚝섬', pace: "5'40\"", verified: true, image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=400&q=80' },
          { id: 'r2', nickname: '현우', age: 31, region: '서초구', course: '반포한강', pace: "4'50\"", verified: true, image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=400&q=80' },
          { id: 'r3', nickname: '서연', age: 26, region: '송파구', course: '석촌호수', pace: "6'15\"", verified: false, image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80' }
        ]);
      }
    };

    // 2. 다가오는 마라톤 대회 불러오기
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

    // 3. 커뮤니티 최신글 불러오기 (실제 DB 테이블명 community_posts 반영)
    const fetchRecentPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
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

    fetchFeaturedRunners();
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
      
      {/* 🎯 1. 메인 히어로 배너: 러닝 소개팅 (PACE MATE) 전면 배치 */}
      <div 
        onClick={() => navigate('/match')}
        className="bg-neutral-900 text-white rounded-3xl p-6 shadow-md mb-5 cursor-pointer group relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide">
              PACE MATE · 1:1 러닝 매칭
            </span>
            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors font-semibold">
              바로가기 →
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug mb-1.5">
            같은 페이스, 같은 코스를 달리는<br />러너와의 자연스러운 만남
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            GPS 기록 인증 러너 프로필 확인 · 매니저 1:1 카카오톡 주선
          </p>
        </div>
      </div>

      {/* 🧩 3. 핵심 기능 퀵 메뉴 (러닝 소개팅 1번 배치) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div onClick={() => navigate('/match')} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/80 cursor-pointer hover:border-neutral-900 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">MAIN</span>
            <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <h3 className="font-bold text-neutral-900 text-sm mb-0.5">러닝 소개팅 (PACE MATE)</h3>
          <p className="text-[a11px] font-medium text-neutral-500">우리 동네 페이스 메이트 매칭</p>
        </div>

        <div onClick={() => navigate('/map')} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/80 cursor-pointer hover:border-blue-400 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">MAP</span>
            <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <h3 className="font-bold text-neutral-900 text-sm mb-0.5">러닝 오아시스</h3>
          <p className="text-[11px] font-medium text-neutral-500">한강/하천 아리수 급수대 지도</p>
        </div>

        <div onClick={() => navigate('/training')} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/80 cursor-pointer hover:border-indigo-400 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">AI COACH</span>
            <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <h3 className="font-bold text-neutral-900 text-sm mb-0.5">AI 런-코치 분석</h3>
          <p className="text-[11px] font-medium text-neutral-500">기록 캡처 올리고 훈련 처방받기</p>
        </div>

        <div onClick={() => navigate('/crew')} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-200/80 cursor-pointer hover:border-orange-400 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">CREW</span>
            <span className="text-xs text-neutral-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
          <h3 className="font-bold text-neutral-900 text-sm mb-0.5">우리 동네 크루</h3>
          <p className="text-[11px] font-medium text-neutral-500">함께 달리는 그룹 러닝 찾기</p>
        </div>
      </div>

      {/* 💬 4. 실시간 익명 러너 톡 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200/80 mb-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-sm font-bold text-neutral-900">실시간 러너 톡</h2>
          </div>
          <span className="text-[11px] font-medium text-neutral-400">익명 라운지</span>
        </div>

        <div className="bg-[#F8FAFC] rounded-2xl p-4 h-60 overflow-y-auto flex flex-col gap-3 border border-neutral-100">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
              <span className={`text-[10px] font-semibold text-neutral-500 mb-1 ${msg.isMine ? 'mr-1' : 'ml-1'}`}>
                {msg.name}
              </span>
              <div className="flex items-end gap-1.5">
                {msg.isMine && <span className="text-[9px] text-neutral-400 font-medium mb-1">{msg.time}</span>}
                <div className={`px-3.5 py-2 max-w-[220px] text-[13px] font-medium leading-relaxed ${
                  msg.isMine 
                    ? 'bg-neutral-900 text-white rounded-l-2xl rounded-tr-2xl' 
                    : 'bg-white border border-neutral-200 text-neutral-800 rounded-r-2xl rounded-tl-2xl'
                }`}>
                  {msg.text}
                </div>
                {!msg.isMine && <span className="text-[9px] text-neutral-400 font-medium mb-1">{msg.time}</span>}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            maxLength={8}
            className="w-20 bg-neutral-50 text-[12px] font-semibold border border-neutral-200 rounded-xl px-2 py-2.5 outline-none focus:border-neutral-900 transition-colors text-center shrink-0"
          />
          <input 
            type="text" 
            value={newChat}
            onChange={(e) => setNewChat(e.target.value)}
            placeholder="메시지를 입력하세요" 
            className="flex-1 bg-neutral-50 text-[13px] font-medium border border-neutral-200 rounded-xl px-4 py-2.5 outline-none focus:border-neutral-900 transition-colors"
          />
          <button 
            type="submit"
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            전송
          </button>
        </form>
      </div>

      {/* 📝 5. 커뮤니티 프리뷰 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200/80 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-neutral-900">오늘의 러닝 이야기</h2>
          <button onClick={() => navigate('/community')} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">
            더보기 →
          </button>
        </div>
        <div className="divide-y divide-neutral-100">
          {recentPosts.map((post) => (
            <div key={post.id} onClick={() => navigate('/community')} className="py-3 first:pt-0 last:pb-0 cursor-pointer group flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">{post.tag || '자유'}</span>
                <p className="text-xs font-medium text-neutral-800 truncate group-hover:text-black transition-colors">{post.title}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400 shrink-0">
                <span>좋아요 {post.likes || 0}</span>
                <span>댓글 {post.comments || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⏱️ 6. 컴팩트 페이스 계산기 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200/80 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-neutral-900">간편 페이스 계산기</h2>
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {['10K', 'HALF', 'FULL'].map(dist => (
              <button
                key={dist}
                onClick={() => setDistance(dist)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  distance === dist ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 flex items-center justify-center gap-1.5 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
            <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="0" className="w-10 bg-transparent text-neutral-900 text-base font-mono font-bold outline-none border-b border-neutral-300 focus:border-neutral-900 text-center" />
            <span className="text-neutral-500 text-xs font-medium mr-1">시간</span>
            <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="50" className="w-10 bg-transparent text-neutral-900 text-base font-mono font-bold outline-none border-b border-neutral-300 focus:border-neutral-900 text-center" />
            <span className="text-neutral-500 text-xs font-medium mr-1">분</span>
            <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} placeholder="0" className="w-10 bg-transparent text-neutral-900 text-base font-mono font-bold outline-none border-b border-neutral-300 focus:border-neutral-900 text-center" />
            <span className="text-neutral-500 text-xs font-medium">초</span>
          </div>
          <div className="w-full sm:w-auto bg-neutral-900 text-white px-5 py-3 rounded-2xl flex items-center justify-between sm:justify-center gap-3 shrink-0">
            <span className="text-[11px] font-medium text-neutral-400">목표 페이스</span>
            <span className="text-lg font-mono font-bold">{calculatedPace ? `${calculatedPace}/km` : `5'00"/km`}</span>
          </div>
        </div>
      </div>

      {/* 📅 7. 다가오는 마라톤 일정 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200/80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-neutral-900">임박한 마라톤 대회</h2>
          <button onClick={() => navigate('/marathons')} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">전체일정 →</button>
        </div>
        <div className="space-y-2">
          {upcomingMarathons.length > 0 ? (
            upcomingMarathons.map((event) => (
              <div key={event.id} onClick={() => navigate(`/marathon/${event.id}`)} className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-2xl border border-neutral-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`px-2 py-0.5 text-[11px] font-mono font-bold text-white rounded shrink-0 ${event.d_day_calc <= 7 ? 'bg-orange-600' : 'bg-neutral-800'}`}>
                    {event.d_day_calc === 0 ? 'D-Day' : `D-${event.d_day_calc}`}
                  </span>
                  <span className="font-semibold text-neutral-800 text-xs sm:text-sm truncate">{event.title}</span>
                </div>
                <span className="text-neutral-400 text-xs font-mono font-medium shrink-0 pl-2">
                  {event.display_date}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-neutral-50 rounded-2xl">
              <span className="text-neutral-400 text-xs font-medium">현재 예정된 대회가 없습니다.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}