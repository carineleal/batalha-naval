# Batalha Naval Casual - Projeto

Versão atualizada com foco em retenção, monetização e feedback visual (Juice).

## Funcionalidades Implementadas

### 1. Feedback Visual "Juicy"
- **Animações de Impacto**: Explosões (💥) para acertos e splashes (💧) para erros.
- **Persistent Damage**: Navios atingidos exibem chamas e fumaça animadas via CSS.
- **Screen Shake**: Tremor de tela ao afundar navios grandes (tamanho >= 2).
- **Indicador de Turno**: Banner superior pulsante e borda brilhante no tabuleiro ativo.

### 2. Sistema de Economia (Retenção)
- **Moedas**: Jogadores ganham moedas ao final de cada partida (+100 por vitória, +20 por derrota).
- **Persistência**: Dados de moedas e inventário salvos localmente via `localStorage`.
- **IA Inteligente**: IA aprimorada que ataca células vizinhas após um acerto.

### 3. Monetização (Shop & Ads)
- **Loja In-game**: Compra de itens consumíveis.
- **Power-ups**:
  - **Radar (100 coins)**: Revela área 3x3 no tabuleiro inimigo.
  - **Ataque Aéreo (250 coins)**: 3 tiros aleatórios extras.
- **Anúncios (AdMob)**:
  - **Rewarded Video**: Recompensa o jogador com 100 moedas ao assistir.
  - **Interstitial**: Exibido ocasionalmente ao final das partidas.

## Configuração Técnica

- **Framework**: HTML5, CSS3 Vanilla, JavaScript ES6.
- **Mobile**: Capacitor para integração nativa (Android).
- **Plugins**: `@capacitor-community/admob`.

## Como Gerar o Executável (APK)

1. Sincronize os arquivos web: `npx cap sync android`
2. Abra a pasta `/android` no **Android Studio**.
3. Gere o APK em `Build > Build APK(s)`.

## Próximos Passos
- Implementar Multiplayer Real via Socket.io (servidor já preparado).
- Adicionar Skins customizáveis para os navios.
- Inserir SFX (efeitos sonoros) reais.
