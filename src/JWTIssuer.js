"use strict";

const Schema = require('validate');
const fs = require('fs');
const JWT = require('jsonwebtoken');

const algorithm = 'RS256';

class JWTIssuer {

    constructor(config) {
        JWTIssuer._validateConfig(config);
        this._config = config;
    }

    /**
     * @param {object}  payload
     * @param {Scope[]} scopes
     */
    createToken(payload, scopes) {
        const privateKey = fs.readFileSync(this._config.privateKeyPath);
        const options = {
            algorithm: JWTIssuer.algorithm,
            issuer: this._config.issuer
        };

        payload['scopes'] = scopes.map((scope) => (scope.toArray()));

        return JWT.sign(payload, privateKey, options);
    }

    static _validateConfig(config) {
        const configSchema = new Schema({
            issuer: {
                type: 'string',
                required: 'true'
            },
            privateKeyPath: {
                type: 'string',
                required: 'true'
            },
            ttl: {
                type: 'number',
                required: false
            }
        });

        const errors = configSchema.validate(config);

        if (errors.length > 0) {
            throw new Error(errors[0].message);
        }
    }

    static get algorithm() {
        return algorithm;
    }

}


module.exports = JWTIssuer;
