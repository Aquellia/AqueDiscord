import { AqueClient } from '../structures/AqueClient';
import { ChatInputApplicationCommandData, CommandInteraction } from 'discord.js';
import { CommandOptions } from './CommandOptions';

export interface SlashCommand {
    /**
     * The application command data of this slash command
     */
    data: ChatInputApplicationCommandData;

    /**
     * The configuration settings of this command
     */
    options: CommandOptions;

    /**
     * The commands execution logic function
     * @param client The client calling this command
     * @param interaction The interaction that triggered this command
     */
    execute: (client: AqueClient, interaction: CommandInteraction) => Promise<void>;
}
