import { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import { FolderEntries } from '../types/FolderEntries';

export async function readFolder(path: string): Promise<FolderEntries> {
    path = './dist/' + path;
    try {
        const directory: Dirent[] = await readdir(path, { withFileTypes: true });
        const files = directory.filter((entry) => entry.isFile() && entry.name.endsWith('.js'));
        const folders = directory.filter((entry) => entry.isDirectory());
        return { files, folders };
    }
    catch (e: any) {
        console.log('Unable to read folder:', path);
        throw new Error(e);
    }
}

/**
 * Attempt to import a file
 * @param path The path to the file.
 */
export async function attemptFileImport<T>(path: string): Promise<T | null> {
    try {
        const file = await import('../' + path);
        if (file) {
            if (file.default) { return file.default; }
            return file;
        }
        console.log({ File_Not_Found: path });
    }
    catch (e: any) {
        console.log(path);
        console.log(e.stack ?? e);
    }
    return null;
}
