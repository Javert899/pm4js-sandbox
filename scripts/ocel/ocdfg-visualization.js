class OcdfgVisualization {
	constructor(model, targetContainer) {
		this.model = model;
		this.targetContainer = targetContainer;
		document.getElementById(targetContainer).innerHTML = "";
		this.graph = new mxGraph(document.getElementById(targetContainer));
		//this.graph.updateCellSize(cell, true);
		this.original = model;
		this.ACTIVITY_FREQUENCY = 0.7;
		this.PATHS_FREQUENCY = 0.0;
		this.DEFAULT_DIRECTION = "horizontal";
		this.IDX = 0;
		this.expandedActivities = {};
		this.expandedEdges = {};
		this.elementStatistics = {};
		this.resetVariables();
		this.addListeners();
		this.populateObjectTypes();
		this.callbackActivity = null;
		this.callbackEdge = null;
		this.callbackStatistics = null;
		this.displayType = "bpmn";
		this.petriNetEnableDecorations = true;
	}
	
	exportSvg(graph) {
		var svgDocument = mxUtils.createXmlDocument();
		var root = (svgDocument.createElementNS != null) ?
			svgDocument.createElementNS(mxConstants.NS_SVG, 'svg') : svgDocument.createElement('svg');
		
		if (svgDocument.createElementNS == null) {
			root.setAttribute('xmlns', mxConstants.NS_SVG);
			root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
		} else {
			root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
		}

		var svgCanvas = new mxSvgCanvas2D(root);

		// Translate the canvas to ensure there are no negative coordinates
		svgCanvas.translate(-graph.view.translate.x, -graph.view.translate.y);
		
		// Now get the graph bounds
		var bounds = graph.getGraphBounds();
		bounds.width += bounds.x;
		bounds.height += bounds.y;
		
		// Scale the canvas
		svgCanvas.scale(graph.view.scale);

		var imgExport = new mxImageExport();
		imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas, bounds);

		var svg = encodeURIComponent(mxUtils.getXml(root));
		var link = document.createElement('a');
		link.setAttribute('href-lang', 'image/svg+xml');
		link.setAttribute('href', 'data:image/svg+xml,' + svg);
		link.setAttribute('download', 'graph.svg');
		
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	removeElements() {
		this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()));
	}
	
	resetVariables() {
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
		this.placesDict = {};
		this.invPlacesDict = {};
		this.transDict = {};
		this.invTransDict = {};
	}
	
	resetFilters() {
		this.expandedActivities = {};
		this.expandedEdges = {};
		this.model = this.original;
		this.populateObjectTypes();
		this.populateStatistics();
	}
	
	setFilteredModel(model) {
		this.model = model;
		this.populateObjectTypes();
		this.populateStatistics();
		this.represent();
	}
	
	populateStatistics() {
		if (this.callbackStatistics != null) {
			this.callbackStatistics(this.model.getNumEvents(), this.model.getNumUniqueObjects(), this.model.getNumTotalObjects(), this.original.getNumEvents(), this.original.getNumUniqueObjects(), this.original.getNumTotalObjects());
		}
	}
	
	populateObjectTypes(target_select="objectTypes", target_select_2="flatteningOt", target_select_3="otObjListSelection") {
		try {
			let objectTypes = document.getElementById(target_select);
			objectTypes.innerHTML = "";
			for (let ot of this.model.ocel["ocel:global-log"]["ocel:object-types"]) {
				let opt = document.createElement("option");
				opt.innerHTML = ot;
				opt.value = ot;
				opt.selected = true;
				objectTypes.appendChild(opt);
			}
		}
		catch (err) {
			console.log(err);
		}
		
		try {
			let objectTypes = document.getElementById(target_select_2);
			objectTypes.innerHTML = "";
			for (let ot of this.model.ocel["ocel:global-log"]["ocel:object-types"]) {
				let opt = document.createElement("option");
				opt.innerHTML = ot;
				opt.value = ot;
				objectTypes.appendChild(opt);
			}
		}
		catch (err) {
			console.log(err);
		}
		
		try {
			let objectTypes = document.getElementById(target_select_3);
			objectTypes.innerHTML = "";
			for (let ot of this.model.ocel["ocel:global-log"]["ocel:object-types"]) {
				let opt = document.createElement("option");
				opt.innerHTML = ot;
				opt.value = ot;
				objectTypes.appendChild(opt);
			}
		}
		catch (err) {
			console.log(err);
		}
	}
	
	addListeners() {
		var self = this;
		this.graph.addListener(mxEvent.CLICK, function (sender, evt) {
			var cell = evt.getProperty("cell");
			const menu = document.getElementById("menu");
			menu.style.display = 'none';

			try {
				if (cell.id in self.invActivitiesIndipendent) {
					let act = self.invActivitiesIndipendent[cell.id];
					if (self.callbackActivity != null) {
						self.callbackActivity(act, null);
					}
					let htmlStri = self.model.overallEventsView.toCompleteString(act);
					
					menu.innerHTML = "";
					
					let li1 = document.createElement("li");
					menu.appendChild(li1);
					li1.innerHTML = "<a href=\"javascript:filterRelatedObjectsActivity()\"><i class='fas fa-filter'></i>Filter Rel.Obj</a>";
					let li2 = document.createElement("li");
					li2.innerHTML = "<a href=\"javascript:seeRelatedObjAct()\"><i class='fab fa-connectdevelop'></i>See Rel.Obj.</a>";
					menu.appendChild(li2);
					let li3 = document.createElement("li");
					li3.innerHTML = "<a href=\"javascript:expandActivity()\"><i class='fas fa-expand'></i>&nbsp;Expand Activity</a>";
					menu.appendChild(li3);
					let li4 = document.createElement("li");
					li4.innerHTML = "<a href=\"javascript:Swal.fire({title: 'Activity Statistics', confirmButton: 'Ok', html: '"+htmlStri+"'})\"><i class='fas fa-chart-pie'></i>&nbsp;Statistics</a>";
					menu.appendChild(li4);
					menu.style.setProperty('--mouse-x', evt.properties.event.clientX + 'px');
					menu.style.setProperty('--mouse-y', evt.properties.event.clientY + 'px');
					menu.style.display = 'block';
				}
				else if (cell.id in self.invGraphEdges) {
					let edgeVect = self.invGraphEdges[cell.id];
					if (self.callbackEdge != null) {
						self.callbackEdge(edgeVect);
					}
					let htmlStri = self.model.otEdges[edgeVect[2]].toCompleteString(edgeVect[0]+","+edgeVect[1]);
					
					menu.innerHTML = "";
					
					let li1 = document.createElement("li");
					menu.appendChild(li1);
					li1.innerHTML = "<a href=\"javascript:filterRelatedObjectsEdge()\"><i class='fas fa-filter'></i>&nbsp;Filter Rel. Obj.</a>";
					let li2 = document.createElement("li");
					li2.innerHTML = "<a href=\"javascript:filterNonRelatedObjectsEdge()\"><i class='fas fa-filter'></i>&nbsp;Filter Non Rel.Obj</a>";
					menu.appendChild(li2);
					let li3 = document.createElement("li");
					li3.innerHTML = "<a href=\"javascript:seeRelatedObjEdge()\"><i class='fab fa-connectdevelop'></i>&nbsp;See Rel.Obj. Edge</a>";
					menu.appendChild(li3);
					let li5 = document.createElement("li");
					li5.innerHTML = "<a href=\"javascript:expandEdge()\"><i class='fas fa-expand'></i>&nbsp;Expand Edge</a>";
					menu.appendChild(li5);
					let li4 = document.createElement("li");
					li4.innerHTML = "<a href=\"javascript:Swal.fire({title: 'Edge Statistics', confirmButton: 'Ok', html: '"+htmlStri+"'})\"><i class='fas fa-chart-pie'></i>&nbsp;Statistics</a>";
					menu.appendChild(li4);
					menu.style.setProperty('--mouse-x', evt.properties.event.clientX + 'px');
					menu.style.setProperty('--mouse-y', evt.properties.event.clientY + 'px');
					menu.style.display = 'block';
				}
				else if (cell.id in self.invActivitiesDependent) {					
					let actOt = self.invActivitiesDependent[cell.id];
					if (self.callbackActivity != null) {
						self.callbackActivity(actOt[0], actOt[1]);
					}
					
					menu.innerHTML = "";
					let htmlStri = self.model.otEventsView[actOt[1]].toCompleteString(actOt[0]);
					
					let li1 = document.createElement("li");
					menu.appendChild(li1);
					li1.innerHTML = "<a href=\"javascript:filterRelatedObjectsActivity()\"><i class='fas fa-filter'></i>&nbsp;Filter Rel.Obj</a>";
					let li2 = document.createElement("li");
					li2.innerHTML = "<a href=\"javascript:filterNonRelatedObjectsActivity()\"><i class='fas fa-filter'></i>&nbsp;Filter Non Rel.Obj</a>";
					menu.appendChild(li2);
					let li3 = document.createElement("li");
					li3.innerHTML = "<a href=\"javascript:filterNonStartingWith()\"><i class='fas fa-filter'></i>&nbsp;Filter Non Starting With</a>";
					menu.appendChild(li3);
					let li4 = document.createElement("li");
					li4.innerHTML = "<a href=\"javascript:filterNonEndingWith()\"><i class='fas fa-filter'></i>&nbsp;Filter Non Ending With</a>";
					menu.appendChild(li4);
					/*let divider1 = document.createElement("li");
					divider1.classList.add("divider");
					divider1.innerHTML = "&nbsp;";
					menu.appendChild(divider1);*/
					let li5 = document.createElement("li");
					li5.innerHTML = "<a href=\"javascript:seeRelatedObjAct()\"><i class='fab fa-connectdevelop'></i>&nbsp;See Rel.Obj.</a>";
					menu.appendChild(li5);
					let li6 = document.createElement("li");
					li6.innerHTML = "<a href=\"javascript:Swal.fire({title: 'Activity-Object Type', confirmButton: 'Ok', html: '"+htmlStri+"'})\"><i class='fas fa-chart-pie'></i>&nbsp;Statistics</a>";
					menu.appendChild(li6);
					menu.style.setProperty('--mouse-x', evt.properties.event.clientX + 'px');
					menu.style.setProperty('--mouse-y', evt.properties.event.clientY + 'px');
					menu.style.display = 'block';
				}
				else if (cell.id in self.elementStatistics) {
					Swal.fire({confirmButton: 'Ok', html: self.elementStatistics[cell.id]});
				}
			}
			catch (err) {
				console.log(err);
			}
		});
	}
	
	calculatePre() {
		this.MIN_INDIPENDENT_ACT_COUNT = 100000000000000;
		this.MAX_INDIPENDENT_ACT_COUNT = 0;
		this.MIN_EDGE_COUNT = 100000000000000;
		this.MAX_EDGE_COUNT = 0;
		
		for (let act in this.model.overallEventsView.activitiesCounters) {
			let act_count = this.model.overallEventsView.getValue(act, this.IDX);
			this.MIN_INDIPENDENT_ACT_COUNT = Math.min(this.MIN_INDIPENDENT_ACT_COUNT, act_count);
			this.MAX_INDIPENDENT_ACT_COUNT = Math.max(this.MAX_INDIPENDENT_ACT_COUNT, act_count);
		}
		for (let ot in this.model.otEdges) {
			let ev = this.model.otEdges[ot];
			for (let edge in ev.edgesStatistics) {
				let edge_count = ev.getValue(edge, this.IDX);
				this.MIN_EDGE_COUNT = Math.min(this.MIN_EDGE_COUNT, edge_count);
				this.MAX_EDGE_COUNT = Math.max(this.MAX_EDGE_COUNT, edge_count);
			}
		}
	}
	
	doExpandActivity(act) {
		this.expandedActivities[act] = 0;
	}
	
	somma(arr) {
		let i = 0;
		let sum = 0.0;
		if (arr != null) {
			while (i < arr.length) {
				sum += arr[i];
				i++;
			}
		}
		return sum;
	}
	
	represent(af = null, pf = null, direction = null) {
		let thisUuid = Pm4JS.startAlgorithm({"name": "OcdfgVisualization"});
		let self = this;
		this.model.otInductiveModels = null;
		this.model.otInductiveModelsBPMN = null;
		this.model.otTransMap = null;
		this.model.otTransMapBPMN = null;
		this.model.otReplayedTraces = null;
		this.model.otReplayedTracesBPMN = null;
		this.model.otInductiveModels = {};
		this.model.otInductiveModelsBPMN = {};
		this.model.otTransMap = {};
		this.model.otTransMapBPMN = {};
		this.model.otReplayedTraces = {};
		this.model.otReplayedTracesBPMN = {};
		
		let activitiesFilter = [];
		if (af == null) {
			af = this.ACTIVITY_FREQUENCY;
		}
		if (pf == null) {
			pf = this.PATHS_FREQUENCY;
		}
		if (direction == null) {
			direction = this.DEFAULT_DIRECTION;
		}
		this.calculatePre();
		let minActiCount = (1 - af) * this.MAX_INDIPENDENT_ACT_COUNT;
		
		for (let act in this.model.overallEventsView.activities) {
			if (this.model.overallEventsView.satisfy(act, this.IDX, minActiCount)) {
				activitiesFilter.push(act);
			}
		}
		
		setTimeout(function() {
			if (self.displayType.startsWith("petriNet") || self.displayType.startsWith("bpmn")) {
				for (let ot in self.model.otEventLogs) {
					let consideredLog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(self.model.otEventLogs[ot], activitiesFilter);
					if (consideredLog.traces.length > 0) {
						self.model.otInductiveModels[ot] = ProcessTreeToPetriNetConverter.apply(InductiveMiner.apply(consideredLog, "concept:name", 1.0-pf, null, false, true));
						self.model.otInductiveModelsBPMN[ot] = WfNetToBpmnConverter.apply(self.model.otInductiveModels[ot]);
						self.model.otTransMap[ot] = {};
						for (let tid in self.model.otInductiveModels[ot].net.transitions) {
							let t = self.model.otInductiveModels[ot].net.transitions[tid];
							if (t.label != null) {
								self.model.otTransMap[ot][t.label] = t;
							}
						}
						self.model.otTransMapBPMN[ot]= {};
						for (let nodeId in self.model.otInductiveModelsBPMN[ot].nodes) {
							let node = self.model.otInductiveModelsBPMN[ot].nodes[nodeId];
							if (node.type == "task") {
								self.model.otTransMapBPMN[ot][node.name] = node;
							}
						}
					}
				}
				self.representDetail(af, pf, direction);
				if (self.displayType.startsWith("petriNet")) {
					setTimeout(function() {
						for (let ot in self.model.otEventLogs) {
							let consideredLog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(self.model.otEventLogs[ot], activitiesFilter);
							if (consideredLog.traces.length > 0) {
								let tbrResult = TokenBasedReplay.apply(consideredLog, self.model.otInductiveModels[ot]);
								self.model.otReplayedTraces[ot] = tbrResult;
							}
						}
						self.representDetail(af, pf, direction);
						Pm4JS.stopAlgorithm(thisUuid, {});
					}, 500);
				}
				else if (self.displayType.startsWith("bpmn")) {
					setTimeout(function() {
						for (let ot in self.model.otEventLogs) {
							let consideredLog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(self.model.otEventLogs[ot], activitiesFilter);
							if (consideredLog.traces.length > 0) {
								let netPlusMap = BpmnToPetriNetConverter.apply(self.model.otInductiveModelsBPMN[ot], false, true);
								let tbrResult = TokenBasedReplay.apply(consideredLog, netPlusMap[0]);
								tbrResult["bpmnArcMap"] = {};
								tbrResult["bpmnNodeMap"] = {};
								for (let arcId in netPlusMap[1]) {
									tbrResult["bpmnArcMap"][arcId] = tbrResult["totalConsumedPerPlace"][netPlusMap[1][arcId]] + tbrResult["totalMissingPerPlace"][netPlusMap[1][arcId]];
								}
								for (let nodeId in netPlusMap[2]) {
									tbrResult["bpmnNodeMap"][nodeId] = [];
									
									for (let el of netPlusMap[2][nodeId]) {
										let xx = tbrResult["transExecutionPerformance"][el];
										let xxSum = self.somma(xx);
										if (xxSum > 0) {
											tbrResult["bpmnNodeMap"][nodeId] = [...tbrResult["bpmnNodeMap"][nodeId], ...xx];
										}
									}
								}
								console.log(tbrResult);
								self.model.otReplayedTracesBPMN[ot] = tbrResult;
							}
						}
						self.representDetail(af, pf, direction);
						Pm4JS.stopAlgorithm(thisUuid, {});
					}, 500);
				}
			}
			else if (self.displayType.startsWith("dfg")) {
				self.representDetail(af, pf, direction);
				Pm4JS.stopAlgorithm(thisUuid, {});
			}
		}, 100);
	}
	
	representDetail(af = null, pf = null, direction = "horizontal") {
		if (direction == "horizontal") {
			direction = mxConstants.DIRECTION_WEST;
		}
		else if (direction == "vertical") {
			direction = mxConstants.DIRECTION_NORTH;
		}
		let oldHeight = document.getElementById(this.targetContainer).offsetHeight;
		this.resetVariables();
		this.removeElements();
		this.calculatePre();
		if (af == null) {
			af = this.ACTIVITY_FREQUENCY;
		}
		if (pf == null) {
			pf = this.PATHS_FREQUENCY;
		}
		this.ACTIVITY_FREQUENCY = af;
		this.PATHS_FREQUENCY = pf;
		let minActiCount = (1 - af) * this.MAX_INDIPENDENT_ACT_COUNT;
		let minEdgeCount = (1 - pf) * this.MAX_EDGE_COUNT;
		var parent = this.graph.getDefaultParent();
		this.graph.convertValueToString = function(cell) {
			try {
				var div = document.createElement('div');
				div.innerHTML = cell.value;
				return div;
			}
			catch (err) {
				return "err";
			}
		}
		for (let act in this.model.overallEventsView.activities) {
			if (this.model.overallEventsView.satisfy(act, this.IDX, minActiCount)) {
				let count = this.model.overallEventsView.getValue(act, this.IDX);
				let width = Math.floor(this.model.overallEventsView.getThisWidth(act, act in this.expandedActivities) * 10);
				let height = Math.floor(this.model.overallEventsView.getThisHeight(act, act in this.expandedActivities) * 25);
				let label = this.model.overallEventsView.toReducedString(act, this.IDX);
				if (act in this.expandedActivities) {
					height = 250;
					label = this.model.overallEventsView.toIntermediateString(act, this.IDX);
				}
				let cc = Math.floor(125 + 125 * (this.MAX_INDIPENDENT_ACT_COUNT - count)/(this.MAX_INDIPENDENT_ACT_COUNT - this.MIN_INDIPENDENT_ACT_COUNT + 0.000001));
				cc = cc + 256 * cc + 256*256 * cc;
				let hex = "#"+Number(cc).toString(16);
				let activityObject = this.graph.insertVertex(parent, act, label, 150, 150, width, height, "fontSize=19;fillColor="+hex);
				this.activitiesIndipendent[act] = activityObject;
				this.invActivitiesIndipendent[activityObject.id] = act;
			}
		}
		if (this.displayType.startsWith("dfg")) {
			for (let ot in this.model.otEdges) {
				let otEdges = this.model.otEdges[ot];
				for (let edge in otEdges.edgesStatistics) {
					let activities = edge.split(",");
					if (activities[0] in this.activitiesIndipendent && activities[1] in this.activitiesIndipendent) {
						if (otEdges.satisfy(edge, this.IDX, minEdgeCount)) {
							let edgePerformance = this.somma(otEdges.edgesPerformance[[activities[0],activities[1]]]);
							let value = otEdges.getValue(edge, this.IDX);
							let edgeVect = [activities[0], activities[1], ot];
							let color = this.model.stringToColour(ot);
							let obj1 = this.activitiesIndipendent[activities[0]];
							let obj2 = this.activitiesIndipendent[activities[1]];
							
							let penwidth = Math.floor(1 + Math.log(1 + value)/2);
							let label = "";
							if (this.displayType.endsWith("Performance")) {
								if (edgePerformance >= 1) {
									label = "ECp=<br/>"+humanizeDuration(edgePerformance).replaceAll(",","<br/>");
								}
							}
							else {
								label = otEdges.toReducedString(edge, this.IDX);
								if (edgeVect in this.expandedEdges) {
									label = otEdges.toIntermediateString(edge, this.IDX);
								}
							}
							let arc = this.graph.insertEdge(parent, edgeVect.toString(), label, obj1, obj2, "curved=1;fontSize=19;strokeWidth="+penwidth+";strokeColor="+color+";fontColor="+color);
							this.graphEdges[edgeVect] = arc;
							this.invGraphEdges[arc.id] = edgeVect;
						}
					}
				}
			}
			for (let ot in this.model.otObjectsView) {
				let color = this.model.stringToColour(ot);
				let otObjects = this.model.otObjectsView[ot];
				let otSa = otObjects.filteredSa(minEdgeCount, this.activitiesIndipendent);
				let endpointWidth = ot.length * 10;
				let endpointHeight = 2 * 25;
				if (Object.keys(otSa).length > 0) {
					let saNode = this.graph.insertVertex(this.parent, "SA_"+ot, ot, 150, 150, endpointWidth, endpointHeight, "shape=ellipse;fontSize=15;fontColor=white;fillColor="+color);
					this.saNodes[ot] = saNode;
					this.invSaNodes[saNode.id] = ot;
					for (let act in otSa) {
						let value = otSa[act];
						let penwidth = Math.floor(1 + Math.log(1 + value)/2);
						let label = "UO="+value;
						if (this.displayType.endsWith("Performance")) {
							label = "";
						}
						let arc = this.graph.insertEdge(parent, null, label, saNode, this.activitiesIndipendent[act], "curved=1;fontSize=19;strokeColor="+color+";fontColor="+color+";strokeWidth="+penwidth);
					}
				}
				let otEa = otObjects.filteredEa(minEdgeCount, this.activitiesIndipendent);
				if (Object.keys(otEa).length > 0) {
					endpointWidth = endpointHeight;
					let eaNode = this.graph.insertVertex(this.parent, "EA_"+ot, "", 150, 150, endpointWidth, endpointHeight, "shape=ellipse;fontSize=15;fillColor="+color);
					this.eaNodes[ot] = eaNode;
					this.invEaNodes[eaNode.id] = ot;
					for (let act in otEa) {
						let value = otEa[act];
						let penwidth = Math.floor(1 + Math.log(1 + value)/2);
						let label = "UO="+value;
						if (this.displayType.endsWith("Performance")) {
							label = "";
						}
						let arc = this.graph.insertEdge(parent, null, label, this.activitiesIndipendent[act], eaNode, "curved=1;fontSize=19;strokeColor="+color+";fontColor="+color+";strokeWidth="+penwidth);
					}
				}
			}
		}
		else if (this.displayType.startsWith("bpmn")) {
			for (let ot in this.model.otObjectsView) {
				let color = this.model.stringToColour(ot);
				if (ot in this.model.otInductiveModelsBPMN) {
					for (let nodeId in this.model.otInductiveModelsBPMN[ot].nodes) {
						let node = this.model.otInductiveModelsBPMN[ot].nodes[nodeId];
						let transNode = null;
						if (node.type == "startEvent") {
							let thisLabel = ot;
							let sizeX = 170;
							let sizeY = 40;
							let fontSize = "16";
							transNode = this.graph.insertVertex(parent, "startEvent@@"+nodeId, thisLabel, 150, 150, sizeX, sizeY, "fontSize="+fontSize+";shape=ellipse;fillColor="+color+";fontColor=white");
						}
						else if (node.type == "endEvent") {
							let thisLabel = " ";
							let sizeX = 40;
							let sizeY = 40;
							let fontSize = "16";
							transNode = this.graph.insertVertex(parent, "endEvent@@"+nodeId, thisLabel, 150, 150, sizeX, sizeY, "fontSize="+fontSize+";shape=ellipse;fillColor="+color+";fontColor=white");
						}
						else if (node.type == "parallelGateway") {
							let thisLabel = "+";
							let sizeX = 40;
							let sizeY = 40;
							let fontSize = "16";
							transNode = this.graph.insertVertex(parent, "parallelGateway@@"+nodeId, thisLabel, 150, 150, sizeX, sizeY, "fontSize="+fontSize+";shape=rhombus;fillColor="+color+";fontColor=white");
						}
						else if (node.type == "exclusiveGateway") {
							let thisLabel = "X";
							let sizeX = 40;
							let sizeY = 40;
							let fontSize = "16";
							transNode = this.graph.insertVertex(parent, "exclusiveGateway@@"+nodeId, thisLabel, 150, 150, sizeX, sizeY, "fontSize="+fontSize+";shape=rhombus;fillColor="+color+";fontColor=white");
						}
						else if (node.type == "task") {
							transNode = this.activitiesIndipendent[node.name];
						}
						
						if (transNode != null) {
							this.transDict[nodeId] = transNode;
							this.invTransDict[transNode] = node;
						}
					}
					for (let edgeId in this.model.otInductiveModelsBPMN[ot].edges) {
						let edge = this.model.otInductiveModelsBPMN[ot].edges[edgeId];
						let sourceId = edge.source.id;
						let targetId = edge.target.id;
						let arcPerformance = 0;
						if (ot in this.model.otReplayedTracesBPMN) {
							
							let nodePerf = this.model.otReplayedTracesBPMN[ot]["bpmnNodeMap"][edge.source];
							if (nodePerf != null) {
								if (nodePerf.length > 0) {
									arcPerformance = this.somma(nodePerf);
								}
							}
						}
						let source = this.transDict[sourceId];
						let target = this.transDict[targetId];
						let edgeLabel = " ";
						let fontSize = "10";
						if (ot in this.model.otReplayedTracesBPMN) {
							if (this.displayType.endsWith("Performance")) {
								if (arcPerformance >= 1) {
									edgeLabel = "TOp=<br />"+humanizeDuration(arcPerformance).replaceAll(",","<br />");
									fontSize = "10";
								}
								else {
									edgeLabel = "";
								}
							}
							else {
								edgeLabel = "TO="+this.model.otReplayedTracesBPMN[ot]["bpmnArcMap"][edgeId];
							}
						}
						this.graph.insertEdge(parent, edgeId, edgeLabel, source, target, "curved=1;fontSize="+fontSize+";strokeColor="+color+";fontColor="+color+";strokeWidth=1");
					}
				}
			}
		}
		else if (this.displayType.startsWith("petriNet")) {
			for (let ot in this.model.otEventLogs) {
				let activities = Object.keys(this.activitiesIndipendent);
				if (ot in this.model.otInductiveModels) {
					let color = this.model.stringToColour(ot);
					let acceptingPetriNet = this.model.otInductiveModels[ot];
					let replayResult = this.model.otReplayedTraces[ot];
					for (let placeId in acceptingPetriNet.net.places) {
						let place = acceptingPetriNet.net.places[placeId];
						let placeSizeX = 40;
						let placeSizeY = 40;
						let fontSize = "16";
						let placeLabel = "";
						let tokensPlaceEnum = "";
						if (replayResult != null) {
							tokensPlaceEnum = "p="+replayResult.totalProducedPerPlace[place]+";m="+replayResult.totalMissingPerPlace[place]+"<br />c="+replayResult.totalConsumedPerPlace[place]+";r="+replayResult.totalRemainingPerPlace[place];
						}
						
						if (this.petriNetEnableDecorations || place in acceptingPetriNet.im.tokens) {
							placeLabel = tokensPlaceEnum;
							placeSizeX = 100;
							placeSizeY = 100;
							fontSize = "16";
							if (place in acceptingPetriNet.im.tokens) {
								placeLabel = ot;
								placeSizeX = 170;
								placeSizeY = 40;
								fontSize = "16";
							}
						}
						let placeNode = this.graph.insertVertex(parent, "netPlace@@"+place.name, placeLabel, 150, 150, placeSizeX, placeSizeY, "fontSize="+fontSize+";shape=ellipse;fillColor="+color+";fontColor=white");
						this.placesDict[place] = placeNode;
						this.invPlacesDict[placeNode] = place;
						this.elementStatistics[placeNode.id] = tokensPlaceEnum;
					}
					for (let transId in acceptingPetriNet.net.transitions) {
						let t = acceptingPetriNet.net.transitions[transId];
						let transNode = null;
						if (t.label == null) {
							transNode = this.graph.insertVertex(parent, "netTrans@@"+t.name, " ", 150, 150, 25, 30, "fontSize=11;shape=box;fillColor="+color+";fontColor=white");
							
							if (replayResult != null) {
								this.elementStatistics[transNode.id] = "number of executions for invisible = " + replayResult.transExecutions[transId];
							}
							else {
								this.elementStatistics[transNode.id] = "";
							}
						}
						else {
							transNode = this.activitiesIndipendent[t.label];
						}
						this.transDict[t] = transNode;
						this.invTransDict[transNode] = t;
					}
					for (let arcId in acceptingPetriNet.net.arcs) {
						let arc = acceptingPetriNet.net.arcs[arcId];
						let source = null;
						let target = null;
						let isDouble = false;
						let arcPerformance = 0;
						if (arc.source in this.placesDict) {
							source = this.placesDict[arc.source];
							target = this.transDict[arc.target];
							if (ot in this.model.otReplayedTraces) { 
								arcPerformance = this.somma(this.model.otReplayedTraces[ot]["transExecutionPerformance"][arc.target]);
							}
							if (arc.target.label != null) {
								let numEvents = this.model.otEventsView[ot].getValue(arc.target.label, 0);
								let numObjects = this.model.otEventsView[ot].getValue(arc.target.label, 1);
								if (numObjects > numEvents) {
									isDouble = true;
								}
							}
						}
						else {
							source = this.transDict[arc.source];
							target = this.placesDict[arc.target];
							if (arc.source.label != null) {
								let numEvents = this.model.otEventsView[ot].getValue(arc.source.label, 0);
								let numObjects = this.model.otEventsView[ot].getValue(arc.source.label, 1);
								if (numObjects > numEvents) {
									isDouble = true;
								}
							}
						}
						let edgeLabel = "";
						let fontSize = "10";
						if (replayResult != null) {
							if (this.displayType.endsWith("Performance")) {
								if (arcPerformance >= 1) {
									edgeLabel = "TOp=<br />"+humanizeDuration(arcPerformance).replaceAll(",","<br />");
									fontSize = "10";
								}
								else {
									edgeLabel = "";
								}
							}
							else {
								edgeLabel = "TO="+replayResult.arcExecutions[arc];
							}
						}
						let strokeWidth = "1";
						if (isDouble) {
							strokeWidth = "5";
						}
						this.graph.insertEdge(parent, arc.toString(), edgeLabel, source, target, "curved=1;fontSize="+fontSize+";strokeColor="+color+";fontColor="+color+";strokeWidth="+strokeWidth);
					}
				}
			}
		}
		
		var layout = new mxHierarchicalLayout(this.graph, direction);
		layout.edgeStyle=2;
		if (this.displayType.startsWith("petriNet")) {
			layout.intraCellSpacing=17;
			layout.interRankCellSpacing=40;
		}
		this.graph.getModel().beginUpdate();
		layout.execute(parent);
		this.graph.getModel().endUpdate();
		this.graph.fit();
		this.graph.isCellMovable = function() { return false; };
		this.graph.view.rendering = true;
		this.graph.refresh();
		
		//this.exportSvg(this.graph);
	}
}