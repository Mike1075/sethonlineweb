import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 检查用户认证
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 调用数据库函数获取使用统计
    const { data, error } = await supabase
      .rpc('get_user_usage_stats', { user_uuid: userId })
      .single()

    if (error) {
      console.error('Failed to get usage stats:', error)
      return NextResponse.json(
        { error: '获取使用统计失败' },
        { status: 500 }
      )
    }

    // 类型断言，确保data的类型
    const usageData = data as {
      current_usage: number
      monthly_limit: number
      user_tier: string
      reset_date: string
    }

    // 计算下次重置日期（下个月1号）
    const now = new Date()
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const usageStats = {
      currentUsage: usageData.current_usage || 0,
      monthlyLimit: usageData.monthly_limit === -1 ? null : usageData.monthly_limit, // null表示无限制
      remainingMessages: usageData.monthly_limit === -1 ? null : Math.max(0, usageData.monthly_limit - (usageData.current_usage || 0)),
      userTier: usageData.user_tier,
      resetDate: nextReset.toISOString(),
      usagePercentage: usageData.monthly_limit === -1 ? 0 : Math.min(((usageData.current_usage || 0) / usageData.monthly_limit) * 100, 100),
    }

    return NextResponse.json({
      success: true,
      data: usageStats,
    })

  } catch (error) {
    console.error('Usage stats API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}