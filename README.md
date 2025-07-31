# 赛斯智慧网页版

> 跨越时空的智慧对话体验，深度探索意识、现实和存在的奥秘

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Mike1075/sethonlineweb)

## 项目简介

赛斯智慧是一个基于现代Web技术的在线聊天平台，让用户可以与哲学家赛斯进行深度对话。采用蒸汽朋克风格设计，集成了Supabase认证与数据存储、订阅管理、使用额度控制和Dify API流式聊天等功能。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **编程语言**: TypeScript
- **样式设计**: Tailwind CSS + Framer Motion
- **状态管理**: Zustand
- **UI组件**: Shadcn/ui + Radix UI
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI对话**: Dify API
- **支付**: Stripe
- **部署**: Netlify

## 功能特性

### 🎯 核心功能
- ✅ 用户认证（邮箱/Google/GitHub登录）
- ✅ 流式AI对话体验
- ✅ 对话历史管理
- ✅ 订阅管理系统
- ✅ 使用额度控制
- ✅ 响应式设计

### 🎨 设计特色
- ✅ 蒸汽朋克主题风格
- ✅ 意识粒子动画效果
- ✅ 神秘光晕特效
- ✅ 流畅的交互动画

### 💳 用户等级
- **免费版**: 15次对话/月
- **标准版**: 150次对话/月 (¥19.99/月)
- **尊享版**: 无限对话 (¥49.99/月)

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 项目
- Dify API 密钥
- Stripe 账号（可选）

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/Mike1075/sethonlineweb.git
   cd sethonlineweb
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.local.example .env.local
   ```
   
   编辑 `.env.local` 文件，填入必要的配置：
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Dify API Configuration
   DIFY_API_KEY=your_dify_api_key
   DIFY_API_BASE_URL=https://pro.aifunbox.com/v1
   
   # Stripe Configuration (可选)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **初始化数据库**
   
   在 Supabase 控制台中执行 `database/init.sql` 文件中的SQL语句

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   
   打开 [http://localhost:3000](http://localhost:3000) 查看应用

## 部署到 Netlify

### 自动部署（推荐）

1. 点击上方的 "Deploy to Netlify" 按钮
2. 连接你的 GitHub 账号
3. 选择仓库并授权 Netlify 访问
4. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DIFY_API_KEY`
   - `DIFY_API_BASE_URL`
   - 其他可选变量
5. 点击 "Deploy site" 开始部署

### 手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **上传到 Netlify**
   - 将 `.next` 文件夹拖拽到 Netlify 控制台
   - 或使用 Netlify CLI 部署

## 数据库配置

### Supabase 设置

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中运行 `database/init.sql`
3. 在认证设置中启用所需的 OAuth 提供商
4. 配置 RLS (Row Level Security) 策略

### 必需的数据库表

- `users` - 用户信息
- `subscriptions` - 订阅信息
- `usage_records` - 使用记录
- `conversations` - 对话历史
- `messages` - 消息记录

## API 文档

### 认证相关
- `POST /api/auth/callback` - OAuth 回调处理

### 聊天相关
- `POST /api/chat/stream` - 流式对话API

### 用户相关
- `GET /api/usage/stats` - 获取用户使用统计

## 支付集成

### 国内支付
推荐使用聚合支付平台如 Ping++ 或 BeeCloud，支持：
- 微信支付
- 支付宝
- 银联支付

### 国际支付
使用 Stripe 支持：
- 信用卡支付
- Apple Pay / Google Pay
- 银行转账

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥 |
| `DIFY_API_KEY` | ✅ | Dify API 密钥 |
| `DIFY_API_BASE_URL` | ✅ | Dify API 基础 URL |
| `STRIPE_SECRET_KEY` | ❌ | Stripe 密钥（支付功能需要） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe 公开密钥 |
| `NEXT_PUBLIC_SITE_URL` | ❌ | 网站 URL（默认 localhost:3000） |

## 项目结构

```
seth-wisdom-web/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                # API 路由
│   │   ├── auth/               # 认证页面
│   │   ├── dashboard/          # 仪表板
│   │   ├── chat/               # 聊天页面
│   │   └── subscription/       # 订阅页面
│   ├── components/             # 可复用组件
│   │   ├── ui/                 # 基础 UI 组件
│   │   ├── chat/               # 聊天相关组件
│   │   ├── auth/               # 认证组件
│   │   └── layout/             # 布局组件
│   ├── hooks/                  # 自定义 hooks
│   ├── lib/                    # 工具函数
│   ├── store/                  # 状态管理
│   └── types/                  # TypeScript 类型
├── database/                   # 数据库脚本
├── public/                     # 静态资源
└── docs/                       # 项目文档
```

## 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### 提交规范
```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式化
refactor: 重构代码
test: 添加测试
chore: 构建工具更新
```

### 性能优化
- 使用 Next.js Image 组件优化图片
- 实现代码分割和懒加载
- 使用 SWR 进行数据缓存
- 启用 Gzip 压缩

## 常见问题

### Q: 如何配置自定义域名？
A: 在 Netlify 控制台的 Domain settings 中添加自定义域名并配置 DNS

### Q: 如何启用 HTTPS？
A: Netlify 自动提供 Let's Encrypt SSL 证书

### Q: 如何监控应用性能？
A: 可集成 Vercel Analytics 或 Google Analytics

### Q: 如何处理大量并发？
A: Supabase 和 Netlify 都支持自动扩容

## 技术支持

如果你在使用过程中遇到问题，可以：

1. 查看 [Issues](https://github.com/Mike1075/sethonlineweb/issues) 了解已知问题
2. 提交新的 [Issue](https://github.com/Mike1075/sethonlineweb/issues/new) 报告问题
3. 查看项目文档获取更多信息

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 更新日志

### v0.1.0 (2024-07-31)
- ✅ 项目初始化
- ✅ 基础认证系统
- ✅ 聊天功能实现
- ✅ 订阅管理
- ✅ UI/UX 设计
- ✅ Netlify 部署配置

---

**赛斯智慧** - 探索意识的无限可能 ✨# 部署修复完成
# 赛斯智慧网站 - 部署完成 ✨
