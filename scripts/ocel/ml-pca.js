function applyPca(targetDiv="plotlyPCA") {
	let thisUuid = Pm4JS.startAlgorithm({"name": "OCPM applyPca"});
	setTimeout(function() {
		let dimRedTechnique = document.getElementById("dimensionalityReductionTechnique").value;
		let matrix = druid.Matrix.from(objFeaturesNormalizedFiltered["data"]);
		let proj = null;
		if (dimRedTechnique == "FASTMAP") {
			proj = new druid.FASTMAP(matrix, 2).transform().to2dArray;
		}
		else if (dimRedTechnique == "PCA") {
			proj = new druid.PCA(matrix, 2).transform().to2dArray;
		}
		else if (dimRedTechnique == "TSNE") {
			proj = new druid.TSNE(matrix, 2).transform().to2dArray;
		}
		let objects = Object.keys(visualization.model.ocel["ocel:objects"]);
		let objType = {};
		let objTypes = {};
		for (let objId of objects) {
			let obj = visualization.model.ocel["ocel:objects"][objId];
			objType[objId] = obj["ocel:type"];
			objTypes[obj["ocel:type"]] = 0;
		}
		objTypes = Object.keys(objTypes);
		var data = [];
		for (let ott of objTypes) {
			let serie = {x: [], y: [], text: [], type: "scatter", mode: "markers", name: ott};
			let i = 0;
			while (i < proj.length) {
				if (objType[objects[i]] == ott) {
					serie.x.push(proj[i][0]);
					serie.y.push(proj[i][1]);
					serie.text.push(objects[i]+" ("+objType[objects[i]]+")");
				}
				i++;
			}
			data.push(serie);
		}
		var layout = {
			title: "Dimensionality Reduction",
			xaxis: {
				title: "First Component"
			},
			yaxis: {
				title: "Second Component"
			}
		};
		Plotly.newPlot('plotlyPCA', data, layout, {responsive: true});
		Pm4JS.stopAlgorithm(thisUuid, {});
	}, 100);
}
