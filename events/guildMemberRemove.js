const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            const { guild, user } = member;
            
            // Log da saída
            await database.addLog(guild.id, user.id, 'member_leave', `Usuário saiu do servidor`);

            // Buscar configurações do servidor
            const config = await database.getGuildConfig(guild.id);

            // Log no canal de logs (se configurado)
            if (config.logs_channel) {
                const logChannel = guild.channels.cache.get(config.logs_channel);
                if (logChannel) {
                    // Verificar se foi kick/ban através dos logs de auditoria
                    let leaveReason = 'Saiu do servidor';
                    let moderator = null;

                    try {
                        const auditLogs = await guild.fetchAuditLogs({
                            type: 20, // MEMBER_KICK
                            limit: 1
                        });

                        const kickLog = auditLogs.entries.first();
                        if (kickLog && kickLog.target.id === user.id && 
                            Date.now() - kickLog.createdTimestamp < 5000) {
                            leaveReason = 'Foi expulso';
                            moderator = kickLog.executor;
                        }
                    } catch (error) {
                        // Ignorar erro de auditoria
                    }

                    try {
                        const auditLogs = await guild.fetchAuditLogs({
                            type: 22, // MEMBER_BAN_ADD
                            limit: 1
                        });

                        const banLog = auditLogs.entries.first();
                        if (banLog && banLog.target.id === user.id && 
                            Date.now() - banLog.createdTimestamp < 5000) {
                            leaveReason = 'Foi banido';
                            moderator = banLog.executor;
                        }
                    } catch (error) {
                        // Ignorar erro de auditoria
                    }

                    const logEmbed = new CustomEmbedBuilder()
                        .warning('👋 Membro Saiu', `**${user.tag}** ${leaveReason.toLowerCase()}`)
                        .addField('👤 Usuário', `${user.tag} (${user.id})`, true)
                        .addField('📅 Entrou em', member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Desconhecido', true)
                        .addField('📊 Total de Membros', guild.memberCount.toString(), true);

                    if (moderator) {
                        logEmbed.addField('👮 Moderador', moderator.tag, true);
                    }

                    logEmbed.setThumbnail(user.displayAvatarURL({ dynamic: true }))
                           .setFooter('DIG Brasil • Log de Membros');

                    await logChannel.send({ embeds: [logEmbed.build()] });
                }
            }

        } catch (error) {
            console.error('Erro no evento guildMemberRemove:', error);
        }
    }
};