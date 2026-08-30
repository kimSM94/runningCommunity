import React, { useState, useEffect } from 'react';

// 🌐 기상청 격자 변환 공식
const dfs_xy_conv = (code, v1, v2) => {
  const RE = 6371.00877; const GRID = 5.0; const SLAT1 = 30.0; const SLAT2 = 60.0;
  const OLON = 126.0; const OLAT = 38.0; const XO = 43; const YO = 136;
  const DEGRAD = Math.PI / 180.0; const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD; const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD; const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  let rs = {};

  if (code === "toXY") {
    rs['lat'] = v1; rs['lng'] = v2;
    let ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    let theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  }
  return rs;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState({ temp: null, loading: true, error: false });
  
  // ⚠️ 기상청 API 키 입력
  const KMA_API_KEY = '00ddb4e6fe19312256174047b6e780143dd460d910f5b75648c342fe95d5b1e5';

  const fetchWeather = async (lat, lng) => {
    try {
      const grid = dfs_xy_conv("toXY", lat, lng);
      
      const now = new Date();
      if (now.getMinutes() < 40) now.setHours(now.getHours() - 1);
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      
      const baseDate = `${year}${month}${day}`;
      const baseTime = `${hours}00`;

      const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${KMA_API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${grid.x}&ny=${grid.y}`;
      
      const response = await fetch(url);
      const data = await response.json();

      const items = data.response?.body?.items?.item || [];
      const tempItem = items.find(item => item.category === 'T1H');
      
      if (tempItem) {
        setWeather({ temp: tempItem.obsrValue, loading: false, error: false });
      } else {
        setWeather({ temp: null, loading: false, error: true });
      }
    } catch (error) {
      console.error(error);
      setWeather({ temp: null, loading: false, error: true });
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        () => setWeather({ temp: null, loading: false, error: true })
      );
    }
  }, []);

  return (
    <div className="bg-white m-4 p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 mb-1">오늘의 러닝 컨디션</p>
        {weather.loading ? (
          <p className="text-lg font-black text-gray-800 animate-pulse">측정 중...</p>
        ) : weather.error ? (
          <p className="text-sm font-bold text-red-500">정보를 불러올 수 없습니다</p>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-gray-800">{weather.temp}°C</span>
            <span className="text-sm font-bold text-gray-500 mb-1">/ 서울특별시</span>
          </div>
        )}
      </div>
      <div className="text-4xl">🏃‍♂️</div>
    </div>
  );
}