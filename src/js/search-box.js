const searchBoxForm = document.querySelector('form#searchBoxForm');
const searchBoxInput = document.querySelector('input#searchBoxInput');

function isPossibleURL(queryString) {
	// if query is continious string (no whitespace)
	// and it also contains at least one period
	// then it is probably is a URL
	return /^[\S]+\.[\S]+$/.test(queryString)
}

function hasProtocol(queryString) {
	// if query begins with a protocol (word, colon, two slashes)
	// or begins with two slashes (relative protocol),
	// then it maybe probably has a protocol
	return /^\/\/^|[a-z]+:\/\//i.test(queryString);
}

searchBoxForm.addEventListener('submit', function(evt) {
	const searchBoxQuery = searchBoxInput.value
    if (isPossibleURL(searchBoxQuery)) {
		console.log(`input '${searchBoxQuery}' is domain, redirecting...`);
		evt.preventDefault();
		
		window.location.href = (!hasProtocol(searchBoxQuery)) ? `//${searchBoxQuery}` : searchBoxQuery;		
	} else {
		console.log(`input '${searchBoxQuery}' is not domain, searching...`);
	}
})


