import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/database-supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Obtener todas las loterías completadas
    const { data: allLotteries, error } = await supabase
      .from('lotteries')
      .select('*')
      .eq('is_completed', true)
      .order('end_time', { ascending: false })

    if (error) {
      console.error('Error fetching lotteries:', error)
      throw error
    }

    // Paginación
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLotteries = (allLotteries || []).slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        lotteries: paginatedLotteries,
        pagination: {
          page,
          limit,
          total: (allLotteries || []).length,
          totalPages: Math.ceil((allLotteries || []).length / limit)
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
