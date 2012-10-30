(function (App, M) {

	App = App || {};

	Modernizr.load({
		load: [
			App.siteUrl + '/assets/js/libs/jq-1.8.2.min.js',
			App.siteUrl + '/assets/js/libs/moment-1.7.2.js'
		],
		complete: function () {

			var terminals = $('#terminals'),
				terminalList = $('.terminal');


			//
			// Events
			//
			// =========================================
			//
			terminals.on('click', '.terminal', function (evt) {
				evt.preventDefault();
				terminalList.not(this).removeClass('active');
				this.classList.add('active');
			});


			//
			// Socket.io Listeners
			//
			// =========================================
			//
			App.socket.on('broadcast', function (data) {
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


				// Free memory
				if (data.loadavg) {
					terminal = $('[data-os="loadavg"]');
					var i = 0,
						loads = '',
						types = '';
						type = '';
					for (i; i < data.loadavg.length; i++) {
						if (i === 0) {
							type = '1min';
						} else if (i===1) {
							type = '5min';
						} else {
							type = '15min';
						}
						loads += '<li>'+data.loadavg[i].toFixed(2)+'</li>';
						types += '<li>'+type+'</li>';
					}

					terminal.find('[data-output="main"]').html(loads);
					terminal.find('[data-output="raw"]').html(types);
				}

			};



			//
			//
			//
			// =========================================
			//
			App.displayDetails = function (osType) {

			};


		}
	});

}(App, Modernizr));
