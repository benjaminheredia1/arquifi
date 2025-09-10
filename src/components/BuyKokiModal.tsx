'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coins, CreditCard, Zap, Star } from 'lucide-react'

interface BuyKokiModalProps {
  onClose: () => void
  onBuyKoki: (amount: number) => Promise<boolean>
  currentBalance: string
}

const KOKI_PACKAGES = [
  {
    id: 'starter',
    amount: 100,
    price: 5,
    bonus: 0,
    icon: Coins,
    color: 'from-blue-500 to-blue-600',
    popular: false
  },
  {
    id: 'popular',
    amount: 500,
    price: 20,
    bonus: 50,
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    popular: true
  },
  {
    id: 'premium',
    amount: 1000,
    price: 35,
    bonus: 150,
    icon: Star,
    color: 'from-yellow-500 to-yellow-600',
    popular: false
  },
  {
    id: 'mega',
    amount: 2500,
    price: 75,
    bonus: 500,
    icon: CreditCard,
    color: 'from-red-500 to-red-600',
    popular: false
  }
]

export function BuyKokiModal({ onClose, onBuyKoki, currentBalance }: BuyKokiModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBuy = async () => {
    if (!selectedPackage) return

    const packageData = KOKI_PACKAGES.find(pkg => pkg.id === selectedPackage)
    if (!packageData) return

    setIsLoading(true)
    try {
      // Enviar solo el amount base, el bonus se calcula en el backend
      const success = await onBuyKoki(packageData.amount)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error buying KOKI:', error)
    } finally {
      setIsLoading(false)
    }
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
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Comprar KOKI</h2>
                <p className="text-white/60 text-sm">Balance actual: {currentBalance} KOKI</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {KOKI_PACKAGES.map((pkg) => {
                const Icon = pkg.icon
                const isSelected = selectedPackage === pkg.id
                const totalKoki = pkg.amount + pkg.bonus

                return (
                  <motion.button
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-400 bg-primary-400/10'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          ¡MÁS POPULAR!
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${pkg.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2">
                        {pkg.amount.toLocaleString()} KOKI
                      </h3>
                      
                      {pkg.bonus > 0 && (
                        <div className="text-green-400 text-sm font-medium mb-2">
                          +{pkg.bonus.toLocaleString()} KOKI BONUS
                        </div>
                      )}
                      
                      <div className="text-2xl font-bold text-primary-400 mb-1">
                        ${pkg.price}
                      </div>
                      
                      <div className="text-white/60 text-sm">
                        Total: {totalKoki.toLocaleString()} KOKI
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuy}
              disabled={!selectedPackage || isLoading}
              className="w-full button-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {selectedPackage 
                      ? `Comprar ${KOKI_PACKAGES.find(pkg => pkg.id === selectedPackage)?.amount} KOKI`
                      : 'Selecciona un paquete'
                    }
                  </span>
                </>
              )}
            </button>

            {/* Info */}
            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm text-center">
                💡 Los KOKI se agregan instantáneamente a tu cuenta
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
