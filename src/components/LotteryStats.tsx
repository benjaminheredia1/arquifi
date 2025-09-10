'use client'

import { motion } from 'framer-motion'
import { Users, Ticket, Trophy, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { LotteryStats as StatsType } from '@/types'

interface LotteryStatsProps {
  stats: StatsType
}

export function LotteryStats({ stats }: LotteryStatsProps) {
  const statItems = [
    {
      icon: Users,
      label: 'Usuarios Activos',
      value: stats.activeUsers.toLocaleString(),
      color: 'text-primary-400',
      bgColor: 'from-primary-500/20 to-primary-600/20',
      borderColor: 'border-primary-500/30'
    },
    {
      icon: Ticket,
      label: 'Tickets Vendidos',
      value: stats.totalTickets.toLocaleString(),
      color: 'text-accent-400',
      bgColor: 'from-accent-500/20 to-accent-600/20',
      borderColor: 'border-accent-500/30'
    },
    {
      icon: Trophy,
      label: 'Sorteos Realizados',
      value: stats.totalLotteries.toLocaleString(),
      color: 'text-secondary-400',
      bgColor: 'from-secondary-500/20 to-secondary-600/20',
      borderColor: 'border-secondary-500/30'
    },
    {
      icon: DollarSign,
      label: 'Volumen Total',
      value: `${parseFloat(stats.totalVolume).toLocaleString()} KOKI`,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30'
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
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="inline-flex items-center space-x-2 mb-4"
          >
            <Activity className="w-6 h-6 text-accent-400" />
            <h2 className="text-2xl font-bold text-white">
              Estadísticas de la Lotería
            </h2>
          </motion.div>
          <p className="text-white/70">
            Datos en tiempo real de la plataforma
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`glass-card p-6 border ${item.borderColor} relative overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-50`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.bgColor} flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${item.color}`}>
                      {item.value}
                    </div>
                  </div>
                </div>
                
                <div className="text-white/80 font-medium text-sm">
                  {item.label}
                </div>
                
                {/* Animated indicator */}
                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-white/40 rounded-full"
                        animate={{
                          opacity: [0.4, 1, 0.4],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-xs">En tiempo real</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-4 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Sistema activo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
              <span>Base Network</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
              <span>Farcaster integrado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
