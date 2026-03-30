# ♟ ChessOpener

> **A full-featured chess openings study app built with pure Vanilla HTML/CSS/JS — no frameworks, no build step, no dependencies.**
>
> Built by **Meryem Benfarah** — DBA student, combining a passion for databases with a love for chess.

![Version](https://img.shields.io/badge/version-4.0-22c55e?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)
![HTML](https://img.shields.io/badge/HTML-only-22c55e?style=flat-square&logo=html5)
![No Dependencies](https://img.shields.io/badge/dependencies-zero-22c55e?style=flat-square)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-22c55e?style=flat-square&logo=github)

---

## 🌐 Live Demo

**👉 [benfarahmeryem-svg.github.io/chess-openings](https://benfarahmeryem-svg.github.io/chess-openings/)**

---

## 💡 About This Project

This app was built as a personal portfolio project during my DBA studies. I wanted to go beyond generic todo-list tutorials and build something that genuinely interests me — chess — while practising the skills that matter most in database work: SQL query writing, query optimization, schema design, and live database monitoring.

The SQL Lab runs a real **SQLite database inside the browser** using WebAssembly, with 8 progressive challenges covering everything from basic `SELECT` statements to window functions and CTEs. The DB Monitor tab shows live metrics on that database — the same kind of dashboard a DBA would build on top of a production PostgreSQL instance.

Everything is in a **single HTML file** with no build tooling, so it deploys instantly to GitHub Pages and can be opened locally with a double-click.

---

## ✨ Features

### 🗂 Opening Explorer
Browse 8 major chess openings with:
- ECO codes, color played, full move sequences with numbered badges
- YouTube demo video thumbnail — click to watch a tutorial before practicing
- **Live Lichess stats** — fetch real win/draw/loss percentages and most popular continuations directly from the Lichess Opening Explorer API
- Key ideas and main variation names for each opening

### ♟ Practice Mode
- Fully interactive chessboard with coordinate labels (a–h, 1–8) always visible
- Move-by-move guided practice — play the correct moves in sequence
- Auto-plays the opponent's response after a short delay
- Hint system reveals the correct move on wrong attempts
- Move history panel in standard algebraic notation

### 🃏 Flashcard Quiz
- Random positions drawn from any point in any opening's move sequence
- 4-choice multiple choice to guess the next correct move
- Streak counter, score tracker, and instant board feedback

### 📐 Notation Guide
A complete lesson in algebraic chess notation — built because I noticed many beginners (including myself at first) struggle to read moves like `Nf3`, `O-O`, or `Bb5+`. Includes:
- Interactive step-by-step demo board (plays through the Ruy López)
- Reference tables for piece letters, special symbols, and disambiguation
- Plain-language explanation of how to read any move

### 📊 Progress Dashboard
- Per-opening accuracy tracking stored in `localStorage`
- Visual progress bars with mastery detection (⭐ at ≥80% accuracy over 5+ attempts)
- Overall stats: total moves played, accuracy %, openings mastered

### 🗄 SQL Lab
A real **SQLite database running entirely in the browser** via [sql.js](https://sql-js.github.io/sql.js/) (WebAssembly). This is the feature I am most proud of as a DBA student — it lets you practise real query optimization without needing to install anything.

**Schema:**
```sql
openings       -- id, name, eco, color, first_moves
players        -- id, name, country  (10 grandmasters seeded)
games          -- id, opening_id, white_player_id, black_player_id, result, played_date, moves
               -- (60 games seeded, years 2019–2024)
player_ratings -- id, player_id, elo, recorded_date
```

**Indexes created:**
```sql
CREATE INDEX idx_g_op ON games(opening_id);
CREATE INDEX idx_g_dt ON games(played_date);
CREATE INDEX idx_r_pl ON player_ratings(player_id);
```

**8 progressive challenges:**

| # | Difficulty | Concept Practised |
|---|---|---|
| 1 | 🟢 Easy | SELECT with specific columns, ORDER BY |
| 2 | 🟢 Easy | COUNT, LEFT JOIN, GROUP BY |
| 3 | 🟡 Medium | CASE WHEN inside aggregates, HAVING |
| 4 | 🟡 Medium | MAX() with GROUP BY, LIMIT |
| 5 | 🟡 Medium | Date functions (strftime), multi-column GROUP BY |
| 6 | 🔴 Hard | Correlated subquery inside HAVING |
| 7 | 🔴 Hard | Window function — COUNT() OVER (ORDER BY …) |
| 8 | 🔴 Hard | CTE (WITH clause) with aggregate comparison |

Keyboard shortcuts: `Ctrl+Enter` runs the query · `Tab` indents · Hint button shows guidance · "Show Solution" reveals the full answer.

### 🖥 DB Monitor
A live dashboard auto-refreshing every 5 seconds that treats the SQL Lab database as a real production database. Shows:
- Row counts, avg/min/max game length, result breakdown with visual bar
- Top opening by game count, top player by wins
- Simulated query execution log with millisecond timings
- Table health grid — win rate per opening with Balanced / White favored / Black favored indicators

This mirrors the kind of monitoring interface a DBA would build on top of `pg_stat_statements` and `pg_stat_user_tables` in PostgreSQL.

---

## 📁 Project Structure

```
chess-openings/
└── index.html      ← The entire application — open and run
└── README.md       ← This file
└── GITHUB_SETUP.md ← Personal deployment notes
```

The whole app is one self-contained HTML file. All CSS and JavaScript are inline. This was a deliberate choice: it makes the project trivially easy to share, host, and open without any tooling.

---

## 🚀 Run Locally

```bash
git clone https://github.com/benfarahmeryem-svg/chess-openings.git
cd chess-openings
open index.html          # macOS
# or double-click index.html on Windows / Linux
```

For the Lichess API fetch (live opening stats), run a local server to avoid CORS issues:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

---

## 🌍 Deployed With GitHub Pages

Live at: **[benfarahmeryem-svg.github.io/chess-openings](https://benfarahmeryem-svg.github.io/chess-openings/)**

Settings used: **Settings → Pages → Deploy from branch → main → / (root)**

---

## ➕ Adding New Openings

In `index.html`, find the `OPENINGS` array at the top of the `<script>` block and add a new entry:

```javascript
{
  id: "nimzo-indian",
  name: "Nimzo-Indian Defense",
  eco: "E20–E59",
  color: "Black",
  fm: ["d4","Nf6","c4","e6","Nc3","Bb4","e3","O-O","Bd3","d5"],
  yt: "YOUTUBE_VIDEO_ID",
  ytTitle: "Nimzo-Indian Defense | Chess Openings",
  desc: "Black pins the Nc3 knight with Bb4, controlling the center indirectly.",
  ideas: [
    "Pin the knight with Bb4 to control e4",
    "Create long-term structural imbalances",
    "Fight for the center without a central pawn"
  ],
  alts: ["Classical (4.e3)", "Sämisch (4.a3)", "Rubinstein (4.e3 c5)"]
}
```

The opening appears automatically in Explorer, Practice, Quiz, Progress, SQL Lab, and DB Monitor.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 + CSS3 + Vanilla JS | Everything — structure, styling, logic |
| [sql.js](https://sql-js.github.io/sql.js/) v1.10.2 (WebAssembly) | SQLite database running in the browser |
| [Google Fonts](https://fonts.google.com) — Cinzel + Inter | Typography |
| [Lichess Opening Explorer API](https://lichess.org/api#tag/Opening-Explorer) | Live opening statistics |
| YouTube Thumbnail API | Video preview images |
| `localStorage` | Persisting practice progress |

---

## 📖 Openings Included

| Opening | ECO | Color | Style |
|---|---|---|---|
| Sicilian Defense | B20–B99 | Black | Sharp / Tactical |
| French Defense | C00–C19 | Black | Solid / Positional |
| Italian Game | C50–C59 | White | Classical / Beginner-friendly |
| Ruy López | C60–C99 | White | Deep / Strategic |
| Queen's Gambit | D06–D69 | White | Positional / Classical |
| King's Indian Defense | E60–E99 | Black | Dynamic / Aggressive |
| Caro-Kann Defense | B10–B19 | Black | Solid / Endgame-oriented |
| London System | D02 | White | System / Low-theory |

---

## 👩‍💻 About the Author

**Meryem Benfarah** — DBA student with a focus on query optimization, database monitoring, and performance tuning.

This project reflects what I genuinely find interesting: building real tools that use databases in practical ways. The SQL Lab and DB Monitor are the parts that most closely connect to my studies — designing schemas, writing optimized queries, and presenting database health in a way that's immediately readable.

- GitHub: [@benfarahmeryem-svg](https://github.com/benfarahmeryem-svg)
- Live project: [benfarahmeryem-svg.github.io/chess-openings](https://benfarahmeryem-svg.github.io/chess-openings/)

---

## 📄 License

MIT License — free to use, fork, and build on.

---

*Made with ♟ and a lot of SQL — Meryem Benfarah*
