const CustomEmbedBuilder = require('../utils/embedBuilder');
const VerificationSystem = require('../systems/verificationSystem');
const TicketSystem = require('../systems/ticketSystem');
const TimecardSystem = require('../systems/timecardSystem');
const EmbedBuilderSystem = require('../systems/embedBuilderSystem');
const database = require('../database/database');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            // Comandos Slash
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                await command.execute(interaction);
                return;
            }

            // Botões
            if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
                return;
            }

            // Menus de Seleção
            if (interaction.isStringSelectMenu()) {
                await handleSelectMenuInteraction(interaction);
                return;
            }

            // Modais
            if (interaction.isModalSubmit()) {
                await handleModalInteraction(interaction);
                return;
            }

        } catch (error) {
            console.error('Erro na interação:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro Interno', 'Ocorreu um erro ao processar sua interação.');

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed.build()], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};

async function handleButtonInteraction(interaction) {
    const { customId } = interaction;

    // Sistema de Verificação
    if (customId === 'verify_user') {
        await VerificationSystem.handleVerification(interaction);
        return;
    }

    // Sistema de Tickets
    if (customId.startsWith('ticket_')) {
        if (customId === 'ticket_close') {
            await TicketSystem.closeTicket(interaction);
        } else if (customId === 'ticket_claim') {
            await TicketSystem.claimTicket(interaction);
        } else if (customId === 'confirm_close_ticket') {
            await TicketSystem.confirmCloseTicket(interaction);
        } else if (customId === 'cancel_close_ticket') {
            await interaction.update({
                embeds: [new CustomEmbedBuilder().info('Cancelado', 'Fechamento do ticket cancelado.')],
                components: []
            });
        } else {
            // Criar ticket baseado na categoria
            const category = customId.replace('ticket_', '');
            await TicketSystem.createTicket(interaction, category);
        }
        return;
    }

    // Sistema de Ponto
    if (customId.startsWith('timecard_')) {
        const action = customId.replace('timecard_', '');
        await TimecardSystem.handleTimecard(interaction, action);
        return;
    }

    // Sistema de Embed Builder
    if (customId.startsWith('embed_')) {
        const action = customId.replace('embed_', '');
        await EmbedBuilderSystem.handleEmbedBuilder(interaction, action);
        return;
    }

    // Sistema de Configuração
    if (customId.startsWith('config_')) {
        await handleConfigButton(interaction);
        return;
    }

    // Sistema de Sugestões
    if (customId.startsWith('suggestion_')) {
        await handleSuggestionButton(interaction);
        return;
    }
}

async function handleSelectMenuInteraction(interaction) {
    const { customId } = interaction;

    // Menu de cores do embed builder
    if (customId === 'embed_color_select') {
        await EmbedBuilderSystem.handleColorSelect(interaction);
        return;
    }
}

async function handleModalInteraction(interaction) {
    const { customId } = interaction;

    // Modais do Embed Builder
    if (customId.includes('embed_') && customId.includes('_modal')) {
        await EmbedBuilderSystem.handleModal(interaction);
        return;
    }

    // Modal de Sugestão
    if (customId === 'suggestion_modal') {
        await handleSuggestionModal(interaction);
        return;
    }
}

async function handleConfigButton(interaction) {
    const action = interaction.customId.replace('config_', '');
    
    const embed = new CustomEmbedBuilder()
        .info('Em Desenvolvimento', `A configuração de **${action}** estará disponível em breve!`)
        .setFooter('DIG Brasil • Sistema de Configuração');

    await interaction.reply({ embeds: [embed.build()], ephemeral: true });
}

async function handleSuggestionButton(interaction) {
    const action = interaction.customId.replace('suggestion_', '');
    
    // Implementar lógica de votação de sugestões aqui
    const embed = new CustomEmbedBuilder()
        .info('Voto Registrado', `Seu voto (${action}) foi registrado!`)
        .setFooter('DIG Brasil • Sistema de Sugestões');

    await interaction.reply({ embeds: [embed.build()], ephemeral: true });
}

async function handleSuggestionModal(interaction) {
    try {
        const suggestion = interaction.fields.getTextInputValue('suggestion_input');
        const { user, guild } = interaction;

        // Salvar sugestão no banco
        await database.db.run(
            'INSERT INTO suggestions (guild_id, user_id, content) VALUES (?, ?, ?)',
            [guild.id, user.id, suggestion]
        );

        // Embed da sugestão
        const embed = new CustomEmbedBuilder()
            .setTitle('💡 Nova Sugestão')
            .setDescription(suggestion)
            .addField('👤 Autor', user.tag, true)
            .addField('⏰ Enviada em', `<t:${Math.floor(Date.now() / 1000)}:F>`, true)
            .setThumbnail(user.displayAvatarURL())
            .setFooter('DIG Brasil • Sistema de Sugestões');

        // Resposta ao usuário
        await interaction.reply({
            embeds: [new CustomEmbedBuilder().success('Sugestão Enviada', 'Sua sugestão foi enviada com sucesso!')],
            ephemeral: true
        });

        // Enviar sugestão no canal atual com botões de votação
        const suggestionButtons = require('../utils/buttonBuilder').suggestionButtons();
        
        const message = await interaction.followUp({
            embeds: [embed.build()],
            components: suggestionButtons
        });

        // Adicionar reações iniciais
        await message.react('👍');
        await message.react('👎');

    } catch (error) {
        console.error('Erro ao processar sugestão:', error);
        await interaction.reply({
            embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao enviar sua sugestão.')],
            ephemeral: true
        });
    }
}