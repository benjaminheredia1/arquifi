'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Calendar, Users, Award } from 'lucide-react'

interface ResultsModalProps {
  onClose: () => void
}

export function ResultsModal({ onClose }: ResultsModalProps) {
  // Mock data - in real app this would come from API
  const results = [
    {
      id: 1,
      date: '2024-01-22',
      winningNumbers: [7, 25, 42, 15, 33],
      winners: ['UsuarioDemo1', 'LuckyPlayer'],
      totalPrize: '100 KOKI',
      ticketsSold: 10
    },
    {
      id: 2,
      date: '2024-01-15',
      winningNumbers: [3, 18, 29, 41, 47],
      winners: ['Winner2024'],
      totalPrize: '50 KOKI',
      ticketsSold: 5
    }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="modal-content max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Resultados de Sorteos
                </h2>
                <p className="text-white/60 text-sm">
                  Historial de números ganadores y premios
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{result.id}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          Sorteo #{result.id}
                        </h3>
                        <div className="flex items-center space-x-2 text-white/60 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(result.date).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent-400">
                        {result.totalPrize}
                      </div>
                      <div className="text-white/60 text-sm">Bote total</div>
                    </div>
                  </div>

                  {/* Winning Numbers */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-3">Números Ganadores</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.winningNumbers.map((number, numIndex) => (
                        <motion.div
                          key={numIndex}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.1 + numIndex * 0.1 }}
                          className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                        >
                          {number}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Winners */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-3">Ganadores</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.winners.map((winner, winnerIndex) => (
                        <motion.div
                          key={winnerIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + winnerIndex * 0.1 }}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg"
                        >
                          <Award className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium text-sm">
                            {winner}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-sm">Tickets vendidos:</span>
                      <span className="text-white font-medium">{result.ticketsSold}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-sm">Ganadores:</span>
                      <span className="text-white font-medium">{result.winners.length}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full button-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
