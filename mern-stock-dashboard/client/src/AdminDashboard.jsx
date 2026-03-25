import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Trash2,
    ShieldAlert,
    Activity,
    Database,
    BarChart,
    RefreshCcw,
    Search
} from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const [usersRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5001/api/admin/users', config),
                axios.get('http://localhost:5001/api/admin/stats', config)
            ]);

            setUsers(usersRes.data);
            setStats(statsRes.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user and all their portfolio data?')) return;

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.get(`http://localhost:5001/api/admin/users/delete/${id}`, config);
            setUsers(users.filter(user => user._id !== id));
            fetchData(); // Refresh stats
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !users.length) {
        return (
            <div className="flex items-center justify-center h-full">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    <RefreshCcw className="text-accent" size={32} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter ag-gradient-text uppercase">Control Center</h1>
                    <p className="text-text-secondary mt-1">System-wide administrative oversight and user management.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-white/10 transition-colors"
                >
                    <RefreshCcw size={16} />
                    Sync Systems
                </button>
            </header>

            {error && (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                    <div className="flex items-center gap-3 mb-2 font-bold uppercase tracking-tight">
                        <ShieldAlert size={20} />
                        Administrative Link Failure
                    </div>
                    <p className="text-sm opacity-80">
                        {error}. Please ensure the backend server is running and was restarted after the latest update.
                    </p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Operators', value: stats?.totalUsers || 0, icon: <Users />, color: 'text-blue-400' },
                    { label: 'Active Trade Logs', value: stats?.totalPurchases || 0, icon: <Activity />, color: 'text-accent' },
                    { label: 'Asset Volume', value: `$${stats?.totalInvestment?.toLocaleString() || 0}`, icon: <BarChart />, color: 'text-green-400' },
                    { label: 'DB Integrity', value: stats?.dbStatus || 'Unknown', icon: <Database />, color: 'text-purple-400' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 border-white/5 bg-slate-900/40"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                {React.cloneElement(stat.icon, { size: 20 })}
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Telemetry</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
                        <div className="text-xs text-text-secondary uppercase tracking-tight mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* User Management Table */}
            <section className="glass-card overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="text-accent" size={20} />
                        <h2 className="font-bold uppercase tracking-tight">Operator Directory</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-hidden focus:border-accent/50 w-full md:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase tracking-widest text-slate-500 bg-white/2">
                            <tr>
                                <th className="px-6 py-4 font-bold">Identity</th>
                                <th className="px-6 py-4 font-bold">Email Interface</th>
                                <th className="px-6 py-4 font-bold">Authorization</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="hover:bg-white/2 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-200">{user.username}</div>
                                            <div className="text-[10px] text-slate-500 font-mono mt-1">{user._id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-tighter ${user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors group"
                                                title="Revoke and Purge"
                                            >
                                                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No operators found matching the criteria.
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminDashboard;
