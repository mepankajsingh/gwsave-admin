import React, { useState } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { GoogleUser } from '../types/auth'

interface UserMenuProps {
  user: GoogleUser
  onSignOut: () => Promise<void>
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <img
          src={user.picture}
          alt={user.name}
          className="w-8 h-8 border border-gray-300"
        />
        <div className="text-left">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 border border-gray-300"
              />
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={async () => {
                await onSignOut()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
