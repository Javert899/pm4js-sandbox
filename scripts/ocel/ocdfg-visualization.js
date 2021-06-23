class OcdfgVisualization {
	constructor(model, graph) {
		this.model = model;
		this.graph = graph;
		this.original = this;
		this.ACTIVITY_FREQUENCY = 0.2;
		this.PATHS_FREQUENCY = 0.2
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
		this.invActivitiesDependent = {};
		this.graphEdges = {};
		this.invGraphEdges = {};
		this.saNodes = {};
		this.invSaNodes = {};
		this.eaNodes = {};
		this.invEaNodes = {};
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
	
	represent(af = null, pf = null) {
		if (af == null) {
			af = this.ACTIVITY_FREQUENCY;
		}
		if (pf == null) {
			pf = this.PATHS_FREQUENCY;
		}
		let minActiCount = (1 - af) * this.MAX_INDIPENDENT_ACT_COUNT;
		let minEdgeCount = (1 - pf) * this.MAX_EDGE_COUNT;
		var parent = this.graph.getDefaultParent();
		for (let act in this.model.overallEventsView.activities) {
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
				this.invActivitiesIndipendent[activityObject.id] = act;
			}
		}
		for (let ot in this.model.otEdges) {
			let otEdges = this.model.otEdges[ot];
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
							let color = this.stringToColour(ot);
							let arc = this.graph.insertEdge(parent, edgeVect.toString(), label, this.activitiesIndipendent[activities[0]], this.activitiesIndipendent[activities[1]], "fontSize=16;strokeWidth="+penwidth+";strokeColor="+color+";fontColor="+color);
							this.graphEdges[edgeVect] = arc;
							this.invGraphEdges[arc.id] = edgeVect;
						}
					}
				}
			}
		}
		for (let ot in this.model.otObjectsView) {
			let color = this.stringToColour(ot);
			let otObjects = this.model.otObjectsView[ot];
			let otSa = otObjects.filteredSa(minEdgeCount, this.activitiesIndipendent);
			if (Object.keys(otSa).length > 0) {
				let saNode = graph.insertVertex(this.parent, "SA_"+ot, ot, 150, 150, 275, 60, "shape=ellipse;fontColor=white;fillColor="+color);
				this.saNodes[ot] = saNode;
				this.invSaNodes[saNode.id] = ot;
				for (let act in otSa) {
					let value = otSa[act];
					let penwidth = Math.floor(1 + Math.log(1 + value)/2);
					let arc = graph.insertEdge(parent, null, "UO="+value, saNode, this.activitiesIndipendent[act], "fontSize=16;strokeColor="+color+";fontColor="+color+";strokeWidth="+penwidth);
				}
			}
			let otEa = otObjects.filteredEa(minEdgeCount, this.activitiesIndipendent);
			if (Object.keys(otEa).length > 0) {
				let eaNode = graph.insertVertex(this.parent, "EA_"+ot, "", 150, 150, 60, 60, "shape=ellipse;fillColor="+color);
				this.eaNodes[ot] = eaNode;
				this.invEaNodes[eaNode.id] = ot;
				for (let act in otEa) {
					let value = otEa[act];
					let penwidth = Math.floor(1 + Math.log(1 + value)/2);
					let arc = graph.insertEdge(parent, null, "UO="+value, this.activitiesIndipendent[act], eaNode, "fontSize=16;strokeColor="+color+";fontColor="+color+";strokeWidth="+penwidth);
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