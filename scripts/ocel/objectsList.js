class ObjectsListFactory {
	constructor(model) {
		this.model = model;
	}
	
	buildObjectsTable(container, targetOt) {
		container.innerHTML = "";
		let otObjects = this.model.otObjectsView[targetOt].objectsIdsSorted;
		let thead = document.createElement("thead");
		let tbody = document.createElement("tbody");
		container.appendChild(thead);
		container.appendChild(tbody);
		let header = document.createElement("tr");
		thead.appendChild(header);
		let tdId = document.createElement("th");
		tdId.innerHTML = "Id";
		header.appendChild(tdId);
		let tdStartTimestamp = document.createElement("th");
		tdStartTimestamp.innerHTML = "Start Timestamp";
		header.appendChild(tdStartTimestamp);
		let tdEndTimestamp = document.createElement("th");
		tdEndTimestamp.innerHTML = "Complete Timestamp";
		header.appendChild(tdEndTimestamp);
		let tdDuration = document.createElement("th");
		tdDuration.innerHTML = "Lifecycle Duration (s)";
		header.appendChild(tdDuration);
		/*let tdExecutionDuration = document.createElement("th");
		tdExecutionDuration.innerHTML = "Execution Duration (s)";
		header.appendChild(tdExecutionDuration);
		let tdShowExecution = document.createElement("th");
		tdShowExecution.innerHTML = "";
		header.appendChild(tdShowExecution);*/
		let objectsHtmlRepr = [];
		for (let objId in otObjects) {
			if (otObjects[objId].length > 0) {
				objectsHtmlRepr.push("<tr>");
				objectsHtmlRepr.push("<td><a href=\"javascript:clickedObjectInEveTable('"+objId+"')\">"+objId+"</a></td>");
				objectsHtmlRepr.push("<td>"+new Date(otObjects[objId][0][2]*1000).toISOString()+"</td>");
				objectsHtmlRepr.push("<td>"+new Date(otObjects[objId][otObjects[objId].length - 1][2]*1000).toISOString()+"</td>");
				objectsHtmlRepr.push("<td>"+(otObjects[objId][otObjects[objId].length - 1][2] - otObjects[objId][0][2])+"</td>");
				/*try {
					objectsHtmlRepr.push("<td>"+this.model.executions[3][objId]+"</td>");
				}
				catch (err) {
					console.log(err);
					objectsHtmlRepr.push("<td>"+(otObjects[objId][otObjects[objId].length - 1][2] - otObjects[objId][0][2])+"</td>");
				}
				objectsHtmlRepr.push("<td><a href=\"javascript:showGraphvizExecutionObject('"+objId+"')\"><i class=\"fas fa-eye\"></i></a></td>");*/
				objectsHtmlRepr.push("</tr>");
			}
		}
		tbody.innerHTML = objectsHtmlRepr.join("");
		
		sorttable.makeSortable(container);
	}
}