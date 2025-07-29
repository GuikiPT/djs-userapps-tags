const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

module.exports = async function (client) {
    let numberOfLoadedEvents = 0;
    console.info(colors.yellow('Loading Events Handler . . .'));

    const eventsPath = path.join(__dirname, '../events');
    const eventFolders = fs.readdirSync(eventsPath);

    const bindEvent = (event, eventName, filePath, once = false) => {
        const eventHandler = async (...args) => {
            try {
                await event.execute(...args);
            } catch (error) {
                console.error(colors.red(`Error executing event '${eventName}' in file '${filePath}': ${error.stack}`));
            }
        };

        if (once) {
            client.once(eventName, eventHandler);
        } else {
            client.on(eventName, eventHandler);
        }
    };

    for (const folder of eventFolders) {
        const eventFiles = fs.readdirSync(path.join(eventsPath, folder)).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, folder, file);
            try {
                const event = require(filePath);

                if (!event.name || !event.execute) {
                    console.warn(colors.yellow(`Warning: Event file '${filePath}' is missing a 'name' or 'execute' property.`))
                    continue;
                }

                bindEvent(event, event.name, filePath, event.once);
                numberOfLoadedEvents++;

                if (process.env.DEBUG) {
                    console.debug(`Loaded event: ${event.name} from ${folder}/${file}`)
                }
            } catch (error) {
                console.error(colors.red(`Failed to load event from file: '${filePath}'`));
                console.error(colors.red(error.stack || error));
            }
        }
    }
    console.log(colors.green(`Loaded ${numberOfLoadedEvents} events successfully`))
};
