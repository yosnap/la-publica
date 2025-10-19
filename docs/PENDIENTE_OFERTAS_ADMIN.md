# Integración Pendiente: Ofertas Promocionales en Admin Data

## Problema Detectado

Al intentar integrar las ofertas promocionales en el panel de administración (`adminData.controller.ts`), se detectó un **problema de referencias circulares** que causa un error de "JavaScript heap out of memory" al cargar el backend.

### Causa del Problema

El problema ocurre específicamente cuando `adminData.controller.ts` importa el modelo `Offer`:

```typescript
import Offer from './offer.model';
```

Esto genera una **referencia circular** durante la inicialización de los modelos de Mongoose, específicamente en el `pre('save')` hook del modelo `Offer` que usa `mongoose.models.Offer` para verificar slugs únicos.

### Archivos Afectados

1. **src/offer.model.ts** - Modelo de ofertas con pre-hooks
2. **src/adminData.controller.ts** - Controlador del panel de administración
3. **src/category.model.ts** - También tenía referencias circulares (YA CORREGIDO)
4. **src/forumPost.model.ts** - También tenía referencias circulares (YA CORREGIDO)
5. **src/groupPost.model.ts** - También tenía referencias circulares (YA CORREGIDO)
6. **src/forum.model.ts** - También tenía referencias circulares (YA CORREGIDO)

### Correcciones Aplicadas

Se corrigieron las referencias circulares en varios modelos cambiando de:
```typescript
const Model = mongoose.model('ModelName');
```

A:
```typescript
const Model = this.constructor as mongoose.Model<IModelName>;
// o
const Model = mongoose.models.ModelName || mongoose.model('ModelName');
```

**Modelos ya corregidos:**
- ✅ category.model.ts
- ✅ forumPost.model.ts
- ✅ groupPost.model.ts
- ✅ forum.model.ts
- ✅ offer.model.ts (parcialmente)

### Estado Actual

**TEMPORALMENTE DESHABILITADO** en `adminData.controller.ts`:

```typescript
// Promotional Offers Management
export const getPromotionalOffers = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    // Temporalmente deshabilitado - necesita fix en el modelo Offer
    return res.status(503).json({
      success: false,
      message: 'Funcionalitat temporalment no disponible'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir ofertes promocionals',
      error: error.message
    });
  }
};
```

## Solución Propuesta

### Opción 1: Lazy Loading (Recomendada)

Usar importación dinámica del modelo `Offer` solo cuando se necesite:

```typescript
// En adminData.controller.ts
const getOfferModel = async () => {
  if (mongoose.models.Offer) {
    return mongoose.models.Offer;
  }
  const { default: Offer } = await import('./offer.model');
  return Offer;
};

// Uso:
export const getPromotionalOffers = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (!checkAdminPermission(userRole, res)) return;

    const Offer = await getOfferModel();

    const result = await getDataWithPagination(Offer, {
      ...req.query,
      populate: [
        { path: 'company', select: 'name' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'category', select: 'name' }
      ]
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtenir ofertes promocionals',
      error: error.message
    });
  }
};
```

### Opción 2: Controlador Separado

Crear un controlador específico `offerAdmin.controller.ts` que maneje las operaciones administrativas de ofertas, separado de `adminData.controller.ts`.

### Opción 3: Usar mongoose.models Directamente

En lugar de importar el modelo, usar directamente `mongoose.models.Offer` en todos los casos:

```typescript
// En los métodos que necesiten Offer:
const Offer = mongoose.models.Offer;
if (!Offer) {
  throw new Error('Offer model not loaded');
}
```

## Funcionalidades Afectadas

Las siguientes funcionalidades del panel de administración **NO ESTÁN DISPONIBLES** hasta resolver este problema:

1. ❌ `GET /api/admin-data/promotional-offers` - Listar ofertas promocionales
2. ❌ Operaciones bulk con ofertas (`bulkUpdateItems`, `bulkDeleteItems`)
3. ❌ Asignación de autor a ofertas (`assignAuthor`)
4. ❌ Asignación de categoría a ofertas (`assignCategory`)

## Funcionalidades que SÍ Funcionan

Todas las operaciones de ofertas desde sus propios endpoints funcionan correctamente:

- ✅ `POST /api/offers` - Crear oferta
- ✅ `GET /api/offers` - Listar ofertas
- ✅ `GET /api/offers/:slug` - Obtener oferta por slug
- ✅ `GET /api/offers/id/:id` - Obtener oferta por ID
- ✅ `PUT /api/offers/:id` - Actualizar oferta
- ✅ `DELETE /api/offers/:id` - Eliminar oferta
- ✅ `PATCH /api/offers/:id/toggle-pause` - Pausar/reanudar oferta
- ✅ `POST /api/offers/:id/coupons` - Crear cupón
- ✅ `POST /api/offers/:id/coupons/validate` - Validar cupón
- ✅ `PATCH /api/offers/:id/coupons/:code/deactivate` - Desactivar cupón
- ✅ `GET /api/offers/my-offers` - Mis ofertas (colaborador)

## Pasos para Implementar la Solución

1. **Decidir** qué opción implementar (se recomienda Opción 1: Lazy Loading)
2. **Implementar** la solución elegida en `adminData.controller.ts`
3. **Actualizar** todos los métodos que usen el modelo Offer:
   - `getPromotionalOffers`
   - `bulkUpdateItems` (case 'Offer')
   - `bulkDeleteItems` (case 'Offer')
   - `assignAuthor` (case 'Offer')
   - `assignCategory` (case 'Offer')
4. **Probar** que el backend arranca sin errores
5. **Probar** cada endpoint afectado
6. **Actualizar** el frontend para habilitar la sección de ofertas en admin

## Testing

```bash
# Test de carga de modelos
cd la-publica-backend
npx ts-node test-models.ts

# Test de carga de adminData
npx ts-node test-admin-data.ts

# Arrancar backend
npm run dev
```

## Referencias

- Modelo Offer: `src/offer.model.ts`
- Controlador Admin: `src/adminData.controller.ts`
- Rutas Offer: `src/offer.routes.ts`
- Controlador Offer: `src/offer.controller.ts`

---

**Fecha**: 2025-10-19
**Estado**: Pendiente de implementación
**Prioridad**: Media (funcionalidad administrativa, no afecta usuarios finales)
