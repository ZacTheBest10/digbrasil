const CustomEmbedBuilder = require('../utils/embedBuilder');
const CustomButtonBuilder = require('../utils/buttonBuilder');
const database = require('../database/database');
const { v4: uuidv4 } = require('crypto');

class TimecardSystem {
    static activeSessions = new Map(); // userId -> sessionData

    static async handleTimecard(interaction, action) {
        try {
            const { user, guild } = interaction;
            const userId = user.id;
            const guildId = guild.id;

            switch (action) {
                case 'start':
                    await this.startTimecard(interaction, userId, guildId);
                    break;
                case 'pause':
                    await this.pauseTimecard(interaction, userId, guildId);
                    break;
                case 'end':
                    await this.endTimecard(interaction, userId, guildId);
                    break;
            }

        } catch (error) {
            console.error('Erro no sistema de ponto:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro no sistema de ponto.')],
                ephemeral: true
            });
        }
    }

    static async startTimecard(interaction, userId, guildId) {
        const activeSession = this.activeSessions.get(userId);

        if (activeSession && activeSession.status === 'active') {
            return interaction.reply({
                embeds: [new CustomEmbedBuilder().warning('Aviso', 'Você já possui um ponto ativo!')],
                ephemeral: true
            });
        }

        const sessionId = uuidv4();
        const sessionData = {
            sessionId,
            status: 'active',
            startTime: Date.now(),
            pausedTime: 0
        };

        this.activeSessions.set(userId, sessionData);
        await database.addTimeCard(guildId, userId, 'start', sessionId);

        const embed = new CustomEmbedBuilder().timeCard(interaction.user, 'start');
        await interaction.reply({ embeds: [embed.build()], ephemeral: true });
    }

    static async pauseTimecard(interaction, userId, guildId) {
        const activeSession = this.activeSessions.get(userId);

        if (!activeSession || activeSession.status !== 'active') {
            return interaction.reply({
                embeds: [new CustomEmbedBuilder().warning('Aviso', 'Você não possui um ponto ativo para pausar!')],
                ephemeral: true
            });
        }

        activeSession.status = 'paused';
        activeSession.pauseStart = Date.now();
        
        await database.addTimeCard(guildId, userId, 'pause', activeSession.sessionId);

        const embed = new CustomEmbedBuilder().timeCard(interaction.user, 'pause');
        await interaction.reply({ embeds: [embed.build()], ephemeral: true });
    }

    static async endTimecard(interaction, userId, guildId) {
        const activeSession = this.activeSessions.get(userId);

        if (!activeSession) {
            return interaction.reply({
                embeds: [new CustomEmbedBuilder().warning('Aviso', 'Você não possui um ponto ativo para finalizar!')],
                ephemeral: true
            });
        }

        // Calcular tempo total trabalhado
        const endTime = Date.now();
        const totalTime = endTime - activeSession.startTime - activeSession.pausedTime;
        const hours = Math.floor(totalTime / (1000 * 60 * 60));
        const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));

        await database.addTimeCard(guildId, userId, 'end', activeSession.sessionId);
        this.activeSessions.delete(userId);

        const embed = new CustomEmbedBuilder()
            .success('Ponto Finalizado', `**Funcionário:** ${interaction.user.displayName}\n**Tempo Trabalhado:** ${hours}h ${minutes}m\n**Finalizado em:** <t:${Math.floor(Date.now() / 1000)}:F>`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter('DIG Brasil • Sistema de Ponto');

        await interaction.reply({ embeds: [embed.build()], ephemeral: true });
    }

    static async getTimecardHistory(guildId, userId, limit = 10) {
        try {
            return await database.getTimeCards(guildId, userId, limit);
        } catch (error) {
            console.error('Erro ao buscar histórico de ponto:', error);
            return [];
        }
    }
}

module.exports = TimecardSystem;