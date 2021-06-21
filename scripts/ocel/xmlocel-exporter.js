class XmlOcelExporter {
	static exportLog(ocel) {
		let xmlDocument = document.createElement("log");
		let globalLog = document.createElement("global");
		globalLog.setAttribute("scope", "log");
		let globalObject = document.createElement("global");
		globalObject.setAttribute("scope", "object");
		let globalEvent = document.createElement("global");
		globalEvent.setAttribute("scope", "event");
		let events = document.createElement("events");
		let objects = document.createElement("objects");
		xmlDocument.appendChild(globalLog);
		xmlDocument.appendChild(globalObject);
		xmlDocument.appendChild(globalEvent);
		xmlDocument.appendChild(events);
		xmlDocument.appendChild(objects);
		
		XmlOcelExporter.exportEvents(ocel, events);
		
		const serializer = new XMLSerializer();
		const xmlStr = serializer.serializeToString(xmlDocument);
		return xmlStr;
	}
	
	static exportEvents(ocel, xmlEvents) {
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let xmlEvent = document.createElement("event");
			xmlEvents.appendChild(xmlEvent);
			let eveId = document.createElement("string");
			eveId.setAttribute("key", "id");
			eveId.setAttribute("value", evId);
			xmlEvent.appendChild(eveId);
			let eveActivity = document.createElement("string");
			eveActivity.setAttribute("key", "activity");
			eveActivity.setAttribute("value", eve["ocel:activity"]);
			xmlEvent.appendChild(eveActivity);
			let eveTimestamp = document.createElement("date");
			eveTimestamp.setAttribute("key", "timestamp");
			eveTimestamp.setAttribute("value", eve["ocel:timestamp"]);
			xmlEvent.appendChild(eveTimestamp);
			let xmlOmap = document.createElement("list");
			xmlOmap.setAttribute("key", "omap");
			xmlEvent.appendChild(xmlOmap);
			for (let relObj of eve["ocel:omap"]) {
				let xmlObj = document.createElement("string");
				xmlObj.setAttribute("key", "object-id");
				xmlObj.setAttribute("value", relObj);
				xmlOmap.appendChild(xmlObj);
			}
			let xmlVmap = document.createElement("list");
			xmlVmap.setAttribute("key", "vmap");
			xmlEvent.appendChild(xmlVmap);
			for (let att in eve["ocel:vmap"]) {
				XmlOcelExporter.exportAttribute(att, eve["ocel:vmap"][att], xmlEvent);
			}
		}
	}
	
	static exportObjects(ocel, xmlObjects) {
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			let xmlObj = document.createElement(obj);
		}
	}
	
	static exportGlobalLog(ocel, globalLog) {
	
	}
	
	static exportGlobalEvent(ocel, globalEvent) {
	
	}
	
	static exportGlobalObject(ocel, globalObject) {
	
	}
	
	static exportAttribute(attName, attValue, parentObj) {
		let xmlTag = null;
		let value = null;
			if (typeof attValue == "string") {
				xmlTag = "string";
				value = attValue;
			}
			else if (typeof attValue == "object") {
				xmlTag = "date";
				value = attValue.toISOString();
			}
			else if (typeof attValue == "number") {
				xmlTag = "float";
				value = ""+attValue;
			}
			
			if (value != null) {
				let thisAttribute = document.createElement(xmlTag);
				thisAttribute.setAttribute("key", attName);
				thisAttribute.setAttribute("value", value);
				parentObj.appendChild(thisAttribute);
			}
	}
}