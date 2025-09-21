import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, query, addKokiPoints } from '@/lib/database-sqlite'

export async function GET() {
  try {
    console.log('🎯 Testing scratch functionality...')
    
    // Inicializar base de datos SQLite
    await initializeDatabase()
    
    // Verificar KoTickets del usuario 7
    const kotickets = await query('SELECT * FROM kotickets WHERE user_id = 7', [])
    console.log('🎫 KoTickets found:', kotickets.length)
    console.log('🎫 KoTickets:', kotickets)
    
    if (kotickets.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No KoTickets found for user 7'
      })
    }
    
    const firstTicket = kotickets[0]
    console.log('🎫 First ticket:', firstTicket)
    
    if (firstTicket.is_scratched) {
      return NextResponse.json({
        success: false,
        message: 'Ticket already scratched',
        ticket: firstTicket
      })
    }
    
    // Simular raspar el ticket
    const prizeAmount = Math.floor(Math.random() * 10) + 1 // 1-10 KOKI
    console.log('🎁 Prize amount:', prizeAmount)
    
    // Actualizar el ticket
    await query('UPDATE kotickets SET is_scratched = 1, prize_amount = ?, scratch_date = ? WHERE id = ?', [
      prizeAmount,
      new Date().toISOString(),
      firstTicket.id
    ])
    
    // Agregar KOKI points
    await addKokiPoints(7, prizeAmount, 'earned', `Test scratch prize: ${prizeAmount} KOKI`)
    
    // Verificar el ticket actualizado
    const updatedTickets = await query('SELECT * FROM kotickets WHERE id = ?', [firstTicket.id])
    console.log('🎫 Updated ticket:', updatedTickets[0])
    
    return NextResponse.json({
      success: true,
      message: `Ticket scratched successfully! Won ${prizeAmount} KOKI`,
      originalTicket: firstTicket,
      updatedTicket: updatedTickets[0],
      prizeAmount
    })
    
  } catch (error) {
    console.error('❌ Error in test scratch:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}