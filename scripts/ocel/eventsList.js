class EventsListFactory {
	constructor(model) {
		this.model = model;
	}
	
	buildEventsTable(container, events=null, enable_click=true) {
		container.innerHTML = "";
		let otypes = this.model.ocel["ocel:global-log"]["ocel:object-types"];
		let attributes = this.model.ocel["ocel:global-log"]["ocel:attribute-names"];
		let thead = document.createElement("thead");
		let tbody = document.createElement("tbody");
		container.appendChild(thead);
		container.appendChild(tbody);
		if (events == null) {
			events = this.model.ocel["ocel:events"];
		}
		let objects = this.model.ocel["ocel:objects"];
		let header = document.createElement("tr");
		thead.appendChild(header);
		let evId = document.createElement("th");
		evId.innerHTML = "ID";
		evId.style.color = "red";
		header.appendChild(evId);
		let evAct = document.createElement("th");
		evAct.innerHTML = "Activity";
		evAct.style.color = "red";
		header.appendChild(evAct);
		let evTimest = document.createElement("th");
		evTimest.innerHTML = "Timestamp";
		evTimest.style.color = "red";
		header.appendChild(evTimest);
		for (let otype of otypes) {
			let evOtype = document.createElement("th");
			evOtype.innerHTML = otype;
			evOtype.style.color = "orange";
			header.appendChild(evOtype);
		}
		for (let att of attributes) {
			let evAttributes = document.createElement("th");
			evAttributes.innerHTML = att;
			evAttributes.style.color = "green";
			header.appendChild(evAttributes);
		}
		for (let eveId in events) {
			let evTr = document.createElement("tr");
			tbody.appendChild(evTr);
			let eve = events[eveId];
			let evId = document.createElement("td");
			evId.innerHTML = eveId;
			evTr.appendChild(evId);
			let evAct = document.createElement("td");
			evAct.innerHTML = eve["ocel:activity"];
			evTr.appendChild(evAct);
			let evTimest = document.createElement("td");
			evTimest.innerHTML = eve["ocel:timestamp"];
			evTr.appendChild(evTimest);
			let vmap = eve["ocel:vmap"];
			let omap = eve["ocel:omap"];
			let omap_dictio = {};
			for (let otype of otypes) {
				omap_dictio[otype] = [];
			}
			for (let obj of omap) {
				let thisObjType = objects[obj]["ocel:type"];
				if (thisObjType in omap_dictio) {
					omap_dictio[thisObjType].push(obj);
				}
			}
			for (let otype of otypes) {
				let tdOtype = document.createElement("td");
				evTr.appendChild(tdOtype);
				let tdUl = document.createElement("ul");
				tdOtype.appendChild(tdUl);
				for (let obj of omap_dictio[otype]) {
					let tdLi = document.createElement("li");
					tdUl.appendChild(tdLi);
					if (enable_click) {
						tdLi.innerHTML = "<a href=\"javascript:clickedObjectInEveTable('"+obj+"')\">"+obj+"</a>";
					}
					else {
						tdLi.innerHTML = obj;
					}
					
				}
			}
			for (let att of attributes) {
				let tdAtt = document.createElement("td");
				evTr.appendChild(tdAtt);
				if (att in vmap) {
					tdAtt.innerHTML = vmap[att];
				}
			}
		}
		sorttable.makeSortable(container);
	}
}