export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Make many properties of an object optional
 * @example
 * type User = {
 *  name: string;
 *  email: string;
 *  password: string;
 *  role: string;
 *  isEmailVerified: boolean;
 * }
 * type UserOptional = MakeManyOptional<User, 'role' | 'isEmailVerified'>;
 */
export type MakeManyOptional<T, K extends keyof T> = Omit<T, K> & {[P in K]?: T[P]};

