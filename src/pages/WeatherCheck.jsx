import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function WeatherCheck() {
  const location = useLocation();

  console.log("🚀 마라톤에서 넘어온 원본 데이터:", location.state);
  console.log("변환 시도할 날짜:", location.state?.targetDate);
  
  const formatToYMD = (dateString) => {
    if (!dateString) return null;
    const cleanString = String(dateString).replace(/[년월일./]/g, '-').replace(/-+/g, '-').replace(/-$/, '');
    const d = new Date(cleanString);
    if (isNaN(d.getTime())) return null; 
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const passedDate = formatToYMD(location.state?.targetDate); 
  const passedRegion = location.state?.targetRegion;

  const todayDateObj = new Date();
  const today = `${todayDateObj.getFullYear()}-${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;
  
  const [selectedDate, setSelectedDate] = useState(passedDate || today);
  const [selectedTime, setSelectedTime] = useState('09:00'); 
  const [region, setRegion] = useState(passedRegion || '서울');
  const [loading, setLoading] = useState(false);
  
  const [currentWeather, setCurrentWeather] = useState(null); 
  const [weatherResult, setWeatherResult] = useState(null); 
  const [targetWeather, setTargetWeather] = useState(null); 
  const [motivatingQuote, setMotivatingQuote] = useState('');

  const KMA_API_KEY = '00ddb4e6fe19312256174047b6e780143dd460d910f5b75648c342fe95d5b1e5';

  const calculateDday = (targetDate) => {
    const t1 = new Date(today);
    const t2 = new Date(targetDate);
    return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
  };

  const dDay = calculateDday(selectedDate);

  // 🔥 팩트폭력 멘트로 완벽 교체!
  const getMotivation = (tmp, reh, pop) => {
    const temp = Number(tmp);
    const rain = Number(pop);
    const humid = Number(reh);

    if (rain >= 50) return "비 온다고 쉴 핑계 찾았지? 30만 원짜리 카본화 방구석에 전시할 거면 당장 당근에 올려라. 우중런 가자 🌧️💸";
    if (temp >= 30) return "더워서 못 뛴다고? 칼로리 소모 300kcal, 섭취 3000kcal. 훌륭한 벌크업이다 🐷🔥 땀으로 육수 뽑으러 당장 나가라!";
    if (temp <= 5) return "춥다고 이불 덮고 있을 거면 스마트워치는 왜 샀냐? 추위 핑계 대면 네 기록은 영원히 땅바닥이다 ❄️🥶";
    if (humid >= 80) return "습도 높다고 불평할 시간에 뛰었으면 벌써 5km다. 존2(Zone 2) 훈련하는 척하지 말고 그냥 뛰어라 💦🐢";
    if (temp > 10 && temp < 25 && rain < 20) return "날씨 완벽한데 안 뛴다고? 신발은 엘리트급인데 엔진이 경운기면 날씨 좋을 때라도 굴려야지 🚜💨";
    
    return "달린 시간보다 인스타 보정 시간이 더 길지? #오운완(오늘 운동복만 완벽했다) 찍으러 일단 나가자 📸👟";
  };

  const fetchCurrentLiveWeather = async () => {
    try {
      const now = new Date();
      if (now.getMinutes() < 40) now.setHours(now.getHours() - 1);
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      
      const baseDate = `${year}${month}${day}`;
      const baseTime = `${hours}00`;
      
      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${KMA_API_KEY}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=60&ny=127`;
      
      const response = await fetch(url);
      const data = await response.json();
      const items = data.response?.body?.items?.item || [];
      
      let tmp = '-', reh = '-';
      items.forEach(item => {
        if (item.category === 'T1H') tmp = item.obsrValue;
        if (item.category === 'REH') reh = item.obsrValue;
      });

      setCurrentWeather({ tmp, reh });
    } catch (error) {
      console.error("실시간 날씨 에러:", error);
    }
  };

  const fetchHourlyWeather = async (targetHourInt) => {
    let baseDate = today.replace(/-/g, '');
    let baseTime = '0200'; 
    
    const now = new Date();
    if (now.getHours() < 2) {
      const yesterday = new Date(now.setDate(now.getDate() - 1));
      baseDate = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;
      baseTime = '2300';
    }

    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${KMA_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=60&ny=127`;
    
    const response = await fetch(url);
    const data = await response.json();
    const items = data.response?.body?.items?.item || [];
    
    const targetDateStr = selectedDate.replace(/-/g, '');
    const timeMap = {};
    
    items.forEach(item => {
      if (item.fcstDate === targetDateStr) {
        if (!timeMap[item.fcstTime]) timeMap[item.fcstTime] = {};
        timeMap[item.fcstTime][item.category] = item.fcstValue;
      }
    });

    const currentHour = new Date().getHours();

    let hourlyList = Object.keys(timeMap).sort().map(time => {
      const weather = timeMap[time];
      let skyIcon = '☀️';
      if (weather.SKY === '3') skyIcon = '⛅';
      if (weather.SKY === '4') skyIcon = '☁️';
      if (weather.PTY && weather.PTY !== '0') skyIcon = '🌧️'; 
      const hourInt = parseInt(time.slice(0, 2));

      return {
        rawHour: hourInt,
        time: `${hourInt}시`,
        tmp: weather.TMP,
        pop: weather.POP,
        reh: weather.REH,
        sky: skyIcon
      };
    });

    if (dDay === 0) hourlyList = hourlyList.filter(hour => hour.rawHour >= currentHour);

    const targetData = hourlyList.find(h => h.rawHour === targetHourInt) || hourlyList[0];
    
    if (targetData) {
      setTargetWeather({ ...targetData, isMid: false });
      setMotivatingQuote(getMotivation(targetData.tmp, targetData.reh, targetData.pop));
    }

    setWeatherResult({ type: 'hourly', date: selectedDate, list: hourlyList });
  };

  const fetchMidTermWeather = async () => {
    const now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let hours = now.getHours();

    let tmFc = "";
    if (hours < 6) {
      const yesterday = new Date(now.setDate(now.getDate() - 1));
      tmFc = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}1800`;
    } else if (hours < 18) {
      tmFc = `${year}${month}${day}0600`;
    } else {
      tmFc = `${year}${month}${day}1800`;
    }

    const url = `https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst?serviceKey=${KMA_API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&regId=11B00000&tmFc=${tmFc}`;
    
    const response = await fetch(url);
    const text = await response.text(); 

    if (text.trim().startsWith('<')) {
      alert("🚨 기상청 '중기예보' API 권한이 없습니다!\n공공데이터포털에서 [기상청_중기예보 조회서비스]를 '활용신청' 해주세요. (API 키는 동일합니다)");
      return;
    }

    const data = JSON.parse(text);
    const item = data.response?.body?.items?.item[0];
    
    if (!item) throw new Error("데이터 응답 없음");

    let rnSt = '정보없음', wf = '정보없음';
    if (dDay >= 3 && dDay <= 7) {
      rnSt = item[`rnSt${dDay}Pm`]; 
      wf = item[`wf${dDay}Pm`];
    } else if (dDay >= 8 && dDay <= 10) {
      rnSt = item[`rnSt${dDay}`];
      wf = item[`wf${dDay}`];
    }

    const midPop = Number(rnSt) || 0;
    setTargetWeather({ isMid: true, pop: rnSt, wf: wf });
    // 🔥 중기 예보용 멘트도 팩트폭력으로 교체!
    setMotivatingQuote(midPop >= 50 ? "며칠 뒤 비 온다고? 일기예보 보면서 쉴 궁리부터 하네. 남들은 쿨다운할 때 뛰는 속도면서 벌써 쉬냐? 🌧️👀" : "며칠 뒤 날씨 핑계는 절대 못 댄다. GPS 튀었다고 우기지 말고 실력 키울 준비나 해라 ☀️🏃‍♂️");
    setWeatherResult({ type: 'mid', date: selectedDate, pop: rnSt, wf });
  };

  const checkWeather = async () => {
    if (dDay < 0) return alert("과거의 날씨는 조회할 수 없습니다!");
    
    if (dDay > 10) {
      alert("🚨 기상청 API는 최대 10일 후까지만 예보를 제공합니다!\n대회 10일 전에 다시 확인해주세요 😭");
      return; 
    }
    
    const currentHour = new Date().getHours();
    let targetHourInt = parseInt(selectedTime.split(':')[0]);

    if (dDay === 0 && targetHourInt < currentHour) {
      alert("이미 지나간 시간입니다! 현재 시간 기준으로 다시 조회합니다.");
      targetHourInt = currentHour;
      setSelectedTime(`${String(currentHour).padStart(2, '0')}:00`);
    }

    setLoading(true);
    setWeatherResult(null);
    setTargetWeather(null);

    try {
      if (dDay >= 0 && dDay <= 2) {
        await fetchHourlyWeather(targetHourInt); 
      } else {
        await fetchMidTermWeather(); 
      }
    } catch (error) {
      console.error(error);
      alert("날씨 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentLiveWeather();

    if (passedDate) {
      setTimeout(() => {
        checkWeather();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passedDate]);

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-10 overflow-x-hidden">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link to="/" className="text-xl font-black">⬅️ 홈</Link>
        <h1 className="text-lg font-bold text-blue-600">러닝 기상청 🌤️</h1>
        <div className="w-8"></div>
      </header>

      {currentWeather && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 m-5 p-5 rounded-2xl shadow-md text-white flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-blue-100 mb-1">지금 서울 러닝 컨디션</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{currentWeather.tmp}°C</span>
              <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded-md mb-1">습도 {currentWeather.reh}%</span>
            </div>
          </div>
          <div className="text-5xl drop-shadow-md">🏃‍♂️</div>
        </div>
      )}

      <div className="px-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-extrabold mb-4">언제 뛰실 계획인가요?</h2>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 mb-1">날짜</label>
              <input type="date" value={selectedDate} min={today} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 mb-1">시간</label>
              <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500" />
            </div>
          </div>
          <button onClick={checkWeather} className="w-full bg-gray-900 text-white font-bold p-4 rounded-xl shadow-md hover:bg-black transition-colors">
            {loading ? <span className="animate-pulse">분석 중... 📡</span> : '러닝 팩트폭력 멘트 듣기 🔥'}
          </button>
        </div>
      </div>

      {targetWeather && (
        <div className="mx-5 mt-5 p-6 bg-gray-800 text-white rounded-3xl shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-8xl opacity-5">🏃‍♂️</div>
          <p className="text-blue-300 font-bold text-sm mb-1">{selectedDate} {selectedTime}</p>
          <h3 className="text-2xl font-black mb-5">목표 러닝 컨디션</h3>

          {!targetWeather.isMid ? (
            <div className="flex w-full justify-around items-center mb-6 z-10 border-b border-gray-700 pb-5">
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-1">{targetWeather.sky}</span>
                <span className="text-[10px] text-gray-400 font-bold">상태</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black">{targetWeather.tmp}°</span>
                <span className="text-[10px] text-gray-400 font-bold">기온</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-teal-300">{targetWeather.reh}%</span>
                <span className="text-[10px] text-gray-400 font-bold">습도</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-blue-300">{targetWeather.pop}%</span>
                <span className="text-[10px] text-gray-400 font-bold">강수확률</span>
              </div>
            </div>
          ) : (
            <div className="mb-6 z-10">
              <p className="text-2xl font-bold mb-1 text-yellow-300">{targetWeather.wf}</p>
              <p className="text-gray-300 font-bold text-sm">오후 강수확률 {targetWeather.pop}%</p>
            </div>
          )}

          <div className="bg-white text-gray-900 w-full p-5 rounded-2xl shadow-inner z-10 relative">
            <span className="absolute -top-3 left-4 text-3xl">💡</span>
            <p className="font-black text-md leading-relaxed mt-1 break-keep">
              "{motivatingQuote}"
            </p>
          </div>
        </div>
      )}

      {weatherResult && weatherResult.type === 'hourly' && (
        <div className="mx-5 my-5 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <p className="font-extrabold text-gray-800 mb-4 text-sm">시간대별 흐름보기</p>
          <div className="flex overflow-x-auto snap-x hide-scrollbar pb-2">
            {weatherResult.list.map((hour, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[70px] snap-center border-r border-gray-100 last:border-0">
                <span className="text-xs font-bold text-gray-400 mb-2">{hour.time}</span>
                <span className="text-2xl mb-2">{hour.sky}</span>
                <span className="text-lg font-black text-gray-800 mb-4">{hour.tmp}°</span>
                <div className="w-full bg-blue-50/50 py-2 flex flex-col items-center gap-1 border-t border-blue-50">
                  <span className="text-[9px] text-gray-400">강수</span>
                  <span className="text-[11px] font-bold text-blue-500">{hour.pop}%</span>
                </div>
                <div className="w-full bg-teal-50/50 py-2 flex flex-col items-center gap-1 rounded-b-xl">
                  <span className="text-[9px] text-gray-400">습도</span>
                  <span className={`text-[11px] font-bold ${Number(hour.reh) >= 80 ? 'text-red-500' : 'text-teal-600'}`}>{hour.reh}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}