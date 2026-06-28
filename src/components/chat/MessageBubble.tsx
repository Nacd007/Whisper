'use client'
import { formatTime, formatFileSize, getInitials, avatarColor } from '@/lib/utils'
import type { Message } from '@/types'

export default function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const name = message.is_anonymous ? 'Anon' : (message.sender?.display_name ?? message.sender?.username ?? '?')
  const color = avatarColor(message.sender?.username)

  return (
    <div className={`flex items-end gap-2 ${isOwn?'flex-row-reverse':''}`}>
      {!isOwn && (
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
          {getInitials(name)}
        </div>
      )}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn?'items-end':''}`}>
        {message.type === 'text' && (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn?'bg-teal-500 text-white rounded-br-sm':'bg-dark-600 border border-dark-400 rounded-bl-sm'}`}>
            {message.content}
          </div>
        )}
        {message.type === 'location' && (
          <a href={`https://www.openstreetmap.org/?mlat=${message.location_lat}&mlon=${message.location_lng}&zoom=15`} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 bg-dark-700 border border-dark-400 hover:border-teal-500/50 rounded-2xl p-3 transition min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-sm flex-shrink-0">📍</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">Shared location</p>
              <p className="text-[10px] text-dark-300 truncate">{message.location_label ?? `${message.location_lat?.toFixed(4)}, ${message.location_lng?.toFixed(4)}`}</p>
            </div>
            <span className="text-teal-400 text-xs flex-shrink-0">View →</span>
          </a>
        )}
        {(message.type === 'file' || message.type === 'image') && (
          <div className="flex items-center gap-3 bg-dark-700 border border-dark-400 rounded-2xl p-3 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm flex-shrink-0">{message.type==='image'?'🖼️':'📄'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{message.file_name}</p>
              <p className="text-[10px] text-dark-300">{message.file_size?formatFileSize(message.file_size):''}</p>
            </div>
            {message.file_url && (
              <a href={message.file_url} download={message.file_name} className="px-2.5 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-semibold flex-shrink-0">↓</a>
            )}
          </div>
        )}
        <span className="text-[10px] text-dark-300 px-1">{formatTime(message.created_at)}{isOwn?' ✓✓':''}</span>
      </div>
    </div>
  )
}
