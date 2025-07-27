# Guía de Debugging para Problemas de Sesión JWT

## Problema Identificado

El usuario reporta que se le cierra la sesión "muy seguido y sin motivo" en producción, aunque la caducidad del JWT está configurada para 7 días.

## Causas Posibles Identificadas

### 1. 🔧 Variables de Entorno en Producción

- **Problema**: JWT_EXPIRES_IN no configurado en producción
- **Solución**: Verificar que esté configurado correctamente
- **Comando de verificación**: `echo $JWT_EXPIRES_IN` en servidor de producción

### 2. 🔒 JWT_SECRET Inconsistente

- **Problema**: Si el JWT_SECRET cambia entre deploys, todos los tokens existentes se invalidan
- **Solución**: Usar un JWT_SECRET persistente
- **Verificación**: Confirmar que el JWT_SECRET no cambia entre deployments

### 3. 🕐 Diferencias de Zona Horaria

- **Problema**: Diferencias entre servidor y cliente
- **Herramientas**: Endpoint `/api/debug/token-info` para comparar timestamps

### 4. 🔄 Interceptors Agresivos

- **Problema**: El interceptor de axios puede estar interpretando errores 401 incorrectamente
- **Mejora implementada**: Logging detallado en el interceptor

## Herramientas de Debugging Implementadas

### 1. Frontend - Token Debug Service

```javascript
// En la consola del navegador:
TokenDebug.logTokenInfo(); // Ver información del token actual
TokenDebug.startTokenMonitor(); // Iniciar monitor automático
TokenDebug.isTokenExpired(token); // Verificar si está expirado
```

### 2. Backend - Endpoint de Debug

```bash
# Solo disponible en desarrollo
GET /api/debug/token-info
```

### 3. Logging Mejorado

- Interceptor de axios con logging detallado
- Backend con información de expiración mejorada
- Timestamps comparativos servidor/cliente

## Configuración Actual

### Backend (.env)

```env
JWT_SECRET=un-secreto-muy-seguro-para-desarrollo
JWT_EXPIRES_IN=604800  # 7 días en segundos
```

### Configuración JWT

- **Expiración**: 7 días (604800 segundos)
- **Issuer**: 'la-publica-api'
- **Audience**: 'la-publica-users'

## Pasos para Diagnosticar en Producción

### 1. Verificar Variables de Entorno

```bash
# En el servidor de producción
echo $JWT_SECRET
echo $JWT_EXPIRES_IN
echo $NODE_ENV
```

### 2. Verificar Logs del Servidor

```bash
# Buscar logs relacionados con JWT
grep -i "token" /path/to/logs/*.log
grep -i "expir" /path/to/logs/*.log
```

### 3. Monitorizar en el Cliente

```javascript
// En la consola del navegador (solo desarrollo)
TokenDebug.startTokenMonitor(1); // Verificar cada minuto

// Ver información actual
TokenDebug.logTokenInfo();
```

### 4. Verificar Endpoint de Debug

```bash
# Solo en desarrollo
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5050/api/debug/token-info
```

## Soluciones Recomendadas

### 1. Configuración de Producción

Asegurar que el archivo de variables de entorno de producción contenga:

```env
NODE_ENV=production
JWT_SECRET=tu-secreto-super-seguro-de-produccion
JWT_EXPIRES_IN=604800
```

### 2. Persistencia del JWT_SECRET

- Usar un JWT_SECRET fijo y seguro en producción
- No regenerar el secreto en cada deploy
- Considerar rotar el secreto solo cuando sea necesario

### 3. Implementar Refresh Tokens (Recomendación futura)

```typescript
// Ejemplo de implementación de refresh token
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
```

### 4. Monitorización Continua

- Implementar alertas para tokens expirados masivos
- Dashboard de sesiones activas
- Métricas de tiempo de sesión promedio

## Debugging en Tiempo Real

### Frontend

```javascript
// Verificar token antes de cada request crítico
const info = TokenDebug.getTokenInfo();
if (info.isExpired) {
  console.warn("Token expirado antes del request");
}
```

### Backend

```typescript
// En el middleware de autenticación
if (process.env.NODE_ENV === "development") {
  console.log("Token info:", {
    isExpired: decoded.exp < Math.floor(Date.now() / 1000),
    expiresAt: new Date(decoded.exp * 1000).toISOString(),
    timeLeft: decoded.exp - Math.floor(Date.now() / 1000),
  });
}
```

## Próximos Pasos

1. **Verificar configuración de producción** - Confirmar JWT_EXPIRES_IN
2. **Monitorizar con las nuevas herramientas** - Usar TokenDebug en producción
3. **Analizar logs de servidor** - Buscar patrones de expiración
4. **Considerar refresh tokens** - Para una experiencia de usuario mejorada

## Contacto para Soporte

Si el problema persiste después de estas verificaciones, proporcionar:

- Logs del interceptor de axios
- Información del TokenDebug.logTokenInfo()
- Timestamp de cuando ocurre el logout
- URL/acción que estaba realizando cuando se cerró la sesión
