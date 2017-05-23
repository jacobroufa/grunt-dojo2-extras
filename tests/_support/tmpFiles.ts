import { mkdirSync, mkdtempSync, existsSync } from 'fs';
import { join } from 'path';

export function tmpDirectory(ext?: string): string {
	if (!existsSync('.test')) {
		mkdirSync('.test');
	}

	const tmpDir = mkdtempSync('.test/dir-');

	if (ext) {
		return join(tmpDir, `index${ext}`);
	}

	return tmpDir;
}

export function tmpFile(name: string = String(Math.floor(Math.random() * 10000))): string {
	let filename: string;

	do {
		filename = join(tmpDirectory(), name);
	} while (existsSync(filename));

	return filename;
}
