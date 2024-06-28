import Token, {ITokenDTO} from '@/models/token.model';


interface TokenRepository {
	get(key: string): Promise<ITokenDTO | null>;
	set(key: string, value: ITokenDTO, expireIn: number): Promise<string>;
	delete(key: string): Promise<number>;
}

export default TokenRepository;