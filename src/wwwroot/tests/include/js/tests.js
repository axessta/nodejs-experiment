/* qunit main.js, Jake Deery, 2018 */

// qunit config
QUnit.config.testTimeout = 2500;



// global vars
//
// make new ws object
const dateObj = new Date();
const clockTime = getDateTime(dateObj.getTimezoneOffset()); // the offset matches the system in this case

//
// system setup
//

connection.onopen = function() {
	console.log("WebSocket: OK");

	// init should get ack: ok as reponse
	connection.send(JSON.stringify({
		type: "init"
	}));

	// update for general should get ack: update_general, etc
	doUpdate("general", {
		fullName: "QUnit Test User",
		gender: "Female",
		themeChoice: "Space"
	});

	doUpdate("widget1", {
		enabled: "1",
		timezoneOffset: "0"
	});

	doUpdate("widget2_set", {
		enabled: "1",
		notesColour: "White",
		notesFont: "Serif",
		notesStyle: "Normal",
		notesBold: "0"
	});

	doUpdate("widget2_hp", {
		notesContent: "QUnit update test @ " + clockTime.toLocaleString("en-GB")
	});

	doUpdate("widget3", {
		enabled: "1",
		newsSource: "BBC News"
	});

	doUpdate("widget4", {
		enabled: "1"
	});

	doUpdate("widget5", {
		enabled: "1",
		countdownOffset: "0",
		countdownDate: "2019-07-02",
		countdownTime: "00:00"
	});

	// doGet for all
	doGet("general");
	doGet("widget1");
	doGet("widget2");
	doGet("widget3");
	doGet("widget4");
	doGet("widget5");
}

connection.onmessage = function(message) {
	try { // first off, lets make sure the data is a JSON transaction
		var json = JSON.parse(message.data);
		console.log("WebSocket: New message -- ");
		console.log(json);
	} catch (e) {
		console.error("WebSocket: Messaged recieved wasn't valid JSON");
		
		return;
	}

	if(json.type == "ack") {
		if(json.data.ack == "ok") $("#initP").text("Init caught!");
		else if(json.data.ack == "update_widget2_hp") $("#update_widget2_hpP").text("Update_widget2_hp caught!");
	}

	if(json.type == "response") {
		if(json.table == "general") $("#bgDiv").css("background-image", "url('../res/bitmaps/_" + json.data.themeChoice.toLowerCase() + ".jpg')");
		else if(json.table == "widget1") $("#widget1Val").text("enabled: " + json.data.enabled + " timezoneOffset: " + json.data.timezoneOffset);
		else if(json.table == "widget2") $("#widget2Val").text("notesContent: " + json.data.notesContent);
		else if(json.table == "widget3") $("#widget3Val").text("newsSource: " + json.data.newsSource);
		else if(json.table == "widget4") $("#widget4Val").text("enabled: " + json.data.enabled);
		else if(json.table == "widget5") $("#widget5Val").text("countdownDate: " + json.data.countdownDate + " countdownTime: " + json.data.countdownTime);
	}
}



//
// QUnit tests
//

// general
QUnit.module("General Tests", function() {
	// is QUnit working?
	QUnit.test("QUnit Basic Test", function(assert) {
		assert.ok(true, "QUnit Basic Test passed! Result: " + true);
	});

	QUnit.test("GetUID testing validity", function(assert) {
		console.log("GetUID testing validity - Result: " + getUID());
		assert.equal(getUID(), localStorage.getItem("uid"), "GetUID passed! Result: " + getUID());
	});
});

	// widget 1
QUnit.module("Widget1 Tests", function() {
	QUnit.test("Custom clock function test", function(assert) {
		console.log("Custom clock function test - Result: " + clockTime.toLocaleString("en-GB"));
		assert.equal(clockTime.toLocaleString("en-GB"), dateObj.toLocaleString("en-GB"), "Custom clock function passed! Result: " + clockTime);
	});
		
	QUnit.test("Time printout test", function(assert) {
		$("#clock").text(clockTime.toLocaleString("en-GB"));

		console.log("Time printout test - Result: "+ $("#clock").text());
		assert.equal($("#clock").text(), clockTime.toLocaleString("en-GB"), "Time printout passed! Result: " + $("#clock").text());
	});
});

// general tests -- init check
setTimeout(function() { // we need to wait for the client/server exchange to happen. 2500ms is enough
	QUnit.module("General: Init check", function() {
		QUnit.test("Checking init status", function(assert) {
			console.log("Checking init status - Result: " + $("#initP").text());
			assert.equal($("#initP").text(), "Init caught!", "Checking init status passed! Result: " + $("#initP").text());
		});
	});
}, 2500);

// general tests -- general background
setTimeout(function() {
	QUnit.module("General: Theme check", function() {
		QUnit.test("Checking theme is set to Space", function(assert) {
			console.log("Checking theme is set to Space - Result: " + $("#bgDiv").css("background-image"));
			assert.equal($("#bgDiv").css("background-image"), 'url("http://localhost:8080/res/bitmaps/_space.jpg")', "Checking theme is set to Space passed! Result: " + $("#bgDiv").css("background-image"));
		});
	});
}, 2500);

// widget2 -- update check
setTimeout(function() {
	QUnit.module("Widget 2: Update check", function() {
		QUnit.test("Checking update_widget2_hp status", function(assert) {
			console.log("Checking update_widget2_hp status - Result: " + $("#update_widget2_hpP").text());
			assert.equal($("#update_widget2_hpP").text(), "Update_widget2_hp caught!", "Checking update_widget2_hp status passed! Result: " + $("#update_widget2_hpP").text());
		});
	});
}, 2500);

// widget2 -- value check
setTimeout(function() {
	QUnit.module("Widget 2: Value check", function() {
		QUnit.test("Checking widget2 value is not undefined or null", function(assert) {
			console.log("Checking widget2 value is not undefined or null - Result: " + $("#widget2Val").text());
			assert.notEqual($("#widget2Val").text(), "notesContent: null", "Checking widget2 value is not undefined or null passed! Result: " + $("#widget2Val").text());
		});
	});
}, 2500);

// widget3 -- value check
setTimeout(function() {
	QUnit.module("Widget 3: Value check", function() {
		QUnit.test("Checking widget3 value is not undefined or null", function(assert) {
			console.log("Checking widget3 value is not undefined or null - Result: " + $("#widget3Val").text());
			assert.equal($("#widget3Val").text(), "newsSource: BBC News", "Checking widget3 value is not undefined or null passed! Result: " + $("#widget3Val").text());
		});
	});
}, 2500);

// widget3 -- status check
setTimeout(function() {
	QUnit.module("Widget 4: Status check", function() {
		QUnit.test("Checking widget4 value is 'status: ok'", function(assert) {
			console.log("Checking widget4 value is 'status: ok' - Result: " + $("#newsJson").text());
			assert.equal($("#newsJson").text(), "status: ok", "Checking widget4 value is 'status: ok' passed! Result: " + $("#newsJson").text());
		});
	});
}, 2500);

// widget4 -- value check
setTimeout(function() {
	QUnit.module("Widget 4: Value check", function() {
		QUnit.test("Checking widget4 value is 1", function(assert) {
			console.log("Checking widget4 value is 1 - Result: " + $("#widget4Val").text());
			assert.equal($("#widget4Val").text(), "enabled: 1", "Checking widget4 value is 1 passed! Result: " + $("#widget4Val").text());
		});
	});
}, 2500);

// widget5 -- value check
setTimeout(function() {
	QUnit.module("Widget 5: Value check", function() {
		QUnit.test("Checking widget5 value is 1", function(assert) {
			console.log("Checking widget5 value is 'countdownDate: 2019-07-02 countdownTime: 00:00' - Result: " + $("#widget5Val").text());
			assert.equal($("#widget5Val").text(), "countdownDate: 2019-07-02 countdownTime: 00:00", "Checking widget5 value is 'countdownDate: 2019-07-02 countdownTime: 00:00' passed! Result: " + $("#widget5Val").text());
		});
	});
}, 2500);



// 
// misc
//
$("#uidSpan").text(getUID());

// set up 
$.getJSON("https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=ff07f4e4d939458593de65e59c7dd528", function(data) {
	console.log("News JSON object:");
	console.log(data);

	$("#newsJson").text("status: " + data.status);
});
