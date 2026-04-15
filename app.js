/* ═══════════════════════════════════════
   app.js — Navigation & App Bootstrap
   ChessOpener · Meryem Benfarah
═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── MOBILE DRAWER ── */
  const sidebar    = document.getElementById('sidebar');
  const overlay    = document.getElementById('nav-overlay');
  const hamburger  = document.getElementById('hamburger');
  const closeNav   = document.getElementById('close-nav');

  function openDrawer() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  closeNav.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close drawer on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ── VIEW SWITCHING ── */
  document.querySelectorAll('.nb').forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.dataset.view;

      // Update active nav button
      document.querySelectorAll('.nb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Switch view
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + viewId).classList.add('active');

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Close mobile drawer
      closeDrawer();

      // Per-view init hooks
      if (viewId === 'progress') renderProgress();
      if (viewId === 'monitor')  renderMonitor();
      if (viewId === 'notation') initNotation();
    });
  });

  /* ── INITIALISE ALL MODULES ── */
  initExplorer();
  initPractice();
  initQuiz();
  initProgress();
  initMonitor();

  // SQL Lab loads async (needs sql.js wasm)
  initSQLLab();

  /* ── UPDATE BOARD STATUS BAR WIDTH ── */
  // The status bar should match the board width on desktop
  function updateStatusWidth() {
    const boardEl = document.querySelector('#prac-board-wrap .board');
    const statusEl = document.getElementById('prac-st');
    if (boardEl && statusEl) {
      const boardWrap = document.querySelector('#prac-board-wrap .board-wrap');
      if (boardWrap) statusEl.style.width = boardWrap.offsetWidth + 'px';
    }
  }
  window.addEventListener('resize', updateStatusWidth);
  setTimeout(updateStatusWidth, 300);

});
