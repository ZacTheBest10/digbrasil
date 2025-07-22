const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Verifica a latência do bot'),

    async execute(interaction) {
        try {
            const sent = await interaction.reply({ 
                content: '🏓 Calculando latência...', 
                fetchReply: true,
                ephemeral: true
            });

            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);

            const embed = new CustomEmbedBuilder()
                .success('🏓 Pong!', 'Latência do bot calculada com sucesso')
                .addField('📡 Latência da Mensagem', `${latency}ms`, true)
                .addField('🌐 Latência da API', `${apiLatency}ms`, true)
                .addField('📊 Status', latency < 100 ? '🟢 Excelente' : latency < 200 ? '🟡 Bom' : '🔴 Alto', true)
                .setFooter('DIG Brasil • Sistema de Ping');

            await interaction.editReply({ 
                content: null,
                embeds: [embed.build()] 
            });

        } catch (error) {
            console.error('Erro no comando ping:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao calcular a latência.')],
                ephemeral: true
            });
        }
    }
};