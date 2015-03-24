#!/usr/bin/env node

var argv = require('yargs')
    .usage('Usage: beanworker --id=[ID] --config=[config.yml] --mongodb=[URI]')
    .default('id', 'marcohk')
    .default('config', './currency-worker.yml')
    .default('mongodb', 'mongodb://localhost:27017/currency')
    .demand(['config'])
    .argv;

var fivebeans = require('fivebeans');
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect(argv.mongodb, function(err, db) {
    if(err) {
        console.log("cannot connect to mongodb: " + argv.mongodb);
        console.log(JSON.stringify(err));
        return;
    }

    console.log("mongodb connected");
    require('./util/db').init(db);
    var runner = new fivebeans.runner(argv.id, argv.config);
    runner.go();

});

process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down mongodb from SIGINT (Ctrl-C)" );
  
  var db = require('./util/db').database();
  
  if(db) {
    db.close();
  }

  process.exit( );
})
