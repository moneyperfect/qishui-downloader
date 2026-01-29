import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, Sparkles, RefreshCw, Share2, Play, Pause, Heart, Smartphone } from 'lucide-react';

// --- Helper: Typewriter ---
const useTypewriter = (phrases, typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    useEffect(() => {
        const i = loopNum % phrases.length;
        const fullText = phrases[i];
        const handleType = () => {
            setText(current => isDeleting ? fullText.substring(0, current.length - 1) : fullText.substring(0, current.length + 1));
            if (!isDeleting && text === fullText) { setTimeout(() => setIsDeleting(true), pauseTime); }
            else if (isDeleting && text === '') { setIsDeleting(false); setLoopNum(loopNum + 1); }
        };
        const timer = setTimeout(handleType, isDeleting ? deletingSpeed : typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, phrases]);
    return text;
};

// --- Component: PosterCard (Landing Animation) ---
const PosterCard = ({ className, imgUrl, delay, overlayColor }) => (
    <div
        className={`absolute hidden md:block w-48 h-[18rem] lg:w-64 lg:h-[24rem] rounded-[1.5rem] shadow-2xl transition-transform duration-1000 ${className}`}
        style={{
            transformStyle: 'preserve-3d',
            animation: `float-card 6s ease-in-out infinite ${delay}s`,
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8)'
        }}
    >
        <div className="absolute inset-0 bg-[#0a0a0a] p-2 rounded-[1.5rem] overflow-hidden transform-gpu border border-white/10">
            <img src={imgUrl} alt="Visual" className="w-full h-full object-cover rounded-[1rem] brightness-[0.9] contrast-[1.1]" />
            <div className={`absolute inset-0 bg-gradient-to-b ${overlayColor} opacity-40 pointer-events-none rounded-[1rem] mix-blend-overlay`} />
        </div>
    </div>
);

// AIBadge component removed - features not yet implemented

// --- Component: PlayerView (1:1 Restoration) ---
const PlayerView = ({ track, onReset }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const audioRef = useRef(null);

    // Auto Play
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.8;
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Auto-play failed:", err));
        }
        return () => { if (audioRef.current) audioRef.current.pause(); };
    }, [track]);

    const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    // Proxied URL handling
    const audioSource = track.audioSrc.startsWith('/')
        ? `http://localhost:8000${track.audioSrc}` // Dev environment adjustment
        : track.audioSrc;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#020202] text-white overflow-hidden font-serif selection:bg-orange-500/30">
            {/* Dynamic Background (Same as Landing) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[90%] bg-gradient-to-br from-[#FF3300] via-[#8B0000] to-transparent blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[90%] bg-gradient-to-tl from-[#3300FF] via-[#1A0033] to-transparent blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>
            {/* Color Overlay from Track */}
            <div className="absolute inset-0 pointer-events-none transition-colors duration-1000 opacity-40 mix-blend-screen z-[1]"
                style={{ background: `radial-gradient(circle at 50% 30%, ${track.colors[0]}50, transparent 60%)` }} />
            {/* Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none z-[2]" />

            {/* 2. Header: Lab Logo & Share Pill */}
            <header className="w-full flex justify-between items-start px-6 py-6 md:px-8 md:py-8 z-20">
                <div className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase font-sans mt-2">
                    NSRL LAB
                </div>
                <ShareButton track={track} />
            </header>

            {/* 3. Main Center: Vinyl & Info */}
            <div className="flex-1 w-full flex flex-col items-center justify-center relative -mt-16">

                {/* Vinyl Vibe Area */}
                <div className="relative group perspective-1000">
                    {/* Pulse Glow (The Aura) */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[75vw] md:w-[30rem] md:h-[30rem] rounded-full bg-gradient-to-tr ${track.colors[0]} to-${track.colors[1]} blur-[80px] transition-all duration-1000 ease-in-out ${isPlaying ? 'opacity-40 scale-105' : 'opacity-20 scale-90'}`} />

                    {/* The Full-Bleed Vinyl */}
                    <div className="relative w-[80vw] h-[80vw] md:w-[32rem] md:h-[32rem] rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-white/5 transition-transform duration-700"
                        style={{
                            animation: 'spin 12s linear infinite',
                            animationPlayState: isPlaying ? 'running' : 'paused'
                        }}>

                        {/* Cover Art */}
                        <img src={track.img} alt="Cover" className="w-full h-full object-cover filter brightness-[0.9] contrast-[1.15]" />

                        {/* Texture: Repeating Radial Grooves */}
                        <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none mix-blend-overlay"
                            style={{
                                background: 'repeating-radial-gradient(#000 0, #000 2px, transparent 3px, transparent 4px)'
                            }} />

                        {/* Light Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/50 pointer-events-none" />

                        {/* Tiny Center Hole */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-[#0a0a0a] rounded-full shadow-inner border border-white/10" />
                    </div>
                </div>

                {/* Title & Progress */}
                <div className="mt-12 md:mt-16 w-full max-w-sm md:max-w-md px-8 text-center space-y-6 z-20">
                    <div className="max-w-[90vw] md:max-w-md">
                        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight tracking-tight drop-shadow-xl font-serif line-clamp-2">
                            {track.title}
                        </h2>
                        <p className="mt-2 text-[10px] md:text-xs font-sans tracking-[0.2em] text-white/40 uppercase truncate">
                            NSRL ENGINE • {track.artist}
                        </p>
                    </div>

                    {/* Seekable Progress Bar */}
                    <div
                        className="group relative w-full h-10 flex items-center cursor-pointer select-none"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
                                const newTime = (clickX / rect.width) * audioRef.current.duration;
                                audioRef.current.currentTime = newTime;
                                setProgress((newTime / audioRef.current.duration) * 100);
                            }
                        }}
                    >
                        <div className="w-full h-[3px] bg-white/20 rounded-full overflow-hidden group-hover:h-[5px] transition-all">
                            <div className="h-full bg-white transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
                        </div>
                        {/* Draggable Handle */}
                        <div
                            className="absolute h-4 w-4 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-1/2 pointer-events-none"
                            style={{ left: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Control Island (Floating) */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-8 md:gap-10 px-8 py-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105">

                    {/* Refresh */}
                    <button onClick={onReset} className="text-white/40 hover:text-white transition-colors p-2">
                        <RefreshCw size={20} />
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>

                    {/* Heart */}
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`transition-colors p-2 ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioSource}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                crossOrigin="anonymous" // Support proxy
            />
        </div>
    );
};

// --- Share Button Component ---
const ShareButton = ({ track }) => {
    const [showQR, setShowQR] = useState(false);
    return (
        <>
            <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
            >
                <Share2 size={12} className="text-white/60" />
                <span className="text-[9px] font-sans font-bold tracking-wider text-white/60 uppercase">Share Vibe</span>
            </button>
            {showQR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in-up" onClick={() => setShowQR(false)}>
                    <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
                        <div className="bg-white p-2 rounded-xl">
                            <QRCodeSVG value={window.location.href} size={180} />
                        </div>
                        <p className="text-white/40 text-[10px] font-sans tracking-widest uppercase">Scan to share vibe</p>
                    </div>
                </div>
            )}
        </>
    );
}

// --- Main App Component ---
export default function App() {
    const [inputVal, setInputVal] = useState('');
    const [artistVal, setArtistVal] = useState('');
    const [status, setStatus] = useState('idle');
    const [currentTrack, setCurrentTrack] = useState(null);

    const placeholderText = useTypewriter([
        "Type 'Never Gonna Give You Up'...",
        "Type 'Yellow'...",
        "Type 'Bohemian Rhapsody'...",
    ]);

    const handleVisualize = async () => {
        if (!inputVal.trim()) return;
        setStatus('analyzing');

        const API_BASE = 'http://localhost:8000';
        const queryPayload = artistVal.trim() ? `${inputVal.trim()} ${artistVal.trim()}` : inputVal.trim();

        try {
            const response = await fetch(`${API_BASE}/visualize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: queryPayload })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();

            // Simulate slight delay for effect
            setTimeout(() => {
                setCurrentTrack({
                    title: data.title,
                    artist: data.artist,
                    theme: data.theme || 'AI Generated Vibe',
                    colors: data.colors,
                    img: data.cover,
                    audioSrc: data.audioSrc // Contains /proxy-stream?url=...
                });
                setStatus('player');
            }, 800);

        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Vibe check failed. Try another song.");
            setStatus('idle');
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#020202] font-serif selection:bg-orange-500/30 selection:text-white text-white touch-manipulation">
            {/* Dynamic Background */}
            <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${status === 'player' ? 'opacity-0' : 'opacity-50'}`}>
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[90%] bg-gradient-to-br from-[#FF3300] via-[#8B0000] to-transparent blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[90%] bg-gradient-to-tl from-[#3300FF] via-[#1A0033] to-transparent blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Top Bar (Only visible in Idle/Analyzing) */}
            <div className={`absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 cursor-pointer transition-opacity duration-500 ${status === 'player' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={() => { setStatus('idle'); setInputVal(''); }}>
                <span className="font-bold tracking-[0.2em] text-xs md:text-sm text-white/80 font-sans">NSRL</span>
                <span className="text-[10px] bg-[#FF3300] text-black font-extrabold px-1.5 py-0.5 rounded-sm tracking-wide font-sans shadow-[0_0_10px_rgba(255,51,0,0.5)]">VISION</span>
            </div>

            {/* PWA Install Hint */}
            <div className={`absolute top-6 right-6 z-20 md:hidden opacity-50 ${status === 'player' ? 'hidden' : ''}`}>
                <Smartphone size={20} />
            </div>

            {/* Main Stage */}
            <main className="relative z-10 w-full h-full flex flex-col items-center justify-center transition-all duration-700">

                {/* 1. Landing View */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 px-4 ${status === 'idle' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <PosterCard className="left-[5%] xl:left-[10%] rotate-y-12" imgUrl="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop" delay={0} overlayColor="from-orange-500/20 to-red-900/40" />

                    <div className="max-w-4xl text-center space-y-4 md:space-y-8 z-20 transform translate-y-[-10px] w-full">

                        <h1 className="flex flex-col items-center justify-center leading-[1.05] tracking-tight">
                            <span className="text-2xl md:text-5xl xl:text-6xl font-black text-white drop-shadow-2xl">
                                <span className="text-[#FF3300]">N</span>otes <span className="text-[#FF3300]">S</span>ourced,
                            </span>
                            <span className="text-2xl md:text-5xl xl:text-6xl font-black text-white drop-shadow-2xl relative">
                                <span className="text-[#FF3300]">R</span>hythms <span className="text-[#FF3300]">L</span>iberated
                                <Sparkles className="absolute -top-2 -right-4 md:-top-3 md:-right-6 text-orange-500/80 w-3 h-3 md:w-5 md:h-5 animate-pulse-slow opacity-60" />
                            </span>
                        </h1>

                        <p className="text-white/60 text-[10px] md:text-base font-sans font-normal tracking-wide max-w-[18rem] md:max-w-[32rem] mx-auto leading-relaxed">
                            Enter a song name to visualize its rhythm.
                        </p>

                        {/* Split Input Box */}
                        <div className="relative w-full max-w-[20rem] md:max-w-[38rem] mx-auto">
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-orange-600/40 via-purple-600/40 to-blue-600/40 rounded-full blur-md opacity-30" />
                            <div className="relative flex items-center bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-full p-1 h-12 md:p-1.5 md:h-[4.5rem] shadow-2xl transition-all hover:bg-black group">
                                <div className="relative flex-[7] h-full flex items-center">
                                    <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVisualize()} className="w-full bg-transparent border-none outline-none text-white px-3 md:pl-6 text-sm md:text-lg font-sans placeholder-transparent z-10" spellCheck={false} />
                                    {!inputVal && (<div className="absolute left-3 md:left-6 pointer-events-none text-white/30 font-sans text-sm md:text-lg flex items-center tracking-wide z-0">{placeholderText}<span className="w-[2px] h-3 md:h-5 bg-[#FF3300] ml-1 animate-pulse" /></div>)}
                                </div>
                                <div className="w-[1px] h-6 md:h-8 bg-white/10 mx-1 md:mx-2 shrink-0" />
                                <input type="text" value={artistVal} onChange={(e) => setArtistVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVisualize()} className="flex-[3] min-w-0 bg-transparent border-none outline-none text-white/80 px-2 text-xs md:text-base font-sans placeholder-white/20" placeholder="Artist" spellCheck={false} />
                                <button onClick={handleVisualize} className="shrink-0 bg-white hover:bg-gray-200 text-black px-3 md:px-8 h-full rounded-full font-bold text-[10px] md:text-sm font-sans transition-transform active:scale-95 flex items-center gap-1 shadow-lg ml-1">Visualize <ArrowRight size={12} className="md:w-4 md:h-4" strokeWidth={3} /></button>
                            </div>
                        </div>
                    </div>
                    <PosterCard className="right-[5%] xl:right-[10%] -rotate-y-12" imgUrl="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop" delay={2} overlayColor="from-blue-500/20 to-purple-900/40" />
                </div>

                {/* 2. Loading State */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${status === 'analyzing' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8">
                        <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin" />
                        <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin-reverse" />
                        <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="text-white/50 animate-pulse" /></div>
                    </div>
                </div>

                {/* 3. Player View */}
                {status === 'player' && currentTrack && (
                    <PlayerView track={currentTrack} onReset={() => { setStatus('idle'); setInputVal(''); }} />
                )}
            </main>

            <style>{`
                @keyframes float-card { 0%, 100% { transform: perspective(1000px) rotateY(var(--tw-rotate-y, 0)) translateY(0) rotateX(3deg); } 50% { transform: perspective(1000px) rotateY(var(--tw-rotate-y, 0)) translateY(-25px) rotateX(3deg); } }
                @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                .animate-gradient-x { animation: gradient-x 8s ease infinite; }
                .rotate-y-12 { --tw-rotate-y: 12deg; }
                .-rotate-y-12 { --tw-rotate-y: -12deg; }
                .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-spin-reverse { animation: spin 2s linear infinite reverse; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; transform: translateY(20px); }
                @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
