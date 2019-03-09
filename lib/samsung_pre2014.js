'use strict';

const SamsungBase = require('./samsung_base');

module.exports = class SamsungPre2014 extends SamsungBase {

    constructor(config) {
        super(config);
    }

    async apiActive(timeout) {
        return this.pingPort(8001, timeout);
    }

    async turnOff(device) {
        return this.sendKey('KEY_POWEROFF', device);
    }

    async sendKey(aKey, device) {
        return this.websocketCmd({
            'method': 'ms.remote.control',
            'params': {
                'Cmd': 'Click',
                'DataOfCmd': aKey,
                'Option': 'false',
                'TypeOfRemote': 'SendRemoteKey'
            }
        });
    }

    async websocketCmd(aCmd) {
        return new Promise((resolve, reject) => {
            const hostPort = this.getHostPort();
            const uri = this.getWsUri();
            console.log('websocketCmd', uri);

            let ws = new WebSocket(uri);

            ws.on('message', function (data) {
                data = JSON.parse(data);

                if (data.event === "ms.channel.connect") {
                    ws.send(JSON.stringify(aCmd));

                    setTimeout(function () {
                        ws.close();
                    }, 1000);

                    resolve(true);
                }
            }).on('error', function (err) {
                if (err.code && err.code === 'ECONNREFUSED') {
                    reject('Connection to TV is refused (' + hostPort + ')');
                } else if (err.code && err.code === 'EHOSTUNREACH') {
                    reject('Connection to TV is unreachable (' + hostPort + ')');
                } else if (err.code && err.code === 'ENETUNREACH') {
                    reject('Connection to TV is unreachable (' + hostPort + ')');
                } else {
                    console.log('websocketCmd ERROR', err);
                    reject(err);
                }
            });
        });
    }

    getHostPort() {
        return `http://${this._config.ip_address}:8001`;
    }

    getWsUri() {
        const app_name_base64 = this.base64Encode(this._config.name);
        return `${this.getHostPort()}/api/v2/channels/samsung.remote.control?name=${app_name_base64}`;
    }

};
