import _ from 'lodash';

export function flattenObject(o: any, prefix: string = '', result: Record<any, any> = {}, keepNull = true) {
	if (_.isString(o) || _.isNumber(o) || _.isBoolean(o) || (keepNull && _.isNull(o))) {
		result[prefix] = o;
		return result;
	}

	if (_.isArray(o) || _.isPlainObject(o)) {
		for (let i in o) {
			let pref = prefix;
			if (_.isArray(o)) {
				pref = pref + `[${i}]`;
			} else {
				if (_.isEmpty(prefix)) {
					pref = i;
				} else {
					pref = prefix + '.' + i;
				}
			}
			flattenObject(o[i], pref, result, keepNull);
		}
		return result;
	}
	return result;
}


export function deFlattenObject(flatObj: Record<string, any>, separator = '.') {
	const result: Record<string, any> = {};

	for (const [key, value] of Object.entries(flatObj)) {
		const keys = key.replace(/\[(\d+)\]/g, '.$1').split(separator); // Handle array notation
		// console.log('key', key)
		let currentLevel = result;

		for (let i = 0; i < keys.length; i++) {
			const currentKey = keys[i];

			if (i === keys.length - 1) {
				// Last key, assign the value
				currentLevel[currentKey] = value;
			} else {
				// Create nested object if it doesn't exist
				if (!currentLevel[currentKey]) {
					// Check if the next key is a numeric index
					const nextKey = keys[i + 1];
					currentLevel[currentKey] = /^\d+$/.test(nextKey) ? [] : {};
				}
				currentLevel = currentLevel[currentKey];
			}
		}
	}
	return result;
}
