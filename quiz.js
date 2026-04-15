/* ═══════════════════════════════════════
   quiz.js — Flashcard Quiz
═══════════════════════════════════════ */

function initQuiz() {
  const boardId = makeBoard('quiz-board-wrap', true);
  const board   = new ChessBoard(boardId);

  let score = 0, total = 0, streak = 0, currentQ = null;

  const updateScores = () => {
    document.getElementById('q-score').textContent  = score;
    document.getElementById('q-total').textContent  = total;
    document.getElementById('q-streak').textContent = streak;
  };

  function buildOptions(correct) {
    const pool = new Set([correct]);
    OPENINGS.forEach(op => op.fm.forEach(m => {
      if (m !== correct && pool.size < 4) pool.add(m);
    }));
    ['Nf3','e4','d4','Bc4','c3','O-O','Bg5','f4','a3'].forEach(m => {
      if (m !== correct && pool.size < 4) pool.add(m);
    });
    return [...pool].sort(() => Math.random() - 0.5);
  }

  function nextQuestion() {
    document.getElementById('q-fb').classList.add('hidden');
    document.getElementById('q-next').classList.add('hidden');
    document.getElementById('q-opts').innerHTML = '';

    const op = OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
    const mi = Math.floor(Math.random() * Math.min(op.fm.length - 1, 6));

    board.reset();
    for (let i = 0; i < mi; i++) {
      board.applyNotation(op.fm[i], i % 2 === 0 ? 'white' : 'black');
    }

    const correct = op.fm[mi];
    currentQ = { op, mi, correct };

    document.getElementById('q-q').innerHTML =
      `<strong>${op.name}</strong><br>
       Move ${Math.floor(mi / 2) + 1} · ${mi % 2 === 0 ? 'White' : 'Black'} to play.<br>
       <em style="color:var(--dim);font-size:12px">What is the next move?</em>`;

    const cont = document.getElementById('q-opts');
    buildOptions(correct).forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'q-opt';
      btn.textContent = opt;
      btn.addEventListener('click', () => checkAnswer(opt, correct, op.id));
      cont.appendChild(btn);
    });
  }

  function checkAnswer(chosen, correct, openingId) {
    const isCorrect = chosen === correct;
    document.querySelectorAll('.q-opt').forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === correct) btn.classList.add('ok');
      if (btn.textContent === chosen && !isCorrect) btn.classList.add('bad');
    });

    total++;
    if (isCorrect) { score++; streak++; } else streak = 0;
    updateScores();
    recordMove(openingId, isCorrect);

    const fb = document.getElementById('q-fb');
    fb.classList.remove('hidden', 'ok', 'bad');
    fb.classList.add(isCorrect ? 'ok' : 'bad');
    fb.textContent = isCorrect
      ? `✓ Correct!${streak > 1 ? ` 🔥 ${streak} in a row` : ''}`
      : `✗ The correct move was ${correct}.`;

    board.applyNotation(correct, currentQ.mi % 2 === 0 ? 'white' : 'black');
    document.getElementById('q-next').classList.remove('hidden');
  }

  document.getElementById('q-start').addEventListener('click', () => {
    score = 0; total = 0; streak = 0;
    updateScores();
    document.getElementById('q-start').classList.add('hidden');
    nextQuestion();
  });
  document.getElementById('q-next').addEventListener('click', nextQuestion);
}
