const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Bloqueia um canal para membros comuns')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal a ser bloqueado (padrão: canal atual)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo do bloqueio')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('canal') || interaction.channel;
            const reason = interaction.options.getString('motivo') || 'Não especificado';
            const { guild } = interaction;

            await interaction.deferReply();

            // Bloquear canal para @everyone
            await channel.permissionOverwrites.edit(guild.roles.everyone, {
                SendMessages: false,
                AddReactions: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false
            });

            // Salvar log
            await database.addLog(guild.id, interaction.user.id, 'channel_lock', 
                `Canal: ${channel.name} | Motivo: ${reason}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder()
                .success('Canal Bloqueado', `${channel} foi bloqueado com sucesso!`)
                .addField('📍 Canal', channel.toString(), true)
                .addField('👮 Moderador', interaction.user.tag, true)
                .addField('📝 Motivo', reason, false)
                .setFooter('DIG Brasil • Sistema de Bloqueio');

            await interaction.editReply({ embeds: [embed.build()] });

            // Enviar mensagem no canal bloqueado
            const lockEmbed = new CustomEmbedBuilder()
                .warning('🔒 Canal Bloqueado', 'Este canal foi temporariamente bloqueado pela moderação.')
                .addField('👮 Moderador', interaction.user.tag, true)
                .addField('📝 Motivo', reason, true)
                .setFooter('DIG Brasil • Canal Bloqueado');

            if (channel.id !== interaction.channel.id) {
                await channel.send({ embeds: [lockEmbed.build()] });
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
            console.error('Erro no comando lock:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao bloquear o canal.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};