class OcdfgModel {
	constructor(ocel) {
		this.ocel = ocel;
		this.overallEventsView = new EventsView(ocel);
		this.overallObjectsView = new ObjectsView(ocel);
		this.otEventsView = {};
		this.otObjectsView = {};
		this.otEdges = {};
		this.otEventLogs = {};
		this.otInductiveModels = {};
		this.otReplayedTraces = {};
		this.otTransMap = {};
		this.executionGraph = null;
		this.executions = null;
		this.conformanceNumObjs = null;
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
			let classicLog = OcelFlattening.flatten(this.ocel, ot);
			this.otEventLogs[ot] = classicLog;
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
	
	calculateExecutions() {
		if (this.executions == null) {
			this.executionGraph = new OcdfgExecutionGraph(this);
			this.executions = this.executionGraph.groupNodesPerExecution();
		}
	}
	
	calculateConformanceNumObjs() {
		if (this.conformanceNumObjs == null) {
			this.conformanceNumObjs = new OcelConfNumObjs(this.ocel);
			this.conformanceNumObjs.calculate(1);
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
	
	filterRelatedObjects(relObjs) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = this.ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = this.ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = this.ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = this.ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		for (let eveId in this.ocel["ocel:events"]) {
			let eve = this.ocel["ocel:events"][eveId];
			let inte = [];
			for (let objId of eve["ocel:omap"]) {
				if (relObjs.includes(objId)) {
					inte.push(objId);
				}
			}
			if (inte.length > 0) {
				for (let objId of eve["ocel:omap"]) {
					if (!(objId in filteredOcel["ocel:objects"])) {
						filteredOcel["ocel:objects"][objId] = this.ocel["ocel:objects"][objId];
					}
				}
				filteredOcel["ocel:events"][eveId] = eve;
			}
		}
		return new OcdfgModel(filteredOcel);
	}
	
	filterNonRelatedObjects(positive, negative) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = this.ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = this.ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = this.ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = this.ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		for (let eveId in this.ocel["ocel:events"]) {
			let eve = this.ocel["ocel:events"][eveId];
			let inte = [];
			let inte2 = [];
			for (let objId of eve["ocel:omap"]) {
				if (positive.includes(objId)) {
					inte.push(objId);
				}
				if (negative.includes(objId)) {
					inte2.push(objId);
				}
			}
			if (inte.length > 0 && inte2.length == 0) {
				for (let objId of eve["ocel:omap"]) {
					if (!(objId in filteredOcel["ocel:objects"])) {
						filteredOcel["ocel:objects"][objId] = this.ocel["ocel:objects"][objId];
					}
				}
				filteredOcel["ocel:events"][eveId] = eve;
			}
		}
		return new OcdfgModel(filteredOcel);
	}
	
	getRelObjActivity(acti, ot) {
		if (ot == null) {
			return this.overallEventsView.getRelObjActivity(acti);
		}
		else {
			return this.otEventsView[ot].getRelObjActivity(acti);
		}
	}
	
	getRelObjEdge(edge, ot) {
		return this.otEdges[ot].getRelObjEdge(edge);
	}
	
	getNumEvents() {
		return Object.keys(this.ocel["ocel:events"]).length;
	}
	
	getNumUniqueObjects() {
		return Object.keys(this.ocel["ocel:objects"]).length;
	}
	
	getNumTotalObjects() {
		let ret = 0;
		for (let evId in this.ocel["ocel:events"]) {
			ret+=this.ocel["ocel:events"][evId]["ocel:omap"].length;
		}
		return ret;
	}
}