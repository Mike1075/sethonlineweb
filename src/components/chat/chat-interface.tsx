'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useAuthStore } from '@/store/auth-store'
import { Message } from '@/types'
import { validateMessage, chatRateLimiter } from '@/lib/validation'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { performanceMonitor, debounce } from '@/lib/performance'

interface ChatInterfaceProps {
  className?: string
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 防抖处理输入变化
  const debouncedSetInput = debounce((value: string) => {
    setInput(value)
  }, 100)
  
  const { messages, addMessage, clearMessages, updateMessage } = useChatStore()
  const { user } = useAuthStore()

  // 使用 useCallback 优化函数
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 使用 useMemo 优化消息渲染
  const renderedMessages = useMemo(() => {
    return messages.map((message) => (
      <MessageItem key={message.id} message={message} />
    ))
  }, [messages])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !user) return

    // 开始性能监控
    performanceMonitor.startMeasure('message-send')

    // 验证输入内容
    const validation = validateMessage(input)
    if (!validation.isValid) {
      alert(validation.error || '输入内容无效')
      return
    }

    // 检查速率限制
    if (!chatRateLimiter.isAllowed(user.id)) {
      alert('发送消息过于频繁，请稍后再试')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: validation.sanitized,
      conversation_id: '',
      user_id: user.id,
      is_from_user: true,
      is_complete: true,
      created_at: new Date().toISOString()
    }

    addMessage(userMessage)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      const assistantMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        conversation_id: '',
        user_id: user.id,
        is_from_user: false,
        is_complete: false,
        created_at: new Date().toISOString()
      }

      addMessage(assistantMessageObj)

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                assistantMessage += data.content
                updateMessage(assistantMessageObj.id, {
                  content: assistantMessage
                })
              }
            } catch (error) {
              console.error('解析流数据失败:', error)
            }
          }
        }
      }

      // 标记消息完成
      updateMessage(assistantMessageObj.id, {
        is_complete: true
      })

      // 结束性能监控
      const duration = performanceMonitor.endMeasure('message-send')
      console.log(`消息发送耗时: ${duration.toFixed(2)}ms`)

    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        conversation_id: '',
        user_id: user.id,
        is_from_user: false,
        is_complete: true,
        created_at: new Date().toISOString()
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, user, messages, addMessage, updateMessage])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            renderedMessages
          )}
          
          {isLoading && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="flex-shrink-0 border-t border-seth-secondary/20 bg-seth-dark/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              disabled={isLoading}
              className="flex-1 bg-seth-primary/20 border-seth-secondary/30 text-seth-light placeholder:text-seth-light/50"
              maxLength={1000}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-seth-accent hover:bg-seth-accent/80 text-seth-dark"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-xs text-seth-light/50 mt-2 text-center">
            按 Enter 发送消息 • 最多 1000 字符
          </div>
        </div>
      </div>
    </div>
  )
}

// 优化的消息组件
const MessageItem = ({ message }: { message: Message }) => {
  return (
    <div
      className={`flex items-start space-x-3 ${
        message.is_from_user ? 'justify-end' : 'justify-start'
      }`}
    >
      {!message.is_from_user && (
        <Avatar className="w-8 h-8 bg-seth-accent">
          <AvatarFallback>
            <Bot className="w-4 h-4 text-seth-dark" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <Card className={`max-w-[70%] p-4 ${
        message.is_from_user
          ? 'bg-seth-accent text-seth-dark'
          : 'bg-seth-dark/80 text-seth-light border-seth-secondary/20'
      }`}>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`text-xs mt-2 ${
          message.is_from_user 
            ? 'text-seth-dark/70' 
            : 'text-seth-light/50'
        }`}>
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </Card>

      {message.is_from_user && (
        <Avatar className="w-8 h-8 bg-seth-secondary">
          <AvatarFallback>
            <User className="w-4 h-4 text-seth-light" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

// 欢迎消息组件
const WelcomeMessage = () => (
  <div className="text-center py-12">
    <div className="w-16 h-16 rounded-full bg-seth-accent/20 flex items-center justify-center mx-auto mb-4">
      <Bot className="w-8 h-8 text-seth-accent" />
    </div>
    <h3 className="text-xl font-semibold text-seth-light mb-2">
      欢迎使用赛斯智慧
    </h3>
    <p className="text-seth-light/70 max-w-md mx-auto">
      我是您的AI智能助手，可以帮助您解答问题、提供建议和进行深度对话。请输入您的问题开始对话。
    </p>
  </div>
)

// 加载消息组件
const LoadingMessage = () => (
  <div className="flex items-start space-x-3">
    <Avatar className="w-8 h-8 bg-seth-accent">
      <AvatarFallback>
        <Bot className="w-4 h-4 text-seth-dark" />
      </AvatarFallback>
    </Avatar>
    <Card className="bg-seth-dark/80 text-seth-light border-seth-secondary/20 p-4">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-seth-accent rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-seth-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-seth-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm text-seth-light/70">正在思考...</span>
      </div>
    </Card>
  </div>
)