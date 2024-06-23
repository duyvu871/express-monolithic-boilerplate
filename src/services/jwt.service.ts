import jwt from 'jsonwebtoken';

export default class JwtService {
    private static readonly secret = process.env.JWT_SECRET || 'secret';

    static sign(payload: string | object | Buffer, options?: jwt.SignOptions | undefined) {
        return jwt.sign(payload, this.secret, options);
    }

    static verify(token: string, options?: jwt.VerifyOptions | undefined) {
        return jwt.verify(token, this.secret, options);
    }

    static decode(token: string, options: jwt.DecodeOptions | undefined = {complete: true}) {
        return jwt.decode(token, options);
    }
}