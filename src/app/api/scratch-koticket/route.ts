import { NextRequest, NextResponse } from 'next/server'
import { getUserById, getKoTicketById, updateKoTicketScratch, addKokiPoints, initializeDatabase } from '@/lib/database-config'
import { generateScratchPrize } from '@/lib/lottery-system'

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

    const user = await getUserById(userIdNum)
    if (!user) {
      console.warn('[Scratch] Usuario no encontrado', userIdNum)
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const koticket = await getKoTicketById(koticketIdNum, userIdNum)
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

    const updateSuccess = await updateKoTicketScratch(koticketIdNum, prizeAmount)
    if (!updateSuccess) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar KoTicket' },
        { status: 500 }
      )
    }
    console.log('[Scratch] KoTicket updated')

    if (prizeAmount > 0) {
      const added = await addKokiPoints(userIdNum, prizeAmount, 'earned', `Premio de KoTicket #${koticketIdNum}: ${prizeAmount} KOKI`)
      console.log('[Scratch] KOKI points added:', added)
    }

    const updatedUser = await getUserById(userIdNum)

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

