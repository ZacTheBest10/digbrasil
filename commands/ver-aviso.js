const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ver-aviso')
        .setDescription('Visualiza os avisos de um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver os avisos')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario');
            const { guild } = interaction;

            await interaction.deferReply({ ephemeral: true });

            const warnings = await database.getWarnings(guild.id, user.id);

            if (warnings.length === 0) {
                return interaction.editReply({
                    embeds: [new CustomEmbedBuilder().info('Sem Avisos', `${user.displayName} não possui avisos.`)]
                });
            }

            const embed = new CustomEmbedBuilder()
                .setTitle('📋 Avisos do Usuário')
                .setDescription(`**Usuário:** ${user.tag}\n**Total de Avisos:** ${warnings.length}`)
                .setThumbnail(user.displayAvatarURL())
                .setFooter('DIG Brasil • Sistema de Avisos');

            // Mostrar os últimos 10 avisos
            const recentWarnings = warnings.slice(0, 10);
            
            recentWarnings.forEach((warning, index) => {
                const date = moment(warning.created_at).format('DD/MM/YYYY HH:mm');
                const moderator = guild.members.cache.get(warning.moderator_id);
                const moderatorName = moderator ? moderator.user.tag : 'Moderador desconhecido';

                embed.addField(
                    `⚠️ Aviso #${warning.id}`,
                    `**Motivo:** ${warning.reason}\n**Moderador:** ${moderatorName}\n**Data:** ${date}`,
                    false
                );
            });

            if (warnings.length > 10) {
                embed.addField('📝 Nota', `Mostrando os 10 avisos mais recentes de ${warnings.length} total.`, false);
            }

            await interaction.editReply({ embeds: [embed.build()] });

        } catch (error) {
            console.error('Erro no comando ver-aviso:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao buscar os avisos.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};