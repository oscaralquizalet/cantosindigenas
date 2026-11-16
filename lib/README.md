# lib/ · Librerías locales (opcional)

Por defecto el geoportal carga **Leaflet** desde internet (unpkg / jsDelivr).
Si quieres que cargue desde tu propio repositorio:

1. Descarga Leaflet 1.9.4 desde https://leafletjs.com/download.html
2. Copia `leaflet.js` y `leaflet.css` en la carpeta `lib/leaflet/`
3. Copia también la carpeta `images/` de Leaflet dentro de `lib/leaflet/`

El archivo `js/config.js` ya busca primero esa copia local.
(Los mapas base y los videos de YouTube siempre necesitan internet.)
