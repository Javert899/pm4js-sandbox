class XesParser {
	static parse(xmlString) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlLog = xmlDoc.getElementsByTagName("log")[0];
		console.log(xmlLog);
		let eventLog = new EventLog();
		XesParser.parseXmlObj(xmlLog, eventLog);
		return eventLog;
	}
	
	static parseXmlObj(xmlObj, target) {
		for (let child of xmlObj.children) {
			if (child.tagName == "string") {
				target.attributes[child.getAttribute("key")] = child.getAttribute("value");
			}
			else if (child.tagName == "date") {
				target.attributes[child.getAttribute("key")] = new Date(child.getAttribute("value"));
			}
			else if (child.tagName == "event") {
				let eve = new Event();
				target.events.push(eve);
				XesParser.parseXmlObj(child, eve);
			}
			else if (child.tagName == "trace") {
				let trace = new Trace();
				target.traces.push(trace);
				XesParser.parseXmlObj(child, trace);
			}
		}
		console.log(target.attributes);
	}
}