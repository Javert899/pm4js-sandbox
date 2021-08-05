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
	}
	
	getSubgraphPerNode(nodeId) {
		let nodes = {};
		let edges = [];
		let toVisit = [];
		nodes[nodeId] = this.model.ocel["ocel:objects"][nodeId]["ocel:type"];
		for (let outgoingNode in this.outgoingEdges[nodeId]) {
			toVisit.push([nodeId, outgoingNode]);
		}
		while (toVisit.length > 0) {
			let edge = toVisit.shift();
			nodes[edge[0]] = this.model.ocel["ocel:objects"][edge[0]]["ocel:type"];
			nodes[edge[1]] = this.model.ocel["ocel:objects"][edge[1]]["ocel:type"];
			edges.push(edge.toString());
			for (let outgoingNode in this.outgoingEdges[edge[1]]) {
				toVisit.push([edge[1], outgoingNode]);
			}
		}
		for (let ingoingNode in this.ingoingEdges[nodeId]) {
			toVisit.push([ingoingNode, nodeId]);
		}
		while (toVisit.length > 0) {
			let edge = toVisit.shift();
			nodes[edge[0]] = this.model.ocel["ocel:objects"][edge[0]]["ocel:type"];
			nodes[edge[1]] = this.model.ocel["ocel:objects"][edge[1]]["ocel:type"];
			edges.push(edge.toString());
			for (let ingoingNode in this.ingoingEdges[edge[0]]) {
				toVisit.push([ingoingNode, edge[0]]);
			}
		}
		let sortedNodes = Object.keys(nodes);
		sortedNodes.sort(function(a, b) {
			if (edges.includes([a, b].toString())) {
				return -1;
			}
			else if (edges.includes([b, a].toString())) {
				return 1;
			}
			return 0;
		});
		let sortedNodesIdx = {};
		for (let nodeId in sortedNodes) {
			sortedNodesIdx[sortedNodes[nodeId]] = nodeId;
		}
		edges.sort(function(a, b) {
			a = a.split(",");
			b = b.split(",");
			if (sortedNodesIdx[a[0]] < sortedNodesIdx[b[0]]) {
				return -1;
			}
			else if (sortedNodesIdx[a[0]] > sortedNodesIdx[b[0]]) {
				return 1;
			}
			return 0
		});
		return [nodes, edges, sortedNodes];
	}
	
	getDescriptionPerExecution(vect) {
		let nodes = vect[0];
		let edges = vect[1];
		let sortedNodes = vect[2]; 
		let countPerType = {};
		let nodesNames = {};
		for (let node of sortedNodes) {
			let nodeType = nodes[node];
			if (!(nodeType in countPerType)) {
				nodesNames[node] = nodeType;
				countPerType[node] = 1;
			}
			else {
				countPerType[node] += 1;
				nodesNames[node] = nodeType + " (2)";
			}
		}
		let typeEdges = [];
		for (let edge of edges) {
			edge = edge.split(",");
			typeEdges.push([nodesNames[edge[0]], nodesNames[edge[1]]].toString());
		}
		return typeEdges.join("@#@");
	}
	
	groupNodesPerExecution() {
		let descrCount = {};
		let descrObjs = {};
		let vectExecutions = {};
		for (let obj in this.outgoingEdges) {
			let vect = this.getSubgraphPerNode(obj);
			vectExecutions[obj] = vect;
			let descr = this.getDescriptionPerExecution(vect);
			if (descr != "") {
				if (!(descr in descrCount)) {
					descrCount[descr] = 0;
					descrObjs[descr] = [];
				}
				descrCount[descr] += 1;
				descrObjs[descr].push(obj);
			}
		}
		let descrCountArray = [];
		for (let el in descrCount) {
			descrCountArray.push([el, descrCount[el]]);
		}
		descrCountArray.sort((a,b) => b[1]-a[1]);
		return [descrCountArray, descrObjs, vectExecutions];
	}
}