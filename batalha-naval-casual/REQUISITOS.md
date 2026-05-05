# Documentação de Requisitos - Batalha Naval Casual

## 1. Visão Geral
O **Batalha Naval Casual** é um jogo multiplayer em tempo real, desenvolvido com tecnologias web modernas (Node.js, Socket.io) e portado para dispositivos móveis via Capacitor. O foco do projeto é a simplicidade, partidas rápidas e uma experiência de usuário (UX) fluida e recompensadora.

---

## 2. Requisitos Funcionais (Estado Atual)

### RF01 - Sistema de Salas (Multiplayer)
- O servidor deve permitir a criação de salas únicas via ID.
- Limite de 2 jogadores por sala.
- Gerenciamento de conexão/desconexão via WebSockets.

### RF02 - Fase de Preparação (Setup)
- Cada jogador deve posicionar sua frota em um tabuleiro privado.
- O jogo só avança para a fase de batalha quando ambos os jogadores confirmarem "Pronto".

### RF03 - Mecânica de Jogo (Battle)
- Sistema de turnos alternados.
- Se um jogador acertar um alvo, ele mantém o turno (conforme `server.js` atual).
- Detecção automática de acerto (Hit), Erro (Miss) e Navio Afundado (Sunk).
- Condição de vitória: O primeiro jogador a afundar todos os navios adversários vence.

---

## 3. Requisitos de Usabilidade & UX (Novas Implementações)

### RU01 - Posicionamento Inteligente
- **Botão "Aleatório":** Permitir que o jogador preencha o tabuleiro instantaneamente com um algoritmo de posicionamento randômico.
- **Drag & Drop:** Implementar interface de arrastar e soltar para os navios no mobile e desktop.

### RU02 - Feedback Sensorial (Juice)
- **Haptics (Vibração):** Feedback tátil ao acertar tiros, sofrer danos ou cometer erros de posicionamento (via `@capacitor/haptics`).
- **Animações de Impacto:** Efeitos visuais de explosão (partículas) para acertos e animação de água (splash) para erros.
- **Screen Shake:** Tremor de tela leve ao afundar navios grandes (Porta-Aviões/Encouraçados).

### RU03 - Comunicação e Social
- **Quick Emojis:** Menu flutuante com reações rápidas (😂, 🔥, 💀, 👍) para interação entre jogadores sem necessidade de chat de texto.
- **Identidade:** Campo para inserção de apelido (Nickname) que será exibido para o oponente.

---

## 4. Requisitos de Monetização e Distribuição

### RM01 - Integração com Anúncios
- Implementação do plugin `@capacitor-community/admob`.
- **Intersticiais:** Exibição de anúncio ao final de cada partida.
- **Rewarded Ads:** Opção de assistir vídeo para desbloquear itens cosméticos.

### RM02 - Publicação Mobile
- **Android:** Geração de pacote `.aab` via Capacitor/Android Studio.
- **iOS:** Configuração via Xcode (exige conta Apple Developer).

---

## 5. Requisitos Não Funcionais

### RNF01 - Performance
- O servidor deve processar as jogadas com latência mínima para garantir a sensação de tempo real.
- O frontend deve ser otimizado para rodar a 60 FPS mesmo em dispositivos móveis de entrada.

### RNF02 - Escalabilidade
- O backend deve ser capaz de gerenciar múltiplas salas simultâneas (hospedagem em nuvem como Railway/Render).

---

## 6. Stack Tecnológica Atual
- **Backend:** Node.js, Express, Socket.io.
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla).
- **Mobile Bridge:** Capacitor (Android/iOS).
- **Plugins Sugeridos:** `@capacitor/haptics`, `@capacitor-community/admob`.
