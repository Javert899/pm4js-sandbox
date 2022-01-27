function filterMinOccurrencesActivity0() {
	let minEvents = parseInt(prompt("Insert the minimum number of occurrences for an activity to be kept"));
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterMinOccActivities(visualization.model.ocel, minEvents));
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

function filterEssentialEventsOrMinOccurrencesActivity0() {
	let minEvents = parseInt(prompt("Insert the minimum number of occurrences for an activity to be kept"));
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterEssentialEventsOrMinActCount(visualization.model.ocel, minEvents));
	visualization.setFilteredModel(filteredModel);
}

function filterEssentialEventsOrMinOccurrencesActivity() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Essential Events OR Min Occurrences Activity&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "filterEssentialEventsOrMinOccurrencesActivity0()");
}

function filterOtMinNumRelatedEvents0() {
	let minRelObj = parseInt(prompt("Insert the minimum number of events having relations to a specific object type, in order to keep the object type"));
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterOtMinNumRelatedEvents(visualization.model.ocel, minRelObj));
	visualization.setFilteredModel(filteredModel);
}

function filterOtMinNumRelatedEvents() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Min Events per OT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "filterOtMinNumRelatedEvents0()");
}

function filterRateUniqueActivities0() {
	let minRate = parseFloat(prompt("Insert the minimum rate of unique activities per objects of the given object type"));
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterOtRateUniqueActivities(visualization.model.ocel, minRate));
	visualization.setFilteredModel(filteredModel);
}

function filterRateUniqueActivities() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Unique Activities&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "filterRateUniqueActivities0()");
}
