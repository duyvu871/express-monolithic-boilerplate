type AnyObject = Record<any, any>;

export function extractProperties<T extends AnyObject>(original: T, keys: (keyof T)[]): Pick<T, (keyof T)> {
    const extracted = {} as Pick<T, keyof T> ;
    keys.forEach(key => {
        if (original.hasOwnProperty(key)) {
            extracted[key] = original[key];
        }
    });
    return extracted;
}