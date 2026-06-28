'use client'
import { useRef, useState } from 'react'
import { useLocation } from '@/hooks/useLocation'
import { useFileUpload } from '@/hooks/useFileUpload'
import { toast } from 'sonner'
import type { Message } from '@/types'

interface Props {
  conversationId: string
  onSend: (payload: Partial<Message> & { type: Message['type'] }) => Promise<void>
}

export default function ChatInput({ conversationId, onSend }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { getLocation, loading: locLoading } = useLocation()
  const { uploadFile, uploading } = useFileUpload()
  const lastSent = useRef(0)

  async function send() {
    const t = text.trim()
    if (!t || sending) return
    if (Date.now() - lastSent.current < 500) return
    lastSent.current = Date.now()
    if (t.length > 2000) { toast.error('Message too long (max 2000 chars)'); return }
    setSending(true)
    try { await onSend({ type: 'text', content: t }); setText('') }
    catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  async function shareLocation() {
    try {
      const c = await getLocation()
      await onSend({ type: 'location', location_lat: c.lat, location_lng: c.lng, location_label: c.label })
    } catch { toast.error('Could not get location. Allow location access.') }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 100*1024*1024) { toast.error('Max file size is 100 MB'); e.target.value=''; return }
    try {
      const up = await uploadFile(file, conversationId)
      await onSend({ type: file.type.startsWith('image/')?'image':'file', file_url: up.url, file_name: up.name, file_size: up.size, file_mime: up.mime })
    } catch (err: any) { toast.error(err?.message ?? 'Upload failed') }
    e.target.value = ''
  }

  const busy = sending || locLoading || uploading

  return (
    <div className="border-t border-dark-400 bg-dark-800 px-4 py-3 flex-shrink-0">
      <div className={`flex items-center gap-2 bg-dark-700 border rounded-2xl px-3 py-2 transition ${busy?'border-dark-400':'border-dark-400 focus-within:border-teal-500'}`}>
        <button onClick={()=>fileRef.current?.click()} disabled={busy} className="text-lg text-dark-300 hover:text-teal-400 transition p-1 flex-shrink-0 disabled:opacity-40">📎</button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        <button onClick={shareLocation} disabled={busy} className="text-lg text-dark-300 hover:text-teal-400 transition p-1 flex-shrink-0 disabled:opacity-40">{locLoading?'⏳':'📍'}</button>
        <input className="flex-1 bg-transparent outline-none text-sm text-white placeholder-dark-300 min-w-0"
          placeholder={uploading?'Uploading…':'Send a whisper…'} value={text}
          onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} disabled={busy} maxLength={2000} />
        <button onClick={send} disabled={!text.trim()||busy}
          className="w-9 h-9 rounded-xl bg-teal-500 disabled:opacity-40 flex items-center justify-center text-white flex-shrink-0 transition active:scale-90 hover:bg-teal-400">➤</button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[10px] text-dark-300">🔒 End-to-end encrypted</span>
        <span className="anon-badge">🕵️ Anonymous</span>
      </div>
    </div>
  )
}
