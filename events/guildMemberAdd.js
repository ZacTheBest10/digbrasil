const CustomEmbedBuilder = require('../utils/embedBuilder');
const database = require('../database/database');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const { guild, user } = member;
            
            // Log da entrada
            await database.addLog(guild.id, user.id, 'member_join', `Usuário entrou no servidor`);

            // Buscar configurações do servidor
            const config = await database.getGuildConfig(guild.id);

            // Canal de boas-vindas (se configurado)
            if (config.welcome_channel) {
                const welcomeChannel = guild.channels.cache.get(config.welcome_channel);
                if (welcomeChannel) {
                    const embed = new CustomEmbedBuilder()
                        .success('👋 Bem-vindo!', `Bem-vindo ao **${guild.name}**, ${user}!`)
                        .setDescription(`Você é o **${guild.memberCount}º** membro do servidor!\n\nLeia as regras e divirta-se!`)
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                        .addField('👤 Usuário', user.tag, true)
                        .addField('📅 Conta Criada', `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, true)
                        .addField('📊 Total de Membros', guild.memberCount.toString(), true)
                        .setFooter('DIG Brasil • Sistema de Boas-vindas');

                    if (guild.iconURL()) {
                        embed.setImage(guild.iconURL({ dynamic: true, size: 512 }));
                    }

                    await welcomeChannel.send({ embeds: [embed.build()] });
                }
            }

            // Log no canal de logs (se configurado)
            if (config.logs_channel) {
                const logChannel = guild.channels.cache.get(config.logs_channel);
                if (logChannel) {
                    const logEmbed = new CustomEmbedBuilder()
                        .info('👋 Membro Entrou', `**${user.tag}** entrou no servidor`)
                        .addField('👤 Usuário', `${user.tag} (${user.id})`, true)
                        .addField('📅 Conta Criada', `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, true)
                        .addField('📊 Total de Membros', guild.memberCount.toString(), true)
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                        .setFooter('DIG Brasil • Log de Membros');

                    await logChannel.send({ embeds: [logEmbed.build()] });
                }
            }

        } catch (error) {
            console.error('Erro no evento guildMemberAdd:', error);
        }
    }
};