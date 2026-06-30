'use client'
import { Suspense, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

function VerifyForm() {
  const [digits, setDigits] = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const inputs = useRef<(HTMLInputElement|null)[]>([])
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const mode = params.get('mode') ?? 'signup'

  function handleChange(i: number, val: string) {
    if (loading || done) return
    const v = val.replace(/\D/g,'').slice(-1)
    const next = [...digits]; next[i] = v; setDigits(next)
    if (v && i < 5) inputs.current[i+1]?.focus()
    if (next.every(d=>d) && next.join('').length === 6) verify(next.join(''))
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i-1]?.focus()
  }

  async function verify(token: string) {
    if (loading || done) return
    setLoading(true)
    const type = mode === 'signup' ? 'signup' : 'email'
    const { error } = await createClient().auth.verifyOtp({ email, token, type })
    if (error) {
      setLoading(false)
      toast.error('Invalid or expired code')
      setDigits(['','','','','',''])
      inputs.current[0]?.focus()
      return
    }
    setDone(true)
    toast.success('Verified! Welcome 🎉')
    router.push('/chat')
  }

  async function resend() {
    if (loading || done) return
    const { error } = await createClient().auth.signInWithOtp({ email })
    if (error) toast.error(error.message)
    else { toast.success('New code sent!'); setDigits(['','','','','','']); inputs.current[0]?.focus() }
  }

  return (
    <div className="w-full max-w-sm text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/50 flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
      <h1 className="text-2xl font-bold mb-2">Check your email</h1>
      <p className="text-dark-300 text-sm mb-1">6-digit code sent to</p>
      <p className="text-teal-400 font-semibold text-sm mb-8">{email}</p>
      <div className="flex gap-2.5 justify-center mb-6">
        {digits.map((d,i) => (
          <input key={i} ref={el=>{inputs.current[i]=el}} type="number" inputMode="numeric" maxLength={1} value={d}
            onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKey(i,e)} disabled={loading||done}
            className="w-12 h-14 text-center text-2xl font-bold bg-dark-800 border-2 border-dark-400 rounded-xl text-teal-400 outline-none focus:border-teal-500 transition disabled:opacity-50" />
        ))}
      </div>
      <button onClick={()=>verify(digits.join(''))} disabled={digits.join('').length<6||loading||done} className="btn-primary mb-4">
        {loading?'Verifying…':done?'Done!':'Verify & continue'}
      </button>
      <p className="text-sm text-dark-300">Didn&apos;t get it? <button onClick={resend} className="text-teal-400 font-semibold">Resend</button></p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-dark-900">
      <Suspense fallback={<div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />}>
        <VerifyForm />
      </Suspense>
    </div>
  )
}
