import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export default function Community() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('전체');
  const categories = ['전체', '자유', 'Q&A', '러닝화추천', '코스공유'];

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 글 펼치기 및 댓글 상태
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState('');

  // DB에서 게시글 불러오기 (카테고리 변경될 때마다 실행)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let query = supabase.from('anonymous_posts').select('*').order('created_at', { ascending: false });
      
      if (activeCategory !== '전체') {
        query = query.eq('category', activeCategory);
      }
      
      const { data } = await query;
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, [activeCategory]);

  // 게시글 클릭 시 펼치기 + 조회수 증가 + 댓글 불러오기
  const togglePost = async (post) => {
    if (expandedPostId === post.id) {
      setExpandedPostId(null);
      return;
    }
    
    setExpandedPostId(post.id);

    // 조회수 + 1 증가 처리
    const viewed = localStorage.getItem(`viewed_post_${post.id}`);
    if (!viewed) {
      await supabase.from('anonymous_posts').update({ views: post.views + 1 }).eq('id', post.id);
      setPosts(posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p));
      localStorage.setItem(`viewed_post_${post.id}`, 'true');
    }

    // 해당 글의 댓글 불러오기
    const { data } = await supabase.from('anonymous_comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true });
    if (data) setComments({ ...comments, [post.id]: data });
  };

  // 익명 댓글 달기
  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;

    const { data, error } = await supabase.from('anonymous_comments').insert([
      { post_id: postId, content: commentInput }
    ]).select();

    if (!error && data) {
      setComments({ ...comments, [postId]: [...(comments[postId] || []), data[0]] });
      setCommentInput(''); 
      
      const post = posts.find(p => p.id === postId);
      await supabase.from('anonymous_posts').update({ comments: post.comments + 1 }).eq('id', postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-800 pb-24">
      <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link to="/" className="text-xl font-black">⬅️ 홈</Link>
        <h1 className="text-lg font-bold text-gray-900">익명 러너 라운지 💬</h1>
        <button className="text-xl">🔍</button>
      </header>

      {/* 카테고리 필터 */}
      <div className="p-4 border-b border-gray-200 flex gap-2 overflow-x-auto hide-scrollbar sticky top-[60px] bg-white z-40 shadow-sm">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activeCategory === cat ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 게시글 리스트 */}
      <div className="bg-white min-h-screen">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-10 animate-pulse">게시글을 불러오는 중...</p>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">💨</p>
            <p className="text-sm font-bold text-gray-500">아직 작성된 글이 없습니다.<br/>첫 글의 주인공이 되어보세요!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="border-b border-gray-100 transition-colors">
              
              <div 
                onClick={() => togglePost(post)}
                className={`p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 ${expandedPostId === post.id ? 'bg-gray-50' : ''}`}
              >
                <div className="flex gap-2 items-center mb-2">
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">{post.category}</span>
                  <h2 className="text-sm font-bold text-gray-900 truncate flex-1">{post.title}</h2>
                </div>
                
                {expandedPostId !== post.id && (
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">{post.content}</p>
                )}

                <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium mt-1">
                  <div className="flex gap-2 items-center">
                    <span>👤 {post.author}</span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">👁️ {post.views}</span>
                    <span className="flex items-center gap-1 text-blue-500">💬 {post.comments}</span>
                  </div>
                </div>
              </div>

              {expandedPostId === post.id && (
                <div className="bg-gray-50 px-4 pb-4 border-t border-gray-100">
                  <div className="py-4 text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                    {post.content}
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
                    <p className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">댓글 {post.comments}개</p>
                    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto hide-scrollbar">
                      {(comments[post.id] || []).length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">가장 먼저 댓글을 남겨보세요!</p>
                      ) : (
                        (comments[post.id] || []).map(c => (
                          <div key={c.id} className="flex flex-col text-sm items-start bg-gray-50 p-2 rounded-lg">
                            <span className="font-bold text-gray-900 text-[11px] mb-1">{c.author}</span>
                            <span className="text-gray-700 leading-tight text-xs">{c.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} 
                      placeholder="익명으로 댓글 달기..."
                      className="flex-1 border border-gray-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)} 
                      className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
                    >
                      등록
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => navigate('/community/new')}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gray-900 rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:bg-black active:scale-95 transition-all z-50"
      >
        📝
      </button>
    </div>
  );
}