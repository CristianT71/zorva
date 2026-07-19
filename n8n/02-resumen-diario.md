# Workflow 2 — Resumen diario de ventas al admin

Cubre RF15 / RFN07. Tarea programada, sin interacción del cliente: cada noche le manda al número de WhatsApp del administrador un resumen de cómo fue el día.

## Credenciales / variables necesarias
- **WhatsApp Business Cloud** (misma credencial del Workflow 1).
- `BACKEND_URL` — URL del backend.
- `N8N_API_KEY` — igual al del backend, header `x-api-key`.
- `ADMIN_WHATSAPP_NUMBER` — número de WhatsApp del administrador que recibe el resumen.

## Nodos

| # | Nodo | Tipo | Configuración / propósito |
|---|------|------|---------------------------|
| 1 | **Schedule Trigger** | Schedule Trigger | Cron diario, ej. `0 20 * * *` (8:00 p.m., ajusta a la hora de cierre del negocio). |
| 2 | **Pedir resumen** | `HTTP Request` | GET `{{BACKEND_URL}}/dashboard/resumen-diario`. Header `x-api-key: {{N8N_API_KEY}}`. |
| 3 | **Formatear mensaje** | `Code` o `Set` | Arma el texto a partir de la respuesta: `fecha`, `total_ventas_dia`, `pedidos_totales`, `pedidos_por_canal` (whatsapp vs web), `producto_estrella`. Ejemplo de salida: `"📊 Resumen 18/07: $X en ventas, N pedidos (M por WhatsApp, K web). Producto estrella: Y."` |
| 4 | **Enviar por WhatsApp** | `WhatsApp` (Send Message) | Destino `ADMIN_WHATSAPP_NUMBER`, cuerpo = texto del nodo anterior. |

## Manejo de errores (RNF05)
Agrega un **Error Trigger** workflow aparte (o activa "Error Workflow" en la configuración de este workflow) que capture fallas del `HTTP Request` (ej. backend caído) y mande una alerta simple — puede ser otro mensaje de WhatsApp al admin o, más simple aún, un nodo que escriba el error en una tabla `logs_n8n` de Postgres para revisarlo después. No hace falta un workflow separado por cada posible falla, con uno genérico que loguee `workflow`, `nodo`, `mensaje_error`, `fecha` alcanza.

## Notas
- Es intencionalmente el workflow más simple de los tres: un solo trigger, sin ramas.
- Si más adelante quieres el resumen también por semana/mes, reutiliza el mismo patrón apuntando a `GET /dashboard/estadisticas?periodo=semana|mes` (ese sí requiere JWT de admin, no API key — tocaría resolver login de servicio aparte si se usa).
