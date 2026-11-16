/* ============================================================
   config.js · Ajustes generales del geoportal
   Aquí se cambian colores de regiones, fuentes de Leaflet, etc.
   ============================================================ */
window.Cantos = window.Cantos || {};

Cantos.config = {
  /* Regiones: [nombre, color del borde de los marcadores] */
  REGIONS: [
    ['Bolivia', '#c8553d'],
    ['Sudamérica', '#2a9d8f'],
    ['Norteamérica y Mesoamérica', '#7b2d5b'],
    ['Ártico', '#4a90c2'],
    ['África', '#f2a541'],
    ['Asia y Oceanía', '#8a9a2b']
  ],

  /* Tamaño (en píxeles) de la celda para agrupar marcadores cercanos */
  CELL: 64,

  /* Vista inicial del mapa si no se ajusta a todos los puntos */
  VISTA_INICIAL: { centro: [-8, -62], zoom: 3 },

  /* Dónde se busca Leaflet. Se prueba en orden hasta que una funcione.
     La primera es una copia local opcional (carpeta lib/leaflet/). */
  LEAFLET_SOURCES: [
    { css: 'lib/leaflet/leaflet.css', js: 'lib/leaflet/leaflet.js' },
    { css: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', js: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js' },
    { css: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css', js: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js' }
  ]
};
