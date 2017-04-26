import { NodeResponse } from '@dojo/core/request/providers/node';
import { toString } from './streams';
import { RequestOptions, Response } from '@dojo/core/request/interfaces';
import request, { Provider } from '@dojo/core/request';
import nodeRequest from '@dojo/core/request/providers/node';
import Task from '@dojo/core/async/Task';

export function responseHandler(response: NodeResponse): NodeResponse | Promise<NodeResponse> {
	const statusCode = response.status;
	if (statusCode < 200 || statusCode >= 300) {
		const message = response.statusText;
		return <never> toString(response.nativeResponse)
			.then(function (body) {
				throw new Error(`Github responded with ${ statusCode }. ${ message }. ${ body }`);
			});
	}
	return response;
}

export function fixAuth(options: RequestOptions) {
	if (options.password || options.user) {
		const credentials = new Buffer(`${ options.user || '' }:${ options.password || ''}`).toString('base64');
		const headers = options.headers = <{ [key: string]: string }> options.headers || {};
		headers['Authorization'] = `Basic ${ credentials }`;
		delete options.password;
		delete options.user;
	}
	return options;
}

const provider: Provider = function (url: string, options: RequestOptions): Task<Response> {
	return nodeRequest(url, fixAuth(options));
};

request.setDefaultProvider(provider);

export default request;
