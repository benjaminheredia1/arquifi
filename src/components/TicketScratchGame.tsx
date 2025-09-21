'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Star, Gift, Zap, X, Calendar } from 'lucide-react'
import { isScratchDay } from '@/lib/lottery-system'
import toast from 'react-hot-toast'

interface TicketScratchGameProps {
  onClose: () => void
  koTickets: Array<{
    id: string
    owner: string
    purchaseTime: number
    isScratched: boolean
    prize?: number
  }>
}


export function TicketScratchGame({ onClose, koTickets }: TicketScratchGameProps) {
  const [currentTicket, setCurrentTicket] = useState(0)
  const [scratchedTickets, setScratchedTickets] = useState<boolean[]>([])
  const [prizes, setPrizes] = useState<Array<{
    type: string
    amount: number
    icon: any
    color: string
  } | null>>([])
  const [isScratching, setIsScratching] = useState(false)
  const [totalWinnings, setTotalWinnings] = useState(0)
  
  useEffect(() => {
    if (koTickets && koTickets.length > 0) {
      // Mapear estado real
      const scratched = koTickets.map(t => t.isScratched)
      const mappedPrizes = koTickets.map(t => {
        if (!t.isScratched) return null
        if (t.prize && t.prize > 0) {
          return { type: 'koki', amount: t.prize, icon: Star, color: 'from-yellow-500 to-yellow-600' }
        }
        return { type: 'nothing', amount: 0, icon: X, color: 'from-gray-500 to-gray-600' }
      })
      setScratchedTickets(scratched)
      setPrizes(mappedPrizes)
      // Calcular premios ya ganados
      const initialTotal = koTickets.reduce((acc, t) => acc + (t.prize || 0), 0)
      setTotalWinnings(initialTotal)
    }
  }, [koTickets])
  
  // Si no hay KoTickets, crear uno automáticamente (sin reload completo)
  useEffect(() => {
    let cancelled = false
    const autoCreate = async () => {
      if (!koTickets || koTickets.length === 0) {
        try {
          const owner = koTickets?.[0]?.owner || '2'
          const res = await fetch('/api/kotickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: owner, quantity: 1 })
          })
          const data = await res.json()
          if (!cancelled && data.success) {
            window.dispatchEvent(new CustomEvent('koticketsUpdated'))
          }
        } catch (e) {
          console.error('Error creando KoTicket:', e)
        }
      }
    }
    autoCreate()
    return () => { cancelled = true }
  }, [koTickets])

  // Mostrar loading mientras se crean los KoTickets
  if (!koTickets || koTickets.length === 0) {
    return (
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
          className="modal-content max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Creando KoTicket...</h2>
            <p className="text-white/70 mb-6">
              ¡Preparando tu KoTicket GRATIS para rascar y ganar KOKI!
            </p>
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const scratchTicket = async (ticketIndex: number) => {
    if (scratchedTickets[ticketIndex] || isScratching) return

    const currentKoTicket = koTickets[ticketIndex]
    if (!currentKoTicket) return

    setIsScratching(true)
    
    try {
      // Llamar al endpoint para rascar el KoTicket
      const response = await fetch('/api/scratch-koticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentKoTicket.owner,
          koticketId: currentKoTicket.id
        }),
      })

      const result = await response.json()

      if (result.success) {
        const prize = result.data.prize
        
        // Simular tiempo de rayado
        await new Promise(resolve => setTimeout(resolve, 1500))

        const selectedPrize = prize.type === 'koki' 
          ? { type: 'koki', amount: prize.amount, icon: Star, color: 'from-yellow-500 to-yellow-600' }
          : { type: 'nothing', amount: 0, icon: X, color: 'from-gray-500 to-gray-600' }

        // Actualizar estado
        const newScratchedTickets = [...scratchedTickets]
        newScratchedTickets[ticketIndex] = true

        const newPrizes = [...prizes]
        newPrizes[ticketIndex] = selectedPrize

        setScratchedTickets(newScratchedTickets)
        setPrizes(newPrizes)

        // Actualizar ganancias totales
        if (selectedPrize.type === 'koki') {
          setTotalWinnings(prev => prev + selectedPrize.amount)
        }

        // Mostrar mensaje de premio usando toast
        if (prize.amount > 0) {
          toast.success(`¡${prize.message}`)
          // Actualizar el balance del usuario en el contexto
          if (result.data.user) {
            window.dispatchEvent(new CustomEvent('userUpdated', { detail: result.data.user }))
          }
        } else {
          toast(prize.message, { icon: 'ℹ️' })
        }
        
        // Disparar eventos para refrescar UI (sin reload)
        window.dispatchEvent(new CustomEvent('koticketsUpdated'))
        window.dispatchEvent(new CustomEvent('kokiBalanceUpdated'))
      } else {
        // Si ya estaba rascado, sincronizar estado local sin mostrar error fuerte
        if (response.status === 400 && /ya ha sido rascado/i.test(result.error || '')) {
          // Buscar el ticket en props para extraer premio guardado
            const existing = koTickets[ticketIndex]
            if (existing) {
              const newScratchedTickets = [...scratchedTickets]
              newScratchedTickets[ticketIndex] = true
              const newPrizes = [...prizes]
              const amount = existing.prize || (existing as any).prizeAmount || 0
              newPrizes[ticketIndex] = amount > 0
                ? { type: 'koki', amount, icon: Star, color: 'from-yellow-500 to-yellow-600' }
                : { type: 'nothing', amount: 0, icon: X, color: 'from-gray-500 to-gray-600' }
              setScratchedTickets(newScratchedTickets)
              setPrizes(newPrizes)
              // Asegurar totalWinnings incluye este premio
              if (amount > 0 && !scratchedTickets[ticketIndex]) {
                setTotalWinnings(prev => prev + amount)
              }
              toast.success('Ticket ya rascado – premio sincronizado')
            }
        } else {
          toast.error(result.error || 'Error al rascar el ticket')
        }
      }
    } catch (error) {
      console.error('Error scratching ticket:', error)
      toast.error('Error al rascar el ticket')
    }

    setIsScratching(false)
  }

  const claimWinnings = async () => {
    if (totalWinnings > 0) {
      // Aquí podrías llamar a una API para agregar KOKI al usuario
      console.log(`Claiming ${totalWinnings} KOKI`)
    }
    onClose()
  }

  const allTicketsScratched = scratchedTickets.every(scratched => scratched)

  return (
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
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">¡Rasca tus Tickets!</h2>
              <p className="text-white/60 text-sm">
                KoTicket {currentTicket + 1} de {koTickets?.length || 0}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            title="Cerrar"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scratch Day Indicator */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
            <Calendar className="w-5 h-5 text-green-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-green-400">
                ¡Puedes rascar tickets cualquier día!
              </p>
              <p className="text-xs text-white/60 mt-1">
                Premios: 1-10 KOKI al azar
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Ticket */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl p-6 border border-white/10">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-2">
                  KoTicket #{koTickets[currentTicket]?.id?.toString().slice(-4)}
                </h3>
                <p className="text-white/70">
                  Comprado el {new Date(koTickets[currentTicket]?.purchaseTime * 1000).toLocaleDateString()}
                </p>
              </div>

              {/* Scratch Area */}
              <div className="relative">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((spot) => (
                    <motion.div
                      key={spot}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scratchTicket(currentTicket)}
                      className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                        scratchedTickets[currentTicket]
                          ? 'bg-white/10'
                          : 'bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500'
                      }`}
                    >
                      {scratchedTickets[currentTicket] ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-center"
                        >
                          {prizes[currentTicket] && (() => {
                            const IconComponent = prizes[currentTicket].icon;
                            return (
                              <>
                                <IconComponent className={`w-8 h-8 mx-auto mb-2 ${
                                  prizes[currentTicket].type === 'nothing' ? 'text-white/40' : 'text-white'
                                }`} />
                                <div className={`text-sm font-bold ${
                                  prizes[currentTicket].type === 'nothing' ? 'text-white/40' : 'text-white'
                                }`}>
                                  {prizes[currentTicket].type === 'koki' && `${prizes[currentTicket].amount} KOKI`}
                                  {prizes[currentTicket].type === 'bonus' && 'Ticket Extra'}
                                  {prizes[currentTicket].type === 'nothing' && 'Sin Premio'}
                                </div>
                              </>
                            );
                          })()}
                        </motion.div>
                      ) : (
                        <div className="text-yellow-800 font-bold text-lg">
                          RASCAR
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentTicket(prev => Math.max(0, prev - 1))}
              disabled={currentTicket === 0}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            <div className="flex space-x-2">
              {koTickets.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ir al ticket ${index + 1}`}
                  title={`Ticket ${index + 1}`}
                  onClick={() => setCurrentTicket(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTicket
                      ? 'bg-primary-400'
                      : scratchedTickets[index]
                      ? 'bg-green-400'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setCurrentTicket(prev => Math.min(koTickets.length - 1, prev + 1))}
              disabled={currentTicket === koTickets.length - 1}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>

          {/* Total Winnings */}
          {totalWinnings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30 mb-6"
            >
              <div className="text-center">
                <h4 className="text-lg font-bold text-green-400 mb-2">¡Felicidades!</h4>
                <p className="text-white">
                  Has ganado <span className="font-bold text-green-400">{totalWinnings} KOKI</span> en total
                </p>
              </div>
            </motion.div>
          )}

          {/* Claim Button */}
          {allTicketsScratched && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={claimWinnings}
              className="w-full button-primary flex items-center justify-center space-x-2"
            >
              <Gift className="w-4 h-4" />
              <span>
                {totalWinnings > 0 ? `Reclamar ${totalWinnings} KOKI` : 'Cerrar'}
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}