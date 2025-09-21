import { NextRequest, NextResponse } from 'next/server'
import { 
  canUserPlayRoulette,
  spendKokiPoints,
  addKokiPoints,
  getSystemConfig,
  getUserKokiBalance
} from '@/lib/database-sqlite'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body
    
    if (!userId || !action) {
      return NextResponse.json({ 
        error: 'User ID and action are required' 
      }, { status: 400 })
    }
    
    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json({ 
        error: 'Invalid user ID' 
      }, { status: 400 })
    }
    
    console.log(`[Roulette KOKI] Processing ${action} for user ${userIdNum}`)
    
    if (action === 'check_eligibility') {
      // Verificar si el usuario puede jugar
      const rouletteStatus = await canUserPlayRoulette(userIdNum)
      const rouletteCost = parseInt(await getSystemConfig('roulette_cost_koki') || '10')
      const currentBalance = await getUserKokiBalance(userIdNum)
      
      return NextResponse.json({
        canPlay: rouletteStatus.canPlay,
        hasEnoughForPlay: currentBalance >= rouletteCost,
        requiredToUnlock: rouletteStatus.requiredKoki,
        costPerPlay: rouletteCost,
        currentBalance,
        progressPercentage: Math.round((currentBalance / rouletteStatus.requiredKoki) * 100)
      })
    }
    
    if (action === 'play_roulette') {
      const { prizeWon } = body
      
      // Verificar elegibilidad
      const rouletteStatus = await canUserPlayRoulette(userIdNum)
      if (!rouletteStatus.canPlay) {
        return NextResponse.json({ 
          error: `Need ${rouletteStatus.requiredKoki} KOKI to unlock roulette` 
        }, { status: 400 })
      }
      
      // Obtener costo de jugar
      const rouletteCost = parseInt(await getSystemConfig('roulette_cost_koki') || '10')
      
      // Verificar si tiene suficientes KOKI para jugar
      const currentBalance = await getUserKokiBalance(userIdNum)
      if (currentBalance < rouletteCost) {
        return NextResponse.json({ 
          error: `Need ${rouletteCost} KOKI to play roulette` 
        }, { status: 400 })
      }
      
      // Cobrar el costo de jugar
      const deductSuccess = await spendKokiPoints(
        userIdNum,
        rouletteCost,
        'roulette_play',
        undefined,
        `Roulette play cost`
      )
      
      if (!deductSuccess) {
        return NextResponse.json({ 
          error: 'Failed to deduct roulette cost' 
        }, { status: 500 })
      }
      
      // Si ganó un premio en KOKI, agregarlo
      let prizeKoki = 0
      if (prizeWon && prizeWon.type === 'koki') {
        prizeKoki = prizeWon.value
        
        const prizeSuccess = await addKokiPoints(
          userIdNum,
          prizeKoki,
          'earned',
          'roulette_win',
          undefined,
          `Roulette prize: ${prizeWon.name}`
        )
        
        if (!prizeSuccess) {
          console.error('Failed to add roulette prize KOKI')
        }
      }
      
      // Obtener nuevo balance
      const newBalance = await getUserKokiBalance(userIdNum)
      // Recalcular elegibilidad y progreso tras el juego
      const postPlayStatus = await canUserPlayRoulette(userIdNum)
      const progressPercentage = postPlayStatus.requiredKoki > 0
        ? Math.round((newBalance / postPlayStatus.requiredKoki) * 100)
        : 0
      
      return NextResponse.json({
        success: true,
        costPaid: rouletteCost,
        prizeWon: prizeKoki,
        newBalance,
        // Estado actualizado para que el frontend no tenga que hacer otra llamada
        canPlay: postPlayStatus.canPlay,
        hasEnoughForPlay: newBalance >= rouletteCost,
        requiredToUnlock: postPlayStatus.requiredKoki,
        costPerPlay: rouletteCost,
        progressPercentage,
        message: `Paid ${rouletteCost} KOKI to play${prizeKoki > 0 ? `, won ${prizeKoki} KOKI!` : ''}`
      })
    }
    
    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('[Roulette KOKI] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}