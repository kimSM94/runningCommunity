import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// 대표님의 매칭 주선용 카카오톡 오픈채팅 링크 (실제 링크로 교체해 주세요)
const KAKAO_OPENCHAT_URL = 'https://open.kakao.com/o/sd2MQzYd';

const SAMPLE_RUNNERS = [
  {
    id: 'r1',
    nickname: '지은',
    age: 28,
    gender: '여성',
    region: '서울 성동구',
    course: '서울숲 · 뚝섬한강',
    pace: "5'40\"",
    weekly_km: 25,
    mbti: 'ENFP',
    bio: '퇴근 후 뚝섬에서 5~7km 가볍게 뛰고 편의점 커피 마시는 걸 좋아해요. 기록 욕심보다는 즐겁게 대화하면서 뛸 러닝 메이트 찾습니다.',
    tags: ['대화하며 러닝', '퇴근 후 야간런', '러닝 후 커피'],
    verified: true,
    image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'r2',
    nickname: '현우',
    age: 31,
    gender: '남성',
    region: '서울 서초구',
    course: '반포한강 · 양재천',
    pace: "4'50\"",
    weekly_km: 42,
    mbti: 'ISTJ',
    bio: '다가오는 하프 마라톤 1시간 40분대 목표로 훈련 중입니다. 주말 아침 일찍 상쾌하게 10km 롱런 같이 하실 분 환영해요!',
    tags: ['대회 준비중', '주말 모닝런', '페이스메이커 가능'],
    verified: true,
    image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80'
  }
];

const TAG_OPTIONS = ['대화하며 러닝', '퇴근 후 야간런', '주말 모닝런', '러닝 후 커피', '대회 준비중', '런린이 환영'];

export default function RunMatch() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [runners, setRunners] = useState([]);
  const [selectedRunner, setSelectedRunner] = useState(null);
  
  // 매칭 신청 모달 상태
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantKakao, setApplicantKakao] = useState('');
  const [proposalMessage, setProposalMessage] = useState('이번 주 가볍게 5K 함께 뛸까요?');
  const [sentSignals, setSentSignals] = useState([]);

  // 프로필 등록 모달 상태
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    nickname: '',
    age: '',
    gender: '남성',
    region: '서울 광진구',
    course: '뚝섬한강 · 서울숲',
    pace: "5'30\"",
    weekly_km: 20,
    mbti: 'ENFJ',
    bio: '',
    tags: ['대화하며 러닝'],
    verified: false
  });

  const fetchRunners = async () => {
    const { data, error } = await supabase
      .from('runner_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setRunners(data);
    } else {
      setRunners(SAMPLE_RUNNERS);
    }
  };

  useEffect(() => {
    fetchRunners();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRecordVerify = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsVerifying(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch('/api/verify-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: reader.result })
        });
        const result = await res.json();

        if (result.isRunningRecord) {
          setFormData(prev => ({
            ...prev,
            pace: result.pace || prev.pace,
            verified: true
          }));
          alert(`기록 인증 완료! 평균 페이스(${result.pace})가 자동 반영되었습니다.`);
        } else {
          alert('러닝 앱 기록 화면으로 인식되지 않았습니다.');
        }
      } catch (err) {
        alert('인증 처리 중 오류가 발생했습니다.');
      } finally {
        setIsVerifying(false);
      }
    };
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : prev.tags.length < 3 ? [...prev.tags, tag] : prev.tags
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nickname || !formData.age || !formData.bio) {
      alert('닉네임, 나이, 자기소개를 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    let uploadedUrl = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80';

    try {
      if (profilePhotoFile) {
        const fileExt = profilePhotoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('runner-photos')
          .upload(fileName, profilePhotoFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('runner-photos')
            .getPublicUrl(fileName);
          uploadedUrl = publicUrlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase
        .from('runner_profiles')
        .insert([{
          nickname: formData.nickname,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          region: formData.region,
          course: formData.course,
          pace: formData.pace,
          weekly_km: parseInt(formData.weekly_km, 10) || 0,
          mbti: formData.mbti.toUpperCase(),
          bio: formData.bio,
          tags: formData.tags,
          verified: formData.verified,
          image_url: uploadedUrl
        }]);

      if (insertError) throw insertError;

      alert('프로필이 성공적으로 등록되었습니다!');
      setShowRegisterModal(false);
      fetchRunners();
    } catch (err) {
      console.error(err);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 매칭 신청 접수 (카톡 주선용)
  const handleSendSignal = async (e) => {
    e.preventDefault();
    if (!selectedRunner || !applicantName.trim() || !applicantKakao.trim()) {
      alert('신청자 닉네임과 카카오톡 ID(또는 연락처)를 입력해 주세요.');
      return;
    }

    // Supabase에 매칭 신청 내역 기록 (테이블이 없어도 화면 흐름이 끊기지 않도록 처리)
    try {
      await supabase.from('match_requests').insert([{
        target_runner_id: selectedRunner.id,
        target_nickname: selectedRunner.nickname,
        applicant_name: applicantName,
        applicant_kakao: applicantKakao,
        message: proposalMessage
      }]);
    } catch (err) {
      console.log('DB 기록 생략:', err);
    }

    setSentSignals(prev => [
      ...prev,
      {
        runner: selectedRunner,
        message: proposalMessage,
        status: '매니저 확인중',
        sentAt: '방금 전'
      }
    ]);

    setShowProposalModal(false);
    setSelectedRunner(null);
    setActiveTab('signals');
  };

  const filteredRunners = runners.filter(runner => {
    if (genderFilter === 'ALL') return true;
    return runner.gender === genderFilter;
  });

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen text-neutral-900 pb-24 border-x border-neutral-100">
      
      {/* 상단 미니멀 헤더 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-neutral-500 hover:text-neutral-900 text-sm font-medium">
              ← 홈
            </button>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900">
              PACE MATE
            </h1>
          </div>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
          >
            + 내 프로필 등록
          </button>
        </div>

        <div className="flex gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'discover'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            오늘의 러너
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'signals'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <span>신청 내역</span>
            {sentSignals.length > 0 && (
              <span className="bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {sentSignals.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 탭 1: 오늘의 러너 피드 */}
      {activeTab === 'discover' && (
        <main className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1.5">
              {['ALL', '여성', '남성'].map(type => (
                <button
                  key={type}
                  onClick={() => setGenderFilter(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    genderFilter === type
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'ALL' ? '전체' : type}
                </button>
              ))}
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              매니저 1:1 카톡 매칭
            </span>
          </div>

          <div className="space-y-8">
            {filteredRunners.map((runner) => (
              <article 
                key={runner.id}
                onClick={() => setSelectedRunner(runner)}
                className="group cursor-pointer border border-neutral-200 rounded-2xl overflow-hidden bg-white transition-all hover:border-neutral-400"
              >
                <div className="relative aspect-[4/4] bg-neutral-100 overflow-hidden">
                  <img 
                    src={runner.image_url} 
                    alt={runner.nickname}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  
                  {runner.verified && (
                    <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-900 tracking-tight">
                      GPS 기록 인증됨
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h2 className="text-2xl font-bold tracking-tight">{runner.nickname}</h2>
                      <span className="text-base font-normal text-white/85">{runner.age}</span>
                      <span className="text-xs text-white/70 ml-auto">{runner.region}</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium">
                      주력 코스 · {runner.course}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-neutral-200 border-b border-neutral-200 bg-neutral-50/60 py-3 px-2 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">평균 페이스</div>
                    <div className="text-sm font-mono font-bold text-neutral-900">{runner.pace} /km</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">주간 거리</div>
                    <div className="text-sm font-mono font-bold text-neutral-900">{runner.weekly_km} km</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">성향</div>
                    <div className="text-sm font-mono font-bold text-neutral-900">{runner.mbti}</div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-neutral-700 leading-relaxed line-clamp-2 mb-3">
                    {runner.bio}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {runner.tags?.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}

      {/* 탭 2: 신청 내역 및 카카오톡 연결 안내 */}
      {activeTab === 'signals' && (
        <main className="p-5">
          {sentSignals.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl">
              <p className="text-sm font-semibold text-neutral-700 mb-1">아직 신청한 러닝 매칭이 없습니다</p>
              <p className="text-xs text-neutral-400 mb-4">마음에 드는 러너에게 가볍게 조깅을 신청해 보세요.</p>
              <button 
                onClick={() => setActiveTab('discover')}
                className="text-xs font-semibold bg-neutral-900 text-white px-4 py-2 rounded-lg"
              >
                러너 둘러보기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 카카오톡 빠른 진행 안내 배너 */}
              <div className="p-4 bg-neutral-900 text-white rounded-2xl">
                <p className="text-xs font-semibold text-neutral-300 mb-1">매칭 신청이 접수되었습니다</p>
                <p className="text-sm font-bold leading-snug mb-3">
                  빠른 매칭 주선을 위해 운영자 카카오톡 채널로 신청 닉네임을 남겨주세요.
                </p>
                <a 
                  href={KAKAO_OPENCHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-[#FEE500] text-neutral-900 text-center text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  카카오톡으로 매칭 진행하기
                </a>
              </div>

              {sentSignals.map((item, idx) => (
                <div key={idx} className="p-4 border border-neutral-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={item.runner.image_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{item.runner.nickname}</span>
                        <span className="text-[11px] text-neutral-400">{item.sentAt}</span>
                      </div>
                      <p className="text-xs text-neutral-600 truncate mt-0.5">"{item.message}"</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* 상세 프로필 바텀 시트 */}
      {selectedRunner && !showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Runner Profile</span>
              <button onClick={() => setSelectedRunner(null)} className="text-neutral-400 hover:text-neutral-900 text-lg">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <img src={selectedRunner.image_url} alt="" className="w-16 h-16 rounded-full object-cover border border-neutral-200" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  {selectedRunner.nickname}, {selectedRunner.age}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">{selectedRunner.region} · {selectedRunner.course}</p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-5 grid grid-cols-3 text-center">
              <div>
                <div className="text-[11px] text-neutral-400">평균 페이스</div>
                <div className="text-base font-mono font-bold mt-0.5">{selectedRunner.pace}</div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">주간 마일리지</div>
                <div className="text-base font-mono font-bold mt-0.5">{selectedRunner.weekly_km}km</div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">MBTI</div>
                <div className="text-base font-mono font-bold mt-0.5">{selectedRunner.mbti}</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-neutral-900 mb-2">러닝 스타일 및 소개</h4>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {selectedRunner.bio}
              </p>
            </div>

            <button
              onClick={() => setShowProposalModal(true)}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-colors"
            >
              매칭 신청하기 (카톡 주선)
            </button>
          </div>
        </div>
      )}

      {/* 카톡 매칭 신청 모달 */}
      {showProposalModal && selectedRunner && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSendSignal} className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {selectedRunner.nickname}님과 러닝 신청
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                매니저가 상대방 의사를 확인한 후 카카오톡으로 연결해 드립니다.
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">내 닉네임 (또는 이름)</label>
                <input
                  type="text"
                  required
                  placeholder="예: 상민"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">내 카카오톡 ID (또는 연락처)</label>
                <input
                  type="text"
                  required
                  placeholder="매칭 성사 시 연락받을 카톡 ID"
                  value={applicantKakao}
                  onChange={(e) => setApplicantKakao(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">전달할 첫인사</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  '이번 주 가볍게 5K 함께 뛸까요?',
                  '퇴근 후 저녁 러닝 메이트 구해요!',
                  '러닝 후 커피 한잔 어때요?'
                ].map((preset, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setProposalMessage(preset)}
                    className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-md text-left transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl p-3 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="flex-1 py-3 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-neutral-900 text-white text-xs font-bold rounded-xl"
              >
                신청 완료
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 내 프로필 등록 모달 */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
          <form 
            onSubmit={handleRegisterSubmit}
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto p-6 space-y-5"
          >
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-neutral-900">러닝 프로필 등록</h2>
                <p className="text-xs text-neutral-400">기록을 인증하면 매칭 확률이 3배 높아집니다.</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowRegisterModal(false)} 
                className="text-neutral-400 hover:text-neutral-900 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="w-20 h-20 rounded-2xl bg-neutral-100 border border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:bg-neutral-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-semibold text-neutral-500 text-center px-1">사진 추가</span>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              <div className="text-xs text-neutral-500 leading-relaxed">
                <p className="font-semibold text-neutral-800 mb-0.5">러닝하는 모습이나 자연스러운 사진</p>
                <p>얼굴이 잘 보이거나 달리는 분위기가 느껴지는 사진을 권장합니다.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900">GPS 기록 인증 (선택)</span>
                {formData.verified && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    인증 완료
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mb-3">
                나이키런, 가민, 스트라바 기록 화면을 올리면 AI가 평균 페이스를 자동 입력합니다.
              </p>
              <label className="block w-full text-center py-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 cursor-pointer hover:bg-neutral-100 transition-colors">
                {isVerifying ? 'AI가 기록 분석 중...' : '러닝 기록 캡처 올리기'}
                <input type="file" accept="image/*" onChange={handleRecordVerify} disabled={isVerifying} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">닉네임</label>
                <input 
                  type="text" 
                  required
                  placeholder="예: 상민"
                  value={formData.nickname}
                  onChange={e => setFormData({...formData, nickname: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">나이</label>
                <input 
                  type="number" 
                  required
                  placeholder="32"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">성별</label>
                <select 
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-2 py-2 text-sm bg-white"
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">활동 지역</label>
                <input 
                  type="text" 
                  value={formData.region}
                  onChange={e => setFormData({...formData, region: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">주력 러닝 코스</label>
                <input 
                  type="text" 
                  value={formData.course}
                  onChange={e => setFormData({...formData, course: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">평균 페이스</label>
                <input 
                  type="text" 
                  value={formData.pace}
                  onChange={e => setFormData({...formData, pace: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">주간 거리(km)</label>
                <input 
                  type="number" 
                  value={formData.weekly_km}
                  onChange={e => setFormData({...formData, weekly_km: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">MBTI</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={formData.mbti}
                  onChange={e => setFormData({...formData, mbti: e.target.value})}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5">러닝 스타일 (최대 3개)</label>
              <div className="flex flex-wrap gap-1.5">
                {TAG_OPTIONS.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">자기소개</label>
              <textarea 
                rows={3}
                required
                placeholder="선호하는 러닝 시간대나 페이스를 자유롭게 적어주세요."
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full border border-neutral-300 rounded-xl p-3 text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {isSubmitting ? '등록 중...' : '프로필 등록 완료'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}