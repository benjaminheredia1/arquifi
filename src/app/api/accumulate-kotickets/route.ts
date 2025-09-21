import { NextRequest, NextResponse } from 'next/server'
import { getKoTickets, getUserById, createKoTicket } from '@/lib/database-config';

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

    // Obtener todos los KoTickets del usuario
    const userKoTickets = await getKoTickets(parseInt(userId));
    
    // Verificar si ya acumuló hoy
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hasKoTicketToday = userKoTickets.some(ticket => {
      const ticketDate = new Date(ticket.purchase_time).toISOString().split('T')[0];
      return ticketDate === today;
    });

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

    // Verificar si el usuario existe
    const user = await getUserById(parseInt(userId));
    console.log('👤 User query result:', user);

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.username || user.display_name);

    // Obtener KoTickets del usuario para verificar si ya acumuló hoy
    const userKoTickets = await getKoTickets(parseInt(userId));
    console.log('📊 User kotickets:', userKoTickets.length);
    
    // Verificar si ya acumuló hoy
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('📅 Checking for today:', today);
    
    const hasKoTicketToday = userKoTickets.some(ticket => {
      const ticketDate = new Date(ticket.purchase_time).toISOString().split('T')[0];
      return ticketDate === today;
    });
    
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

    // Crear nuevo KoTicket
    const success = await createKoTicket(parseInt(userId));
    
    if (!success) {
      console.log('❌ Error creating koticket');
      return NextResponse.json(
        { success: false, error: 'Error al crear el KoTicket' },
        { status: 500 }
      );
    }

    console.log('✅ KoTicket created successfully');

    const response = {
      success: true,
      data: {
        message: '¡KoTicket diario acumulado exitosamente!',
        accumulated: true,
        koticket: {
          id: Date.now(), // ID temporal
          owner: parseInt(userId),
          purchaseTime: Math.floor(Date.now() / 1000),
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
