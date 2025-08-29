import React, { useEffect, useState } from 'react'
import { Search, Edit, Trash2, CheckSquare, Square, Globe, Star, Eye, EyeOff } from 'lucide-react'
import { BlogService } from '../services/blogService'
import { BlogPost } from '../types/blog'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface BlogListProps {
  onEdit: (post: BlogPost) => void
}

export function BlogList({ onEdit }: BlogListProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadBlogPosts()
  }, [statusFilter])

  useEffect(() => {
    const handleBlogPostsUpdated = () => {
      loadBlogPosts()
    }
    
    window.addEventListener('blogPostsUpdated', handleBlogPostsUpdated)
    return () => window.removeEventListener('blogPostsUpdated', handleBlogPostsUpdated)
  }, [])

  const loadBlogPosts = async () => {
    setLoading(true)
    try {
      const data = await BlogService.getBlogPosts()
      setBlogPosts(data)
    } catch (error) {
      console.error('Error loading blog posts:', error)
      setBlogPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length && filteredPosts.length > 0) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(filteredPosts.map(post => post.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedPosts.size === 0) return

    setDeleteLoading(true)
    try {
      await BlogService.deleteBlogPosts(Array.from(selectedPosts))
      setSelectedPosts(new Set())
      setShowDeleteModal(false)
      window.dispatchEvent(new CustomEvent('blogPostsUpdated'))
      await loadBlogPosts()
    } catch (error) {
      console.error('Error deleting blog posts:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteSingle = async (postId: string) => {
    setDeleteLoading(true)
    try {
      await BlogService.deleteBlogPosts([postId])
      window.dispatchEvent(new CustomEvent('blogPostsUpdated'))
      await loadBlogPosts()
    } catch (error) {
      console.error('Error deleting blog post:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && post.published) ||
                         (statusFilter === 'draft' && !post.published)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
          {selectedPosts.size > 0 && (
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedPosts.size} selected
              </span>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {selectedPosts.size === filteredPosts.length && filteredPosts.length > 0 ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All ({filteredPosts.length})
              </button>
            </div>
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className={`border rounded-lg p-4 transition-colors ${
                  selectedPosts.has(post.id) 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleSelectPost(post.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors mt-1"
                    >
                      {selectedPosts.has(post.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {post.title_en || 'Untitled'}
                        </h3>
                        <div className="flex gap-2 ml-4">
                          {post.featured && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 inline mr-1" />
                              Featured
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            post.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {post.published ? (
                              <>
                                <Eye className="w-3 h-3" />
                                Published
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Slug:</span> <code className="bg-gray-100 px-1 rounded">{post.slug}</code>
                      </div>
                      
                      {post.excerpt_en && (
                        <p className="text-sm text-gray-700 mb-2">{post.excerpt_en}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span><strong>Author:</strong> {post.author}</span>
                        {post.category && (
                          <span><strong>Category:</strong> {post.category}</span>
                        )}
                        <span><strong>Created:</strong> {new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {post.tags && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onEdit(post)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit post"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSingle(post.id)}
                      disabled={deleteLoading}
                      className="text-gray-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No blog posts found.</p>
          </div>
        )}

        {!loading && filteredPosts.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredPosts.length} of {blogPosts.length} posts
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        count={selectedPosts.size}
        isLoading={deleteLoading}
      />
    </div>
  )
}
