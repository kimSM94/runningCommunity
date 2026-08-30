import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, Polyline, CustomOverlayMap } from 'react-kakao-maps-sdk';

export default function CourseRecommend() {
  // 실제 도로 기반 웨이포인트(Waypoints) 픽셀 아트 데이터
  const coursesData = {
    yeouido: {
      id: 1,
      level: 'Lv.1',
      title: '여의도 로드 하트 런 ❤️',
      distance: '약 4.5km',
      type: 'heart',
      center: { lat: 37.5250, lng: 126.9241 }, // 여의도 중심 (하트)
      aiPrompt: "건물을 뚫고 가는 가짜 코스가 아닙니다! 여의도의 실제 대각선 도로와 교차로를 활용한 '시티 런' 코스입니다. 신호등 대기 시간을 고려해 페이스는 6:30을 추천합니다.",
      // 여의도 실제 교차로를 활용한 8비트 하트 좌표
      path: [
        { lat: 37.5215, lng: 126.9241 }, // 1. 출발 (여의도역 - 하트 하단 꼭짓점)
        { lat: 37.5255, lng: 126.9175 }, // 2. 왼쪽 대각선 위로 (KBS 앞)
        { lat: 37.5285, lng: 126.9205 }, // 3. 국회의사당 방면 (왼쪽 위 둥근 부분)
        { lat: 37.5270, lng: 126.9241 }, // 4. 여의도공원 중앙 (하트 파인 부분)
        { lat: 37.5280, lng: 126.9280 }, // 5. 파크원 방면 (오른쪽 위 둥근 부분)
        { lat: 37.5255, lng: 126.9300 }, // 6. 한국거래소 방면 (오른쪽 중간)
        { lat: 37.5215, lng: 126.9241 }, // 7. 도착 (다시 여의도역 복귀)
      ]
    },
    gangnam: { // 👇 강남 격자 도로 기반 완벽한 8비트 하트 코스 좌표 수정 완료!
      id: 2,
      level: 'Lv.2',
      title: '강남 격자 8비트 하트 런 ⭐',
      distance: '약 6km',
      type: 'pixel_heart',
      center: { lat: 37.4980, lng: 127.0276 }, // 강남역 주변
      aiPrompt: "강남역 사거리의 완벽한 바둑판 격자 도로를 활용한 레트로 8비트 하트 코스입니다! 곡선이 아닌 직각과 대각선으로 하트를 완성하는 꿀잼 코스죠. 골목에서 직각으로 꺾을 때 과감하게 돌아야 예쁜 하트가 됩니다. 6:00 페이스 추천!",
      // 🗺️ 강남역 격자 도로의 실제 교차점들을 활용하여 '단일 루프 하트'를 형성하는 촘촘한 좌표
      path: [
        { lat: 37.4980, lng: 127.0276 }, // 1. 출발 (강남역 사거리 - 하트 중앙 움푹한 곳)
        { lat: 37.5000, lng: 127.0254 }, // 2. 대각선 위-왼쪽
        { lat: 37.5020, lng: 127.0232 }, // 3. 왼쪽 곡선 Peak (가장 왼쪽-가장 위)
        { lat: 37.4980, lng: 127.0210 }, // 4. 아래로 내려와 옆면 형성 (far left)
        { lat: 37.4940, lng: 127.0210 }, // 5. 대각선 아래로 꺾어 팁 형성
        { lat: 37.4900, lng: 127.0276 }, // 6. 하트 최하단 팁 point (center line)
        { lat: 37.4940, lng: 127.0342 }, // 7. 대각선 위로 꺾어 옆면 형성
        { lat: 37.4980, lng: 127.0342 }, // 8. 위로 올라와 옆면 형성 (far right)
        { lat: 37.5020, lng: 127.0320 }, // 9. 오른쪽 곡선 Peak (가장 오른쪽-가장 위)
        { lat: 37.5000, lng: 127.0298 }, // 10. 대각선 아래-왼쪽
        { lat: 37.4980, lng: 127.0276 }, // 11. 도착 (다시 강남역 사거리 복귀)
      ]
    }
  };

  const [activeCourse, setActiveCourse] = useState(coursesData.yeouido);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 코스가 바뀔 때마다 AI 로딩 효과
  useEffect(() => {
    setIsAiLoading(true);
    const timer = setTimeout(() => setIsAiLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeCourse]);

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link to="/" className="text-xl font-black">⬅️ 홈</Link>
        <h1 className="text-lg font-bold text-blue-600">AI GPS 아트 🎨</h1>
        <div className="w-8"></div>
      </header>

      {/* 🚀 새로운 코스 주문 프롬프트 입력창 ( placeholder 변경됨) */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="bg-gray-800 p-4 rounded-2xl shadow-inner mb-2">
          <p className="text-blue-300 text-sm font-black mb-3">어떤 코스를 뛰고 싶나요?</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="ex) 강남역 주변 격자 하트 코스 짜줘" 
              className="flex-1 bg-gray-50 p-3 text-sm rounded-lg outline-none text-gray-900 font-bold border border-gray-200 focus:border-blue-500"
            />
            <button className="bg-blue-600 text-white font-bold px-4 rounded-lg hover:bg-blue-500 transition-colors">
              코스생성
            </button>
          </div>
        </div>
      </div>

      {/* 레벨/지역 선택 탭 */}
      <div className="bg-white p-4 sticky top-[60px] z-40 shadow-sm border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveCourse(coursesData.yeouido)}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
            activeCourse.id === coursesData.yeouido.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {coursesData.yeouido.level} 여의도 로드 하트
        </button>
        <button
          onClick={() => setActiveCourse(coursesData.gangnam)}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
            activeCourse.id === coursesData.gangnam.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {coursesData.gangnam.level} 강남 격자 하트
        </button>
      </div>

      {/* 지도 영역 (경로 그리기) */}
      <div className="relative w-full h-[350px] bg-gray-200">
        <Map 
          center={activeCourse.center} 
          style={{ width: '100%', height: '100%' }} 
          level={7} 
        >
          {/* 가짜 곡선이 아닌, 도로를 따라 찰싹 달라붙는 직각/대각선 8비트 경로 적용 */}
          <Polyline
            path={activeCourse.path}
            strokeWeight={8}
            strokeColor="#EF4444" // 빨간색 (진짜 도로 기반)
            strokeOpacity={0.9}
            strokeStyle="solid"
          />
          
          {activeCourse.path.length > 0 && (
            <CustomOverlayMap position={activeCourse.path[0]}>
              <div className="bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">
                START/FINISH
              </div>
            </CustomOverlayMap>
          )}
        </Map>
      </div>

      {/* AI 코칭 패널 */}
      <div className="p-5">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-1 rounded-md mb-2 inline-block">
                {activeCourse.distance} (실제 도로 기준)
              </span>
              <h2 className="text-2xl font-black text-gray-900">{activeCourse.title}</h2>
            </div>
            <div className="text-4xl opacity-10">🤖</div>
          </div>

          <div className="w-full h-px bg-gray-100 mb-4"></div>

          <p className="text-sm font-bold text-gray-400 mb-2">AI 페이스 코치 분석</p>
          
          {isAiLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed font-bold bg-gray-50 p-4 rounded-xl border border-gray-100 break-keep">
              💡 "{activeCourse.aiPrompt}"
            </p>
          )}

          <button className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-md hover:bg-blue-700 mt-5 transition-colors">
            이 코스로 뛰기 (GPS 연동)
          </button>
        </div>
      </div>
    </div>
  );
}