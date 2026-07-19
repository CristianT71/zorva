# Workflow 3 — Alerta de stock bajo

Cubre RF09 desde el lado de notificación (el backend ya expone el filtro; este workflow lo consume y avisa). Tarea programada que revisa el catálogo y avisa al admin solo si hay productos por debajo del stock mínimo.

## Credenciales / variables necesarias
- **WhatsApp Business Cloud** (misma credencial de los workflows 1 y 2).
- `BACKEND_URL` — URL del backend.
- `ADMIN_WHATSAPP_NUMBER` — número del administrador.

No necesita `N8N_API_KEY`: `GET /productos` es público.

## Nodos

| # | Nodo | Tipo | Configuración / propósito |
|---|------|------|---------------------------|
| 1 | **Schedule Trigger** | Schedule Trigger | Cron, ej. `0 8 * * *` (una vez en la mañana) — o cada 6 horas si el negocio rota inventario rápido. |
| 2 | **Consultar stock bajo** | `HTTP Request` | GET `{{BACKEND_URL}}/productos?stock_bajo=true`. Sin autenticación. |
| 3 | **¿Hay productos?** | `IF` | Condición: `{{ $json.length > 0 }}`. Si no hay nada, el flujo termina ahí (rama falsa sin nodos). |
| 4 | **Formatear lista** | `Code` | Recorre el array y arma un texto tipo lista: `"⚠️ Stock bajo:\n- Frijol Cargamanto: 8/15\n- Mantequilla Ranchera: 3/8"` (usa `stock_actual`/`stock_minimo` de cada producto). |
| 5 | **Enviar alerta** | `WhatsApp` (Send Message) | Destino `ADMIN_WHATSAPP_NUMBER`, cuerpo = texto del nodo anterior. |

## Notas
- Es el workflow más chico de los tres — dos nodos de lógica y un envío. Bien para hacerlo primero y validar que la credencial de WhatsApp y `BACKEND_URL` están bien configuradas antes de meterte con el Workflow 1 (que es el complejo).
- Si quieres evitar spam (que mande la misma alerta todos los días aunque nadie reabastezca), puedes agregar un nodo `Postgres` que compare contra la última alerta enviada y solo notifique si la lista cambió. Es opcional, no lo pongas si no da el tiempo.
