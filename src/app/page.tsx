'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Message } from '@/types'

const REPLIES = ['That is interesting! 😊','Cool, I am nearby!','Want to meet up?','Sounds good 👍','Tell me more!','I love this app 💬']
const NEARBY = [
  { id:'AZ', name:'AzureShadow', meta:'0.8km · Music, Art', grad:'from-teal-500 to-purple-500' },
  { id:'NW', name:'NightWolf',   meta:'1.2km · Gaming, Tech', grad:'from-cyan-400 to-indigo-500' },
  { id:'SK', name:'StarKid',     meta:'2.1km · Design, Film', grad:'from-amber-500 to-red-500' },
  { id:'ER', name:'EchoRider',   meta:'3.4km · Food, Travel', grad:'from-pink-500 to-purple-500' },
  { id:'MF', name:'MidnightFox', meta:'4.8km · Books, Yoga',  grad:'from-green-500 to-teal-500' },
]
const FEATURES = [
  { ico:'💬', name:'Real-time chat',      desc:'WebSocket messages with typing indicators and read receipts.' },
  { ico:'📍', name:'Location sharing',    desc:'Share your pin anonymously on a live interactive map.' },
  { ico:'🕵️', name:'Anonymous mode',     desc:'Your identity stays hidden until you choose to reveal it.' },
  { ico:'📎', name:'File sharing',        desc:'Send images and docs up to 100 MB — encrypted in transit.' },
  { ico:'🔍', name:'Nearby discovery',    desc:'Live radar map of who is online within 5km of you.' },
  { ico:'🔗', name:'whisper.me profile',  desc:'Your own shareable link at you@whisper.me.' },
]

type DemoMsg = { id: string; text: string; type: 'text'|'location'|'file'; isMe: boolean }

export default function HomePage() {
  const [count, setCount] = useState(2847)
  const [msgs, setMsgs] = useState<DemoMsg[]>([
    { id:'1', text:"Hey! I see you're nearby — want to explore? 👋", type:'text', isMe:false },
    { id:'2', text:'Sure! Drop your location pin?', type:'text', isMe:true },
    { id:'3', text:'', type:'location', isMe:false },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [copied, setCopied] = useState(false)
  const [replyI, setReplyI] = useState(0)
  const [activeUser, setActiveUser] = useState<number|null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setCount(c => Math.max(2800, Math.min(2900, c + Math.floor(Math.random()*3)-1))), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [msgs, typing])

  function addMsg(m: Omit<DemoMsg,'id'>) { setMsgs(p => [...p, { ...m, id: Date.now().toString() }]) }

  function sendMsg() {
    const t = input.trim(); if (!t) return
    addMsg({ text:t, type:'text', isMe:true }); setInput(''); setTyping(true)
    setTimeout(() => { setTyping(false); addMsg({ text:REPLIES[replyI%REPLIES.length], type:'text', isMe:false }); setReplyI(i=>i+1) }, 1400)
  }

  function clickNearby(i: number, name: string) {
    setActiveUser(i)
    document.getElementById('chat-demo')?.scrollIntoView({ behavior:'smooth' })
    setTimeout(() => addMsg({ text:`Hey ${name}, spotted you nearby!`, type:'text', isMe:true }), 700)
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-dark-800/90 backdrop-blur border-b border-dark-400 px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-extrabold text-teal-400 text-lg">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-sm">💬</div>WhisperLink
        </div>
        <div className="flex gap-2">
          <Link href="/auth/login" className="px-4 py-2 text-sm text-dark-300 hover:text-white transition">Sign in</Link>
          <Link href="/auth/signup" className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold transition active:scale-95">Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-5 py-20 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-1.5 text-xs text-teal-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{count.toLocaleString()} people online now
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-5">
          Chat <span className="text-teal-400">anonymously</span>,<br />discover nearby friends
        </h1>
        <p className="text-dark-300 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Real-time encrypted chat, live location sharing, file transfers — anonymous until you are ready to connect for real.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/auth/signup" className="px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-base transition active:scale-95">Get started free</Link>
          <Link href="/discover" className="px-7 py-3.5 rounded-xl border border-teal-500 text-teal-400 hover:bg-teal-500/10 font-bold text-base transition active:scale-95">Explore nearby</Link>
        </div>
      </section>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 pb-16 max-w-2xl mx-auto">
        {[[count.toLocaleString(),'Online now'],['140+','Countries'],['5M+','Messages'],['100%','Encrypted']].map(([n,l]) => (
          <div key={l as string} className="card p-5 text-center">
            <div className="text-2xl font-extrabold text-teal-400">{n}</div>
            <div className="text-xs text-dark-300 mt-1 uppercase tracking-wide">{l}</div>
          </div>
        ))}
      </div>

      <hr className="border-dark-400 mx-5" />

      {/* LIVE CHAT DEMO */}
      <section id="chat-demo" className="px-5 py-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 text-xs text-green-400 font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400" /> Live demo — try it
        </div>
        <h2 className="text-3xl font-bold mb-2">Real-time chat</h2>
        <p className="text-dark-300 mb-8">Type a message below. Click 📍 to share a location or 📎 to send a file.</p>
        <div className="bg-dark-800 border border-dark-400 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-dark-700 border-b border-dark-400">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">AZ</div>
            <div className="flex-1">
              <div className="font-semibold text-sm flex items-center gap-2">AzureShadow <span className="anon-badge">🕵️ Anon</span></div>
              <div className="text-xs text-green-400">● Active now · 0.8km away</div>
            </div>
          </div>
          <div ref={listRef} className="px-4 py-4 flex flex-col gap-3 overflow-y-auto" style={{height:280}}>
            {msgs.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe?'flex-row-reverse':''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${msg.isMe?'bg-teal-500':'bg-gradient-to-br from-teal-500 to-purple-500'}`}>
                  {msg.isMe?'You':'AZ'}
                </div>
                <div className={`flex flex-col gap-1 max-w-[72%] ${msg.isMe?'items-end':''}`}>
                  {msg.type==='text' && <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.isMe?'bg-teal-500 text-white rounded-br-sm':'bg-dark-600 border border-dark-400 rounded-bl-sm'}`}>{msg.text}</div>}
                  {msg.type==='location' && (
                    <div className="flex items-center gap-3 bg-dark-700 border border-dark-400 rounded-2xl p-3 min-w-48">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">📍</div>
                      <div><p className="text-xs font-semibold">{msg.isMe?'My location (anon)':'Shared location'}</p><p className="text-[10px] text-dark-300">Near your area</p></div>
                      <span className="text-teal-400 text-xs ml-auto">View →</span>
                    </div>
                  )}
                  {msg.type==='file' && (
                    <div className="flex items-center gap-3 bg-dark-700 border border-dark-400 rounded-2xl p-3 min-w-48">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">📄</div>
                      <div className="flex-1"><p className="text-xs font-semibold">shared_file.pdf</p><p className="text-[10px] text-dark-300">1.2 MB</p></div>
                      <button className="px-2.5 py-1 rounded-lg bg-teal-500 text-white text-xs">↓</button>
                    </div>
                  )}
                  <span className="text-[10px] text-dark-300 px-1">Now{msg.isMe?' ✓✓':''}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">AZ</div>
                <div className="flex gap-1 items-center bg-dark-600 border border-dark-400 rounded-2xl rounded-bl-sm px-4 py-3">
                  {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-dark-300 animate-bounce" style={{animationDelay:`${i*0.2}s`}} />)}
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-dark-400 bg-dark-700">
            <div className="flex items-center gap-2 bg-dark-600 border border-dark-400 focus-within:border-teal-500 rounded-2xl px-3 py-2 transition">
              <button onClick={()=>addMsg({text:'',type:'file',isMe:true})} className="text-lg text-dark-300 hover:text-teal-400 p-1">📎</button>
              <button onClick={()=>addMsg({text:'',type:'location',isMe:true})} className="text-lg text-dark-300 hover:text-teal-400 p-1">📍</button>
              <input className="flex-1 bg-transparent outline-none text-sm text-white placeholder-dark-300 min-w-0" placeholder="Type a message and press Enter…"
                value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendMsg()}} />
              <button onClick={sendMsg} disabled={!input.trim()} className="w-9 h-9 rounded-xl bg-teal-500 disabled:opacity-40 flex items-center justify-center text-white transition hover:bg-teal-400 active:scale-90 flex-shrink-0">➤</button>
            </div>
            <div className="flex justify-between mt-2 px-1 text-[10px] text-dark-300">
              <span>🔒 End-to-end encrypted</span>
              <span className="anon-badge">🕵️ Anonymous</span>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-dark-400 mx-5" />

      {/* DISCOVER */}
      <section className="px-5 py-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-3 py-1 text-xs text-teal-300 font-semibold mb-4">📍 Nearby radar</div>
        <h2 className="text-3xl font-bold mb-2">Find people around you</h2>
        <p className="text-dark-300 mb-8">Click any user below to send them a whisper in the demo above.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NEARBY.map((u,i) => (
            <button key={u.id} onClick={()=>clickNearby(i,u.name)}
              className={`card p-4 flex items-center gap-3 text-left transition hover:border-teal-500/50 active:scale-98 ${activeUser===i?'border-teal-500 bg-teal-500/5':''}`}>
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${u.grad} flex items-center justify-center font-bold text-sm text-white`}>{u.id}</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-xs text-dark-300">📍 {u.meta}</p>
              </div>
              <span className="text-xs text-teal-400 font-semibold flex-shrink-0">Message →</span>
            </button>
          ))}
        </div>
      </section>

      <hr className="border-dark-400 mx-5" />

      {/* HOW IT WORKS */}
      <section className="px-5 py-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1 text-xs text-purple-300 font-semibold mb-4">✨ Simple</div>
        <h2 className="text-3xl font-bold mb-2">Up in 30 seconds</h2>
        <p className="text-dark-300 mb-8">No phone number. No real name required.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n:1, col:'bg-teal-500',   title:'Pick a username', desc:'Becomes your you@whisper.me link. No real name needed.' },
            { n:2, col:'bg-purple-500', title:'Verify your email', desc:'6-digit code sent to your inbox. Or sign in with Google.' },
            { n:3, col:'bg-green-500',  title:'Start whispering', desc:'Chat, share location, send files — all encrypted and anonymous.' },
          ].map(s => (
            <div key={s.n} className="card p-6 text-center hover:border-dark-300 transition">
              <div className={`w-11 h-11 rounded-full ${s.col} flex items-center justify-center font-extrabold text-white text-lg mx-auto mb-4`}>{s.n}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-dark-300 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-dark-400 mx-5" />

      {/* PROFILE PREVIEW */}
      <section className="px-5 py-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-3 py-1 text-xs text-teal-300 font-semibold mb-4">🔗 Your identity</div>
        <h2 className="text-3xl font-bold mb-2">Your own whisper.me link</h2>
        <p className="text-dark-300 mb-8">Share your profile with anyone. They can message you — you stay anonymous until you choose otherwise.</p>
        <div className="card overflow-hidden max-w-sm mx-auto">
          <div className="h-20 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-400" />
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between mb-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white border-4 border-dark-600 -mt-7">JD</div>
              <button className="px-3 py-1.5 rounded-lg border border-dark-400 bg-dark-700 text-dark-300 text-xs">Edit profile</button>
            </div>
            <p className="font-bold text-lg">JohnDoe</p>
            <p className="text-teal-400 text-sm mb-2">johndoe@whisper.me</p>
            <p className="text-dark-300 text-xs leading-relaxed mb-3">Anonymous by day, adventurer by night ☕</p>
            <div className="grid grid-cols-3 border-t border-dark-400 pt-4 text-center mb-4">
              {[['148','Connections'],['2.4k','Messages'],['32','Meetups']].map(([n,l]) => (
                <div key={l}><p className="text-base font-bold text-teal-400">{n}</p><p className="text-[10px] text-dark-300">{l}</p></div>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2">
              <span className="flex-1 text-xs text-teal-400 font-mono">johndoe@whisper.me</span>
              <button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition ${copied?'bg-green-500 text-white':'bg-teal-500 text-white'}`}>
                {copied?'Copied!':'Copy'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-dark-400 mx-5" />

      {/* FEATURES */}
      <section className="px-5 py-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-300 font-semibold mb-4">⚡ Everything included</div>
        <h2 className="text-3xl font-bold mb-2">Every feature, always free</h2>
        <p className="text-dark-300 mb-8">No paywalls. No premium tiers. Everything is available from day one.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.name} className="card p-5 hover:border-teal-500/50 hover:-translate-y-1 transition group">
              <div className="text-2xl mb-3">{f.ico}</div>
              <h3 className="font-semibold text-sm mb-1.5 group-hover:text-teal-400 transition">{f.name}</h3>
              <p className="text-xs text-dark-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-5 py-20">
        <h2 className="text-4xl font-extrabold mb-4">Start whispering today</h2>
        <p className="text-dark-300 text-base max-w-sm mx-auto mb-10 leading-relaxed">Free forever. No credit card. No real name. Create an account and you are in.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/auth/signup" className="px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-base transition active:scale-95">Create free account</Link>
          <Link href="/auth/login" className="px-8 py-4 rounded-xl border border-teal-500 text-teal-400 hover:bg-teal-500/10 font-bold text-base transition active:scale-95">Sign in</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-dark-400 px-5 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-dark-300">
        <span className="text-teal-400 font-bold">WhisperLink</span>
        <div className="flex gap-5">{['Privacy','Terms','Security'].map(l => <a key={l} href="#" className="hover:text-teal-400 transition">{l}</a>)}</div>
        <span>© {new Date().getFullYear()} WhisperLink</span>
      </footer>
    </div>
  )
}
