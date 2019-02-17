'use strict';

const request = require('request');
const endOfLine = require('os').EOL;

module.exports = {
    getRemoteIpAddress: function (address, username, password, callbackFunction) {

        let jar = request.jar();

        request(
            {
                url: 'http://' + address + '/authenticate?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password),
                jar: jar,
                method: 'POST',
                gzip: true,
                headers: {
                    'Accept-Encoding': 'gzip'
                },
            },
            onAuth);

        function onAuth(error, response) {
            if (error) {
                callbackFunction(error);
                return;
            }

            let contextId;
            try {
                let jsonResponse = JSON.parse(response.body);
                contextId = jsonResponse.data.contextID;
            } catch (error) {
                callbackFunction('Funbox auth error.' + endOfLine + error);
                return;
            }

            request(
                {
                    url: 'http://' + address + '/sysbus/NeMo/Intf/data:getMIBs',
                    jar: jar,
                    gzip: true,
                    method: 'POST',
                    headers: {
                        'Accept-Encoding': 'gzip',
                        'X-Context': contextId
                    },
                },
                onGetInformation);
        }

        function onGetInformation(error, response) {
            if (error) {
                callbackFunction(error);
                return;
            }

            let remoteIp;

            try {
                let jsonResponse = JSON.parse(response.body);
                remoteIp = jsonResponse.status.ppp.ppp_data.RemoteIPAddress;
            } catch (error) {
                callbackFunction('Funbox getInfo error.' + endOfLine + error);
                return;
            }

            request(
                {
                    url: 'http://' + address + '/logout',
                    jar: jar,
                    gzip: true,
                    headers: {
                        'Accept-Encoding': 'gzip'
                    },
                },
                onLogout);

            callbackFunction(null, remoteIp);
        }

        function onLogout(error) {
            if (error) {
                console.error('Funbox logout error.' + endOfLine + error);
            }
        }
    }
};
