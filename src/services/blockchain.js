const { ethers } = require('ethers');
const KokiLotteryABI = require('../../artifacts/contracts/KokiLottery.sol/KokiLottery.json');
const KokiTokenABI = require('../../artifacts/contracts/KokiToken.sol/KokiToken.json');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.lotteryContract = null;
        this.tokenContract = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Configurar provider para Base Network
            const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Configurar wallet si hay private key
            if (process.env.PRIVATE_KEY) {
                this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            }
            
            // Configurar contratos
            const lotteryAddress = process.env.LOTTERY_CONTRACT_ADDRESS;
            const tokenAddress = process.env.KOKI_TOKEN_ADDRESS;
            
            if (lotteryAddress && tokenAddress) {
                this.lotteryContract = new ethers.Contract(
                    lotteryAddress,
                    KokiLotteryABI.abi,
                    this.wallet || this.provider
                );
                
                this.tokenContract = new ethers.Contract(
                    tokenAddress,
                    KokiTokenABI.abi,
                    this.wallet || this.provider
                );
            }
            
            this.isInitialized = true;
            console.log('✅ Blockchain service initialized');
            
        } catch (error) {
            console.error('❌ Error initializing blockchain service:', error);
            throw error;
        }
    }

    // Obtener información de la lotería actual
    async getCurrentLotteryInfo() {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            if (this.lotteryContract) {
                const info = await this.lotteryContract.getCurrentLotteryInfo();
                return {
                    id: info.id.toString(),
                    startTime: info.startTime.toString(),
                    endTime: info.endTime.toString(),
                    ticketPrice: ethers.formatEther(info.ticketPrice),
                    isActive: info.isActive,
                    isCompleted: info.isCompleted,
                    timeRemaining: parseInt(info.timeRemaining.toString())
                };
            } else {
                // Datos simulados para desarrollo
                return this.getSimulatedLotteryInfo();
            }
        } catch (error) {
            console.error('Error getting lottery info:', error);
            return this.getSimulatedLotteryInfo();
        }
    }

    // Obtener tickets vendidos
    async getTicketsSold(lotteryId) {
        try {
            if (this.lotteryContract) {
                const ticketsSold = await this.lotteryContract.getTicketsSold(lotteryId);
                return parseInt(ticketsSold.toString());
            } else {
                // Simular tickets vendidos
                return Math.floor(Math.random() * 100) + 10;
            }
        } catch (error) {
            console.error('Error getting tickets sold:', error);
            return 0;
        }
    }

    // Obtener premio total
    async getTotalPrize() {
        try {
            if (this.tokenContract && this.lotteryContract) {
                const balance = await this.tokenContract.balanceOf(this.lotteryContract.target);
                return ethers.formatEther(balance);
            } else {
                // Simular premio total
                const ticketsSold = await this.getTicketsSold(1);
                return (ticketsSold * 10).toString();
            }
        } catch (error) {
            console.error('Error getting total prize:', error);
            return '0';
        }
    }

    // Comprar ticket
    async buyTicket(userAddress, number) {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            if (this.lotteryContract) {
                // Verificar que el usuario tenga suficientes tokens
                const userBalance = await this.tokenContract.balanceOf(userAddress);
                const ticketPrice = await this.lotteryContract.TICKET_PRICE();
                
                if (userBalance < ticketPrice) {
                    throw new Error('Saldo insuficiente de tokens KOKI');
                }

                // Aprobar tokens si es necesario
                const allowance = await this.tokenContract.allowance(userAddress, this.lotteryContract.target);
                if (allowance < ticketPrice) {
                    const approveTx = await this.tokenContract.connect(this.wallet).approve(
                        this.lotteryContract.target,
                        ticketPrice
                    );
                    await approveTx.wait();
                }

                // Comprar ticket
                const tx = await this.lotteryContract.buyTicket(number);
                const receipt = await tx.wait();

                return {
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    number,
                    userAddress
                };
            } else {
                // Simular compra de ticket
                return {
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                    blockNumber: Math.floor(Math.random() * 1000000),
                    number,
                    userAddress
                };
            }
        } catch (error) {
            console.error('Error buying ticket:', error);
            throw error;
        }
    }

    // Ejecutar sorteo
    async executeDraw() {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            if (this.lotteryContract) {
                const tx = await this.lotteryContract.executeDraw();
                const receipt = await tx.wait();

                // Obtener eventos del sorteo
                const drawEvent = receipt.logs.find(log => {
                    try {
                        const parsed = this.lotteryContract.interface.parseLog(log);
                        return parsed.name === 'LotteryCompleted';
                    } catch {
                        return false;
                    }
                });

                if (drawEvent) {
                    const parsed = this.lotteryContract.interface.parseLog(drawEvent);
                    return {
                        transactionHash: receipt.hash,
                        lotteryId: parsed.args.id.toString(),
                        winningNumbers: parsed.args.winningNumbers.map(n => parseInt(n.toString())),
                        winners: parsed.args.winners,
                        blockNumber: receipt.blockNumber
                    };
                }

                return {
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber
                };
            } else {
                // Simular ejecución de sorteo
                return this.simulateDraw();
            }
        } catch (error) {
            console.error('Error executing draw:', error);
            throw error;
        }
    }

    // Obtener resultados recientes
    async getRecentResults(limit = 5) {
        try {
            if (this.lotteryContract) {
                const results = [];
                const currentId = await this.lotteryContract.currentLotteryId();
                
                for (let i = Math.max(1, currentId - limit); i < currentId; i++) {
                    try {
                        const result = await this.lotteryContract.getLotteryResults(i);
                        if (result.isCompleted) {
                            results.push({
                                id: i,
                                winningNumbers: result.winningNumbers.map(n => parseInt(n.toString())),
                                winners: result.winners,
                                isCompleted: result.isCompleted
                            });
                        }
                    } catch (error) {
                        console.error(`Error getting result for lottery ${i}:`, error);
                    }
                }
                
                return results.reverse(); // Más recientes primero
            } else {
                // Simular resultados
                return this.getSimulatedResults(limit);
            }
        } catch (error) {
            console.error('Error getting recent results:', error);
            return [];
        }
    }

    // Obtener tickets por número
    async getTicketsByNumber(lotteryId, number) {
        try {
            if (this.lotteryContract) {
                const tickets = await this.lotteryContract.getTicketsByNumber(lotteryId, number);
                return tickets;
            } else {
                // Simular tickets
                return Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => 
                    `0x${Math.random().toString(16).substr(2, 40)}`
                );
            }
        } catch (error) {
            console.error('Error getting tickets by number:', error);
            return [];
        }
    }

    // Obtener estadísticas
    async getStats() {
        try {
            const currentInfo = await this.getCurrentLotteryInfo();
            const ticketsSold = await this.getTicketsSold(currentInfo.id);
            const totalPrize = await this.getTotalPrize();
            const recentResults = await this.getRecentResults(10);
            
            return {
                currentLottery: currentInfo,
                ticketsSold,
                totalPrize,
                totalLotteries: recentResults.length,
                totalWinners: recentResults.reduce((sum, result) => sum + result.winners.length, 0)
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    // Obtener información de ticket específico
    async getTicketInfo(lotteryId, number, userAddress) {
        try {
            const tickets = await this.getTicketsByNumber(lotteryId, number);
            const hasTicket = tickets.includes(userAddress);
            
            return {
                lotteryId,
                number,
                userAddress,
                hasTicket,
                ticketCount: tickets.length
            };
        } catch (error) {
            console.error('Error getting ticket info:', error);
            throw error;
        }
    }

    // Obtener historial de usuario
    async getUserHistory(userAddress, limit = 20) {
        try {
            const history = [];
            const currentInfo = await this.getCurrentLotteryInfo();
            
            // Buscar en las últimas loterías
            for (let i = Math.max(1, currentInfo.id - 10); i <= currentInfo.id; i++) {
                for (let number = 1; number <= 50; number++) {
                    const tickets = await this.getTicketsByNumber(i, number);
                    if (tickets.includes(userAddress)) {
                        history.push({
                            lotteryId: i,
                            number,
                            timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
                        });
                    }
                }
            }
            
            return history.slice(0, limit);
        } catch (error) {
            console.error('Error getting user history:', error);
            return [];
        }
    }

    // Métodos de simulación para desarrollo
    getSimulatedLotteryInfo() {
        const now = Date.now();
        const nextMonday = this.getNextMonday();
        const timeRemaining = Math.floor((nextMonday - now) / 1000);
        
        return {
            id: '1',
            startTime: (now - 3 * 24 * 60 * 60 * 1000).toString(), // 3 días atrás
            endTime: nextMonday.toString(),
            ticketPrice: '10.0',
            isActive: timeRemaining > 0,
            isCompleted: false,
            timeRemaining
        };
    }

    getSimulatedResults(limit) {
        const results = [];
        for (let i = 0; i < limit; i++) {
            const winningNumbers = Array.from({ length: 5 }, () => 
                Math.floor(Math.random() * 50) + 1
            );
            const winners = Array.from({ length: Math.floor(Math.random() * 10) }, () => 
                `0x${Math.random().toString(16).substr(2, 40)}`
            );
            
            results.push({
                id: i + 1,
                winningNumbers,
                winners,
                isCompleted: true
            });
        }
        return results;
    }

    simulateDraw() {
        const winningNumbers = Array.from({ length: 5 }, () => 
            Math.floor(Math.random() * 50) + 1
        );
        const winners = Array.from({ length: Math.floor(Math.random() * 10) }, () => 
            `0x${Math.random().toString(16).substr(2, 40)}`
        );
        
        return {
            transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
            lotteryId: '1',
            winningNumbers,
            winners,
            blockNumber: Math.floor(Math.random() * 1000000)
        };
    }

    getNextMonday() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);
        return nextMonday.getTime();
    }
}

module.exports = new BlockchainService();
