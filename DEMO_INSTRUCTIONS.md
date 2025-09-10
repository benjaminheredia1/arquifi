# 🎰 KoquiFI Lottery - Demo Funcional

## ✅ **Sistema de Autenticación Demo**

### **Usuarios Predefinidos (Para Pruebas Rápidas)**
Puedes usar estos usuarios que ya están en el sistema:

1. **Usuario Demo 1**
   - Email: `demo1@kokifi.com`
   - Password: `demo123`
   - Balance: 1500 KOKI
   - Tickets: 5

2. **Lucky Player**
   - Email: `demo2@kokifi.com`
   - Password: `demo123`
   - Balance: 800 KOKI
   - Tickets: 12

3. **Winner 2024**
   - Email: `demo3@kokifi.com`
   - Password: `demo123`
   - Balance: 2500 KOKI
   - Tickets: 8

### **Registro de Nuevos Usuarios**
También puedes registrarte con **CUALQUIER EMAIL** que quieras:

1. Haz clic en "Iniciar Sesión"
2. Selecciona "Registrarse"
3. Completa el formulario con:
   - **Username**: Tu nombre de usuario
   - **Email**: Cualquier email (ej: `tuemail@gmail.com`)
   - **Password**: Mínimo 6 caracteres
4. ¡Recibirás 1000 KOKI de bienvenida!

## 🎫 **Compra de Tickets**

### **Cómo Comprar Tickets**
1. **Inicia sesión** con cualquier usuario
2. Haz clic en **"Comprar Ticket"**
3. Selecciona un **número del 1 al 50**
4. Confirma la compra (cuesta 10 KOKI)
5. ¡Tu ticket se guardará en la base de datos!

### **Validaciones del Sistema**
- ✅ **Balance suficiente**: Verifica que tengas KOKI suficiente
- ✅ **Números únicos**: No puedes comprar números ya tomados
- ✅ **Rango válido**: Solo números del 1 al 50
- ✅ **Lotería activa**: Solo funciona durante loterías activas

## 🏆 **Funcionalidades Demo**

### **Base de Datos en Memoria**
- **Usuarios**: Se guardan automáticamente al registrarse
- **Tickets**: Se almacenan con número, usuario y fecha
- **Transacciones**: Historial completo de compras
- **Loterías**: Estado actual y resultados pasados

### **Estadísticas en Tiempo Real**
- **Total de usuarios** registrados
- **Tickets vendidos** en la lotería actual
- **Premio acumulado** en KOKI
- **Loterías activas**

### **Sistema de Premios**
- **Lotería semanal**: Cada lunes a las 00:00 UTC
- **Números ganadores**: Se generan aleatoriamente
- **Distribución automática**: Los premios se distribuyen automáticamente

## 🚀 **Cómo Probar la Demo**

### **Flujo Completo de Prueba**
1. **Registro**: Crea una cuenta nueva con tu email
2. **Login**: Inicia sesión con tus credenciales
3. **Explorar**: Ve las estadísticas y estado de la lotería
4. **Comprar**: Adquiere varios tickets con diferentes números
5. **Verificar**: Revisa tu balance y tickets comprados
6. **Logout/Login**: Prueba el sistema de sesiones

### **Casos de Prueba**
- ✅ **Registro con email único**
- ✅ **Login con credenciales correctas**
- ✅ **Compra de tickets válidos**
- ✅ **Validación de números duplicados**
- ✅ **Verificación de balance insuficiente**
- ✅ **Actualización de estadísticas**

## 🔧 **Características Técnicas**

### **Base de Datos Demo**
- **Persistencia**: Los datos se mantienen durante la sesión del servidor
- **Relaciones**: Usuarios, tickets, transacciones y loterías conectados
- **Validaciones**: Verificaciones completas de integridad
- **Estadísticas**: Cálculos automáticos en tiempo real

### **APIs Funcionales**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Autenticación
- `POST /api/buy-ticket` - Compra de tickets
- `GET /api/lottery-status` - Estado de la lotería
- `GET /api/stats` - Estadísticas generales

## 🎯 **Objetivo de la Demo**

Esta demo funcional permite:
- **Registrarse** con cualquier email
- **Comprar tickets** con KOKI virtuales
- **Ver estadísticas** en tiempo real
- **Probar todas las funcionalidades** sin necesidad de blockchain real
- **Demostrar** el flujo completo de la aplicación

## 🚀 **Cómo Acceder a la Demo**

### **1. Abre tu navegador web**
- Chrome, Firefox, Safari, Edge, etc.

### **2. Ve a la dirección:**
```
http://localhost:3003
```
**Nota:** Si el puerto 3000 está ocupado, la aplicación se ejecutará en el puerto 3003.

¡La demo está lista para usar! 🚀✨
