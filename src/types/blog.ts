export interface BlogPost {
  id: string
  slug: string
  title_en: string
  title_fr: string
  title_es: string
  title_pt: string
  title_de: string
  title_ja: string
  title_hi: string
  title_ru: string
  content_en: string
  content_fr: string
  content_es: string
  content_pt: string
  content_de: string
  content_ja: string
  content_hi: string
  content_ru: string
  excerpt_en: string
  excerpt_fr: string
  excerpt_es: string
  excerpt_pt: string
  excerpt_de: string
  excerpt_ja: string
  excerpt_hi: string
  excerpt_ru: string
  author: string
  featured_image: string
  category: string
  tags: string
  published: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export type CreateBlogPost = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
export type UpdateBlogPost = Partial<CreateBlogPost> & { id: string }

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
] as const
