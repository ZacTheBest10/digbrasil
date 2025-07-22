const { ChannelType, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../utils/embedBuilder');
const CustomButtonBuilder = require('../utils/buttonBuilder');
const database = require('../database/database');

class TicketSystem {
    static async createTicket(interaction, category) {
        try {
            const { guild, user } = interaction;
            const config = await database.getGuildConfig(guild.id);

            if (!config.ticket_category) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Sistema de tickets não configurado.')],
                    ephemeral: true
                });
            }

            const ticketCategory = guild.channels.cache.get(config.ticket_category);
            if (!ticketCategory) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Categoria de tickets não encontrada.')],
                    ephemeral: true
                });
            }

            // Verificar se o usuário já tem um ticket aberto
            const existingTicket = guild.channels.cache.find(channel => 
                channel.name.includes(`ticket-${user.username.toLowerCase()}`) && 
                channel.parentId === ticketCategory.id
            );

            if (existingTicket) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().warning('Aviso', `Você já possui um ticket aberto: ${existingTicket}`)],
                    ephemeral: true
                });
            }

            const categoryNames = {
                'denuncia': 'Denúncia',
                'suporte': 'Suporte',
                'duvida': 'Dúvida'
            };

            // Criar canal do ticket
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username.toLowerCase()}-${category}`,
                type: ChannelType.GuildText,
                parent: ticketCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: guild.members.me.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            // Salvar ticket no banco
            await database.createTicket(guild.id, ticketChannel.id, user.id, category);
            await database.addLog(guild.id, user.id, 'ticket_created', `Ticket criado: ${categoryNames[category]}`);

            // Embed do ticket
            const ticketEmbed = new CustomEmbedBuilder()
                .setColor('#1e3a8a')
                .setTitle(`🎫 Ticket - ${categoryNames[category]}`)
                .setDescription(`Olá ${user}, bem-vindo ao seu ticket!\n\nDescreva detalhadamente o motivo do seu contato. Nossa equipe responderá em breve.`)
                .addField('📋 Categoria', categoryNames[category], true)
                .addField('👤 Usuário', user.tag, true)
                .addField('⏰ Criado em', `<t:${Math.floor(Date.now() / 1000)}:F>`, true)
                .setThumbnail(user.displayAvatarURL())
                .setFooter('DIG Brasil • Sistema de Tickets');

            const controlButtons = CustomButtonBuilder.ticketControlButtons();

            await ticketChannel.send({
                content: `${user} | <@&${guild.roles.cache.find(r => r.permissions.has('Administrator'))?.id || guild.ownerId}>`,
                embeds: [ticketEmbed.build()],
                components: controlButtons
            });

            // Resposta ao usuário
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().success('Ticket Criado', `Seu ticket foi criado com sucesso! ${ticketChannel}`)],
                ephemeral: true
            });

            // Log no canal de logs
            if (config.logs_channel) {
                const logChannel = guild.channels.cache.get(config.logs_channel);
                if (logChannel) {
                    const logEmbed = new CustomEmbedBuilder()
                        .info('Ticket Criado', `**${user.tag}** criou um ticket`)
                        .addField('📋 Categoria', categoryNames[category], true)
                        .addField('📍 Canal', ticketChannel.toString(), true)
                        .addField('⏰ Horário', `<t:${Math.floor(Date.now() / 1000)}:F>`, true)
                        .setThumbnail(user.displayAvatarURL());

                    logChannel.send({ embeds: [logEmbed.build()] });
                }
            }

        } catch (error) {
            console.error('Erro ao criar ticket:', error);
            await interaction.reply({
                embeds: [new CustomEmbedBuilder().error('Erro', 'Ocorreu um erro ao criar o ticket.')],
                ephemeral: true
            });
        }
    }

    static async closeTicket(interaction) {
        try {
            const { channel, user, guild } = interaction;

            // Verificar se é um canal de ticket
            if (!channel.name.includes('ticket-')) {
                return interaction.reply({
                    embeds: [new CustomEmbedBuilder().error('Erro', 'Este comando só pode ser usado em canais de ticket.')],
                    ephemeral: true
                });
            }

            const confirmButtons = CustomButtonBuilder.confirmationButtons('confirm_close_ticket', 'cancel_close_ticket');

            await interaction.reply({
                embeds: [new CustomEmbedBuilder().warning('Confirmação', 'Tem certeza que deseja fechar este ticket?')],
                components: confirmButtons,
                ephemeral: true
            });

        } catch (error) {
            console.error('Erro ao fechar ticket:', error);
        }
    }

    static async confirmCloseTicket(interaction) {
        try {
            const { channel, user, guild } = interaction;

            await database.closeTicket(channel.id, user.id);
            await database.addLog(guild.id, user.id, 'ticket_closed', `Ticket fechado: ${channel.name}`);

            const embed = new CustomEmbedBuilder()
                .success('Ticket Fechado', 'Este ticket será deletado em 5 segundos...')
                .setFooter('DIG Brasil • Sistema de Tickets');

            await interaction.update({
                embeds: [embed.build()],
                components: []
            });

            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error('Erro ao deletar canal:', error);
                }
            }, 5000);

        } catch (error) {
            console.error('Erro ao confirmar fechamento:', error);
        }
    }

    static async claimTicket(interaction) {
        try {
            const { channel, user } = interaction;

            const embed = new CustomEmbedBuilder()
                .success('Ticket Assumido', `${user} assumiu este ticket e irá ajudá-lo.`)
                .setThumbnail(user.displayAvatarURL());

            await interaction.reply({ embeds: [embed.build()] });

        } catch (error) {
            console.error('Erro ao assumir ticket:', error);
        }
    }

    static async setupTickets(interaction, channel) {
        try {
            const embed = new CustomEmbedBuilder().tickets();
            const buttons = CustomButtonBuilder.ticketButtons();

            await channel.send({
                embeds: [embed.build()],
                components: buttons
            });

            return true;
        } catch (error) {
            console.error('Erro ao configurar tickets:', error);
            return false;
        }
    }
}

module.exports = TicketSystem;