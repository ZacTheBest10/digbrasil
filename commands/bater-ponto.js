const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const CustomButtonBuilder = require('../utils/buttonBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bater-ponto')
        .setDescription('Sistema de controle de ponto para staff')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            const embed = new CustomEmbedBuilder()
                .setTitle('⏰ Sistema de Ponto')
                .setDescription(`**Funcionário:** ${interaction.user.displayName}\n\nUse os botões abaixo para controlar seu ponto:`)
                .addField('▶️ Iniciar', 'Inicia uma nova sessão de trabalho', true)
                .addField('⏸️ Pausar', 'Pausa a sessão atual', true)
                .addField('⏹️ Finalizar', 'Finaliza a sessão e calcula o tempo', true)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter('DIG Brasil • Sistema de Ponto');

            const buttons = CustomButtonBuilder.timecardButtons();

            await interaction.reply({
                embeds: [embed.build()],
                components: buttons,
                ephemeral: true
            });

        } catch (error) {
            console.error('Erro no comando bater-ponto:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro no sistema de ponto.')],
                ephemeral: true
            });
        }
    }
};