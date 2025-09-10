// Base de datos en memoria para la demo
class Database {
    constructor() {
        this.users = new Map();
        this.tickets = new Map();
        this.lotteries = new Map();
        this.transactions = new Map();
        this.initializeDemoData();
    }

    // Inicializar datos de demostración
    initializeDemoData() {
        // Usuarios de demo
        this.users.set('demo1', {
            id: 'demo1',
            username: 'UsuarioDemo1',
            email: 'demo1@kokifi.com',
            password: 'demo123',
            fid: 12345,
            avatar: '🎰',
            address: '0x1234567890123456789012345678901234567890',
            balance: 1500,
            ticketsCount: 5,
            joinedAt: new Date('2024-01-15').toISOString(),
            isActive: true
        });

        this.users.set('demo2', {
            id: 'demo2',
            username: 'LuckyPlayer',
            email: 'demo2@kokifi.com',
            password: 'demo123',
            fid: 67890,
            avatar: '🍀',
            address: '0x9876543210987654321098765432109876543210',
            balance: 800,
            ticketsCount: 12,
            joinedAt: new Date('2024-01-20').toISOString(),
            isActive: true
        });

        this.users.set('demo3', {
            id: 'demo3',
            username: 'Winner2024',
            email: 'demo3@kokifi.com',
            password: 'demo123',
            fid: 11111,
            avatar: '🏆',
            address: '0x5555555555555555555555555555555555555555',
            balance: 2500,
            ticketsCount: 8,
            joinedAt: new Date('2024-02-01').toISOString(),
            isActive: true
        });

        // Tickets de demo
        this.tickets.set('ticket1', {
            id: 'ticket1',
            userId: 'demo1',
            lotteryId: 1,
            number: 25,
            price: 10,
            purchasedAt: new Date('2024-01-16').toISOString(),
            isActive: true
        });

        this.tickets.set('ticket2', {
            id: 'ticket2',
            userId: 'demo1',
            lotteryId: 1,
            number: 42,
            price: 10,
            purchasedAt: new Date('2024-01-17').toISOString(),
            isActive: true
        });

        this.tickets.set('ticket3', {
            id: 'ticket3',
            userId: 'demo2',
            lotteryId: 1,
            number: 7,
            price: 10,
            purchasedAt: new Date('2024-01-18').toISOString(),
            isActive: true
        });

        // Loterías de demo
        this.lotteries.set(1, {
            id: 1,
            startTime: new Date('2024-01-15').toISOString(),
            endTime: new Date('2024-01-22').toISOString(),
            ticketPrice: 10,
            winningNumbers: [7, 25, 42, 15, 33],
            winners: ['demo2', 'demo1'],
            isActive: false,
            isCompleted: true,
            totalTickets: 3,
            totalPrize: 30
        });

        this.lotteries.set(2, {
            id: 2,
            startTime: new Date('2024-01-22').toISOString(),
            endTime: new Date('2024-01-29').toISOString(),
            ticketPrice: 10,
            winningNumbers: [],
            winners: [],
            isActive: true,
            isCompleted: false,
            totalTickets: 0,
            totalPrize: 0
        });

        // Transacciones de demo
        this.transactions.set('tx1', {
            id: 'tx1',
            userId: 'demo1',
            type: 'ticket_purchase',
            amount: 10,
            description: 'Compra de ticket #25',
            timestamp: new Date('2024-01-16').toISOString(),
            status: 'completed'
        });
    }

    // Usuarios
    createUser(userData) {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = {
            id,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            fid: userData.fid || Math.floor(Math.random() * 100000) + 1000,
            avatar: userData.avatar || '🎰',
            address: userData.address || `0x${Math.random().toString(16).substr(2, 40)}`,
            balance: 1000, // Balance inicial
            ticketsCount: 0,
            joinedAt: new Date().toISOString(),
            isActive: true
        };
        
        this.users.set(id, user);
        return user;
    }

    getUserById(id) {
        return this.users.get(id);
    }

    getUserByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    getUserByUsername(username) {
        for (const user of this.users.values()) {
            if (user.username === username) {
                return user;
            }
        }
        return null;
    }

    updateUser(id, updates) {
        const user = this.users.get(id);
        if (user) {
            Object.assign(user, updates);
            this.users.set(id, user);
            return user;
        }
        return null;
    }

    getAllUsers() {
        return Array.from(this.users.values());
    }

    // Tickets
    createTicket(ticketData) {
        const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const ticket = {
            id,
            userId: ticketData.userId,
            lotteryId: ticketData.lotteryId,
            number: ticketData.number,
            price: ticketData.price || 10,
            purchasedAt: new Date().toISOString(),
            isActive: true
        };
        
        this.tickets.set(id, ticket);
        
        // Actualizar contador de tickets del usuario
        const user = this.getUserById(ticketData.userId);
        if (user) {
            user.ticketsCount++;
            user.balance -= ticket.price;
            this.updateUser(ticketData.userId, user);
        }
        
        return ticket;
    }

    getTicketsByUser(userId) {
        return Array.from(this.tickets.values()).filter(ticket => ticket.userId === userId);
    }

    getTicketsByLottery(lotteryId) {
        return Array.from(this.tickets.values()).filter(ticket => ticket.lotteryId === lotteryId);
    }

    getTicketById(id) {
        return this.tickets.get(id);
    }

    // Loterías
    createLottery(lotteryData) {
        const id = this.lotteries.size + 1;
        const lottery = {
            id,
            startTime: lotteryData.startTime || new Date().toISOString(),
            endTime: lotteryData.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            ticketPrice: lotteryData.ticketPrice || 10,
            winningNumbers: lotteryData.winningNumbers || [],
            winners: lotteryData.winners || [],
            isActive: lotteryData.isActive !== undefined ? lotteryData.isActive : true,
            isCompleted: lotteryData.isCompleted || false,
            totalTickets: 0,
            totalPrize: 0
        };
        
        this.lotteries.set(id, lottery);
        return lottery;
    }

    getLotteryById(id) {
        return this.lotteries.get(id);
    }

    getCurrentLottery() {
        const lotteries = Array.from(this.lotteries.values());
        return lotteries.find(lottery => lottery.isActive && !lottery.isCompleted) || lotteries[lotteries.length - 1];
    }

    updateLottery(id, updates) {
        const lottery = this.lotteries.get(id);
        if (lottery) {
            Object.assign(lottery, updates);
            this.lotteries.set(id, lottery);
            return lottery;
        }
        return null;
    }

    getAllLotteries() {
        return Array.from(this.lotteries.values());
    }

    // Transacciones
    createTransaction(transactionData) {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const transaction = {
            id,
            userId: transactionData.userId,
            type: transactionData.type,
            amount: transactionData.amount,
            description: transactionData.description,
            timestamp: new Date().toISOString(),
            status: transactionData.status || 'completed'
        };
        
        this.transactions.set(id, transaction);
        return transaction;
    }

    getTransactionsByUser(userId) {
        return Array.from(this.transactions.values()).filter(tx => tx.userId === userId);
    }

    getTransactionById(id) {
        return this.transactions.get(id);
    }

    // Estadísticas
    getStats() {
        const users = this.getAllUsers();
        const tickets = Array.from(this.tickets.values());
        const lotteries = this.getAllLotteries();
        
        return {
            totalUsers: users.length,
            totalTickets: tickets.length,
            totalLotteries: lotteries.length,
            totalVolume: tickets.reduce((sum, ticket) => sum + ticket.price, 0),
            activeUsers: users.filter(user => user.isActive).length
        };
    }

    // Búsquedas
    searchUsers(query) {
        const users = this.getAllUsers();
        return users.filter(user => 
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Limpiar datos (para testing)
    clearAll() {
        this.users.clear();
        this.tickets.clear();
        this.lotteries.clear();
        this.transactions.clear();
        this.initializeDemoData();
    }

    // Exportar datos
    exportData() {
        return {
            users: Array.from(this.users.entries()),
            tickets: Array.from(this.tickets.entries()),
            lotteries: Array.from(this.lotteries.entries()),
            transactions: Array.from(this.transactions.entries())
        };
    }

    // Importar datos
    importData(data) {
        this.users = new Map(data.users || []);
        this.tickets = new Map(data.tickets || []);
        this.lotteries = new Map(data.lotteries || []);
        this.transactions = new Map(data.transactions || []);
    }
}

module.exports = new Database();
