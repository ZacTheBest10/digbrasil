const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

class CustomEmbedBuilder {
    constructor() {
        this.embed = new EmbedBuilder();
        this.embed.setColor(config.colors.primary);
        this.embed.setTimestamp();
    }

    // Métodos de configuração básica
    setTitle(title) {
        this.embed.setTitle(title);
        return this;
    }

    setDescription(description) {
        this.embed.setDescription(description);
        return this;
    }

    setColor(color) {
        this.embed.setColor(color);
        return this;
    }

    setThumbnail(url) {
        this.embed.setThumbnail(url);
        return this;
    }

    setImage(url) {
        this.embed.setImage(url);
        return this;
    }

    setFooter(text, iconURL = null) {
        this.embed.setFooter({ text, iconURL });
        return this;
    }

    setAuthor(name, iconURL = null, url = null) {
        this.embed.setAuthor({ name, iconURL, url });
        return this;
    }

    addField(name, value, inline = false) {
        this.embed.addFields({ name, value, inline });
        return this;
    }

    // Métodos pré-definidos para diferentes tipos
    success(title, description) {
        return this.setColor(config.colors.success)
                  .setTitle(`${config.emojis.success} ${title}`)
                  .setDescription(description);
    }

    error(title, description) {
        return this.setColor(config.colors.error)
                  .setTitle(`${config.emojis.error} ${title}`)
                  .setDescription(description);
    }

    warning(title, description) {
        return this.setColor(config.colors.warning)
                  .setTitle(`${config.emojis.warning} ${title}`)
                  .setDescription(description);
    }

    info(title, description) {
        return this.setColor(config.colors.info)
                  .setTitle(`${config.emojis.info} ${title}`)
                  .setDescription(description);
    }

    // Embed para verificação
    verification() {
        return this.setColor(config.colors.primary)
                  .setTitle(`${config.emojis.verify} Sistema de Verificação`)
                  .setDescription('Clique no botão abaixo para se verificar e ter acesso completo ao servidor.')
                  .setThumbnail('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400')
                  .setFooter('DIG Brasil • Sistema de Verificação');
    }

    // Embed para tickets
    tickets() {
        return this.setColor(config.colors.primary)
                  .setTitle(`${config.emojis.ticket} Central de Atendimento`)
                  .setDescription('Selecione o tipo de atendimento que você precisa:')
                  .addField('📩 Denúncias', 'Para reportar usuários ou comportamentos inadequados', true)
                  .addField('💬 Suporte', 'Para dúvidas sobre o servidor ou problemas técnicos', true)
                  .addField('❓ Dúvidas', 'Para perguntas gerais sobre o servidor', true)
                  .setThumbnail('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400')
                  .setFooter('DIG Brasil • Central de Atendimento');
    }

    // Embed para configuração
    config() {
        return this.setColor(config.colors.primary)
                  .setTitle(`${config.emojis.config} Painel de Configuração`)
                  .setDescription('Configure todos os sistemas do bot através dos botões abaixo:')
                  .addField('🔧 Sistemas Disponíveis', 
                           '• Sistema de Verificação\n• Sistema de Tickets\n• Sistema de Logs\n• AutoMod & Anti-Raid\n• Contadores\n• Cargos e Permissões', false)
                  .setFooter('DIG Brasil • Painel de Configuração');
    }

    // Embed para ponto
    timeCard(user, action) {
        const actionText = {
            'start': 'Ponto Iniciado',
            'pause': 'Ponto Pausado', 
            'resume': 'Ponto Retomado',
            'end': 'Ponto Finalizado'
        };

        return this.setColor(config.colors.success)
                  .setTitle(`⏰ ${actionText[action]}`)
                  .setDescription(`**Funcionário:** ${user.displayName}\n**Horário:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                  .setThumbnail(user.displayAvatarURL())
                  .setFooter('DIG Brasil • Sistema de Ponto');
    }

    // Embed para moderação
    moderation(action, user, moderator, reason = null) {
        const actionText = {
            'ban': 'Usuário Banido',
            'kick': 'Usuário Expulso',
            'mute': 'Usuário Silenciado',
            'unmute': 'Usuário Desilenciado',
            'warn': 'Usuário Advertido'
        };

        const embed = this.setColor(config.colors.warning)
                         .setTitle(`🛡️ ${actionText[action]}`)
                         .addField('👤 Usuário', `${user.tag} (${user.id})`, true)
                         .addField('👮 Moderador', `${moderator.tag}`, true)
                         .setThumbnail(user.displayAvatarURL());

        if (reason) {
            embed.addField('📝 Motivo', reason, false);
        }

        return embed.setFooter('DIG Brasil • Sistema de Moderação');
    }

    // Embed para help
    help() {
        return this.setColor(config.colors.primary)
                  .setTitle(`${config.emojis.info} Central de Ajuda - DIG Brasil`)
                  .setDescription('Bem-vindo ao sistema de ajuda do **DIG Brasil**!')
                  .addField('👑 Comandos de Administração', 
                           '`/setup-verificar` - Configurar verificação\n`/setup-ticket` - Configurar tickets\n`/config` - Painel de configuração\n`/ban` `/kick` `/lock` `/unlock` `/limpar`', false)
                  .addField('🛡️ Comandos de Moderação',
                           '`/mute` `/unmute` `/aviso` `/ver-aviso` `/remover-aviso`', false)
                  .addField('👤 Comandos Gerais',
                           '`/help` `/ping` `/avatar` `/userinfo` `/serverinfo` `/sugerir`', false)
                  .addField('⏰ Sistema de Ponto',
                           '`/bater-ponto` - Controle de ponto\n`/historico-ponto` - Ver histórico', false)
                  .addField('🎨 Ferramentas',
                           '`/embed-builder` - Construtor de embeds interativo', false)
                  .setThumbnail('https://images.unsplash.com/photo-1551434678-e076c223a692?w=400')
                  .setFooter('DIG Brasil • Central de Ajuda');
    }

    build() {
        return this.embed;
    }
}

module.exports = CustomEmbedBuilder;