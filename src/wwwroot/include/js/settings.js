/* settings.js, Jake Deery, 2018 */

$(function() {
	var uid = getUID();
	$("#userID").val(uid);
});

// websocket onload procedure
connection.onopen = function() {
	console.log("WebSocket: OK");

	// get data relating to us from the sqlite service
	doGet("general");
	doGet("widget1");
	doGet("widget2");
	doGet("widget3");
	doGet("widget4");
	doGet("widget5");
};



// onmessage procedure
connection.onmessage = function(message) { // if we recieve a message
	try { // first off, lets make sure the data is a JSON transaction
		var json = JSON.parse(message.data);
	} catch (e) {
		console.error("WebSocket: Messaged recieved wasn't valid JSON");
		
		return;
	}

	// general response handler
	if(json.type == "response" && json.table == "general") {
		// set the fields
		if(json.data.fullName !== undefined) $("#nameInput").val(json.data.fullName);

		if(json.data.gender !== undefined) $("#genderSelect").val(json.data.gender);

		if(json.data.themeChoice !== undefined) $("#themeChoice").val(json.data.themeChoice);

		// set background
		if(json.data.themeChoice !== undefined) $("#headerWindow").css("background-image", "url('res/bitmaps/_" + json.data.themeChoice.toLowerCase() + ".jpg')");
		else $("#headerWindow").css("background-image", "url('res/bitmaps/_neon.jpg')");
	}

	// general clear procedure
	$("#doDelete").click(function() {
		// send a delete message
		connection.send(JSON.stringify({
			type: "delete",
			uid: getUID(),
			data: {
				confirm: "yes"
			}
		}));

		// clear localStorage
		localStorage.clear();

		// redirect home
		location.href = "/";
	});

	//widget1 response handler
	if(json.type == "response" && json.table == "widget1") {
		// set the fields
		if(json.data.enabled == 1) {
			$("#widget1Toggle").prop("checked", true);
		} else if(json.data.enabled == 0) {
			$("#widget1Toggle").prop("checked", false);
		}

		if(json.data.timezoneOffset !== undefined) $("#timezoneOffset").val(json.data.timezoneOffset);
	}

	//widget2 response handler
	if(json.type == "response" && json.table == "widget2") {
		// set the fields
		if(json.data.enabled == 1) {
			$("#widget2Toggle").prop("checked", true);
		} else if(json.data.enabled == 0) {
			$("#widget2Toggle").prop("checked", false);
		}

		if(json.data.notesColour !== undefined) $("#notesColour").val(json.data.notesColour);

		if(json.data.notesFont !== undefined) $("#notesFont").val(json.data.notesFont);

		if(json.data.notesStyle !== undefined) $("#notesStyle").val(json.data.notesStyle);
		
		if(json.data.notesBold == 1) {
			$("#notesBold").prop("checked", true);
		} else if(json.data.notesBold == 0) {
			$("#notesBold").prop("checked", false);
		}
	}

	//widget3 response handler
	if(json.type == "response" && json.table == "widget3") {
		// set the fields
		if(json.data.enabled == 1) {
			$("#widget3Toggle").prop("checked", true);
		} else if(json.data.enabled == 0) {
			$("#widget3Toggle").prop("checked", false);
		}

		if(json.data.newsSource !== undefined) $("#newsSource").val(json.data.newsSource);
	}

	//widget4 response handler
	if(json.type == "response" && json.table == "widget4") {
		// set the fields
		if(json.data.enabled == 1) {
			$("#widget4Toggle").prop("checked", true);
		} else if(json.data.enabled == 0) {
			$("#widget4Toggle").prop("checked", false);
		}
	}

	//widget5 response handler
	if(json.type == "response" && json.table == "widget5") {
		// set the fields
		if(json.data.enabled == 1) {
			$("#widget5Toggle").prop("checked", true);
		} else if(json.data.enabled == 0) {
			$("#widget5Toggle").prop("checked", false);
		}

		if(json.data.countdownDate !== undefined) $("#countdownDate").val(json.data.countdownDate);

		if(json.data.countdownTime !== undefined) $("#countdownTime").val(json.data.countdownTime);
	}

	// ack handler -- update
	if(json.type == "ack" && json.data.ack.indexOf("update_") > -1) {
		console.log("Acknowledgement from server for: " + json.data.ack);

		$("#" + json.data.ack.substr(7) + "Ok").css("display", "inline-block"); // set check
		setTimeout(function() {
			$("#" + json.data.ack.substr(7) + "Ok").css("display", "none"); // set check off
		}, 2000);
	}
};



// general submit procedure
$("#generalForm").submit(function() {
	doUpdate("general", {
		fullName: $("#nameInput").val(),
		gender: $("#genderSelect").val(),
		themeChoice: $("#themeChoice").val()
	});

	return false;
});



// widget1 submit procedure
$("#widget1Form").submit(function() {
	doUpdate("widget1", {
		enabled: $("#widget1Toggle").prop("checked"),
		timezoneOffset: $("#timezoneOffset").val()
	});

	return false;
});



// widget2 submit procedure
$("#widget2Form").submit(function() {
	doUpdate("widget2_set", {
		enabled: $("#widget2Toggle").prop("checked"),
		notesColour: $("#notesColour").val(),
		notesFont: $("#notesFont").val(),
		notesStyle: $("#notesStyle").val(),
		notesBold: $("#notesBold").prop("checked")
	});
	
	return false;
});



// widget3 submit procedure
$("#widget3Form").submit(function() {
	doUpdate("widget3", {
		enabled: $("#widget3Toggle").prop("checked"),
		newsSource: $("#newsSource").val()
	});
	
	return false;
});



// widget4 submit procedure
$("#widget4Form").submit(function() {
	doUpdate("widget4", {
		enabled: $("#widget4Toggle").prop("checked")
	});
	
	return false;
});

// widget5 submit procedure
$("#widget5Form").submit(function() {
	doUpdate("widget5", {
		enabled: $("#widget5Toggle").prop("checked"),
		countdownOffset: $("#countdownOffset").val(),
		countdownDate: $("#countdownDate").val(),
		countdownTime: $("#countdownTime").val()
	});

	return false;
});
