const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Envie uma sugestão para o servidor'),

    async execute(interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('suggestion_modal')
                .setTitle('💡 Enviar Sugestão');

            const suggestionInput = new TextInputBuilder()
                .setCustomId('suggestion_input')
                .setLabel('Sua Sugestão')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1000)
                .setRequired(true)
                .setPlaceholder('Descreva sua sugestão detalhadamente...');

            const actionRow = new ActionRowBuilder().addComponents(suggestionInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);

        } catch (error) {
            console.error('Erro no comando sugerir:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao abrir o formulário de sugestão.')],
                ephemeral: true
            });
        }
    }
};