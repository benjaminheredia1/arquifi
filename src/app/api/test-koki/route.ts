import { NextRequest, NextResponse } from 'next/server';
import { addKokiPoints, getUserKokiBalance, processTicketPurchaseWithKoki, getUserKokiTransactions } from '@/lib/database-sqlite';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing KOKI System...');
  
  try {
    const results: any[] = [];
    
    // Test 1: Obtener balance del usuario 7
    console.log('1. Getting balance for user 7...');
    const balance7 = await getUserKokiBalance(7);
    console.log(`User 7 balance: ${balance7} KOKI`);
    results.push({ test: 'User 7 balance', result: balance7 });
    
    // Test 2: Obtener balance del usuario 48154
    console.log('2. Getting balance for user 48154...');
    const balance48154 = await getUserKokiBalance(48154);
    console.log(`User 48154 balance: ${balance48154} KOKI`);
    results.push({ test: 'User 48154 balance', result: balance48154 });
    
    // Test 3: Agregar puntos al usuario 999 (que no existe)
    console.log('3. Adding points to non-existent user 999...');
    const result = await addKokiPoints(999, 10, 'bonus', 'test', 1, 'Test reward');
    console.log(`Result: ${result}`);
    results.push({ test: 'Add points to user 999', result });
    
    // Test 4: Verificar balance del usuario 999 después de agregarlo
    console.log('4. Getting balance for user 999 after creation...');
    const balance999 = await getUserKokiBalance(999);
    console.log(`User 999 balance: ${balance999} KOKI`);
    results.push({ test: 'User 999 balance after creation', result: balance999 });
    
    // Test 5: Simular compra de ticket
    console.log('5. Processing ticket purchase for user 7...');
    const ticketResult = await processTicketPurchaseWithKoki(7, 5, 12345);
    console.log(`Ticket purchase result: ${ticketResult}`);
    results.push({ test: 'Ticket purchase for user 7', result: ticketResult });
    
    // Test 6: Obtener transacciones del usuario 7
    console.log('6. Getting transactions for user 7...');
    const transactions = await getUserKokiTransactions(7, 5);
    console.log(`User 7 transactions:`, transactions);
    results.push({ test: 'User 7 transactions', result: transactions });
    
    console.log('✅ All tests completed!');
    
    return NextResponse.json({
      success: true,
      message: 'KOKI system tests completed',
      results
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}