import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ShoesTier() {
  const [activeTab, setActiveTab] = useState('전체');

  // 러닝화 하드코딩 데이터 (티어, 카테고리, 브랜드, 이름, 설명)
  const shoesData = [
    { id: 1, brand: '나이키', name: '알파플라이 3', category: '카본/레이싱', tier: 'S', price: '329,000원', desc: '마라톤 세계기록을 깬 궁극의 레이싱화. 뛸 때마다 튕겨 나가는 반발력!', color: 'bg-red-50 text-red-600 border-red-200' },
    { id: 2, brand: '써코니', name: '엔돌핀 프로 4', category: '카본/레이싱', tier: 'S', price: '259,000원', desc: '레이싱화 1티어 중 가장 호불호 없는 착화감과 롤링감.', color: 'bg-red-50 text-red-600 border-red-200' },
    { id: 3, brand: '아식스', name: '노바블라스트 4', category: '조깅/데일리', tier: 'A', price: '159,000원', desc: '통통 튀는 펀(Fun)런의 대명사. 데일리 트레이너의 정석.', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 4, brand: '호카', name: '클리프톤 9', category: '조깅/데일리', tier: 'A', price: '189,000원', desc: '구름 위를 걷는 듯한 풍부한 쿠셔닝. 발이 푹신한 걸 원한다면 무조건 이거!', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 5, brand: '브룩스', name: '아드레날린 GTS 23', category: '안정화', tier: 'A', price: '179,000원', desc: '발목이 안쪽으로 꺾이는 과회내를 막아주는 최고의 부상 방지 신발.', color: 'bg-teal-50 text-teal-600 border-teal-200' },
    { id: 6, brand: '뉴발란스', name: '1080 v13', category: '조깅/데일리', tier: 'A+', price: '189,000원', desc: '워킹화로 신어도 될 정도로 부드럽고 편안한 폼이 특징.', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 7, brand: '나이키', name: '페가수스 41', category: '입문/가성비', tier: 'B', price: '159,000원', desc: '41년의 역사가 증명하는 국밥 같은 신발. 러닝 입문자에게 추천.', color: 'bg-gray-50 text-gray-600 border-gray-200' }
  ];

  // 탭 목록
  const tabs = ['전체', '카본/레이싱', '조깅/데일리', '안정화', '입문/가성비'];

  // 현재 선택된 탭에 맞춰 데이터 필터링
  const filteredShoes = activeTab === '전체' 
    ? shoesData 
    : shoesData.filter(shoe => shoe.category === activeTab);

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      {/* 헤더 */}
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link to="/" className="text-xl font-black">⬅️ 홈</Link>
        <h1 className="text-lg font-bold text-blue-600">러닝화 계급도 👟</h1>
        <div className="w-8"></div>
      </header>

      {/* 탭 메뉴 */}
      <div className="bg-white px-4 py-3 sticky top-[60px] z-40 border-b border-gray-200 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 whitespace-nowrap">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === tab ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 신발 리스트 렌더링 */}
      <div className="p-4 flex flex-col gap-4">
        <p className="text-xs text-gray-500 font-bold mb-1">
          총 {filteredShoes.length}개의 추천 러닝화가 있습니다.
        </p>

        {filteredShoes.map((shoe) => (
          <div key={shoe.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            {/* 티어 뱃지 */}
            <div className={`absolute -right-6 -top-6 w-20 h-20 flex items-end justify-center pb-2 pl-2 transform rotate-45 text-lg font-black border ${shoe.color}`}>
              {shoe.tier}
            </div>

            <div className="flex items-start gap-4">
              {/* 신발 이미지 (이모지로 대체) */}
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                👟
              </div>
              
              <div className="flex-1">
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-sm">
                  {shoe.brand}
                </span>
                <h3 className="text-lg font-black text-gray-800 mt-1">{shoe.name}</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  {shoe.category}
                </span>
                <p className="text-sm font-bold text-gray-500 mt-2">{shoe.price}</p>
              </div>
            </div>
            
            {/* 설명 박스 */}
            <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-600 leading-relaxed break-keep">
                💡 {shoe.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}