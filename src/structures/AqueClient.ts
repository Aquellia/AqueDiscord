import { Client, ClientOptions, Collection } from 'discord.js';
import { DatabaseManager } from '../managers/DatabaseManager';
import { AqueBot } from './AqueBot';
import { Command } from './Command';

export class AqueClient extends Client {
    /**
     * The AqueBot instance that created this client
     */
    public readonly bot: AqueBot;

    /**
     * The collection of registered commands
     */
    public readonly commands: Collection<string, Command> = new Collection<string, Command>();

    /**
     * The Data Manager for this client.
     */
    public readonly databases: DatabaseManager;

    public constructor(bot: AqueBot, options: ClientOptions) {
        super(options);
        this.bot = bot;
        this.databases = new DatabaseManager(this);
    }
}
