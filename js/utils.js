/* ============================================================
   utils.js · Funciones de ayuda reutilizables
   ============================================================ */
Cantos.utils = (function () {
  const $ = s => document.querySelector(s);

  /* Escapa texto para insertarlo de forma segura en HTML */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Minúsculas y sin tildes (para buscar) */
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  /* Segundos -> "m:ss" o "h:mm:ss" */
  const fmt = s => {
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    const p = n => String(n).padStart(2, '0');
    return h ? `${h}:${p(m)}:${p(x)}` : `${m}:${p(x)}`;
  };

  const plural = (n, a, b) => n === 1 ? a : b;

  return { $, esc, norm, fmt, plural };
})();
