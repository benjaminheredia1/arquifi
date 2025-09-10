# Guía de Despliegue en Vercel - KokiFi Lottery

## 🚨 Problema con SQLite en Vercel

Vercel no soporta SQLite en producción porque:
- Sistema de archivos de solo lectura
- Servidor se reinicia en cada request
- Límites de tiempo de ejecución

## ✅ Soluciones Recomendadas

### Opción 1: PlanetScale (MySQL) - RECOMENDADO

1. **Crear cuenta en PlanetScale**
   ```bash
   # Instalar CLI
   npm install -g @planetscale/cli
   
   # Login
   pscale auth login
   
   # Crear base de datos
   pscale database create kokifi-lottery
   ```

2. **Instalar dependencias**
   ```bash
   npm install mysql2
   ```

3. **Configurar variables de entorno en Vercel**
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   ```

### Opción 2: Supabase (PostgreSQL)

1. **Crear proyecto en Supabase**
2. **Instalar dependencias**
   ```bash
   npm install @supabase/supabase-js
   ```
3. **Configurar variables de entorno**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Opción 3: Neon (PostgreSQL)

1. **Crear cuenta en Neon**
2. **Instalar dependencias**
   ```bash
   npm install pg
   ```
3. **Configurar variables de entorno**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

## 🔧 Migración de SQLite a MySQL/PostgreSQL

### Cambios necesarios en el código:

1. **Reemplazar database-sqlite.ts**
2. **Actualizar queries SQL**
3. **Modificar tipos de datos**
4. **Configurar conexión de base de datos**

## 📋 Pasos para Despliegue

1. **Elegir base de datos en la nube**
2. **Migrar el esquema SQLite a MySQL/PostgreSQL**
3. **Actualizar el código de conexión**
4. **Configurar variables de entorno en Vercel**
5. **Desplegar en Vercel**

## 🎯 Recomendación Final

**Usar PlanetScale (MySQL)** porque:
- ✅ Compatible con SQLite
- ✅ Fácil migración
- ✅ Gratuito hasta 1GB
- ✅ Excelente rendimiento
- ✅ Fácil de configurar

¿Quieres que te ayude a migrar a PlanetScale?
