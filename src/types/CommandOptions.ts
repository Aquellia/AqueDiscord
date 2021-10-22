import { PermissionString } from 'discord.js';

export interface CommandOptions {
    /**
     * Indicates if the command is restricted to developer use only
     */
    developerOnly?: boolean;

    /**
     * Indicates if the command is restricted to server owner use only
     */
    ownerOnly?: boolean;

    /**
     * Indicates if the command is restricted to users with the Administrator Permission
     */
    adminOnly?: boolean;

    /**
     * Indicates the permissions required for the bot to successfully perform this command
     */
    botPerms?: PermissionString[];

    /**
     * Indicates the permissions required for the user to activate this command
     */
    userPerms?: PermissionString[];
}
