class ObjectsView {
	constructor(ocel) {
		this.ocel = ocel;
		this.objectType = null;
		this.objectsIds = {};
		this.objectsIdsSorted = {};
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
				this.objectsIdsSorted[objId].push([evId, eve["ocel:activity"], new Date(eve["ocel:timestamp"]).getTime()/1000.0]);
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
		}
	}
}