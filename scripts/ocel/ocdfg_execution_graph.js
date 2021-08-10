class OcdfgExecutionGraph {
	constructor(model) {
		this.model = model;
		this.ingoingEdges = {};
		this.outgoingEdges = {};
		this.buildGraph();
		this.executions = null;
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
		let objGraphviz = {};
		for (let obj in this.outgoingEdges) {
			try {
				let vect = this.getSubgraphPerNode(obj);
				let firstObjectOfExecution = vect[2][0];
				let lastObjectOfExecution = vect[2][vect[2].length - 1];
				let minTimest = 9999999999999999;
				let maxTimest = -minTimest;
				for (let subobjId of vect[2]) {
					let subobj = objectsIds[subobjId];
					minTimest = Math.min(minTimest, subobj[0][2]);
					maxTimest = Math.max(maxTimest, subobj[subobj.length-1][2]);
				}
				objExecutionDuration[obj] = maxTimest - minTimest;
				vectExecutions[obj] = vect;
				let descr = this.getDescriptionPerExecution(vect);
				objGraphviz[obj] = this.getGraphvizPerExecution(vect);
				if (descr != "") {
					if (!(descr in descrCount)) {
						descrCount[descr] = 0;
						descrObjs[descr] = [];
						descrDurations[descr] = [];
						descrGraphviz[descr] = this.getGraphvizPerExecutionDescr(vect, descr);
					}
					descrCount[descr] += 1;
					descrObjs[descr].push(obj);
					descrDurations[descr].push(objExecutionDuration[obj]);
				}
			}
			catch (err) {
				console.log(err);
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
		this.executions = [descrCountArray, descrObjs, vectExecutions, objExecutionDuration, descrDurations, objGraphviz, descrGraphviz];
		return this.executions;
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
	
	getGraphvizPerExecutionDescr(vect, descr) {
		let edges = descr.split("@#@");
		let i = 0;
		while (i < edges.length) {
			edges[i] = edges[i].split(",");
			i++;
		}
		let nodes = [];
		let nodesUuid = {};
		for (let edge of edges) {
			if (!(nodes.includes(edge[0]))) {
				nodes.push(edge[0]);
				let uuid = OcdfgExecutionGraph.nodeUuid();
				nodesUuid[edge[0]] = uuid;
			}
			if (!(nodes.includes(edge[1]))) {
				nodes.push(edge[1]);
				let uuid = OcdfgExecutionGraph.nodeUuid();
				nodesUuid[edge[1]] = uuid;
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
	
	getGraphvizPerExecution(vect) {
		let vectNodes = vect[0];
		let edges0 = vect[1];
		let edges = [];
		let i = 0;
		while (i < edges0.length) {
			edges.push(edges0[i].split(","));
			i++;
		}
		let nodes = [];
		let nodesUuid = {};
		for (let edge of edges) {
			if (!(nodes.includes(edge[0]))) {
				nodes.push(edge[0]);
				let uuid = OcdfgExecutionGraph.nodeUuid();
				nodesUuid[edge[0]] = uuid;
			}
			if (!(nodes.includes(edge[1]))) {
				nodes.push(edge[1]);
				let uuid = OcdfgExecutionGraph.nodeUuid();
				nodesUuid[edge[1]] = uuid;
			}
		}
		let gv = [];
		gv.push("digraph G {");
		for (let node of nodes) {
			gv.push(nodesUuid[node]+" [label=\""+node+"\n("+vectNodes[node]+")\", style=\"filled\", fillcolor=\""+OcdfgExecutionGraph.stringToColour(vectNodes[node])+"\", fontcolor=\"white\"]");
		}
		for (let edge of edges) {
			gv.push(nodesUuid[edge[0]]+"->"+nodesUuid[edge[1]]);
		}
		gv.push("}");
		return gv.join("\n");
	}
	
	buildExecutionsTable(container) {
		let descrCountArray = this.executions[0];
		let descrObjs = this.executions[1];
		let descrDurations = this.executions[4];
		let descrGraphvizs = this.executions[6];
		container.innerHTML = "";
		let thead = document.createElement("thead");
		let tbody = document.createElement("tbody");
		container.appendChild(thead);
		container.appendChild(tbody);
		let header = document.createElement("tr");
		thead.appendChild(header);
		let executionGraphviz = document.createElement("th");
		executionGraphviz.innerHTML = "Grouping Graph";
		header.appendChild(executionGraphviz);
		let executionCount = document.createElement("th");
		executionCount.innerHTML = "Count";
		header.appendChild(executionCount);
		let executionMedianPerformance = document.createElement("th");
		executionMedianPerformance.innerHTML = "Median Perf. (s)";
		header.appendChild(executionMedianPerformance);
		let executionFiltering = document.createElement("th");
		executionFiltering.innerHTML = "";
		header.appendChild(executionFiltering);
		let exeGraphHtml = [];
		for (let descr of descrCountArray) {
			let descrName = descr[0];
			let descrCount = descr[1];
			let descrDuration = descrDurations[descrName];
			let descrGraphviz = descrGraphvizs[descrName];
			let svgXml = Viz(descrGraphviz, { format: "svg"});
			/*let exRow = document.createElement("tr");
			tbody.appendChild(exRow);
			let td_gg = document.createElement("td");
			let inner_gg = document.createElement("div");
			td_gg.appendChild(inner_gg);
			let td_c = document.createElement("td");
			let td_m = document.createElement("td");
			let td_f = document.createElement("td");
			exRow.appendChild(td_gg);
			exRow.appendChild(td_c);
			exRow.appendChild(td_m);
			exRow.appendChild(td_f);
			inner_gg.innerHTML = svgXml;
			inner_gg.style.width = "900px";
			inner_gg.style.overflow = "auto";
			td_c.innerHTML = descrCount;
			td_m.innerHTML = descrDuration;
			td_f.innerHTML = "<a href=\"javascript:executionGraphFilterDescr('"+descrName+"')\"><i class=\"fas fa-filter\"></i></a>";*/
			exeGraphHtml.push("<tr>");
			exeGraphHtml.push("<td><div style='width: 900px; overflow: auto'>"+svgXml+"</div></td>");
			exeGraphHtml.push("<td>"+descrCount+"</td>");
			exeGraphHtml.push("<td>"+descrDuration+"</td>");
			exeGraphHtml.push("<td><a href=\"javascript:executionGraphFilterDescr('"+descrName+"')\"><i class=\"fas fa-filter\"></i></a></td>");
			exeGraphHtml.push("</tr>");
		}
		tbody.innerHTML = exeGraphHtml.join("");
		sorttable.makeSortable(container);
	}
	
	getObjectIdentifiers(descr) {
		let descrObjs = this.executions[1];
		return descrObjs[descr];
	}
}