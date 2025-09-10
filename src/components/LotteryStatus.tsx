'use client'

import { motion } from 'framer-motion'
import { Users, Clock, Ticket, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface LotteryStatusProps {
  currentUsers: number
  maxUsers: number
  totalTickets: number
  timeUntilNext: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}

export function LotteryStatus({ 
  currentUsers, 
  maxUsers, 
  totalTickets, 
  timeUntilNext 
}: LotteryStatusProps) {
  const [isAlmostFull, setIsAlmostFull] = useState(false)
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const percentage = (currentUsers / maxUsers) * 100
    setIsAlmostFull(percentage >= 80)
    setIsFull(percentage >= 100)
  }, [currentUsers, maxUsers])

  const getStatusColor = () => {
    if (isFull) return 'text-red-400'
    if (isAlmostFull) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusIcon = () => {
    if (isFull) return AlertCircle
    if (isAlmostFull) return AlertCircle
    return CheckCircle
  }

  const getStatusText = () => {
    if (isFull) return 'Lotería Completa'
    if (isAlmostFull) return 'Casi Completa'
    return 'Disponible'
  }

  const StatusIcon = getStatusIcon()

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Status Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center`}>
              <StatusIcon className={`w-6 h-6 ${getStatusColor()}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Estado de la Lotería
              </h2>
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {currentUsers}/{maxUsers}
            </div>
            <div className="text-white/70 text-sm">Usuarios</div>
            
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentUsers / maxUsers) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className={`h-2 rounded-full ${
                  isFull ? 'bg-red-500' : 
                  isAlmostFull ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
              />
            </div>
          </motion.div>

          {/* Tickets Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-card p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {totalTickets}
            </div>
            <div className="text-white/70 text-sm">Tickets Vendidos</div>
          </motion.div>

          {/* Time Remaining */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="glass-card p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {timeUntilNext.days}d
            </div>
            <div className="text-white/70 text-sm">Hasta el Sorteo</div>
          </motion.div>

          {/* Pool Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="glass-card p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {totalTickets * 10}
            </div>
            <div className="text-white/70 text-sm">KOKI en Pool</div>
          </motion.div>
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center"
        >
          {isFull ? (
            <div className="glass-card p-6 max-w-2xl mx-auto border border-red-500/30">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">
                  Lotería Completa
                </h3>
              </div>
              <p className="text-white/70 text-sm">
                Esta semana la lotería ya está completa con {maxUsers} usuarios. 
                ¡Vuelve el próximo lunes para la siguiente ronda!
              </p>
            </div>
          ) : isAlmostFull ? (
            <div className="glass-card p-6 max-w-2xl mx-auto border border-yellow-500/30">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-yellow-400">
                  Casi Completa
                </h3>
              </div>
              <p className="text-white/70 text-sm">
                Solo quedan {maxUsers - currentUsers} espacios disponibles. 
                ¡Apúrate y compra tus tickets antes de que se agoten!
              </p>
            </div>
          ) : (
            <div className="glass-card p-6 max-w-2xl mx-auto border border-green-500/30">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-400">
                  Disponible
                </h3>
              </div>
              <p className="text-white/70 text-sm">
                Hay {maxUsers - currentUsers} espacios disponibles. 
                ¡Únete a la lotería y gana premios reales!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  )
}
