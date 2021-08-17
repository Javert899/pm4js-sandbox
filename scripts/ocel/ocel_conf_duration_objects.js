class OcelConfDurationObjects {
	constructor(model) {
		this.model = model;
		this.zeta = null;
		this.avgDurations = null;
		this.stdDurations = null;
		this.deviations = null;
	}
	
	calculate(zeta=1.0) {
		this.zeta = zeta;
		this.avgDurations = {};
		this.stdDurations = {};
		this.deviations = {};
		let objTypes = this.model.ocel["ocel:global-log"]["ocel:object-types"];
		for (let objType of objTypes) {
			let otObjects = this.model.otObjectsView[objType].objectsIdsSorted;
			let durations = {};
			let durationArray = [];
			let summ = 0.0;
			for (let objId in otObjects) {
				if (otObjects[objId].length > 0) {
					let objDuration = otObjects[objId][otObjects[objId].length - 1][2] - otObjects[objId][0][2];
					durations[objId] = objDuration;
					durationArray.push(objDuration);
					summ += objDuration;
				}
			}
			if (durationArray.length > 0) {
				let avg = summ / (0.0 + durationArray.length);
				let stdev = 0.0;
				let i = 0;
				while (i < durationArray.length) {
					stdev += (durationArray[i] - avg) * (durationArray[i] - avg);
					i++;
				}
				stdev = stdev / (0.0 + durationArray.length);
				stdev = Math.sqrt(stdev);
				this.avgDurations[objType] = avg;
				this.stdDurations[objType] = stdev;
				for (let obj in durations) {
					let duration = durations[obj];
					if (duration < avg - zeta * stdev || duration > avg + zeta * stdev) {
						if (!(objType in this.deviations)) {
							this.deviations[objType] = {};
						}
						this.deviations[objType][obj] = duration;
					}
				}
			}
		}
	}
	
	populateTable(container) {
		let content = [];
		content.push("<thead><tr><th>Object Type</th><th>Avg Lifecycle Dur.(s)</th><th>Stdev Lifecycle Dur.(s)</th><th>Number of Deviations</th><th>Filter</th></tr></thead>");
		content.push("<tbody>");
		for (let objType in this.deviations) {
			content.push("<tr>");
			content.push("<td>"+objType+"</td>");
			content.push("<td>"+this.avgDurations[objType]+"</td>");
			content.push("<td>"+this.stdDurations[objType]+"</td>");
			content.push("<td>"+Object.keys(this.deviations[objType]).length+"</td>");
			content.push("<td><a href=\"javascript:filterDeviationsDurationObjects('"+objType+"')\"><i class=\"fas fa-filter\"></i></a></td>");
			content.push("</tr>");
		}
		content.push("</tbody>");
		container.innerHTML = content.join("");
		sorttable.makeSortable(container);
	}
}