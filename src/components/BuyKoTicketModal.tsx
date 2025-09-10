'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Ticket, Star, Zap, Gift } from 'lucide-react'
import { useState } from 'react'

interface BuyKoTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onBuy: (quantity: number) => void
  userBalance: number
  isLoading?: boolean
}

export function BuyKoTicketModal({ 
  isOpen, 
  onClose, 
  onBuy, 
  userBalance, 
  isLoading = false 
}: BuyKoTicketModalProps) {
  const [quantity, setQuantity] = useState(1)
  const ticketPrice = 0 // KoTickets son GRATIS
  const totalPrice = 0 // No hay costo
  const minBalanceRequired = 100 // Mínimo 100 KOKI para acceder

  const handleBuy = () => {
    if (userBalance < minBalanceRequired) {
      alert(`Necesitas al menos ${minBalanceRequired} KOKI para acceder al juego de rascar`)
      return
    }
    onBuy(quantity)
  }

  const quantityOptions = [1, 3, 5, 10]

  if (!isOpen) return null

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
          className="modal-content max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Comprar KoTickets</h2>
                <p className="text-white/60 text-sm">Rasca y gana 1-10 KOKI</p>
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
            {/* KoTicket Info */}
            <div className="glass-card p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">KoTicket</h3>
              </div>
              <p className="text-white/70 text-sm mb-3">
                Rasca tu KoTicket y gana entre 1-10 KOKI al azar
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/70">Premio: 1-10 KOKI</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="w-4 h-4 text-green-400" />
                  <span className="text-white/70">70% de ganar</span>
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Cantidad</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {quantityOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setQuantity(option)}
                    className={`p-3 rounded-xl border transition-all ${
                      quantity === option
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{option}</div>
                      <div className="text-xs">KoTickets</div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Custom Quantity */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white text-center font-semibold"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="glass-card p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Precio por KoTicket:</span>
                <span className="text-green-400 font-semibold">GRATIS</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70">Cantidad:</span>
                <span className="text-white font-semibold">{quantity}</span>
              </div>
              <div className="border-t border-white/10 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total:</span>
                  <span className="text-green-400 font-bold text-lg">GRATIS</span>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Tu balance:</span>
                <span className="text-white font-semibold">{userBalance} KOKI</span>
              </div>
              <div className="mt-2 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <p className="text-blue-300 text-sm">
                  💡 Los KoTickets son <strong>GRATUITOS</strong> pero necesitas tener al menos <strong>100 KOKI</strong> para acceder al juego de rascar.
                </p>
              </div>
              {userBalance < 100 && (
                <p className="text-red-400 text-sm mt-2">
                  Necesitas al menos 100 KOKI para acceder al juego de rascar
                </p>
              )}
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuy}
              disabled={isLoading || userBalance < 100}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Obteniendo...' : `Obtener ${quantity} KoTicket${quantity > 1 ? 's' : ''} GRATIS`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
