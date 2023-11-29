// chart dimensions
var width_pie_admin1 = 400;
var height_pie_admin1 = 300;

// a circle chart needs a radius
var radius = Math.min(width_pie_admin1, height_pie_admin1) / 2.5;

// legend dimensions
var legendRectSize_admin1 = 15; // defines the size of the colored squares in legend
var legendSpacing_admin1 = 4; // defines spacing between squares

// define color scale

// more color scales: https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9

var rnd_admin1 = new Math.seedrandom('b');
function generateRandomColorAdmin1()
{
    //var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
    var randomColor = '#'+Math.floor(rnd_admin1()*16777215).toString(16);
    return randomColor;
    //random color will be freshly served
}

var colorrange_admin1 = []
for(var i=0; i<10; i++){
  colorrange_admin1.push(generateRandomColorAdmin1(rnd_admin1))
}
colorrange_admin1.push('#909090')


function draw_piechart_admin1(dataset, update){
  if(/*true == update*/d3.select("#svg_pie_admin1")[0][0] != null){
    d3.select("#svg_pie_admin1").remove();
  }
  if(dataset.length == 0){
    return;
  }

  var color_admin1 = d3.scale.ordinal()
                      .range(colorrange_admin1);

  var svg_pie_admin1 = d3.select('#d3pieadmin1') // select element in the DOM with id 'chart'
    .append('svg') // append an svg element to the element we've selected
    .attr("id", "svg_pie_admin1")
    .attr('width', width_pie_admin1) // set the width of the svg element we just added
    .attr('height', height_pie_admin1) // set the height of the svg element we just added
    .append('g') // append 'g' element to the svg element
    .attr('transform', 'translate(' + (width_pie_admin1 / 3) + ',' + (height_pie_admin1 / 2) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

  var arc = d3.svg.arc()
    .innerRadius(0) // none for pie chart
    .outerRadius(radius); // size of overall chart

  var pie = d3.layout.pie() // start and end angles of the segments
    .value(function(d) { return d.value; }) // how to extract the numerical data from each entry in our dataset
    .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

  // define tooltip
  var tooltip = d3.select('#d3pieadmin1') // select element in the DOM with id 'chart'
    .append('div') // append a div element to the element we've selected
    .attr('class', 'tooltipadmin1'); // add class 'tooltip' on the divs we just selected

  tooltip.append('div') // add divs to the tooltip defined above
    .attr('class', 'label'); // add class 'label' on the selection

  tooltip.append('div') // add divs to the tooltip defined above
    .attr('class', 'value'); // add class 'count' on the selection

  tooltip.append('div') // add divs to the tooltip defined above
    .attr('class', 'percent'); // add class 'percent' on the selection

  // Confused? see below:

  // <div id="chart">
  //   <div class="tooltip">
  //     <div class="label">
  //     </div>
  //     <div class="count">
  //     </div>
  //     <div class="percent">
  //     </div>
  //   </div>
  // </div>

  dataset.forEach(function(d) {
    d.value = +d.value; // calculate count as we iterate through the data
    d.enabled = true; // add enabled property to track which entries are checked
  });

  // creating the chart
  var path = svg_pie_admin1.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
    .data(pie(dataset)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
    .enter() //creates placeholder nodes for each of the values
    .append('path') // replace placeholders with path elements
    .attr('d', arc) // define d attribute with arc function above
    .attr('fill', function(d) { return color_admin1(d.data.name); }) // use color scale to define fill of each label in dataset
    .each(function(d) { this._current - d; }); // creates a smooth animation for each track

  // mouse event handlers are attached to path so they need to come after its definition
  path.on('mouseover', function(d) {  // when mouse enters div
   var total = d3.sum(dataset.map(function(d) { // calculate the total number of tickets in the dataset
    return (d.enabled) ? d.value : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
    }));
   var percent = Math.round(1000 * d.data.value / total) / 10; // calculate percent
   //tooltip.attr("background-image", "url(" + "'img/inat_icons/" + d.data.name + "-20px.png'" + ")");
   //tooltip.select('.label').html(d.data.name + '<img src="img/inat_icons/' + d.data.name + '-20px.png">');
   tooltip.select('.label').html(d.data.name); // set current label
   tooltip.select('.value').html(d.data.value); // set current count
   tooltip.select('.percent').html(percent + '%'); // set percent calculated above
   tooltip.style('display', 'block'); // set display

   //d3.select("#svg_pie_admin1").style("cursor", "zoom-in");

  });

  path.on('mouseout', function() { // when mouse leaves div
    tooltip.style('display', 'none'); // hide tooltip for that element

   });

  path.on('mousemove', function(d) { // when mouse moves
    tooltip.style('top', (d3.event.layerY + 370) + 'px') // always 10px below the cursor
      .style('left', (d3.event.layerX + 20) + 'px'); // always 10px to the right of the mouse

    });

  // define legend
  var legend = svg_pie_admin1.selectAll('.legendadmin1') // selecting elements with class 'legend'
    .data(color_admin1.domain()) // refers to an array of labels from our dataset
    //.data(colors_subset)
    .enter() // creates placeholder
    .append('g') // replace placeholders with g elements
    .attr('class', 'legendadmin1') // each g is given a legend class
    .attr('transform', function(d, i) {
      var height = legendRectSize_admin1 + legendSpacing_admin1; // height of element is the height of the colored square plus the spacing
      var offset =  height * color_admin1.domain().length / 2.5; // vertical offset of the entire legend = height of a single element & half the total number of elements
      var horz = 10 * legendRectSize_admin1; // the legend is shifted to the left to make room for the text
      var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'
        return 'translate(' + horz + ',' + vert + ')'; //return translation
     });

  // adding colored squares to legend
  legend.append('rect') // append rectangle squares to legend
    .attr('width', legendRectSize_admin1) // width of rect size is defined above
    .attr('height', legendRectSize_admin1) // height of rect size is defined above
    .style('fill', color_admin1) // each fill is passed a color
    .style('stroke', color_admin1) // each stroke is passed a color
    .on('click', function(label) {
      var rect = d3.select(this); // this refers to the colored squared just clicked
      var enabled = true; // set enabled true to default
      var totalEnabled = d3.sum(dataset.map(function(d) { // can't disable all options
        return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
      }));

      if (rect.attr('class') === 'disabled') { // if class is disabled
        rect.attr('class', ''); // remove class disabled
      } else { // else
        if (totalEnabled < 2) return; // if less than two labels are flagged, exit
        rect.attr('class', 'disabled'); // otherwise flag the square disabled
        enabled = false; // set enabled to false
      }

      pie.value(function(d) {
        if (d.name === label) d.enabled = enabled; // if entry label matches legend label
          return (d.enabled) ? d.value : 0; // update enabled property and return count or 0 based on the entry's status
      });

      path = path.data(pie(dataset)); // update pie with new data

      path.transition() // transition of redrawn pie
        .duration(750) //
        .attrTween('d', function(d) { // 'd' specifies the d attribute that we'll be animating
          //var interpolate = d3.interpolate(this._current, d); // this = current path element
          var interpolate = d3.interpolate(this.__data__, d); // this = current path element
          this._current = interpolate(0); // interpolate between current value and the new value of 'd'
          return function(t) {
            return arc(interpolate(t));
          };
        });
    });

  // adding text to legend
  legend.append('text')
    .attr('x', legendRectSize_admin1 + legendSpacing_admin1)
    .attr('y', legendRectSize_admin1 - legendSpacing_admin1)
    .text(function(d) { return d;}); // return label

}
