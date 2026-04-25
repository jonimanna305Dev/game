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
    p.style.background = i % 2 === 0 
      ? 'rgba(180,220,255,0.9)' 
      : 'rgba(255,180,255,0.8)';
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
  const backToMenuBtn = document.getElementById('backToMenuBtn');
  const restartButton = document.getElementById('restartButton');
  const installBtn = document.getElementById("installBtn");

  let deferredPrompt = null;

  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameActive = true;
  let gameMode = 'pvp';
  let aiDifficulty = 'easy';
  let scores = { X: 0, O: 0 };
  let winningCombo = [];

  const diffButtons = document.querySelectorAll('.diff-btn');

  // ---------- PWA INSTALL ----------
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (installBtn) {
      installBtn.style.display = "block";
    }

    console.log("PWA ready to install");
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      console.log(choice.outcome);
      deferredPrompt = null;
      installBtn.style.display = "none";
    });
  }

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
    if (boardState.every(cell => cell !== null)) {
      return { winner: 'draw', combo: [] };
    }
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

      if (winningCombo.includes(i)) {
        cell.classList.add('winning-cell');
      }

      cell.addEventListener('click', cellClickHandler);
      gridContainer.appendChild(cell);
    }
  }

  function handleResult(winner, combo) {
    if (winner === 'draw') {
      turnDisplay.textContent = 'DRAW 🌐';
      gameActive = false;
      return;
    }

    scores[winner]++;
    updateScoreDisplay();
    turnDisplay.textContent = `${winner} WINS! ✨`;
    gameActive = false;
    winningCombo = combo;
    renderBoard();
  }

  function makeMove(index, player) {
    if (!gameActive || board[index] !== null) return;

    board[index] = player;

    const result = checkWinner(board);
    if (result) {
      handleResult(result.winner, result.combo);
      return;
    }

    renderBoard();
    switchTurn();

    if (gameMode === 'ai' && currentPlayer === 'O') {
      setTimeout(aiMove, 250);
    }
  }

  function cellClickHandler(e) {
    const index = e.currentTarget.dataset.index;
    if (!gameActive || board[index] !== null) return;

    makeMove(parseInt(index), currentPlayer);
  }

  function aiMove() {
    const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    const move = empty[Math.floor(Math.random() * empty.length)];
    if (move !== undefined) makeMove(move, 'O');
  }

  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    winningCombo = [];
    turnDisplay.textContent = 'X TURN';
    renderBoard();
  }

  function startGame(mode) {
    gameMode = mode;
    scores = { X: 0, O: 0 };
    updateScoreDisplay();
    resetGame();

    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  }

  // ---------- EVENTS ----------
  playerVsPlayerBtn.onclick = () => startGame('pvp');
  playerVsAiBtn.onclick = () => startGame('ai');
  backToMenuBtn.onclick = () => {
    gameScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
  };
  restartButton.onclick = resetGame;

  diffButtons.forEach(btn => {
    btn.onclick = (e) => {
      diffButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      aiDifficulty = e.target.dataset.diff;
    };
  });

  renderBoard();

})();