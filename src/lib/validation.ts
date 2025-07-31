/**
 * 输入验证和数据清理工具函数
 */

// 清理和验证用户输入
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
    .replace(/\s+/g, ' ') // 合并多个空格
    .slice(0, 1000) // 限制长度
}

// 验证消息内容
export function validateMessage(content: string): {
  isValid: boolean
  error?: string
  sanitized: string
} {
  const sanitized = sanitizeInput(content)
  
  if (!sanitized) {
    return {
      isValid: false,
      error: '消息内容不能为空',
      sanitized
    }
  }
  
  if (sanitized.length < 1) {
    return {
      isValid: false,
      error: '消息内容太短',
      sanitized
    }
  }
  
  if (sanitized.length > 1000) {
    return {
      isValid: false,
      error: '消息内容超过1000字符限制',
      sanitized: sanitized.slice(0, 1000)
    }
  }
  
  // 检查是否包含恶意内容
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi
  ]
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(sanitized)) {
      return {
        isValid: false,
        error: '消息包含不安全内容',
        sanitized: sanitized.replace(pattern, '')
      }
    }
  }
  
  return {
    isValid: true,
    sanitized
  }
}

// 验证邮箱格式
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// 验证用户名
export function validateUsername(username: string): {
  isValid: boolean
  error?: string
} {
  const sanitized = sanitizeInput(username)
  
  if (!sanitized) {
    return { isValid: false, error: '用户名不能为空' }
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: '用户名至少需要2个字符' }
  }
  
  if (sanitized.length > 50) {
    return { isValid: false, error: '用户名不能超过50个字符' }
  }
  
  // 只允许字母、数字、中文和部分特殊字符
  const validPattern = /^[\w\u4e00-\u9fa5\-_.]+$/
  if (!validPattern.test(sanitized)) {
    return { isValid: false, error: '用户名只能包含字母、数字、中文、连字符、下划线和点' }
  }
  
  return { isValid: true }
}

// 转义HTML特殊字符
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 验证URL
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 限制请求频率的工具类
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1分钟
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // 清理过期的请求记录
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
  
  getResetTime(identifier: string): number {
    const requests = this.requests.get(identifier) || []
    if (requests.length === 0) return 0
    
    const oldestRequest = Math.min(...requests)
    return oldestRequest + this.windowMs
  }
}

// 全局速率限制器实例
export const chatRateLimiter = new RateLimiter(20, 60000) // 每分钟20条消息
export const authRateLimiter = new RateLimiter(5, 300000) // 每5分钟5次认证尝试