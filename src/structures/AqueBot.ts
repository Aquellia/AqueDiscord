import { AqueClient } from './AqueClient';
import { ClientOptions, Collection, Intents } from 'discord.js';
import { readFolder } from '../util/IO';
import { REST } from '@discordjs/rest';
import { Module } from './Module';

export class AqueBot {
    readonly #rest: REST;
    readonly #token: string;
    #client?: AqueClient;
    #options: ClientOptions = { intents: 0 };

    /**
     * A collection of the Modules that make up this bot
     * @private
     */
    public readonly modules: Collection<string, Module> = new Collection<string, Module>();

    public get Rest(): REST {
        return this.#rest;
    }

    private set Client(client: AqueClient | undefined) {
        if (client instanceof AqueClient) {
            this.#client = client;
        }
    };

    public get Client(): AqueClient {
        if (this.#client) { return this.#client; }
        throw new Error('client called before initialization');
    };

    private set options(options: ClientOptions) {
        this.#options = options;
    };

    public get options(): ClientOptions {
        return { ...this.#options, intents: this.intents };
    };

    /**
     * The intents required for the bot to run
     */
    public get intents(): Intents {
        // Start with the intents specified at construction
        const intents = new Intents(this.#options.intents);
        // Add any intents requested by modules
        for (const module of this.modules.values()) {
            intents.add(module.intents);
        }

        return intents;
    }

    public constructor(token: string, options: ClientOptions) {
        this.#token = token;
        this.#rest = new REST({ version: '9' }).setToken(token);
        this.options = options;
    }

    /**
     * Loads all files, initializes the client, and connects to Discord.
     */
    public async start(): Promise<void> {
        console.log([ 'Starting...' ]);

        // Register Modules
        console.log('Registering Core Module');
        this.modules.set('core', new Module('core', 'core'));
        await this.registerModules('modules');

        // Load Modules
        for (const [ , module ] of this.modules) {
            await module.load();
        }

        // Initialize Client
        this.Client = new AqueClient(this, this.options);

        // Register events
        await this.registerEvents();

        // Connect
        this.#client?.login(this.#token);
    }

    private async registerEvents(): Promise<void> {
        if (this.#client instanceof AqueClient) {
            for (const module of this.modules.values()) {
                await module.registerEvents(this.#client);
            }
        }
        else {
            throw new Error('Client must be initialized before events');
        }
    }

    /**
     * Loads all modules found in target directory.
     * @param path Path from root to the modules directory.
     * @private
     */
    private async registerModules(path: string = 'modules'): Promise<void> {
        const { folders } = await readFolder(path);
        console.log('Registering', folders.length, 'modules');
        for (const folder of folders) {
            const name = folder.name;
            this.modules.set(name, new Module(name, `${path}/${folder.name}`));
        }
    }
}
