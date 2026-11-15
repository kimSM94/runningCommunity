import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Home() {
  const navigate = useNavigate();

  // 전체 메뉴 드로어 상태
  const [menuOpen, setMenuOpen] = useState(false);

  // ⏱️ 페이스 계산기 상태
  const [distance, setDistance] = useState('10K');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [calculatedPace, setCalculatedPace] = useState(null);

  // 🏃‍♂️ 데이터 상태
  const [poolStats, setPoolStats] = useState({ total: 24, male: 13, female: 11 });
  const [upcomingMarathons, setUpcomingMarathons] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  // 💬 실시간 익명 러너 톡 상태 (Supabase Realtime 연동)
  const chatEndRef = useRef(null);
  const [newChat, setNewChat] = useState('');
  const [nickname, setNickname] = useState(() => localStorage.getItem('runner_nickname') || '익명러너');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    localStorage.setItem('runner_nickname', nickname);
  }, [nickname]);

  const formatChatTime = (isoString) => {
    const d = isoString ? new Date(isoString) : new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // 1. 실시간 익명 채팅 초기 로드 & Supabase Realtime 구독
  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('runner_chats')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data) {
        setChatMessages(
          data.map((row) => ({
            id: row.id,
            name: row.nickname,
            text: row.message,
            time: formatChatTime(row.created_at),
          }))
        );
      }
    };

    fetchChats();

    const channel = supabase
      .channel('public:runner_chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'runner_chats' },
        (payload) => {
          const newRow = payload.new;
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newRow.id)) return prev;
            return [
              ...prev,
              {
                id: newRow.id,
                name: newRow.nickname,
                text: newRow.message,
                time: formatChatTime(newRow.created_at),
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 채팅창 스크롤 하단 유지 (최초 로딩 시 페이지 전체 점프 방지 위해 컨테이너 내부 스크롤만 이동)
  useEffect(() => {
    if (chatEndRef.current && chatMessages.length > 0) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!newChat.trim()) return;

    const senderName = nickname.trim() || '익명러너';
    const messageText = newChat.trim();
    setNewChat('');

    const { error } = await supabase
      .from('runner_chats')
      .insert([{ nickname: senderName, message: messageText }]);

    if (error) {
      console.error('채팅 전송 실패:', error);
      alert('메시지 전송 중 오류가 발생했습니다. Supabase runner_chats 테이블 설정을 확인해 주세요.');
    }
  };

  // 2. 매칭 풀 통계, 다가오는 마라톤, 커뮤니티 최신글 로드
  useEffect(() => {
    const fetchPoolStats = async () => {
      const { data, error } = await supabase.from('runner_profiles').select('gender');
      if (!error && data && data.length > 0) {
        const m = data.filter((d) => d.gender === '남성').length;
        const f = data.filter((d) => d.gender === '여성').length;
        setPoolStats({
          total: data.length + 18,
          male: m + 9,
          female: f + 9,
        });
      }
    };

    const fetchUpcomingMarathons = async () => {
      const { data, error } = await supabase.from('marathons').select('*');
      if (!error && data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const processed = data
          .map((event) => {
            const eventDate = new Date(event.event_date);
            eventDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            return { ...event, d_day_calc: diffDays, display_date: `${eventDate.getMonth() + 1}.${eventDate.getDate()}` };
          })
          .filter((event) => event.d_day_calc >= 0)
          .sort((a, b) => a.d_day_calc - b.d_day_calc)
          .slice(0, 3);
        setUpcomingMarathons(processed);
      }
    };

    const fetchRecentPosts = async () => {
      // ⚠️ 실제 커뮤니티 페이지에서 사용하는 테이블명으로 맞춰주세요 (예: community_posts 또는 posts)
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setRecentPosts(data);
      } else {
        setRecentPosts([]);
      }
    };

    fetchPoolStats();
    fetchUpcomingMarathons();
    fetchRecentPosts();
  }, []);

  // 3. 목표 페이스 계산 로직
  useEffect(() => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;
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

  const ALL_SERVICES = [
    { label: '1:1 러닝 소개팅', desc: '비공개 수동 매칭 신청', path: '/match' },
    { label: '러닝 오아시스 지도', desc: '한강·하천 아리수 급수대', path: '/map' },
    { label: 'AI 런-코치 분석', desc: '기록 캡처 훈련 처방', path: '/training' },
    { label: '마라톤 대회 일정', desc: '전국 대회 D-Day 캘린더', path: '/marathons' },
    { label: '우리 동네 러닝 크루', desc: '지역별 그룹 러닝 찾기', path: '/crew' },
    { label: '러너 커뮤니티', desc: '자유게시판 및 후기', path: '/community' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#18181B] font-sans">
      <div className="max-w-lg mx-auto bg-[#FAF9F6] min-h-screen border-x border-[#E6E4DD] pb-24 relative">
        
        {/* 1. 브랜드 전용 미니멀 상단 헤더 */}
        <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E6E4DD] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E05A47]" />
            <span className="font-black text-base tracking-tight text-[#18181B]">
              PACE MATE
            </span>
            <span className="text-[10px] font-semibold text-[#71717A] border-l border-[#D4D4D8] pl-2.5">
              RUNNER STATION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/match')}
              className="text-xs font-bold bg-[#18181B] text-white px-3.5 py-1.5 rounded-full hover:bg-neutral-800 transition-colors"
            >
              소개팅 신청
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full border border-[#D4D4D8] flex items-center justify-center text-xs font-bold text-[#18181B] hover:bg-white transition-colors"
              aria-label="전체 메뉴"
            >
              {menuOpen ? '✕' : '≡'}
            </button>
          </div>
        </header>

        {/* 전체 서비스 드롭다운 서랍 */}
        {menuOpen && (
          <div className="border-b border-[#E6E4DD] bg-white px-6 py-5 space-y-3 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
              ALL SERVICES
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ALL_SERVICES.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(item.path);
                  }}
                  className="text-left p-3 rounded-xl border border-[#E6E4DD] hover:border-[#18181B] transition-colors bg-[#FAF9F6]"
                >
                  <div className="text-xs font-bold text-[#18181B]">{item.label}</div>
                  <div className="text-[10px] text-[#71717A] mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="px-6 pt-7 space-y-8">
          
          {/* 2. 에디토리얼 시그니처 히어로 섹션 */}
          <section className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E05A47]/10 text-[#E05A47] text-[11px] font-bold">
              <span>100% 사진 비공개 · 매니저 1:1 카카오톡 주선</span>
            </div>

            <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-[1.22] text-[#18181B]">
              같은 페이스, 같은 코스를<br />
              달리는 사람과의<br />
              가장 자연스러운 만남.
            </h1>

            <p className="text-xs sm:text-[13px] text-[#52525B] leading-relaxed">
              불특정 다수에게 내 사진이 노출되지 않습니다. 참가 신청서를 남겨주시면 고유 번호(#)가 발급되며, 이상형과 페이스가 맞는 상대를 매니저가 직접 선별해 카카오톡으로 연결해 드립니다.
            </p>

            {/* 실시간 매칭 풀 현황 스트립 */}
            <div className="grid grid-cols-3 divide-x divide-[#E6E4DD] border border-[#E6E4DD] bg-white rounded-2xl py-3.5 text-center">
              <div>
                <span className="text-[10px] font-semibold text-[#71717A] block">매칭 대기 풀</span>
                <span className="text-base font-mono font-black text-[#18181B]">{poolStats.total}명</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#71717A] block">성비 균형</span>
                <span className="text-sm font-mono font-bold text-[#18181B]">남 {poolStats.male} : 여 {poolStats.female}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[#71717A] block">참가 비용</span>
                <span className="text-sm font-bold text-[#E05A47]">오픈 무료</span>
              </div>
            </div>

            {/* 메인 CTA 버튼 그룹 */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => navigate('/match')}
                className="flex-1 py-4 bg-[#18181B] hover:bg-neutral-800 text-white text-sm font-bold rounded-2xl transition-colors shadow-sm"
              >
                비공개 참가 신청하기 →
              </button>
              <button
                onClick={() => navigate('/match')}
                className="px-4 py-4 bg-white border border-[#D4D4D8] hover:border-[#18181B] text-[#18181B] text-xs font-bold rounded-2xl transition-colors"
              >
                대기 러너 보기
              </button>
            </div>
          </section>

          <hr className="border-[#E6E4DD]" />

          {/* 3. 러너 전용 유틸리티 4종 */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold tracking-tight text-[#18181B]">
                러너 전용 유틸리티
              </h2>
              <span className="text-[11px] text-[#71717A]">첫 러닝 코스와 기록 관리</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => navigate('/map')}
                className="p-4 bg-white border border-[#E6E4DD] hover:border-[#18181B] rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                    OASIS MAP
                  </span>
                  <span className="text-xs text-[#A1A1AA] group-hover:text-[#18181B]">↗</span>
                </div>
                <h3 className="text-sm font-bold text-[#18181B]">아리수 급수대 지도</h3>
                <p className="text-[11px] text-[#71717A] mt-1 leading-snug">
                  한강·하천 러닝 코스 내 식수대 위치 확인
                </p>
              </div>

              <div
                onClick={() => navigate('/training')}
                className="p-4 bg-white border border-[#E6E4DD] hover:border-[#18181B] rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                    AI COACH
                  </span>
                  <span className="text-xs text-[#A1A1AA] group-hover:text-[#18181B]">↗</span>
                </div>
                <h3 className="text-sm font-bold text-[#18181B]">AI 기록 & 훈련 분석</h3>
                <p className="text-[11px] text-[#71717A] mt-1 leading-snug">
                  러닝 앱 캡처 업로드 및 페이스 피드백
                </p>
              </div>

              <div
                onClick={() => navigate('/marathons')}
                className="p-4 bg-white border border-[#E6E4DD] hover:border-[#18181B] rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                    RACE D-DAY
                  </span>
                  <span className="text-xs text-[#A1A1AA] group-hover:text-[#18181B]">↗</span>
                </div>
                <h3 className="text-sm font-bold text-[#18181B]">마라톤 대회 일정</h3>
                <p className="text-[11px] text-[#71717A] mt-1 leading-snug">
                  동반 참가하기 좋은 주요 대회 캘린더
                </p>
              </div>

              <div
                onClick={() => navigate('/crew')}
                className="p-4 bg-white border border-[#E6E4DD] hover:border-[#18181B] rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    LOCAL CREW
                  </span>
                  <span className="text-xs text-[#A1A1AA] group-hover:text-[#18181B]">↗</span>
                </div>
                <h3 className="text-sm font-bold text-[#18181B]">우리 동네 크루</h3>
                <p className="text-[11px] text-[#71717A] mt-1 leading-snug">
                  지역 기반 정기 러닝 모임 탐색
                </p>
              </div>
            </div>
          </section>

          {/* 4. 실시간 러너 라운지 (Supabase Realtime 익명 채팅) */}
          <section className="bg-white border border-[#E6E4DD] rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-extrabold text-[#18181B]">실시간 러너 라운지</h2>
              </div>
              <span className="text-[11px] text-[#71717A]">실시간 오픈 톡</span>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E6E4DD] rounded-xl p-3.5 h-52 overflow-y-auto flex flex-col gap-2.5">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#A1A1AA]">
                  첫 메시지를 남겨 러너들과 인사를 나눠보세요!
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = msg.name === (nickname.trim() || '익명러너');
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-semibold text-[#71717A] mb-0.5 px-1">
                        {msg.name}
                      </span>
                      <div className="flex items-end gap-1.5">
                        {isMine && <span className="text-[9px] text-[#A1A1AA]">{msg.time}</span>}
                        <div
                          className={`px-3 py-2 max-w-[230px] text-xs leading-relaxed break-words ${
                            isMine
                              ? 'bg-[#18181B] text-white rounded-l-xl rounded-tr-xl'
                              : 'bg-white border border-[#E6E4DD] text-[#18181B] rounded-r-xl rounded-tl-xl'
                          }`}
                        >
                          {msg.text}
                        </div>
                        {!isMine && <span className="text-[9px] text-[#A1A1AA]">{msg.time}</span>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={8}
                placeholder="닉네임"
                className="w-20 bg-[#FAF9F6] border border-[#D4D4D8] rounded-xl px-2 py-2 text-xs font-semibold text-center outline-none focus:border-[#18181B]"
              />
              <input
                type="text"
                value={newChat}
                onChange={(e) => setNewChat(e.target.value)}
                placeholder="오늘 어디서 뛰시나요?"
                className="flex-1 bg-[#FAF9F6] border border-[#D4D4D8] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#18181B]"
              />
              <button
                type="submit"
                className="bg-[#18181B] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-neutral-800 shrink-0"
              >
                전송
              </button>
            </form>
          </section>

          {/* 5. 목표 페이스 계산기 */}
          <section className="bg-white border border-[#E6E4DD] rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#18181B]">목표 페이스 계산기</h2>
              <div className="flex bg-[#FAF9F6] border border-[#E6E4DD] p-0.5 rounded-lg">
                {['10K', 'HALF', 'FULL'].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setDistance(dist)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-colors ${
                      distance === dist ? 'bg-[#18181B] text-white' : 'text-[#71717A]'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex-1 flex items-center justify-center gap-1 bg-[#FAF9F6] border border-[#E6E4DD] py-2.5 px-3 rounded-xl">
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" className="w-8 bg-transparent text-sm font-mono font-bold text-center border-b border-[#D4D4D8] focus:border-[#18181B] outline-none" />
                <span className="text-[11px] text-[#71717A] mr-1">시</span>
                <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="50" className="w-8 bg-transparent text-sm font-mono font-bold text-center border-b border-[#D4D4D8] focus:border-[#18181B] outline-none" />
                <span className="text-[11px] text-[#71717A] mr-1">분</span>
                <input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} placeholder="00" className="w-8 bg-transparent text-sm font-mono font-bold text-center border-b border-[#D4D4D8] focus:border-[#18181B] outline-none" />
                <span className="text-[11px] text-[#71717A]">초</span>
              </div>

              <div className="bg-[#18181B] text-white px-4 py-2.5 rounded-xl text-right shrink-0">
                <span className="text-[9px] text-neutral-400 block">평균 페이스</span>
                <span className="text-sm font-mono font-bold">
                  {calculatedPace ? `${calculatedPace}/km` : `5'00"/km`}
                </span>
              </div>
            </div>
          </section>

          {/* 6. 러너 커뮤니티 최신글 & 다가오는 대회 */}
          <section className="bg-white border border-[#E6E4DD] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#18181B]">러너 커뮤니티 최신글</h2>
              <button onClick={() => navigate('/community')} className="text-[11px] font-semibold text-[#71717A] hover:text-[#18181B]">
                전체보기 →
              </button>
            </div>

            <div className="divide-y divide-[#F4F4F5]">
              {recentPosts.length === 0 ? (
                <div className="py-4 text-center text-xs text-[#71717A]">
                  아직 등록된 게시글이 없습니다.
                </div>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate('/community')}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E6E4DD] text-[#52525B] shrink-0">
                        {post.category || post.tag || '자유'}
                      </span>
                      <p className="text-xs text-[#27272A] truncate group-hover:underline">
                        {post.title || post.subject || post.content || '제목 없음'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[#A1A1AA] shrink-0">
                      댓글 {post.comment_count ?? post.comments ?? 0}
                    </span>
                  </div>
                ))
              )}
            </div>

            {upcomingMarathons.length > 0 && (
              <div className="pt-3 border-t border-[#E6E4DD] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18181B]">다가오는 대회</span>
                  <button onClick={() => navigate('/marathons')} className="text-[11px] text-[#71717A]">더보기</button>
                </div>
                {upcomingMarathons.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => navigate(`/marathon/${ev.id}`)}
                    className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#FAF9F6] cursor-pointer hover:bg-[#F4F4F5]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] font-bold text-[#E05A47]">
                        {ev.d_day_calc === 0 ? 'D-Day' : `D-${ev.d_day_calc}`}
                      </span>
                      <span className="truncate font-medium text-[#27272A]">{ev.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#71717A] shrink-0 ml-2">{ev.display_date}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}