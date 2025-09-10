import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Probar conexión básica a Supabase
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: error.message
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Supabase connection successful',
        userCount: data?.length || 0
      }
    })
  } catch (error) {
    console.error('Test Supabase error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
