let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

let scheme = 'http://'

// Get the --port value
// If none, default to the echo server port, or 80 if --host exists
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)

// Build the destinationUrl using the --host value
let destinationUrl = argv.url || scheme + argv.host + ':' +port
http.createServer((req, res) => {
  console.log(`Proxying request to: ${destinationUrl + req.url}`)
  logStream.write(`Proxying request to: ${destinationUrl + req.url}`)
  logStream.write('\n\n\nProxy Request' + JSON.stringify(req.headers))
  req.pipe(logStream, {end: false})
  destinationUrl = req.headers['x-destination-url'] || destinationUrl

  // Proxy code here
  let options = {
        headers: req.headers,
        url: `${destinationUrl}${req.url}`,
        method: req.method
    }
    //req.pipe(request(options)).pipe(res)

    let downstreamResponse = req.pipe(request(options))
	logStream.write('\n\n\nProxy Response' + JSON.stringify(downstreamResponse.headers))
	//downstreamResponse.pipe(process.stdout)
	downstreamResponse.pipe(logStream, {end: false})
	downstreamResponse.pipe(res)
}).listen(8001)