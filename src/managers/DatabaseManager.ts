import { AqueClient } from '../structures/AqueClient';
import { DataManager } from 'discord.js';
import Josh from '@joshdb/core';

export class DatabaseManager extends DataManager<string, Josh, string> {

    public constructor(client: AqueClient) {
        super(client, Josh);
    }
}
