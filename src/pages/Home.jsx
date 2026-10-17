import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

import MarathonSchedule from './MarathonSchedule'; 

export default function Home() {
  const navigate = useNavigate();
  const [topMarathons, setTopMarathons] = useState([]);

  const [calcDistance, setCalcDistance] = useState(10);
  const [calcMode, setCalcMode] = useState('timeToPace');
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(50);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [paceMinutes, setPaceMinutes] = useState(5);
  const [paceSeconds, setPaceSeconds] = useState(0);
  const [calcResult, setCalcResult] = useState('');

  useEffect(() => {
    const fetchTopMarathons = async () => {
      const { data, error } = await supabase
        .from('marathons')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(3);
      
      if (!error && data) setTopMarathons(data);
    };
    fetchTopMarathons();
  }, []);

  useEffect(() => {
    if (calcMode === 'timeToPace') {
      const totalMin = (Number(inputHours) * 60) + Number(inputMinutes) + (Number(inputSeconds) / 60);
      if (totalMin === 0) {
        setCalcResult('시간을 입력해주세요');
        return;
      }
      const paceDecimal = totalMin / calcDistance;
      const pMin = Math.floor(paceDecimal);
      const pSec = Math.round((paceDecimal - pMin) * 60);
      setCalcResult(`${pMin}분 ${pSec}초 /km`);
    } else {
      const paceDecimal = Number(paceMinutes) + (Number(paceSeconds) / 60);
      if (paceDecimal === 0) {
        setCalcResult('페이스를 입력해주세요');
        return;
      }
      const totalMin = paceDecimal * calcDistance;
      const h = Math.floor(totalMin / 60);
      const m = Math.floor(totalMin % 60);
      const s = Math.round((totalMin % 1) * 60);
      
      let timeStr = '';
      if (h > 0) timeStr += `${h}시간 `;
      timeStr += `${m}분 ${s}초`;
      setCalcResult(timeStr);
    }
  }, [calcDistance, calcMode, inputHours, inputMinutes, inputSeconds, paceMinutes, paceSeconds]);

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20 font-sans">
      
      {/* 🚀 메뉴바가 사라진 자리에 스마트 페이스 계산기가 바로 옵니다 */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-6 shadow-lg">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <span className="text-2xl">⏱️</span> 마라톤 페이스 계산기
            </h2>
            
            <div className="flex bg-black/20 p-1 rounded-xl">
              {[
                { label: '10K', val: 10 },
                { label: 'HALF', val: 21.0975 },
                { label: 'FULL', val: 42.195 }
              ].map(dist => (
                <button
                  key={dist.label}
                  onClick={() => setCalcDistance(dist.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    calcDistance === dist.val 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {dist.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setCalcMode('timeToPace')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border ${calcMode === 'timeToPace' ? 'bg-blue-500/30 border-blue-300 text-white' : 'border-white/20 text-white/50 hover:bg-white/5'}`}
                >
                  목표 시간 입력
                </button>
                <button 
                  onClick={() => setCalcMode('paceToTime')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border ${calcMode === 'paceToTime' ? 'bg-blue-500/30 border-blue-300 text-white' : 'border-white/20 text-white/50 hover:bg-white/5'}`}
                >
                  목표 페이스 입력
                </button>
              </div>

              {calcMode === 'timeToPace' ? (
                <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <input type="number" value={inputHours} onChange={(e) => setInputHours(e.target.value)} className="w-12 sm:w-16 bg-transparent text-white text-center text-xl font-black outline-none border-b border-white/30 focus:border-white" />
                  <span className="text-white/80 text-sm font-bold">시간</span>
                  <input type="number" value={inputMinutes} onChange={(e) => setInputMinutes(e.target.value)} className="w-12 sm:w-16 bg-transparent text-white text-center text-xl font-black outline-none border-b border-white/30 focus:border-white" />
                  <span className="text-white/80 text-sm font-bold">분</span>
                  <input type="number" value={inputSeconds} onChange={(e) => setInputSeconds(e.target.value)} className="w-12 sm:w-16 bg-transparent text-white text-center text-xl font-black outline-none border-b border-white/30 focus:border-white" />
                  <span className="text-white/80 text-sm font-bold">초</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <input type="number" value={paceMinutes} onChange={(e) => setPaceMinutes(e.target.value)} className="w-16 sm:w-20 bg-transparent text-white text-center text-xl font-black outline-none border-b border-white/30 focus:border-white" />
                  <span className="text-white/80 text-sm font-bold">분</span>
                  <input type="number" value={paceSeconds} onChange={(e) => setPaceSeconds(e.target.value)} className="w-16 sm:w-20 bg-transparent text-white text-center text-xl font-black outline-none border-b border-white/30 focus:border-white" />
                  <span className="text-white/80 text-sm font-bold">초 /km</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 flex flex-col justify-center items-center shadow-lg text-center h-full min-h-[100px]">
              <span className="text-xs font-bold text-gray-400 mb-1">
                {calcDistance === 10 ? '10K' : calcDistance === 21.0975 ? '하프 코스' : '풀 코스'} 
                {calcMode === 'timeToPace' ? ' 필요 페이스' : ' 예상 완주 시간'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
                {calcResult}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-4 mt-2">
        <Link to="/match" className="block w-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-center text-white">
            <h3 className="text-lg font-black mb-1">💖 내 러닝 짝꿍 찾기 (런-미팅)</h3>
            <p className="text-[11px] font-bold text-pink-100">같은 페이스, 같은 동네 러너와 매칭을 시작하세요!</p>
          </div>
        </Link>

        <Link to="/arisu" className="block w-full bg-white border border-blue-200 rounded-xl p-4 shadow-sm hover:border-blue-400 transition-colors">
          <div className="text-center">
            <h3 className="text-[15px] font-black text-blue-600 mb-1">💧 내 주변 러닝 오아시스 찾기 🏃‍♂️</h3>
            <p className="text-[10px] font-bold text-blue-400">GPS 기반 한강/하천 아리수 위치 확인</p>
          </div>
        </Link>
      </div>

      {/* 📅 마라톤 일정 & 크루 리스트 */}
      <div className="p-4 max-w-4xl mx-auto space-y-8">
        
        <section>
          <div className="flex justify-between items-center border-b border-gray-900 pb-2 mb-3">
            <h3 className="font-black text-gray-900 text-[15px]">접수예정 마라톤대회</h3>
            <span 
              onClick={() => navigate('/marathons')}
              className="text-gray-400 text-xl font-light cursor-pointer hover:text-gray-900"
            >
              +
            </span>
          </div>
          <ul className="space-y-0">
            {topMarathons.map(event => {
              const dateObj = new Date(event.event_date);
              const shortDate = `${dateObj.getMonth() + 1}.${dateObj.getDate()}`;
              
              return (
                <li 
                  key={event.id} 
                  onClick={() => navigate(`/marathon/${event.id}`)}
                  className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${event.status === '접수중' ? 'bg-orange-500' : 'bg-gray-400'}`}>
                      D-{event.d_day}
                    </span>
                    <span className="text-[13px] font-bold text-gray-800 truncate">
                      {event.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 shrink-0 ml-2">
                    🏃‍♂️ {shortDate}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 우리 동네 러닝 크루 */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-black text-gray-900 text-[15px]">우리 동네 러닝 크루 🏃‍♂️</h3>
              <p className="text-[10px] font-bold text-gray-400">혼자 뛰기 심심하다면 크루와 함께하세요!</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">+ 크루 개설</button>
              <button className="text-[10px] font-bold text-gray-500 hover:text-gray-900">전체보기</button>
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            <div className="min-w-[140px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <div className="relative h-24 bg-gray-200">
                <img src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=300&q=80" alt="crew" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-gray-900/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">서울 전지역</span>
              </div>
              <div className="p-3">
                <h4 className="font-black text-[13px] text-gray-900 mb-0.5">94 멍뭉런</h4>
                <p className="text-[10px] text-gray-500 font-bold mb-2">멤버 2명</p>
                <div className="flex gap-1">
                  <span className="bg-blue-50 text-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded">#94만 가입가능</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}