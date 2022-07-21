let pinnedSites = {};
const pinnedSitesContainer = document.querySelector('div#pinnedSitesContainer');

function loadPinnedSites() {
	new Promise((resolve) => {
		
		// apply default data if none provided
		if (!localStorage['pinned-sites']) {			
			localStorage['pinned-sites'] = './json/sites.json';
		}
		
		// if value is link to json file
		if (localStorage['pinned-sites'].endsWith('.json')) {
			
			// read json from remote URL
			resolve(fetch(localStorage['pinned-sites'], {
				headers: {
					'Content-Type': 'application/json; charset=UTF-8'
				},
			}).then(response => response.json()));
		} else {
			
			// else read json directly from localStorage
			resolve(JSON.parse(localStorage['pinned-sites']));
		}
	})
	.then(jsonData => pinnedSites = jsonData)
	.then(() => refreshPinnedSites());
}

function refreshPinnedSites() {
	Object.keys(pinnedSites).forEach(siteCategoryTitle => {

		// create category
		const categoryElement = document.createElement("details")
		const categoryTitleElement = document.createElement("summary");
		categoryTitleElement.innerHTML = siteCategoryTitle;
		categoryElement.appendChild(categoryTitleElement);

		// add category sites
		const categoryListElement = document.createElement("ul");
		pinnedSites[siteCategoryTitle].forEach(pinnedSite => {
			const pinnedSiteListEntryElement = document.createElement("li");

			//
			const pinnedSiteFaviconElement = document.createElement("img");
			pinnedSiteFaviconElement.src = `https://www.google.com/s2/favicons?sz=16&domain=${pinnedSite.url}`;
			pinnedSiteListEntryElement.appendChild(pinnedSiteFaviconElement);

			//
			const pinnedSiteHrefElement = document.createElement("a");
			pinnedSiteHrefElement.innerText = pinnedSite.title;
			pinnedSiteHrefElement.href = pinnedSite.url;
			pinnedSiteListEntryElement.appendChild(pinnedSiteHrefElement);
			
			//
			categoryListElement.appendChild(pinnedSiteListEntryElement);
		})
		categoryElement.appendChild(categoryListElement);

		// add to page
		pinnedSitesContainer.appendChild(categoryElement)
	})
}

loadPinnedSites();