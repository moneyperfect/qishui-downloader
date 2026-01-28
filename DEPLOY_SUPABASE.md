# Supabase 部署指南

## 1. 准备工作

确保你已经注册了 [Supabase](https://supabase.com/) 并创建了一个新项目。

## 2. 设置环境变量

在你的 Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets 中添加：

- `FIRECRAWL_API_KEY`: `fc-xxxxxxxxxxxxxxxxxxxx` (你的 Firecrawl Key)

## 3. 部署 Function

在本项目根目录执行：

```bash
# 登录 Supabase
npx supabase login

# 部署 Function
npx supabase functions deploy download-track --project-ref <你的项目ID> --no-verify-jwt
```

## 4. 更新前端配置

1. 部署成功后，Supabase 会给你一个 URL，类似于 `https://abcd.supabase.co/functions/v1/download-track`。
2. 在 Vercel 的项目设置 (Settings -> Environment Variables) 中添加：
   - Key: `VITE_SUPABASE_FUNCTION_URL`
   - Value: 上面的 Function URL
3. 重新部署 Vercel 前端。

完成！现在你的下载器是完全 Serverless 的了。
