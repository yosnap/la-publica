# Regles de Desenvolupament - La Pública

Aquest document conté les regles i estàndards de desenvolupament que tots els desenvolupadors han de seguir en aquest projecte.

## 📐 Regles de Disseny i UI

### ❌ PROHIBIT: Bordes a l'Esquerra

**Regla**: No utilitzar mai `border-left` en components, alertes o qualsevol element visual.

**Motiu**: Els bordes a l'esquerra creen un aspecte visual inconsistent i poc professional.

**Exemples INCORRECTES**:
```css
/* ❌ MAL - No utilitzar border-left */
.alert {
  border-left: 4px solid #ffc107;
}

.card {
  border-left: 2px solid #4F8FF7;
}
```

**Alternatives CORRECTES**:
```css
/* ✅ BÉ - Utilitzar border complet o border-radius */
.alert {
  border: 1px solid #ffc107;
  border-radius: 8px;
  background-color: #fff3cd;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ✅ BÉ - Utilitzar background amb gradient si es vol emfasitzar */
.alert-warning {
  background: linear-gradient(90deg, #fff3cd 0%, #fffbf0 100%);
  border-radius: 8px;
  padding: 15px;
}
```

### Border Radius Estàndard

**Regla**: Utilitzar sempre `border-radius: 8px` per defecte.

```css
/* ✅ Estàndard */
border-radius: 8px;

/* ✅ Permès per elements petits */
border-radius: 4px; /* Per badges, tags petits */

/* ✅ Permès per botons grans */
border-radius: 12px; /* Per botons destacats */
```

### Colors d'Alerta

Utilitzar només colors de fons per distingir els tipus d'alerta:

```css
/* ✅ Info - Blau */
background-color: #f0f9ff;
color: #0369a1;

/* ✅ Success - Verd */
background-color: #f0fdf4;
color: #166534;

/* ✅ Warning - Groc */
background-color: #fffbeb;
color: #92400e;

/* ✅ Error - Vermell */
background-color: #fef2f2;
color: #991b1b;
```

## 📧 Regles per Plantilles d'Email

### Header Obligatori

**Regla**: Totes les plantilles d'email han de tenir el header amb el logo de La Pública.

```html
<!-- ✅ Header estàndard -->
<div style="background-color: #4F8FF7; padding: 30px 20px; text-align: center; margin-bottom: 30px;">
  <img src="https://lapublica.cat/logo-white.png"
       alt="La Pública"
       style="max-width: 200px; height: auto;"
       onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5MYSBQw7pibGljYTwvdGV4dD48L3N2Zz4=';">
</div>
```

### Estructura d'Email

```html
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff;">
  <!-- Header amb logo -->
  <div style="background-color: #4F8FF7; padding: 30px 20px; text-align: center; margin-bottom: 30px;">
    <!-- Logo aquí -->
  </div>

  <!-- Contingut -->
  <div style="padding: 0 20px 40px 20px;">
    <!-- Contingut de l'email -->
  </div>
</div>
```

### No utilitzar border-left en emails

```html
<!-- ❌ MAL -->
<p style="border-left: 4px solid #ffc107; padding-left: 15px;">
  Missatge important
</p>

<!-- ✅ BÉ -->
<p style="background-color: #fff3cd; padding: 15px; border-radius: 8px;">
  Missatge important
</p>
```

## 🎨 Paleta de Colors

### Colors Primaris

```css
--primary: #4F8FF7;           /* Blau principal */
--primary-hover: #3d7ce3;     /* Blau hover */
--primary-foreground: #ffffff; /* Text sobre primari */
```

### Colors Secundaris

```css
--background: #ffffff;         /* Fons principal */
--foreground: #0f172a;        /* Text principal */
--muted: #f1f5f9;             /* Fons suau */
--muted-foreground: #64748b;  /* Text secundari */
```

### Colors d'Estat

```css
--success: #22c55e;           /* Verd èxit */
--warning: #f59e0b;           /* Groc advertència */
--error: #ef4444;             /* Vermell error */
--info: #3b82f6;              /* Blau informació */
```

## 📝 Regles de Codi

### Nomenclatura de Components

```typescript
// ✅ BÉ - PascalCase per components
export default function EmailTemplate() {}
export function UserCard() {}

// ❌ MAL
export default function emailTemplate() {}
export function usercard() {}
```

### Nomenclatura de Fitxers

```
// ✅ BÉ
EmailTemplate.tsx
UserCard.tsx
email-service.ts
user.model.ts

// ❌ MAL
emailTemplate.tsx
Usercard.tsx
EmailService.ts
```

### Límit de Línies

**Regla**: Els fitxers no poden tenir més de 1000 línies, excepte en casos excepcionals documentats.

**Solució**: Fragmentar en components o mòduls més petits.

```typescript
// ❌ MAL - Fitxer de 1500 línies

// ✅ BÉ - Dividir en múltiples fitxers
// components/UserProfile.tsx (200 línies)
// components/UserSettings.tsx (150 línies)
// components/UserActivity.tsx (180 línies)
```

## 🔒 Regles de Seguretat

### Validació d'Inputs

**Regla**: Tots els inputs d'usuari han de ser validats al backend.

```typescript
// ✅ BÉ
const data = validate(registerUserSchema, req.body);

// ❌ MAL - Confiar en validació del frontend només
const { email, password } = req.body;
```

### Tokens i Secrets

**Regla**: Mai hardcodejar secrets o tokens.

```typescript
// ❌ MAL
const apiKey = "re_89j2gzax_BUFMaCZmQzF4pe8bbLVRpeaJ";

// ✅ BÉ
const apiKey = process.env.RESEND_API_KEY;
```

## 📦 Regles de Commits

### Format de Missatges

```bash
# ✅ BÉ
feat: afegir verificació d'email
fix: corregir error en login
docs: actualitzar README
style: eliminar border-left de components

# ❌ MAL
update stuff
fix
cambios
```

### Tipus de Commits

- `feat`: Nova funcionalitat
- `fix`: Correcció d'error
- `docs`: Documentació
- `style`: Canvis d'estil (no afecten funcionalitat)
- `refactor`: Refactorització de codi
- `test`: Afegir o modificar tests
- `chore`: Tasques de manteniment

## 🧪 Regles de Testing

### Coverage Mínim

**Regla**: Tot el codi crític ha de tenir tests amb cobertura mínima del 70%.

```typescript
// ✅ BÉ - Auth controller amb tests
describe('AuthController', () => {
  it('should register user successfully', async () => {
    // Test aquí
  });
});
```

## 📚 Regles de Documentació

### Comentaris en Codi

**Regla**: Funcions complexes han de tenir comentaris JSDoc.

```typescript
/**
 * Envia un email de verificació a l'usuari
 * @param email - Email de l'usuari
 * @param firstName - Nom de l'usuari
 * @param verificationToken - Token de verificació
 * @param userId - ID de l'usuari
 */
async sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string,
  userId: string
): Promise<void> {
  // Implementació
}
```

### README Updates

**Regla**: Cada nova funcionalitat ha d'actualitzar el README corresponent.

## 🚀 Regles de Deployment

### Variables d'Entorn

**Regla**: Documentar totes les variables d'entorn necessàries.

```bash
# .env.example
NODE_ENV=production
DATABASE_URL=mongodb://...
RESEND_API_KEY=your_key_here
```

### Build Process

**Regla**: El codi ha de compilar sense errors ni warnings.

```bash
# ✅ BÉ
npm run build
# 0 errors, 0 warnings

# ❌ MAL
npm run build
# 3 warnings found
```

## 📋 Checklist Pre-Commit

Abans de fer commit, verificar:

- [ ] No hi ha `border-left` en el codi
- [ ] Tots els fitxers tenen menys de 1000 línies
- [ ] El codi compila sense errors
- [ ] Els tests passen
- [ ] La documentació està actualitzada
- [ ] No hi ha secrets hardcodejats
- [ ] El missatge de commit segueix el format

## 🔄 Actualització d'Aquest Document

Aquest document és viu i s'actualitza regularment. Si trobes una regla que hauria de ser afegida:

1. Crea un issue explicant la regla proposada
2. Discuteix amb l'equip
3. Actualitza aquest document
4. Crea un commit amb `docs: afegir nova regla de desenvolupament`

---

**Última actualització**: 2025-01-18
**Versió**: 1.0.0
