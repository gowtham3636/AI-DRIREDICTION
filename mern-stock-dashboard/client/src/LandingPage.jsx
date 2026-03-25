import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BarChart3,
    Zap,
    Layers,
    Globe,
    ChevronRight,
    Shield
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Zap className="text-accent" size={24} />,
            title: "Physics-Driven AI",
            description: "Natural, fluid transitions that mimic real-world momentum and market gravity."
        },
        {
            icon: <Layers className="text-accent" size={24} />,
            title: "Glassmorphism UI",
            description: "Ultra-clear transparency layers with dynamic back-filtering for visual depth."
        },
        {
            icon: <Globe className="text-accent" size={24} />,
            title: "Zero Latency Data",
            description: "Optimized asset delivery and minimal-DOM footprint for lightning speeds."
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-background text-primary selection:bg-accent/30 overflow-x-hidden grain">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full h-20 px-8 md:px-16 flex items-center justify-between z-50 bg-background/50 backdrop-blur-xl border-b border-white/5">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                        <BarChart3 className="text-white" size={20} />
                    </div>
                    <span className="font-bold text-xl tracking-tighter ag-gradient-text">STOCK LUMINA

                    </span>
                </motion.div>

                <div className="hidden md:flex items-center gap-10">
                    {['Features', 'Intelligence', 'Network'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
                            {item}
                        </a>
                    ))}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all"
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
                    {/* Decorative Glows */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 blur-[120px] rounded-full -z-10 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-alpha/5 blur-[100px] rounded-full -z-10" />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-5xl"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 glass-card !rounded-full !py-1 bg-white/5 border-white/10">
                            <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
                            <span className="status-badge !border-none !p-0 text-accent">APPL NIFTY50</span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-6xl md:text-[120px] font-bold tracking-tighter leading-[0.9] mb-10 ag-gradient-text"
                        >
                            AI-driven <br /> <span className="text-accent">price prediction.</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary mb-12 leading-relaxed"
                        >
                            High-fidelity market forecasting powered by physics-driven neural ensembles.
                            Zero friction. Maximum alpha.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 items-center justify-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn-primary"
                            >
                                Enter Dashboard
                                <ArrowRight size={20} />
                            </button>
                            <button className="btn-secondary group flex items-center gap-2">
                                Read Whitepaper
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </motion.div>


                </section>

                {/* Features Section */}
                <section id="features" className="py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="glass-card p-10 group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 border border-accent/20 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-500">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                                    <p className="text-text-secondary leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-32 border-y border-white/5 bg-slate-950/40 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-16">
                        {[
                            { label: 'Network Coverage', val: 'NIFTY50+', icon: <Globe size={16} /> },
                            { label: 'Model Confidence', val: '94.2%', icon: <Zap size={16} /> },
                            { label: 'Engine Latency', val: '< 12ms', icon: <Layers size={16} /> },
                            { label: 'Security Grade', val: 'A+', icon: <Shield size={16} /> }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold mb-3 tracking-tighter ag-gradient-text">{stat.val}</div>
                                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
                                    {stat.icon}
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-24 px-6 border-t border-white/5 text-center">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                                <BarChart3 className="text-white" size={16} />
                            </div>
                            <span className="font-bold tracking-tighter text-lg">STOCK LUMINA </span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Built for the next generation of institutional-grade market intelligence.
                        </p>
                        <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">

                        </div>
                        <p className="text-slate-700 text-[10px] mt-8">

                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;

