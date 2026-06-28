'use client'
import { useEffect, useState } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import AppShell from '@/components/layout/AppShell'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import { createClient } from '@/lib/supabase'
import { getInitials, avatarColor } from '@/lib/utils'
import Link from 'next/link'
import type { Profile } from '@/types'

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { messages, loading, sendMessage, bottomRef } = useMessages(params.id)
  const [other, setOther] = useState<Profile | null>(null)

  useEffect(() => {
    if (!user) return
    createClient()
      .from('conversation_members')
      .select('profile:profiles(id,username,display_name,avatar_url,is_anonymous,is_online)')
      .eq('conversation_id', params.id)
      .neq('user_id', user.id)
      .single()
      .then(({ data }) => setOther((data as any)?.profile ?? null))
  }, [user, params.id])

  const name = other?.is_anonymous ? 'Anonymous' : (other?.display_name ?? other?.username ?? '?')

  return (
    <AppShell>
      <div className="flex flex-col h-screen">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-dark-800 border-b border-dark-400 flex-shrink-0">
          <Link href="/chat" className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-400 flex items-center justify-center text-lg flex-shrink-0">←</Link>
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(other?.username)} flex items-center justify-center font-bold text-sm text-white flex-shrink-0`}>{getInitials(name)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{name} <span className="anon-badge ml-1">🕵️ Anon</span></p>
            <p className="text-xs text-green-400">{other?.is_online?'● Active now':'○ Offline'}</p>
          </div>
          <button className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-400 flex items-center justify-center text-lg flex-shrink-0">⋯</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
          ))}
          <div ref={bottomRef} />
        </div>

        <ChatInput conversationId={params.id} onSend={sendMessage} />
      </div>
    </AppShell>
  )
}
