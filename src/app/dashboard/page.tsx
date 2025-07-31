'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { MessageSquare, User, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-seth-dark via-seth-primary to-seth-dark flex items-center justify-center">
        <div className="text-seth-light">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-seth-dark via-seth-primary to-seth-dark">
      {/* Header */}
      <header className="border-b border-seth-secondary/20 bg-seth-dark/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-seth-light">赛斯智慧</h1>
            <div className="flex items-center space-x-4">
              <span className="text-seth-light/70">欢迎，{user.full_name || user.email}</span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="bg-seth-primary/20 border-seth-secondary/30 text-seth-light hover:bg-seth-secondary/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-seth-light mb-2">
              欢迎来到赛斯智慧
            </h2>
            <p className="text-seth-light/70 text-lg">
              与高维意识对话，探索存在的奥秘
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-seth-dark/80 border-seth-secondary/20 backdrop-blur-sm hover:border-seth-accent/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-seth-light">
                  <MessageSquare className="w-5 h-5 mr-2 text-seth-accent" />
                  开始对话
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-seth-light/70 mb-4">
                  与赛斯智慧AI开始深度对话，探索哲学、意识和现实的本质
                </p>
                <Link href="/chat">
                  <Button className="w-full bg-seth-accent hover:bg-seth-accent/80 text-seth-dark">
                    进入聊天
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-seth-dark/80 border-seth-secondary/20 backdrop-blur-sm hover:border-seth-accent/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-seth-light">
                  <User className="w-5 h-5 mr-2 text-seth-accent" />
                  个人资料
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-seth-light/70 mb-4">
                  查看和编辑您的个人信息，管理账户设置
                </p>
                <Button 
                  variant="outline" 
                  className="w-full bg-seth-primary/20 border-seth-secondary/30 text-seth-light hover:bg-seth-secondary/20"
                  disabled
                >
                  即将推出
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-seth-dark/80 border-seth-secondary/20 backdrop-blur-sm hover:border-seth-accent/30 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-seth-light">
                  <Settings className="w-5 h-5 mr-2 text-seth-accent" />
                  应用设置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-seth-light/70 mb-4">
                  自定义您的聊天体验，调整偏好设置
                </p>
                <Button 
                  variant="outline" 
                  className="w-full bg-seth-primary/20 border-seth-secondary/30 text-seth-light hover:bg-seth-secondary/20"
                  disabled
                >
                  即将推出
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* User Info */}
          <Card className="bg-seth-dark/80 border-seth-secondary/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-seth-light">账户信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-seth-light/70">邮箱</label>
                  <p className="text-seth-light">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-seth-light/70">姓名</label>
                  <p className="text-seth-light">{user.full_name || '未设置'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-seth-light/70">用户等级</label>
                  <p className="text-seth-light capitalize">
                    {user.user_tier === 'free' ? '免费用户' : 
                     user.user_tier === 'standard' ? '标准用户' : 
                     user.user_tier === 'premium' ? '高级用户' : user.user_tier}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-seth-light/70">注册时间</label>
                  <p className="text-seth-light">
                    {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 