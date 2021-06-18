class EdgesView {
	constructor(ocel, objectsView, eventsView) {
		this.ocel = ocel;
		this.objectsView = objectsView;
		this.eventsView = eventsView;
		this.edgesRealizationsEvents = {};
		this.edgesRealizationsObjects = {};
		this.edgesRealizationsEo = {};
		this.edgesStatistics = {};
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
				}
				this.edgesRealizationsEvents[actTuple][[ev1[0], ev2[0]]] = 0;
				this.edgesRealizationsObjects[actTuple][objId] = 0;
				this.edgesRealizationsEo[actTuple][[ev1[0], ev2[0], objId]] = 0;				
				i++;
			}
		}
	}
	
	calculateStatistics() {
		for (let actCouple in this.edgesStatistics) {
			this.edgesStatistics[actCouple]["events"] = Object.keys(this.edgesRealizationsEvents[actCouple]).length;
			this.edgesStatistics[actCouple]["objects"] = Object.keys(this.edgesRealizationsObjects[actCouple]).length;
			this.edgesStatistics[actCouple]["eo"] = Object.keys(this.edgesRealizationsEo[actCouple]).length;
		}
		console.log(this.edgesStatistics);
	}
}