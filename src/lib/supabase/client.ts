import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// 客户端组件使用
export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
})

// 直接客户端（用于非组件环境）
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          user_tier: 'free' | 'standard' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          user_tier?: 'free' | 'standard' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          user_tier?: 'free' | 'standard' | 'premium'
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'standard' | 'premium'
          status: 'active' | 'canceled' | 'expired'
          current_period_start: string
          current_period_end: string
          payment_method: string
          amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'standard' | 'premium'
          status: 'active' | 'canceled' | 'expired'
          current_period_start: string
          current_period_end: string
          payment_method: string
          amount: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'standard' | 'premium'
          status?: 'active' | 'canceled' | 'expired'
          current_period_start?: string
          current_period_end?: string
          payment_method?: string
          amount?: number
          currency?: string
          created_at?: string
        }
      }
      usage_records: {
        Row: {
          id: string
          user_id: string
          month: number
          year: number
          message_count: number
          last_reset: string
        }
        Insert: {
          id?: string
          user_id: string
          month: number
          year: number
          message_count?: number
          last_reset?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: number
          year?: number
          message_count?: number
          last_reset?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          dify_conversation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          dify_conversation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          dify_conversation_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          content: string
          is_from_user: boolean
          is_complete: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          content: string
          is_from_user: boolean
          is_complete?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          content?: string
          is_from_user?: boolean
          is_complete?: boolean
          created_at?: string
        }
      }
    }
  }
}