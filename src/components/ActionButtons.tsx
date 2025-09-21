'use client'

import { motion } from 'framer-motion'
import { Ticket, BarChart3, Trophy, Info } from 'lucide-react'

interface ActionButtonsProps {
  onBuyTicket: () => void
  onViewStatus: () => void
  onViewResults: () => void
  onViewInfo: () => void
}

export function ActionButtons({
  onBuyTicket,
  onViewStatus,
  onViewResults,
  onViewInfo
}: ActionButtonsProps) {
  const buttons = [
    {
      icon: Ticket,
      label: 'Comprar Ticket',
      description: 'Selecciona tu número de la suerte',
      onClick: onBuyTicket,
      gradient: 'from-primary-500 to-primary-600',
      hoverGradient: 'from-primary-400 to-primary-500',
      iconColor: 'text-white',
      delay: 0.1
    },
    {
      icon: BarChart3,
      label: 'Ver Estado',
      description: 'Información del sorteo actual',
      onClick: onViewStatus,
      gradient: 'from-accent-500 to-accent-600',
      hoverGradient: 'from-accent-400 to-accent-500',
      iconColor: 'text-white',
      delay: 0.2
    },
    {
      icon: Trophy,
      label: 'Resultados',
      description: 'Historial de sorteos pasados',
      onClick: onViewResults,
      gradient: 'from-secondary-500 to-secondary-600',
      hoverGradient: 'from-secondary-400 to-secondary-500',
      iconColor: 'text-white',
      delay: 0.3
    },
    {
      icon: Info,
      label: 'Información',
      description: 'Sobre ArquiFI Lottery',
      onClick: onViewInfo,
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-400 to-green-500',
      iconColor: 'text-white',
      delay: 0.4
    }
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="py-4 sm:py-6 md:py-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-3 sm:mb-4 md:mb-6">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 md:mb-3"
          >
            Acciones Disponibles
          </motion.h2>
          <p className="text-white/70 text-xs sm:text-sm hidden sm:block">
            Explora todas las funcionalidades de KoquiFI Lottery
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {buttons.map((button, index) => (
            <motion.button
              key={button.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + button.delay }}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={button.onClick}
              className={`group relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 text-left transition-all duration-300 bg-gradient-to-br ${button.gradient} hover:bg-gradient-to-br ${button.hoverGradient} shadow-lg hover:shadow-xl`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1 sm:mb-2 md:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <button.icon className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${button.iconColor}`} />
                  </div>
                  <motion.div
                    className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-white text-xs">→</span>
                  </motion.div>
                </div>

                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
                  {button.label}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed hidden sm:block">
                  {button.description}
                </p>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-6 sm:mt-8 md:mt-12 text-center"
        >
          <div className="glass-card p-3 sm:p-4 md:p-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center">
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary-400">1-50</div>
                <div className="text-white/60 text-xs sm:text-sm">Números disponibles</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-accent-400">10 KOKI</div>
                <div className="text-white/60 text-xs sm:text-sm">Precio por ticket</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">5</div>
                <div className="text-white/60 text-xs sm:text-sm">Números ganadores</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
