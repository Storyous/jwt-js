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
        const options = {
            algorithm: JWTIssuer.algorithm,
            issuer: this._config.issuer
        };

        if (typeof this._config.expiresInSec !== 'undefined') {
            options['expiresIn'] = this._config.expiresInSec;
        }

        payload['scopes'] = scopes.map((scope) => (scope.toArray()));

        return JWT.sign(payload, this._config.privateKey, options);
    }

    static _validateConfig(config) {
        const configSchema = new Schema({
            issuer: {
                type: 'string',
                required: 'true'
            },
            privateKey: {
                type: 'string',
                required: 'true'
            },
            expiresInSec: {
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
