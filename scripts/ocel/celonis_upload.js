function uploadFlattenedToCelonis() {
	document.getElementById("mainViewNoLoader").style.display = "none";
	document.getElementById("htmlLoadView").style.display = "";
	Swal.fire({
	  title: 'Insert the Celonis data pool name',
	  input: 'text',
	  inputAttributes: {
		autocapitalize: 'off'
	  },
	  showCancelButton: true,
	  confirmButtonText: 'Upload',
	}).then((result) => {
		if (result.isConfirmed) {
			try {
				let ot = document.getElementById("flatteningOt").value;
				let eventLog = OcelFlattening.flatten(visualization.model.ocel, ot);
				let res = celonis1DWrapper.uploadEventLogToCelonis(eventLog, result.value, false);
				Swal.fire('Uploaded!', '', 'success');
			}
			catch (err) {
				console.log(err);
				Swal.fire('Error!', '', 'error');
			}
		}
		document.getElementById("mainViewNoLoader").style.display = "";
		document.getElementById("htmlLoadView").style.display = "none";
	});
}

function uploadEntireToCelonis() {
	document.getElementById("mainViewNoLoader").style.display = "none";
	document.getElementById("htmlLoadView").style.display = "";
	Swal.fire({
	  title: 'Insert the Celonis data pool name',
	  input: 'text',
	  inputAttributes: {
		autocapitalize: 'off'
	  },
	  showCancelButton: true,
	  confirmButtonText: 'Upload',
	}).then((result) => {
		if (result.isConfirmed) {
			try {
				let res = celonisNDWrapper.uploadOcelToCelonis(visualization.model.ocel, result.value, false);
				Swal.fire({
					title: "Uploaded!",
					html: "<h5>Knowledge YAML:</h5>"+res["knowledgeYaml"].replaceAll("\n","<br />")+"<br /><br /><h5>Model YAML:</h5>"+res["modelYaml"].replaceAll("\n","<br />")+"<br /><br />"
				});
			}
			catch (err) {
				console.log(err);
				Swal.fire('Error!', '', 'error');
			}
		}
		document.getElementById("mainViewNoLoader").style.display = "";
		document.getElementById("htmlLoadView").style.display = "none";
	});
}