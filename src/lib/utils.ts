import clsx, { type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export function formatTime(date: string | Date) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  if (mins < 1440) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function getInitials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function avatarColor(username?: string) {
  const colors = [
    'from-teal-500 to-blue-600',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-red-500',
    'from-green-500 to-teal-500',
    'from-blue-500 to-purple-500',
    'from-pink-500 to-rose-500',
  ]
  if (!username) return colors[0]
  return colors[username.charCodeAt(0) % colors.length]
}
