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
				countPerType[nodeType] = 1;
			}
			else {
				countPerType[nodeType] += 1;
				nodesNames[node] = nodeType + "###("+countPerType[nodeType]+")";
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
		let descrDurations = {};
		let vectExecutions = {};
		let descrGraphviz = {};
		let objExecutionDuration = {};
		let objectsIds = this.model.overallObjectsView.objectsIdsSorted;
		for (let obj in this.outgoingEdges) {
			try {
				let vect = this.getSubgraphPerNode(obj);
				let firstObjectOfExecution = vect[2][0];
				let lastObjectOfExecution = vect[2][vect[2].length - 1];
				objExecutionDuration[obj] = objectsIds[lastObjectOfExecution][objectsIds[lastObjectOfExecution].length - 1][2] - objectsIds[firstObjectOfExecution][0][2];
				vectExecutions[obj] = vect;
				let descr = this.getDescriptionPerExecution(vect);
				if (descr != "") {
					if (!(descr in descrCount)) {
						descrCount[descr] = 0;
						descrObjs[descr] = [];
						descrDurations[descr] = [];
						descrGraphviz[descr] = this.getGraphvizPerExecution(vect, descr);
					}
					descrCount[descr] += 1;
					descrObjs[descr].push(obj);
					descrDurations[descr].push(objExecutionDuration[obj]);
				}
			}
			catch (err) {
			}
		}
		for (let key in descrDurations) {
			descrDurations[key].sort((a, b) => a - b);
			descrDurations[key] = descrDurations[key][Math.floor(descrDurations[key].length / 2)];
		}
		let descrCountArray = [];
		for (let el in descrCount) {
			descrCountArray.push([el, descrCount[el]]);
		}
		descrCountArray.sort((a,b) => b[1]-a[1]);
		return [descrCountArray, descrObjs, vectExecutions, objExecutionDuration, descrDurations];
	}
	
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = OcdfgExecutionGraph.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static stringToColour(str) {
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
	
	getGraphvizPerExecution(vect, descr) {
		let edges = descr.split("@#@");
		let i = 0;
		while (i < edges.length) {
			edges[i] = edges[i].split(",");
			i++;
		}
		let nodes = [];
		let nodesUuid = {};
		let invNodesUuid = {};
		for (let edge of edges) {
			if (!(nodes.includes(edge[0]))) {
				nodes.push(edge[0]);
				let uuid = OcdfgExecutionGraph.nodeUuid();
				nodesUuid[edge[0]] = uuid;
				invNodesUuid[uuid] = edge[0];
			}
			if (!(nodes.includes(edge[1]))) {
				nodes.push(edge[1]);
				let uuid = OcdfgExecutionGraph.nodeUuid();
				nodesUuid[edge[1]] = uuid;
				invNodesUuid[uuid] = edge[1];
			}
		}
		let gv = [];
		gv.push("digraph G {");
		for (let node of nodes) {
			gv.push(nodesUuid[node]+" [label=\""+node.replace("###"," ")+"\", style=\"filled\", fillcolor=\""+OcdfgExecutionGraph.stringToColour(node.split("###")[0])+"\", fontcolor=\"white\"]");
		}
		for (let edge of edges) {
			gv.push(nodesUuid[edge[0]]+"->"+nodesUuid[edge[1]]);
		}
		gv.push("}");
		return gv.join("\n");
	}
}