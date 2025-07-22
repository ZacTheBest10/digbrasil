const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário a ser silenciado')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('tempo')
                .setDescription('Tempo em minutos (máximo 40320 - 28 dias)')
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do silenciamento')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario');
            const timeMinutes = interaction.options.getInteger('tempo');
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
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Você não pode silenciar este usuário (hierarquia de cargos).')],
                    ephemeral: true
                });
            }

            if (!member.moderatable) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Não posso silenciar este usuário.')],
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            // Calcular tempo de timeout
            const timeoutDuration = timeMinutes * 60 * 1000; // Converter para milissegundos
            const expiresAt = new Date(Date.now() + timeoutDuration);

            // Aplicar timeout
            await member.timeout(timeoutDuration, `${reason} | Moderador: ${interaction.user.tag}`);

            // Salvar no banco
            await database.addLog(guild.id, user.id, 'mute', 
                `Motivo: ${reason} | Tempo: ${timeMinutes}min | Moderador: ${interaction.user.tag}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder()
                .moderation('mute', user, interaction.user, reason)
                .addField('⏰ Duração', `${timeMinutes} minutos`, true)
                .addField('🔚 Expira em', `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>`, true);

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
            console.error('Erro no comando mute:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao silenciar o usuário.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};