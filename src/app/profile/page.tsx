'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useFileUpload } from '@/hooks/useFileUpload'
import AppShell from '@/components/layout/AppShell'
import { getInitials, avatarColor } from '@/lib/utils'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { uploadAvatar } = useFileUpload()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) { setDisplayName(profile.display_name ?? ''); setBio(profile.bio ?? ''); setIsAnonymous(profile.is_anonymous) }
  }, [profile])

  async function save() {
    if (!user) return
    setSaving(true)
    const { error } = await createClient().from('profiles').update({ display_name: displayName, bio, is_anonymous: isAnonymous }).eq('id', user.id)
    setSaving(false)
    if (error) toast.error(error.message); else toast.success('Saved!')
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !user) return
    try {
      const url = await uploadAvatar(file, user.id)
      await createClient().from('profiles').update({ avatar_url: url }).eq('id', user.id)
      toast.success('Avatar updated!')
    } catch (err: any) { toast.error(err?.message ?? 'Upload failed') }
  }

  function copyLink() {
    navigator.clipboard?.writeText(`${location.origin}/${profile?.username}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const name = profile?.display_name ?? profile?.username ?? '?'
  const color = avatarColor(profile?.username)

  return (
    <AppShell>
      <div className="pb-8">
        <div className="h-28 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-400" />
        <div className="mx-4 -mt-8 card p-4 mb-4">
          <div className="flex items-end justify-between mb-3">
            <button onClick={()=>fileRef.current?.click()} className="relative">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full border-4 border-dark-600 object-cover" />
                : <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-2xl text-white border-4 border-dark-600`}>{getInitials(name)}</div>
              }
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-dark-600 border border-dark-400 rounded-full flex items-center justify-center text-xs">✏️</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl bg-teal-500 text-white text-xs font-semibold disabled:opacity-50 active:scale-95 transition">
              {saving?'Saving…':'Save'}
            </button>
          </div>
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} className="bg-transparent font-bold text-xl outline-none w-full placeholder-dark-300 text-white" placeholder="Your name" />
          <p className="text-teal-400 text-sm my-1">{profile?.username}@whisper.me</p>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={2} className="bg-transparent text-sm text-dark-300 outline-none w-full resize-none placeholder-dark-300" placeholder="Short bio…" />
          <div className="grid grid-cols-3 border-t border-dark-400 mt-3 pt-3 text-center">
            {[['148','Connections'],['2.4k','Messages'],['32','Meetups']].map(([n,l]) => (
              <div key={l}><p className="text-lg font-bold text-teal-400">{n}</p><p className="text-[10px] text-dark-300">{l}</p></div>
            ))}
          </div>
        </div>

        <div className="mx-4 card p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">🔗 Your whisper.me link</h3>
          <div className="flex items-center gap-2 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2.5">
            <span className="flex-1 text-teal-400 text-xs font-mono truncate">{profile?.username}@whisper.me</span>
            <button onClick={copyLink} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${copied?'bg-green-500 text-white':'bg-teal-500 text-white'}`}>{copied?'Copied!':'Copy'}</button>
          </div>
        </div>

        <div className="mx-4 card mb-4 overflow-hidden">
          <h3 className="text-sm font-bold px-4 py-3 border-b border-dark-400">🛡️ Privacy</h3>
          {[
            { label: 'Anonymous mode', desc: 'Hide your real name', val: isAnonymous, set: setIsAnonymous },
          ].map(({ label, desc, val, set }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3.5">
              <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-dark-300 mt-0.5">{desc}</p></div>
              <button onClick={()=>set(!val)} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${val?'bg-teal-500':'bg-dark-400'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${val?'left-[22px]':'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="mx-4 card overflow-hidden">
          <h3 className="text-sm font-bold px-4 py-3 border-b border-dark-400">⚙️ Account</h3>
          <button onClick={signOut} className="w-full text-left px-4 py-3.5 text-sm border-b border-dark-400/50 hover:bg-dark-700 transition">🚪 Sign out</button>
          <button className="w-full text-left px-4 py-3.5 text-sm text-red-400 hover:bg-dark-700 transition">🗑️ Delete account</button>
        </div>
      </div>
    </AppShell>
  )
}
