const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Central de ajuda do DIG Brasil'),

    async execute(interaction) {
        try {
            const embed = new CustomEmbedBuilder().help();
            
            await interaction.reply({ 
                embeds: [embed.build()],
                ephemeral: true 
            });

        } catch (error) {
            console.error('Erro no comando help:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao exibir a ajuda.')],
                ephemeral: true
            });
        }
    }
};