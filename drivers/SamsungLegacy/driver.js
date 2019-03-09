'use strict';

const SamDriver = require('../../lib/SamDriver');
const SamsungLegacy = require('../../lib/samsung_legacy');

module.exports = class SamsungLegacyDriver extends SamDriver {

    onInit() {
        super.onInit('Samsung Legacy');

        this._samsung = new SamsungLegacy({
            api_timeout: 100
        });
    }

    async checkForTV(ipAddr, devices, socket) {
        this.log('searchForTVs', ipAddr);
        let data = await this._samsung.getInfo(ipAddr).catch(err => {
        });
        if (data && data.data) {
            this.log('Found TV', ipAddr);
            devices.push({
                'name': data.data.name,
                'data': {
                    'id': data.data.id
                },
                'settings': {
                    'ipaddress': ipAddr,
                    'tokenAuthSupport': data.data.device.TokenAuthSupport === 'true'
                }
            });
            socket.emit('list_devices', devices);
        }
    }

};
