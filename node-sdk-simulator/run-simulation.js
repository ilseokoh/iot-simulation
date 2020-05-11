const lineReader = require('line-reader');
const { exec } = require('child_process');

// Parse args
var argv = require('yargs')
    .usage('Usage: $0 --connstr <filename> --simulator <js filename>')
    .option('connstr', {
        alias: 'f',
        describe: 'filename for list of ids',
        type: 'string',
        demandOption: true
    })
    .option('simulator', {
        alias: 's',
        describe: 'simulator js file',
        type: 'string',
        demandOption: true
    })
    .argv;

var filename = argv.ids;
var jsfilename = argv.simulator;

function sleep(time) {
    const d1 = new Date();
    while (true) {
        const d2 = new Date();
        if (d2 - d1 > time) {
            return;
        }
    }
}

lineReader.eachLine(filename, function (line) {
    var cmd = "node " + jsfilename + " -d \"" + line + "\" &"
    console.log(cmd);

    sleep(100);

    // run a simulator with id 
    const myShellScript = exec(cmd, (err, stdout, stderr) => {
        if (err) {
            //error occurred
            console.error(err)
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
    });

    myShellScript.stdout.on('data', (data) => {
        console.log(data);
        // do whatever you want here with data
    });
    myShellScript.stderr.on('data', (data) => {
        console.error(data);
    });
});