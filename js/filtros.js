/* ============================================================
   filtros.js · Búsqueda, filtros y lista lateral de videos
   ============================================================ */
Cantos.filtros = (function () {
  const { $, esc, norm, fmt, plural } = Cantos.utils;
  const VIDEOS = Cantos.videos;

  const state = { q: '', region: '', pais: '', pueblo: '', labels: false, filtered: VIDEOS.slice() };

  /* ---------- Listas desplegables ---------- */
  function llenar(selector, clave, orden) {
    const cuenta = {};
    VIDEOS.forEach(v => { cuenta[v[clave]] = (cuenta[v[clave]] || 0) + 1; });
    const claves = (orden || Object.keys(cuenta).sort((a, b) => a.localeCompare(b, 'es'))).filter(k => cuenta[k]);
    const el = $(selector);
    el.innerHTML = '<option value="">' + (clave === 'region' ? 'Todas' : 'Todos') + '</option>' +
      claves.map(k => `<option value="${esc(k)}">${esc(k)} (${cuenta[k]})</option>`).join('');
  }
  llenar('#fRegion', 'region', Cantos.config.REGIONS.map(r => r[0]));
  llenar('#fPais', 'pais');
  llenar('#fPueblo', 'pueblo');

  /* ---------- Filtrado ---------- */
  function cumple(v) {
    const s = state;
    if (s.q && !s.q.split(/\s+/).every(t => v.hay.includes(t))) return false;
    if (s.region && v.region !== s.region) return false;
    if (s.pais && v.pais !== s.pais) return false;
    if (s.pueblo && v.pueblo !== s.pueblo) return false;
    return true;
  }
  function aplicar() {
    state.filtered = VIDEOS.filter(cumple);
    renderLista();
    if (Cantos.mapa && Cantos.mapa.listo()) Cantos.mapa.renderMarkers();
  }
  function limpiar() {
    Object.assign(state, { q: '', region: '', pais: '', pueblo: '' });
    $('#q').value = '';
    ['#fRegion', '#fPais', '#fPueblo'].forEach(s => { $(s).value = ''; });
    aplicar();
    if (Cantos.mapa) Cantos.mapa.cerrarPopup();
  }

  /* ---------- Lista lateral ---------- */
  function renderLista() {
    const f = state.filtered;
    $('#count').textContent = `Mostrando ${f.length} de ${VIDEOS.length} ${plural(VIDEOS.length, 'video', 'videos')}`;
    $('#list').innerHTML = f.length ? f.map(v => `
      <li><button data-n="${v.n}" title="Ver en el mapa">
        <img src="${v.thumb}" alt="" loading="lazy">
        <span><span class="t">${esc(v.titulo)}</span>
        <span class="m"><span class="dot" style="--c:${Cantos.colorDe(v)}"></span>${esc(v.pueblo)} · ${esc(v.pais)} · ${fmt(v.seg)}</span></span>
      </button></li>`).join('')
      : '<li class="empty">No hay videos con esos filtros.<br>Prueba limpiando alguno.</li>';
  }

  /* ---------- Eventos ---------- */
  [['#fRegion', 'region'], ['#fPais', 'pais'], ['#fPueblo', 'pueblo']].forEach(([sel, clave]) => {
    $(sel).addEventListener('change', e => { state[clave] = e.target.value; aplicar(); });
  });
  let temporizador;
  $('#q').addEventListener('input', e => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { state.q = norm(e.target.value).trim(); aplicar(); }, 180);
  });
  $('#reset').addEventListener('click', limpiar);
  $('#showLabels').addEventListener('change', e => {
    state.labels = e.target.checked;
    if (Cantos.mapa && Cantos.mapa.listo()) Cantos.mapa.renderMarkers();
  });

  /* Panel plegable (útil en celulares) */
  $('#togglePanel').addEventListener('click', () => {
    const colapsado = $('#panel').classList.toggle('collapsed');
    $('#togglePanel').textContent = colapsado ? 'Mostrar' : 'Ocultar';
    $('#togglePanel').setAttribute('aria-expanded', !colapsado);
    if (Cantos.mapa) setTimeout(Cantos.mapa.invalidar, 50);
  });

  /* Clic en un elemento de la lista */
  $('#list').addEventListener('click', e => {
    const b = e.target.closest('button[data-n]');
    if (!b) return;
    const v = VIDEOS.find(x => x.n == b.dataset.n);
    if (Cantos.mapa && Cantos.mapa.listo()) {
      Cantos.mapa.enfocar(v);
      if (window.matchMedia('(max-width:900px)').matches) {
        $('#panel').classList.add('collapsed');
        $('#togglePanel').textContent = 'Mostrar';
        setTimeout(Cantos.mapa.invalidar, 50);
      }
    } else {
      Cantos.player.openModal(v);   /* sin mapa, se reproduce en la ventana */
    }
  });

  return { state, aplicar, limpiar, renderLista };
})();
