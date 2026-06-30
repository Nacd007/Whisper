import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value)
          response = NextResponse.next({ request })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, '')
          response = NextResponse.next({ request })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const protectedPaths = ['/chat', '/discover', '/profile']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.svg|.*\\.png$).*)',
  ],
}
