import { SinonStub } from 'sinon';
import { Deferred } from 'intern/lib/Test';

export function setupWrappedAsyncStub(stub: SinonStub, dfd: Deferred<any>, callback: () => any) {
	stub.callsFake((task: () => Promise<any>) => {
		task().then(dfd.callback(callback));
	});
}
