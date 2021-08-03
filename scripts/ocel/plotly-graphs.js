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
		let eventsKeys = Object.keys(dictio).sort();
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
}