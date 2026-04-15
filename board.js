/* ═══════════════════════════════════════
   board.js — Chess board engine
   ChessOpener · Meryem Benfarah
═══════════════════════════════════════ */

const GLYPHS = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
};
const WHITE_PIECES = new Set(['wK','wQ','wR','wB','wN','wP']);

const INIT_BOARD = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  Array(8).fill(null), Array(8).fill(null),
  Array(8).fill(null), Array(8).fill(null),
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR']
];

const FILES = 'abcdefgh';
const RANKS = '87654321';

/**
 * Creates a chessboard with coordinate labels inside a container div.
 * @param {string} containerId - ID of the wrapper element
 * @param {boolean} small - use smaller squares
 * @returns {string} - ID of the created board element
 */
function makeBoard(containerId, small = false) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return null;

  wrap.innerHTML = '';
  const boardId = 'board-' + containerId;

  const outer = document.createElement('div');
  outer.className = 'board-wrap';
  // Ensure coordinate labels and board squares share the same sizing.
  outer.style.setProperty('--sq', small ? '34px' : '52px');

  // File labels (top)
  const filesTop = document.createElement('div');
  filesTop.className = 'files-row';
  filesTop.style.paddingLeft = '22px';
  FILES.split('').forEach(f => {
    const s = document.createElement('span');
    s.textContent = f;
    filesTop.appendChild(s);
  });
  outer.appendChild(filesTop);

  // Middle row: rank labels + board
  const mid = document.createElement('div');
  mid.className = 'board-row';

  const ranksCol = document.createElement('div');
  ranksCol.className = 'ranks-col';
  RANKS.split('').forEach(r => {
    const s = document.createElement('span');
    s.textContent = r;
    ranksCol.appendChild(s);
  });
  mid.appendChild(ranksCol);

  const boardEl = document.createElement('div');
  boardEl.className = 'board' + (small ? ' sm' : '');
  boardEl.id = boardId;
  mid.appendChild(boardEl);

  outer.appendChild(mid);
  wrap.appendChild(outer);

  return boardId;
}

class ChessBoard {
  constructor(elId) {
    this.el = document.getElementById(elId);
    this.board = INIT_BOARD.map(r => [...r]);
    this.selected = null;
    this.lastMove = null;
    this.highlights = [];
    this.onMove = null;
    this._render();
  }

  reset() {
    this.board = INIT_BOARD.map(r => [...r]);
    this.selected = null;
    this.lastMove = null;
    this.highlights = [];
    this._render();
  }

  _render() {
    if (!this.el) return;
    this.el.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        sq.className = 'sq ' + ((r + c) % 2 === 0 ? 'l' : 'd');

        if (this.lastMove) {
          const [fr, fc, tr, tc] = this.lastMove;
          if ((r === fr && c === fc) || (r === tr && c === tc)) sq.classList.add('lm');
        }
        if (this.selected && this.selected[0] === r && this.selected[1] === c) sq.classList.add('sel');
        if (this.highlights.some(([x, y]) => x === r && y === c)) sq.classList.add('hl');

        const piece = this.board[r][c];
        if (piece) {
          const span = document.createElement('span');
          span.className = 'pc ' + (WHITE_PIECES.has(piece) ? 'white' : 'black');
          span.textContent = GLYPHS[piece];
          sq.appendChild(span);
        }

        sq.addEventListener('click', () => this._click(r, c));
        this.el.appendChild(sq);
      }
    }
  }

  _click(r, c) {
    if (this.selected) {
      const [sr, sc] = this.selected;
      if (this.highlights.some(([x, y]) => x === r && y === c)) {
        const notation = this._notation(sr, sc, r, c);
        this._move(sr, sc, r, c);
        this.selected = null;
        this.highlights = [];
        this._render();
        if (this.onMove) this.onMove(sr, sc, r, c, notation);
        return;
      }
      this.selected = null;
      this.highlights = [];
    }
    if (this.board[r][c]) {
      this.selected = [r, c];
      this.highlights = this._legalMoves(r, c);
    }
    this._render();
  }

  _move(fr, fc, tr, tc) {
    this.board[tr][tc] = this.board[fr][fc];
    this.board[fr][fc] = null;
    this.lastMove = [fr, fc, tr, tc];
    // Auto-promote pawn to queen
    if (this.board[tr][tc] === 'wP' && tr === 0) this.board[tr][tc] = 'wQ';
    if (this.board[tr][tc] === 'bP' && tr === 7) this.board[tr][tc] = 'bQ';
  }

  /** Apply a move from algebraic notation string */
  applyNotation(notation, color) {
    const clean = notation.replace(/[+#x]/g, '').replace('=Q', '');
    const pre = color === 'white' ? 'w' : 'b';

    // Castling
    if (clean === 'O-O' || clean === 'OO') {
      const row = color === 'white' ? 7 : 0;
      this._move(row, 4, row, 6);
      this._move(row, 7, row, 5);
      this._render();
      return true;
    }
    if (clean === 'O-O-O' || clean === 'OOO') {
      const row = color === 'white' ? 7 : 0;
      this._move(row, 4, row, 2);
      this._move(row, 0, row, 3);
      this._render();
      return true;
    }

    const dest = clean.slice(-2);
    const tc = FILES.indexOf(dest[0]);
    const tr = RANKS.indexOf(dest[1]);
    if (tc < 0 || tr < 0) return false;

    const pt = ('KQRBN'.includes(clean[0]) && clean[0] === clean[0].toUpperCase()) ? clean[0] : 'P';
    const fullPiece = pre + pt;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] !== fullPiece) continue;
        if (this._legalMoves(r, c).some(([a, b]) => a === tr && b === tc)) {
          this._move(r, c, tr, tc);
          this._render();
          return true;
        }
      }
    }
    return false;
  }

  _notation(fr, fc, tr, tc) {
    const piece = this.board[fr][fc];
    const dest = FILES[tc] + RANKS[tr];
    if (piece && piece[1] === 'P') return fc !== tc ? FILES[fc] + 'x' + dest : dest;
    return (piece ? piece[1] : '') + (this.board[tr][tc] ? 'x' : '') + dest;
  }

  _legalMoves(r, c) {
    const piece = this.board[r][c];
    if (!piece) return [];
    const type = piece[1], color = piece[0], moves = [];

    const inB  = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const isEmpty = (r, c) => inB(r, c) && !this.board[r][c];
    const isEnemy = (r, c) => inB(r, c) && this.board[r][c] && this.board[r][c][0] !== color;
    const canGo = (r, c) => isEmpty(r, c) || isEnemy(r, c);

    const slide = dirs => {
      for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        while (inB(nr, nc)) {
          if (this.board[nr][nc]) { if (isEnemy(nr, nc)) moves.push([nr, nc]); break; }
          moves.push([nr, nc]);
          nr += dr; nc += dc;
        }
      }
    };
    const jump = dests => {
      for (const [dr, dc] of dests) {
        const nr = r + dr, nc = c + dc;
        if (inB(nr, nc) && canGo(nr, nc)) moves.push([nr, nc]);
      }
    };

    if (type === 'P') {
      const dir = color === 'w' ? -1 : 1;
      const start = color === 'w' ? 6 : 1;
      if (isEmpty(r + dir, c)) {
        moves.push([r + dir, c]);
        if (r === start && isEmpty(r + 2 * dir, c)) moves.push([r + 2 * dir, c]);
      }
      if (isEnemy(r + dir, c - 1)) moves.push([r + dir, c - 1]);
      if (isEnemy(r + dir, c + 1)) moves.push([r + dir, c + 1]);
    }
    if (type === 'N') jump([[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]);
    if (type === 'B') slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
    if (type === 'R') slide([[-1,0],[1,0],[0,-1],[0,1]]);
    if (type === 'Q') slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
    if (type === 'K') jump([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);

    return moves;
  }
}
