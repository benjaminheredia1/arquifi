'use client'

import { motion } from 'framer-motion'
import { Wallet, User, LogOut } from 'lucide-react'
import { User as UserType } from '@/types'

interface HeaderProps {
  user: UserType | null
  isAuthenticated: boolean
  isConnected: boolean
  address: string | undefined
  onConnectWallet: () => void
  onLogin: () => void
  onLogout: () => void
}

export function Header({
  user,
  isAuthenticated,
  isConnected,
  address,
  onConnectWallet,
  onLogin,
  onLogout
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 glass-card border-b border-white/10"
    >
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm sm:text-lg">K</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">KoquiFI Lottery</h1>
              <p className="text-xs text-white/60">Base Network</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-sm font-bold text-white">KokiFi</h1>
            </div>
          </motion.div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && user ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 sm:space-x-3"
              >
                {/* User Stats - Solo en desktop */}
                <div className="hidden lg:flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-white/60">Balance</div>
                    <div className="text-primary-400 font-semibold">
                      {user.balance} KOKI
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/60">Tickets</div>
                    <div className="text-accent-400 font-semibold">
                      {user.ticketsCount}
                    </div>
                  </div>
                </div>

                {/* User Avatar & Info */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    {user.pfpUrl ? (
                      <img
                        key={user.pfpUrl} // Forzar re-renderizado cuando cambie el avatar
                        src={user.pfpUrl}
                        alt={user.username}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username
                        }}
                      />
                    ) : (
                      <span className="text-xs sm:text-sm">👤</span>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-white font-medium text-xs sm:text-sm">
                      {user.displayName || user.username}
                    </div>
                    <div className="text-white/60 text-xs">
                      FID: {user.fid}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </motion.button>
              </motion.div>
            ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogin}
                  className="modern-button flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </motion.button>
            )}

            {/* Wallet Connection */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConnectWallet}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${
                isConnected
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {isConnected ? 'Conectado' : 'Conectar'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
