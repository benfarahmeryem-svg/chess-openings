/* ═══════════════════════════════════════
   explorer.js — Opening Explorer
═══════════════════════════════════════ */

function initExplorer() {
  const list   = document.getElementById('op-list');
  const detail = document.getElementById('op-detail');

  OPENINGS.forEach(op => {
    const item = document.createElement('div');
    item.className = 'op-item';
    item.innerHTML = `<h3>${op.name}</h3><p>${op.eco} · ${op.color}</p>`;
    item.addEventListener('click', () => {
      document.querySelectorAll('.op-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderDetail(op);
    });
    list.appendChild(item);
  });

  function renderDetail(op) {
    const badges = op.fm.map((m, i) => {
      const num = i % 2 === 0
        ? `<span class="mn">${Math.floor(i / 2) + 1}.</span>`
        : '';
      return `<span class="mv-badge">${num}${m}</span>`;
    }).join('');

    const ideas = op.ideas.map(k => `<li>${k}</li>`).join('');
    const alts  = op.alts
      ? `<div class="d-section"><h4>Key Variations</h4><ul>${op.alts.map(a => `<li>${a}</li>`).join('')}</ul></div>`
      : '';

    detail.innerHTML = `
      <div class="d-eco">${op.eco} · ${op.color} plays</div>
      <div class="d-name">${op.name}</div>

      <div class="d-video">
        <div class="d-video-hdr">▶ Demo Video</div>
        <a class="d-video-thumb"
           href="https://www.youtube.com/watch?v=${op.yt}"
           target="_blank" rel="noopener"
           title="${op.ytTitle}">
          <img src="https://img.youtube.com/vi/${op.yt}/hqdefault.jpg"
               alt="${op.name} tutorial" loading="lazy"/>
          <div class="d-video-play">
            <div class="d-video-play-btn">▶</div>
            <span class="d-video-label">${op.ytTitle}</span>
          </div>
        </a>
      </div>

      <div class="d-moves">${badges}</div>
      <p class="d-desc">${op.desc}</p>

      <div class="fetch-row">
        <button class="btn btn-sm btn-outline" id="fetch-btn">📡 Live Stats from Lichess</button>
        <span class="fetch-status" id="fetch-status">Click to load real game data</span>
      </div>
      <div id="lichess-stats"></div>

      <div class="d-section"><h4>Key Ideas</h4><ul>${ideas}</ul></div>
      ${alts}

      <button class="btn btn-primary" style="margin-top:16px" data-id="${op.id}">
        ♟ Practice This Opening
      </button>
    `;

    // Practice button
    detail.querySelector('[data-id]').addEventListener('click', () => {
      document.querySelector('[data-view="practice"]').click();
      const sel = document.getElementById('prac-sel');
      sel.value = op.id;
      sel.dispatchEvent(new Event('change'));
    });

    // Lichess fetch
    document.getElementById('fetch-btn').addEventListener('click', () => fetchLichess(op));
  }

  async function fetchLichess(op) {
    const st  = document.getElementById('fetch-status');
    const box = document.getElementById('lichess-stats');
    st.textContent = 'Fetching from lichess.org…';
    st.className = 'fetch-status';
    try {
      const play = op.fm.slice(0, 6).join(',');
      const res  = await fetch(
        `https://explorer.lichess.ovh/lichess?variant=standard&play=${play}&topGames=0&recentGames=0`
      );
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const total  = (data.white || 0) + (data.draws || 0) + (data.black || 0) || 1;
      const wp     = Math.round((data.white || 0) / total * 100);
      const dp     = Math.round((data.draws || 0) / total * 100);
      const bp     = Math.round((data.black || 0) / total * 100);

      const topMoves = data.moves && data.moves.length
        ? `<h4 style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--g2);margin:10px 0 6px;font-weight:600">
             Most Popular Continuations
           </h4>
           <div style="display:flex;flex-wrap:wrap;gap:5px">
             ${data.moves.slice(0, 6).map(m =>
               `<span class="mv-badge">${m.san}
                 <span style="color:var(--dim);margin-left:4px">
                   ${(m.white + m.draws + m.black).toLocaleString()}
                 </span>
               </span>`
             ).join('')}
           </div>`
        : '';

      box.innerHTML = `
        <div class="d-section">
          <h4>📊 Lichess Stats (Rapid/Classical · 2000+ rated)</h4>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <span class="mv-badge" style="color:#d4f7a0">⬜ White ${wp}%</span>
            <span class="mv-badge" style="color:#9ab89a">½ Draws ${dp}%</span>
            <span class="mv-badge" style="color:#6b8f6b">⬛ Black ${bp}%</span>
            <span class="mv-badge">${total.toLocaleString()} games</span>
          </div>
          <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:10px">
            <div style="width:${wp}%;background:#e8e4d8"></div>
            <div style="width:${dp}%;background:#6b8f6b"></div>
            <div style="width:${bp}%;background:#2a3a2a"></div>
          </div>
          ${topMoves}
        </div>`;
      st.textContent = '✓ Data loaded from lichess.org';
      st.className = 'fetch-status ok';
    } catch {
      box.innerHTML = '';
      st.textContent = '⚠ Could not fetch — check internet connection';
      st.className = 'fetch-status bad';
    }
  }
}
