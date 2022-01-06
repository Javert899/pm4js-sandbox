function applyPca(targetDiv="plotlyPCA") {
		let pca = new ML.PCA(objFeaturesNormalizedFiltered["data"]);
		let proj = pca.predict(objFeaturesNormalizedFiltered["data"]).data;
		let objects = Object.keys(visualization.model.ocel["ocel:objects"]);
		let objType = {};
		for (let objId of objects) {
			let obj = visualization.model.ocel["ocel:objects"][objId];
			objType[objId] = obj["ocel:type"];
		}
		let serie = {x: [], y: [], text: [], type: "scatter", mode: "markers", name: "objects_PCA"};
		let i = 0;
		while (i < proj.length) {
			serie.x.push(proj[i][0]);
			serie.y.push(proj[i][1]);
			serie.text.push(objects[i]+" ("+objType[objects[i]]+")");
			i++;
		}
		var data = [serie];
		var layout = {
			title: "Objects PCA",
			xaxis: {
				title: "First Principal Component"
			},
			yaxis: {
				title: "Second Principal Component"
			}
		};
		Plotly.newPlot('plotlyPCA', data, layout, {responsive: true});
}
