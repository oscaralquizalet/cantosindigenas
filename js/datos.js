/* ============================================================
   datos.js · Prepara los datos de data/videos.js
   Agrega miniatura, enlace y texto de búsqueda a cada video.
   ============================================================ */
(function () {
  const { norm } = Cantos.utils;
  const COLORES = Object.fromEntries(Cantos.config.REGIONS);

  VIDEOS.forEach(v => {
    v.thumb = `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`;
    v.url = v.short
      ? `https://www.youtube.com/shorts/${v.id}`
      : `https://www.youtube.com/watch?v=${v.id}` + (v.inicio ? `&t=${v.inicio}s` : '');
    v.hay = norm([v.titulo, v.pais, v.pueblo, v.region].join(' '));
  });

  Cantos.videos = VIDEOS;
  Cantos.colorDe = v => COLORES[v.region] || '#555555';
})();
