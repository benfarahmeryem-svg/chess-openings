/* ═══════════════════════════════════════
   progress.js — Progress Dashboard
═══════════════════════════════════════ */

function renderProgress() {
  const prog = loadProgress();
  let totalAttempts = 0, totalCorrect = 0, mastered = 0;

  OPENINGS.forEach(op => {
    const p = prog[op.id] || { a: 0, c: 0 };
    totalAttempts += p.a;
    totalCorrect  += p.c;
    const pct = p.a > 0 ? Math.round(p.c / p.a * 100) : 0;
    if (pct >= 80 && p.a >= 5) mastered++;
  });

  const accuracy = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;

  document.getElementById('stats-row').innerHTML = `
    <div class="st-card"><div class="st-v">${totalAttempts}</div><div class="st-l">Moves Played</div></div>
    <div class="st-card"><div class="st-v">${accuracy}%</div><div class="st-l">Accuracy</div></div>
    <div class="st-card"><div class="st-v">${mastered}</div><div class="st-l">Mastered</div></div>
    <div class="st-card"><div class="st-v">${OPENINGS.length}</div><div class="st-l">Openings</div></div>
  `;

  const grid = document.getElementById('prog-grid');
  grid.innerHTML = '';
  OPENINGS.forEach(op => {
    const p   = prog[op.id] || { a: 0, c: 0 };
    const pct = p.a > 0 ? Math.round(p.c / p.a * 100) : 0;
    const star = pct >= 80 && p.a >= 5 ? ' ⭐' : '';
    grid.innerHTML += `
      <div class="prog-card">
        <h3>${op.name}${star}</h3>
        <div class="pb-bg"><div class="pb-f" style="width:${pct}%"></div></div>
        <div class="pb-pct">
          <span>${p.c}/${p.a} correct</span>
          <strong>${pct}%</strong>
        </div>
      </div>`;
  });
}

function initProgress() {
  document.getElementById('rst-prog').addEventListener('click', () => {
    if (confirm('Reset all progress?')) {
      localStorage.removeItem(PROGRESS_KEY);
      renderProgress();
    }
  });
}
