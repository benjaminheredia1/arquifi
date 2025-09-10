import { NextRequest, NextResponse } from 'next/server'
import { getLotteries, getUsers } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Obtener todas las loterías completadas desde Supabase
    const allLotteries = await getLotteries('status', ['completed'])
    const allUsers = await getUsers()
    
    // Combinar datos de loterías con usuarios
    const lotteriesWithUsers = allLotteries.map(lottery => {
      const winner = lottery.winner_id ? allUsers.find(u => u.id === lottery.winner_id) : null
      return {
        ...lottery,
        username: winner?.username || null,
        display_name: winner?.display_name || null,
        pfp_url: winner?.pfp_url || null
      }
    })
    
    // Ordenar por fecha de fin descendente
    const sortedLotteries = lotteriesWithUsers.sort((a, b) => 
      new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
    )

    // Paginación
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLotteries = sortedLotteries.slice(startIndex, endIndex)

    // Formatear los datos para el frontend
    const lotteriesWithWinners = paginatedLotteries.map(lottery => ({
      id: lottery.id,
      status: lottery.status,
      startTime: lottery.start_date,
      endTime: lottery.end_date,
      ticketPrice: lottery.ticket_price,
      totalTickets: lottery.total_tickets || 0,
      totalPrize: lottery.total_pool,
      winningNumbers: lottery.winning_numbers ? JSON.parse(lottery.winning_numbers) : [],
      winnerInfo: lottery.winner_id ? {
        id: lottery.winner_id,
        username: lottery.username,
        displayName: lottery.display_name,
        pfpUrl: lottery.pfp_url
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        lotteries: lotteriesWithWinners,
        pagination: {
          page,
          limit,
          total: sortedLotteries.length,
          totalPages: Math.ceil(sortedLotteries.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get lottery history error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
