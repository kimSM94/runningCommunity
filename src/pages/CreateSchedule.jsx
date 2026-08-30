import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export default function CreateSchedule() {
  const location = useLocation();
  const navigate = useNavigate();
  const crewId = location.state?.crewId;
  const crewName = location.state?.crewName;

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('19:30');
  const [isSecret, setIsSecret] = useState(false); // 💡 익명 모드 상태 추가!
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !eventDate || !eventTime) return alert("빈칸을 모두 채워주세요!");
    if (!crewId) return alert("크루 정보가 없습니다.");

    setIsSubmitting(true);

    const { error } = await supabase.from('crew_schedules').insert([
      { 
        crew_id: crewId, 
        title: title, 
        event_date: eventDate,
        event_time: eventTime,
        is_secret: isSecret // 💡 DB에 익명 모드 여부 전송!
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert("일정 생성 중 오류가 발생했습니다.");
    } else {
      alert(isSecret ? "블라인드 런 일정이 공지되었습니다! 🤫" : "일정이 등록되었습니다! 🏃‍♂️");
      navigate(-1); 
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-xl font-black">⬅️ 취소</button>
        <h1 className="text-lg font-bold text-gray-900">새 러닝 일정 등록 🗓️</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-5">
        <p className="text-xs font-bold text-blue-600 mb-3">📍 {crewName} 멤버들에게 런을 제안합니다.</p>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">일정 제목</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 금요일 야간 번개런" 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-2">날짜</label>
                <input 
                  type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-2">모이는 시간</label>
                <input 
                  type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* 💡 블라인드 런(익명 참석) 스위치 */}
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl mt-2 border border-blue-100">
              <div>
                <p className="text-sm font-bold text-blue-900">🤫 블라인드 런 (참석자 숨기기)</p>
                <p className="text-[10px] text-blue-600 mt-1">누가 참석하는지 서로 볼 수 없게 만듭니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className={`w-full text-white font-bold p-4 rounded-xl shadow-md mt-4 ${isSubmitting ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'}`}
            >
              {isSubmitting ? '등록 중... ⏳' : '일정 공지하기 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}