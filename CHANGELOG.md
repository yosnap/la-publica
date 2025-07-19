# Changelog

## [1.0.2] - 2025-07-19

### 🎯 Sistema d'Ofertes de Treball i Assessoraments

#### Funcionalitats implementades
- **Nou sistema complet d'ofertes de treball**:
  - Formularis de creació/edició amb càrrega d'imatges
  - Pàgines de detall amb informació completa
  - Control d'accés: només col·laboradors poden crear ofertes
  - Visualització pública per a tots els usuaris

- **Nou sistema complet d'assessoraments**:
  - Formularis avançats amb sistema de programació
  - Múltiples formats (vídeo, telèfon, presencial, email, xat)
  - Configuració de preus (gratuït, pagament, consulta)
  - Horaris setmanals i disponibilitat

- **Sistema de categories dinàmic**:
  - Estructura jeràrquica per cada tipus de contingut
  - Script de seeding amb categories predefinides
  - API completa per gestió d'administradors

#### Localització completa al català
- **URLs catalanes**: `/ofertes` i `/assessorament`
- **Interfície**: Tots els textos, botons i missatges
- **Formularis**: Labels, placeholders i validacions
- **Navegació**: Menús i enllaços actualitzats

### 🔧 Sistema Granular de Backups

#### Backup intel·ligent
- **Selecció granular**: Filtratge per tipus de contingut, autors i categories
- **Previsualització**: Vista prèvia abans d'exportar
- **Filtres avançats**: Per data, estat actiu i camps específics
- **Exportació/importació**: Sistema complet per migrar dades

#### Gestió d'administració
- **Panell de gestió de dades**: Interfície per gestionar tot el contingut
- **Assignació massiva**: Autors i categories per lots
- **8 tipus de contingut**: Grups, fòrums, blocs, anuncis, empreses, ofertes, assessoraments, enllaços

### 🐛 Correccions Críticas - v1.0.2

#### Correccions de permisos d'edició
- **JobOfferDetail.tsx**: Afegida verificació robusta de permisos d'edició
  - Corregit error "Cannot read properties of undefined (reading '_id')"
  - Utilitzat `user._id` en lloc de `user.userId` per comparar propietaris
  - El botó d'editar només es mostra quan l'usuari és propietari de l'oferta
- **AdvisoryDetail.tsx**: Aplicades les mateixes correccions per asesorías

#### Millores de backend per populate
- **jobOffers.controller.ts**: Implementat nested populate per obtenir dades de propietari
- **advisories.controller.ts**: Implementat nested populate per obtenir dades de propietari
- Assegurar que `company.owner` sigui poblat correctament en detalls

#### Consistència de disseny d'interfície
- **Offers.tsx**: Amplada del contenidor dret canviada de `w-48` a `w-80`
- **Consulting.tsx**: Amplada del contenidor dret canviada de `w-48` a `w-80`
- **Companies.tsx**: Mantingut `w-80` per consistència entre totes les pàgines

#### Correccions de Forums
- **Forums.tsx**: Afegida verificació de camps nuls per evitar errors d'autor
  - Corregit "Cannot read properties of null (reading 'profilePicture')"
  - Utilitzada navegació segura amb optional chaining
  - Afegits fallbacks per firstName i lastName nuls

#### Resolució d'errors API
- **Error 403**: Corregit fent rutes d'ofertes públiques
- **Error 404**: Eliminades dades mock, implementades connexions reals
- **Autenticació**: Ajustats permisos per visualització pública

#### Substitució de dades mock
- **Offers.tsx**: Connexió real amb backend
- **Consulting.tsx**: Carrega dades reals d'assessoraments
- **JobOfferDetail/AdvisoryDetail**: Navegació amb IDs de MongoDB

### 🔒 Control d'Accés i Seguretat

#### Rols i permisos
- **Usuaris (`user`)**: Poden veure ofertes/assessoraments i crear anuncis
- **Col·laboradors (`colaborador`)**: Poden crear empreses, ofertes i assessoraments
- **Administradors (`admin`)**: Accés complet al sistema

#### Scripts de dades
- **seed-companies.js**: Crea empreses, ofertes i assessoraments d'exemple
- **seed-categories.js**: Genera estructura de categories completa
- **update-password.js**: Utilitat per actualitzar contrasenyes

### 📱 Millores d'Experiència d'Usuari

#### Funcionalitat de navegació
- **Botons funcionals**: Tots els enllaços de detall operatius
- **Estats de càrrega**: Feedback visual durant càrregues
- **Gestió d'errors**: Missatges específics per cada tipus d'error
- **Responsive**: Disseny adaptatiu per mòbils i tauletes

#### Interfície millorada
- **Cards informatives**: Disseny consistent estil marketplace
- **Filtres avançats**: Cerca per categoria, disponibilitat i preu
- **Vista grid/llista**: Modes de visualització alternatius
- **Informació detallada**: Stats, reviews i disponibilitat

### 🔧 Canvis Tècnics

#### Backend
- **Nous models**: `JobOffer`, `Advisory`, `Category`, `Company`
- **Controladors complets**: CRUD per tots els nous models
- **Rutes públiques**: Visualització sense autenticació
- **Middleware**: Control d'accés per rol

#### Frontend  
- **Nous components**: Formularis complexos amb React Hook Form
- **APIs actualitzades**: Clients per tots els endpoints
- **Hooks optimitzats**: useUserProfile centralitzat
- **TypeScript**: Interfaces completes per tots els models

### 📚 Scripts i Utilitats
- **Scripts de seeding**: Generació de dades d'exemple
- **Backup granular**: Sistema d'exportació/importació
- **Gestió de contrasenyes**: Utilitat d'administració

## [1.0.1] - 2025-01-19

### 🌍 Localització

#### Català com idioma per defecte
- **Actualitzat**: Tota la interfície d'usuari al català:
  - `AppSidebar`: Navegació principal, elements de negoci, accions ràpides i administració
  - `Announcements`: Títols, botons, filtres, missatges d'estat i formats de data
  - `Profile`: Pestanyes, estadístiques, botons d'acció i dates relatives
  - Formats de data actualitzats per utilitzar localització catalana (`ca-ES`)

#### Optimitzacions d'API
- **Corregit**: Errors 429 (Massa sol·licituds) causats per crides múltiples
- **Implementat**: Hook centralitzat `useUserProfile` per reduir crides duplicades a `/api/users/profile`
- **Optimitzat**: Rate limiter més permissiu en desenvolupament (1000 sol·licituds vs 100)
- **Millorat**: Rendiment general de l'aplicació

#### Correccions de renderitzat
- **Corregit**: Error de renderitzat en `AnnouncementCard` amb objectes de localització
- **Actualitzat**: Gestió de camps `location` com a string o objecte `{city, country, allowRemote}`
- **Sincronitzat**: Interfícies TypeScript a tots els fitxers rellevants

### 🔧 Canvis tècnics
- **Migrat**: Components principals per utilitzar el hook centralitzat:
  - `Profile.tsx`: Eliminades crides directes a API
  - `Dashboard.tsx`: Centralitzada obtenció de dades d'usuari  
  - `AppSidebar.tsx`: Optimitzada càrrega de perfil
  - `Companies.tsx`: Utilitza hook compartit
- **Creat**: `hooks/useUser.ts` - Hook centralitzat per gestió d'usuari
- **Actualitzat**: Rate limiter al backend amb configuració més flexible

## [1.0.0] - 2024-01-19

### 🎉 Nuevas Funcionalidades

#### Panel de Administración
- **Sistema de Información**: Nueva sección que muestra:
  - Versión de la aplicación (almacenada en base de datos)
  - Información del servidor: plataforma, arquitectura, Node.js, uptime
  - Estadísticas: usuarios, empresas, posts, ofertas, anuncios, asesorías
  - Recursos del sistema: memoria RAM y CPU
  - Información de MongoDB: versión, tamaño, colecciones
  - Tecnologías y dependencias principales

- **Sistema de Logs**: 
  - Registro automático de errores (4xx, 5xx) y acciones importantes
  - Visualización de logs con filtros por nivel (info, warning, error, debug)
  - Vista detallada de cada log con información completa
  - Eliminación individual de logs
  - Paginación para manejar grandes cantidades de registros

### 🐛 Correcciones

#### Dashboard - Activity Feed
- **Corregido**: El feed ahora muestra todos los posts de todos los usuarios (antes solo mostraba posts del usuario actual)
- **Corregido**: Error "Cannot read properties of null" al mostrar posts sin autor
- **Mejorado**: Filtrado de posts con autores eliminados para evitar errores

#### API de Posts
- **Corregido**: Todos los endpoints de posts ahora incluyen el prefijo `/api` correcto:
  - `/api/posts/feed/me` (antes `/posts/feed/me`)
  - `/api/posts/:id`
  - `/api/posts/:id/like`
  - `/api/posts/:id/comment`
  - `/api/posts/:id/toggle-comments`
  - `/api/posts/:id/toggle-pin`

### 🔧 Cambios Técnicos

#### Backend
- **Nuevos Modelos**:
  - `SystemInfo`: Almacena información del sistema y configuraciones
  - `Log`: Almacena registros del sistema

- **Nuevos Controladores**:
  - `system.controller.ts`: Gestión de información del sistema y logs
  - Middleware `logger.ts`: Registro automático de actividades

- **Nuevas Rutas** (`/api/system/*`):
  - `GET /api/system/info`: Obtener información del sistema
  - `PUT /api/system/version`: Actualizar versión
  - `GET /api/system/logs`: Listar logs con filtros
  - `GET /api/system/logs/:id`: Ver detalle de un log
  - `DELETE /api/system/logs`: Eliminar logs

#### Frontend
- **Nueva Página**: `Admin.tsx` con tabs para información del sistema y logs
- **Nueva API**: `system.ts` para comunicación con endpoints del sistema
- **Actualizado**: Sidebar con nuevo enlace "Panel de Administración" para admins

### 📚 Scripts Adicionales
- `scripts/init-system.js`: Inicializa la información del sistema en la base de datos

### 🔒 Seguridad
- Todas las rutas del sistema requieren autenticación y rol de administrador
- Logging automático de acciones importantes para auditoría

### 📝 Notas de Instalación
Para aplicar estos cambios en un entorno existente:

1. Ejecutar el script de inicialización del sistema:
   ```bash
   cd la-publica-backend
   node scripts/init-system.js
   ```

2. Reiniciar el servidor backend para activar el middleware de logging

3. Los usuarios con rol `admin` verán automáticamente el nuevo panel en `/admin`