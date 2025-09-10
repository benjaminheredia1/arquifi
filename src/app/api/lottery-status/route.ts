import { NextResponse } from 'next/server'
import { getLotteries, insertData } from '@/lib/supabase'

export async function GET() {
  try {
    // Get current lottery status
    const lotteries = await getLotteries('status', ['active'])
    let lottery = lotteries[0] || null

    if (!lottery) {
      // Create a new lottery if none exists
      const now = new Date()
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      
      const newLottery = await insertData('lotteries', {
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        ticket_price: 10,
        total_pool: 0
      })
      lottery = newLottery[0]
    }

    // Calculate countdown
    const endDate = new Date(lottery.end_date)
    const now = new Date()
    const timeLeft = endDate.getTime() - now.getTime()

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    return NextResponse.json({
      success: true,
      data: {
        lottery: {
          id: lottery.id,
          status: lottery.status,
          ticketPrice: lottery.ticket_price,
          totalPool: lottery.total_pool,
          totalPrize: lottery.total_pool, // Alias para compatibilidad
          winningNumbers: lottery.winning_numbers,
          startDate: lottery.start_date,
          endDate: lottery.end_date,
          endTime: lottery.end_date // Para el countdown
        },
        countdown: {
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds),
          total: Math.max(0, timeLeft / 1000)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching lottery status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}