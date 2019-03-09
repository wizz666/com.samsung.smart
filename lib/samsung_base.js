'use strict';

const net = require("net");
const WebSocket = require('ws');
const http = require('http.min');
const wol = require('wake_on_lan');

module.exports = class SamsungBase {

    constructor(config) {
        this._config = config;
    }

    config() {
        return this._config;
    }

    getUri(ipAddress) {
        throw new Error('unimplemented');
    }

    async getInfo(addr) {
        return new Promise((resolve, reject) => {
            http.get({uri: this.getUri(addr), timeout: this._config.api_timeout, json: true})
                .then(function (data) {
                    if (data.data && data.response.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(false);
                    }
                })
                .catch(function (err) {
                    reject(false);
                });
        });
    }

    async apiActive(timeout) {
        return new Promise((resolve, reject) => {
            http.get({uri: this.getUri(), timeout: (timeout || this._config.api_timeout), json: true})
                .then(function (data) {
                    if (data.data && data.response.statusCode === 200) {
                        resolve(true);
                    } else {
                        console.log('apiActive: ERROR', data.response.statusCode, data.response.statusMessage);
                    }
                    resolve(false);
                })
                .catch(function (err) {
                    resolve(false);
                });
        });
    }

    async pingPort(port, timeout, ipaddress) {
        return new Promise((resolve, reject) => {
            const hostPort = `${(ipaddress || this._config.ip_address)}:${port}`;
            const socket = net.connect(port, ipaddress || this._config.ip_address);

            socket.setTimeout(timeout || 500);

            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });

            socket.on('error', function (err) {
                if (err.code && err.code === 'ECONNREFUSED') {
                    reject('Connection to TV is refused (' + hostPort + ')');
                } else if (err.code && err.code === 'EHOSTUNREACH') {
                    reject('Connection to TV is unreachable (' + hostPort + ')');
                } else if (err.code && err.code === 'ENETUNREACH') {
                    reject('Connection to TV is unreachable (' + hostPort + ')');
                } else {
                    console.log('pingPort ERROR', err);
                    reject(err);
                }
            });

            socket.on('timeout', () => {
                reject('Timeout');
            });
        });
    }

    async wake(device) {
        return new Promise((resolve, reject) => {
            if (!this._config.mac_address) {
                reject('Unable to wake up device.');
            }
            wol.wake(this._config.mac_address, function (error) {
                if (error) {
                    console.log('wake ERROR', error);
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }

    async turnOff(device) {
        return this.sendKey('KEY_POWER', device);
    }

    async sendKey(aKey, device) {
        throw new Error('unimplemented');
    }

    base64Encode(aStr) {
        return Buffer.from(aStr).toString('base64');
    }

};
