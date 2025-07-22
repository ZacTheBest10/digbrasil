# 🤖 Professional Discord Bot

Um bot Discord moderno, profissional e completo com sistema de verificação, tickets interativos e configuração visual.

## ✨ Características

### 🔐 Sistema de Verificação
- Painel interativo com botões
- Apenas administradores podem ativar
- Sistema de roles automático
- Logs completos de verificações

### 🎫 Sistema de Tickets
- Múltiplas categorias (Suporte, Denúncia, Dúvida, Bug Report)
- Criação automática via botões
- Controles de ticket (fechar, assumir)
- Logs detalhados

### ⚙️ Configuração Visual
- Painel interativo com botões
- Configuração sem comandos complexos
- Interface moderna e intuitiva

### 🎨 Design Profissional
- Embeds coloridos e organizados
- Botões interativos em todas as ações
- Cores consistentes do config.json
- Emojis e visual moderno

### 📊 Sistema de Logs
- Banco de dados SQLite
- Logs de todas as ações
- Histórico completo
- Performance otimizada

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd professional-discord-bot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas informações:
```env
BOT_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
GUILD_ID=seu_guild_id_aqui
```

4. **Deploy dos comandos**
```bash
npm run deploy
```

5. **Inicie o bot**
```bash
npm start
```

## 📋 Comandos

### 👑 Comandos de Administrador
- `/verificar` - Envia o painel de verificação
- `/ticket` - Envia o painel de tickets
- `/config` - Painel de configuração do bot
- `/clear <quantidade>` - Limpa mensagens do canal

### 👤 Comandos Gerais
- `/help` - Central de ajuda
- `/ping` - Verifica latência
- `/userinfo [usuário]` - Informações de usuário
- `/serverinfo` - Informações do servidor

## 🛠️ Configuração

### Configuração Inicial
1. Use `/config` para abrir o painel de configuração
2. Configure os canais necessários:
   - Canal de logs
   - Canal de verificação
   - Categoria de tickets
   - Canal de boas-vindas

### Permissões Necessárias
- Gerenciar Canais
- Gerenciar Cargos
- Enviar Mensagens
- Usar Comandos de Barra
- Gerenciar Mensagens

## 🎨 Personalização

### Cores e Emojis
Edite o arquivo `config.json` para personalizar:
```json
{
  "colors": {
    "primary": "#5865F2",
    "success": "#10B981",
    "error": "#EF4444"
  },
  "emojis": {
    "success": "✅",
    "error": "❌"
  }
}
```

### Banco de Dados
O bot usa SQLite para armazenamento local. O arquivo `bot.db` será criado automaticamente na pasta `database/`.

## 📁 Estrutura do Projeto

```
professional-discord-bot/
├── commands/           # Comandos slash
├── events/            # Eventos do Discord
├── utils/             # Utilitários (embeds, botões)
├── database/          # Sistema de banco de dados
├── config.json        # Configurações do bot
├── index.js          # Arquivo principal
└── README.md         # Documentação
```

## 🔧 Desenvolvimento

### Adicionando Novos Comandos
1. Crie um arquivo em `commands/`
2. Use a estrutura padrão:
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comando')
        .setDescription('Descrição'),
    async execute(interaction) {
        // Lógica do comando
    }
};
```

### Adicionando Novos Eventos
1. Crie um arquivo em `events/`
2. Use a estrutura padrão:
```javascript
module.exports = {
    name: 'eventName',
    async execute(...args) {
        // Lógica do evento
    }
};
```

## 🐛 Solução de Problemas

### Bot não responde
- Verifique se o token está correto
- Confirme as permissões do bot
- Verifique os logs no console

### Comandos não aparecem
- Execute `npm run deploy`
- Aguarde alguns minutos
- Verifique o CLIENT_ID e GUILD_ID

### Banco de dados
- O arquivo `bot.db` deve ser criado automaticamente
- Verifique permissões de escrita na pasta

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para a comunidade Discord**