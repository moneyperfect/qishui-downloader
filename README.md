# Qishui Music Downloader (NSRL Labs)

> Notes Sourced, Rhythms Liberated.

一个现代化的汽水音乐下载工具，专为音频提取设计。

![Preview](https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop)

## 功能特性

- **🚀 极速下载**: 自动解析汽水音乐分享链接，直接提取音频流。
- **🎨 影像级 UI**: 基于 React + Tailwind CSS 构建的沉浸式界面。
- **🛡️ 隐私优先**: 文件直接回传至浏览器，无服务器端留存。
- **🔍 智能识别**: 支持从混杂文本中精确提取分享链接。

## 技术栈

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python, Flask
- **Core**: Custom Firecrawl Scraper Integration

## 快速开始

### 前置要求

- Python 3.8+
- Node.js 18+

### 安装

1. **克隆仓库**

```bash
git clone https://github.com/moneyperfect/qishui-downloader.git
cd qishui-downloader
```

2. **启动后端**

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务器 (Port 5000)
python server.py
```

3. **启动前端**

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (Port 5173)
npm run dev
```

4. **使用**

打开浏览器访问 `http://localhost:5173`，粘贴链接即可。

## 免责声明

本项目仅供学习交流使用，请勿用于非法用途。下载的音频版权归原作者所有。
