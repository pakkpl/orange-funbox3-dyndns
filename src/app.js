'use strict';

const request = require('request');
const fs = require('fs');
const path = require('path');
const endOfLine = require('os').EOL;
const getLocalIpAddress = require('./funbox').getLocalIpAddress;

let config;
let lastRemoteIp = null;
let mainLoopSlowdownCounter = 0;

function loadConfig(callbackFunction) {
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


function mainLoop() {
    getLocalIpAddress(config.funboxAddress, config.funboxUsername, config.funboxPassword,
        function (error, remoteIp) {

            if (error) {
                console.error(error);
                mainLoopSlowdownCounter++;
                setTimeout(mainLoop, config.intervalInSeconds * 1000 * mainLoopSlowdownCounter);
                return;
            }

            mainLoopSlowdownCounter = 0;

            if (config.intervalInSeconds >= 0) {
                setTimeout(mainLoop, config.intervalInSeconds * 1000);
            }

            if (lastRemoteIp === remoteIp) {
                return
            }

            if (!remoteIp || remoteIp === '0.0.0.0') {
                return;
            }


            for (let i = 0; i < config.providers.length; i++) {
                updateIp(remoteIp, config.providers[i]);
            }

            lastRemoteIp = remoteIp;
        })
}

loadConfig(function (error) {
    if (error) {
        console.error(error);
        return;
    }

    mainLoop();
});
