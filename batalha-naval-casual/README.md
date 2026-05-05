# Batalha Naval Casual - Documentação Técnica

## 🎯 Visão Geral
Esta é a versão voltada para o público geral (B2C), com foco em entretenimento, monetização via anúncios e retenção de usuários através de um sistema de economia e progressão.

## 🚀 Funcionalidades Atuais

### 1. Sistema de Patentes (Ranking)
O jogador progride através de níveis baseados em XP:
- **Recruta** (0 XP)
- **Marinheiro** (200 XP)
- **Sargento** (600 XP)
- **Tenente** (1200 XP)
- **Capitão** (2500 XP)
- **Almirante** (5000 XP)

**Ganhos de XP:**
- Vitória: +100 XP
- Derrota: +20 XP

### 2. Economia e Loja
- **Moedas Iniciais:** 500
- **Ganhos:** +100 por vitória, +20 por derrota.
- **Power-ups:**
    - **Radar (100 moedas):** Revela uma área 3x3 no tabuleiro inimigo por 2 segundos.
    - **Ataque Aéreo (250 moedas):** Realiza 3 disparos aleatórios extras em um único turno.

### 3. Monetização (AdMob)
- **Rewarded Video:** Assista a um anúncio na loja para ganhar +100 moedas.
- **Interstitial:** Anúncio de tela cheia exibido ocasionalmente ao final das partidas.

### 4. Layout Moderno (Dark Naval)
- Interface inspirada em sistemas militares modernos.
- Utilização de **Glassmorphism** e cores neon para alta visibilidade.
- Feedback visual intensificado (Explosões, tremor de tela, fumaça).

## 🛠️ Configurações de Publicação
- **App ID:** `com.batalhanaval.casual`
- **AdMob ID (Teste):** `ca-app-pub-3940256099942544~3347511713`

## 📦 Compilação e Build
1. Sincronize os arquivos: `npx cap sync android`
2. Gere o APK no Android Studio ou via CLI: `./gradlew assembleDebug`
