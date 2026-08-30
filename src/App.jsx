import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OasisMap from './pages/OasisMap';
import WeatherCheck from './pages/WeatherCheck';
import MarathonSchedule from './pages/MarathonSchedule'; // 👇 추가
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />     
        <Route path="/map" element={<OasisMap />} />
        <Route path="/weather" element={<WeatherCheck />} />
        <Route path="/marathons" element={<MarathonSchedule />} /> 
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
      </Routes>
    </BrowserRouter>
  );
}