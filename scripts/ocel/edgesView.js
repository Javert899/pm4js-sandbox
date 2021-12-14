class EdgesView {
	constructor(ocel, objectsView, eventsView) {
		this.ocel = ocel;
		this.objectsView = objectsView;
		this.eventsView = eventsView;
		this.edgesRealizationsEvents = {};
		this.edgesRealizationsObjects = {};
		this.edgesRealizationsEo = {};
		this.edgesStatistics = {};
		this.edgesPerformance = [];
		this.findEdges();
		this.calculateStatistics();
	}
	
	findEdges() {
		for (let objId in this.objectsView.objectsIdsSorted) {
			let evs = this.objectsView.objectsIdsSorted[objId];
			let i = 0;
			while (i < evs.length - 1) {
				let ev1 = evs[i];
				let ev2 = evs[i+1];
				let actTuple = [ev1[1], ev2[1]];
				if (!(actTuple in this.edgesRealizationsEvents)) {
					this.edgesRealizationsEvents[actTuple] = {};
					this.edgesRealizationsObjects[actTuple] = {};
					this.edgesRealizationsEo[actTuple] = {};
					this.edgesStatistics[actTuple] = {};
					this.edgesPerformance[actTuple] = [];
				}
				this.edgesRealizationsEvents[actTuple][[ev1[0], ev2[0]]] = 0;
				this.edgesRealizationsObjects[actTuple][objId] = 0;
				this.edgesRealizationsEo[actTuple][[ev1[0], ev2[0], objId]] = 0;
				this.edgesPerformance[actTuple].push(ev2[2] - ev1[2]);
				i++;
			}
		}
	}
	
	calculateAvg(vect) {
		if (vect.length > 0) {
			let sum = 0;
			for (let elem of vect) {
				sum += elem;
			}
			return sum / vect.length;
		}
		return 0;
	}
	
	calculateMedian(vect) {
		if (vect.length > 0) {
			return vect[Math.floor(vect.length) / 2];
		}
		return 0;
	}
	
	calculateStatistics() {
		for (let actCouple in this.edgesStatistics) {
			this.edgesStatistics[actCouple]["events"] = Object.keys(this.edgesRealizationsEvents[actCouple]).length;
			this.edgesStatistics[actCouple]["unique_objects"] = Object.keys(this.edgesRealizationsObjects[actCouple]).length;
			this.edgesStatistics[actCouple]["total_objects"] = Object.keys(this.edgesRealizationsEo[actCouple]).length;
			this.edgesStatistics[actCouple]["perc_source"] = (100.0 * this.edgesStatistics[actCouple]["unique_objects"]) / (this.eventsView.activitiesCounters[actCouple.split(",")[0]]["unique_objects"]);
			this.edgesStatistics[actCouple]["perc_target"] = (100.0 * this.edgesStatistics[actCouple]["unique_objects"]) / (this.eventsView.activitiesCounters[actCouple.split(",")[1]]["unique_objects"]);
			this.edgesPerformance[actCouple] = this.edgesPerformance[actCouple].sort(function (a, b) { return b - a; }); 
			this.edgesStatistics[actCouple]["avg_performance"] = this.calculateAvg(this.edgesPerformance[actCouple]);
			this.edgesStatistics[actCouple]["median_performance"] = this.calculateMedian(this.edgesPerformance[actCouple]);
		}
	}
	
	satisfy(actCouple, idx, count) {
		return this.getValue(actCouple, idx) >= count;
	}
	
	getValue(actCouple, idx) {
		if (idx == 0) {
			return this.edgesStatistics[actCouple]["events"];
		}
		else if (idx == 1) {
			return this.edgesStatistics[actCouple]["unique_objects"];
		}
		else if (idx == 2) {
			return this.edgesStatistics[actCouple]["total_objects"];
		}
		return 0;
	}
	
	toReducedString(actCouple, idx) {
		if (idx == 0) {
			return "EC="+this.edgesStatistics[actCouple]["events"];
		}
		else if (idx == 1) {
			return "UO="+this.edgesStatistics[actCouple]["unique_objects"];
		}
		else if (idx == 2) {
			return "TO="+this.edgesStatistics[actCouple]["total_objects"];
		}
		return "";
	}
	
	toIntermediateString(actCouple, idx) {
		let ret = "EC="+this.edgesStatistics[actCouple]["events"]+"<br />";
		ret += "UO="+this.edgesStatistics[actCouple]["unique_objects"]+"<br />";
		ret += "TO="+this.edgesStatistics[actCouple]["total_objects"];
		return ret;
	}
	
	toCompleteString(actCouple) {
		let ret = "<b>"+actCouple.split(",")[0]+"->"+actCouple.split(",")[1]+"<br />";
		ret += "(" + this.objectsView.objectType+")</b><br /><br />";
		ret += "event couples = "+this.edgesStatistics[actCouple]["events"]+"<br />";
		ret += "unique objects = "+this.edgesStatistics[actCouple]["unique_objects"]+"<br />";
		ret += "total objects = "+this.edgesStatistics[actCouple]["total_objects"]+"<br />";
		ret += "perc source = "+this.edgesStatistics[actCouple]["perc_source"]+"<br />";
		ret += "perc target = "+this.edgesStatistics[actCouple]["perc_target"]+"<br />";
		ret += "avg performance = "+this.edgesStatistics[actCouple]["avg_performance"]+" s<br />";
		ret += "median performance = "+this.edgesStatistics[actCouple]["median_performance"]+" s<br />";
		return ret;
	}
	
	getRelObjEdge(actCouple) {
		return Object.keys(this.edgesRealizationsObjects[actCouple]);
	}
}