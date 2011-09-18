var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25776464-1']);

function trackNavigation() {
    _gaq.push(['_trackEvent', event, 'clicked']);
};

function trackPageView(page) {
    _gaq.push(['_trackPageview', page]);
}

(function() {
    var ga = document.createElement('script'); 
    ga.type = 'text/javascript'; 
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; 
    s.parentNode.insertBefore(ga, s);
})();
