/* ============================================================
   main.js · Arranque de la página (menú, portada, lista y mapa)
   ============================================================ */
(function () {
  const { $ } = Cantos.utils;
  const VIDEOS = Cantos.videos;

  /* Menú en celulares */
  $('#menuBtn').addEventListener('click', () => {
    const abierto = $('#mainNav').classList.toggle('open');
    $('#menuBtn').setAttribute('aria-expanded', abierto);
  });
  $('#mainNav').addEventListener('click', e => { if (e.target.tagName === 'A') $('#mainNav').classList.remove('open'); });

  /* Ecualizador decorativo de la portada */
  (function () {
    const caja = $('#eq');
    for (let i = 0; i < 44; i++) {
      const s = document.createElement('span');
      s.style.setProperty('--h', (25 + Math.round(Math.abs(Math.sin(i * .55) + Math.sin(i * .21)) * 38)) + '%');
      s.style.animationDelay = (i * 0.07) + 's';
      caja.appendChild(s);
    }
  })();

  /* Estadísticas de la portada (se calculan solas desde los datos) */
  (function () {
    const poner = (k, v) => { const e = document.querySelector(`[data-s="${k}"]`); if (e) e.textContent = v; };
    poner('videos', VIDEOS.length);
    poner('pueblos', new Set(VIDEOS.map(v => v.pueblo)).size);
    poner('paises', new Set(VIDEOS.map(v => v.pais)).size);
    poner('horas', (VIDEOS.reduce((a, v) => a + v.seg, 0) / 3600).toFixed(1).replace('.', ','));
  })();

  /* Lista lateral y mapa */
  Cantos.filtros.renderLista();
  Cantos.mapa.arrancar();
})();
