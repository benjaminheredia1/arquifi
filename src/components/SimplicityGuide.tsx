'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star, Heart, Zap, Target, Gift } from 'lucide-react'

export function SimplicityGuide() {
  const steps = [
    {
      number: 1,
      icon: Star,
      title: 'Inicia Sesión',
      description: 'Conecta tu cuenta de Farcaster en segundos',
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-yellow-600/20'
    },
    {
      number: 2,
      icon: Target,
      title: 'Elige tu Número',
      description: 'Selecciona del 1 al 50 tu número de la suerte',
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/20'
    },
    {
      number: 3,
      icon: Zap,
      title: 'Compra tu Ticket',
      description: 'Solo 10 KOKI por ticket, máximo 5 por usuario',
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/20'
    },
    {
      number: 4,
      icon: Gift,
      title: '¡Gana Premios!',
      description: 'Cada lunes se sortean los premios automáticamente',
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/20'
    }
  ]

  const motivations = [
    {
      icon: Heart,
      title: 'Comunidad Farcaster',
      description: 'Únete a la comunidad más activa de Web3',
      color: 'text-pink-400'
    },
    {
      icon: Star,
      title: 'Premios Reales',
      description: 'Gana KOKI reales que puedes usar',
      color: 'text-yellow-400'
    },
    {
      icon: Zap,
      title: 'Sorteos Semanales',
      description: 'Nuevas oportunidades cada semana',
      color: 'text-blue-400'
    }
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="py-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="inline-flex items-center space-x-2 mb-4"
          >
            <Heart className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">
              Simplicidad y Motivación
            </h2>
          </motion.div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Diseñado para ser fácil de usar y motivar a la comunidad de Farcaster
          </p>
        </div>

        {/* Steps */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-white mb-8 text-center">
            Cómo Funciona (Súper Fácil)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card p-6 text-center relative overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} opacity-30`}></div>
                
                <div className="relative z-10">
                  {/* Step Number */}
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${step.bgColor} rounded-2xl flex items-center justify-center`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-20"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Motivations */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            ¿Por qué Participar?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {motivations.map((motivation, index) => (
              <motion.div
                key={motivation.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center`}>
                  <motivation.icon className={`w-8 h-8 ${motivation.color}`} />
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2">
                  {motivation.title}
                </h4>
                <p className="text-white/70 text-sm leading-relaxed">
                  {motivation.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="mt-12 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Únete a la Comunidad</h3>
                <p className="text-white/70">Farcaster + KoquiFI = Diversión Garantizada</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <div className="text-2xl font-bold text-pink-400">1-50</div>
                <div className="text-white/60 text-sm">Usuarios</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">5</div>
                <div className="text-white/60 text-sm">Tickets Máx</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">10</div>
                <div className="text-white/60 text-sm">KOKI c/u</div>
              </div>
            </div>
            
            <p className="text-white/80 text-sm leading-relaxed">
              "Una lotería diseñada para la comunidad de Farcaster. 
              Simple, transparente y divertida. ¡Únete y gana con nosotros!"
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
