import { AqueClient } from '../structures/AqueClient';

export type Event = (client: AqueClient, ...args: unknown[]) => Promise<void>;
