import React, { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { BlogList } from './BlogList'
import { BlogForm } from './BlogForm'
import { BlogPost } from '../types/blog'

export function BlogPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>()

  console.log('BlogPage rendering, view:', view, 'editingPost:', editingPost)

  const handleCreateNew = () => {
    setEditingPost(undefined)
    setView('create')
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setView('edit')
  }

  const handleSave = () => {
    setView('list')
    setEditingPost(undefined)
  }

  const handleCancel = () => {
    setView('list')
    setEditingPost(undefined)
  }

  if (view === 'create' || view === 'edit') {
    return (
      <div className="space-y-6">
      <BlogForm
        post={editingPost}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Blog Management</h2>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <BlogList onEdit={handleEdit} />
    </div>
  )
}
