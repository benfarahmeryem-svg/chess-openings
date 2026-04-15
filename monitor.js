/* ═══════════════════════════════════════
   monitor.js — DB Monitor Dashboard
═══════════════════════════════════════ */

let monitorInterval = null;

function initMonitor() {
  document.getElementById('mon-ref').addEventListener('click', () => {
    if (window.sqlDB) {
      refreshMonitor();
    } else {
      document.querySelector('[data-view="sqllab"]').click();
      setTimeout(() => document.querySelector('[data-view="monitor"]').click(), 3500);
    }
  });
}

function renderMonitor() {
  if (!window.sqlDB) {
    document.getElementById('mon-body').innerHTML = `
      <div class="card mon-span-full" style="text-align:center;padding:40px">
        ⏳ Open <strong>SQL Lab</strong> first to initialize the database, then come back here.
      </div>`;
    return;
  }
  refreshMonitor();
  if (!monitorInterval) monitorInterval = setInterval(refreshMonitor, 5000);
}

function refreshMonitor() {
  if (!window.sqlDB) return;

  const body = document.getElementById('mon-body');
  document.getElementById('mon-last').textContent = 'Last updated: ' + new Date().toLocaleTimeString();

  const q = sql => {
    try {
      const r = window.sqlDB.exec(sql);
      return r.length ? r[0].values : [];
    } catch { return []; }
  };

  const totalGames    = q('SELECT COUNT(*) FROM games')[0]?.[0] ?? 0;
  const totalPlayers  = q('SELECT COUNT(*) FROM players')[0]?.[0] ?? 0;
  const totalRatings  = q('SELECT COUNT(*) FROM player_ratings')[0]?.[0] ?? 0;
  const totalOpenings = q('SELECT COUNT(*) FROM openings')[0]?.[0] ?? 0;
  const whiteWins     = q("SELECT COUNT(*) FROM games WHERE result='1-0'")[0]?.[0] ?? 0;
  const blackWins     = q("SELECT COUNT(*) FROM games WHERE result='0-1'")[0]?.[0] ?? 0;
  const draws         = q("SELECT COUNT(*) FROM games WHERE result='1/2-1/2'")[0]?.[0] ?? 0;
  const avgMoves      = q('SELECT ROUND(AVG(moves),1) FROM games')[0]?.[0] ?? 0;
  const maxMoves      = q('SELECT MAX(moves) FROM games')[0]?.[0] ?? 0;
  const minMoves      = q('SELECT MIN(moves) FROM games')[0]?.[0] ?? 0;
  const topOpening    = q('SELECT o.name, COUNT(*) AS n FROM games g JOIN openings o ON g.opening_id=o.id GROUP BY o.id ORDER BY n DESC LIMIT 1')[0] ?? ['—', 0];
  const topPlayer     = q("SELECT p.name, COUNT(*) AS w FROM games g JOIN players p ON (g.white_player_id=p.id AND g.result='1-0') OR (g.black_player_id=p.id AND g.result='0-1') GROUP BY p.id ORDER BY w DESC LIMIT 1")[0] ?? ['—', 0];
  const openingStats  = q('SELECT o.name, COUNT(*) AS n, ROUND(100.0*SUM(CASE WHEN g.result="1-0" THEN 1 ELSE 0 END)/COUNT(*),0) AS wp FROM games g JOIN openings o ON g.opening_id=o.id GROUP BY o.id ORDER BY n DESC');
  const yearStats     = q("SELECT strftime('%Y',played_date) AS yr, COUNT(*) AS n FROM games GROUP BY yr ORDER BY yr");

  const wp = Math.round(whiteWins / totalGames * 100);
  const dp = Math.round(draws     / totalGames * 100);
  const bp = Math.round(blackWins / totalGames * 100);

  const fakeQueries = [
    { sql: 'SELECT * FROM games WHERE opening_id = ?',              ms: Math.floor(Math.random()*3)+1,  calls: Math.floor(Math.random()*120)+40 },
    { sql: 'SELECT COUNT(*) FROM games GROUP BY opening_id',        ms: Math.floor(Math.random()*8)+4,  calls: Math.floor(Math.random()*60)+20 },
    { sql: 'SELECT o.name, COUNT(*) FROM games g JOIN openings…',   ms: Math.floor(Math.random()*15)+8, calls: Math.floor(Math.random()*30)+10 },
    { sql: 'SELECT p.name, MAX(elo) FROM player_ratings GROUP BY…', ms: Math.floor(Math.random()*12)+5, calls: Math.floor(Math.random()*20)+5 },
    { sql: 'WITH wins AS (...) SELECT name WHERE win_count > …',    ms: Math.floor(Math.random()*25)+12,calls: Math.floor(Math.random()*10)+2 },
  ];

  body.innerHTML = `
    <!-- Stat cards -->
    <div class="mon-card">
      <h4><span class="dot"></span>Total Games</h4>
      <div class="mon-big">${totalGames}</div>
      <div class="mon-sub">${totalOpenings} openings · ${totalPlayers} players</div>
      <div class="mon-bar"><div class="mon-bar-f" style="width:100%"></div></div>
    </div>
    <div class="mon-card">
      <h4><span class="dot"></span>Avg Game Length</h4>
      <div class="mon-big">${avgMoves}</div>
      <div class="mon-sub">moves / game (min ${minMoves} · max ${maxMoves})</div>
      <div class="mon-bar"><div class="mon-bar-f" style="width:${Math.round(avgMoves/maxMoves*100)}%"></div></div>
    </div>
    <div class="mon-card">
      <h4><span class="dot"></span>Rating Records</h4>
      <div class="mon-big">${totalRatings}</div>
      <div class="mon-sub">${Math.round(totalRatings/totalPlayers)} entries per player avg</div>
      <div class="mon-bar"><div class="mon-bar-f" style="width:80%"></div></div>
    </div>

    <!-- Results breakdown -->
    <div class="mon-card">
      <h4><span class="dot"></span>Results Breakdown</h4>
      <ul class="mon-list">
        <li>⬜ White Wins <span class="val">${whiteWins} (${wp}%)</span></li>
        <li>⬛ Black Wins <span class="val">${blackWins} (${bp}%)</span></li>
        <li>½ Draws      <span class="val">${draws} (${dp}%)</span></li>
      </ul>
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-top:10px">
        <div style="width:${wp}%;background:var(--sq-l)"></div>
        <div style="width:${dp}%;background:var(--dim2)"></div>
        <div style="width:${bp}%;background:var(--s3)"></div>
      </div>
    </div>

    <!-- Top stats -->
    <div class="mon-card">
      <h4><span class="dot"></span>Top This DB</h4>
      <ul class="mon-list">
        <li>🏆 Most played <span class="val">${topOpening[0].toString().split(' ').slice(0,2).join(' ')}</span></li>
        <li>👑 Most wins   <span class="val">${topPlayer[0]}</span></li>
        <li>📅 Date range  <span class="val">2019–2024</span></li>
        <li>🗂 Tables      <span class="val">4</span></li>
        <li>🔍 Indexes     <span class="val">3</span></li>
      </ul>
    </div>

    <!-- Performance sim -->
    <div class="mon-card">
      <h4><span class="dot"></span>Performance Sim</h4>
      <ul class="mon-list">
        <li>Cache hit ratio    <span class="val" style="color:var(--ok)">99.2%</span></li>
        <li>Active connections <span class="val">1</span></li>
        <li>Idle connections   <span class="val">0</span></li>
        <li>Deadlocks          <span class="val" style="color:var(--ok)">0</span></li>
        <li>Table bloat        <span class="val" style="color:var(--ok)">0%</span></li>
      </ul>
    </div>

    <!-- Query log -->
    <div class="mon-card mon-span-full">
      <h4><span class="dot warn"></span>Simulated Query Log (last 5 executions)</h4>
      <ul class="mon-query-list">
        ${fakeQueries.map(q => `
          <li>
            <span class="q-badge">×${q.calls}</span>
            <span class="q-ms ${q.ms < 5 ? 'fast' : ''}">${q.ms}ms</span>
            <span class="q-text">${q.sql}</span>
          </li>`).join('')}
      </ul>
    </div>

    <!-- Games by year -->
    <div class="mon-card">
      <h4><span class="dot"></span>Games by Year</h4>
      <ul class="mon-list">
        ${yearStats.map(([yr, n]) => `<li>${yr} <span class="val">${n} games</span></li>`).join('')}
      </ul>
    </div>

    <!-- Table health -->
    <div class="mon-card mon-span-full">
      <h4><span class="dot"></span>Opening Health — White Win Rates</h4>
      <table class="tbl-health">
        <thead><tr><th>Opening</th><th>Games</th><th>White Win %</th><th>Status</th><th>Bar</th></tr></thead>
        <tbody>
          ${openingStats.map(([name, n, winPct]) => `
            <tr>
              <td>${name}</td>
              <td>${n}</td>
              <td>${winPct}%</td>
              <td style="color:${winPct > 55 ? 'var(--ok)' : winPct < 40 ? 'var(--er)' : 'var(--warn)'}">
                ${winPct > 55 ? '✓ White favored' : winPct < 40 ? '✓ Black favored' : '≈ Balanced'}
              </td>
              <td style="min-width:100px">
                <div style="height:5px;background:var(--s3);border-radius:3px;overflow:hidden">
                  <div style="width:${winPct}%;height:100%;background:${winPct > 55 ? 'var(--g1)' : winPct < 40 ? 'var(--er)' : 'var(--warn)'};border-radius:3px"></div>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}
