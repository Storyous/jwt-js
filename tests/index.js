'use strict';

const { describe, it } = require('mocha');
const { JWTIssuer, JWTVerifier, Restriction, Scope } = require('../src');
const fs = require('fs');
const assert = require('assert');
const JsonWebTokenError = require('jsonwebtoken/lib/JsonWebTokenError');

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

        let decodedToken = verifier.verifyAndDecodeToken(token);

        const expected = {
            merchantId: 456,
            scopes: [
                ["terms", "rw", { "merchantId": 123, "placeId": 987 }],
                ["djapi", "r", { "merchantId": 123 }]
            ]
        };

        assert.equal(decodedToken.iat, decodedToken.exp - expiresInSec);
        assert.equal(decodedToken.merchantId, expected.merchantId);
        assert.deepEqual(decodedToken.scopes, expected.scopes);

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

        let decodedToken = verifier.verifyAndDecodeToken(token);

        assert.equal(decodedToken.iat, decodedToken.exp - expiresInSec2);

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
