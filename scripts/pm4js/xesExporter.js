class XesExporter {
	static exportLog(eventLog) {
		let xmlDoc = document.createElement("log");
		XesExporter.exportXmlObjToDom(eventLog, xmlDoc);
		const serializer = new XMLSerializer();
		const xmlStr = serializer.serializeToString(xmlDoc);
	}
	
	static exportXmlObjToDom(obj, dom) {
		for (let att in obj.attributes) {
			let attValue = obj.attributes[att];
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
			
			if (value != null) {
				let attr = document.createElement(xmlTag);
				dom.appendChild(attr);
				attr.setAttribute("key", att);
				attr.setAttribute("value", value);
			}
		}
		if (obj.hasOwnProperty("events")) {
			for (let eve of obj.events) {
				let xmlEvent = document.createElement("event");
				dom.appendChild(xmlEvent);
				XesExporter.exportXmlObjToDom(eve, xmlEvent);
			}
		}
		else if (obj.hasOwnProperty("traces")) {
			for (let trace of obj.traces) {
				let xmlTrace = document.createElement("trace");
				dom.appendChild(xmlTrace);
				XesExporter.exportXmlObjToDom(trace, xmlTrace);
			}
		}
	}
}