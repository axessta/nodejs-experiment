/* rmhome nodejs, server.js, Jake Deery, 2018 */

// global vars
const port = 8080; // http port
const wwwroot = "wwwroot/";

// open libs
const http = require("http"); // require: http & ws protocols, etc
	const websocket = require("websocket").server;
	const finalhandler = require("finalhandler");
	const serve_static = require("serve-static");
const sqlite3 = require("sqlite3").verbose(); // require: sqlite3 (db)
const readline = require("readline"); // require readline (cli input)



// webserver
const server = http.createServer(function(request, response) {
	console.log("HTTP: " + request.connection.remoteAddress + " requested page: " + request.url);

	var package = finalhandler(request, response); // get the data
	var serve = serve_static(wwwroot); // set the url for the data to fetch
	serve(request, response, package); // lastly, do the serve and send the package
}).listen(port, function() {
	console.log("HTTP: Listening on http://localhost:" + port + "/"); // log to console, inc the port and address
});



// create websocket server server
ws = new websocket({
  httpServer: server // bind to the http server
});

if(ws !== undefined) { // if ws worked
	console.log("WebSocket: Listening on ws://localhost:" + port + "/");
}



// database file(s)
const chinook_file = "./chinook.sqlite3"; // chinook is our user data store
const chinook = new sqlite3.Database(chinook_file, sqlite3.OPEN_READWRITE, (error) => {
  if(error) {
		return console.log("SQLite3: " + error.message);
	}
	console.log("SQLite3: Opened " + chinook_file);
});


// enable readline capability
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



// ws listener
ws.on("request", function(request) { // run a function with the request data
	var connection = request.accept(null, request.origin); // accept the request (no security)
	console.log("WebSocket: Client " + connection.remoteAddress + " established a connection (no security)");



	connection.on("message", function(message) { // if we recieve a message
		try { // first off, lets make sure the data is a JSON transaction
      var json = JSON.parse(message.utf8Data);
    } catch (e) {
			console.log("WebSocket: Client " + connection.remoteAddress + " sent a non-JSON message. Please investigate");
      return;
		}
		console.log("WebSocket: Client " + connection.remoteAddress + " sent message with type " + json.type);



		// init handler
		if(json.type == "init") doAck("ok");

		// get handler
		if(json.type == "get") {
			if(json.table == "general") doDbReponse(json.uid, "general");
			else if(json.table == "widget1") doDbReponse(json.uid, "widget1");
			else if(json.table == "widget2") doDbReponse(json.uid, "widget2");
			else if(json.table == "widget3") doDbReponse(json.uid, "widget3");
			else if(json.table == "widget4") doDbReponse(json.uid, "widget4");
			else if(json.table == "widget5") doDbReponse(json.uid, "widget5");

			// acknowledge all is ok
			doAck("get_" + json.table);
		}

		// update handler
		if(json.type == "update") {
			if(json.table == "general") doDbRun("INSERT OR REPLACE INTO general(uid,fullName,gender,themeChoice) VALUES (?,?,?,?)", [json.uid, json.data.fullName, json.data.gender, json.data.themeChoice]);
			else if(json.table == "widget1") doDbRun("INSERT OR REPLACE INTO widget1(uid,enabled,timezoneOffset) VALUES (?,?,?)", [json.uid, json.data.enabled, json.data.timezoneOffset]);
			else if(json.table == "widget2_set") doDbRun("INSERT OR REPLACE INTO widget2(uid,enabled,notesColour,notesFont,notesStyle,notesBold) VALUES (?,?,?,?,?,?)", [json.uid, json.data.enabled, json.data.notesColour, json.data.notesFont, json.data.notesStyle, json.data.notesBold]);
			else if(json.table == "widget2_hp") doDbRun("UPDATE widget2 SET notesContent = ? WHERE uid = ?", [json.data.notesContent, json.uid]);
			else if(json.table == "widget3") doDbRun("INSERT OR REPLACE INTO widget3(uid,enabled,newsSource) VALUES (?,?,?)", [json.uid, json.data.enabled, json.data.newsSource]);
			else if(json.table == "widget4") doDbRun("INSERT OR REPLACE INTO widget4(uid,enabled) VALUES (?,?)", [json.uid, json.data.enabled]);
			else if(json.table == "widget5") doDbRun("INSERT OR REPLACE INTO widget5(uid,enabled,countdownDate,countdownTime,countdownOffset) VALUES (?,?,?,?,?)", [json.uid, json.data.enabled, json.data.countdownDate, json.data.countdownTime, json.data.countdownOffset]);

			// acknowledge all is ok
			doAck("update_" + json.table);
		}

		// delete handler
		if(json.type == "delete" && json.uid !== undefined && json.data.confirm == "yes") {
			doDbRun("DELETE FROM general WHERE uid = ?", [json.uid]);
			doDbRun("DELETE FROM widget1 WHERE uid = ?", [json.uid]);
			doDbRun("DELETE FROM widget2 WHERE uid = ?", [json.uid]);
			doDbRun("DELETE FROM widget3 WHERE uid = ?", [json.uid]);
			doDbRun("DELETE FROM widget4 WHERE uid = ?", [json.uid]);
			doDbRun("DELETE FROM widget5 WHERE uid = ?", [json.uid]);

			// acknowledge all is ok
			doAck("deleteAll");
		}
	});



	// connection drop process
	connection.on("close", function() { // if we recieve a close signal
		console.log("WebSocket: Client " + connection.remoteAddress + " ended their connection");
	});


	//
	// db functions
	//

	// db response handler (i.e. select queries)
	function doDbReponse(uid, table) {
		var dataObj = undefined; // scope our var

		chinook.get("SELECT * FROM " + table + " WHERE uid = ?", [uid], (error, row) => {
			if(error) { // if the db thows a tantrum
				return console.error("SQLite3: " + error.message);
			} else if(row == undefined) { // row will be undefined if the db doesn't hold any data
				console.error("SQLite3: Row undefined (doesn't exist)");

				// set the data
				dataObj = {response: null};
			} else {
				// it worked
				console.log("SQLite3: SQL query ran OK");

				// set the data
				dataObj = row;
			}
			
			// set the data
			var responseObj = {
				type: "response",
				uid: uid,
				table: table,
				data: dataObj
			}

			console.log("WebSocket: Server sent a message with type " + responseObj.type + " to client " + connection.remoteAddress);
			connection.sendUTF(JSON.stringify(responseObj));

			return;
		});
	}

	// db "run" process (for inserts)
	function doDbRun(sql, dataSet) {
		chinook.run(sql, dataSet, (error) => {
			if(error) { // if the db thows a tantrum
				return console.error("SQLite3: " + error.message);
			}
			
			console.log("SQLite3: SQL query ran OK");
		});
	}

	// ack function (to tell client things)
	function doAck(ackType) {
		console.log("WebSocket: Server sent acknowledgement with type " + ackType + " to client " + connection.remoteAddress);

		// do it
		connection.sendUTF(JSON.stringify({
			type: "ack",
			data: {
				ack: ackType
			}
		}));
	}
});



// server close procedures
if (process.platform === "win32") {
	rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

process.on("SIGINT", function () {
	//graceful shutdown
	chinook.close();
	console.log("SQLite3: Database closed");

	console.log("Node.js: Server closing . . . ");
  process.exit();
});
