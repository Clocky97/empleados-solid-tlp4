# Documentación Técnica: Principios SOLID y Docker Compose

Este documento detalla la refactorización arquitectónica aplicada al proyecto de **Gestión de Empleados y Salarios**, explicando la implementación de los principios **SOLID**, el análisis técnico del archivo `docker-compose.yml` y las instrucciones de ejecución.

---

## 1. Aplicación de los Principios SOLID

El código inicial agrupaba la configuración del servidor, la conexión a la base de datos, el enrutamiento HTTP, la validación de peticiones, el cálculo de reglas de negocio y el acceso directo a la base de datos en archivos sobrecargados. A continuación, se detalla cómo se aplicó cada principio SOLID en la nueva arquitectura.

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

### S — Single Responsibility Principle (Principio de Responsabilidad Única)

> **Definición**: Una clase o módulo debe tener una sola razón para cambiar, lo que significa que debe realizar una única tarea o tener una única responsabilidad bien definida.

#### Dónde se identifica y cómo se aplicó:

1. **`models/Employee.ts`**:
   - **Responsabilidad única**: Definir la estructura de datos (esquema e interfaz) para MongoDB a través de Mongoose.
   - **Antes**: En versiones anteriores o en el starter inicial, se mezclaban métodos estáticos de consulta y mutación con la definición del esquema.
   - **Ahora**: Solo exporta el modelo y las interfaces de datos (`IEmployee`, `IEmployeeDocument`).

2. **`repositories/EmployeeRepository.ts` / `IEmployeeRepository.ts`**:
   - **Responsabilidad única**: Encapsular todas las operaciones de persistencia y consultas hacia la base de datos (`create`, `findAll`, `findById`).
   - No conoce nada sobre HTTP, validaciones de formato de cliente ni reglas de negocio salariales.

3. **`services/AntiquitySalaryCalculator.ts` / `ISalaryCalculator.ts`**:
   - **Responsabilidad única**: Realizar exclusivamente el cálculo matemático del salario final en base a la antigüedad:
     $$\text{salario final} = \text{salario base} + (0.02 \times \text{antigüedad} \times \text{salario base})$$
   - Si la fórmula de cálculo o el porcentaje cambia, esta es la única clase que se modifica.

4. **`services/EmployeeService.ts` / `IEmployeeService.ts`**:
   - **Responsabilidad única**: Orquestar las reglas del dominio de empleados (validar consistencia de los datos, invocar el cálculo de salario y coordinar el almacenamiento mediante el repositorio).
   - No maneja objetos `req` o `res` de Express ni detalles de la base de datos.

5. **`controllers/EmployeeController.ts`**:
   - **Responsabilidad única**: Atender la capa HTTP. Recibe los parámetros de la solicitud (`req.body`, `req.params`), delega la operación al servicio correspondiente y devuelve la respuesta HTTP con el código de estado apropiado (`200`, `201`) o delega los errores a `next(error)`.

6. **`routes/EmployeeRoutes.ts`**:
   - **Responsabilidad única**: Declarar los endpoints (`/employees`, `/employees/:id`) y vincular los verbos HTTP (`POST`, `GET`) con los métodos del controlador.

7. **`errors/ErrorHandler.ts` y `errors/AppError.ts`**:
   - **Responsabilidad única**: Centralizar la captura, tipado y serialización de respuestas de error ante el cliente, evitando duplicar bloques `try-catch` con formato manual en cada endpoint.

8. **`config/Server.ts`**:
   - **Responsabilidad única**: Configurar el ciclo de vida del servidor Express (middlewares, conexión a MongoDB mediante Mongoose y arranque del listener).

---

### O — Open/Closed Principle (Principio de Abierto/Cerrado)

> **Definición**: Las entidades de software deben estar abiertas a la extensión, pero cerradas a la modificación.

#### Dónde se identifica y cómo se aplicó:

1. **Estrategias de Cálculo de Salarios (`ISalaryCalculator`)**:
   - Se diseñó la interfaz `ISalaryCalculator` con el método `calculate(baseSalary: number, yearsOfService: number): number`.
   - `AntiquitySalaryCalculator` implementa esta interfaz.
   - Si el día de mañana se incorporan nuevas reglas de negocio (por ejemplo, cálculo por categoría profesional, bonos por desempeño o inflación), no se altera el código de `EmployeeService` ni de `AntiquitySalaryCalculator`. Basta con crear una nueva clase (e.g. `PerformanceSalaryCalculator`) que implemente `ISalaryCalculator` e inyectarla en el servicio.

2. **Desacoplamiento del Almacenamiento (`IEmployeeRepository`)**:
   - `EmployeeService` depende de la interfaz `IEmployeeRepository`. Si en el futuro se migra a otra base de datos (PostgreSQL, Redis) o se crea un repositorio falso en memoria para pruebas unitarias (`InMemoryEmployeeRepository`), no es necesario modificar una sola línea de la lógica de negocio de `EmployeeService`.

---

### L — Liskov Substitution Principle (Principio de Sustitución de Liskov)

> **Definición**: Los objetos de una subclase o implementación deben poder sustituir a los objetos de la clase base o interfaz sin alterar el correcto funcionamiento del programa.

#### Dónde se identifica y cómo se aplicó:

1. **Sustituibilidad en `ISalaryCalculator`**:
   - Cualquier clase que implemente `ISalaryCalculator` puede ser provista al constructor de `EmployeeService`. Como respetan la firma del contrato y no producen efectos secundarios incompatibles, el servicio funcionará correctamente con cualquier implementación.

2. **Sustituibilidad en `IEmployeeRepository`**:
   - `EmployeeRepository` respeta fielmente los tipos de retorno y promesas especificados en `IEmployeeRepository`. Cualquier otra implementación que cumpla dicho contrato puede reemplazar a `EmployeeRepository` en `Server.ts` sin romper el flujo de la aplicación.

---

### I — Interface Segregation Principle (Principio de Segregación de Interfaces)

> **Definición**: Los clientes no deben verse obligados a depender de interfaces que no utilizan. Es preferible tener muchas interfaces pequeñas y específicas a una interfaz sobrecargada.

#### Dónde se identifica y cómo se aplicó:

1. **Interfaces pequeñas y orientadas a roles**:
   - `ISalaryCalculator`: Contiene únicamente la función `calculate`, ya que quien calcula salarios no necesita conocer entidades de base de datos ni métodos de persistencia.
   - `IEmployeeRepository`: Define solo los métodos que el servicio requiere para persistir y consultar (`create`, `findAll`, `findById`). No expone métodos innecesarios ni fuerza al repositorio a implementar operaciones no utilizadas.
   - `IEmployeeService` y `CreateEmployeeDTO`: Separa el contrato de negocio de las entidades Mongoose, exponiendo solo las funciones y datos requeridos por los controladores.

---

### D — Dependency Inversion Principle (Principio de Inversión de Dependencias)

> **Definición**: Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones. Las abstracciones no deben depender de los detalles; los detalles deben depender de las abstracciones.

#### Dónde se identifica y cómo se aplicó:

1. **Inyección de Dependencias en el Controlador**:
   - `EmployeeController` no instancia `EmployeeService` internamente ni llama a modelos concretos; recibe `IEmployeeService` a través de su constructor:
   ```typescript
   constructor(employeeService: IEmployeeService) {
     this.employeeService = employeeService;
   }
   ```

2. **Inyección de Dependencias en el Servicio**:
   - `EmployeeService` no crea instancias de `EmployeeRepository` ni de `AntiquitySalaryCalculator`. Recibe abstracciones a través de su constructor:
   ```typescript
   constructor(
     employeeRepository: IEmployeeRepository,
     salaryCalculator: ISalaryCalculator
   ) {
     this.employeeRepository = employeeRepository;
     this.salaryCalculator = salaryCalculator;
   }
   ```

3. **Composition Root en `Server.ts`**:
   - La composición y cableado de todas las dependencias se centraliza en `Server.configureRoutes()`:
   ```typescript
   const salaryCalculator = new AntiquitySalaryCalculator();
   const employeeRepository = new EmployeeRepository();
   const employeeService = new EmployeeService(employeeRepository, salaryCalculator);
   const employeeController = new EmployeeController(employeeService);
   const employeeRoutes = new EmployeeRoutes(employeeController);
   ```
   De esta manera, las dependencias fluyen desde los detalles hacia las abstracciones.

---

## 2. Análisis e Investigación del archivo `docker-compose.yml`

El archivo `docker-compose.yml` incluido en el proyecto contiene la siguiente configuración:

```yaml
services:
  mongodb:
    image: mongo:8
    container_name: empleados-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 2.1. ¿Cuál es su función?

**Docker Compose** es una herramienta de Docker que permite definir y ejecutar aplicaciones multi-contenedor mediante un archivo declarativo en formato YAML.

En este proyecto, su función es **proveer de forma aislada, reproducible e inmediata la infraestructura de base de datos (MongoDB)** necesaria para que la aplicación Node.js / Express funcione, sin obligar al desarrollador a instalar y configurar manualmente un motor de base de datos en su sistema operativo local.

### 2.2. ¿Qué servicios y parámetros configura?

El archivo define un único servicio denominado `mongodb`, acompañado por un volumen de almacenamiento:

1. **`image: mongo:8`**:
   - Indica la imagen base de contenedor que se descargará automáticamente desde el registro oficial Docker Hub. Corresponde a la versión 8 de MongoDB Community Server.

2. **`container_name: empleados-mongodb`**:
   - Asigna un nombre explícito y representativo al contenedor en ejecución. Esto facilita su identificación y administración en la terminal mediante comandos como:
     - `docker logs -f empleados-mongodb`
     - `docker stop empleados-mongodb`
     - `docker restart empleados-mongodb`

3. **`restart: unless-stopped`**:
   - Define la directiva de reinicio automático del contenedor. Si el contenedor se detiene inesperadamente (por ejemplo, tras un fallo o al reiniciar el sistema operativo), Docker intentará levantarlo de nuevo, salvo que haya sido detenido deliberadamente por el usuario.

4. **`ports: - "27017:27017"`**:
   - Establece el reenvío de puertos (puerto del host : puerto del contenedor).
   - El puerto interno de MongoDB (`27017`) se mapea al puerto `27017` de la máquina host. Esto permite que el servidor Node.js que corre fuera de Docker se comunique con la base de datos a través de `mongodb://localhost:27017`.

5. **`volumes: - mongo_data:/data/db`**:
   - Monta el volumen con nombre `mongo_data` en la ruta interna `/data/db` (que es el directorio estándar donde MongoDB almacena los ficheros de datos).
   - **Persistencia**: Garantiza que toda la información guardada no se pierda al reiniciar, detener o recrear el contenedor.

6. **`volumes: mongo_data:` (a nivel raíz)**:
   - Declara el volumen con nombre gestionado por Docker en el sistema de archivos del host.

### 2.3. ¿Cómo se relaciona con el funcionamiento general de la aplicación?

La aplicación está construida sobre Express y utiliza **Mongoose** como ODM (Object Data Modeling) para interactuar con la base de datos:

1. **Configuración de conexión (`.env` y `Server.ts`)**:
   - En el archivo `.env`, se establece la variable de entorno:
     ```env
     MONGO_URI=mongodb://localhost:27017/employees_db
     ```
   - Cuando la aplicación inicia (`server.start()`), `mongoose.connect(this.mongoUri)` intenta conectarse al puerto `27017` de `localhost`.
2. **Dependencia de arranque**:
   - Si el servicio de Docker Compose no está activo (`docker compose up -d`), el intento de conexión fallará arrojando un error (`No se pudo conectar a MongoDB`) y el proceso del servidor se cerrará con código de salida `1`.
3. **Persistencia e integridad de datos**:
   - Cada vez que se envía una petición `POST /employees`, la información procesada se guarda físicamente en el volumen `mongo_data` montado por Docker Compose. Al reiniciar la aplicación o el contenedor, los datos continúan disponibles para ser recuperados mediante `GET /employees`.

---

## 3. Guía de Ejecución y Verificación

### Paso 1: Configurar variables de entorno
```bash
cp .env.example .env
```

### Paso 2: Iniciar la base de datos con Docker Compose
```bash
docker compose up -d
```

### Paso 3: Instalar dependencias
```bash
npm install
```

### Paso 4: Iniciar la aplicación en modo desarrollo
```bash
npm run dev
```

### Paso 5: Probar los endpoints

1. **Crear empleado (`POST /employees`)**:
```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "position": "Desarrollador Senior",
    "baseSalary": 1000000,
    "yearsOfService": 5
  }'
```
*Respuesta esperada (201 Created con `finalSalary: 1100000`)*:
```json
{
  "_id": "...",
  "name": "Juan Pérez",
  "position": "Desarrollador Senior",
  "baseSalary": 1000000,
  "yearsOfService": 5,
  "finalSalary": 1100000,
  "createdAt": "...",
  "updatedAt": "..."
}
```

2. **Listar empleados (`GET /employees`)**:
```bash
curl -X GET http://localhost:3000/employees
```

3. **Consultar empleado por ID (`GET /employees/:id`)**:
```bash
curl -X GET http://localhost:3000/employees/<ID_DEL_EMPLEADO>
```
