const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const frameRoutes = require('./routes/frame');
const lotteryRoutes = require('./routes/lottery');
const authRoutes = require('./routes/auth');
const blockchainService = require('./services/blockchain');
const imageGenerator = require('./services/imageGenerator');
const scheduler = require('./services/scheduler');
const database = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rutas
app.use('/api/frame', frameRoutes);
app.use('/api', lotteryRoutes);
app.use('/api/auth', authRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta para generar imagen del Frame
app.get('/api/frame/image', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateFrameImage();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'no-cache');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating frame image:', error);
        res.status(500).json({ error: 'Error generando imagen del frame' });
    }
});

// Inicializar servicios
async function initializeServices() {
    try {
        console.log('🚀 Inicializando KoquiFI Lottery...');
        
        // Inicializar servicio de blockchain
        await blockchainService.initialize();
        console.log('✅ Servicio de blockchain inicializado');
        
        // Inicializar generador de imágenes
        await imageGenerator.initialize();
        console.log('✅ Generador de imágenes inicializado');
        
        // Inicializar programador de tareas
        scheduler.initialize();
        console.log('✅ Programador de tareas inicializado');
        
        console.log('🎰 KoquiFI Lottery está listo!');
    } catch (error) {
        console.error('❌ Error inicializando servicios:', error);
        process.exit(1);
    }
}

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`🌐 Servidor ejecutándose en puerto ${PORT}`);
    await initializeServices();
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    scheduler.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor...');
    scheduler.stop();
    process.exit(0);
});

module.exports = app;
