#!/usr/bin/env node

var fivebeans =require('fivebeans');
var uuid = require('node-uuid');

var argv = require('yargs')
    .usage('Usage: node test.js --host [URL] --port [port] --tube [tube_id] --type [job_type] --from [from_currency] --to [to_currency]')
    .default('host', 'challenge.aftership.net')
    .default('port', '11300')
    .default('tube', 'marcohk')
    .default('type', 'currency-convert')
    .default('from', 'USD')
    .default('to', 'HKD')
    .argv;

var client = new fivebeans.client(argv.host, parseInt(argv.port));

console.log(Date.now());

var job =
{
    type: argv.type,
    payload:
    {
        id: uuid.v1(), 
        from: argv.from, 
        to: argv.to
    }
};

client
    .on('connect', function()
    {
        // client can now be used
        console.log('connect');
        client.use(argv.tube, function(err, tname) {
            console.log("using " + tname);

            client.put(0, 0, 60, JSON.stringify([argv.type,job]), function(err, jobid)
            {
                console.log('queued a string reverse job in ' + argv.tube + ': ' + jobid);
            });
        });
    })
    .on('error', function(err)
    {
        // connection failure    
        console.log(err);
    })
    .on('close', function()
    {
        // underlying connection has closed
        console.log('close');
    })
    .connect();