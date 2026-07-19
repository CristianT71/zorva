# Workflow 1 — Pedido y consulta de estado por WhatsApp

Cubre RFN01-RFN06. Es el flujo conversacional con el cliente: recibe el mensaje, interpreta con IA, valida contra el catálogo real, confirma con botones y crea el pedido. También responde "¿cómo va mi pedido?".

Todo llega por el **mismo webhook de WhatsApp**, pero en dos momentos distintos: primero el cliente escribe texto libre, después toca un botón. Por eso el workflow se separa en dos caminos desde el inicio.

## Credenciales / variables necesarias
- **WhatsApp Business Cloud** (credencial nativa de n8n, Meta Cloud API).
- **OpenAI** (para el nodo de IA).
- **Postgres** — misma base de Railway, para guardar el carrito mientras el cliente confirma.
- `BACKEND_URL` — URL del backend NestJS (ej. `https://zorva-api.up.railway.app/api`).
- `N8N_API_KEY` — igual al `N8N_API_KEY` del `.env` del backend. Va como header `x-api-key`.

## Tabla temporal en Postgres
El backend solo guarda pedidos ya confirmados, no carritos en construcción. Crea esta tabla aparte en la misma BD de Railway (no necesita entidad en NestJS, es solo para n8n):

```sql
CREATE TABLE carritos_temporales (
  numero_whatsapp VARCHAR PRIMARY KEY,
  items_json JSONB NOT NULL,
  creado_en TIMESTAMP DEFAULT now()
);
```

---

## Nodo inicial (siempre)

1. **WhatsApp Trigger** — webhook de Meta, suscrito a `messages`.
2. **Switch — "¿Texto o botón?"** — mira `messages[0].type`. Si es `text`, sigue el **Camino A**. Si es `interactive` (el cliente tocó un botón), sigue el **Camino B**.

---

## Camino A — el cliente escribió un mensaje de texto

1. **OpenAI (Chat) + Structured Output Parser** — le pide a la IA que devuelva JSON con `intencion` (`crear_pedido`, `consultar_estado` u `otro`) y, si es `crear_pedido`, la lista `productos: [{nombre, cantidad}]`.
2. **Switch — enrutar por intención** — abre tres ramas:

**Rama "otro"**
- **WhatsApp: responder** — mensaje genérico: "Dime qué producto y cantidad quieres pedir 🙂".

**Rama "consultar_estado"**
- **HTTP Request** — `GET {{BACKEND_URL}}/pedidos/estado-whatsapp?numero_whatsapp={{ $json.from }}`, header `x-api-key`.
- **WhatsApp: responder** — arma el texto con `estado`, `total` y `fecha` de la respuesta.

**Rama "crear_pedido"**
- **HTTP Request en loop** — por cada producto que extrajo la IA: `GET {{BACKEND_URL}}/productos?search={{nombre}}` (público, sin key).
- **Code — validar disponibilidad** — compara la cantidad pedida contra `stock_actual` de cada resultado. Separa en `items_validos` (con `producto_id` y `precio`) e `items_no_disponibles`.
- **IF — ¿todo disponible?**
  - Si falta algo → **WhatsApp: responder** qué producto/cantidad no hay, y el flujo termina ahí.
  - Si todo está disponible → sigue.
- **Postgres — guardar carrito** — upsert en `carritos_temporales` con `numero_whatsapp` e `items_json`.
- **WhatsApp: mensaje interactivo** — texto con el resumen y el total, más tres botones: `Confirmar`, `Agregar más`, `Cancelar` (el `id` de cada botón es esa misma palabra).

---

## Camino B — el cliente tocó un botón

1. **Switch — enrutar por botón** — mira `interactive.button_reply.id`. Tres ramas: `confirmar`, `agregar_mas`, `cancelar`.

**Rama "confirmar"**
- **Postgres — leer carrito** — `SELECT items_json FROM carritos_temporales WHERE numero_whatsapp = ...`.
- **HTTP Request — crear pedido** — `POST {{BACKEND_URL}}/pedidos`, header `x-api-key`. Body:
  ```json
  {
    "canal_origen": "whatsapp",
    "cliente_whatsapp": { "numero_whatsapp": "...", "nombre": "..." },
    "items": [{ "producto_id": "...", "cantidad": 2 }]
  }
  ```
- **Postgres — borrar carrito** — `DELETE FROM carritos_temporales WHERE numero_whatsapp = ...`.
- **WhatsApp: responder** — "¡Listo! Tu pedido #ID quedó registrado, total $X."

**Rama "agregar_mas"**
- **WhatsApp: responder** — "Dime qué más quieres agregar". El siguiente mensaje de texto vuelve a pasar por el Camino A; ver nota abajo sobre cómo no perder lo ya guardado.

**Rama "cancelar"**
- **Postgres — borrar carrito**.
- **WhatsApp: responder** — "Pedido cancelado".

---

## Nota sobre "agregar más"
Para no complicar la primera versión: cuando el Camino A vaya a guardar el carrito (paso "Postgres — guardar carrito"), que primero lea si ya existe uno para ese número y **combine** los items viejos con los nuevos en vez de sobrescribir. Si no alcanza el tiempo, déjalo simple: "agregar más" reinicia el carrito desde cero y se documenta como límite conocido para una v2.
