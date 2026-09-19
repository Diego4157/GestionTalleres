# Arquitectura MVC - Sistema de Gestión de Taller

Se ha implementado el patrón **Modelo-Vista-Controlador (MVC)** siguiendo el diagrama de componentes solicitado.

## Estructura de Carpetas

- **Controladores (`/src/controllers`)**: Orquestan las peticiones de las vistas y se comunican con los modelos.
  - `AuthController.ts`: Maneja la autenticación.
  - `ClienteController.ts`: Gestión de clientes.
  - `OrdenController.ts`: Gestión de órdenes de servicio.
  - `VehicleController.ts`: Gestión de vehículos.
  - `UserController.ts`: Gestión de usuarios y mecánicos.

- **Modelos (`/src/models`)**:
  - **Entidades (`/entities`)**: Definición de interfaces y objetos de dominio.
    - `Cliente.ts`
    - `OrdenTrabajo.ts`
  - **Persistencia/DAO (`/dao`)**: Acceso directo a la base de datos a través de Prisma.
    - `ClienteDAO.ts`
    - `OrdenDAO.ts`
    - `VehicleDAO.ts`
    - `UserDAO.ts`

- **Vistas (`/src/views`)**: Las páginas de Next.js actúan como contenedores del patrón Vista.
  - `LoginView.tsx`
  - `ClientesView.tsx`
  - `OrdenesView.tsx`
  - `DashboardView.tsx`
  - `VehiculosView.tsx`

- **Rutas (`/src/app`)**: Definición de rutas que renderizan las Vistas correspondientes.

- **Servicios (`/src/services`)**: Lógica de negocio y servicios externos.
  - `AuthService.ts`: Lógica de validación de usuarios.
  - `NotificationService.ts`: Integración con servicios de notificación (WhatsApp).

- **Infraestructura**:
  - `PostgreSQL`: Base de datos gestionada por Prisma.
  - `lib/prisma.ts`: Cliente de conexión.

## Flujo de Datos

1. La **Vista** invoca un método del **Controlador** (vía Server Actions).
2. El **Controlador** llama al **Modelo (DAO)** para realizar operaciones de datos o al **Servicio** para lógica adicional.
3. El **Modelo** interactúa con la **Infraestructura (DB)**.
4. El resultado vuelve a la **Vista** para ser renderizado.
