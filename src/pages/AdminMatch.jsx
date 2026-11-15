import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// 관리자 접속 PIN 번호 (원하시는 숫자로 변경하세요)
const ADMIN_PIN = '1234';

export default function AdminMatch() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pace_mate_admin') === 'true';
  });
  const [pinInput, setPinInput] = useState('');

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'profiles'
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      sessionStorage.setItem('pace_mate_admin', 'true');
      setIsAuthenticated(true);
    } else {
      alert('관리자 PIN 번호가 일치하지 않습니다.');
      setPinInput('');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, profRes] = await Promise.all([
        supabase.from('match_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('runner_profiles').select('*').order('created_at', { ascending: false })
      ]);

      if (!reqRes.error && reqRes.data) setRequests(reqRes.data);
      if (!profRes.error && profRes.data) setProfiles(profRes.data);
    } catch (err) {
      console.error('관리자 데이터 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // 신청 상태 변경 (대기중 -> 카톡연결 -> 매칭완료)
  const updateRequestStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('match_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    }
  };

  // 신청 내역 삭제
  const deleteRequest = async (id) => {
    if (!window.confirm('이 신청 내역을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('match_requests').delete().eq('id', id);
    if (!error) {
      setRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  // 러너 프로필 GPS 인증 뱃지 수동 토글
  const toggleProfileVerify = async (id, currentStatus) => {
    const { error } = await supabase
      .from('runner_profiles')
      .update({ verified: !currentStatus })
      .eq('id', id);

    if (!error) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, verified: !currentStatus } : p));
    }
  };

  // 러너 프로필 삭제
  const deleteProfile = async (id, nickname) => {
    if (!window.confirm(`'${nickname}'님의 프로필을 완전히 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('runner_profiles').delete().eq('id', id);
    if (!error) {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  // 카톡 ID 원클릭 복사
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`복사 완료: ${text}`);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // 관리자 잠금 화면
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">PACE MATE ADMIN</span>
            <h1 className="text-lg font-bold text-neutral-900 mt-0.5">매니저 전용 대시보드</h1>
          </div>
          <input
            type="password"
            inputMode="numeric"
            placeholder="관리자 PIN 입력"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:border-neutral-900"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/match')}
              className="flex-1 py-3 border border-neutral-200 text-neutral-600 text-xs font-bold rounded-xl"
            >
              돌아가기
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-neutral-900 text-white text-xs font-bold rounded-xl"
            >
              접속하기
            </button>
          </div>
        </form>
      </div>
    );
  }

  const pendingCount = requests.filter(r => !r.status || r.status === '대기중').length;

  return (
    <div className="max-w-2xl mx-auto bg-neutral-50 min-h-screen text-neutral-900 pb-20 border-x border-neutral-200/60">
      
      {/* 상단 관리자 헤더 */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/match')} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">
              ← 소개팅 화면
            </button>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">
              매칭 주선 관리자
            </h1>
          </div>
          <button
            onClick={fetchData}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50"
          >
            {loading ? '동기화 중...' : '새로고침'}
          </button>
        </div>

        {/* 요약 지표 카드 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-neutral-400 block">미처리 신청</span>
            <span className="text-lg font-mono font-bold text-orange-600">{pendingCount}건</span>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-neutral-400 block">누적 신청</span>
            <span className="text-lg font-mono font-bold text-neutral-900">{requests.length}건</span>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-neutral-400 block">등록 러너</span>
            <span className="text-lg font-mono font-bold text-neutral-900">{profiles.length}명</span>
          </div>
        </div>

        {/* 탭 전환 */}
        <div className="flex gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400'
            }`}
          >
            매칭 신청 내역 ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'profiles'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400'
            }`}
          >
            등록된 프로필 ({profiles.length})
          </button>
        </div>
      </header>

      {/* 탭 1: 매칭 신청 리스트 */}
      {activeTab === 'requests' && (
        <main className="p-5 space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-400">
              아직 접수된 매칭 신청이 없습니다.
            </div>
          ) : (
            requests.map((req) => {
              const currentStatus = req.status || '대기중';
              return (
                <div key={req.id} className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        currentStatus === '매칭성사'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStatus === '카톡연결'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {currentStatus}
                      </span>
                      <span className="text-xs font-bold text-neutral-900">
                        {req.applicant_name} → {req.target_nickname}님
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {formatDate(req.created_at)}
                    </span>
                  </div>

                  {/* 신청자 카톡 ID 복사 영역 */}
                  <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200/80 rounded-xl px-3.5 py-2.5">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">신청자 카톡 ID / 연락처</span>
                      <span className="text-sm font-mono font-bold text-neutral-900">{req.applicant_kakao}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(req.applicant_kakao)}
                      className="text-xs font-semibold bg-white border border-neutral-300 px-3 py-1.5 rounded-lg hover:bg-neutral-100"
                    >
                      ID 복사
                    </button>
                  </div>

                  {/* 전달 메시지 */}
                  <p className="text-xs text-neutral-700 bg-neutral-50/60 p-3 rounded-xl border border-neutral-100">
                    "{req.message}"
                  </p>

                  {/* 상태 변경 및 삭제 액션 바 */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1.5">
                      {['대기중', '카톡연결', '매칭성사'].map(st => (
                        <button
                          key={st}
                          onClick={() => updateRequestStatus(req.id, st)}
                          className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                            currentStatus === st
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                              : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="text-[11px] text-neutral-400 hover:text-red-600 px-2 py-1"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </main>
      )}

      {/* 탭 2: 등록된 러너 프로필 관리 */}
      {activeTab === 'profiles' && (
        <main className="p-5 space-y-4">
          {profiles.length === 0 ? (
            <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-400">
              DB에 등록된 러너 프로필이 없습니다.
            </div>
          ) : (
            profiles.map((prof) => (
              <div key={prof.id} className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 shrink-0">
                      <img src={prof.image_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-neutral-200" />
                      {prof.image_url_2 && (
                        <img src={prof.image_url_2} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-neutral-900">
                          {prof.nickname || prof.name} ({prof.age}세 · {prof.gender})
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {prof.region} · {prof.course}
                      </p>
                      <p className="text-xs font-mono font-semibold text-neutral-800 mt-0.5">
                        {prof.pace} · 주 {prof.weekly_km}km · {prof.mbti}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 상세 라이프스타일 & 희망 조건 요약 */}
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-xs space-y-1.5 text-neutral-700">
                  <div>
                    <span className="text-neutral-400 mr-2">기본정보:</span>
                    <span>{prof.religion || '-'} / {prof.smoking || '-'} / 문신 {prof.tattoo || '-'}</span>
                  </div>
                  {prof.personality && prof.personality.length > 0 && (
                    <div>
                      <span className="text-neutral-400 mr-2">성격:</span>
                      <span>{prof.personality.join(', ')}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-400 mr-2">희망조건:</span>
                    <span className="font-semibold">
                      {prof.ideal_birth_year || '연령무관'} · {prof.ideal_mbti || 'MBTI무관'} · {prof.ideal_job || '직업무관'}
                    </span>
                  </div>
                  {prof.ideal_description && (
                    <p className="text-neutral-600 pt-1 border-t border-neutral-200/60">
                      이상형 메모: "{prof.ideal_description}"
                    </p>
                  )}
                </div>

                {/* 인증 토글 및 삭제 버튼 */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleProfileVerify(prof.id, prof.verified)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      prof.verified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}
                  >
                    {prof.verified ? 'GPS 인증됨 (해제하기)' : '미인증 (수동 인증 부여)'}
                  </button>
                  <button
                    onClick={() => deleteProfile(prof.id, prof.nickname || prof.name)}
                    className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    프로필 삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      )}
    </div>
  );
}