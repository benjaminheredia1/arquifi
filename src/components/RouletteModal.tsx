'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Coins, 
  Trophy, 
  Gift, 
  Star,
  Zap,
  Crown,
  Diamond
} from 'lucide-react'

interface Prize {
  id: number
  name: string
  value: number
  color: string
  icon: React.ReactNode
  type: 'koki' | 'ticket' | 'special'
}

interface RouletteModalProps {
  isOpen: boolean
  onClose: () => void
  onWin?: (prize: Prize) => void
  userId?: number
}

const prizes: Prize[] = [
  { id: 1, name: '100 KOKI', value: 100, color: '#F59E0B', icon: <Coins className="w-6 h-6" />, type: 'koki' },
  { id: 2, name: '1 Ticket', value: 1, color: '#10B981', icon: <Trophy className="w-6 h-6" />, type: 'ticket' },
  { id: 3, name: '50 KOKI', value: 50, color: '#F59E0B', icon: <Coins className="w-6 h-6" />, type: 'koki' },
  { id: 4, name: 'Sorpresa', value: 0, color: '#8B5CF6', icon: <Gift className="w-6 h-6" />, type: 'special' },
  { id: 5, name: '200 KOKI', value: 200, color: '#F59E0B', icon: <Coins className="w-6 h-6" />, type: 'koki' },
  { id: 6, name: '2 Tickets', value: 2, color: '#10B981', icon: <Trophy className="w-6 h-6" />, type: 'ticket' },
  { id: 7, name: '25 KOKI', value: 25, color: '#F59E0B', icon: <Coins className="w-6 h-6" />, type: 'koki' },
  { id: 8, name: 'Jackpot', value: 1000, color: '#EF4444', icon: <Crown className="w-6 h-6" />, type: 'special' }
]

export function RouletteModal({ isOpen, onClose, onWin, userId }: RouletteModalProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
  const [rotation, setRotation] = useState(0)
  const [canPlay, setCanPlay] = useState(false)
  const [kokiInfo, setKokiInfo] = useState<{
    canPlay: boolean
    hasEnoughForPlay: boolean
    requiredToUnlock: number
    costPerPlay: number
    currentBalance: number
    progressPercentage: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const spinTimeoutRef = useRef<NodeJS.Timeout>()

  // Verificar elegibilidad cuando se abre el modal
  useEffect(() => {
    if (isOpen && userId) {
      checkEligibility()
    }
  }, [isOpen, userId])

  const checkEligibility = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/roulette-koki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'check_eligibility'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setKokiInfo(data)
        setCanPlay(data.canPlay && data.hasEnoughForPlay)
      } else {
        console.error('Failed to check roulette eligibility')
        setCanPlay(false)
      }
    } catch (error) {
      console.error('Error checking roulette eligibility:', error)
      setCanPlay(false)
    } finally {
      setLoading(false)
    }
  }

  const spinRoulette = async () => {
    if (isSpinning || !canPlay || !userId) return

    setIsSpinning(true)
    setSelectedPrize(null)

    // Seleccionar premio aleatorio
    const randomIndex = Math.floor(Math.random() * prizes.length)
    const winningPrize = prizes[randomIndex]

    // Calcular rotación para que caiga en el premio seleccionado
    const segmentAngle = 360 / prizes.length
    const targetAngle = (randomIndex * segmentAngle) + (segmentAngle / 2)
    const spins = 5 // Número de vueltas completas
    const finalRotation = rotation + (spins * 360) + (360 - targetAngle)

    setRotation(finalRotation)

    // Detener después de la animación y procesar el juego
    spinTimeoutRef.current = setTimeout(async () => {
      setIsSpinning(false)
      setSelectedPrize(winningPrize)
      
      // Procesar el juego en el backend
      try {
        const response = await fetch('/api/roulette-koki', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            action: 'play_roulette',
            prizeWon: winningPrize
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('Roulette play result:', result)

          // Actualizar el estado local con los datos retornados (evita otra petición)
          setKokiInfo({
            canPlay: result.canPlay,
            hasEnoughForPlay: result.hasEnoughForPlay,
            requiredToUnlock: result.requiredToUnlock,
            costPerPlay: result.costPerPlay,
            currentBalance: result.newBalance,
            progressPercentage: result.progressPercentage
          })
          setCanPlay(result.canPlay && result.hasEnoughForPlay)

          // Despachar eventos globales para otros componentes (barra de progreso, etc.)
          window.dispatchEvent(new CustomEvent('kokiBalanceUpdated', { detail: { userId, balance: result.newBalance } }))
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: { userId } }))
        } else {
          console.error('Failed to process roulette play')
        }
      } catch (error) {
        console.error('Error processing roulette play:', error)
      }
      
      onWin?.(winningPrize)
    }, 4000) // Duración de la animación
  }

  const handleClose = () => {
    if (isSpinning) return
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current)
    }
    setSelectedPrize(null)
    onClose()
  }

  const resetRoulette = () => {
    setSelectedPrize(null)
    setRotation(0)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-6 w-full max-w-lg border border-white/20 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                Super Ruleta KOKI
              </h2>
              <button
                onClick={handleClose}
                disabled={isSpinning}
                className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* KOKI Information */}
            {loading ? (
              <div className="mb-6 bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <div className="animate-pulse">
                  <div className="h-4 bg-yellow-500/20 rounded mb-2"></div>
                  <div className="h-4 bg-yellow-500/20 rounded w-3/4"></div>
                </div>
              </div>
            ) : kokiInfo ? (
              <div className="mb-6 bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 font-medium">Tu Balance KOKI:</span>
                  <span className="text-yellow-300 font-bold">{kokiInfo.currentBalance}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Costo por juego:</span>
                  <span className="text-white">{kokiInfo.costPerPlay} KOKI</span>
                </div>
                {!kokiInfo.canPlay && (
                  <div className="text-red-400 text-sm mt-2">
                    Necesitas {kokiInfo.requiredToUnlock} KOKI para desbloquear la ruleta
                  </div>
                )}
                {!kokiInfo.hasEnoughForPlay && kokiInfo.canPlay && (
                  <div className="text-orange-400 text-sm mt-2">
                    Necesitas {kokiInfo.costPerPlay} KOKI para jugar
                  </div>
                )}
              </div>
            ) : null}

            {/* Roulette Container */}
            <div className="relative flex flex-col items-center">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
              </div>

              {/* Roulette Wheel */}
              <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                <motion.div
                  className="w-full h-full relative"
                  animate={{ rotate: rotation }}
                  transition={{
                    duration: isSpinning ? 4 : 0,
                    ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "linear"
                  }}
                >
                  {prizes.map((prize, index) => {
                    const angle = (360 / prizes.length) * index
                    const nextAngle = (360 / prizes.length) * (index + 1)
                    
                    return (
                      <div
                        key={prize.id}
                        className="absolute inset-0 origin-center"
                        style={{
                          clipPath: `polygon(50% 50%, ${50 + 40 * Math.cos((angle * Math.PI) / 180)}% ${50 + 40 * Math.sin((angle * Math.PI) / 180)}%, ${50 + 40 * Math.cos((nextAngle * Math.PI) / 180)}% ${50 + 40 * Math.sin((nextAngle * Math.PI) / 180)}%)`
                        }}
                      >
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: prize.color }}
                        >
                          <div 
                            className="flex flex-col items-center text-white transform"
                            style={{
                              transform: `rotate(${angle + 22.5}deg) translateY(-60px)`,
                            }}
                          >
                            <div className="text-white drop-shadow-lg">
                              {prize.icon}
                            </div>
                            <span className="text-xs font-bold mt-1 text-center drop-shadow-lg whitespace-nowrap">
                              {prize.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>

                {/* Center Circle */}
                <div className="absolute inset-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <Diamond className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Spin Button */}
              <motion.button
                onClick={spinRoulette}
                disabled={isSpinning || !canPlay}
                className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 animate-spin" />
                    Girando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {canPlay ? '¡Girar Ruleta!' : 'No disponible'}
                  </span>
                )}
              </motion.button>

              {/* Result */}
              <AnimatePresence>
                {selectedPrize && !isSpinning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="mt-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-green-500/30 text-center"
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="text-yellow-400">
                        {selectedPrize.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        ¡Felicidades!
                      </h3>
                    </div>
                    <p className="text-white/80 mb-3">
                      Has ganado: <span className="font-bold text-yellow-400">{selectedPrize.name}</span>
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={resetRoulette}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
                      >
                        Jugar de nuevo
                      </button>
                      <button
                        onClick={handleClose}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors"
                      >
                        Reclamar premio
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}