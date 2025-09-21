import { NextRequest, NextResponse } from 'next/server'
import { query, getOne, run } from '@/lib/database-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/accumulate-kotickets called');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID es requerido' },
        { status: 400 }
      );
    }

    console.log('📊 Checking accumulation status for user:', userId);

    // Verificar si el usuario ya acumuló hoy (versión simplificada)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const todayKoTickets = await query(`
      SELECT COUNT(*) as count 
      FROM kotickets 
      WHERE user_id = ? AND DATE(purchase_time) = ?
    `, [parseInt(userId), today]);

    const hasKoTicketToday = todayKoTickets[0]?.count > 0;

    return NextResponse.json({
      success: true,
      data: {
        canAccumulate: !hasKoTicketToday,
        hasAccumulatedToday: hasKoTicketToday,
        nextAccumulationTime: hasKoTicketToday ? 
          new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString() : 
          new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error in GET /api/accumulate-kotickets:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 POST /api/accumulate-kotickets called');
  
  try {
    console.log('✅ Database modules available');

    let requestBody;
    try {
      requestBody = await request.json();
      console.log('📦 Request body:', requestBody);
    } catch (error) {
      console.log('❌ Error parsing request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { userId } = requestBody;

    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json(
        { success: false, error: 'User ID es requerido' },
        { status: 400 }
      );
    }

    console.log('👤 Checking user:', userId);

    // Primero verificar qué usuarios existen
    let allUsers;
    try {
      allUsers = await query('SELECT id, username, email FROM users LIMIT 10');
      console.log('📋 Available users:', allUsers);
    } catch (error) {
      console.log('❌ Error getting all users:', error);
    }

    let user;
    try {
      user = await getOne('SELECT * FROM users WHERE id = ?', [parseInt(userId)]);
      console.log('👤 User query result:', user);
    } catch (error) {
      console.log('❌ Error querying user:', error);
      return NextResponse.json(
        { success: false, error: 'Database error while checking user' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.username);

    // Verificar si ya acumuló hoy (versión simplificada)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('📅 Checking for today:', today);
    
    let todayKoTickets;
    try {
      todayKoTickets = await query(`
        SELECT COUNT(*) as count 
        FROM kotickets 
        WHERE user_id = ? AND DATE(purchase_time) = ?
      `, [parseInt(userId), today]);
      console.log('📊 Today kotickets query result:', todayKoTickets);
    } catch (error) {
      console.log('❌ Error checking today kotickets:', error);
      return NextResponse.json(
        { success: false, error: 'Database error while checking accumulation' },
        { status: 500 }
      );
    }

    const hasKoTicketToday = todayKoTickets[0]?.count > 0;
    console.log('🎫 Has koticket today:', hasKoTicketToday);

    if (hasKoTicketToday) {
      console.log('⚠️ User already accumulated today');
      return NextResponse.json({
        success: false,
        error: 'Ya tienes un KoTicket acumulado hoy. ¡Vuelve mañana!',
        data: {
          accumulated: false,
          nextAccumulationTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }

    console.log('🎫 Creating new KoTicket...');

    let result;
    try {
      result = await run(`
        INSERT INTO kotickets (user_id, price, purchase_time, is_scratched, prize_amount)
        VALUES (?, ?, datetime('now'), 0, 0)
      `, [parseInt(userId), 0]);
      console.log('✅ Insert result:', result);
    } catch (error) {
      console.log('❌ Error creating koticket:', error);
      return NextResponse.json(
        { success: false, error: 'Database error while creating KoTicket' },
        { status: 500 }
      );
    }

    console.log('✅ KoTicket created, getting details...');

    let newKoTicket;
    try {
      newKoTicket = await getOne('SELECT * FROM kotickets WHERE rowid = last_insert_rowid()');
      console.log('✅ New koticket:', newKoTicket);
    } catch (error) {
      console.log('❌ Error getting new koticket:', error);
      return NextResponse.json(
        { success: false, error: 'Database error while retrieving KoTicket' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      data: {
        message: '¡KoTicket diario acumulado exitosamente!',
        accumulated: true,
        koticket: {
          ...newKoTicket,
          owner: parseInt(userId),
          purchaseTime: Math.floor(new Date(newKoTicket.purchase_time).getTime() / 1000),
          isScratched: false,
          prizeAmount: 0
        },
        nextAccumulationTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
      }
    };

    console.log('🎉 Sending success response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Unexpected error in POST /api/accumulate-kotickets:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
