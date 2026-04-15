/* ═══════════════════════════════════════
   practice.js — Practice Mode
═══════════════════════════════════════ */

function initPractice() {
  const boardId = makeBoard('prac-board-wrap', false);
  const board   = new ChessBoard(boardId);
  let current = null, moveIndex = 0;

  const sel = document.getElementById('prac-sel');
  OPENINGS.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.id;
    opt.textContent = op.name;
    sel.appendChild(opt);
  });

  function setStatus(msg, type) {
    const bar = document.getElementById('prac-st');
    bar.innerHTML = msg;
    bar.className = 'status-bar' + (type ? ' ' + type : '');
  }

  function addMoveToHistory(notation, index) {
    const list = document.getElementById('mv-hist');
    const num  = Math.ceil(index / 2);
    const isWhite = index % 2 === 1;
    if (isWhite) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="mn">${num}.</span><span class="mv mv-w">${notation}</span>`;
      li.id = 'pm' + index;
      list.appendChild(li);
    } else {
      const prev = document.getElementById('pm' + (index - 1));
      if (prev) prev.innerHTML += `<span class="mv mv-b">${notation}</span>`;
    }
    list.scrollTop = list.scrollHeight;
  }

  function loadOpening(id) {
    current = OPENINGS.find(o => o.id === id);
    if (!current) return;
    moveIndex = 0;
    board.reset();
    document.getElementById('mv-hist').innerHTML = '';
    document.getElementById('prac-hint').classList.add('hidden');
    setStatus(`Your turn — play <strong>${current.fm[0]}</strong> to start the ${current.name}`, '');
  }

  board.onMove = (fr, fc, tr, tc, notation) => {
    if (!current) return;
    const expected   = current.fm[moveIndex];
    const destPlayed = notation.slice(-2);
    const destExpect = expected.replace(/[+#Nx]/g, '').slice(-2);

    if (destPlayed === destExpect) {
      // Correct
      moveIndex++;
      addMoveToHistory(notation, moveIndex);
      recordMove(current.id, true);
      document.getElementById('prac-hint').classList.add('hidden');

      if (moveIndex >= current.fm.length) {
        setStatus(`✓ Opening complete! You played the ${current.name} perfectly.`, 'ok');
        return;
      }

      // Auto-play opponent
      const next  = current.fm[moveIndex];
      const color = moveIndex % 2 === 0 ? 'white' : 'black';
      setTimeout(() => {
        board.applyNotation(next, color);
        moveIndex++;
        addMoveToHistory(next, moveIndex);
        if (moveIndex >= current.fm.length) {
          setStatus('✓ Opening complete! Well done.', 'ok');
        } else {
          setStatus(`Good! Now play <strong>${current.fm[moveIndex]}</strong>`, '');
        }
      }, 380);

    } else {
      // Wrong
      recordMove(current.id, false);
      board.reset();
      for (let i = 0; i < moveIndex; i++) {
        const col = i % 2 === 0 ? 'white' : 'black';
        board.applyNotation(current.fm[i], col);
      }
      setStatus(`✗ Not quite — expected <strong>${expected}</strong>`, 'bad');
      const hint = document.getElementById('prac-hint');
      hint.classList.remove('hidden');
      hint.textContent = `💡 Hint: the correct move is ${expected}`;
    }
  };

  sel.addEventListener('change', () => loadOpening(sel.value));
  document.getElementById('prac-rst').addEventListener('click', () => {
    if (current) loadOpening(current.id);
  });

  loadOpening(OPENINGS[0].id);
}
