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
			$(window).on('keyup', function (evt) {
				if (evt.keyCode === 27) terminalList.removeClass('active');
			});


			//
			// Socket.io Listeners
			//
			// =========================================
			//
			App.socket.on('broadcast', function (data) {
				console.log(data);
				if (data.results && data.results.osData) App.updateTerminals(data.results.osData);
				if (data.results && data.results.logs) App.updateLogs(data.results.logs);
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
				if (data.freemem && data.totalmem) {
					terminal = $('[data-os="freemem"]');
					var niceFreeMem = Math.round(data.freemem/1024/1024) + ' MB',
						rawMem = data.freemem + ' bytes',
						percentFree = Math.round(data.freemem / data.totalmem * 100) + '%';
					terminal.find('[data-output="main"]').html(niceFreeMem + ' / ' + percentFree);
					terminal.find('[data-bar="free"]').css('width', percentFree);
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
			// Update the front-end panels with data from the server
			//
			// =========================================
			//
			App.updateLogs = function (logs) {

				var log = null;

				// Apache Error logs
				if (logs.apacheErr) {
					log = $('[data-log="apacheErr"]');

					log.find('[data-output="main"]').html(logs.apacheErr.latestLines.join('<br />'));
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
