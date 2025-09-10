const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

class ImageGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Configurar canvas
            this.canvas = createCanvas(1200, 630); // Tamaño estándar para Farcaster frames
            this.ctx = this.canvas.getContext('2d');
            
            this.isInitialized = true;
            console.log('✅ Image generator initialized');
        } catch (error) {
            console.error('❌ Error initializing image generator:', error);
            throw error;
        }
    }

    async generateFrameImage(data = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const { type = 'welcome', ...frameData } = data;
            
            // Limpiar canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Crear fondo con gradiente
            this.createBackground();
            
            // Agregar contenido según el tipo
            switch (type) {
                case 'welcome':
                    await this.drawWelcomeContent();
                    break;
                case 'status':
                    await this.drawStatusContent(frameData);
                    break;
                case 'results':
                    await this.drawResultsContent(frameData);
                    break;
                case 'success':
                    await this.drawSuccessContent(frameData);
                    break;
                case 'error':
                    await this.drawErrorContent(frameData);
                    break;
                case 'info':
                    await this.drawInfoContent(frameData);
                    break;
                default:
                    await this.drawWelcomeContent();
            }
            
            // Agregar footer
            this.drawFooter();
            
            return this.canvas.toBuffer('image/png');
        } catch (error) {
            console.error('Error generating frame image:', error);
            throw error;
        }
    }

    createBackground() {
        // Crear gradiente de fondo
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Agregar patrón de puntos
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 3 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    async drawWelcomeContent() {
        // Fondo con gradiente más moderno
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a1a');
        gradient.addColorStop(1, '#0a0a0a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Logo/Icono principal
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 120px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎰', this.canvas.width / 2, 180);
        
        // Título principal con gradiente
        const titleGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        titleGradient.addColorStop(0, '#ffffff');
        titleGradient.addColorStop(0.5, '#ff6b6b');
        titleGradient.addColorStop(1, '#4ecdc4');
        this.ctx.fillStyle = titleGradient;
        this.ctx.font = 'bold 64px Inter, Arial';
        this.ctx.fillText('KoquiFI Lottery', this.canvas.width / 2, 280);
        
        // Subtítulo
        this.ctx.font = '32px Inter, Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('Descubre, compra y gana con tickets únicos', this.canvas.width / 2, 340);
        this.ctx.fillText('en la blockchain. Tu suerte te espera cada lunes.', this.canvas.width / 2, 380);
        
        // Cards de estadísticas
        this.drawStatCard('🎫', 'Tickets Vendidos', '1,247', 150, 450);
        this.drawStatCard('💰', 'Premio Total', '12,470 KOKI', 450, 450);
        this.drawStatCard('🏆', 'Precio Ticket', '10 KOKI', 750, 450);
        
        // Botones modernos
        this.drawModernButton('🎫 Comprar Ticket', 200, 550, 200, 50);
        this.drawModernButton('📊 Estado', 450, 550, 150, 50);
        this.drawModernButton('🏆 Resultados', 650, 550, 180, 50);
        this.drawModernButton('ℹ️ Info', 880, 550, 120, 50);
    }

    async drawStatusContent(data) {
        const { lotteryInfo, ticketsSold, timeRemaining } = data;
        
        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('📊 Estado de la Lotería', this.canvas.width / 2, 120);
        
        // Información de la lotería
        const yStart = 200;
        const lineHeight = 50;
        
        this.ctx.font = '32px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        this.ctx.fillText(`🎫 Tickets Vendidos: ${ticketsSold || '0'}`, this.canvas.width / 2, yStart);
        this.ctx.fillText(`💰 Precio por Ticket: 10 KOKI`, this.canvas.width / 2, yStart + lineHeight);
        
        if (timeRemaining) {
            const days = Math.floor(timeRemaining / (24 * 60 * 60));
            const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
            
            this.ctx.fillText(`⏰ Tiempo Restante: ${days}d ${hours}h ${minutes}m`, this.canvas.width / 2, yStart + lineHeight * 2);
        }
        
        this.ctx.fillText(`📊 Estado: ${lotteryInfo?.isActive ? 'Activa' : 'Cerrada'}`, this.canvas.width / 2, yStart + lineHeight * 3);
        
        // Gráfico de barras simple para tickets
        this.drawTicketsChart(ticketsSold || 0);
    }

    async drawResultsContent(data) {
        const { results, lastResult } = data;
        
        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🏆 Resultados', this.canvas.width / 2, 120);
        
        if (lastResult) {
            // Último resultado
            this.ctx.font = '36px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fillText('Último Sorteo:', this.canvas.width / 2, 200);
            
            // Números ganadores
            this.ctx.font = '48px Arial';
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.fillText(lastResult.winningNumbers, this.canvas.width / 2, 280);
            
            // Número de ganadores
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillText(`👥 ${lastResult.winnersCount} Ganadores`, this.canvas.width / 2, 350);
        } else {
            this.ctx.font = '36px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillText('No hay resultados disponibles aún', this.canvas.width / 2, 250);
        }
        
        // Mostrar algunos resultados históricos
        if (results && results.length > 0) {
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fillText('Resultados Anteriores:', this.canvas.width / 2, 450);
            
            for (let i = 0; i < Math.min(3, results.length); i++) {
                const result = results[i];
                const winningNumbers = result.winningNumbers.join(', ');
                this.ctx.fillText(`Lotería #${result.id}: ${winningNumbers}`, this.canvas.width / 2, 480 + i * 30);
            }
        }
    }

    async drawSuccessContent(data) {
        const { selectedNumber, message } = data;
        
        // Título de éxito
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✅ ¡Éxito!', this.canvas.width / 2, 150);
        
        // Mensaje
        this.ctx.font = '36px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText(message || 'Ticket comprado exitosamente', this.canvas.width / 2, 250);
        
        if (selectedNumber) {
            // Número seleccionado
            this.ctx.font = '72px Arial';
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.fillText(`Número: ${selectedNumber}`, this.canvas.width / 2, 350);
        }
        
        // Información adicional
        this.ctx.font = '28px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('🎫 Tu ticket está registrado en blockchain', this.canvas.width / 2, 450);
        this.ctx.fillText('⏰ Próximo sorteo: Lunes 00:00', this.canvas.width / 2, 500);
    }

    async drawErrorContent(data) {
        const { error, message } = data;
        
        // Título de error
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('❌ Error', this.canvas.width / 2, 150);
        
        // Mensaje de error
        this.ctx.font = '32px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText(message || 'Algo salió mal', this.canvas.width / 2, 250);
        
        if (error) {
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fillText(error, this.canvas.width / 2, 320);
        }
        
        // Botón de reintento
        this.ctx.font = '28px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('Intenta nuevamente', this.canvas.width / 2, 450);
    }

    async drawInfoContent(data) {
        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ℹ️ Información', this.canvas.width / 2, 120);
        
        // Información del proyecto
        const yStart = 200;
        const lineHeight = 40;
        
        this.ctx.font = '28px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        const infoLines = [
            '🎰 KoquiFI Lottery',
            '🎫 Precio: 10 KOKI por ticket',
            '🔢 Números: 1 al 50',
            '🏆 5 números ganadores por sorteo',
            '📅 Frecuencia: Semanal (lunes)',
            '🌐 Red: Base Network',
            '🪙 Token: KOKI'
        ];
        
        infoLines.forEach((line, index) => {
            this.ctx.fillText(line, this.canvas.width / 2, yStart + index * lineHeight);
        });
        
        // Reglas
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillText('Los premios se distribuyen entre todos los ganadores', this.canvas.width / 2, 520);
    }

    drawButton(text, x, y, width, height) {
        // Fondo del botón
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x, y, width, height);
        
        // Borde del botón
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Texto del botón
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x + width / 2, y + height / 2 + 7);
    }

    drawTicketsChart(ticketsSold) {
        const chartX = 200;
        const chartY = 400;
        const chartWidth = 800;
        const chartHeight = 100;
        const maxTickets = 1000; // Escala máxima
        
        // Fondo del gráfico
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
        
        // Barra de tickets vendidos
        const barWidth = (ticketsSold / maxTickets) * chartWidth;
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(chartX, chartY, barWidth, chartHeight);
        
        // Texto del gráfico
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${ticketsSold} tickets vendidos`, chartX + chartWidth / 2, chartY + chartHeight + 30);
    }

    drawFooter() {
        // Línea decorativa
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(50, this.canvas.height - 50);
        this.ctx.lineTo(this.canvas.width - 50, this.canvas.height - 50);
        this.ctx.stroke();
        
        // Texto del footer
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '18px Inter, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('KoquiFI Lottery - Base Network', this.canvas.width / 2, this.canvas.height - 20);
    }

    drawStatCard(icon, title, value, x, y) {
        // Fondo de la card
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(x, y, 180, 80);
        
        // Borde de la card
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, 180, 80);
        
        // Icono
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(icon, x + 90, y + 25);
        
        // Título
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '14px Inter, Arial';
        this.ctx.fillText(title, x + 90, y + 45);
        
        // Valor
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.font = 'bold 16px Inter, Arial';
        this.ctx.fillText(value, x + 90, y + 65);
    }

    drawModernButton(text, x, y, width, height) {
        // Fondo del botón con gradiente
        const buttonGradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
        buttonGradient.addColorStop(0, '#ff6b6b');
        buttonGradient.addColorStop(1, '#4ecdc4');
        this.ctx.fillStyle = buttonGradient;
        this.ctx.fillRect(x, y, width, height);
        
        // Borde redondeado (simulado)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // Texto del botón
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Inter, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x + width / 2, y + height / 2 + 5);
    }
}

module.exports = new ImageGenerator();
