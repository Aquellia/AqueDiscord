import { Dirent } from 'fs';

export interface FolderEntries {
    files: Dirent[];
    folders: Dirent[];
}
