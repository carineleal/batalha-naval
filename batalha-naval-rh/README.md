# Batalha Naval - Avaliação de Perfil (Versão RH)

Este projeto é uma ferramenta de avaliação psicométrica disfarçada de um jogo clássico de Batalha Naval. Ele foi desenvolvido para ser utilizado por departamentos de RH em processos seletivos, permitindo analisar o perfil comportamental dos candidatos de forma lúdica e data-driven.

## 🚀 Funcionalidades Principais

- **Interface de Candidato:** Tela de login simplificada para coleta de Nome e E-mail.
- **Motor de IA:** Oponente virtual que joga de forma constante para testar a reação do candidato.
- **Análise Psicométrica:** O jogo monitora em tempo real:
    - **Perfil Analítico:** Baseado na lógica de busca após um acerto.
    - **Resiliência:** Medida através da estabilidade do tempo de resposta após sofrer ataques.
    - **Planejamento:** Avaliado pela estratégia de dispersão dos navios no tabuleiro.
- **Integração Gratuita:** Envio de resultados diretamente para o Google Sheets via Webhook.

## 🛠 Modo Totem (Configuração Local)

Esta versão foi otimizada para o **Modelo Totem**, onde a empresa fornece o dispositivo para o candidato.

1. **Acesso às Configurações:** Na tela de login, clique no ícone de engrenagem (⚙️) no canto superior direito.
2. **Senha de Administrador:** A senha padrão é `admin`.
3. **URL do Webhook:** Insira a URL do seu Google Apps Script para que os dados sejam enviados para a sua planilha específica. Esta configuração fica salva permanentemente no dispositivo.

## 📊 Configuração da Planilha (Google Sheets)

Para receber os dados sem custo de servidor, siga estes passos:

1. Crie uma nova Planilha Google.
2. Vá em **Extensões > Apps Script**.
3. Cole o seguinte código:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      new Date(),
      data.name,
      data.email,
      data.finalScores.analytical,
      data.finalScores.resilience,
      data.finalScores.planning
    ];
    
    sheet.appendRow(row);
    return ContentService.createTextOutput("Sucesso").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Erro: " + error).setMimeType(ContentService.MimeType.TEXT);
  }
}
```

4. Clique em **Implantar > Nova Implantação**.
5. Selecione **Tipo: App da Web**.
6. Em "Quem pode acessar", escolha **Qualquer pessoa**.
7. Copie a URL gerada e insira no painel de configuração do App.

## 📱 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Mobile:** Capacitor (Cross-platform Android/iOS).
- **Backend:** Google Apps Script (Serverless).
- **Análise de Dados:** Algoritmos de heurística comportamental baseados em eventos.

---
*Desenvolvido para transformar processos seletivos em experiências inteligentes.*
