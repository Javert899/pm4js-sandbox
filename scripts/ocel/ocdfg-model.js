class OcdfgModel {
	constructor(ocel) {
		this.ocel = ocel;
		this.overallEventsView = new EventsView(ocel);
		this.overallObjectsView = new ObjectsView(ocel);
		this.otEventsView = {};
		this.otObjectsView = {};
		this.calculate();
	}
	
	getOcel() {
		console.log(this.ocel);
	}
	
	calculate() {
		for (let otId in this.ocel["ocel:global-log"]["ocel:object-types"]) {
			let ot = this.ocel["ocel:global-log"]["ocel:object-types"][otId];
			this.otEventsView[ot] = new EventsView(this.ocel);
			this.otObjectsView[ot] = new ObjectsView(this.ocel);
		}
		for (let objId in this.ocel["ocel:objects"]) {
			let obj = this.ocel["ocel:objects"][objId];
			let objType = obj["ocel:type"];
			this.overallObjectsView[obj] = {};
			this.otObjectsView[objType][obj] = {};
		}
	}
}