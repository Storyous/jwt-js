import { describe, it } from 'mocha';
import { JWTIssuer, JWTVerifier, Restriction, Scope } from '../src';
import * as fs from 'fs';
import * as assert from 'assert';
import { JsonWebTokenError } from 'jsonwebtoken';

describe('JWT Token', () => {
    it('should match original payload', () => {
        const issuerName = 'Storyous s.r.o.';
        const expiresInSec = 120;
        const config = {
            issuer: issuerName,
            privateKey: fs.readFileSync(`${__dirname}/cert/test.key`).toString(),
            expiresInSec
        };
        const restriction = new Restriction('merchantId', 123);
        const restriction2 = new Restriction('placeId', 987);
        const scope1 = new Scope('terms', [restriction, restriction2], 'rw');
        const scope2 = new Scope('djapi', [restriction], 'r');
        const scopes = [scope1, scope2];
        const issuer = new JWTIssuer(config);
        const payload = {
            merchantId: 456
        };
        const token = issuer.createToken(payload, scopes);
        const verifierConf = {
            issuer: issuerName,
            algorithm: JWTIssuer.algorithm,
            publicKey: fs.readFileSync(`${__dirname}/cert/test.pub`).toString()
        };
        const verifier = new JWTVerifier(verifierConf);
        let decodedToken = verifier.verifyAndDecodeToken(token) as any;
        const expected = {
            merchantId: 456,
            scopes: [
                ["terms", "rw", { "merchantId": 123, "placeId": 987 }],
                ["djapi", "r", { "merchantId": 123 }]
            ]
        };
        assert.equal((decodedToken as any).iat, (decodedToken as any).exp - expiresInSec);
        assert.equal((decodedToken as any).merchantId, expected.merchantId);
        assert.deepEqual((decodedToken as any).scopes, expected.scopes);
    });

    it('should be possible to specify expiration for each token', () => {
        const issuerName = 'Storyous s.r.o.';
        const expiresInSec = 120;
        const expiresInSec2 = 3600;
        const config = {
            issuer: issuerName,
            privateKey: fs.readFileSync(`${__dirname}/cert/test.key`).toString(),
            expiresInSec
        };
        const issuer = new JWTIssuer(config);
        const token = issuer.createToken({}, [], { expiresInSec: expiresInSec2 });
        const verifierConf = {
            issuer: issuerName,
            algorithm: JWTIssuer.algorithm,
            publicKey: fs.readFileSync(`${__dirname}/cert/test.pub`).toString()
        };
        const verifier = new JWTVerifier(verifierConf);
        let decodedToken = verifier.verifyAndDecodeToken(token) as any;
        assert.equal((decodedToken as any).iat, (decodedToken as any).exp - expiresInSec2);
    });

    it('should fail due to invalid public key', () => {
        const issuerName = 'Storyous s.r.o.';
        const config = {
            issuer: issuerName,
            privateKey: fs.readFileSync(`${__dirname}/cert/test.key`).toString()
        };
        const restriction = new Restriction('merchantId', 123);
        const restriction2 = new Restriction('placeId', 987);
        const scope1 = new Scope('terms', [restriction, restriction2], 'rw');
        const scope2 = new Scope('djapi', [restriction], 'r');
        const issuer = new JWTIssuer(config);
        const payload = {
            merchantId: 456
        };
        const token = issuer.createToken(payload, [scope1, scope2]);
        const verifierConf = {
            issuer: issuerName,
            algorithm: JWTIssuer.algorithm,
            publicKey: fs.readFileSync(`${__dirname}/cert/wrong.pub`).toString()
        };
        const verifier = new JWTVerifier(verifierConf);
        assert.throws(() => (verifier.verifyAndDecodeToken(token)), JsonWebTokenError);
    });
});
