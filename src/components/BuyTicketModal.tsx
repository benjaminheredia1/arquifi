'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ticket, Check, AlertCircle } from 'lucide-react'
import { Countdown } from '@/types'

interface BuyTicketModalProps {
  selectedNumber: number | null
  onNumberSelect: (number: number) => void
  onBuy: () => void
  onClose: () => void
  isLoading: boolean
}

export function BuyTicketModal({
  selectedNumber,
  onNumberSelect,
  onBuy,
  onClose,
  isLoading
}: BuyTicketModalProps) {
  const [soldNumbers, setSoldNumbers] = useState<number[]>([])
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([])

  // Generate numbers 1-50
  useEffect(() => {
    const numbers = Array.from({ length: 50 }, (_, i) => i + 1)
    setAvailableNumbers(numbers)
    // Simulate some sold numbers (in real app, this would come from API)
    setSoldNumbers([1, 5, 13, 25, 42])
  }, [])

  const handleNumberClick = (number: number) => {
    if (soldNumbers.includes(number)) return
    onNumberSelect(number)
  }

  const getNumberStatus = (number: number) => {
    if (soldNumbers.includes(number)) return 'sold'
    if (selectedNumber === number) return 'selected'
    return 'available'
  }

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
          className="modal-content max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Comprar Ticket
                </h2>
                <p className="text-white/60 text-sm">
                  Selecciona tu número de la suerte (1-50)
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
            {/* Selected Number Display */}
            {selectedNumber && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-primary rounded-xl text-center"
              >
                <div className="text-white/80 text-sm mb-1">Número seleccionado:</div>
                <div className="text-3xl font-bold text-white">{selectedNumber}</div>
                <div className="text-white/60 text-sm mt-1">Precio: 10 KOKI</div>
              </motion.div>
            )}

            {/* Number Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Números disponibles</h3>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Vendido</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-10 gap-2 max-h-64 overflow-y-auto scrollbar-hide">
                {availableNumbers.map((number) => {
                  const status = getNumberStatus(number)
                  return (
                    <motion.button
                      key={number}
                      whileHover={status === 'available' ? { scale: 1.1 } : {}}
                      whileTap={status === 'available' ? { scale: 0.95 } : {}}
                      onClick={() => handleNumberClick(number)}
                      disabled={status === 'sold'}
                      className={`
                        w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200
                        ${status === 'available' 
                          ? 'bg-white/10 border border-white/20 text-white hover:bg-primary-500 hover:border-primary-400 cursor-pointer' 
                          : status === 'selected'
                          ? 'bg-primary-500 border border-primary-400 text-white scale-110 shadow-lg shadow-primary-500/50'
                          : 'bg-red-500/50 border border-red-400/50 text-white/50 cursor-not-allowed opacity-50'
                        }
                      `}
                    >
                      {number}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Purchase Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 text-accent-400" />
                <span className="text-white font-medium text-sm">Información importante</span>
              </div>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>• Cada ticket cuesta 10 KOKI</li>
                <li>• Los números son únicos por sorteo</li>
                <li>• El sorteo se realiza cada lunes a las 00:00 UTC</li>
                <li>• Se seleccionan 5 números ganadores aleatoriamente</li>
                <li>• Los premios se distribuyen entre todos los ganadores</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onBuy}
                disabled={!selectedNumber || isLoading}
                className="flex-1 button-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Comprar Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
