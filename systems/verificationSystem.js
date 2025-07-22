const CustomEmbedBuilder = require('../utils/embedBuilder');
const CustomButtonBuilder = require('../utils/buttonBuilder');
const database = require('../database/database');

class VerificationSystem {
    static async handleVerification(interaction) {
        try {
            const { guild, user } = interaction;
            const config = await database.getGuildConfig(guild.id);

            if (!config.verification_role) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Sistema de verificação não configurado.')],
                    ephemeral: true
                });
            }

            const role = guild.roles.cache.get(config.verification_role);
            if (!role) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Cargo de verificação não encontrado.')],
                    ephemeral: true
                });
            }

            const member = guild.members.cache.get(user.id);
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().warning('Aviso', 'Você já está verificado!')],
                    ephemeral: true
                });
            }

            await member.roles.add(role);
            await database.addVerification(guild.id, user.id);
            await database.addLog(guild.id, user.id, 'verification', 'Usuário se verificou');

            const embed = new CustomEmbedBuilder()
                .success('Verificação Concluída', `Bem-vindo ao **${guild.name}**! Você agora tem acesso completo ao servidor.`)
                .setThumbnail(user.displayAvatarURL());

            await interaction.reply({ embeds: [embed.build()], ephemeral: true });

            // Log no canal de logs se configurado
            if (config.logs_channel) {
                const logChannel = guild.channels.cache.get(config.logs_channel);
                if (logChannel) {
                    const logEmbed = new CustomEmbedBuilder()
                        .info('Usuário Verificado', `**${user.tag}** se verificou no servidor`)
                        .addField('👤 Usuário', `${user.tag} (${user.id})`, true)
                        .addField('⏰ Horário', `<t:${Math.floor(Date.now() / 1000)}:F>`, true)
                        .setThumbnail(user.displayAvatarURL());

                    logChannel.send({ embeds: [logEmbed.build()] });
                }
            }

        } catch (error) {
            console.error('Erro no sistema de verificação:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro durante a verificação.')],
                ephemeral: true
            });
        }
    }

    static async setupVerification(interaction, channel) {
        try {
            const embed = new CustomEmbedBuilder().verification();
            const buttons = CustomButtonBuilder.verificationButtons();

            await channel.send({
                embeds: [embed.build()],
                components: buttons
            });

            return true;
        } catch (error) {
            console.error('Erro ao configurar verificação:', error);
            return false;
        }
    }
}

module.exports = VerificationSystem;