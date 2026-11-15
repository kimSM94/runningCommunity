import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ADMIN_PIN = '1234';

// 나이 -> 출생연도 뒤 2자리 변환
const getBirthYearTwoDigits = (age) => {
  if (!age) return null;
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - parseInt(age, 10) + 1;
  return birthYear % 100;
};

// 희망 출생연도 일치 판별
const checkBirthYearMatch = (idealText, targetAge) => {
  if (!idealText || !targetAge) return { matched: true, reason: '연령 무관' };
  const targetTwoDigits = getBirthYearTwoDigits(targetAge);
  const fullBirthYear = new Date().getFullYear() - parseInt(targetAge, 10) + 1;

  const numbers = idealText.match(/\d{2,4}/g);
  if (!numbers || numbers.length === 0) return { matched: true, reason: '연령 조건 유연' };

  const normalizedYears = numbers.map((n) => {
    const num = parseInt(n, 10);
    if (num > 1900) return num;
    return num <= 30 ? 2000 + num : 1900 + num;
  });

  if (normalizedYears.length >= 2) {
    const minY = Math.min(...normalizedYears);
    const maxY = Math.max(...normalizedYears);
    const isOk = fullBirthYear >= minY && fullBirthYear <= maxY;
    return {
      matched: isOk,
      reason: isOk ? `희망 연령대 일치 (${targetTwoDigits}년생)` : `연령 범위 외 (${targetTwoDigits}년생)`,
    };
  } else {
    const diff = Math.abs(fullBirthYear - normalizedYears[0]);
    return {
      matched: diff <= 4,
      reason: diff <= 4 ? `희망 연령 인접 (${targetTwoDigits}년생)` : `연령 차이 있음 (${targetTwoDigits}년생)`,
    };
  }
};

// 페이스("5'30\"") -> 초 단위 변환
const paceToSeconds = (paceStr) => {
  if (!paceStr) return 330;
  const nums = paceStr.match(/\d+/g);
  if (!nums || nums.length === 0) return 330;
  const min = parseInt(nums[0], 10);
  const sec = nums[1] ? parseInt(nums[1], 10) : 0;
  return min * 60 + sec;
};

// 쌍방 매칭 가능성(%) 계산 (A <-> B 교차 검증)
const calculateCompatibility = (userA, userB) => {
  let score = 40;
  const matchPoints = [];
  const mismatchPoints = [];

  // 1. 연령대 적합도 (최대 20점)
  const aWantsBYear = checkBirthYearMatch(userA.ideal_birth_year, userB.age);
  const bWantsAYear = checkBirthYearMatch(userB.ideal_birth_year, userA.age);
  if (aWantsBYear.matched) {
    score += 10;
    matchPoints.push(`상대 연령 적합 (${bWantsAYear.matched ? '쌍방' : '단방향'})`);
  } else {
    mismatchPoints.push(aWantsBYear.reason);
  }
  if (bWantsAYear.matched) score += 10;

  // 2. 성격 키워드 교집합 (최대 20점)
  const aIdealPers = userA.ideal_personality || [];
  const bActualPers = userB.personality || [];
  const bIdealPers = userB.ideal_personality || [];
  const aActualPers = userA.personality || [];

  const commonAtoB = aIdealPers.filter((p) => bActualPers.includes(p));
  const commonBtoA = bIdealPers.filter((p) => aActualPers.includes(p));

  if (commonAtoB.length > 0) {
    score += Math.min(10, commonAtoB.length * 4);
    matchPoints.push(`희망 성격 일치 (#${commonAtoB.join(', #')})`);
  }
  if (commonBtoA.length > 0) {
    score += Math.min(10, commonBtoA.length * 4);
  }

  // 3. MBTI 적합도 (최대 10점)
  if (userA.ideal_mbti && userB.mbti) {
    if (userA.ideal_mbti.includes('무관') || userA.ideal_mbti.toUpperCase().includes(userB.mbti.toUpperCase())) {
      score += 5;
      matchPoints.push(`희망 MBTI 부합 (${userB.mbti})`);
    }
  } else {
    score += 3;
  }
  if (userB.ideal_mbti && userA.mbti) {
    if (userB.ideal_mbti.includes('무관') || userB.ideal_mbti.toUpperCase().includes(userA.mbti.toUpperCase())) {
      score += 5;
    }
  } else {
    score += 2;
  }

  // 4. 활동 지역 및 페이스 유사도 (최대 10점)
  const aRegionTokens = (userA.ideal_region || userA.region || '').split(/[\s,·]+/).filter(Boolean);
  const bRegionStr = `${userB.region || ''} ${userB.course || ''}`;
  const regionHit = aRegionTokens.some((token) => token.length >= 2 && bRegionStr.includes(token));
  if (regionHit) {
    score += 5;
    matchPoints.push(`활동 지역/코스 인접 (${userB.region})`);
  }

  const paceDiff = Math.abs(paceToSeconds(userA.pace) - paceToSeconds(userB.pace));
  if (paceDiff <= 50) {
    score += 5;
    matchPoints.push(`페이스 호흡 적합 (${userB.pace})`);
  } else {
    mismatchPoints.push(`페이스 차이 있음 (${userA.pace} vs ${userB.pace})`);
  }

  return {
    percentage: Math.min(99, Math.max(35, score)),
    matchPoints,
    mismatchPoints,
  };
};

export default function AdminMatch() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pace_mate_admin') === 'true';
  });
  const [pinInput, setPinInput] = useState('');

  const [profiles, setProfiles] = useState([]);
  const [genderTab, setGenderTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingRunner, setAnalyzingRunner] = useState(null);

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

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('runner_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProfiles(data);
      }
    } catch (err) {
      console.error('프로필 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfiles();
    }
  }, [isAuthenticated]);

  const updateMatchStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('runner_profiles')
      .update({ match_status: newStatus })
      .eq('id', id);

    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, match_status: newStatus } : p)));
    }
  };

  const toggleProfileVerify = async (id, currentStatus) => {
    const { error } = await supabase
      .from('runner_profiles')
      .update({ verified: !currentStatus })
      .eq('id', id);

    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, verified: !currentStatus } : p)));
    }
  };

  const deleteProfile = async (id, nickname) => {
    if (!window.confirm(`'${nickname}'님의 신청 프로필을 완전히 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('runner_profiles').delete().eq('id', id);
    if (!error) {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const copyToClipboard = (label, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`${label} 복사 완료: ${text}`);
  };

  const copyKakaoCardSummary = (target, partner) => {
    const text =
      `[PACE MATE 매칭 프로필 안내]\n\n` +
      `• 회원번호: #${partner.member_code || '0000'}\n` +
      `• 닉네임/나이: ${partner.nickname || partner.name} (${partner.age}세)\n` +
      `• 거주/코스: ${partner.region} / ${partner.course}\n` +
      `• 러닝스펙: 평균 페이스 ${partner.pace} · 주 ${partner.weekly_km}km\n` +
      `• MBTI/성격: ${partner.mbti} (${(partner.personality || []).join(', ')})\n` +
      `• 기본정보: ${partner.religion || '무교'} · ${partner.smoking || '비흡연'} · 문신 ${partner.tattoo || '없음'}\n` +
      `• 자기소개: ${partner.bio}\n\n` +
      `사진 확인 후 만남 의사를 회신해 주시면 연결 도와드리겠습니다!`;
    navigator.clipboard.writeText(text);
    alert(`#${target.member_code || '0000'} ${target.nickname}님께 보낼 #${partner.member_code || '0000'} ${partner.nickname}님의 소개 카드가 복사되었습니다.`);
  };

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

  // 회원번호(#3312), 닉네임, 휴대폰 번호, 지역 즉시 검색 필터
  const cleanQuery = searchQuery.replace(/^#/, '').trim().toLowerCase();
  const filteredProfiles = profiles.filter((p) => {
    const matchesGender = genderTab === 'ALL' || p.gender === genderTab;
    if (!matchesGender) return false;
    if (!cleanQuery) return true;

    const codeStr = (p.member_code || '').toLowerCase();
    const nameStr = (p.nickname || p.name || '').toLowerCase();
    const phoneStr = (p.phone || '').replace(/-/g, '');
    const regionStr = (p.region || '').toLowerCase();

    return (
      codeStr.includes(cleanQuery) ||
      nameStr.includes(cleanQuery) ||
      phoneStr.includes(cleanQuery.replace(/-/g, '')) ||
      regionStr.includes(cleanQuery)
    );
  });

  const maleCount = profiles.filter((p) => p.gender === '남성').length;
  const femaleCount = profiles.filter((p) => p.gender === '여성').length;

  const candidateMatches = analyzingRunner
    ? profiles
        .filter((p) => p.id !== analyzingRunner.id && p.gender !== analyzingRunner.gender)
        .map((partner) => ({
          partner,
          analysis: calculateCompatibility(analyzingRunner, partner),
        }))
        .sort((a, b) => b.analysis.percentage - a.analysis.percentage)
    : [];

  return (
    <div className="max-w-2xl mx-auto bg-neutral-50 min-h-screen text-neutral-900 pb-24 border-x border-neutral-200/60">
      
      {/* 상단 관리자 헤더 */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-5 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/match')} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">
              ← 신청 페이지
            </button>
            <h1 className="text-base font-bold tracking-tight text-neutral-900">
              매칭 주선 관리자
            </h1>
          </div>
          <button
            onClick={fetchProfiles}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50"
          >
            {loading ? '동기화 중...' : '새로고침'}
          </button>
        </div>

        {/* #회원번호 / 휴대폰 번호 / 닉네임 즉시 검색창 */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="회원번호(예: 3312), 닉네임, 휴대폰 번호로 즉시 검색..."
            className="w-full bg-neutral-100 border border-neutral-200 focus:bg-white focus:border-neutral-900 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* 성별 필터 탭 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[
              { key: 'ALL', label: `전체 (${profiles.length})` },
              { key: '남성', label: `남성 (${maleCount})` },
              { key: '여성', label: `여성 (${femaleCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setGenderTab(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  genderTab === tab.key
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {searchQuery && (
            <span className="text-[11px] font-semibold text-neutral-500">
              검색결과 {filteredProfiles.length}건
            </span>
          )}
        </div>
      </header>

      {/* 신청자 프로필 카드 리스트 */}
      <main className="p-5 space-y-5">
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-400">
            일치하는 회원이 없습니다.
          </div>
        ) : (
          filteredProfiles.map((prof) => {
            const currentStatus = prof.match_status || '심사/매칭대기';
            const bestPartner = profiles
              .filter((other) => other.id !== prof.id && other.gender !== prof.gender)
              .map((other) => calculateCompatibility(prof, other).percentage)
              .sort((a, b) => b - a)[0];

            return (
              <div key={prof.id} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-sm">
                
                {/* 상단: 난수 회원번호(#3312) + 성별 + 진행상태 + 최고 적합도 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyToClipboard('회원번호', `#${prof.member_code || '0000'}`)}
                      className="text-xs font-mono font-black bg-neutral-900 text-white px-2.5 py-0.5 rounded hover:bg-neutral-700"
                      title="클릭하여 번호 복사"
                    >
                      #{prof.member_code || '0000'}
                    </button>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      prof.gender === '여성' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {prof.gender}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      currentStatus === '매칭성사'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentStatus === '프로필전달완료'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {currentStatus}
                    </span>
                  </div>

                  {bestPartner !== undefined && (
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      최고 적합도 {bestPartner}%
                    </span>
                  )}
                </div>

                {/* 사진 2장 및 기본 프로필 */}
                <div className="flex items-start gap-3.5">
                  <div className="flex gap-1.5 shrink-0">
                    {prof.image_url && (
                      <a href={prof.image_url} target="_blank" rel="noopener noreferrer" title="사진 1 원본보기">
                        <img src={prof.image_url} alt="" className="w-16 h-20 rounded-xl object-cover border border-neutral-200 hover:opacity-90" />
                      </a>
                    )}
                    {prof.image_url_2 && (
                      <a href={prof.image_url_2} target="_blank" rel="noopener noreferrer" title="사진 2 원본보기">
                        <img src={prof.image_url_2} alt="" className="w-16 h-20 rounded-xl object-cover border border-neutral-200 hover:opacity-90" />
                      </a>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-neutral-900">
                      {prof.nickname || prof.name}, {prof.age}세
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {prof.region} · {prof.course}
                    </p>
                    <p className="text-xs font-mono font-semibold text-neutral-800 mt-1">
                      페이스 {prof.pace} · 주 {prof.weekly_km}km · {prof.mbti}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {prof.religion || '무교'} · {prof.smoking || '비흡연'} · 문신 {prof.tattoo || '없음'}
                    </p>
                  </div>
                </div>

                {/* 휴대폰 번호 & 카카오톡 ID 복사 영역 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5">
                    <div>
                      <span className="text-[10px] font-semibold text-neutral-500 block">휴대폰 번호</span>
                      <span className="text-sm font-mono font-bold text-neutral-900">{prof.phone || '미입력'}</span>
                    </div>
                    {prof.phone && (
                      <button
                        onClick={() => copyToClipboard('휴대폰 번호', prof.phone)}
                        className="text-xs font-bold bg-neutral-900 text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-800"
                      >
                        번호 복사
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-[#FEE500]/25 border border-[#FEE500] rounded-xl px-3.5 py-2.5">
                    <div className="truncate pr-2">
                      <span className="text-[10px] font-semibold text-neutral-600 block">카카오톡 ID</span>
                      <span className="text-sm font-mono font-bold text-neutral-900">{prof.kakao_id || '미입력'}</span>
                    </div>
                    {prof.kakao_id && (
                      <button
                        onClick={() => copyToClipboard('카카오톡 ID', prof.kakao_id)}
                        className="text-xs font-bold bg-neutral-900 text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 shrink-0"
                      >
                        ID 복사
                      </button>
                    )}
                  </div>
                </div>

                {/* 내 성격 & 자기소개 */}
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {(prof.personality || []).map((p, i) => (
                      <span key={i} className="bg-neutral-100 text-neutral-800 font-semibold px-2 py-0.5 rounded">
                        #{p}
                      </span>
                    ))}
                  </div>
                  <p className="text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    {prof.bio}
                  </p>
                </div>

                {/* 원하는 희망 파트너 조건 박스 */}
                <div className="bg-neutral-900 text-white rounded-2xl p-4 space-y-2.5">
                  <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase block">
                    원하는 파트너 희망 사항
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-400 text-[10px] block">희망 출생연도</span>
                      <span className="font-semibold">{prof.ideal_birth_year || '무관'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">희망 MBTI</span>
                      <span className="font-semibold">{prof.ideal_mbti || '무관'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">희망 직업</span>
                      <span className="font-semibold">{prof.ideal_job || '무관'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block">희망 지역</span>
                      <span className="font-semibold">{prof.ideal_region || '무관'}</span>
                    </div>
                  </div>
                  {prof.ideal_personality && prof.ideal_personality.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {prof.ideal_personality.map((p, i) => (
                        <span key={i} className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded">
                          선호: {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {prof.ideal_description && (
                    <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-white/10">
                      "{prof.ideal_description}"
                    </p>
                  )}
                </div>

                {/* 적합한 상대 매칭 가능성(%) 분석 버튼 */}
                <button
                  onClick={() => setAnalyzingRunner(prof)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  #{prof.member_code || '0000'} {prof.nickname}님과 적합한 상대 매칭 가능성(%) 분석하기
                </button>

                {/* 하단 상태 변경 및 관리 바 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  <div className="flex gap-1">
                    {['심사/매칭대기', '프로필전달완료', '매칭성사'].map((st) => (
                      <button
                        key={st}
                        onClick={() => updateMatchStatus(prof.id, st)}
                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                          currentStatus === st
                            ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                            : 'bg-white text-neutral-500 border-neutral-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleProfileVerify(prof.id, prof.verified)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded border ${
                        prof.verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-neutral-400 border-neutral-200'
                      }`}
                    >
                      {prof.verified ? 'GPS인증됨' : '인증부여'}
                    </button>
                    <button
                      onClick={() => deleteProfile(prof.id, prof.nickname || prof.name)}
                      className="text-[10px] font-semibold text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* 적합 파트너 매칭 가능성(%) 분석 모달 */}
      {analyzingRunner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-neutral-50">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">AI MATCH ANALYZER</span>
                <h3 className="text-base font-bold text-neutral-900">
                  #{analyzingRunner.member_code || '0000'} {analyzingRunner.nickname} ({analyzingRunner.age}세)님 맞춤 파트너
                </h3>
              </div>
              <button
                onClick={() => setAnalyzingRunner(null)}
                className="text-neutral-400 hover:text-neutral-900 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="p-3.5 bg-neutral-100 rounded-xl text-xs space-y-1">
                <div className="font-bold text-neutral-900">기준 회원의 희망 조건:</div>
                <div className="text-neutral-700">
                  연령: {analyzingRunner.ideal_birth_year || '무관'} · MBTI: {analyzingRunner.ideal_mbti || '무관'} · 지역: {analyzingRunner.ideal_region || '무관'}
                </div>
                <div className="text-neutral-600 italic">"{analyzingRunner.ideal_description}"</div>
              </div>

              {candidateMatches.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400">
                  비교할 반대 성별의 등록 회원이 아직 없습니다.
                </div>
              ) : (
                candidateMatches.map(({ partner, analysis }) => (
                  <div key={partner.id} className="border border-neutral-200 rounded-2xl p-4 space-y-3 bg-white">
                    
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {partner.image_url && (
                            <img src={partner.image_url} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-200" />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono font-black bg-neutral-900 text-white px-1.5 py-0.5 rounded">
                                #{partner.member_code || '0000'}
                              </span>
                              <span className="font-bold text-sm text-neutral-900">
                                {partner.nickname} ({partner.age}세)
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {partner.region} · {partner.pace} · {partner.mbti}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 block">쌍방 매칭 가능성</span>
                          <span className={`text-xl font-mono font-black ${
                            analysis.percentage >= 80 ? 'text-emerald-600' :
                            analysis.percentage >= 65 ? 'text-blue-600' : 'text-neutral-700'
                          }`}>
                            {analysis.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            analysis.percentage >= 80 ? 'bg-emerald-500' :
                            analysis.percentage >= 65 ? 'bg-blue-500' : 'bg-neutral-500'
                          }`}
                          style={{ width: `${analysis.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      {analysis.matchPoints.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.matchPoints.map((pt, i) => (
                            <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                              ✓ {pt}
                            </span>
                          ))}
                        </div>
                      )}
                      {analysis.mismatchPoints.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.mismatchPoints.map((pt, i) => (
                            <span key={i} className="bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                              △ {pt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] bg-neutral-50 p-2.5 rounded-xl text-neutral-600">
                      <span className="font-bold text-neutral-800">#{partner.member_code || '0000'} {partner.nickname}님의 희망사항: </span>
                      {partner.ideal_birth_year || '연령무관'} / {partner.ideal_mbti || 'MBTI무관'} / "{partner.ideal_description}"
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => copyKakaoCardSummary(analyzingRunner, partner)}
                        className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold rounded-xl transition-colors"
                      >
                        #{analyzingRunner.member_code || '0000'}님께 보낼 소개글 복사
                      </button>
                      {partner.phone && (
                        <button
                          onClick={() => copyToClipboard(`#${partner.member_code || '0000'} 휴대폰 번호`, partner.phone)}
                          className="px-3 py-2.5 border border-neutral-300 text-neutral-700 text-[11px] font-bold rounded-xl hover:bg-neutral-50"
                        >
                          번호복사
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}