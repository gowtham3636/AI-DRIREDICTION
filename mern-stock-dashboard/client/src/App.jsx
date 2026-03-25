import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Auth from './Auth';
import Portfolio from './Portfolio';
import AdminDashboard from './AdminDashboard';
import MarketAnalytics from './MarketAnalytics';
import {
  Activity, TrendingUp, AlertTriangle, MessageSquare,
  ChevronDown, ChevronUp, Search, Info, BarChart3, Home,
  Cpu, Zap, Shield, Briefcase, LogOut, ShieldAlert, Sliders
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DATA = [
  { date: '2023-07-01', price: 19200, upper: 19500, lower: 18900 },
  { date: '2023-07-05', price: 19350, upper: 19600, lower: 19100 },
  { date: '2023-07-10', price: 19480, upper: 19700, lower: 19260 },
  { date: '2023-07-15', price: 19620, upper: 19850, lower: 19390 },
  { date: '2023-07-20', price: 19800, upper: 20050, lower: 19550 },
  { date: '2023-07-25', price: 19680, upper: 19950, lower: 19410 },
  { date: '2023-07-27', price: 19778, upper: 20000, lower: 19500 },
];

const POPULAR_STOCKS = [
  { symbol: 'NIFTY50', name: 'Nifty 50 Index' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' }
];

function Dashboard({ activeView, user, logout }) {
  const [ticker, setTicker] = useState('NIFTY50');
  const [showDropdown, setShowDropdown] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [showAlpha, setShowAlpha] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const navigate = useNavigate();

  const fetchPrediction = async (forceTicker = null) => {
    const targetTicker = forceTicker || ticker;
    setLoading(true);
    setPrediction(null);
    setPipelineStep(0);

    const steps = [1, 2, 3, 4];
    for (const step of steps) {
      setPipelineStep(step);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const [predRes, histRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/predictions/${targetTicker}`).catch(() => null),
        axios.get(`http://localhost:5001/api/history/${targetTicker}`).catch(() => null)
      ]);

      if (predRes && predRes.data.success) {
        setPrediction(predRes.data.data);
      } else {
        setPrediction({
          signal: 'OFFLINE',
          confidence: 0,
          riskScore: 0,
          sentiment: 0,
          volatilityRegime: 'Service Unavailable',
          features: { 'Status': 'Backend offline — start ai-service & server' }
        });
      }

      if (histRes && histRes.data.success) {
        setHistory(histRes.data.data);
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'terminal') fetchPrediction();
  }, [activeView]);

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/30 grain">
      {/* --- Desktop Sidebar --- */}
      <nav className="fixed left-0 top-0 h-full w-24 hidden md:flex flex-col items-center py-10 gap-10 border-r border-white/5 bg-background/50 backdrop-blur-2xl z-50">
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate('/')}
          className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-accent hover:border-accent transition-all duration-300 group shadow-xl"
        >
          <Home className="text-white group-hover:text-white" size={22} />
        </motion.div>

        <div className="flex flex-col gap-8 flex-1 justify-center">
          <Activity
            onClick={() => navigate('/dashboard')}
            className={`cursor-pointer transition-all duration-300 hover:text-accent hover:scale-110 ${activeView === 'terminal' ? 'text-accent' : 'text-slate-500'}`}
            size={24}
          />
          <Briefcase
            onClick={() => navigate('/portfolio')}
            className={`cursor-pointer transition-all duration-300 hover:text-accent hover:scale-110 ${activeView === 'portfolio' ? 'text-accent' : 'text-slate-500'}`}
            size={24}
          />
          {user?.role === 'admin' && (
            <ShieldAlert
              onClick={() => navigate('/admin')}
              className={`cursor-pointer transition-all duration-300 hover:text-accent hover:scale-110 ${activeView === 'admin' ? 'text-accent' : 'text-slate-500'}`}
              size={24}
            />
          )}
          <BarChart3
            onClick={() => navigate('/analytics')}
            className={`cursor-pointer transition-all duration-300 hover:text-accent hover:scale-110 ${activeView === 'analytics' ? 'text-accent' : 'text-slate-500'}`}
            size={24}
          />
        </div>

        <div onClick={logout} className="w-10 h-10 rounded-full bg-linear-to-br from-accent to-alpha shadow-lg shadow-accent/20 cursor-pointer flex items-center justify-center group overflow-hidden relative">
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <LogOut size={16} className="text-white" />
          </div>
          <span className="font-bold text-xs">{user?.username?.charAt(0)}</span>
        </div>
      </nav>

      <main className="md:ml-24 max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        {activeView === 'terminal' ? (
          <>
            {/* --- Header --- */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-4xl md:text-5xl font-bold ag-gradient-text tracking-tighter mb-2">
                  Neural Terminal
                </h1>
                <p className="text-text-secondary text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-buy animate-pulse" />
                  Live Engine Feed • Welcome, {user?.username}
                </p>
              </motion.div>

              <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => {
                    setTicker(e.target.value.toUpperCase());
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setShowDropdown(false);
                      fetchPrediction();
                    }
                  }}
                  placeholder="SEARCH INSTRUMENT..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-accent/50 focus:border-accent/40 transition-all font-bold tracking-widest text-xs uppercase z-20 relative"
                />

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-[#0a0b0e]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                    >
                      <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 transparent' }}>
                        {POPULAR_STOCKS.filter(s => s.symbol.includes(ticker.toUpperCase()) || s.name.toUpperCase().includes(ticker.toUpperCase())).map(stock => (
                          <div
                            key={stock.symbol}
                            onClick={() => {
                              setTicker(stock.symbol);
                              setShowDropdown(false);
                              fetchPrediction(stock.symbol);
                            }}
                            className="px-5 py-3 hover:bg-white/10 cursor-pointer flex justify-between items-center transition-colors border-b border-white/5 last:border-0"
                          >
                            <span className="font-bold text-xs tracking-widest text-white">{stock.symbol}</span>
                            <span className="text-[10px] text-slate-400 capitalize truncate ml-4">{stock.name}</span>
                          </div>
                        ))}
                        {POPULAR_STOCKS.filter(s => s.symbol.includes(ticker.toUpperCase()) || s.name.toUpperCase().includes(ticker.toUpperCase())).length === 0 && (
                          <div className="px-5 py-4 text-[10px] text-slate-500 text-center tracking-widest uppercase bg-white/5 italic">
                            Press Enter to search ANY ticker
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            {/* --- Pipeline Progress --- */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card !rounded-2xl p-5 flex items-center gap-8 overflow-hidden">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <span>Strategy Convergence</span>
                  <span className="text-accent">{loading ? "Recomputing Alpha..." : "Converged"}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: loading ? `${(pipelineStep / 4) * 100}%` : '100%' }}
                    className="h-full bg-linear-to-r from-accent to-alpha shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>
              <div className="hidden sm:flex gap-4">
                {['ETL', 'NLP', 'ALPHA', 'ENS'].map((step, i) => (
                  <div key={step} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-500 ${pipelineStep > i ? 'bg-accent/10 text-accent border-accent/20' : 'text-slate-600 border-white/5'}`}>
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* --- Primary Signals --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  label: 'Trading Signal',
                  val: prediction?.signal,
                  color: prediction?.signal === 'BUY' ? 'text-buy' : 'text-sell',
                  badge: 'Alpha v4',
                  icon: <Zap size={18} className="text-accent" />
                },
                {
                  label: 'Risk Score',
                  val: loading ? '...' : prediction?.riskScore,
                  color: 'text-white',
                  progress: (prediction?.riskScore / 5) * 100,
                  icon: <Shield size={18} className="text-yellow-500" />
                },
                {
                  label: 'Sentiment',
                  val: loading ? '...' : (prediction?.sentiment > 0.5 ? 'Bullish' : prediction?.sentiment < -0.5 ? 'Bearish' : 'Neutral'),
                  color: 'text-alpha',
                  detail: `SCORE: ${prediction?.sentiment || 0}`,
                  icon: <MessageSquare size={18} className="text-alpha" />
                },
                {
                  label: 'Volatility',
                  val: loading ? '...' : prediction?.volatilityRegime,
                  color: 'text-white',
                  detail: 'GARCH(1,1) MODEL',
                  icon: <TrendingUp size={18} className="text-purple-500" />
                }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 group overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{card.label}</span>
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                  </div>
                  {loading ? (
                    <div className="animate-pulse h-10 bg-white/5 rounded-lg w-3/4 mb-4" />
                  ) : (
                    <div className={`text-4xl font-bold tracking-tighter ${card.color} mb-4`}>
                      {card.val}
                    </div>
                  )}
                  {card.badge && (
                    <div className="status-badge bg-accent/10 text-accent border-accent/20 inline-block">
                      {card.badge}
                    </div>
                  )}
                  {card.progress !== undefined && (
                    <div className="h-1 w-full bg-white/5 rounded-full mt-6">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: loading ? 0 : `${card.progress}%` }}
                        className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                      />
                    </div>
                  )}
                  {card.detail && <p className="text-[10px] text-slate-600 font-bold tracking-widest mt-4">{card.detail}</p>}
                </motion.div>
              ))}
            </div>

            {/* --- Visualization --- */}
            <section className="glass-card p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="flex gap-4">
                  {['1H', '4H', '1D', '1W'].map(t => (
                    <button key={t} className={`text-[10px] font-bold px-3 py-1 rounded-md border ${t === '1D' ? 'bg-accent text-white border-accent' : 'border-white/5 text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-bold flex items-center gap-3 tracking-tighter ag-gradient-text">
                  <BarChart3 size={24} className="text-accent" />
                  Price Intelligence Pipeline
                </h3>
                <p className="text-slate-500 text-xs mt-1">Instrument: {ticker} • Confidence: {(prediction?.confidence || 0) * 100}%</p>
              </div>

              <div className="h-[400px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#475569', fontWeight: 700 }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0b0e',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="upper" stroke="#ffffff08" fill="transparent" strokeDasharray="8 8" />
                    <Area type="monotone" dataKey="lower" stroke="#ffffff08" fill="transparent" strokeDasharray="8 8" />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* --- Alpha Breakdown --- */}
            <section className="glass-card overflow-hidden transition-all duration-500">
              <button
                onClick={() => setShowAlpha(!showAlpha)}
                className="w-full flex justify-between items-center p-8 hover:bg-white/5 transition-colors"
              >
                <h3 className="text-sm font-bold flex items-center gap-3 uppercase tracking-[0.2em] text-alpha">
                  <Cpu size={20} />
                  Extracted Intelligence Layer
                </h3>
                {showAlpha ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
              </button>

              <AnimatePresence>
                {showAlpha && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-8"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 border-t border-white/5 pt-8">
                      {Object.entries(prediction?.features || {}).map(([key, val]) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={key}
                          className="flex justify-between items-center p-5 bg-black/40 rounded-2xl border border-white/5 group hover:border-accent/30 transition-all"
                        >
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{key}</span>
                          <span className="text-white font-mono font-bold group-hover:text-accent transition-colors">{val}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </>
        ) : activeView === 'portfolio' ? (
          <Portfolio />
        ) : activeView === 'analytics' ? (
          <MarketAnalytics />
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Basic persistent login check
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        setAuthUser(JSON.parse(user));
      } catch (e) {
        setAuthUser({ username: 'Operator', role: 'user' });
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUser(null);
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-bold tracking-widest text-xs uppercase animate-pulse">Syncing...</div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/auth"
        element={authUser ? <Navigate to="/dashboard" /> : <Auth setAuthUser={setAuthUser} />}
      />
      <Route
        path="/dashboard"
        element={authUser ? <Dashboard activeView="terminal" user={authUser} logout={logout} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/portfolio"
        element={authUser ? <Dashboard activeView="portfolio" user={authUser} logout={logout} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/admin"
        element={authUser && authUser.role === 'admin' ? <Dashboard activeView="admin" user={authUser} logout={logout} /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/analytics"
        element={authUser ? <Dashboard activeView="analytics" user={authUser} logout={logout} /> : <Navigate to="/auth" />}
      />
    </Routes>
  );
}

export default App;

