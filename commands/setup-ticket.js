const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const TicketSystem = require('../systems/ticketSystem');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Configura o sistema de tickets')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal onde será enviado o painel de tickets')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('categoria')
                .setDescription('Categoria onde os tickets serão criados')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('logs')
                .setDescription('Canal para logs dos tickets')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('canal');
            const category = interaction.options.getChannel('categoria');
            const logsChannel = interaction.options.getChannel('logs');
            const { guild } = interaction;

            // Verificar permissões do bot
            const requiredPermissions = [
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageRoles
            ];

            const missingPermissions = requiredPermissions.filter(perm => 
                !guild.members.me.permissions.has(perm)
            );

            if (missingPermissions.length > 0) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro de Permissão', 'Preciso das permissões "Gerenciar Canais" e "Gerenciar Cargos" para funcionar.')],
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

            // Salvar configuração no banco
            const config = {
                ticket_category: category.id
            };

            if (logsChannel) {
                config.ticket_logs = logsChannel.id;
            }

            await database.setGuildConfig(guild.id, config);

            // Configurar sistema de tickets
            const success = await TicketSystem.setupTickets(interaction, channel);

            if (success) {
                const embed = new CustomEmbedBuilder()
                    .success('Sistema Configurado', 'Sistema de tickets configurado com sucesso!')
                    .addField('📍 Canal', channel.toString(), true)
                    .addField('📁 Categoria', category.toString(), true);

                if (logsChannel) {
                    embed.addField('📋 Logs', logsChannel.toString(), true);
                }

                embed.setFooter('DIG Brasil • Sistema de Tickets');

                await interaction.editReply({ embeds: [embed.build()] });

                // Log da ação
                await database.addLog(guild.id, interaction.user.id, 'setup_tickets', 
                    `Canal: ${channel.name}, Categoria: ${category.name}`);
            } else {
                await interaction.editReply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Falha ao configurar o sistema de tickets.')]
                });
            }

        } catch (error) {
            console.error('Erro no comando setup-ticket:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro Interno', 'Ocorreu um erro ao configurar o sistema de tickets.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};