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
var fs = require('fs');

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

var client = Client.fromConnectionString(connectionString, iotHubTransport);

function uploadFile() {
    var date = new Date().getTime();
    var filename = 'newfile' + date + '.txt';
  
    fs.writeFile(filename, '1234567890', function (err) {
      if (err) throw err;
      console.log("create file: " + filename);
  
      fs.stat(filename, function (err, fileStats) {
        if (err) {
          console.error('could not read file: ' + err.toString());
          process.exit(-1);
        } else {
          var fileStream = fs.createReadStream(filename);
  
          client.uploadToBlob(filename, fileStream, fileStats.size, function (err, result) {
            fileStream.destroy();
            if (err) {
              console.error('error uploading file: ' + err.constructor.name + ': ' + err.message);
            } else {
              console.log('Upload successful - ' + result);
            }
          });
        }
      });
    });
  }

client.open(function (err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log("Connected.");

        setInterval(uploadFile, 2000);
    }
});