import React, { useState, useEffect } from 'react';
import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// 🌐 두 좌표 사이의 거리를 계산해주는 함수 (단위: km)
const getDistanceFromLatLonInKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
};

export default function App() {
  const [myLocation, setMyLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.544588, lng: 127.037442 });
  const [searchCenter, setSearchCenter] = useState({ lat: 37.544588, lng: 127.037442 });
  const [oasisData, setOasisData] = useState([]);
  const [showOasis, setShowOasis] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 💡 Vercel 백엔드에서 안전하게 받아올 카카오 앱 키 상태
  const [kakaoKey, setKakaoKey] = useState(null);

  // 1. 서버에서 안전하게 카카오 API 키 가져오기
  useEffect(() => {
    const fetchKakaoKey = async () => {
      try {
        const res = await fetch('/api/map-key');
        const data = await res.json();
        if (data.apiKey) {
          setKakaoKey(data.apiKey);
        }
      } catch (err) {
        console.error('카카오 키를 불러오는 중 오류 발생:', err);
      }
    };
    fetchKakaoKey();
  }, []);

  const fetchOasisSpots = async () => {
    const { data, error } = await supabase.from('oasis_spots').select('*');
    if (!error && data) setOasisData(data);
  };

  const getMyLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setMyLocation(currentPos);
          setMapCenter(currentPos);
          setSearchCenter(currentPos);
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert('GPS 권한을 허용해주세요!');
          setIsLocating(false);
        }
      );
    }
  };

  useEffect(() => {
    fetchOasisSpots();
    getMyLocation();
  }, []);

  const runningCourseKeywords = [
    '한강', '뚝섬', '반포', '여의도', '망원', '난지', '잠실', '잠원', '이촌', '양화', '광나루',
    '안양천', '청계천', '탄천', '중랑천', '홍제천', '불광천', '성내천', '도림천', '우이천', '양재천', '정릉천', '성북천', '응암천', '역곡천',
    '서울숲', '올림픽공원', '석촌호수', '남산공원', '북서울꿈의숲', '보라매공원', '월드컵공원', '경의선숲길', '서울로7017', '선유도'
  ];

  const filteredOasisData = oasisData.filter(spot => {
    const isRunningCourse = runningCourseKeywords.some(keyword => spot.name.includes(keyword));
    const distance = getDistanceFromLatLonInKm(searchCenter.lat, searchCenter.lng, spot.lat, spot.lng);
    return isRunningCourse && distance <= 3;
  });

  const handleDragEnd = (map) => {
    setMapCenter({
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    });
  };

  const distanceMoved = getDistanceFromLatLonInKm(searchCenter.lat, searchCenter.lng, mapCenter.lat, mapCenter.lng);
  const isMoved = distanceMoved > 0.5;

  const searchThisArea = () => {
    setSearchCenter(mapCenter);
    setShowOasis(true);
  };

  const openKakaoMap = (name, lat, lng) => {
    const kakaoMapUrl = `https://map.kakao.com/link/map/${name},${lat},${lng}`;
    window.open(kakaoMapUrl, '_blank');
  };

  // 💡 카카오 키가 아직 안 불려왔을 때의 로딩 처리 (지도가 하얗게 깨지는 것 방지)
  if (!kakaoKey) {
    return (
      <div className="w-full h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-blue-600 font-black animate-pulse text-lg">보안 지도 시스템 로딩 중... 💧</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden font-sans">
      <header className="absolute top-0 left-0 w-full z-10 bg-white/90 backdrop-blur-md shadow-sm p-4 flex justify-between items-center border-b border-blue-100">
        <Link to="/" className="text-2xl">⬅️</Link>
        <h1 className="text-xl font-black text-blue-600 italic tracking-tighter">RUNNING OASIS 💧</h1>
        <div className="w-8"></div>
      </header>

      <button 
        onClick={getMyLocation} 
        className="absolute top-20 right-4 z-10 bg-white p-3 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
      >
        <span className={isLocating ? 'animate-spin' : ''}>🎯</span>
      </button>

      {/* 💡 서버에서 안전하게 가져온 appkey를 동적으로 주입 */}
      <Map 
        appkey={kakaoKey}
        center={mapCenter} 
        style={{ width: '100%', height: '100vh' }} 
        level={5} 
        onDragEnd={handleDragEnd}
      >
        {myLocation && <MapMarker position={myLocation} />}
        
        {showOasis && filteredOasisData.map((spot) => (
          <CustomOverlayMap key={spot.id} position={{ lat: spot.lat, lng: spot.lng }} yAnchor={1}>
            <div 
              onClick={() => openKakaoMap(spot.name, spot.lat, spot.lng)}
              className="flex flex-col items-center animate-bounce cursor-pointer hover:scale-110 transition-transform duration-200"
            >
              <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-200 flex items-center gap-1">
                <span className="text-lg">💧</span>
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{spot.name}</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white mt-[-1px]"></div>
            </div>
          </CustomOverlayMap>
        ))}
      </Map>

      {isMoved && (
        <button
          onClick={searchThisArea}
          className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 bg-white text-blue-600 font-bold py-3 px-6 rounded-full shadow-lg border border-blue-100 hover:bg-blue-50 transition-all whitespace-nowrap"
        >
          🔄 현 지도에서 검색
        </button>
      )}

      <button 
        onClick={() => setShowOasis(!showOasis)} 
        className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 font-bold py-4 px-8 rounded-full shadow-xl transition-all duration-300 whitespace-nowrap text-lg flex items-center gap-2 ${showOasis ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {showOasis ? '👀 오아시스 숨기기' : '💧 주변 오아시스 찾기'}
      </button>
    </div>
  );
}