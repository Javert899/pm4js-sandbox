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
			this.overallObjectsView.addObject(objId);
			this.otObjectsView[objType].addObject(objId);
		}
		for (let evId in this.ocel["ocel:events"]) {
			let eve = this.ocel["ocel:events"][evId];
			for (let objIdx in this.ocel["ocel:events"][evId]["ocel:omap"]) {
				let relObj = this.ocel["ocel:events"][evId]["ocel:omap"][objIdx];
				let relObjType = this.ocel["ocel:objects"][relObj]["ocel:type"];
				this.overallEventsView.addEvent(evId);
				this.otEventsView[relObjType].addEvent(evId);
				this.overallObjectsView.addEventForObject(relObj, evId);
				this.otObjectsView[relObjType].addEventForObject(relObj, evId);
			}
		}
		this.overallEventsView.calculate();
		this.overallObjectsView.calculate();
		for (let ot in this.otEventsView) {
			this.otEventsView[ot].calculate();
			this.otObjectsView[ot].calculate();
		}
	}
}