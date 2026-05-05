document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginContainer = document.getElementById('login-container');
    const gameContainer = document.getElementById('game-container');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const startBtn = document.getElementById('start-btn');
    const loginMessage = document.getElementById('login-message');

    // RH Config Elements
    const secretConfigBtn = document.getElementById('secret-config-btn');
    const configContainer = document.getElementById('config-container');
    const webhookUrlInput = document.getElementById('webhook-url-input');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const closeConfigBtn = document.getElementById('close-config-btn');
    
    const board1Element = document.getElementById('board-1');
    const board2Element = document.getElementById('board-2');
    const messageArea = document.querySelector('#message-area p');
    const rotateBtn = document.getElementById('rotate-btn');

    // RH CONFIG LOGIC
    const RH_PASSWORD = 'admin'; // Senha para o totem
    
    secretConfigBtn.addEventListener('click', () => {
        const pass = prompt('Digite a senha de administrador:');
        if (pass === RH_PASSWORD) {
            webhookUrlInput.value = localStorage.getItem('rh_webhook_url') || '';
            configContainer.classList.remove('hidden');
        } else if (pass !== null) {
            alert('Senha incorreta.');
        }
    });

    saveConfigBtn.addEventListener('click', () => {
        const url = webhookUrlInput.value.trim();
        if (url) {
            localStorage.setItem('rh_webhook_url', url);
            alert('Configuração salva com sucesso!');
            configContainer.classList.add('hidden');
        } else {
            alert('Por favor, insira uma URL válida.');
        }
    });

    closeConfigBtn.addEventListener('click', () => {
        configContainer.classList.add('hidden');
    });
    
    // Configurações do Jogo
    const BOARD_SIZE = 10;
    const shipTypes = [
        { name: 'Submarino', size: 1, count: 4 },
        { name: 'Contratorpedeiro', size: 2, count: 3 },
        { name: 'Cruzador', size: 3, count: 2 }
    ];

    // Dados do Candidato e Telemetria
    let candidateData = {
        name: '',
        email: '',
        startTime: null,
        setupActions: [],
        battleActions: []
    };

    // Estado Local do Jogo
    let currentShipIndex = 0;
    let isHorizontal = true;
    let phase = 'login'; // login, setup, battle, finished
    let myShipsPlaced = false;
    let turn = 1; // 1 = Player, 2 = AI
    
    const gameState = {
        me: { board: createEmptyBoard(), ships: [] },
        opponent: { board: createEmptyBoard(), ships: [] }
    };

    function createEmptyBoard() {
        return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    }

    // --- LÓGICA DE LOGIN ---

    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) {
            loginMessage.textContent = "Por favor, preencha todos os campos.";
            loginMessage.classList.remove('hidden');
            return;
        }

        candidateData.name = name;
        candidateData.email = email;
        candidateData.startTime = Date.now();

        loginContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        phase = 'setup';
        initGame();
    });

    // --- LÓGICA DO JOGO ---

    function initGame() {
        renderBoard(board1Element, 1);
        renderBoard(board2Element, 2);
        updateSetupUI();
        setupOpponent();
    }

    function setupOpponent() {
        // Posicionamento padronizado para garantir igualdade de teste
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

    // ... (generateShipList, renderBoard, updateSetupUI, handleMouseOver, handleMouseOut, clearPreviews, getShipCells, isValidPlacement mantidos)

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
                
                candidateData.setupActions.push({
                    type: 'place_ship',
                    ship: ship.name,
                    cells: cells,
                    timestamp: Date.now()
                });

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

        candidateData.battleActions.push({
            player: 'human',
            x, y, hit, sunk,
            timestamp: Date.now()
        });

        checkGameOver();

        if (phase === 'battle' && !hit) {
            turn = 2;
            board2Element.classList.remove('target');
            setTimeout(processAIShot, 1000);
        }
    }

    function processAIShot() {
        if (phase !== 'battle') return;

        // IA Simples: Ataca aleatoriamente mas de forma constante
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

        candidateData.battleActions.push({
            player: 'ai',
            x, y, hit, sunk,
            timestamp: Date.now()
        });

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

        if (playerHits === myHitsNeeded || aiHits === myHitsNeeded) {
            phase = 'finished';
            const winner = playerHits === myHitsNeeded ? 'Candidato' : 'IA';
            showGameOver(winner);
        }
    }

    function showGameOver(winner) {
        const scores = calculatePsychometricScores();
        
        const winScreen = document.getElementById('win-screen');
        const winMessage = document.getElementById('win-message');
        winMessage.textContent = "AVALIAÇÃO CONCLUÍDA! 🎉";
        
        document.getElementById('final-stats').innerHTML = `
            <p>Seus dados de desempenho foram processados.</p>
            <div class="score-report">
                <p><strong>Perfil Analítico:</strong> ${scores.analytical}/10</p>
                <p><strong>Resiliência:</strong> ${scores.resilience}/10</p>
                <p><strong>Planejamento:</strong> ${scores.planning}/10</p>
            </div>
            <p id="upload-status">Enviando resultados para o RH...</p>
        `;
        
        winScreen.classList.remove('hidden');
        
        candidateData.finalScores = scores;
        sendDataToSheets(candidateData);
    }

    async function sendDataToSheets(data) {
        const statusEl = document.getElementById('upload-status');
        
        // Lê a URL do localStorage configurada no Totem
        const GOOGLE_SCRIPT_URL = localStorage.getItem('rh_webhook_url');

        try {
            if (!GOOGLE_SCRIPT_URL) {
                console.warn("URL do Google Script não configurada.");
                statusEl.textContent = "Resultados salvos apenas no dispositivo (Configuração RH pendente).";
                return;
            }

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Importante para Google Apps Script
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            statusEl.textContent = "Resultados enviados com sucesso! Obrigado.";
            statusEl.style.color = "#27ae60";
        } catch (error) {
            console.error("Erro ao enviar para Google Sheets:", error);
            statusEl.textContent = "Erro ao enviar. Por favor, avise o RH.";
            statusEl.style.color = "#e74c3c";
        }
    }

    function calculatePsychometricScores() {
        // 1. ANALÍTICO (Busca Lógica vs. Aleatória)
        // Heurística: Após um acerto (hit), o próximo tiro foi adjacente?
        let logicalHits = 0;
        let totalHits = 0;
        const humanActions = candidateData.battleActions.filter(a => a.player === 'human');
        
        for (let i = 0; i < humanActions.length - 1; i++) {
            if (humanActions[i].hit) {
                totalHits++;
                const current = humanActions[i];
                const next = humanActions[i+1];
                const dist = Math.abs(current.x - next.x) + Math.abs(current.y - next.y);
                if (dist === 1) logicalHits++;
            }
        }
        const analyticalScore = totalHits > 0 ? Math.min(10, Math.round((logicalHits / totalHits) * 15)) : 5;

        // 2. RESILIÊNCIA (Estabilidade sob ataque)
        // Heurística: Variância do tempo de resposta após sofrer um 'hit' da IA
        const aiHits = candidateData.battleActions.filter(a => a.player === 'ai' && a.hit);
        let reactionTimes = [];
        
        aiHits.forEach(hit => {
            const nextHumanAction = humanActions.find(a => a.timestamp > hit.timestamp);
            if (nextHumanAction) {
                reactionTimes.push(nextHumanAction.timestamp - hit.timestamp);
            }
        });
        
        // Se reagiu rápido e constante (baixa variância), score alto. 
        // Simplificação: se reagiu em menos de 3s em média, score alto.
        const avgReaction = reactionTimes.length > 0 ? reactionTimes.reduce((a,b) => a+b, 0) / reactionTimes.length : 3000;
        const resilienceScore = avgReaction < 2000 ? 10 : avgReaction < 4000 ? 7 : 4;

        // 3. PLANEJAMENTO (Dispersão de Navios)
        // Heurística: Quão espalhados estão os navios? (Área ocupada)
        const allCells = candidateData.setupActions.flatMap(a => a.cells);
        const minX = Math.min(...allCells.map(c => c.x));
        const maxX = Math.max(...allCells.map(c => c.x));
        const minY = Math.min(...allCells.map(c => c.y));
        const maxY = Math.max(...allCells.map(c => c.y));
        const area = (maxX - minX + 1) * (maxY - minY + 1);
        
        // Área grande = planejou cobertura total (Score 10)
        // Área pequena = agrupou tudo num canto (Aversão ao risco ou falta de visão sistêmica)
        const planningScore = area > 40 ? 10 : area > 20 ? 7 : 4;

        return {
            analytical: analyticalScore || 5,
            resilience: resilienceScore || 5,
            planning: planningScore || 5
        };
    }

    rotateBtn.addEventListener('click', () => {
        isHorizontal = !isHorizontal;
        rotateBtn.textContent = `Girar (${isHorizontal ? 'Horizontal' : 'Vertical'})`;
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        location.reload();
    });
});
