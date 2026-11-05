// ============================================================
// GLOBAL TYPES — TeffyDron
// ============================================================

export interface SiteConfig {
  companyName: string
  tagline: string
  heroSubtitle: string
  whatsappNumber: string
  contactEmail: string
  videoUrl: string
  instagramUrl: string
  youtubeUrl: string
  facebookUrl: string
  primaryColor: string
  accentColor: string
  footerText: string
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: 'deportes' | 'fpv' | 'cinematica' | 'aerea'
  createdAt: string
}

export interface Review {
  id: string
  author: string
  role: string
  content: string
  rating: number
  avatar: string
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  eventType: string
  message: string
  createdAt: string
  read: boolean
}

export type AdminSection =
  | 'dashboard'
  | 'config'
  | 'gallery'
  | 'videos'
  | 'reviews'
  | 'messages'

export interface AppState {
  siteConfig: SiteConfig
  gallery: GalleryImage[]
  reviews: Review[]
  messages: ContactMessage[]
}

export type AppAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<SiteConfig> }
  | { type: 'ADD_IMAGE'; payload: GalleryImage }
  | { type: 'DELETE_IMAGE'; payload: string }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'UPDATE_REVIEW'; payload: Review }
  | { type: 'DELETE_REVIEW'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: ContactMessage }
  | { type: 'MARK_MESSAGE_READ'; payload: string }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState }
