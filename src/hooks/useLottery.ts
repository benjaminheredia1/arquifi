'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Lottery, Ticket, LotteryStats, Countdown, BuyTicketRequest } from '@/types'
import toast from 'react-hot-toast'

export function useLottery(user?: any) {
  const { address } = useAccount()
  const [lottery, setLottery] = useState<Lottery | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<LotteryStats>({
    totalUsers: 0,
    totalTickets: 0,
    totalLotteries: 0,
    totalVolume: '0',
    activeUsers: 0
  })
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  // Calculate countdown
  const calculateCountdown = useCallback((endTime: string | number) => {
    if (!endTime) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      }
    }

    const endDate = new Date(endTime)
    const now = new Date()
    const timeLeft = Math.max(0, endDate.getTime() - now.getTime())

    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000))
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000)

    return {
      days,
      hours,
      minutes,
      seconds,
      total: timeLeft / 1000
    }
  }, [])

  // Update countdown every second
  useEffect(() => {
    if (!lottery?.endTime) return

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(lottery.endTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [lottery?.endTime, calculateCountdown])

  const loadLotteryInfo = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/lottery-status')
      const result = await response.json()

      if (result.success && result.data) {
        setLottery(result.data)
        setCountdown(calculateCountdown(result.data.endTime))
      }
    } catch (error) {
      console.error('Error loading lottery info:', error)
      toast.error('Error al cargar información de la lotería')
    } finally {
      setIsLoading(false)
    }
  }, [calculateCountdown])

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats')
      const result = await response.json()

      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [])

  const loadUserTickets = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/user-tickets?userId=${user.id}`)
      const result = await response.json()

      if (result.success && result.data) {
        setTickets(result.data.tickets || [])
      }
    } catch (error) {
      console.error('Error loading user tickets:', error)
    }
  }, [user?.id])

  const buyTicket = useCallback(async (number: number): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Inicia sesión primero')
      return false
    }

    setIsLoading(true)
    try {
      const requestData: BuyTicketRequest = {
        number,
        userId: user.id,
        username: user.username
      }

      const response = await fetch('/api/buy-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('¡Ticket comprado exitosamente!')
        // Reload lottery info and user tickets
        await loadLotteryInfo()
        await loadUserTickets()
        // Update user data if provided
        if (result.data?.user) {
          // Trigger user update in parent component
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: result.data.user }))
        }
        // Disparar actualización de balance KOKI y forzar refetch externo
        window.dispatchEvent(new CustomEvent('kokiBalanceUpdated'))
        // Opcional: si otro componente escucha 'ticketsUpdated'
        window.dispatchEvent(new CustomEvent('ticketsUpdated'))
        return true
      } else {
        toast.error(result.error || 'Error al comprar ticket')
        return false
      }
    } catch (error) {
      console.error('Error buying ticket:', error)
      toast.error('Error de conexión')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, loadLotteryInfo, loadUserTickets])

  const loadLotteryResults = useCallback(async (limit: number = 5) => {
    try {
      const response = await fetch(`/api/lottery-results?limit=${limit}`)
      const result = await response.json()

      if (result.success && result.data) {
        return result.data
      }
      return []
    } catch (error) {
      console.error('Error loading lottery results:', error)
      return []
    }
  }, [])

  // Load initial data
  useEffect(() => {
    loadLotteryInfo()
    loadStats()
  }, [loadLotteryInfo, loadStats])

  useEffect(() => {
    if (user?.id) {
      loadUserTickets()
    }
  }, [user?.id, loadUserTickets])

  return {
    lottery,
    tickets,
    stats,
    countdown,
    isLoading,
    loadLotteryInfo,
    loadStats,
    loadUserTickets,
    buyTicket,
    loadLotteryResults,
  }
}
