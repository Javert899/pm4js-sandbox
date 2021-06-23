class OcdfgVisualization {
	constructor(model, graph) {
		this.model = model;
		this.graph = graph;
		this.original = this;
		this.MIN_INDIPENDENT_ACT_COUNT = 100000000000000;
		this.MAX_INDIPENDENT_ACT_COUNT = 0;
		this.MIN_EDGE_COUNT = 100000000000000;
		this.MAX_EDGE_COUNT = 0;
		this.IDX = 0;
		this.expandedActivities = [];
		this.expandedEdges = [];
		this.activitiesIndipendent = {};
		this.invActivitiesIndipendent = {};
		this.activitiesDependent = {};
		this.graphEdges = {};
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
		let minActiCount = (1 - af) * this.MAX_INDIPENDENT_ACT_COUNT;
		let minEdgeCount = (1 - pf) * this.MAX_EDGE_COUNT;
		var parent = this.graph.getDefaultParent();
		for (let act in model.overallEventsView.activities) {
			if (this.model.overallEventsView.satisfy(act, this.IDX, minActiCount)) {
				let count = this.model.overallEventsView.getValue(act, this.IDX);
				let width = 275;
				let height = 60;
				let label = this.model.overallEventsView.toReducedString(act, this.IDX);
				if (act in this.expandedActivities) {
					height = 250;
					label = this.model.overallEventsView.toCompleteString(act);
				}
				let cc = Math.floor(125 + 125 * (this.MAX_INDIPENDENT_ACT_COUNT - count)/(this.MAX_INDIPENDENT_ACT_COUNT - this.MIN_INDIPENDENT_ACT_COUNT + 0.000001));
				cc = cc + 256 * cc + 256*256 * cc;
				let hex = "#"+Number(cc).toString(16);
				let activityObject = this.graph.insertVertex(parent, act, label, 150, 150, width, height, "fontSize=18;fillColor="+hex);
				this.activitiesIndipendent[act] = activityObject;
				this.invActivitiesIndipendent[activityObject] = act;
			}
		}
		for (let ot in model.otEdges) {
			let otEdges = model.otEdges[ot];
			for (let edge in otEdges.edgesStatistics) {
				let activities = edge.split(",");
				if (activities[0] in this.activitiesIndipendent && activities[1] in this.activitiesIndipendent) {
					if (otEdges.satisfy(edge, this.IDX, minEdgeCount)) {
						let value = otEdges.getValue(edge, this.IDX);
						let edgeVect = [activities[0], activities[1], ot];
						if (edgeVect in this.expandedEdges) {
							
						}
						else {
							let penwidth = Math.floor(1 + Math.log(1 + value)/2);
							let label = otEdges.toReducedString(edge, this.IDX);
							let arc = this.graph.insertEdge(parent, null, label, this.activitiesIndipendent[activities[0]], this.activitiesIndipendent[activities[1]], "fontSize=16;strokeWidth="+penwidth);
							this.graphEdges[edgeVect] = arc;
							
						}
					}
				}
			}
		}
		var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
		graph.getModel().beginUpdate();
		layout.execute(parent);
		graph.getModel().endUpdate();
		console.log("end representation");
	}
}