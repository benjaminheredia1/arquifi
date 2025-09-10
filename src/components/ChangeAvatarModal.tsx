'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Check } from 'lucide-react'
import { User as UserType } from '@/types'

interface ChangeAvatarModalProps {
  onClose: () => void
  onAvatarChange: (avatarUrl: string) => Promise<boolean>
  currentUser: UserType | null
}

export function ChangeAvatarModal({ onClose, onAvatarChange, currentUser }: ChangeAvatarModalProps) {
  const [avatars, setAvatars] = useState<string[]>([])
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Cargar avatares disponibles
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        console.log('Current user pfpUrl:', currentUser?.pfpUrl)
        const response = await fetch('/api/auth/register')
        const data = await response.json()
        if (data.success) {
          setAvatars(data.data.avatars)
          if (currentUser?.pfpUrl) {
            setSelectedAvatar(currentUser.pfpUrl)
          }
        }
      } catch (error) {
        console.error('Error loading avatars:', error)
      }
    }
    fetchAvatars()
  }, [currentUser?.pfpUrl])

  const handleSave = async () => {
    if (!selectedAvatar) return

    setIsLoading(true)
    try {
      const success = await onAvatarChange(selectedAvatar)
      if (success) {
        onClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="modal-content max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cambiar Avatar</h2>
                <p className="text-white/60 text-sm">Selecciona un nuevo avatar para tu perfil</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Avatar */}
            {currentUser && (
              <div className="mb-6 text-center">
                <h3 className="text-lg font-medium text-white mb-4">Avatar Actual</h3>
                <div className="flex justify-center">
                  <img 
                    src={currentUser.pfpUrl} 
                    alt={currentUser.displayName}
                    className="w-20 h-20 rounded-full border-4 border-primary-400"
                  />
                </div>
                <p className="text-white/70 mt-2">{currentUser.displayName}</p>
              </div>
            )}

            {/* Avatar Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-4">Selecciona un Nuevo Avatar</h3>
              <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto">
                {avatars.map((avatarUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(avatarUrl)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatarUrl
                        ? 'border-primary-400 ring-2 ring-primary-400/50'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={avatarUrl}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedAvatar === avatarUrl && (
                      <div className="absolute inset-0 bg-primary-400/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-primary-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selectedAvatar && (
              <div className="mb-6 text-center">
                <h3 className="text-lg font-medium text-white mb-4">Vista Previa</h3>
                <div className="flex justify-center">
                  <img 
                    src={selectedAvatar} 
                    alt="Preview"
                    className="w-24 h-24 rounded-full border-4 border-white/20"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!selectedAvatar || isLoading || selectedAvatar === currentUser?.pfpUrl}
              className="w-full button-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    {selectedAvatar === currentUser?.pfpUrl ? 'Avatar Actual' : 'Guardar Cambios'}
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
