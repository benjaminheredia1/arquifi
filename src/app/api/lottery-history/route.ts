import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Obtener todas las loterías completadas
    const allLotteries = Array.from(database.lotteries.values())
      .filter(lottery => lottery.status === 'completed')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())

    // Paginación
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLotteries = allLotteries.slice(startIndex, endIndex)

    // Obtener información de los ganadores
    const lotteriesWithWinners = paginatedLotteries.map(lottery => {
      const winner = lottery.winner ? database.getUserById(lottery.winner) : null
      return {
        ...lottery,
        winnerInfo: winner ? {
          id: winner.id,
          username: winner.username,
          displayName: winner.displayName,
          pfpUrl: winner.pfpUrl
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        lotteries: lotteriesWithWinners,
        pagination: {
          page,
          limit,
          total: allLotteries.length,
          totalPages: Math.ceil(allLotteries.length / limit)
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
