function executeSQLQueryInternal(query, targetDiv="machineLearningSQLResult") {
	let thisUuid = Pm4JS.startAlgorithm({"name": "OCPM executeSQLQueryInternal"});
	setTimeout(function() {
		let stmt = db.prepare(query);
		const res = db.exec(query);
		let ret = ["<table border='1'><thead><tr>"];
		for (let col of res[0]["columns"]) {
			ret.push("<th>"+col+"</th>");
		}
		ret.push("</tr></thead><tbody>");
		for (let row of res[0]["values"]) {
			ret.push("<tr>");
			let i = 0;
			while (i < row.length) {
				ret.push("<td>"+row[i]+"</td>");
				i++;
			}
			ret.push("</tr>");
		}
		ret.push("</tbody>");
		ret.push("</table>");
		ret = ret.join("");
		document.getElementById(targetDiv).innerHTML = ret;
		Pm4JS.stopAlgorithm(thisUuid, {});
	}, 100);
}