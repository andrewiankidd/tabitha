let featuredPictures = {};
const featuredPicturesImage = document.querySelector('img#featuredPicturesImage');
const featuredPicturesLabel = document.querySelector('p#featuredPicturesLabel');

function loadfeaturedPictures() {
	new Promise((resolve) => {
		
		// apply default data if none provided
		if (!localStorage['featured-pictures']) {			
			localStorage['featured-pictures'] = './json/images.json';
		}
		
		// if value is link to json file
		if (localStorage['featured-pictures'].endsWith('.json')) {
			
			// read json from remote URL
			resolve(fetch(localStorage['featured-pictures'], {
				headers: {
					'Content-Type': 'application/json; charset=UTF-8'
				},
			}).then(response => response.json()));
		} else {
			
			// else read json directly from localStorage
			resolve(JSON.parse(localStorage['featured-pictures']));
		}
	})
	.then(jsonData => featuredPictures = jsonData)
	.then(() => refreshfeaturedPictures());
}

// change the img and label to a new random picture from featuredPictures array
function refreshfeaturedPictures() {
	const flattened = [].concat(...Object.keys(featuredPictures).map(key => featuredPictures[key]));
	const entryKeys = Object.keys(flattened);
	const randomKey = entryKeys[Math.floor(Math.random()*entryKeys.length)]
	const randomPicture = flattened[randomKey].url;
	featuredPicturesImage.src = randomPicture;
	featuredPicturesLabel.innerText = randomPicture.split('/').pop()
}

// manually refresh featured picture on click
featuredPicturesImage.addEventListener('click', function() {
	refreshfeaturedPictures();
});

// auto change featured picture every 5 mins
setInterval(function() {
	refreshfeaturedPictures();
}, 5 * (60 * 1000));

loadfeaturedPictures();