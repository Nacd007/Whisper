'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function signUp(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!/^[a-z0-9_]{3,30}$/.test(username)) { toast.error('Username: 3-30 chars, lowercase letters/numbers/underscores'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle()
    if (existing) { toast.error('Username already taken'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username, display_name: username }, emailRedirectTo: `${location.origin}/auth/callback` } })
    setLoading(false)
    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) toast.error('Username already taken')
      else toast.error(error.message)
      return
    }
    router.push(`/auth/verify?email=${encodeURIComponent(email)}&mode=signup`)
  }

  async function signupGoogle() {
    const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-dark-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center text-3xl mx-auto mb-3">💬</div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-dark-300 text-sm mt-1">Join WhisperLink free</p>
        </div>
        <form onSubmit={signUp} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-dark-300 mb-1.5 block">Username</label>
            <input className="input-field" type="text" placeholder="coolperson" value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} required />
            {username && <p className="text-xs text-teal-400 mt-1">→ {username}@whisper.me</p>}
          </div>
          <div><label className="text-xs font-semibold text-dark-300 mb-1.5 block">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
          <div><label className="text-xs font-semibold text-dark-300 mb-1.5 block">Password</label>
            <input className="input-field" type="password" placeholder="At least 8 characters" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required /></div>
          <button type="submit" disabled={loading} className="btn-primary">{loading?'Creating…':'Create account'}</button>
        </form>
        <div className="flex items-center gap-3 my-5 text-xs text-dark-300">
          <div className="flex-1 h-px bg-dark-400" /><span>or</span><div className="flex-1 h-px bg-dark-400" />
        </div>
        <button onClick={signupGoogle} className="w-full flex items-center justify-center gap-3 py-3 border border-dark-400 rounded-xl text-sm font-medium hover:border-teal-500/50 transition">
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/><path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/><path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"/><path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <p className="text-center text-sm text-dark-300 mt-6">Have an account? <Link href="/auth/login" className="text-teal-400 font-semibold">Sign in</Link></p>
      </div>
    </div>
  )
}
