function calculateEventFeatures() {
	evFeatures = OcelEventFeatures.apply(visualization.model.ocel, strAttributesForExtraction, numAttributesForExtraction);
	evFeaturesTable = OcelEventFeatures.produceTable(visualization.model.ocel, evFeatures);
	evFeaturesNormalizedFiltered = OcelEventFeatures.apply(visualization.model.ocel, strAttributesForExtraction, numAttributesForExtraction);
	evFeaturesNormalizedFiltered = OcelEventFeatures.scaling(evFeaturesNormalizedFiltered);
	evFeaturesNormalizedFiltered = OcelEventFeatures.filterOnVariance(evFeaturesNormalizedFiltered, featVarianceThreshold);
	evFeaturesCorrDct = null;
	evFeaturesCorrDct = {};
	let i = 0;
	while (i < evFeatures["featureNames"].length) {
		evFeaturesCorrDct[evFeatures["featureNames"][i]] = i;
		i++;
	}
}

function calculateObjectFeatures() {
	objFeatures = OcelObjectFeatures.apply(visualization.model.ocel, strAttributesForExtraction, numAttributesForExtraction);
	objFeaturesTable = OcelObjectFeatures.produceTable(visualization.model.ocel, objFeatures);
	objFeaturesNormalizedFiltered = OcelObjectFeatures.apply(visualization.model.ocel, strAttributesForExtraction, numAttributesForExtraction);
	objFeaturesNormalizedFiltered = OcelObjectFeatures.scaling(objFeaturesNormalizedFiltered);
	objFeaturesNormalizedFiltered = OcelObjectFeatures.filterOnVariance(objFeaturesNormalizedFiltered, featVarianceThreshold);
	objFeaturesCorrDct = null;
	objFeaturesCorrDct = {};
	let i = 0;
	while (i < objFeatures["featureNames"].length) {
		objFeaturesCorrDct[objFeatures["featureNames"][i]] = i;
		i++;
	}
}

function prepareSQLDatabase() {
	db = new SQL.Database();
}

function insertObjectFeaturesInSQLDatabase() {
	if (db != null) {
		let table = objFeaturesTable;
		let sqlStatements = [];
		let creation = "CREATE TABLE OCEL_OBJECTS (";
		let i = 0;
		while (i < table["featureNames"].length) {
			if (i > 0) {
				creation += ", ";
			}
			creation = creation + table["featureNames"][i];
			if (i == 0) {
				creation = creation + " char";
			}
			else {
				creation = creation + " numeric";
			}
			i++;
		}
		creation = creation + ");";
		sqlStatements.push(creation);
		let data = table["data"];
		i = 0;
		while (i < data.length) {
			let state = "INSERT INTO OCEL_OBJECTS VALUES (";
			let j = 0;
			while (j < data[i].length) {						
				if (j > 0) {
					state += ",";
				}
				
				if (j == 0) {
					state += "'" + data[i][j] + "'";
				}
				else {
					state += data[i][j];
				}
				j++;
			}
			state += ");";
			sqlStatements.push(state);
			i++;
		}
		
		try {
			let jointString = sqlStatements.join("\n");
			db.run(jointString);
		}
		catch (err0) {
			for (let state of sqlStatements) {
				try {
					db.run(state);
				}
				catch (err) {
					//console.log(state);
					//console.log(err);
					//break;
				}
			}
		}

	}
}

function insertEventFeaturesInSQLDatabase() {
	if (db != null) {		
		let table = evFeaturesTable;
		let sqlStatements = [];
		let creation = "CREATE TABLE OCEL_EVENTS (";
		let i = 0;
		while (i < table["featureNames"].length) {
			if (i > 0) {
				creation += ", ";
			}
			creation = creation + table["featureNames"][i];
			if (i == 0) {
				creation = creation + " char";
			}
			else {
				creation = creation + " numeric";
			}
			i++;
		}
		creation = creation + ");";
		sqlStatements.push(creation);
		let data = table["data"];
		i = 0;
		while (i < data.length) {
			let state = "INSERT INTO OCEL_EVENTS VALUES (";
			let j = 0;
			while (j < data[i].length) {						
				if (j > 0) {
					state += ",";
				}
				
				if (j == 0) {
					state += "'" + data[i][j] + "'";
				}
				else {
					state += data[i][j];
				}
				j++;
			}
			state += ");";
			sqlStatements.push(state);
			i++;
		}
		
		try {
			let jointString = sqlStatements.join("\n");
			db.run(jointString);
		}
		catch (err0) {
			for (let state of sqlStatements) {
				try {
					db.run(state);
				}
				catch (err) {
					//console.log(state);
					//console.log(err);
					//break;
				}
			}
		}
	}
}