export function timeout(delay: number, cb: () => void = () => {}) {
    return new Promise(resolve => setTimeout(resolve, delay)).then(cb);
}