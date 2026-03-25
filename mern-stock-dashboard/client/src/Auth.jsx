import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setAuthUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const url = isLogin ? 'http://localhost:5001/api/auth/login' : 'http://localhost:5001/api/auth/register';

        try {
            const res = await axios.post(url, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setAuthUser(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background grain overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-alpha/5 blur-[120px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-card p-10 relative overflow-hidden"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 mb-6">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter ag-gradient-text">
                        {isLogin ? 'Welcome Back' : 'Create Identity'}
                    </h2>
                    <p className="text-text-secondary text-sm mt-2">
                        {isLogin ? 'Enter the neural terminal' : 'Join the intelligence network'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 rounded-xl bg-sell/10 border border-sell/20 text-sell text-xs font-bold text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="USERNAME"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-bold tracking-widest uppercase"
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    )}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-bold tracking-widest uppercase"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={18} />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:ring-1 focus:ring-accent/50 transition-all text-sm font-bold tracking-widest uppercase"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            {['user', 'admin'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${formData.role === role ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'border-white/5 text-slate-500 hover:border-white/20'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    )}

                    <button type="submit" className="btn-primary w-full justify-center py-4 rounded-xl group">
                        {isLogin ? 'INITIALIZE ACCESS' : 'CREATE CORE'}
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs font-bold text-slate-500 hover:text-accent transition-colors uppercase tracking-widest"
                    >
                        {isLogin ? "Don't have an identity? Register" : "Already have an identity? Login"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
