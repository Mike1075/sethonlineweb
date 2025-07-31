import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase/client'
import type { User, AuthState } from '@/types'

interface AuthStore extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      loading: false,
      error: null,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          // 获取用户详细信息
          if (data.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (userError) {
              console.warn('获取用户信息失败:', userError)
            }

            set({
              user: userData || {
                id: data.user.id,
                email: data.user.email!,
                full_name: null,
                avatar_url: null,
                user_tier: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              session: data.session,
              loading: false,
            })
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        set({ loading: true, error: null })
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })

          if (error) throw error

          // 创建用户记录
          if (data.user) {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName,
                user_tier: 'free',
              })

            if (insertError) {
              console.warn('创建用户记录失败:', insertError)
            }

            set({
              user: {
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName,
                avatar_url: null,
                user_tier: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              session: data.session,
              loading: false,
            })
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      signOut: async () => {
        set({ loading: true })
        
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error

          set({
            user: null,
            session: null,
            loading: false,
            error: null,
          })
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      signInWithGoogle: async () => {
        set({ loading: true, error: null })
        
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) throw error
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      signInWithGitHub: async () => {
        set({ loading: true, error: null })
        
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) throw error
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) throw new Error('用户未登录')

        set({ loading: true, error: null })
        
        try {
          const { error } = await supabase
            .from('users')
            .update({
              ...data,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (error) throw error

          set({
            user: { ...user, ...data, updated_at: new Date().toISOString() },
            loading: false,
          })
        } catch (error: any) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      checkAuth: async () => {
        set({ loading: true })
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) throw error

          if (session?.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (userError) {
              console.warn('获取用户信息失败:', userError)
            }

            set({
              user: userData || {
                id: session.user.id,
                email: session.user.email!,
                full_name: null,
                avatar_url: null,
                user_tier: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              session,
              loading: false,
            })
          } else {
            set({
              user: null,
              session: null,
              loading: false,
            })
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
)