var ds18b20 = require('ds18b20'),
    graphite = require('graphite'),
    fs = require('fs'),
    http = require('http'),
    logfile = __dirname + '/log.csv',
    sensor = ('28-000003df0a41'),
    stream = fs.createWriteStream(logfile, { flags: 'a', encoding: 'utf-8', mode: 0666 }),
    graphiteClient = graphite.createClient('plaintext://stats.its.sfu.ca:2003'),
    statsBucketC = 'stats.gb.beertemp.c',
    statsBucketF = 'stats.gb.beertemp.f',
    temps = { c: 0, f: 0 };

fs.writeFileSync(__dirname + '/pidfile', process.pid, { flags: 'w' });

function getTemp() {
    var date = Date.now();
    ds18b20.temperature(sensor, function(err, tempC) {
        if (err) {
            console.log(err);
        } else {
            try {
                var tempF = tempC * 1.8000 + 32;
                var str = [date, tempC.toFixed(1), tempF.toFixed(1)].join(',') + '\n';
                stream.write(str);
                logTemp(statsBucketC, tempC.toFixed(1));
                logTemp(statsBucketF, tempF.toFixed(1));
                temps.c = tempC;
                temps.f = tempF;
            } catch (err) {
                console.log(err);
            }

        }

    });
    setTimeout(getTemp, 60000);
}

function logTemp(bucket, temp) {
    var data = {};
    data[bucket] = temp;
    graphiteClient.write(data, function(err) {
        if (err) console.log(err);
    });
}

getTemp();

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>' + temps.c + '&deg; C / ' + temps.f + '&deg; F<h1><img src="http://stats.its.sfu.ca/render/?width=586&height=308&_salt=1390110940.063&target=stats.gb.beertemp.c&target=stats.gb.beertemp.f&from=-12hours&graphOnly=false&hideAxes=false&hideYAxis=false&hideGrid=false&hideLegend=true" />');
}).listen(8080, '0.0.0.0');
console.log('Server running');
