import * as mockery from 'mockery';
import { RootRequire } from '@dojo/interfaces/loader';

declare const require: RootRequire;

export default function loadModule<T>(mid: string, mocks: any, returnDefault: boolean = true): T {
	mockery.enable({
		useCleanCache: true,
		warnOnReplace: false,
		warnOnUnregistered: false
	});
	mockery.resetCache();

	for (const mid in mocks) {
		mockery.registerMock(mid, mocks[mid]);
	}

	const loader = require.nodeRequire || require;
	const module = loader(require.toUrl(mid));
	return returnDefault && module.default ? module.default : module;
}

export function cleanupModuleMocks() {
	mockery.deregisterAll();
	mockery.disable();
}
