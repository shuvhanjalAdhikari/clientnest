'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, FileText } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

const SUGGESTED_PROMPTS = [
  'What documents have been uploaded?',
  'Summarize the latest project notes',
  'What are the pending tasks?',
]

export default function AssistantClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources ?? [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'The AI backend is not connected yet. Set up the FastAPI server to enable AI responses.',
        sources: [],
      }
      setMessages((prev) => [...prev, errorMessage])
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
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
            <h3 className="text-base font-medium text-neutral-900 mb-1">
              Ask anything about your work
            </h3>
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
                        {source}
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
          placeholder="Ask a question about your documents..."
          rows={1}
          className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none max-h-32 leading-relaxed"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${target.scrollHeight}px`
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>

    </div>
  )
}