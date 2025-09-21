'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Calendar, 
  Wallet, 
  Trophy, 
  Ticket, 
  TrendingUp,
  Award,
  Star,
  Settings,
  Coins,
  Zap
} from 'lucide-react'
import { User as UserType } from '@/types'
import { KokiProgress } from '@/components/KokiProgress'

interface UserProfileProps {
  user: UserType | null
  onBuyKoki?: () => void
  onChangeAvatar?: () => void
  onPlayGame?: () => void
  onBuyTicket?: () => void
  onPlayRoulette?: () => void
}

export function UserProfile({ user, onBuyKoki, onChangeAvatar, onPlayGame, onBuyTicket, onPlayRoulette }: UserProfileProps) {
  const [stats, setStats] = useState({
    totalWins: 0,
    winRate: 0,
    favoriteNumber: null as number | null,
    joinDate: ''
  })
  const [kokiStatus, setKokiStatus] = useState<any>(null)

  useEffect(() => {
    if (user) {
      // Simular estadísticas del usuario
      setStats({
        totalWins: Math.floor(Math.random() * 3), // 0-2 wins
        winRate: user.ticketsCount > 0 ? Math.floor((Math.random() * 20) + 5) : 0, // 5-25%
        favoriteNumber: user.ticketsCount > 0 ? Math.floor(Math.random() * 50) + 1 : null,
        joinDate: user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })
    }
  }, [user])

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h2 className="text-2xl font-bold text-white/60 mb-4">Inicia sesión</h2>
        <p className="text-white/50">Para ver tu perfil necesitas iniciar sesión</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 sm:pb-24">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl p-8 mb-8 border border-white/10"
      >
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img 
              key={user.pfpUrl} // Forzar re-renderizado cuando cambie el avatar
              src={user.pfpUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username} 
              alt={user.displayName}
              className="w-24 h-24 rounded-full border-4 border-white/20"
              onLoad={() => console.log('Avatar loaded successfully:', user.pfpUrl)}
              onError={(e) => {
                console.log('Avatar failed to load:', user.pfpUrl, 'fallback to:', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username)
                e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username
              }}
            />
            {user.isVerified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{user.displayName}</h1>
              {user.isVerified && (
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                  Verificado
                </span>
              )}
            </div>
            <p className="text-white/70 text-lg mb-2">@{user.username}</p>
            <div className="flex items-center space-x-4 text-white/60">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Se unió el {stats.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KOKI Progress */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <KokiProgress 
            userId={user.id} 
            onStatusUpdate={setKokiStatus}
          />
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={onBuyKoki}
          className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-3 sm:p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium text-sm sm:text-base">Comprar KOKI</div>
              <div className="text-white/60 text-xs sm:text-sm">Recarga tu balance</div>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onPlayRoulette}
          disabled={!kokiStatus?.roulette?.canPlay}
          className={`rounded-xl p-3 sm:p-4 border transition-all ${
            kokiStatus?.roulette?.canPlay 
              ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-500/50' 
              : 'bg-gray-500/20 border-gray-500/30 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
              kokiStatus?.roulette?.canPlay 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                : 'bg-gray-500'
            }`}>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium text-sm sm:text-base">
                {kokiStatus?.roulette?.canPlay ? 'Jugar Ruleta' : 'Ruleta Bloqueada'}
              </div>
              <div className="text-white/60 text-xs sm:text-sm">
                {kokiStatus?.roulette?.canPlay 
                  ? `Cuesta ${kokiStatus.system?.rouletteCost || 10} KOKI` 
                  : `Necesitas ${kokiStatus?.roulette?.requiredKoki || 25} KOKI`
                }
              </div>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onChangeAvatar}
          className="bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-xl p-3 sm:p-4 border border-pink-500/30 hover:border-pink-500/50 transition-all"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium text-sm sm:text-base">Cambiar Avatar</div>
              <div className="text-white/60 text-xs sm:text-sm">Personaliza tu perfil</div>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onPlayGame}
          className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-3 sm:p-4 border border-green-500/30 hover:border-green-500/50 transition-all"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium text-sm sm:text-base">Rascar Tickets</div>
              <div className="text-white/60 text-xs sm:text-sm">¡Juega y gana!</div>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onBuyTicket}
          className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-3 sm:p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium text-sm sm:text-base">Comprar Tickets</div>
              <div className="text-white/60 text-xs sm:text-sm">Participa en la lotería</div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{user.balance || '1000'}</div>
              <div className="text-white/70 text-sm">KOKI Balance</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{user.ticketsCount}</div>
              <div className="text-white/70 text-sm">Tickets Comprados</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalWins}</div>
              <div className="text-white/70 text-sm">Victorias</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
              <div className="text-white/70 text-sm">Tasa de Éxito</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
            <span>Estadísticas</span>
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm sm:text-base">Total Gastado:</span>
              <span className="text-white font-medium text-sm sm:text-base">{user.totalSpent} KOKI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm sm:text-base">Número Favorito:</span>
              <span className="text-white font-medium text-sm sm:text-base">
                {stats.favoriteNumber ? `#${stats.favoriteNumber}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm sm:text-base">Miembro desde:</span>
              <span className="text-white font-medium text-sm sm:text-base">{stats.joinDate}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center space-x-2">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-accent-400" />
            <span>Información de Cuenta</span>
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm sm:text-base">FID:</span>
              <span className="text-white font-medium text-sm sm:text-base">{user.fid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm sm:text-base">Dirección:</span>
              <span className="text-white font-medium font-mono text-xs sm:text-sm">
                {user?.address && user.address.length > 10 ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'No disponible'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm sm:text-base">Estado:</span>
              <span className="text-green-400 font-medium text-sm sm:text-base">Activo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
