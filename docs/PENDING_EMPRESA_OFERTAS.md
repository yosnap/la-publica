# Tareas Pendientes: Integración Empresas-Ofertas

## ✅ Completado (Backend)

### Modelo y Validaciones
- ✅ Campo `company` ahora es obligatorio en modelo Offer
- ✅ Validación Zod: empresa obligatoria al crear ofertas
- ✅ Validación: verificar que la empresa existe
- ✅ Validación: colaboradores solo pueden crear ofertas de SUS empresas
- ✅ Admins pueden crear ofertas para cualquier empresa
- ✅ Endpoints ya soportan filtros por empresa y categoría

### Endpoints Existentes
- ✅ `GET /api/companies/my/companies` - Obtener empresas del colaborador
- ✅ `GET /api/offers?company=<id>` - Filtrar ofertas por empresa
- ✅ `GET /api/offers?category=<id>` - Filtrar ofertas por categoría
- ✅ Populate automático de empresa en ofertas

---

## 🔄 Pendiente (Frontend)

### 1. OfferForm - Selector de Empresa **(CRÍTICO)**

#### Archivo: `/la-publica-frontend/src/pages/collaborator/OfferForm.tsx`

**Cambios necesarios:**

1. **Agregar import de companies API:**
```typescript
import { getMyCompanies, type Company } from "@/api/companies";
```

2. **Actualizar schema de validación** (línea 33):
```typescript
const offerSchema = z.object({
  title: z.string().min(3, "El títol ha de tenir almenys 3 caràcters").max(200, "El títol no pot excedir 200 caràcters"),
  description: z.string().min(10, "La descripció ha de tenir almenys 10 caràcters").max(5000, "La descripció no pot excedir 5000 caràcters"),
  company: z.string().min(1, "Has de seleccionar una empresa"), // ← AGREGAR ESTA LÍNEA
  originalPrice: z.number().min(0.01, "El preu original ha de ser major que 0"),
  // ... resto del schema
});
```

3. **Agregar estados para empresas** (después de línea 71):
```typescript
const [companies, setCompanies] = useState<Company[]>([]);
const [loadingCompanies, setLoadingCompanies] = useState(true);
const [noCompanies, setNoCompanies] = useState(false);
```

4. **Cargar empresas al montar componente** (agregar useEffect):
```typescript
useEffect(() => {
  loadUserCompanies();
}, []);

const loadUserCompanies = async () => {
  try {
    setLoadingCompanies(true);
    const response = await getMyCompanies();

    if (response.success && response.companies) {
      setCompanies(response.companies);
      setNoCompanies(response.companies.length === 0);

      // Si solo tiene una empresa, seleccionarla automáticamente
      if (response.companies.length === 1) {
        setValue('company', response.companies[0]._id);
      }
    }
  } catch (error) {
    console.error('Error carregant empreses:', error);
    toast.error('Error al carregar les empreses');
  } finally {
    setLoadingCompanies(false);
  }
};
```

5. **Actualizar defaultValues** (línea 83):
```typescript
defaultValues: {
  company: "", // ← AGREGAR
  included: [""],
  notIncluded: [],
  gallery: [],
  mainImage: "",
  videoUrl: ""
}
```

6. **Cargar empresa al editar** (en el useEffect que carga la oferta, línea 134):
```typescript
reset({
  title: offer.title,
  description: offer.description,
  company: offer.company?._id || offer.company, // ← AGREGAR
  originalPrice: offer.originalPrice,
  // ... resto
});
```

7. **Agregar selector de empresa en el formulario** (agregar ANTES de los campos de precio, alrededor línea 375):
```tsx
{/* Selector de Empresa */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Building className="h-5 w-5" />
      Empresa
    </CardTitle>
    <CardDescription>
      Selecciona l'empresa a la qual pertany aquesta oferta
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {noCompanies ? (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-yellow-900">
              No tens cap empresa creada
            </p>
            <p className="text-sm text-yellow-700">
              Per crear ofertes, primer has de crear una empresa. Les ofertes sempre estan associades a una empresa.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to="/colaborador/empreses/crear">
                <Plus className="h-4 w-4 mr-2" />
                Crear Empresa
              </Link>
            </Button>
          </div>
        </div>
      </div>
    ) : loadingCompanies ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ) : (
      <div>
        <Label htmlFor="company">
          Empresa <span className="text-red-500">*</span>
        </Label>
        <select
          id="company"
          {...register("company")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={companies.length === 1}
        >
          <option value="">Selecciona una empresa</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
        {errors.company && (
          <p className="text-sm text-red-500 mt-1">{errors.company.message}</p>
        )}
        {companies.length === 1 && (
          <p className="text-sm text-gray-500 mt-1">
            Selecció automàtica (només tens una empresa)
          </p>
        )}
      </div>
    )}
  </CardContent>
</Card>
```

8. **Agregar imports necesarios** (línea 13):
```typescript
import {
  Tag,
  DollarSign,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  FileText,
  Image,
  Video,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Building, // ← AGREGAR
  AlertTriangle // ← AGREGAR
} from "lucide-react";
```

9. **Deshabilitar botón submit si no hay empresas**:
```tsx
<Button
  type="submit"
  disabled={loading || noCompanies}
  className="w-full"
>
  {loading ? "Guardant..." : isEditing ? "Actualitzar Oferta" : "Crear Oferta"}
</Button>
```

---

### 2. PromotionalOfferDetail - Mostrar Empresa

#### Archivo: `/la-publica-frontend/src/pages/PromotionalOfferDetail.tsx`

**Cambios necesarios:**

1. **Agregar sección de empresa** (después de línea 259, CardContent con stats):
```tsx
{/* Información de la Empresa */}
{offer.company && (
  <Card>
    <CardHeader>
      <h2 className="text-xl font-semibold">Sobre l'empresa</h2>
    </CardHeader>
    <CardContent>
      <Link
        to={`/empreses/${offer.company._id}`}
        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-all"
      >
        {offer.company.logo && (
          <img
            src={getImageUrl(offer.company.logo)}
            alt={offer.company.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {offer.company.name}
            {offer.company.verified?.status === 'verified' && (
              <Badge className="bg-blue-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificada
              </Badge>
            )}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {offer.company.description}
          </p>
          <Button variant="link" className="p-0 h-auto mt-2 text-primary">
            Veure perfil de l'empresa →
          </Button>
        </div>
      </Link>
    </CardContent>
  </Card>
)}
```

2. **Agregar "Otras ofertas de esta empresa"** (después de la sección de empresa):
```tsx
{/* Otras ofertas de esta empresa */}
{offer.company && relatedOffersByCompany.length > 0 && (
  <Card>
    <CardHeader>
      <h2 className="text-xl font-semibold">Més ofertes de {offer.company.name}</h2>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {relatedOffersByCompany.map((relatedOffer) => (
          <Link
            key={relatedOffer._id}
            to={`/ofertes/${relatedOffer.slug}`}
            className="flex gap-4 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-all"
          >
            <img
              src={getImageUrl(relatedOffer.mainImage)}
              alt={relatedOffer.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold line-clamp-1">{relatedOffer.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {relatedOffer.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-red-500 text-white">
                  -{relatedOffer.discountPercentage}%
                </Badge>
                <span className="font-semibold text-primary">
                  {relatedOffer.discountedPrice.toFixed(2)}€
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {relatedOffer.originalPrice.toFixed(2)}€
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

3. **Agregar "Ofertas similares" (por categoría)**:
```tsx
{/* Ofertas similares */}
{offer.category && relatedOffersByCategory.length > 0 && (
  <Card>
    <CardHeader>
      <h2 className="text-xl font-semibold">Ofertes similars</h2>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-3">
        {relatedOffersByCategory.map((relatedOffer) => (
          <Link
            key={relatedOffer._id}
            to={`/ofertes/${relatedOffer.slug}`}
            className="flex gap-4 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-all"
          >
            <img
              src={getImageUrl(relatedOffer.mainImage)}
              alt={relatedOffer.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold line-clamp-1">{relatedOffer.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {relatedOffer.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-red-500 text-white">
                  -{relatedOffer.discountPercentage}%
                </Badge>
                <span className="font-semibold text-primary">
                  {relatedOffer.discountedPrice.toFixed(2)}€
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

4. **Agregar estados y carga de ofertas relacionadas** (después de línea 46):
```typescript
const [relatedOffersByCompany, setRelatedOffersByCompany] = useState<Offer[]>([]);
const [relatedOffersByCategory, setRelatedOffersByCategory] = useState<Offer[]>([]);
```

5. **Cargar ofertas relacionadas** (en el useEffect o crear nuevo):
```typescript
useEffect(() => {
  if (offer) {
    loadRelatedOffers();
  }
}, [offer]);

const loadRelatedOffers = async () => {
  try {
    // Ofertas de la misma empresa
    if (offer.company?._id) {
      const companyResponse = await getAllOffers({
        company: offer.company._id,
        active: true,
        limit: 4
      });

      if (companyResponse.success) {
        // Excluir la oferta actual
        const filtered = companyResponse.offers.filter((o: Offer) => o._id !== offer._id);
        setRelatedOffersByCompany(filtered.slice(0, 3));
      }
    }

    // Ofertas de la misma categoría
    if (offer.category?._id) {
      const categoryResponse = await getAllOffers({
        category: offer.category._id,
        active: true,
        limit: 7
      });

      if (categoryResponse.success) {
        // Excluir la oferta actual y las de la misma empresa
        const filtered = categoryResponse.offers.filter((o: Offer) =>
          o._id !== offer._id && o.company?._id !== offer.company?._id
        );
        setRelatedOffersByCategory(filtered.slice(0, 6));
      }
    }
  } catch (error) {
    console.error('Error carregant ofertes relacionades:', error);
  }
};
```

---

### 3. AdminOffers - Selector de Todas las Empresas

#### Archivo: `/la-publica-frontend/src/pages/admin/AdminOffers.tsx`

**Similar a OfferForm pero:**
- Cargar TODAS las empresas (no solo las del usuario)
- Usar `getCompanies()` en lugar de `getMyCompanies()`
- No mostrar restricción de "no tienes empresas"

---

### 4. CompanyForm - Asignar Colaborador (Admin)

#### Archivo: Buscar `/la-publica-frontend/src/pages/admin/*Company*.tsx` o similar

**Agregar:**
1. Selector de colaboradores (solo para admins)
2. Cargar lista de usuarios con rol `colaborador`
3. Campo `owner` en el formulario

---

### 5. AdvisoryForm - Selector de Empresa (Admin)

#### Similar a OfferForm pero para asesorías

---

## 📝 Resumen de Prioridades

### Alta Prioridad (Bloqueantes)
1. ✅ OfferForm - Selector de empresa **(SIN ESTO NO SE PUEDEN CREAR OFERTAS)**
2. ✅ PromotionalOfferDetail - Mostrar empresa y ofertas relacionadas

### Media Prioridad
3. ⏸️ AdminOffers - Selector global de empresas
4. ⏸️ CompanyForm - Asignar colaborador (admin)

### Baja Prioridad
5. ⏸️ AdvisoryForm - Selector de empresa

---

## 🧪 Testing Después de Implementar

### Flujo Colaborador:
1. ✅ Crear empresa
2. ✅ Crear oferta (debe aparecer selector con SU empresa)
3. ✅ Ver detalle: verificar que muestra info de empresa
4. ✅ Ver detalle: verificar ofertas relacionadas

### Flujo Admin:
1. ✅ Crear empresa y asignarla a colaborador
2. ✅ Crear oferta para CUALQUIER empresa
3. ✅ Verificar que colaborador ve la oferta en su panel

---

## 📦 Commits Realizados

1. ✅ `7ca280e` - feat: implementar sistema completo de ofertas promocionales
2. ✅ `5749046` - feat: fer camp 'company' obligatori en ofertes

## 🔜 Próximo Commit

Título sugerido:
```
feat: integrar selector d'empresa en formulari d'ofertes

- Afegir camp 'company' obligatori al schema de validació
- Carregar empreses del col·laborador amb getMyCompanies()
- Selector automàtic si només té una empresa
- Missatge d'error si no té cap empresa creada
- Deshabilitar creació si no té empreses
- Actualitzar detall d'oferta amb informació d'empresa
- Afegir ofertes relacionades per empresa
- Afegir ofertes similars per categoria
```
