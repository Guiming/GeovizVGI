// Source: http://bl.ocks.org/godds/ec089a2cf3e06a2cd5fc
var brush_day_obs;
var brush_day_stddist;

function draw_barchart_day(data4graph, update, target){


    // set up a date parsing function for future use
    var parseDate = d3.time.format("%Y-%m-%d").parse;
	var parseYMD = d3.time.format("%Y-%m-%d").parse;
    // sizing information, including margins so there is space for labels, etc
    var margin =  { top: 20, right: 20, bottom: 120, left: 50 },
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        marginOverview = { top: 230, right: margin.right, bottom: 50,  left: margin.left },
        heightOverview = 300 - marginOverview.top - marginOverview.bottom;


    // some colours to use for the bars
    var colour = d3.scale.ordinal()
                        .range(["#A9A9A9", "#000000"]);

    // mathematical scales for the x and y axes
    var x = d3.time.scale()
                    .range([0, width]);
    var y = d3.scale.linear()
                    .range([height, 0]);
    var xOverview = d3.time.scale()
                    .range([0, width]);
    var yOverview = d3.scale.linear()
                    .range([heightOverview, 0]);

    // rendering for the x and y axes
    var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");
    var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");
    var xAxisOverview = d3.svg.axis()
                    .scale(xOverview)
                    .orient("bottom");
    var svg;
    var main;
    var overview;

    var brush_day;

    var svgid = "svg_bar_obs_day";
    var brushid = "brush_bar_obs_day";
    var divid = "d3bardayobs";
    var ylabel = "Observations";
    if("StdDistance"==target){
      svgid = "svg_bar_stddist_day";
      brushid = "brush_bar_stddist_day";
      divid = "d3bardaystddist";
      ylabel = "Std Distance (km)";
    }
    if("IDs"==target){
      svgid = "svg_bar_ids_day";
      brushid = "brush_bar_ids_day";
      divid = "d3bardayids";
      ylabel = "Identifications";
    }
    //console.log(data4graph);

    if(/*true == update*/d3.select("#" + svgid)[0][0] != null){
        d3.select("#" + svgid).remove();
    }
    if(data4graph.length == 0){
      return;
    }
    // something for us to render the chart into
    svg = d3.select("#" + divid)
                    .append("svg") // the overall space
                        .attr("id", svgid)
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);
    main = svg.append("g")
                    .attr("class", "main")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    overview = svg.append("g")
                        .attr("class", "overview")
                        .attr("transform", "translate(" + marginOverview.left + "," + marginOverview.top + ")");

    // brush tool to let us zoom and pan using the overview chart
    if("StdDistance" == target){
        brush_day_stddist = d3.svg.brush()
                        .x(xOverview)
                        .on("brush", brushed)
                        .on("brushend", brushend);
        brush_day =  brush_day_stddist;
    }else if("IDs" == target){
        brush_day_ids = d3.svg.brush()
                        .x(xOverview)
                        .on("brush", brushed)
                        .on("brushend", brushend);
        brush_day =  brush_day_ids;
    }
    else{
      brush_day_obs = d3.svg.brush()
                      .x(xOverview)
                      .on("brush", brushed)
                      .on("brushend", brushend);
      brush_day =  brush_day_obs;
    }
  // setup complete, let's get some data!
  //d3.csv(datafile, parse_data, function(data) {

       data = data4graph.map(parse_data);

       //var barwidth = Math.max(Math.floor(width/((data[data.length-1].date-data[0].date)/1000/3600/24+1)), 2);
	   var barwidth = Math.max(Math.floor(width/((parseYMD($("#dateend").val())-parseYMD($("#datestart").val()))/1000/3600/24)), 2);
	   
       //console.log(data)
      // data ranges for the x and y axes
      //x.domain(d3.extent(data, function(d) { return d.date; }));
      x.domain([parseDate($("#datestart").val()), parseDate($("#dateend").val())]);
      y.domain([0, d3.max(data, function(d) { return d.total; })]);
      xOverview.domain(x.domain());
      yOverview.domain(y.domain());

      // data range for the bar colours
      // (essentially maps attribute names to colour values)
      colour.domain(d3.keys(data[0]));

      // draw the axes now that they are fully set up
      main.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
      main.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 1)
            .attr("x",-100)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text(ylabel);

      overview.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + heightOverview + ")")
          .call(xAxisOverview);

      svg.selectAll(".x.axis text")  // select all the text elements for the xaxis
                .attr("transform", function(d) {
                    return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
              });

      // draw the bars
      main.append("g")
              .attr("class", "bars")
          // a group for each stack of bars, positioned in the correct x position
          .selectAll(".bar.stack")
          .data(data)
          .enter().append("g")
              .attr("class", "bar stack")
              .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
          // a bar for each value in the stack, positioned in the correct y positions
          .selectAll("rect")
          .data(function(d) { return d.counts; })
          .enter().append("rect")
              .attr("class", "bar")
              .attr("width", barwidth)
              .attr("y", function(d){return func(d);})
              .attr("height", function(d) { return y(d.y0) - y(d.y1); })
              .style("fill", function(d) { return colour(d.name); });

      overview.append("g")
                  .attr("class", "obars")
          .selectAll(".bar")
          .data(data)
          .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) { return xOverview(d.date) - 3; })
              .attr("width", barwidth)
              .attr("y", function(d) { return yOverview(d.total); })
              .attr("height", function(d) { return heightOverview - yOverview(d.total); });

      // add the brush target area on the overview chart
      overview.append("g")
                  .attr("class", "x brush")
                  .attr("id", brushid)
                  .call(brush_day)
                  .selectAll("rect")

                      // -6 is magic number to offset positions for styling/interaction to feel right
                      .attr("y", -6)
                      // need to manually set the height because the brush has
                      // no y scale, i.e. we should see the extent being marked
                      // over the full height of the overview chart
                      .attr("height", heightOverview + 7);  // +7 is magic number for styling


        //functions
        function func(d){
          //console.log(d.y1);
          //console.log(y(d.y1));
          return y(d.y1);
        }
        // by habit, cleaning/parsing the data and return a new object to ensure/clarify data object structure
        function parse_data(d) {
            var value = { date: parseDate(d.date) }; // turn the date string into a date object

            // adding calculated data to each count in preparation for stacking
            var y0 = 0; // keeps track of where the "previous" value "ended"
            var y1 = 0;
            var variables = ["count_obs", "count_obscured"];
            if(target == "StdDistance"){
              variables = ["std_dist_km"];
            }
            if(target == "IDs"){
              variables = ["count_ids"];
            }
            value.counts = variables.map(function(name) { //, "count2", "count3"
              //console.log('d[name]:', d[name])
              j = { name: name,
                y0: y0,
                // add this count on to the previous "end" to create a range, and update the "previous end" for the next iteration
                y1: y0 += +d[name]
              };  
              if(isNaN(j.y0)){
                j.y0 = 0;
              }
              if(isNaN(j.y1)){
                j.y1 = 0;
              }
              return j;
            });
            // quick way to get the total from the previous calculations
            value.total = value.counts[value.counts.length - 1].y1;
            if(isNaN(value.total)){
              value.total = 0;
            }
            //console.log(value);
            return value;
        }

        // zooming/panning behaviour for overview chart
        function brushed() {

            //console.log("daily bar brush() triggered");

            // update the main chart's x axis data range
            x.domain(brush_day.empty() ? xOverview.domain() : brush_day.extent());
            // redraw the bars on the main chart
            main.selectAll(".bar.stack")
                    .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
            // redraw the x axis of the main chart
            main.select(".x.axis").call(xAxis);

            svg.selectAll(".x.axis text")  // select all the text elements for the xaxis
                      .attr("transform", function(d) {
                          return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
                    });
            if(brush_day.extent()[1] - brush_day.extent()[0] > 0){
              var N = (brush_day.extent()[1] - brush_day.extent()[0])/1000/3600/24;
              //console.log(width, N, Math.floor(width/N));
              main.selectAll(".bar").attr('width', Math.max(2, Math.floor(width/N)));
            }
        }


        function brushend(){

          //console.log("daily bar brushend() triggered");
          var ext_snapped = [brush_day.extent()[0], brush_day.extent()[1]];

          if(brush_day.extent()[1] - brush_day.extent()[0] == 0){
            //console.log("zero extent");
            main.selectAll(".bar").attr('width', barwidth);
          }

          drawBrushYear();

          function drawBrushYear() {
            var brush_xxs = [brush_year_obs, brush_year_stddist, brush_year_ids];
            var brushs = [d3.select("#brush_bar_obs_year.brush"), d3.select("#brush_bar_stddist_year.brush"), d3.select("#brush_bar_ids_year.brush")];

            for(var i in brush_xxs){

              brush_xx = brush_xxs[i];
              brush = brushs[i];

              var diff_d1 = brush_xx.extent()[0] - ext_snapped[0];
              var diff_d2 = brush_xx.extent()[1] - ext_snapped[1];

              if(diff_d1 == 0 && diff_d2 == 0){
                continue;
              }

              // define our brush extent to be begin and end of the year
              brush_xx.extent(jQuery.extend(true, [], ext_snapped));

              // now draw the brush to match our extent
              // use transition to slow it down so we can see what is happening
              // remove transition so just d3.select(".brush") to just draw
              brush_xx(brush.transition());
              //brush_xx(brush);

              // now fire the brushstart, brushmove, and brushend events
              // remove transition so just d3.select(".brush") to just draw

              brush_xx.event(brush.transition().delay(0));
              //brush_xx.event(brush);
            }
          }

          //*
          var dt_start = brush_day.extent()[0];
          var dt_end = brush_day.extent()[1];
          if(dt_start.toString() != dt_end.toString()){
            $("#datestart_tmp").val(dt_start.toJSON().split("T")[0]);
            $("#dateend_tmp").val(dt_end.toJSON().split("T")[0]);
            $(".datetemp").show();

            $("#datestart").prop( "disabled", true );
            $("#dateend").prop( "disabled", true );
            $("#obscured").prop( "disabled", true );
            $("#captivecultivated").prop( "disabled", true );
            $("#userid").prop( "disabled", true );
            $("#submit").prop( "disabled", true );

            d3.select("#query").selectAll("label").style("color","gray");
            d3.selectAll(".datetemp").selectAll("label").style("color","black");

            tmpMode = true;

            if(updateonfly){
              $("#dateend_tmp").trigger("change");
              reloadneeded = true;
            }

          }else{
            $(".datetemp").hide();
            $("#datestart").prop( "disabled", false );
            $("#dateend").prop( "disabled", false );
            $("#obscured").prop( "disabled", false );
            $("#captivecultivated").prop( "disabled", false );
            $("#userid").prop( "disabled", false );
            $("#submit").prop( "disabled", false );

            d3.select("#query").selectAll("label").style("color","black");
            tmpMode = false;

            if(reloadneeded){
              $("#submit").trigger("click");
            }
          }
          //*/
        }
}
