'use client'

import { motion } from 'framer-motion'
import { Ticket, Star, AlertCircle } from 'lucide-react'

interface UnscratchedTicketsIndicatorProps {
  unscratchedKoTicketsCount: number
  onScratchClick: () => void
}

export function UnscratchedTicketsIndicator({ 
  unscratchedKoTicketsCount, 
  onScratchClick 
}: UnscratchedTicketsIndicatorProps) {
  if (unscratchedKoTicketsCount === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-20 right-4 z-40"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onScratchClick}
        className="glass-card p-4 cursor-pointer border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            {unscratchedKoTicketsCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-xs font-bold">
                  {unscratchedKoTicketsCount > 9 ? '9+' : unscratchedKoTicketsCount}
                </span>
              </motion.div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-bold text-white">
                ¡Tienes {unscratchedKoTicketsCount} KoTicket{unscratchedKoTicketsCount > 1 ? 's' : ''} sin rascar!
              </h3>
            </div>
            <p className="text-xs text-white/70">
              Haz clic para rascar y ganar 2-10 KOKI
            </p>
          </div>
          
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-yellow-400"
          >
            <AlertCircle className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
