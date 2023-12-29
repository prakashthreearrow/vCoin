const AWS = require('aws-sdk');
const HttpProvider = require('web3-providers-http');
const XHR2 = require('xhr2');

module.exports = class AwsHttpProvider extends HttpProvider {
    constructor(host, ssmCredentials) {
        super(host);

        this.ssmCredentials = ssmCredentials || {};
    }

    send(payload, callback) {
        const self = this;
        const request = new XHR2(); // eslint-disable-line

        request.timeout = self.timeout;
        request.open('POST', self.host, true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.timeout !== 1) {
                let result = request.responseText; // eslint-disable-line
                let error = null; // eslint-disable-line

                try {
                    result = JSON.parse(result);
                } catch (jsonError) {
                    let message;
                    if (!!result && !!result.error && !!result.error.message) {
                        message = `[aws-ethjs-provider-http] ${result.error.message}`;
                    } else {
                        message = `[aws-ethjs-provider-http] Invalid JSON RPC response from host provider ${self.host}: ` +
                            `${JSON.stringify(result, null, 2)}`;
                    }
                    error = new Error(message);
                }

                callback(error, result);
            }
        };

        request.ontimeout = () => {
            callback(`[aws-ethjs-provider-http] CONNECTION TIMEOUT: http request timeout after ${self.timeout} ` +
                `ms. (i.e. your connect has timed out for whatever reason, check your provider).`, null);
        };

        try {
            const strPayload = JSON.stringify(payload);
            const region = process.env.AMZ_REGION || 'us-east-1';
            const creds =
                'ssmCredentials' in this &&
                'accessKeyId' in this.ssmCredentials &&
                'secretAccessKey' in this.ssmCredentials &&
                this.ssmCredentials;
            const credentials = (creds && new AWS.Credentials(creds)) || new AWS.EnvironmentCredentials('AWS');
            const endpoint = new AWS.Endpoint(self.host);
            const req = new AWS.HttpRequest(endpoint, region);
            req.method = request._method;
            req.body = strPayload;
            req.headers['host'] = request._url.host;
            const signer = new AWS.Signers.V4(req, 'managedblockchain');
            signer.addAuthorization(credentials, new Date());
            request.setRequestHeader('Authorization', req.headers['Authorization']);
            request.setRequestHeader('X-Amz-Date', req.headers['X-Amz-Date']);
            if (process.env.AWS_SESSION_TOKEN) {
                request.setRequestHeader('X-Amz-Security-Token', process.env.AWS_SESSION_TOKEN);
            }
            request.send(strPayload);
        } catch (error) {
            if (error.code == "ERR_INVALID_ARG_TYPE") {
                callback(`[aws-ethjs-provider-http] CONNECTION ERROR: Couldn't connect to node '${self.host}': missing AWS credentials. Check your environment variables using command 'echo $NODE_ENV' to verify credentials are set.`);
            }else {
                callback(`[aws-ethjs-provider-http] CONNECTION ERROR: Couldn't connect to node '${self.host}': ` +
                    `${JSON.stringify(error, null, 2)}`, null);
            }
        }
    }
}