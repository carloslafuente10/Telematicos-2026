# Despliegue gratuito: Vercel + Render + Neon

Este procedimiento crea una instalacion nueva para demostracion del proyecto.
Los datos de tu PostgreSQL local no se copian automaticamente.

| Componente | Plataforma | Plan |
| --- | --- | --- |
| React + Vite | Vercel | Hobby, para uso personal no comercial |
| Express en Docker | Render | Free |
| PostgreSQL | Neon | Free |

En local, Docker Compose sigue levantando los tres servicios. En la nube,
Render construye solo el Dockerfile del backend, Vercel compila el frontend
y Neon administra PostgreSQL. Este despliegue no ejecuta el Compose completo.

## 1. Preparar GitHub y las cuentas

1. Crear cuentas en https://neon.com y https://render.com; puedes usar GitHub.
2. Subir los archivos de despliegue a una rama del repositorio:
   `render.yaml`, `urbantic/frontend/vercel.json`, esta guia y su enlace en README.
3. Usar esa misma rama al importar el proyecto en Vercel y Render.
   La rama local al preparar esta guia era `david-trabajo`; comprueba que los
   archivos esten en la rama remota elegida.

No subir `.env`, contrasenas ni cadenas de conexion a GitHub.

## 2. Crear e inicializar PostgreSQL en Neon

1. Crear un proyecto `urbantic` en el plan Free. Elegir PostgreSQL 16 si esta
   disponible y una region cercana a la que se usara en Render.
2. Abrir el SQL Editor de la base seleccionada.
3. Desde `urbantic/backend` ejecutar este comando local (requiere `npm ci`):

```powershell
node scripts/prepare-neon-seed.js
```

4. Copiar todo el contenido de `database/init/neon_seed.local.sql` en el SQL
   Editor de Neon y pulsar **Run**. El comando genera un hash nuevo y actualiza
   tambien las cuentas demo si ya existian. La contrasena compartida se guarda
   en `database/init/neon_password.local.txt`. Ambos archivos se excluyen de Git;
   no compartir ni subir esos archivos. El SQL original tiene la contrasena
   publica `Password123!`, incluso para el administrador: no usarlo en Neon.

5. En **Connect**, copiar la cadena de conexion de esa misma base. Conservar
   los parametros SSL que entrega Neon, incluido `sslmode=require`.
   Guardarla para `DATABASE_URL` en Render; no pegarla en el chat.

El backend crea las tablas de reportes y categorias al arrancar. Las tablas
`users` y `roles` deben existir primero: actualmente las crea el SQL anterior,
que Docker Compose ejecuta automaticamente solo en la base local.

## 3. Crear el frontend en Vercel

Importar el repositorio de GitHub en tu cuenta existente y configurar:

| Campo | Valor |
| --- | --- |
| Root Directory | `urbantic/frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |

Seleccionar la rama con los archivos de despliegue. Si el repositorio no aparece,
dar acceso a Vercel desde la integracion de GitHub o pedir acceso al propietario.

Este primer despliegue permite obtener la URL estable del proyecto, por ejemplo
`https://tu-proyecto.vercel.app`. La API se conecta en el paso 5; durante este
paso el login aun no funcionara. El `vercel.json` permite recargar rutas como
`/login` y `/admin/reportes` sin que Vercel responda 404.

## 4. Desplegar el backend en Render

1. Elegir **New > Blueprint**, conectar el repositorio y seleccionar la rama
   que contiene `render.yaml` en la raiz.
2. Comprobar que `urbantic-api` tenga el plan **Free**.
3. Completar los valores que solicita el Blueprint:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Cadena de Neon con sus parametros SSL |
| `FRONTEND_URL` | URL estable de Vercel, sin `/` final ni rutas |

El Blueprint genera `JWT_SECRET` automaticamente. El servidor ya acepta `PORT`,
que Render proporciona; no hace falta definir `BACKEND_PORT` en Render.

4. Desplegar y esperar a que el servicio este disponible.
5. Abrir `https://TU-SERVICIO.onrender.com/api/health`. Debe devolver
   `success: true` y `data.status: "ok"`.

Si falla con `relation "users" does not exist`, ejecutar primero el SQL del
paso 2 en la misma base indicada por `DATABASE_URL` y volver a desplegar.

## 5. Conectar Vercel con Render

En Vercel, abrir **Settings > Environment Variables** y agregar para Production:

```text
VITE_API_URL=https://TU-SERVICIO.onrender.com/api
```

Reemplazar el dominio por el real y conservar `/api`. Hacer **Redeploy**:
Vite incorpora esta variable al compilar, por lo que cambiarla sin recompilar
no actualiza la aplicacion. Usar la URL estable de produccion para probar;
las URLs temporales de preview no coinciden con el origen CORS configurado.

`DATABASE_URL` y `JWT_SECRET` pertenecen solo a Render. No agregarlos al frontend.

## 6. Verificar el despliegue

1. Abrir `/api/health` en Render y esperar si el servicio estaba suspendido.
2. Entrar al frontend y recargar `/login` directamente.
3. Iniciar sesion con cada usuario demo y las nuevas contrasenas del paso 2.
4. Registrar un ciudadano y crear un reporte con una imagen pequena.
5. Asignarlo desde el administrador y revisarlo desde el tecnico.
6. Volver a desplegar el backend y comprobar que el reporte persiste en Neon.

Si aparece un error CORS, comprobar que `FRONTEND_URL` coincida exactamente
con el origen de la pagina abierta, incluido `https://` y sin barra final.
Si el navegador intenta llamar a `localhost:4000`, revisar `VITE_API_URL`
en el entorno correcto de Vercel y volver a desplegar.

## Limites de los planes gratuitos

- Render suspende el backend tras 15 minutos sin trafico. La primera solicitud
  posterior puede tardar alrededor de un minuto. Hay cuotas mensuales de uso.
- Neon Free no tiene un vencimiento de prueba, pero si limites de almacenamiento
  y computo. Las fotos de esta app se guardan en PostgreSQL como texto/base64,
  por lo que conviene usar imagenes pequenas para la demostracion.
- Render PostgreSQL Free caduca a los 30 dias; por eso aqui se usa Neon.
- Vercel Hobby esta orientado a proyectos personales no comerciales.

Mantener los planes gratuitos y revisar las cuotas en sus paneles antes de
activar ampliaciones de pago. Los planes pueden cambiar.

Documentacion oficial:

- [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel Hobby](https://vercel.com/docs/plans/hobby)
- [Render Free](https://render.com/docs/free)
- [Blueprint de Render](https://render.com/docs/blueprint-spec)
- [Neon Free](https://neon.com/pricing)
- [Node.js con Neon](https://neon.com/docs/guides/node)
