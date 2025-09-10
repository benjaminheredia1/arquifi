'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types'
import toast from 'react-hot-toast'

export function useAuth() {
  const { address } = useAccount()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem('kokifi_user')
        console.log('Checking saved user:', savedUser)
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          console.log('Parsed user data:', userData)
          setUser(userData)
          setIsAuthenticated(true)
          console.log('User session restored successfully')
        } else {
          console.log('No saved user found')
        }
      } catch (error) {
        console.error('Error checking session:', error)
        localStorage.removeItem('kokifi_user')
      }
    }

    checkSession()
  }, [])

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const result: AuthResponse = await response.json()
      console.log('Login result:', result)

      if (result.success && result.data?.user) {
        console.log('Login successful, saving user to localStorage:', result.data.user)
        setUser(result.data.user)
        setIsAuthenticated(true)
        localStorage.setItem('kokifi_user', JSON.stringify(result.data.user))
        console.log('User saved to localStorage successfully')
        toast.success('¡Bienvenido de vuelta!')
        return true
      } else {
        console.log('Login failed:', result.error)
        toast.error(result.error || 'Credenciales inválidas')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Error de conexión')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result: AuthResponse = await response.json()
      console.log('Register result:', result)

      if (result.success && result.data?.user) {
        setUser(result.data.user)
        setIsAuthenticated(true)
        localStorage.setItem('kokifi_user', JSON.stringify(result.data.user))
        toast.success('¡Cuenta creada exitosamente!')
        return true
      } else {
        console.log('Register failed:', result.error)
        toast.error(result.error || 'Error al crear cuenta')
        return false
      }
    } catch (error) {
      console.error('Register error:', error)
      toast.error('Error de conexión')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('kokifi_user')
    toast.success('Sesión cerrada')
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    console.log('Updating user state:', updatedUser)
    console.log('Updating user - ticketsCount:', updatedUser.ticketsCount)
    console.log('Updating user - totalSpent:', updatedUser.totalSpent)
    console.log('Updating user - balance:', updatedUser.balance)
    setUser(updatedUser)
    localStorage.setItem('kokifi_user', JSON.stringify(updatedUser))
  }, [])

  // Escuchar eventos de actualización de usuario (cuando se compra un ticket)
  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent) => {
      console.log('🔄 useAuth: Usuario actualizado desde evento:', event.detail)
      updateUser(event.detail)
    }

    window.addEventListener('userUpdated', handleUserUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener)
    }
  }, [updateUser])

  const refreshUser = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/auth/user/${user.id}`)
      const result = await response.json()

      if (result.success && result.data.user) {
        updateUser(result.data.user)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }, [user, updateUser])

  const buyKoki = useCallback(async (amount: number): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Inicia sesión primero')
      return false
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/buy-koki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount
        }),
      })

      const result = await response.json()

      if (result.success && result.data?.user) {
        console.log('Buy KOKI - User data received:', result.data.user)
        console.log('Buy KOKI - User ticketsCount:', result.data.user.ticketsCount)
        console.log('Buy KOKI - User totalSpent:', result.data.user.totalSpent)
        updateUser(result.data.user)
        toast.success(result.data.message || '¡KOKI comprados exitosamente!')
        return true
      } else {
        console.log('Buy KOKI - Error response:', result)
        toast.error(result.error || 'Error al comprar KOKI')
        return false
      }
    } catch (error) {
      console.error('Buy KOKI error:', error)
      toast.error('Error de conexión')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, updateUser])

  const changeAvatar = useCallback(async (avatarUrl: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Inicia sesión primero')
      return false
    }

    console.log('Change avatar - user:', user, 'user.id:', user.id, 'type:', typeof user.id)

    setIsLoading(true)
    try {
      const response = await fetch('/api/change-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          avatarUrl
        }),
      })

      const result = await response.json()

      if (result.success && result.data?.user) {
        updateUser(result.data.user)
        toast.success('¡Avatar actualizado exitosamente!')
        return true
      } else {
        toast.error(result.error || 'Error al cambiar avatar')
        return false
      }
    } catch (error) {
      console.error('Change avatar error:', error)
      toast.error('Error de conexión')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, updateUser])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    buyKoki,
    changeAvatar,
  }
}
