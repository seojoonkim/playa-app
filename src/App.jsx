import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Layout, Calendar, User, BookOpen, MessageCircle, QrCode, 
  X, Heart, Plus, Search, ChevronRight, MapPin, Clock, LogOut, 
  Users, Briefcase, MoreHorizontal, ChevronLeft, 
  Edit3, Camera, Check, Send, Shield, Star, CalendarDays, 
  Image as ImageIcon, PlusSquare, Bookmark, Share2, AlignLeft,
  Phone, Mail, Edit2
} from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_USER = {
  id: 'user_001',
  name: 'kim_playa',
  company: 'Playa Corp',
  title: 'CEO',
  email: 'ceo@playa.club',
  phone: '010-1234-5678',
  bio: 'Balance & Connection 🌿',
  joinDate: '2023.05.15',
  upline: null, 
  downlines: ['user_002', 'user_003', 'user_007', 'user_008', 'user_009'],
  role: 'member', 
  profileImage: null,
};

const OTHER_USERS = {
  'tennis_lover': { name: 'tennis_lover', company: 'Ace Sports', title: 'Pro', id: 'user_005', joinDate: '2023.08.01', bio: 'Tennis is Life 🎾', email: 'tennis@ace.com', phone: '010-1111-2222', upline: 'kim_playa', downlines: [] },
  'golf_pro': { name: 'golf_pro', company: 'Hole In One', title: 'Director', id: 'user_006', joinDate: '2023.09.10', bio: 'Single Player', email: 'golf@hio.com', phone: '010-3333-4444', upline: 'kim_playa', downlines: [] },
  'playa_official': { name: 'playa_official', company: 'Playa', title: 'Manager', id: 'admin', joinDate: '2023.01.01', bio: 'Concierge', email: 'help@playa.club', phone: '02-1234-5678', upline: null, downlines: [] }
};

const FACILITIES = [
  { id: 'tennis_1', name: 'Tennis Court', type: 'Sports' },
  { id: 'badminton_1', name: 'Badminton Court', type: 'Sports' },
  { id: 'golf_1', name: 'Screen Golf', type: 'Sports' },
  { id: 'lounge_living_1f', name: '1F: Living Room', type: 'Lounge' },
  { id: 'lounge_tea_1f', name: '1F: Tea Room', type: 'Lounge' },
  { id: 'lounge_dining_2f', name: '2F: Dining Room', type: 'Lounge' },
  { id: 'lounge_seminar_3f', name: '3F: Seminar Room', type: 'Lounge' },
  { id: 'lounge_room_a_3f', name: '3F: A-Room', type: 'Lounge' },
  { id: 'lounge_room_b_3f', name: '3F: B-Room', type: 'Lounge' },
];

const FEED_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'notice', label: 'Notice', adminOnly: true },
  { id: 'free', label: 'Free talk' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'golf', label: 'Golf' },
];

const GUIDE_TABS = [
  { id: 'intro', label: 'Philosophy' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'reservation', label: 'Rules' },
  { id: 'location', label: 'Location' },
];

const INITIAL_POSTS = [
  {
    id: 1,
    category: 'notice',
    author: 'playa_official',
    images: ['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800'],
    content: '🚨 [Bornyon] 이번 주말 우드파이어 다이닝 특별 코스 예약이 오픈되었습니다.',
    likedBy: ['kim_playa', 'tennis_lover'], 
    timestamp: '2h',
    comments: [
      { id: 101, author: 'kim_playa', text: '예약 완료했습니다! 😍', likedBy: ['playa_official'], timestamp: '1h' },
    ]
  },
  {
    id: 2,
    category: 'free',
    author: 'kim_playa',
    images: [], 
    content: '오늘 라운지 분위기 너무 좋네요. 조용히 책 읽으러 오실 분들 추천합니다. 커피 맛도 훌륭해요 ☕️',
    likedBy: ['golf_pro', 'playa_official'],
    timestamp: '3h',
    comments: []
  },
  {
    id: 3,
    category: 'tennis',
    author: 'tennis_lover',
    images: [
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800'
    ],
    content: '토요일 오전 10시 하드코트 랠리하실 분? (NTRP 3.0+) 🎾 #tennis',
    likedBy: ['golf_pro'],
    timestamp: '5h',
    comments: []
  },
];

const INITIAL_CHATS = [
  { id: 1, sender: 'admin', text: '안녕하십니까, 김플라님. Playa 컨시어지입니다.\n무엇을 도와드릴까요?', timestamp: '10:00 AM' },
];

const ADMIN_USER = { id: 'admin', name: 'playa_official', role: 'admin', profileImage: null };

// --- HELPERS ---
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const calculateDaysSince = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('.');
  const joinDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();
  const diffTime = Math.abs(today - joinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return `D+${diffDays}`;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

// --- COMPONENTS ---

const ImageDots = ({ current, total }) => {
  if (total <= 1) return null;
  return (
    <div className="flex gap-1.5 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white scale-110' : 'bg-white/40'}`} />
      ))}
    </div>
  );
};

const ImageViewer = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const originalContent = viewport.getAttribute('content');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
      return () => viewport.setAttribute('content', originalContent);
    }
  }, []);

  const handleNext = () => { if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1); };
  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); }
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => { 
    if (!touchStart || !touchEnd) return; 
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext(); 
    if (distance < -50) handlePrev(); 
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fadeIn" onClick={onClose}>
      <button className="absolute top-safe right-4 text-white p-2 bg-black/20 rounded-full backdrop-blur-sm z-20 mt-4" onClick={onClose}><X size={24} /></button>
      <div className="relative w-full h-full flex items-center justify-center" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <img src={images[currentIndex]} className="max-w-full max-h-full object-contain transition-opacity duration-300" onClick={(e) => e.stopPropagation()} alt={`View ${currentIndex + 1}`} />
      </div>
      {images.length > 1 && (
        <>
          {currentIndex > 0 && <button className="absolute left-4 text-white p-2 bg-black/20 rounded-full backdrop-blur-sm z-10 hover:bg-black/40" onClick={(e) => { e.stopPropagation(); handlePrev(); }}><ChevronLeft size={32} /></button>}
          {currentIndex < images.length - 1 && <button className="absolute right-4 text-white p-2 bg-black/20 rounded-full backdrop-blur-sm z-10 hover:bg-black/40" onClick={(e) => { e.stopPropagation(); handleNext(); }}><ChevronRight size={32} /></button>}
          <div className="absolute bottom-safe left-1/2 -translate-x-1/2 mb-8"><ImageDots current={currentIndex} total={images.length} /></div>
        </>
      )}
    </div>
  )
};

const CommentDrawer = ({ isOpen, onClose, post, currentUser, onAddComment }) => {
  const [text, setText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
      setTimeout(() => { if(scrollRef.current) scrollRef.current.scrollTop = 0; }, 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, post]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddComment(post.id, text);
    setText('');
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
  };

  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); }
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => { if (!touchStart || !touchEnd) return; if (touchStart - touchEnd < -50) onClose(); }

  if (!isOpen && !isVisible) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center justify-center h-14 border-b border-gray-100 relative bg-white flex-shrink-0 pt-[env(safe-area-inset-top)]">
          <span className="font-bold text-slate-900">Comments</span>
          <button onClick={onClose} className="absolute right-4 text-slate-900 p-2"><X size={24} strokeWidth={1.5} /></button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white pb-24">
          {post && (
            <>
              <div className="border-b border-gray-100 pb-2 mb-2">
                <div className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px] rounded-full"><div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden">{post.author[0]}</div></div>
                    <span className="text-sm font-bold text-[#262626]">{post.author}</span>
                  </div>
                  <MoreHorizontal size={20} className="text-[#262626]" />
                </div>
                {post.images && post.images.length > 0 ? (
                  <div className="w-full bg-gray-100 aspect-square overflow-hidden relative">
                    <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                      {post.images.map((img, idx) => (<img key={idx} src={img} alt="" className="w-full h-full object-cover flex-shrink-0 snap-center" />))}
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2"><ImageDots current={0} total={post.images.length} /></div>
                  </div>
                ) : (<div className="w-full px-4 py-6 bg-white"><p className="text-slate-800 text-lg leading-relaxed font-serif whitespace-pre-wrap">{post.content}</p></div>)}
                <div className="flex justify-between items-center px-3 py-3"><div className="flex gap-4"><Heart size={24} className={post.likedBy.includes(currentUser.name) ? "fill-red-500 text-red-500" : "text-[#262626]"} /><MessageCircle size={24} className="text-[#262626] -rotate-90" /><Send size={24} className="text-[#262626] -rotate-12" /></div><Bookmark size={24} className="text-[#262626]" /></div>
                <div className="px-3 pb-2"><div className="font-bold text-sm text-[#262626] mb-1">{post.likedBy.length > 0 ? `${post.likedBy.length} likes` : 'Be the first to like'}</div>{post.images && post.images.length > 0 && <div className="text-sm text-[#262626] mb-1 leading-relaxed"><span className="font-bold mr-2">{post.author}</span>{post.content}</div>}<div className="text-gray-500 text-xs uppercase mt-1">{post.timestamp}</div></div>
              </div>
              <div className="px-4 pt-2 space-y-5">
                {post.comments.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">No comments yet.</div> : post.comments.map((c) => (<div key={c.id} className="flex gap-3"><div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 border border-gray-100">{c.author[0]}</div><div className="flex-1"><div className="flex gap-2 items-baseline"><span className="text-sm font-bold text-slate-900">{c.author}</span><span className="text-xs text-gray-400">{c.timestamp}</span></div><p className="text-sm text-slate-700 mt-0.5 leading-relaxed whitespace-pre-wrap">{c.text}</p></div><button className="self-start pt-1 text-gray-400 hover:text-red-500"><Heart size={12} /></button></div>))}
              </div>
            </>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center gap-3 px-2 mb-2"><div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">{currentUser.name[0]}</div><div className="flex-1 relative"><input type="text" placeholder={`Add a comment as ${currentUser.name}...`} className="w-full bg-gray-50 border-none rounded-full py-3 px-4 text-base focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSubmit()} /><button onClick={handleSubmit} disabled={!text.trim()} className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold transition-colors ${text.trim() ? 'text-[#0095f6] cursor-pointer' : 'text-gray-300 cursor-default'}`}>Post</button></div></div>
        </div>
      </div>
    </>
  );
};

// User Profile Popup
const UserProfilePopup = ({ userName, currentUser, onClose, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const fileInputRef = useRef(null);
  let user = OTHER_USERS[userName];
  const isMe = userName === currentUser.name;
  if (isMe) { user = currentUser; } else if (!user) { user = { name: userName, company: 'Member', title: '-', id: 'unknown', joinDate: '2023.01.01', bio: 'Playa Member', email: '-', phone: '-', upline: null, downlines: [] }; }
  useEffect(() => { if (isMe) setEditData({ ...currentUser }); }, [isMe, currentUser]);
  const handleSave = () => { onUpdateProfile(editData); setIsEditing(false); };
  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) { const imageUrl = URL.createObjectURL(file); setEditData({ ...editData, profileImage: imageUrl }); } };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fadeIn" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scaleIn relative border border-white/20 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          {isMe && !isEditing ? <button onClick={() => setIsEditing(true)} className="text-[#0095f6] font-bold text-sm px-2 hover:bg-blue-50 rounded">Edit</button> : <div className="w-8"></div>}
          <h3 className="font-bold text-slate-900">{isEditing ? 'Edit Profile' : 'Profile'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          <div className="text-center relative">
            <div className="w-24 h-24 bg-slate-50 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-serif font-bold text-slate-400 border-4 border-slate-100 shadow-sm relative group">
              {isEditing ? (
                <div onClick={() => fileInputRef.current.click()} className="cursor-pointer w-full h-full rounded-full overflow-hidden relative">
                  {editData.profileImage ? <img src={editData.profileImage} className="w-full h-full object-cover opacity-80" /> : <span className="flex items-center justify-center w-full h-full">{editData.name?.[0]}</span>}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Camera className="text-white" size={24} /></div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
              ) : (user.profileImage ? <img src={user.profileImage} className="w-full h-full rounded-full object-cover" /> : user.name[0])}
            </div>
            {!isEditing && (<><h3 className="text-xl font-bold text-slate-900 font-serif tracking-wide">{user.name}</h3><p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-wider">{user.company} • {user.title}</p><p className="text-slate-600 text-sm mt-6 font-serif italic leading-relaxed">"{user.bio}"</p></>)}
          </div>
          {isEditing ? (
            <div className="mt-6 space-y-4 animate-fadeIn">
              <div><label className="text-[10px] uppercase font-bold text-slate-400">Bio</label><input type="text" value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} className="w-full border-b border-slate-300 py-2 text-base focus:outline-none focus:border-emerald-600" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] uppercase font-bold text-slate-400">Company</label><input type="text" value={editData.company} onChange={e => setEditData({...editData, company: e.target.value})} className="w-full border-b border-slate-300 py-2 text-base focus:outline-none focus:border-emerald-600" /></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-400">Title</label><input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full border-b border-slate-300 py-2 text-base focus:outline-none focus:border-emerald-600" /></div>
              </div>
              <div><label className="text-[10px] uppercase font-bold text-slate-400">Email</label><input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full border-b border-slate-300 py-2 text-base focus:outline-none focus:border-emerald-600" /></div>
              <div><label className="text-[10px] uppercase font-bold text-slate-400">Phone</label><input type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full border-b border-slate-300 py-2 text-base focus:outline-none focus:border-emerald-600" /></div>
              <div className="flex gap-3 pt-4"><button onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold uppercase hover:bg-slate-50">Cancel</button><button onClick={handleSave} className="flex-1 py-3 bg-[#0095f6] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#1877f2] shadow-lg">Save</button></div>
            </div>
          ) : (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Calendar size={14} /> Joined</span><div className="text-right flex items-center gap-2"><span className="text-xs text-slate-800 font-medium block">{user.joinDate}</span><span className="text-[10px] text-[#0095f6] font-bold bg-blue-50 px-2 py-0.5 rounded-full">{calculateDaysSince(user.joinDate)}</span></div></div>
              <div className="flex justify-between items-start"><span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mt-1"><Phone size={14} /> Contact</span><div className="text-right space-y-1"><span className="text-xs text-slate-800 block font-medium">{user.email}</span><span className="text-xs text-slate-500 block">{user.phone}</span></div></div>
              {user.role !== 'admin' && (<div className="pt-2"><div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Users size={14} /> Network</span><span className="text-xs text-slate-800 font-bold">Upline: {user.upline || 'Founder'}</span></div><div className="bg-slate-50 rounded-xl p-3"><div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Downlines ({user.downlines ? user.downlines.length : 0})</div>{user.downlines && user.downlines.length > 0 ? (<div className="flex flex-wrap gap-2">{user.downlines.map((downUser, idx) => (<div key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium shadow-sm">{downUser}</div>))}</div>) : (<div className="text-xs text-slate-400 italic">No downline members yet.</div>)}</div></div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Post Modal
const CreatePostModal = ({ user, onClose, onCreate }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free');
  const [images, setImages] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const handleImageUpload = () => { if (images.length >= 4) return alert('Max 4 images'); setImages([...images, 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=800']); };
  const handleSubmit = () => { if (!content && images.length === 0) return; onCreate({ content, category, images }); onClose(); };
  const handleBackdropClick = () => { if (content || images.length > 0) { setShowExitConfirm(true); } else { onClose(); } };
  const availableCategories = FEED_CATEGORIES.filter(c => c.id !== 'all').filter(c => { if (user.role === 'admin') return true; return !c.adminOnly; });

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fadeIn" onClick={handleBackdropClick}>
      <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden flex flex-col max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Discard Post?</h3>
            <div className="flex flex-col w-full gap-3 mt-4"><button onClick={onClose} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm">Discard</button><button onClick={() => setShowExitConfirm(false)} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm">Keep Editing</button></div>
          </div>
        )}
        <div className="h-12 border-b border-gray-200 flex items-center justify-center relative px-4 font-bold text-slate-900">
          <button onClick={handleBackdropClick} className="text-slate-900 absolute left-4 text-sm font-normal p-2">Cancel</button><span className="text-sm">New Post</span><button onClick={handleSubmit} className="text-[#0095f6] absolute right-4 text-sm font-medium p-2">Post</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-4 mb-6"><div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">{user.name[0]}</div><textarea className="flex-1 resize-none outline-none text-base placeholder-gray-400 h-32" placeholder="Write a caption..." value={content} onChange={e => setContent(e.target.value)} /></div>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">{images.map((img, i) => (<div key={i} className="relative w-32 h-32 flex-shrink-0"><img src={img} className="w-full h-full object-cover rounded-md" /><button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12} /></button></div>))}{images.length < 4 && <button onClick={handleImageUpload} className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0"><ImageIcon size={24} /><span className="text-xs mt-1">Add Photo</span></button>}</div>
          <div className="border-t border-gray-100 pt-4"><label className="block text-xs font-bold text-gray-500 mb-3 uppercase">Category</label><div className="flex flex-wrap gap-2">{availableCategories.map(cat => (<button key={cat.id} onClick={() => setCategory(cat.id)} className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${category === cat.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:border-gray-400'}`}>{cat.label}</button>))}</div></div>
        </div>
      </div>
    </div>
  );
};

// Login Section
const LoginSection = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const handleLogin = (e) => { e.preventDefault(); if (id && pw) { onLogin(id === 'admin'); } else { alert('아이디와 비밀번호를 입력해주세요.'); } };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-6 relative overflow-hidden font-sans">
      <div className="w-full max-w-xs z-10">
        <div className="text-center mb-10"><h1 className="text-4xl font-bold mb-4 tracking-tighter" style={{ fontFamily: "'Billabong', 'Grand Hotel', cursive" }}>Playa</h1></div>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="bg-gray-50 border border-gray-300 rounded-lg py-16 px-4 flex flex-col gap-4 shadow-sm">
             <input type="text" placeholder="Phone number, username, or email" className="w-full bg-white border border-gray-300 rounded-sm py-3 px-3 text-base focus:outline-none focus:border-gray-400" value={id} onChange={(e) => setId(e.target.value)} />
             <input type="password" placeholder="Password" className="w-full bg-white border border-gray-300 rounded-sm py-3 px-3 text-base focus:outline-none focus:border-gray-400" value={pw} onChange={(e) => setPw(e.target.value)} />
             <button type="submit" className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold py-3 rounded text-sm transition-colors mt-2">Log In</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Feed Section
const FeedSection = ({ user, onUserClick, onCreatePost, onOpenComments, onImageClick, scrollPosRef }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current && scrollPosRef) {
      containerRef.current.scrollTop = scrollPosRef.current;
    }
  }, [scrollPosRef]);

  const handleScroll = (e) => {
    if (scrollPosRef) scrollPosRef.current = e.target.scrollTop;
  };

  const toggleLike = (postId) => { setPosts(posts.map(p => p.id === postId ? { ...p, likedBy: p.likedBy.includes(user.name) ? p.likedBy.filter(u => u !== user.name) : [...p.likedBy, user.name] } : p)); };
  const filteredPosts = activeTab === 'all' ? posts : posts.filter(p => p.category === activeTab);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const handleSwipe = (postId, direction, length) => {
    const currentIndex = currentImageIndices[postId] || 0;
    if (direction === 'left' && currentIndex < length - 1) setCurrentImageIndices({ ...currentImageIndices, [postId]: currentIndex + 1 });
    else if (direction === 'right' && currentIndex > 0) setCurrentImageIndices({ ...currentImageIndices, [postId]: currentIndex - 1 });
  };

  return (
    <div ref={containerRef} onScroll={handleScroll} className="bg-white min-h-full relative pb-6 h-full overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100">
        <div className="flex overflow-x-auto px-4 gap-6 scrollbar-hide">
          {FEED_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === cat.id ? 'text-[#0095f6] border-[#0095f6]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>{cat.label}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        {filteredPosts.map((post) => {
          const currentImgIdx = currentImageIndices[post.id] || 0;
          return (
            <div key={post.id} className="border-b border-gray-100 pb-4 mb-2">
              <div className="flex justify-between items-center p-3">
                <button onClick={() => onUserClick(post.author)} className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px] rounded-full"><div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden">{post.author[0]}</div></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-bold text-[#262626]">{post.author}</span><span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium uppercase">{post.category}</span></div>
                </button>
                <MoreHorizontal size={20} className="text-[#262626]" />
              </div>
              {post.images && post.images.length > 0 ? (
                <div className="w-full bg-gray-100 aspect-square overflow-hidden relative group">
                  <div className="w-full h-full flex transition-transform duration-300" style={{ transform: `translateX(-${currentImgIdx * 100}%)` }}>
                    {post.images.map((img, idx) => (<div key={idx} className="w-full h-full flex-shrink-0 relative"><img src={img} alt="" className="w-full h-full object-cover" onClick={() => onImageClick({images: post.images, index: idx})} /><div className="absolute inset-y-0 left-0 w-1/4" onClick={(e) => { e.stopPropagation(); handleSwipe(post.id, 'right', post.images.length); }}></div><div className="absolute inset-y-0 right-0 w-1/4" onClick={(e) => { e.stopPropagation(); handleSwipe(post.id, 'left', post.images.length); }}></div></div>))}
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2"><ImageDots current={currentImgIdx} total={post.images.length} /></div>
                </div>
              ) : (<div className="w-full px-4 py-6 bg-white"><p className="text-slate-800 text-lg leading-relaxed font-serif whitespace-pre-wrap">{post.content}</p></div>)}
              <div className="flex justify-between items-center px-3 py-3">
                <div className="flex gap-4"><button onClick={() => toggleLike(post.id)}><Heart size={24} className={post.likedBy.includes(user.name) ? "fill-red-500 text-red-500" : "text-[#262626]"} /></button><button onClick={() => onOpenComments(post)}><MessageCircle size={24} className="text-[#262626] -rotate-90" /></button></div>
              </div>
              <div className="px-3">
                <div className="font-bold text-sm text-[#262626] mb-1">{post.likedBy.length > 0 ? `${post.likedBy.length} likes` : 'Be the first to like'}</div>
                {post.images && post.images.length > 0 && <div className="text-sm text-[#262626] mb-1"><span className="font-bold mr-2">{post.author}</span>{post.content}</div>}
                <button onClick={() => onOpenComments(post)} className="text-[#0095f6] text-sm mb-1 block">{post.comments.length > 0 ? `View all ${post.comments.length} comments` : 'Add a comment...'}</button>
                {post.comments.slice(0, 2).map((c) => (<div key={c.id} className="flex justify-between items-start mb-0.5"><div className="text-sm text-[#262626]"><span className="font-bold mr-2">{c.author}</span>{c.text}</div></div>))}
                <div className="text-gray-400 text-[10px] uppercase mt-1 mb-3">{post.timestamp}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Reservation Section
const ReservationSection = () => {
  const [selectedFacility, setSelectedFacility] = useState(FACILITIES[0]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const timeSlots = generateTimeSlots();
  const todayStr = formatDate(new Date());
  const selectedDateStr = formatDate(currentDate);
  const changeDate = (days) => { const newDate = new Date(currentDate); newDate.setDate(newDate.getDate() + days); if (formatDate(newDate) >= todayStr) setCurrentDate(newDate); };
  const handleDateSelect = (date) => { setCurrentDate(date); setIsCalendarOpen(false); };
  const isSlotBooked = (time) => { const hash = (time.charCodeAt(0) + selectedFacility.id.length + selectedDateStr.slice(-1)) % 7; return hash === 0; };
  const toggleSlot = (time) => { if (isSlotBooked(time)) return; if (selectedSlots.includes(time)) setSelectedSlots(selectedSlots.filter(t => t !== time)); else setSelectedSlots([...selectedSlots, time]); };
  const CalendarModal = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn p-6" onClick={() => setIsCalendarOpen(false)}>
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xs border border-gray-100" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-slate-900">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3><button onClick={() => setIsCalendarOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-900"/></button></div>
          <div className="grid grid-cols-7 gap-2 text-center mb-2">{['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-2">{Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}{days.map(d => { const dateObj = new Date(year, month, d); const dateStr = formatDate(dateObj); const isPast = dateStr < todayStr; const isSelected = dateStr === selectedDateStr; return <button key={d} disabled={isPast} onClick={() => handleDateSelect(dateObj)} className={`h-9 w-9 rounded-full flex items-center justify-center text-xs transition-all ${isSelected ? 'bg-black text-white font-bold shadow-md' : ''} ${isPast ? 'text-gray-200 cursor-not-allowed' : 'text-slate-700 hover:bg-gray-100'}`}>{d}</button>; })}</div>
        </div>
      </div>
    );
  };
  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto animate-fadeIn font-sans relative h-full overflow-y-auto">
      {isCalendarOpen && <CalendarModal />}
      <div className="bg-white p-6 mb-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-6 text-center border-b border-gray-100 pb-4">Make a Reservation</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="block text-slate-500 text-[10px] uppercase tracking-widest font-bold w-16">Facility</label>
            <div className="relative flex-1"><select className="w-full bg-gray-50 border border-gray-200 text-slate-900 py-2 px-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black rounded-lg appearance-none font-bold text-right pr-8" value={selectedFacility.id} onChange={(e) => setSelectedFacility(FACILITIES.find(f => f.id === e.target.value))}><optgroup label="SPORTS">{FACILITIES.filter(f => f.type === 'Sports').map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</optgroup><optgroup label="LOUNGE">{FACILITIES.filter(f => f.type === 'Lounge').map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</optgroup></select><ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} /></div>
          </div>
          <div className="flex items-center gap-4">
            <label className="block text-slate-500 text-[10px] uppercase tracking-widest font-bold w-16">Date</label>
            <div className="flex-1 flex items-center justify-end bg-gray-50 rounded-lg p-1 border border-gray-200"><button onClick={() => changeDate(-1)} disabled={selectedDateStr <= todayStr} className={`p-2 rounded-md transition-colors ${selectedDateStr <= todayStr ? 'text-gray-300' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}><ChevronLeft size={16} /></button><button onClick={() => setIsCalendarOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-1 text-slate-900 font-bold text-sm hover:bg-white rounded-md transition-all"><Calendar size={14} className="text-slate-900" />{currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</button><button onClick={() => changeDate(1)} className="p-2 rounded-md text-slate-600 hover:bg-white hover:shadow-sm transition-colors"><ChevronRight size={16} /></button></div>
          </div>
        </div>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4"><span className="text-slate-500 text-xs tracking-widest uppercase font-bold">Time Slots</span><div className="flex gap-3 text-[10px]"><span className="flex items-center gap-1.5 text-slate-400 font-medium"><div className="w-2.5 h-2.5 bg-gray-100 rounded-full border border-gray-200"></div> Booked</span><span className="flex items-center gap-1.5 text-slate-700 font-medium"><div className="w-2.5 h-2.5 border border-slate-300 rounded-full"></div> Available</span></div></div>
        <div className="grid grid-cols-6 gap-1.5">{timeSlots.map((time) => { const booked = isSlotBooked(time); const selected = selectedSlots.includes(time); return (<button key={time} disabled={booked} onClick={() => toggleSlot(time)} className={`py-2.5 text-[10px] tracking-tight transition-all rounded-md font-medium ${booked ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-transparent decoration-slate-300' : selected ? 'bg-black text-white font-bold shadow-md transform scale-[1.02] border border-black' : 'bg-white border border-gray-200 text-slate-600 hover:border-black hover:text-black'}`}>{time}</button>); })}</div>
        {selectedSlots.length > 0 && <button className="w-full mt-8 bg-[#0095f6] hover:bg-[#1877f2] text-white py-4 rounded-xl font-bold text-xs tracking-[0.1em] uppercase transition-colors shadow-lg" onClick={() => {alert('Reservation Confirmed'); setSelectedSlots([])}}>Confirm Booking</button>}
      </div>
    </div>
  );
};

// Guide Section (Sticky Tabs)
const GuideSection = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const content = {
    intro: (
      <div className="space-y-8 py-8 text-center animate-fadeIn">
        <div className="border-y border-gray-100 py-16 bg-white"><h3 className="text-3xl text-slate-900 font-bold mb-6 tracking-tight font-serif">"Wellness Meets<br/>Connection"</h3><p className="text-slate-500 text-sm font-light leading-8 max-w-xs mx-auto">플라야는 바쁜 일상 속에서 균형을 찾고,<br/>고요함 속에서 진정한 여유를 경험하는<br/>프라이빗 멤버십 클럽입니다.</p></div>
        <div className="grid grid-cols-3 gap-4">{['PRIVATE', 'WELLNESS', 'COMMUNITY'].map(k => <div key={k} className="bg-white border border-gray-200 py-5 rounded-xl text-[10px] tracking-[0.2em] text-slate-600 uppercase shadow-sm font-bold">{k}</div>)}</div>
      </div>
    ),
    facilities: (
      <div className="space-y-4 py-4 animate-fadeIn">
        {[{ name: 'Tennis Court', loc: 'Rooftop', desc: 'Full-size hard court' }, { name: 'Audio Lounge', loc: '2F', desc: 'High-end sound system & LP' }, { name: 'Bornyon', loc: '3F', desc: 'Wood-fire dining & Wine' }, { name: 'Screen Golf', loc: 'B1', desc: 'Private Trackman room' }].map((f, i) => (
          <div key={i} className="bg-white border border-gray-200 p-6 rounded-xl flex justify-between items-center hover:shadow-md transition-all group cursor-pointer"><div><div className="text-slate-900 text-base font-bold tracking-wide transition-colors font-serif">{f.name}</div><div className="text-slate-500 text-xs mt-1 font-medium">{f.desc}</div></div><div className="text-slate-500 text-[10px] bg-gray-100 px-3 py-1 rounded-full uppercase font-bold">{f.loc}</div></div>
        ))}
      </div>
    ),
    reservation: (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-slate-600 text-sm leading-7 font-light shadow-sm animate-fadeIn"><h4 className="font-bold text-slate-900 mb-4">예약 및 이용 안내</h4><ul className="list-disc list-inside space-y-2"><li>모든 시설은 30분 단위로 예약 가능합니다.</li><li>예약 취소는 이용 3시간 전까지 가능합니다.</li><li>동반 게스트는 회원 1인당 최대 3인까지 가능합니다.</li><li>운영 시간: 평일 06:00 - 23:00 / 주말 08:00 - 22:00</li></ul></div>
    ),
    location: (
      <div className="space-y-4 py-4 animate-fadeIn">
        <div className="h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs tracking-widest uppercase border border-gray-200 shadow-inner">[Map View API]</div>
        <div className="bg-white border border-gray-200 p-8 rounded-xl text-center shadow-sm"><div className="text-slate-900 text-base font-bold mb-2 font-serif">Playa Lounge Seoul</div><div className="text-slate-500 text-sm font-medium">서울 강남구 논현로 742, 3층</div><div className="text-slate-600 text-[10px] mt-4 uppercase tracking-wide font-bold bg-gray-100 inline-block px-4 py-1.5 rounded-full">Valet Parking Available</div></div>
      </div>
    )
  };
  return (
    <div className="pb-24 pt-0 bg-white min-h-full relative h-full overflow-y-auto">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm pt-4 pb-2 border-b border-gray-200 px-5">
        <div className="flex justify-between">
          {GUIDE_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${activeTab === tab.id ? 'text-[#0095f6] border-b-2 border-[#0095f6]' : 'text-gray-400 hover:text-gray-600'}`}>{tab.label}</button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-6">{content[activeTab]}</div>
    </div>
  );
};

// Inquiry Section (Chat) - Fixed Layout
const InquirySection = () => {
  const [messages, setMessages] = useState(INITIAL_CHATS);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); }, [messages]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 72)}px`;
    }
  }, [text]);

  const send = () => {
    if(!text.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'user', text: text.trim(), timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]);
    setText('');
    setTimeout(() => setMessages(prev => [...prev, { id: Date.now()+1, sender: 'admin', text: '확인 후 답변 드리겠습니다.', timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans animate-fadeIn transition-opacity duration-500 relative">
      {/* Chat Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
         <div className="flex-1"></div>
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3.5 text-sm leading-relaxed rounded-2xl shadow-sm font-medium ${m.sender === 'user' ? 'bg-emerald-900 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}`}>{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Sticky above Nav */}
      <div className="p-3 bg-white border-t border-slate-200 w-full flex-shrink-0 sticky bottom-0 z-20">
        <div className="flex gap-2 items-end mb-0">
          <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)} onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())} className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 text-base focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 rounded-2xl shadow-inner font-medium resize-none overflow-hidden" placeholder="Message..." rows={1} />
          <button onClick={send} disabled={!text.trim()} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg mb-1 flex-shrink-0 transition-colors ${text.trim() ? 'bg-[#0095f6] text-white' : 'bg-slate-200 text-gray-400'}`}><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
};

// Pass Section (Fixed)
const PassSection = ({ user }) => {
  const [sec, setSec] = useState(30);
  useEffect(() => { const t = setInterval(() => setSec(s => s > 0 ? s - 1 : 30), 1000); return () => clearInterval(t); }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fadeIn font-sans bg-slate-50 overflow-hidden">
      <div className="flex flex-col items-center justify-center w-full max-w-sm">
        <div className="text-slate-400 text-[10px] uppercase tracking-[0.4em] mb-10 font-bold">Access Pass</div>
        <div className="relative mb-10 flex justify-center">
          <QrCode size={240} className="text-slate-900" />
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0095f6] animate-pulse shadow-[0_0_20px_rgba(0,149,246,0.6)]"></div>
        </div>
        <div className="text-slate-900 text-2xl font-bold tracking-widest mb-2 font-serif">{user.name}</div>
        <div className="text-emerald-700 text-[10px] uppercase tracking-widest mb-12 font-bold bg-emerald-50 inline-block px-4 py-1.5 rounded-full">{user.id} • Member</div>
        <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold bg-white py-3 px-6 rounded-full border border-slate-200 shadow-sm"><Clock size={12} /> REFRESH: {sec.toString().padStart(2, '0')}s</div>
      </div>
    </div>
  );
};

// Main App - Fixed Layout Structure
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(INITIAL_USER);
  const [activeTab, setActiveTab] = useState('feed');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [viewingUser, setViewingUser] = useState(null);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [activePostForComments, setActivePostForComments] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [feedScrollPos, setFeedScrollPos] = useState(0); // Correctly defined state

  const menuItems = [
    { id: 'feed', icon: Layout, label: 'Feed' },
    { id: 'book', icon: Calendar, label: 'Book' },
    { id: 'guide', icon: BookOpen, label: 'Guide' },
    { id: 'chat', icon: MessageCircle, label: 'Concierge' },
    { id: 'pass', icon: QrCode, label: 'Pass' },
  ];

  const handleLogin = (admin) => { setIsLoggedIn(true); setIsAdmin(admin); setCurrentUser(admin ? ADMIN_USER : INITIAL_USER); };
  const handleLogout = () => { setIsLoggedIn(false); setIsAdmin(false); setActiveTab('feed'); };
  const handleUpdateProfile = (updatedUser) => { setCurrentUser(updatedUser); };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleCreatePost = (newPostData) => {
    const newPost = { id: Date.now(), category: newPostData.category, author: currentUser.name, images: newPostData.images, content: newPostData.content, likedBy: [], timestamp: 'Just now', comments: [] };
    setPosts([newPost, ...posts]);
    setIsCreatingPost(false);
  };

  const handleOpenComments = (post) => { setActivePostForComments(post); setIsCommentDrawerOpen(true); };
  const handleAddComment = (postId, text) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const newComment = { id: Date.now(), author: currentUser.name, text, timestamp: 'Just now', likedBy: [] };
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));
    if (activePostForComments && activePostForComments.id === postId) {
        setActivePostForComments(prev => ({ ...prev, comments: [...prev.comments, { id: Date.now(), author: currentUser.name, text, timestamp: 'Just now', likedBy: [] }] }));
    }
  };

  if (!isLoggedIn) return <LoginSection onLogin={handleLogin} />;

  const renderContent = () => {
    switch(activeTab) {
      case 'feed': return <FeedSection user={currentUser} onUserClick={(name) => setViewingUser(name)} onCreatePost={() => setIsCreatingPost(true)} onOpenComments={handleOpenComments} onImageClick={(data) => setViewingImage(data)} scrollPosRef={{ current: feedScrollPos }} />; // Pass dummy ref for now or use state
      case 'book': return <ReservationSection />;
      case 'guide': return <GuideSection />;
      case 'chat': return <InquirySection />;
      case 'pass': return <PassSection user={currentUser} />;
      default: return <FeedSection user={currentUser} onUserClick={(name) => setViewingUser(name)} onCreatePost={() => setIsCreatingPost(true)} onOpenComments={handleOpenComments} onImageClick={(data) => setViewingImage(data)} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex justify-center items-center font-sans text-slate-900">
      <div className="w-full max-w-md bg-white fixed inset-0 mx-auto shadow-2xl border-x border-gray-200 flex flex-col overflow-hidden">
        {/* Overlays */}
        {viewingUser && <UserProfilePopup userName={viewingUser} currentUser={currentUser} onClose={() => setViewingUser(null)} onUpdateProfile={handleUpdateProfile} />}
        {isCreatingPost && <CreatePostModal user={currentUser} onClose={() => setIsCreatingPost(false)} onCreate={handleCreatePost} />}
        {viewingImage && <ImageViewer images={viewingImage.images} initialIndex={viewingImage.index} onClose={() => setViewingImage(null)} />}
        <CommentDrawer isOpen={isCommentDrawerOpen} onClose={() => setIsCommentDrawerOpen(false)} post={activePostForComments} currentUser={currentUser} onAddComment={handleAddComment} />

        {/* Header (Fixed Top) */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 h-auto min-h-[50px] flex items-center justify-between px-4 z-30 flex-shrink-0 pt-[env(safe-area-inset-top)] pb-2 box-content w-full">
          <h1 className="text-xl font-bold text-slate-900 cursor-pointer pt-2" style={{ fontFamily: "'Billabong', cursive" }} onClick={() => handleTabChange('feed')}>Playa</h1>
          <button onClick={() => setViewingUser(currentUser.name)} className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-6 rounded-full transition-colors mt-2">
            <span className="text-sm font-bold text-slate-700">{currentUser.name}</span>
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
              {currentUser.profileImage ? <img src={currentUser.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 font-bold">{currentUser.name[0]}</div>}
            </div>
          </button>
        </header>

        {/* Main Content Area (Flex Grow, Scrollable independently) */}
        <main 
          className="flex-1 relative flex flex-col overflow-hidden bg-white w-full"
          // Capture scroll position for Feed
          onScroll={(e) => { if (activeTab === 'feed') setFeedScrollPos(e.target.scrollTop); }}
        >
          {renderContent()}

          {/* Fixed FAB for Feed - Absolute to Main Container */}
          {activeTab === 'feed' && (
            <button 
              onClick={() => setIsCreatingPost(true)}
              className="absolute bottom-6 right-6 bg-[#0095f6] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-[#1877f2] transition-all transform hover:scale-105"
            >
              <Plus size={28} />
            </button>
          )}
        </main>

        {/* Bottom Navigation (Fixed Bottom) - Always Visible */}
        <nav className="bg-white border-t border-gray-100 w-full z-40 pb-[env(safe-area-inset-bottom)] flex-shrink-0 h-auto block">
          <div className="h-14 flex justify-between items-center px-6">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 pt-1 ${activeTab === item.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
                <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
                <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #fafafa; overscroll-behavior: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        /* Safe Area Utilities */
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .pt-safe { padding-top: env(safe-area-inset-top); }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;