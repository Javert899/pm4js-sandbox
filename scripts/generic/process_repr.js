function rgbColor(percent) {
    return [255 * percent, 255 * (1 - percent), 255 * (1 - percent)];
}

function hexFromRGB(r, g, b) {
    var hex = [
        Math.floor(r).toString( 16 ),
        Math.floor(g).toString( 16 ),
        Math.floor(b).toString( 16 )
    ];
    $.each( hex, function( nr, val ) {
        if ( val.length === 1 ) {
            hex[ nr ] = "0" + val;
        }
    });
    return "#" + hex.join( "" ).toLowerCase();
}

function reprModel(model) {
    let repr = "digraph {\n";
    let codeToAct = {}
    let index = 0;
    repr += "sanode [width=\"0.75\",label=\"\",shape=\"circle\",style=filled,fillcolor=\"green\"];\n";
    repr += "eanode [width=\"0.75\",label=\"\",shape=\"circle\",style=filled,fillcolor=\"orange\"];\n";
    let min_soj_time = 1000000000000000;
    let max_soj_time = 0;
    for (let act in model["sojourn_time"]) {
        let soj = model["sojourn_time"][act];
        min_soj_time = Math.min(min_soj_time, soj);
        max_soj_time = Math.max(max_soj_time, soj);
    }
    min_soj_time = Math.log(1 + min_soj_time);
    max_soj_time = Math.log(1 + max_soj_time);

    for (let act in model["activities_frequency"]) {
        codeToAct[act] = index;
        let label = act+" ("+model["activities_frequency"][act]+")";
        let soj = model["sojourn_time"][act];
        let hex_color_soj_time = "#ffffff";
        if (max_soj_time > min_soj_time) {
            let perc = (Math.log(1 + soj) - min_soj_time)/(max_soj_time-min_soj_time);
            let rgb_array = rgbColor(perc);
            hex_color_soj_time = hexFromRGB(rgb_array[0], rgb_array[1], rgb_array[2]);
        }
        label += "\nsoj="+humanizeDuration(Math.round(soj*1000000));
        let actFreqCases = model["activity_frequency_cases"][act];
        let lskAnnotation = 0;
        if (act in model["lsk_annotations"]) {
            lskAnnotation = model["lsk_annotations"][act];
        }
        let tsAnnotation = 0;
        if (act in model["ts_annotations"]) {
            tsAnnotation = model["ts_annotations"][act];
        }
        label += "\n\ntc="+actFreqCases+"/cfd="+lskAnnotation+"/td="+tsAnnotation+"";
        repr += index+" [label=\""+label+"\", shape=\"box\", fontsize=\"10pt\", style=filled, fillcolor=\""+hex_color_soj_time+"\"];\n"
        index++;
    }
    for (let it0 in model["performance_dfg"]) {
        let it = model["performance_dfg"][it0];
        let act1 = it[0][0];
        let act2 = it[0][1];
        let perf = it[1];
        let penwidth = 0.5 + Math.log10(1 + perf);
        repr += codeToAct[act1] + "->" + codeToAct[act2]+" [label=\""+humanizeDuration(Math.round(perf*1000000))+"\"; penwidth=\""+penwidth+"\",fontsize=\"9pt\"];\n";
    }
    for (let sa in model["start_activities"]) {
        let count = model["start_activities"][sa];
        repr += "sanode->"+codeToAct[sa]+" [label=\"\"];\n";
    }
    for (let ea in model["end_activities"]) {
        let count = model["end_activities"][ea];
        repr += codeToAct[ea]+"->eanode [label=\"\"];\n";
    }
    repr = repr + "}\n";
    console.log(repr);
    return repr;
}
