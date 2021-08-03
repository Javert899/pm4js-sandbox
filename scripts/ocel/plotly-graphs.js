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
}