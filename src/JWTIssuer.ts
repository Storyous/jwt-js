import * as JWT from 'jsonwebtoken';
import * as yup from 'yup';
import { Scope } from './Scope';

const algorithm = 'RS256';

interface JWTIssuerConfig {
    issuer: string;
    privateKey: string;
    expiresInSec?: number;
}

interface JWTIssuerOptions {
    expiresInSec?: number;
}

interface JWTPayload {
    [key: string]: any;
    scopes?: any[];
}

export class JWTIssuer {
    private _config: JWTIssuerConfig;

    constructor(config: JWTIssuerConfig) {
        JWTIssuer._validateConfig(config);
        this._config = config;
    }

    createToken(payload: JWTPayload, scopes: Scope[], options?: JWTIssuerOptions): string {
        const finalOptions: JWT.SignOptions = {
            algorithm: JWTIssuer.algorithm as JWT.Algorithm,
            issuer: this._config.issuer
        };

        if (options && typeof options.expiresInSec !== 'undefined') {
            finalOptions.expiresIn = options.expiresInSec;
        } else if (typeof this._config.expiresInSec !== 'undefined') {
            finalOptions.expiresIn = this._config.expiresInSec;
        }

        payload.scopes = scopes.map((scope) => scope.toArray());

        return JWT.sign(payload, this._config.privateKey, finalOptions);
    }

    static _validateConfig(config: JWTIssuerConfig): void {
        const configSchema = yup.object({
            issuer: yup.string().required(),
            privateKey: yup.string().required(),
            expiresInSec: yup.number().optional()
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
