document.addEventListener('DOMContentLoaded', () => {
    // Configurações do Jogo
    const BOARD_SIZE = 10;
    const shipTypes = [
        { name: 'Submarino', size: 1, count: 4 },
        { name: 'Contratorpedeiro', size: 2, count: 3 },
        { name: 'Cruzador', size: 3, count: 2 }
    ];

    // Estado do Jogo
    const gameState = {
        player1: {
            board: createEmptyBoard(),
            ships: [],
            isReady: false
        },
        player2: {
            board: createEmptyBoard(),
            ships: [],
            isReady: false
        },
        currentTurn: 1,
        phase: 'setup',
        setupPlayer: 1,
        currentShipIndex: 0,
        isHorizontal: true,
        isWaiting: false
    };

    // Gera lista plana de navios baseada nas quantidades
    function generateShipList() {
        const list = [];
        shipTypes.forEach(type => {
            for (let i = 0; i < type.count; i++) {
                list.push({ ...type });
            }
        });
        return list;
    }

    let shipsToPlace = generateShipList();

    function createEmptyBoard() {
        return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    }

    const board1Element = document.getElementById('board-1');
    const board2Element = document.getElementById('board-2');
    const rotateBtn = document.getElementById('rotate-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');
    const currentShipNameSpan = document.getElementById('current-ship-name');
    const currentShipSizeSpan = document.getElementById('current-ship-size');
    const messageArea = document.querySelector('#message-area p');

    // Novos elementos da Fase 4 e 5
    const transitionScreen = document.getElementById('transition-screen');
    const transitionMessage = document.getElementById('transition-message');
    const startTurnBtn = document.getElementById('start-turn-btn');
    const winScreen = document.getElementById('win-screen');
    const winMessage = document.getElementById('win-message');
    const resetBtn = document.getElementById('reset-btn');

    function updateSetupUI() {

        if (gameState.currentShipIndex < shipsToPlace.length) {
            const ship = shipsToPlace[gameState.currentShipIndex];
            currentShipNameSpan.textContent = ship.name;
            currentShipSizeSpan.textContent = ship.size;
        } else {
            document.getElementById('ship-info').classList.add('hidden');
            rotateBtn.classList.add('hidden');
            nextPlayerBtn.classList.remove('hidden');
            messageArea.textContent = `Jogador ${gameState.setupPlayer} terminou de posicionar! Clique em Próximo Jogador.`;
            // Oculta o tabuleiro do jogador atual para o próximo não ver
            document.getElementById(`player${gameState.setupPlayer}-area`).classList.add('hidden');
        }
    }

    function renderBoard(boardElement, playerNum) {
        boardElement.innerHTML = '';
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.dataset.player = playerNum;
                
                cell.addEventListener('mouseover', handleMouseOver);
                cell.addEventListener('mouseout', handleMouseOut);
                cell.addEventListener('click', handleClick);
                
                boardElement.appendChild(cell);
            }
        }
    }

    function getShipCells(startX, startY, size, isHorizontal) {
        const cells = [];
        for (let i = 0; i < size; i++) {
            const x = isHorizontal ? startX + i : startX;
            const y = isHorizontal ? startY : startY + i;
            if (x < BOARD_SIZE && y < BOARD_SIZE) {
                cells.push({ x, y });
            } else {
                return null; // Fora do board
            }
        }
        return cells;
    }

    function isValidPlacement(playerNum, shipCells) {
        if (!shipCells) return false;
        const board = gameState[`player${playerNum}`].board;
        return shipCells.every(cell => board[cell.y][cell.x] === null);
    }

    function handleMouseOver(e) {
        if (gameState.phase !== 'setup') return;
        const playerNum = parseInt(e.target.dataset.player);
        if (playerNum !== gameState.setupPlayer) return;
        if (gameState.currentShipIndex >= shipsToPlace.length) return;

        const startX = parseInt(e.target.dataset.x);
        const startY = parseInt(e.target.dataset.y);
        const ship = shipsToPlace[gameState.currentShipIndex];
        const shipCells = getShipCells(startX, startY, ship.size, gameState.isHorizontal);

        clearPreviews();

        if (shipCells) {
            const isValid = isValidPlacement(playerNum, shipCells);
            shipCells.forEach(pos => {
                const cellElement = document.querySelector(`.board[id="board-${playerNum}"] .cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
                cellElement.classList.add('preview');
                if (!isValid) cellElement.classList.add('invalid');
            });
        } else {
            e.target.classList.add('preview', 'invalid');
        }
    }

    function handleMouseOut() {
        clearPreviews();
    }

    function clearPreviews() {
        document.querySelectorAll('.cell.preview').forEach(cell => {
            cell.classList.remove('preview', 'invalid');
        });
    }

    function handleClick(e) {
        if (gameState.phase === 'setup') {
            const playerNum = parseInt(e.target.dataset.player);
            if (playerNum !== gameState.setupPlayer) return;
            if (gameState.currentShipIndex >= shipsToPlace.length) return;

            const startX = parseInt(e.target.dataset.x);
            const startY = parseInt(e.target.dataset.y);
            const ship = shipsToPlace[gameState.currentShipIndex];
            const shipCells = getShipCells(startX, startY, ship.size, gameState.isHorizontal);

            if (isValidPlacement(playerNum, shipCells)) {
                const board = gameState[`player${playerNum}`].board;
                shipCells.forEach(pos => {
                    board[pos.y][pos.x] = gameState.currentShipIndex;
                    const cellElement = document.querySelector(`.board[id="board-${playerNum}"] .cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
                    cellElement.classList.add('ship');
                });

                gameState[`player${playerNum}`].ships.push({
                    ...ship,
                    cells: shipCells,
                    hits: 0
                });

                gameState.currentShipIndex++;
                updateSetupUI();
            }
        } else if (gameState.phase === 'battle') {
            if (gameState.isWaiting) return;
            
            const clickedPlayerNum = parseInt(e.target.dataset.player);
            const shooterNum = gameState.currentTurn;
            const targetPlayerNum = shooterNum === 1 ? 2 : 1;

            // Só pode atirar no tabuleiro do oponente
            if (clickedPlayerNum !== targetPlayerNum) return;

            const x = parseInt(e.target.dataset.x);
            const y = parseInt(e.target.dataset.y);
            const cellElement = e.target;

            // Verifica se já foi atingida
            if (cellElement.classList.contains('hit') || cellElement.classList.contains('miss')) {
                return;
            }

            gameState.isWaiting = true;

            const targetBoard = gameState[`player${targetPlayerNum}`].board;
            const content = targetBoard[y][x];

            if (content !== null) {
                // ACERTOU
                cellElement.classList.add('hit');
                const shipIndex = content;
                const ship = gameState[`player${targetPlayerNum}`].ships[shipIndex];
                ship.hits++;

                if (ship.hits === ship.size) {
                    messageArea.textContent = `Jogador ${shooterNum} AFUNDOU o ${ship.name} do Jogador ${targetPlayerNum}!`;
                    // Aplica classe sunk em todas as células do navio
                    ship.cells.forEach(pos => {
                        const sunkCell = document.querySelector(`#board-${targetPlayerNum} .cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
                        sunkCell.classList.add('sunk');
                    });
                } else {
                    messageArea.textContent = `Jogador ${shooterNum} ACERTOU um navio!`;
                }

                if (checkWin(targetPlayerNum)) {
                    gameState.phase = 'finished';
                    setTimeout(() => {
                        winMessage.textContent = `Jogador ${shooterNum} venceu!`;
                        winScreen.classList.remove('hidden');
                    }, 1000);
                    return;
                }
            } else {
                // ERROU
                cellElement.classList.add('miss');
                messageArea.textContent = `Jogador ${shooterNum} ERROU o tiro.`;
            }

            // Após o tiro, mostra tela de transição para trocar o turno
            setTimeout(() => {
                if (gameState.phase !== 'finished') {
                    gameState.isWaiting = false;
                    showTransitionScreen();
                }
            }, 1500);
        }
    }

    function checkWin(playerNum) {
        const player = gameState[`player${playerNum}`];
        const totalShipCells = player.ships.reduce((acc, ship) => acc + ship.size, 0);
        const totalHits = player.ships.reduce((acc, ship) => acc + ship.hits, 0);
        return totalHits === totalShipCells;
    }

    rotateBtn.addEventListener('click', () => {
        gameState.isHorizontal = !gameState.isHorizontal;
        rotateBtn.textContent = `Girar (${gameState.isHorizontal ? 'Horizontal' : 'Vertical'})`;
    });

    nextPlayerBtn.addEventListener('click', () => {
        if (gameState.setupPlayer === 1) {
            // Prepara para o Jogador 2
            gameState.setupPlayer = 2;
            gameState.currentShipIndex = 0;
            document.getElementById('player1-area').classList.add('hidden');
            document.getElementById('player2-area').classList.remove('hidden');
            nextPlayerBtn.classList.add('hidden');
            document.getElementById('ship-info').classList.remove('hidden');
            rotateBtn.classList.remove('hidden');
            messageArea.textContent = 'Jogador 2: Organize seus navios.';
            updateSetupUI();
        } else {
            // Inicia a fase de batalha
            gameState.phase = 'battle';
            gameState.currentTurn = 2; // Será alternado para 1 no showTransitionScreen/switchTurn
            document.getElementById('setup-controls').classList.add('hidden');
            showTransitionScreen();
        }
    });

    function showTransitionScreen() {
        const nextPlayer = gameState.currentTurn === 1 ? 2 : 1;
        transitionMessage.textContent = `Vez do Jogador ${nextPlayer}`;
        transitionScreen.classList.remove('hidden');
        // Esconde as áreas de jogo durante a transição
        document.getElementById('player1-area').classList.add('hidden');
        document.getElementById('player2-area').classList.add('hidden');
    }

    startTurnBtn.addEventListener('click', () => {
        transitionScreen.classList.add('hidden');
        switchTurn();
    });

    function switchTurn() {
        gameState.currentTurn = gameState.currentTurn === 1 ? 2 : 1;
        updateBattleUI();
    }

    function updateBattleUI() {
        const currentPlayer = gameState.currentTurn;
        const opponentPlayer = currentPlayer === 1 ? 2 : 1;

        messageArea.textContent = `Jogador ${currentPlayer}, sua vez de atirar!`;

        const currentPlayerArea = document.getElementById(`player${currentPlayer}-area`);
        const opponentPlayerArea = document.getElementById(`player${opponentPlayer}-area`);

        currentPlayerArea.classList.remove('hidden');
        opponentPlayerArea.classList.remove('hidden');

        // Indica qual é o tabuleiro alvo
        document.getElementById(`board-${currentPlayer}`).classList.remove('target');
        document.getElementById(`board-${opponentPlayer}`).classList.add('target');

        refreshBoardsVisibility();
    }

    function refreshBoardsVisibility() {
        const currentPlayerNum = gameState.currentTurn;
        
        // Remove visibilidade de todos os navios primeiro
        document.querySelectorAll('.cell.ship').forEach(cell => {
            cell.classList.remove('ship');
        });

        // Mostra apenas os navios do jogador atual no tabuleiro DELE
        const myShips = gameState[`player${currentPlayerNum}`].ships;
        myShips.forEach(ship => {
            ship.cells.forEach(pos => {
                const cellElement = document.querySelector(`#board-${currentPlayerNum} .cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
                if (cellElement) cellElement.classList.add('ship');
            });
        });
    }

    function resetGame() {
        // Reseta o estado
        gameState.player1.board = createEmptyBoard();
        gameState.player1.ships = [];
        gameState.player2.board = createEmptyBoard();
        gameState.player2.ships = [];
        gameState.currentTurn = 1;
        gameState.phase = 'setup';
        gameState.setupPlayer = 1;
        gameState.currentShipIndex = 0;
        gameState.isHorizontal = true;
        gameState.isWaiting = false;

        shipsToPlace = generateShipList();

        // Reseta UI
        document.querySelectorAll('.cell').forEach(cell => {
            cell.className = 'cell';
        });
        document.getElementById('setup-controls').classList.remove('hidden');
        document.getElementById('ship-info').classList.remove('hidden');
        rotateBtn.classList.remove('hidden');
        nextPlayerBtn.classList.add('hidden');
        winScreen.classList.add('hidden');
        transitionScreen.classList.add('hidden');
        
        document.getElementById('player1-area').classList.remove('hidden');
        document.getElementById('player2-area').classList.add('hidden');
        
        document.getElementById('board-1').classList.remove('target');
        document.getElementById('board-2').classList.remove('target');

        messageArea.textContent = 'Bem-vindo ao Batalha Naval! Organize seus navios.';
        updateSetupUI();
    }

    resetBtn.addEventListener('click', resetGame);

    // Inicialização
    renderBoard(board1Element, 1);
    renderBoard(board2Element, 2);
    
    // Esconde o board 2 inicialmente no setup
    document.getElementById('player2-area').classList.add('hidden');

    updateSetupUI();

    console.log('Lógica de posicionamento inicializada');
});
