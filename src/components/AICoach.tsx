import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuth } from './AuthContext'
import { projectId } from '../utils/supabase/info'
import { Send, Bot, User } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { MessageCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  message: string
  timestamp: string
}

interface AICoachProps {
  onBack?: () => void
}

export const AICoach: React.FC<AICoachProps> = ({ onBack }) => {
  const { accessToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/coach/history`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input
    if (!text.trim()) return

    setInput('')
    setLoading(true)

    // Add user message optimistically
    const userMessage: Message = {
      role: 'user',
      message: text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae791a35/coach/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ message: text }),
        }
      )

      const data = await response.json()
      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          message: data.response,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        toast.error('Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    "What should I eat today?",
    "Suggest a workout",
    "Why am I not losing weight?",
    "How can I stay motivated?"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 pb-24 flex flex-col">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 px-6 pt-12 pb-8 overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="size-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="size-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl text-white">AI Coach</h2>
            <p className="text-white/90 text-sm">Your personal trainer</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="size-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="size-8 text-purple-600" />
            </div>
            <h3 className="text-xl mb-2">Hi! I'm your AI Coach</h3>
            <p className="text-gray-600 mb-6">Ask me anything about fitness, nutrition, or wellness!</p>

            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-3">Try asking:</p>
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-red-600 text-white' 
                : 'bg-purple-100 text-purple-600'
            }`}>
              {msg.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
            </div>

            <Card className={`max-w-[75%] ${
              msg.role === 'user'
                ? 'bg-red-600 text-white'
                : 'bg-white'
            }`}>
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="size-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="size-4 text-purple-600" />
            </div>
            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex gap-1">
                  <div className="size-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t pb-24">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}