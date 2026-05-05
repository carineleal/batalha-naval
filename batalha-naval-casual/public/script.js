document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const board1Element = document.getElementById('board-1');
    const board2Element = document.getElementById('board-2');
    const messageArea = document.querySelector('#message-area p');
    const rotateBtn = document.getElementById('rotate-btn');
    
    // Configurações do Jogo
    const BOARD_SIZE = 10;
    const shipTypes = [
        { name: 'Submarino', size: 1, count: 4 },
        { name: 'Contratorpedeiro', size: 2, count: 3 },
        { name: 'Cruzador', size: 3, count: 2 }
    ];

    const shipsToPlace = [];
    shipTypes.forEach(ship => {
        for (let i = 0; i < ship.count; i++) {
            shipsToPlace.push(ship);
        }
    });

    // Estado Local do Jogo
    let currentShipIndex = 0;
    let isHorizontal = true;
    let phase = 'setup'; // setup, battle, finished
    let myShipsPlaced = false;
    let turn = 1; // 1 = Player, 2 = AI
    
    const gameState = {
        me: { board: createEmptyBoard(), ships: [] },
        opponent: { board: createEmptyBoard(), ships: [] }
    };

    function createEmptyBoard() {
        return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    }

    // --- LÓGICA DO JOGO ---

    function initGame() {
        renderBoard(board1Element, 1);
        renderBoard(board2Element, 2);
        updateSetupUI();
        setupOpponent();
    }

    function setupOpponent() {
        const opponentShips = [
            { name: 'Cruzador', size: 3, cells: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}] },
            { name: 'Cruzador', size: 3, cells: [{x: 5, y: 5}, {x: 5, y: 6}, {x: 5, y: 7}] },
            { name: 'Contratorpedeiro', size: 2, cells: [{x: 8, y: 1}, {x: 9, y: 1}] },
            { name: 'Contratorpedeiro', size: 2, cells: [{x: 1, y: 5}, {x: 1, y: 6}] },
            { name: 'Contratorpedeiro', size: 2, cells: [{x: 8, y: 8}, {x: 9, y: 8}] },
            { name: 'Submarino', size: 1, cells: [{x: 3, y: 3}] },
            { name: 'Submarino', size: 1, cells: [{x: 6, y: 1}] },
            { name: 'Submarino', size: 1, cells: [{x: 0, y: 9}] },
            { name: 'Submarino', size: 1, cells: [{x: 9, y: 4}] }
        ];

        opponentShips.forEach(ship => {
            ship.hitCount = 0;
            ship.cells.forEach(c => {
                gameState.opponent.board[c.y][c.x] = ship;
            });
            gameState.opponent.ships.push(ship);
        });
    }

    function renderBoard(container, playerNum) {
        container.innerHTML = '';
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.dataset.player = playerNum;
                cell.addEventListener('click', handleClick);
                cell.addEventListener('mouseover', handleMouseOver);
                cell.addEventListener('mouseout', handleMouseOut);
                container.appendChild(cell);
            }
        }
    }

    function updateSetupUI() {
        if (currentShipIndex < shipsToPlace.length) {
            const ship = shipsToPlace[currentShipIndex];
            document.getElementById('current-ship-name').textContent = ship.name;
            document.getElementById('current-ship-size').textContent = ship.size;
        } else {
            myShipsPlaced = true;
            phase = 'battle';
            document.getElementById('setup-controls').classList.add('hidden');
            board2Element.classList.add('target');
            messageArea.textContent = "BATALHA INICIADA! Atire no tabuleiro da IA (direita).";
        }
    }

    function handleMouseOver(e) {
        if (phase !== 'setup' || myShipsPlaced) return;
        const playerNum = parseInt(e.target.dataset.player);
        if (playerNum !== 1) return;

        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const ship = shipsToPlace[currentShipIndex];
        const cells = getShipCells(x, y, ship.size, isHorizontal);

        clearPreviews();
        if (cells) {
            const valid = isValidPlacement(cells);
            cells.forEach(c => {
                const cellEl = document.querySelector(`#board-1 .cell[data-x="${c.x}"][data-y="${c.y}"]`);
                if (cellEl) cellEl.classList.add(valid ? 'preview' : 'invalid');
            });
        }
    }

    function handleMouseOut() {
        clearPreviews();
    }

    function clearPreviews() {
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('preview', 'invalid');
        });
    }

    function getShipCells(x, y, size, horizontal) {
        const cells = [];
        for (let i = 0; i < size; i++) {
            const curX = horizontal ? x + i : x;
            const curY = horizontal ? y : y + i;
            if (curX >= BOARD_SIZE || curY >= BOARD_SIZE) return null;
            cells.push({ x: curX, y: curY });
        }
        return cells;
    }

    function isValidPlacement(cells) {
        return cells.every(c => gameState.me.board[c.y][c.x] === null);
    }

    function handleClick(e) {
        if (phase === 'setup' && !myShipsPlaced) {
            const playerNum = parseInt(e.target.dataset.player);
            if (playerNum !== 1) return;

            const x = parseInt(e.target.dataset.x);
            const y = parseInt(e.target.dataset.y);
            const ship = shipsToPlace[currentShipIndex];
            const cells = getShipCells(x, y, ship.size, isHorizontal);

            if (cells && isValidPlacement(cells)) {
                cells.forEach(c => {
                    gameState.me.board[c.y][c.x] = { ...ship, hitCount: 0 };
                    document.querySelector(`#board-1 .cell[data-x="${c.x}"][data-y="${c.y}"]`).classList.add('ship');
                });
                gameState.me.ships.push({ ...ship, cells, hitCount: 0 });
                
                currentShipIndex++;
                updateSetupUI();
            }
        } else if (phase === 'battle' && turn === 1) {
            const clickedPlayer = parseInt(e.target.dataset.player);
            if (clickedPlayer === 1) return; 

            const x = parseInt(e.target.dataset.x);
            const y = parseInt(e.target.dataset.y);
            
            const cell = e.target;
            if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;

            processPlayerShot(x, y, cell);
        }
    }

    function processPlayerShot(x, y, cell) {
        const target = gameState.opponent.board[y][x];
        let hit = false;
        let sunk = false;

        if (target) {
            hit = true;
            target.hitCount++;
            cell.classList.add('hit');
            if (target.hitCount === target.size) sunk = true;
            messageArea.textContent = sunk ? `VOCÊ AFUNDOU UM ${target.name.toUpperCase()}!` : "VOCÊ ACERTOU!";
        } else {
            cell.classList.add('miss');
            messageArea.textContent = "Você errou...";
        }

        checkGameOver();

        if (phase === 'battle' && !hit) {
            turn = 2;
            board2Element.classList.remove('target');
            setTimeout(processAIShot, 1000);
        }
    }

    function processAIShot() {
        if (phase !== 'battle') return;

        let x, y, cell;
        do {
            x = Math.floor(Math.random() * BOARD_SIZE);
            y = Math.floor(Math.random() * BOARD_SIZE);
            cell = document.querySelector(`#board-1 .cell[data-x="${x}"][data-y="${y}"]`);
        } while (cell.classList.contains('hit') || cell.classList.contains('miss'));

        const target = gameState.me.board[y][x];
        let hit = false;
        let sunk = false;

        if (target) {
            hit = true;
            target.hitCount++;
            cell.classList.add('hit');
            if (target.hitCount === target.size) sunk = true;
            messageArea.textContent = `IA acertou seu ${target.name}!`;
        } else {
            cell.classList.add('miss');
            messageArea.textContent = "IA errou o tiro.";
        }

        checkGameOver();

        if (phase === 'battle') {
            if (hit) {
                setTimeout(processAIShot, 1000);
            } else {
                turn = 1;
                board2Element.classList.add('target');
                messageArea.textContent = "SUA VEZ! Atire no tabuleiro da direita.";
            }
        }
    }

    function checkGameOver() {
        const myHitsNeeded = shipTypes.reduce((a, b) => a + (b.size * b.count), 0);
        const playerHits = gameState.opponent.ships.reduce((a, b) => a + b.hitCount, 0);
        const aiHits = gameState.me.ships.reduce((a, b) => a + b.hitCount, 0);

        if (playerHits === myHitsNeeded) {
            showGameOver('VOCÊ VENCEU!');
        } else if (aiHits === myHitsNeeded) {
            showGameOver('IA VENCEU!');
        }
    }

    function showGameOver(message) {
        phase = 'finished';
        const winScreen = document.getElementById('win-screen');
        const winMessage = document.getElementById('win-message');
        winMessage.textContent = message;
        winScreen.classList.remove('hidden');
    }

    rotateBtn.addEventListener('click', () => {
        isHorizontal = !isHorizontal;
        rotateBtn.textContent = `Girar (${isHorizontal ? 'Horizontal' : 'Vertical'})`;
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        location.reload();
    });

    initGame();
});
