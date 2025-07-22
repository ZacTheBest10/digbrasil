const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedBuilderSystem = require('../systems/embedBuilderSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed-builder')
        .setDescription('Construtor interativo de embeds')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            await EmbedBuilderSystem.handleEmbedBuilder(interaction, 'start');
        } catch (error) {
            console.error('Erro no comando embed-builder:', error);
            await interaction.reply({
                embeds: [{ 
                    color: 0xdc2626,
                    title: '❌ Erro',
                    description: 'Ocorreu um erro ao iniciar o construtor de embeds.'
                }],
                ephemeral: true
            });
        }
    }
};