class EventsListFactory {
	constructor(model) {
		this.model = model;
	}
	
	buildEventsTable(container, events=null, enable_click=true, target_obj=null, currStart=0, currEnd=1000000) {
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
		let logEvents = this.model.ocel["ocel:events"];
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
		let eventsHtmlRepr = [];
		let eventKeys = Object.keys(events).sort();
		let i = currStart;
		while (i <= currEnd) {
			let eveId = eventKeys[i];
			let eve = logEvents[eveId];
			eventsHtmlRepr.push("<tr>");
			eventsHtmlRepr.push("<td>"+eveId+"</td>");
			eventsHtmlRepr.push("<td>"+eve["ocel:activity"]+"</td>");
			eventsHtmlRepr.push("<td>"+eve["ocel:timestamp"]+"</td>");			
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
				eventsHtmlRepr.push("<td><ul>");
				for (let obj of omap_dictio[otype]) {
					eventsHtmlRepr.push("<li>");
					if (enable_click) {
						eventsHtmlRepr.push("<a href=\"javascript:clickedObjectInEveTable('"+obj+"')\">"+obj+"</a>");
					}
					else {
						if (obj == target_obj) {
							eventsHtmlRepr.push("<b>"+obj+"</b>");
						}
						else {
							eventsHtmlRepr.push(obj);
						}
					}
					eventsHtmlRepr.push("</li>");
				}
				eventsHtmlRepr.push("</ul></td>");
			}
			for (let att of attributes) {
				if (att in vmap) {
					eventsHtmlRepr.push("<td>"+vmap[att]+"</td>");
				}
				else {
					eventsHtmlRepr.push("<td></td>");
				}
			}
			eventsHtmlRepr.push("</tr>");
			i++;
		}
		tbody.innerHTML = eventsHtmlRepr.join("");
		//sorttable.makeSortable(container);
	}
}