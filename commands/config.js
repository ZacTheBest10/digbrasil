const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const CustomButtonBuilder = require('../utils/buttonBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Painel de configuração do bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const embed = new CustomEmbedBuilder().config();
            const buttons = CustomButtonBuilder.configButtons();

            await interaction.reply({
                embeds: [embed.build()],
                components: buttons,
                ephemeral: true
            });

        } catch (error) {
            console.error('Erro no comando config:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao abrir o painel de configuração.')],
                ephemeral: true
            });
        }
    }
};