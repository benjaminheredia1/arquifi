'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Clock, Eye, CheckCircle, Lock } from 'lucide-react'

export function TrustIndicator() {
  const trustFeatures = [
    {
      icon: Shield,
      title: '100% Transparente',
      description: 'Todos los sorteos son verificables y públicos',
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/20'
    },
    {
      icon: Users,
      title: 'Máximo 50 Usuarios',
      description: 'Lotería exclusiva y justa para todos',
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/20'
    },
    {
      icon: Clock,
      title: 'Sorteos Semanales',
      description: 'Cada lunes a las 00:00 UTC',
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/20'
    },
    {
      icon: Eye,
      title: 'Números Visibles',
      description: 'Puedes ver qué números están disponibles',
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-yellow-600/20'
    },
    {
      icon: CheckCircle,
      title: 'Usuarios Verificados',
      description: 'Solo usuarios reales de Farcaster',
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/20 to-indigo-600/20'
    },
    {
      icon: Lock,
      title: 'Sin Bots',
      description: 'Sistema anti-bot para equidad total',
      color: 'text-red-400',
      bgColor: 'from-red-500/20 to-red-600/20'
    }
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="py-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center space-x-2 mb-4"
          >
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">
              Confianza y Transparencia
            </h2>
          </motion.div>
          <p className="text-white/70 max-w-2xl mx-auto">
            KoquiFI Lottery está diseñado para generar confianza a través de la transparencia total y la simplicidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`glass-card p-6 relative overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-30`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-white/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">KoquiFI Lottery</h3>
                <p className="text-white/70">Certificado de Confianza</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-400">100%</div>
                <div className="text-white/60 text-sm">Transparente</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">50</div>
                <div className="text-white/60 text-sm">Usuarios Máximo</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-white/80 text-sm">
                "Diseñado para generar confianza a través de la simplicidad y transparencia total. 
                Cada sorteo es verificable y cada usuario tiene las mismas oportunidades."
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
