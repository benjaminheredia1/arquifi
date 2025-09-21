'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  PieChart,
  Calendar,
  Coins,
  Trophy,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface EconomyStats {
  weeklyIncome: number
  totalTicketsSold: number
  averageTicketPrice: number
  capitalBase: number
  prizeFund: number
  netProfit: number
  activeUsers: number
  rouletteActivations: number
  totalKokiCirculation: number
}

export function EconomyDashboard() {
  const [stats, setStats] = useState<EconomyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState({
    current: new Date().toISOString().split('T')[0],
    target: 1000,
    actual: 0
  })

  useEffect(() => {
    fetchEconomyStats()
  }, [])

  const fetchEconomyStats = async () => {
    try {
      setLoading(true)
      
      // Simular datos por ahora - en implementación real vendría de API
      const mockStats: EconomyStats = {
        weeklyIncome: 2500, // Bs 2,500 de 500 tickets vendidos
        totalTicketsSold: 500,
        averageTicketPrice: 5,
        capitalBase: 1000, // 40% del income
        prizeFund: 1000, // 40% del income
        netProfit: 500, // 20% del income
        activeUsers: 150,
        rouletteActivations: 75,
        totalKokiCirculation: 12500
      }
      
      setStats(mockStats)
      setWeekData(prev => ({
        ...prev,
        actual: mockStats.totalTicketsSold
      }))
    } catch (error) {
      console.error('Error fetching economy stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center text-white/60">
          Error loading economy dashboard
        </div>
      </div>
    )
  }

  const progressPercentage = (weekData.actual / weekData.target) * 100
  const isOnTrack = progressPercentage >= 60 // 60% by mid-week is good

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <PieChart className="w-8 h-8 text-blue-400" />
          Dashboard Económico
        </h1>
        <div className="text-white/60 text-sm">
          Semana actual: {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>

      {/* Weekly Progress Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border ${
          isOnTrack 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-orange-500/10 border-orange-500/20'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isOnTrack ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-orange-400" />
          )}
          <div>
            <h3 className={`font-semibold ${isOnTrack ? 'text-green-400' : 'text-orange-400'}`}>
              {isOnTrack ? 'Meta semanal en buen camino' : 'Atención: Meta semanal rezagada'}
            </h3>
            <p className="text-white/70 text-sm">
              {weekData.actual} / {weekData.target} tickets vendidos ({progressPercentage.toFixed(1)}%)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">Bs {stats.weeklyIncome.toLocaleString()}</div>
              <div className="text-green-300/60 text-sm">Ingresos Semanales</div>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            {stats.totalTicketsSold} tickets × Bs {stats.averageTicketPrice}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">Bs {stats.capitalBase.toLocaleString()}</div>
              <div className="text-blue-300/60 text-sm">Capital Base (40%)</div>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            Fondo de estabilidad protegido
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">Bs {stats.netProfit.toLocaleString()}</div>
              <div className="text-purple-300/60 text-sm">Ganancia Neta (20%)</div>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            Beneficio semanal para reinversión
          </div>
        </motion.div>
      </div>

      {/* Distribution Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-yellow-400" />
          Distribución de Fondos Semanal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Capital Base</span>
              <span className="text-blue-400 font-medium">40%</span>
            </div>
            <div className="w-full bg-blue-900/30 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <div className="text-blue-400 text-sm">Bs {stats.capitalBase.toLocaleString()}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Fondo de Premios</span>
              <span className="text-yellow-400 font-medium">40%</span>
            </div>
            <div className="w-full bg-yellow-900/30 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <div className="text-yellow-400 text-sm">Bs {stats.prizeFund.toLocaleString()}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Ganancia Neta</span>
              <span className="text-purple-400 font-medium">20%</span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
            <div className="text-purple-400 text-sm">Bs {stats.netProfit.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>

      {/* User Engagement & KOKI System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stats.activeUsers}</div>
              <div className="text-cyan-400 text-sm">Usuarios Activos</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stats.totalKokiCirculation.toLocaleString()}</div>
              <div className="text-yellow-400 text-sm">KOKI en Circulación</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stats.rouletteActivations}</div>
              <div className="text-purple-400 text-sm">Ruletas Desbloqueadas</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{Math.round(progressPercentage)}%</div>
              <div className="text-green-400 text-sm">Progreso Semanal</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">Recomendaciones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-white font-medium">Estrategias de Crecimiento:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Incrementar bonificaciones KOKI para fomentar compras</li>
              <li>• Implementar eventos especiales de fin de semana</li>
              <li>• Agregar niveles de usuario para mayor engagement</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-white font-medium">Control de Riesgos:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Mantener capital base intacto (40%)</li>
              <li>• Monitorear frecuencia de uso de ruleta</li>
              <li>• Ajustar premios según fondo disponible</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}