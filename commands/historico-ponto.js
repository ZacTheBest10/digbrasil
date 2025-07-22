const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const TimecardSystem = require('../systems/timecardSystem');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('historico-ponto')
        .setDescription('Visualiza o histórico de ponto de um funcionário')
        .addUserOption(option =>
            option.setName('funcionario')
                .setDescription('Funcionário para ver o histórico')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('funcionario');
            const { guild } = interaction;

            await interaction.deferReply({ ephemeral: true });

            const history = await TimecardSystem.getTimecardHistory(guild.id, user.id, 20);

            if (history.length === 0) {
                return interaction.editReply({
                    embeds: [new CustomEmbedBuilder().warning('Sem Dados', `${user.displayName} não possui histórico de ponto.`)]
                });
            }

            const embed = new CustomEmbedBuilder()
                .setTitle('📊 Histórico de Ponto')
                .setDescription(`**Funcionário:** ${user.displayName}\n**Últimos registros:**`)
                .setThumbnail(user.displayAvatarURL())
                .setFooter('DIG Brasil • Histórico de Ponto');

            // Agrupar por sessão
            const sessions = {};
            history.forEach(record => {
                if (!sessions[record.session_id]) {
                    sessions[record.session_id] = [];
                }
                sessions[record.session_id].push(record);
            });

            let fieldCount = 0;
            for (const sessionId in sessions) {
                if (fieldCount >= 10) break; // Limite de campos

                const sessionRecords = sessions[sessionId].sort((a, b) => 
                    new Date(a.timestamp) - new Date(b.timestamp)
                );

                const startRecord = sessionRecords.find(r => r.action === 'start');
                const endRecord = sessionRecords.find(r => r.action === 'end');

                if (startRecord) {
                    const startTime = moment(startRecord.timestamp).format('DD/MM/YYYY HH:mm');
                    const endTime = endRecord ? moment(endRecord.timestamp).format('HH:mm') : 'Em andamento';
                    
                    embed.addField(
                        `📅 ${startTime}`,
                        `**Início:** ${startTime}\n**Fim:** ${endTime}`,
                        true
                    );
                    fieldCount++;
                }
            }

            await interaction.editReply({ embeds: [embed.build()] });

        } catch (error) {
            console.error('Erro no comando historico-ponto:', error);
            
            const errorEmbed = new CustomEmbedBuilder()
                .error('Erro', 'Ocorreu um erro ao buscar o histórico de ponto.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed.build()] });
            } else {
                await interaction.reply({ embeds: [errorEmbed.build()], ephemeral: true });
            }
        }
    }
};