function downloadDataModelFromCelonis() {
	let analysisId = document.getElementById("dataModelSelectionUpload").value;
	let ocel = celonisNDWrapper.downloadDataModelFromCelonis(analysisId);
	eventLog = ocel;
	createVisualization();
}