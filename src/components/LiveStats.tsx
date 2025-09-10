'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Activity, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

interface LiveStatsProps {
  user?: any
}

export function LiveStats({ user }: LiveStatsProps) {
  const [stats, setStats] = useState({
    onlineUsers: 1247,
    ticketsSold: 8934,
    totalVolume: 89340,
    lastWinner: '0x1234...5678'
  })

  useEffect(() => {
    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      setStats(prev => ({
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 10 - 5),
        ticketsSold: prev.ticketsSold + Math.floor(Math.random() * 5),
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 50),
        lastWinner: prev.lastWinner
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const statItems = [
    {
      icon: Users,
      label: 'Usuarios Online',
      value: stats.onlineUsers.toLocaleString(),
      change: '+12%',
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/20'
    },
    {
      icon: Activity,
      label: 'Tickets Vendidos',
      value: stats.ticketsSold.toLocaleString(),
      change: '+8%',
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/20'
    },
    {
      icon: TrendingUp,
      label: 'Volumen Total',
      value: `${stats.totalVolume.toLocaleString()} KOKI`,
      change: '+15%',
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/20'
    },
    {
      icon: Zap,
      label: 'Último Ganador',
      value: stats.lastWinner,
      change: 'Hace 2 min',
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-yellow-600/20'
    }
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="py-4 sm:py-6 md:py-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-3 sm:mb-4 md:mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="inline-flex items-center space-x-2 mb-2 sm:mb-3"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Estadísticas en Vivo</h3>
          </motion.div>
          <p className="text-white/60 text-xs sm:text-sm hidden sm:block">Datos actualizados en tiempo real</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-2 sm:p-3 md:p-4 relative overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-30`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-gradient-to-br ${item.bgColor} flex items-center justify-center`}>
                    <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${item.color}`} />
                  </div>
                  <span className={`text-xs ${item.color} font-medium hidden sm:block`}>
                    {item.change}
                  </span>
                </div>
                
                <div className={`text-sm sm:text-base md:text-lg font-bold ${item.color} mb-1`}>
                  {item.value}
                </div>
                <div className="text-white/60 text-xs">
                  {item.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-6"
          >
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {user.pfpUrl ? (
                      <img
                        key={user.pfpUrl} // Forzar re-renderizado cuando cambie el avatar
                        src={user.pfpUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm">👤</span>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {user.displayName || user.username}
                    </div>
                    <div className="text-white/60 text-xs">
                      {user.balance} KOKI • {user.ticketsCount} tickets
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm font-medium">
                    +{Math.floor(Math.random() * 100)} KOKI
                  </div>
                  <div className="text-white/60 text-xs">Esta semana</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
