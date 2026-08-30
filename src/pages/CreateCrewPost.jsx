import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export default function CreateCrewPost() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // RunningCrew.jsx에서 보내준 크루 ID와 이름을 받습니다.
  const crewId = location.state?.crewId;
  const crewName = location.state?.crewName;

  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author || !content) return alert("이름과 내용을 모두 입력해주세요!");
    if (!crewId) return alert("크루 정보가 없습니다. 다시 시도해주세요.");

    setIsSubmitting(true);

    const { error } = await supabase.from('crew_posts').insert([
      { 
        crew_id: crewId, 
        author: author, 
        content: content 
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert("글 작성 중 오류가 발생했습니다.");
    } else {
      alert("게시글이 등록되었습니다! 🎉");
      navigate(-1); // 💡 뒤로 가기 (원래 있던 크루 상세 페이지로 자동 복귀)
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-xl font-black">⬅️ 취소</button>
        <h1 className="text-lg font-bold text-gray-900">새 게시글 작성 ✍️</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-5">
        <p className="text-xs font-bold text-blue-600 mb-3">📍 {crewName} 피드에 글을 남깁니다.</p>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">작성자 닉네임</label>
              <input 
                type="text" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: 런린이_민지" 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">글 내용</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 러닝은 어떠셨나요? 크루원들과 나누고 싶은 이야기를 적어주세요!" 
                rows={6}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-medium focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full text-white font-bold p-4 rounded-xl shadow-md transition-colors mt-2 
                ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? '등록하는 중... ⏳' : '게시글 올리기 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}