import { existsSync, mkdtempSync } from 'fs';
import { sync as mkdirp } from 'mkdirp';
import { join } from 'path';

export function makeTempDirectory(base: string, prefix: string = 'tmp-') {
	if (!existsSync(base)) {
		mkdirp(base);
	}
	return mkdtempSync(join(base, prefix));
}
