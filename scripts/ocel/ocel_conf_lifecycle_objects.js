class OcelConfLifecycleObjects {
	constructor(ocel) {
		this.ocel = ocel;
		this.noiseThreshold = null;
		this.flattenedLogs = null;
		this.skeletonModels = null;
		this.skeletonConfResults = null;
	}
	
	calculate(noiseThreshold=0.05) {
		this.noiseThreshold = noiseThreshold;
		this.flattenedLogs = {};
		this.skeletonModels = {};
		this.skeletonConfResults = {};
		let objTypes = this.ocel["ocel:global-log"]["ocel:object-types"];
		for (let objType of objTypes) {
			let eventLog = OcelFlattening.flatten(this.ocel, objType);
			this.flattenedLogs[objType] = eventLog;
			let skeleton = LogSkeletonDiscovery.apply(eventLog, "concept:name");
			this.skeletonModels[objType] = skeleton;
			let skeletonConfResult = LogSkeletonConformanceChecking.apply(eventLog, skeleton, noiseThreshold).deviationsRecord;
			this.skeletonConfResults[objType] = skeletonConfResult;
		}
	}
	
	humanReadableRule(rule) {
		let ruleElements = rule.split(",");
		let ret = rule;
		if (ruleElements[0] == "alwaysBefore") {
			ret = "<b>"+ruleElements[1]+"</b> is not<br />preceded by <b>"+ruleElements[2]+"</b>";
		}
		else if (ruleElements[0] == "alwaysAfter") {
			ret = "<b>"+ruleElements[1]+"</b> is not<br />followed by <b>"+ruleElements[2]+"</b>";
		}
		else if (ruleElements[0] == "directlyFollows") {
			/*console.log(rule);
			ret = "<b>"+ruleElements[1]+"</b> is directly<br />followed by <b>"+ruleElements[2]+"</b>";
			console.log(ret);*/
		}
		else if (ruleElements[0] == "actCounter") {
			ret = "Unusual number of occurrences of the activity<br /><b>"+ruleElements[1]+"</b> ("+ruleElements[2]+")";
		}
		else if (ruleElements[0] == "equivalence") {
			ret = "<b>"+ruleElements[1]+"</b> does not occur the same<br />number of times than <b>"+ruleElements[2]+"</b>";
		}
		else if (ruleElements[0] == "neverTogether") {
			ret = "<b>"+ruleElements[1]+"</b> occurs together<br />with <b>"+ruleElements[2]+"</b>";
		}
		return ret;
	}
	
	populateTable(container) {
		let content = [];
		content.push("<thead><tr><th>Object Type</th><th>Rule</th><th>Violations</th><th>Filter</th></tr></thead>");
		content.push("<tbody>");
		for (let objType in this.skeletonConfResults) {
			for (let dev in this.skeletonConfResults[objType]) {
				content.push("<tr>");
				content.push("<td>"+objType+"</td>");
				content.push("<td>"+this.humanReadableRule(dev)+"</td>");
				content.push("<td>"+this.skeletonConfResults[objType][dev].length+"</td>");
				content.push("<td></td>");
				content.push("</tr>");
			}
		}
		content.push("</tbody>");
		content = content.join("");
		container.innerHTML = content;
		sorttable.makeSortable(container);
	}
}