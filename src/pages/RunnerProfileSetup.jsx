import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


// 👇 supabaseClient 임포트 추가! (경로는 본인 프로젝트에 맞게 수정)
import { supabase } from '../supabaseClient';


export default function RunnerProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    name: '', phone: '', instagram: '',
    
    // Step 2: 내 스펙
    birthYear: '', mbti: '', job: '', region: '',
    personality: [], religion: '', smoking: '', tattoo: '',
    
    // Step 3: 💡 희망 파트너 스펙 (2단계와 완벽하게 1:1 매칭)
    targetAgeMin: '', targetAgeMax: '', targetMbti: '', targetJob: '', targetRegion: '',
    targetPersonality: [], targetReligion: '', targetSmoking: '', targetTattoo: '',
    targetIdeal: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    window.scrollTo(0, 0);
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

 const handleSubmit = async () => {
    // 필수값 간단 체크
    if (!form.name || !form.instagram) {
      alert("이름(닉네임)과 인스타그램 ID는 필수 입력 사항입니다!");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🚀 Supabase 'runner_profiles' 테이블에 데이터 Insert!
      const { error } = await supabase
        .from('runner_profiles')
        .insert([
          {
            name: form.name,
            phone: form.phone,
            instagram: form.instagram,
            birth_year: parseInt(form.birthYear) || null, // 숫자로 변환
            region: form.region,
            job: form.job,
            pace: form.pace,
            mbti: form.mbti,
            personality: form.personality, // 배열 그대로 저장됨
            religion: form.religion,
            smoking: form.smoking,
            tattoo: form.tattoo,
            target_age_min: parseInt(form.targetAgeMin) || null,
            target_age_max: parseInt(form.targetAgeMax) || null,
            target_smoking: form.targetSmoking,
            target_tattoo: form.targetTattoo,
            target_ideal: form.targetIdeal
          }
        ]);

      if (error) {
        console.error("DB Insert 에러:", error);
        throw error;
      }

      // 성공 시
      alert("진정성 있는 프로필 작성이 완료되었습니다.\n좋은 러닝 파트너를 찾아드릴게요! 👟");
      navigate('/match');

    } catch (error) {
      alert("프로필 등록 중 오류가 발생했습니다. 네트워크를 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectBtn = ({ label, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border ${
        selected 
          ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col relative pb-32">
      
      {/* 👑 헤더 & 프로그레스 바 */}
      <div className="sticky top-0 bg-white z-50 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="text-gray-500 font-bold text-sm hover:text-gray-900">
            {step > 1 ? '← 이전' : '✕ 취소'}
          </button>
          <span className="text-sm font-extrabold text-gray-800">프로필 설정</span>
          <span className="text-xs font-bold text-blue-600">{step} / {totalSteps}</span>
        </div>
        <div className="w-full h-1 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>

      {/* 📝 본문 영역 */}
      <div className="px-4 sm:px-5 pt-6 flex-1 w-full max-w-full overflow-hidden">
        
        {/* ================= STEP 1: 기본 정보 ================= */}
        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">기본 정보 입력</h2>
              <p className="text-xs text-gray-500 font-bold bg-blue-50 text-blue-600 p-3 rounded-lg break-keep">
                🔒 연락처와 인스타 ID는 상호 매칭 시에만 안전하게 공개됩니다.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">이름 (또는 닉네임)</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="닉네임을 입력해주세요" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">연락처</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="예: 010-1234-5678" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">인스타그램 ID</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">@</span>
                  <input type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="아이디 입력" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pl-8 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">프로필 사진 (최소 1장 필수)</label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="aspect-[3/4] bg-white border border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50">
                    <span className="text-xl text-gray-400">📷</span>
                    <span className="text-[10px] text-gray-400 font-bold">사진 등록</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: 상세 프로필 ================= */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">상세 프로필</h2>
              <p className="text-xs text-gray-500 font-bold">가치관이 맞는 파트너를 찾기 위한 정보입니다.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">출생연도</label>
                  <input type="number" name="birthYear" value={form.birthYear} onChange={handleChange} placeholder="예: 1995" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">MBTI</label>
                  <input type="text" name="mbti" value={form.mbti} onChange={handleChange} placeholder="예: ENFP" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">직업</label>
                  <input type="text" name="job" value={form.job} onChange={handleChange} placeholder="예: 개발자" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">주 활동 지역</label>
                  <input type="text" name="region" value={form.region} onChange={handleChange} placeholder="예: 한강공원" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">내 성격 (최대 3개)</label>
                <div className="flex flex-wrap gap-2">
                  {['활발한', '다정한', '유머러스한', '섬세한', '진지한', '책임감 있는', '즉흥적인'].map(trait => (
                    <SelectBtn 
                      key={trait} label={trait} 
                      selected={form.personality.includes(trait)}
                      onClick={() => {
                        if (form.personality.includes(trait)) {
                          setForm({...form, personality: form.personality.filter(p => p !== trait)});
                        } else if (form.personality.length < 3) {
                          setForm({...form, personality: [...form.personality, trait]});
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-5 shadow-sm">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">종교</label>
                  <div className="flex flex-wrap gap-2">
                    {['무교', '기독교', '천주교', '불교'].map(r => (
                      <SelectBtn key={r} label={r} selected={form.religion === r} onClick={() => setForm({...form, religion: r})} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">흡연 여부</label>
                  <div className="flex flex-wrap gap-2">
                    {['비흡연', '전자담배', '흡연'].map(s => (
                      <SelectBtn key={s} label={s} selected={form.smoking === s} onClick={() => setForm({...form, smoking: s})} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">문신 (타투)</label>
                  <div className="flex flex-wrap gap-2">
                    {['없음', '작은 타투', '있음'].map(t => (
                      <SelectBtn key={t} label={t} selected={form.tattoo === t} onClick={() => setForm({...form, tattoo: t})} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: 희망 파트너 조건 (내용 똑같이 동기화) ================= */}
        {step === 3 && (
          <div className="animate-fade-in flex flex-col gap-6 w-full">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">희망 파트너 조건</h2>
              <p className="text-xs text-gray-500 font-bold">어떤 분과 함께 뛰고 싶으신가요?</p>
            </div>

            <div className="space-y-6 w-full">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">희망 출생연도</label>
                  <div className="flex items-center gap-2">
                    <input type="number" name="targetAgeMin" value={form.targetAgeMin} onChange={handleChange} placeholder="최소" className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-3 text-center text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                    <span className="text-gray-400 font-bold shrink-0">~</span>
                    <input type="number" name="targetAgeMax" value={form.targetAgeMax} onChange={handleChange} placeholder="최대" className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-3 text-center text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">희망 MBTI</label>
                  <input type="text" name="targetMbti" value={form.targetMbti} onChange={handleChange} placeholder="예: 상관없음" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">희망 직업</label>
                  <input type="text" name="targetJob" value={form.targetJob} onChange={handleChange} placeholder="예: 개발자, 상관없음" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">희망 활동 지역</label>
                  <input type="text" name="targetRegion" value={form.targetRegion} onChange={handleChange} placeholder="예: 한강공원, 상관없음" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">희망 성격 (최대 3개)</label>
                <div className="flex flex-wrap gap-2">
                  {['활발한', '다정한', '유머러스한', '섬세한', '진지한', '책임감 있는', '즉흥적인', '상관없음'].map(trait => (
                    <SelectBtn 
                      key={trait} label={trait} 
                      selected={form.targetPersonality.includes(trait)}
                      onClick={() => {
                        if (trait === '상관없음') {
                          setForm({...form, targetPersonality: ['상관없음']});
                        } else {
                          const updated = form.targetPersonality.filter(p => p !== '상관없음');
                          if (updated.includes(trait)) {
                            setForm({...form, targetPersonality: updated.filter(p => p !== trait)});
                          } else if (updated.length < 3) {
                            setForm({...form, targetPersonality: [...updated, trait]});
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-5 shadow-sm w-full">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">희망 종교</label>
                  <div className="flex flex-wrap gap-2">
                    {['무교', '기독교', '천주교', '불교', '상관없음'].map(r => (
                      <SelectBtn key={r} label={r} selected={form.targetReligion === r} onClick={() => setForm({...form, targetReligion: r})} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">희망 흡연 여부</label>
                  <div className="flex flex-wrap gap-2">
                    {['비흡연만', '전담까지 OK', '상관없음'].map(s => (
                      <SelectBtn key={s} label={s} selected={form.targetSmoking === s} onClick={() => setForm({...form, targetSmoking: s})} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">희망 문신 (타투)</label>
                  <div className="flex flex-wrap gap-2">
                    {['없음만', '작은 타투까지 OK', '상관없음'].map(t => (
                      <SelectBtn key={t} label={t} selected={form.targetTattoo === t} onClick={() => setForm({...form, targetTattoo: t})} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600 mb-2">이런 분이었으면 좋겠어요!</label>
                <textarea 
                  name="targetIdeal" value={form.targetIdeal} onChange={handleChange} rows={4} placeholder="함께 러닝하고 싶은 이상형을 자유롭게 적어주세요."
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-900 focus:border-blue-500 outline-none resize-none shadow-sm"
                />
              </div>

            </div>
          </div>
        )}

        {/* ================= STEP 4: 제출 전 요약 ================= */}
        {step === 4 && (
          <div className="animate-fade-in pb-10 w-full">
            <h2 className="text-2xl font-black text-gray-900 mb-4">제출 전 확인해주세요</h2>
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900 text-sm">내 프로필 요약</h3>
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-3 text-xs sm:text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">닉네임/나이</span><span className="font-bold">{form.name || '-'} / {form.birthYear ? `${form.birthYear}년생` : '-'}</span></div>
                <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">직업/지역</span><span className="font-bold">{form.job || '-'} / {form.region || '-'}</span></div>
                <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">MBTI/성격</span><span className="font-bold">{form.mbti || '-'} / {form.personality.length > 0 ? form.personality.join(', ') : '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">종교/흡연</span><span className="font-bold">{form.religion || '-'} / {form.smoking || '-'}</span></div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="p-4 bg-gray-100 rounded-xl flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 shrink-0" />
                <span className="text-xs font-bold text-gray-600 break-keep">진정성 있는 만남을 위해 허위 사실을 기재하지 않았습니다.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        {step < totalSteps ? (
          <button onClick={handleNext} className="w-full py-4 rounded-xl font-black text-base bg-gray-900 text-white hover:bg-black transition-colors">
            다음으로
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="w-full py-4 rounded-xl font-black text-base bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            {isSubmitting ? '안전하게 제출 중...' : '프로필 등록 완료 🚀'}
          </button>
        )}
      </div>

    </div>
  );
}