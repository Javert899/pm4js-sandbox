function connectToCelonis() {
	document.getElementById("celonis_connection_parameters").style.display = "none";
	document.getElementById("celonis_waiting_circle").style.display = "";
	try {
		celonisUrl = document.getElementById("celonis_url").value;
		celonisApi = document.getElementById("celonis_api").value;
		celonisMapper = new CelonisMapper(celonisUrl, celonisApi);
		celonis1DWrapper = new Celonis1DWrapper(celonisMapper);
		celonisNDWrapper = new CelonisNDWrapper(celonisMapper);
		document.getElementById("celonisUploadOcel").style.display = "";
		document.getElementById("flattenEventLogUploadCelonis").style.display = "";		
		fillDataModelSelectionUpload();
	}
	catch (err) {
		document.getElementById("celonis_connection_parameters").style.display = "";
		document.getElementById("celonis_waiting_circle").style.display = "none";
		console.log(err);
	}
}

function fillDataModelSelectionUpload() {
	let dataModelSelectionUpload = document.getElementById("dataModelSelectionUpload");
	for (let analysisId in celonisMapper.analysis) {
		let analysis = celonisMapper.analysis[analysisId];
		let dataModelId = celonisMapper.analysisDataModel[analysisId];
		let dataModel = celonisMapper.dataModels[dataModelId];
		let dataPoolId = celonisMapper.dataModelsDataPools[dataModelId];
		let dataPool = celonisMapper.dataPools[dataPoolId];
		let option = document.createElement("option");
		option.value = analysisId;
		option.text = analysis["name"] + " (DP="+dataPool["name"]+"; DM="+dataModel["name"]+")";
		dataModelSelectionUpload.appendChild(option);
	}
}