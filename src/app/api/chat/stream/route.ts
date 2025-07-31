import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { validateMessage, chatRateLimiter } from '@/lib/validation'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 验证用户身份
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 检查速率限制
    if (!chatRateLimiter.isAllowed(session.user.id)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '无效的消息格式' },
        { status: 400 }
      )
    }

    // 验证最后一条消息
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      )
    }

    const validation = validateMessage(lastMessage.content)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || '消息内容无效' },
        { status: 400 }
      )
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 模拟AI响应（这里应该调用实际的AI服务）
          const response = await generateAIResponse(validation.sanitized)
          
          // 分块发送响应
          const chunks = response.split(' ')
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i] + (i < chunks.length - 1 ? ' ' : '')
            const data = JSON.stringify({ content: chunk })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            
            // 添加延迟以模拟流式响应
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          
          // 发送结束标记
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          
        } catch (error) {
          console.error('AI响应生成失败:', error)
          const errorData = JSON.stringify({ 
            error: '生成响应时出现错误，请稍后重试' 
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('聊天API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 模拟AI响应生成（实际项目中应该调用真实的AI服务）
async function generateAIResponse(message: string): Promise<string> {
  // 这里应该调用实际的AI服务，比如OpenAI、Claude等
  // 现在返回一个模拟响应
  
  const responses = [
    `感谢您的问题："${message}"。作为赛斯智慧AI助手，我理解您的关注点。`,
    `关于您提到的"${message}"，这是一个很有意思的话题。让我为您详细分析一下。`,
    `您的问题"${message}"触及了一个重要的概念。从赛斯的智慧角度来看，我们可以这样理解：`,
    `针对"${message}"这个问题，我想分享一些深入的见解和建议。`,
  ]
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  
  // 添加一些通用的智慧内容
  const wisdomContent = [
    "每个人都拥有内在的智慧和创造力，关键是如何激发和运用它们。",
    "意识的力量远比我们想象的要强大，它能够塑造我们的现实体验。",
    "通过深入理解自己的信念系统，我们可以更好地掌控自己的人生方向。",
    "真正的成长来自于对内在自我的探索和理解。",
    "每个挑战都是一个学习和成长的机会，关键是如何看待和应对它们。"
  ]
  
  const randomWisdom = wisdomContent[Math.floor(Math.random() * wisdomContent.length)]
  
  return `${randomResponse}\n\n${randomWisdom}\n\n希望这个回答对您有所帮助。如果您还有其他问题，请随时告诉我。`
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}