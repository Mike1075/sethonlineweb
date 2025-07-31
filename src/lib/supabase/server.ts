import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './client'

// 服务器组件使用
export const createServerClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  })
}

// API路由使用
export const createRouteClient = () => {
  return createRouteHandlerClient<Database>({
    cookies,
  })
}