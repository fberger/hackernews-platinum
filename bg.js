trackPageView('/bg.html');

function toCode(f) {
    return "(" + f.toString() + ")();";
}

function installCloseHandler() {
    var rightPressed = false;
    document.addEventListener('keydown', function (event) { 
	// Only close tab if user didn't scroll to the right.
	if (event.keyCode == 39) {
	    rightPressed = true;
	} else if (!rightPressed || event.altKey) {
	    if (event.keyCode == 37
		&& (typeof(keysOn) === 'undefined' || keysOn === true)) {
		chrome.extension.sendRequest({type: "track",
					      data: ['_trackEvent', 'usage', 
						     'item', 'close-tab']});
		self.close();
	    }
	}
    });
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
	if (request.type == "openLink") {
	    chrome.tabs.create({
		"url":request.data.url,
		"selected":request.data.focus,
		"index":sender.tab.index
	    }, function (tab) {
		if (request.data.close == undefined || request.data.close) {
		    chrome.tabs.executeScript(tab.id, {
			code: toCode(installCloseHandler)
		    });
		}
	    });
	} else if (request.type == "track") {
	    _gaq.push(request.data);
	} else if (request.type == "get") {
	    var url = chrome.extension.getURL(request.data.resource);
	    $.get(url, function(data) {
		sendResponse(data);
	    });
	}
    });
