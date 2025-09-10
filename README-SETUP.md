# 🚀 KoquiFI Lottery - Configuración

## 📋 Requisitos Previos

1. **Node.js** (versión 18 o superior)
2. **npm** o **yarn**
3. **Base Network** (para transacciones reales)

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Database Configuration
DATABASE_URL=sqlite:./kokifi_lottery.db

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Base Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_CHAIN_ID=8453
```

### 2. WalletConnect Project ID

1. Ve a [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Crea una cuenta y un nuevo proyecto
3. Copia el Project ID y pégalo en `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 3. Instalación

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## 🎯 Funcionalidades Implementadas

### ✅ **Sistema de Base de Datos**
- SQLite para desarrollo (fácil de usar)
- PostgreSQL para producción
- Tablas: usuarios, loterías, tickets, transacciones

### ✅ **Sistema de Autenticación**
- Login con Farcaster
- Gestión de usuarios
- Perfiles personalizables

### ✅ **Sistema de Lotería**
- Compra de tickets
- Sorteos automáticos
- Historial de ganadores
- Estadísticas en tiempo real

### ✅ **Sistema de Wallet**
- Conexión con MetaMask
- Conexión con WalletConnect
- Soporte para Base Network

### ✅ **Mini Juegos**
- Juego de rascar tickets
- Premios en KOKI
- Sistema de recompensas

### ✅ **Economía KOKI**
- Precios en tiempo real
- Estadísticas de mercado
- Portfolio personal

## 🔧 Solución de Problemas

### Error de Base de Datos
Si ves errores de base de datos, asegúrate de que:
1. Las variables de entorno estén configuradas
2. La base de datos esté inicializada
3. Los permisos de archivo sean correctos

### Error de Wallet
Si la conexión de wallet falla:
1. Verifica que MetaMask esté instalado
2. Asegúrate de estar en Base Network
3. Revisa la configuración de WalletConnect

### Error de API
Si las APIs no funcionan:
1. Verifica que el servidor esté corriendo
2. Revisa los logs del servidor
3. Asegúrate de que las rutas estén correctas

## 📱 Uso de la Aplicación

1. **Iniciar Sesión**: Usa Farcaster o crea una cuenta demo
2. **Conectar Wallet**: Conecta MetaMask o WalletConnect
3. **Comprar Tickets**: Selecciona números y compra tickets
4. **Jugar Mini Juegos**: Rasca tickets para ganar KOKI
5. **Ver Estadísticas**: Revisa tu portfolio y estadísticas

## 🎨 Diseño

- **Glassmorphism**: Efectos de vidrio modernos
- **Tema Oscuro**: Colores elegantes y profesionales
- **Responsive**: Funciona en móvil y desktop
- **Animaciones**: Transiciones suaves y elegantes

## 🚀 Despliegue

Para producción:
1. Configura PostgreSQL
2. Actualiza las variables de entorno
3. Configura el dominio
4. Despliega en Vercel, Netlify o tu plataforma preferida

¡Disfruta de KoquiFI Lottery! 🎰✨
