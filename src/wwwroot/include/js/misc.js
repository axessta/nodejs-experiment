/* misc.js, Jake Deery, 2018 */

// get dateTime
function getDateTime(offset) {
	// create Date object for current location
	var dateObj = new Date();
	
	var utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000); // stores UTC in ms
	var date = new Date(utc + (3600000 * offset));
	
	// return time as a string
	return date;
}

// just make some random int
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

// get UID
function getUID() {
	if(localStorage.getItem("uid") == undefined) {
		var uaStr = navigator.userAgent;
		var key = getRandomInt(99999999).toString();
		var hash = sha256.create();

		// set our hash
		hash.update(uaStr + key);

		localStorage.setItem("uid", hash.hex());
	}

	// return the result
	return localStorage.getItem("uid");
}

// get values
function doGet(table) {
	var uid = getUID();

	connection.send(JSON.stringify({
		type: "get",
		table: table,
		uid: uid
	}));
}

// do updates
function doUpdate(table, dataObj) {
	var uid = getUID();

	connection.send(JSON.stringify({
		type: "update",
		uid: uid,
		table: table,
		data: dataObj
	}));
}

// converts the string got from the database to a string the api can recognise
function doNewsSrc(input) {
	input = input.toLowerCase(); // drop uppercases
	input = input.replace(/\s/g, "-"); // replace all whitespaces with dashes
	input = input.replace(/[()]/g, ""); // drop all brackets

	return input;
}
