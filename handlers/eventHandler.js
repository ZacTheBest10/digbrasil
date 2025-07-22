const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class EventHandler {
    constructor(client) {
        this.client = client;
    }

    async loadEvents() {
        const eventsPath = path.join(__dirname, '../events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        console.log(chalk.blue('📂 Carregando eventos...'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const event = require(filePath);

                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args));
                }

                console.log(chalk.green(`✅ Evento carregado: ${event.name}`));
            } catch (error) {
                console.error(chalk.red(`❌ Erro ao carregar evento ${file}:`), error);
            }
        }

        console.log(chalk.blue(`📂 Total de eventos carregados: ${eventFiles.length}`));
    }
}

module.exports = EventHandler;