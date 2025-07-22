const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aviso')
        .setDescription('Aplica um aviso a um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário a receber o aviso')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do aviso')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('motivo');
            const { guild } = interaction;

            const member = guild.members.cache.get(user.id);
            if (!member) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Usuário não encontrado no servidor.')],
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            // Adicionar aviso ao banco
            const warningId = await database.addWarning(guild.id, user.id, interaction.user.id, reason);

            // Buscar total de avisos do usuário
            const warnings = await database.getWarnings(guild.id, user.id);
            const totalWarnings = warnings.length;

            // Salvar log
            await database.addLog(guild.id, user.id, 'warning', 
                `Motivo: ${reason} | Total: ${totalWarnings} | Moderador: ${interaction.user.tag}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder()
                .moderation('warn', user, interaction.user, reason)
                .addField('📊 Total de Avisos', totalWarnings.toString(), true)
                .addField('🆔 ID do Aviso', warningId.toString(), true);

            await interaction.editReply({ embeds: [embed.build()] });

            // Tentar enviar DM para o usuário
            try {
                const dmEmbed = new CustomEmbedBuilder()
                    .warning('Aviso Recebido', `Você recebeu um aviso no servidor **${guild.name}**`)
                    .addField('📝 Motivo', reason, false)
                    .addField('👮 Moderador', interaction.user.tag, true)
                    .addField('📊 Total de Avisos', totalWarnings.toString(), true)
                    .setFooter('DIG Brasil • Sistema de Avisos');

                await user.send({ embeds: [dmEmbed.build()] });
            } catch (error) {
                console.log('Não foi possível enviar DM para o usuário');
            }

            // Log no canal de logs se configurado
            const config = await database.getGuildConfig(guild.id);
            if (config.logs_channel) {
                const logChannel = guild.channels.cache.get(config.logs_channel);
                if (logChannel) {
                    logChannel.send({ embeds: [embed.build()] });
                }
            }

        } catch (error) {
            console.error('Erro no comando aviso:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao aplicar o aviso.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};