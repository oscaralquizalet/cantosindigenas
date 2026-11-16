# Geoportal Cantos

Geoportal sobre **música indígena**: videos de YouTube ubicados en un mapa (Leaflet + HTML + CSS + JavaScript, sin servidor ni compilación).

## Cómo abrirlo
- Haz doble clic en `index.html`, o
- Súbelo a GitHub y activa **Settings → Pages → Deploy from a branch → main / (root)**. (Recomendado: algunos navegadores bloquean los videos de YouTube cuando la página se abre como archivo local.)

## Estructura
```
index.html            Estructura de la página (portada, geoportal, créditos)
css/
  base.css            Colores, tipografías, botones, cabecera y pie
  portada.css         Portada, estadísticas y tarjetas informativas
  geoportal.css       Panel de búsqueda, mapa, marcadores, popup y reproductor
js/
  config.js           Ajustes: colores por región, fuentes de Leaflet
  utils.js            Funciones de ayuda
  datos.js            Prepara los datos (miniatura, enlace, texto de búsqueda)
  player.js           Reproductor de YouTube (popup y ventana ampliada)
  filtros.js          Búsqueda, filtros y lista lateral
  mapa.js             Mapa Leaflet, marcadores, agrupación y pantalla completa
  main.js             Arranque de la página
data/
  videos.js           Base de datos: 57 videos (KML + Excel ya combinados)
  fuentes/            Archivos originales (Base.xlsx y Ubicaciones.kml)
lib/                  Copia local opcional de Leaflet (ver lib/README.md)
```

## Cómo agregar un video
Abre `data/videos.js`, copia una línea de la lista, cambia el número `n`, el `id` de YouTube, las coordenadas y los textos.

## Créditos de datos y mapas
Mapas © OpenStreetMap, Esri y CARTO. Los videos pertenecen a sus autores y comunidades.
