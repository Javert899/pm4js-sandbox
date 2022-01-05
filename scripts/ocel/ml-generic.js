function calculateEventFeatures() {
	evFeatures = OcelEventFeatures.apply(visualization.model.ocel, strAttributesForExtraction, numAttributesForExtraction);
	evFeaturesTable = OcelEventFeatures.produceTable(visualization.model.ocel, evFeatures);
}

function calculateObjectFeatures() {
	objFeatures = OcelObjectFeatures.apply(visualization.model.ocel, strAttributesForExtraction, numAttributesForExtraction);
	objFeaturesTable = OcelObjectFeatures.produceTable(visualization.model.ocel, objFeatures);
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
		sqlStatements = sqlStatements.join("\n");
		db.run(sqlStatements);
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
		sqlStatements = sqlStatements.join("\n");
		db.run(sqlStatements);
	}
}