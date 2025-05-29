import * as JWT from 'jsonwebtoken';
import * as yup from 'yup';

const algorithm = 'RS256';

interface JWTVerifierConfig {
    issuer: string;
    algorithm: string;
    publicKey: string;
}

export class JWTVerifier {
    private _config: JWTVerifierConfig;

    constructor(config: JWTVerifierConfig) {
        JWTVerifier._validateConfig(config);
        this._config = config;
    }

    verifyAndDecodeToken(token: string): string | JWT.JwtPayload | null {
        const options: JWT.VerifyOptions = {
            algorithms: [this._config.algorithm as JWT.Algorithm],
            issuer: this._config.issuer
        };

        JWT.verify(token, this._config.publicKey, options);

        // Decode options should be compatible, but JWT.decode doesn't have a specific options type
        // We can reuse the verify options if applicable, or define specific decode options if needed
        return JWT.decode(token); // Using { complete: true } as an example for decode options
    }

    static _validateConfig(config: JWTVerifierConfig): void {
        const configSchema = yup.object({
            issuer: yup.string().required(),
            algorithm: yup.string().required(),
            publicKey: yup.string().required()
        });

        try {
            configSchema.validateSync(config);
        } catch (err: any) {
            throw new Error(err.errors ? err.errors[0] : err.message);
        }
    }

    static get algorithm(): string {
        return algorithm;
    }
}
