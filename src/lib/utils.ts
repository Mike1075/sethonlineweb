import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化日期
export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd HH:mm') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: zhCN })
}

// 相对时间格式化
export function formatRelativeTime(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: zhCN 
  })
}

// 生成随机ID
export function generateId(prefix: string = '') {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${randomStr}`
}

// 截断文本
export function truncateText(text: string, maxLength: number = 50) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('密码至少需要8个字符')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码需要包含至少一个大写字母')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码需要包含至少一个小写字母')
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码需要包含至少一个数字')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 格式化货币
export function formatCurrency(amount: number, currency: string = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// 计算消息使用百分比
export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit === -1) return 0 // 无限制
  return Math.min((used / limit) * 100, 100)
}

// 获取使用状态颜色
export function getUsageStatusColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-500'
  if (percentage >= 70) return 'text-orange-500'
  if (percentage >= 50) return 'text-yellow-500'
  return 'text-green-500'
}

// 深拷贝对象
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 生成对话标题
export function generateConversationTitle(message: string): string {
  // 清理消息，去除多余的空白字符
  const cleanMessage = message.trim().replace(/\s+/g, ' ')
  
  // 如果消息太短，直接返回
  if (cleanMessage.length <= 20) return cleanMessage
  
  // 尝试找到第一个句号、问号或感叹号
  const sentences = cleanMessage.split(/[。！？.!?]/)
  if (sentences.length > 0 && sentences[0].length <= 30) {
    return sentences[0].trim()
  }
  
  // 否则截断到合适长度
  return truncateText(cleanMessage, 25)
}

// 检查是否为移动设备
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}

// 获取月份的第一天和最后一天
export function getMonthRange(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  return { firstDay, lastDay }
}

// 检查是否需要重置月度使用量
export function shouldResetUsage(lastReset: string): boolean {
  const lastResetDate = new Date(lastReset)
  const now = new Date()
  
  return (
    lastResetDate.getFullYear() !== now.getFullYear() ||
    lastResetDate.getMonth() !== now.getMonth()
  )
}

// 安全的JSON解析
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return defaultValue
  }
}

// 等待指定时间
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 重试机制
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      await sleep(delay * attempt) // 指数退避
    }
  }
  
  throw lastError!
}