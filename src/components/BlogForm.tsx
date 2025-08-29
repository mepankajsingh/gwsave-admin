import React, { useState, useEffect } from 'react'
import { Save, X, Globe, Star, Eye } from 'lucide-react'
import { BlogService } from '../services/blogService'
import { BlogPost, CreateBlogPost, LANGUAGES } from '../types/blog'
import ReactQuill from 'react-quill'

interface BlogFormProps {
  post?: BlogPost
  onSave: () => void
  onCancel: () => void
}

export function BlogForm({ post, onSave, onCancel }: BlogFormProps) {
  const [formData, setFormData] = useState<CreateBlogPost>({
    slug: '',
    title_en: '', title_fr: '', title_es: '', title_pt: '',
    title_de: '', title_ja: '', title_hi: '', title_ru: '',
    content_en: '', content_fr: '', content_es: '', content_pt: '',
    content_de: '', content_ja: '', content_hi: '', content_ru: '',
    excerpt_en: '', excerpt_fr: '', excerpt_es: '', excerpt_pt: '',
    excerpt_de: '', excerpt_ja: '', excerpt_hi: '', excerpt_ru: '',
    author: '',
    featured_image: '',
    category: '',
    tags: '',
    published: false,
    featured: false
  })
  const [activeLanguage, setActiveLanguage] = useState('en')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'script'
  ]

  useEffect(() => {
    if (post) {
      setFormData({
        slug: post.slug,
        title_en: post.title_en, title_fr: post.title_fr, title_es: post.title_es, title_pt: post.title_pt,
        title_de: post.title_de, title_ja: post.title_ja, title_hi: post.title_hi, title_ru: post.title_ru,
        content_en: post.content_en, content_fr: post.content_fr, content_es: post.content_es, content_pt: post.content_pt,
        content_de: post.content_de, content_ja: post.content_ja, content_hi: post.content_hi, content_ru: post.content_ru,
        excerpt_en: post.excerpt_en, excerpt_fr: post.excerpt_fr, excerpt_es: post.excerpt_es, excerpt_pt: post.excerpt_pt,
        excerpt_de: post.excerpt_de, excerpt_ja: post.excerpt_ja, excerpt_hi: post.excerpt_hi, excerpt_ru: post.excerpt_ru,
        author: post.author,
        featured_image: post.featured_image,
        category: post.category,
        tags: post.tags,
        published: post.published,
        featured: post.featured
      })
    }
  }, [post])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (language: string, value: string) => {
    const newFormData = { ...formData, [`title_${language}`]: value }
    if (language === 'en' && !formData.slug) {
      newFormData.slug = generateSlug(value)
    }
    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (post) {
        await BlogService.updateBlogPost(post.id, formData)
      } else {
        await BlogService.createBlogPost(formData)
      }
      window.dispatchEvent(new CustomEvent('blogPostsUpdated'))
      onSave()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save blog post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="blog-post-url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Author name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
            <input
              type="url"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="tag1, tag2, tag3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Published</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Star className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">Multi-language Content</span>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLanguage(lang.code)}
                  className={`px-4 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors ${
                    activeLanguage === lang.code
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title ({LANGUAGES.find(l => l.code === activeLanguage)?.name})
                </label>
                <input
                  type="text"
                  value={formData[`title_${activeLanguage}` as keyof CreateBlogPost] as string}
                  onChange={(e) => handleTitleChange(activeLanguage, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt ({LANGUAGES.find(l => l.code === activeLanguage)?.name})
                </label>
                <textarea
                  value={formData[`excerpt_${activeLanguage}` as keyof CreateBlogPost] as string}
                  onChange={(e) => setFormData({ ...formData, [`excerpt_${activeLanguage}`]: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content ({LANGUAGES.find(l => l.code === activeLanguage)?.name})
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData[`content_${activeLanguage}` as keyof CreateBlogPost] as string}
                    onChange={(value) => setFormData({ ...formData, [`content_${activeLanguage}`]: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ minHeight: '300px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {post ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
