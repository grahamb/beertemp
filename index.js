var ds18b20 = require('ds18b20'),
    fs = require('fs'),
    logfile = __dirname + '/log.csv'
    sensor = ('28-000003df0a41')
    stream = fs.createWriteStream(logfile, { flags: 'a', encoding: 'utf-8', mode: 0666 });

fs.writeFileSync(__dirname + '/pidfile', process.pid, { flags: 'w' });

function getTemp() {
    var date = Date.now();
    ds18b20.temperature(sensor, function(err, temp) {
        var str = [date, temp.toFixed(1)].join(',') + '\n';
        stream.write(str);
    });
}
getTemp();
setInterval(getTemp, 300000);