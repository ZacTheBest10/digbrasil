const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove o silenciamento de um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para remover o silenciamento')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo da remoção do silenciamento')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('motivo') || 'Não especificado';
            const { guild } = interaction;

            const member = guild.members.cache.get(user.id);
            if (!member) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Usuário não encontrado no servidor.')],
                    ephemeral: true
                });
            }

            if (!member.isCommunicationDisabled()) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().warning('Aviso', 'Este usuário não está silenciado.')],
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            // Remover timeout
            await member.timeout(null, `${reason} | Moderador: ${interaction.user.tag}`);

            // Salvar no banco
            await database.addLog(guild.id, user.id, 'unmute', 
                `Motivo: ${reason} | Moderador: ${interaction.user.tag}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder().moderation('unmute', user, interaction.user, reason);

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
            console.error('Erro no comando unmute:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao remover o silenciamento.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};