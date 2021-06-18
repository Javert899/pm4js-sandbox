class ObjectsView {
	constructor(ocel) {
		this.ocel = ocel;
		this.objectsIds = {}
	}
	
	addObject(objectId) {
		this.objectsIds[objectId] = {};
	}
	
	addEventForObject(objectId, evId) {
		this.objectsIds[objectId][evId] = 0;
	}
	
	calculate() {
	}
}