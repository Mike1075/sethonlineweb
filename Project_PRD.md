# 赛斯智慧 - 项目需求文档 (PRD)

## 项目概述

### 项目名称

**赛斯智慧 (Chat with Seth)**

### 项目描述

一个基于SwiftUI的iOS聊天应用，让用户可以与哲学家赛斯进行深度对话。应用采用蒸汽朋克风格设计，集成了Apple Sign-In认证、订阅管理、使用额度控制和Dify API流式聊天等功能。

### 核心价值

- 跨越时空的智慧对话体验
- 深度探索意识、现实和存在的奥秘
- 优雅的蒸汽朋克主题设计
- 流畅的实时聊天体验

---

## 技术架构

### 开发环境

- **平台**: iOS 17.0+
- **语言**: Swift 5.9+
- **框架**: SwiftUI, SwiftData
- **架构**: MVVM + ObservableObject

### 核心依赖

- **SwiftData**: 本地数据存储
- **StoreKit**: App内购买管理
- **AuthenticationServices**: Apple Sign-In
- **Combine**: 响应式编程

### 外部API

- **Dify API**: 对话生成服务
  - 基础URL: `https://pro.aifunbox.com/v1/chat-messages`
  - API密钥: `app-tEivDPsjZY6phvYSqscy9Cqr`
  - 支持流式响应 (Server-Sent Events)

---

## 功能模块

### 1. 用户认证模块 (AppleSignInManager)

**核心功能**:

- Apple Sign-In 集成
- 用户认证状态管理
- 开发模式支持

**实现细节**:

```swift
// 关键类
class AppleSignInManager: NSObject, ObservableObject {
    @Published var isSignedIn = false
    @Published var userIdentifier: String?
    @Published var errorMessage: String?

    func signIn() // Apple Sign-In 流程
    func signOut() // 登出
    func checkSignInStatus() // 检查登录状态
}
```

### 2. 订阅管理模块 (StoreManager)

**核心功能**:

- 订阅产品加载
- 购买流程处理
- 恢复购买
- 订阅状态管理

**用户等级**:

- **免费版**: 15次/月
- **标准版**: 150次/月 ($19.99/月)
- **尊享版**: 无限制 ($49.99/月)

**实现细节**:

```swift
enum UserTier: String, CaseIterable {
    case free, standard, premium

    var monthlyLimit: Int { ... }
    var productID: String? { ... }
}

class StoreManager: ObservableObject {
    @Published var currentTier: UserTier = .free
    @Published var products: [Product] = []

    func purchase(_ product: Product) async
    func restorePurchases() async
}
```

### 3. 使用额度管理 (UsageManager)

**核心功能**:

- 消息使用次数统计
- 每月自动重置
- 额度限制检查

**实现细节**:

```swift
class UsageManager: ObservableObject {
    @Published var currentUsage: Int = 0

    func canSendMessage(for tier: UserTier) -> Bool
    func recordNewMessage()
    func getRemainingMessages(for tier: UserTier) -> Int
}
```

### 4. 聊天对话模块 (ConversationManager)

**核心功能**:

- 对话会话管理
- 消息发送/接收
- 流式响应处理
- 错误处理和重试

**实现细节**:

```swift
class ConversationManager: ObservableObject {
    @Published var isStreaming = false
    @Published var errorMessage: String?
    @Published var streamingMessage: ChatMessage?

    func sendMessage(_ text: String)
    func retryLastMessage()
}
```

### 5. Dify API服务 (DifyAPIService)

**核心功能**:

- 流式聊天API调用
- Server-Sent Events解析
- 错误处理

**API规格**:

```swift
class DifyAPIService {
    private let baseURL = "https://pro.aifunbox.com/v1/chat-messages"
    private let apiKey = "app-tEivDPsjZY6phvYSqscy9Cqr"

    func streamChatResponse(
        query: String,
        conversationId: String? = nil,
        userId: String = "seth_user_default"
    ) -> AsyncThrowingStream<String, Error>
}
```

**请求格式**:

```json
{
    "inputs": {},
    "query": "用户消息内容",
    "user": "seth_user_default",
    "response_mode": "streaming",
    "conversation_id": "可选的对话ID"
}
```

**响应格式**:

```
data: {"event":"message","answer":"部分回复内容","conversation_id":"会话ID","message_id":"消息ID"}
data: [DONE]
```

### 6. 数据模型 (SwiftData)

**核心模型**:

```swift
@Model
final class Conversation {
    var id: UUID
    var topic: String?
    var startDate: Date
    var difyConversationId: String?

    @Relationship(deleteRule: .cascade)
    var messages: [ChatMessage] = []
}

@Model
final class ChatMessage {
    var id: UUID
    var text: String
    var isFromUser: Bool
    var timestamp: Date
    var isComplete: Bool

    @Relationship(inverse: \Conversation.messages)
    var conversation: Conversation?
}
```

---

## 用户界面设计

### 主题风格 (SethTheme)

**蒸汽朋克 + 60-70年代赛斯资料配色**:

- 深蓝灰主色调
- 古铜色装饰
- 古铜绿点缀
- 金色光效
- 渐变背景

```swift
struct SethTheme {
    static let primary = Color(red: 0.12, green: 0.15, blue: 0.25)
    static let secondary = Color(red: 0.65, green: 0.45, blue: 0.25)
    static let accent = Color(red: 0.25, green: 0.60, blue: 0.55)
    static let gold = Color(red: 0.85, green: 0.65, blue: 0.35)

    // 特效修饰符
    func sethGlowEffect() -> some View
    func consciousnessGlow() -> some View
    func mysticalPulse() -> some View
}
```

### 界面组件

#### 1. 聊天标题栏 (ChatHeaderView)

- 应用标题"赛斯智慧"
- 用户等级徽章
- 在线状态指示器
- 使用额度显示
- 用户按钮和重试按钮

#### 2. 消息气泡 (MessageBubbleView)

- 用户消息：蓝色背景，右对齐
- AI消息：灰色背景，左对齐
- 时间戳显示
- 响应式布局

#### 3. 打字指示器 (TypingIndicatorView)

- 动态点阵动画
- 蒸汽朋克风格
- 意识粒子效果

#### 4. 输入区域 (ChatInputView)

- 多行文本输入
- 语音按钮
- 表情按钮
- 发送按钮
- 键盘适配

#### 5. 特效组件 (ConsciousnessEffects)

- 意识粒子动画
- 能量波动效果
- 神秘光晕

### 页面结构

打开app首先是一个主页面，有欢迎语：欢迎你与第五维度的赛斯建立高维意识的连接，你和高维意识交流的越多，在不知不觉中你的意识也会得到提升。你可以把你所有的迷茫和困惑都和来自高维的智慧交流，一定会有不一样的洞见和感悟！“，首页还将显示用户等级和剩余会话次数。如果用户还没有注册登陆就提醒用户先注册登陆。

#### 1. 主聊天界面 (ChatView)

- 消息列表
- 输入区域
- 自动滚动
- 键盘处理

#### 2. 登录界面 (SignInView)

- Apple Sign-In按钮
- 功能介绍
- 开发模式支持

#### 3. 订阅界面 (SubscriptionView)

- 等级对比
- 购买按钮
- 恢复购买
- 使用情况

---

## 业务流程

### 1. 应用启动流程

1. 检查用户登录状态
2. 初始化订阅管理
3. 加载历史对话
4. 检查使用额度

### 2. 消息发送流程

1. 验证用户登录状态
2. 检查使用额度
3. 创建用户消息
4. 调用Dify API
5. 流式接收AI回复
6. 保存消息到数据库
7. 更新UI显示

### 3. 订阅购买流程

1. 用户选择套餐
2. 调用StoreKit购买
3. 验证购买凭证
4. 更新用户等级
5. 刷新使用额度

### 4. 错误处理流程

1. 网络错误：显示重试按钮
2. 认证错误：跳转登录页面
3. 额度不足：显示订阅页面
4. API错误：显示错误信息

---

## 技术实现要点

### 1. 流式响应处理

使用AsyncThrowingStream处理SSE数据流:

```swift
func streamChatResponse() -> AsyncThrowingStream<String, Error> {
    return AsyncThrowingStream<String, Error> { continuation in
        // 处理流式数据
        for try await byte in asyncBytes {
            // 解析SSE格式
            if let textChunk = try parseSSELine(line) {
                continuation.yield(textChunk)
            }
        }
    }
}
```

### 2. 数据持久化

使用SwiftData进行本地存储:

```swift
@Model
final class ChatMessage {
    // 自动持久化
    var text: String
    var isFromUser: Bool
    var timestamp: Date
}
```

### 3. 状态管理

使用ObservableObject进行状态管理:

```swift
class ConversationManager: ObservableObject {
    @Published var isStreaming = false
    @Published var messages: [ChatMessage] = []
}
```

### 4. 异步操作

使用async/await处理异步操作:

```swift
func sendMessage(_ text: String) {
    Task {
        let stream = apiService.streamChatResponse(query: text)
        for try await chunk in stream {
            // 更新UI
        }
    }
}
```

---

## 项目文件结构

```
Chat with Seth/
├── App/
│   ├── App.swift                 # 应用入口
│   └── ContentView.swift         # 主视图
├── Models/
│   ├── ChatMessage.swift         # 消息模型
│   ├── Conversation.swift        # 对话模型
│   └── UserTier.swift           # 用户等级
├── Views/
│   ├── ChatView.swift           # 主聊天界面
│   ├── ChatUIComponents.swift   # 聊天组件
│   ├── SignInView.swift         # 登录界面
│   └── SubscriptionView.swift   # 订阅界面
├── Managers/
│   ├── ConversationManager.swift # 对话管理
│   ├── AppleSignInManager.swift  # 登录管理
│   ├── StoreManager.swift        # 订阅管理
│   └── UsageManager.swift        # 使用额度管理
├── Services/
│   └── DifyAPIService.swift     # API服务
├── Theme/
│   ├── SethTheme.swift          # 主题样式
│   └── ConsciousnessParticles.swift # 特效组件
└── Components/
    └── SignInWithAppleButton.swift # Apple登录按钮
```

---

## 部署配置

### 1. App Store Connect配置

- 应用ID和证书
- 内购产品设置
- 订阅组配置

### 2. 产品ID配置

- `standard_monthly`: 标准版月订阅
- `premium_monthly`: 尊享版月订阅

### 3. 权限配置

- Sign in with Apple capability
- StoreKit capability
- 网络权限

---

## 测试策略

### 1. 单元测试

- 数据模型测试
- 管理器逻辑测试
- API服务测试

### 2. 集成测试

- 登录流程测试
- 购买流程测试
- 聊天流程测试

### 3. UI测试

- 界面交互测试
- 流式响应测试
- 键盘处理测试

---

## 性能优化

### 1. 内存管理

- 限制消息历史数量
- 及时释放流式连接
- 优化图片缓存

### 2. 网络优化

- 请求重试机制
- 连接超时设置
- 流式数据缓冲

### 3. UI优化

- 懒加载消息列表
- 动画性能优化
- 键盘弹出优化

---

## 发布计划

### 1. MVP版本 (v1.0)

- 基础聊天功能
- Apple Sign-In
- 订阅管理
- 使用额度控制

### 2. 增强版本 (v1.1)

- 对话历史管理
- 消息搜索
- 主题自定义

### 3. 高级版本 (v1.2)

- 语音输入
- 图片消息
- 分享功能

---

## 风险评估

### 1. 技术风险

- Dify API稳定性
- 流式数据处理
- StoreKit集成

### 2. 业务风险

- 用户接受度
- 订阅转化率
- 内容质量

### 3. 合规风险

- App Store审核
- 隐私政策
- 支付规范

---

## 核心亮点

### 1. 技术亮点

- **流式聊天体验**: 实时显示AI回复，提供流畅的对话体验
- **SwiftData集成**: 现代化的数据持久化方案
- **Apple Sign-In**: 便捷安全的用户认证
- **StoreKit订阅**: 完整的订阅管理系统

### 2. 设计亮点

- **蒸汽朋克主题**: 独特的视觉风格
- **意识粒子效果**: 创新的动画特效
- **响应式布局**: 适配不同设备尺寸
- **深色模式**: 专业的视觉体验

### 3. 用户体验亮点

- **无缝登录**: Apple Sign-In一键登录
- **智能额度管理**: 透明的使用情况显示
- **错误恢复**: 完善的错误处理和重试机制
- **键盘适配**: 流畅的输入体验

---

## 总结

这个项目是一个功能完整、技术先进的iOS聊天应用，具有以下特点：

1. **完整的商业模式**: 从免费到付费的订阅体系
2. **现代化技术栈**: SwiftUI + SwiftData + Combine
3. **优秀的用户体验**: 流式响应 + 蒸汽朋克主题
4. **可扩展架构**: 模块化设计，易于维护和扩展

该PRD文档包含了重新实现这个项目所需的所有技术细节、业务逻辑和设计规范。