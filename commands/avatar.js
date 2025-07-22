const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Mostra o avatar de um usuário')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário para ver o avatar')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('usuario') || interaction.user;
            
            const embed = new CustomEmbedBuilder()
                .setTitle(`🖼️ Avatar de ${user.displayName}`)
                .setDescription(`Avatar de **${user.tag}**`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
                .addField('👤 Usuário', user.tag, true)
                .addField('🆔 ID', user.id, true)
                .addField('🔗 Link Direto', `[Clique aqui](${user.displayAvatarURL({ dynamic: true, size: 512 })})`, true)
                .setFooter('DIG Brasil • Sistema de Avatar');

            await interaction.reply({ embeds: [embed.build()] });

        } catch (error) {
            console.error('Erro no comando avatar:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao buscar o avatar.')],
                ephemeral: true
            });
        }
    }
};