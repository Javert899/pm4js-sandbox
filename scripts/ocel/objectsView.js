class ObjectsView {
	constructor(ocel) {
		this.ocel = ocel;
		this.objectType = null;
		this.objectsIds = {};
		this.objectsIdsSorted = {};
		this.startActivities = {};
		this.endActivities = {};
	}
	
	addObject(objectId) {
		this.objectsIds[objectId] = {};
	}
	
	addEventForObject(objectId, evId) {
		this.objectsIds[objectId][evId] = 0;
	}
	
	calculate() {
		for (let objId in this.objectsIds) {
			this.objectsIdsSorted[objId] = [];
			for (let evId in this.objectsIds[objId]) {
				let eve = this.ocel["ocel:events"][evId];
				this.objectsIdsSorted[objId].push([evId, eve["ocel:activity"], eve["ocel:timestamp"].getTime()/1000.0]);
			}
			this.objectsIdsSorted[objId].sort(function(a, b) {
					if (a[2] < b[2]) {
						return -1;
					}
					else if (a[2] > b[2]) {
						return 1
					}
					return 0;
			});
			if (this.objectsIdsSorted[objId].length > 0) {
				let sa = this.objectsIdsSorted[objId][0][1];
				let ea = this.objectsIdsSorted[objId][this.objectsIdsSorted[objId].length - 1][1];
				if (!(sa in this.startActivities)) {
					this.startActivities[sa] = 1;
				}
				else {
					this.startActivities[sa] = this.startActivities[sa] + 1;
				}
				if (!(ea in this.endActivities)) {
					this.endActivities[ea] = 1;
				}
				else {
					this.endActivities[ea] = this.endActivities[ea] + 1;
				}
			}
		}
	}
	
	filteredSa(count, activitiesList) {
		let ret = {};
		for (let sa in this.startActivities) {
			if (this.startActivities[sa] >= count && sa in activitiesList) {
				ret[sa] = this.startActivities[sa];
			}
		}
		return ret;
	}
	
	filteredEa(count, activitiesList) {
		let ret = {};
		for (let ea in this.endActivities) {
			if (this.endActivities[ea] >= count && ea in activitiesList) {
				ret[ea] = this.endActivities[ea];
			}
		}
		return ret;
	}
	
	getStartingWith(act) {
		let ret = [];
		for (let objId in this.objectsIds) {
			if (this.objectsIdsSorted[objId].length > 0) {
				let sa = this.objectsIdsSorted[objId][0][1];
				if (sa == act) {
					ret.push(objId);
				}
			}
		}
		return ret;
	}
	
	getEndingWith(act) {
		let ret = [];
		for (let objId in this.objectsIds) {
			if (this.objectsIdsSorted[objId].length > 0) {
				let ea = this.objectsIdsSorted[objId][this.objectsIdsSorted[objId].length - 1][1];
				if (ea == act) {
					ret.push(objId);
				}
			}
		}
		return ret;
	}
}