var ds18b20 = require('ds18b20'),
    graphite = require('graphite'),
    fs = require('fs'),
    logfile = __dirname + '/log.csv',
    sensor = ('28-000003df0a41'),
    stream = fs.createWriteStream(logfile, { flags: 'a', encoding: 'utf-8', mode: 0666 }),
    graphiteClient = graphite.createClient('plaintext://stats.its.sfu.ca:2003/'),
    statsBucketC = 'stats.gb.beertemp.c';
    statsBucketF = 'stats.gb.beertemp.f';

fs.writeFileSync(__dirname + '/pidfile', process.pid, { flags: 'w' });

function getTemp() {
    var date = Date.now();
    ds18b20.temperature(sensor, function(err, temp) {
        tempC = temp / 1000;
        tempF = tempC * 1.8000 + 32.00;
        var str = [date, tempC, tempF].join(',') + '\n';
        stream.write(str);
        logTemp(statsBucketC, tempC);
        logTemp(statsBucketF, tempF);
    });
}

function logTemp(bucket, temp) {
    graphiteClient.write({ bucket: temp }, function(err) {
        if (err) console.log(err);
    });
}

getTemp();
setInterval(getTemp, 300000);