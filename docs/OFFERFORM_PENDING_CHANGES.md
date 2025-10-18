# Cambios Pendientes para OfferForm.tsx

## Estado Actual
✅ Imports agregados (Building, AlertTriangle, getMyCompanies)
✅ Schema actualizado con campo 'company' obligatorio
✅ Estados agregados (companies, loadingCompanies, noCompanies)
✅ defaultValues actualizado con campo 'company'

## Cambios Pendientes

### 1. Agregar función loadUserCompanies y useEffect

**Ubicación**: Después de los useFieldArray (alrededor línea 115)

```typescript
// Cargar empresas del colaborador
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

### 2. Actualizar reset() en useEffect de edición

**Buscar**: El useEffect que carga la oferta para editar (tiene `reset({`)
**Agregar línea**: `company: offer.company?._id || offer.company,`

```typescript
reset({
  title: offer.title,
  description: offer.description,
  company: offer.company?._id || offer.company, // ← AGREGAR ESTA LÍNEA
  originalPrice: offer.originalPrice,
  discountedPrice: offer.discountedPrice,
  // ... resto de campos
});
```

### 3. Agregar Card de Selector de Empresa en el Formulario

**Ubicación**: ANTES del Card de "Preus i Descompte" (buscar el Card con título que contiene "originalPrice")

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

### 4. Deshabilitar botón submit si no hay empresas

**Buscar**: El Button de type="submit" al final del formulario
**Modificar**: Agregar `disabled={loading || noCompanies}`

```tsx
<Button
  type="submit"
  disabled={loading || noCompanies}  // ← MODIFICAR ESTA LÍNEA
  className="w-full"
>
  {loading ? "Guardant..." : isEditing ? "Actualitzar Oferta" : "Crear Oferta"}
</Button>
```

## Verificación

Después de aplicar todos los cambios, verificar:
1. ✅ El formulario carga las empresas del colaborador al iniciar
2. ✅ Muestra mensaje de error si no tiene empresas
3. ✅ Selecciona automáticamente si solo tiene una empresa
4. ✅ El campo empresa es requerido (muestra error si no se selecciona)
5. ✅ El botón de submit está deshabilitado si no tiene empresas
6. ✅ En modo edición, carga la empresa correcta
7. ✅ El formulario envía el campo 'company' al backend

## Testing Manual

1. **Crear oferta sin empresas**:
   - Login como colaborador nuevo
   - Ir a /colaborador/ofertes/crear
   - Verificar que muestra mensaje "No tens cap empresa creada"
   - Verificar que botón submit está deshabilitado

2. **Crear empresa y luego oferta**:
   - Crear una empresa
   - Ir a /colaborador/ofertes/crear
   - Verificar que la empresa aparece seleccionada automáticamente
   - Completar formulario y crear oferta
   - Verificar que se crea correctamente

3. **Editar oferta existente**:
   - Editar una oferta
   - Verificar que muestra la empresa correcta seleccionada
   - Guardar cambios
   - Verificar que funciona correctamente
