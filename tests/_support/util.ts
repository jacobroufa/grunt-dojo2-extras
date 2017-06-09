export function throwWithError(errorMessage: string = 'Unexpected code path') {
	return function() {
		throw new Error(errorMessage);
	};
}
