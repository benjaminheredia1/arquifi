'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Zap } from 'lucide-react'

interface KokiEconomyProps {
  user: any
}

export function KokiEconomy({ user }: KokiEconomyProps) {
  const [kokiPrice, setKokiPrice] = useState(1.25)
  const [priceChange, setPriceChange] = useState(0.05)
  const [marketCap, setMarketCap] = useState(1250000)
  const [totalSupply, setTotalSupply] = useState(1000000)
  const [activeUsers, setActiveUsers] = useState(1250)
  const [transactions, setTransactions] = useState(15600)

  useEffect(() => {
    // Simular cambios en tiempo real del precio de KOKI
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.1
      setKokiPrice(prev => Math.max(0.5, prev + change))
      setPriceChange(change)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return price.toFixed(3)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-4"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mr-4 animate-kawaii-pulse">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold kawaii-title">💰 Economía KOKI</h2>
            <p className="text-white/70">La moneda más kawaii del universo</p>
          </div>
        </motion.div>
      </div>

      {/* Price Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-8 text-center"
        >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-4xl font-bold text-white">
              ${formatPrice(kokiPrice)}
            </div>
            <div className="text-sm text-white/70">Precio actual de KOKI</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          {priceChange >= 0 ? (
            <>
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-green-500 font-medium">
                +{formatPrice(priceChange)} (+{((priceChange / kokiPrice) * 100).toFixed(2)}%)
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-medium">
                {formatPrice(priceChange)} ({((priceChange / kokiPrice) * 100).toFixed(2)}%)
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            ${formatNumber(marketCap)}
          </div>
          <div className="text-white/70 text-sm">Market Cap</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {formatNumber(totalSupply)}
          </div>
          <div className="text-white/70 text-sm">Total Supply</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {formatNumber(activeUsers)}
          </div>
          <div className="text-white/70 text-sm">Usuarios Activos</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {formatNumber(transactions)}
          </div>
          <div className="text-white/70 text-sm">Transacciones</div>
        </motion.div>
      </div>

      {/* User Portfolio */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="kawaii-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Tu Portfolio KOKI
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {parseFloat(user.balance).toLocaleString()}
              </div>
              <div className="text-white/70 text-sm">KOKI Balance</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                ${(parseFloat(user.balance) * kokiPrice).toFixed(2)}
              </div>
              <div className="text-white/70 text-sm">Valor USD</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {user.ticketsCount}
              </div>
              <div className="text-white/70 text-sm">Tickets Comprados</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="kawaii-card p-6 mt-8"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Actividad en Vivo
        </h3>
        
        <div className="space-y-3">
          {[
            { user: '🐱 LunaKawaii', action: 'compró 5 tickets', amount: '2,500 KOKI', time: 'hace 2 min' },
            { user: '🦊 FoxPlayer', action: 'ganó el premio', amount: '10,000 KOKI', time: 'hace 5 min' },
            { user: '🐰 BunnyLuck', action: 'compró KOKI', amount: '1,000 KOKI', time: 'hace 8 min' },
            { user: '🐶 DogWinner', action: 'rascó tickets', amount: '500 KOKI', time: 'hace 12 min' },
            { user: '🐨 KoalaKing', action: 'compró 3 tickets', amount: '1,500 KOKI', time: 'hace 15 min' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{activity.user.split(' ')[0]}</span>
                <span className="text-white/70">{activity.action}</span>
                <span className="font-bold text-green-600">{activity.amount}</span>
              </div>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
