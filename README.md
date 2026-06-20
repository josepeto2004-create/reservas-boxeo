🥊 Club de Boxeo — Sistema de Reservas
Aplicación full-stack para gestionar reservas de turnos de entrenamiento.

Estructura del proyecto
boxing-club/
├── backend/          ← API REST (Node.js + Express + PostgreSQL)
│   ├── db/
│   │   ├── pool.js   ← Conexión a la base de datos
│   │   └── init.js   ← Crea las tablas (ejecutar 1 vez)
│   ├── middleware/
│   │   └── auth.js   ← Verificación JWT
│   ├── routes/
│   │   ├── auth.js    ← Login alumno y maestro
│   │   ├── alumnos.js ← CRUD alumnos (solo maestro)
│   │   └── reservas.js← Turnos y reservas
│   ├── server.js     ← Punto de entrada del servidor
│   ├── .env.example  ← Copia esto a .env y rellénalo
│   └── package.json
│
└── frontend/         ← React App
    ├── src/
    │   ├── api.js           ← Instancia Axios con JWT
    │   ├── App.js           ← Router principal
    │   ├── context/AuthContext.js
    │   ├── hooks/useTurnos.js
    │   └── pages/
    │       ├── LoginPage    ← Acceso alumno y maestro
    │       ├── AlumnoPage   ← Reservar/cancelar turnos
    │       └── MaestroPage  ← Gestión completa
    ├── public/index.html
    ├── .env.example
    └── package.json

PASO 1 — Instalar PostgreSQL
Windows

Descarga el instalador desde https://www.postgresql.org/download/windows/
Instala con las opciones por defecto
Apunta el puerto (5432) y la contraseña que pongas al usuario postgres

Mac
bashbrew install postgresql@16
brew services start postgresql@16
Linux (Ubuntu/Debian)
bashsudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

PASO 2 — Crear la base de datos
Abre una terminal y ejecuta:
bash# Entra a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE boxing_club;

# Sal
\q

PASO 3 — Configurar el backend
bash# Ve a la carpeta backend
cd boxing-club/backend

# Instala dependencias
npm install

# Copia el archivo de variables de entorno
cp .env.example .env
Abre .env en VS Code y rellena:
DB_PASSWORD=la_contraseña_que_pusiste_en_postgres
JWT_SECRET=cualquier_frase_larga_y_aleatoria_aqui
MAESTRO_PIN=1234       ← cámbialo por el PIN que quieras
Inicializa las tablas (solo una vez):
bashnpm run db:init
Arranca el servidor:
bashnpm run dev
✅ El backend corre en → http://localhost:3001

PASO 4 — Configurar el frontend
Abre otra terminal y ejecuta:
bash# Ve a la carpeta frontend
cd boxing-club/frontend

# Instala dependencias
npm install

# Copia el .env
cp .env.example .env
El .env del frontend ya viene bien configurado para desarrollo local:
REACT_APP_API_URL=http://localhost:3001/api
Arranca el frontend:
bashnpm start
✅ El frontend corre en → http://localhost:3000

PASO 5 — Probar la aplicación
Abre el navegador en http://localhost:3000
Como alumno:

El maestro primero añade al alumno con su nombre y teléfono
El alumno entra con su número de teléfono

Como maestro:

PIN por defecto: 1234 (cámbialo en el .env)
Puedes añadir alumnos, ver los turnos y gestionar reservas


PASO 6 — Subir a producción (opcional)
Backend → Railway (gratis, recomendado)

Ve a https://railway.app y crea cuenta
New Project → Deploy from GitHub repo → selecciona la carpeta backend
Add PostgreSQL plugin → Railway te da la DATABASE_URL automáticamente
En Variables añade: JWT_SECRET, MAESTRO_PIN, FRONTEND_URL
Railway te da una URL tipo https://tu-app.railway.app

Frontend → Vercel (gratis)

Ve a https://vercel.com
Import git repo → selecciona la carpeta frontend
En Environment Variables añade:
REACT_APP_API_URL=https://tu-app.railway.app/api
Vercel te da un dominio gratis tipo boxing-club.vercel.app

Dominio propio

Compra un dominio en Namecheap, GoDaddy, o Cloudflare (~10€/año)
En Vercel: Settings → Domains → añade tu dominio
Apunta el DNS de tu dominio a Vercel siguiendo sus instrucciones


Comandos rápidos
ComandoQué hacenpm run dev (backend)Arranca API con recarga automáticanpm start (frontend)Arranca React en modo desarrollonpm run db:initCrea las tablas en PostgreSQLnpm run build (frontend)Compila para producción