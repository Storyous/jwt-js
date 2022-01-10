import JwtPayload from 'jsonwebtoken';

export declare function isAllowed (scopes: any[], targetResource: string, targetRestrictions: object);

declare class JWTVerifier {
    constructor (config: {issuer: string, algorithm: string, publicKey: string});

    verifyAndDecodeToken(token: string): JwtPayload|null|string;

    static get algorithm(): string;
}

declare class JWTIssuer {
    constructor (config: {issuer: string, privateKey: string, expiresInSec?: number});

    createToken(payload: object, scopes: Scope[], options?: {expiresInSec: number});

    static get algorithm(): string;
}

declare class Restriction {

    constructor (field: string, value: number|string|(number|string)[]);

    get field (): string;

    get value (): number|string|(number|string)[];
}

declare class Scope {
    constructor (resource: string, restrictions: Restriction[], permissions: string);

    get resource (): string;

    get restrictions (): Restriction[];

    get permissions (): string;

    toArray (): (string|Restriction)[]

    get formattedRestrictions(): Restriction[];
}
