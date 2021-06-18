class EventsView {
	constructor(ocel) {
		this.ocel = ocel;
		this.eventsIds = {};
		this.activities = {};
		this.activitiesCounters = {};
	}
	
	addEvent(evId) {
		let eve = this.ocel["ocel:events"][evId];
		let evAct = eve["ocel:activity"];
		this.eventsIds[evId] = 0;
		if (!(evAct in this.activities)) {
			this.activities[evAct] = {}
			this.activitiesCounters[evAct] = {};
		}
		this.activities[evAct][evId] = 0;
	}
	
	calculate() {
		this.calculateActivityNumEvents();
		this.calculateActivityNumUniqueObjects();
		this.calculateActivityNumTotalObjects();
		this.calculateActivityMinMaxRelatedObjects();
	}
	
	calculateActivityNumEvents() {
		for (let act in this.activities) {
			let count = Object.keys(this.activities[act]).length;
			this.activitiesCounters[act]["events"] = count;
		}
	}
	
	calculateActivityNumUniqueObjects() {
		for (let act in this.activities) {
			let uniqueObjects = {};
			for (let evId in this.activities[act]) {
				let eve = this.ocel["ocel:events"][evId];
				for (let objIdx in eve["ocel:omap"]) {
					let objId = eve["ocel:omap"][objIdx];
					uniqueObjects[objId] = 0;
				}
			}
			this.activitiesCounters[act]["unique_objects"] = Object.keys(uniqueObjects).length;
		}
	}
	
	calculateActivityNumTotalObjects() {
		for (let act in this.activities) {
			let count = 0;
			for (let evId in this.activities[act]) {
				let eve = this.ocel["ocel:events"][evId];
				count += eve["ocel:omap"].length;
			}
			this.activitiesCounters[act]["total_objects"] = count;
		}
	}
	
	calculateActivityMinMaxRelatedObjects() {
		for (let act in this.activities) {
			let minRel = 1000000000;
			let maxRel = 1;
			for (let evId in this.activities[act]) {
				let eve = this.ocel["ocel:events"][evId];
				let osize = eve["ocel:omap"].length;
				if (osize > 0) {
					minRel = Math.min(minRel, osize);
					maxRel = Math.max(maxRel, osize);
				}
				
			}
			this.activitiesCounters[act]["min_related_objects"] = minRel;
			this.activitiesCounters[act]["max_related_objects"] = maxRel;
		}
	}
}