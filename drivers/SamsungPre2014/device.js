'use strict';

const SamDevice = require('../../lib/SamDevice');
const SamsungPre2014 = require('../../lib/samsung_pre2014');

module.exports = class SamsungPre2014Device extends SamDevice {

    async onInit() {
        super.onInit('Samsung Pre 2014');

        let settings = await this.getSettings();
        this._samsung = new SamsungPre2014({
            name: "homey",
            ip_address: settings.ipaddress,
            mac_address: settings.mac_address,
            api_timeout: 5000
        });
    }

    onSettings(oldSettingsObj, newSettingsObj, changedKeysArr, callback) {
        if (changedKeysArr.includes('ipaddress')) {
            this.updateIPAddress(newSettingsObj.ipaddress);
        }
        callback(null, true);
    }

    async checkIPAddress(ipaddress) {
        let info = await this._samsung.pingPort(8001, 2000, ipaddress)
            .catch(err => {
                this.log('TV set unavailable');
                this.setUnavailable('TV not found. Check IP address.');
            });
        if (info) {
            this.log('TV set available');
            this.setAvailable();
        }
    }

    async pollDevice() {
        if (this._is_powering_onoff !== undefined) {
            return;
        }
        let onOff = await this._samsung.apiActive();
        if (onOff && this.getAvailable() === false) {
            this.setAvailable();
        }
        if (onOff !== this.getCapabilityValue('onoff')) {
            this.setCapabilityValue('onoff', onOff).catch(console.error);
        }
    }

};
