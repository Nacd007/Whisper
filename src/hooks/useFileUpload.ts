'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const ALLOWED = new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain','text/csv','application/zip','video/mp4','audio/mpeg'])

function safeName(name: string) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\.{2,}/g, '_').slice(0, 200)
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)

  async function uploadFile(file: File, conversationId: string) {
    if (!ALLOWED.has(file.type)) throw new Error(`File type not allowed: ${file.type}`)
    if (!/^[0-9a-f-]{36}$/i.test(conversationId)) throw new Error('Invalid conversation')
    setUploading(true)
    const supabase = createClient()
    const name = safeName(file.name)
    const ext = name.split('.').pop() ?? 'bin'
    const path = `${conversationId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('chat-files').upload(path, file, { upsert: false })
    setUploading(false)
    if (error) throw error
    const { data: signed } = await supabase.storage.from('chat-files').createSignedUrl(data.path, 60 * 60 * 24 * 365)
    return { url: signed?.signedUrl ?? '', name, size: file.size, mime: file.type }
  }

  async function uploadAvatar(file: File, userId: string) {
    if (!file.type.startsWith('image/')) throw new Error('Must be an image')
    if (file.size > 5 * 1024 * 1024) throw new Error('Max 5 MB')
    const supabase = createClient()
    const ext = file.type.includes('png') ? 'png' : 'jpg'
    const { data, error } = await supabase.storage.from('avatars').upload(`${userId}/avatar.${ext}`, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl
  }

  return { uploading, uploadFile, uploadAvatar }
}
