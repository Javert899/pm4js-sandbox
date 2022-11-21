class OcdfgModel {
	constructor(ocel) {
		this.ocel = ocel;
		this.parentOcel = ocel;
		this.overallEventsView = new EventsView(ocel, this);
		this.overallObjectsView = new ObjectsView(ocel);
		this.otEventsView = {};
		this.otObjectsView = {};
		this.otEdges = {};
		this.otEventLogs = {};
		this.otInductiveModels = {};
		this.otInductiveModelsBPMN = {};
		this.otReplayedTraces = {};
		this.otReplayedTracesBPMN = {};
		this.otTransMap = {};
		this.otTransMapBPMN = {};
		this.executionGraph = null;
		this.executions = null;
		this.conformanceNumObjs = null;
		this.conformanceLifecycleObjects = null;
		this.conformanceDurationObjects = null;
		this.fixedObjectTypeColors = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"];
		this.fixedObjectTypeAssociation = {};
		this.calculate();
	}
	
	getOcel() {
		console.log(this.ocel);
	}
	
	stringToColour0(str) {
	  var hash = 0;
	  for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	  }
	  var colour = '#';
	  for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		colour += ('00' + value.toString(16)).substr(-2);
	  }
	  return colour;
	}
	
	stringToColour(str) {
		if (str in this.fixedObjectTypeAssociation) {
			return this.fixedObjectTypeAssociation[str];
		}
		return this.stringToColour0(str);
	}
	
	calculate() {
		for (let otId in this.ocel["ocel:global-log"]["ocel:object-types"]) {
			let ot = this.ocel["ocel:global-log"]["ocel:object-types"][otId];
			this.otEventsView[ot] = new EventsView(this.ocel, this);
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
		let objectTypes = this.parentOcel["ocel:global-log"]["ocel:object-types"];
		objectTypes.sort();
		let i = 0;
		while (i < objectTypes.length) {
			if (i < this.fixedObjectTypeColors.length) {
				this.fixedObjectTypeAssociation[objectTypes[i]] = this.fixedObjectTypeColors[i];
			}
			i++;
		}
	}
	
	calculateExecutions() {
		if (this.executions == null) {
			this.executionGraph = new OcdfgExecutionGraph(this);
			this.executions = this.executionGraph.groupNodesPerExecution();
		}
	}
	
	calculateConformanceNumObjs() {
		let self = this;
		let thisUuid = Pm4JS.startAlgorithm({"name": "OCPM calculateConfNumbObjs"});
		setTimeout(function() {
			if (self.conformanceNumObjs == null) {
				self.conformanceNumObjs = new OcelConfNumObjs(self.ocel);
				self.conformanceNumObjs.calculate();
				self.conformanceNumObjs.populateTable(document.getElementById("conformanceCheckingNumObjectsTable"));
			}
			Pm4JS.stopAlgorithm(thisUuid, {});
		}, 100);
	}
	
	calculateConformanceLifecycleObjects() {
		let self = this;
		let thisUuid = Pm4JS.startAlgorithm({"name": "OCPM calculateConformanceLifecycleObjects"});
		setTimeout(function() {
			if (self.conformanceLifecycleObjects == null) {
				self.conformanceLifecycleObjects = new OcelConfLifecycleObjects(self.ocel);
				self.conformanceLifecycleObjects.calculate();
				self.conformanceLifecycleObjects.populateTable(document.getElementById("conformanceCheckingLifecycleObjectsTable"))
			}
			Pm4JS.stopAlgorithm(thisUuid, {});
		}, 100);
	}
	
	calculateConformanceDurationObjects() {
		let self = this;
		let thisUuid = Pm4JS.startAlgorithm({"name": "OCPM calculateConformanceDurationObjects"});
		setTimeout(function() {
			if (self.conformanceDurationObjects == null) {
				self.conformanceDurationObjects = new OcelConfDurationObjects(self);
				self.conformanceDurationObjects.calculate();
				self.conformanceDurationObjects.populateTable(document.getElementById("conformanceCheckingDurationObjectsTable"));
			}
			Pm4JS.stopAlgorithm(thisUuid, {});
		}, 100);
	}
	
	filterObjectTypes(objTypes) {
		return new OcdfgModel(OcelGeneralFiltering.filterObjectTypes(this.ocel, objTypes));
	}
	
	filterRelatedObjects(relObjs) {
		return new OcdfgModel(OcelGeneralFiltering.filterRelatedEvents(this.ocel, relObjs));
	}
	
	filterNonRelatedObjects(positive, negative) {
		return new OcdfgModel(OcelGeneralFiltering.filterNonRelatedEvents(this.ocel, positive, negative));
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