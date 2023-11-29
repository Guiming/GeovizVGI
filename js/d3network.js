var data_network;
var LINKED_NODES_ONLY = $("#nodevisibilitycb").prop("checked");
var LINKED_WITH_FOCI_NODE_ONLY = $("#focinodecb").prop("checked");
var EDGE_WEIGHT_THRESHOD = $("#thresholdslider").val();

const NODE_SIZE_MIN = 4;
const EDGE_WEIGHT_MIN = 1;

function draw_network(data, update){

  var w = 550;
  var h = 500;

  var foci_user;
  var ids_min = 999999;
  var ids_max = 0;
  var totalids_min = 9999;
  var totalids_max = 0;
  for(var i in data){
    if(data[i].recorder == data[i].identifier){
      foci_user = data[i].recorder;
      console.log(foci_user);
      continue;
    }

    if(data[i].ids < ids_min){
      ids_min = data[i].ids;
    }
    if(data[i].ids > ids_max){
      ids_max = data[i].ids;
    }
    if(data[i].totalids < totalids_min){
      totalids_min = data[i].totalids;
    }
    if(data[i].totalids > totalids_max){
      totalids_max = data[i].totalids;
    }
  }
  $("#thresholdslider").prop({'min': ids_min, 'max': ids_max});
  $("#thresholdinput").prop({'min': ids_min, 'max': ids_max});
  $("#thresholdmin").html(ids_min);
  $("#thresholdmax").html(ids_max);
  $("#nodelabelcb").prop("checked", false);

  var names = new Set();
  var _nodes = new Set();
  var _edges = [];

  for(var i in data){
    if(!names.has(data[i].identifier)
        && (LINKED_NODES_ONLY ? data[i].ids >= EDGE_WEIGHT_THRESHOD : true)
        && (LINKED_WITH_FOCI_NODE_ONLY ? (data[i].identifier == foci_user || data[i].recorder == foci_user) : true)){
      names.add(data[i].identifier);
      var uid = data[i].identifierid;
      //if(uid != null){
      if(uid != 0){  
        uid = ""+uid;
        uid = uid.substring(1,uid.length-1);
      }
      var ulogin = data[i].identifierlogin;
      //if(ulogin != null){
      if(ulogin != 0){
        console.log("ulogin", ulogin);
        ulogin = ulogin.substring(1,ulogin.length-1);
      }
      var recs;
      for(var j in data){
        if(data[j].recorder == data[i].identifier){
          recs = data[j].records;
          break;
        }
      }
      _nodes.add({name: data[i].identifier, id: uid, login: ulogin, size: data[i].totalids, resgradobs: recs});
    }
  }

  for(var i in data){
      var rec = data[i].recorder;
      if(!names.has(rec)
        && (LINKED_NODES_ONLY ? data[i].ids >= EDGE_WEIGHT_THRESHOD : true)
        && (LINKED_WITH_FOCI_NODE_ONLY ? (data[i].identifier == foci_user || data[i].recorder == foci_user) : true)) {
        names.add(data[i].recorder);
        var uid = data[i].recorderid;
        //if(uid != null){
        if(uid != 0){
          uid = uid.substring(1,uid.length-1);
        }
        //var ulogin = data[i].identifierlogin;
		var ulogin = data[i].recorderlogin;
        //if(ulogin != null){
        if(ulogin != 0){
          ulogin = ulogin.substring(1,ulogin.length-1);
        }
        _nodes.add({name: data[i].recorder, id: uid, login: ulogin, size: 1, resgradobs: data[i].records});
      }
  }

  names = Array.from(names);

  for(var i in data){
    if(data[i].recorder == data[i].identifier){
      continue;
    }
    if(data[i].ids >= EDGE_WEIGHT_THRESHOD
      && (LINKED_WITH_FOCI_NODE_ONLY ? (data[i].identifier == foci_user || data[i].recorder == foci_user) : true)){
      var from = names.indexOf(data[i].recorder);
      var to = names.indexOf(data[i].identifier);
      if(from >= 0 && to >= 0){
        _edges.push({source: from, target: to, weight: data[i].ids});
      }
      else{
        console.log("node does not exist...");
      }
    }
  }

  //console.log(ids_min, ids_max)

  console.log(names) 
  console.log(_edges)
  
  //var colors = d3.scale.ordinal().domain(names);
  var colors = d3.scale.category20();
  var dataset = {
    nodes: Array.from(_nodes),
    edges: _edges
  };

  //console.log(dataset);


  if(/*true == update*/d3.select("#svg_network")[0][0] != null){
    d3.select("#svg_network").remove();
  }

  var zoom = d3.behavior.zoom()
    .scaleExtent([0.2, 5])
    .on("zoom", zoomed);

  var svg = d3.select("#d3networkmain")
              .append("svg")
              .attr({"width":w,"height":h})
              .attr("id", "svg_network")

              .append("g") // zoom
                  .attr("transform", "translate(" + 0 + "," + 0 + ")")
                  .call(zoom);

  //svg.style("cursor","move");

  var rect = svg.append("rect")
    .attr("width", w)
    .attr("height", h)
    .style("fill", "none")
    .style("pointer-events", "all");

  var container = svg.append("g");

  rect.style("cursor","move");

  var linkedByIndex = {};
  dataset.edges.forEach(function(d) {
      linkedByIndex[d.source + "," + d.target] = true;
  });

	function isConnected(a, b) {
      return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }

	function hasConnections(a) {
		for (var property in linkedByIndex) {
				s = property.split(",");
				if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) 					return true;
		}
	  return false;
	}

  var force = d3.layout.force()
      .nodes(dataset.nodes)
      .links(dataset.edges)
      .size([w,h])
      .linkStrength(0.8)
      .friction(0.9)
      //.linkDistance([120])
      .linkDistance(function(d){return Math.ceil(120.0*d.weight*1.0/ids_max);})
      .chargeDistance([700])
      //.charge([-700])
      .charge(function(d){return Math.ceil(-500 - 1000.0*(d.size - totalids_min)*1.0/(totalids_max - totalids_min));})
      .theta(0.8)
      .gravity(0.5)
      //.gravity(function(d){ return 0.5 + 0.5*(d.size - totalids_min)*1.0/(totalids_max - totalids_min);})
      .start();

  var edges = container.selectAll(".edge")
    .data(dataset.edges)
    .enter().append("g")
    .attr("class", "edge")
    .on("mouseover", function(d){edgemouseover(d);})
    .on("mousemove", edgemousemove)
    .on("mouseout", function(d){edgemouseout(d);})

    .append("line")
    .attr("id",function(d,i) {return 'edge'+i})
    .attr("stroke-width", function(d){ return edgeweight(d.weight)})
    //.attr('marker-end','url(#arrowhead)')
    .style("stroke",function(d){
      if(edgeweight(d.weight) == EDGE_WEIGHT_MIN){return "#e0e0e0";}
      else{
        return "#515151";
      }
    })
    .style("pointer-events", "auto");


  var nodetip = d3.select('#d3network')
    .append('div')
    .attr('class', 'nodetip');
  nodetip.append('div')
    .attr('class', 'name');
  nodetip.append('div')
    .attr('class', 'uid');
  nodetip.append('div')
    .attr('class', 'ulogin');
  nodetip.append('div')
    .attr('class', 'nbr');
  nodetip.append('div')
    .attr('class', 'totalids')
  nodetip.append('div')
    .attr('class', 'resgradobs')
  nodetip.append('div')
    .attr('class', 'tip');


  var edgetip = d3.select('#d3network')
    .append('div')
    .attr('class', 'edgetip');
  edgetip.append('div')
    .attr('class', 'pair');
  edgetip.append('div')
    .attr('class', 'pairid');
  edgetip.append('div')
    .attr('class', 'pairlogin');
  edgetip.append('div')
    .attr('class', 'value');

  var nodes = container.selectAll(".node")
    .data(dataset.nodes)
    .enter().append("g")
    .attr("class", "node")
    .on("mouseover", function(d){nodemouseover(d);})
    .on("mousemove", nodemousemove)
    .on("mousedown", function(d) {d3.event.stopPropagation();})
    .on("dblclick", function(d) {window.open(`https://www.inaturalist.org/people/${d.login}`, '_blank');})
    .on("mouseout", function(d){nodemouseout(d);})
    .append("circle")
    .attr({"r":function(d){return nodesize(d.size)}})
    .style("fill",function(d,i){

        if(d.name == foci_user){
          return "black";
        }

        if(nodesize(d.size) > NODE_SIZE_MIN){
          return colors(i);
        }
        else{
          return "#e0e0e0";
        }
      })
    .call(force.drag)

  var nodelabels = container.selectAll(".nodelabel")
     .data(dataset.nodes)
     .enter()
     .append("text")
     .attr({"x":function(d){return d.x + nodesize(d.size);},
            "y":function(d){return d.y;},
            "class":"nodelabel",
            'font-size':10,
            "stroke":"#595959"})
     .text(function(d){
        if(nodesize(d.size) > NODE_SIZE_MIN){return d.name;}
        else{return '';}
      })
      .style("display", "none");

  var edgepaths = container.selectAll(".edgepath")
      .data(dataset.edges)
      .enter().append("g")
      .append('path')
      .attr({'d': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
             'class':'edgepath',
             'fill-opacity':0,
             'stroke-opacity':0,
             'fill':'blue',
             'stroke':'red',
             'id':function(d,i) {return 'edgepath'+i}})
      .style("pointer-events", "none");

  var edgelabels = container.selectAll(".edgelabel")
      .data(dataset.edges)
      .enter()
      .append('text')
      .style("pointer-events", "none")
      .attr({'class':'edgelabel',
             'id':function(d,i){return 'edgelabel'+i},
             'dx':80,
             'dy':0,
             'font-size':10,
             'fill':'#aaa'});

  edgelabels.append('textPath')
      .attr('xlink:href',function(d,i) {return '#edgepath'+i})
      .style("pointer-events", "none");
      //.text(function(d,i){return 'label '+i});
      //.text("ID by");

  force.on("tick", function(){

      edges.attr({"x1": function(d){return d.source.x;},
                  "y1": function(d){return d.source.y;},
                  "x2": function(d){return d.target.x;},
                  "y2": function(d){return d.target.y;}
      });

      nodes.attr({"cx":function(d){return d.x;},
                  "cy":function(d){return d.y;}
      });

      nodelabels.attr("x", function(d) { return d.x + nodesize(d.size); })
                .attr("y", function(d) { return d.y; });

      edgepaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                                         //console.log(d)
                                         return path});

      edgelabels.attr('transform',function(d,i){
          if (d.target.x<d.source.x){
              bbox = this.getBBox();
              rx = bbox.x+bbox.width/2;
              ry = bbox.y+bbox.height/2;
              return 'rotate(180 '+rx+' '+ry+')';
              }
          else {
              return 'rotate(0)';
              }
      });
  });

  function nodemouseover(d) {

    svg.style("cursor","pointer");

    nodelabels.transition()
          .duration(250)
          .attr("stroke", function(o){
              return isConnected(d, o) ? "blue": "#595959";
          })
          .attr("font-size", function(o){
              return isConnected(d, o) ? 20: 10;
          });

    edges.transition()
        .duration(250)
        .style("stroke", function(o) {
              return o.source.index == d.index || o.target.index == d.index ? "blue" : edgeweight(o.weight) == EDGE_WEIGHT_MIN ? "#e0e0e0" : "#515151";
          })
        .style("stroke-width", function(o) {
              return o.source.index == d.index || o.target.index == d.index ? edgeweight(o.weight) *2 : edgeweight(o.weight);
          });
     nodes.transition()
         .duration(250)
         .style("stroke", function(o){
             return isConnected(d, o) ? "blue": "#ccc";
           })
         .style("stroke-width", function(o){
             return isConnected(d, o) ? 2: 1;
           })
         .attr("r", function(o){
            return o.index == d.index ? nodesize(o.size) * 2 : nodesize(o.size);
         });

       var nconnected = -1;
       for(var i in dataset.nodes){
         nconnected += isConnected(d, dataset.nodes[i]);
       }

      nodetip.select('.name').html(d.name);
      nodetip.select('.uid').html("uid: " + d.id);
      nodetip.select('.ulogin').html("login: " + d.login);
      var tailstr = " identifications";
      var nbrstr = " linked users";
      var nresgradobs = " observations";
      if(d.size == 1){
        tailstr = " identification";
      }
      if(nconnected == 1){
        nbrstr = " linked user";
      }
      if(d.resgradobs == 1){
        nresgradobs = " observation";
      }
      nodetip.select('.totalids').html(d.size + tailstr);
      nodetip.select('.nbr').html(nconnected + nbrstr);
      nodetip.select('.resgradobs').html(d.resgradobs + nresgradobs);
      nodetip.select('.tip').html("[double click for bio]");
      nodetip.select('.tip').style("color", "gray");
      nodetip.style('display', 'block'); // set display

  }

  function nodemousemove() {
      nodetip.style('top', (d3.event.layerY + 80) + 'px') // always 10px below the cursor
        .style('left', (d3.event.layerX + 20) + 'px'); // always 10px to the right of the mouse
  }

  function nodemouseout(d) {

    rect.style("cursor","move");

    nodelabels.transition()
          .duration(250)
          .attr("stroke", "#595959")
          .attr("font-size", 10);;

    edges.transition()
        .duration(250)
        .style("stroke", function(o) {
              return edgeweight(o.weight) == EDGE_WEIGHT_MIN ? "#e0e0e0" : "#515151";
          })
        .style("stroke-width", function(o) {
              return edgeweight(o.weight);
          });
     nodes.transition()
         .duration(250)
         .style("stroke", "#ccc")
         .style("stroke-width", 1)
         .attr("r", function(o){
            return nodesize(o.size);
         });
    nodetip.style('display', 'none');
  }


  function edgemouseover(d) {

      svg.style("cursor","pointer");

      nodelabels.transition()
          .duration(250)
          .attr("stroke", function(o){
              return o.index == d.source.index || o.index == d.target.index ? "blue": "#595959";
            })
            .attr("font-size", function(o){
                return o.index == d.source.index || o.index == d.target.index ? 20: 10;
            });

      edges.transition()
          .duration(250)
          .style("stroke", function(o) {
                return o.source.index == d.source.index && o.target.index == d.target.index ? "blue" : edgeweight(o.weight) == EDGE_WEIGHT_MIN ? "#e0e0e0" : "#515151";
            })
          .style("stroke-width", function(o) {
                return o.source.index == d.source.index && o.target.index == d.target.index ? edgeweight(o.weight) *2 : edgeweight(o.weight);
            });
       nodes.transition()
           .duration(250)
           .style("stroke", function(o){
               return o.index == d.source.index || o.index == d.target.index ? "blue": "#ccc";
             })
           .style("stroke-width", function(o){
               return o.index == d.source.index || o.index == d.target.index ? 2: 1;
             })
           .attr("r", function(o){
              return o.index == d.source.index || o.index == d.target.index ? nodesize(o.size) * 2 : nodesize(o.size);
           });

      edgetip.select('.pair').html(d.target.name + "&#8592;" + d.source.name);
      edgetip.select('.pairid').html("uid: " + d.target.id + "&#8592;" + d.source.id);
      edgetip.select('.pairlogin').html("login: " + d.target.login + "&#8592;" + d.source.login);
      var tailstr = " identifications";
      if(d.weight == 1){
        tailstr = " identification";
      }
      edgetip.select('.value').html(d.weight + tailstr);
      edgetip.style('display', 'block'); // set display
  }

  function edgemousemove() {
      edgetip.style('top', (d3.event.layerY + 80) + 'px') // always 10px below the cursor
        .style('left', (d3.event.layerX + 20) + 'px'); // always 10px to the right of the mouse
  }

  function edgemouseout(d) {

      rect.style("cursor","move");

      nodelabels.transition()
          .duration(250)
          .attr("stroke", "#595959")
          .attr("font-size", 10);

      edges.transition()
          .duration(250)
          .style("stroke", function(o) {
                return edgeweight(o.weight) == EDGE_WEIGHT_MIN ? "#e0e0e0" : "#515151";
            })
          .style("stroke-width", function(o) {
                return edgeweight(o.weight);
            });
       nodes.transition()
           .duration(250)
           .style("stroke", "#ccc")
           .style("stroke-width", 1)
           .attr("r", function(o){
              return nodesize(o.size);
           });
      edgetip.style('display', 'none');
  }

  function zoomed() {
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  function nodesize(totalids){
    return Math.min(40, Math.max(NODE_SIZE_MIN, Math.floor(Math.log2(totalids))));
  }

  function edgeweight(ids){
    return Math.min(4, Math.max(EDGE_WEIGHT_MIN, Math.floor(Math.sqrt(ids))));
  }
}
/*
var featureServer = "http://130.253.215.92:9000/"
var usernetworkUrlBase = featureServer + "functions/user_query_network/items.json?";
var usernetworkDataUrl = usernetworkUrlBase + "userid=477&datestart=2018-01-01&dateend=2018-03-31&obscured=true&captivecultivated=true";
$.get(usernetworkDataUrl, function(data, status)
{
    console.log("fetched user network data");
    console.log(data);

    data_network = jQuery.extend(true, [], data);

    draw_network(data_network, false);

}).fail(function(){
    console.log("fetching user network data failed");
});
*/
