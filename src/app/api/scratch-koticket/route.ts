import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/supabase'
import { generateScratchPrize } from '@/lib/lottery-system'
import { initializeDatabase, query, addKokiPoints } from '@/lib/database-sqlite'

export async function POST(request: NextRequest) {
  const requestStarted = Date.now()
  try {
    const body = await request.json().catch(() => ({}))
    const { userId, koticketId } = body as { userId?: string; koticketId?: string }
    console.log('[Scratch] Incoming:', body)

    if (!userId || !koticketId) {
      return NextResponse.json(
        { success: false, error: 'User ID y KoTicket ID son requeridos' },
        { status: 400 }
      )
    }

    const userIdNum = parseInt(userId)
    const koticketIdNum = parseInt(koticketId)
    if (isNaN(userIdNum) || isNaN(koticketIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Parámetros inválidos' },
        { status: 400 }
      )
    }

    await initializeDatabase()
    console.log('[Scratch] DB initialized')

    const users = await getUsers('id', [userIdNum])
    const user = users[0]
    if (!user) {
      console.warn('[Scratch] Usuario no encontrado', userIdNum)
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const kotickets = await query('SELECT * FROM kotickets WHERE id = ? AND user_id = ?', [koticketIdNum, userIdNum])
    const koticket = kotickets[0]
    console.log('[Scratch] KoTicket lookup result:', koticket)

    if (!koticket) {
      return NextResponse.json(
        { success: false, error: 'KoTicket no encontrado' },
        { status: 404 }
      )
    }

    if (koticket.is_scratched) {
      return NextResponse.json(
        { success: false, error: 'Este KoTicket ya ha sido rascado' },
        { status: 400 }
      )
    }

    const prize = generateScratchPrize()
    console.log('[Scratch] Prize generated:', prize)
    const prizeAmount = prize.type === 'koki' ? prize.amount : 0

    await query('UPDATE kotickets SET is_scratched = 1, prize_amount = ?, scratch_date = ? WHERE id = ?', [
      prizeAmount,
      new Date().toISOString(),
      koticketIdNum
    ])
    console.log('[Scratch] KoTicket updated')

    if (prizeAmount > 0) {
      const added = await addKokiPoints(userIdNum, prizeAmount, 'earned', `Premio de KoTicket #${koticketIdNum}: ${prizeAmount} KOKI`)
      console.log('[Scratch] KOKI points added:', added)
    }

    const updatedUsers = await getUsers('id', [userIdNum])
    const updatedUser = updatedUsers[0] || null

    const duration = Date.now() - requestStarted
    console.log('[Scratch] Success in', duration, 'ms')

    return NextResponse.json({
      success: true,
      data: {
        prize: {
          type: prize.type,
            amount: prizeAmount,
            message: prizeAmount > 0 ? `¡Ganaste ${prizeAmount} KOKI!` : '¡Mejor suerte la próxima vez!'
        },
        user: updatedUser
      }
    })
  } catch (error: any) {
    console.error('[Scratch] Error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

