'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Calendar, Hash, Trophy, Clock } from 'lucide-react'
import { User, Ticket as TicketType } from '@/types'

interface UserTicketsProps {
  user: User | null
}

export function UserTickets({ user }: UserTicketsProps) {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUserTickets = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Cargando tickets para usuario:', user?.id)
      const response = await fetch(`/api/user-tickets?userId=${user?.id}`)
      const data = await response.json()
      
      console.log('📊 Respuesta de la API:', data)
      
      if (data.success) {
        console.log('✅ Tickets cargados:', data.data.tickets)
        setTickets(data.data.tickets || [])
      } else {
        console.error('❌ Error en la respuesta:', data.error)
      }
    } catch (error) {
      console.error('❌ Error loading tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadUserTickets()
    }
  }, [user?.id, loadUserTickets])

  // Escuchar eventos de actualización de usuario (cuando se compra un ticket)
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log('🔄 Usuario actualizado, recargando tickets...')
      loadUserTickets()
    }

    window.addEventListener('userUpdated', handleUserUpdate)
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate)
    }
  }, [loadUserTickets])

  // Escuchar eventos específicos de actualización de tickets
  useEffect(() => {
    const handleTicketsUpdate = () => {
      console.log('🔄 Tickets actualizados, recargando...')
      loadUserTickets()
    }

    window.addEventListener('ticketsUpdated', handleTicketsUpdate)
    
    return () => {
      window.removeEventListener('ticketsUpdated', handleTicketsUpdate)
    }
  }, [loadUserTickets])

  if (!user) {
    return (
      <div className="text-center py-12">
        <Ticket className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h2 className="text-2xl font-bold text-white/60 mb-4">Inicia sesión</h2>
        <p className="text-white/50">Para ver tus tickets necesitas iniciar sesión</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-white/70">Cargando tus tickets...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 sm:pb-28">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img 
            key={user.pfpUrl} // Forzar re-renderizado cuando cambie el avatar
            src={user.pfpUrl} 
            alt={user.displayName}
            className="w-16 h-16 rounded-full border-2 border-primary-400 mr-4"
            onError={(e) => {
              e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username
            }}
          />
          <div>
            <h2 className="text-3xl font-bold text-white">{user.displayName}</h2>
            <p className="text-white/70">@{user.username}</p>
          </div>
        </div>
        <div className="flex justify-center space-x-6 text-center">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-400">{tickets.length}</div>
            <div className="text-white/70 text-sm">Tickets</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-400">{user.balance || '1000'}</div>
            <div className="text-white/70 text-sm">KOKI</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{user.totalSpent || '0'}</div>
            <div className="text-white/70 text-sm">Gastado</div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">Mis Tickets</h3>
        
        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <h4 className="text-lg font-medium text-white/60 mb-2">No tienes tickets</h4>
            <p className="text-white/50">¡Compra tu primer ticket para participar en la lotería!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">#{ticket.number}</div>
                      <div className="text-white/70 text-sm">Ticket ID: {ticket.id}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      {ticket.isWinner ? (
                        <>
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">¡GANADOR!</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-white/40" />
                          <span className="text-white/60">Esperando</span>
                        </>
                      )}
                    </div>
                    <div className="text-white/50 text-sm">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {ticket.purchaseTime ? new Date(ticket.purchaseTime * 1000).toLocaleDateString() : new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
