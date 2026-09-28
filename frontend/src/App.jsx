// src/App.jsx
import { useState } from 'react';
import ChatDashboard from './ChatDashboard'; 

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [accessToken, setAccessToken] = useState("");
  
  // 1. New state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '', 
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  const toggleTheme = () => {
    setIsDark((currentTheme) => {
      const nextTheme = !currentTheme;
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('https://ai-exam-notes-generator.onrender.com/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setAccessToken('');
      setIsAuthenticated(false);
      setFormData({ username: '', email: '', password: '' });
      setShowPassword(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
    
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const response = await fetch(`https://ai-exam-notes-generator.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setAccessToken(data.accessToken);
      setIsAuthenticated(true);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <ChatDashboard token={accessToken} onLogout={handleLogout} isDark={isDark} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${isDark ? 'bg-[#121212] text-gray-100' : 'bg-stone-50 text-slate-900'}`}>
      <header className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-slate-200'}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
            A
          </div>
          <span className={`font-semibold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>aiexamnotesGenerator.</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-semibold tracking-widest text-gray-500 uppercase">PRIVATE ACCESS</div>
          <button type="button" onClick={toggleTheme} aria-label="Toggle color theme" className={`rounded-full border p-2 transition-transform hover:scale-105 ${isDark ? 'border-[#3a3a3a] text-amber-300 hover:bg-[#242424]' : 'border-slate-300 text-slate-700 hover:bg-white'}`}>
            {isDark ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className={`rounded-2xl border shadow-xl w-full max-w-[420px] p-8 transition-colors ${isDark ? 'bg-[#191919] border-[#2a2a2a]' : 'bg-white border-slate-200 shadow-slate-200/70'}`}>
          
          <div className="mb-8 text-left">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <h1 className={`text-3xl font-serif italic tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isLogin ? 'Sign in.' : 'Create account.'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin ? 'Continue to a sharper way to study.' : 'A sharper place for your questions, sources, and ideas.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="sandeep_287"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2.5 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-[#121212] border-[#2a2a2a] text-white focus:ring-white/30' : 'bg-white border-slate-300 text-slate-900 focus:ring-slate-300'}`}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2.5 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-[#121212] border-[#2a2a2a] text-white focus:ring-white/30' : 'bg-white border-slate-300 text-slate-900 focus:ring-slate-300'}`}
              />
            </div>

            {/* 2. Updated Password Section */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-[11px] font-medium text-gray-400 hover:text-white transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              
              {/* Relative wrapper for absolute button positioning */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={isLogin ? "••••••••" : "Create a password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-3 pr-10 py-2.5 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-[#121212] border-[#2a2a2a] text-white focus:ring-white/30' : 'bg-white border-slate-300 text-slate-900 focus:ring-slate-300'}`}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    /* Eye Open Icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    /* Eye Closed Icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>

              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Use 8 or more characters.</p>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm font-medium p-3 bg-red-500/10 rounded-md border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-medium py-2.5 rounded-md text-sm transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
              {isLoading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Processing...</span> : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center text-sm text-gray-400">
            {isLogin ? "New here? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setShowPassword(false); // Reset password visibility on toggle
                setFormData({ username: '', email: '', password: '' });
              }} 
              className="text-white font-medium hover:underline"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
            {!isLogin && (
              <p className="mt-4 text-[11px] text-gray-500">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
