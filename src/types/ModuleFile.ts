import { AqueClient } from '../structures/AqueClient';
import { Intents } from 'discord.js';

export type ModuleInitFunc = (client: AqueClient) => Promise<void>;

export interface ModuleFile {
    intents?: Intents;
    init?: ModuleInitFunc;
}
