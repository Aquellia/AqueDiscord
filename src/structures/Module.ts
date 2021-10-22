import { ModuleFile } from '../types/ModuleFile';
import { Collection, Guild, Intents } from 'discord.js';
import { Event } from '../types/events';
import { attemptFileImport, readFolder } from '../util/IO';
import { Dirent } from 'fs';
import { AqueClient } from './AqueClient';
import { SlashCommand } from '../types/SlashCommand';
import { Command } from './Command';

export class Module {
    /**
     * The module's index file if it exists
     * @private
     */
    #index?: ModuleFile;
    /**
     * The Intents required by this module
     * @private
     */
    #intents?: Intents;
    /**
     * The name of this module.
     */
    public readonly name: string;
    /**
     * The path to this module's folder.
     */
    public readonly path: string;
    /**
     * A collection of the event files of this module.
     */
    public readonly events: Collection<string, Event> = new Collection<string, Event>();
    /**
     * A collection of the command files of this module
     */
    public readonly commands: Collection<string, Command> = new Collection<string, Command>();

    /**
     * The module's index file if it exists
     */
    public get index(): ModuleFile | null {
        return this.#index ?? null;
    };

    /**
     * The Intents required by this module
     */
    public get intents(): Intents {
        return this.#intents ?? new Intents();
    }

    /**
     * Constructs a module from a provided module folder.
     * @param name The name of the module
     * @param path Path to the module folder
     */
    public constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }

    /**
     * Attempts to load the module from folder
     */
    public async load() {
        console.log('Loading Module:', [ this.name ]);
        const { files, folders } = await readFolder(this.path);

        if (files.find((file) => file.name === 'index.js')) {
            await this.loadIndexFile();
        }
        if (folders.find((folder) => folder.name === 'events')) {
            await this.loadEventsFolder();
        }
        if (folders.find((folder) => folder.name === 'commands')) {
            await this.loadCommandsFolder();
        }
    }

    /**
     * Attempts to load the index file of this module
     * @private
     */
    private async loadIndexFile(): Promise<void> {
        const file: ModuleFile | null = await attemptFileImport<ModuleFile>(this.path + '/index.js');
        if (file) {
            this.#index = file;
            const { intents } = file;
            if (intents instanceof Intents) {
                this.#intents = intents;
            }
        }
    }

    /**
     * Attempts to load the events contained in the events folder of this module
     * @private
     */
    private async loadEventsFolder(): Promise<void> {
        const { files } = await readFolder(this.path + '/events');
        for (const file of files) {
            await this.loadEvent(file);
        }
    }

    /**
     * Attempts to load an event file
     * @param dirent The Dirent of the event file
     * @private
     */
    private async loadEvent(dirent: Dirent): Promise<void> {
        // Attempt to import the event file
        const file = await attemptFileImport<Event>(this.path + '/events/' + dirent.name);
        const name = dirent.name.split('.', 1)[0];
        if (file) {
            // Cache the event file
            this.events.set(name, file);
        }
        else {
            console.log('Failed to import event', name, 'from module', this.name);
        }
    }

    /**
     * Attempts to load the commands contained in the commands folder of this module
     * @private
     */
    private async loadCommandsFolder(): Promise<void> {
        const { files } = await readFolder(this.path + '/commands');
        for (const file of files) {
            await this.loadCommand(file);
        }
    }

    private async loadCommand(dirent: Dirent): Promise<void> {
        // Attempt to import the command file
        const file = await attemptFileImport<SlashCommand>(this.path + '/commands/' + dirent.name);
        const name = dirent.name.split('.', 1)[0];
        if (file) {
            try {
                const command = new Command(this, file);
                // Cache the command file
                this.commands.set(name, command);
            }
            catch (e) {
                console.log(['Failed to construct command'], { Name: name, Module: this.name });
            }
        }
        else {
            console.log(['Failed to import command'], { Name: name, Module: this.name });
        }
    }

    /**
     * Registers the events of this module with the client event emitter
     * @param client
     */
    public async registerEvents(client: AqueClient) {
        for (const [ name, event ] of this.events) {
            const eventWrapper = async (...args: any[]) => {
                try {
                    await event(client, ...args);
                }
                catch (e: any) {
                    console.log({ Event_Error: name, Module: this.name });
                    const guild = args[0]?.guild ?? args[1]?.guild ?? null;
                    if (guild) { console.log(guild.name); }
                    console.log(e.stack ?? e);
                }
            };
            console.log({ Registering_Event: name, 'Module': this.name });
            // Attach the wrapped event
            client.on(name, eventWrapper);
        }
    }

    public async registerCommands(client: AqueClient, guild: Guild) {
        for (const [ , command ] of this.commands) {
            await command.register(client, guild);
        }
    }
}
