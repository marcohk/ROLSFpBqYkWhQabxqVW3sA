var fivebeans =require('fivebeans');

var client = new fivebeans.client('challenge.aftership.net', 11300);

console.log(Date.now());

var job =
{
    type: 'currency-convert',
    payload:
    {
        id: '0d17ad14-cf14-11e4-b9d6-1681e6b88ec1', 
        from: 'USD', 
        to: 'EUR'
    }
};

client
    .on('connect', function()
    {
        // client can now be used
        console.log('connect');
        client.use('marcohk', function(err, tname) {
            console.log("using " + tname);

            client.put(0, 0, 60, JSON.stringify(['currency-convert',job]), function(err, jobid)
            {
                console.log('queued a string reverse job in marcohk: ' + jobid);
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