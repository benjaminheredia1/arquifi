# 🎰 KoquiFI Lottery

Una aplicación de lotería moderna y elegante construida con Next.js, React y Tailwind CSS.

## ✨ Características

- 🎫 **Sistema de Lotería Semanal**: Tickets numerados del 1-50 para sorteos semanales
- 🎁 **KoTickets**: Sistema de rascar y ganar con premios de 1-10 KOKI
- 💰 **Economía KOKI**: Moneda virtual con sistema de compra y bonificaciones
- 👤 **Perfil de Usuario**: Sistema completo de autenticación y gestión de perfil
- 📱 **Diseño Responsive**: Optimizado para mobile y desktop
- 🎨 **UI Moderna**: Diseño elegante con animaciones y efectos visuales
- 📊 **Estadísticas en Tiempo Real**: Seguimiento de gastos, tickets y rendimiento
- 🔄 **Persistencia de Datos**: Base de datos SQLite para almacenamiento local

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Base de Datos**: SQLite
- **Autenticación**: Sistema personalizado
- **Web3**: Wagmi, WalletConnect (preparado para integración)

## 📦 Instalación

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/TheDuckHacker/KoquiFI-Lottery.git
   cd KoquiFI-Lottery
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Ejecuta la aplicación**:
   ```bash
   npm run dev
   ```

4. **Abre tu navegador** en `http://localhost:3000`

## 🎮 Cómo Usar

### Registro y Login
- Crea una cuenta con email y contraseña
- Selecciona un avatar personalizado
- Inicia sesión para acceder a todas las funcionalidades

### Sistema de Lotería
- **Comprar Tickets**: Adquiere tickets numerados (1-50) para el sorteo semanal
- **Precio**: 10 KOKI por ticket
- **Sorteo**: Cada semana se seleccionan números ganadores
- **Premios**: El bote se distribuye entre los ganadores

### KoTickets (Rascar y Ganar)
- **Gratis**: Los KoTickets son gratuitos
- **Requisito**: Necesitas 100+ KOKI para acceder
- **Premios**: 1-10 KOKI al azar
- **Disponibilidad**: Se acumulan automáticamente cada día

### Economía KOKI
- **Compra**: Adquiere KOKI con bonificaciones
- **Uso**: Para comprar tickets de lotería
- **Acceso**: Requerido para jugar KoTickets

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticación
│   │   ├── buy-koki/      # Compra de KOKI
│   │   ├── kotickets/     # Gestión de KoTickets
│   │   └── ...
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── UserProfile.tsx    # Perfil de usuario
│   ├── TicketScratchGame.tsx # Juego de rascar
│   ├── ActionButtons.tsx  # Botones principales
│   └── ...
├── hooks/                 # Custom Hooks
├── lib/                   # Utilidades y configuración
├── types/                 # Definiciones de TypeScript
└── styles/                # Estilos globales
```

## 🎯 Funcionalidades Principales

### Sistema de Usuarios
- Registro con email y contraseña
- Perfil personalizable con avatar
- Estadísticas de juego
- Historial de transacciones

### Sistema de Lotería
- Tickets numerados del 1-50
- Sorteos semanales automáticos
- Distribución de premios
- Historial de sorteos

### KoTickets
- Sistema de rascar y ganar
- Premios aleatorios de 1-10 KOKI
- Acumulación diaria automática
- Interfaz de juego interactiva

### Economía KOKI
- Sistema de compra con bonificaciones
- Balance en tiempo real
- Transacciones registradas
- Integración con todos los sistemas

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env.local`:
```env
# Base de datos
DATABASE_URL=./kokifi-lottery.db

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=KoquiFI Lottery
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Base de Datos
La aplicación usa SQLite para almacenamiento local. La base de datos se crea automáticamente en `./kokifi-lottery.db`.

## 📱 Diseño Responsive

- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints**: sm, md, lg, xl
- **Navegación**: Barra inferior en mobile
- **Componentes**: Adaptables a todos los tamaños

## 🎨 Personalización

### Colores
- **Primary**: Azul (#3B82F6)
- **Accent**: Verde (#10B981)
- **Success**: Verde (#22C55E)
- **Warning**: Amarillo (#F59E0B)
- **Error**: Rojo (#EF4444)

### Animaciones
- **Framer Motion**: Transiciones suaves
- **Hover Effects**: Efectos interactivos
- **Loading States**: Estados de carga animados

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otras Plataformas
- **Netlify**: Compatible con Next.js
- **Railway**: Para aplicaciones full-stack
- **Heroku**: Con configuración adicional

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**TheDuckHacker**
- GitHub: [@TheDuckHacker](https://github.com/TheDuckHacker)

## 🙏 Agradecimientos

- Next.js por el framework
- Tailwind CSS por el sistema de estilos
- Framer Motion por las animaciones
- SQLite por la base de datos
- La comunidad de React por el soporte

---

⭐ **¡Dale una estrella al proyecto si te gusta!** ⭐