const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Desbloqueia um canal')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal a ser desbloqueado (padrão: canal atual)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do desbloqueio')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('canal') || interaction.channel;
            const reason = interaction.options.getString('motivo') || 'Não especificado';
            const { guild } = interaction;

            await interaction.deferReply();

            // Desbloquear canal para @everyone
            await channel.permissionOverwrites.edit(guild.roles.everyone, {
                SendMessages: null,
                AddReactions: null,
                CreatePublicThreads: null,
                CreatePrivateThreads: null
            });

            // Salvar log
            await database.addLog(guild.id, interaction.user.id, 'channel_unlock', 
                `Canal: ${channel.name} | Motivo: ${reason}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder()
                .success('Canal Desbloqueado', `${channel} foi desbloqueado com sucesso!`)
                .addField('📍 Canal', channel.toString(), true)
                .addField('👮 Moderador', interaction.user.tag, true)
                .addField('📝 Motivo', reason, false)
                .setFooter('DIG Brasil • Sistema de Desbloqueio');

            await interaction.editReply({ embeds: [embed.build()] });

            // Enviar mensagem no canal desbloqueado
            const unlockEmbed = new CustomEmbedBuilder()
                .success('🔓 Canal Desbloqueado', 'Este canal foi desbloqueado e está novamente disponível.')
                .addField('👮 Moderador', interaction.user.tag, true)
                .addField('📝 Motivo', reason, true)
                .setFooter('DIG Brasil • Canal Desbloqueado');

            if (channel.id !== interaction.channel.id) {
                await channel.send({ embeds: [unlockEmbed.build()] });
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
            console.error('Erro no comando unlock:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao desbloquear o canal.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};