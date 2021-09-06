class OcdfgVisualization {
	constructor(model, targetContainer) {
		this.model = model;
		this.targetContainer = targetContainer;
		document.getElementById(targetContainer).innerHTML = "";
		this.graph = new mxGraph(document.getElementById(targetContainer));
		//this.graph.updateCellSize(cell, true);
		this.original = model;
		this.ACTIVITY_FREQUENCY = 0.7;
		this.PATHS_FREQUENCY = 0.7;
		this.IDX = 0;
		this.expandedActivities = {};
		this.expandedEdges = {};
		this.resetVariables();
		this.addListeners();
		this.populateObjectTypes();
		this.callbackActivity = null;
		this.callbackEdge = null;
		this.callbackStatistics = null;
		this.displayType = "dfg";
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
	
	doExpandActivity(act) {
		this.expandedActivities[act] = 0;
	}
	
	represent(af = null, pf = null) {
		if (true) {
			let oldHeight = document.getElementById("graphContainer").offsetHeight;
			console.log(document.getElementById("graphContainer").offsetWidth);
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
					let activityObject = this.graph.insertVertex(parent, act, label, 150, 150, width, height, "fontSize=18;fillColor="+hex);
					this.activitiesIndipendent[act] = activityObject;
					this.invActivitiesIndipendent[activityObject.id] = act;
					/*if (act in this.expandedActivities) {
						for (let ot in this.model.otEventsView) {
							let otView = this.model.otEventsView[ot];
							if (act in otView.activities) {
								if (otView.satisfy(act, this.IDX, minEdgeCount)) {
									let color = this.stringToColour(ot);
									let intermediateNode = this.graph.insertVertex(parent, act+" "+ot, otView.toCompleteString(act).replaceAll("<br />", "\n").replaceAll("<br/>", "\n").replaceAll("<b>","").replaceAll("</b>",""), 150, 150, 275, 250, "fontSize=13;fillColor="+color+";fontColor=white;shape=hexagon");
									let arc1 = this.graph.insertEdge(parent, act+" "+ot+" -> "+act, "", intermediateNode, activityObject, "fontSize=16;strokeColor="+color+";fontColor="+color);
									this.activitiesDependent[[act, ot]] = intermediateNode;
									this.invActivitiesDependent[intermediateNode.id] = [act, ot];
								}
							}
						}
					}*/
				}
			}
			if (this.displayType == "dfg") {
				for (let ot in this.model.otEdges) {
					let otEdges = this.model.otEdges[ot];
					for (let edge in otEdges.edgesStatistics) {
						let activities = edge.split(",");
						if (activities[0] in this.activitiesIndipendent && activities[1] in this.activitiesIndipendent) {
							if (otEdges.satisfy(edge, this.IDX, minEdgeCount)) {
								let value = otEdges.getValue(edge, this.IDX);
								let edgeVect = [activities[0], activities[1], ot];
								let color = this.stringToColour(ot);
								let obj1 = this.activitiesIndipendent[activities[0]];
								let obj2 = this.activitiesIndipendent[activities[1]];
								if (edgeVect in this.expandedEdges) {
									let intermediateNode = this.graph.insertVertex(parent, "", otEdges.toCompleteString(edge), 150, 150, 275, 250, "fontSize=11;shape=doubleEllipse;fillColor="+color+";fontColor=white");
									let arc1 = this.graph.insertEdge(parent, null, "", obj1, intermediateNode, "fontSize=16;strokeColor="+color+";fontColor="+color);
									let arc2 = this.graph.insertEdge(parent, null, "", intermediateNode, obj2, "fontSize=16;strokeColor="+color+";fontColor="+color);
									this.graphEdges[edgeVect] = intermediateNode;
									this.invGraphEdges[intermediateNode.id] = edgeVect;
								}
								else {
									let penwidth = Math.floor(1 + Math.log(1 + value)/2);
									let label = otEdges.toReducedString(edge, this.IDX);
									let arc = this.graph.insertEdge(parent, edgeVect.toString(), label, obj1, obj2, "fontSize=16;strokeWidth="+penwidth+";strokeColor="+color+";fontColor="+color);
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
					let endpointWidth = ot.length * 10;
					let endpointHeight = 2 * 25;
					if (Object.keys(otSa).length > 0) {
						let saNode = this.graph.insertVertex(this.parent, "SA_"+ot, ot, 150, 150, endpointWidth, endpointHeight, "shape=ellipse;fontColor=white;fillColor="+color);
						this.saNodes[ot] = saNode;
						this.invSaNodes[saNode.id] = ot;
						for (let act in otSa) {
							let value = otSa[act];
							let penwidth = Math.floor(1 + Math.log(1 + value)/2);
							let arc = this.graph.insertEdge(parent, null, "UO="+value, saNode, this.activitiesIndipendent[act], "fontSize=16;strokeColor="+color+";fontColor="+color+";strokeWidth="+penwidth);
						}
					}
					let otEa = otObjects.filteredEa(minEdgeCount, this.activitiesIndipendent);
					if (Object.keys(otEa).length > 0) {
						endpointWidth = endpointHeight;
						let eaNode = this.graph.insertVertex(this.parent, "EA_"+ot, "", 150, 150, endpointWidth, endpointHeight, "shape=ellipse;fillColor="+color);
						this.eaNodes[ot] = eaNode;
						this.invEaNodes[eaNode.id] = ot;
						for (let act in otEa) {
							let value = otEa[act];
							let penwidth = Math.floor(1 + Math.log(1 + value)/2);
							let arc = this.graph.insertEdge(parent, null, "UO="+value, this.activitiesIndipendent[act], eaNode, "fontSize=16;strokeColor="+color+";fontColor="+color+";strokeWidth="+penwidth);
						}
					}
				}
			}
			else if (this.displayType == "petriNet") {
				for (let ot in this.model.otEventLogs) {
					let activities = Object.keys(this.activitiesIndipendent);
					let consideredLog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(this.model.otEventLogs[ot], activities);
					if (consideredLog.traces.length > 0) {
						this.model.otInductiveModels[ot] = ProcessTreeToPetriNetConverter.apply(InductiveMiner.apply(consideredLog, "concept:name", this.PATHS_FREQUENCY));
						this.model.otReplayedTraces[ot] = TokenBasedReplay.apply(consideredLog, this.model.otInductiveModels[ot]);
						this.model.otTransMap[ot] = {};
						for (let tid in this.model.otInductiveModels[ot].net.transitions) {
							let t = this.model.otInductiveModels[ot].net.transitions[tid];
							if (t.label != null) {
								this.model.otTransMap[ot][t.label] = t;
							}
						}
						let color = this.stringToColour(ot);
						let acceptingPetriNet = this.model.otInductiveModels[ot];
						let replayResult = this.model.otReplayedTraces[ot];
						for (let placeId in acceptingPetriNet.net.places) {
							let place = acceptingPetriNet.net.places[placeId];
							let placeLabel = "p="+replayResult.totalProducedPerPlace[place]+";m="+replayResult.totalMissingPerPlace[place]+"\nc="+replayResult.totalConsumedPerPlace[place]+";r="+replayResult.totalRemainingPerPlace[place];
							let placeSizeX = 130;
							let placeSizeY = 90;
							if (place in acceptingPetriNet.im.tokens) {
								placeLabel = ot;
								placeSizeX = 160;
								placeSizeY = 40;
							}
							let placeNode = this.graph.insertVertex(parent, "netPlace@@"+place.name, placeLabel, 150, 150, placeSizeX, placeSizeY, "fontSize=11;shape=ellipse;fillColor="+color+";fontColor=white");
							this.placesDict[place] = placeNode;
							this.invPlacesDict[placeNode] = place;
						}
						for (let transId in acceptingPetriNet.net.transitions) {
							let t = acceptingPetriNet.net.transitions[transId];
							let transNode = null;
							if (t.label == null) {
								transNode = this.graph.insertVertex(parent, "netTrans@@"+t.name, "tau", 150, 150, 90, 60, "fontSize=11;shape=box;fillColor="+color+";fontColor=white");
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
							if (arc.source in this.placesDict) {
								source = this.placesDict[arc.source];
								target = this.transDict[arc.target];
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
							let edgeLabel = "TO="+replayResult.arcExecutions[arc];
							let strokeWidth = "1";
							if (isDouble) {
								strokeWidth = "3";
							}
							this.graph.insertEdge(parent, arc.toString(), edgeLabel, source, target, "fontSize=10;strokeColor="+color+";fontColor="+color+";strokeWidth="+strokeWidth);
						}
					}
				}
			}
			
			var layout = new mxHierarchicalLayout(this.graph, mxConstants.DIRECTION_WEST);
			this.graph.getModel().beginUpdate();
			layout.execute(parent);
			this.graph.getModel().endUpdate();
			this.graph.fit();
			this.graph.view.rendering = true;
			this.graph.refresh();
			/*document.getElementById(this.targetContainer).style.height = oldHeight;
			console.log(oldHeight);
			console.log(document.getElementById("graphContainer").offsetHeight);*/
		}
	}
}