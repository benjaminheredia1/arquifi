import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database-optimized'

export async function GET(request: NextRequest) {
  try {
    console.log('Getting stats...')
    
    // Get user stats
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COALESCE(SUM(balance), 0) as total_balance,
        COALESCE(SUM(tickets_count), 0) as total_tickets,
        COALESCE(SUM(total_spent), 0) as total_spent
      FROM users
    `)

    // Get lottery stats
    const lotteryStats = await query(`
      SELECT 
        COUNT(*) as total_lotteries,
        COALESCE(SUM(total_pool), 0) as total_pool
      FROM lotteries
    `)

    // Get transaction stats
    const transactionStats = await query(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_volume
      FROM transactions
    `)

    const userData = userStats[0] || {
      total_users: 0,
      total_balance: 0,
      total_tickets: 0,
      total_spent: 0
    }

    const lotteryData = lotteryStats[0] || {
      total_lotteries: 0,
      total_pool: 0
    }

    const transactionData = transactionStats[0] || {
      total_transactions: 0,
      total_volume: 0
    }

    console.log('Stats calculated:', {
      users: userData.total_users,
      lotteries: lotteryData.total_lotteries,
      transactions: transactionData.total_transactions
    })

    return NextResponse.json({
      success: true,
      data: {
        activeUsers: parseInt(userData.total_users) || 0,
        totalTickets: parseInt(userData.total_tickets) || 0,
        totalLotteries: parseInt(lotteryData.total_lotteries) || 0,
        totalVolume: transactionData.total_volume || '0',
        totalBalance: userData.total_balance || '0',
        totalSpent: userData.total_spent || '0',
        totalTransactions: parseInt(transactionData.total_transactions) || 0
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}