const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        console.log(chalk.blue('📂 Carregando comandos...'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                    console.log(chalk.green(`✅ Comando carregado: ${command.data.name}`));
                } else {
                    console.log(chalk.yellow(`⚠️ Comando ${file} não possui 'data' ou 'execute'`));
                }
            } catch (error) {
                console.error(chalk.red(`❌ Erro ao carregar comando ${file}:`), error);
            }
        }

        console.log(chalk.blue(`📂 Total de comandos carregados: ${this.commands.size}`));
    }

    async handleCommand(interaction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            console.error(chalk.red(`❌ Comando não encontrado: ${interaction.commandName}`));
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao executar comando ${interaction.commandName}:`), error);
            
            const errorEmbed = {
                color: 0xdc2626,
                title: '❌ Erro Interno',
                description: 'Ocorreu um erro ao executar este comando. Tente novamente mais tarde.',
                timestamp: new Date().toISOString()
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }

    getCommands() {
        return this.commands;
    }
}

module.exports = CommandHandler;