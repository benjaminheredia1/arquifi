'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Info, Shield, Zap, Users, Globe, Github, Twitter } from 'lucide-react'

interface InfoModalProps {
  onClose: () => void
}

export function InfoModal({ onClose }: InfoModalProps) {
  const features = [
    {
      icon: Shield,
      title: 'Totalmente Descentralizado',
      description: 'Smart contracts en Base Network garantizan transparencia y seguridad'
    },
    {
      icon: Zap,
      title: 'Sorteos Automáticos',
      description: 'Cada lunes a las 00:00 UTC con números aleatorios verificables'
    },
    {
      icon: Users,
      title: 'Integración Farcaster',
      description: 'Conecta tu cuenta de Farcaster para una experiencia social única'
    },
    {
      icon: Globe,
      title: 'Base Network',
      description: 'Construido sobre la red más rápida y económica de Ethereum'
    }
  ]

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
          className="modal-content max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Sobre KokiFi Lottery
                </h2>
                <p className="text-white/60 text-sm">
                  La primera lotería descentralizada en Base Network
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
            {/* Introduction */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center">
                <span className="text-3xl">🎰</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                KokiFi Lottery
              </h3>
              <p className="text-white/70 leading-relaxed max-w-2xl mx-auto">
                Una lotería descentralizada innovadora que combina la transparencia de blockchain 
                con la comunidad social de Farcaster. Construida en Base Network para ofrecer 
                transacciones rápidas y económicas.
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-white font-semibold mb-4">Características Principales</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-1">
                          {feature.title}
                        </h5>
                        <p className="text-white/70 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* How it Works */}
            <div>
              <h4 className="text-white font-semibold mb-4">¿Cómo Funciona?</h4>
              <div className="space-y-3">
                {[
                  'Selecciona un número del 1 al 50 y compra tu ticket con 10 KOKI',
                  'Cada lunes a las 00:00 UTC se realiza el sorteo automáticamente',
                  'Se seleccionan 5 números ganadores usando Chainlink VRF',
                  'Los premios se distribuyen equitativamente entre todos los ganadores',
                  'Puedes reclamar tus premios directamente desde tu wallet'
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-white/70 text-sm">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <h4 className="text-white font-semibold mb-4">Detalles Técnicos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-lg p-3 text-center">
                  <div className="text-primary-400 font-bold text-lg">Base</div>
                  <div className="text-white/60 text-xs">Network</div>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <div className="text-accent-400 font-bold text-lg">KOKI</div>
                  <div className="text-white/60 text-xs">Token</div>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <div className="text-secondary-400 font-bold text-lg">VRF</div>
                  <div className="text-white/60 text-xs">Randomness</div>
                </div>
                <div className="glass rounded-lg p-3 text-center">
                  <div className="text-green-400 font-bold text-lg">Farcaster</div>
                  <div className="text-white/60 text-xs">Social</div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Enlaces Útiles</h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Github className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">GitHub</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Twitter className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">Twitter</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Globe className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">Base Explorer</span>
                </a>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
