// Test script para verificar el funcionamiento del sistema KOKI
const {
  addKokiPoints,
  getUserKokiBalance,
  processTicketPurchaseWithKoki,
  getUserKokiTransactions,
} = require("./src/lib/database-sqlite");

async function testKokiSystem() {
  console.log("🧪 Testing KOKI System...");

  try {
    // Test 1: Obtener balance del usuario 7
    console.log("\n1. Getting balance for user 7...");
    const balance7 = await getUserKokiBalance(7);
    console.log(`User 7 balance: ${balance7} KOKI`);

    // Test 2: Obtener balance del usuario 48154
    console.log("\n2. Getting balance for user 48154...");
    const balance48154 = await getUserKokiBalance(48154);
    console.log(`User 48154 balance: ${balance48154} KOKI`);

    // Test 3: Agregar puntos al usuario 999 (que no existe)
    console.log("\n3. Adding points to non-existent user 999...");
    const result = await addKokiPoints(
      999,
      10,
      "bonus",
      "test",
      1,
      "Test reward"
    );
    console.log(`Result: ${result}`);

    // Test 4: Verificar balance del usuario 999 después de agregarlo
    console.log("\n4. Getting balance for user 999 after creation...");
    const balance999 = await getUserKokiBalance(999);
    console.log(`User 999 balance: ${balance999} KOKI`);

    // Test 5: Simular compra de ticket
    console.log("\n5. Processing ticket purchase for user 7...");
    const ticketResult = await processTicketPurchaseWithKoki(7, 5, 12345);
    console.log(`Ticket purchase result: ${ticketResult}`);

    // Test 6: Obtener transacciones del usuario 7
    console.log("\n6. Getting transactions for user 7...");
    const transactions = await getUserKokiTransactions(7, 5);
    console.log(`User 7 transactions:`, transactions);

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testKokiSystem();
