'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// 默认错误回退组件
function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center bg-seth-dark/80 border-seth-secondary/20">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-seth-light mb-2">
          出现了一些问题
        </h3>
        
        <p className="text-seth-light/70 mb-4">
          {error?.message || '应用程序遇到了意外错误，请尝试刷新页面。'}
        </p>
        
        <div className="space-y-2">
          <Button
            onClick={resetError}
            className="w-full bg-seth-accent hover:bg-seth-accent/80 text-seth-dark"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full border-seth-secondary/30 text-seth-light hover:bg-seth-secondary/20"
          >
            刷新页面
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-seth-light/50 cursor-pointer">
              错误详情 (开发模式)
            </summary>
            <pre className="mt-2 text-xs text-red-400 bg-seth-primary/20 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </Card>
    </div>
  )
}

// Hook 版本的错误边界
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack: string }) => {
    console.error('Error caught by error handler:', error, errorInfo)
    // 这里可以添加错误报告逻辑
  }
}