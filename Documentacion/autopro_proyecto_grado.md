# Documentación Técnica: Sistema de Gestión de Talleres "AutoPro"

## 1. Introducción
Este documento presenta la arquitectura y especificaciones técnicas del sistema AutoPro, diseñado como una solución integral para la digitalización de talleres mecánicos.

## 2. Stack Tecnológico (Justificación)
*   **Frontend/Backend**: Next.js 16. Se eligió por su manejo eficiente de rutas y acciones de servidor, lo que reduce la latencia en la carga de datos de clientes y vehículos.
*   **Base de Datos**: PostgreSQL. Proporciona la robustez necesaria para manejar transacciones complejas, como el descuento de inventario al finalizar una orden de servicio.
*   **ORM**: Prisma. Garantiza que el código sea mantenible y que los datos tengan una estructura consistente (Type-Safe).

## 3. Arquitectura del Sistema
El sistema opera bajo un modelo de arquitectura web moderna:
- **Capa de Cliente**: Interfaz responsiva construida con React y CSS optimizado.
- **Capa de Negocio**: Lógica distribuida en Server Actions (TypeScript) para el procesamiento de reglas de negocio.
- **Capa de Persistencia**: Base de datos relacional PostgreSQL.

## 4. Inteligencia de Negocio (BI) Aplicada
AutoPro incorpora módulos de análisis de datos para la toma de decisiones:
- **Predicción de Reabastecimiento**: Un algoritmo basado en reglas que monitorea el stock actual contra el stock mínimo histórico.
- **Dashboard Analítico**: Visualización de KPIs (Indicadores Clave de Desempeño) como ingresos totales, servicios pendientes y alertas de inventario.

## 5. Diagrama de Entidad-Relación (Conceptual)
El sistema gestiona las siguientes entidades principales:
- **Clientes**: Datos de contacto y perfil.
- **Vehículos**: Historial de kilometraje y servicios.
- **Órdenes de Servicio**: Diagnósticos, mano de obra y repuestos utilizados.
- **Inventario**: Control de stock y precios de venta.
- **Facturas**: Documentación legal de servicios prestados.

---
*Este documento es propiedad del proyecto de grado de Diego Muñoz.*
