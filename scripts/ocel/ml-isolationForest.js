function anomalyScorePerObjectType(ocel, ot) {
	let combo = [];
	let objects = Object.keys(ocel["ocel:objects"]);
	let i = 0;
	let filteredDataObjects = [];
	let filteredData = [];
	while (i < objects.length) {
		let obj = ocel["ocel:objects"][objects[i]];
		if (obj["ocel:type"] == ot) {
			filteredData.push(objFeaturesTable["data"][i]);
			filteredDataObjects.push(objects[i]);
		}
		i++;
	}
	let isolationForest = new IsolationForest.IsolationForest();
	isolationForest.fit(objFeaturesTable["data"]);
	let trainingScores = isolationForest.scores();
	i = 0;
	while (i < filteredDataObjects.length) {
		combo.push([objects[i], trainingScores[i]]);
		i++;
	}
	combo.sort((a, b) => { return b[1] - a[1] });
	return combo;
}

function rulesPerObjectType(ocel, ot, percAnom=0.1) {
	let scores = anomalyScorePerObjectType(ocel, ot);
	let anomObjects = {};
	let i = 0;
	while (i < scores.length * percAnom) {
		anomObjects[scores[i][0]] = 0;
		i++;
	}
	let classification = [];
	let objects = Object.keys(ocel["ocel:objects"]);
	i = 0;
	while (i < objects.length) {
		if (objects[i] in anomObjects) {
			classification.push(-1);
		}
		else {
			classification.push(1);
		}
		i++;
	}
	let discoveredRules = MlRules.ruleDiscovery(objFeaturesTable["data"], objFeaturesTable["featureNames"], classification);
	let classificationScore = MlRules.ruleClassificationScore(discoveredRules, objFeaturesTable["data"], objFeaturesTable["featureNames"], classification);
	let deviationsPerRule = {};
	for (let k in discoveredRules) {
		let cl = MlRules.getClassificationFromRule(discoveredRules, objFeaturesTable["data"], objFeaturesTable["featureNames"], k);
		deviationsPerRule[k] = [];
		i = 0;
		while (i < objects.length) {
			if (objects[i] in anomObjects) {
				if (cl[i] == -1) {
					deviationsPerRule[k].push(objects[i]);
				}
			}
			i++;
		}
	}
	let combo = [];
	for (let k in discoveredRules) {
		if (classificationScore[k] > 0) {
			combo.push([k, discoveredRules[k][0], discoveredRules[k][1], classificationScore[k], deviationsPerRule[k]]);
		}
	}
	combo.sort((a, b) => { return b[3] - a[3] });
	return combo;
}

function showRulesPerObjectType(percAnom=0.1) {
	let ocel = visualization.model.ocel;
	let ot = document.getElementById("conformanceRulesOtSelection").value;
	let rules = rulesPerObjectType(ocel, ot, percAnom=0.1);
	document.getElementById("conformanceRulesTbody").innerHTML = "";
	for (let rule of rules) {
		let tr = document.createElement("tr");
		document.getElementById("conformanceRulesTbody").appendChild(tr);
		tr.innerHTML = "<td>"+rule[0]+"</td><td>"+rule[1]+"</td><td>"+rule[2]+"</td><td>"+rule[3]+"</td><td>"+rule[4].length+"</td><td><a href=\"javascript:filterExactSetObjects('"+rule[4].join(',')+"')\"><i class=\"fas fa-filter\"></i></a></td>";
		console.log(rule);
	}
}

function identifyAnomalousObjects(ocel) {
	let objectTypes = Object.keys(GeneralOcelStatistics.objectsPerTypeCount(ocel));
	let combo = [];
	for (let ot of objectTypes) {
		combo = [...combo, ...anomalyScorePerObjectType(ocel, ot)];
		//rulesPerObjectType(ocel, ot);
	}
	combo.sort((a, b) => { return b[1] - a[1] });
	return combo;
}

function calculateIsolationForest(ocel, targetDiv="machineLearningIsolationForestResult") {
	let combo = identifyAnomalousObjects(ocel);
	let objects = Object.keys(ocel["ocel:objects"]);
	let objTypes = {};
	for (let objId of objects) {
		objTypes[objId] = ocel["ocel:objects"][objId]["ocel:type"];
	}
	let resp = ["<table><thead><tr>"];
	resp.push("<th>Object ID</th><th>Object Type</th><th>Anomaly Score</th>");
	resp.push("</tr></thead><tbody>");
	let count = 0;
	for (let c of combo) {
		count = count + 1;
		resp.push("<tr>");
		resp.push("<td><a href=\"javascript:clickedObjectInEveTable('"+c[0]+"')\">"+c[0]+"</a></td>");
		resp.push("<td>"+objTypes[c[0]]+"</td>");
		resp.push("<td>"+c[1]+"</td>");
		resp.push("</tr>");
	}
	resp.push("</tbody></table>");
	resp = resp.join("");
	document.getElementById(targetDiv).innerHTML = resp;
}