import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// 动态导入聊天界面组件以提高性能
const ChatInterface = dynamic(() => import('@/components/chat/chat-interface'), {
  loading: () => <ChatLoadingSkeleton />,
  ssr: false
})

export const metadata: Metadata = {
  title: '智能对话 - 赛斯智慧',
  description: '与AI助手进行深度对话，获得智慧洞察',
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-seth-dark via-seth-primary to-seth-dark">
      <div className="container mx-auto h-screen flex flex-col">
        <header className="flex-shrink-0 border-b border-seth-secondary/20 bg-seth-dark/80 backdrop-blur-sm">
          <div className="px-4 py-3">
            <h1 className="text-xl font-semibold text-seth-light">智能对话</h1>
            <p className="text-sm text-seth-light/70">与赛斯智慧AI助手开始对话</p>
          </div>
        </header>
        
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <Suspense fallback={<ChatLoadingSkeleton />}>
              <ChatInterface className="h-full" />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

// 聊天加载骨架屏
function ChatLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {/* 模拟消息加载 */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-seth-secondary/30 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-seth-secondary/30 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-seth-secondary/30 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 输入区域骨架 */}
      <div className="flex-shrink-0 border-t border-seth-secondary/20 bg-seth-dark/80 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex space-x-2">
            <div className="flex-1 h-10 bg-seth-secondary/30 rounded animate-pulse" />
            <div className="w-10 h-10 bg-seth-secondary/30 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}