/* ═══════════════════════════════════════
   notation.js — Interactive Notation Guide
═══════════════════════════════════════ */

let notationBoard = null;
let notationBuilt = false;

function initNotation() {
  if (notationBuilt) return;
  notationBuilt = true;

  // Build the guide cards
  const grid = document.getElementById('guide-grid');
  NOTATION_CARDS.forEach(card => {
    const div = document.createElement('div');
    div.className = 'g-card';
    div.innerHTML = `<h3>${card.title}</h3>${card.body}`;
    grid.appendChild(div);
  });

  // Build the interactive demo board
  const boardId = makeBoard('nd-board-wrap', false);
  notationBoard = new ChessBoard(boardId);
  notationBoard.onMove = null; // read-only

  const steps = [
    { mv: 'e4',   col: 'white', label: '1. e4',   txt: 'White pawn to <strong>e4</strong>. "e" = 5th file, "4" = 4th rank. No piece letter = pawn.' },
    { mv: 'e5',   col: 'black', label: '1… e5',   txt: 'Black mirrors with e5. The "…" (ellipsis) always means it\'s Black\'s move.' },
    { mv: 'Nf3',  col: 'white', label: '2. Nf3',  txt: '<strong>N</strong>f3 = Knight to f3. We use N because K is reserved for King.' },
    { mv: 'Nc6',  col: 'black', label: '2… Nc6',  txt: 'Knight to c6. Both players are developing their knights — a key opening principle.' },
    { mv: 'Bb5',  col: 'white', label: '3. Bb5',  txt: '<strong>B</strong>b5 = Bishop to b5. This is the Ruy López — the bishop pins Black\'s knight.' },
    { mv: 'a6',   col: 'black', label: '3… a6',   txt: 'a6 = pawn to a6. Just the destination — lowercase means pawn. Black challenges the bishop.' },
    { mv: 'Ba4',  col: 'white', label: '4. Ba4',  txt: 'Bishop retreats to a4. No "x" = no capture happened. Just a repositioning move.' },
    { mv: 'Nf6',  col: 'black', label: '4… Nf6',  txt: 'Black\'s second knight enters the game, attacking White\'s e4 pawn.' },
    { mv: 'O-O',  col: 'white', label: '5. O-O',  txt: '<strong>O-O</strong> = Kingside castling. King moves 2 squares right, rook jumps over. King is now safely tucked away.' },
  ];

  const stepsEl = document.getElementById('nd-steps');
  steps.forEach((step, i) => {
    const div = document.createElement('div');
    div.className = 'nd-step';
    div.innerHTML = `<span class="nd-mv">${step.label}</span><span class="nd-txt">${step.txt}</span>`;
    div.addEventListener('click', () => {
      document.querySelectorAll('.nd-step').forEach(s => s.classList.remove('active'));
      div.classList.add('active');
      notationBoard.reset();
      for (let j = 0; j <= i; j++) {
        notationBoard.applyNotation(steps[j].mv, steps[j].col);
      }
    });
    stepsEl.appendChild(div);
  });

  // Activate first step
  stepsEl.firstChild.click();
}

const NOTATION_CARDS = [
  {
    title: '🔤 The Coordinate System',
    body: `<p>The board has <strong>files</strong> (columns a–h, left to right) and <strong>ranks</strong> (rows 1–8, bottom to top from White's view). Every square has a unique address.</p>
    <div class="g-code">  a b c d e f g h
8 · · · · · · · ·
7 · · · · · · · ·
...
1 · · · · · · · ·</div>
    <p><strong>e4</strong> = file e, rank 4. The four center squares are e4, e5, d4, d5.</p>`
  },
  {
    title: '♟ Piece Letters',
    body: `<table class="g-table">
      <tr><th>Symbol</th><th>Piece</th><th>Example</th></tr>
      <tr><td>(none)</td><td>Pawn</td><td>e4, d5, c3</td></tr>
      <tr><td>N</td><td>Knight</td><td>Nf3, Nc6</td></tr>
      <tr><td>B</td><td>Bishop</td><td>Bc4, Bb5</td></tr>
      <tr><td>R</td><td>Rook</td><td>Rd1, Ra8</td></tr>
      <tr><td>Q</td><td>Queen</td><td>Qd1, Qh5</td></tr>
      <tr><td>K</td><td>King</td><td>Ke2, Kg1</td></tr>
    </table>`
  },
  {
    title: '⚡ Special Symbols',
    body: `<table class="g-table">
      <tr><th>Symbol</th><th>Meaning</th></tr>
      <tr><td>x</td><td>Capture — Nxe5 = Knight takes on e5</td></tr>
      <tr><td>+</td><td>Check — Bb5+ = Bishop gives check</td></tr>
      <tr><td>#</td><td>Checkmate — game over</td></tr>
      <tr><td>O-O</td><td>Kingside castling</td></tr>
      <tr><td>O-O-O</td><td>Queenside castling</td></tr>
      <tr><td>=Q</td><td>Pawn promotes to Queen</td></tr>
      <tr><td>!</td><td>Good move</td></tr>
      <tr><td>?</td><td>Mistake</td></tr>
    </table>`
  },
  {
    title: '🔢 Reading a Game Score',
    body: `<p>Moves are numbered. White always goes first, Black second on the same number:</p>
    <div class="g-code">1. e4   e5
2. Nf3  Nc6
3. Bb5  a6</div>
    <p>Read as: "1. White plays e4, Black plays e5. 2. White plays Knight to f3…"</p>
    <p>If only Black's move is shown: <strong>1…Nf6</strong> — the "…" means Black to move.</p>`
  },
  {
    title: '🎯 How to Read "d4"',
    body: `<p>No piece letter = pawn. Destination is <strong>d4</strong>:</p>
    <p>→ Find file <strong>d</strong> (4th column from left)</p>
    <p>→ Find rank <strong>4</strong> (4th row from bottom)</p>
    <p>→ Move any pawn that can reach d4</p>
    <p style="margin-top:8px">For <strong>Nf3</strong>: find file f, rank 3, move your Knight there.</p>`
  },
  {
    title: '🔀 Disambiguation',
    body: `<p>When two identical pieces can both go to the same square, you specify which one with the file or rank:</p>
    <div class="g-code">Rfd1  — Rook on f-file → d1
R1d4  — Rook on rank 1 → d4
Nbd2  — Knight on b-file → d2</div>
    <p>This only comes up with Rooks, Bishops, and Knights (pieces you have two of).</p>`
  }
];
