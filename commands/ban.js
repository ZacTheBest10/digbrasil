const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um usuário do servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário a ser banido')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do banimento')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('dias')
                .setDescription('Dias de mensagens para deletar (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('motivo') || 'Não especificado';
            const deleteMessageDays = interaction.options.getInteger('dias') || 0;
            const { guild } = interaction;

            // Verificar se o usuário pode ser banido
            const member = guild.members.cache.get(user.id);
            if (member) {
                if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                    return interaction.reply({
                        embeds: [new CustomEmbedBuilder().error('Erro', 'Você não pode banir este usuário (hierarquia de cargos).')],
                        ephemeral: true
                    });
                }

                if (!member.bannable) {
                    return interaction.reply({
                        embeds: [new CustomEmbedBuilder().error('Erro', 'Não posso banir este usuário.')],
                        ephemeral: true
                    });
                }
            }

            await interaction.deferReply();

            // Executar banimento
            await guild.members.ban(user, {
                reason: `${reason} | Moderador: ${interaction.user.tag}`,
                deleteMessageDays
            });

            // Salvar no banco
            await database.addLog(guild.id, user.id, 'ban', 
                `Motivo: ${reason} | Moderador: ${interaction.user.tag}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder()
                .moderation('ban', user, interaction.user, reason)
                .addField('🗑️ Mensagens Deletadas', `${deleteMessageDays} dias`, true);

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
            console.error('Erro no comando ban:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao banir o usuário.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};