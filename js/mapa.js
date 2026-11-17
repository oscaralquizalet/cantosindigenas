/* ============================================================
   mapa.js · Mapa Leaflet, marcadores con miniatura, agrupación,
   mapas base y botón de pantalla completa
   ============================================================ */
Cantos.mapa = (function () {
  const { $, esc, fmt } = Cantos.utils;
  const cfg = Cantos.config;
  const state = Cantos.filtros.state;

  let L = null, map = null, grupo = null, marcadores = {}, capas = {}, baseActual = 'calles';

  /* ---------- Carga de Leaflet (copia local o CDN) ---------- */
  function cargarCss(href) {
    return new Promise(res => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href;
      l.onload = l.onerror = () => res();
      document.head.appendChild(l);
      setTimeout(res, 3000);
    });
  }
  function cargarJs(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => window.L ? res() : rej();
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  async function cargarLeaflet() {
    for (const f of cfg.LEAFLET_SOURCES) {
      try { await cargarCss(f.css); await cargarJs(f.js); return true; } catch (e) { /* prueba la siguiente */ }
    }
    return false;
  }

  /* ---------- Contenido de marcadores y popups ---------- */
  function popupHtml(v) {
    return `<div class="pop">
      <div class="pv" data-n="${v.n}" role="button" tabindex="0" aria-label="Reproducir: ${esc(v.titulo)}">
        <img src="${v.thumb}" alt=""><span class="pbtn">▶</span><span class="pdur">${fmt(v.seg)}</span>
      </div>
      <div class="pb">
        <span class="chip"><i style="--c:${Cantos.colorDe(v)}"></i>${esc(v.pueblo)} · ${esc(v.pais)}</span>
        <h3>${esc(v.titulo)}</h3>
        <div class="pa"><button type="button" data-expand="${v.n}">⛶ Ampliar</button><a href="${esc(v.url)}" target="_blank" rel="noopener">Ver en YouTube ↗</a></div>
      </div></div>`;
  }
  function iconoPin(v) {
    return L.divIcon({
      className: 'pin-wrap', iconSize: [56, 66], iconAnchor: [28, 64], popupAnchor: [0, -62],
      html: `<div class="pin" style="--c:${Cantos.colorDe(v)}"><div class="im">♪<img src="${v.thumb}" alt="" loading="lazy" onerror="this.remove()"></div><i>▶</i></div>`
    });
  }
  function iconoGrupo(items) {
    const cols = [...new Set(items.map(Cantos.colorDe))];
    const c = cols.length === 1 ? cols[0] : '#1d4d3f';
    return L.divIcon({ className: 'pin-wrap', iconSize: [52, 52], iconAnchor: [26, 26], html: `<div class="cl" style="--c:${c}">${items.length}</div>` });
  }

  /* ---------- Agrupación por celdas de pantalla ---------- */
  function celda(v, z) {
    const p = map.project([v.lat, v.lon], z);
    return Math.floor(p.x / cfg.CELL) + ':' + Math.floor(p.y / cfg.CELL);
  }
  function renderMarkers() {
    if (!map) return;
    grupo.clearLayers(); marcadores = {};
    const z = map.getZoom(), celdas = new Map();
    state.filtered.forEach(v => {
      const k = celda(v, z);
      if (!celdas.has(k)) celdas.set(k, []);
      celdas.get(k).push(v);
    });
    celdas.forEach(items => {
      if (items.length === 1) {
        const v = items[0];
        const m = L.marker([v.lat, v.lon], { icon: iconoPin(v), title: v.titulo, riseOnHover: true, keyboard: true }).addTo(grupo);
        m.bindPopup(popupHtml(v), { maxWidth: 340, minWidth: 320, className: 'cp', autoPanPadding: [30, 70] });
        if (state.labels) m.bindTooltip(esc(v.titulo), { permanent: true, direction: 'bottom', offset: [0, 6], className: 'lbl', opacity: 1 });
        else m.bindTooltip(esc(v.titulo), { direction: 'top', offset: [0, -62], className: 'tt', opacity: 1 });
        marcadores[v.n] = m;
      } else {
        const lat = items.reduce((a, v) => a + v.lat, 0) / items.length;
        const lon = items.reduce((a, v) => a + v.lon, 0) / items.length;
        const m = L.marker([lat, lon], { icon: iconoGrupo(items), title: `${items.length} videos`, keyboard: true }).addTo(grupo);
        m.on('click', () => map.fitBounds(L.latLngBounds(items.map(v => [v.lat, v.lon])), { padding: [80, 80], maxZoom: 15 }));
      }
    });
  }

  /* Zoom mínimo en el que un video queda solo (sin agruparse) */
  function zoomIndividual(v) {
    for (let z = Math.max(map.getZoom(), 5); z <= 16; z++) {
      const k = celda(v, z);
      if (!state.filtered.some(o => o !== v && celda(o, z) === k)) return z;
    }
    return 16;
  }
  /* Vuela hasta un video y abre su popup */
  function enfocar(v) {
    if (!state.filtered.includes(v)) Cantos.filtros.limpiar();
    const z = zoomIndividual(v);
    map.closePopup();
    map.once('moveend', () => { renderMarkers(); const m = marcadores[v.n]; if (m) m.openPopup(); });
    map.flyTo([v.lat, v.lon], z, { duration: 1.4 });
    const top = $('#map').getBoundingClientRect().top;
    if (top < -200 || top > 200) $('#geoportal').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- Pantalla completa (botón bajo el zoom) ---------- */
  const ICONO_ENTRAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  const ICONO_SALIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  const enPantallaCompleta = () => !!document.fullscreenElement || $('#gp').classList.contains('pseudo-full');

  function alternarPantallaCompleta() {
    const gp = $('#gp');
    const seudo = () => {
      const on = gp.classList.toggle('pseudo-full');
      document.body.style.overflow = on ? 'hidden' : '';
      actualizarIconoFs(); setTimeout(invalidar, 120);
    };
    if (gp.requestFullscreen) {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (gp.classList.contains('pseudo-full')) seudo();
      else gp.requestFullscreen().catch(seudo);
    } else seudo();   /* navegadores sin API (p. ej. iPhone) */
  }
  function actualizarIconoFs() {
    const a = document.querySelector('.cantos-fs a');
    if (!a) return;
    const on = enPantallaCompleta();
    a.innerHTML = on ? ICONO_SALIR : ICONO_ENTRAR;
    a.title = a.dataset.title = on ? 'Salir de pantalla completa' : 'Pantalla completa';
    a.setAttribute('aria-label', a.title);
  }
  function agregarControlPantallaCompleta() {
    const Control = L.Control.extend({
      options: { position: 'topleft' },   /* misma esquina que el zoom: queda justo debajo */
      onAdd: function () {
        const cont = L.DomUtil.create('div', 'leaflet-bar leaflet-control cantos-fs');
        const a = L.DomUtil.create('a', '', cont);
        a.href = '#'; a.setAttribute('role', 'button');
        L.DomEvent.disableClickPropagation(cont);
        L.DomEvent.on(a, 'click', e => { L.DomEvent.preventDefault(e); alternarPantallaCompleta(); });
        return cont;
      }
    });
    new Control().addTo(map);
    actualizarIconoFs();
    document.addEventListener('fullscreenchange', () => { actualizarIconoFs(); setTimeout(invalidar, 150); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('#gp').classList.contains('pseudo-full')) alternarPantallaCompleta();
    });
  }

  /* ---------- Inicio del mapa ---------- */
  function iniciar() {
    L = window.L;
    map = L.map('map', { minZoom: 2, zoomSnap: 0.5, worldCopyJump: true });   /* el zoom (+/−) se agrega primero */
    map.setView(cfg.VISTA_INICIAL.centro, cfg.VISTA_INICIAL.zoom);
    agregarControlPantallaCompleta();                                          /* ...y luego el botón de pantalla completa */

    const osm = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    capas = {
      calles: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: osm }),
      satelite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Tiles © Esri — Maxar, Earthstar Geographics, GIS User Community' }),
      claro: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 20, attribution: osm + ' © <a href="https://carto.com/attributions">CARTO</a>' })
    };
    capas[baseActual].addTo(map);
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);
    grupo = L.layerGroup().addTo(map);

    map.on('zoomend', renderMarkers);
    map.fitBounds(L.latLngBounds(Cantos.videos.map(v => [v.lat, v.lon])), { padding: [50, 50] });
    renderMarkers();

    $('#baseSwitch').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || b.dataset.b === baseActual) return;
      map.removeLayer(capas[baseActual]);
      baseActual = b.dataset.b;
      capas[baseActual].addTo(map);
      document.querySelectorAll('#baseSwitch button').forEach(x => x.classList.toggle('on', x === b));
    });
    window.addEventListener('resize', invalidar);
  }

  function invalidar() { if (map) map.invalidateSize(); }
  function cerrarPopup() { if (map) map.closePopup(); }
  function listo() { return !!map; }

  async function arrancar() {
    const ok = await cargarLeaflet();
    if (ok) iniciar();
    else $('.mapwrap').insertAdjacentHTML('beforeend',
      '<div class="maperr"><div><b>No se pudo cargar el mapa</b><p>Revisa tu conexión a internet y recarga la página.<br>Mientras tanto puedes reproducir los videos desde la lista.</p></div></div>');
  }

  return { arrancar, listo, renderMarkers, enfocar, cerrarPopup, invalidar };
})();
