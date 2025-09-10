'use client'

import { motion } from 'framer-motion'
import { Ticket, Star, Calendar, Zap } from 'lucide-react'
import { KoTicket } from '@/types'

interface KoTicketsListProps {
  koTickets: KoTicket[]
  onScratch: (ticketId: string) => void
}

export function KoTicketsList({ koTickets, onScratch }: KoTicketsListProps) {
  const unscratchedTickets = koTickets.filter(ticket => !ticket.isScratched)
  const scratchedTickets = koTickets.filter(ticket => ticket.isScratched)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Mis KoTickets</h2>
        <p className="text-white/70">
          Rasca tus KoTickets y gana entre 1-10 KOKI
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {unscratchedTickets.length}
          </div>
          <div className="text-white/70 text-sm">Sin Rascar</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {scratchedTickets.length}
          </div>
          <div className="text-white/70 text-sm">Rascados</div>
        </div>
      </div>

      {/* Unscratched Tickets */}
      {unscratchedTickets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span>KoTickets Sin Rascar</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unscratchedTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => onScratch(ticket.id)}
                className="glass-card p-4 cursor-pointer border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    KoTicket #{ticket.id.slice(-4)}
                  </div>
                  <div className="text-xs text-white/60 mb-2">
                    {new Date(ticket.purchaseTime).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-yellow-400 font-medium">
                    ¡Toca para rascar!
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Scratched Tickets */}
      {scratchedTickets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-green-400" />
            <span>KoTickets Rascados</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {scratchedTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass-card p-4 border border-green-500/30"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    KoTicket #{ticket.id.slice(-4)}
                  </div>
                  <div className="text-xs text-white/60 mb-2">
                    {new Date(ticket.purchaseTime).toLocaleDateString()}
                  </div>
                  {ticket.prizeAmount && ticket.prizeAmount > 0 ? (
                    <div className="text-sm font-bold text-green-400">
                      +{ticket.prizeAmount} KOKI
                    </div>
                  ) : (
                    <div className="text-sm text-white/60">
                      Sin premio
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {koTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No tienes KoTickets
          </h3>
          <p className="text-white/70">
            ¡Obtén KoTickets GRATIS para rascar y ganar KOKI!<br/>
            <span className="text-blue-300 text-sm">💡 Necesitas al menos 100 KOKI para acceder</span>
          </p>
        </div>
      )}
    </div>
  )
}
