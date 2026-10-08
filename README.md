# Museo-virtual-
exposición y venta de todo tipo de antigüedades 

## RetroXplay · Museo Virtual de Antigüedades

Sitio web estático (HTML/CSS/JS, sin compilación) con la colección de antigüedades, objetos vintage y coleccionables de **RetroXplay**: galería con filtros y buscador, ficha de cada pieza con fotos, reseña histórica y valorización referencial por estado (excelente / bueno / regular), botón de consulta por WhatsApp y una guía educativa sobre cómo se valoran las antigüedades.

**Sitio:** https://dacam32-del.github.io/Museo-virtual-/

### Estructura
- `index.html`: portada, colección y ficha de cada pieza (enlace directo: `index.html#RX-005`)
- `valoracion.html`: ¿Cómo se valoran las antigüedades?
- `data/piezas.json`: datos de todas las piezas (fuente única)
- `images/full/` (máx. 1200 px) e `images/thumb/` (máx. 400 px)
- `css/`, `js/`

### Agregar una pieza
1. Copia las fotos a `images/full/` y `images/thumb/` como `rx-0XX-1.jpg`, `rx-0XX-2.jpg`…
2. Agrega un objeto a `data/piezas.json` con `id`, `nombre`, `categoria`, `grupo`, `origen`, `materiales`, `marcas`, `estado`, `descripcion`, `fotos` y `tasado`. Si está valorizada (`"tasado": true`), agrega también `estado_pieza` (Excelente/Bueno/Regular), `precios` (`{"excelente":[min,max],"bueno":[min,max],"regular":[min,max]}` en CLP) y `factores`.

Los precios son estimaciones referenciales basadas en ventas comparables de mercado; no constituyen una tasación certificada.
