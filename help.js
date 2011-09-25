console.log('alive');
var link = document.createElement("link");
link.type = "text/css";
link.href = chrome.extension.getURL("/help.css");
link.rel = 'stylesheet';
document.body.appendChild(link);

chrome.extension.sendRequest(
    {type: "get", data: { resource: "/help.html" }},
    function(data) {
	console.log("append data");
	$("body").append(data);
	$('#close-button').click(function() {
	    console.log('close');
	    $('#overlay').hide();
	});
    });

$(document).keydown(function(event) {
    if (event.shiftKey && event.keyCode == 191) { // Shift + Slash = ?
	console.log('show');
	$('#overlay').show();
	event.preventDefault();
	return true;
    }
    if (event.keyCode == 27 && $('#overlay').is(':visible')) { // Escape
	$('#overlay').hide();
	return true;
    }
});