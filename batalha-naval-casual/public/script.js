document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const board1Element = document.getElementById('board-1');
    const board2Element = document.getElementById('board-2');
    const messageArea = document.querySelector('#message-area p');
    const rotateBtn = document.getElementById('rotate-btn');
    const turnBanner = document.getElementById('turn-banner');
    const gameContainer = document.getElementById('game-container');
    const coinCountEl = document.getElementById('coin-count');
    const shopModal = document.getElementById('shop-modal');
    const powerupsBar = document.getElementById('powerups-bar');
    
    // --- SISTEMA DE ECONOMIA E SAVE ---

    let playerProfile = {
        coins: 500,
        inventory: { radar: 0, airstrike: 0 }
    };

    function loadProfile() {
        const saved = localStorage.getItem('battleship_profile');
        if (saved) {
            playerProfile = JSON.parse(saved);
        }
        updateEconomyUI();
    }

    function saveProfile() {
        localStorage.setItem('battleship_profile', JSON.stringify(playerProfile));
        updateEconomyUI();
    }

    function updateEconomyUI() {
        coinCountEl.textContent = playerProfile.coins;
        document.getElementById('count-radar').textContent = playerProfile.inventory.radar;
        document.getElementById('count-airstrike').textContent = playerProfile.inventory.airstrike;
    }

    window.buyItem = function(item, price) {
        if (playerProfile.coins >= price) {
            playerProfile.coins -= price;
            playerProfile.inventory[item]++;
            saveProfile();
        } else {
            alert("Moedas insuficientes!");
        }
    };

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

    // --- POWER-UPS LOGIC ---

    function useRadar() {
        if (playerProfile.inventory.radar <= 0 || turn !== 1 || phase !== 'battle') return;
        
        playerProfile.inventory.radar--;
        saveProfile();
        
        // Revela uma área 3x3 aleatória que contém um navio ou apenas área vazia
        const centerX = Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1;
        const centerY = Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1;

        for (let y = centerY - 1; y <= centerY + 1; y++) {
            for (let x = centerX - 1; x <= centerX + 1; x++) {
                const cell = document.querySelector(`#board-2 .cell[data-x="${x}"][data-y="${y}"]`);
                if (cell && !cell.classList.contains('hit') && !cell.classList.contains('miss')) {
                    cell.classList.add('radar-ping');
                    setTimeout(() => cell.classList.remove('radar-ping'), 2000);
                }
            }
        }
        messageArea.textContent = "Radar ativado! Olhe o tabuleiro inimigo.";
    }

    function useAirstrike() {
        if (playerProfile.inventory.airstrike <= 0 || turn !== 1 || phase !== 'battle') return;

        playerProfile.inventory.airstrike--;
        saveProfile();

        messageArea.textContent = "Ataque Aéreo em curso!";
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                let x, y, cell;
                do {
                    x = Math.floor(Math.random() * BOARD_SIZE);
                    y = Math.floor(Math.random() * BOARD_SIZE);
                    cell = document.querySelector(`#board-2 .cell[data-x="${x}"][data-y="${y}"]`);
                } while (cell.classList.contains('hit') || cell.classList.contains('miss'));
                
                processPlayerShot(x, y, cell, true); // true = via powerup (don't end turn)
            }, i * 400);
        }
    }

    // --- SISTEMA DE ANÚNCIOS (ADMOB) ---

    async function initAds() {
        if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
            console.log('AdMob: Plataforma não nativa, ignorando inicialização.');
            return;
        }
        
        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                initializeForTesting: true,
            });
            console.log('AdMob: Inicializado com sucesso');
        } catch (e) {
            console.error('AdMob: Falha crítica na inicialização:', e);
            // Não relançamos o erro para evitar que o app feche
        }
    }

    async function showRewardedAd() {
        if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
            // Simulação para Web
            messageArea.textContent = "Simulando anúncio... +100 moedas!";
            playerProfile.coins += 100;
            saveProfile();
            return;
        }

        try {
            const { AdMob, RewardAdEvents } = await import('@capacitor-community/admob');
            
            // Remove listeners antigos para evitar duplicação
            await AdMob.removeAllListeners();

            AdMob.addListener(RewardAdEvents.Rewarded, (reward) => {
                playerProfile.coins += 100;
                saveProfile();
                alert("Parabéns! Você ganhou 100 moedas.");
            });

            const options = {
                adId: 'ca-app-pub-3940256099942544/5224354917', // ID de teste
                isTesting: true
            };
            
            await AdMob.prepareRewardVideoAd(options);
            await AdMob.showRewardVideoAd();
        } catch (e) {
            console.error('Erro ao mostrar anúncio premiado:', e);
            alert("Não foi possível carregar o vídeo no momento.");
        }
    }

    async function showInterstitialAd() {
        if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) return;

        try {
            const { AdMob } = await import('@capacitor-community/admob');
            const options = {
                adId: 'ca-app-pub-3940256099942544/1033173712', // ID de teste
                isTesting: true
            };
            await AdMob.prepareInterstitial(options);
            await AdMob.showInterstitial();
        } catch (e) {
            console.error('Erro ao mostrar interstitial:', e);
        }
    }

    // --- FUNÇÕES DE EFEITOS (JUICE) ---

    function triggerEffect(cell, type) {
        const effect = document.createElement('div');
        effect.classList.add(type === 'hit' ? 'explosion' : 'splash');
        cell.appendChild(effect);
        setTimeout(() => effect.remove(), 600);
    }

    function triggerShake() {
        gameContainer.classList.add('shake');
        setTimeout(() => gameContainer.classList.remove('shake'), 400);
    }

    function updateTurnUI() {
        if (phase !== 'battle') {
            turnBanner.className = '';
            return;
        }

        if (turn === 1) {
            turnBanner.textContent = "SUA VEZ!";
            turnBanner.className = 'player-turn';
            board2Element.classList.add('active-turn');
            board1Element.classList.remove('active-turn');
            board2Element.classList.add('target');
        } else {
            turnBanner.textContent = "TURNO DA IA...";
            turnBanner.className = 'ai-turn';
            board1Element.classList.add('active-turn');
            board2Element.classList.remove('active-turn');
            board2Element.classList.remove('target');
        }
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
            powerupsBar.classList.remove('hidden'); // MOSTRA POWERUPS
            updateTurnUI();
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

    function processPlayerShot(x, y, cell, isPowerup = false) {
        const target = gameState.opponent.board[y][x];
        let hit = false;
        let sunk = false;

        if (target) {
            hit = true;
            target.hitCount++;
            cell.classList.add('hit');
            triggerEffect(cell, 'hit');
            
            if (target.hitCount === target.size) {
                sunk = true;
                if (target.size >= 2) triggerShake();
            }
            messageArea.textContent = sunk ? `VOCÊ AFUNDOU UM ${target.name.toUpperCase()}!` : "VOCÊ ACERTOU!";
        } else {
            cell.classList.add('miss');
            triggerEffect(cell, 'miss');
            messageArea.textContent = "Você errou...";
        }

        checkGameOver();

        if (phase === 'battle' && !hit && !isPowerup) {
            turn = 2;
            updateTurnUI();
            setTimeout(processAIShot, 1200);
        }
    }

    let aiTargets = []; // Fila de células para a IA atacar após um acerto

    function processAIShot() {
        if (phase !== 'battle') return;

        let x, y, cell;
        
        if (aiTargets.length > 0) {
            const next = aiTargets.shift();
            x = next.x;
            y = next.y;
            cell = document.querySelector(`#board-1 .cell[data-x="${x}"][data-y="${y}"]`);
            // Se já foi atacada, tenta a próxima da fila ou volta pro random
            if (cell.classList.contains('hit') || cell.classList.contains('miss')) {
                return processAIShot();
            }
        } else {
            do {
                x = Math.floor(Math.random() * BOARD_SIZE);
                y = Math.floor(Math.random() * BOARD_SIZE);
                cell = document.querySelector(`#board-1 .cell[data-x="${x}"][data-y="${y}"]`);
            } while (cell.classList.contains('hit') || cell.classList.contains('miss'));
        }

        const target = gameState.me.board[y][x];
        let hit = false;
        let sunk = false;

        if (target) {
            hit = true;
            target.hitCount++;
            cell.classList.add('hit');
            triggerEffect(cell, 'hit');
            
            // Lógica "Inteligente": adiciona vizinhos se acertou
            const neighbors = [
                {x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1}
            ];
            neighbors.forEach(n => {
                if (n.x >= 0 && n.x < BOARD_SIZE && n.y >= 0 && n.y < BOARD_SIZE) {
                    aiTargets.push(n);
                }
            });

            if (target.hitCount === target.size) {
                sunk = true;
                if (target.size >= 2) triggerShake();
                aiTargets = []; // Limpa alvos se afundou (opcional, pode manter se houver navios adjacentes)
            }
            messageArea.textContent = `IA acertou seu ${target.name}!`;
        } else {
            cell.classList.add('miss');
            triggerEffect(cell, 'miss');
            messageArea.textContent = "IA errou o tiro.";
        }

        checkGameOver();

        if (phase === 'battle') {
            if (hit) {
                setTimeout(processAIShot, 1200);
            } else {
                turn = 1;
                updateTurnUI();
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
        
        // RECOMPENSAS
        let reward = message.includes('VOCÊ') ? 100 : 20;
        playerProfile.coins += reward;
        saveProfile();
        
        winMessage.innerHTML = `${message}<br><small>Recompensa: 💰 ${reward}</small>`;
        winScreen.classList.remove('hidden');

        // Mostra anúncio ocasionalmente (50% de chance)
        if (Math.random() > 0.5) {
            setTimeout(showInterstitialAd, 2000);
        }
    }

    // --- LISTENERS DE UI ---

    document.getElementById('reward-ad-btn').addEventListener('click', showRewardedAd);

    document.getElementById('shop-btn').addEventListener('click', () => {
        shopModal.classList.remove('hidden');
    });

    document.getElementById('close-shop-btn').addEventListener('click', () => {
        shopModal.classList.add('hidden');
    });

    document.getElementById('powerup-radar').addEventListener('click', useRadar);
    document.getElementById('powerup-airstrike').addEventListener('click', useAirstrike);

    rotateBtn.addEventListener('click', () => {
        isHorizontal = !isHorizontal;
        rotateBtn.textContent = `Girar (${isHorizontal ? 'Horizontal' : 'Vertical'})`;
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        location.reload();
    });

    loadProfile();
    initAds();
    initGame();
});
