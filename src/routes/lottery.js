const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const database = require('../services/database');

// Obtener estado actual de la lotería
router.get('/lottery-status', async (req, res) => {
    try {
        const currentLottery = database.getCurrentLottery();
        
        if (!currentLottery) {
            return res.status(404).json({
                success: false,
                error: 'No hay lotería disponible'
            });
        }
        
        // Calcular tiempo restante
        const now = new Date();
        const endTime = new Date(currentLottery.endTime);
        const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        res.json({
            success: true,
            data: {
                id: currentLottery.id,
                startTime: currentLottery.startTime,
                endTime: currentLottery.endTime,
                ticketPrice: currentLottery.ticketPrice,
                isActive: currentLottery.isActive,
                isCompleted: currentLottery.isCompleted,
                ticketsSold: currentLottery.totalTickets,
                totalPrize: currentLottery.totalPrize,
                timeRemaining: timeRemaining
            }
        });
    } catch (error) {
        console.error('Error getting lottery status:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estado de la lotería'
        });
    }
});

// Comprar ticket
router.post('/buy-ticket', async (req, res) => {
    try {
        const { number, userId, username } = req.body;
        
        if (!number || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Número y ID de usuario requeridos'
            });
        }
        
        if (number < 1 || number > 50) {
            return res.status(400).json({
                success: false,
                error: 'Número debe estar entre 1 y 50'
            });
        }
        
        // Verificar que el usuario existe
        const user = database.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        // Verificar que el usuario tiene suficiente balance
        if (user.balance < 10) {
            return res.status(400).json({
                success: false,
                error: 'Saldo insuficiente. Necesitas al menos 10 KOKI'
            });
        }
        
        // Obtener lotería actual
        const currentLottery = database.getCurrentLottery();
        if (!currentLottery || !currentLottery.isActive) {
            return res.status(400).json({
                success: false,
                error: 'No hay lotería activa en este momento'
            });
        }
        
        // Crear ticket
        const ticket = database.createTicket({
            userId: userId,
            lotteryId: currentLottery.id,
            number: number,
            price: 10
        });
        
        // Crear transacción
        database.createTransaction({
            userId: userId,
            type: 'ticket_purchase',
            amount: -10,
            description: `Compra de ticket #${number} - Lotería #${currentLottery.id}`
        });
        
        // Actualizar lotería
        database.updateLottery(currentLottery.id, {
            totalTickets: currentLottery.totalTickets + 1,
            totalPrize: currentLottery.totalPrize + 10
        });
        
        res.json({
            success: true,
            data: {
                ticket,
                user: database.getUserById(userId),
                lottery: database.getLotteryById(currentLottery.id)
            }
        });
    } catch (error) {
        console.error('Error buying ticket:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al comprar ticket'
        });
    }
});

// Obtener resultados de loterías pasadas
router.get('/lottery-results', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const results = await blockchainService.getRecentResults(limit);
        
        res.json({
            success: true,
            data: {
                results,
                count: results.length
            }
        });
    } catch (error) {
        console.error('Error getting lottery results:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener resultados'
        });
    }
});

// Obtener tickets vendidos por número
router.get('/tickets-by-number/:lotteryId/:number', async (req, res) => {
    try {
        const { lotteryId, number } = req.params;
        
        if (number < 1 || number > 50) {
            return res.status(400).json({
                success: false,
                error: 'Número debe estar entre 1 y 50'
            });
        }
        
        const tickets = await blockchainService.getTicketsByNumber(
            parseInt(lotteryId), 
            parseInt(number)
        );
        
        res.json({
            success: true,
            data: {
                lotteryId: parseInt(lotteryId),
                number: parseInt(number),
                tickets,
                count: tickets.length
            }
        });
    } catch (error) {
        console.error('Error getting tickets by number:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener tickets por número'
        });
    }
});

// Ejecutar sorteo (solo admin)
router.post('/execute-draw', async (req, res) => {
    try {
        const { adminAddress } = req.body;
        
        // Verificar que sea admin
        if (adminAddress !== process.env.ADMIN_ADDRESS) {
            return res.status(403).json({
                success: false,
                error: 'No autorizado para ejecutar sorteos'
            });
        }
        
        const result = await blockchainService.executeDraw();
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error executing draw:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al ejecutar sorteo'
        });
    }
});

// Obtener estadísticas generales
router.get('/stats', async (req, res) => {
    try {
        const stats = await blockchainService.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
});

// Obtener información de un ticket específico
router.get('/ticket-info/:lotteryId/:number/:userAddress', async (req, res) => {
    try {
        const { lotteryId, number, userAddress } = req.params;
        
        const ticketInfo = await blockchainService.getTicketInfo(
            parseInt(lotteryId),
            parseInt(number),
            userAddress
        );
        
        res.json({
            success: true,
            data: ticketInfo
        });
    } catch (error) {
        console.error('Error getting ticket info:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener información del ticket'
        });
    }
});

// Obtener historial de compras de un usuario
router.get('/user-history/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        
        const history = await blockchainService.getUserHistory(userAddress, limit);
        
        res.json({
            success: true,
            data: {
                userAddress,
                history,
                count: history.length
            }
        });
    } catch (error) {
        console.error('Error getting user history:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener historial del usuario'
        });
    }
});

// Obtener información del usuario (Farcaster)
router.post('/user-info', async (req, res) => {
    try {
        const { fid, address } = req.body;
        
        if (!fid) {
            return res.status(400).json({
                success: false,
                error: 'FID requerido'
            });
        }
        
        // Obtener información del usuario desde blockchain
        const userHistory = await blockchainService.getUserHistory(address || '0x0', 50);
        const currentLotteryInfo = await blockchainService.getCurrentLotteryInfo();
        
        // Calcular estadísticas del usuario
        const ticketsCount = userHistory.length;
        const totalSpent = ticketsCount * 10; // 10 KOKI por ticket
        
        // Simular balance de KOKI (en un caso real, esto vendría del contrato)
        const balance = Math.max(0, 1000 - totalSpent + Math.floor(Math.random() * 500));
        
        res.json({
            success: true,
            data: {
                fid,
                address,
                balance,
                ticketsCount,
                totalSpent,
                currentLottery: currentLotteryInfo.id,
                lastActivity: userHistory.length > 0 ? userHistory[0].timestamp : null
            }
        });
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener información del usuario'
        });
    }
});

module.exports = router;
