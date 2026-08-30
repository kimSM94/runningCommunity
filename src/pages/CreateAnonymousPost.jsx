import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export default function CreateAnonymousPost() {
  const navigate = useNavigate();
  
  const [category, setCategory] = useState('자유');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['자유', 'Q&A', '러닝화추천', '코스공유'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("제목과 내용을 모두 입력해주세요!");

    setIsSubmitting(true);

    const { error } = await supabase.from('anonymous_posts').insert([
      { category, title, content }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert("글 작성 중 오류가 발생했습니다.");
    } else {
      alert("익명 게시글이 등록되었습니다! 🤫");
      navigate('/community'); 
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-xl font-black text-gray-500">✕</button>
        <h1 className="text-lg font-bold text-gray-900">익명 글쓰기 📝</h1>
        <div className="w-6"></div>
      </header>

      <div className="p-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">카테고리</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-gray-900 outline-none bg-white"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">제목</label>
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요" 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">내용</label>
              <textarea 
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="누구에게도 말 못 할 러너의 고민을 남겨보세요. (익명 보장)" 
                rows={8}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-medium focus:border-gray-900 outline-none resize-none"
              />
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className={`w-full text-white font-bold p-4 rounded-xl shadow-md mt-2 transition-colors ${
                isSubmitting ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'
              }`}
            >
              {isSubmitting ? '등록 중... ⏳' : '익명으로 글 올리기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}