const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const CustomButtonBuilder = require('../utils/buttonBuilder');

class EmbedBuilderSystem {
    static embedData = new Map(); // userId -> embedData

    static async handleEmbedBuilder(interaction, action) {
        try {
            const userId = interaction.user.id;

            switch (action) {
                case 'start':
                    await this.startEmbedBuilder(interaction, userId);
                    break;
                case 'title':
                    await this.showTitleModal(interaction, userId);
                    break;
                case 'description':
                    await this.showDescriptionModal(interaction, userId);
                    break;
                case 'color':
                    await this.showColorMenu(interaction, userId);
                    break;
                case 'image':
                    await this.showImageModal(interaction, userId);
                    break;
                case 'thumbnail':
                    await this.showThumbnailModal(interaction, userId);
                    break;
                case 'footer':
                    await this.showFooterModal(interaction, userId);
                    break;
                case 'preview':
                    await this.showPreview(interaction, userId);
                    break;
                case 'send':
                    await this.showChannelModal(interaction, userId);
                    break;
                case 'reset':
                    await this.resetEmbed(interaction, userId);
                    break;
            }

        } catch (error) {
            console.error('Erro no embed builder:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro no construtor de embeds.')],
                ephemeral: true
            });
        }
    }

    static async startEmbedBuilder(interaction, userId) {
        // Inicializar dados da embed
        this.embedData.set(userId, {
            title: null,
            description: null,
            color: '#1e3a8a',
            image: null,
            thumbnail: null,
            footer: null
        });

        const embed = new CustomEmbedBuilder()
            .setTitle('🎨 Construtor de Embeds')
            .setDescription('Use os botões abaixo para configurar sua embed personalizada:')
            .addField('📝 Título', 'Não definido', true)
            .addField('📄 Descrição', 'Não definida', true)
            .addField('🎨 Cor', '#1e3a8a', true)
            .addField('🖼️ Imagem', 'Não definida', true)
            .addField('🖼️ Thumbnail', 'Não definida', true)
            .addField('📋 Footer', 'Não definido', true);

        const buttons = CustomButtonBuilder.embedBuilderButtons();

        await interaction.reply({
            embeds: [embed.build()],
            components: buttons,
            ephemeral: true
        });
    }

    static async showTitleModal(interaction, userId) {
        const modal = new ModalBuilder()
            .setCustomId('embed_title_modal')
            .setTitle('Configurar Título da Embed');

        const titleInput = new TextInputBuilder()
            .setCustomId('title_input')
            .setLabel('Título da Embed')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(256)
            .setRequired(false)
            .setPlaceholder('Digite o título da embed...');

        const actionRow = new ActionRowBuilder().addComponents(titleInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    static async showDescriptionModal(interaction, userId) {
        const modal = new ModalBuilder()
            .setCustomId('embed_description_modal')
            .setTitle('Configurar Descrição da Embed');

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description_input')
            .setLabel('Descrição da Embed')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)
            .setRequired(false)
            .setPlaceholder('Digite a descrição da embed...');

        const actionRow = new ActionRowBuilder().addComponents(descriptionInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    static async showColorMenu(interaction, userId) {
        const colorMenu = CustomButtonBuilder.colorSelectMenu();
        
        await interaction.reply({
            content: '🎨 Escolha uma cor para sua embed:',
            components: [colorMenu],
            ephemeral: true
        });
    }

    static async showImageModal(interaction, userId) {
        const modal = new ModalBuilder()
            .setCustomId('embed_image_modal')
            .setTitle('Configurar Imagem da Embed');

        const imageInput = new TextInputBuilder()
            .setCustomId('image_input')
            .setLabel('URL da Imagem')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('https://exemplo.com/imagem.png');

        const actionRow = new ActionRowBuilder().addComponents(imageInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    static async showThumbnailModal(interaction, userId) {
        const modal = new ModalBuilder()
            .setCustomId('embed_thumbnail_modal')
            .setTitle('Configurar Thumbnail da Embed');

        const thumbnailInput = new TextInputBuilder()
            .setCustomId('thumbnail_input')
            .setLabel('URL da Thumbnail')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('https://exemplo.com/thumbnail.png');

        const actionRow = new ActionRowBuilder().addComponents(thumbnailInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    static async showFooterModal(interaction, userId) {
        const modal = new ModalBuilder()
            .setCustomId('embed_footer_modal')
            .setTitle('Configurar Footer da Embed');

        const footerInput = new TextInputBuilder()
            .setCustomId('footer_input')
            .setLabel('Texto do Footer')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(2048)
            .setRequired(false)
            .setPlaceholder('Digite o texto do footer...');

        const actionRow = new ActionRowBuilder().addComponents(footerInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    static async showPreview(interaction, userId) {
        const data = this.embedData.get(userId);
        if (!data) {
            return interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Dados da embed não encontrados.')],
                ephemeral: true
            });
        }

        const previewEmbed = new CustomEmbedBuilder()
            .setColor(data.color);

        if (data.title) previewEmbed.setTitle(data.title);
        if (data.description) previewEmbed.setDescription(data.description);
        if (data.image) previewEmbed.setImage(data.image);
        if (data.thumbnail) previewEmbed.setThumbnail(data.thumbnail);
        if (data.footer) previewEmbed.setFooter(data.footer);

        await interaction.reply({
            content: '👁️ **Prévia da sua embed:**',
            embeds: [previewEmbed.build()],
            ephemeral: true
        });
    }

    static async showChannelModal(interaction, userId) {
        const modal = new ModalBuilder()
            .setCustomId('embed_send_modal')
            .setTitle('Enviar Embed');

        const channelInput = new TextInputBuilder()
            .setCustomId('channel_input')
            .setLabel('ID do Canal')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Digite o ID do canal...');

        const actionRow = new ActionRowBuilder().addComponents(channelInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }

    static async resetEmbed(interaction, userId) {
        this.embedData.delete(userId);
        
        await interaction.reply({
            embeds: [new CustomEmbedBuilder().success('Reset', 'Dados da embed foram resetados!')],
            ephemeral: true
        });
    }

    static async handleModal(interaction) {
        const userId = interaction.user.id;
        const data = this.embedData.get(userId) || {};

        switch (interaction.customId) {
            case 'embed_title_modal':
                data.title = interaction.fields.getTextInputValue('title_input') || null;
                break;
            case 'embed_description_modal':
                data.description = interaction.fields.getTextInputValue('description_input') || null;
                break;
            case 'embed_image_modal':
                data.image = interaction.fields.getTextInputValue('image_input') || null;
                break;
            case 'embed_thumbnail_modal':
                data.thumbnail = interaction.fields.getTextInputValue('thumbnail_input') || null;
                break;
            case 'embed_footer_modal':
                data.footer = interaction.fields.getTextInputValue('footer_input') || null;
                break;
            case 'embed_send_modal':
                const channelId = interaction.fields.getTextInputValue('channel_input');
                return await this.sendEmbed(interaction, userId, channelId);
        }

        this.embedData.set(userId, data);
        
        await interaction.reply({
            embeds: [new CustomEmbedBuilder().success('Atualizado', 'Configuração salva com sucesso!')],
            ephemeral: true
        });
    }

    static async handleColorSelect(interaction) {
        const userId = interaction.user.id;
        const data = this.embedData.get(userId) || {};
        
        data.color = interaction.values[0];
        this.embedData.set(userId, data);

        await interaction.reply({
            embeds: [new CustomEmbedBuilder().success('Cor Atualizada', `Cor alterada para: ${interaction.values[0]}`)],
            ephemeral: true
        });
    }

    static async sendEmbed(interaction, userId, channelId) {
        try {
            const data = this.embedData.get(userId);
            if (!data) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Dados da embed não encontrados.')],
                    ephemeral: true
                });
            }

            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Canal não encontrado.')],
                    ephemeral: true
                });
            }

            const embed = new CustomEmbedBuilder()
                .setColor(data.color);

            if (data.title) embed.setTitle(data.title);
            if (data.description) embed.setDescription(data.description);
            if (data.image) embed.setImage(data.image);
            if (data.thumbnail) embed.setThumbnail(data.thumbnail);
            if (data.footer) embed.setFooter(data.footer);

            await channel.send({ embeds: [embed.build()] });

            await interaction.reply({
                embeds: [new CustomEmbedBuilder().success('Enviado', `Embed enviada para ${channel} com sucesso!`)],
                ephemeral: true
            });

            // Limpar dados após envio
            this.embedData.delete(userId);

        } catch (error) {
            console.error('Erro ao enviar embed:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Não foi possível enviar a embed.')],
                ephemeral: true
            });
        }
    }
}

module.exports = EmbedBuilderSystem;