'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Message } from '@/types'

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const seen = useRef(new Set<string>())

  useEffect(() => {
    if (!conversationId) return
    const supabase = createClient()
    seen.current.clear()

    supabase.from('messages')
      .select('*, sender:profiles(id,username,display_name,avatar_url,is_anonymous)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        const msgs = (data ?? []) as Message[]
        msgs.forEach(m => seen.current.add(m.id))
        setMessages(msgs)
        setLoading(false)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50)
      })

    const channel = supabase
      .channel(`msgs-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, async (payload) => {
        const id = payload.new.id as string
        if (seen.current.has(id)) return
        seen.current.add(id)
        const { data } = await supabase.from('messages')
          .select('*, sender:profiles(id,username,display_name,avatar_url,is_anonymous)')
          .eq('id', id).single()
        if (data) {
          setMessages(prev => [...prev, data as Message])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  async function sendMessage(payload: Partial<Message> & { type: Message['type'] }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (payload.type === 'text' && payload.content && payload.content.length > 2000) throw new Error('Too long')
    const { error } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, ...payload })
    if (error) throw error
  }

  return { messages, loading, sendMessage, bottomRef }
}
