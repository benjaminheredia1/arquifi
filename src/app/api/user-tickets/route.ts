import { NextRequest, NextResponse } from 'next/server'
import { getTickets } from '@/lib/supabase'

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

    // Get user tickets using specific function
    const allTickets = await getTickets()
    const userTickets = allTickets.filter(ticket => ticket.user_id === parseInt(userId))

    // Mapear los campos para que coincidan con el frontend
    const mappedTickets = userTickets.map(ticket => ({
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