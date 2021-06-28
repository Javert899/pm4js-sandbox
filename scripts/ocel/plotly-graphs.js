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
		  height: 400,
		  width: 500
		};

		Plotly.newPlot('plotlyOtGraph', data, layout);
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
		var layout = {title: "Events per Activity", width: 1200, height: 400};
		Plotly.newPlot('plotlyActGraph', data, layout);
	}
}