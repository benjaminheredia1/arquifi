'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, Clock, Users, Trophy } from 'lucide-react'
import { Lottery, Countdown } from '@/types'

interface StatusModalProps {
  lottery: Lottery | null
  countdown: Countdown
  onClose: () => void
}

export function StatusModal({ lottery, countdown, onClose }: StatusModalProps) {
  if (!lottery) return null

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

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
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Estado de la Lotería
                </h2>
                <p className="text-white/60 text-sm">
                  Información del sorteo actual
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
          <div className="p-6 space-y-6">
            {/* Lottery Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-4 h-4 text-primary-400" />
                  <span className="text-white/80 text-sm font-medium">Lotería #{lottery.id}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {lottery.isActive ? 'Activa' : 'Finalizada'}
                </div>
                <div className="text-white/60 text-xs">
                  {lottery.isActive ? 'En progreso' : 'Completada'}
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-accent-400" />
                  <span className="text-white/80 text-sm font-medium">Tickets Vendidos</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {lottery.totalTickets}
                </div>
                <div className="text-white/60 text-xs">
                  de 50 disponibles
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-primary-400" />
                <span className="text-white font-medium">Tiempo Restante</span>
              </div>
              
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">
                    {formatNumber(countdown.days)}
                  </div>
                  <div className="text-white/60 text-xs">Días</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-400">
                    {formatNumber(countdown.hours)}
                  </div>
                  <div className="text-white/60 text-xs">Horas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-400">
                    {formatNumber(countdown.minutes)}
                  </div>
                  <div className="text-white/60 text-xs">Minutos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {formatNumber(countdown.seconds)}
                  </div>
                  <div className="text-white/60 text-xs">Segundos</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.round((1 - countdown.total / (7 * 24 * 60 * 60)) * 100)}%` 
                  }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                />
              </div>
            </div>

            {/* Prize Pool */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">Bote de Premios</h3>
                  <p className="text-white/60 text-sm">Total acumulado en este sorteo</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent-400">
                    {parseFloat(lottery.totalPrize || '0').toLocaleString()} KOKI
                  </div>
                  <div className="text-white/60 text-sm">
                    ≈ ${(parseFloat(lottery.totalPrize || '0') * 0.01).toFixed(2)} USD
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/60">Precio por ticket</div>
                  <div className="text-white font-medium">{lottery.ticketPrice || 10} KOKI</div>
                </div>
                <div>
                  <div className="text-white/60">Números ganadores</div>
                  <div className="text-white font-medium">5 números</div>
                </div>
              </div>
            </div>

            {/* Winning Numbers (if completed) */}
            {lottery.isCompleted && lottery.winningNumbers.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-white font-medium mb-4">Números Ganadores</h3>
                <div className="flex flex-wrap gap-2">
                  {lottery.winningNumbers.map((number, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-12 h-12 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    >
                      {number}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full button-primary"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
