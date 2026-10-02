# Práctica SOLID - Empleados y Salarios

Proyecto refactorizado aplicando buenas prácticas de diseño de software y principios **SOLID**, desacoplando la lógica de negocio, acceso a datos, transporte HTTP y gestión de errores.

La explicación exhaustiva de los principios aplicados y el análisis de Docker Compose se encuentra en:
👉 **[DOCUMENTACION.md](./DOCUMENTACION.md)**

---

## Estructura del Proyecto

```
src/
├── config/
│   └── Server.ts                     # Configuración del servidor y Composition Root
├── controllers/
│   └── EmployeeController.ts         # Manejo de entrada y salida HTTP
├── errors/
│   ├── AppError.ts                   # Error operacional personalizado
│   └── ErrorHandler.ts               # Middleware centralizado de errores
├── models/
│   └── Employee.ts                   # Definición del esquema y modelo Mongoose
├── repositories/
│   ├── IEmployeeRepository.ts        # Contrato de acceso a datos
│   └── EmployeeRepository.ts         # Implementación de persistencia con MongoDB
├── routes/
│   └── EmployeeRoutes.ts             # Definición de rutas Express
├── services/
│   ├── ISalaryCalculator.ts          # Contrato de cálculo de salarios
│   ├── AntiquitySalaryCalculator.ts  # Estrategia de cálculo por antigüedad
│   ├── IEmployeeService.ts           # Contrato de lógica de negocio
│   └── EmployeeService.ts            # Orquestador del dominio de empleados
└── server.ts                         # Punto de entrada de la aplicación
```

---

## Regla de Negocio

El salario final se calcula mediante la fórmula:

$$\text{salario final} = \text{salario base} + (0.02 \times \text{antigüedad} \times \text{salario base})$$

Ejemplo:
- Salario base: \$1.000.000
- Antigüedad: 5 años
- Adicional: 10%
- Salario final: \$1.100.000

---

## Endpoints Disponibles

- `POST /employees`: Registra un nuevo empleado calculando su salario final.
- `GET /employees`: Obtiene la lista completa de empleados ordenados por fecha de creación descendente.
- `GET /employees/:id`: Obtiene el detalle de un empleado por su ID.

---

## Cómo Ejecutar

1. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Levantar la base de datos MongoDB con Docker Compose:
   ```bash
   docker compose up -d
   ```

3. Instalar dependencias:
   ```bash
   npm install
   ```

4. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

5. Compilar TypeScript para producción:
   ```bash
   npm run build
   ```
