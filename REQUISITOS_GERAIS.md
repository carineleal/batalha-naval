# Documentação de Requisitos: Projeto Batalha Naval

Este documento consolida os requisitos funcionais, técnicos e de negócio para as duas vertentes do projeto: a versão **Casual** (B2C) e a versão **RH** (B2B).

---

## 1. Visão Geral do Ecossistema
O projeto consiste em uma base de código híbrida (HTML/JS + Capacitor) ramificada em dois produtos distintos com objetivos de monetização diferentes, mantendo custo zero de infraestrutura de servidor para o desenvolvedor.

---

## 2. Requisitos Técnicos Comuns
*   **Arquitetura:** Aplicação Web Progressiva (PWA) encapsulada em App Nativo via Capacitor.
*   **Plataformas:** Android (Principal) e Web (Testes).
*   **Motor de Jogo:** Lógica de turnos e detecção de colisões baseada em matrizes JavaScript (Offline).
*   **Interface:** Responsiva (Mobile-first), adaptável a diferentes tamanhos de tela de smartphones.
*   **Custo de Infraestrutura:** Zero (Processamento local + serviços gratuitos do Google).

---

## 3. Batalha Naval Casual (Versão para Público Geral)
**Objetivo:** Gerar renda através de anúncios (AdMob).

### Requisitos Funcionais (Casual)
*   **RF-C01 - Jogo Instantâneo:** O usuário deve entrar diretamente na tela de posicionamento sem necessidade de login.
*   **RF-C02 - Modo Solo (IA):** Partidas contra um oponente virtual com comportamento constante.
*   **RF-C03 - Feedback Visual (Juice):** Animações de explosão para acertos, splash de água para erros e tremor de tela para navios afundados.
*   **RF-C04 - Gerenciamento de Turnos:** Banner indicativo de "Sua Vez" vs "Vez da IA".

### Requisitos de Negócio (Casual)
*   **RN-C01 - Monetização:** Exibição de anúncios em tela cheia (Intersticiais) ao término de cada partida.
*   **RN-C02 - Engajamento:** Opção de "Jogar Novamente" para aumentar o tempo de retenção do usuário.

---

## 4. RH - Batalha Naval (Versão Corporativa)
**Objetivo:** Venda de licença/serviço para empresas realizarem avaliações comportamentais.

### Requisitos Funcionais (RH)
*   **RF-R01 - Identificação do Candidato:** Tela inicial obrigatória pedindo Nome e E-mail Corporativo.
*   **RF-R02 - Painel de Configuração Secreto:** Acesso via senha (`admin`) para que o recrutador configure o destino dos dados.
*   **RF-R03 - Armazenamento Local de Configuração:** A URL do Webhook do cliente deve ser salva permanentemente no `localStorage` do dispositivo.
*   **RF-R04 - Análise Psicométrica (Telemetria):**
    *   Cálculo de **Perfil Analítico** (lógica de tiro adjacente).
    *   Cálculo de **Resiliência** (tempo de resposta sob ataque).
    *   Cálculo de **Planejamento** (estratégia de dispersão da frota).
*   **RF-R05 - Integração com Google Sheets:** Envio automático dos resultados para a planilha do cliente via Google Apps Script.

### Requisitos de Negócio (RH)
*   **RN-R01 - Modelo Totem:** O app deve ser otimizado para rodar em dispositivos fixos da empresa (tablets/celulares de teste).
*   **RN-R02 - Segurança de Dados:** Os resultados devem ser enviados diretamente para a conta da empresa contratante, sem intermediação de servidores de terceiros.

---

## 5. Requisitos Não Funcionais
*   **RNF01 - Portabilidade:** O código deve ser facilmente compilável para Android através do Gradle no Android Studio.
*   **RNF02 - Usabilidade:** A interface de posicionamento deve ser clara, permitindo girar navios (Horizontal/Vertical) com um toque.
*   **RNF03 - Estética:** Diferenciação visual entre versões (Casual = Azul claro/original, RH = Azul escuro corporativo).
*   **RNF04 - Performance:** O app deve carregar em menos de 3 segundos em dispositivos Android intermediários.

---

## 6. Próximos Passos de Desenvolvimento
1.  Implementação do Plugin AdMob na versão Casual.
2.  Refinamento dos algoritmos psicométricos com base em feedbacks de recrutadores.
3.  Criação de ícones personalizados e splash screens para cada versão.
4.  Publicação na Google Play Store com pacotes separados:
    *   `com.projeto.batalhanaval.casual`
    *   `com.projeto.batalhanaval.rh`
