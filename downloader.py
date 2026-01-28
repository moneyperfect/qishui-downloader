#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
汽水音乐下载器 - 核心模块
可被Flask API或命令行工具调用
"""

import requests
import re
import os
from pathlib import Path

# Firecrawl API Key
FIRECRAWL_API_KEY = "fc-2691637905224f68a0413a2aee577fdb"
DEFAULT_OUTPUT_DIR = "D:/抖音汽水/downloads"


def scrape_with_firecrawl(url, api_key=FIRECRAWL_API_KEY):
    """使用Firecrawl API抓取页面HTML"""
    firecrawl_api = "https://api.firecrawl.dev/v1/scrape"
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    
    payload = {
        'url': url,
        'formats': ['html'],
        'onlyMainContent': False,
    }
    
    try:
        response = requests.post(firecrawl_api, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'html' in data['data']:
                return data['data']['html']
        return None
    except Exception as e:
        print(f"抓取错误: {e}")
        return None


def extract_audio_url_from_html(html_content):
    """从HTML中提取音频URL"""
    if not html_content:
        return None
    
    # 方法1: 查找 --luna-view-player-- audio标签
    audio_pattern = r'<audio[^>]+id="--luna-view-player--"[^>]+src="([^"]+)"'
    match = re.search(audio_pattern, html_content)
    if match:
        return match.group(1).replace('&amp;', '&')
    
    # 方法2: 查找任何包含douyinvod的audio标签
    audio_pattern2 = r'<audio[^>]+src="([^"]*douyinvod[^"]+)"'
    match = re.search(audio_pattern2, html_content)
    if match:
        return match.group(1).replace('&amp;', '&')
    
    # 方法3: 直接搜索douyinvod URL
    url_pattern = r'https://[^\s"<>]+douyinvod\.com[^\s"<>]+'
    match = re.search(url_pattern, html_content)
    if match:
        return match.group(0).replace('&amp;', '&')
    
    return None


def extract_song_name(html_content):
    """从HTML中提取歌曲名称"""
    if not html_content:
        return "unknown_song"
    
    title_pattern = r'<title>《([^》]+)》'
    match = re.search(title_pattern, html_content)
    if match:
        return match.group(1).strip()
    
    return "unknown_song"


def download_audio_file(audio_url, filename, output_dir=DEFAULT_OUTPUT_DIR):
    """下载音频文件，返回结果字典"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.douyin.com/',
    }
    
    # 确保目录存在
    os.makedirs(output_dir, exist_ok=True)
    output_path = Path(output_dir) / filename
    
    try:
        response = requests.get(audio_url, headers=headers, stream=True, timeout=60)
        
        if response.status_code == 200:
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
            
            # 获取音频时长
            duration = None
            try:
                from mutagen import File
                audio = File(output_path)
                if audio and audio.info:
                    duration = audio.info.length
            except:
                pass
            
            return {
                'success': True,
                'filename': filename,
                'filepath': str(output_path),
                'size_bytes': downloaded,
                'size_mb': round(downloaded / 1024 / 1024, 2),
                'duration_seconds': duration,
                'is_preview': duration and duration < 35
            }
        else:
            return {
                'success': False,
                'error': f'下载失败，状态码: {response.status_code}'
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def download_from_url(share_url, output_dir=DEFAULT_OUTPUT_DIR):
    """
    主入口函数: 从分享链接下载音频
    返回结果字典
    """
    # 验证URL
    if not share_url or not share_url.startswith('http'):
        return {
            'success': False,
            'error': '无效的URL'
        }
    
    # 步骤1: 抓取页面
    html_content = scrape_with_firecrawl(share_url)
    if not html_content:
        return {
            'success': False,
            'error': '页面抓取失败，请检查URL是否正确'
        }
    
    # 步骤2: 提取音频URL
    audio_url = extract_audio_url_from_html(html_content)
    if not audio_url:
        return {
            'success': False,
            'error': '未找到音频URL，可能是页面结构变化或需要登录'
        }
    
    # 步骤3: 提取歌曲名称
    song_name = extract_song_name(html_content)
    
    # 确定文件格式
    file_ext = ".mp4"
    if 'mime_type=audio_mpeg' in audio_url:
        file_ext = ".mp3"
    
    filename = f"{song_name}{file_ext}"
    
    # 步骤4: 下载
    result = download_audio_file(audio_url, filename, output_dir)
    result['song_name'] = song_name
    result['audio_url'] = audio_url[:100] + '...'
    
    return result


# 命令行入口（可选）
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        url = sys.argv[1]
        result = download_from_url(url)
        print(result)
    else:
        print("使用方法: python downloader.py <分享链接>")
