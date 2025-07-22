const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa um usuário do servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário a ser expulso')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo da expulsão')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

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

            // Verificar hierarquia
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Você não pode expulsar este usuário (hierarquia de cargos).')],
                    ephemeral: true
                });
            }

            if (!member.kickable) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Não posso expulsar este usuário.')],
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            // Executar expulsão
            await member.kick(`${reason} | Moderador: ${interaction.user.tag}`);

            // Salvar no banco
            await database.addLog(guild.id, user.id, 'kick', 
                `Motivo: ${reason} | Moderador: ${interaction.user.tag}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder().moderation('kick', user, interaction.user, reason);

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
            console.error('Erro no comando kick:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao expulsar o usuário.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};