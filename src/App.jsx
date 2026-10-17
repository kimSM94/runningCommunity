import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import OasisMap from './pages/OasisMap';
import WeatherCheck from './pages/WeatherCheck';
import MarathonSchedule from './pages/MarathonSchedule'; 
import Community from './pages/Community'; 
import ShoesTier from './pages/ShoesTier';
import CourseRecommend from './pages/CourseRecommend';
import RunningCrew from './pages/RunningCrew';
import CreateCrew from './pages/CreateCrew';
import CreateCrewPost from './pages/CreateCrewPost';
import CreateSchedule from './pages/CreateSchedule';
import CreateAnonymousPost from './pages/CreateAnonymousPost';
import Shoes from './pages/Shoes';
import Map from './pages/Map';
import RunnerMatch from './pages/RunnerMatch';
import RunnerProfileSetup from './pages/RunnerProfileSetup';
import ReceivedProposal from './pages/ReceivedProposal';
import MarathonDetail from './pages/MarathonDetail'; 
// 💡 새롭게 만든 훈련 플랜 페이지 불러오기
import TrainingPlan from './pages/TrainingPlan'; 

// 🚀 모든 페이지 상단에 고정될 메뉴바 컴포넌트
function GlobalHeaderAndNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="sticky top-0 z-50 w-full font-sans shadow-sm">
      {/* 👑 최상단 헤더 */}
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button className="text-xl">≡</button>
          <Link to="/" className="text-xl font-black italic tracking-wider">RUN</Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-lg">🔍</button>
          <button className="bg-blue-700/50 hover:bg-blue-700 text-xs font-bold px-3 py-1.5 rounded border border-blue-400 transition-colors">
            간편 로그인·가입
          </button>
        </div>
      </header>

      {/* 🧭 서브 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <ul className="flex items-center px-2 min-w-max">
          {/* 💡 훈련계획 메뉴 추가! */}
          <li className={`p-3 ${path === '/training' ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/training" className={`text-[13px] font-bold ${path === '/training' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>📅 훈련계획</Link>
          </li>
          <li className={`p-3 ${path === '/map' ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/map" className={`text-[13px] font-bold ${path === '/map' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>💧 아리수</Link>
          </li>
          <li className={`p-3 ${path === '/weather' ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/weather" className={`text-[13px] font-bold ${path === '/weather' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>⛅ 날씨확인</Link>
          </li>
          <li className={`p-3 ${path.includes('/marathon') ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/marathons" className={`text-[13px] font-bold ${path.includes('/marathon') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>⚡ 마라톤일정</Link>
          </li>
          <li className={`p-3 ${path.includes('/shoes') ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/shoes" className={`text-[13px] font-bold ${path.includes('/shoes') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>👟 러닝화계급도</Link>
          </li>
          <li className={`p-3 ${path.includes('/community') ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/community" className={`text-[13px] font-bold ${path.includes('/community') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>👽 커뮤니티</Link>
          </li>
          <li className={`p-3 ${path === '/course' ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/course" className={`text-[13px] font-bold ${path === '/course' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>🤖 AI아트코스</Link>
          </li>
          <li className={`p-3 ${path.includes('/crew') ? 'border-b-2 border-blue-500' : ''}`}>
            <Link to="/crew" className={`text-[13px] font-bold ${path.includes('/crew') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>러닝크루</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalHeaderAndNav />
      
      <Routes>
        <Route path="/" element={<Home />} />     
        <Route path="/map" element={<OasisMap />} />
        <Route path="/weather" element={<WeatherCheck />} />
        <Route path="/marathons" element={<MarathonSchedule />} /> 
        <Route path="/marathon/:id" element={<MarathonDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/shoes" element={<ShoesTier />} />
        <Route path="/course" element={<CourseRecommend />} />
        <Route path="/crew" element={<RunningCrew />} />
        <Route path="/crew/new" element={<CreateCrew />} />
        <Route path="/crew/post" element={<CreateCrewPost />} />
        <Route path="/crew/schedule/new" element={<CreateSchedule />} />
        <Route path="/community/new" element={<CreateAnonymousPost />} />
        <Route path="/shoes" element={<Shoes />} />
        <Route path="/map" element={<Map />} />
        <Route path="/match" element={<RunnerMatch />} />
        <Route path="/match/setup" element={<RunnerProfileSetup />} />
        <Route path="/match/received" element={<ReceivedProposal />} />
        <Route path="/training" element={<TrainingPlan />} />
      </Routes>
    </BrowserRouter>
  );
}