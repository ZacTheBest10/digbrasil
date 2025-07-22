const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra informações do servidor'),

    async execute(interaction) {
        try {
            const { guild } = interaction;
            
            // Buscar informações do servidor
            const owner = await guild.fetchOwner();
            const channels = guild.channels.cache;
            const roles = guild.roles.cache;
            
            const textChannels = channels.filter(c => c.type === 0).size;
            const voiceChannels = channels.filter(c => c.type === 2).size;
            const categories = channels.filter(c => c.type === 4).size;

            const embed = new CustomEmbedBuilder()
                .setTitle(`🏰 Informações do Servidor`)
                .setDescription(`Informações detalhadas sobre **${guild.name}**`)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
                .addField('👑 Proprietário', owner.user.tag, true)
                .addField('🆔 ID do Servidor', guild.id, true)
                .addField('📅 Criado em', `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, true)
                .addField('👥 Membros', guild.memberCount.toString(), true)
                .addField('🤖 Bots', guild.members.cache.filter(m => m.user.bot).size.toString(), true)
                .addField('📊 Canais', `**Total:** ${channels.size}\n**Texto:** ${textChannels}\n**Voz:** ${voiceChannels}\n**Categorias:** ${categories}`, true)
                .addField('🎭 Cargos', roles.size.toString(), true)
                .addField('😀 Emojis', guild.emojis.cache.size.toString(), true)
                .addField('🚀 Nível de Boost', `Nível ${guild.premiumTier}\n${guild.premiumSubscriptionCount} boosts`, true);

            if (guild.description) {
                embed.addField('📝 Descrição', guild.description, false);
            }

            const features = {
                'COMMUNITY': '🏘️ Servidor Comunitário',
                'PARTNERED': '🤝 Parceiro Discord',
                'VERIFIED': '✅ Verificado',
                'VANITY_URL': '🔗 URL Personalizada',
                'BANNER': '🖼️ Banner',
                'ANIMATED_ICON': '🎬 Ícone Animado',
                'WELCOME_SCREEN_ENABLED': '👋 Tela de Boas-vindas'
            };

            const serverFeatures = guild.features
                .map(feature => features[feature])
                .filter(Boolean)
                .slice(0, 5);

            if (serverFeatures.length > 0) {
                embed.addField('✨ Recursos', serverFeatures.join('\n'), false);
            }

            if (guild.bannerURL()) {
                embed.setImage(guild.bannerURL({ dynamic: true, size: 512 }));
            }

            embed.setFooter('DIG Brasil • Informações do Servidor');

            await interaction.reply({ embeds: [embed.build()] });

        } catch (error) {
            console.error('Erro no comando serverinfo:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao buscar as informações do servidor.')],
                ephemeral: true
            });
        }
    }
};