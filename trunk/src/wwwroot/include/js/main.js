/* homepage.js, Jake Deery, 2018 */

$(function() {
	$("#setupModal").modal({
		show: false,
		keyboard: false,
		backdrop: "static"
	});
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
}



//
// onmessage procedure
//
connection.onmessage = function(message) { // if we recieve a message
	try { // first off, lets make sure the data is a JSON transaction
		var json = JSON.parse(message.data);
	} catch (e) {
		console.error("WebSocket: Messaged recieved wasn't valid JSON");
		
		return;
	}



	// general response handler
	if(json.type == "response" && json.table == "general") {
		if(json.data.fullName !== undefined) {
			// set introductory text
			if(json.data.gender == "Male") $("#welcomeStrong").text("Welcome back, " + json.data.fullName + ", sir!");
			else if (json.data.gender == "Female") $("#welcomeStrong").text("Welcome back, " + json.data.fullName + ", ma'am!");

			// set paragraphs
			$("#userID").text(getUID());

			$("#fullName").text(json.data.fullName);

			$("#gender").text(json.data.gender);

			$("#themeChoice").text(json.data.themeChoice);
			
			// set background
			$("#headerWindow").css("background-image", "url('res/bitmaps/_" + json.data.themeChoice.toLowerCase() + ".jpg')");
		} else {
			// show the setup modal
			$("#setupModal").modal({
				show: true
			});

			$("#general").remove();
		}
	}

	// widget1 response handler
	if(json.type == "response" && json.table == "widget1") {
		if(json.data.enabled == 1) {
			setInterval(function() { // setInterval runs indefinitely on the specified interval . . . 
				var dateTime = getDateTime(json.data.timezoneOffset).toLocaleString("en-GB");
			
				$("#clockTimeSpan").text(dateTime.substring(12, 20));
				$("#clockDateSpan").text(dateTime.substring(0, 10));
			}, 17); // . . . here. Note that 17ms roughly equals 1/60th of a second, your average screen refresh rate
		} else {
			$("#widget1").remove();
		}
	}

	// widget2 response handler
	if(json.type == "response" && json.table == "widget2") {
		if(json.data.enabled == 1) {
			// set colour
			if(json.data.notesColour == "White") $("#notesContent").css("background-color", "rgb(255, 255, 255)")
			else if(json.data.notesColour == "Waterspout") $("#notesContent").css("background-color", "rgb(169, 248, 251)");
			else if(json.data.notesColour == "Tea green") $("#notesContent").css("background-color", "rgb(204, 252, 203)");
			else if(json.data.notesColour == "Pink lavender") $("#notesContent").css("background-color", "rgb(217, 184, 196)");
			else if(json.data.notesColour == "Gargoyle Gas") $("#notesContent").css("background-color", "rgb(253, 231, 76)");

			// set font
			$("#notesContent").css("font-family", json.data.notesFont.toLowerCase());

			// set style
			$("#notesContent").css("font-style", json.data.notesStyle.toLowerCase());

			// set bold
			if(json.data.notesBold == 1) $("#notesContent").css("font-weight", "bold");
			else if(json.data.notesBold == 0) $("#notesContent").css("font-weight", "normal");

			// set content
			if(json.data.notesContent !== undefined) $("#notesContent").val(json.data.notesContent);
		} else {
			$("#widget2").remove();
		}
	}

	// widget3 response handler
	if(json.type == "response" && json.table == "widget3") {
		if(json.data.enabled == 1) {
			$("#newsSource").text(json.data.newsSource);

			$.getJSON("https://newsapi.org/v2/top-headlines?sources=" + doNewsSrc(json.data.newsSource) + "&apiKey=ff07f4e4d939458593de65e59c7dd528", function(data) {
				for(var i = 0; i < 5; i++) {
					$("#article" + (i + 1)).text(data.articles[i].title);
					$("#article" + (i + 1)).attr("href", data.articles[i].url);
				}
			});
		} else {
			$("#widget3").remove();
		}
	}

	// widget4 response handler
	if(json.type == "response" && json.table == "widget4") {
		if(json.data.enabled == 1) {
			// do nothing
		} else {
			$("#widget4").remove();
		}
	}

	// widget5 response handler
	if(json.type == "response" && json.table == "widget5") {
		if(json.data.enabled == 1) {
			var countdownDateTime = new Date(json.data.countdownDate + " " + json.data.countdownTime).getTime();

			setInterval(function() {
				var now = getDateTime(json.data.countdownOffset).getTime();
				var diff = countdownDateTime - now;

				// time calculations for days, hours, minutes and seconds
				var d = Math.floor(diff / (1000 * 60 * 60 * 24));
				var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				var s = Math.floor((diff % (1000 * 60)) / 1000);

				// if distance is lt 0, we've reached our target
			
				if(diff < 0) {
					$("#countdownDisplay").text("Expired! On " + json.data.countdownDate + ", at " + json.data.countdownTime);
				} else {
					$("#countdownDisplay").text("There are " + d + "d " + h + "h " + m + "m " + s + "s to go until your timer expires");
				}
			}, 17);
		} else {
			$("#widget5").remove();
		}
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



//
// form handlers
//

$("#generalForm").submit(function() {
	doUpdate("general", {
		fullName: $("#nameInput").val(),
		gender: $("#genderSelect").val(),
		themeChoice: $("#themeChoiceSelect").val()
	});
});

// widget2 submit handler
$("#notes").submit(function() {
	doUpdate("widget2_hp", {notesContent: $("#notesContent").val()});

	return false;
});
