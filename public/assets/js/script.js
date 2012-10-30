(function (App, M) {

	App = App || {};

	Modernizr.load({
		load: [
			App.siteUrl + '/assets/js/libs/jq-1.8.2.min.js',
			App.siteUrl + '/assets/js/libs/moment-1.7.2.js'
		],
		complete: function () {

			//
			// Socket.io Listeners
			//
			// =========================================
			//
			App.socket.on('broadcast', function (data) {
				// console.log(data);
				if (data.results && data.results.osData) App.updateTerminals(data.results.osData);
			});

			//
			// Update the front-end panels with data from the server
			//
			// =========================================
			//
			App.updateTerminals = function (data) {
				console.log(data);

				var terminal;

				// Uptime
				if (data.uptime) {
					terminal = $('[data-os="uptime"]');
					var humanTime = moment.duration(data.uptime*1000).humanize(),
						rawTime = data.uptime + ' seconds';
					terminal.find('[data-output="main"]').html(humanTime);
					terminal.find('[data-output="raw"]').html(rawTime);
				}

				// Free memory
				if (data.freemem) {
					terminal = $('[data-os="freemem"]');
					var niceMem = Math.round(data.freemem/1024/1024) + ' MB',
						rawMem = data.freemem + ' bytes';
					terminal.find('[data-output="main"]').html(niceMem);
					terminal.find('[data-output="raw"]').html(rawMem);
				}



			};
		}
	});

}(App, Modernizr));
