'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { Menu, X, User, LogOut, Settings, Sparkles } from 'lucide-react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-seth-secondary/20 bg-seth-dark/90 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="consciousness-glow">
              <Sparkles className="h-8 w-8 text-seth-gold" />
            </div>
            <span className="text-xl font-bold gradient-text">
              赛斯智慧
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className="text-seth-light hover:text-seth-gold transition-colors"
            >
              首页
            </Link>
            <Link 
              href="/chat" 
              className="text-seth-light hover:text-seth-gold transition-colors"
            >
              对话
            </Link>
            <Link 
              href="/subscription" 
              className="text-seth-light hover:text-seth-gold transition-colors"
            >
              订阅
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm text-seth-light">
                  <div className="font-medium">{user.full_name || user.email}</div>
                  <div className="text-xs text-seth-accent capitalize">
                    {user.user_tier === 'free' ? '免费版' : 
                     user.user_tier === 'standard' ? '标准版' : '尊享版'}
                  </div>
                </div>
                
                <div className="relative group">
                  <Button variant="ghost" size="icon" className="consciousness-glow">
                    <User className="h-5 w-5" />
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 steampunk-border bg-seth-dark">
                    <div className="py-2">
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-seth-light hover:bg-seth-primary/20"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        设置
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-seth-light hover:bg-red-600/20"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        登出
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="ghost">登录</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="seth">注册</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-seth-secondary/20 py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-seth-light hover:text-seth-gold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link 
                href="/chat" 
                className="px-4 py-2 text-seth-light hover:text-seth-gold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                对话
              </Link>
              <Link 
                href="/subscription" 
                className="px-4 py-2 text-seth-light hover:text-seth-gold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                订阅
              </Link>
              {user && (
                <>
                  <Link 
                    href="/settings" 
                    className="px-4 py-2 text-seth-light hover:text-seth-gold transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    设置
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 text-left text-seth-light hover:text-red-400 transition-colors"
                  >
                    登出
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}