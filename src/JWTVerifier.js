"use strict";

const Schema = require('validate');
const JWT = require('jsonwebtoken');

const algorithm = 'RS256';

class JWTVerifier {

    constructor(config) {
        JWTVerifier._validateConfig(config);
        this._config = config;
    }

    /**
     * @param {string} token
     * @throws JsonWebTokenError
     * @return {{}} token data
     */
    verifyAndDecodeToken(token) {
        const options = {
            algorithms: [this._config.algorithm],
            issuer: this._config.issuer
        };

        JWT.verify(token, this._config.publicKey, options);

        return JWT.decode(token, options);
    }

    static _validateConfig(config) {
        const configSchema = new Schema({
            issuer: {
                type: 'string',
                required: 'true'
            },
            algorithm: {
                type: 'string',
                required: 'true'
            },
            publicKey: {
                type: 'string',
                required: 'true'
            },
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


module.exports = JWTVerifier;
