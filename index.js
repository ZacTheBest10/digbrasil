const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const chalk = require('chalk');
require('dotenv').config();

// Importar handlers e sistemas
const CommandHandler = require('./handlers/commandHandler');
const EventHandler = require('./handlers/eventHandler');
const database = require('./database/database');
const config = require('./config.json');

// Criar cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message
    ]
});

// Inicializar coleção de comandos
client.commands = new Collection();

// Função principal de inicialização
async function initialize() {
    try {
        console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.blue.bold(`🚀 Iniciando ${config.bot.name} v${config.bot.version}`));
        console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        // Verificar variáveis de ambiente
        if (!process.env.BOT_TOKEN) {
            throw new Error('BOT_TOKEN não encontrado no arquivo .env');
        }

        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID não encontrado no arquivo .env');
        }

        // Inicializar handlers
        const commandHandler = new CommandHandler(client);
        const eventHandler = new EventHandler(client);

        // Carregar comandos e eventos
        await commandHandler.loadCommands();
        await eventHandler.loadEvents();

        // Adicionar comandos ao cliente
        client.commands = commandHandler.getCommands();

        // Login do bot
        console.log(chalk.yellow('🔐 Fazendo login...'));
        await client.login(process.env.BOT_TOKEN);

    } catch (error) {
        console.error(chalk.red('❌ Erro fatal na inicialização:'), error);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('❌ Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('❌ Uncaught Exception:'), error);
    process.exit(1);
});

// Tratamento de encerramento gracioso
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n⏹️ Encerrando bot...'));
    database.close();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n⏹️ Encerrando bot...'));
    database.close();
    client.destroy();
    process.exit(0);
});

// Inicializar o bot
initialize();

module.exports = client;