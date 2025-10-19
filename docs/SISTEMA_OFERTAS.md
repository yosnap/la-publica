# Sistema de Ofertas Promocionales

**Fecha:** 2025-10-19
**Versión:** 1.0.0
**Estado:** Backend completado ⚠️ (ver nota sobre integración con Admin)

---

## 📋 Resumen

Sistema completo de gestión de ofertas promocionales (anuncios con descuentos) para colaboradores de La Pública. Incluye gestión de stock, cupones de descuento, fechas de vigencia y segmentación por grupos.

---

## 🎯 Características Principales

### Gestión de Ofertas
- ✅ CRUD completo de ofertas
- ✅ Control de stock y disponibilidad
- ✅ Sistema de precios (original, con descuento, porcentaje)
- ✅ Fechas de inicio y fin de vigencia
- ✅ Medios (imagen principal, galería, video promocional)
- ✅ Segmentación por grupos específicos
- ✅ Categorización
- ✅ Estado activo/pausado

### Sistema de Cupones
- ✅ Creación de cupones de descuento
- ✅ Código único por cupón
- ✅ Descuento porcentual adicional
- ✅ Límite de usos configurables
- ✅ Fechas de validez del cupón
- ✅ Validación en tiempo real
- ✅ Desactivación manual de cupones

### Permisos y Roles
- **Crear ofertas:** Colaboradores, Admin, Superadmin
- **Ver ofertas:** Público
- **Aplicar cupones:** Usuarios autenticados
- **Editar/Eliminar:** Solo creador o admin

---

## 🗂️ Modelo de Datos

### Oferta (Offer)

```typescript
{
  // Información básica
  title: string,                    // Título de la oferta
  slug: string,                     // URL amigable (auto-generado)
  description: string,              // Descripción detallada

  // Precios
  originalPrice: number,            // Precio original
  discountedPrice: number,          // Precio con descuento
  discountPercentage: number,       // % de descuento (auto-calculado)

  // Vigencia
  startDate: Date,                  // Fecha de inicio
  endDate: Date,                    // Fecha de fin

  // Stock
  stock: number,                    // Stock inicial
  remainingStock: number,           // Stock disponible

  // Detalles
  included: string[],               // Qué incluye
  notIncluded: string[],            // Qué NO incluye
  usageInstructions: string,        // Instrucciones de uso

  // Medios
  mainImage: string,                // Imagen principal (URL)
  gallery: string[],                // Galería de imágenes
  videoUrl: string,                 // Video promocional (opcional)

  // Relaciones
  createdBy: ObjectId,              // Creador (User)
  company: ObjectId,                // Empresa (opcional)
  targetGroups: ObjectId[],         // Grupos específicos
  category: ObjectId,               // Categoría

  // Cupones
  coupons: ICoupon[],               // Array de cupones

  // Estado
  isActive: boolean,                // Activa/Inactiva
  isPaused: boolean,                // Pausada
  views: number,                    // Número de visualizaciones
  purchases: number,                // Número de compras

  // Virtuals
  isCurrentlyActive: boolean,       // ¿Está activa ahora?
  isSoldOut: boolean,               // ¿Agotada?
  isExpired: boolean                // ¿Expirada?
}
```

### Cupón (Coupon)

```typescript
{
  code: string,                     // Código del cupón (uppercase)
  discountPercentage: number,       // % de descuento adicional
  maxUses: number,                  // Máximo de usos (opcional)
  usedCount: number,                // Usos realizados
  validFrom: Date,                  // Válido desde
  validUntil: Date,                 // Válido hasta
  isActive: boolean                 // Activo/Inactivo
}
```

---

## 🔌 API Endpoints

### Rutas Públicas

#### Listar ofertas
```
GET /api/offers
Query params:
  - page: número de página (default: 1)
  - limit: ofertas por página (default: 12)
  - category: filtrar por categoría
  - createdBy: filtrar por creador
  - company: filtrar por empresa
  - active: true/false (solo ofertas activas)
  - search: búsqueda de texto

Response:
{
  success: true,
  offers: [...],
  pagination: {
    page: 1,
    limit: 12,
    total: 50,
    pages: 5
  }
}
```

#### Obtener oferta por slug
```
GET /api/offers/:slug

Response:
{
  success: true,
  offer: {
    _id: "...",
    title: "Oferta especial...",
    slug: "oferta-especial",
    ...
    createdBy: { firstName, lastName, email, avatar },
    company: { name, logo, description },
    category: { name },
    targetGroups: [{ name, description }]
  }
}
```

### Rutas Protegidas (Autenticado)

#### Validar cupón
```
POST /api/offers/:id/coupons/validate
Body: { code: "DESCUENTO2024" }

Response:
{
  success: true,
  message: "Cupó vàlid",
  coupon: {
    code: "DESCUENTO2024",
    discountPercentage: 10
  },
  pricing: {
    originalPrice: 100,
    baseDiscountedPrice: 80,     // Precio con descuento base
    couponDiscount: 8,            // Descuento adicional del cupón
    finalPrice: 72,               // Precio final
    totalDiscount: 28,            // Descuento total
    totalDiscountPercentage: 28   // % total
  }
}
```

### Rutas para Colaboradores/Admin

#### Crear oferta
```
POST /api/offers
Headers: Authorization: Bearer <token>
Roles: colaborador, admin, superadmin

Body:
{
  title: "Oferta especial de verano",
  description: "Descripción completa...",
  originalPrice: 100,
  discountedPrice: 70,
  startDate: "2025-06-01",
  endDate: "2025-08-31",
  stock: 50,
  included: ["Servicio 1", "Servicio 2"],
  notIncluded: ["Servicio 3"],
  usageInstructions: "Instrucciones...",
  mainImage: "https://...",
  gallery: ["https://...", "https://..."],
  videoUrl: "https://youtube.com/...",
  company: "company_id",
  targetGroups: ["group_id_1", "group_id_2"],
  category: "category_id"
}

Response:
{
  success: true,
  message: "Oferta creada correctament",
  offer: {...}
}
```

#### Actualizar oferta
```
PUT /api/offers/:id
Headers: Authorization: Bearer <token>
Roles: colaborador (owner), admin, superadmin

Body: (campos parciales permitidos)

Response:
{
  success: true,
  message: "Oferta actualitzada correctament",
  offer: {...}
}
```

#### Eliminar oferta
```
DELETE /api/offers/:id
Headers: Authorization: Bearer <token>
Roles: colaborador (owner), admin, superadmin

Response:
{
  success: true,
  message: "Oferta eliminada correctament"
}
```

#### Pausar/Reanudar oferta
```
PATCH /api/offers/:id/toggle-pause
Headers: Authorization: Bearer <token>
Roles: colaborador (owner), admin, superadmin

Response:
{
  success: true,
  message: "Oferta pausada" | "Oferta reactivada",
  offer: {
    id: "...",
    isPaused: true|false
  }
}
```

#### Mis ofertas
```
GET /api/offers/my-offers
Headers: Authorization: Bearer <token>
Roles: colaborador, admin, superadmin
Query params:
  - page, limit (paginación)
  - status: active|paused|inactive

Response:
{
  success: true,
  offers: [...],
  pagination: {...}
}
```

#### Crear cupón
```
POST /api/offers/:id/coupons
Headers: Authorization: Bearer <token>
Roles: colaborador (owner), admin, superadmin

Body:
{
  code: "SUMMER2024",
  discountPercentage: 15,
  maxUses: 100,
  validFrom: "2025-06-01",
  validUntil: "2025-08-31"
}

Response:
{
  success: true,
  message: "Cupó creat correctament",
  coupon: {...}
}
```

#### Desactivar cupón
```
PATCH /api/offers/:id/coupons/:code/deactivate
Headers: Authorization: Bearer <token>
Roles: colaborador (owner), admin, superadmin

Response:
{
  success: true,
  message: "Cupó desactivat correctament"
}
```

---

## 🔒 Validaciones

### Oferta
- ✅ Título: 3-200 caracteres
- ✅ Descripción: 10-5000 caracteres
- ✅ Precio original ≥ 0
- ✅ Precio con descuento ≥ 0
- ✅ Precio con descuento < Precio original
- ✅ Stock ≥ 1
- ✅ Fecha fin > Fecha inicio
- ✅ Imagen principal requerida (URL válida)
- ✅ Galería: array de URLs válidas
- ✅ Video: URL válida (opcional)

### Cupón
- ✅ Código: 3-20 caracteres (auto-uppercase)
- ✅ Descuento: 0-100%
- ✅ Máximo usos ≥ 1 (opcional)
- ✅ Fecha válido hasta > Fecha válido desde

---

## 🧮 Lógica de Negocio

### Slug Auto-generado
El slug se genera automáticamente del título:
- Normalización NFD (elimina acentos)
- Lowercase
- Caracteres especiales removidos
- Espacios → guiones
- Si existe, agrega contador: `oferta-especial-1`, `oferta-especial-2`

### Cálculo de Descuento
```typescript
discountPercentage = Math.round(
  ((originalPrice - discountedPrice) / originalPrice) * 100
)
```

### Estado "Actualmente Activa"
Una oferta está actualmente activa si cumple TODO lo siguiente:
- `isActive === true`
- `isPaused === false`
- `startDate <= now`
- `endDate >= now`
- `remainingStock > 0`

### Aplicación de Cupón
```typescript
additionalDiscount = (discountedPrice * couponDiscountPercentage) / 100
finalPrice = discountedPrice - additionalDiscount
totalDiscount = originalPrice - finalPrice
totalDiscountPercentage = Math.round((totalDiscount / originalPrice) * 100)
```

---

## 📁 Archivos Creados

### Backend
- `src/offer.model.ts` (320 líneas) - Modelo con validaciones
- `src/offer.controller.ts` (550 líneas) - Controladores CRUD + cupones
- `src/offer.routes.ts` (70 líneas) - Definición de rutas
- `src/server.ts` - Importación y registro de rutas

---

## 🚀 Próximos Pasos (Pendientes)

### Backend
- [ ] Tests automatizados con Jest
- [ ] Script de seed para ofertas de prueba
- [ ] Endpoint para estadísticas de ofertas
- [ ] Endpoint para historial de ventas
- [ ] Notificaciones cuando se agota el stock

### Frontend
- [ ] Página pública de listado de ofertas
- [ ] Página de detalle de oferta
- [ ] Formulario de creación/edición (colaboradores)
- [ ] Panel "Mis Ofertas" (colaboradores)
- [ ] Gestión de cupones (modal/sección)
- [ ] Componente de validación de cupón
- [ ] Filtros avanzados
- [ ] Integración con sistema de pago (futuro)

---

## 💡 Casos de Uso

### Colaborador crea oferta
1. Colaborador accede a "Mis Ofertas"
2. Click en "Nueva Oferta"
3. Completa formulario con todos los datos
4. Sube imagen principal y galería
5. Define precios y stock
6. Selecciona fechas de vigencia
7. Opcionalmente añade grupos específicos
8. Guarda → Oferta creada con `isActive: true`

### Colaborador crea cupón
1. Desde "Mis Ofertas" edita una oferta
2. Click en "Gestionar Cupones"
3. Click "Nuevo Cupón"
4. Define código (ej: VERANO2024)
5. Define descuento adicional (15%)
6. Define límite de usos (100)
7. Define fechas de validez
8. Guarda → Cupón creado y disponible

### Usuario aplica cupón
1. Usuario ve oferta que le interesa
2. Ingresa código de cupón en el campo
3. Click "Aplicar cupón"
4. Sistema valida: activo, fechas, usos
5. Si válido → Muestra precio final recalculado
6. Usuario procede a "comprar" (futuro: integración pago)

### Oferta se agota
- `remainingStock` llega a 0
- `isSoldOut` = true
- Oferta ya no aparece como disponible
- No se pueden aplicar cupones
- Colaborador recibe notificación (futuro)

---

## 🎨 Diseño de UI (Propuesta)

### Listado de Ofertas (Público)
```
┌────────────────────────────────────┐
│ [Imagen]                           │
│ Título de la oferta                │
│ -30% ← Badge descuento             │
│ 70€ [100€ tachado]                 │
│ Stock: 25/50 disponibles           │
│ Válido hasta: 31/08/2025           │
│ [Ver Detalles]                     │
└────────────────────────────────────┘
```

### Detalle de Oferta
```
┌──────────────────────────────────────────┐
│ [Galería de imágenes] [Video]            │
│                                          │
│ Título de la oferta                      │
│ Descripción completa...                  │
│                                          │
│ Precio: 70€ [100€ tachado] (-30%)        │
│                                          │
│ ✅ Qué incluye:                          │
│    • Servicio 1                          │
│    • Servicio 2                          │
│                                          │
│ ❌ Qué NO incluye:                       │
│    • Servicio 3                          │
│                                          │
│ 📝 Instrucciones de uso:                 │
│ Texto con instrucciones...               │
│                                          │
│ 🎟️ ¿Tienes un cupón?                    │
│ [CÓDIGO___] [Aplicar]                    │
│                                          │
│ Stock: 25 disponibles                    │
│ Válido: 01/06/2025 - 31/08/2025          │
│                                          │
│ [Comprar Ahora]                          │
└──────────────────────────────────────────┘
```

### Panel "Mis Ofertas" (Colaborador)
```
┌──────────────────────────────────────────┐
│ Mis Ofertas                   [+ Nueva]  │
├──────────────────────────────────────────┤
│ 🟢 Oferta especial de verano             │
│    Stock: 25/50 | Vistas: 234            │
│    [Pausar] [Editar] [Cupones] [Stats]   │
├──────────────────────────────────────────┤
│ ⏸️  Oferta de invierno (PAUSADA)         │
│    Stock: 10/30 | Vistas: 120            │
│    [Reanudar] [Editar] [Cupones]         │
└──────────────────────────────────────────┘
```

---

## ⚠️ Nota Importante: Integración con Admin

**Estado actual:** La integración de ofertas en el panel de administración (`/api/admin-data/promotional-offers`) está **temporalmente deshabilitada** debido a problemas de referencias circulares en el modelo.

**Detalles:**
- ✅ **Todos los endpoints de ofertas funcionan correctamente** (`/api/offers/*`)
- ❌ **Gestión desde Admin Data está pendiente** (no bloquea funcionalidad principal)
- 📋 **Documento de seguimiento:** [docs/PENDIENTE_OFERTAS_ADMIN.md](PENDIENTE_OFERTAS_ADMIN.md)

**Funcionalidades disponibles:**
- Crear, editar, eliminar ofertas ✅
- Listar ofertas (público y privado) ✅
- Sistema de cupones completo ✅
- Control de stock ✅
- Todas las operaciones de colaboradores ✅

**Funcionalidades pendientes:**
- Listar ofertas desde panel de administración ⏳
- Operaciones bulk en ofertas desde admin ⏳
- Asignación de autor/categoría desde admin ⏳

**Solución propuesta:**
Implementar lazy loading del modelo Offer en `adminData.controller.ts` para evitar referencias circulares durante la inicialización de Mongoose.

---

**Última actualización:** 2025-10-19
