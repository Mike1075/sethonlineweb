# 赛斯智慧网页版 - 项目需求文档 (PRD)

## 项目概述

### 项目名称
**赛斯智慧网页版 (Seth Wisdom Web)**

### 项目描述
一个基于现代Web技术的在线聊天平台，让用户可以与哲学家赛斯进行深度对话。采用蒸汽朋克风格设计，集成Supabase认证与数据存储、订阅管理、使用额度控制和Dify API流式聊天等功能。

### 核心价值
- 跨平台的智慧对话体验
- 深度探索意识、现实和存在的奥秘  
- 优雅的蒸汽朋克主题设计
- 流畅的实时聊天体验
- 多端同步的对话历史

---

## 技术架构

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Framer Motion
- **状态管理**: Zustand
- **UI组件**: Shadcn/ui + Radix UI

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth (支持多种登录方式)
- **实时通信**: Supabase Realtime
- **文件存储**: Supabase Storage

### 外部API
- **Dify API**: 对话生成服务
  - 基础URL: `https://pro.aifunbox.com/v1/chat-messages`
  - API密钥: `app-tEivDPsjZY6phvYSqscy9Cqr`
  - 支持流式响应 (Server-Sent Events)

### 部署环境
- **前端部署**: Vercel
- **CDN**: Vercel Edge Network
- **域名**: 自定义域名 + SSL

---

## 数据库设计 (Supabase)

### 用户表 (users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_tier TEXT DEFAULT 'free' CHECK (user_tier IN ('free', 'standard', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### 订阅表 (subscriptions)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('standard', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### 使用记录表 (usage_records)
```sql
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  message_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, year, month)
);
```

### 对话表 (conversations)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  dify_conversation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### 消息表 (messages)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_from_user BOOLEAN NOT NULL,
  is_complete BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

---

## 功能模块

### 1. 用户认证模块

**支持的登录方式**:
- 邮箱密码登录
- Google OAuth
- GitHub OAuth
- 微信登录 (通过第三方服务)
- QQ登录 (通过第三方服务)

**核心功能**:
```typescript
interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}
```

### 2. 订阅管理模块

**用户等级**:
- **免费版**: 15次/月
- **标准版**: 150次/月 (¥19.99/月)
- **尊享版**: 无限制 (¥49.99/月)

**核心功能**:
```typescript
interface SubscriptionStore {
  currentTier: UserTier
  subscription: Subscription | null
  loading: boolean
  
  upgrade: (tier: UserTier, paymentMethod: PaymentMethod) => Promise<void>
  cancel: () => Promise<void>
  renew: () => Promise<void>
  getUsageStats: () => Promise<UsageStats>
}
```

### 3. 支付集成

**国内支付**:
- 微信支付 (通过聚合支付平台)
- 支付宝 (通过聚合支付平台)
- 推荐使用: **Ping++ 或 BeeCloud**

**国际支付**:
- Stripe (信用卡)
- PayPal

**支付流程**:
```typescript
interface PaymentService {
  createPayment: (amount: number, currency: string, method: PaymentMethod) => Promise<PaymentIntent>
  confirmPayment: (paymentId: string) => Promise<PaymentResult>
  refund: (paymentId: string, amount?: number) => Promise<RefundResult>
}
```

### 4. 聊天对话模块

**核心功能**:
```typescript
interface ChatStore {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isStreaming: boolean
  
  createConversation: () => Promise<Conversation>
  sendMessage: (content: string) => Promise<void>
  streamResponse: (query: string) => AsyncGenerator<string>
  deleteConversation: (id: string) => Promise<void>
}
```

### 5. 实时通信

使用Supabase Realtime实现:
- 多设备消息同步
- 在线状态显示
- 实时对话更新

```typescript
// 订阅实时更新
const subscription = supabase
  .channel('conversations')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      // 处理新消息
    }
  )
  .subscribe()
```

---

## 用户界面设计

### 主题风格 (SethTheme)

**蒸汽朋克 + 现代Web设计**:
```css
:root {
  --primary: 210 20% 15%;        /* 深蓝灰 */
  --secondary: 30 35% 45%;       /* 古铜色 */
  --accent: 170 40% 42%;         /* 古铜绿 */
  --gold: 45 85% 60%;            /* 金色 */
  --background: 222 15% 7%;      /* 深色背景 */
  --foreground: 210 20% 95%;     /* 浅色文字 */
}
```

**特效组件**:
- 意识粒子动画 (Three.js)
- 能量波动效果 (Framer Motion)
- 打字机效果
- 神秘光晕
- 蒸汽朋克装饰元素

### 响应式布局

**桌面端 (≥1024px)**:
```
┌─────────────────────────────────────────┐
│ Header (导航 + 用户信息 + 额度显示)      │
├─────────────┬───────────────────────────┤
│ 侧边栏      │ 聊天区域                  │
│ - 对话历史  │ - 消息列表                │
│ - 新建对话  │ - 输入框                  │
│ - 设置     │ - 功能按钮                │
└─────────────┴───────────────────────────┘
```

**移动端 (<768px)**:
```
┌─────────────────────────────────┐
│ Header (折叠菜单)               │
├─────────────────────────────────┤
│                                 │
│ 聊天区域 (全屏)                │
│ - 消息列表                     │
│ - 输入框                       │
│                                 │
└─────────────────────────────────┘
```

### 核心页面

#### 1. 首页 (/dashboard)
- 欢迎消息
- 用户等级显示
- 剩余会话次数
- 最近对话
- 快速开始按钮

#### 2. 聊天页面 (/chat)
- 对话列表侧边栏
- 消息展示区域
- 流式响应显示
- 输入框和工具栏

#### 3. 订阅页面 (/subscription)
- 等级对比表
- 支付方式选择
- 当前订阅状态
- 使用统计图表

#### 4. 设置页面 (/settings)
- 个人资料编辑
- 主题设置
- 通知设置
- 数据导出

---

## 关键特性

### 1. 流式聊天体验

```typescript
async function* streamChatResponse(query: string) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader!.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        
        try {
          const parsed = JSON.parse(data)
          yield parsed.answer
        } catch (e) {
          console.error('Parse error:', e)
        }
      }
    }
  }
}
```

### 2. 智能会话管理

- 自动生成对话标题
- 智能会话归档
- 搜索历史消息
- 导出对话记录

### 3. 多语言支持

- 中文 (简体/繁体)
- 英文
- 国际化框架: next-i18next

### 4. PWA支持

- 离线缓存
- 桌面安装
- 推送通知
- 后台同步

---

## API设计

### RESTful API端点

```typescript
// 认证相关
POST /api/auth/signin
POST /api/auth/signup
POST /api/auth/signout
GET  /api/auth/user

// 对话相关
GET    /api/conversations
POST   /api/conversations
DELETE /api/conversations/:id
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages

// 订阅相关
GET  /api/subscription
POST /api/subscription/upgrade
POST /api/subscription/cancel

// 支付相关
POST /api/payment/create
POST /api/payment/confirm
POST /api/payment/webhook

// 使用统计
GET /api/usage/stats
POST /api/usage/record
```

### WebSocket连接

```typescript
// 实时消息
ws://domain.com/ws/chat/:conversationId

// 在线状态
ws://domain.com/ws/presence
```

---

## 部署架构

### 生产环境部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: seth-wisdom-web:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - DIFY_API_KEY=${DIFY_API_KEY}
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

### CDN配置

- 静态资源缓存
- 图片优化
- Gzip压缩
- HTTP/2支持

---

## 安全策略

### 1. 认证安全
- JWT令牌管理
- 刷新令牌机制
- 会话超时处理
- 多设备登录控制

### 2. API安全
- 请求频率限制
- CORS配置
- XSS防护
- CSRF保护

### 3. 数据安全
- Row Level Security (RLS)
- 数据加密存储
- 敏感信息脱敏
- 定期安全审计

---

## 性能优化

### 1. 前端优化
- 代码分割 (Code Splitting)
- 懒加载 (Lazy Loading)
- 图片优化 (Next.js Image)
- 缓存策略 (SWR)

### 2. 数据库优化
- 索引优化
- 查询缓存
- 连接池管理
- 读写分离

### 3. 网络优化
- HTTP/2服务器推送
- 资源预加载
- 请求合并
- 压缩传输

---

## 监控与分析

### 1. 性能监控
- **工具**: Vercel Analytics + Sentry
- **指标**: 页面加载时间、API响应时间、错误率

### 2. 用户行为分析
- **工具**: Google Analytics 4
- **跟踪**: 页面访问、功能使用、转化漏斗

### 3. 业务指标
- 用户活跃度
- 订阅转化率
- 消息使用统计
- 收入报表

---

## 项目文件结构

```
seth-wisdom-web/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/             # 认证相关页面
│   │   ├── (dashboard)/        # 主要功能页面
│   │   ├── api/                # API路由
│   │   ├── globals.css         # 全局样式
│   │   └── layout.tsx          # 根布局
│   ├── components/             # 可复用组件
│   │   ├── ui/                 # 基础UI组件
│   │   ├── chat/               # 聊天相关组件
│   │   ├── auth/               # 认证组件
│   │   └── subscription/       # 订阅组件
│   ├── hooks/                  # 自定义hooks
│   ├── lib/                    # 工具函数
│   │   ├── supabase/          # Supabase客户端
│   │   ├── auth/              # 认证逻辑
│   │   ├── payment/           # 支付服务
│   │   └── utils.ts           # 通用工具
│   ├── store/                  # 状态管理
│   │   ├── auth.ts            # 认证状态
│   │   ├── chat.ts            # 聊天状态
│   │   └── subscription.ts    # 订阅状态
│   └── types/                  # TypeScript类型定义
├── public/                     # 静态资源
├── database/                   # 数据库迁移文件
├── docker/                     # Docker配置
└── docs/                       # 项目文档
```

---

## 开发计划

### Phase 1: MVP (4-6周)
- [x] 基础聊天功能
- [x] 用户认证 (邮箱+OAuth)
- [x] 基础订阅管理
- [x] Supabase集成
- [x] 响应式UI

### Phase 2: 增强版 (2-3周)
- [ ] 支付集成 (微信/支付宝)
- [ ] 对话历史管理
- [ ] 使用统计面板
- [ ] PWA支持

### Phase 3: 高级版 (2-3周)
- [ ] 多语言支持
- [ ] 高级主题系统
- [ ] 数据导出功能
- [ ] 管理后台

---

## 成本估算

### 月度运营成本
- **Supabase**: $25/月 (Pro计划)
- **Vercel**: $20/月 (Pro计划)
- **域名+SSL**: $15/年
- **支付通道**: 费率 2.5-3%
- **CDN流量**: 按用量计费

### 开发成本
- **前端开发**: 3-4周
- **后端API**: 2-3周
- **支付集成**: 1-2周
- **测试部署**: 1周

---

## 风险评估与缓解

### 技术风险
- **风险**: Dify API稳定性
- **缓解**: 实现备用API + 缓存机制

### 业务风险
- **风险**: 用户获取成本高
- **缓解**: 免费试用 + 推荐奖励

### 合规风险
- **风险**: 数据隐私法规
- **缓解**: GDPR合规 + 隐私政策

---

## 总结

这个网页版赛斯智慧平台将提供与iOS版本功能对等的体验，同时利用Web技术的优势实现跨平台访问。通过Supabase的强大后端服务和现代前端技术栈，我们可以快速构建一个功能完整、性能优秀的产品。

关键成功因素：
1. **技术选型恰当**: Next.js + Supabase + TypeScript
2. **用户体验优秀**: 流式聊天 + 响应式设计
3. **商业模式清晰**: 订阅制 + 多种支付方式
4. **可扩展架构**: 模块化设计，便于迭代

此PRD涵盖了从技术实现到商业运营的全方位考虑，为项目的成功实施提供了详细的指导。