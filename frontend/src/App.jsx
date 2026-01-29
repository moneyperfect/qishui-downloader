import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { ArrowRight, Sparkles, RefreshCw, Share2, Play, Pause, Heart, Smartphone, Download, X } from 'lucide-react';

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

// --- Component: MobileOrbs (Mobile-only floating visual elements) ---
const MobileOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none md:hidden z-10">
        {/* Top-left floating ring */}
        <div
            className="absolute top-[15%] left-[8%] w-24 h-24 rounded-full border border-orange-500/30 animate-mobile-float"
            style={{ animationDelay: '0s' }}
        >
            <div className="absolute inset-2 rounded-full border border-orange-400/20 animate-pulse-slow" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-500/10 to-transparent blur-sm" />
        </div>

        {/* Top-right glow orb */}
        <div
            className="absolute top-[20%] right-[12%] w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-xl animate-mobile-float"
            style={{ animationDelay: '1s' }}
        />

        {/* Bottom-left pulsing dot */}
        <div
            className="absolute bottom-[25%] left-[15%] w-3 h-3 rounded-full bg-orange-400/60 animate-pulse shadow-[0_0_20px_rgba(255,100,0,0.4)]"
            style={{ animationDelay: '0.5s' }}
        />

        {/* Bottom-right floating ring */}
        <div
            className="absolute bottom-[30%] right-[10%] w-20 h-20 rounded-full border border-blue-500/20 animate-mobile-float"
            style={{ animationDelay: '2s' }}
        >
            <div className="absolute inset-3 rounded-full border border-purple-400/15" />
        </div>

        {/* Center-right small orb */}
        <div
            className="absolute top-[45%] right-[5%] w-2 h-2 rounded-full bg-white/40 animate-pulse-slow"
            style={{ animationDelay: '1.5s' }}
        />

        {/* Center-left accent glow */}
        <div
            className="absolute top-[50%] left-[5%] w-12 h-12 rounded-full bg-gradient-to-tr from-red-500/15 to-orange-500/10 blur-lg animate-mobile-float"
            style={{ animationDelay: '2.5s' }}
        />
    </div>
);

// --- Helper: Generate Vibe Description ---
const getVibeDescription = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('love') || t.includes('heart') || t.includes('kiss') || t.includes('romance'))
        return '心动时刻的浪漫絮语';
    if (t.includes('night') || t.includes('dark') || t.includes('moon') || t.includes('midnight'))
        return '深夜独处的温柔治愈';
    if (t.includes('sun') || t.includes('summer') || t.includes('happy') || t.includes('bright'))
        return '阳光洒落的明媚午后';
    if (t.includes('rain') || t.includes('sad') || t.includes('cry') || t.includes('tear'))
        return '雨天窗边的静谧思绪';
    if (t.includes('dance') || t.includes('party') || t.includes('club') || t.includes('beat'))
        return '律动灵魂的电子脉冲';
    if (t.includes('dream') || t.includes('sleep') || t.includes('cloud'))
        return '梦境边缘的轻柔呢喃';
    if (t.includes('fire') || t.includes('hot') || t.includes('burn'))
        return '燃烧激情的炽热旋律';
    const defaults = [
        '让旋律带走所有烦恼',
        '此刻只属于你的时光',
        '音乐是最好的陪伴',
        '沉浸在声音的海洋里'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
};

// --- Component: SharePoster Modal ---
const SharePoster = ({ track, onClose }) => {
    const posterRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [posterUrl, setPosterUrl] = useState(null);
    const [vibeText, setVibeText] = useState('生成氛围中...');
    const [vibeLoaded, setVibeLoaded] = useState(false);
    const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

    // Fetch AI-generated vibe description
    useEffect(() => {
        const fetchVibe = async () => {
            try {
                const response = await fetch('https://ipcgfdxhpypmfgqsyujh.supabase.co/functions/v1/generate-vibe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: track.title, artist: track.artist })
                });
                const data = await response.json();
                setVibeText(data.vibe || getVibeDescription(track.title));
            } catch (err) {
                console.error('AI vibe fetch failed:', err);
                setVibeText(getVibeDescription(track.title)); // Fallback to local
            }
            setVibeLoaded(true);
        };
        fetchVibe();
    }, [track]);

    const generatePoster = async () => {
        if (!posterRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(posterRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#020202'
            });
            const url = canvas.toDataURL('image/png');
            setPosterUrl(url);
        } catch (err) {
            console.error('Failed to generate poster:', err);
        }
        setIsGenerating(false);
    };

    const downloadPoster = () => {
        if (!posterUrl) return;
        const link = document.createElement('a');
        link.download = `NSRL_${track.title}_${today}.png`;
        link.href = posterUrl;
        link.click();
    };

    // Generate poster after vibe is loaded
    useEffect(() => {
        if (vibeLoaded) {
            generatePoster();
        }
    }, [vibeLoaded]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            {/* Close Button - More visible on mobile */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <X size={24} />
            </button>

            <div className="flex flex-col items-center gap-4 max-w-sm w-full">
                {/* Poster Preview - Ticket Stub Style */}
                <div
                    ref={posterRef}
                    className="w-full aspect-[3/4] rounded-xl overflow-hidden relative flex flex-col"
                    style={{ minHeight: '420px' }}
                >
                    {/* Blurred Cover Color Background */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: `linear-gradient(180deg, ${track.colors?.[0] || '#1a0a0a'} 0%, #0a0808 60%, #050505 100%)`
                        }}
                    />
                    <div
                        className="absolute inset-0 z-0 opacity-60"
                        style={{
                            backgroundImage: `url(${track.cover})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(60px) saturate(1.2)'
                        }}
                    />
                    {/* Noise overlay on poster */}
                    <div
                        className="absolute inset-0 z-[1] opacity-[0.12] mix-blend-overlay pointer-events-none"
                        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
                    />
                    {/* Vignette */}
                    <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

                    {/* Top Section: Vinyl Cover */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-8 pb-4">
                        {/* Album Art as Vinyl */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-black/30 rounded-full blur-2xl" />
                            <div
                                className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-black/30 relative"
                                style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                            >
                                <img
                                    src={track.cover}
                                    alt={track.title}
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                />
                                {/* Vinyl grooves overlay */}
                                <div
                                    className="absolute inset-0 opacity-20 pointer-events-none"
                                    style={{ background: 'repeating-radial-gradient(#000 0, #000 1px, transparent 2px, transparent 3px)' }}
                                />
                                {/* Center hole */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full border border-white/10" />
                            </div>
                        </div>

                        {/* Song Info */}
                        <div className="text-center mt-6 px-6">
                            <h3 className="text-xl font-serif font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
                                {track.title}
                            </h3>
                            <p className="mt-2 text-[10px] font-sans tracking-[0.2em] text-white/50 uppercase">
                                {track.artist}
                            </p>
                        </div>
                    </div>

                    {/* Middle Section: Highlight Lyric with typewriter style */}
                    <div className="relative z-10 px-6 py-4 flex-shrink-0">
                        <div className="border-t border-b border-white/10 py-4">
                            <p className="text-center text-sm text-white/80 font-mono italic leading-relaxed">
                                "{vibeText}"
                            </p>
                        </div>
                    </div>

                    {/* Bottom Section: QR + Branding */}
                    <div className="relative z-10 px-6 pb-5 flex items-center justify-between flex-shrink-0">
                        {/* Left: Tiny QR */}
                        <div className="flex items-center gap-2">
                            <div className="bg-white/90 p-0.5 rounded-sm">
                                <QRCodeSVG
                                    value="https://dl.leizhen2046.xyz"
                                    size={24}
                                    level="L"
                                    includeMargin={false}
                                />
                            </div>
                            <span className="text-[7px] text-white/40 font-sans">扫码体验</span>
                        </div>

                        {/* Right: Branding */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] tracking-[0.15em] text-white/40 font-sans">NSRL</span>
                            <span className="text-[6px] bg-[#FF3300] text-black font-bold px-1 py-0.5 rounded-[2px]">VISION</span>
                        </div>
                    </div>

                    {/* Ticket Stub Perforation Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] z-10"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 45%, white 45%, white 55%, transparent 55%, transparent 100%)',
                            backgroundSize: '8px 1px',
                            opacity: 0.15
                        }}
                    />
                </div>

                {/* Action Buttons - Two buttons side by side */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/10 text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors text-sm"
                    >
                        <X size={16} />
                        关闭
                    </button>
                    {isGenerating ? (
                        <div className="flex-1 py-3 bg-white/20 rounded-full text-center text-white/60 text-sm">
                            生成中...
                        </div>
                    ) : posterUrl ? (
                        <button
                            onClick={downloadPoster}
                            className="flex-1 py-3 bg-white text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors text-sm"
                        >
                            <Download size={16} />
                            保存图片
                        </button>
                    ) : (
                        <button
                            onClick={generatePoster}
                            className="flex-1 py-3 bg-white/20 text-white rounded-full font-medium hover:bg-white/30 transition-colors text-sm"
                        >
                            重新生成
                        </button>
                    )}
                </div>

                <p className="text-[10px] text-white/30 text-center">长按图片可直接保存</p>
            </div>
        </div>
    );
};

// --- Component: PlayerView (1:1 Restoration) ---
const PlayerView = ({ track, onReset }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showSharePoster, setShowSharePoster] = useState(false);
    const [likeToast, setLikeToast] = useState('');
    const audioRef = useRef(null);

    // Check if song is already liked on mount
    const getLikedSongs = () => {
        try {
            return JSON.parse(localStorage.getItem('likedSongs') || '[]');
        } catch { return []; }
    };

    const [isLiked, setIsLiked] = useState(() => {
        const liked = getLikedSongs();
        return liked.some(s => s.title === track.title && s.artist === track.artist);
    });

    // Handle like toggle with localStorage persistence
    const handleLike = () => {
        const liked = getLikedSongs();
        const songKey = { title: track.title, artist: track.artist, cover: track.cover };

        if (isLiked) {
            // Remove from liked
            const updated = liked.filter(s => !(s.title === track.title && s.artist === track.artist));
            localStorage.setItem('likedSongs', JSON.stringify(updated));
            setIsLiked(false);
            setLikeToast('已取消收藏');
        } else {
            // Add to liked
            liked.push({ ...songKey, likedAt: new Date().toISOString() });
            localStorage.setItem('likedSongs', JSON.stringify(liked));
            setIsLiked(true);
            setLikeToast('已收藏到喜欢');
        }

        // Clear toast after 2s
        setTimeout(() => setLikeToast(''), 2000);
    };

    // Auto Play + Media Session API for background playback
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.8;
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Auto-play failed:", err));
        }

        // Register Media Session for lock screen / notification controls
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title || 'Unknown Title',
                artist: track.artist || 'Unknown Artist',
                album: 'NSRL Vision',
                artwork: [
                    { src: track.cover, sizes: '96x96', type: 'image/jpeg' },
                    { src: track.cover, sizes: '128x128', type: 'image/jpeg' },
                    { src: track.cover, sizes: '192x192', type: 'image/jpeg' },
                    { src: track.cover, sizes: '256x256', type: 'image/jpeg' },
                    { src: track.cover, sizes: '384x384', type: 'image/jpeg' },
                    { src: track.cover, sizes: '512x512', type: 'image/jpeg' },
                ]
            });

            // Play/Pause handlers for system media controls
            navigator.mediaSession.setActionHandler('play', () => {
                audioRef.current?.play();
                setIsPlaying(true);
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                audioRef.current?.pause();
                setIsPlaying(false);
            });
            navigator.mediaSession.setActionHandler('stop', () => {
                audioRef.current?.pause();
                setIsPlaying(false);
                onReset();
            });
            // Seek handlers (for systems that support seek bar in notification)
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (audioRef.current && details.seekTime !== undefined) {
                    audioRef.current.currentTime = details.seekTime;
                }
            });
        }

        return () => {
            if (audioRef.current) audioRef.current.pause();
            // Clear media session handlers on unmount
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('stop', null);
                navigator.mediaSession.setActionHandler('seekto', null);
            }
        };
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

    // iTunes returns full URL, no proxy needed
    const audioSource = track.audioSrc;

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

                    {/* Mobile Ambient Effects - Floating orbs and rings */}
                    <div className={`md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[95vw] pointer-events-none z-10 transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}>
                        {/* Expanding pulse rings */}
                        <div className={`absolute inset-[5%] rounded-full border border-white/10 ${isPlaying ? 'animate-ping-slow' : ''}`} style={{ animationDuration: '3s' }} />
                        <div className={`absolute inset-[15%] rounded-full border border-orange-500/15 ${isPlaying ? 'animate-ping-slow' : ''}`} style={{ animationDuration: '4s', animationDelay: '1s' }} />

                        {/* Floating ambient dots */}
                        <div className="absolute top-[10%] left-[20%] w-2 h-2 rounded-full bg-orange-400/60 animate-mobile-float shadow-[0_0_15px_rgba(255,100,0,0.4)]" style={{ animationDelay: '0s' }} />
                        <div className="absolute top-[15%] right-[15%] w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-mobile-float shadow-[0_0_10px_rgba(147,51,234,0.3)]" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute bottom-[20%] left-[15%] w-1 h-1 rounded-full bg-white/50 animate-mobile-float" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-[15%] right-[20%] w-2.5 h-2.5 rounded-full bg-orange-300/40 animate-mobile-float shadow-[0_0_20px_rgba(255,150,50,0.3)]" style={{ animationDelay: '1.5s' }} />
                        <div className="absolute top-[50%] left-[5%] w-1.5 h-1.5 rounded-full bg-purple-300/40 animate-mobile-float" style={{ animationDelay: '2s' }} />
                        <div className="absolute top-[40%] right-[8%] w-1 h-1 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: '0.3s' }} />

                        {/* Soft glow accents */}
                        <div className="absolute top-[25%] left-[10%] w-8 h-8 rounded-full bg-gradient-radial from-orange-500/20 to-transparent blur-md animate-pulse-slow" />
                        <div className="absolute bottom-[25%] right-[10%] w-10 h-10 rounded-full bg-gradient-radial from-purple-500/15 to-transparent blur-lg animate-pulse-slow" style={{ animationDelay: '2s' }} />
                    </div>

                    {/* The Full-Bleed Vinyl */}
                    <div className="relative w-[85vw] h-[85vw] md:w-[32rem] md:h-[32rem] rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-white/5 transition-transform duration-700"
                        style={{
                            animation: 'spin 12s linear infinite',
                            animationPlayState: isPlaying ? 'running' : 'paused'
                        }}>

                        {/* Cover Art */}
                        <img src={track.cover} alt="Cover" className="w-full h-full object-cover filter brightness-[0.9] contrast-[1.15]" />

                        {/* Texture: Repeating Radial Grooves */}
                        <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none mix-blend-overlay"
                            style={{
                                background: 'repeating-radial-gradient(#000 0, #000 2px, transparent 3px, transparent 4px)'
                            }} />

                        {/* Premium Vinyl Gloss Reflection */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-black/40 pointer-events-none" />

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

                    {/* Heart - saves to favorites */}
                    <button
                        onClick={handleLike}
                        className={`transition-all p-2 ${isLiked ? 'text-red-500 scale-110' : 'text-white/40 hover:text-white'}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    </button>

                    {/* Share */}
                    <button
                        onClick={() => setShowSharePoster(true)}
                        className="text-white/40 hover:text-white transition-colors p-2"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioSource}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                crossOrigin="anonymous"
            />

            {/* Like Toast Notification */}
            {likeToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 text-white text-sm animate-fade-in-up">
                    <span className="flex items-center gap-2">
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? 'text-red-500' : ''} />
                        {likeToast}
                    </span>
                </div>
            )}

            {/* Share Poster Modal */}
            {showSharePoster && (
                <SharePoster track={track} onClose={() => setShowSharePoster(false)} />
            )}
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

        const API_BASE = 'https://ipcgfdxhpypmfgqsyujh.supabase.co/functions/v1';
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
                    cover: data.cover,
                    audioSrc: data.audioSrc
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
            </div>

            {/* Global Film Grain Texture - Always on top */}
            <div
                className="fixed inset-0 z-50 pointer-events-none opacity-[0.08] mix-blend-overlay"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />

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
                    {/* Mobile-only floating orbs */}
                    <MobileOrbs />

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
                @keyframes mobile-float { 0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; } 50% { transform: translateY(-15px) scale(1.05); opacity: 0.9; } }
                .animate-mobile-float { animation: mobile-float 5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
