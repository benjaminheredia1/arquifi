import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Farcaster webhook received:', body)
    
    // Aquí puedes procesar los eventos de Farcaster
    // Por ejemplo: nuevos usuarios, interacciones, etc.
    
    return NextResponse.json({
      success: true,
      message: 'Webhook received successfully'
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'KokiFi Lottery Farcaster Webhook',
    status: 'active'
  })
}
