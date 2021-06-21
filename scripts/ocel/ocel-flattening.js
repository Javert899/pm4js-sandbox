class OcelFlattening {
	static flatten(ocel, objType) {
		let log = new EventLog();
		let objTraces = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			for (let objId of eve["ocel:omap"]) {
				let obj = ocel["ocel:objects"][objId];
				//console.log(obj["ocel:type"]);
				if (obj["ocel:type"] == objType) {
					let trace = null;
					if (!(objId in objTraces)) {
						trace = new Trace();
						trace.attributes["concept:name"] = objId;
						log.traces.push(trace);
						objTraces[objId] = trace;
					}
					else {
						trace = objTraces[objId];
					}
					let xesEve = new Event();
					trace.events.push(xesEve);
					xesEve["concept:name"] = eve["ocel:activity"];
					xesEve["time:timestamp"] = eve["ocel:timestamp"];
					for (let attr in eve["ocel:vmap"]) {
						xesEve[attr] = eve["ocel:vmap"][attr];
					}
				}
			}
		}
		return log;
	}
}