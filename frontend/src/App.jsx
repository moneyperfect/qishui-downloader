import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Mic2, Music2, Drum, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// --- 1. 打字机 Hook ---
const useTypewriter = (phrases, typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);

    useEffect(() => {
        const i = loopNum % phrases.length;
        const fullText = phrases[i];

        const handleType = () => {
            setText(current =>
                isDeleting
                    ? fullText.substring(0, current.length - 1)
                    : fullText.substring(0, current.length + 1)
            );

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), pauseTime);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleType, isDeleting ? deletingSpeed : typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, phrases, typingSpeed, deletingSpeed, pauseTime]);

    return text;
};

// --- 2. 影像级海报组件 ---
const PosterCard = ({ className, imgUrl, rotateY, delay, overlayColor }) => (
    <div
        className={`absolute hidden lg:block w-56 h-[22rem] xl:w-64 xl:h-[26rem] rounded-[1.5rem] shadow-2xl transition-transform duration-1000 ${className}`}
        style={{
            transformStyle: 'preserve-3d',
            animation: `float-card 6s ease-in-out infinite ${delay}s`,
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8)'
        }}
    >
        <div className="absolute inset-0 bg-[#0a0a0a] p-2 rounded-[1.5rem] overflow-hidden transform-gpu border border-white/10">
            <img
                src={imgUrl}
                alt="Visual"
                className="w-full h-full object-cover rounded-[1rem] brightness-[0.9] contrast-[1.1] saturate-[1.2]"
            />
            <div className={`absolute inset-0 bg-gradient-to-b ${overlayColor} opacity-40 pointer-events-none rounded-[1rem] mix-blend-overlay`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none rounded-[1rem]" />
        </div>
    </div>
);

// --- 3. 辅助函数URL提取 ---
const extractUrl = (text) => {
    const match = text.match(/(https?:\/\/[^\s]+)/);
    return match ? match[0] : text.trim();
};

export default function App() {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [message, setMessage] = useState('');

    const placeholderText = useTypewriter([
        "Paste your Qishui link...",
        "https://qishui.douyin.com/...",
        "Isolate audio streams..."
    ]);

    const handleCreate = async () => {
        // 1. 自动提取 URL
        const cleanUrl = extractUrl(inputText);
        if (!cleanUrl) return;

        setIsLoading(true);
        setStatus('processing');
        setMessage('');

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: cleanUrl }),
            });

            // 检查 Content-Type 判断是文件流还是 JSON 错误
            const contentType = response.headers.get('content-type');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '下载失败');
            }

            // 2. 处理文件下载
            const blob = await response.blob();

            // 尝试从 Content-Disposition 获取文件名，没有则用默认
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `qishui_audio_${Date.now()}.mp4`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            // 创建临时下载链接并点击
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            setStatus('success');
            setMessage('下载已开始');
            // 不清空输入框，方便用户查看或复制
        } catch (err) {
            console.error('Download Error:', err);
            setStatus('error');
            setMessage(err.message || '连接服务器失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleCreate();
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#020202] font-sans text-white selection:bg-orange-500/30 selection:text-white">

            {/* --- 背景氛围 --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* 调整渐变位置以匹配截图：左上偏橙，右下偏紫/蓝 */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[80%] bg-gradient-to-br from-[#FF5500] via-[#8B0000] to-transparent blur-[160px] opacity-40" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[80%] bg-gradient-to-tl from-[#7928CA] via-[#1A0033] to-transparent blur-[160px] opacity-50" />

                {/* 噪点纹理 */}
                <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                }} />
            </div>

            {/* --- 左上角 Logo --- */}
            <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
                <span className="font-bold tracking-[0.15em] text-sm text-white/90">NSRL</span>
                <span className="text-[10px] bg-white/10 border border-white/10 text-orange-500 font-bold px-1.5 py-0.5 rounded-[4px] tracking-wide backdrop-blur-md">LABS</span>
            </div>

            {/* --- 主舞台 --- */}
            <main className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">

                {/* 左侧海报 */}
                <PosterCard
                    className="left-[6%] xl:left-[10%] rotate-y-12"
                    imgUrl="https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop"
                    rotateY={15}
                    delay={0}
                    overlayColor="from-orange-500/20 to-red-900/40"
                />

                {/* --- 中间文字内容 --- */}
                <div className="max-w-3xl text-center space-y-12 z-20 transform -translate-y-8">

                    {/* 主标题 - 还原截图: Notes Sourced, Rhythms Liberated */}
                    {/* 高亮单词首字母, 使用渐变色 */}
                    <h1 className="flex flex-col items-center justify-center leading-[1.1] tracking-tight font-bold">
                        <div className="text-4xl md:text-6xl xl:text-7xl text-white drop-shadow-2xl">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9966] to-[#FF5E62]">N</span>otes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9966] to-[#FF5E62]">S</span>ourced,
                        </div>
                        <div className="text-4xl md:text-6xl xl:text-7xl text-white drop-shadow-2xl mt-1 relative">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9966] to-[#FF5E62]">R</span>hythms <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9966] to-[#FF5E62]">L</span>iberated
                        </div>
                    </h1>

                    <p className="text-white/70 text-sm md:text-base font-normal tracking-wide max-w-[36rem] mx-auto leading-relaxed">
                        Paste your Qishui link below to isolate the audio stream directly from the source.
                    </p>

                    {/* --- 输入框组件 (调整为深色背景+白色按钮) --- */}
                    <div className="relative w-full max-w-[38rem] mx-auto group">
                        {/* 发光背景 */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-orange-500/30 via-purple-500/30 to-blue-500/30 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                        <div className={`relative flex items-center bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 h-[4rem] transition-all shadow-2xl ${isLoading ? 'opacity-80' : ''}`}>

                            <div className="flex-1 relative h-full flex items-center px-4">
                                {/* 打字机占位符 */}
                                {!inputText && (
                                    <div className="absolute left-6 pointer-events-none text-white/30 text-base flex items-center tracking-wide">
                                        {placeholderText}
                                        <span className="w-[1.5px] h-4 bg-orange-500 ml-1 animate-pulse" />
                                    </div>
                                )}

                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-transparent border-none outline-none text-white px-2 text-base placeholder-transparent"
                                    spellCheck={false}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Create 按钮 (白色药丸形状) */}
                            <button
                                onClick={handleCreate}
                                disabled={isLoading}
                                className="shrink-0 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-black px-6 h-[calc(100%-4px)] rounded-full font-bold text-sm transition-transform active:scale-95 flex items-center gap-2 shadow-lg"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin text-gray-600" />
                                ) : (
                                    <>
                                        Create
                                        <ArrowRight size={16} strokeWidth={2.5} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 状态消息 */}
                    <div className="h-6 flex justify-center">
                        {status === 'success' && (
                            <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-4 py-1.5 rounded-full text-sm border border-green-500/20 animate-fade-in-up">
                                <CheckCircle size={14} />
                                <span>Download started! Check your downloads folder.</span>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-1.5 rounded-full text-sm border border-red-500/20 animate-fade-in-up">
                                <AlertCircle size={14} />
                                <span>{message}</span>
                            </div>
                        )}
                    </div>

                </div>

                {/* 右侧海报 */}
                <PosterCard
                    className="right-[6%] xl:right-[10%] -rotate-y-12"
                    imgUrl="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop"
                    rotateY={-15}
                    delay={2}
                    overlayColor="from-blue-500/20 to-purple-900/40"
                />

            </main>

            <style>{`
        @keyframes float-card {
          0%, 100% { transform: perspective(1000px) rotateY(var(--tw-rotate-y, 0)) translateY(0) rotateX(3deg); }
          50% { transform: perspective(1000px) rotateY(var(--tw-rotate-y, 0)) translateY(-20px) rotateX(3deg); }
        }
        .rotate-y-12 { --tw-rotate-y: 12deg; }
        .-rotate-y-12 { --tw-rotate-y: -12deg; }
        input { caret-color: #f97316; } 
      `}</style>
        </div>
    );
}
