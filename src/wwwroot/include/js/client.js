/* client.js, Jake Deery, 2018 */

// make new ws object
const ws_server = "ws://localhost:8080/";
const connection = new WebSocket(ws_server);
	
// ifuser is running mozilla then use its built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;



connection.onerror = function() { // this fires if WS fails to open
	console.error("WebSocket: FAILED TO CONNECT");
};



connection.onclose = function() { // just detects when, and notifies if, the server disconnects (dropout, timeout, etc)
	console.error("WebSocket: CONNECTION DROPPED");
};
