# Gestión de Peticiones y Solicitudes
**Alcaldía de Manizales** — Node.js + MongoDB Atlas + Vercel

Aplicación web para registrar y gestionar:
- **Peticiones** (respuesta con oficio)
- **Solicitudes** (respuesta con resolución)

Los PDFs se almacenan en base64 dentro de MongoDB (compatible con Vercel).

---

## Estructura

```
gestion-peticiones/
├── server.js           # Express + adaptación serverless
├── vercel.json         # Configuración de despliegue
├── package.json
├── .env                # Variables locales (NO subir a Git)
├── .env.example
├── models/
│   ├── Peticion.js
│   └── Solicitud.js
├── routes/
│   ├── peticiones.js
│   └── solicitudes.js
└── public/
    └── index.html      # Frontend
```

---

## Desarrollo local

1. Instalar dependencias:
```bash
cd gestion-peticiones
npm install
```

2. El archivo `.env` ya tiene la conexión configurada.

3. Ejecutar:
```bash
npm start
```

4. Abrir: http://localhost:3000

---

## Despliegue en Vercel — Paso a paso

### 1. Preparar el repositorio en GitHub

```bash
cd gestion-peticiones
git init
git add .
git commit -m "Aplicación Gestión Peticiones y Solicitudes"
```

Crea un repositorio nuevo en GitHub (privado o público) y súbelo:

```bash
git remote add origin https://github.com/TU_USUARIO/gestion-peticiones.git
git branch -M main
git push -u origin main
```

> **Importante:** el archivo `.env` está en `.gitignore`. **Nunca** subas la contraseña a GitHub.

### 2. Crear proyecto en Vercel

1. Entra a [https://vercel.com](https://vercel.com) e inicia sesión (con GitHub es lo más fácil).
2. Clic en **Add New… → Project**.
3. Importa el repositorio `gestion-peticiones`.
4. En **Framework Preset** deja **Other**.
5. En **Root Directory** deja el valor por defecto.
6. **NO** hagas Deploy todavía. Primero configura las variables de entorno.

### 3. Configurar variable de entorno en Vercel

1. En la pantalla de configuración del proyecto (o después en **Settings → Environment Variables**):
2. Agrega la siguiente variable:

| Name       | Value                                                                 | Environments      |
|------------|-----------------------------------------------------------------------|-------------------|
| `MONGO_URI`| `mongodb+srv://paulrichter3_db_user:20VMGN11Yl7DfwgN@cluster0.m354wyr.mongodb.net/gestion_peticiones?retryWrites=true&w=majority` | Production, Preview, Development |

3. Guarda.

### 4. Permitir acceso desde Vercel a MongoDB Atlas

1. Entra a [MongoDB Atlas](https://cloud.mongodb.com).
2. Ve a **Network Access** → **Add IP Address**.
3. Elige **Allow Access from Anywhere** (`0.0.0.0/0`)  
   (necesario porque Vercel usa IPs dinámicas).
4. Confirma.

### 5. Desplegar

1. Vuelve a Vercel y haz clic en **Deploy**.
2. Espera 1–2 minutos.
3. Al terminar te dará una URL del tipo:  
   `https://gestion-peticiones-xxxx.vercel.app`

### 6. Verificar

Abre la URL y comprueba:
- Que aparece el indicador verde **MongoDB conectado**.
- Que puedes crear una petición y una solicitud de prueba.
- Que el PDF se puede ver y descargar.

---

## Actualizaciones futuras

Cada vez que hagas `git push` a la rama `main`, Vercel volverá a desplegar automáticamente.

```bash
git add .
git commit -m "Mejora X"
git push
```

---

## Notas importantes

- Tamaño máximo de PDF: **8 MB**.
- Los PDFs se guardan dentro de MongoDB (base64). Para muchos documentos pesados considera más adelante migrar a Vercel Blob o S3.
- La base de datos se llama `gestion_peticiones`.
- El frontend y la API corren en el mismo dominio de Vercel.
