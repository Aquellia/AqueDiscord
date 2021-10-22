import { AqueClient } from '../../structures/AqueClient';
import { ApplicationCommandData, CommandInteraction, MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes, ApplicationCommandTypes } from 'discord.js/typings/enums';
import { CommandOptions } from '../../types/CommandOptions';

export const data: ApplicationCommandData = {
    name: 'register',
    description: 'DEVELOPER ONLY Registers a slash command to discord',
    type: ApplicationCommandTypes.CHAT_INPUT,
    options: [
        {
            name: 'module',
            description: 'The Module the command is from',
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        },
        {
            name: 'command',
            description: 'The name of the command to register',
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        },
        {
            name: 'all',
            description: 'Indicates whether to register this command on all guilds',
            type: ApplicationCommandOptionTypes.BOOLEAN,
            required: false
        }
    ]
};

export const options: CommandOptions = {
    developerOnly: true
};

export async function execute(client: AqueClient, interaction: CommandInteraction): Promise<void> {
    const { options } = interaction;

    const embed = new MessageEmbed();

    // Determine Module
    const moduleName = options.get('module')?.value as string;
    const module = client.bot.modules.get(moduleName);

    if (!module) {
        console.log([ 'Missing Module' ], moduleName);
        // Todo: Unable to find module
        return;
    }

    // Determine Command
    const commandName = options.get('command')?.value as string;
    const command = module.commands.get(commandName);

    if (!command) {
        console.log([ 'Missing Command' ], commandName);
        // Todo: Unable to find command
        return;
    }

    // Determine Guilds
    const all = options.get('all')?.value as boolean ?? false;
    const guilds = (all) ? client.guilds.cache.values() : [ interaction.guild! ];

    const results = [];
    // Register command updates
    for (const guild of guilds) {
        await command.register(client, guild, true);
        results.push(`${'`' + guild.id + '`'} **:** ${guild.name} Updated`);
    }

    embed.setTitle('Registered Command');
    embed.setDescription(`**Module:** ${module.name}, **Command:** ${command.name}\n${results.join(', ')}`);

    await interaction.reply({ embeds: [ embed ], ephemeral: true });
}
