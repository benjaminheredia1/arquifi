const express = require('express');
const router = express.Router();
const database = require('../services/database');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;
        
        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email y password son requeridos'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }
        
        // Verificar si el usuario ya existe
        if (database.getUserByEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe un usuario con este email'
            });
        }
        
        if (database.getUserByUsername(username)) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe un usuario con este username'
            });
        }
        
        // Crear usuario
        const user = database.createUser({
            username,
            email,
            password, // En producción, esto debería estar hasheado
            avatar
        });
        
        // Crear transacción de bienvenida
        database.createTransaction({
            userId: user.id,
            type: 'welcome_bonus',
            amount: 1000,
            description: 'Bono de bienvenida - 1000 KOKI'
        });
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    fid: user.fid,
                    address: user.address,
                    balance: user.balance,
                    ticketsCount: user.ticketsCount,
                    joinedAt: user.joinedAt
                },
                message: 'Usuario registrado exitosamente'
            }
        });
        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y password son requeridos'
            });
        }
        
        // Buscar usuario
        const user = database.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }
        
        // Verificar password (en producción, usar bcrypt)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }
        
        // Verificar si el usuario está activo
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Cuenta desactivada'
            });
        }
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    fid: user.fid,
                    address: user.address,
                    balance: user.balance,
                    ticketsCount: user.ticketsCount,
                    joinedAt: user.joinedAt
                },
                message: 'Login exitoso'
            }
        });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener información del usuario
router.get('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = database.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        // Obtener tickets del usuario
        const tickets = database.getTicketsByUser(id);
        const transactions = database.getTransactionsByUser(id);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    fid: user.fid,
                    address: user.address,
                    balance: user.balance,
                    ticketsCount: user.ticketsCount,
                    joinedAt: user.joinedAt
                },
                tickets,
                transactions: transactions.slice(0, 10) // Últimas 10 transacciones
            }
        });
        
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Actualizar perfil del usuario
router.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, avatar } = req.body;
        
        const user = database.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        // Verificar si el nuevo username ya existe
        if (username && username !== user.username) {
            const existingUser = database.getUserByUsername(username);
            if (existingUser && existingUser.id !== id) {
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un usuario con este username'
                });
            }
        }
        
        // Actualizar usuario
        const updatedUser = database.updateUser(id, {
            username: username || user.username,
            avatar: avatar || user.avatar
        });
        
        res.json({
            success: true,
            data: {
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                    fid: updatedUser.fid,
                    address: updatedUser.address,
                    balance: updatedUser.balance,
                    ticketsCount: updatedUser.ticketsCount,
                    joinedAt: updatedUser.joinedAt
                },
                message: 'Perfil actualizado exitosamente'
            }
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener estadísticas generales
router.get('/stats', async (req, res) => {
    try {
        const stats = database.getStats();
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Buscar usuarios
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Query de búsqueda requerido'
            });
        }
        
        const users = database.searchUsers(q);
        
        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    ticketsCount: user.ticketsCount,
                    joinedAt: user.joinedAt
                })),
                count: users.length
            }
        });
        
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener usuarios de demo
router.get('/demo-users', async (req, res) => {
    try {
        const users = database.getAllUsers();
        
        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    balance: user.balance,
                    ticketsCount: user.ticketsCount,
                    joinedAt: user.joinedAt
                })),
                count: users.length
            }
        });
        
    } catch (error) {
        console.error('Error getting demo users:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
