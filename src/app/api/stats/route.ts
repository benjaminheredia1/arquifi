import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database-config'

export async function GET() {
  try {
    // Get lottery stats
    const statsQuery = await query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_tickets,
        COUNT(DISTINCT lottery_id) as total_lotteries,
        COALESCE(SUM(price), 0) as total_volume
      FROM tickets
    `)

    const stats = statsQuery[0] || {
      active_users: 0,
      total_tickets: 0,
      total_lotteries: 0,
      total_volume: '0'
    }

    return NextResponse.json({
      success: true,
      data: {
        activeUsers: parseInt(stats.active_users) || 0,
        totalTickets: parseInt(stats.total_tickets) || 0,
        totalLotteries: parseInt(stats.total_lotteries) || 0,
        totalVolume: stats.total_volume || '0'
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}