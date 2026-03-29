'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, FileText, Plus, MessageSquare, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { filename: string; similarity: number }[]
}

interface Conversation {
  id: string
  title: string
  created_at: string
}

const SUGGESTED_PROMPTS = [
  'What documents have been uploaded?',
  'Summarize the latest project notes',
  'What are the pending tasks?',
]

export default function AssistantClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loadingConvos, setLoadingConvos] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      if (authData.user) setUserId(authData.user.id)

      const { data: userData } = await supabase.from('users').select('workspace_id').single()
      if (!userData) return
      setWorkspaceId(userData.workspace_id)

      // Load all conversations
      const { data: convos } = await supabase
        .from('ai_conversations')
        .select('id, title, created_at')
        .eq('workspace_id', userData.workspace_id)
        .order('created_at', { ascending: false })

      if (convos && convos.length > 0) {
        setConversations(convos)
        // Auto-load the most recent conversation
        await loadConversation(convos[0].id)
        setConversationId(convos[0].id)
      }
      setLoadingConvos(false)
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversation(convId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('ai_messages')
      .select('id, role, content, sources')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          sources: m.sources ?? [],
        }))
      )
    }
    setConversationId(convId)
  }

  function startNewConversation() {
    setMessages([])
    setConversationId(null)
    setInput('')
    inputRef.current?.focus()
  }

async function deleteConversation(id: string, e: React.MouseEvent) {
  e.stopPropagation()
  const supabase = createClient()
  
  // Delete messages first, then the conversation
  await supabase.from('ai_messages').delete().eq('conversation_id', id)
  await supabase.from('ai_conversations').delete().eq('id', id)
  
  const updated = conversations.filter((c) => c.id !== id)
  setConversations(updated)
  if (conversationId === id) {
    if (updated.length > 0) {
      await loadConversation(updated[0].id)
    } else {
      setMessages([])
      setConversationId(null)
    }
  }
}

  async function getOrCreateConversation(firstMessage: string): Promise<string> {
    if (conversationId) return conversationId

    const supabase = createClient()
    const title = firstMessage.slice(0, 60)

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        title,
        scope_type: 'workspace',
        scope_id: workspaceId,
      })
      .select()
      .single()

    if (error) throw error
    setConversationId(data.id)
    setConversations((prev) => [data, ...prev])
    return data.id
  }

  async function saveMessages(
    convId: string,
    userContent: string,
    assistantContent: string,
    sources: { filename: string; similarity: number }[]
  ) {
    const supabase = createClient()
    await supabase.from('ai_messages').insert([
      { conversation_id: convId, role: 'user', content: userContent, sources: null },
      { conversation_id: convId, role: 'assistant', content: assistantContent, sources: sources.length > 0 ? sources : null },
    ])
  }

  async function handleSend() {
    if (!input.trim() || loading || !workspaceId) return

    const userContent = input.trim()
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userContent, workspace_id: workspaceId, match_count: 5 }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const sources = data.sources ?? []

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources,
      }

      setMessages((prev) => [...prev, assistantMessage])

      const convId = await getOrCreateConversation(userContent)
      await saveMessages(convId, userContent, data.answer, sources)

    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Could not reach the AI backend. Make sure the FastAPI server is running.',
        sources: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        <button
          onClick={startNewConversation}
          className="flex items-center gap-2 h-9 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors w-full"
        >
          <Plus size={15} />
          New conversation
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {loadingConvos ? (
            <div className="flex items-center justify-center h-20">
              <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center mt-4">No conversations yet</p>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => loadConversation(convo.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left w-full group transition-colors ${
                  conversationId === convo.id
                    ? 'bg-green-50 text-green-800'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                <MessageSquare size={13} className="flex-shrink-0 opacity-60" />
                <span className="text-xs flex-1 truncate">{convo.title}</span>
                <span
                  onClick={(e) => deleteConversation(convo.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">AI Assistant</h2>
            <p className="text-xs text-neutral-400">Ask questions about your documents and projects</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-green-700" />
              </div>
              <h3 className="text-base font-medium text-neutral-900 mb-1">Ask anything about your work</h3>
              <p className="text-sm text-neutral-400 mb-6 max-w-sm">
                I can answer questions based on your uploaded documents, projects, and tasks.
              </p>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                    className="text-left text-sm text-neutral-600 bg-white border border-neutral-200 rounded-lg px-4 py-3 hover:border-green-500 hover:text-green-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'user' ? (
                <div className="max-w-[80%] bg-neutral-900 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3">
                  {message.content}
                </div>
              ) : (
                <div className="max-w-[80%]">
                  <div className="bg-white border border-neutral-200 border-l-2 border-l-green-600 text-sm rounded-2xl rounded-tl-sm px-4 py-3 text-neutral-800 leading-relaxed">
                    {message.content}
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.sources.map((source, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1">
                          <FileText size={11} />
                          {source.filename}
                          <span className="text-neutral-300">·</span>
                          {Math.round(source.similarity * 100)}% match
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 border-l-2 border-l-green-600 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border border-neutral-200 rounded-xl p-3 flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={workspaceId ? 'Ask a question about your documents...' : 'Loading...'}
            disabled={!workspaceId}
            rows={1}
            className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none max-h-32 leading-relaxed disabled:opacity-50"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${target.scrollHeight}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !workspaceId}
            className="w-9 h-9 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}