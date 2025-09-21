import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database-config'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/setup-user - Setting up database and demo users...')
    
    // Inicializar base de datos (creará tablas y usuarios demo)
    await initializeDatabase()
    
    console.log('✅ Database setup completed')
    
    return NextResponse.json({
      success: true,
      message: 'Database and demo users created successfully'
    })
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    return NextResponse.json(
      { success: false, error: 'Error setting up database', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/setup-user - Setting up database and demo users...')
    
    // Inicializar base de datos (creará tablas y usuarios demo)
    await initializeDatabase()
    
    console.log('✅ Database setup completed')
    
    return NextResponse.json({
      success: true,
      message: 'Database and demo users created successfully'
    })
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    return NextResponse.json(
      { success: false, error: 'Error setting up database', details: error.message },
      { status: 500 }
    )
  }
}