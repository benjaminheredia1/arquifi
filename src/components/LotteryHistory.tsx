'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Calendar, Users, Coins, ChevronLeft, ChevronRight } from 'lucide-react'

interface LotteryHistoryProps {
  user: any
}

interface LotteryWithWinner {
  id: string
  startDate: string
  endDate: string
  winningNumbers: number[]
  totalTickets: number
  totalPrize: string
  status: string
  winner: string
  winnerInfo?: {
    id: string
    username: string
    displayName: string
    pfpUrl: string
  }
}

export function LotteryHistory({ user }: LotteryHistoryProps) {
  const [lotteries, setLotteries] = useState<LotteryWithWinner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadLotteryHistory()
  }, [currentPage])

  const loadLotteryHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/lottery-history?page=${currentPage}&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        setLotteries(data.data.lotteries)
        setTotalPages(data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error loading lottery history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isUserWinner = (lottery: LotteryWithWinner) => {
    return user && lottery.winner === user.id
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-white/70">Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-12 h-12 text-yellow-400 mr-4" />
          <div>
            <h2 className="text-3xl font-bold text-white">Historial de Sorteos</h2>
            <p className="text-white/70">Todos los ganadores desde agosto 2024</p>
          </div>
        </div>
      </div>

      {/* Lotteries List */}
      <div className="space-y-4">
        {lotteries.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <h4 className="text-lg font-medium text-white/60 mb-2">No hay sorteos</h4>
            <p className="text-white/50">Aún no se han realizado sorteos</p>
          </div>
        ) : (
          lotteries.map((lottery, index) => (
            <motion.div
              key={lottery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border p-6 transition-all ${
                isUserWinner(lottery)
                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isUserWinner(lottery)
                      ? 'bg-yellow-500/20'
                      : 'bg-white/10'
                  }`}>
                    <Trophy className={`w-6 h-6 ${
                      isUserWinner(lottery) ? 'text-yellow-400' : 'text-white/60'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Sorteo del {formatDate(lottery.endDate)}
                    </h3>
                    <div className="flex items-center space-x-4 text-white/70 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(lottery.startDate)} - {formatDate(lottery.endDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isUserWinner(lottery) && (
                  <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                    ¡GANASTE!
                  </div>
                )}
              </div>

              {/* Winning Numbers */}
              <div className="mb-4">
                <h4 className="text-white/80 font-medium mb-2">Números Ganadores:</h4>
                <div className="flex flex-wrap gap-2">
                  {lottery.winningNumbers.map((number, idx) => (
                    <div
                      key={idx}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        isUserWinner(lottery)
                          ? 'bg-yellow-400 text-black'
                          : 'bg-primary-500 text-white'
                      }`}
                    >
                      {number}
                    </div>
                  ))}
                </div>
              </div>

              {/* Winner Info */}
              {lottery.winnerInfo && (
                <div className="mb-4">
                  <h4 className="text-white/80 font-medium mb-2">Ganador:</h4>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={lottery.winnerInfo.pfpUrl} 
                      alt={lottery.winnerInfo.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-white font-medium">{lottery.winnerInfo.displayName}</div>
                      <div className="text-white/60 text-sm">@{lottery.winnerInfo.username}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-sm">Tickets</span>
                  </div>
                  <div className="text-white font-bold">{lottery.totalTickets}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Coins className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-sm">Premio</span>
                  </div>
                  <div className="text-white font-bold">{lottery.totalPrize} KOKI</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Trophy className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-sm">Estado</span>
                  </div>
                  <div className="text-green-400 font-bold">Completado</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <span className="text-white/70">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
