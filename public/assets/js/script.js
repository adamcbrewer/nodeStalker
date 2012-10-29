(function (App, M) {

	App = App || {};

	Modernizr.load({
		load: [
			App.siteUrl + '/assets/js/libs/jq-1.8.2.min.js'
		],
		complete: function () {
			//
			// Socket.io Listeners
			//
			// =========================================
			//
			App.socket.on('broadcast', function (data) {

				console.log(data);

			});
		}
	});

}(App, Modernizr));
