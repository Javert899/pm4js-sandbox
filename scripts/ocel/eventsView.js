class EventsView {
	constructor(ocel, model) {
		this.ocel = ocel;
		this.model = model;
		this.objectType = null;
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
					let obj = this.ocel["ocel:objects"][objId];
					if (this.objectType != null) {
						let objType = obj["ocel:type"];
						if (objType == this.objectType) {
							uniqueObjects[objId] = 0;
						}
					}
					else {
						uniqueObjects[objId] = 0;
					}
				}
			}
			this.activitiesCounters[act]["unique_objects"] = Object.keys(uniqueObjects).length;
		}
	}
	
	calculateActivityNumTotalObjects() {
		for (let act in this.activities) {
			let uniqueObjects = {};
			for (let evId in this.activities[act]) {
				let eve = this.ocel["ocel:events"][evId];
				for (let objIdx in eve["ocel:omap"]) {
					let objId = eve["ocel:omap"][objIdx];
					let obj = this.ocel["ocel:objects"][objId];
					if (this.objectType != null) {
						let objType = obj["ocel:type"];
						if (objType == this.objectType) {
							uniqueObjects[objId+","+eve] = 0;
						}
					}
					else {
						uniqueObjects[objId+","+eve] = 0;
					}
				}
			}
			this.activitiesCounters[act]["total_objects"] = Object.keys(uniqueObjects).length;
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
	
	satisfy(acti, idx, count) {
		return this.getValue(acti, idx) >= count;
	}
	
	getValue(acti, idx) {
		if (idx == 0) {
			return this.activitiesCounters[acti]["events"];
		}
		else if (idx == 1) {
			return this.activitiesCounters[acti]["unique_objects"];
		}
		else if (idx == 2) {
			return this.activitiesCounters[acti]["total_objects"];
		}
		return 0;
	}
	
	toReducedString(acti, idx) {
		let ret = "";
		for (let piece of acti.split(" ")) {
			ret += piece + "<br />";
		}
		if (idx == 0) {
			ret += "E="+this.activitiesCounters[acti]["events"];
		}
		else if (idx == 1) {
			ret += "UO="+this.activitiesCounters[acti]["unique_objects"];
		}
		else if (idx == 2) {
			ret += "TO="+this.activitiesCounters[acti]["total_objects"];
		}
		return ret;
	}
	
	toCompleteString(acti) {
		let ret = "";
		if (this.objectType != null) {
			ret += "<b>"+acti+" ("+this.objectType+")</b><br /><br />"
		}
		else {
			ret += "<b>"+acti+"</b><br /><br />";
		}
		ret += "events = "+this.activitiesCounters[acti]["events"]+"<br />";
		ret += "unique objects = "+this.activitiesCounters[acti]["unique_objects"]+"<br />";
		ret += "total objects = "+this.activitiesCounters[acti]["total_objects"]+"<br />";
		if (this.objectType != null) {
			ret += "min rel. obj = "+this.activitiesCounters[acti]["min_related_objects"]+"<br />";
			ret += "max rel. obj = "+this.activitiesCounters[acti]["max_related_objects"]+"<br />";
		}
		return ret;
	}
	
	stringToColour(str) {
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
	
	toIntermediateStringThis(acti) {
		let ret = "E="+this.activitiesCounters[acti]["events"]+" UO="+this.activitiesCounters[acti]["unique_objects"]+" TO="+this.activitiesCounters[acti]["total_objects"];
		if (this.objectType != null) {
			ret = "<span style='color: "+this.stringToColour(this.objectType)+"'>" + ret + "</span>";
		}
		else {
			ret = "<b>" + ret + "</b>";
		}
		return ret;
	}
	
	getThisWidth(acti, isExpanded) {
		if (isExpanded) {
			return Math.max(acti.length, this.toIntermediateStringThis(acti).length);
		}
		else {
			let maxLength = 0;
			let redString = this.toReducedString(acti, 2);
			for (let el of redString.split("<br />")) {
				maxLength = Math.max(maxLength, el.length);
			}
			return maxLength + 1;
		}
	}
	
	getThisHeight(acti, isExpanded) {
		let ret = this.toReducedString(acti, 2).split("<br />").length + 1;
		if (isExpanded) {
			ret = 4;
			for (let ot in this.model.otEventsView) {
				let otEvents = this.model.otEventsView[ot];
				if (acti in otEvents.activities) {
					ret += 1;
				}
			}
		}
		return ret;
	}
	
	toIntermediateString(acti, idx) {
		let ret = acti+"<br /><br />";
		ret += this.toIntermediateStringThis(acti) + "<br /><br />";
		for (let ot in this.model.otEventsView) {
			let otEvents = this.model.otEventsView[ot];
			if (acti in otEvents.activities) {
				ret += otEvents.toIntermediateStringThis(acti) + "<br />";
			}
		}
		return ret;
	}
	
	getRelObjActivity(acti) {
		let relObj = {};
		for (let evId in this.activities[acti]) {
			let eve = this.ocel["ocel:events"][evId];
			for (let obj of eve["ocel:omap"]) {
				relObj[obj] = 0;
			}
		}
		return Object.keys(relObj);
	}
}