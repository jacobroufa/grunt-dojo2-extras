/// <reference types="grunt" />
import IMultiTask = grunt.task.IMultiTask;
export default function wrapAsyncTask<T>(task: (this: IMultiTask<T>) => Promise<any>): (this: IMultiTask<T>) => void;
