#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
汽水音乐下载器 - Flask API 服务器
"""

from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
from downloader import download_from_url
import os
import re

app = Flask(__name__)
CORS(app)

# 使用临时目录或缓存目录
OUTPUT_DIR = "D:/抖音汽水/downloads"

def extract_url(text):
    """从文本中提取第一个HTTP/HTTPS链接"""
    if not text:
        return None
    # 匹配 http:// 或 https:// 开始，直到遇到空格或结束
    pattern = r'(https?://[^\s]+)'
    match = re.search(pattern, text)
    if match:
        return match.group(1)
    return text.strip() # 如果没找到正则，尝试原样返回（可能用户就是只输入了url但没带协议头? 暂定严格模式）

@app.route('/api/download', methods=['POST'])
def download():
    """
    下载音频API
    如果成功，直接返回文件流（触发浏览器下载）
    如果失败，返回JSON错误（前端需处理非200响应）
    """
    try:
        data = request.get_json()
        raw_input = data.get('url', '')
        
        # 1. 智能提取URL
        url = extract_url(raw_input)
        
        if not url or not url.startswith('http'):
             return jsonify({'success': False, 'error': '未找到有效的链接，请检查输入'}), 400
        
        print(f"处理链接: {url}")
        
        # 2. 执行下载
        result = download_from_url(url, OUTPUT_DIR)
        
        if result['success']:
            filepath = result['filepath']
            filename = result['filename']
            
            # 3. 返回文件流
            try:
                # 能够让前端获取文件名
                return send_file(
                    filepath,
                    as_attachment=True,
                    download_name=filename,
                    mimetype='audio/mp4' # 或根据实际情况判断
                )
            except Exception as e:
                return jsonify({'success': False, 'error': f'文件传输失败: {str(e)}'}), 500
        else:
            return jsonify({'success': False, 'error': result.get('error', '下载失败')}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
