var link = document.createElement("link");
link.type = "text/css";
link.href = chrome.extension.getURL("/help.css");
link.rel = 'stylesheet';
document.body.appendChild(link);

chrome.extension.sendRequest(
    {type: "get", data: { resource: "/help.html" }},
    function(data) {
	$("body").append(data);
	$('#close-button').click(function() {
	    $('#overlay').hide();
	});
	$('#open-help').click(function() {
	    $('#overlay').show();
	});
	var seen = localStorage.helpV1;
	if (seen == 'undefined' || seen < 5) {
	    localStorage.helpV1 = seen == 'undefined' ? 1 : ++seen;
	    $('#help-link').show();
	}
    });

$(document).keydown(function(event) {
    if (event.shiftKey && event.keyCode == 191) { // Shift + Slash = ?
	$('#overlay').show();
	event.preventDefault();
	return true;
    }
    if (event.keyCode == 27 && $('#overlay').is(':visible')) { // Escape
	$('#overlay').hide();
	event.preventDefault();
	return true;
    }
});