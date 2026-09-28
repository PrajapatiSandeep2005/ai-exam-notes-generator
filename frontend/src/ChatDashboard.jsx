// frontend/src/ChatDashboard.jsx
import { useState, useRef, useEffect } from 'react';

export default function ChatDashboard({ token, onLogout, isDark, onToggleTheme }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(null);
  const [downloadingMessage, setDownloadingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  
  // New states for dynamic history
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(() => Boolean(token));

  // Fetch chat history from the database when the component loads
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('https://ai-exam-notes-generator.onrender.com/api/v1/chat/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Pass the token for authentication
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch chat history');
        }

        if (data.success && Array.isArray(data.data)) {
          setChatHistory(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Make the POST request to your Express server
      const response = await fetch('https://ai-exam-notes-generator.onrender.com/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Ensure your backend accepts this if protected
        },
        body: JSON.stringify({ prompt: userMsg.content }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 2. Append the real Gemini response to the UI
        setMessages((prev) => [...prev, { role: 'ai', content: data.message }]);
        setChatHistory((prev) => [
          { _id: data.chatId, title: userMsg.content, updatedAt: new Date().toISOString() },
          ...prev,
        ]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
        setMessages((prev) => [...prev, { role: 'ai', content: `Error: Could not fetch notes. ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyResponse = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(index);
      window.setTimeout(() => setCopiedMessage(null), 1800);
    } catch {
      setCopiedMessage(null);
    }
  };

  const downloadResponse = async (content, index) => {
    setDownloadingMessage(index);
    try {
      const response = await fetch('https://ai-exam-notes-generator.onrender.com/api/v1/chat/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'AI Exam Notes', content }),
      });

      if (!response.ok) throw new Error('Unable to create PDF');
      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ai-exam-notes.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingMessage(null);
    }
  };

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#121212] text-gray-100' : 'bg-stone-50 text-slate-900'}`}>
      
      {/* LEFT SIDEBAR */}
      <aside className={`w-64 border-r flex flex-col transition-colors ${isDark ? 'bg-[#191919] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}>
        <div className={`h-16 flex items-center px-4 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
           <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs mr-2 ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
            A
          </div>
          <span className="font-semibold tracking-tight text-sm">aiexamnotesGenerator.</span>
        </div>

        {/* Dynamic History List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 mt-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">History</h3>
          
          {isLoadingHistory ? (
            <div className="space-y-3 px-2" aria-label="Loading chat history">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className={`h-3 rounded ${isDark ? 'bg-[#303030]' : 'bg-slate-200'} ${item % 2 === 0 ? 'w-5/6' : 'w-2/3'}`} />
                </div>
              ))}
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="text-xs text-gray-500 px-2">No previous exams found.</div>
          ) : (
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <button key={chat._id} className={`w-full text-left text-sm px-2 py-1.5 rounded truncate transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                  {chat.title}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* User Profile Area */}
        <div className={`p-4 border-t ${isDark ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold uppercase">
                 S
               </div>
               <div className="flex flex-col">
                 <span className="text-sm font-medium">Sandeep</span>
                 <span className="text-[10px] text-gray-500">Roll No: 287</span>
               </div>
             </div>
           </div>
           <button
             type="button"
             onClick={onLogout}
             className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-[#3a3a3a] px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-300"
           >
             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
             </svg>
             Logout
           </button>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative">
        <header className={`h-16 flex items-center justify-between px-6 border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-500">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             ONLINE
          </div>
          <button type="button" onClick={onToggleTheme} aria-label="Toggle color theme" className={`rounded-full border px-3 py-1.5 text-sm transition-transform hover:scale-105 ${isDark ? 'border-[#3a3a3a] text-amber-300 hover:bg-[#242424]' : 'border-slate-300 text-slate-700 hover:bg-white'}`}>{isDark ? '☀ Light' : '☾ Dark'}</button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 md:px-24 py-8 pb-32">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center mt-12">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                A QUIETER SEARCH
              </div>
              <h1 className={`text-5xl md:text-6xl font-serif italic tracking-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Ask anything.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                Welcome back, Sandeep. aiexamnotesGenerator scours your notes, then writes you back — in full sentences, with every source receipt attached.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? (isDark ? 'bg-[#2a2a2a] text-white' : 'bg-slate-900 text-white') : (isDark ? 'bg-transparent text-gray-300 border border-[#2a2a2a]' : 'bg-white text-slate-700 border border-slate-200 shadow-sm')}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.role === 'ai' && !msg.content.startsWith('Error:') && (
                      <div className={`mt-3 flex items-center gap-2 border-t pt-3 ${isDark ? 'border-[#303030]' : 'border-slate-100'}`}>
                        <button type="button" onClick={() => copyResponse(msg.content, idx)} className="text-xs text-gray-500 transition-colors hover:text-current">
                          {copiedMessage === idx ? 'Copied!' : 'Copy'}
                        </button>
                        <button type="button" disabled={downloadingMessage === idx} onClick={() => downloadResponse(msg.content, idx)} className="text-xs text-gray-500 transition-colors hover:text-current disabled:opacity-50">
                          {downloadingMessage === idx ? 'Preparing PDF...' : 'Download PDF'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`w-full max-w-[80%] rounded-2xl p-4 border ${isDark ? 'border-[#2a2a2a]' : 'border-slate-200 bg-white shadow-sm'}`} aria-label="Generating response">
                    <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" /></span>
                      Generating notes
                    </div>
                    <div className="space-y-2 animate-pulse">
                      <div className={`h-3 w-full rounded ${isDark ? 'bg-[#303030]' : 'bg-slate-200'}`} />
                      <div className={`h-3 w-11/12 rounded ${isDark ? 'bg-[#303030]' : 'bg-slate-200'}`} />
                      <div className={`h-3 w-4/6 rounded ${isDark ? 'bg-[#303030]' : 'bg-slate-200'}`} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className={`absolute bottom-0 w-full pt-10 pb-6 px-8 md:px-24 ${isDark ? 'bg-gradient-to-t from-[#121212] via-[#121212] to-transparent' : 'bg-gradient-to-t from-stone-50 via-stone-50 to-transparent'}`}>
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
            <div className={`flex items-center border rounded-xl focus-within:ring-2 transition-all overflow-hidden p-2 ${isDark ? 'bg-[#191919] border-[#2a2a2a] focus-within:ring-white/30' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/60 focus-within:ring-slate-300'}`}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What do you want to know?"
                className={`flex-1 bg-transparent px-2 py-3 outline-none text-sm placeholder-gray-500 ${isDark ? 'text-white' : 'text-slate-900'}`}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className={`p-2 ml-2 rounded-lg disabled:opacity-50 transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
            <div className="text-center mt-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              Powered by MERN & AI
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
