const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informações de um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver as informações')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario') || interaction.user;
            const member = interaction.guild.members.cache.get(user.id);

            const embed = new CustomEmbedBuilder()
                .setTitle(`👤 Informações de ${user.displayName}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addField('🏷️ Tag', user.tag, true)
                .addField('🆔 ID', user.id, true)
                .addField('📅 Conta Criada', `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, true);

            if (member) {
                embed.addField('📥 Entrou no Servidor', `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, true);
                
                const status = {
                    online: '🟢 Online',
                    idle: '🟡 Ausente',
                    dnd: '🔴 Não Perturbe',
                    offline: '⚫ Offline'
                };
                
                embed.addField('📊 Status', status[member.presence?.status] || '⚫ Offline', true);

                if (member.roles.cache.size > 1) {
                    const roles = member.roles.cache
                        .filter(role => role.id !== interaction.guild.id)
                        .sort((a, b) => b.position - a.position)
                        .map(role => role.toString())
                        .slice(0, 10);
                    
                    embed.addField(`🎭 Cargos (${member.roles.cache.size - 1})`, roles.join(', ') || 'Nenhum', false);
                }

                if (member.premiumSince) {
                    embed.addField('💎 Boost desde', `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`, true);
                }
            }

            embed.setFooter('DIG Brasil • Informações do Usuário');

            await interaction.reply({ embeds: [embed.build()] });

        } catch (error) {
            console.error('Erro no comando userinfo:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao buscar as informações do usuário.')],
                ephemeral: true
            });
        }
    }
};