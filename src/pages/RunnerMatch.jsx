import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const KAKAO_OPENCHAT_URL = 'https://open.kakao.com/o/sd2MQzYd';

const PERSONALITY_OPTIONS = ['활발한', '다정한', '유머러스한', '섬세한', '진지한', '책임감 있는', '즉흥적인', '차분한', '긍정적인', '계획적인'];
const RELIGION_OPTIONS = ['무교', '기독교', '천주교', '불교', '기타'];
const SMOKING_OPTIONS = ['비흡연', '전자담배', '흡연'];
const TATTOO_OPTIONS = ['없음', '작은 레터링/미니타투', '있음'];

export default function RunMatch() {
  const navigate = useNavigate();

  // 등록된 전체 러너의 '비공개 익명 스펙'만 불러오기 (사진/이름 제외)
  const [anonymousPool, setAnonymousPool] = useState([]);
  const [isSubmittedComplete, setIsSubmittedComplete] = useState(false);

  // 3단계 프로필 등록 위자드 상태
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [photoFiles, setPhotoFiles] = useState([null, null]);
  const [photoPreviews, setPhotoPreviews] = useState([null, null]);

  const [formData, setFormData] = useState({
    // Step 1: 내 프로필 & 연락처
    nickname: '',
    kakao_id: '', // 대표님이 직접 컨택할 카톡 ID 필수
    age: '',
    gender: '남성',
    region: '서울 광진구',
    course: '뚝섬한강 · 서울숲',
    pace: "5'30\"",
    weekly_km: 20,
    mbti: 'ENFJ',
    personality: [],
    religion: '무교',
    smoking: '비흡연',
    tattoo: '없음',
    bio: '',
    verified: false,
    // Step 2: 희망 파트너 조건
    ideal_birth_year: '',
    ideal_mbti: '',
    ideal_job: '',
    ideal_region: '',
    ideal_personality: [],
    ideal_description: ''
  });

  // DB에서 사진과 닉네임을 제외한 익명 스펙만 조회 (프라이버시 보호)
  const fetchAnonymousPool = async () => {
    const { data, error } = await supabase
      .from('runner_profiles')
      .select('id, gender, age, region, course, pace, mbti, personality, verified')
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error && data && data.length > 0) {
      setAnonymousPool(data);
    } else {
      setAnonymousPool([
        { id: '1', gender: '여성', age: 28, region: '서울 성동구', course: '서울숲·뚝섬', pace: "5'40\"", mbti: 'ENFP', personality: ['활발한', '다정한', '유머러스한'], verified: true },
        { id: '2', gender: '남성', age: 31, region: '서울 서초구', course: '반포한강', pace: "4'50\"", mbti: 'ISTJ', personality: ['진지한', '책임감 있는', '섬세한'], verified: true },
        { id: '3', gender: '여성', age: 26, region: '서울 송파구', course: '석촌호수', pace: "6'10\"", mbti: 'ISFP', personality: ['차분한', '긍정적인', '다정한'], verified: false }
      ]);
    }
  };

  useEffect(() => {
    fetchAnonymousPool();
  }, []);

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

  const handleNextStep = () => {
    if (registerStep === 1) {
      if (!photoPreviews[0] || !photoPreviews[1]) {
        alert('매칭 주선 시 상대방에게만 전달할 사진 2장을 등록해 주세요.');
        return;
      }
      if (!formData.nickname.trim() || !formData.kakao_id.trim() || !formData.age) {
        alert('닉네임, 카카오톡 ID, 나이를 모두 입력해 주세요.');
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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    let uploadedUrls = ['', ''];

    try {
      for (let i = 0; i < 2; i++) {
        if (photoFiles[i]) {
          const fileExt = photoFiles[i].name.split('.').pop();
          const fileName = `${Date.now()}_${i}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('runner-photos')
            .upload(fileName, photoFiles[i], { cacheControl: '3600', upsert: false });

          if (uploadError) {
            alert(`사진 ${i + 1} 업로드 실패: ${uploadError.message}`);
            setIsSubmitting(false);
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from('runner-photos')
            .getPublicUrl(fileName);
          uploadedUrls[i] = publicUrlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase
        .from('runner_profiles')
        .insert([{
          name: formData.nickname,
          nickname: formData.nickname,
          kakao_id: formData.kakao_id,
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
          bio: formData.bio,
          verified: formData.verified,
          image_url: uploadedUrls[0],
          image_url_2: uploadedUrls[1],
          ideal_birth_year: formData.ideal_birth_year,
          ideal_mbti: formData.ideal_mbti.toUpperCase(),
          ideal_job: formData.ideal_job,
          ideal_region: formData.ideal_region,
          ideal_personality: formData.ideal_personality,
          ideal_description: formData.ideal_description,
          match_status: '심사/매칭대기'
        }]);

      if (insertError) throw insertError;

      setShowRegisterModal(false);
      setRegisterStep(1);
      setIsSubmittedComplete(true);
      fetchAnonymousPool();
    } catch (err) {
      console.error(err);
      alert('신청서 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen text-neutral-900 pb-24 border-x border-neutral-100">
      
      {/* 상단 미니멀 헤더 */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-neutral-500 hover:text-neutral-900 text-sm font-medium">
            ← 홈
          </button>
          <h1 className="text-base font-bold tracking-tight text-neutral-900">
            PACE MATE
          </h1>
        </div>
        <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
          100% 비공개 수동 매칭
        </span>
      </header>

      <main className="p-5 space-y-6">
        
        {/* 1. 메인 프라이빗 매칭 안내 히어로 */}
        <section className="bg-neutral-900 text-white rounded-3xl p-6 space-y-4">
          <div className="inline-block bg-white/10 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
            PRIVATE RUNNING MATCH
          </div>
          <h2 className="text-2xl font-bold tracking-tight leading-snug">
            내 사진이 불특정 다수에게<br />공개되지 않는 러닝 소개팅
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            프로필을 등록해 주시면 매니저가 이상형 조건과 러닝 페이스를 직접 검토한 뒤, <strong className="text-white">카카오톡으로 1:1 상대방 프로필 카드를 전달</strong>해 드립니다. 양쪽 모두 수락할 때만 연결됩니다.
          </p>

          <button
            onClick={() => {
              setRegisterStep(1);
              setShowRegisterModal(true);
            }}
            className="w-full py-3.5 bg-white text-neutral-900 hover:bg-neutral-100 text-sm font-bold rounded-xl transition-colors"
          >
            참가 신청서 작성하기 (무료)
          </button>
        </section>

        {/* 신청 완료 직후 노출되는 안내 카드 */}
        {isSubmittedComplete && (
          <section className="p-5 bg-neutral-50 border border-neutral-900 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900">참가 신청이 정상 접수되었습니다</span>
              <span className="text-[10px] font-mono bg-neutral-900 text-white px-2 py-0.5 rounded">접수완료</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              매니저가 프로필 확인 후 입력하신 카카오톡 ID로 연락드릴 예정입니다. 더 빠른 매칭을 원하시면 아래 오픈채팅으로 신청 닉네임을 남겨주세요.
            </p>
            <a
              href={KAKAO_OPENCHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-[#FEE500] text-neutral-900 text-center text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              매니저 카카오톡 채널로 바로 문의하기
            </a>
          </section>
        )}

        {/* 2. 진행 방식 3단계 가이드 */}
        <section className="border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            HOW IT WORKS
          </h3>
          <div className="space-y-3.5">
            <div className="flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">비공개 프로필 & 이상형 등록</h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">사진 2장과 러닝 페이스, 희망하는 파트너 조건을 작성합니다. (웹사이트에는 사진이 절대 공개되지 않습니다)</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">매니저 1:1 프로필 카드 발송</h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">조건과 코스가 잘 맞는 상대방을 선별해 카카오톡으로 개별 프로필 카드를 보내드립니다.</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">상호 수락 시 가벼운 5K 러닝</h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">두 분 모두 만남을 원하실 경우에만 연락처를 연결해 드립니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 현재 매칭 대기 중인 러너 (사진·이름 철저 비공개, 스펙만 노출) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">현재 매칭 대기 중인 러너</h3>
              <p className="text-[11px] text-neutral-400">프라이버시 보호를 위해 사진과 실명은 비공개 처리됩니다</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {anonymousPool.map((item, idx) => (
              <div key={item.id || idx} className="p-4 border border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      item.gender === '여성' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {item.gender} · {item.age}세
                    </span>
                    <span className="text-xs font-semibold text-neutral-800">{item.region}</span>
                  </div>
                  {item.verified && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      GPS 인증
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>주력 코스 · <strong className="text-neutral-900">{item.course}</strong></span>
                  <span className="font-mono font-bold text-neutral-900">{item.pace} / {item.mbti}</span>
                </div>

                {item.personality && item.personality.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {item.personality.map((p, i) => (
                      <span key={i} className="text-[11px] bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                        #{p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 하단 고정 CTA 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 backdrop-blur-sm border-t border-neutral-100">
        <button
          onClick={() => {
            setRegisterStep(1);
            setShowRegisterModal(true);
          }}
          className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          비공개 프로필 등록하고 매칭 신청하기
        </button>
      </div>

      {/* ================================================================= */}
      {/* 3단계 멀티 스텝 참가 신청 모달                                    */}
      {/* ================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden">
            
            <div className="px-6 pt-5 pb-4 border-b border-neutral-100 shrink-0">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    STEP {registerStep} OF 3
                  </span>
                  <h2 className="text-base font-bold text-neutral-900">
                    {registerStep === 1 && '내 프로필 및 연락처 (비공개)'}
                    {registerStep === 2 && '희망하는 파트너 조건'}
                    {registerStep === 3 && '신청서 최종 요약 확인'}
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

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* ---------------- STEP 1 ---------------- */}
              {registerStep === 1 && (
                <>
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 leading-relaxed">
                    등록하시는 사진과 카카오톡 ID는 웹사이트에 절대 공개되지 않으며, 매칭 주선 시 매니저와 매칭 대상자에게만 전달됩니다.
                  </div>

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

                  {/* 카카오톡 ID 입력 추가 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">닉네임 (또는 이름) *</label>
                      <input 
                        type="text" 
                        placeholder="예: 상민"
                        value={formData.nickname}
                        onChange={e => setFormData({...formData, nickname: e.target.value})}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">카카오톡 ID (연락용) *</label>
                      <input 
                        type="text" 
                        placeholder="매니저 연락받을 ID"
                        value={formData.kakao_id}
                        onChange={e => setFormData({...formData, kakao_id: e.target.value})}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">나이 *</label>
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

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">러닝 스펙 및 기록 인증</span>
                      {formData.verified && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          GPS 인증됨
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
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
                    </div>
                    <label className="block w-full text-center py-2 bg-white border border-neutral-300 rounded-lg text-[11px] font-semibold text-neutral-800 cursor-pointer hover:bg-neutral-100 transition-colors">
                      {isVerifying ? 'AI 기록 분석 중...' : '러닝 앱 기록 캡처로 페이스 인증하기'}
                      <input type="file" accept="image/*" onChange={handleRecordVerify} disabled={isVerifying} className="hidden" />
                    </label>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-neutral-900">내 성격 키워드 (정확히 3개)</label>
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

                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1.5">자기소개 *</label>
                    <textarea 
                      rows={3}
                      placeholder="평소 러닝 스타일, 직업이나 라이프스타일을 자유롭게 적어주세요."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="w-full border border-neutral-300 rounded-xl p-3 text-sm focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </>
              )}

              {/* ---------------- STEP 2 ---------------- */}
              {registerStep === 2 && (
                <>
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 leading-relaxed">
                    작성하신 조건을 바탕으로 매니저가 가장 잘 어울리는 파트너 프로필을 카카오톡으로 보내드립니다.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">희망 출생연도 *</label>
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
                      어떤 사람을 원하시나요? (자유 서술) *
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

              {/* ---------------- STEP 3 ---------------- */}
              {registerStep === 3 && (
                <div className="space-y-5">
                  <div className="border border-neutral-200 rounded-2xl p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-xs font-bold text-neutral-900">1. 내 프로필 요약 (비공개)</span>
                      <button type="button" onClick={() => setRegisterStep(1)} className="text-[11px] text-neutral-400 underline">
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
                        <div className="text-xs font-mono text-neutral-700">
                          카톡 ID: {formData.kakao_id}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {formData.region} · 페이스 {formData.pace} · {formData.mbti}
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

                  <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-200/70 pb-2">
                      <span className="text-xs font-bold text-neutral-900">2. 희망하는 파트너 조건 요약</span>
                      <button type="button" onClick={() => setRegisterStep(2)} className="text-[11px] text-neutral-400 underline">
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
                  {isSubmitting ? '신청서 제출 중...' : '참가 신청 완료하기'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}