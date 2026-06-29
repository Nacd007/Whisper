'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import { formatTime, getInitials, avatarColor } from '@/lib/utils'
import type { Conversation } from '@/types'

export default function ChatListPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    load()
    const supabase = createClient()
    const ch = supabase.channel('conv-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user])

  async function load() {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id)

    if (!data?.length) { setLoading(false); return }
    const ids = data.map((r: any) => r.conversation_id)

    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .in('id', ids)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    const result: Conversation[] = []
    for (const conv of (convs ?? [])) {
      const { data: other } = await supabase
        .from('conversation_members')
        .select('profile:profiles(id,username,display_name,avatar_url,is_anonymous,is_online)')
        .eq('conversation_id', conv.id)
        .neq('user_id', user.id)
        .single()
      result.push({ ...(conv as any), other_user: (other as any)?.profile } as any)
    }
    setConversations(result)
    setLoading(false)
  }

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4 bg-dark-800 border-b border-dark-400">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Messages</h1>
          <span className="flex items-center gap-1.5 text-xs text-dark-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Online
          </span>
        </div>
        <div className="flex items-center gap-2 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2.5">
          <span>🔍</span>
          <input className="flex-1 bg-transparent outline-none text-sm placeholder-dark-300" placeholder="Search conversations…" />
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 px-5">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-semibold mb-2">No conversations yet</h3>
            <p className="text-sm text-dark-300 mb-6">Find nearby people and start a whisper</p>
            <Link href="/discover" className="inline-block px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold">Discover nearby</Link>
          </div>
        ) : conversations.map(conv => {
          const other = conv.other_user
          const name = other?.is_anonymous ? 'Anonymous' : (other?.display_name ?? other?.username ?? 'Unknown')
          return (
            <Link key={conv.id} href={`/chat/${conv.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-dark-800/50 border-b border-dark-400/30 transition">
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(other?.username)} flex items-center justify-center font-bold text-white`}>
                  {getInitials(name)}
                </div>
                {other?.is_online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-semibold text-sm">{name}</span>
                  <span className="text-[10px] text-dark-300">{conv.last_message_at ? formatTime(conv.last_message_at) : ''}</span>
                </div>
                <p className="text-xs text-dark-300 truncate">{conv.last_message ?? 'Start chatting…'}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}
