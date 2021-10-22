import { ApplicationCommandData, CommandInteraction, Guild, Permissions, PermissionString } from 'discord.js';
import { AqueClient } from './AqueClient';
import { SlashCommand } from '../types/SlashCommand';
import { Module } from './Module';
import { developers } from '../consts/developers';

export class Command {
    /**
     * The module this command belongs to
     */
    public readonly module: Module;

    /**
     * The application command data used to register the command
     */
    public readonly data: ApplicationCommandData;

    /**
     * The name of this command.
     */
    public readonly name: string;

    /**
     * The description of this command.
     */
    public readonly description: string;

    /**
     * The function executes when this command is successfully activated.
     * @private
     */
    readonly #execute: (client: AqueClient, interaction: CommandInteraction) => Promise<void>;

    /**
     * Indicates whether the use must be a developer to use this command.
     */
    public readonly developerOnly: boolean;

    /**
     * Indicates whether the user must be the guild owner to use this command.
     */
    public readonly ownerOnly: boolean;

    /**
     * Indicates whether the user must have the ADMINISTRATOR permission flag to use this command.
     */
    public readonly adminOnly: boolean;

    /**
     * Indicates the permissions required by the bot to use this command.
     */
    public readonly botPerms: Set<PermissionString> = new Set<PermissionString>();

    /**
     * Indicates the permissions required by the user to use this command.
     */
    public readonly userPerms: Set<PermissionString> = new Set<PermissionString>();


    public constructor(module: Module, file: SlashCommand) {
        const { data, options, execute } = file;

        this.module = module;
        this.data = data;

        this.name = data.name;
        this.description = data.description;

        this.developerOnly = options.developerOnly ?? false;
        this.ownerOnly = options.ownerOnly ?? false;
        this.adminOnly = options.adminOnly ?? false;

        for (const perm of options.botPerms ?? []) { this.botPerms.add(perm); }
        for (const perm of options.userPerms ?? []) { this.userPerms.add(perm); }

        this.#execute = execute;
    }

    public async register(client: AqueClient, guild: Guild, update: boolean = false): Promise<void> {
        console.log({ Registering_Command: this.name }, { Module: this.module.name }, { Guild: guild.id });
        try {
            // Check for an existing command
            let command = await guild.commands.cache.find((command) => command.name === this.name);

            if (command) {
                if (update) {
                    // Update the command
                    command = await command.edit(this.data);
                }
            }
            else {
                // Create the command
                command = await guild.commands.create(this.data);
            }

            // Register the command with the client
            client.commands.set(command.id, this);
        }
        catch (e) {
            console.log(e);
        }
    }

    public async execute(client: AqueClient, interaction: CommandInteraction): Promise<void> {
        const { user } = interaction;

        // Developer only command
        if (this.developerOnly && !developers.includes(user.id)) { return; }

        // Guild Interaction
        if (interaction.guild) {
            const { guild, memberPermissions } = interaction;

            // Owner only command
            if (this.ownerOnly && guild.ownerId !== user.id) { return; }

            // Admin only command
            if (this.adminOnly && !(memberPermissions && memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR))) { return; }

            // Bot required perms
            // Todo: Add Bot required perms check

            // User required Perm
            // Todo: Add user required perms check

            // Run the command
            await this.#execute(client, interaction);
        }
        else {
            console.log([ 'Guild-less Interaction' ]);
            console.log(interaction);
        }
    }


}
