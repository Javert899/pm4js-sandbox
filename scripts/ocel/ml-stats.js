function prepareMLStats() {
	for (let fea of objFeatures["featureNames"]) {
		let opt = document.createElement("option");
		opt.value = fea;
		opt.text = fea;
		if (fea == "@@obj_lif_dur") {
			fea.selected = true;
		}
		document.getElementById("mlstatstargetvariable").appendChild(opt);
	}
}

function applyMLStats() {
	let thisUuid = Pm4JS.startAlgorithm({"name": "OCPM applyMLStats"});
	setTimeout(function() {
		let targetVariable = document.getElementById("mlstatstargetvariable").value;
		let metric = document.getElementById("mlstattypestatistic").value;
		let stats = MLgetStatistic(objFeatures, targetVariable, metric);
		MLdrawStatisticsInPlot(stats);
		Pm4JS.stopAlgorithm(thisUuid, {});
	}, 100);
}

function MLgetStatistic(fea, targetVariable, metric) {
	let fea2 = OcelObjectFeatures.transformToDct(fea);
	let metricVariables = {};
	for (let v of fea["featureNames"]) {
		metricVariables[v] = "metric";
	}
	var stats = new Statistics(fea2, metricVariables);
	let varValues = [];
	for (let v of fea["featureNames"]) {
		if (v != targetVariable) {
			let val = null;
			if (metric == "correlationCoefficient") {
				val = stats.correlationCoefficient(v, targetVariable).correlationCoefficient;
			}
			else if (metric == "covariance") {
				val = stats.covariance(v, targetVariable).covariance;
			}
			else if (metric == "goodmanKruskalsGamma") {
				val = stats.goodmanKruskalsGamma(v, targetVariable).gamma;
			}
			else if (metric == "kendallsTau") {
				val = stats.kendallsTau(v, targetVariable).b.tauB;
			}
			else if (metric == "spearmansRho") {
				val = stats.spearmansRho(v, targetVariable).rho;
			}
			varValues.push([v, val]);
		}
	}
	varValues.sort((a, b) => { return b[1] - a[1]; });
	return varValues;
}

function MLdrawStatisticsInPlot(stats, plotDiv="plotlyMLStatGraph") {
	let XAxis = [];
	let YAxis = [];
	for (let stat of stats) {
		XAxis.push(stat[1]);
		YAxis.push(stat[0]);
	}
	let trace1 = {
	  type: 'scatter',
	  x: XAxis,
	  y: YAxis,
	  mode: 'markers',
	  name: 'Percent of estimated voting age population'
	};
	let data = [trace1];
	Plotly.newPlot(plotDiv, data);
}