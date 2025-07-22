const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(chalk.blue('📂 Carregando comandos para deploy...'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(chalk.green(`✅ ${command.data.name}`));
    } else {
        console.log(chalk.yellow(`⚠️ ${file} não possui 'data' ou 'execute'`));
    }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(chalk.blue(`\n🚀 Iniciando deploy de ${commands.length} comandos...`));

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log(chalk.green(`✅ Deploy concluído! ${data.length} comandos registrados.`));
        console.log(chalk.cyan('📋 Comandos registrados:'));
        
        data.forEach(command => {
            console.log(chalk.gray(`   • /${command.name} - ${command.description}`));
        });

    } catch (error) {
        console.error(chalk.red('❌ Erro no deploy:'), error);
    }
})();