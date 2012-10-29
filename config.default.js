/*
* config.js
*
* Hosts all the DEFAULT server config settings
*
**/
module.exports = {

	// Server config
	serverPort: 8888,
	basePath: 'http://local.nodestalker.com',

	// Files we're hoping to track
	stalkingFiles: [
		{
			name: "Your File",
			interval: 20000, // time in ms for which to check for changes
			path: '/var/log/apache2/error_log'
		}
	]

};
