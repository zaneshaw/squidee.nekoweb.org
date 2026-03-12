// based on onionring-widget.js
// CDRing webring widget
// expects `cdringSites` (array of { url, image }) from onionring-variables.js

(function () {
	// make sure container exists
	var container = document.getElementById("cdr");
	if (!container || !window.cdringSites) return;

	// figure out which site youre on
	var currentIndex = cdringSites.findIndex((site) => site.url == "https://squidee.nekoweb.org");

	// if site is NOT in the ring, show error message
	if (currentIndex === -1) {
		container.innerHTML = `
		<div class="cdr-widget">
			<p><strong>The <a href='" + indexURL + "'> CDRing </a> manager hasn't added you to the webring yet!</strong></p>
		</div>
	`;
		return;
	}

	var currentSite = cdringSites[currentIndex];

	// figure out prev / next (wrap around)
	var prevIndex = (currentIndex - 1 + cdringSites.length) % cdringSites.length;
	var nextIndex = (currentIndex + 1) % cdringSites.length;

	var prevURL = cdringSites[prevIndex].url;
	var nextURL = cdringSites[nextIndex].url;
	var randomURL = cdringSites[Math.floor(Math.random() * cdringSites.length)].url;

	// url for the index page
	var indexURL = "https://cdring.neocities.org/";

	// build widget HTML
	var widgetHTML = "<div class='cdr-container'>";
	widgetHTML += "<div class='cdr-widget'>";
	widgetHTML += "<p><strong><a href='" + indexURL + "'>CDRing</a></strong></p>";

	// Prev / Image / Next row
	widgetHTML += "<div class='cdr-nav'>";
	widgetHTML += "<a href='" + prevURL + "' class='cdr-prev'>&lt;</a>";

	if (currentSite.image) {
		widgetHTML += "<a href='" + indexURL + "'>";
		widgetHTML += "<img src='" + currentSite.image + "' alt='CDRing badge' class='cdr-badge'>";
		widgetHTML += "</a>";
	}

	widgetHTML += "<a href='" + nextURL + "' class='cdr-next'>&gt;</a>";
	widgetHTML += "</div>";

	// Random + Index below
	widgetHTML += "<p><a href='" + randomURL + "'>random</a> | ";
	widgetHTML += "<a href='" + indexURL + "'>index</a></p>";

	widgetHTML += "</div>"; // close .cdr-widget
	widgetHTML += "</div>"; // close .cdr-container

	// inject into the page
	container.innerHTML = widgetHTML;
})();
