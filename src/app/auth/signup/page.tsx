'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { Github, Mail } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName) {
      setError('请填写所有必填字段')
      return
    }

    if (password !== confirmPassword) {
      setError('密码确认不匹配')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signUp(email, password, fullName)
      router.push('/chat')
    } catch (error: any) {
      setError(error.message || '注册失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message || 'Google登录失败')
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub()
    } catch (error: any) {
      setError(error.message || 'GitHub登录失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-seth-dark via-seth-primary to-seth-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-seth-dark/80 border-seth-secondary/20 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-seth-light">
              创建账户
            </CardTitle>
            <p className="text-seth-light/70">
              开始您的赛斯智慧之旅
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="姓名"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-seth-primary/20 border-seth-secondary/30 text-seth-light placeholder:text-seth-light/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-seth-primary/20 border-seth-secondary/30 text-seth-light placeholder:text-seth-light/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-seth-primary/20 border-seth-secondary/30 text-seth-light placeholder:text-seth-light/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-seth-primary/20 border-seth-secondary/30 text-seth-light placeholder:text-seth-light/50"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-seth-accent hover:bg-seth-accent/80 text-seth-dark"
                disabled={isLoading}
              >
                {isLoading ? '注册中...' : '创建账户'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-seth-secondary/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-seth-dark px-2 text-seth-light/50">或者</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="bg-seth-primary/20 border-seth-secondary/30 text-seth-light hover:bg-seth-secondary/20"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleGitHubSignIn}
                className="bg-seth-primary/20 border-seth-secondary/30 text-seth-light hover:bg-seth-secondary/20"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-seth-light/70">已经有账户？</span>{' '}
              <Link
                href="/auth/signin"
                className="text-seth-accent hover:text-seth-accent/80 font-medium"
              >
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 