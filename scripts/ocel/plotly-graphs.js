class PlotlyOcelGraphs {
	constructor(model) {
		this.model = model;
	}
	
	buildOtGraph() {
		let values = [];
		let labels = [];
		
		for (let ot in this.model.otObjectsView) {
			let otView = this.model.otObjectsView[ot];
			labels.push(ot);
			values.push(Object.keys(otView.objectsIdsSorted).length);
		}
		
		var data = [{
		  values: values,
		  labels: labels,
		  type: 'pie'
		}];

		var layout = {
			title: 'Objects per Type',
		};

		Plotly.newPlot('plotlyOtGraph', data, layout, {responsive: true});
	}
	
	buildActivitiesGraph() {
		let x = [];
		let y = [];
		for (let act in this.model.overallEventsView.activities) {
			let actView = this.model.overallEventsView.activities[act];
			x.push(act);
			y.push(Object.keys(actView).length);
		}
		var data = [{x: x, y: y, type: 'bar'}];
		var layout = {title: "Events per Activity"};
		Plotly.newPlot('plotlyActGraph', data, layout, {responsive: true});
	}
	
	buildObjectsPerEventGraph() {
		let dictio = {}
		let events = this.model.ocel["ocel:events"];
		for (let eveId in events) {
			let eve = events[eveId];
			let eveOmapLength = eve["ocel:omap"].length;
			if (!(eveOmapLength in dictio)) {
				dictio[eveOmapLength] = 1;
			}
			else {
				dictio[eveOmapLength] += 1;
			}
		}
		let eventsKeys = Object.keys(dictio).sort((a, b) => a - b); 
		let x = [];
		let y = [];
		for (let key of eventsKeys) {
			x.push(key);
			y.push(dictio[key]);
		}	
		var data = [{x: x, y: y, type: 'bar'}];
		var layout = {title: "N. Objects per Event"};
		Plotly.newPlot('plotlyObjPerEveGraph', data, layout, {responsive: true});
	}
	
	buildLifecycleLength() {
		let dictio = {};
		let objectsIds = this.model.overallObjectsView.objectsIds;
		for (let objId in objectsIds) {
			let relEve = Object.keys(objectsIds[objId]).length;
			if (!(relEve in dictio)) {
				dictio[relEve] = 1;
			}
			else {
				dictio[relEve] += 1;
			}
		}
		let dictioKeys = Object.keys(dictio).sort((a, b) => a - b); 
		let x = [];
		let y = [];
		for (let key of dictioKeys) {
			x.push(key);
			y.push(dictio[key]);
		}
		var data = [{x: x, y: y, type: 'bar'}];
		var layout = {title: "Length of Object Lifecycle"};
		Plotly.newPlot('plotlyLifecycleLengthGraph', data, layout, {responsive: true});
	}
	
	buildObjectDuration() {
		let serie = [];
		let objectsIds = this.model.overallObjectsView.objectsIdsSorted;
		for (let objId in objectsIds) {
			let relEve = objectsIds[objId];
			try {
			let duration = relEve[relEve.length - 1][2] - relEve[0][2];
			serie.push(Math.log10(1 + duration));
			}
			catch (err) {
			}
		}
		serie = serie.sort((a, b) => a - b);
		console.log(serie);
		console.log(serie[serie.length - 1]);
		var y0 = [];
		var y1 = [];
		for (var i = 0; i < 50; i ++) {
			y0[i] = Math.random();
			y1[i] = Math.random() + 1;
		}
		var data = [{y: serie, type: "box"}];
		var layout = {title: "Lifecycle Duration (logarithmic)"};
		Plotly.newPlot('plotlyLifecycleDurationGraph', data, layout, {responsive: true});
	}
	
	buildEventsPerTime() {
		let events = this.model.ocel["ocel:events"];
		let minTimestamp = 9999999999999;
		let maxTimestamp = -9999999999999;
		for (let eveId in events) {
			let timest = events[eveId]["ocel:timestamp"].getTime();
			if (timest < minTimestamp) {
				minTimestamp = timest;
			}
			if (timest > maxTimestamp) {
				maxTimestamp = timest;
			}
		}
		let n = 20;
		let step = (maxTimestamp - minTimestamp) / 20;
		let stepsDictio = {};
		for (let eveId in events) {
			let timest = events[eveId]["ocel:timestamp"].getTime();
			let thisStep = Math.floor((timest - minTimestamp)/step);
			if (!(thisStep in stepsDictio)) {
				stepsDictio[thisStep] = 1;
			}
			else {
				stepsDictio[thisStep] += 1;
			}
		}
		let dictioKeys = Object.keys(stepsDictio).sort((a, b) => a - b);
		let x = [];
		let y = [];
		for (let key of dictioKeys) {
			let d = new Date(minTimestamp + key*step);
			let corr = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear()
			x.push(corr);
			y.push(stepsDictio[key]);
		}
		var data = [{x: x, y: y, type: 'bar'}];
		var layout = {title: "Events per Time"};
		Plotly.newPlot('plotlyEventsPerTimeGraph', data, layout, {responsive: true});
	}
	
	buildDottedChartActivities() {
		let objectsIds = this.model.overallObjectsView.objectsIdsSorted;
		let serie = [];
		for (let objId in objectsIds) {
			try {
				let relEve = objectsIds[objId];
				let firstTimestamp = relEve[0][2];
				serie.push([objId, firstTimestamp]);
			}
			catch (err) {
			}
		}
		serie.sort((a, b) => a[1] - b[1]);
		let allColors = {};
		let prob = 500 / serie.length;
		for (let elCount in serie) {
			let rr = Math.random();
			if (rr < prob) {
				let el = serie[elCount];
				let objId = el[0];
				let relEve = objectsIds[objId];
				for (let eve of relEve) {
					let timestamp = eve[2];
					let activity = eve[1];
					let timestampDate = new Date(timestamp*1000);
					let timestampStru = timestampDate.getFullYear()  + "-" + (timestampDate.getMonth()+1) + "-" + timestampDate.getDate() + " " + timestampDate.getHours()+":"+timestampDate.getMinutes()+":"+timestampDate.getSeconds();
					if (!(activity in allColors)) {
						allColors[activity] = {x: [], y: [], type: "scatter", mode: "markers", name: activity};
					}
					allColors[activity].x.push(timestampStru);
					allColors[activity].y.push(elCount);
				}
			}
		}
		let colors = Object.keys(allColors).sort();
		var data = [];
		for (let color of colors) {
			data.push(allColors[color]);
		}
		var layout = {
			title: "Dotted Chart (color: activity)",
			xaxis: {
				title: "Timestamp"
			},
			yaxis: {
				title: "Object index"
			}
		};
		Plotly.newPlot('plotlyDottedChartColorActivity', data, layout, {responsive: true});
	}
	
	buildDottedChartOtype() {
		let objectsIds = this.model.overallObjectsView.objectsIdsSorted;
		let serie = [];
		for (let objId in objectsIds) {
			try {
				let relEve = objectsIds[objId];
				let firstTimestamp = relEve[0][2];
				serie.push([objId, firstTimestamp]);
			}
			catch (err) {
			}
		}
		serie.sort((a, b) => a[1] - b[1]);
		let allColors = {};
		let prob = 500 / serie.length;
		for (let elCount in serie) {
			let rr = Math.random();
			if (rr < prob) {
				let el = serie[elCount];
				let objId = el[0];
				let objType = this.model.ocel["ocel:objects"][objId]["ocel:type"];
				let relEve = objectsIds[objId];
				for (let eve of relEve) {
					let timestamp = eve[2];
					let activity = eve[1];
					let timestampDate = new Date(timestamp*1000);
					let timestampStru = timestampDate.getFullYear()  + "-" + (timestampDate.getMonth()+1) + "-" + timestampDate.getDate() + " " + timestampDate.getHours()+":"+timestampDate.getMinutes()+":"+timestampDate.getSeconds();
					if (!(objType in allColors)) {
						allColors[objType] = {x: [], y: [], type: "scatter", mode: "markers", name: objType};
					}
					allColors[objType].x.push(timestampStru);
					allColors[objType].y.push(elCount);
				}
			}
		}
		let colors = Object.keys(allColors).sort();
		var data = [];
		for (let color of colors) {
			data.push(allColors[color]);
		}
		var layout = {
			title: "Dotted Chart (color: object type)",
			xaxis: {
				title: "Timestamp"
			},
			yaxis: {
				title: "Object index"
			}
		};
		Plotly.newPlot('plotlyDottedChartColorObjType', data, layout, {responsive: true});
	}
}