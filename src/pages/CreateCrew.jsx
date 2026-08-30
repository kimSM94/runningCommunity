import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // supabase 경로 확인!

export default function CreateCrew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location) return alert("크루 이름과 활동 지역을 입력해주세요!");
    
    setIsSubmitting(true);

    // 태그를 콤마(,)로 구분해서 배열로 만듭니다 (예: "#초보환영, #주말런")
    const tagsArray = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // 이미지 업로드 기능이 아직 없으므로, 러닝 느낌이 나는 랜덤 고화질 이미지를 기본 배정합니다!
    const defaultImages = [
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1571008882533-f89f0061e711?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1530143311094-34d807799e8f?auto=format&fit=crop&w=500&q=80'
    ];
    const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

    // Supabase DB에 인서트!
    const { error } = await supabase.from('crews').insert([
      { 
        name: name, 
        location: location, 
        tags: tagsArray, 
        image_url: randomImage 
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert("크루 생성 중 오류가 발생했습니다.");
    } else {
      alert("크루가 멋지게 개설되었습니다! 🎉");
      navigate('/'); // 홈 화면으로 돌아가기
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link to="/" className="text-xl font-black">⬅️ 취소</Link>
        <h1 className="text-lg font-bold text-gray-900">새 크루 개설 🏃‍♂️</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">크루 이름</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 뚝섬 스피드클럽" 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">주 활동 지역</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 성동/광진" 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">크루 태그 (쉼표로 구분)</label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="예: #초보환영, #다이어트, #주말런" 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full text-white font-bold p-4 rounded-xl shadow-md transition-colors mt-4 
                ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? '개설하는 중... ⏳' : '크루 개설 완료! 🔥'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}