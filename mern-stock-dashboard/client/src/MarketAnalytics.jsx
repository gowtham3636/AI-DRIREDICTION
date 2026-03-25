import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Zap,
    BarChart3,
    PieChart as PieIcon,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, CartesianGrid
} from 'recharts';

const MarketAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [marketData, setMarketData] = useState(null);

    useEffect(() => {
        // Simulate fetching complex market intelligence
        const fetchAnalytics = async () => {
            setLoading(true);
            await new Promise(r => setTimeout(r, 1500));

            setMarketData({
                sectors: [
                    { name: 'Technology', value: 45, color: '#3b82f6' },
                    { name: 'Finance', value: -12, color: '#f87171' },
                    { name: 'Energy', value: 28, color: '#10b981' },
                    { name: 'Consumer', value: 15, color: '#f59e0b' },
                    { name: 'Health', value: -5, color: '#ef4444' }
                ],
                trends: Array.from({ length: 20 }, (_, i) => ({
                    time: i,
                    index: 15000 + Math.sin(i * 0.5) * 200 + (Math.random() * 100)
                })),
                topMovers: [
                    { symbol: 'AAPL', change: '+2.4%', price: '$192.31', trend: 'up' },
                    { symbol: 'TSLA', change: '-1.8%', price: '$175.22', trend: 'down' },
                    { symbol: 'NVDA', change: '+4.1%', price: '$822.10', trend: 'up' },
                    { symbol: 'MSFT', change: '+0.9%', price: '$402.15', trend: 'up' }
                ]
            });
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-accent" size={40} />
                <p className="text-slate-500 uppercase tracking-[0.3em] text-xs font-bold">Synchronizing Global Feeds</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <header>
                <h1 className="text-4xl font-bold tracking-tighter ag-gradient-text uppercase">Market Intelligence</h1>
                <p className="text-slate-500 mt-2">Macro-level trend analysis and sector performance metrics.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sector Performance */}
                <div className="lg:col-span-2 glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <PieIcon className="text-accent" size={20} />
                            <h2 className="font-bold uppercase tracking-widest text-sm">Sector Performance</h2>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">24H CYCLE</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={marketData.sectors} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#475569"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ backgroundColor: '#0a0b0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {marketData.sectors.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.4} stroke={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Movers */}
                <div className="glass-card p-8 bg-linear-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-3 mb-8">
                        <Zap className="text-yellow-400" size={20} />
                        <h2 className="font-bold uppercase tracking-widest text-sm">Volatility Leaders</h2>
                    </div>
                    <div className="space-y-6">
                        {marketData.topMovers.map((mover, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div>
                                    <div className="font-bold text-slate-200 group-hover:text-accent transition-colors">{mover.symbol}</div>
                                    <div className="text-[10px] text-slate-500">{mover.price}</div>
                                </div>
                                <div className={`flex items-center gap-1 font-mono text-sm ${mover.trend === 'up' ? 'text-buy' : 'text-sell'}`}>
                                    {mover.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {mover.change}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Global Trend Index */}
            <div className="glass-card p-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                    <Globe size={120} />
                </div>
                <div className="flex items-center gap-3 mb-10">
                    <TrendingUp className="text-blue-400" size={24} />
                    <div>
                        <h2 className="text-xl font-bold tracking-tighter uppercase">Global Market Resilience Index</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Cross-asset correlation and momentum</p>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={marketData.trends}>
                            <defs>
                                <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis hide />
                            <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0a0b0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="index"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIndex)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
};

export default MarketAnalytics;
