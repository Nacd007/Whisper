# 💬 WhisperLink

Anonymous real-time chat with location sharing, file transfers, and nearby discovery.

---

## 🚀 Deploy to Vercel in 5 minutes

### Step 1 — Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Open **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click **Run**
3. Go to **Authentication → Providers**:
   - Enable **Email** (turn on "Confirm email")
   - Enable **Google** (paste your Google OAuth Client ID + Secret)
4. Go to **Project Settings → API** → copy:
   - **Project URL**
   - **anon public** key

### Step 2 — Deploy to Vercel

**Option A — One-click (recommended)**
```
Push this folder to a GitHub repo, then:
vercel.com → New Project → Import repo → Deploy
```

**Option B — CLI**
```bash
npm i -g vercel
cd whisperlink
vercel
```

### Step 3 — Add environment variables

In Vercel dashboard → Project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

Then **redeploy** once after adding vars.

### Step 4 — Set redirect URLs in Supabase

In Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

Also add your Vercel URL to Google OAuth authorized redirect URIs:
`https://your-app.vercel.app/auth/callback`

---

## 🏃 Run locally

```bash
# 1. Install
npm install

# 2. Add env vars
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Start
npm run dev
# Open http://localhost:3000
```

---

## 🆓 Free stack — zero cost to start

| Feature | Service | Free tier |
|---|---|---|
| Database | Supabase PostgreSQL | 500 MB |
| Auth | Supabase Auth | 50,000 MAU |
| WebSockets | Supabase Realtime | 500 concurrent |
| File storage | Supabase Storage | 1 GB |
| Geolocation | Browser API + Nominatim | Unlimited |
| Map | Leaflet + OpenStreetMap | Unlimited |
| Hosting | Vercel | Unlimited hobby |

---

## 📁 Project structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage (interactive demo)
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── auth/
│   │   ├── login/page.tsx        # Sign in (password + OTP + Google)
│   │   ├── signup/page.tsx       # Register
│   │   ├── verify/page.tsx       # OTP code entry
│   │   └── callback/route.ts     # OAuth redirect handler
│   ├── chat/
│   │   ├── page.tsx              # Conversation list (realtime)
│   │   └── [id]/page.tsx         # Chat view (WebSocket)
│   ├── discover/page.tsx         # Nearby users + map
│   └── profile/page.tsx          # Profile + settings
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Auth guard + bottom nav wrapper
│   │   └── BottomNav.tsx         # Mobile tab bar
│   ├── chat/
│   │   ├── MessageBubble.tsx     # Text / location / file bubbles
│   │   └── ChatInput.tsx         # Input bar with file + location
│   └── discover/
│       └── NearbyMap.tsx         # Leaflet map (dynamic import)
├── hooks/
│   ├── useAuth.ts                # Auth state
│   ├── useMessages.ts            # WebSocket realtime messages
│   ├── usePresence.ts            # Online/offline tracking
│   ├── useLocation.ts            # Browser geolocation
│   └── useFileUpload.ts          # Supabase Storage upload
├── lib/
│   ├── supabase.ts               # Browser client (singleton)
│   ├── supabase-server.ts        # Server client (SSR)
│   └── utils.ts                  # Helpers
├── types/index.ts                # TypeScript types
└── middleware.ts                 # Route protection

supabase/
└── schema.sql                    # Full DB schema — run this first!
```

---

## 🔒 Security features

- Row Level Security on all tables
- Message rate limit (30/minute per user)
- File MIME type allowlist (client + bucket)
- File path validation prevents URL hijacking
- Location fuzzing to ~1km before storing
- Generic auth error messages (no email enumeration)
- OTP double-submit protection
- Security headers (X-Frame-Options, CSP, HSTS)

---

## ❓ Troubleshooting

**Build fails on Vercel**
→ Check that both env vars are set in Vercel dashboard → Settings → Environment Variables → redeploy

**"Invalid API key" error**
→ Make sure you copied the `anon public` key, not the `service_role` key

**Google login not working**
→ Add your Vercel URL to Google Cloud Console → OAuth → Authorized redirect URIs: `https://your-app.vercel.app/auth/callback`

**Map not showing**
→ This is normal on first load — Leaflet loads client-side only. Refresh once.

**No nearby users showing**
→ PostGIS must be enabled. In Supabase → Database → Extensions → enable `postgis`

**Email OTP not arriving**
→ In Supabase → Authentication → check "Email rate limit". In dev, only 3 emails/hour are allowed. Use Google login for testing.
