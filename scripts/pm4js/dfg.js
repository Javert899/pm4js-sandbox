class Dfg {
	constructor(eventLog) {
		this.eventLog = eventLog;
		this.frequencyDfg = {};
		this.performanceDfg = {};
	}
	
	calculateFrequencyDfg(activity_key="concept:name") {
		let length = 0;
		let i = 0;
		let dfg = this.frequencyDfg;
		for (let trace of this.eventLog.traces) {
			length = trace.events.length;
			i = 0;
			while (i < length-1) {
				let tup = [trace.events[i].attributes[activity_key].value,trace.events[i+1].attributes[activity_key].value];
				let count = dfg[tup];
				if (count == null) {
					dfg[tup] = 1;
				}
				else {
					dfg[tup] = count + 1;
				}
				i = i + 1;
			}				
		}
		return dfg;
	}
	
	calculatePerformanceDfg(activity_key="concept:name", timestamp_key="time:timestamp") {
		let length = 0;
		let i = 0;
		let dfg = this.performanceDfg;
		for (let trace of this.eventLog.traces) {
			length = trace.events.length;
			i = 0;
			while (i < length-1) {
				let tup = [trace.events[i].attributes[activity_key].value,trace.events[i+1].attributes[activity_key].value];
				let perfDiff = (trace.events[i+1].attributes[timestamp_key].value.getTime() - trace.events[i].attributes[timestamp_key].value.getTime())/1000.0;
				let arr = dfg[tup];
				if (arr == null) {
					dfg[tup] = [perfDiff, 1];
				}
				else {
					arr[0] = arr[0] + perfDiff;
					arr[1] = arr[1] + 1;
					dfg[tup] = arr;
				}
				i = i + 1;
			}
		}
		for (let tup in dfg) {
			let val = dfg[tup];
			dfg[tup] = val[0]/val[1];
		}
		return dfg;
	}
}