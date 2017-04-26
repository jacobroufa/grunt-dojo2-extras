import { NodeResponse } from '@dojo/core/request/providers/node';
import { RequestOptions } from '@dojo/core/request/interfaces';
import request from '@dojo/core/request';
export declare function responseHandler(response: NodeResponse): NodeResponse | Promise<NodeResponse>;
export declare function fixAuth(options: RequestOptions): RequestOptions;
export default request;
