'use strict';

module.exports = class SamsungPre2014Driver {

    onInit() {
        this.log(`Samsung Pre 2014 driver has been initialized`);
    }

    onPairListDevices(data, callback) {
        let self = this;
        callback(null, [
            {
                "name": "Samsung Pre 2014 TV",
                "data": {
                    "id": self.guid()
                }
            }
        ]);
    }

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
};