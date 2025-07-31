'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/lib/supabase/client'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // 初始检查认证状态
    checkAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkAuth()
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.setState({
            user: null,
            session: null,
            loading: false,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAuth])

  return <>{children}</>
}