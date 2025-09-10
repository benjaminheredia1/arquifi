const cron = require('node-cron');
const blockchainService = require('./blockchain');
const imageGenerator = require('./imageGenerator');

class Scheduler {
    constructor() {
        this.tasks = new Map();
        this.isRunning = false;
    }

    initialize() {
        try {
            console.log('🕐 Inicializando programador de tareas...');
            
            // Programar sorteo automático cada lunes a las 00:00 UTC
            this.scheduleWeeklyDraw();
            
            // Programar actualización de imágenes cada 5 minutos
            this.scheduleImageUpdates();
            
            // Programar verificación de estado cada hora
            this.scheduleStatusChecks();
            
            this.isRunning = true;
            console.log('✅ Programador de tareas inicializado');
        } catch (error) {
            console.error('❌ Error inicializando programador:', error);
            throw error;
        }
    }

    scheduleWeeklyDraw() {
        // Ejecutar cada lunes a las 00:00 UTC
        const task = cron.schedule('0 0 * * 1', async () => {
            console.log('🎰 Ejecutando sorteo semanal...');
            await this.executeWeeklyDraw();
        }, {
            scheduled: false,
            timezone: 'UTC'
        });

        this.tasks.set('weeklyDraw', task);
        task.start();
        
        console.log('📅 Sorteo semanal programado para cada lunes a las 00:00 UTC');
    }

    scheduleImageUpdates() {
        // Actualizar imágenes cada 5 minutos
        const task = cron.schedule('*/5 * * * *', async () => {
            try {
                console.log('🖼️ Actualizando imágenes del frame...');
                await this.updateFrameImages();
            } catch (error) {
                console.error('Error updating frame images:', error);
            }
        }, {
            scheduled: false
        });

        this.tasks.set('imageUpdates', task);
        task.start();
        
        console.log('🖼️ Actualización de imágenes programada cada 5 minutos');
    }

    scheduleStatusChecks() {
        // Verificar estado cada hora
        const task = cron.schedule('0 * * * *', async () => {
            try {
                console.log('📊 Verificando estado de la lotería...');
                await this.checkLotteryStatus();
            } catch (error) {
                console.error('Error checking lottery status:', error);
            }
        }, {
            scheduled: false
        });

        this.tasks.set('statusChecks', task);
        task.start();
        
        console.log('📊 Verificación de estado programada cada hora');
    }

    async executeWeeklyDraw() {
        try {
            console.log('🎲 Iniciando proceso de sorteo semanal...');
            
            // Verificar que la lotería esté lista para el sorteo
            const lotteryInfo = await blockchainService.getCurrentLotteryInfo();
            
            if (!lotteryInfo.isActive) {
                console.log('⚠️ La lotería no está activa, saltando sorteo');
                return;
            }

            if (lotteryInfo.timeRemaining > 0) {
                console.log('⚠️ La lotería aún no ha terminado, saltando sorteo');
                return;
            }

            // Ejecutar el sorteo
            console.log('🎯 Ejecutando sorteo en blockchain...');
            const drawResult = await blockchainService.executeDraw();
            
            console.log('✅ Sorteo completado:', {
                transactionHash: drawResult.transactionHash,
                lotteryId: drawResult.lotteryId,
                winningNumbers: drawResult.winningNumbers,
                winnersCount: drawResult.winners?.length || 0
            });

            // Generar imagen con resultados
            await this.generateResultsImage(drawResult);
            
            // Notificar resultados (aquí podrías integrar con Twitter, Discord, etc.)
            await this.notifyResults(drawResult);
            
            console.log('🎉 Proceso de sorteo semanal completado');
            
        } catch (error) {
            console.error('❌ Error ejecutando sorteo semanal:', error);
            
            // Intentar notificar el error
            try {
                await this.notifyError('Error en sorteo semanal', error);
            } catch (notifyError) {
                console.error('Error notificando fallo:', notifyError);
            }
        }
    }

    async updateFrameImages() {
        try {
            // Generar imagen de estado actual
            const lotteryInfo = await blockchainService.getCurrentLotteryInfo();
            const ticketsSold = await blockchainService.getTicketsSold(lotteryInfo.id);
            const totalPrize = await blockchainService.getTotalPrize();
            
            const statusData = {
                type: 'status',
                lotteryInfo,
                ticketsSold,
                totalPrize,
                timeRemaining: lotteryInfo.timeRemaining
            };
            
            // Generar y guardar imagen (opcional)
            await imageGenerator.generateFrameImage(statusData);
            
        } catch (error) {
            console.error('Error updating frame images:', error);
        }
    }

    async checkLotteryStatus() {
        try {
            const lotteryInfo = await blockchainService.getCurrentLotteryInfo();
            const ticketsSold = await blockchainService.getTicketsSold(lotteryInfo.id);
            
            console.log('📊 Estado actual:', {
                lotteryId: lotteryInfo.id,
                isActive: lotteryInfo.isActive,
                ticketsSold,
                timeRemaining: lotteryInfo.timeRemaining
            });
            
            // Verificar si es hora de ejecutar el sorteo
            if (lotteryInfo.isActive && lotteryInfo.timeRemaining <= 0) {
                console.log('⏰ Es hora de ejecutar el sorteo');
                await this.executeWeeklyDraw();
            }
            
        } catch (error) {
            console.error('Error checking lottery status:', error);
        }
    }

    async generateResultsImage(drawResult) {
        try {
            const resultsData = {
                type: 'results',
                lastResult: {
                    winningNumbers: drawResult.winningNumbers.join(', '),
                    winnersCount: drawResult.winners?.length || 0
                },
                results: [{
                    id: drawResult.lotteryId,
                    winningNumbers: drawResult.winningNumbers,
                    winners: drawResult.winners || []
                }]
            };
            
            const imageBuffer = await imageGenerator.generateFrameImage(resultsData);
            
            // Aquí podrías guardar la imagen o enviarla a un servicio de almacenamiento
            console.log('🖼️ Imagen de resultados generada');
            
        } catch (error) {
            console.error('Error generating results image:', error);
        }
    }

    async notifyResults(drawResult) {
        try {
            const message = `🎉 ¡Sorteo completado! 🎰\n\n` +
                          `🏆 Números ganadores: ${drawResult.winningNumbers.join(', ')}\n` +
                          `👥 Ganadores: ${drawResult.winners?.length || 0}\n` +
                          `🔗 Transacción: ${drawResult.transactionHash}\n\n` +
                          `¡Felicidades a todos los ganadores! 🎊`;
            
            console.log('📢 Notificación de resultados:', message);
            
            // Aquí podrías integrar con servicios de notificación:
            // - Twitter API
            // - Discord webhook
            // - Telegram bot
            // - Email notifications
            
        } catch (error) {
            console.error('Error notifying results:', error);
        }
    }

    async notifyError(title, error) {
        try {
            const message = `❌ ${title}\n\n` +
                          `Error: ${error.message}\n` +
                          `Timestamp: ${new Date().toISOString()}`;
            
            console.log('🚨 Notificación de error:', message);
            
            // Aquí podrías enviar alertas a administradores
            
        } catch (notifyError) {
            console.error('Error notifying error:', notifyError);
        }
    }

    // Método para ejecutar sorteo manualmente (para testing)
    async executeManualDraw() {
        console.log('🎯 Ejecutando sorteo manual...');
        await this.executeWeeklyDraw();
    }

    // Método para obtener próximos sorteos programados
    getNextScheduledDraws() {
        const now = new Date();
        const nextMonday = this.getNextMonday(now);
        const followingMonday = this.getNextMonday(new Date(nextMonday.getTime() + 7 * 24 * 60 * 60 * 1000));
        
        return {
            next: nextMonday,
            following: followingMonday
        };
    }

    getNextMonday(date) {
        const dayOfWeek = date.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        const nextMonday = new Date(date);
        nextMonday.setDate(date.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);
        return nextMonday;
    }

    // Obtener estado del programador
    getStatus() {
        return {
            isRunning: this.isRunning,
            tasks: Array.from(this.tasks.keys()),
            nextDraws: this.getNextScheduledDraws()
        };
    }

    // Detener el programador
    stop() {
        console.log('🛑 Deteniendo programador de tareas...');
        
        this.tasks.forEach((task, name) => {
            task.stop();
            console.log(`⏹️ Tarea detenida: ${name}`);
        });
        
        this.tasks.clear();
        this.isRunning = false;
        
        console.log('✅ Programador de tareas detenido');
    }

    // Reiniciar el programador
    restart() {
        console.log('🔄 Reiniciando programador de tareas...');
        this.stop();
        this.initialize();
    }
}

module.exports = new Scheduler();
