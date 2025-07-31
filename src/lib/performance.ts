/**
 * 性能监控和优化工具
 */

// 性能监控类
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 开始性能测量
  startMeasure(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-start`)
    }
  }

  // 结束性能测量
  endMeasure(name: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      const measure = performance.getEntriesByName(name, 'measure')[0]
      const duration = measure?.duration || 0
      
      // 记录性能数据
      const metrics = this.metrics.get(name) || []
      metrics.push(duration)
      this.metrics.set(name, metrics.slice(-10)) // 只保留最近10次记录
      
      return duration
    }
    return 0
  }

  // 获取平均性能
  getAverageTime(name: string): number {
    const metrics = this.metrics.get(name) || []
    if (metrics.length === 0) return 0
    
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length
  }

  // 报告性能数据
  getPerformanceReport(): Record<string, { average: number; count: number }> {
    const report: Record<string, { average: number; count: number }> = {}
    
    this.metrics.forEach((metrics, name) => {
      report[name] = {
        average: this.getAverageTime(name),
        count: metrics.length
      }
    })
    
    return report
  }
}

// 缓存管理类
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private static instance: CacheManager

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // 设置缓存
  set(key: string, data: any, ttl: number = 300000): void { // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // 删除缓存
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 清空缓存
  clear(): void {
    this.cache.clear()
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now()
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    })
  }

  // 获取缓存统计
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// 懒加载图片
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    })
    
    observer.observe(img)
  } else {
    // 降级处理
    img.src = src
  }
}

// 预加载关键资源
export function preloadResource(href: string, as: string = 'fetch'): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
}

// Web Vitals 监控
export function measureWebVitals(): void {
  if (typeof window !== 'undefined') {
    // 测量 FCP (First Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime)
        }
      }
    })
    
    observer.observe({ entryTypes: ['paint'] })
    
    // 测量 LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    })
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
  }
}

// 全局实例
export const performanceMonitor = PerformanceMonitor.getInstance()
export const cacheManager = CacheManager.getInstance()

// 定期清理缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup()
  }, 60000) // 每分钟清理一次
}