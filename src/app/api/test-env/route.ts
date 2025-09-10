import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return NextResponse.json({
      success: true,
      data: {
        supabaseUrl: supabaseUrl ? 'present' : 'missing',
        supabaseKey: supabaseKey ? 'present' : 'missing',
        envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
      }
    })
  } catch (error) {
    console.error('Test env error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
