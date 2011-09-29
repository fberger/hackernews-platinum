var link = document.createElement("link");
link.type = "text/css";
link.href = chrome.extension.getURL("/help.css");
link.rel = 'stylesheet';
document.body.appendChild(link);

function track(args) {
    chrome.extension.sendRequest({type: "track", data: args});
}

chrome.extension.sendRequest(
    {type: "get", data: { resource: "/help.html" }},
    function(data) {
	$("body").append(data);
	$('#close-button').click(function() {
	    $('#overlay').hide();
	});
	$('#open-help').click(function() {
	    track(['_trackEvent', 'usage', 'help', 'help-link']);
	    $('#overlay').show();
	});
	if (localStorage.helpV2 == undefined || localStorage.helpV2 < 5) {
	    localStorage.helpV2 =
		localStorage.helpV2 == undefined ? 1 : ++(localStorage.helpV2);
	    $('#help-link').show();
	}
    });

$(document).keydown(function(event) {
    if (event.shiftKey && event.keyCode == 191) { // Shift + Slash = ?
	track(['_trackEvent', 'usage', 'help', 'help-key']);
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