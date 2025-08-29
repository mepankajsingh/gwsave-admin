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
    
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (publishedOnly) {
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch blog posts: ${error.message}`)
    }

    return data || []
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
