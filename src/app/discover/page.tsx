'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from '@/hooks/useLocation'
import AppShell from '@/components/layout/AppShell'
import { getInitials, avatarColor } from '@/lib/utils'
import { toast } from 'sonner'
import type { NearbyUser } from '@/types'

const NearbyMap = dynamic(() => import('@/components/discover/NearbyMap'), {
  ssr: false,
  loading: () => <div className="mx-4 h-48 rounded-2xl bg-dark-700 border border-dark-400 flex items-center justify-center text-dark-300 text-sm">Loading map…</div>
})

export default function DiscoverPage() {
  const { user } = useAuth()
  const { coords, getLocation, loading: locLoading } = useLocation()
  const [users, setUsers] = useState<NearbyUser[]>([])
  const [fetching, setFetching] = useState(false)

  useEffect(() => { getLocation().then(c => fetchNearby(c.lat, c.lng)).catch(() => {}) }, [])

  async function fetchNearby(lat: number, lng: number) {
    setFetching(true)
    const supabase = createClient()
    if (user) {
      try { await supabase.rpc('update_my_location', { user_lat: lat, user_lng: lng }) } catch { }
    }
    const { data } = await supabase.rpc('get_nearby_users', { user_lat: lat, user_lng: lng, radius_km: 5 })
    setUsers((data ?? []) as NearbyUser[])
    setFetching(false)
  }

  async function startChat(otherId: string) {
    if (!user) return
    const supabase = createClient()
    const { data: myConvs } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', user.id)
    const ids = (myConvs ?? []).map(r => r.conversation_id)
    if (ids.length) {
      const { data: shared } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', otherId).in('conversation_id', ids).single()
      if (shared) { window.location.href = `/chat/${shared.conversation_id}`; return }
    }
    const { data: conv } = await supabase.from('conversations').insert({}).select().single()
    if (!conv) { toast.error('Could not start chat'); return }
    await supabase.from('conversation_members').insert([{ conversation_id: conv.id, user_id: user.id }, { conversation_id: conv.id, user_id: otherId }])
    window.location.href = `/chat/${conv.id}`
  }

  return (
    <AppShell>
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Discover nearby</h1>
        <p className="text-sm text-dark-300 mt-1">{coords ? `${users.length} people within 5km` : 'Enable location to find people nearby'}</p>
      </div>

      <div className="py-3">
        <NearbyMap userCoords={coords} />
      </div>

      <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
        {['All','Online','Within 1km','Music 🎵','Art 🎨','Gaming 🎮'].map((f,i) => (
          <button key={f} className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 ${i===0?'border-teal-500 text-teal-300 bg-teal-500/10':'border-dark-400 text-dark-300'}`}>{f}</button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-3 pb-6">
        {!coords && !locLoading && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📍</div>
            <p className="font-semibold mb-2">Location access needed</p>
            <p className="text-sm text-dark-300 mb-4">Allow location to find people nearby</p>
            <button onClick={()=>getLocation().then(c=>fetchNearby(c.lat,c.lng))} className="px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold">Enable location</button>
          </div>
        )}
        {fetching && <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!fetching && users.map(u => {
          const name = u.is_anonymous ? 'Anonymous' : (u.display_name ?? u.username)
          return (
            <div key={u.id} className="card p-4 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(u.username)} flex items-center justify-center font-bold text-white`}>{getInitials(name)}</div>
                {u.is_online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-dark-300">📍 {u.distance_km}km · {u.is_online?'Online':'Offline'}</p>
              </div>
              <button onClick={()=>startChat(u.id)} className="px-4 py-2 rounded-xl border border-teal-500 text-teal-400 text-xs font-semibold hover:bg-teal-500 hover:text-white transition active:scale-95 flex-shrink-0">
                Message
              </button>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
