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

function filterOtMinNumRelatedObjects0() {
	let minRelObj = parseInt(prompt("Insert the minimum number of objects belonging to an object type, in order to keep the object type"));
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterOtMinNumRelatedObjects(visualization.model.ocel, minRelObj));
	visualization.setFilteredModel(filteredModel);
}

function filterOtMinNumRelatedObjects() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Min Objects per OT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "filterOtMinNumRelatedObjects0()");
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

function sampleEventLogFiltering0() {
	let graph = OcelConnectedComponents.findConnCompEvIds(visualization.model.ocel);
	let lengths = [];
	for (let k in graph) {
		lengths.push([k, graph[k].length]);
	}
	lengths.sort(function(a,b) {
		return b[1] - a[1];
	});
	console.log(lengths);
	//let filteredModel = new OcdfgModel(OcelGeneralFiltering.sampleEventLog(visualization.model.ocel, graph));
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.filterConnComp(visualization.model.ocel, graph, lengths[0][0]))
	visualization.setFilteredModel(filteredModel);
}

function sampleEventLogFiltering() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Sample Event Log (connected components)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "sampleEventLogFiltering0()");
}

function randomSampleEvents0() {
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.eventBasedRandomSampling(visualization.model.ocel));
	visualization.setFilteredModel(filteredModel);
}

function randomSampleEvents() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Sample Event Log (random events)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "randomSampleEvents0()");
}

function randomSampleObjects0() {
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.objectBasedRandomSampling(visualization.model.ocel));
	visualization.setFilteredModel(filteredModel);
}

function randomSampleObjects() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Sample Event Log (random objects)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "randomSampleObjects0()");
}

function randomSampleObjectTypes0() {
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.objectTypeBasedRandomSampling(visualization.model.ocel));
	visualization.setFilteredModel(filteredModel);
}

function randomSampleObjectTypes() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Sample Event Log (random object types)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "randomSampleObjectTypes0()");
}

function actOtAutomaticFiltering0() {
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.objectTypeBasedRandomSampling(visualization.model.ocel));
	visualization.setFilteredModel(filteredModel);
}

function actOtAutomaticFiltering() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Activity-OT Filter (automatic)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "actOtAutomaticFiltering0()");
}

function anomalousObjectsFiltering0() {
	let quantile = parseFloat(prompt("Insert the quantile of anomalous objects"));
	calculateObjectFeatures();
	let combo = identifyAnomalousObjects(visualization.model.ocel);
	let idx = Math.floor(combo.length * quantile);
	let relObjIds = [];
	while (idx < combo.length) {
		relObjIds.push(combo[idx][0]);
		idx = idx + 1;
	}
	let filteredModel = new OcdfgModel(OcelGeneralFiltering.projectOnArrayObjects(visualization.model.ocel, relObjIds));
	visualization.setFilteredModel(filteredModel);
}

function anomalousObjectsFiltering() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Anomalous Objects Filtering&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "anomalousObjectsFiltering0()");
}

function fillTableAdvancedFiltering() {
	let ocel = visualization.model.ocel;
	let parentOcel = visualization.model.parentOcel;
	
	let parentActivities = Object.keys(GeneralOcelStatistics.eventsPerActivityCount(parentOcel));
	let parentStat = GeneralOcelStatistics.eventsPerTypePerActivity(parentOcel);
	let parentOtypes = Object.keys(parentStat);
	let activities = Object.keys(GeneralOcelStatistics.eventsPerActivityCount(ocel));
	let stat = GeneralOcelStatistics.eventsPerTypePerActivity(ocel);
	let otypes = Object.keys(stat);
	
	fillTableAdvancedFiltering1(parentActivities, parentStat, parentOtypes, activities, stat, otypes);
}

function fillTableAdvancedFiltering1(parentActivities, parentStat, parentOtypes, activities, stat, otypes) {
	let table = document.createElement("table");
	let thead = document.createElement("thead");
	let tbody = document.createElement("tbody");
	table.appendChild(thead);
	table.appendChild(tbody);
	let trHead = document.createElement("tr");
	trHead.style = "border-top: 1pt solid black; border-bottom: 1pt solid black";
	thead.appendChild(trHead);
	let trHead2 = document.createElement("tr");
	trHead2.style = "border-bottom: 1pt solid black";
	thead.appendChild(trHead2);
	let tdTopLeft = document.createElement("th");
	trHead.appendChild(tdTopLeft);
	let tdTopLeft2 = document.createElement("th");
	trHead.appendChild(tdTopLeft2);
	let tdTopLeft3 = document.createElement("th");
	trHead2.appendChild(tdTopLeft3);
	let tdTopLeft4 = document.createElement("th");
	trHead2.appendChild(tdTopLeft4);
	for (let ot of parentOtypes) {
		let td = document.createElement("th");
		trHead.appendChild(td);
		td.innerHTML = ot;
	}
	for (let ot of parentOtypes) {
		let td = document.createElement("th");
		td.style="text-align: center";
		trHead2.appendChild(td);
		let tdSpan = document.createElement("span");
		td.appendChild(tdSpan);
		let checkb = document.createElement("input");
		checkb.type = "checkbox";
		checkb.id = "enablerot&&&&&"+ot.replace(/[^0-9a-z]/gi);
		checkb.name = "enablerot&&&&&"+ot;
		checkb.style = "transform: scale(1.25)";
		checkb.classList.add("enablerot");
		checkb.checked = otypes.includes(ot);
		checkb.addEventListener("click", function() {
			for (let otherCheckb of document.getElementsByClassName("actOtSelectionCheckboxOt"+ot.replace(/[^0-9a-z]/gi, ''))) {
				if (!(checkb.checked)) {
					otherCheckb.disabled = true;
				}
				else {
					let act = otherCheckb.getAttribute("activity");
					otherCheckb.disabled = (!(act in parentStat[ot])) || (!(document.getElementById("enableract&&&&&"+(act.replace(/[^0-9a-z]/gi))).checked));
				}
			}
		});
		tdSpan.appendChild(checkb);
		tdSpan.appendChild(document.createElement("tr"));
	}
	for (let act of parentActivities) {
		let tr = document.createElement("tr");
		tbody.appendChild(tr);
		let tdActName = document.createElement("td");
		tdActName.style = "border-left: 1pt solid black";
		tr.appendChild(tdActName);
		tdActName.innerHTML = act;
		let tdActCheckbox = document.createElement("td");
		tdActCheckbox.style = "border-left: 1pt solid black; border-right: 1pt solid black";
		tr.appendChild(tdActCheckbox);
		let tdActCheckboxSpan = document.createElement("span");
		tdActCheckbox.appendChild(tdActCheckboxSpan);
		let checkbAct = document.createElement("input");
		tdActCheckboxSpan.appendChild(checkbAct);
		checkbAct.type = "checkbox";
		checkbAct.name = "enableract&&&&&"+act;
		checkbAct.id = "enableract&&&&&"+act.replace(/[^0-9a-z]/gi);
		checkbAct.style = "transform: scale(1.25)";
		checkbAct.classList.add("enableract");
		checkbAct.checked = activities.includes(act);
		checkbAct.addEventListener("click", function() {
			for (let otherCheckb of document.getElementsByClassName("actOtSelectionCheckboxAct"+act.replace(/[^0-9a-z]/gi, ''))) {
				if (!(checkbAct.checked)) {
					otherCheckb.disabled = true;
				}
				else {
					let ot = otherCheckb.getAttribute("objecttype");
					otherCheckb.disabled = (!(act in parentStat[ot])) || (!(document.getElementById("enablerot&&&&&"+(ot.replace(/[^0-9a-z]/gi))).checked));
				}
			}
		});
		let tdActCheckboxSpan2 = document.createElement("span");
		tdActCheckboxSpan.appendChild(tdActCheckboxSpan2);
		tdActCheckboxSpan2.innerHTML = "&nbsp;&nbsp;";
		for (let ot of parentOtypes) {
			let td = document.createElement("td");
			td.style="text-align: center";
			tr.appendChild(td);
			let span = document.createElement("span");
			
			let checkb = document.createElement("input");
			checkb.type = "checkbox";
			checkb.name = act+"@#@#@#"+ot;
			checkb.value = act+"@#@#@#"+ot;
			checkb.classList.add("actOtSelectionCheckbox");
			let actClass = "actOtSelectionCheckboxAct"+act.replace(/[^0-9a-z]/gi, '');
			let otClass = "actOtSelectionCheckboxOt"+ot.replace(/[^0-9a-z]/gi, '');
			checkb.classList.add(actClass);
			checkb.classList.add(otClass);
			checkb.setAttribute("activity", act);
			checkb.setAttribute("objecttype", ot);
			if (act in parentStat[ot]) {
				if (ot in stat && act in stat[ot]) {
					checkb.checked = true;
				}
				else if (!(act in activities)) {
					checkb.disabled = true;
				}
			}
			else {
				checkb.disabled = true;
			}
			span.appendChild(checkb);
			td.appendChild(span);
		}
	}
	document.getElementById("actOtFilterContainer").innerHTML = "";
	document.getElementById("actOtFilterContainer").appendChild(table);
}


function actOtApplyFilterFromTable() {
	let actOtDct = {};
	for (let el of document.getElementsByClassName("actOtSelectionCheckbox")) {
		let name = el.name;
		let isChecked = el.checked;
		let isEnabled = !el.disabled;
		let ot = name.split("@#@#@#")[1];
		let act = name.split("@#@#@#")[0];
		if (isChecked && isEnabled) {
			if (!(act in actOtDct)) {
				actOtDct[act] = [];
			}
			actOtDct[act].push(ot);
		}
	}
	let filteredOcel = OcelGeneralFiltering.filterActivityOtAssociation(visualization.model.parentOcel, actOtDct);
	let filteredModel = new OcdfgModel(filteredOcel);
	filteredModel.parentOcel = visualization.model.parentOcel;
	visualization.setFilteredModel(filteredModel);
}

function actOtApplyFilterFromTable0() {
	showProcessModelPage();
	return addFilter("<i class=\"fas fa-user-minus\"></i>&nbsp;Activity-OT Filter&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", "actOtApplyFilterFromTable()");
}

function showActOtFilterContainer() {
	let container = document.getElementById("actOtFilterContainer0");
	if (container.style.display == "none") {
		container.style.display = "";
	}
	else {
		container.style.display = "none";
	}
}