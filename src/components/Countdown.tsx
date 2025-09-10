'use client'

import { motion } from 'framer-motion'
import { Clock, Calendar } from 'lucide-react'
import { useRealtimeCountdown } from '@/hooks/useRealtimeCountdown'

export function Countdown() {
  const countdown = useRealtimeCountdown()
  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="py-6 sm:py-8 md:py-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="inline-flex items-center space-x-2 mb-2 sm:mb-3 md:mb-4"
          >
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Próximo Sorteo
            </h2>
          </motion.div>
          <p className="text-white/70 text-sm sm:text-base hidden sm:block">
            El sorteo se realiza cada lunes a las 00:00 UTC
          </p>
        </div>

        {/* Countdown Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-3 sm:p-4 md:p-6 text-center"
          >
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-400 mb-1 sm:mb-2">
              {formatNumber(countdown.days)}
            </div>
            <div className="text-white/60 text-xs sm:text-sm font-medium">
              Días
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-3 sm:p-4 md:p-6 text-center"
          >
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-accent-400 mb-1 sm:mb-2">
              {formatNumber(countdown.hours)}
            </div>
            <div className="text-white/60 text-xs sm:text-sm font-medium">
              Horas
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-3 sm:p-4 md:p-6 text-center"
          >
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-secondary-400 mb-1 sm:mb-2">
              {formatNumber(countdown.minutes)}
            </div>
            <div className="text-white/60 text-xs sm:text-sm font-medium">
              Minutos
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-3 sm:p-4 md:p-6 text-center"
          >
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-400 mb-1 sm:mb-2">
              {formatNumber(countdown.seconds)}
            </div>
            <div className="text-white/60 text-xs sm:text-sm font-medium">
              Segundos
            </div>
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ duration: 1, delay: 0.9 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              <span className="text-white font-medium">Progreso del Sorteo</span>
            </div>
            <span className="text-white/60 text-sm">
              {Math.round((1 - countdown.total / (7 * 24 * 60 * 60)) * 100)}% completado
            </span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.round((1 - countdown.total / (7 * 24 * 60 * 60)) * 100)}%` 
              }}
              transition={{ duration: 1, delay: 1.1 }}
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </motion.div>
          </div>
          
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>Inicio del sorteo</span>
            <span>Próximo sorteo</span>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-6"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              Lotería activa - ¡Compra tus tickets ahora!
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
