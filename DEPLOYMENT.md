# 🚀 Guía de Deployment en Vercel

## Configuración Paso a Paso

### 1. Preparar el Repositorio GitHub

El repositorio ya está configurado en: `https://github.com/benjaminheredia1/arquifi`

### 2. Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con tu cuenta de GitHub
3. Autoriza a Vercel para acceder a tus repositorios

### 3. Importar Proyecto

1. En el dashboard de Vercel, click en "New Project"
2. Busca y selecciona el repositorio `benjaminheredia1/arquifi`
3. Click en "Import"

### 4. Configurar Variables de Entorno

En la sección "Environment Variables" durante el import, agrega:

```bash
# Base de Datos
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Farcaster
NEYNAR_API_KEY=TU_NEYNAR_API_KEY
NEXT_PUBLIC_FARCASTER_SIGNER_UUID=tu-signer-uuid

# Blockchain
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=tu-wallet-connect-id
NEXT_PUBLIC_ALCHEMY_API_KEY=tu-alchemy-key

# Servicios
CLOUDINARY_CLOUD_NAME=tu-cloudinary-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu-cloudinary-secret

# App
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=tu-secret-super-seguro
```

### 5. Build Settings

Vercel detectará automáticamente:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 6. Deploy

1. Click en "Deploy"
2. Espera a que complete el build (2-3 minutos)
3. ¡Tu app estará live!

## 📝 Checklist de Variables de Entorno

### ✅ Requeridas para Funcionamiento Básico

- [ ] `DATABASE_URL` - Conexión a PostgreSQL
- [ ] `SUPABASE_URL` - URL de tu proyecto Supabase
- [ ] `SUPABASE_ANON_KEY` - Clave pública de Supabase
- [ ] `NEXT_PUBLIC_APP_URL` - URL de tu app en producción

### 🔗 Para Integración Farcaster

- [ ] `NEYNAR_API_KEY` - Para autenticación Farcaster
- [ ] `NEXT_PUBLIC_FARCASTER_SIGNER_UUID` - UUID del signer

### 🌐 Para Funcionalidad Web3

- [ ] `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect
- [ ] `NEXT_PUBLIC_ALCHEMY_API_KEY` - Para Base Network

### 🖼️ Para Imágenes (Opcional)

- [ ] `CLOUDINARY_CLOUD_NAME` - Gestión de imágenes
- [ ] `CLOUDINARY_API_KEY` - API Key de Cloudinary
- [ ] `CLOUDINARY_API_SECRET` - Secret de Cloudinary

### 🔐 Para Seguridad

- [ ] `NEXTAUTH_SECRET` - Secret para autenticación

## 🛠️ Configuración de Base de Datos

### Opción 1: Supabase (Recomendado)

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings → API
4. Copia:
   - `URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
5. Ve a Settings → Database
6. Copia la connection string → `DATABASE_URL`

### Opción 2: PostgreSQL Externo

```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

## 🔧 Comandos Útiles

### Deploy Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy desde local
vercel --prod
```

### Ver Logs
```bash
vercel logs [deployment-url]
```

### Configurar Dominio Custom
1. Ve a Project Settings → Domains
2. Agrega tu dominio
3. Configura DNS según las instrucciones

## 🚨 Troubleshooting

### Error: "Build failed"
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en el dashboard de Vercel

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté correctamente configurado
- Asegúrate de que la base de datos permita conexiones externas

### Error: "Function timeout"
- Las funciones serverless de Vercel tienen límite de 10s
- Optimiza consultas de base de datos lentas

### Error: "Module not found"
- Asegúrate de que todas las dependencias estén en `package.json`
- Ejecuta `npm install` localmente para verificar

## 📊 Monitoreo

### Analytics
- Ve a tu proyecto en Vercel → Analytics
- Monitorea Core Web Vitals, página views, etc.

### Logs
- Ve a Functions → View Function Logs
- Revisa errores de API y performance

### Performance
- Revisa Web Vitals en tiempo real
- Optimiza imágenes con Next.js Image

## 🔄 CI/CD Automático

Una vez configurado:

1. **Push a `main`** → Deploy automático a producción
2. **Push a otras ramas** → Preview deployments
3. **Pull Requests** → Deploy previews automáticos

## 🌐 URLs del Proyecto

- **Producción**: https://arquifi.vercel.app
- **Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com/benjaminheredia1/arquifi

---

¡Tu ArquiFI Lottery estará live en minutos! 🎰✨