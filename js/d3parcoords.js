// retrieve values of an attribute
function unpack(rows, key) {
  return rows.map(function(row) {
    return row[key];
  });
}

// sort users on ascending order of distance_std
function compare_distance_std(a, b) {
  if (a["distance_std"] < b["distance_std"]) {
    return -1;
  }
  if (a["distance_std"] > b["distance_std"]) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

var cluster_users = null;
function cluster_onchange(){
	c = parseInt($("#clusters").val().split("r")[1])
	if(cluster_users != null){
		userslist = cluster_users[$("#clusters").val()]
		console.log(userslist);
		$('#userslist')
			.find('option')
			.remove()
			.end();
		
		uid = parseInt($("#userid option:selected")[0].text)
		
		n_closest = parseInt($("#n_closest_farthest option:selected")[0].text)
		
		var colors = [];
		
		var colors_center_close = ["#696969", "#228B22", "#1F51FF", "#880808"];
		var colors_center_middle = ["#A9A9A9", "#32CD32", "#72A0C1", "#FF4433"];
		var colors_center_far = ["#D3D3D3", "#90EE90", "#A7C7E7", "#FA8072"];
		
		for(var i = 0; i < userslist.length; i++) {
			var color = colors_center_middle[c-1];
			if(i < n_closest){
				color = colors_center_close[c-1];
			}
			else if(i >= userslist.length - n_closest){
				color = colors_center_far[c-1];
			}else{
				color = colors_center_middle[c-1];
			}
			
			if(n_closest == 0){
				color = colors_center_far[c-1];
			}
			
			if($("#changeonlycb")[0].checked){
				color = colors_center_far[c-1];
			}
			colors.push(color);
		}
		
		$.each(userslist, function(index, value) {		
	
			 if(value == uid){
				 $('#userslist')
				 .append($("<option selected " + "style='background-color:" + colors[index] + ";'" + "></option>")
							.attr("value", index)
							.text(value));
			 }
			 else{
				 
				 $('#userslist')
				 .append($("<option " + "style='background-color:" + colors[index] + ";'" + "></option>")
							.attr("value", index)
							.text(value));
			 } 
		});
	}
	console.log("changed to", $("#clusters").val())
	
	$("#userslist").trigger("change");
	
	//console.log(userslist)
}

function userslist_onchange(){
	//uid = $("#userslist").val()
	
	if($("#userslist")[0].value==''){
		svg_cluster
		.selectAll(".user").remove()
		return;
	}
	
	uid = parseInt($("#userslist option:selected")[0].text)
	
	//$( "#userid" )[0].value = uid.toString();
	
	console.log("userslist changed to uid", uid)
	//console.log(userslist)
		
	svg_cluster
		.selectAll(".user").remove()
		
	if(uid != null){
		svg_cluster
			.selectAll("myPath3")
			.data(data_parcoords.filter(function(el){return el.userid==uid}))
			.enter()
			.append("path")
			  .attr("class", function (d) { return "line user " + "ccc"+d.cluster } ) // 2 class for each line: 'line' and the group name
			  .attr("d",  path)
			  .style("fill", "none" )
			  .style("stroke", function(d){ return( color_center("cc"+d.cluster) )} )
			  .style("stroke-width", 2)
			  .style("opacity", 0.8)
			  
		//svg_cluster
		//	.selectAll(".user").remove()
		
		/*
		// disable checkboxes (will be re-enabled when the graph is ready)
		$("#ctrbar").prop("disabled", true);
		$("#ctrpielandcover").prop("disabled", true);
		$("#ctrcloud").prop("disabled", true);
		$("#ctrnetwork").prop("disabled", true);
		
		
		update(true, true, true, true, true, tmpMode, false);
		*/
	}
}

function userid_onchange(){
	//uid = $("#userslist").val()
	
	uid = parseInt($("#userid option:selected")[0].text)
	
	//$( "#userid" )[0].value = uid.toString();
	
	userid_str=""+uid;
	console.log("userid_str", userid_str)

	console.log("changed to uid", uid)
	//console.log(userslist)
	
	/*	
	svg_cluster
		.selectAll(".user").remove()
		
	if(uid != null){
		svg_cluster
			.selectAll("myPath3")
			.data(data_parcoords.filter(function(el){return el.userid==uid}))
			.enter()
			.append("path")
			  .attr("class", function (d) { return "line user " + "ccc"+d.cluster } ) // 2 class for each line: 'line' and the group name
			  .attr("d",  path)
			  .style("fill", "none" )
			  .style("stroke", function(d){ return( color_center("cc"+d.cluster) )} )
			  .style("stroke-width", 3)
			  .style("opacity", 0.9)		
	*/	

	//change Group & Contributor 
	urec = data_parcoords.filter(function(el){return el.userid==uid})
	ucluster = urec[0]["cluster"]
	val = 'cluster' + ucluster
	$('#clusters option[value=' + val + ']').prop('selected', true);
	$('#clusters').trigger('change');
	
	// disable checkboxes (will be re-enabled when the graph is ready)
	$("#ctrbar").prop("disabled", true);
	$("#ctrpielandcover").prop("disabled", true);
	$("#ctrcloud").prop("disabled", true);
	$("#ctrnetwork").prop("disabled", true);
	
	//$('body').css('cursor','wait');
	
	update(true, true, true, true, true, tmpMode, false);
	
	//$('body').css('cursor','default');
	
}

var data_parcoords = null;
var data_cluster_centers = null;
var svg_cluster = null;

// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
function path(d) {
  //console.log(d)
  return d3.svg.line()(dimensions.map(function(p) { //d3.line() --v4
	return [xscale[p](d[p]), yscale(p)];	 
	}));
}

var attrs = ['n_interacted_users', 'n_landcovers', 'n_kingdoms', 'std_dist_km', 'n_month_active', 'n_observations']
var labels = ["Interacting Contributors", "Landcover Types", "Species Kingdoms", "Standard Distance (km)","Months Active",  "Species Observations"]
 
 // Color scale: give me a specie name, I return a color
 var color = d3.scale.ordinal()
    .domain(['c1', 'c2', 'c3', 'c4'])
    .range(["#D3D3D3", "#90ee90", "#ADD8E6", "#FF0000"])

 var color_center = d3.scale.ordinal()
    .domain(['cc1', 'cc2', 'cc3', 'cc4'])
    .range(["#000000", "#013220", "#0000FF", "#FF0000"])
	//.range(["#D3D3D3", "#90ee90", "#ADD8E6", "#FF0000"])
	
var xscale = null;
var yscale = null;


function draw_parcoords(data, data_center, update){
	
	  if(true == update){
		d3.select("#svg_parcoords").remove();
	  }
  
	// set the dimensions and margins of the graph
	var margin = {top: 20, right: 120, bottom: 20, left: 10},
	  width = 400 - margin.left - margin.right, //350
	  height = 300 - margin.top - margin.bottom; //400

	// append the svg_cluster object to the body of the page
	svg_cluster = d3.select("#d3parcoordsmain")
	.append("svg")
	  .attr("width", width + margin.left + margin.right)
	  .attr("height", height + margin.top + margin.bottom)
	  .attr("id", "svg_parcoords")
	.append("g")
	  .attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");
	
	
    //console.log(data)
	//data_parcoords = $.extend(true, [], data);

	// Here I set the list of dimension manually to control the order of axis:
	dimensions = attrs
  
  // For each dimension, I build a linear scale. I store all in a y object
  xscale = {}
  for (i in dimensions) {
	
	name = dimensions[i]
	vals = unpack(data, name)  
	vals_center = unpack(data_center, name)
	xscale[name] = d3.scale.linear()

	.domain( [Math.min(Math.min.apply(null, vals), Math.min.apply(null, vals_center)), 
			Math.max(Math.max.apply(null, vals), Math.max.apply(null, vals_center))] )     
	 .range([0, width])
  }

  // Build the X scale -> it find the best position for each Y axis
  yscale = d3.scale.ordinal() //scalePoint()
	.rangePoints([height, 0])
	.domain(dimensions);

  // Highlight the specie that is hovered
  var highlight = function(d){

	selected_cluster = "c"+d.cluster

	// first every group turns grey
	d3.selectAll(".bkg")
	  .transition().duration(200)
	  .style("stroke", "lightgrey")
	  .style("opacity", "0.1")
	// Second the hovered specie takes its color
	d3.selectAll("." + selected_cluster)
	  .transition().duration(200)
	  .style("stroke", color_center("c"+selected_cluster))
	  .style("opacity", 0.8)
  }

  // Unhighlight
  var doNotHighlight = function(d){
	d3.selectAll(".bkg")
	  .transition().duration(200).delay(1000)
	  .style("stroke", function(d){ return( color("c"+d.cluster))} )
	  .style("stroke-width", 1 )
	  .style("opacity", 0.2);
  }

  // Draw the lines
  svg_cluster
	.selectAll("myPath")
	.data(data)
	.enter()
	.append("path")
	  .attr("class", function (d) { return "line bkg " + "c"+d.cluster } ) // 2 class for each line: 'line' and the group name
	  .attr("d",  path)
	  .style("fill", "none" )
	  .style("stroke-width", 1 )
	  .style("stroke", function(d){ return( color("c"+d.cluster))} )
	  .style("opacity", 0.2)
	  .on("mouseover", highlight)
	  .on("mouseleave", doNotHighlight )

  // Draw the axis:
  svg_cluster.selectAll("Axis_parcoords")
	// For each dimension of the dataset I add a 'g' element:
	.data(dimensions).enter()
	.append("g")
	.attr("class", "axis_parcoords")
	// I translate this element to its right position on the x axis
	.attr("transform", function(d) { return "translate(0," + yscale(d) + ")"; })
	// And I build the axis with the call function
	//.each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(yscale[d])); }) // --v4
	.each(function(d) { d3.select(this).call(d3.svg.axis().orient("bottom").ticks(4).scale(xscale[d])); })
	// Add axis title
	.append("text")
	  .style("text-anchor", "end")
	  .attr("y", -6)
	  .attr("x", width + margin.left)
	  .data(labels) //GZ
	  .text(function(d) { return d; })
	  .style("fill", "black")
	  .style("font-size", "100%")
			
	  // Draw the lines - cluster centers
	  //console.log(data_center)
	  svg_cluster
		.selectAll("myPath2")
		.data(data_center)
		.enter()
		.append("path")
		  .attr("class", function (d) { return "line center " + "cc"+d.cluster } ) // 2 class for each line: 'line' and the group name
		  .attr("d",  path)
		  .style("fill", "none" )
		  .style("stroke-dasharray", ("3, 3")) //dashed line
		  .style("stroke", function(d){ return( color_center("cc"+d.cluster))} )
		  .style("stroke-width", 2.5)
		  .style("opacity", 1.0)
		
		cluster_users = {};
		for(var c = 1; c <= 4; c++){
			ids = unpack(data.filter(function(el){return el.cluster==c}).sort(compare_distance_std), "userid")
			//ids_c = {}
			//for(i in ids){
			//	ids_c[ids[i].toString()] = ids[i]
			//}
			//cluster_users["cluster" + c] = ids_c
			cluster_users["cluster" + c] = ids
		}
		
		// initialize
		if(cluster_users != null){
			userslist = cluster_users[$("#clusters").val()]
			
			$('#userslist')
				.find('option')
				.remove()
				.end();
			
			$.each(userslist, function(index, value) {   
			 $('#userslist')
				 .append($("<option></option>")
							.attr("value", index)
							.text(value)); 
			});
			
			//$('#userslist').trigger("change")
		}
		
		// enable dropdowns
		$( "#userslist" ).prop( "disabled", false );
		$( "#clusters" ).prop( "disabled", false );	
		$( "#showclustercb" ).prop( "disabled", false );
		
		//$( "#userid" ).on('change',userid_onchange); 
		//$('#userid').trigger("change")
		
		// legend
		  // define legend
	  var legendRectSize_clusters = 15; // defines the size of the colored squares in legend
	  var legendSpacing_clusters = 8; // defines spacing between squares
	  var legend = svg_cluster.selectAll('.legend') // selecting elements with class 'legend'
		.data(data_center)
		.enter() // creates placeholder
		.append('g') // replace placeholders with g elements
		.attr('class', 'legend') // each g is given a legend class
		.attr('transform', function(d, i) {
		  var height = legendRectSize_clusters + legendSpacing_clusters; // height of element is the height of the colored square plus the spacing
		  var offset =  -5.0 * height; // * data_center.length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements
		  var horz = 20 * legendRectSize_clusters; // the legend is shifted to the left to make room for the text
		  var vert = i * height - offset; // the top of the element is shifted up or down from the center using the offset defiend earlier and the index of the current element 'i'
			return 'translate(' + horz + ',' + vert + ')'; //return translation
		 });

		
	  // adding colored squares to legend
	  legend.append('rect') // append rectangle squares to legend
		.attr('width', 4) // width of rect size is defined above
		.attr('height', 4) // height of rect size is defined above
		.style('fill', function(d){ return( color_center("cc"+d.cluster))} ) // each fill is passed a color
		.style('stroke', function(d){ return( color_center("cc"+d.cluster))} )
		.style("opacity", 1.0);
		
	  /*	
	  // adding colored lines to legend
	  legend.append('path') // append rectangle squares to legend
		.attr('stroke-width', 2) 
		//.attr("d",  []) ???
		.style("stroke-dasharray", ("3, 3")) //dashed line
		.style('stroke', function(d){ return( color_center("cc"+d.cluster))} )
		.style("opacity", 0.6);
	  */	
	  // adding text to legend
	  ///*
	  legend.append('text')
		.attr('x', legendRectSize_clusters ) //+ legendSpacing_clusters/2
		.attr('y', legendRectSize_clusters - legendSpacing_clusters)
		.text(function(d) { return "Cluster " + d["cluster"];}) // return label
		.style("font-size", "100%")
		.style("fill", function(d){ return( color_center("cc"+d.cluster))})
		.style("opacity", 1.0);
}