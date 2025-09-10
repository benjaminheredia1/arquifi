import { NextRequest, NextResponse } from 'next/server'
import { getOne, run, query } from '@/lib/database-sqlite'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await getOne('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el usuario ya tiene KoTickets acumulados hoy
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const todayKoTickets = await query(`
      SELECT COUNT(*) as count 
      FROM kotickets 
      WHERE user_id = ? AND DATE(purchase_time) = ?
    `, [userId, today])

    const hasKoTicketToday = todayKoTickets[0]?.count > 0

    if (hasKoTicketToday) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Ya tienes un KoTicket acumulado hoy',
          accumulated: false
        }
      })
    }

    // Crear un KoTicket acumulado (gratis)
    await run(`
      INSERT INTO kotickets (user_id, price, purchase_time)
      VALUES (?, ?, datetime('now'))
    `, [userId, 0]) // Precio 0 = GRATIS

    const newKoTicket = await getOne('SELECT * FROM kotickets WHERE id = last_insert_rowid()')

    return NextResponse.json({
      success: true,
      data: {
        message: '¡KoTicket acumulado exitosamente!',
        accumulated: true,
        koticket: newKoTicket
      }
    })

  } catch (error) {
    console.error('Error accumulating KoTicket:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

