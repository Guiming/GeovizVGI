// Source: http://bl.ocks.org/godds/ec089a2cf3e06a2cd5fc

var brush_month_obs;
var brush_month_stddist;

function draw_barchart_month(data4graph, update, target){

    // sizing information, including margins so there is space for labels, etc
    var margin =  { top: 20, right: 20, bottom: 120, left: 50 },
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        marginOverview = { top: 230, right: margin.right, bottom: 50,  left: margin.left },
        heightOverview = 300 - marginOverview.top - marginOverview.bottom;

    // set up a date parsing function for future use
    var parseDate = d3.time.format("%m/%Y").parse;
	var parseYMD = d3.time.format("%Y-%m-%d").parse;
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
    //https://stackoverflow.com/questions/20010864
    function timeFormat(formats) {
      return function(date) {
        var i = formats.length - 1, f = formats[i];
        while (!f[1](date)) f = formats[--i];
        return f[0](date);
      };
    }

    var customTimeFormat = timeFormat([
        [d3.time.format("%Y"), function() { return true; }],
        [d3.time.format("%b"), function(d) { return d.getMonth(); }],
        [function(){return "";}, function(d) { return d.getDate() != 1; }]
    ]);

    // rendering for the x and y axes
    var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    //.ticks(customTickFunction)
                    .tickSize(16, 0)
                    //.tickFormat(d3.time.format("%b"))
                    .tickFormat(customTimeFormat);
    var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");
    var xAxisOverview = d3.svg.axis()
                    .scale(xOverview)
                    .orient("bottom");
                    //.ticks(d3.time.months)
                    //.tickSize(16, 0)
                    //.tickFormat(d3.time.format("%b %Y"));
    var svg;
    var main;
    var overview;
    var brush_month;

    var svgid = "svg_bar_obs_month";
    var brushid = "brush_bar_obs_month";
    var divid = "d3barmonthobs";
    var ylabel = "Observations";
    if("StdDistance"==target){
      svgid = "svg_bar_stddist_month"
      brushid = "brush_bar_stddist_month";
      divid = "d3barmonthstddist";
      ylabel = "Std Distance (km)";
    }
    if("IDs"==target){
      svgid = "svg_bar_ids_month"
      brushid = "brush_bar_ids_month";
      divid = "d3barmonthids";
      ylabel = "Identifications";
    }

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
    /*
    brush_month = d3.svg.brush()
                        .x(xOverview)
                        .on("brush", brushed)
                        .on("brushend", brushend);
    */
    if("StdDistance" == target){
        brush_month_stddist = d3.svg.brush()
                        .x(xOverview)
                        .on("brush", brushed)
                        .on("brushend", brushend);
        brush_month =  brush_month_stddist;
    }else if("IDs" == target){
      brush_month_ids = d3.svg.brush()
                      .x(xOverview)
                      .on("brush", brushed)
                      .on("brushend", brushend);
      brush_month =  brush_month_ids;
    }else{
      brush_month_obs = d3.svg.brush()
                      .x(xOverview)
                      .on("brush", brushed)
                      .on("brushend", brushend);
      brush_month =  brush_month_obs;
    }
  // setup complete, let's get some data!
  //d3.csv(datafile, parse_data, function(data) {

       data = data4graph.map(parse_data);

       //var barwidth = Math.max(Math.floor(width/((data[data.length-1].date-data[0].date)/1000/3600/24/30+1)), 2);
	   var barwidth = Math.max(Math.floor(width/((parseYMD($("#dateend").val())-parseYMD($("#datestart").val()))/1000/3600/24/30)), 2);
       
	   /*
	   if(data.length == 1){
         barwidth = width;
       }
	   */
	   
       //console.log(data)
      // data ranges for the x and y axes
      //x.domain(d3.extent(data, function(d) { return d.date; }));
      
      x.domain([parseYMD($("#datestart").val()), parseYMD($("#dateend").val())]);
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
              .attr("y", function(d) { return y(d.y1); })
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
                  .call(brush_month)
                  .selectAll("rect")

                      // -6 is magic number to offset positions for styling/interaction to feel right
                      .attr("y", -6)
                      // need to manually set the height because the brush has
                      // no y scale, i.e. we should see the extent being marked
                      // over the full height of the overview chart
                      .attr("height", heightOverview + 7);  // +7 is magic number for styling


      // by habit, cleaning/parsing the data and return a new object to ensure/clarify data object structure
      function parse_data(d) {
          var value = { date: parseDate(d.date) }; // turn the date string into a date object

          // adding calculated data to each count in preparation for stacking
          var y0 = 0; // keeps track of where the "previous" value "ended"
          var variables = ["count_obs", "count_obscured"];
          if(target == "StdDistance"){
            variables = ["std_dist_km"];
          }
          if(target == "IDs"){
            variables = ["count_ids"];
          }
          value.counts = variables.map(function(name) { //, "count2", "count3"
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
          //console.log("monthly bar brush() triggered");
          // update the main chart's x axis data range
          x.domain(brush_month.empty() ? xOverview.domain() : brush_month.extent());
          // redraw the bars on the main chart
          main.selectAll(".bar.stack")
                  .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
          // redraw the x axis of the main chart
          main.select(".x.axis").call(xAxis);

          svg.selectAll(".x.axis text")  // select all the text elements for the xaxis
                    .attr("transform", function(d) {
                        return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
                  });
          if(brush_month.extent()[1] - brush_month.extent()[0] > 0){
            var N = (brush_month.extent()[1] - brush_month.extent()[0])/1000/3600/24/30+1;
            //console.log(width, N, Math.floor(width/N));
            main.selectAll(".bar").attr('width', Math.max(2, Math.floor(width/N)));
          }
          else{
            var barwidth = Math.max(Math.floor(width/((data[data.length-1].date-data[0].date)/1000/3600/24/30+1)), 2);
            if(data.length == 1){
              barwidth = Math.floor(width/2);
            }
            main.selectAll(".bar").attr('width', Math.max(2, barwidth));
          }
      }

      function brushend(){
        //console.log("monthly bar brushend() triggered");
        var ext = brush_month.extent();
        var d1 = ext[0];
        var d2 = ext[1];

        if(d2 - d1 == 0){
          //console.log("zero extent");
          main.selectAll(".bar").attr('width', barwidth);
        }

        /* snapping to edges of month
        var y1 = d1.getFullYear();
        var m1 = d1.getMonth();
        var y2 = d2.getFullYear();
        var m2 = d2.getMonth();
        var ndays = new Date(d2.getFullYear(), d2.getMonth()+1, 0).getDate();
        var ext_snapped = [new Date(y1, m1, 01), new Date(y2, m2, ndays)];
        */
        var ext_snapped = [d1, d2];

        d3.select("brush_month").call((brush_month.empty()) ? brush_month.clear() :brush_month.extent(ext_snapped));

        //*
        drawBrushDay();

        function drawBrushDay() {
          // our year will this.innerText
          //console.log(this.innerText)
          /*
          var brush_xx = brush_day_obs;
          var brush = d3.select("#brush_bar_obs_day.brush");
          if("StdDistance" == target){
            brush_xx = brush_day_stddist;
            brush = d3.select("#brush_bar_stddist_day.brush");
          }*/

          var brush_xxs = [brush_day_obs, brush_day_stddist, brush_day_ids];
          var brushs = [d3.select("#brush_bar_obs_day.brush"), d3.select("#brush_bar_stddist_day.brush"), d3.select("#brush_bar_ids_day.brush")];

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
        //*/

        /*
        var dt_start = brush_month.extent()[0];
        var dt_end = brush_month.extent()[1];
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

          $("#dateend_tmp").trigger("change");


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

          $("#submit").trigger("click");
        }
        */
      }
}
