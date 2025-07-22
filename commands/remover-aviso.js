const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remover-aviso')
        .setDescription('Remove um aviso específico de um usuário')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID do aviso a ser removido')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo da remoção do aviso')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            const warningId = interaction.options.getInteger('id');
            const reason = interaction.options.getString('motivo') || 'Não especificado';
            const { guild } = interaction;

            await interaction.deferReply({ ephemeral: true });

            // Verificar se o aviso existe
            const warnings = await database.getWarnings(guild.id, null);
            const warning = warnings.find(w => w.id === warningId);

            if (!warning) {
                return interaction.editReply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Aviso não encontrado.')]
                });
            }

            // Remover aviso
            const removed = await database.removeWarning(warningId);

            if (removed === 0) {
                return interaction.editReply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Não foi possível remover o aviso.')]
                });
            }

            // Buscar usuário
            const user = guild.members.cache.get(warning.user_id)?.user || 
                        await interaction.client.users.fetch(warning.user_id).catch(() => null);

            // Salvar log
            await database.addLog(guild.id, warning.user_id, 'warning_removed', 
                `ID: ${warningId} | Motivo: ${reason} | Moderador: ${interaction.user.tag}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder()
                .success('Aviso Removido', 'O aviso foi removido com sucesso!')
                .addField('🆔 ID do Aviso', warningId.toString(), true)
                .addField('👤 Usuário', user ? user.tag : 'Usuário desconhecido', true)
                .addField('📝 Motivo Original', warning.reason, false)
                .addField('🗑️ Motivo da Remoção', reason, false)
                .setFooter('DIG Brasil • Sistema de Avisos');

            await interaction.editReply({ embeds: [embed.build()] });

            // Log no canal de logs se configurado
            const config = await database.getGuildConfig(guild.id);
            if (config.logs_channel) {
                const logChannel = guild.channels.cache.get(config.logs_channel);
                if (logChannel) {
                    logChannel.send({ embeds: [embed.build()] });
                }
            }

        } catch (error) {
            console.error('Erro no comando remover-aviso:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao remover o aviso.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};