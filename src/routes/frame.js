const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const imageGenerator = require('../services/imageGenerator');

// Endpoint principal del Frame de Farcaster
router.post('/', async (req, res) => {
    try {
        const { untrustedData } = req.body;
        
        if (!untrustedData) {
            return res.status(400).json({ error: 'Datos del frame no válidos' });
        }

        const buttonIndex = untrustedData.buttonIndex;
        const userAddress = untrustedData.fid; // FID del usuario en Farcaster
        
        console.log(`Frame action: Button ${buttonIndex} clicked by user ${userAddress}`);

        let response = {};

        switch (buttonIndex) {
            case 1: // Comprar Ticket
                response = await handleBuyTicket(userAddress, req.body);
                break;
            case 2: // Estado
                response = await handleStatus();
                break;
            case 3: // Resultados
                response = await handleResults();
                break;
            case 4: // Info
                response = await handleInfo();
                break;
            default:
                response = await handleDefault();
        }

        // Generar nueva imagen para el frame
        const imageBuffer = await imageGenerator.generateFrameImage(response.data);
        
        res.json({
            type: 'frame',
            image: `data:image/png;base64,${imageBuffer.toString('base64')}`,
            buttons: [
                { label: '🎫 Comprar Ticket', action: 'post' },
                { label: '📊 Estado', action: 'post' },
                { label: '🏆 Resultados', action: 'post' },
                { label: 'ℹ️ Info', action: 'post' }
            ],
            postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame`,
            ...response
        });

    } catch (error) {
        console.error('Error processing frame action:', error);
        res.status(500).json({ 
            error: 'Error procesando acción del frame',
            message: error.message 
        });
    }
});

// Manejar compra de ticket
async function handleBuyTicket(userAddress, frameData) {
    try {
        const { untrustedData } = frameData;
        const fid = untrustedData?.fid;
        
        if (!fid) {
            return {
                message: '❌ Debes estar conectado con Farcaster para comprar tickets.',
                data: { type: 'error', requiresAuth: true }
            };
        }
        
        const lotteryInfo = await blockchainService.getCurrentLotteryInfo();
        
        if (!lotteryInfo.isActive) {
            return {
                message: '❌ La lotería está cerrada. Próximo sorteo el lunes.',
                data: { type: 'error', lotteryInfo }
            };
        }

        // Simular selección de número (en un Frame real, esto vendría de la interacción)
        const selectedNumber = Math.floor(Math.random() * 50) + 1;
        
        // Aquí iría la lógica real de compra de ticket
        // const txResult = await blockchainService.buyTicket(userAddress, selectedNumber);
        
        return {
            message: `🎫 ¡Ticket comprado! Número: ${selectedNumber} por usuario FID: ${fid}`,
            data: { 
                type: 'success', 
                selectedNumber,
                lotteryInfo,
                fid,
                message: 'Ticket comprado exitosamente'
            }
        };
    } catch (error) {
        return {
            message: '❌ Error al comprar ticket',
            data: { type: 'error', error: error.message }
        };
    }
}

// Manejar consulta de estado
async function handleStatus() {
    try {
        const lotteryInfo = await blockchainService.getCurrentLotteryInfo();
        const ticketsSold = await blockchainService.getTicketsSold(lotteryInfo.id);
        
        const timeRemaining = lotteryInfo.timeRemaining;
        const days = Math.floor(timeRemaining / (24 * 60 * 60));
        const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
        
        return {
            message: `📊 Estado: ${ticketsSold} tickets vendidos. Tiempo restante: ${days}d ${hours}h ${minutes}m`,
            data: { 
                type: 'status', 
                lotteryInfo,
                ticketsSold,
                timeRemaining: `${days}d ${hours}h ${minutes}m`
            }
        };
    } catch (error) {
        return {
            message: '❌ Error al obtener estado',
            data: { type: 'error', error: error.message }
        };
    }
}

// Manejar consulta de resultados
async function handleResults() {
    try {
        const results = await blockchainService.getRecentResults(3); // Últimos 3 sorteos
        
        if (results.length === 0) {
            return {
                message: '🏆 No hay resultados disponibles aún',
                data: { type: 'results', results: [] }
            };
        }

        const lastResult = results[0];
        const winningNumbers = lastResult.winningNumbers.join(', ');
        
        return {
            message: `🏆 Último sorteo: Números ${winningNumbers}. ${lastResult.winners.length} ganadores`,
            data: { 
                type: 'results', 
                results,
                lastResult: {
                    winningNumbers,
                    winnersCount: lastResult.winners.length
                }
            }
        };
    } catch (error) {
        return {
            message: '❌ Error al obtener resultados',
            data: { type: 'error', error: error.message }
        };
    }
}

// Manejar consulta de información
async function handleInfo() {
    try {
        const lotteryInfo = await blockchainService.getCurrentLotteryInfo();
        
        return {
            message: 'ℹ️ KoquiFI Lottery - Sorteos semanales cada lunes. Precio: 10 KOKI por ticket',
            data: { 
                type: 'info', 
                lotteryInfo,
                rules: {
                    price: '10 KOKI',
                    numbers: '1-50',
                    frequency: 'Semanal (lunes)',
                    network: 'Base Network'
                }
            }
        };
    } catch (error) {
        return {
            message: '❌ Error al obtener información',
            data: { type: 'error', error: error.message }
        };
    }
}

// Manejar acción por defecto
async function handleDefault() {
    try {
        const lotteryInfo = await blockchainService.getCurrentLotteryInfo();
        
        return {
            message: '🎰 KoquiFI Lottery - ¡Bienvenido! Selecciona una opción',
            data: { 
                type: 'welcome', 
                lotteryInfo 
            }
        };
    } catch (error) {
        return {
            message: '❌ Error al cargar información',
            data: { type: 'error', error: error.message }
        };
    }
}

module.exports = router;
