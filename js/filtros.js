/* ============================================================
   filtros.js · Búsqueda, filtros y lista lateral de videos
   Filtros: Buscar · Macrorregión · Área ecocultural · País · Pueblo
   Los desplegables se llenan solos con los datos de data/videos.js y
   funcionan en cascada: al elegir una macrorregión, los de abajo (área,
   país y pueblo) solo muestran lo que existe en ella.
   ============================================================ */
Cantos.filtros = (function () {
  const { $, esc, norm, fmt, plural } = Cantos.utils;
  const VIDEOS = Cantos.videos;

  /* Orden en que aparecen las macrorregiones (las nuevas van al final) */
  const ORDEN_MACRO = ['América del Sur', 'Mesoamérica y Norteamérica', 'Ártico', 'África', 'Asia y Oceanía'];

  /* Filtros desplegables, en el orden del panel */
  const FILTROS = [
    { sel: '#fMacro',  clave: 'macro',  todos: 'Todas', orden: ORDEN_MACRO },
    { sel: '#fArea',   clave: 'area',   todos: 'Todas' },
    { sel: '#fPais',   clave: 'pais',   todos: 'Todos' },
    { sel: '#fPueblo', clave: 'pueblo', todos: 'Todos' }
  ];

  const state = { q: '', macro: '', area: '', pais: '', pueblo: '', labels: false, filtered: VIDEOS.slice() };

  /* ¿El video cumple la búsqueda y los primeros "hasta" filtros del panel? */
  function cumple(v, hasta) {
    if (state.q && !state.q.split(/\s+/).every(t => v.hay.includes(t))) return false;
    return FILTROS.slice(0, hasta).every(f => !state[f.clave] || v[f.clave] === state[f.clave]);
  }

  /* Rellena cada desplegable con las opciones que existen (y su cantidad) según los
     filtros que tiene ARRIBA: Macrorregión → Área → País → Pueblo.
     Si una selección ya no corresponde, se limpia sola. */
  function actualizarOpciones() {
    FILTROS.forEach((f, i) => {
      const cuenta = {};
      VIDEOS.forEach(v => { if (cumple(v, i)) cuenta[v[f.clave]] = (cuenta[v[f.clave]] || 0) + 1; });
      if (state[f.clave] && !cuenta[state[f.clave]]) state[f.clave] = '';
      const pos = k => { const j = (f.orden || []).indexOf(k); return j < 0 ? 99 : j; };
      const claves = Object.keys(cuenta).sort(f.orden ? (x, y) => pos(x) - pos(y) || x.localeCompare(y, 'es') : (x, y) => x.localeCompare(y, 'es'));
      const el = $(f.sel);
      el.innerHTML = `<option value="">${f.todos}</option>` + claves.map(k => `<option value="${esc(k)}">${esc(k)} (${cuenta[k]})</option>`).join('');
      el.value = state[f.clave];
    });
  }

  function aplicar() {
    actualizarOpciones();
    state.filtered = VIDEOS.filter(v => cumple(v, FILTROS.length));
    renderLista();
    if (Cantos.mapa && Cantos.mapa.listo()) Cantos.mapa.renderMarkers();
  }

  function limpiar() {
    Object.assign(state, { q: '', macro: '', area: '', pais: '', pueblo: '' });
    $('#q').value = '';
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
  FILTROS.forEach(f => {
    $(f.sel).addEventListener('change', e => { state[f.clave] = e.target.value; aplicar(); });
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

  actualizarOpciones();   /* llena los desplegables al cargar */

  return { state, aplicar, limpiar, renderLista };
})();