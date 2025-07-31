// 用户相关类型
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  user_tier: UserTier
  created_at: string
  updated_at: string
}

export type UserTier = 'free' | 'standard' | 'premium'

export interface UserTierInfo {
  name: string
  monthlyLimit: number
  price: number
  features: string[]
  stripePriceId?: string
}

// 对话相关类型
export interface Conversation {
  id: string
  user_id: string
  title: string | null
  dify_conversation_id: string | null
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  content: string
  is_from_user: boolean
  is_complete: boolean
  created_at: string
}

// 订阅相关类型
export interface Subscription {
  id: string
  user_id: string
  tier: UserTier
  status: 'active' | 'canceled' | 'expired'
  current_period_start: string
  current_period_end: string
  payment_method: string
  amount: number
  currency: string
  created_at: string
}

// 使用记录类型
export interface UsageRecord {
  id: string
  user_id: string
  month: number
  year: number
  message_count: number
  last_reset: string
}

export interface UsageStats {
  currentUsage: number
  monthlyLimit: number
  remainingMessages: number
  resetDate: string
}

// API相关类型
export interface DifyStreamResponse {
  event: string
  answer: string
  conversation_id: string
  message_id: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 支付相关类型
export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export interface PaymentResult {
  success: boolean
  payment_id: string
  error?: string
}

// UI相关类型
export interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isStreaming: boolean
  streamingMessage: string
  error: string | null
}

export interface AuthState {
  user: User | null
  session: any
  loading: boolean
  error: string | null
}

export interface SubscriptionState {
  subscription: Subscription | null
  tier: UserTier
  usage: UsageStats | null
  loading: boolean
  error: string | null
}

// 表单类型
export interface SignInForm {
  email: string
  password: string
}

export interface SignUpForm {
  email: string
  password: string
  fullName: string
}

export interface ProfileForm {
  full_name: string
  avatar_url?: string
}

// 常量类型
export const USER_TIER_INFO: Record<UserTier, UserTierInfo> = {
  free: {
    name: '免费版',
    monthlyLimit: 15,
    price: 0,
    features: ['15次对话/月', '基础聊天功能', '对话历史保存'],
  },
  standard: {
    name: '标准版',
    monthlyLimit: 150,
    price: 19.99,
    features: ['150次对话/月', '优先响应速度', '高级对话功能', '导出对话记录'],
    stripePriceId: 'price_standard_monthly',
  },
  premium: {
    name: '尊享版',
    monthlyLimit: -1, // -1 表示无限制
    price: 49.99,
    features: ['无限对话', '最快响应速度', '所有高级功能', '优先客服支持', '定制主题'],
    stripePriceId: 'price_premium_monthly',
  },
}

// 应用配置类型
export interface AppConfig {
  name: string
  description: string
  version: string
  supportEmail: string
  features: {
    enablePayments: boolean
    enableAnalytics: boolean
    enablePWA: boolean
  }
}

// 错误类型
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// 导出所有类型
export type {
  // 可以添加更多类型导出
}