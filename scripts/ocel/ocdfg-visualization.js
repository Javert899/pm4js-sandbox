class OcdfgVisualization {
	constructor(model, graph) {
		this.model = model;
		this.graph = graph;
		this.original = this;
		this.MIN_INDIPENDENT_ACT_COUNT = 100000000000000;
		this.MAX_INDIPENDENT_ACT_COUNT = 0;
		this.MIN_EDGE_COUNT = 100000000000000;
		this.MAX_EDGE_COUNT = 0;
		this.expandedActivities = [];
		this.expandedEdges = [];
		this.calculatePre(0);
	}
	
	calculatePre(idx) {
		for (let act in this.model.overallEventsView.activitiesCounters) {
			let act_count = this.model.overallEventsView.getValue(act, idx);
			this.MIN_INDIPENDENT_ACT_COUNT = Math.min(this.MIN_INDIPENDENT_ACT_COUNT, act_count);
			this.MAX_INDIPENDENT_ACT_COUNT = Math.max(this.MAX_INDIPENDENT_ACT_COUNT, act_count);
		}
		for (let ot in this.model.otEdges) {
			let ev = this.model.otEdges[ot];
			for (let edge in ev.edgesStatistics) {
				let edge_count = ev.getValue(edge, idx);
				this.MIN_EDGE_COUNT = Math.min(this.MIN_EDGE_COUNT, edge_count);
				this.MAX_EDGE_COUNT = Math.max(this.MAX_EDGE_COUNT, edge_count);
			}
		}
	}
	
	represent(idx, af, pf) {
		let minActiCount = af * this.MAX_INDIPENDENT_ACT_COUNT;
		let minEdgeCount = pf * this.MAX_EDGE_COUNT;
		var parent = graph.getDefaultParent();
		graph.getModel().beginUpdate();
		graph.getModel().endUpdate();
		console.log("end representation");
	}
}