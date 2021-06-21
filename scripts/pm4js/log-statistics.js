class LogStatistics {
	static getStartActivities(log, activity_key="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let act = trace.events[0].attributes[activity_key].value;
				let count = ret[act]
				if (count == null) {
					ret[act] = 1;
				}
				else {
					ret[act] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getEndActivities(log, activity_key="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let act = trace.events[trace.events.length-1].attributes[activity_key].value;
				let count = ret[act]
				if (count == null) {
					ret[act] = 1;
				}
				else {
					ret[act] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getAttributeValues(log, attribute_key) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				let val = eve.attributes[attribute_key].value;
				let count = ret[val];
				if (count == null) {
					ret[val] = 1;
				}
				else {
					ret[val] = count + 1;
				}
			}
		}
		return ret;
	}
}