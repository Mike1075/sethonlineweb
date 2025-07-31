import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { generateId, generateConversationTitle } from '@/lib/utils'
import type { ChatState, Conversation, Message } from '@/types'

interface ChatStore extends ChatState {
  // Actions
  loadConversations: (userId: string) => Promise<void>
  createConversation: (userId: string, firstMessage?: string) => Promise<Conversation>
  selectConversation: (conversation: Conversation | null) => Promise<void>
  sendMessage: (content: string, userId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>
  clearError: () => void
  resetChat: () => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversation: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  error: null,

  // Actions
  loadConversations: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      set({ conversations: data || [] })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  createConversation: async (userId: string, firstMessage?: string) => {
    try {
      const newConversation: Partial<Conversation> = {
        id: generateId('conv'),
        user_id: userId,
        title: firstMessage ? generateConversationTitle(firstMessage) : '新对话',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert(newConversation)
        .select()
        .single()

      if (error) throw error

      const conversation = data as Conversation
      
      set(state => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messages: [],
      }))

      return conversation
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  selectConversation: async (conversation: Conversation | null) => {
    set({ currentConversation: conversation, messages: [], error: null })

    if (conversation) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true })

        if (error) throw error

        set({ messages: data || [] })
      } catch (error: any) {
        set({ error: error.message })
      }
    }
  },

  sendMessage: async (content: string, userId: string) => {
    const { currentConversation } = get()
    let conversation = currentConversation

    // 如果没有当前对话，创建一个新的
    if (!conversation) {
      conversation = await get().createConversation(userId, content)
    }

    try {
      // 添加用户消息
      const userMessage: Partial<Message> = {
        id: generateId('msg'),
        conversation_id: conversation.id,
        user_id: userId,
        content,
        is_from_user: true,
        is_complete: true,
        created_at: new Date().toISOString(),
      }

      const { data: savedUserMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert(userMessage)
        .select()
        .single()

      if (userMessageError) throw userMessageError

      set(state => ({
        messages: [...state.messages, savedUserMessage as Message],
      }))

      // 开始流式响应
      set({ isStreaming: true, streamingMessage: '' })

      // 创建AI消息占位符
      const aiMessage: Partial<Message> = {
        id: generateId('msg'),
        conversation_id: conversation.id,
        user_id: userId,
        content: '',
        is_from_user: false,
        is_complete: false,
        created_at: new Date().toISOString(),
      }

      // 调用Dify API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          conversationId: conversation.dify_conversation_id,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      let difyConversationId = conversation.dify_conversation_id

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.answer) {
                fullResponse += parsed.answer
                set({ streamingMessage: fullResponse })
              }
              if (parsed.conversation_id && !difyConversationId) {
                difyConversationId = parsed.conversation_id
              }
            } catch (e) {
              console.error('解析流数据失败:', e)
            }
          }
        }
      }

      // 保存完整的AI响应
      aiMessage.content = fullResponse
      aiMessage.is_complete = true

      const { data: savedAiMessage, error: aiMessageError } = await supabase
        .from('messages')
        .insert(aiMessage)
        .select()
        .single()

      if (aiMessageError) throw aiMessageError

      // 更新对话的dify_conversation_id
      if (difyConversationId && !conversation.dify_conversation_id) {
        await supabase
          .from('conversations')
          .update({ dify_conversation_id: difyConversationId })
          .eq('id', conversation.id)

        set(state => ({
          currentConversation: state.currentConversation ? {
            ...state.currentConversation,
            dify_conversation_id: difyConversationId,
          } : null,
        }))
      }

      // 更新对话的更新时间
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id)

      set(state => ({
        messages: [...state.messages, savedAiMessage as Message],
        isStreaming: false,
        streamingMessage: '',
      }))

    } catch (error: any) {
      set({ 
        error: error.message, 
        isStreaming: false, 
        streamingMessage: '' 
      })
      throw error
    }
  },

  deleteConversation: async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (error) throw error

      set(state => ({
        conversations: state.conversations.filter(c => c.id !== conversationId),
        currentConversation: state.currentConversation?.id === conversationId 
          ? null 
          : state.currentConversation,
        messages: state.currentConversation?.id === conversationId 
          ? [] 
          : state.messages,
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  updateConversationTitle: async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      if (error) throw error

      set(state => ({
        conversations: state.conversations.map(c => 
          c.id === conversationId 
            ? { ...c, title, updated_at: new Date().toISOString() }
            : c
        ),
        currentConversation: state.currentConversation?.id === conversationId
          ? { ...state.currentConversation, title }
          : state.currentConversation,
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  resetChat: () => {
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      isStreaming: false,
      streamingMessage: '',
      error: null,
    })
  },

  addMessage: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message],
    }))
  },

  updateMessage: (messageId: string, updates: Partial<Message>) => {
    set(state => ({
      messages: state.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },
}))