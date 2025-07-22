const { ActivityType } = require('discord.js');
const chalk = require('chalk');
const config = require('../config.json');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.blue.bold(`🤖 ${config.bot.name} está online!`));
        console.log(chalk.cyan(`📊 Conectado em ${client.guilds.cache.size} servidor(es)`));
        console.log(chalk.cyan(`👥 Servindo ${client.users.cache.size} usuários`));
        console.log(chalk.cyan(`📡 Latência: ${client.ws.ping}ms`));
        console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        // Status rotativo
        const statuses = [
            { name: 'DIG Brasil', type: ActivityType.Watching },
            { name: 'os membros', type: ActivityType.Watching },
            { name: 'sistema profissional', type: ActivityType.Playing },
            { name: '/help para ajuda', type: ActivityType.Listening },
            { name: 'moderação ativa', type: ActivityType.Playing }
        ];

        let currentStatus = 0;

        const updateStatus = () => {
            const status = statuses[currentStatus];
            client.user.setActivity(status.name, { type: status.type });
            currentStatus = (currentStatus + 1) % statuses.length;
        };

        // Atualizar status inicial
        updateStatus();

        // Atualizar status a cada 30 segundos
        setInterval(updateStatus, 30000);

        console.log(chalk.yellow('🔄 Sistema de status rotativo iniciado'));
        console.log(chalk.green(`✅ ${config.bot.name} v${config.bot.version} pronto para uso!`));
    }
};