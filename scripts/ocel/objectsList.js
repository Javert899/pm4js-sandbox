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
		for (let objId in otObjects) {
			if (otObjects[objId].length > 0) {
				let tr = document.createElement("tr");
				tbody.appendChild(tr);
				let tdId = document.createElement("td");
				tr.appendChild(tdId);
				tdId.innerHTML = "<a href=\"javascript:clickedObjectInEveTable('"+objId+"')\">"+objId+"</a>";;
				let tdStartTimestamp = document.createElement("td");
				tr.appendChild(tdStartTimestamp);
				tdStartTimestamp.innerHTML = new Date(otObjects[objId][0][2]*1000).toISOString();
				let tdEndTimestamp = document.createElement("td");
				tr.appendChild(tdEndTimestamp);
				tdEndTimestamp.innerHTML = new Date(otObjects[objId][otObjects[objId].length - 1][2]*1000).toISOString();
				let tdDuration = document.createElement("td");
				tdDuration.innerHTML = otObjects[objId][otObjects[objId].length - 1][2] - otObjects[objId][0][2];
				tr.appendChild(tdDuration);
			}
		}
		sorttable.makeSortable(container);
	}
}