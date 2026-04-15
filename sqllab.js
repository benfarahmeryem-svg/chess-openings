/* ═══════════════════════════════════════
   sqllab.js — SQL Lab (SQLite/WebAssembly)
═══════════════════════════════════════ */

// sqlDB is declared here so monitor.js can access it
window.sqlDB = null;

const SQL_CHALLENGES = [
  { id:1, lv:'easy',   title:'List All Openings',
    desc:'Retrieve all openings. Show name, ECO code, and which color plays them. Order by name.',
    hint:'Use SELECT with specific columns. Avoid SELECT * in production — name your columns.',
    sol:'SELECT name, eco, color\nFROM openings\nORDER BY name;' },

  { id:2, lv:'easy',   title:'Count Games per Opening',
    desc:'How many games were played with each opening? Show opening name and game count, most played first.',
    hint:'JOIN openings with games, GROUP BY opening, COUNT(*), ORDER BY DESC.',
    sol:'SELECT o.name, COUNT(g.id) AS game_count\nFROM openings o\nLEFT JOIN games g ON g.opening_id = o.id\nGROUP BY o.id\nORDER BY game_count DESC;' },

  { id:3, lv:'medium', title:"White Win Rate by Opening",
    desc:"Calculate White's win rate per opening. Only openings with ≥ 3 games, sorted by win rate.",
    hint:"Use SUM(CASE WHEN result='1-0' THEN 1 ELSE 0 END)/COUNT(*). Filter with HAVING.",
    sol:`SELECT o.name,\n  COUNT(*) AS games,\n  ROUND(100.0 * SUM(CASE WHEN g.result = '1-0' THEN 1 ELSE 0 END) / COUNT(*), 1) AS white_win_pct\nFROM games g\nJOIN openings o ON g.opening_id = o.id\nGROUP BY o.id\nHAVING games >= 3\nORDER BY white_win_pct DESC;` },

  { id:4, lv:'medium', title:'Top 5 Players by Peak ELO',
    desc:'Find the top 5 players by their highest ELO ever recorded.',
    hint:'Use MAX() with GROUP BY, then ORDER BY and LIMIT.',
    sol:`SELECT p.name, MAX(pr.elo) AS peak_elo\nFROM players p\nJOIN player_ratings pr ON pr.player_id = p.id\nGROUP BY p.id\nORDER BY peak_elo DESC\nLIMIT 5;` },

  { id:5, lv:'medium', title:'Games per Opening per Year',
    desc:"Game counts by opening and year. Only include combos with more than 1 game.",
    hint:"Use strftime('%Y', played_date) to extract the year. GROUP BY two columns.",
    sol:`SELECT o.name,\n  strftime('%Y', g.played_date) AS year,\n  COUNT(*) AS games\nFROM games g\nJOIN openings o ON g.opening_id = o.id\nGROUP BY o.id, year\nHAVING games > 1\nORDER BY year, games DESC;` },

  { id:6, lv:'hard',   title:'Above-Average Win Rate (Subquery)',
    desc:"Find openings whose White win rate exceeds the overall average. Use a subquery.",
    hint:"Compute the average in a subquery inside HAVING.",
    sol:`SELECT o.name,\n  ROUND(100.0 * SUM(CASE WHEN g.result = '1-0' THEN 1 ELSE 0 END) / COUNT(*), 1) AS win_pct\nFROM games g\nJOIN openings o ON g.opening_id = o.id\nGROUP BY o.id\nHAVING win_pct > (\n  SELECT ROUND(100.0 * SUM(CASE WHEN result = '1-0' THEN 1 ELSE 0 END) / COUNT(*), 1)\n  FROM games\n)\nORDER BY win_pct DESC;` },

  { id:7, lv:'hard',   title:'Running Game Count (Window)',
    desc:'Show each game with a cumulative running total in date order.',
    hint:'Use COUNT(*) OVER (ORDER BY played_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).',
    sol:`SELECT g.played_date, o.name AS opening,\n  COUNT(*) OVER (\n    ORDER BY g.played_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM games g\nJOIN openings o ON g.opening_id = o.id\nORDER BY g.played_date;` },

  { id:8, lv:'hard',   title:'CTE: Players Above Average Wins',
    desc:'Using a CTE, find players with more wins than the average wins per player.',
    hint:'WITH wins AS (...), then filter outer query against AVG from the CTE.',
    sol:`WITH wins AS (\n  SELECT p.name, COUNT(*) AS win_count\n  FROM games g\n  JOIN players p\n    ON (g.white_player_id = p.id AND g.result = '1-0')\n    OR (g.black_player_id = p.id AND g.result = '0-1')\n  GROUP BY p.id\n)\nSELECT name, win_count\nFROM wins\nWHERE win_count > (SELECT AVG(win_count) FROM wins)\nORDER BY win_count DESC;` }
];

async function initSQLLab() {
  let activeChallenge = null;

  // ── Init database ──
  async function initDB() {
    const SQL = await initSqlJs({
      locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
    });
    window.sqlDB = new SQL.Database();

    window.sqlDB.run(`
      CREATE TABLE openings(id INTEGER PRIMARY KEY, name TEXT, eco TEXT, color TEXT, first_moves TEXT);
      CREATE TABLE players(id INTEGER PRIMARY KEY, name TEXT, country TEXT);
      CREATE TABLE games(id INTEGER PRIMARY KEY, opening_id INTEGER, white_player_id INTEGER, black_player_id INTEGER, result TEXT, played_date TEXT, moves INTEGER);
      CREATE TABLE player_ratings(id INTEGER PRIMARY KEY, player_id INTEGER, elo INTEGER, recorded_date TEXT);
      CREATE INDEX idx_g_op ON games(opening_id);
      CREATE INDEX idx_g_dt ON games(played_date);
      CREATE INDEX idx_r_pl ON player_ratings(player_id);
    `);

    const os = window.sqlDB.prepare('INSERT INTO openings VALUES(?,?,?,?,?)');
    OPENINGS.forEach((op, i) => os.run([i + 1, op.name, op.eco, op.color, op.fm.slice(0, 4).join(' ')]));
    os.free();

    const ps = window.sqlDB.prepare('INSERT INTO players VALUES(?,?,?)');
    [
      ['Magnus Carlsen','Norway'], ['Fabiano Caruana','USA'], ['Hikaru Nakamura','USA'],
      ['Ding Liren','China'], ['Ian Nepomniachtchi','Russia'], ['Anish Giri','Netherlands'],
      ['Levon Aronian','USA'], ['Wesley So','USA'], ['Viswanathan Anand','India'], ['Garry Kasparov','Russia']
    ].forEach(([n, c], i) => ps.run([i + 1, n, c]));
    ps.free();

    const gs = window.sqlDB.prepare('INSERT INTO games VALUES(?,?,?,?,?,?,?)');
    const results = ['1-0','0-1','1/2-1/2'];
    let gid = 1;
    for (let y = 2019; y <= 2024; y++) {
      for (let m = 1; m <= 10; m++) {
        const oi = (gid % OPENINGS.length) + 1;
        let wp = Math.floor(Math.random() * 10) + 1;
        let bp = Math.floor(Math.random() * 10) + 1;
        while (bp === wp) bp = Math.floor(Math.random() * 10) + 1;
        const r  = results[Math.floor(Math.random() * 3)];
        const mo = String(m).padStart(2, '0');
        const dd = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        gs.run([gid, oi, wp, bp, r, `${y}-${mo}-${dd}`, Math.floor(Math.random() * 60) + 20]);
        gid++;
      }
    }
    gs.free();

    const rs = window.sqlDB.prepare('INSERT INTO player_ratings VALUES(?,?,?,?)');
    let rid = 1;
    for (let pid = 1; pid <= 10; pid++) {
      for (let y = 2019; y <= 2024; y++) {
        rs.run([rid++, pid, 2600 + Math.floor(Math.random() * 400), `${y}-01-01`]);
      }
    }
    rs.free();
  }

  // ── Schema ──
  function renderSchema() {
    document.getElementById('schema-box').innerHTML = `<h4>📋 Schema</h4>` +
      [
        { t: 'openings',       c: ['id PK', 'name', 'eco', 'color', 'first_moves'] },
        { t: 'players',        c: ['id PK', 'name', 'country'] },
        { t: 'games',          c: ['id PK', 'opening_id FK', 'white_player_id FK', 'black_player_id FK', 'result', 'played_date', 'moves'] },
        { t: 'player_ratings', c: ['id PK', 'player_id FK', 'elo', 'recorded_date'] }
      ]
      .map(({ t, c }) => `
        <div class="tbl-s">
          <h5>${t}</h5>
          <ul>${c.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>`)
      .join('');
  }

  // ── Challenge list ──
  function renderChallenges() {
    const cont = document.getElementById('sql-chs');
    SQL_CHALLENGES.forEach(ch => {
      const el = document.createElement('div');
      el.className = 'ch-item';
      el.innerHTML = `
        <h4>${ch.title}<span class="badge b${ch.lv[0]}">${ch.lv}</span></h4>
        <p>${ch.desc.slice(0, 55)}…</p>`;
      el.addEventListener('click', () => {
        document.querySelectorAll('.ch-item').forEach(e => e.classList.remove('active'));
        el.classList.add('active');
        activeChallenge = ch;
        document.getElementById('ch-hdr').innerHTML = `
          <h3>${ch.title}<span class="badge b${ch.lv[0]}" style="margin-left:8px">${ch.lv}</span></h3>
          <p>${ch.desc}</p>
          <p class="ch-tip">🎯 Write SQL below and press Run (Ctrl+Enter).</p>`;
        document.getElementById('sql-ed').value = '';
        document.getElementById('hint-card').classList.add('hidden');
        document.getElementById('res-content').innerHTML = '<div class="results-msg">Run your query to see results</div>';
        setStatus('Ready', 'info');
      });
      cont.appendChild(el);
    });
  }

  // ── Status badge ──
  function setStatus(msg, type) {
    const el = document.getElementById('res-st');
    el.textContent = msg;
    el.className = 'status-badge ' + (type || '');
  }

  // ── Run query ──
  function runQuery() {
    if (!window.sqlDB) { setStatus('DB loading…', 'info'); return; }
    const sql = document.getElementById('sql-ed').value.trim();
    if (!sql) { setStatus('Write a query first', 'info'); return; }
    const t0 = performance.now();
    try {
      const results = window.sqlDB.exec(sql);
      const ms = (performance.now() - t0).toFixed(2);
      if (!results.length) {
        document.getElementById('res-content').innerHTML = '<div class="results-msg ok">✓ Query executed — no rows returned</div>';
        setStatus(`OK · ${ms}ms`, 'ok');
        return;
      }
      const { columns, values } = results[0];
      let html = `<table class="res-tbl"><thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>`;
      values.forEach(row => {
        html += `<tr>${row.map(v => `<td>${v === null ? '<span style="color:var(--dim)">NULL</span>' : v}</td>`).join('')}</tr>`;
      });
      html += '</tbody></table>';
      document.getElementById('res-content').innerHTML = html;
      setStatus(`${values.length} row${values.length !== 1 ? 's' : ''} · ${ms}ms`, 'ok');
    } catch (e) {
      document.getElementById('res-content').innerHTML = `<div class="results-msg bad">❌ ${e.message}</div>`;
      setStatus('Error', 'bad');
    }
  }

  // ── Wire buttons ──
  document.getElementById('sql-run').addEventListener('click', runQuery);

  document.getElementById('sql-clear').addEventListener('click', () => {
    document.getElementById('sql-ed').value = '';
    document.getElementById('hint-card').classList.add('hidden');
    document.getElementById('res-content').innerHTML = '<div class="results-msg">Run a query to see results here</div>';
    setStatus('Ready', 'info');
  });

  document.getElementById('sql-ed').addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target, st = s.selectionStart;
      s.value = s.value.substring(0, st) + '  ' + s.value.substring(s.selectionEnd);
      s.selectionStart = s.selectionEnd = st + 2;
    }
  });

  document.getElementById('sql-hint').addEventListener('click', () => {
    const hc = document.getElementById('hint-card');
    if (!activeChallenge) {
      hc.classList.remove('hidden');
      hc.innerHTML = '<h5>Hint</h5>Select a challenge first.';
      return;
    }
    hc.classList.remove('hidden');
    hc.innerHTML = `
      <h5>💡 Hint — ${activeChallenge.title}</h5>
      ${activeChallenge.hint}<br><br>
      <button class="btn btn-sm btn-outline" id="show-sol">Show Full Solution</button>`;
    document.getElementById('show-sol').addEventListener('click', () => {
      document.getElementById('sql-ed').value = activeChallenge.sol;
      hc.innerHTML += `<br><br><span style="color:var(--ok)">✓ Solution loaded — press Run!</span>`;
    });
  });

  // ── Bootstrap ──
  try {
    await initDB();
    renderSchema();
    renderChallenges();
    setStatus('60 games · 10 players · Ready', 'info');
  } catch (e) {
    document.getElementById('schema-box').innerHTML =
      `<h4>📋 Schema</h4><p style="color:var(--er);font-size:11px">⚠ ${e.message}</p>`;
    console.error('SQL Lab init error:', e);
  }
}
