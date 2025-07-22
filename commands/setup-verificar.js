const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const VerificationSystem = require('../systems/verificationSystem');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-verificar')
        .setDescription('Configura o sistema de verificação')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal onde será enviado o painel de verificação')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('cargo')
                .setDescription('Cargo que será dado aos usuários verificados')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('canal');
            const role = interaction.options.getRole('cargo');
            const { guild } = interaction;

            // Verificar permissões do bot
            if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro de Permissão', 'Preciso da permissão "Gerenciar Cargos" para funcionar.')],
                    ephemeral: true
                });
            }

            // Verificar se o cargo do bot é superior ao cargo de verificação
            if (role.position >= guild.members.me.roles.highest.position) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro de Hierarquia', 'O cargo selecionado está acima do meu cargo na hierarquia.')],
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

            // Salvar configuração no banco
            await database.setGuildConfig(guild.id, {
                verification_channel: channel.id,
                verification_role: role.id
            });

            // Configurar sistema de verificação
            const success = await VerificationSystem.setupVerification(interaction, channel);

            if (success) {
                const embed = new CustomEmbedBuilder()
                    .success('Sistema Configurado', 'Sistema de verificação configurado com sucesso!')
                    .addField('📍 Canal', channel.toString(), true)
                    .addField('🎭 Cargo', role.toString(), true)
                    .setFooter('DIG Brasil • Sistema de Verificação');

                await interaction.editReply({ embeds: [embed.build()] });

                // Log da ação
                await database.addLog(guild.id, interaction.user.id, 'setup_verification', 
                    `Canal: ${channel.name}, Cargo: ${role.name}`);
            } else {
                await interaction.editReply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Falha ao configurar o sistema de verificação.')]
                });
            }

        } catch (error) {
            console.error('Erro no comando setup-verificar:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro Interno', 'Ocorreu um erro ao configurar o sistema de verificação.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};