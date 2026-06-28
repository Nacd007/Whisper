'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export function usePresence(userId?: string) {
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', userId).then()
    const handleUnload = () => {
      supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', userId).then()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => { handleUnload(); window.removeEventListener('beforeunload', handleUnload) }
  }, [userId])
}
