'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoginRequest, RegisterRequest } from '@/types'

interface LoginModalProps {
  onClose: () => void
  onLogin: (credentials: LoginRequest) => Promise<boolean>
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const { register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [avatars, setAvatars] = useState<string[]>([])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    avatar: ''
  })

  // Cargar avatares disponibles
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch('/api/auth/register')
        const data = await response.json()
        if (data.success) {
          setAvatars(data.data.avatars)
          // Seleccionar el primer avatar por defecto
          if (data.data.avatars.length > 0) {
            setFormData(prev => ({ ...prev, avatar: data.data.avatars[0] }))
          }
        }
      } catch (error) {
        console.error('Error loading avatars:', error)
      }
    }
    fetchAvatars()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const success = await onLogin({
          email: formData.email,
          password: formData.password
        })
        if (success) {
          onClose()
        }
      } else {
        const success = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar
        })
        if (success) {
          onClose()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">🎰</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h2>
                <p className="text-white/60 text-sm">
                  {isLogin ? 'Accede a tu cuenta' : 'Únete a KoquiFI Lottery'}
                </p>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="input-field pl-10"
                      placeholder="Tu nombre de usuario"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field pl-10"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="input-field pl-10"
                    placeholder="Tu contraseña"
                    minLength={6}
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Selecciona tu Avatar
                  </label>
                  <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                    {avatars.map((avatarUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: avatarUrl }))}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          formData.avatar === avatarUrl
                            ? 'border-primary-400 ring-2 ring-primary-400/50'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={avatarUrl}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full button-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    {isLogin ? (
                      <LogIn className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>
                      {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Form */}
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm mb-3">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors"
              >
                {isLogin ? 'Crear cuenta nueva' : 'Iniciar sesión'}
              </button>
            </div>

            {/* Demo Users */}
            {isLogin && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white/80 font-medium text-sm mb-2">
                  👥 Usuarios de Demo:
                </h4>
                <div className="space-y-1 text-xs text-white/60">
                  <div>demo1@kokifi.com / demo123</div>
                  <div>demo2@kokifi.com / demo123</div>
                  <div>demo3@kokifi.com / demo123</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
