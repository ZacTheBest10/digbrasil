const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config.json');

class CustomButtonBuilder {
    constructor() {
        this.components = [];
    }

    // Botões para verificação
    static verificationButtons() {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_user')
                    .setLabel('Verificar-se')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );
        return [row];
    }

    // Botões para tickets
    static ticketButtons() {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_denuncia')
                    .setLabel('Denúncias')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('📩'),
                new ButtonBuilder()
                    .setCustomId('ticket_suporte')
                    .setLabel('Suporte')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💬'),
                new ButtonBuilder()
                    .setCustomId('ticket_duvida')
                    .setLabel('Dúvidas')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓')
            );
        return [row];
    }

    // Botões para controle de ticket
    static ticketControlButtons() {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Fechar Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Assumir Ticket')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👋')
            );
        return [row];
    }

    // Botões para configuração
    static configButtons() {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('config_verification')
                    .setLabel('Verificação')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('config_tickets')
                    .setLabel('Tickets')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫'),
                new ButtonBuilder()
                    .setCustomId('config_logs')
                    .setLabel('Logs')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('config_automod')
                    .setLabel('AutoMod')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛡️'),
                new ButtonBuilder()
                    .setCustomId('config_antiraid')
                    .setLabel('Anti-Raid')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('config_counters')
                    .setLabel('Contadores')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📊')
            );

        return [row1, row2];
    }

    // Botões para ponto
    static timecardButtons() {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('timecard_start')
                    .setLabel('Iniciar Ponto')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('▶️'),
                new ButtonBuilder()
                    .setCustomId('timecard_pause')
                    .setLabel('Pausar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏸️'),
                new ButtonBuilder()
                    .setCustomId('timecard_end')
                    .setLabel('Finalizar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️')
            );
        return [row];
    }

    // Botões para embed builder
    static embedBuilderButtons() {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('embed_title')
                    .setLabel('Título')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('embed_description')
                    .setLabel('Descrição')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📄'),
                new ButtonBuilder()
                    .setCustomId('embed_color')
                    .setLabel('Cor')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎨')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('embed_image')
                    .setLabel('Imagem')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🖼️'),
                new ButtonBuilder()
                    .setCustomId('embed_thumbnail')
                    .setLabel('Thumbnail')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🖼️'),
                new ButtonBuilder()
                    .setCustomId('embed_footer')
                    .setLabel('Footer')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋')
            );

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('embed_preview')
                    .setLabel('Visualizar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👁️'),
                new ButtonBuilder()
                    .setCustomId('embed_send')
                    .setLabel('Enviar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📤'),
                new ButtonBuilder()
                    .setCustomId('embed_reset')
                    .setLabel('Resetar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔄')
            );

        return [row1, row2, row3];
    }

    // Menu de seleção para cores
    static colorSelectMenu() {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('embed_color_select')
            .setPlaceholder('Escolha uma cor para a embed')
            .addOptions([
                {
                    label: 'Azul Marinho (Padrão)',
                    value: '#1e3a8a',
                    emoji: '🔵'
                },
                {
                    label: 'Preto',
                    value: '#000000',
                    emoji: '⚫'
                },
                {
                    label: 'Verde Escuro',
                    value: '#166534',
                    emoji: '🟢'
                },
                {
                    label: 'Marrom',
                    value: '#92400e',
                    emoji: '🟤'
                },
                {
                    label: 'Cinza',
                    value: '#374151',
                    emoji: '⚪'
                },
                {
                    label: 'Vermelho',
                    value: '#dc2626',
                    emoji: '🔴'
                }
            ]);

        return new ActionRowBuilder().addComponents(menu);
    }

    // Botões de confirmação
    static confirmationButtons(confirmId, cancelId) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(confirmId)
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId(cancelId)
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );
        return [row];
    }

    // Botões para sugestões
    static suggestionButtons() {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('suggestion_approve')
                    .setLabel('Aprovar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('suggestion_reject')
                    .setLabel('Rejeitar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌'),
                new ButtonBuilder()
                    .setCustomId('suggestion_upvote')
                    .setLabel('👍')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('suggestion_downvote')
                    .setLabel('👎')
                    .setStyle(ButtonStyle.Secondary)
            );
        return [row];
    }
}

module.exports = CustomButtonBuilder;