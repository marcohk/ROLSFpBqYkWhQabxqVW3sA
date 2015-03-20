var request = require('request');
var cheerio = require('cheerio');
var fivebeans = require('fivebeans');
var db = require('../util/db').database();
var url = require("url");

module.exports = function() {
    function CurrencyConverter() {
        this.type = 'marcohk';
        console.log('CurrencyConverter initiated');
    }

    CurrencyConverter.prototype.work = function(payload, callback) {
        console.log('incoming work: ' + payload);

        if(typeof payload === 'string') {
            payload = JSON.parse(payload);
        }

        if(!payload || !payload.id || !payload.from || !payload.to) {
            console.log('incomplete payload format, ignored.');
            callback('success');
            return;
        }

        this.convert(payload, callback);
    };

    CurrencyConverter.prototype.convert = function(input, callback) {
        var link = url.parse("http://www.xe.com/currencyconverter/convert", true);
        link.query['Amount'] = '1';
        link.query['From'] = input.from;
        link.query['To'] = input.to;
        var url_string = url.format(link);

        var self = this;

        request(url_string, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                var rate = parseFloat($('.uccRes > .rightCol').text()).toFixed(2);
            
                if(isNaN(rate)) {
                    console.log("cannot parse currency exchange rate");
                    self.reput_fail(input.id, callback);
                    return;
                }

                var rate_result = {
                    id: input.id,
                    from: input.from,
                    to: input.to,
                    created_at: Date.now(),
                    rate: rate
                };

                self.reput_success(input.id, rate_result, callback);
                
            }
            else {
                console.log(error);
                self.reput_fail(input.id, callback);
            }
        });
    };

    CurrencyConverter.prototype.reput_success = function(id, rate_result, callback) {
        var data = db.collection('data');
        var job = db.collection('job');

        //insert the currency exchange rate data
        data.insert(rate_result, {w:1}, function(err, result) {
            if(err) {
                console.log('insertion error, abort');
                console.log(JSON.stringify(err));
                process.exit(1);
            }

            //insert the job record or increase success count by 1
            job.findAndModify(
                {_id: id }, 
                [['_id', 1]],
                { $inc:{success:1} }, 
                {new:true, upsert:true, w:1}, 
                function(err, doc) {
                
                    if(err) {
                        console.log('findAndModify error on reput_success, abort');
                        console.log(err);
                        process.exit(1);
                    }

                    console.log('job counter updated:');
                    console.log(JSON.stringify(doc));

                    var id = doc.value._id;
                    var success = doc.value.success;

                    if(success >= 10) {
                        console.log('finish the succeed request ' + id);
                        callback('success');
                    }
                    else {
                        console.log('reput the succeed request ' + id + ': ' + success);
                        callback('release', 60);
                    }
            });

        });

            
    };

    CurrencyConverter.prototype.reput_fail = function(id, callback) {
        var job = db.collection('job');

        //insert the job record or increase fail count by 1
        job.findAndModify(
                {_id: id }, 
                [['_id', 1]],
                { $inc:{fail:1} }, 
                {new:true, upsert:true, w:1}, 
                function(err, doc) {
                
                    if(err) {
                        console.log('findAndModify error on reput_fail, abort');
                        console.log(err);
                        process.exit(1);
                    }

                    console.log('job counter updated:');
                    console.log(JSON.stringify(doc));

                    var id = doc.value._id;
                    var fail = doc.value.fail;

                    if(fail >= 3) {
                        console.log('finish the failed request ' + id);
                        callback('success');
                    }
                    else {
                        console.log('reput the failed request ' + id + ': ' + fail);
                        callback('release', 3);
                    }
        });


    };

    var handler = new CurrencyConverter();
    return handler;
};