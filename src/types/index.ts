export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_anonymous: boolean
  is_online: boolean
  last_seen: string
  location_city: string | null
  created_at: string
}

export type NearbyUser = Profile & { distance_km: number }

export type MessageType = 'text' | 'location' | 'file' | 'image'

export type Message = {
  id: string
  conversation_id: string
  sender_id: string | null
  type: MessageType
  content: string | null
  location_lat: number | null
  location_lng: number | null
  location_label: string | null
  file_url: string | null
  file_name: string | null
  file_size: number | null
  file_mime: string | null
  is_anonymous: boolean
  read_by: string[]
  created_at: string
  sender?: Profile
}

export type Conversation = {
  id: string
  created_at: string
  updated_at: string
  last_message: string | null
  last_message_at: string | null
  other_user?: Profile
}
