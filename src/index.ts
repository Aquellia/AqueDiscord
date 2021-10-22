import { ClientOptions, Intents } from 'discord.js';
import { AqueBot } from './structures/AqueBot';


const intents = new Intents([
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MEMBERS
])

const options: ClientOptions = {
    intents
}

async function start () {
    const { token } = await import('./token.js');
    const bot = new AqueBot(token, options);

    // Start the bot
    await bot.start();
}

start();
