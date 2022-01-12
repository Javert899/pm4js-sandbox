function applyDT() {
	populateDToptions(objFeatures);
	buildDT();
}

function populateDToptions(fea) {
	for (let featureName of fea["featureNames"]) {
		let opt1 = document.createElement("option");
		opt1.value = featureName;
		opt1.text = featureName;
		let opt2 = document.createElement("option");
		opt2.value = featureName;
		opt2.text = featureName;
		document.getElementById("DTcategoryAttr").appendChild(opt1);
		document.getElementById("DTignoredAttributes").appendChild(opt2);
	}
}

function getConfigForDT(fea) {
	let categoryAttr = document.getElementById("DTcategoryAttr").value;
	let ignoredAttributes = [];
	for (let option of document.getElementById("DTignoredAttributes").childNodes) {
		if (option.selected) {
			ignoredAttributes.push(option.value);
		}
	}
	return {trainingSet: fea, categoryAttr: categoryAttr, ignoredAttributes: ignoredAttributes};
}

function buildDT() {
	let fea = OcelObjectFeatures.transformToDct(objFeatures);
	let config = getConfigForDT(fea);
	let decisionTree = new dt.DecisionTree(config);
	let nodes = DtUtils.dtToNodes(decisionTree);
	let gvizStri = DtUtils.getGvizString(nodes);
	let svgXml = Viz(gvizStri, { format: "svg"});
	
	document.getElementById("machineLearningDTResult").innerHTML = svgXml;
}