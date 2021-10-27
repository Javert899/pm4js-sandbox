function downloadBaseEventLog(analysisId, processConfiguration) {
	let dataModel = celonisMapper.dataModels[celonisMapper.analysisDataModel[analysisId]];
	let dataModelTables = celonisMapper.dataModelsTables[dataModel["id"]];
	let activityTable = dataModelTables[processConfiguration["activityTableId"]];
	let query = [];
	query.push("TABLE(");
	query.push("\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\" AS \"ocel:omap\", ");
	query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"ocel:activity\", ");
	query.push("\""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" AS \"ocel:timestamp\") NOLIMIT;");
	query = query.join("");
	let res = CsvImporter.parseCSV(celonisMapper.performQueryAnalysis(analysisId, query));
	return [activityTable, res];
}

function downloadRelations(analysisId, processConfiguration1, processConfiguration2) {
	let dataModel = celonisMapper.dataModels[celonisMapper.analysisDataModel[analysisId]];
	let dataModelTables = celonisMapper.dataModelsTables[dataModel["id"]];
	let activityTable1 = dataModelTables[processConfiguration1["activityTableId"]];
	let activityTable2 = dataModelTables[processConfiguration2["activityTableId"]];
	let activityColumn1 = processConfiguration1["activityColumn"];
	let activityColumn2 = processConfiguration2["activityColumn"];
	let timestampColumn1 = processConfiguration1["timestampColumn"];
	let timestampColumn2 = processConfiguration2["timestampColumn"];
	let caseColumn2 = processConfiguration2["caseIdColumn"];
	let query = [];
	query.push("TABLE (");
	query.push("TRANSIT_COLUMN ( TIMESTAMP_INTERLEAVED_MINER (");
	query.push("\""+activityTable2+"\".\""+activityColumn2+"\", ");
	query.push("\""+activityTable1+"\".\""+activityColumn1+"\"), ");
	query.push("\""+activityTable2+"\".\""+caseColumn2+"\"), ");
	query.push("\""+activityTable1+"\".\""+activityColumn1+"\", ");
	query.push("\""+activityTable1+"\".\""+timestampColumn1+"\"");
	query.push(") NOLIMIT;");
	query = query.join("");
	try {
		let res0 = celonisMapper.performQueryAnalysis(analysisId, query);
		return CsvImporter.parseCSV(res0);
	}
	catch (err) {
		console.log(err);
		return [];
	}
}

function downloadDataModelFromCelonis() {
	let analysisId = document.getElementById("dataModelSelectionUpload").value;
	let dataModelId = celonisMapper.analysisDataModel[analysisId];
	let dataModel = celonisMapper.dataModels[dataModelId];
	let ocel = {"ocel:global-log": {"ocel:attribute-names": [], "ocel:object-types": []}, "ocel:events": {}, "ocel:objects": {}};
	for (let conf of dataModel.processConfigurations) {
		let arr = downloadBaseEventLog(analysisId, conf);
		let ot = arr[0];
		let log = arr[1];
		ocel["ocel:global-log"]["ocel:object-types"].push(ot);
		let i = 1;
		while (i < log.length) {
			let evid = log[i][1] + log[i][2];
			let objId = log[i][0];
			let eve = {"ocel:activity": log[i][1], "ocel:timestamp": new Date(log[i][2])};
			ocel["ocel:events"][evid] = {"ocel:activity": log[i][1], "ocel:timestamp": new Date(log[i][2]), "ocel:omap": {objId: 0}};
			if (!(objId in ocel["ocel:objects"])) {
				ocel["ocel:objects"][objId] = {"ocel:type": ot};
			}
			i++;
		}
	}
	let i = 0;
	while (i < dataModel.processConfigurations.length) {
		let j = 0;
		while (j < dataModel.processConfigurations.length) {
			if (i != j) {
				let ret = downloadRelations(analysisId, dataModel.processConfigurations[i], dataModel.processConfigurations[j]);
				let z = 1;
				while (z < ret.length) {
					let evid = ret[z][1] + ret[z][2];
					let objId = ret[z][0];
					ocel["ocel:events"][evid]["ocel:omap"][objId] = 0;
					z = z + 1;
				}
			}
			j++;
		}
		i++;
	}
	for (let evId in ocel["ocel:events"]) {
		if ("objId" in ocel["ocel:events"][evId]["ocel:omap"]) {
			delete ocel["ocel:events"][evId]["ocel:omap"]["objId"];
		}
		ocel["ocel:events"][evId]["ocel:omap"] = Object.keys(ocel["ocel:events"][evId]["ocel:omap"]);
	}
	eventLog = ocel;
	createVisualization();
}