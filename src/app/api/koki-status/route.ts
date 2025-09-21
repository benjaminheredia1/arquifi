import { NextRequest, NextResponse } from 'next/server'
import { 
  getUserKokiBalance, 
  getUserKokiTransactions, 
  canUserPlayRoulette,
  getSystemConfig 
} from '@/lib/database-sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }
    
    console.log(`[KOKI Status] Getting KOKI status for user ${userIdNum}`)
    
    // Obtener balance actual
    const currentBalance = await getUserKokiBalance(userIdNum)
    console.log(`[KOKI Status] Current balance: ${currentBalance}`)
    
    // Verificar si puede jugar la ruleta
    const rouletteStatus = await canUserPlayRoulette(userIdNum)
    console.log(`[KOKI Status] Roulette status:`, rouletteStatus)
    
    // Obtener configuración del sistema
    const rouletteCost = parseInt(await getSystemConfig('roulette_cost_koki') || '10')
    const kokiPerTicket = parseInt(await getSystemConfig('koki_per_ticket') || '5')
    const dailyBonus = parseInt(await getSystemConfig('daily_koki_bonus') || '2')
    
    // Obtener historial reciente
    const recentTransactions = await getUserKokiTransactions(userIdNum, 5)
    console.log(`[KOKI Status] Recent transactions: ${recentTransactions.length}`)
    
    // Calcular progreso hacia la ruleta
    const progressPercentage = Math.min((currentBalance / rouletteStatus.requiredKoki) * 100, 100)
    
    const response = {
      userId: userIdNum,
      currentBalance,
      roulette: {
        canPlay: rouletteStatus.canPlay,
        requiredKoki: rouletteStatus.requiredKoki,
        costPerPlay: rouletteCost,
        progressPercentage: Math.round(progressPercentage)
      },
      system: {
        kokiPerTicket,
        dailyBonus,
        rouletteCost
      },
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.transaction_type,
        amount: tx.amount,
        source: tx.source,
        description: tx.description,
        date: tx.created_at
      }))
    }
    
    console.log(`[KOKI Status] Response:`, response)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('[KOKI Status] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}