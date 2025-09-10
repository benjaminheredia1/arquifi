import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database-sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user tickets
    const tickets = await query(
      'SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )

    // Mapear los campos para que coincidan con el frontend
    const mappedTickets = (tickets || []).map(ticket => ({
      ...ticket,
      purchaseTime: new Date(ticket.created_at).getTime() / 1000, // Convertir a timestamp
      isWinner: false // Por ahora todos son false
    }))

    return NextResponse.json({
      success: true,
      data: {
        tickets: mappedTickets
      }
    })
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}