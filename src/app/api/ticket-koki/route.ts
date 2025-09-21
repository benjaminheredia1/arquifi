import { NextRequest, NextResponse } from 'next/server'
import { 
  processTicketPurchaseWithKoki,
  getSystemConfig,
  createWeeklyFund
} from '@/lib/database-sqlite'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ticketId, ticketPrice, action } = body
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 })
    }
    
    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json({ 
        error: 'Invalid user ID' 
      }, { status: 400 })
    }
    
    console.log(`[Ticket KOKI] Processing ${action} for user ${userIdNum}`)
    
    if (action === 'reward_ticket_purchase') {
      if (!ticketId || !ticketPrice) {
        return NextResponse.json({ 
          error: 'Ticket ID and price are required' 
        }, { status: 400 })
      }
      
      // Procesar la recompensa KOKI por compra de ticket
      const success = await processTicketPurchaseWithKoki(
        userIdNum,
        ticketPrice,
        ticketId
      )
      
      if (!success) {
        return NextResponse.json({ 
          error: 'Failed to process KOKI reward' 
        }, { status: 500 })
      }
      
      const kokiPerTicket = parseInt(await getSystemConfig('koki_per_ticket') || '5')
      
      return NextResponse.json({
        success: true,
        kokiEarned: kokiPerTicket,
        message: `Earned ${kokiPerTicket} KOKI for purchasing ticket #${ticketId}`
      })
    }
    
    if (action === 'get_purchase_info') {
      // Obtener información sobre las recompensas de compra
      const ticketPriceBs = parseFloat(await getSystemConfig('ticket_price_bs') || '5')
      const kokiPerTicket = parseInt(await getSystemConfig('koki_per_ticket') || '5')
      const rouletteUnlockKoki = parseInt(await getSystemConfig('roulette_unlock_koki') || '25')
      
      const ticketsNeededForRoulette = Math.ceil(rouletteUnlockKoki / kokiPerTicket)
      
      return NextResponse.json({
        ticketPriceBs,
        kokiPerTicket,
        rouletteUnlockKoki,
        ticketsNeededForRoulette,
        message: `Each Bs ${ticketPriceBs} ticket gives you ${kokiPerTicket} KOKI. Need ${rouletteUnlockKoki} KOKI to unlock roulette (${ticketsNeededForRoulette} tickets).`
      })
    }
    
    if (action === 'create_weekly_fund') {
      const { weekStart, totalIncome } = body
      
      if (!weekStart || !totalIncome) {
        return NextResponse.json({ 
          error: 'Week start and total income are required' 
        }, { status: 400 })
      }
      
      const fundId = await createWeeklyFund(weekStart, totalIncome)
      
      if (!fundId) {
        return NextResponse.json({ 
          error: 'Failed to create weekly fund' 
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        fundId,
        message: `Weekly fund created for Bs ${totalIncome}`
      })
    }
    
    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('[Ticket KOKI] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}