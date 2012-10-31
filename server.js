var http = require('http'),
	https = require('https'),
	fs = require('fs'),
	lazy = require('lazy'),
	express = require('express'),
	handlebars = require('handlebars'),
	os = require('os'),

	config = require(__dirname + '/config.js'),
	Client = require(__dirname + '/models/client.js'),
	server = express(),

	serverInst = http.createServer(server),
	io = require('socket.io').listen(serverInst),


	Server = {

		//
		// SETTINGS AND CONFIGS
		//
		// =========================================
		//
		clients: [],

		init: function (opts) {

			opts = opts || {};

			// TODO: Stalking files
			this.stalkFiles({ files: opts.files });

			// TODO: move the interval time to config.js
			// this.stalkSystem(2000);

		},

		//
		// createClient
		//
		// Push the connected client to the stack.
		// Each one should have it's own socket with which to connect to.
		// =========================================
		//
		createClient: function (client) {

			this.clients.push(client);
			console.log('-- LOG: The connected clients are: ' + this.clients.length);
			this.broadcast({ message: 'hello you!'} , client, true);

		},


		//
		// destroyClient
		//
		// Takes an ID and removes the client from the stack.
		// =========================================
		//
		destroyClient: function (id) {
			var that = this;
			this.clients.forEach(function (client, i) {
				if (id === client._key) {
					that.clients.splice(i, 1);
					console.log('-- LOG: The connected clients are: ' + that.clients.length);
					return;
				} else {
					console.log('-- LOG: Couldn\'t find client with id: ' + id);
				}
			});

		},


		//
		// broadcast
		//
		// Takes the client object to use for emitting socket
		// messages to all the clients connected.
		//
		// Socket.io can either send to just one client, or all, so 'includeOrigin'
		// can be specified to include the client in on the message we want to send.
		// =========================================
		//
		broadcast: function (data, client, includeOrigin) {

			includeOrigin = includeOrigin || false; // send the message to the original client as well?
			data = data || {}; // the data we're sending to each of the clients
			client = client || this.clients[0] || false; // if client isn't specified then grab the first one

			if (client) {
				// Send to the original client
				if (includeOrigin) {
					// We can send the default 'all' data to eveybody if we don't
					// specify anything specifically for the original client
					var dataClient = data.client || data.all;
					client.socket.emit('broadcast', { results: data });
				}

				// Send to everyone
				client.socket.broadcast.emit('broadcast', { results: data });
			}

		},



		//
		// stalkFile
		//
		// Stalk the file. Send to clients when we have changes
		// =========================================
		//
		stalkFile: function (fileObj) {

			fileObj = fileObj || false;

			var interval = fileObj.interval || 10000, // 10 senconds default
				i = 0;

			// fs.watchFile(fileObj.path, { interval: interval }, function (curr, prev) {
			// 	console.log('-- LOG - '+fileObj.name+' changed at: ' + curr.mtime);
			// 	console.log('-- LOG - The previous mtime was: ' + prev.mtime);
			// 	fs.readFile(fileObj.path, 'utf8', function (err, data) {
			// 		if (err) throw err;
			// 		console.log(data);

			// 	});
			// });


			// var stream = fs.createReadStream(fileObj.path, { encoding: 'utf8' });
			// stream.on('data', function (data) {
				// i++;
				// console.log('here');
				// console.log('LINE: ' + i + ': ' + data + '\n');
			// });
			// console.log(stream);
			// stream.on('error', function (err) {
			// 	console.log(err);
			// });
			// stream.on('end', function () {
			// 	console.log('this is the end for ' + fileObj.name);
			// });

			var j = 0;
			new lazy(fs.createReadStream(fileObj.path))
				.lines
				.forEach(function (line) {
					j++;
					console.log(j);
					// console.log(++i + ': ' + line.toString());
				});
				console.log('totoal lines = ' + j);

			console.log('here');

		},


		//
		// stalkFiles
		//
		// Sets up th files for stalking
		// =========================================
		//
		stalkFiles: function (opts) {
			var files = opts.files || [],
				that = this,
				i = 0;

			for (i; i < files.length; i++) {
				this.stalkFile(files[i]);
			}

		},




		//
		// StalkSystem
		//
		// Watches system processes
		// =========================================
		//
		stalkSystem: function (interval) {

			var that = this;

			// store them for future access
			this.os = {
				hostname: os.hostname(),
				type: os.type(),
				platform: os.platform(),
				uptime: os.uptime(),
				loadavg: os.loadavg(),
				totalmem: os.totalmem(),
				freemem: os.freemem(),
				cpus: os.cpus(),
				network: os.networkInterfaces()
			};

			// This function creates the interval for the server to check the system processes.
			// It's so we only have the server doing this once.
			setInterval(function () {
				that.updateSystem();
			}, interval); // 10 seconds



		},


		//
		// pollSystem
		//
		// The function that's executed in the interval
		// =========================================
		//
		updateSystem: function (args) {

			var uptime = os.uptime(),
				loadavg = os.loadavg(),
				totalmem = os.totalmem(),
				freemem = os.freemem(),
				cpus = os.cpus();

			this.os.uptime = uptime;
			this.os.loadavg = loadavg;
			this.os.totalmem = totalmem;
			this.os.freemem = freemem;
			this.os.cpus = cpus;

			// Send the system details to all the clients
			this.broadcast({
				osData: this.os
			}, false, true);

		},




		//
		// loadTemplate
		//
		// Will read any template file when requested.
		// =========================================
		//
		loadTemplate: function (templateFile) {

			var source = fs.readFileSync(__dirname + '/view/'+ templateFile, 'utf8', function (err, html) {
				if (err) throw err;
				return html;
			});
			return source;

		}

	};


// This code sets up the HTML server where we want users to visit.
//
// When a user lands on this page, a new http request should be fired
// to retreive the account changeset.
serverInst.listen(config.serverPort);

var publicDir = __dirname + '/public',
	assetsDir = publicDir + '/assets';

// Route all our requested assets to the public assets directory
server.use('/assets', express.static(assetsDir));


Server.init({
	files: config.stalkingFiles
});


// Handle client and page requests from here on
server.get('/*', function (req, res) {

	var source = Server.loadTemplate('layout.tmpl'),
		template = handlebars.compile(source),
		view = template({
			basePath: config.basePath,
			siteurl: config.basePath + ':' + config.serverPort
		});

	res.send(view);

});


io.sockets.on('connection', function (socket) {
	console.log('-- LOG: New client connection - ' + socket.id);

	// Adding a client to the connected stack
	Server.createClient(new Client({ socket: socket}));

	// Remove the client from the server conection stack
	socket.on('disconnect', function () {
		Server.destroyClient(socket.id);
	});

});
