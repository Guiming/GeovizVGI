//source: https://blockbuilder.org/bricedev/8b2da06ddef27d94cde9

var svg_cloud;
//var wordcloud;
var kingdoms = ["Plants", "Fishes", "Mammals", "Insects", "Amphibians", "Molluscs", "Birds", "Othe Animals", "Arachnids", "Fungi/Lichens", "Reptiles","Kelp/Diatoms/Allies", "Protozoans"];
var scikingdoms = ["Plantae", "Actinopterygii", "Mammalia", "Insecta", "Amphibia", "Mollusca", "Aves", "Animalia", "Arachnida", "Fungi", "Reptilia","Chromista", "Protozoa"];
var kingdomcolors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00","#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854", "#7dc825"];

function draw_cloud_species(data_i, update, comname){
    var data = jQuery.extend(true, [], data_i);
    //console.log("IN D3CLOUD.JS");
    //console.log(data);
    var div_id;
    var di_vid_svg;
    if(true == comname){
      div_id = "d3cloudcomname";
      di_vid_svg = "svg_species_comname";
    }else{
      div_id = "d3cloudsciname";
      di_vid_svg = "svg_species_sciname"
    }

    if(/*true == update*/d3.select('#' + di_vid_svg)[0][0] != null){
      d3.select('#' + di_vid_svg).remove()
    }

    if(data.length == 0){
      return;
    }

    var margin_cloud = {top: 5, right: 20, bottom: 40, left: 20},
        width_cloud = 500 - margin_cloud.left - margin_cloud.right,
        height_cloud = 330 - margin_cloud.top - margin_cloud.bottom;

    svg_cloud = d3.select('#' + div_id).append("svg")
        .attr("id", di_vid_svg)
        .attr("width", width_cloud + margin_cloud.left + margin_cloud.right)
        .attr("height", height_cloud + margin_cloud.top + margin_cloud.bottom)
      .append("g")
        .attr("transform", "translate(" + margin_cloud.left + "," + margin_cloud.top + ")");


    //d3.csv("data/data_cloud.csv", function(error, data) {

      var max = 0;
      for(var i in data){
        if(data[i].value > max){
          max = data[i].value
        }
      }
	
      var categories = d3.keys(d3.nest().key(function(d) { return d.category; }).map(data));
	  console.log('categories', categories)
      
	  // x axis label color is incorrect with this
	  /*
	  var _categories = []
      if(true==comname){
        for(var i in categories){
          _categories.push(kingdoms[scikingdoms.indexOf(categories[i])])
        }
        categories = _categories
		console.log('#categories', categories)
      }
	  */
	  
      //var color = d3.scale.ordinal().range(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"]);
      var color = d3.scale.ordinal()
                          .domain(scikingdoms)
                          .range(kingdomcolors);
      var fontSize = d3.scale.pow().exponent(2).domain([0,1]).range([10,50]);
      //var fontSize = d3.scale.linear().domain([0,1]).range([10,100]);

      var rnd = new Math.seedrandom('hello');
      var layout = d3.layout.cloud()
          .timeInterval(10)
          .size([width_cloud, height_cloud])
          .words(data)
          //.rotate(function(d) { return 0; })
          .rotate(function(d) {
              //return (rnd()-0.5)*180;
			  return 0;
              //return (Math.random()-0.5)*180;
            })
          .font('monospace')
          //.fontSize(function(d,i) { return fontSize(Math.random()); })
          .fontSize(function(d,i) { return fontSize(d.value*1.0/max); })
          //.fontSize(function(d,i) { return 80*(d.value*1.0/max); })
          .text(function(d) {
              if(true == comname){
                return d.comname;
              }
              else{
                return d.sciname;
              }
            })
          .spiral("archimedean")
          .on("end", draw)
          .start();

      var wordcloud = svg_cloud.append("g")
          .attr('class','wordcloud')
          .attr("transform", "translate(" + width_cloud/2 + "," + height_cloud/2 + ")");

      var x0 = d3.scale.ordinal()
          .rangeRoundBands([0, width_cloud], .1)
          .domain(categories);

      var xAxis = d3.svg.axis()
          .scale(x0)
          .orient("bottom");

      svg_cloud.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height_cloud + ")")
          .call(xAxis)
        .selectAll('text')
          .attr("transform", function(d) {
              return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
          })
          //.style('font-size','10px')
          .style('fill',function(d) { return color(d); })
          .style('font','sans-serif');

      function draw(words) {
        wordcloud.selectAll("text")
            .data(words)
          .enter().append("text")
            .attr('class','word')
            .style("font-size", function(d) { return d.size/1.0 + "px"; })
            .style("font-family", function(d) { return d.font; })
            .style("fill", function(d) {
                var paringObject = data.filter(function(obj) {
                  if(true == comname){
                    return obj.comname === d.text;
                  }
                  else{
                    return obj.sciname === d.text;
                  }
                });
                return color(paringObject[0].category);
            })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
            .text(function(d) { return d.text; });
      };

    //});
}

/*
  d3.csv("data/data_cloud.csv", function(error, data) {
      draw_cloud(data, false);
    });
*/
