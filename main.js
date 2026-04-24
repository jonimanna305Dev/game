(function() {
    // ---------- PARTICLES ----------
    const particlesDiv = document.getElementById('particlesContainer');
    for (let i = 0; i < 45; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 7 + 2;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 9 + 's';
      p.style.background = i % 2 === 0 ? 'rgba(180,220,255,0.9)' : 'rgba(255,180,255,0.8)';
      particlesDiv.appendChild(p);
    }

    // ---------- GAME STATE ----------
    const menuScreen = document.getElementById('menuScreen');
    const gameScreen = document.getElementById('gameScreen');
    const gridContainer = document.getElementById('gridContainer');
    const turnDisplay = document.getElementById('turnDisplay');
    const scoreXSpan = document.getElementById('scoreX');
    const scoreOSpan = document.getElementById('scoreO');
    const playerVsPlayerBtn = document.getElementById('playerVsPlayerBtn');
    const playerVsAiBtn = document.getElementById('playerVsAiBtn');
    const difficultyGroup = document.getElementById('difficultyGroup');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const restartButton = document.getElementById('restartButton');

    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let gameActive = true;
    let gameMode = 'pvp'; // 'pvp' or 'ai'
    let aiDifficulty = 'easy';
    let scores = { X: 0, O: 0 };
    let winningCombo = [];

    // UI elements for difficulty
    const diffButtons = document.querySelectorAll('.diff-btn');

    // ---------- FUNCTIONS ----------
    function updateScoreDisplay() {
      scoreXSpan.textContent = scores.X;
      scoreOSpan.textContent = scores.O;
    }

    function switchTurn() {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      turnDisplay.textContent = `${currentPlayer} TURN`;
      turnDisplay.style.color = currentPlayer === 'X' ? '#0af' : '#f76bcd';
    }

    function checkWinner(boardState) {
      const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];
      for (let line of lines) {
        const [a,b,c] = line;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[b] === boardState[c]) {
          return { winner: boardState[a], combo: line };
        }
      }
      if (boardState.every(cell => cell !== null)) return { winner: 'draw', combo: [] };
      return null;
    }

    function renderBoard() {
      gridContainer.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        if (board[i] === 'X') {
          cell.textContent = 'X';
          cell.classList.add('X-move');
        } else if (board[i] === 'O') {
          cell.textContent = 'O';
          cell.classList.add('O-move');
        }
        // highlight winning cells
        if (winningCombo.includes(i)) {
          cell.classList.add('winning-cell');
        }
        cell.addEventListener('click', cellClickHandler);
        gridContainer.appendChild(cell);
      }
    }

    function animateMove(index) {
      const cells = document.querySelectorAll('.cell');
      if (cells[index]) {
        cells[index].classList.add('move-animation');
        setTimeout(() => cells[index]?.classList.remove('move-animation'), 350);
      }
    }

    function handleResult(winner, combo) {
      if (winner === 'draw') {
        turnDisplay.textContent = 'DRAW 🌐';
        gameActive = false;
        return;
      }
      if (winner === 'X' || winner === 'O') {
        scores[winner] += 1;
        updateScoreDisplay();
        turnDisplay.textContent = `${winner} WINS! ✨`;
        gameActive = false;
        winningCombo = combo;
        renderBoard();
      }
    }

    function makeMove(index, player) {
      if (!gameActive || board[index] !== null) return false;
      board[index] = player;
      animateMove(index);
      const result = checkWinner(board);
      if (result) {
        winningCombo = result.combo || [];
        handleResult(result.winner, result.combo);
        renderBoard();
        return true;
      }
      renderBoard();
      switchTurn();
      return true;
    }

    function cellClickHandler(e) {
      const index = e.currentTarget.dataset.index;
      if (!gameActive || board[index] !== null) return;
      if (gameMode === 'ai' && currentPlayer === 'O') return; // human is X

      const moveSuccess = makeMove(parseInt(index), currentPlayer);
      if (moveSuccess && gameMode === 'ai' && gameActive && currentPlayer === 'O') {
        setTimeout(aiMove, 250);
      }
    }

    // AI logic
    function aiMove() {
      if (!gameActive || currentPlayer !== 'O' || gameMode !== 'ai') return;
      const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(v => v !== null);
      if (emptyIndices.length === 0) return;

      let chosenIndex;
      if (aiDifficulty === 'easy') {
        chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      } else if (aiDifficulty === 'medium') {
        // 50% smart, 50% random
        if (Math.random() < 0.5) {
          chosenIndex = getBestMoveForAI();
        } else {
          chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
      } else { // hard
        chosenIndex = getBestMoveForAI();
      }
      if (chosenIndex !== undefined && board[chosenIndex] === null) {
        makeMove(chosenIndex, 'O');
      }
    }

    function getBestMoveForAI() {
      // minimax for O (AI)
      let bestScore = -Infinity;
      let bestMove = null;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = minimax(board, 0, false);
          board[i] = null;
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return bestMove;
    }

    function minimax(tempBoard, depth, isMaximizing) {
      const result = checkWinner(tempBoard);
      if (result) {
        if (result.winner === 'O') return 10 - depth;
        if (result.winner === 'X') return depth - 10;
        if (result.winner === 'draw') return 0;
      }
      if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (tempBoard[i] === null) {
            tempBoard[i] = 'O';
            best = Math.max(best, minimax(tempBoard, depth+1, false));
            tempBoard[i] = null;
          }
        }
        return best;
      } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
          if (tempBoard[i] === null) {
            tempBoard[i] = 'X';
            best = Math.min(best, minimax(tempBoard, depth+1, true));
            tempBoard[i] = null;
          }
        }
        return best;
      }
    }

    function resetGame() {
      board = Array(9).fill(null);
      currentPlayer = 'X';
      gameActive = true;
      winningCombo = [];
      turnDisplay.textContent = 'X TURN';
      turnDisplay.style.color = '#0af';
      renderBoard();
    }

    function startGame(mode) {
      gameMode = mode;
      resetGame();
      scores = { X: 0, O: 0 };
      updateScoreDisplay();
      menuScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      // if AI mode and O starts? No, X always starts. So no immediate AI.
    }

    // Event listeners
    playerVsPlayerBtn.addEventListener('click', () => startGame('pvp'));
    playerVsAiBtn.addEventListener('click', () => startGame('ai'));

    diffButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        diffButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        aiDifficulty = e.target.dataset.diff;
      });
    });

    backToMenuBtn.addEventListener('click', () => {
      gameScreen.classList.add('hidden');
      menuScreen.classList.remove('hidden');
      gameActive = false;
    });

    restartButton.addEventListener('click', () => {
      resetGame();
      if (gameMode === 'ai' && currentPlayer === 'O') {
        setTimeout(aiMove, 200);
      }
    });

    // initial render empty (menu active)
    renderBoard();
  })();

  window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log("PWA install ready");
});
