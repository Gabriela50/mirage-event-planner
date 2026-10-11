# MIRAGE — Event Planner

MIRAGE es una aplicación web para organizar eventos desde un mismo espacio. Incluye una interfaz bilingüe, gestión de eventos, invitados, presupuesto, historial y un asistente de recomendaciones.

## Tecnologías

- React y Vite para la interfaz.
- Tailwind CSS para los estilos.
- Node.js y Express para la API.
- PostgreSQL para los datos del servidor.
- JSON Web Tokens (JWT) para la autenticación.
- Vitest para las pruebas automatizadas.

## Requisitos previos

- Node.js y npm.
- PostgreSQL instalado y en ejecución.
- Una base de datos configurada para MIRAGE.
- Una clave de Gemini si se desea utilizar el asistente de IA.

## Instalación

Clona el repositorio y entra en la carpeta:

```bash
git clone git@github.com:Gabriela50/mirage-event-planner.git
cd mirage-event-planner
npm install
```

Crea tu archivo local de configuración a partir de la plantilla:

```bash
cp .env.example .env
```

Completa las variables de entorno con la configuración de tu equipo. No publiques el archivo `.env` ni sus claves.

## Ejecución

En una primera Terminal, inicia la API:

```bash
npm run server:dev
```

En una segunda Terminal, entra a la carpeta del proyecto e inicia la interfaz:

```bash
cd ~/proyectos/mirage-event-planner
npm run dev
```

Abre en el navegador la dirección local que indique Vite.

## Comprobaciones

Verificar que las pruebas automatizadas pasan:

```bash
npm test
```

Comprobar que la aplicación compila:

```bash
npm run build
```

La API dispone de estos endpoints de comprobación:

- `GET /api/health`: estado del servidor.
- `GET /api/db-check`: conexión y datos básicos de PostgreSQL.

## Estructura principal

- `src/`: interfaz y lógica del cliente.
- `src/components/`: componentes de la interfaz.
- `src/services/`: servicios de almacenamiento y comunicación con la API.
- `src/i18n/`: traducciones.
- `server/`: API, rutas, autenticación y conexión a PostgreSQL.
- `tests/`: pruebas automatizadas.
- `README.md`: documentación del proyecto.

## Seguridad

No subas contraseñas, tokens ni claves de servicios al repositorio. Usa variables de entorno locales y mantén `.env` fuera del control de versiones.

## Repositorio

https://github.com/Gabriela50/mirage-event-planner
