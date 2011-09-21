/*
  reddit platinum : reddit plugin that simplifies keyboard navigation and allows to hide some layout parts

    Copyright (C) 2010 Mounier Florian aka paradoxxxzero

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/.
*/

/*
 * Adapted to work for Hacker News by Felix Berger.
 */

(function() {
    var _debug = false;
    var isUpsideDown = false;
    var keysOn = true;
    var alreadyRequested;
    var currentTopic = 1;
    var commentMode = $("title").text().indexOf("|") != -1 
	&& $("title").text().indexOf("New Links") == -1;
    var disableInput = false;

    track(["_trackPageview", "/content.js"]);

    function selectTopics() {
	return $("td[class=title] > a").parent();
    }

    function selectComments() {
	return $("td[class=default]");
    }

    // If on a page for writing a comment, just focus on textarea and return.
    if (commentMode && $("title").text().indexOf("| Add Comment") != -1) {
	$("textarea").focus();
	return;
    }

    // comment in non comment mode are for the profile page, message are for mails
    var topics = commentMode ? selectComments() : selectTopics();

    // Listen to the body for any DOM modifications
    $("td[class=title]").parent().parent().parent().bind("DOMNodeInserted", mustUpdateTopics);
    $("td[class=default]").parent().parent().parent().parent().parent().parent().parent().bind("DOMNodeInserted", disableKeysOnInput);
    disableKeysOnInput();

    function disableKeysOnInput() {
	$("input,textarea,button").focus(function () {
	    keysOn = false;
	});
	$("input,textarea,button").blur(function () {
	    keysOn = true;
	});
	$("button").click(function () {
	    keysOn = true;
	});
	$("button").keyup(function (event) {
            if(event.keyCode == 32 || event.keyCode == 13) keysOn = true;
	});
    }

    function mustUpdateTopics() {
	if(alreadyRequested) return;
	alreadyRequested = true;
	setTimeout(updateTopics, 500);
    }

    // Uncaching topics to allow dom modifications
    function updateTopics() {
	topics = commentMode ? selectComments() : selectTopics();
	topics.css({border: '1px solid #f6f6ef'});
	topic().css({ backgroundColor: '#eee', borderTopColor: '#ccc', borderBottomColor: '#ccc', borderLeftColor: '#ccc', borderRightColor: '#ccc' }, 500);
	disableKeysOnInput();
	alreadyRequested = false;
    }

    if(!has(topics)) {
	throw "No topics found";
    }
    $(document).keydown(keyd);
    $(document).mousewheel(scrolld);

    topics.css({border: '1px solid #f6f6ef'});
    highlightCurrentTopic();

    function topic() {
	return $(topics[currentTopic - 1]);
    }

    function highlightCurrentTopic() {
	topic().animate({ backgroundColor: '#fff', borderTopColor: '#828282', borderBottomColor: '#828282', borderLeftColor: '#828282', borderRightColor: '#828282' }, 500);
	_log("Highlighted topic : " + currentTopic);
    }
    function lowlightCurrentTopic() {
	topic().animate({ backgroundColor: '#f6f6ef', borderTopColor: '#f6f6ef', borderBottomColor: '#f6f6ef', borderLeftColor: '#f6f6ef', borderRightColor: '#f6f6ef'}, 500);
	_log("Delighted topic : " + currentTopic);
    }
    function scrollToCurrentTopic(fromAbove) {
	var topicOffset = topic().offset().top;
	if(!topic().is(":visible") || topicOffset == 0) {
	    // Invisible topic/comment or unpositionned -> skipping next

	    // If an end is encoutered -> change side
	    isUpsideDown = isUpsideDown || (currentTopic == 1 || currentTopic == topics.length);

	    _log("Descending " + currentTopic);
	    (isUpsideDown ? !fromAbove : fromAbove) ? nextTopic(1, true) : previousTopic(1, true);
	    _log("Monting " + currentTopic);
	    return;
	}
	var actual = topicOffset - $('body').scrollTop();
	var turnAround = (isUpsideDown ? !fromAbove : fromAbove); // Get real direction
	if((turnAround && actual  > (window.innerHeight / 2))     // Going down cross the middle
	   || (!turnAround && actual < (window.innerHeight / 2))  // Going up cross the middle
	   || (actual < 0) || (actual > window.innerHeight)) {    // Negative or greater than screen ?! Page must have been manually scrolled, rescrolling
	    var bodyScroll = topicOffset - window.innerHeight / 2;
 	    $('body').stop(true, true);
	    $('body').animate({ scrollTop: bodyScroll}, 500);
	}
	isUpsideDown = false;
    }
    function openLink(data) {
	chrome.extension.sendRequest({type: "openLink", data: data});
    }
    function track(args) {
	chrome.extension.sendRequest({type: "track", data: args});
    }
    function trackItemAction(type) {
	track(['_trackEvent', 'usage', 'item', type]);
    }
    function openCurrent(shift) {
	var link = topic().find("a").attr("href");
	if(!link) return;
	if (link.match('item')) {
	    link = 'http://news.ycombinator.com/' + link;
	}
	openLink({url: link, focus: !shift});
	trackItemAction("open-link");
    }
    function openCurrentComment(shift) {
	var link = topic().parent().next().find("a").last().attr("href");
	if(!link) return;
	if (link.match('item')) {
	    link = 'http://news.ycombinator.com/' + link;
	}
	openLink({url: link, focus: !shift});
	trackItemAction("open-comment");
    }
    function upvote() {
	topic().parent().find("td > center > a").click();
	trackItemAction("upvote");
    }
    function downvote() {
	
    }
    function reply() {
	var link = topic().find("u a").attr("href");
	if (link) {
	    link = 'http://news.ycombinator.com/' + link;
	    openLink({url: link, focus: true, close: false});
	}
	trackItemAction("reply");
    }
    function previousTopic(n, noanim) {
	if(currentTopic < 1 + n) {
	    return;
	}
	if(!noanim) lowlightCurrentTopic();
	currentTopic -= n;
	scrollToCurrentTopic(false);
	if(!noanim) highlightCurrentTopic();
    }
    function nextTopic(n, noanim) {
	if(currentTopic + n > topics.length ) return;
	if(!noanim) lowlightCurrentTopic();
	currentTopic += n;
	scrollToCurrentTopic(true);
	if(!noanim) highlightCurrentTopic();
    }
    function firstTopic() {
	lowlightCurrentTopic();
	currentTopic = 1;
	highlightCurrentTopic();
	scrollToCurrentTopic(false);
    }
    function lastTopic() {
	lowlightCurrentTopic();
	currentTopic = topics.length;
	scrollToCurrentTopic(true);
	highlightCurrentTopic();
    }
    function hideTopic() {
	if(commentMode) {
	    if(topic().children("div.collapsed").is(':visible')) topic().children("div.collapsed").children("a.expand").click();
	    else topic().children("div.noncollapsed").children("p.tagline").children("a.expand").click();
	}
	else topic().children("div.entry").children("ul.flat-list").find(".state-button.hide-button").find("a").click();
    }
    function expando() {
	if(commentMode) $(topic().children("div.noncollapsed").children("ul.flat-list").children("li")[topic().children("div.noncollapsed").children("ul.flat-list").children("li").length - 1]).children("a").click();
	else topic().children("div.entry").children("div.expando-button").click();
    }

    function keyd(event) {
	if(event.keyCode == 32 && event.altKey) {
	    disableInput = !disableInput;
	    return true;
	}
	if(!keysOn || disableInput) return true;
	if(event.keyCode == 38) { // Up
	    if(event.ctrlKey) {
		upvote();
	    } else if (event.altKey) {
		return true;
	    } else {
		if(commentMode) {
		    if(event.shiftKey) previousSibling();
		    else previousTopic(1);
		} else {
		    previousTopic(1);
		}
	    }
	} else if (event.keyCode == 40) { //Down
	    if(event.ctrlKey) {
		downvote();
	    } else if (event.altKey) {
		return true;
	    } else {
		if(commentMode) {
		    if(event.shiftKey) nextSibling();
		    else nextTopic(1);
		} else {
		    nextTopic(1);
		}
	    }
	} else if(event.keyCode == 33) { // Page Up
	    previousTopic(5);
	} else if(event.keyCode == 34) { // Page Down
	    nextTopic(5);
	} else if(event.keyCode == 36) { // Begin
	    firstTopic();
	} else if(event.keyCode == 35) { // End
	    lastTopic();
	} else if(event.keyCode == 46) { // Del
	    hideTopic();
	} else if(event.keyCode == 13 || event.keyCode == 39) { // Enter or Right
	    if(commentMode) {
		//	    nextParent();
	    } else {
		openCurrent(event.shiftKey);
	    }
	} else if(event.keyCode == 37) { // Left
	    if(commentMode) {
		previousParent();
	    } else {
		openCurrentComment(event.shiftKey);
	    }
	} else if(event.keyCode == 32) { // Space
	    //expando();
	    reply();
	} else if(event.keyCode == 27) { // Escape
	    self.close();
	} else {
	    return true;
	}
	event.stopPropagation();
	return false;
    }

    function scrolld (event, delta) {
	if(event.altKey || disableInput) return true;
	if(delta < 0) {
	    if(commentMode) {
		if(event.shiftKey) nextSibling();
		else nextTopic(1);
	    } else {
		nextTopic(1);
	    }
	} else {
	    if(commentMode) {
		if(event.shiftKey) previousSibling();
		else previousTopic(1);
	    } else {
		previousTopic(1);
	    }
	}
	event.stopPropagation();
	return false;
    }

    function previousSibling() {
	lowlightCurrentTopic();
	var oldCurrentTopic = currentTopic;
	var currentLevel = topic().parents().length;
	while(currentTopic > 1) {
	    currentTopic--;
	    if(topic().parents().length == currentLevel) { // 3 levels between each comment level
		scrollToCurrentTopic(true);
		highlightCurrentTopic();
		return;
	    }
	}
	currentTopic = oldCurrentTopic;
	highlightCurrentTopic();
    }

    function nextSibling() {
	lowlightCurrentTopic();
	var oldCurrentTopic = currentTopic;
	var currentLevel = topic().parents().length;
	while(currentTopic < topics.length) {
	    currentTopic++;
	    if(topic().parents().length == currentLevel) { // 3 levels between each comment level
		scrollToCurrentTopic(true);
		highlightCurrentTopic();
		return;
	    }
	}
	currentTopic = oldCurrentTopic;
	highlightCurrentTopic();
    }
    function previousParent() {
	lowlightCurrentTopic();
	var oldCurrentTopic = currentTopic;
	var currentLevel = topic().parents().length;
	while(currentTopic > 1) {
	    currentTopic--;
	    if(topic().parents().length == currentLevel - 3) { // 3 levels between each comment level
		scrollToCurrentTopic(true);
		highlightCurrentTopic();
		return;
	    }
	}
	currentTopic = oldCurrentTopic;
	highlightCurrentTopic();
    }

    function nextParent() {
	lowlightCurrentTopic();
	var oldCurrentTopic = currentTopic;
	var currentLevel = topic().parents().length;
	while(currentTopic < topics.length) {
	    currentTopic++;
	    if(topic().parents().length == currentLevel - 3) { // 3 levels between each comment level
		scrollToCurrentTopic(true);
		highlightCurrentTopic();
		return;
	    }
	}
	currentTopic = oldCurrentTopic;
	highlightCurrentTopic();
    }

    function has(thing) {
	return thing.length > 0;
    }

    function _log(toLog) {
	if(_debug) {
	    console.log(toLog);
	}
    }
    function turnOnDebug() {
	_debug = false;
    }
})();