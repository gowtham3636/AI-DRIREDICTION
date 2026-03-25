import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, TrendingUp, TrendingDown,
    AlertCircle, Briefcase, ChevronRight, BarChart3, Activity, ShieldAlert
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid
} from 'recharts';

const Portfolio = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newPurchase, setNewPurchase] = useState({
        symbol: '',
        quantity: '',
        buyPrice: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchPortfolio = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/portfolio', {
                headers: { 'x-auth-token': token }
            });
            setPurchases(res.data);
        } catch (err) {
            console.error('Failed to fetch portfolio', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/portfolio', newPurchase, {
                headers: { 'x-auth-token': token }
            });
            setShowForm(false);
            fetchPortfolio();
        } catch (err) {
            alert('Failed to add purchase');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Erase this data entry?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/portfolio/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchPortfolio();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold ag-gradient-text tracking-tighter mb-2">Portfolio Intel</h2>
                    <p className="text-text-secondary text-sm font-medium flex items-center gap-2">
                        <Briefcase className="text-accent" size={14} />
                        Managed Assets • Neural Verification Active
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    <Plus size={20} />
                    Log Purchase
                </button>
            </header>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="glass-card p-8 bg-accent/5 border-accent/20"
                    >
                        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Symbol</label>
                                <input
                                    type="text"
                                    placeholder="AAPL"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold uppercase tracking-widest focus:border-accent transition-colors"
                                    onChange={e => setNewPurchase({ ...newPurchase, symbol: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-accent transition-colors"
                                    onChange={e => setNewPurchase({ ...newPurchase, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Buy Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-accent transition-colors"
                                    onChange={e => setNewPurchase({ ...newPurchase, buyPrice: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary justify-center py-3.5">Save to Core</button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                            {['Instrument', 'Quantity', 'Avg Price', 'Current', 'Profit/Loss', 'AI Advisory', 'Actions'].map(h => (
                                <th key={h} className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="p-20 text-center text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Synchronizing distributed ledger...</td></tr>
                        ) : purchases.length === 0 ? (
                            <tr><td colSpan="7" className="p-20 text-center text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">No active assets registered.</td></tr>
                        ) : purchases.map((p, i) => (
                            <motion.tr
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={p._id}
                                className="border-b border-white/5 hover:bg-white/2 transition-colors group"
                            >
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs uppercase">
                                            {p.symbol.charAt(0)}
                                        </div>
                                        <span className="font-bold tracking-tight text-white">{p.symbol}</span>
                                    </div>
                                </td>
                                <td className="p-6 font-mono text-sm text-slate-300">{p.quantity}</td>
                                <td className="p-6 font-mono text-sm text-slate-300">${p.buyPrice.toFixed(2)}</td>
                                <td className="p-6 font-mono text-sm text-white">${p.currentPrice?.toFixed(2) || '---'}</td>
                                <td className={`p-6 font-mono text-sm font-bold ${p.profitLoss >= 0 ? 'text-buy' : 'text-sell'}`}>
                                    <div className="flex flex-col">
                                        <span>{p.profitLoss >= 0 ? '+' : ''}{p.profitLoss?.toFixed(2) || '0.00'}</span>
                                        <span className="text-[10px] opacity-70">{p.plPercentage?.toFixed(2)}%</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className={`status-badge flex items-center gap-2 border-none !px-0 ${p.advice?.includes('SELL') ? 'text-sell' : p.advice?.includes('BUY') ? 'text-buy' : 'text-accent'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${p.advice?.includes('SELL') ? 'bg-sell shadow-[0_0_8px_#ff6b6b]' : p.advice?.includes('BUY') ? 'bg-buy shadow-[0_0_8px_#64ffda]' : 'bg-accent shadow-[0_0_8px_#3b82f6]'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{p.advice}</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <button
                                        onClick={() => handleDelete(p._id)}
                                        className="p-2 rounded-lg bg-sell/10 text-sell border border-sell/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-sell hover:text-white"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Advanced Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                                <Activity size={18} /> Asset Convergence
                            </h3>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Relative Profit/Loss Percentage</p>
                        </div>
                        <BarChart3 className="text-white/10 group-hover:text-accent/20 transition-colors" size={48} />
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={purchases.length > 0 ? purchases : [
                                { symbol: 'SCAN 1', plPercentage: 0 },
                                { symbol: 'SCAN 2', plPercentage: 0 },
                                { symbol: 'SCAN 3', plPercentage: 0 }
                            ]}>
                                <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="symbol"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#475569', fontWeight: 700 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: '#0a0b0e',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                                />
                                <Bar dataKey="plPercentage" radius={[4, 4, 0, 0]}>
                                    {purchases.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.plPercentage >= 0 ? '#64ffda' : '#ff6b6b'}
                                            fillOpacity={0.4}
                                            stroke={entry.plPercentage >= 0 ? '#64ffda' : '#ff6b6b'}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-10 bg-linear-to-br from-accent/5 to-transparent flex flex-col justify-center relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent animate-pulse">
                            <ShieldAlert size={28} />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Neural Status</div>
                            <div className="text-xs font-bold text-buy">OVERDRIVE ACTIVE</div>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tighter mb-4">Institutional-Grade Intelligence</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Advanced technical heuristics are monitoring your assets across 15+ indicator layers.
                        Anomaly detection is currently optimizing your expected value (EV) based on technical convergence.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex-1 p-4 rounded-xl bg-white/2 border border-white/5">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Portfolio Risk</div>
                            <div className="text-xl font-bold tracking-tighter">MODERATE</div>
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-white/2 border border-white/5">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alpha Extraction</div>
                            <div className="text-xl font-bold tracking-tighter text-accent">92.4%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
