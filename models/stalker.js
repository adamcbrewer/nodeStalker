/*
* Stalker.js
*
* A new instance of this should be created each time a new client connect to the server
*
**/
module.exports = Stalker;


var Stalker = function (params) {

	params = params || {};

	return stalker;

};

Stalker.prototype.stalkFile = function (fileObj) {

	fileObj = fileObj || false;

	var interval = fileObj.interval || 10000, // 10 senconds default
		i = 0,
		lines = [];

	fs.watchFile(fileObj.path, { interval: interval }, function (curr, prev) {
			console.log('-- LOG - '+fileObj.name+' changed at: ' + curr.mtime);
			console.log('-- LOG - The previous mtime was: ' + prev.mtime);
			fs.readFile(fileObj.path, 'utf8', function (err, data) {
				if (err) throw err;
				console.log(data);

			});
		});

	var dataReader = new reader.DataReader(fileObj.path, {encoding: "utf8"})
		.on('error', function (error) {
			console.log('error reading file: ' + error);
		})
		.on('line', function (line, nextByteOffset) {
			i++;
			lines.push(line);
			// console.log(i + ': ' + line);
		})
		.on('end', function () {
			console.log(i + ' lines in ' + fileObj.name);
		})
		.read();

}
