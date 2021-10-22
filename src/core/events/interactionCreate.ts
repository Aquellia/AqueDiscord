import { AqueClient } from '../../structures/AqueClient';
import { Interaction } from 'discord.js';

export default async function (client: AqueClient, interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandId);

        if (!command) { throw new Error('Unable to find command for interaction'); }

        await command.execute(client, interaction);
    }

}
