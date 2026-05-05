# Batalha Naval Casual - Projeto Final

Versão pronta para lançamento com foco em Retenção, Monetização e Feedback Visual.

## 🚀 Funcionalidades Implementadas

### 1. Feedback Visual "Juicy" (Juice)
- **Impactos Dinâmicos**: Explosões animadas (💥) para acertos e efeitos de água (💧) para erros.
- **Dano Persistente**: Navios atingidos permanecem com fumaça e fogo animados.
- **Tremor de Tela (Screen Shake)**: Impacto visual ao afundar navios de tamanho 2 ou maior.
- **Indicador de Turno**: Banner superior e borda pulsante no tabuleiro ativo para clareza total.

### 2. Economia e Progressão (Retenção)
- **Sistema de Moedas**: Saldo inicial de 500 moedas, com ganhos por partida (+100 vitória / +20 derrota).
- **Persistência Local**: Progresso e inventário salvos via `localStorage`.
- **IA Inteligente**: Algoritmo de busca aprimorado (ataca vizinhos após um acerto).

### 3. Loja e Power-ups (Monetização)
- **Loja de Itens**: Interface para compra de consumíveis.
- **Power-ups Disponíveis**:
  - **📡 Radar (100 coins)**: Revela área 3x3 inimiga.
  - **🛩️ Ataque Aéreo (250 coins)**: Realiza 3 disparos aleatórios extras.
- **Integração AdMob**:
  - **Rewarded Ads**: Ganhe +100 moedas assistindo a um vídeo na loja.
  - **Interstitial Ads**: Exibição ocasional entre partidas (50% de chance).

## 🛠️ Detalhes Técnicos
- **Tecnologias**: HTML5, CSS3, JavaScript ES6.
- **Mobile Nativo**: Capacitor v8 com plugin `@capacitor-community/admob`.
- **Sincronização**: Sempre rode `npx cap sync android` antes de compilar.

## 📦 Como Gerar a Versão Nova (APK)
Devido à necessidade de Java para compilação nativa, siga estes passos no seu computador:
1. Abra a pasta `/android` no **Android Studio**.
2. Vá em `Build > Clean Project` para remover versões antigas.
3. Vá em `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
4. Clique em **"locate"** na notificação final para pegar o arquivo atualizado.

## 📋 Próximos Passos
- Implementar skins de navios colecionáveis.
- Adicionar efeitos sonoros (SFX) para tiros e explosões.
- Ativar o modo multiplayer real via Socket.io (infraestrutura já preparada no `server.js`).
