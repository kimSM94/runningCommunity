import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export default function RunningCrew() {
  const location = useLocation();
  const navigate = useNavigate();
  const crewData = location.state?.crewInfo; 

  const [activeTab, setActiveTab] = useState('feed'); 
  const [posts, setPosts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [members, setMembers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // 💡 가입 및 권한 관련 상태
  const [myJoinedCrew, setMyJoinedCrew] = useState(false); 
  const [myNickname, setMyNickname] = useState(''); // 내 닉네임 기억하기

  // 💡 댓글 관련 상태
  const [expandedPostId, setExpandedPostId] = useState(null); // 댓글 창이 열린 게시글 ID
  const [comments, setComments] = useState({}); // 게시글별 댓글 데이터 저장
  const [commentInput, setCommentInput] = useState(''); // 댓글 입력창

  const crewId = crewData?.id;
  const crewName = crewData?.name || '오아시스 러너스 🌵';
  const crewLocation = crewData?.location || '강남/서초';
  const crewImageUrl = crewData?.image_url || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80';
  
  const [currentMemberCount, setCurrentMemberCount] = useState(crewData?.members_count || 1); 

  useEffect(() => {
    const fetchData = async () => {
      if (!crewId) return;

      const { data: postData } = await supabase.from('crew_posts').select('*').eq('crew_id', crewId).order('created_at', { ascending: false });
      if (postData) setPosts(postData);

      const { data: scheduleData } = await supabase.from('crew_schedules').select('*').eq('crew_id', crewId).order('event_date', { ascending: true });
      if (scheduleData) setSchedules(scheduleData);

      const { data: memberData } = await supabase.from('crew_members').select('*').eq('crew_id', crewId).order('created_at', { ascending: true });
      if (memberData) {
        setMembers(memberData);
        
        // 💡 내 가입 여부 및 닉네임 로드
        const joined = localStorage.getItem(`joined_crew_${crewId}`);
        const savedNickname = localStorage.getItem(`crew_nickname_${crewId}`);
        if (joined && savedNickname) {
          setMyJoinedCrew(true);
          setMyNickname(savedNickname);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [crewId]);

  const handleAttend = async (scheduleId, currentCount) => {
    const alreadyAttended = localStorage.getItem(`attended_schedule_${scheduleId}`);
    if (alreadyAttended) return alert("이미 참석 신청을 하셨습니다!");

    const { error } = await supabase.from('crew_schedules').update({ attendees_count: currentCount + 1 }).eq('id', scheduleId);
    if (!error) {
      localStorage.setItem(`attended_schedule_${scheduleId}`, 'true');
      setSchedules(schedules.map(s => s.id === scheduleId ? { ...s, attendees_count: currentCount + 1 } : s));
      alert("참석 신청 완료! 👟🔥");
    }
  };

  // 💡 가입 무한 반복 방지 로직 강화!
  const handleJoinCrew = async () => {
    if (myJoinedCrew) return alert("이미 가입된 크루입니다!");

    const nickname = prompt("크루에서 사용할 멋진 닉네임을 입력해주세요!");
    if (!nickname) return;

    // 닉네임 중복 검사
    if (members.some(m => m.nickname === nickname)) {
      return alert("이미 사용 중인 닉네임입니다. 다른 이름으로 가입해주세요!");
    }

    await supabase.from('crew_members').insert([{ crew_id: crewId, nickname: nickname }]);
    await supabase.from('crews').update({ members_count: currentMemberCount + 1 }).eq('id', crewId);

    // 내 폰에 가입 사실과 닉네임 완벽하게 각인!
    localStorage.setItem(`joined_crew_${crewId}`, 'true');
    localStorage.setItem(`crew_nickname_${crewId}`, nickname); 
    
    setMembers([...members, { id: Date.now(), nickname: nickname, role: 'member' }]);
    setCurrentMemberCount(prev => prev + 1);
    setMyJoinedCrew(true);
    setMyNickname(nickname);
    alert(`환영합니다, ${nickname}님! 🎉`);
  };

  // 💡 댓글 창 열기/닫기 및 불러오기
  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null); // 이미 열려있으면 닫기
      return;
    }
    
    setExpandedPostId(postId);
    const { data } = await supabase.from('crew_post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (data) {
      setComments({ ...comments, [postId]: data });
    }
  };

  // 💡 댓글 작성하기
  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;
    
    // 가입 안 한 사람이 댓글 달면 '익명러너'로 처리
    const authorName = myNickname || '익명러너';

    const { data, error } = await supabase.from('crew_post_comments').insert([
      { post_id: postId, author: authorName, content: commentInput }
    ]).select();

    if (!error && data) {
      // 화면 즉시 업데이트
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), data[0]]
      });
      setCommentInput(''); // 입력창 비우기

      // 게시글의 댓글 수 숫자(Count) 증가
      const post = posts.find(p => p.id === postId);
      await supabase.from('crew_posts').update({ comments: post.comments + 1 }).eq('id', postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 font-sans text-gray-800 pb-24">
      {/* 크루 헤더 영역 */}
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        <img src={crewImageUrl} alt="크루 커버" className="w-full h-full object-cover opacity-50" />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
          <Link to="/" className="text-white text-xl font-black drop-shadow-md">⬅️ 홈</Link>
          <button className="text-white text-2xl drop-shadow-md">⚙️</button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-gray-900 to-transparent">
          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md mb-2 inline-block">
            {crewLocation} 러닝크루
          </span>
          <h1 className="text-2xl font-black text-white">{crewName}</h1>
          <p className="text-sm text-gray-300 font-bold mt-1">멤버 {currentMemberCount}명</p>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white sticky top-0 z-40 flex border-b border-gray-200 shadow-sm">
        <button onClick={() => setActiveTab('feed')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'feed' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}>게시판</button>
        <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'schedule' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}>일정/투표</button>
        <button onClick={() => setActiveTab('members')} className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'members' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}>멤버({currentMemberCount})</button>
      </div>

      {/* 📝 게시판 영역 */}
      {activeTab === 'feed' && (
        <div className="p-3 flex flex-col gap-3">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-10 animate-pulse">불러오는 중...</p>
          ) : posts.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center shadow-sm border border-gray-100">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm font-bold text-gray-500">첫 번째 게시글을 남겨보세요!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 pb-2 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">🏃</div>
                  <p className="font-bold text-sm text-gray-900">{post.author}</p>
                </div>
                <div className="p-4 pt-2">
                  <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                </div>
                
                {/* 하단 좋아요/댓글 버튼 */}
                <div className="px-4 py-3 bg-gray-50/50 flex items-center gap-4 border-t border-gray-50">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                    <span className="text-lg">👍</span><span className="text-xs font-bold">{post.likes}</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <span className="text-lg">💬</span><span className="text-xs font-bold">댓글 {post.comments}</span>
                  </button>
                </div>

                {/* 💡 댓글 창 영역 (토글되었을 때만 보임) */}
                {expandedPostId === post.id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <div className="flex flex-col gap-3 mb-3 max-h-48 overflow-y-auto hide-scrollbar">
                      {(comments[post.id] || []).length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">첫 댓글을 남겨주세요!</p>
                      ) : (
                        (comments[post.id] || []).map(c => (
                          <div key={c.id} className="flex gap-2 text-sm items-start">
                            <span className="font-bold text-gray-900 whitespace-nowrap">{c.author}:</span>
                            <span className="text-gray-700 leading-tight">{c.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={commentInput} 
                        onChange={(e) => setCommentInput(e.target.value)} 
                        placeholder={myJoinedCrew ? "댓글을 입력하세요..." : "가입 후 닉네임으로 작성할 수 있습니다."}
                        className="flex-1 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)} 
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-blue-700"
                      >
                        등록
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 📅 일정/투표 영역 */}
      {activeTab === 'schedule' && (
        <div className="p-3 flex flex-col gap-3">
          {schedules.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center shadow-sm border border-gray-100 mt-2">
              <p className="text-4xl mb-3">🗓️</p>
              <p className="text-sm font-bold text-gray-500">예정된 러닝 일정이 없습니다.</p>
            </div>
          ) : (
            schedules.map(schedule => {
              const isAttended = localStorage.getItem(`attended_schedule_${schedule.id}`);
              
              return (
                <div key={schedule.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {schedule.is_secret && (
                        <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block border border-purple-100">
                          🤫 블라인드 런
                        </span>
                      )}
                      <h3 className="font-extrabold text-base text-gray-900">{schedule.title}</h3>
                      <p className="text-xs text-gray-500 font-bold mt-1">🗓️ {schedule.event_date} ⏰ {schedule.event_time.substring(0, 5)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl mt-3 border border-gray-100">
                    {schedule.is_secret ? (
                      <div className="text-xs font-bold text-gray-500">👀 누가 오는지 비밀입니다!</div>
                    ) : (
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(schedule.attendees_count, 3))].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[10px]">🏃</div>
                        ))}
                        {schedule.attendees_count > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                            +{schedule.attendees_count - 3}
                          </div>
                        )}
                        {schedule.attendees_count === 0 && <span className="text-xs font-bold text-gray-400 pl-2">첫 참석자가 되어주세요!</span>}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleAttend(schedule.id, schedule.attendees_count)}
                      disabled={isAttended}
                      className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                        isAttended ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isAttended ? '✓ 참석 완료' : '참석 투표하기'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 👥 멤버 탭 영역 */}
      {activeTab === 'members' && (
        <div className="p-3">
          {/* 가입 배너 (가입한 사람에겐 안 보임!) */}
          {!myJoinedCrew && (
            <div className="bg-blue-600 text-white p-5 rounded-2xl mb-4 shadow-lg flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg mb-1">우리 크루가 되어주세요!</h3>
                <p className="text-xs text-blue-100">가입하고 오프라인 런에 함께해요.</p>
              </div>
              <button 
                onClick={handleJoinCrew}
                className="bg-white text-blue-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
              >
                가입하기
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-extrabold text-sm mb-4">크루원 목록 ({currentMemberCount})</h3>
            <div className="flex flex-col gap-4">
              {members.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-5">가입한 멤버가 없습니다.</p>
              ) : (
                members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg border border-gray-200">
                      {member.role === 'leader' ? '👑' : '😎'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        {member.nickname} 
                        {myNickname === member.nickname && <span className="ml-2 bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded">나</span>}
                      </p>
                      <p className="text-[10px] text-gray-400">{member.role === 'leader' ? '크루 리더' : '러너'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✍️ 글/일정 쓰기 플로팅 버튼 */}
      {activeTab !== 'members' && (
        <button 
          onClick={() => {
            if (activeTab === 'feed') navigate('/crew/post', { state: { crewId, crewName } });
            if (activeTab === 'schedule') navigate('/crew/schedule/new', { state: { crewId, crewName } });
          }}
          className="fixed bottom-24 right-5 w-14 h-14 bg-gray-900 rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:bg-black active:scale-95 transition-all z-50"
        >
          {activeTab === 'feed' ? '✏️' : '🗓️'}
        </button>
      )}
    </div>
  );
}