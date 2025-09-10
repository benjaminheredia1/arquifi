'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Shield } from 'lucide-react'

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-center py-8 sm:py-12 md:py-16 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-primary rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
            <span className="text-2xl sm:text-3xl md:text-4xl">🎰</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 sm:mb-4">
            <span className="modern-title">KoquiFI</span>
            <br />
            <span className="text-white">Lottery</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed px-2">
            La lotería descentralizada más avanzada del ecosistema Web3
            <br />
            <span className="text-lg text-white/70">
              Construida en <span className="text-blue-400 font-semibold">Base Network</span> con integración{' '}
              <span className="text-purple-400 font-semibold">Farcaster</span>
            </span>
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card p-4 sm:p-6 text-center"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center animate-modern-float">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
              Sorteos Automáticos
            </h3>
            <p className="text-white/70 text-xs sm:text-sm">
              Cada lunes sorteos transparentes con premios garantizados en KOKI
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card p-4 sm:p-6 text-center"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center animate-modern-glow">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
              Totalmente Seguro
            </h3>
            <p className="text-white/70 text-xs sm:text-sm">
              Smart contracts auditados en Base Network garantizan la seguridad de tus fondos
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center animate-modern-pulse">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
              Experiencia Premium
            </h3>
            <p className="text-white/70 text-xs sm:text-sm">
              Interfaz moderna con mini juegos y recompensas adicionales en KOKI
            </p>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 sm:mt-12"
        >
          <div className="inline-flex items-center space-x-2 text-white/60 text-xs sm:text-sm px-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-center">
              <span className="hidden sm:inline">Red: Base Sepolia • Tokens: KOKI • Precio: 10 KOKI por ticket</span>
              <span className="sm:hidden">Base • KOKI • 10 KOKI/ticket</span>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
