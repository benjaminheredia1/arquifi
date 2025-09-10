import { NextRequest, NextResponse } from 'next/server'
import { query, getOne, run } from '@/lib/database-optimized'

export async function GET(request: NextRequest) {
  try {
    // Get current lottery status
    const lotteryQuery = await getOne(`
      SELECT 
        id,
        status,
        start_date,
        end_date,
        winning_numbers,
        total_pool,
        ticket_price,
        created_at
      FROM lotteries 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    let lottery = lotteryQuery
    if (!lottery) {
      // Create a new lottery if none exists
      await run(`
        INSERT INTO lotteries (status, start_date, end_date, ticket_price, total_pool)
        VALUES ('active', datetime('now'), datetime('now', '+7 days'), 10, 0)
      `)
      lottery = await getOne('SELECT * FROM lotteries WHERE id = last_insert_rowid()')
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