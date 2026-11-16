/* ============================================================
   player.js · Reproductor de YouTube
   - Reproducción dentro del popup del mapa (clic en la miniatura)
   - Reproductor ampliado (ventana modal)
   ============================================================ */
Cantos.player = (function () {
  const { $, esc } = Cantos.utils;

  /* Devuelve el <iframe> de YouTube para un video */
  function embed(v, autoplay) {
    const q = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' });
    if (autoplay) q.set('autoplay', '1');
    if (v.inicio) q.set('start', v.inicio);
    return `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?${q}" title="${esc(v.titulo)}" ` +
      `allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen" ` +
      `allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }

  const buscar = n => Cantos.videos.find(x => x.n == n);

  /* ---------- Ventana ampliada ---------- */
  const modal = $('#modal'), mPlayer = $('#mPlayer');

  function openModal(v) {
    mPlayer.className = 'mplayer' + (v.short ? ' short' : '');
    mPlayer.querySelectorAll('iframe').forEach(f => f.remove());
    mPlayer.insertAdjacentHTML('beforeend', embed(v, true));
    $('#mTitle').textContent = v.titulo;
    $('#mYt').href = v.url;
    modal.classList.add('open');
    $('#mClose').focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    mPlayer.querySelectorAll('iframe').forEach(f => f.remove());
  }
  $('#mClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  /* ---------- Reproducir dentro del popup ---------- */
  function reproducirEnPopup(pv) {
    const v = buscar(pv.dataset.n);
    if (!v) return;
    pv.classList.add('playing');
    pv.removeAttribute('role');
    pv.innerHTML = embed(v, true);
  }

  /* Los clics se escuchan en el documento (fase de captura) porque Leaflet
     detiene la propagación de eventos dentro de los popups. */
  document.addEventListener('click', e => {
    const t = e.target;
    if (!t || !t.closest) return;

    const ampliar = t.closest('[data-expand]');
    if (ampliar) {
      const v = buscar(ampliar.dataset.expand);
      if (Cantos.mapa) Cantos.mapa.cerrarPopup();   /* evita que suenen dos videos a la vez */
      if (v) openModal(v);
      return;
    }
    const pv = t.closest('.cp .pv');
    if (pv && !pv.classList.contains('playing')) reproducirEnPopup(pv);
  }, true);

  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pv') && !e.target.classList.contains('playing')) {
      e.preventDefault();
      reproducirEnPopup(e.target);
    }
  }, true);

  return { embed, openModal, closeModal };
})();
