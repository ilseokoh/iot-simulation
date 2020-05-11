// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var iotHubTransport = require('azure-iot-device-mqtt').Mqtt;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-amqp').Amqp;
// var Protocol = require('azure-iot-device-mqtt').MqttWs;

var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

// Parse args
var argv = require('yargs')
    .usage('Usage: $0 --connstr <DEVICE ID>')
    .option('connstr', {
        alias: 'd',
        describe: 'connection string for a device',
        type: 'string',
        demandOption: true
    })
    .argv;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionString = argv.connstr;

console.log(connectionString);

var hubClient = Client.fromConnectionString(connectionString, iotHubTransport);

hubClient.open(function (err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log("Connected.");

        //Create device Twin
        hubClient.getTwin(function (err, twin) {
            if (err) {
                console.error('could not get twin');
                process.exit(-1);
            } else {
                console.log('twin created');

                var cmd = "open";
                var patch = {
                    "mode": "control",
                    "attr": {
                        "doorStatus": cmd
                    }
                };

                const intervalObj = setInterval(() => {
                    patch.attr.doorStatus= (patch.attr.doorStatus == "open" ? "close" : "open");

                    // send the patch
                    twin.properties.reported.update(patch, function (err) {
                        if (err) {
                            console.log('twin error' + patch.attr.doorStatus);
                        } else {
                            console.log('twin state reported ' + patch.attr.doorStatus);
                        }
                    });
                }, 1000);
            }
        });
    }
});