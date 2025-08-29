import { supabase } from '../lib/supabase'
import { BlogPost, CreateBlogPost, UpdateBlogPost } from '../types/blog'

export class BlogService {
  private static async ensureAuthenticated(): Promise<void> {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error('Failed to verify authentication. Please refresh and try again.')
    }
    
    if (!session?.user) {
      throw new Error('Authentication required. Please sign in to perform this action.')
    }
  }

  static async getBlogPosts(publishedOnly = false): Promise<BlogPost[]> {
    await this.ensureAuthenticated()
    
    try {
      let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

      if (publishedOnly) {
        query = query.eq('published', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Blog posts fetch error:', error)
        throw new Error(`Failed to fetch blog posts: ${error.message}`)
      }

      // Ensure all posts have string values for tags to prevent split errors
      const posts = (data || []).map(post => ({
        ...post,
        tags: post.tags || '',
        title_en: post.title_en || '',
        title_fr: post.title_fr || '',
        title_es: post.title_es || '',
        title_pt: post.title_pt || '',
        title_de: post.title_de || '',
        title_ja: post.title_ja || '',
        title_hi: post.title_hi || '',
        title_ru: post.title_ru || '',
        content_en: post.content_en || '',
        content_fr: post.content_fr || '',
        content_es: post.content_es || '',
        content_pt: post.content_pt || '',
        content_de: post.content_de || '',
        content_ja: post.content_ja || '',
        content_hi: post.content_hi || '',
        content_ru: post.content_ru || '',
        excerpt_en: post.excerpt_en || '',
        excerpt_fr: post.excerpt_fr || '',
        excerpt_es: post.excerpt_es || '',
        excerpt_pt: post.excerpt_pt || '',
        excerpt_de: post.excerpt_de || '',
        excerpt_ja: post.excerpt_ja || '',
        excerpt_hi: post.excerpt_hi || '',
        excerpt_ru: post.excerpt_ru || '',
        author: post.author || '',
        featured_image: post.featured_image || '',
        category: post.category || ''
      }))

      return posts
    } catch (error) {
      console.error('Error in getBlogPosts:', error)
      return []
    }
  }

  static async getBlogPost(id: string): Promise<BlogPost | null> {
    await this.ensureAuthenticated()
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Post not found
      }
      throw new Error(`Failed to fetch blog post: ${error.message}`)
    }

    return data
  }

  static async createBlogPost(post: CreateBlogPost): Promise<BlogPost> {
    await this.ensureAuthenticated()
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create blog post: ${error.message}`)
    }

    return data
  }

  static async updateBlogPost(id: string, updates: Partial<CreateBlogPost>): Promise<BlogPost> {
    await this.ensureAuthenticated()
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update blog post: ${error.message}`)
    }

    return data
  }

  static async deleteBlogPosts(ids: string[]): Promise<void> {
    await this.ensureAuthenticated()
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', ids)

    if (error) {
      throw new Error(`Failed to delete blog posts: ${error.message}`)
    }
  }

  static async getBlogStats(): Promise<{
    total: number
    published: number
    draft: number
    featured: number
  }> {
    await this.ensureAuthenticated()
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('published, featured')

    if (error) {
      throw new Error(`Failed to fetch blog statistics: ${error.message}`)
    }
    
    if (!data) {
      return { total: 0, published: 0, draft: 0, featured: 0 }
    }

    const stats = data.reduce((acc, post) => {
      acc.total++
      if (post.published) acc.published++
      else acc.draft++
      if (post.featured) acc.featured++
      return acc
    }, { total: 0, published: 0, draft: 0, featured: 0 })

    return stats
  }
}
