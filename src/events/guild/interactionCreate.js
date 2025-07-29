const { Events, MessageFlags } = require('discord.js');
const colors = require('colors/safe');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isChatInputCommand() && !interaction.isModalSubmit() && !interaction.isAutocomplete()) return;

        const command = getCommand(interaction);
        if (!command) return;

        try {
            if (interaction.isChatInputCommand()) {
                await executeSlashCommand(command, interaction);
            } else if (interaction.isModalSubmit()) {
                await executeModalSubmit(command, interaction);
            } else if (interaction.isAutocomplete() && command.autocomplete) {
                await executeAutocomplete(command, interaction);
            }
        } catch (error) {
            console.error(colors.red(`Error in interaction handler: ${error.stack || error}`));
            await handleInteractionError(interaction, 'An error occurred while processing your request. Please try again later.');
        }
    },
};

function getCommand(interaction) {
    let key;
    if (interaction.isModalSubmit()) {
        key = interaction.customId.replace(/Modal$/i, '').replace(/(Create|Update)$/i, '').toLowerCase();
    } else {
        key = interaction.commandName;
    }
    const command = interaction.client.slashsCmds.get(key);
    if (!command) console.warn(colors.yellow(`Command handler for '${key}' not found.`));
    return command;
}

async function executeSlashCommand(command, interaction) {
    const sub = interaction.options.getSubcommand();
    const skipDefer = interaction.commandName === 'tag' && sub === 'create';
    if (!skipDefer) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        throw new Error(`Execution error in command ${interaction.commandName}: ${err.stack}`);
    }
}

async function executeModalSubmit(command, interaction) {
    try {
        await command.execute(interaction);
    } catch (err) {
        throw new Error(`Execution error on modal ${interaction.customId}: ${err.stack}`);
    }
}

async function executeAutocomplete(command, interaction) {
    try {
        await command.autocomplete(interaction);
    } catch (err) {
        throw new Error(`Execution error in autocomplete for ${interaction.commandName}: ${err.stack}`);
    }
}

async function handleInteractionError(interaction, message) {
    try {
        const opts = { flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: message, ...opts });
        } else {
            await interaction.reply({ content: message, ...opts });
        }
    } catch (replyErr) {
        console.error(colors.red(`Failed to send error response: ${replyErr.stack || replyErr}`));
    }
}
