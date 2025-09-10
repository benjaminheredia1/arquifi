# KoquiFI Lottery 🎰

Una lotería descentralizada innovadora construida en Base Network con integración completa de Farcaster. Combina la transparencia de blockchain con la comunidad social para crear una experiencia única de lotería.

## 🚀 Características

- **Totalmente Descentralizado**: Smart contracts en Base Network
- **Sorteos Automáticos**: Cada lunes a las 00:00 UTC con Chainlink VRF
- **Integración Farcaster**: Autenticación y experiencia social
- **Frontend Moderno**: React/TypeScript con diseño responsivo
- **Base Network**: Transacciones rápidas y económicas

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Wagmi** para interacción con blockchain
- **React Query** para manejo de estado

### Backend
- **Next.js API Routes** para endpoints
- **Neynar API** para integración Farcaster
- **Base Network** para blockchain

### Smart Contracts
- **Solidity** con OpenZeppelin
- **Foundry** para desarrollo y testing
- **Chainlink VRF** para aleatoriedad
- **Base Sepolia** para testing

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Foundry (para smart contracts)
- Wallet (MetaMask, etc.)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/your-username/kokifi-lottery.git
cd kokifi-lottery
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env.local
```

Edita `.env.local` con tus claves:
- `NEXT_PUBLIC_NEYNAR_API_KEY`: Tu API key de Neynar
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Tu Project ID de WalletConnect
- `PRIVATE_KEY`: Tu clave privada para deployment

### 4. Compilar smart contracts
```bash
npm run contracts:compile
```

### 5. Ejecutar tests
```bash
npm run contracts:test
```

### 6. Deployar contratos (Base Sepolia)
```bash
npm run contracts:deploy
```

### 7. Iniciar aplicación
```bash
npm run dev
```

## 🎮 Uso

### Para Usuarios
1. **Conectar Wallet**: Conecta tu wallet de Base Network
2. **Iniciar Sesión**: Usa tu cuenta de Farcaster o crea una nueva
3. **Comprar Tickets**: Selecciona números del 1-50 (10 KOKI cada uno)
4. **Esperar Sorteo**: Cada lunes a las 00:00 UTC
5. **Reclamar Premios**: Si eres ganador, reclama tus premios

### Para Desarrolladores
1. **Fork del repositorio**
2. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
3. **Hacer cambios y tests**
4. **Commit**: `git commit -m 'Add nueva funcionalidad'`
5. **Push**: `git push origin feature/nueva-funcionalidad`
6. **Crear Pull Request**

## 🏗️ Arquitectura

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── globals.css     # Estilos globales
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página principal
├── components/         # Componentes React
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Countdown.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   └── useLottery.ts
├── lib/                # Utilidades
│   ├── wagmi.ts
│   └── neynar.ts
└── types/              # TypeScript types
    └── index.ts

contracts/              # Smart contracts
├── KokiToken.sol
├── KokiLottery.sol
└── ...

scripts/                # Deployment scripts
└── Deploy.s.sol
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Ejecutar linter

# Smart Contracts
npm run contracts:compile    # Compilar contratos
npm run contracts:test       # Ejecutar tests
npm run contracts:deploy     # Deployar a Base Sepolia
npm run contracts:deploy-local # Deployar a red local

# Desarrollo completo
npm run dev:full         # Iniciar frontend + deploy local
```

## 🌐 Redes Soportadas

- **Base Sepolia** (Testnet) - Para desarrollo y testing
- **Base Mainnet** (Producción) - Para uso real

## 🔐 Seguridad

- **Smart contracts auditados** con OpenZeppelin
- **Chainlink VRF** para aleatoriedad verificable
- **ReentrancyGuard** para prevenir ataques
- **Pausable** para emergencias
- **Ownable** para control administrativo

## 📊 Funcionalidades

### Para Usuarios
- ✅ Compra de tickets (números 1-50)
- ✅ Visualización de estado de lotería
- ✅ Historial de resultados
- ✅ Reclamo de premios
- ✅ Integración con Farcaster
- ✅ Conteo regresivo en tiempo real

### Para Administradores
- ✅ Ejecución automática de sorteos
- ✅ Gestión de premios
- ✅ Estadísticas en tiempo real
- ✅ Control de emergencias

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto](https://github.com/your-username/kokifi-lottery/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/kokifi-lottery/issues)
- **Discord**: [Servidor de la comunidad](https://discord.gg/kokifi)
- **Twitter**: [@KoquiFILottery](https://twitter.com/KoquiFILottery)

## 🙏 Agradecimientos

- **Base Network** por la infraestructura blockchain
- **Farcaster** por la integración social
- **Chainlink** por VRF y oráculos
- **OpenZeppelin** por los contratos seguros
- **Next.js** por el framework React

---

**¡Construido con ❤️ por el equipo de KoquiFI!**