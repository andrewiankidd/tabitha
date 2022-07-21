// default UI elements
const settingsPanelOpenButton = document.querySelector('button#settingsPanelOpen');
const settingsPanelCloseButton = document.querySelector('button#settingsPanelClose');

/**
 * https://stackoverflow.com/a/35385518
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

// https://stackoverflow.com/a/2117523
function uuidv4() {
	  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	  );
}


function removeElementById(elementId) {
	document.getElementById(elementId).remove();
}

function newInputSet(groupValues) {
	return groupValues.map((groupValue, index) => {
		const uid = uuidv4();
		return `<span class="inputSet flexWrap" id="inputSet-${uid}">` +
		 Object.keys(groupValue).map(groupValueName => {
			return `<input name="${groupValueName}" value="${groupValue[groupValueName]}" placeholder="${groupValueName}"/>`;
		}).join('') + `<span onclick="removeElementById('inputSet-${uid}')">❌</span></span>`
	}).join('')
}

// clone default input and mark as such
function cloneInputSet(inputSet) {
	
	// create clone of input group
	const clonedInputSet = inputSet.cloneNode(true);
	clonedInputSet.setAttribute("is-clone", "true");
	
	// clear any existing values
	clonedInputSet.querySelectorAll('input').forEach((input, index) => {
		input.value = '';
	});

	return clonedInputSet;
}

function newInputGroup(groupTitle, groupValues) {
	const uid = uuidv4();
	return `<div class="inputGroup flexWrap" id="inputGroup-${uid}">
		<input type="text" name="inputGroupTitle" value="${groupTitle}" placeholder="title"/><span onclick="removeElementById('inputGroup-${uid}')">❌</span>
		<div class="inputGroupValues flexWrap" id="${groupTitle}-inputGroupValues">
		` + newInputSet(groupValues) +
	`	</div>
	</div>`;
}

// add event listener to element with duplication prevention
function newEventListener(element, type, callback) {
	
	// check if element doesn't already have event listener of this type already
	if (!element.hasAttribute(`eventListenerOn${type}`)) {
		
		// add event listener to element
		element.addEventListener(type, callback);

		// flag the element to prevent duplicates being added
		element.setAttribute(`eventListenerOn${type}`, 'true');
	}
}

function refreshSettingsPanelSection(settingSelector, localStorageKey, defaultObj) {
	
	// settings panel UI elements
	const settingsContainer = document.querySelector(`div#settingsPanel ${settingSelector}`);
	const settingsForm = settingsContainer.querySelector('form');
	const remoteCheckbox = settingsContainer.querySelector('input#remoteRadio');
	const localCheckbox = settingsContainer.querySelector('input#localRadio');
	
	// remote settings UI elements
	const remoteContainer = settingsContainer.querySelector('span.remoteInputs');
	const remoteInput = remoteContainer.querySelector('input#remoteInput');
	
	// local settings UI elements
	const localContainer = settingsContainer.querySelector('.localInputs');
	//const inputGroup = localContainer.querySelector('.inputGroup');
	const addLocalInputButton = settingsContainer.querySelector('button.addInput');

	// setting value from localStorage
	const settingValue = localStorage[localStorageKey];

	// watch for local checkbox changes
	newEventListener(localCheckbox, 'change', function() {
		if (!settingValue.endsWith('.json')) {
			
			// remove cloned inputs
			settingsContainer.querySelectorAll(".inputGroup[is-clone]").forEach((input) => input.remove());

			// parse saved values
			let inputValues = JSON.parse(settingValue);
			
			// add inputgroup for each
			Object.keys(inputValues).forEach((inputValueKey) => {
				
				// get inputValue by key
				const inputValue = inputValues[inputValueKey];
				
				// create new input group from inputValue
				const inputGroup = newInputGroup(inputValueKey, inputValue);

				// add to DOM
				localContainer.insertAdjacentElement('afterbegin', htmlToElement(inputGroup));
			});
		}

		// hide/show relevant inputs
		localContainer.style.display = '';
		addLocalInputButton.style.display = '';
		remoteContainer.style.display = 'none';
	})
	
	
	// watch for remote checkbox changes
	newEventListener(remoteCheckbox, 'change', function() {
		if (settingValue.endsWith('.json')) {
			remoteInput.value = settingValue;
		}
		
		// hide/show relevant inputs
		localContainer.style.display = 'none';
		addLocalInputButton.style.display = 'none';
		remoteContainer.style.display = '';
	});

	
	// watch for new input field button
	newEventListener(addLocalInputButton, 'click', function(evt) {
		
		// prompt for category
		// By default show the first Category
		// todo show all seperated by bar?
		const categoryDefault = settingsContainer.querySelector("input[name=inputGroupTitle]");
		const inputCategory = prompt("Category", categoryDefault ? categoryDefault.value : 'New Category');
		
		// get group to append to
		const inputGroupValues = settingsContainer.querySelector(`div#${inputCategory}-inputGroupValues`);
		
		// if inputGroupValues isnt found = category doesnt exist
		// so create new category
		if (!inputGroupValues) {
			// create new input group (category)
			const inputGroup = htmlToElement(newInputGroup(inputCategory, [defaultObj]));
			
			// add new to input set to DOM
			localContainer.insertAdjacentElement('afterBegin', inputGroup);
		} else {
			// get one of the input sets (for cloning)
			const inputGroupInputSet = inputGroupValues.querySelector(`.inputSet`);
			
			// create input set (cloned)
			const inputSet = cloneInputSet(inputGroupInputSet);
			
			// add new to input set to DOM
			inputGroupValues.insertAdjacentElement('afterBegin', inputSet);
		}
	});

	// watch for form submission
	newEventListener(settingsForm, 'submit', function(evt) {
		evt.preventDefault();
	
		if (remoteCheckbox.checked) {
			
			// if remote url
			// just save the json path
			localStorage[localStorageKey] = remoteInput.value;
		} else if (localCheckbox.checked) {
			
			// get input groups
			let inputGroups = localContainer.querySelectorAll('.inputGroup');
			
			obj = {}
			inputGroups.forEach(inputGroup => {
				const title = inputGroup.querySelector('input[name=inputGroupTitle]').value;
				const values = [...inputGroup.querySelectorAll('.inputSet')].map(inputSet => {
					innerObj = {};
					inputSet.querySelectorAll('input').forEach(input => {
						if (input.name && input.value) {
							innerObj[input.name] = input.value;
						}
                    })
					return innerObj;
				});
				obj[title] = values;
			});
			
			localStorage[localStorageKey] = JSON.stringify(obj);
			
		}
	});
	
	
	// apply saved settings from localStorage
	settingValue.endsWith('.json') ? remoteCheckbox.click() : localCheckbox.click();
}

function toggleSettingsPanel() {
	const settingsPanelContainer = document.querySelector('div#settingsPanel');
	
	settingsPanelContainer.style.display = settingsPanelContainer.style.display == 'none' ? '' : 'none';
	if (settingsPanelContainer.style.display != 'none') {
		
		// remote image settings
		refreshSettingsPanelSection('div#featuredPicturesSettings', 'featured-pictures', {url: ''});
		
		// pinned site settings
		refreshSettingsPanelSection('div#pinnedSitesSettings', 'pinned-sites', {title: '', url: ''});
	}
}

// show settings panel on click
settingsPanelOpenButton.addEventListener('click', function() {
	toggleSettingsPanel();
});

// close settings panel on click
settingsPanelCloseButton.addEventListener('click', function() {
	toggleSettingsPanel();
});