import { AqueClient } from '../../structures/AqueClient';

export default async function(client: AqueClient): Promise<void> {
    const { guilds, users, bot: { modules } } = client;
    console.log([ 'Ready' ], { Guilds: guilds.cache.size, Users: users.cache.size });

    // Register guild commands
    for (const [ , guild ] of guilds.cache) {
        for (const [ , module ] of modules) {
            await module.registerCommands(client, guild);
        }
    }
}
