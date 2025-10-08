# 🧩 CRUD Empleados — Aplicación de Escritorio (Electron + React + NestJS)

![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Tech](https://img.shields.io/badge/Built%20with-NestJS%20%7C%20React%20%7C%20Electron%20%7C%20PostgreSQL-ff69b4?style=flat-square)

Aplicación de escritorio desarrollada con **Electron + React + TypeScript + NestJS** para la gestión integral de empleados y usuarios, con autenticación JWT, control de roles y generación automática de deducciones salariales.

---

## 🚀 Tecnologías utilizadas

| Capa | Tecnología | Descripción |
|------|-------------|-------------|
| **Backend** | [NestJS](https://nestjs.com/) | Framework Node.js modular y escalable. |
| **ORM** | [Prisma](https://www.prisma.io/) | ORM moderno para PostgreSQL. |
| **Base de datos** | [PostgreSQL](https://www.postgresql.org/) | Base de datos relacional. Puede ser administrada (Neon, Supabase, Render, etc.). |
| **Frontend** | [React + TypeScript + Vite](https://vitejs.dev/) | SPA moderna y rápida. |
| **Escritorio** | [Electron](https://www.electronjs.org/) | Convierte la web en una app de escritorio. |
| **Formularios** | [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) | Manejo y validación de formularios. |
| **UI y feedback** | [react-hot-toast](https://react-hot-toast.com/) | Alertas y notificaciones. |

---

## 📂 Estructura del proyecto

```
apps/
 ├─ api/               # Backend (NestJS)
 │   ├─ src/
 │   │   ├─ auth/             # Módulo de autenticación (login, JWT)
 │   │   ├─ employees/        # CRUD Empleados + deducciones
 │   │   ├─ users/            # CRUD Usuarios (ADMIN)
 │   │   ├─ catalogs/         # Catálogos ARL, EPS, Fondos
 │   │   ├─ common/           # DTOs, Guards, Pipes
 │   │   ├─ prisma/           # PrismaService y config
 │   │   └─ main.ts           # Punto de entrada del servidor
 │   └─ prisma/
 │       ├─ schema.prisma     # Modelos
 │       └─ seed.ts           # Datos iniciales
 │
 └─ desktop/           # Frontend escritorio (Electron + React)
     ├─ electron/            # Configuración de ventana principal
     ├─ src/
     │   ├─ context/         # Contexto Auth (login, roles, persistencia)
     │   ├─ hooks/           # Hooks (useEmployees, useUsers, useCatalogs...)
     │   ├─ components/      # Navbar, Layout, Table, RoleGate, etc.
     │   ├─ pages/           # Login, Empleados, Usuarios
     │   ├─ auth/            # Roles y permisos
     │   ├─ lib/             # Cliente Axios y helpers API
     │   ├─ App.tsx          # Router principal
     │   └─ main.tsx         # Punto de entrada React
     └─ package.json
```

---

## ⚙️ Requisitos previos

- Node.js ≥ **18**
- **pnpm** (`npm i -g pnpm`)
- Instancia de **PostgreSQL** (local o administrada)
- **Git** instalado

---

## 🧩 Instalación y ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/ChristianDj456/prueba_tecnica_CristianChavez.git
cd crud-empleados
```

---

### 2️⃣ Configurar el backend (NestJS)

⚠️ **Importante:** Si algún comando no funciona, asegúrate de moverte primero a la carpeta del backend:
> ```bash
> cd apps/api
> ```

#### a) Instalar dependencias
```bash
pnpm install
```

#### b) Crear `.env` dentro de `apps/api/`:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/dbname?schema=public"
JWT_SECRET="clave-super-secreta"
```

> 💡 Si usas **Neon**, **Render** o **Supabase**, asegúrate de que el connection string incluya `?sslmode=require`.

#### c) Ejecutar Prisma

```bash
pnpm -C apps/api prisma generate
pnpm -C apps/api prisma migrate deploy
pnpm -C apps/api prisma db seed
```

```bash
pnpm prisma generate
pnpm prisma migrate deploy
pnpm prisma db seed
```

#### d) Levantar el backend

```bash
pnpm -C apps/api start:dev
```

```bash
pnpm start:dev
```

👉 API disponible en `http://localhost:3000`

---

### 3️⃣ Configurar el frontend de escritorio

⚠️ **Importante:** Si algún comando no funciona, asegúrate de moverte primero a la carpeta del frontend:
> ```bash
> cd apps/desktop
> ```

#### a) Instalar dependencias
```bash
pnpm install
```

#### b) Crear `.env` en `apps/desktop/`:
```env
VITE_API_URL=http://localhost:3000
```

#### c) Ejecutar en modo desarrollo:

```bash
pnpm -C apps/desktop run dev
```

```bash
pnpm run dev
```

Esto abrirá una **ventana Electron** con el frontend conectado a la API.

---

## 🧑‍💻 Credenciales iniciales

Seed automático (al correr `prisma db seed`):

| Email | Contraseña | Rol |
|--------|-------------|-----|
| `admin@local.test` | `Admin123*` | `ADMIN` |

---

## 🧮 Cálculo de deducciones

El sistema calcula y muestra automáticamente las deducciones salariales:

| Concepto | % empleado | % empleador |
|-----------|-------------|-------------|
| EPS | 4% | 4% |
| Pensión | 4% | 4% |

> Ejemplo: Salario = 1.000.000  
> Neto empleado = 920.000

---

## 🔐 Roles y permisos

| Rol | Permisos |
|------|-----------|
| **ADMIN** | Puede crear, editar y eliminar empleados y usuarios. |
| **OPERATOR** | Puede crear y editar empleados, pero no eliminarlos ni acceder a la gestión de usuarios. |

> Los permisos se aplican tanto en el backend (Guards + Roles) como en el frontend (ocultando botones y rutas).

---

## 🧾 Scripts útiles

| Comando | Descripción |
|----------|-------------|
| `pnpm -C apps/api start:dev` | Inicia el backend NestJS. |
| `pnpm -C apps/api prisma migrate deploy` | Aplica migraciones. |
| `pnpm -C apps/api prisma db seed` | Carga datos iniciales. |
| `pnpm -C apps/desktop run dev` | Inicia la app de escritorio en modo desarrollo. |
| `pnpm -C apps/desktop build:web` | Compila el frontend (para empaquetar). |

---

## 🧠 Persistencia de sesión

El token JWT y la información del usuario se guardan en `localStorage` para mantener la sesión iniciada incluso tras cerrar la app.  
El botón **Cerrar sesión** borra los datos y redirige a `/login`.

---

## 🗂️ Roles y estructura UI

- **NavBar:** muestra nombre de usuario, rol, botón “Cerrar sesión” y pestañas según permisos.
- **EmployeesPage:** lista, crea, edita, elimina empleados y genera deducciones.
- **UsersPage:** disponible solo para `ADMIN`.
- **RoleGate / useCan:** controlan qué botones o secciones se muestran según rol.

---

## 🧱 Estructura monorepo

```
.
├── apps/
│   ├── api/         # Backend NestJS
│   └── desktop/     # Frontend Electron + React
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 🧭 Roadmap

- ✅ Backend completo con Prisma + JWT + Roles.
- ✅ Frontend escritorio con CRUD de empleados y usuarios.
- ✅ Persistencia de sesión y protecciones UI.
- ⏳ Estilos modernos (Tailwind + shadcn/ui).
- ⏳ Empaquetado con Electron Builder.
- ⏳ Publicación de release instalable (.exe / .dmg).

---

## 👨‍💻 Autor

**Cristian Chavez**  
Desarrollador Fullstack · Ingeniero de Sistemas  
📍 Barranquilla, Colombia  

---

## 🪶 Licencia

Este proyecto está licenciado bajo **MIT License**.  
Eres libre de usarlo, modificarlo y distribuirlo, siempre citando la fuente.

