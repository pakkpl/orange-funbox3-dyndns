'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');
const endOfLine = require('os').EOL;
const getRemoteIpAddress = require('./funbox').getRemoteIpAddress;

let config, lastRemoteIp;

function reloadConfig(callbackFunction) {
    let configPath = path.resolve(__dirname, 'config', 'config.json');
    if (!fs.existsSync(configPath)) {
        let sampleConfigPathTarget = path.resolve(__dirname, 'config', 'sample-config.json');
        if (!fs.existsSync(sampleConfigPathTarget)) {
            let sampleConfigPathSource = path.resolve(__dirname, 'sample-config.json');
            fs.copyFileSync(sampleConfigPathSource, sampleConfigPathTarget);
        }

        callbackFunction('Missing config file. Move sample-config.json to config.json');
        return;
    }

    fs.readFile(configPath, 'utf8', function (error, data) {
        if (error) {
            callbackFunction(error);
            return;
        }
        try {
            config = JSON.parse(data);
            callbackFunction();
        } catch (error) {
            callbackFunction('Config error.' + endOfLine + error);
        }
    });
}

function updateIp(ip, provider) {
    request(
        {
            headers: {
                "Authorization": "Basic " + Buffer.from(provider.login + ":" + provider.password).toString("base64")
            },
            url: 'https://' + provider.address + '/nic/update?hostname=' + provider.host + '&system=dyndns&myip=' + ip
        },
        function (error, response, body) {
            if (error) {
                console.error(provider.host + ': ' + error)
            } else {
                console.log(provider.host + ': ' + body.trim())
            }
        });
}


function main() {

    reloadConfig(function (error) {
        if (error) {
            console.error(error);
            return;
        }

        getRemoteIpAddress(config.funboxAddress, config.funboxUsername, config.funboxPassword,
            function (error, remoteIp) {

                if (config.intervalInSeconds >= 0) {
                    setTimeout(main, config.intervalInSeconds * 1000);
                }

                if (error) {
                    console.log(error);
                    return;
                }

                if (lastRemoteIp === remoteIp) {
                    return
                }

                if (!remoteIp || remoteIp === '0.0.0.0') {
                    return;
                }

                lastRemoteIp = remoteIp;

                for (let i = 0; i < config.providers.length; i++) {
                    updateIp(remoteIp, config.providers[i]);
                }
            })
    });
}

main();

