const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags,
} = require('discord.js');
const colors = require('colors/safe');
const TagService = require('../../../service/tagService');

const COMMAND_ERROR_MESSAGE = 'An error occurred while processing your request. Please try again later.';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Manage your personal tags')
        .addSubcommand(sub =>
            sub.setName('create').setDescription('Create or update a tag')
                .addBooleanOption(opt =>
                    opt.setName('ephemeral').setDescription('Show response as ephemeral (only you can see)')
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('delete')
                .setDescription('Delete one of your tags')
                .addStringOption(opt =>
                    opt.setName('name').setDescription('Name of the tag').setRequired(true)
                )
                .addBooleanOption(opt =>
                    opt.setName('ephemeral').setDescription('Show response as ephemeral (only you can see)')
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('use')
                .setDescription('Retrieve and display a tag')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Name of the tag')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addBooleanOption(opt =>
                    opt.setName('ephemeral').setDescription('Show response as ephemeral (only you can see)')
                )
        )
        .addSubcommand(sub =>
            sub.setName('list').setDescription('List all your tags')
                .addBooleanOption(opt =>
                    opt.setName('ephemeral').setDescription('Show response as ephemeral (only you can see)')
                )
        ),
    async autocomplete(interaction) {
        try {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name !== 'name') return;
            const ownerId = interaction.user.id;
            const input = focusedOption.value;
            const tags = await TagService.listTags(ownerId);
            const choices = tags
                .map(tag => tag.name)
                .filter(name => !input || name.toLowerCase().includes(input.toLowerCase()))
                .slice(0, 25)
                .map(name => ({ name, value: name }));
            await interaction.respond(choices);
        } catch (error) {
            console.error(colors.red(`Error in autocomplete: ${error.stack || error}`));
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        try {
            if (interaction.isModalSubmit()) {
                return await this.handleModalSubmit(interaction);
            }

            const sub = interaction.options.getSubcommand();
            const ownerId = interaction.user.id;
            const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;

            switch (sub) {
                case 'create': {
                    const modal = new ModalBuilder()
                        .setCustomId('tagCreateModal')
                        .setTitle('Create or Update Tag');

                    const nameInput = new TextInputBuilder()
                        .setCustomId('tagNameInput')
                        .setLabel('Tag Name')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const contentInput = new TextInputBuilder()
                        .setCustomId('tagContentInput')
                        .setLabel('Tag Content')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(nameInput),
                        new ActionRowBuilder().addComponents(contentInput)
                    );

                    return interaction.showModal(modal);
                }

                case 'delete': {
                    const name = interaction.options.getString('name');
                    const deleted = await TagService.deleteTag(ownerId, name);
                    const msg = deleted ? `🗑️ Tag **${name}** deleted.` : `⚠️ Tag **${name}** not found.`;
                    return interaction.editReply({ content: msg, flags: ephemeral ? MessageFlags.Ephemeral : undefined });
                }

                case 'use': {
                    const name = interaction.options.getString('name');
                    const tag = await TagService.getTag(ownerId, name);
                    const msg = tag ? tag.content : `⚠️ Tag **${name}** not found.`;
                    return interaction.editReply({ content: msg, flags: ephemeral ? MessageFlags.Ephemeral : undefined });
                }

                case 'list': {
                    const tags = await TagService.listTags(ownerId);
                    if (tags.length === 0) {
                        return interaction.editReply({ content: '📝 You have no tags yet. Use `/tag create` to create your first tag!', flags: ephemeral ? MessageFlags.Ephemeral : undefined });
                    }
                    
                    const tagList = tags.map(tag => `• **${tag.name}**`).join('\n');
                    const msg = `📋 **Your Tags (${tags.length}):**\n${tagList}\n\nUse \`/tag use <name>\` to display a tag.`;
                    return interaction.editReply({ content: msg, flags: ephemeral ? MessageFlags.Ephemeral : undefined });
                }
            }
        } catch (error) {
            console.error(colors.red(`Error in /tag: ${error.stack || error}`));
            await this.handleError(interaction, error);
        }
    },

    async handleModalSubmit(interaction) {
        try {
            if (interaction.customId === 'tagCreateModal') {
                const name = interaction.fields.getTextInputValue('tagNameInput');
                const content = interaction.fields.getTextInputValue('tagContentInput');
                const ownerId = interaction.user.id;

                const tag = await TagService.upsertTag(ownerId, name, content);
                const message = `✅ Tag **${name}** has been ${tag ? 'updated' : 'created'} successfully!`;
                
                await interaction.reply({ 
                    content: message, 
                    flags: MessageFlags.Ephemeral 
                });
            }
        } catch (error) {
            console.error(colors.red(`Error handling modal submit: ${error.stack || error}`));
            await this.handleError(interaction, error);
        }
    },

    async handleError(interaction, error) {
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: COMMAND_ERROR_MESSAGE, flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: COMMAND_ERROR_MESSAGE, flags: MessageFlags.Ephemeral });
            }
        } catch (replyError) {
            console.error(colors.red(`Failed to send error response: ${replyError.stack || replyError}`));
        }
    },
};
