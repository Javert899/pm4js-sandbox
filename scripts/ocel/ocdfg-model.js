class OcdfgModel {
	constructor(ocel) {
		this.ocel = ocel;
		this.overallEventsView = new EventsView(ocel);
		this.overallObjectsView = new ObjectsView(ocel);
		this.otEventsView = {};
		this.otObjectsView = {};
		this.otEdges = {};
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
			this.otEventsView[ot].objectType = ot;
			this.otObjectsView[ot].objectType = ot;
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
			this.otEdges[ot] = new EdgesView(this.ocel, this.otObjectsView[ot], this.otEventsView[ot]);
		}
	}
	
	filterObjectTypes(objTypes) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = this.ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = this.ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = this.ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = objTypes;
		filteredOcel["ocel:objects"] = {};
		for (let objId in this.ocel["ocel:objects"]) {
			let obj = this.ocel["ocel:objects"][objId];
			if (objTypes.includes(obj["ocel:type"])) {
				filteredOcel["ocel:objects"][objId] = obj;
			}
		}
		filteredOcel["ocel:events"] = {};
		for (let eveId in this.ocel["ocel:events"]) {
			let eve = this.ocel["ocel:events"][eveId];
			let relObj = [];
			for (let objId of eve["ocel:omap"]) {
				if (objId in filteredOcel["ocel:objects"]) {
					relObj.push(objId);
				}
			}
			if (relObj.length > 0) {
				let newEve = {};
				newEve["ocel:activity"] = eve["ocel:activity"];
				newEve["ocel:timestamp"] = eve["ocel:timestamp"];
				newEve["ocel:vmap"] = eve["ocel:vmap"];
				newEve["ocel:omap"] = relObj;
				filteredOcel["ocel:events"][eveId] = newEve;
			}
		}
		return new OcdfgModel(filteredOcel);
	}
}