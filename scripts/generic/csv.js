class CSVManager {
	static parseCSV(str, sep=CSVManager.DEFAULT_SEPARATOR, quotechar=CSVManager.DEFAULT_QUOTECHAR) {
		var arr = [];
		var quote = false;  // 'true' means we're inside a quoted field

		// Iterate over each character, keep track of current row and column (of the returned array)
		for (var row = 0, col = 0, c = 0; c < str.length; c++) {
			var cc = str[c], nc = str[c+1];        // Current character, next character
			arr[row] = arr[row] || [];             // Create a new row if necessary
			arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

			// If the current character is a quotation mark, and we're inside a
			// quoted field, and the next character is also a quotation mark,
			// add a quotation mark to the current column and skip the next character
			if (cc == quotechar && quote && nc == quotechar) { arr[row][col] += cc; ++c; continue; }

			// If it's just one quotation mark, begin/end quoted field
			if (cc == quotechar) { quote = !quote; continue; }

			// If it's a comma and we're not in a quoted field, move on to the next column
			if (cc == sep && !quote) { ++col; continue; }

			// If it's a newline (CRLF) and we're not in a quoted field, skip the next character
			// and move on to the next row and move to column 0 of that new row
			if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

			// If it's a newline (LF or CR) and we're not in a quoted field,
			// move on to the next row and move to column 0 of that new row
			if (cc == '\n' && !quote) { ++row; col = 0; continue; }
			if (cc == '\r' && !quote) { ++row; col = 0; continue; }

			// Otherwise, append the current character to the current column
			arr[row][col] += cc;
		}
		return arr;
	}

	static CSVtoEventLog(str, sep=CSVManager.DEFAULT_SEPARATOR, quotechar=CSVManager.DEFAULT_QUOTECHAR, caseId=CSVManager.DEFAULT_CASE_ID, activity=CSVManager.DEFAULT_ACTIVITY, timestamp=CSVManager.DEFAULT_TIMESTAMP) {
		let csvArray = CSVManager.parseCSV(str, sep=sep, quotechar=quotechar);
		let traces = {};
		let i = 1;
		let j = 0;
		let log = new EventLog();
		while (i < csvArray.length) {
			let eve = new Event();
			j = 0;
			while (j < csvArray[i].length) {
				eve.attributes[csvArray[0][j]] = new Attribute(csvArray[i][j]);
				j++;
			}
			eve.attributes[CSVManager.DEFAULT_ACTIVITY] = eve.attributes[activity];
			eve.attributes[CSVManager.DEFAULT_TIMESTAMP] = new Attribute(new Date(eve.attributes[timestamp].value));
			let thisCaseId = eve.attributes[caseId].value;
			let trace = null;
			if (thisCaseId in traces) {
				trace = traces[thisCaseId];
			}
			else {
				trace = new Trace();
				trace.attributes[CSVManager.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE] = new Attribute(thisCaseId);
				traces[thisCaseId] = trace;
				log.traces.push(trace);
			}
			trace.events.push(eve);
			i++;
		}
		return log;
	}

	static EventLogToCSVstring(eventLog, sep=CSVManager.DEFAULT_SEPARATOR, quotechar=CSVManager.DEFAULT_QUOTECHAR, casePrefix=CSVManager.DEFAULT_CASE_PREFIX) {
		let caseAttributes = LogStatistics.getCaseAttributesList(eventLog);
		let eventAttributes0 = LogStatistics.getEventAttributesList(eventLog);
		let eventAttributes = [];
		for (let ea of eventAttributes0) {
			if (!(ea.startsWith(casePrefix))) {
				eventAttributes.push(ea);
			}
		}
		let ret = [];
		let header = "";
		for (let ca of caseAttributes) {
			header += casePrefix+ca+sep;
		}
		for (let ea of eventAttributes) {
			header += ea+sep;
		}
		header = header.slice(0, -1);
		ret.push(header);
		for (let trace of eventLog.traces) {
			let pref = "";
			for (let ca of caseAttributes) {
				let val = trace.attributes[ca];
				if (val != null) {
					val = val.value;
					if (typeof val == "string" && val.includes(sep)) {
						pref += quotechar+val+quotechar+sep;
					}
					else if (typeof val == "object") {
						prefix += val.toISOString()+sep;
					}
					else {
						pref += val+sep;
					}
				}
				else {
					pref += sep;
				}
			}
			for (let eve of trace.events) {
				let eveStr = ""+pref;
				for (let ea of eventAttributes) {
					let val = eve.attributes[ea];
					if (val != null) {
						val = val.value;
						if (typeof val == "string" && val.includes(sep)) {
							eveStr += quotechar+val+quotechar+sep;
						}
						else if (typeof val == "object") {
							eveStr += val.toISOString()+sep;
						}
						else {
							eveStr += val+sep;
						}
					}
					else {
						eveStr += sep;
					}
				}
				eveStr = eveStr.slice(0, -1);
				ret.push(eveStr);
			}
		}
		ret = ret.join('\n');
		return ret;
	}
}

CSVManager.DEFAULT_CASE_ID = "case:concept:name";
CSVManager.DEFAULT_ACTIVITY = "concept:name";
CSVManager.DEFAULT_TIMESTAMP = "time:timestamp";
CSVManager.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE = "concept:name";
CSVManager.DEFAULT_CASE_PREFIX = "case:";
CSVManager.DEFAULT_SEPARATOR = ',';
CSVManager.DEFAULT_QUOTECHAR = '"';