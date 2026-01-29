from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import uvicorn
import requests
from io import BytesIO
import colorgram
from typing import List

app = FastAPI(title="NSRL Vibe V2", description="Music Vibe Analysis API")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VisualizeRequest(BaseModel):
    query: str

class VisualizeResponse(BaseModel):
    title: str
    artist: str
    cover: str
    audioSrc: str
    colors: List[str]
    theme: str

def get_dominant_colors(image_url: str, num_colors=4) -> List[str]:
    """下载图片并提取主色调"""
    try:
        resp = requests.get(image_url, timeout=5)
        if resp.status_code != 200:
            return ['#333333', '#000000']
        
        image = BytesIO(resp.content)
        # colorgram 需要文件对象
        colors = colorgram.extract(image, num_colors)
        
        hex_colors = []
        for color in colors:
            rgb = color.rgb
            hex_colors.append(f"#{rgb.r:02x}{rgb.g:02x}{rgb.b:02x}")
            
        # 补足颜色
        while len(hex_colors) < 2:
            hex_colors.append('#333333')
            
        return hex_colors
    except Exception as e:
        print(f"Color extraction failed: {e}")
        return ['#555555', '#1a1a1a', '#000000']

def analyze_theme(title: str, hex_colors: List[str]) -> str:
    """根据歌名关键词或颜色判断主题"""
    title_lower = title.lower()
    
    # 1. 关键词优先
    if any(k in title_lower for k in ['night', 'moon', 'dark', 'cyber', 'neon']):
        return "Neon Cyberpunk"
    if any(k in title_lower for k in ['sun', 'summer', 'beach', 'happy', 'day']):
        return "Summer Nostalgia"
    if any(k in title_lower for k in ['rain', 'blue', 'sad', 'tear', 'ocean']):
        return "Melancholic Blue"
    if any(k in title_lower for k in ['love', 'heart', 'kiss', 'pink']):
        return "Romantic Haze"
        
    # 2. 颜色判断 (简单逻辑)
    return "AI Resonating..."

@app.post("/visualize", response_model=VisualizeResponse)
async def visualize(req: VisualizeRequest):
    print(f"Visualizing: {req.query}")
    
    # 1. yt-dlp 搜索 (使用 webm/opus 格式，更稳定)
    ydl_opts = {
        'format': 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
        'default_search': 'ytsearch1',
        'extract_flat': False,
        'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch1:{req.query}", download=False)
            
            if 'entries' in info:
                if not info['entries']:
                    raise HTTPException(status_code=404, detail="Song not found")
                video_data = info['entries'][0]
            else:
                video_data = info

            title = video_data.get('title', 'Unknown Title')
            artist = video_data.get('uploader', 'Unknown Artist')
            cover_url = video_data.get('thumbnail')
            audio_url = video_data.get('url')

            # 2. 提取颜色 (Vibe Analysis)
            print("Analyzing colors...")
            extracted_colors = get_dominant_colors(cover_url)
            
            # 3. 生成主题
            theme = analyze_theme(title, extracted_colors)

            # 4. 构建代理播放 URL
            # 这里的 host 必须是前端能访问到的地址。如果是局域网访问，建议让 Backend 自动识别或写死 IP
            # 为了简单，我们让前端去拼 IP，后端只返回相对路径或参数，或者这里直接用 /proxy-stream?url=...
            # 前端 fetch 时会自动带上 API Base
            proxy_endpoint = f"/proxy-stream?url={requests.utils.quote(audio_url)}"

            return  {
                "title": title,
                "artist": artist,
                "cover": cover_url,
                "audioSrc": proxy_endpoint, # 返回相对路径
                "colors": extracted_colors,
                "theme": theme
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/proxy-stream")
async def proxy_stream(url: str):
    """代理音频流，解决跨域和防盗链问题"""
    try:
        print(f"Proxying stream for: {url[:50]}...")
        def iterfile():
            # stream=True 是关键
            # headers={'User-Agent': ...} 有时候是必须的，yt-dlp 得到的 url 通常带有了签名
            with requests.get(url, stream=True) as r:
                r.raise_for_status()
                for chunk in r.iter_content(chunk_size=8192):
                    yield chunk
        
        # 即使无法获取 content-type, 默认为 audio/mp4 (m4a)
        # 增加 Accept-Ranges 投头支持拖拽? (Simple stream usually doesn't support seek unless server supports Range)
        return StreamingResponse(iterfile(), media_type="audio/mp4")
    except Exception as e:
        print(f"Proxy error: {e}")
        raise HTTPException(status_code=500, detail="Stream failed")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
