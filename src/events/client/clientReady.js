const Discord = require('discord.js');
const colors = require('colors/safe');

module.exports = {
	name: Discord.Events.ClientReady,
	once: true,

	async execute(client) {
		console.log(colors.green(`Logged in as ${client.user.tag}`))

		const activity = process.env.DiscordBotActivity || 'Default Activity';
		const activityType = Discord.ActivityType.Watching;
		const status = process.env.DiscordBotStatus || 'online';

		const validateEnvVariables = () => {
			if (!process.env.DiscordBotActivity) {
				console.warn(colors.yellow('Warning: DiscordBotActivity is not set in environment variables.'))
			}
			if (!process.env.DiscordBotActivityType) {
				console.warn(colors.yellow('Warning: DiscordBotActivityType is not set in environment variables.'))
			}
			if (!process.env.DiscordBotStatus) {
				console.warn(colors.yellow('Warning: DiscordBotStatus is not set in environment variables.'))
			}
		};

		try {
			await client.user.setPresence({
				activities: [{ name: activity }],
				status: status,
			});
			console.log(colors.blue('Presence set successfully.'))
		} catch (error) {
			console.error(colors.red(`Error setting presence: ${error.stack}`))
		}

		validateEnvVariables();
	},
};
