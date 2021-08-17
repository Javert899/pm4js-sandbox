class OcelConfNumObjs {
	constructor(model) {
		this.ocel = model.ocel;
		this.countsPerType = {};
		this.avgPerType = {};
		this.stdPerType = {};
		this.calculate();
	}
	
	calculate() {
		let i = 0;
		let events = this.ocel["ocel:events"];
		let objects = this.ocel["ocel:objects"];
		let eventsKeys = Object.keys(events);
		while (i < eventsKeys.length) {
			let eve = events[eventsKeys[i]];
			let eveOmap = eve["ocel:omap"];
			let eveActivity = eve["ocel:activity"];
			if (!(eveActivity in this.countsPerType)) {
				this.countsPerType[eveActivity] = {};
				this.avgPerType[eveActivity] = {};
				this.stdPerType[eveActivity] = {};
			}
			let counter = {};
			for (let objId of eveOmap) {
				let obj = objects[objId];
				let objType = obj["ocel:type"];
				if (!(objType in counter)) {
					counter[objType] = {};
				}
				counter[objType][objId] = 0;
			}
			for (let objType in counter) {
				let keys = Object.keys(counter[objType]);
				for (let key of keys) {
					counter[objType][key] = keys.length;
				}
			}
			for (let objType in counter) {
				if (!(objType in this.countsPerType[eveActivity])) {
					this.countsPerType[eveActivity][objType] = {};
					this.avgPerType[eveActivity][objType] = 0;
					this.stdPerType[eveActivity][objType] = 0;
				}
				for (let obj in counter[objType]) {
					if (!(obj in this.countsPerType[eveActivity][objType])) {
						this.countsPerType[eveActivity][objType][obj] = 0;
					}
					this.countsPerType[eveActivity][objType][obj] = Math.max(this.countsPerType[eveActivity][objType][obj], counter[objType][obj]);
				}
			}
			i++;
		}
		for (let activity in this.countsPerType) {
			for (let objType in this.countsPerType[activity]) {
				for (let obj in this.countsPerType[activity][objType]) {
					this.avgPerType[activity][objType] += this.countsPerType[activity][objType][obj];
				}
				this.avgPerType[activity][objType] = this.avgPerType[activity][objType] / (0.0 + Object.keys(this.countsPerType[activity][objType]).length);
				for (let obj in this.countsPerType[activity][objType]) {
					this.stdPerType[activity][objType] += (this.countsPerType[activity][objType][obj] - parseFloat(this.avgPerType[activity][objType]))*(this.countsPerType[activity][objType][obj] - parseFloat(this.avgPerType[activity][objType]));
				}
				this.stdPerType[activity][objType] = this.stdPerType[activity][objType]  / (0.0 + Object.keys(this.countsPerType[activity][objType]).length);
			}
		}
		//console.log(this.stdPerType);
	}
}