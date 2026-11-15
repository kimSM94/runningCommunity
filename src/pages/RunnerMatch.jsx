import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const KAKAO_OPENCHAT_URL = 'https://open.kakao.com/o/본인오픈채팅코드';

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
    personality: ['활발한', '다정한', '유머러스한'],
    religion: '무교',
    smoking: '비흡연',
    tattoo: '없음',
    bio: '퇴근 후 뚝섬에서 5~7km 가볍게 뛰고 편의점 커피 마시는 걸 좋아해요. 기록 욕심보다는 즐겁게 대화하면서 뛸 러닝 메이트 찾습니다.',
    tags: ['대화하며 러닝', '퇴근 후 야간런', '러닝 후 커피'],
    ideal_birth_year: '92년생 ~ 98년생',
    ideal_mbti: 'INFJ, INTJ, ENFJ',
    ideal_job: '전문직, 직장인',
    ideal_region: '서울 성동구, 광진구, 강남구',
    ideal_personality: ['다정한', '책임감 있는', '유머러스한'],
    ideal_description: '운동 좋아하고 자기관리 꾸준히 하시는 분이면 좋겠어요. 주말에 같이 한강 뛰고 맛있는 브런치 먹으러 가요!',
    verified: true,
    image_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
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
    personality: ['진지한', '책임감 있는', '섬세한'],
    religion: '기독교',
    smoking: '비흡연',
    tattoo: '없음',
    bio: '다가오는 하프 마라톤 1시간 40분대 목표로 훈련 중입니다. 주말 아침 일찍 상쾌하게 10km 롱런 같이 하실 분 환영해요!',
    tags: ['대회 준비중', '주말 모닝런', '페이스메이커 가능'],
    ideal_birth_year: '95년생 ~ 01년생',
    ideal_mbti: 'ENFP, ESFJ, ISFP',
    ideal_job: '무관',
    ideal_region: '서울 강남권, 한강 인접 지역',
    ideal_personality: ['활발한', '다정한', '긍정적인'],
    ideal_description: '밝은 에너지를 가진 분과 함께 달리고 싶습니다. 초보 러너시라면 제가 페이스 맞춰드릴 수 있어요.',
    verified: true,
    image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
    image_url_2: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80'
  }
];

const TAG_OPTIONS = ['대화하며 러닝', '퇴근 후 야간런', '주말 모닝런', '러닝 후 커피', '대회 준비중', '런린이 환영'];
const PERSONALITY_OPTIONS = ['활발한', '다정한', '유머러스한', '섬세한', '진지한', '책임감 있는', '즉흥적인', '차분한', '긍정적인', '계획적인'];
const RELIGION_OPTIONS = ['무교', '기독교', '천주교', '불교', '기타'];
const SMOKING_OPTIONS = ['비흡연', '전자담배', '흡연'];
const TATTOO_OPTIONS = ['없음', '작은 레터링/미니타투', '있음'];

export default function RunMatch() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [runners, setRunners] = useState([]);
  const [selectedRunner, setSelectedRunner] = useState(null);
  const [detailPhotoIdx, setDetailPhotoIdx] = useState(0);

  // 매칭 신청 모달 상태
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantKakao, setApplicantKakao] = useState('');
  const [proposalMessage, setProposalMessage] = useState('이번 주 가볍게 5K 함께 뛸까요?');
  const [sentSignals, setSentSignals] = useState([]);

  // 3단계 프로필 등록 위자드 상태
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 1 | 2 | 3
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 사진 2장 파일 및 미리보기 상태
  const [photoFiles, setPhotoFiles] = useState([null, null]);
  const [photoPreviews, setPhotoPreviews] = useState([null, null]);

  const [formData, setFormData] = useState({
    // Step 1: 내 프로필
    nickname: '',
    age: '',
    gender: '남성',
    region: '서울 광진구',
    course: '뚝섬한강 · 서울숲',
    pace: "5'30\"",
    weekly_km: 20,
    mbti: 'ENFJ',
    personality: [], // 최대 3개
    religion: '무교',
    smoking: '비흡연',
    tattoo: '없음',
    tags: ['대화하며 러닝'],
    bio: '',
    verified: false,
    // Step 2: 희망 파트너 조건
    ideal_birth_year: '',
    ideal_mbti: '',
    ideal_job: '',
    ideal_region: '',
    ideal_personality: [], // 최대 3개
    ideal_description: ''
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

  // 사진 2장 개별 핸들러
  const handlePhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newFiles = [...photoFiles];
    const newPreviews = [...photoPreviews];
    newFiles[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    setPhotoFiles(newFiles);
    setPhotoPreviews(newPreviews);
  };

  // AI 기록 캡처 인증 핸들러
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

  // 배열 선택 토글 (최대 3개 제한)
  const toggleArrayField = (field, value, max = 3) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
      if (current.length >= max) {
        alert(`최대 ${max}개까지 선택할 수 있습니다.`);
        return prev;
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  // 스텝 이동 유효성 검사
  const handleNextStep = () => {
    if (registerStep === 1) {
      if (!photoPreviews[0] || !photoPreviews[1]) {
        alert('프로필 사진 2장을 모두 등록해 주세요.');
        return;
      }
      if (!formData.nickname.trim() || !formData.age) {
        alert('닉네임과 나이를 입력해 주세요.');
        return;
      }
      if (formData.personality.length !== 3) {
        alert('내 성격을 정확히 3가지 선택해 주세요.');
        return;
      }
      if (!formData.bio.trim()) {
        alert('자기소개를 작성해 주세요.');
        return;
      }
      setRegisterStep(2);
    } else if (registerStep === 2) {
      if (!formData.ideal_birth_year.trim() || !formData.ideal_description.trim()) {
        alert('희망 출생연도와 원하는 상대방 설명을 입력해 주세요.');
        return;
      }
      setRegisterStep(3);
    }
  };

  // 최종 등록 제출 (Step 3)
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const defaultImg1 = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80';
    const defaultImg2 = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80';
    let uploadedUrls = [defaultImg1, defaultImg2];

    try {
      for (let i = 0; i < 2; i++) {
        if (photoFiles[i]) {
          const fileExt = photoFiles[i].name.split('.').pop();
          const fileName = `${Date.now()}_${i}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('runner-photos')
            .upload(fileName, photoFiles[i]);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('runner-photos')
              .getPublicUrl(fileName);
            uploadedUrls[i] = publicUrlData.publicUrl;
          }
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
          personality: formData.personality,
          religion: formData.religion,
          smoking: formData.smoking,
          tattoo: formData.tattoo,
          tags: formData.tags,
          bio: formData.bio,
          verified: formData.verified,
          image_url: uploadedUrls[0],
          image_url_2: uploadedUrls[1],
          ideal_birth_year: formData.ideal_birth_year,
          ideal_mbti: formData.ideal_mbti.toUpperCase(),
          ideal_job: formData.ideal_job,
          ideal_region: formData.ideal_region,
          ideal_personality: formData.ideal_personality,
          ideal_description: formData.ideal_description
        }]);

      if (insertError) throw insertError;

      alert('프로필이 성공적으로 등록되었습니다!');
      setShowRegisterModal(false);
      setRegisterStep(1);
      fetchRunners();
    } catch (err) {
      console.error(err);
      alert('프로필 저장 중 오류가 발생했습니다. Supabase 테이블 컬럼을 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 매칭 신청 접수
  const handleSendSignal = async (e) => {
    e.preventDefault();
    if (!selectedRunner || !applicantName.trim() || !applicantKakao.trim()) {
      alert('신청자 닉네임과 카카오톡 ID를 입력해 주세요.');
      return;
    }

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
            onClick={() => {
              setRegisterStep(1);
              setShowRegisterModal(true);
            }}
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
                onClick={() => {
                  setSelectedRunner(runner);
                  setDetailPhotoIdx(0);
                }}
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

                  {runner.image_url_2 && (
                    <div className="absolute top-3.5 right-3.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
                      사진 2장
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
                    {runner.personality?.map((p, idx) => (
                      <span 
                        key={`p-${idx}`}
                        className="text-[11px] font-semibold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-md"
                      >
                        {p}
                      </span>
                    ))}
                    {runner.tags?.slice(0, 2).map((tag, idx) => (
                      <span 
                        key={`t-${idx}`}
                        className="text-[11px] font-medium text-neutral-500 border border-neutral-200 px-2.5 py-1 rounded-md"
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

      {/* 탭 2: 신청 내역 */}
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

      {/* 상세 프로필 바텀 시트 (사진 2장 슬라이드 + 라이프스타일 + 희망 파트너 조건 열람) */}
      {selectedRunner && !showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Runner Profile</span>
              <button onClick={() => setSelectedRunner(null)} className="text-neutral-400 hover:text-neutral-900 text-lg">
                ✕
              </button>
            </div>

            {/* 사진 2장 전환 뷰어 */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 mb-4">
              <img 
                src={detailPhotoIdx === 0 ? selectedRunner.image_url : (selectedRunner.image_url_2 || selectedRunner.image_url)} 
                alt="" 
                className="w-full h-full object-cover"
              />
              {selectedRunner.image_url_2 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                  {[0, 1].map(idx => (
                    <button
                      key={idx}
                      onClick={() => setDetailPhotoIdx(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        detailPhotoIdx === idx ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-neutral-900">
                  {selectedRunner.nickname}, {selectedRunner.age}
                </h3>
                <span className="text-xs text-neutral-500">{selectedRunner.region}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">주력 코스 · {selectedRunner.course}</p>
            </div>

            {/* 러닝 스펙 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 mb-4 grid grid-cols-3 text-center">
              <div>
                <div className="text-[11px] text-neutral-400">평균 페이스</div>
                <div className="text-sm font-mono font-bold mt-0.5">{selectedRunner.pace}</div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">주간 마일리지</div>
                <div className="text-sm font-mono font-bold mt-0.5">{selectedRunner.weekly_km}km</div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">MBTI</div>
                <div className="text-sm font-mono font-bold mt-0.5">{selectedRunner.mbti}</div>
              </div>
            </div>

            {/* 라이프스타일 정보 (종교 / 흡연 / 문신) */}
            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              <div className="border border-neutral-200 rounded-lg py-2 px-1">
                <div className="text-[10px] text-neutral-400">종교</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">{selectedRunner.religion || '무교'}</div>
              </div>
              <div className="border border-neutral-200 rounded-lg py-2 px-1">
                <div className="text-[10px] text-neutral-400">흡연</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">{selectedRunner.smoking || '비흡연'}</div>
              </div>
              <div className="border border-neutral-200 rounded-lg py-2 px-1">
                <div className="text-[10px] text-neutral-400">문신</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">{selectedRunner.tattoo || '없음'}</div>
              </div>
            </div>

            {/* 성격 키워드 */}
            {selectedRunner.personality && selectedRunner.personality.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-neutral-900 mb-2">나의 성격</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRunner.personality.map((p, i) => (
                    <span key={i} className="text-xs font-medium bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-md">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 자기소개 */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-neutral-900 mb-1.5">자기소개</h4>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {selectedRunner.bio}
              </p>
            </div>

            {/* 희망하는 파트너 조건 섹션 */}
            {(selectedRunner.ideal_birth_year || selectedRunner.ideal_description) && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl mb-6 space-y-2.5">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">희망하는 러닝 파트너</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">희망 연령대</span>
                    <span className="font-semibold text-neutral-800">{selectedRunner.ideal_birth_year || '-'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">희망 MBTI</span>
                    <span className="font-semibold text-neutral-800">{selectedRunner.ideal_mbti || '무관'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">희망 직업</span>
                    <span className="font-semibold text-neutral-800">{selectedRunner.ideal_job || '무관'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">희망 지역</span>
                    <span className="font-semibold text-neutral-800">{selectedRunner.ideal_region || '무관'}</span>
                  </div>
                </div>
                {selectedRunner.ideal_description && (
                  <p className="text-xs text-neutral-600 leading-relaxed pt-2 border-t border-neutral-200/80">
                    "{selectedRunner.ideal_description}"
                  </p>
                )}
              </div>
            )}

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

      {/* ================================================================= */}
      {/* 3단계 멀티 스텝 프로필 등록 모달                                  */}
      {/* ================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* 모달 상단 헤더 & 프로그레스 바 */}
            <div className="px-6 pt-5 pb-4 border-b border-neutral-100 shrink-0">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    STEP {registerStep} OF 3
                  </span>
                  <h2 className="text-base font-bold text-neutral-900">
                    {registerStep === 1 && '내 프로필 및 라이프스타일'}
                    {registerStep === 2 && '희망하는 파트너 조건'}
                    {registerStep === 3 && '프로필 최종 요약 확인'}
                  </h2>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowRegisterModal(false)} 
                  className="text-neutral-400 hover:text-neutral-900 text-lg p-1"
                >
                  ✕
                </button>
              </div>
              
              {/* 3단계 진행 게이지 */}
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map(step => (
                  <div 
                    key={step}
                    className={`h-1 rounded-full transition-colors ${
                      step <= registerStep ? 'bg-neutral-900' : 'bg-neutral-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 모달 스크롤 본문 */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* ---------------- STEP 1: 내 프로필 등록 ---------------- */}
              {registerStep === 1 && (
                <>
                  {/* 1. 사진 2장 등록 */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-2">
                      프로필 사진 2장 (필수)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1].map(idx => (
                        <label 
                          key={idx}
                          className="aspect-[4/4] rounded-2xl bg-neutral-50 border border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-neutral-100 transition-colors relative"
                        >
                          {photoPreviews[idx] ? (
                            <img src={photoPreviews[idx]} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-3">
                              <span className="block text-lg text-neutral-400 mb-1">+</span>
                              <span className="text-[11px] font-semibold text-neutral-600">
                                {idx === 0 ? '메인 사진 (얼굴/전신)' : '서브 사진 (러닝/일상)'}
                              </span>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(idx, e)} className="hidden" />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 2. 기본 인적사항 */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">닉네임</label>
                      <input 
                        type="text" 
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

                  {/* 3. 활동 지역 & 주력 코스 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">거주/활동 지역</label>
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

                  {/* 4. 러닝 스펙 & AI 인증 */}
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">러닝 스펙 및 기록 인증</span>
                      {formData.verified && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          GPS 인증됨
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-1">평균 페이스</label>
                        <input 
                          type="text" 
                          value={formData.pace}
                          onChange={e => setFormData({...formData, pace: e.target.value})}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-1">주간 거리(km)</label>
                        <input 
                          type="number" 
                          value={formData.weekly_km}
                          onChange={e => setFormData({...formData, weekly_km: e.target.value})}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-1">MBTI</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          value={formData.mbti}
                          onChange={e => setFormData({...formData, mbti: e.target.value})}
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs uppercase"
                        />
                      </div>
                    </div>
                    <label className="block w-full text-center py-2 bg-white border border-neutral-300 rounded-lg text-[11px] font-semibold text-neutral-800 cursor-pointer hover:bg-neutral-100 transition-colors">
                      {isVerifying ? 'AI 기록 분석 중...' : '러닝 앱 기록 캡처로 페이스 인증하기'}
                      <input type="file" accept="image/*" onChange={handleRecordVerify} disabled={isVerifying} className="hidden" />
                    </label>
                  </div>

                  {/* 5. 내 성격 3개 선택 */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-neutral-900">내 성격 키워드 (3개 선택)</label>
                      <span className="text-[11px] font-mono font-semibold text-neutral-500">
                        {formData.personality.length} / 3
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PERSONALITY_OPTIONS.map(item => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleArrayField('personality', item, 3)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            formData.personality.includes(item)
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6. 종교 / 흡연 / 문신 선택 */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5">종교</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {RELIGION_OPTIONS.map(rel => (
                          <button
                            type="button"
                            key={rel}
                            onClick={() => setFormData({...formData, religion: rel})}
                            className={`py-2 rounded-lg text-xs border transition-colors ${
                              formData.religion === rel
                                ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                : 'bg-white text-neutral-600 border-neutral-200'
                            }`}
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5">흡연 여부</label>
                        <div className="grid grid-cols-3 gap-1">
                          {SMOKING_OPTIONS.map(smk => (
                            <button
                              type="button"
                              key={smk}
                              onClick={() => setFormData({...formData, smoking: smk})}
                              className={`py-2 rounded-lg text-[11px] border transition-colors ${
                                formData.smoking === smk
                                  ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                                  : 'bg-white text-neutral-600 border-neutral-200'
                              }`}
                            >
                              {smk}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5">문신 여부</label>
                        <select
                          value={formData.tattoo}
                          onChange={e => setFormData({...formData, tattoo: e.target.value})}
                          className="w-full border border-neutral-300 rounded-lg px-2.5 py-2 text-xs bg-white"
                        >
                          {TATTOO_OPTIONS.map(tat => (
                            <option key={tat} value={tat}>{tat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 7. 자기소개 */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5">자기소개</label>
                    <textarea 
                      rows={3}
                      placeholder="평소 러닝 스타일, 좋아하는 코스, 어떤 러닝 메이트를 만나고 싶은지 자유롭게 적어주세요."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="w-full border border-neutral-300 rounded-xl p-3 text-sm focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </>
              )}

              {/* ---------------- STEP 2: 희망 파트너 조건 ---------------- */}
              {registerStep === 2 && (
                <>
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 leading-relaxed">
                    작성하신 조건은 매니저가 1:1 매칭을 주선할 때 가장 우선적으로 참고하는 기준이 됩니다.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">희망 출생연도 (연령대)</label>
                      <input 
                        type="text" 
                        placeholder="예: 93년생 ~ 99년생"
                        value={formData.ideal_birth_year}
                        onChange={e => setFormData({...formData, ideal_birth_year: e.target.value})}
                        className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">희망 MBTI</label>
                      <input 
                        type="text" 
                        placeholder="예: ENFP, INFJ 또는 무관"
                        value={formData.ideal_mbti}
                        onChange={e => setFormData({...formData, ideal_mbti: e.target.value})}
                        className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm uppercase focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">희망 직업군</label>
                      <input 
                        type="text" 
                        placeholder="예: 직장인, 전문직, 무관"
                        value={formData.ideal_job}
                        onChange={e => setFormData({...formData, ideal_job: e.target.value})}
                        className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">희망 활동 지역</label>
                      <input 
                        type="text" 
                        placeholder="예: 서울 성동구, 강남권"
                        value={formData.ideal_region}
                        onChange={e => setFormData({...formData, ideal_region: e.target.value})}
                        className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-neutral-900">희망하는 상대방 성격 (최대 3개)</label>
                      <span className="text-[11px] font-mono text-neutral-500">{formData.ideal_personality.length} / 3</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PERSONALITY_OPTIONS.map(item => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => toggleArrayField('ideal_personality', item, 3)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            formData.ideal_personality.includes(item)
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                      어떤 사람을 원하시나요? (자유 서술)
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="예: 대화가 잘 통하고 긍정적인 에너지를 가진 분이면 좋겠습니다. 주말에 같이 가볍게 5km 뛰고 카페 가는 데이트를 즐기고 싶어요."
                      value={formData.ideal_description}
                      onChange={e => setFormData({...formData, ideal_description: e.target.value})}
                      className="w-full border border-neutral-300 rounded-xl p-3 text-sm focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </>
              )}

              {/* ---------------- STEP 3: 최종 요약 및 등록 ---------------- */}
              {registerStep === 3 && (
                <div className="space-y-5">
                  {/* 내 프로필 요약 카드 */}
                  <div className="border border-neutral-200 rounded-2xl p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-xs font-bold text-neutral-900">1. 내 프로필 요약</span>
                      <button 
                        type="button" 
                        onClick={() => setRegisterStep(1)} 
                        className="text-[11px] text-neutral-400 underline"
                      >
                        수정
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {photoPreviews.map((src, i) => src && (
                          <img key={i} src={src} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm" />
                        ))}
                      </div>
                      <div>
                        <div className="font-bold text-base text-neutral-900">
                          {formData.nickname}, {formData.age} ({formData.gender})
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formData.region} · {formData.course}
                        </div>
                        <div className="text-xs font-mono font-semibold text-neutral-800 mt-0.5">
                          페이스 {formData.pace} · 주 {formData.weekly_km}km · {formData.mbti}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center bg-neutral-50 p-2.5 rounded-xl text-xs">
                      <div><span className="text-neutral-400 block text-[10px]">종교</span><span className="font-semibold">{formData.religion}</span></div>
                      <div><span className="text-neutral-400 block text-[10px]">흡연</span><span className="font-semibold">{formData.smoking}</span></div>
                      <div><span className="text-neutral-400 block text-[10px]">문신</span><span className="font-semibold">{formData.tattoo}</span></div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formData.personality.map((p, i) => (
                        <span key={i} className="text-[11px] font-semibold bg-neutral-100 px-2.5 py-1 rounded-md">
                          #{p}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl">
                      {formData.bio}
                    </p>
                  </div>

                  {/* 희망 파트너 요약 카드 */}
                  <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-200/70 pb-2">
                      <span className="text-xs font-bold text-neutral-900">2. 희망하는 파트너 조건 요약</span>
                      <button 
                        type="button" 
                        onClick={() => setRegisterStep(2)} 
                        className="text-[11px] text-neutral-400 underline"
                      >
                        수정
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">희망 출생연도</span>
                        <span className="font-semibold text-neutral-900">{formData.ideal_birth_year || '무관'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">희망 MBTI</span>
                        <span className="font-semibold text-neutral-900">{formData.ideal_mbti || '무관'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">희망 직업</span>
                        <span className="font-semibold text-neutral-900">{formData.ideal_job || '무관'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">희망 지역</span>
                        <span className="font-semibold text-neutral-900">{formData.ideal_region || '무관'}</span>
                      </div>
                    </div>

                    {formData.ideal_personality.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.ideal_personality.map((p, i) => (
                          <span key={i} className="text-[11px] font-medium bg-white border border-neutral-200 px-2.5 py-0.5 rounded-md">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-neutral-700 leading-relaxed bg-white border border-neutral-200 p-3 rounded-xl">
                      "{formData.ideal_description}"
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* 모달 하단 고정 버튼 바 */}
            <div className="p-4 border-t border-neutral-100 bg-white flex gap-2 shrink-0">
              {registerStep > 1 && (
                <button
                  type="button"
                  onClick={() => setRegisterStep(registerStep - 1)}
                  className="px-5 py-3.5 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50"
                >
                  이전
                </button>
              )}
              {registerStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  다음 단계로 ({registerStep}/3)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {isSubmitting ? '프로필 등록 중...' : '최종 프로필 등록 완료'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}