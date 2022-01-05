function calculateIsolationForest(ocel, targetDiv="machineLearningIsolationForestResult") {
	let isolationForest = new IsolationForest.IsolationForest();
	isolationForest.fit(objFeaturesTable["data"]);
	let trainingScores = isolationForest.scores();
	let objects = Object.keys(ocel["ocel:objects"]);
	let combo = [];
	let i = 0;
	while (i < objects.length) {
		combo.push([objects[i], trainingScores[i]]);
		i++;
	}
	combo.sort((a, b) => { return b[1] - a[1] });
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