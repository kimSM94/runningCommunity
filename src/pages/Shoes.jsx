import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Shoes() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const categories = ['전체', '🏁 대회용(카본)', '🏃 데일리(조깅)', '🛡️ 안정화'];

  // 📦 러닝화 계급도 가짜 데이터
  const shoeData = [
    { id: 1, name: '알파플라이 3', brand: '나이키', category: '🏁 대회용(카본)', tier: 'S', price: '329,000원', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80', desc: '현재 마라톤 생태계 파괴종' },
    { id: 2, name: '아디오스 프로 3', brand: '아디다스', category: '🏁 대회용(카본)', tier: 'S', price: '279,000원', image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=500&q=80', desc: '알파플라이의 유일한 대항마' },
    { id: 3, name: '메타스피드 파리', brand: '아식스', category: '🏁 대회용(카본)', tier: 'S', price: '299,000원', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80', desc: '아시아인 발볼의 구원자' },
    
    { id: 4, name: '노바블라스트 4', brand: '아식스', category: '🏃 데일리(조깅)', tier: 'A', price: '159,000원', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=80', desc: '육각형 꽉 찬 최고의 국밥 조깅화' },
    { id: 5, name: '인빈서블 3', brand: '나이키', category: '🏃 데일리(조깅)', tier: 'A', price: '219,000원', image: 'https://images.unsplash.com/photo-1605340013958-883628ee7078?auto=format&fit=crop&w=500&q=80', desc: '무릎 통증을 지워주는 줌X 폼' },
    { id: 6, name: '엔돌핀 스피드 4', brand: '써코니', category: '🏁 대회용(카본)', tier: 'A', price: '209,000원', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=500&q=80', desc: '나일론 플레이트의 경쾌함' },
    
    { id: 7, name: '페가수스 41', brand: '나이키', category: '🏃 데일리(조깅)', tier: 'B', price: '159,000원', image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=500&q=80', desc: '입문용 러닝화의 근본' },
    { id: 8, name: '젤 카야노 31', brand: '아식스', category: '🛡️ 안정화', tier: 'S', price: '189,000원', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=500&q=80', desc: '평발, 과내전 러너들의 구세주' },
    { id: 9, name: '가이드 17', brand: '써코니', category: '🛡️ 안정화', tier: 'A', price: '169,000원', image: 'https://images.unsplash.com/photo-1595461135849-bf08893fdc2c?auto=format&fit=crop&w=500&q=80', desc: '가벼운 무게의 훌륭한 안정감' },
  ];

  // 선택된 카테고리에 맞게 필터링
  const filteredShoes = activeCategory === '전체' 
    ? shoeData 
    : shoeData.filter(shoe => shoe.category === activeCategory);

  // 티어별로 그룹 나누기
  const tierS = filteredShoes.filter(shoe => shoe.tier === 'S');
  const tierA = filteredShoes.filter(shoe => shoe.tier === 'A');
  const tierB = filteredShoes.filter(shoe => shoe.tier === 'B');

  // 티어 영역 그려주는 컴포넌트 함수
  const renderTierSection = (title, badgeColor, shoes) => {
    if (shoes.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className={`${badgeColor} text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded-xl shadow-sm`}>
            {title}
          </div>
          <h2 className="text-lg font-extrabold text-gray-800">
            {title === 'S' ? '대장급 (1티어)' : title === 'A' ? '국밥급 (2티어)' : '가성비·입문 (3티어)'}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {shoes.map(shoe => (
            <div key={shoe.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <span className="absolute top-2 left-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                {shoe.brand}
              </span>
              <div className="h-24 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                {/* 실제 이미지는 신발 누끼 이미지를 쓰면 더 예쁩니다! 지금은 느낌만 */}
                <img src={shoe.image} alt={shoe.name} className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <h3 className="font-black text-sm text-gray-900 mb-1 line-clamp-1">{shoe.name}</h3>
              <p className="text-[10px] text-gray-500 font-bold mb-2 line-clamp-1">{shoe.desc}</p>
              <p className="text-xs font-extrabold text-blue-600">{shoe.price}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link to="/" className="text-xl font-black">⬅️ 홈</Link>
        <h1 className="text-lg font-bold text-gray-900">러닝화 계급도 👟</h1>
        <div className="w-8"></div>
      </header>

      <div className="p-5">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md mb-6">
          <h2 className="text-xl font-black mb-1">어떤 신발을 살까? 🤔</h2>
          <p className="text-xs text-blue-100 font-medium">러너들이 꼽은 2026년 최고의 러닝화 랭킹!</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2 sticky top-[70px] z-40 bg-gray-50 pt-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                activeCategory === cat 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 티어 리스트 렌더링 */}
        {renderTierSection('S', 'bg-red-500', tierS)}
        {renderTierSection('A', 'bg-blue-500', tierA)}
        {renderTierSection('B', 'bg-green-500', tierB)}
        
        {filteredShoes.length === 0 && (
          <p className="text-center text-gray-400 font-bold text-sm py-10">해당 카테고리의 러닝화가 없습니다.</p>
        )}
      </div>
    </div>
  );
}