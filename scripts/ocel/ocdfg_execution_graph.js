class OcdfgExecutionGraph {
	constructor(model) {
		this.model = model;
		this.ingoingEdges = {};
		this.outgoingEdges = {};
		this.buildGraph();
	}
	
	buildGraph() {
		let eventsWithTimest = [];
		for (let eveId in this.model.ocel["ocel:events"]) {
			let eve = this.model.ocel["ocel:events"][eveId];
			let eveTimestamp = new Date(eve["ocel:timestamp"]).getTime();
			eventsWithTimest.push([eveId, eveTimestamp]);
		}
		eventsWithTimest.sort((a, b) => a[1] - b[1]);
		let initializedNodes = {};
		for (let objId in this.model.ocel["ocel:objects"]) {
			this.ingoingEdges[objId] = {};
			this.outgoingEdges[objId] = {};
		}
		for (let ewt of eventsWithTimest) {
			let eveOmap = this.model.ocel["ocel:events"][ewt[0]]["ocel:omap"];
			for (let objId of eveOmap) {
				if (objId in initializedNodes) {
					for (let objId2 of eveOmap) {
						if (objId2 != objId && !(objId2 in initializedNodes)) {
							this.outgoingEdges[objId][objId2] = 0;
							this.ingoingEdges[objId2][objId] = 0;
						}
					}
				}
				else {
					initializedNodes[objId] = 0;
				}
			}
		}
		//console.log(this.outgoingEdges);
	}
	
	getSubgraphPerNode(nodeId) {
		let nodes = {};
		let edges = [];
		let toVisit = [];
		for (let outgoingNode in this.outgoingEdges[nodeId]) {
			toVisit.push([nodeId, outgoingNode]);
		}
		while (toVisit.length > 0) {
			let edge = toVisit.shift();
			nodes[edge[0]] = 0;
			nodes[edge[1]] = 0;
			edges.push(edge);
			for (let outgoingNode in this.outgoingEdges[edge[1]]) {
				toVisit.push([edge[1], outgoingNode]);
			}
		}
		for (let ingoingNode in this.ingoingEdges[nodeId]) {
			toVisit.push([ingoingNode, nodeId]);
		}
		while (toVisit.length > 0) {
			let edge = toVisit.shift();
			nodes[edge[0]] = 0;
			nodes[edge[1]] = 0;
			edges.push(edge);
			for (let ingoingNode in this.ingoingEdges[edge[0]]) {
				toVisit.push([ingoingNode, edge[0]]);
			}
		}
		console.log(edges);
	}
}