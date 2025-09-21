'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Coins, 
  Star, 
  Lock, 
  Unlock,
  TrendingUp,
  Gift,
  Zap,
  Target
} from 'lucide-react'

interface KokiProgressProps {
  userId: number
  onStatusUpdate?: (status: any) => void
}

interface KokiStatus {
  currentBalance: number
  roulette: {
    canPlay: boolean
    requiredKoki: number
    costPerPlay: number
    progressPercentage: number
  }
  system: {
    kokiPerTicket: number
    dailyBonus: number
    rouletteCost: number
  }
  recentTransactions: Array<{
    id: number
    type: string
    amount: number
    source: string
    description: string
    date: string
  }>
}

export function KokiProgress({ userId, onStatusUpdate }: KokiProgressProps) {
  const [kokiStatus, setKokiStatus] = useState<KokiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKokiStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/koki-status?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch KOKI status')
      }
      
      const data = await response.json()
      setKokiStatus(data)
      onStatusUpdate?.(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching KOKI status:', err)
      setError('Error loading KOKI status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchKokiStatus()
    }
  }, [userId])

  useEffect(() => {
    const handler = () => {
      if (!loading) fetchKokiStatus()
    }
    window.addEventListener('kokiBalanceUpdated', handler)
    window.addEventListener('koticketsUpdated', handler)
    // También escuchar potencial actualización de usuario
    window.addEventListener('userUpdated', handler)
    return () => {
      window.removeEventListener('kokiBalanceUpdated', handler)
      window.removeEventListener('koticketsUpdated', handler)
      window.removeEventListener('userUpdated', handler)
    }
  }, [loading, userId])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl p-6 border border-yellow-500/20">
        <div className="animate-pulse">
          <div className="h-6 bg-yellow-500/20 rounded mb-4"></div>
          <div className="h-4 bg-yellow-500/20 rounded mb-2"></div>
          <div className="h-4 bg-yellow-500/20 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error || !kokiStatus) {
    return (
      <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
        <div className="flex items-center space-x-2 text-red-400">
          <Star className="w-5 h-5" />
          <span>{error || 'Failed to load KOKI status'}</span>
        </div>
      </div>
    )
  }

  const { currentBalance, roulette, system } = kokiStatus
  const remainingKoki = Math.max(0, roulette.requiredKoki - currentBalance)
  const ticketsNeeded = Math.ceil(remainingKoki / system.kokiPerTicket)

  return (
    <div className="space-y-4">
      {/* KOKI Balance Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">KOKI Points</h3>
              <p className="text-yellow-400 text-sm">Your reward balance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">{currentBalance}</div>
            <div className="text-yellow-300/60 text-sm">Available</div>
          </div>
        </div>

        {/* Progress toward roulette */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Roulette Progress</span>
            <span className="text-yellow-400 font-medium">
              {currentBalance} / {roulette.requiredKoki} KOKI
            </span>
          </div>
          
          <div className="w-full bg-yellow-900/30 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full"
              initial={{ inlineSize: 0 }}
              animate={{ inlineSize: `${Math.min(roulette.progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              {roulette.canPlay ? (
                <>
                  <Unlock className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Roulette Unlocked!</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white/60" />
                  <span className="text-white/60">Need {remainingKoki} more KOKI</span>
                </>
              )}
            </div>
            <span className="text-yellow-400">{roulette.progressPercentage}%</span>
          </div>
        </div>
      </motion.div>

      {/* Earning Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>How to Earn KOKI</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-3 bg-blue-500/10 rounded-lg p-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Buy Tickets</div>
              <div className="text-blue-400 text-xs">+{system.kokiPerTicket} KOKI per ticket</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-green-500/10 rounded-lg p-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Daily Login</div>
              <div className="text-green-400 text-xs">+{system.dailyBonus} KOKI per day</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Roulette Status */}
      {!roulette.canPlay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <h4 className="text-purple-400 font-semibold">Unlock Super Roulette</h4>
          </div>
          
          <div className="text-white/80 text-sm mb-3">
            Buy {ticketsNeeded} more ticket{ticketsNeeded !== 1 ? 's' : ''} to unlock the roulette and win amazing prizes!
          </div>
          
          <div className="bg-purple-600/20 rounded-lg p-3">
            <div className="text-purple-300 text-xs font-medium mb-1">Cost per play:</div>
            <div className="text-purple-400 font-bold">{roulette.costPerPlay} KOKI</div>
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {kokiStatus.recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span>Recent Activity</span>
          </h4>
          
          <div className="space-y-2">
            {kokiStatus.recentTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.type === 'earned' ? 'bg-green-400' : 
                    tx.type === 'spent' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-white/70 text-sm">{tx.description}</span>
                </div>
                <span className={`text-sm font-medium ${
                  tx.type === 'earned' ? 'text-green-400' : 
                  tx.type === 'spent' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {tx.type === 'spent' ? '-' : '+'}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}