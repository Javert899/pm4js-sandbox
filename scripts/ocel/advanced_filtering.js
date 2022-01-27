function filterMinOccurrencesActivity0() {
	let minEvents = parseInt(prompt("Insert the minimum number of occurrences for an activity to be kept"));
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterOtMinOccActivities(visualization.model.ocel, minEvents));
	visualization.setFilteredModel(filteredModel);
}

function filterMinOccurrencesActivity() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Min Occurrences Activity&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "filterMinOccurrencesActivity0()");
}

function filterEssentialEvents0() {
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterEssentialEvents(visualization.model.ocel));
	visualization.setFilteredModel(filteredModel);
}

function filterEssentialEvents() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Essential Events&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "filterEssentialEvents0()");
}

