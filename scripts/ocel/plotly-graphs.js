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
}