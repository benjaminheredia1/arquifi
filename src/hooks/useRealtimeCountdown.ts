'use client'

import { useState, useEffect } from 'react'
import { Countdown } from '@/types'

export function useRealtimeCountdown() {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const nextMonday = getNextLotteryDate()
      const timeLeft = nextMonday.getTime() - now.getTime()
      
      if (timeLeft <= 0) {
        // Si ya pasó el lunes, calcular el próximo
        const newNextMonday = new Date(nextMonday)
        newNextMonday.setDate(newNextMonday.getDate() + 7)
        const newTimeLeft = newNextMonday.getTime() - now.getTime()
        
        const days = Math.floor(newTimeLeft / (1000 * 60 * 60 * 24))
        const hours = Math.floor((newTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((newTimeLeft % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((newTimeLeft % (1000 * 60)) / 1000)
        
        setCountdown({
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds),
          total: Math.max(0, newTimeLeft / 1000)
        })
      } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
        
        setCountdown({
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds),
          total: Math.max(0, timeLeft / 1000)
        })
      }
    }

    // Actualizar inmediatamente
    updateCountdown()
    
    // Actualizar cada segundo
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return countdown
}

// Función para calcular el próximo sorteo (cada lunes a las 00:00 UTC)
function getNextLotteryDate(): Date {
  const now = new Date()
  const nextMonday = new Date(now)
  
  // Calcular días hasta el próximo lunes
  const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0) // 00:00 UTC
  
  return nextMonday
}
