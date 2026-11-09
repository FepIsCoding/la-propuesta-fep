# Proyecto Fep — Bambu Lab A1 Mini + Claude Pro

Proyecto Next.js con una landing page y una API de respuestas familiares almacenadas en Vercel Blob.

## Requisitos

- Node.js 20 o superior
- npm
- Una cuenta de Vercel
- Un Blob Store de Vercel para guardar las respuestas

## Ejecutar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrí http://localhost:3000.

Para que la API de votos funcione localmente, configurá `BLOB_READ_WRITE_TOKEN` en `.env.local` con un token de Vercel Blob. No compartas ni subas ese token a GitHub.

## Publicar en GitHub

1. Creá un repositorio nuevo en GitHub.
2. Descomprimí este proyecto.
3. Subí todos los archivos y carpetas, excepto secretos y `node_modules`.
4. En Vercel, importá el repositorio.
5. Creá o vinculá un Blob Store.
6. Agregá `BLOB_READ_WRITE_TOKEN` en las variables de entorno de Vercel.
7. Desplegá desde Vercel.

## Estructura

```text
.
├── src/
│   └── app/
│       ├── api/
│       │   └── votes/
│       │       └── route.js
│       ├── globals.css
│       ├── layout.js
│       └── page.js
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## Importante sobre los votos y la seguridad

- La web usa `localStorage` para recordar el voto en el navegador, pero eso **no impide** que una persona pueda enviar solicitudes directas a la API y votar varias veces.
- La API conserva el comportamiento del proyecto publicado, incluido ignorar el registro más antiguo (registro de prueba).
- Esta entrega es una copia reconstruida de los archivos de la versión publicada, con encabezados HTTP básicos y manejo de error más explícito. **No es una auditoría de seguridad terminada** y no incluye rate limiting persistente ni verificación de identidad.
- Antes de usar los votos como una encuesta resistente a abuso, agregá un mecanismo de limitación de solicitudes y una estrategia de prevención de duplicados adecuada al almacenamiento elegido.
- Nunca subas `.env.local`, tokens, claves API ni credenciales a GitHub.
