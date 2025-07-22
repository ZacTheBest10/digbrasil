const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limpar')
        .setDescription('Limpa mensagens do canal')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Quantidade de mensagens para limpar (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Limpar apenas mensagens de um usuário específico')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            const amount = interaction.options.getInteger('quantidade');
            const targetUser = interaction.options.getUser('usuario');
            const { channel, guild } = interaction;

            await interaction.deferReply({ ephemeral: true });

            // Buscar mensagens
            const messages = await channel.messages.fetch({ limit: 100 });
            
            let messagesToDelete = messages.first(amount);

            // Filtrar por usuário se especificado
            if (targetUser) {
                messagesToDelete = messages.filter(msg => msg.author.id === targetUser.id).first(amount);
            }

            // Filtrar mensagens antigas (mais de 14 dias não podem ser deletadas em bulk)
            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            messagesToDelete = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);

            if (messagesToDelete.size === 0) {
                return interaction.editReply({
                    embeds: [new CustomEmbedBuilder().warning('Aviso', 'Nenhuma mensagem encontrada para deletar.')]
                });
            }

            // Deletar mensagens
            const deleted = await channel.bulkDelete(messagesToDelete, true);

            // Salvar log
            await database.addLog(guild.id, interaction.user.id, 'bulk_delete', 
                `Canal: ${channel.name} | Quantidade: ${deleted.size} | Usuário específico: ${targetUser ? targetUser.tag : 'Todos'}`);

            // Embed de confirmação
            const embed = new CustomEmbedBuilder()
                .success('Mensagens Limpas', `${deleted.size} mensagens foram deletadas com sucesso!`)
                .addField('📍 Canal', channel.toString(), true)
                .addField('🔢 Quantidade', deleted.size.toString(), true);

            if (targetUser) {
                embed.addField('👤 Usuário', targetUser.tag, true);
            }

            embed.setFooter('DIG Brasil • Sistema de Limpeza');

            await interaction.editReply({ embeds: [embed.build()] });

            // Log no canal de logs se configurado
            const config = await database.getGuildConfig(guild.id);
            if (config.logs_channel && config.logs_channel !== channel.id) {
                const logChannel = guild.channels.cache.get(config.logs_channel);
                if (logChannel) {
                    const logEmbed = new CustomEmbedBuilder()
                        .info('Mensagens Limpas', `**${interaction.user.tag}** limpou mensagens`)
                        .addField('📍 Canal', channel.toString(), true)
                        .addField('🔢 Quantidade', deleted.size.toString(), true)
                        .addField('👮 Moderador', interaction.user.tag, true);

                    if (targetUser) {
                        logEmbed.addField('👤 Usuário Específico', targetUser.tag, true);
                    }

                    logChannel.send({ embeds: [logEmbed.build()] });
                }
            }

        } catch (error) {
            console.error('Erro no comando limpar:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao limpar as mensagens.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};