'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
// Importaciones de iconos removidas - no se usan en este archivo
import toast from 'react-hot-toast'

import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Countdown } from '@/components/Countdown'
import { LotteryStats } from '@/components/LotteryStats'
import { ActionButtons } from '@/components/ActionButtons'
import { BuyTicketModal } from '@/components/BuyTicketModal'
import { StatusModal } from '@/components/StatusModal'
import { ResultsModal } from '@/components/ResultsModal'
import { InfoModal } from '@/components/InfoModal'
import { LoginModal } from '@/components/LoginModal'
import { BottomNavigation } from '@/components/BottomNavigation'
import { UserTickets } from '@/components/UserTickets'
import { UserProfile } from '@/components/UserProfile'
import { LotteryHistory } from '@/components/LotteryHistory'
import { BuyKokiModal } from '@/components/BuyKokiModal'
import { ChangeAvatarModal } from '@/components/ChangeAvatarModal'
import { TicketScratchGame } from '@/components/TicketScratchGame'
import { LoadingScreen } from '@/components/LoadingScreen'
import { KokiEconomy } from '@/components/KokiEconomy'
import { LiveStats } from '@/components/LiveStats'
import { TrustIndicator } from '@/components/TrustIndicator'
import { SimplicityGuide } from '@/components/SimplicityGuide'
import { LotteryStatus } from '@/components/LotteryStatus'
import { UnscratchedTicketsIndicator } from '@/components/UnscratchedTicketsIndicator'
import { BuyKoTicketModal } from '@/components/BuyKoTicketModal'
import { useLottery } from '@/hooks/useLottery'
import { useAuth } from '@/hooks/useAuth'
import { FarcasterShareButton } from '@/components/FarcasterShareButton'

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const { user, login, logout, isAuthenticated, buyKoki, changeAvatar, updateUser } = useAuth()
  const { 
    lottery, 
    stats, 
    countdown, 
    buyTicket, 
    loadLotteryInfo 
  } = useLottery(user)

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [currentSection, setCurrentSection] = useState('home')
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const [koTickets, setKoTickets] = useState<Array<{
    id: string
    owner: string
    purchaseTime: number
    isScratched: boolean
    prize?: number
  }>>([])

  useEffect(() => {
    loadLotteryInfo()
  }, [loadLotteryInfo])

  // Check if user is already authenticated on page load
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('kokifi_user')
      if (savedUser) {
        console.log('User already authenticated, but showing loading screen for minimum time')
        // Mostrar pantalla de carga por al menos 2 segundos
        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
      } else {
        // Si no hay usuario, mostrar pantalla de carga por 3 segundos
        setTimeout(() => {
          setIsLoading(false)
        }, 3000)
      }
      setHasCheckedAuth(true)
    }
    
    checkAuth()
  }, [])

  // Escuchar actualizaciones del usuario desde otros componentes
  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent) => {
      if (event.detail) {
        updateUser(event.detail)
      }
    }

    window.addEventListener('userUpdated', handleUserUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener)
    }
  }, [updateUser])

  const loadKoTickets = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/kotickets?userId=${user.id}`)
      const result = await response.json()

      if (result.success) {
        setKoTickets(result.data.kotickets || [])
      }
    } catch (error) {
      console.error('Error loading KoTickets:', error)
    }
  }, [user?.id])

  const accumulateKoTickets = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/accumulate-kotickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (result.success && result.data.accumulated) {
        console.log('KoTicket acumulado automáticamente')
        // Recargar KoTickets
        loadKoTickets()
      }
    } catch (error) {
      console.error('Error accumulating KoTickets:', error)
    }
  }, [user?.id, loadKoTickets])

  // Load KoTickets when user changes
  useEffect(() => {
    if (user?.id) {
      loadKoTickets()
      // Acumular KoTickets automáticamente
      accumulateKoTickets()
    }
  }, [user?.id, loadKoTickets, accumulateKoTickets])

  // Escuchar eventos de actualización de KoTickets
  useEffect(() => {
    const handleKoTicketsUpdate = () => {
      console.log('🔄 KoTickets actualizados, recargando...')
      loadKoTickets()
    }
    
    window.addEventListener('koticketsUpdated', handleKoTicketsUpdate)
    return () => {
      window.removeEventListener('koticketsUpdated', handleKoTicketsUpdate)
    }
  }, [loadKoTickets])

  const handleBuyTicket = async () => {
    if (!selectedNumber) {
      toast.error('Por favor selecciona un número')
      return
    }

    if (!isAuthenticated) {
      setActiveModal('login')
      return
    }

    try {
      await buyTicket(selectedNumber)
      toast.success('¡Ticket de lotería comprado exitosamente!')
      setActiveModal(null)
      setSelectedNumber(null)
    } catch (error) {
      toast.error('Error al comprar ticket')
    }
  }

  const handleBuyKoTicket = async (quantity: number) => {
    if (!isAuthenticated) {
      setActiveModal('login')
      return
    }

    try {
      const response = await fetch('/api/kotickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          quantity
        })
      })

      const result = await response.json()

      if (result.success) {
        // Cargar KoTickets actualizados
        const koticketsResponse = await fetch(`/api/kotickets?userId=${user?.id}`)
        const koticketsResult = await koticketsResponse.json()
        
        if (koticketsResult.success) {
          setKoTickets(koticketsResult.data.kotickets)
        }
        
        toast.success(result.data.message)
        setActiveModal(null)
      } else {
        toast.error(result.error || 'Error al comprar KoTickets')
      }
    } catch (error) {
      console.error('Error buying KoTickets:', error)
      toast.error('Error al comprar KoTickets')
    }
  }

  const handleConnectWallet = () => {
    if (isConnected) {
      disconnect()
    } else {
      connect({ connector: connectors[0] })
    }
  }

  const openModal = (modal: string) => {
    if (!isAuthenticated && ['buy', 'profile', 'tickets'].includes(modal)) {
      setActiveModal('login')
      return
    }
    setActiveModal(modal)
  }

  const closeModal = () => {
    setActiveModal(null)
    setSelectedNumber(null)
  }

  const showSection = (section: string) => {
    setCurrentSection(section)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  if (isLoading && !hasCheckedAuth) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <div className="min-h-screen modern-gradient overflow-x-hidden">
      {/* Header */}
      <Header
        user={user}
        isAuthenticated={isAuthenticated}
        isConnected={isConnected}
        address={address}
        onConnectWallet={handleConnectWallet}
        onLogin={() => openModal('login')}
        onLogout={logout}
      />

      {/* Indicador de tickets sin rascar */}
      {user && (
        <UnscratchedTicketsIndicator
          unscratchedKoTicketsCount={koTickets.filter(ticket => !ticket.isScratched).length}
          onScratchClick={() => openModal('scratch-game')}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8 pb-20">
        <AnimatePresence mode="wait">
          {currentSection === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <Hero />

              {/* Action Buttons - Moved up for better visibility */}
              <ActionButtons
                onBuyTicket={() => openModal('buy')}
                onViewStatus={() => openModal('status')}
                onViewResults={() => showSection('results')}
                onViewInfo={() => openModal('info')}
              />

              {/* Farcaster Share Button - Solo aparece cuando es necesario */}
              <div className="flex justify-center mt-4">
                <FarcasterShareButton 
                  text="🎰 ¡Juega en KokiFi Lottery y gana KOKI! La primera lotería descentralizada en Farcaster 🚀"
                />
              </div>

              {/* Countdown */}
              <Countdown />

              {/* Lottery Stats */}
              <LotteryStats stats={stats} />

              {/* Live Stats */}
              <LiveStats user={user} />

              {/* Lottery Status */}
              <LotteryStatus 
                currentUsers={15}
                maxUsers={50}
                totalTickets={75}
                timeUntilNext={countdown}
              />

              {/* Trust Indicator */}
              <TrustIndicator />

              {/* Simplicity Guide */}
              <SimplicityGuide />
            </motion.div>
          )}

          {currentSection === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UserTickets user={user} />
            </motion.div>
          )}

          {currentSection === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LotteryHistory user={user} />
            </motion.div>
          )}

          {currentSection === 'economy' && (
            <motion.div
              key="economy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <KokiEconomy user={user} />
            </motion.div>
          )}

          {currentSection === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfile 
                user={user} 
                onBuyKoki={() => openModal('buy-koki')}
                onChangeAvatar={() => openModal('change-avatar')}
                onPlayGame={() => openModal('scratch-game')}
                onBuyTicket={() => openModal('buy')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentSection={currentSection}
        onSectionChange={showSection}
      />

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'login' && (
          <LoginModal
            onClose={closeModal}
            onLogin={login}
          />
        )}

        {activeModal === 'buy' && (
          <BuyTicketModal
            selectedNumber={selectedNumber}
            onNumberSelect={setSelectedNumber}
            onBuy={handleBuyTicket}
            onClose={closeModal}
            isLoading={isLoading}
          />
        )}

        {activeModal === 'status' && (
          <StatusModal
            lottery={lottery}
            countdown={countdown}
            onClose={closeModal}
          />
        )}

        {activeModal === 'results' && (
          <ResultsModal
            onClose={closeModal}
          />
        )}

        {activeModal === 'info' && (
          <InfoModal
            onClose={closeModal}
          />
        )}

        {activeModal === 'buy-koki' && (
          <BuyKokiModal
            onClose={closeModal}
            onBuyKoki={buyKoki}
            currentBalance={user?.balance || '0'}
          />
        )}

        {activeModal === 'change-avatar' && (
          <ChangeAvatarModal
            onClose={closeModal}
            onAvatarChange={changeAvatar}
            currentUser={user}
          />
        )}

        {activeModal === 'buy-koticket' && (
          <BuyKoTicketModal
            isOpen={true}
            onClose={closeModal}
            onBuy={handleBuyKoTicket}
            userBalance={parseFloat(user?.balance || '0')}
          />
        )}

        {activeModal === 'scratch-game' && (
          <TicketScratchGame
            onClose={closeModal}
            koTickets={koTickets}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
