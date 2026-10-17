import React, { useState } from 'react';

export default function RaceGuide() {
  const [activeTab, setActiveTab] = useState('tab1');
  
  // 당일 준비물 체크리스트 상태 관리
  const [checklist, setChecklist] = useState([
    { id: 1, text: '배번표 (러닝복에 미리 옷핀으로 고정)', checked: false },
    { id: 2, text: '기록 측정용 칩', checked: false },
    { id: 3, text: '길들여진 러닝화 (절대 새 신발 금지!)', checked: false },
    { id: 4, text: '유두 패치 / 반창고 (쓸림 방지 필수)', checked: false },
    { id: 5, text: '바세린 (발가락 사이, 사타구니, 겨드랑이 듬뿍)', checked: false },
    { id: 6, text: '에너지젤 (훈련 때 먹어본 제품으로 준비)', checked: false },
    { id: 7, text: '염분 알약 / 포도당 캔디 (쥐 방지용)', checked: false },
    { id: 8, text: '일회용 우비나 헌 옷 (출발 대기 시 보온, 직전 폐기)', checked: false },
    { id: 9, text: '완주 후 갈아입을 뽀송한 속옷과 여벌 옷', checked: false },
    { id: 10, text: '발이 편안한 슬리퍼', checked: false },
  ]);

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen pb-20">
      
      {/* 상단 헤더 영역 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-b-3xl shadow-md text-white mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2 mb-2">
          <span>📋</span> 대회 D-21 완벽 가이드
        </h2>
        <p className="text-blue-100 text-sm font-bold opacity-90">
          첫 마라톤부터 PB 달성까지, 성공적인 완주를 위한 필수 체크리스트와 실전 전략
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div className="px-4 mb-6">
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          <button 
            onClick={() => setActiveTab('tab1')}
            className={`flex-1 py-2.5 text-[13px] font-black rounded-lg transition-colors ${activeTab === 'tab1' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            D-3주 훈련/식단
          </button>
          <button 
            onClick={() => setActiveTab('tab2')}
            className={`flex-1 py-2.5 text-[13px] font-black rounded-lg transition-colors ${activeTab === 'tab2' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            당일 체크리스트
          </button>
          <button 
            onClick={() => setActiveTab('tab3')}
            className={`flex-1 py-2.5 text-[13px] font-black rounded-lg transition-colors ${activeTab === 'tab3' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            레이스 전략
          </button>
        </div>
      </div>

      {/* 탭 내용 영역 */}
      <div className="px-4">
        
        {/* 탭 1: 훈련 및 식단 */}
        {activeTab === 'tab1' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-3 border-b pb-2">📉 주차별 훈련량 조절 (테이퍼링)</h3>
              <ul className="space-y-4">
                <li>
                  <strong className="text-blue-600 block text-[15px] mb-1">D-3주 (훈련량 80%)</strong>
                  <p className="text-[13px] text-gray-600 font-bold leading-relaxed">마지막 장거리 주행(LSD)을 마치는 주간입니다. 풀코스 기준 최대 25km까지만 뛰고, 이후로는 무리한 장거리를 금지합니다.</p>
                </li>
                <li>
                  <strong className="text-indigo-600 block text-[15px] mb-1">D-2주 (훈련량 50~60%)</strong>
                  <p className="text-[13px] text-gray-600 font-bold leading-relaxed">주간 주행 거리를 평소의 절반으로 줄입니다. 단, 감각 유지를 위해 대회 목표 페이스(MP)로 5~8km 달리는 훈련을 주 1~2회 포함합니다.</p>
                </li>
                <li>
                  <strong className="text-green-600 block text-[15px] mb-1">D-1주 (훈련량 20~30%)</strong>
                  <p className="text-[13px] text-gray-600 font-bold leading-relaxed">완전한 휴식과 컨디션 조절 주간입니다. 대회 3~4일 전 가볍게 3km 조깅과 질주 3회로 다리 근육의 긴장만 깨워줍니다.</p>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-3 border-b pb-2">🍱 시기별 식단 전략 (카보로딩)</h3>
              <ul className="space-y-4">
                <li>
                  <strong className="text-gray-800 block text-[14px] mb-1">D-3주 ~ D-1주 (근육 회복기)</strong>
                  <p className="text-[13px] text-gray-600 font-bold leading-relaxed">손상된 근육 회복을 위해 단백질(닭가슴살, 생선, 두부) 위주의 식사를 합니다. 과음과 야식은 절대 금물입니다.</p>
                </li>
                <li>
                  <strong className="text-orange-600 block text-[14px] mb-1">D-3일 ~ D-1일 (카보로딩 집중기)</strong>
                  <p className="text-[13px] text-gray-600 font-bold leading-relaxed">간과 근육에 에너지를 꽉 채우는 시기입니다. 전체 식단에서 <span className="text-red-500 font-black">탄수화물 비중을 70% 이상</span>으로 늘립니다. (흰쌀밥, 찹쌀떡, 파스타, 바나나 추천)</p>
                  <p className="text-[12px] text-gray-400 font-bold mt-2">🚫 피해야 할 음식: 삼겹살 등 기름진 고기, 매운 음식, 우유, 식이섬유가 너무 많은 채소</p>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 탭 2: 당일 체크리스트 */}
        {activeTab === 'tab2' && (
          <div className="animate-fade-in">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
              <h3 className="text-lg font-black text-gray-900 mb-2">🎒 대회 전날 짐싸기 체크리스트</h3>
              <p className="text-xs text-gray-500 font-bold mb-4">터치하여 챙긴 물품을 체크하세요!</p>
              
              <div className="space-y-2">
                {checklist.map(item => (
                  <label 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${item.checked ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-0.5 w-5 h-5 accent-blue-500 cursor-pointer shrink-0" 
                    />
                    <span className={`text-[13.5px] font-bold leading-snug ${item.checked ? 'text-blue-600 line-through opacity-70' : 'text-gray-700'}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 p-5 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="text-[15px] font-black text-orange-800 mb-2">🍙 당일 아침 식사 팁</h3>
              <p className="text-[13px] text-orange-700 font-bold leading-relaxed mb-2">
                출발 3시간 전에는 식사를 마쳐야 달릴 때 위장에 부담이 없습니다. 기상 직후 미지근한 물과 함께 가볍게 섭취하세요.
              </p>
              <ul className="text-[12px] text-orange-600 font-bold list-disc pl-4 space-y-1">
                <li>추천: 흰죽, 바나나, 찹쌀떡, 구운 식빵과 잼</li>
                <li>출발 1시간 전부터는 수분 섭취를 멈추세요.</li>
                <li>출발 15분 전 에너지젤 1포 섭취!</li>
              </ul>
            </div>
          </div>
        )}

        {/* 탭 3: 레이스 전략 */}
        {activeTab === 'tab3' && (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-3 border-b pb-2">🔥 출발 20분 전 동적 스트레칭</h3>
              <p className="text-[13px] text-gray-600 font-bold mb-3">
                출발 전 근육을 길게 늘리는 '정적 스트레칭'은 오히려 근력을 떨어뜨립니다. 관절 가동 범위를 넓히는 움직임 위주로 예열하세요.
              </p>
              <ul className="text-[13px] text-gray-700 font-bold space-y-2 list-disc pl-4">
                <li><span className="text-blue-600 font-black">레그 스윙:</span> 벽을 잡고 한쪽 다리를 시계추처럼 앞뒤/좌우로 흔들기</li>
                <li><span className="text-blue-600 font-black">엉덩이 차기:</span> 제자리에서 뛰며 뒤꿈치가 엉덩이에 닿도록 접어 올리기</li>
                <li><span className="text-blue-600 font-black">가벼운 질주:</span> 50m 정도를 대회 페이스로 2~3번 가볍게 달려 숨통 틔우기</li>
              </ul>
            </div>

            <div className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100">
              <h3 className="text-[15px] font-black text-red-800 mb-2">❌ 가장 위험한 함정 : 초반 오버페이스</h3>
              <p className="text-[13px] text-red-700 font-bold leading-relaxed">
                출발선의 열기와 테이퍼링으로 가벼워진 몸 때문에 초반 5km를 평소보다 빠르게 달리는 경우가 많습니다. 
                초반에 1분 아끼려다 30km 지점에서 다리에 쥐가 나 10분을 까먹는 최악의 결과를 낳습니다.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl shadow-sm border border-blue-100">
              <h3 className="text-[15px] font-black text-blue-800 mb-3">⭕ 기록 단축의 정석 : 네거티브 스플릿</h3>
              <div className="space-y-3">
                <div>
                  <strong className="text-[13px] text-blue-600">1. 워밍업 구간 (초반 5km)</strong>
                  <p className="text-[12px] text-gray-600 font-bold mt-1">인파에 휩쓸리지 마세요. 목표 페이스보다 1km당 10~15초 느리게 시작하며 몸을 데웁니다.</p>
                </div>
                <div>
                  <strong className="text-[13px] text-blue-600">2. 크루즈 구간 (중반 ~ 30km)</strong>
                  <p className="text-[12px] text-gray-600 font-bold mt-1">목표 페이스를 기계처럼 유지합니다. (7~8km마다 에너지젤 섭취)</p>
                </div>
                <div>
                  <strong className="text-[13px] text-blue-600">3. 스퍼트 구간 (30km ~ 피니시)</strong>
                  <p className="text-[12px] text-gray-600 font-bold mt-1">아껴둔 체력으로 페이스를 서서히 끌어올립니다. 지친 러너들을 추월하며 짜릿한 완주를 경험하세요!</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}