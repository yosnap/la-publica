# Documentación de la API - La Pública

Este documento detalla el funcionamiento de la API, tanto desde la perspectiva de un desarrollador como de un usuario final que la consume.

---

## 1. Módulo de Autenticación

Gestiona el registro, inicio de sesión y validación de usuarios.

### Guía para Desarrolladores

-   **Modelos implicados:** `User` (`src/user.model.ts`)
-   **Controlador:** `src/auth.controller.ts`
-   **Rutas:** `src/auth.routes.ts`
-   **Middleware de autenticación:** `src/middleware/auth.ts`
-   **Lógica JWT:** `src/utils/jwt.ts`

El flujo de autenticación se basa en JSON Web Tokens (JWT). Al iniciar sesión, se genera un token con el `userId` que expira según la variable de entorno `JWT_EXPIRES_IN`. Este token debe enviarse en el header `Authorization` como `Bearer <token>` para acceder a las rutas protegidas.

### Manual de Usuario Final

#### `POST /api/auth/register` - Registro de un nuevo usuario

-   **Descripción:** Crea un nuevo usuario en la base de datos.
-   **Body (raw JSON):**
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "password": "yourstrongpassword"
    }
    ```
-   **Respuesta Exitosa (201):**
    ```json
    {
      "success": true,
      "message": "Usuario registrado con éxito"
    }
    ```

#### `POST /api/auth/login` - Inicio de sesión

-   **Descripción:** Autentica a un usuario y devuelve un token JWT.
-   **Body (raw JSON):** Se puede usar `email` o `username` para iniciar sesión.
    ```json
    {
      "login": "johndoe", // o "john.doe@example.com"
      "password": "yourstrongpassword"
    }
    ```
-   **Respuesta Exitosa (200):**
    ```json
    {
      "success": true,
      "token": "ey...",
      "message": "Inicio de sesión exitoso"
    }
    ```

---

## 2. Módulo de Usuarios

Permite la gestión de perfiles de usuario.

### Guía para Desarrolladores

-   **Modelos implicados:** `User`
-   **Controlador:** `src/users.controller.ts`
-   **Rutas:** `src/users.routes.ts`

Las operaciones de modificación (`/profile`) y eliminación (`/:id`) están protegidas y requieren un token JWT válido. La lógica de autorización verifica que el usuario que realiza la acción sea el propietario del perfil o, en el futuro, un administrador.

### Manual de Usuario Final

*Todas las rutas que requieran autenticación deben incluir el header: `Authorization: Bearer <TU_TOKEN_JWT>`.*

#### `GET /api/users` - Listar todos los usuarios

-   **Descripción:** Devuelve una lista de todos los usuarios registrados.
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "data": [
            {
                "_id": "...",
                "firstName": "John",
                "lastName": "Doe",
                "username": "johndoe"
            }
        ]
    }
    ```

#### `GET /api/users/:id` - Obtener un usuario por ID

-   **Descripción:** Devuelve los detalles de un usuario específico.
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "data": {
            "_id": "...",
            "firstName": "John",
            // ... otros campos
        }
    }
    ```

#### `PUT /api/users/profile` - Actualizar perfil del usuario autenticado

-   **Descripción:** Permite al usuario logueado actualizar su propio perfil. La nueva estructura permite añadir un array de experiencias laborales.
-   **Autenticación:** Requerida.
-   **Body (raw JSON):** Incluir solo los campos a modificar.
    ```json
    {
      "firstName": "Jonathan",
      "bio": "Desarrollador de software con pasión por el código limpio.",
      "skills": ["React", "Node.js", "TypeScript", "MongoDB"],
      "workExperience": [
        {
          "jobTitle": "Desarrollador Frontend",
          "company": "Tech Corp",
          "startDate": "2020-01-15T00:00:00.000Z",
          "endDate": null,
          "description": "Desarrollo de interfaces de usuario interactivas y responsivas."
        },
        {
          "jobTitle": "Desarrollador Junior",
          "company": "Startup Inc",
          "startDate": "2018-06-01T00:00:00.000Z",
          "endDate": "2019-12-31T00:00:00.000Z",
          "description": "Colaboración en el desarrollo del producto principal."
        }
      ]
    }
    ```
-   **Respuesta Exitosa (200):** Devuelve el objeto del usuario actualizado.

#### `DELETE /api/users/:id` - Eliminar un usuario

-   **Descripción:** Elimina la cuenta de un usuario. Solo el propio usuario puede eliminar su cuenta.
-   **Autenticación:** Requerida.
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "message": "Usuario eliminado"
    }
    ```

---

## 3. Módulo de Posts

Gestiona la creación, visualización e interacción con los posts.

### Guía para Desarrolladores

-   **Modelos implicados:** `Post`, `User`
-   **Controlador:** `src/post.controller.ts`
-   **Rutas:** `src/post.routes.ts`

El modelo `Post` tiene referencias (`ref`) al modelo `User` en los campos `author`, `likes` y `comments.author`. Esto permite "poblar" estos campos para obtener los detalles completos del usuario en lugar de solo su ID. Las operaciones de creación, edición, eliminación y las interacciones (like/comment) están protegidas.

### Manual de Usuario Final

*Las rutas protegidas requieren el header: `Authorization: Bearer <TU_TOKEN_JWT>`.*

#### `GET /api/posts` - Listar todos los posts

-   **Descripción:** Ruta pública que devuelve todos los posts con información de su autor.
-   **Respuesta Exitosa (200):** Un array de objetos de post.

#### `GET /api/posts/:id` - Obtener un post por ID

-   **Descripción:** Ruta pública que devuelve un post específico con detalles del autor y comentarios.
-   **Respuesta Exitosa (200):** El objeto del post solicitado.

#### `POST /api/posts` - Crear un nuevo post

-   **Descripción:** Crea una nueva publicación.
-   **Autenticación:** Requerida.
-   **Body (raw JSON):**
    ```json
    {
      "content": "Este es el contenido de mi primer post!"
    }
    ```
-   **Respuesta Exitosa (201):** El objeto del post recién creado.

#### `PUT /api/posts/:id` - Actualizar un post

-   **Descripción:** Edita un post existente. Solo el autor del post puede editarlo.
-   **Autenticación:** Requerida.
-   **Body (raw JSON):**
    ```json
    {
      "content": "Contenido actualizado."
    }
    ```
-   **Respuesta Exitosa (200):** El objeto del post actualizado.

#### `DELETE /api/posts/:id` - Eliminar un post

-   **Descripción:** Elimina un post. Solo el autor puede eliminarlo.
-   **Autenticación:** Requerida.
-   **Respuesta Exitosa (200):** Mensaje de confirmación.

#### `POST /api/posts/:id/like` - Dar/Quitar "like" a un post

-   **Descripción:** Alterna el estado de "like" de un usuario en un post. Si ya tiene like, se lo quita. Si no, se lo da.
-   **Autenticación:** Requerida.
-   **Body:** No requiere.
-   **Respuesta Exitosa (200):** Devuelve el objeto del post actualizado con el array `likes` modificado.

#### `POST /api/posts/:id/comment` - Comentar en un post

-   **Descripción:** Añade un comentario a un post.
-   **Autenticación:** Requerida.
-   **Body (raw JSON):**
    ```json
    {
      "text": "¡Qué gran post! Muy informativo."
    }
    ```
-   **Respuesta Exitosa (200):** Devuelve el objeto del post actualizado con el nuevo comentario en el array `comments`.

#### `GET /api/posts/feed/me` - Obtener Feed Personalizado

-   **Descripción:** Devuelve un feed de posts de los usuarios a los que sigues, incluyendo tus propios posts. Los resultados están ordenados del más reciente al más antiguo y paginados.
-   **Autenticación:** Requerida.
-   **Query Params (Opcionales):**
    -   `page`: Número de la página a obtener (por defecto: `1`).
    -   `limit`: Número de resultados por página (por defecto: `10`).
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "data": [
            // ... array de objetos de post ...
        ],
        "pagination": {
            "total": 50,
            "page": 1,
            "limit": 10,
            "totalPages": 5
        }
    }
    ```

---

## 4. Módulo Social (Seguimiento)

Permite a los usuarios seguirse entre ellos.

### Guía para Desarrolladores

-   **Modelos implicados:** `User`
-   **Controlador:** `src/users.controller.ts` (funciones `followOrUnfollowUser`, `getFollowers`, `getFollowing`)
-   **Rutas:** `src/users.routes.ts`

La lógica reside en el `user.model.ts`, que ahora contiene los arrays `followers` y `following`. La función `followOrUnfollowUser` es atómica: cuando un usuario A sigue a B, se añade el ID de A a los `followers` de B, y el ID de B a los `following` de A. La operación inversa ocurre al dejar de seguir. Las funciones `getFollowers` y `getFollowing` utilizan `populate` para devolver los datos de los usuarios en lugar de solo sus IDs.

### Manual de Usuario Final

*La ruta para seguir/dejar de seguir requiere autenticación (`Authorization: Bearer <TU_TOKEN_JWT>`).*

#### `POST /api/users/:id/follow` - Seguir o Dejar de Seguir a un Usuario

-   **Descripción:** Alterna el estado de seguimiento sobre otro usuario. Si no lo sigues, comienzas a seguirlo. Si ya lo sigues, dejas de seguirlo.
-   **Autenticación:** Requerida.
-   **Parámetro URL `id`:** El `_id` del usuario al que se desea seguir/dejar de seguir.
-   **Body:** No requiere.
-   **Respuesta Exitosa (200):**
    ```json
    // Al seguir
    {
        "success": true,
        "message": "Ahora sigues a username"
    }
    // Al dejar de seguir
    {
        "success": true,
        "message": "Dejaste de seguir a username"
    }
    ```

#### `GET /api/users/:id/followers` - Listar los seguidores de un usuario

-   **Descripción:** Devuelve una lista de todos los usuarios que siguen al usuario especificado por el `id`.
-   **Autenticación:** No requerida.
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "data": [
            {
                "_id": "...",
                "username": "follower_username",
                "firstName": "Follower",
                "lastName": "One"
            }
        ]
    }
    ```

#### `GET /api/users/:id/following` - Listar usuarios a los que se sigue

-   **Descripción:** Devuelve una lista de todos los usuarios a los que sigue el usuario especificado por el `id`.
-   **Autenticación:** No requerida.
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "data": [
            {
                "_id": "...",
                "username": "followed_user",
                "firstName": "Followed",
                "lastName": "User"
            }
        ]
    }
    ```

---

## 5. Módulo de Búsqueda

Permite realizar búsquedas de texto completo en usuarios y posts.

### Guía para Desarrolladores

-   **Modelos implicados:** `User`, `Post`
-   **Controlador:** `src/search.controller.ts`
-   **Rutas:** `src/search.routes.ts`

Se han añadido índices de texto (`text index`) a los modelos `User` (en `firstName`, `lastName`, `username`) y `Post` (en `content`). Esto permite que MongoDB realice búsquedas de texto de manera muy eficiente usando el operador `$text`. El controlador `searchAll` maneja la lógica para buscar en uno o ambos modelos según el parámetro `type`.

### Manual de Usuario Final

#### `GET /api/search` - Realizar una búsqueda

-   **Descripción:** Busca usuarios y/o posts que coincidan con un término de búsqueda. La búsqueda no distingue mayúsculas de minúsculas y busca palabras completas.
-   **Autenticación:** No requerida.
-   **Query Params:**
    -   `q` (Requerido): El término o frase a buscar.
    -   `type` (Opcional): Limita la búsqueda a un tipo de contenido. Puede ser `users` o `posts`. Si se omite, busca en ambos.
-   **Ejemplos:**
    -   `GET /api/search?q=john%20doe`
    -   `GET /api/search?q=api&type=posts`
    -   `GET /api/search?q=paulo&type=users`
-   **Respuesta Exitosa (200):**
    ```json
    {
      "success": true,
      "data": {
        "users": [
          // array de usuarios encontrados
        ],
        "posts": [
          // array de posts encontrados
        ]
      }
    }
    ```

---

## 6. Roles y Autorización

El sistema cuenta con un mecanismo de autorización basado en roles para proteger ciertas rutas.

### Guía para Desarrolladores

-   **Modelos implicados:** `User` (campo `role`)
-   **Middleware:** `src/middleware/authorize.ts`

El modelo `User` tiene un campo `role` que puede ser `'user'` (por defecto) o `'admin'`.

El middleware `authorize(allowedRoles)` es un guardián que se puede añadir a cualquier cadena de middlewares de una ruta (siempre después de `authenticate`). Comprueba si el `role` presente en el token del usuario está incluido en el array `allowedRoles`. Si no lo está, deniega el acceso con un error `403 Forbidden`.

**Ejemplo de uso en una ruta:**
```typescript
// Esta ruta solo será accesible para usuarios con el rol 'admin'.
router.delete(
  '/admin/posts/:id',
  authenticate,
  authorize(['admin']), // <-- Middleware en acción
  adminDeletePost
);
```

### Manual de Usuario Final

La gestión de roles es una función administrativa y no se expone directamente a través de la API para los usuarios normales.

-   **Usuarios normales (`user`):** Pueden consumir todas las rutas públicas y las rutas protegidas que no tengan una restricción de rol específica (como crear su propio post, dar like, etc.).
-   **Administradores (`admin`):** Tienen acceso a rutas restringidas. Por ejemplo, la ruta para eliminar cualquier usuario ha sido modificada para requerir este rol.

**Para probar como administrador:**
1.  Un administrador debe modificar manualmente el rol de un usuario en la base de datos de `'user'` a `'admin'`.
2.  **Importante:** El usuario debe **volver a iniciar sesión** después de que su rol haya sido cambiado. Esto es crucial porque el rol se almacena en el token JWT, y se necesita un nuevo token con el rol actualizado.
3.  Con el nuevo token, el usuario administrador podrá acceder a las rutas protegidas para su rol.

---

## 7. Panel de Administración

Endpoints disponibles solo para usuarios con el rol `admin`.

### Guía para Desarrolladores

-   **Controlador:** `src/admin.controller.ts`
-   **Rutas:** `src/admin.routes.ts`

Todas las rutas definidas en `src/admin.routes.ts` están agrupadas bajo el prefijo `/api/admin` y protegidas automáticamente por los middlewares `authenticate` y `authorize(['admin'])`.

### Manual de Usuario Final

*Todos los endpoints de esta sección requieren autenticación como administrador.*

#### `GET /api/admin/users` - Listar todos los usuarios

-   **Descripción:** Devuelve una lista completa de todos los usuarios en el sistema, excluyendo sus contraseñas.
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "count": 15,
        "data": [
            // ... array de objetos de usuario ...
        ]
    }
    ```

#### `PUT /api/admin/users/:id` - Actualizar un usuario

-   **Descripción:** Permite a un administrador modificar los detalles de cualquier usuario.
-   **Body (raw JSON):** Incluir solo los campos a modificar.
    ```json
    {
      "role": "user",
      "isActive": false
    }
    ```
-   **Respuesta Exitosa (200):** Devuelve el objeto del usuario actualizado (sin la contraseña).

#### `DELETE /api/admin/posts/:id` - Eliminar cualquier post

-   **Descripción:** Permite a un administrador eliminar cualquier post de la plataforma, sin necesidad de ser el autor.
-   **Respuesta Exitosa (200):**
    ```json
    {
        "success": true,
        "message": "Post eliminado por el administrador"
    }
    ``` 