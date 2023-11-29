function convertNumbers(row) {
  var r = {};
  for (var k in row) {
    r[k] = +row[k];
    if (isNaN(r[k])) {
      r[k] = row[k];
    }
  }
  return r;
}
/*
var __data;
d3.csv("data/2020/u426782/user_query_bbox.csv", convertNumbers, function(error, data) {
  console.log("im in here")
  console.log(error)
  console.log(data)
  __data = data
})

*/

// GitHub deployed version is limited to the following users (whose contribtuion patterns were exemplified in the CaGIS paper)
const gh_uids2020 = [426782,275891];
const gh_uids2019 = [275891,1030528,611294,2369084,1555067,196849,769610]

// BASE MAP
  var zoomLevel = 5 //9;
  var center = [43.1147469,-95.5102336]//[39.737, -104.959];
  var zoomLevelThreshold = 15
  var myMap = L.map('mapid').setView(center, zoomLevel);

  var basemap_gterrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
  }).addTo(myMap);

  var basemap_gstreet = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
  }).addTo(myMap);

  var basemap_gsat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
  }).addTo(myMap);

  var basemap_ghybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
  }).addTo(myMap);


  var basemap_osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        maxZoom: 20,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(myMap);
	  
  var basemap_carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/{id}/{z}/{x}/{y}.png', {
    maxZoom: 20,
    id: 'voyager'
  }).addTo(myMap);


  //basemap.addTo(myMap);

 /* 
 IP address and port of the feature server (pg_featureserv)
 Feature services running on the server, providing various database (PostGIS) query capabilities
 Modify accordingly based on server deployment configurations

 For this GitHub (gh-pages) version, because serves cannot be deployed on GitHub, 
 all data (on a limited set of iNat contributors) are loaded from pre-generated CSV files

 */
  var featureServer = "http://130.253.215.10:9000/"

  var featureUrlBase = featureServer + "functions/user_query_bbox/items.json?";
 // var featureCountUrlBase = featureServer + "functions/user_query_obs_count/items.json?";

  var barchartDataUrlBaseDayObs = featureServer + "functions/user_query_daterange_obs_day/items.json?";
  var barchartDataUrlBaseMonthObs = featureServer + "functions/user_query_daterange_obs_month/items.json?";
  var barchartDataUrlBaseYearObs = featureServer + "functions/user_query_daterange_obs_year/items.json?";

  var barchartDataUrlBaseDayStdDist = featureServer + "functions/user_query_daterange_stddist_day/items.json?";
  var barchartDataUrlBaseMonthStdDist = featureServer + "functions/user_query_daterange_stddist_month/items.json?";
  var barchartDataUrlBaseYearStdDist = featureServer + "functions/user_query_daterange_stddist_year/items.json?";

  var barchartDataUrlBaseDayIDs = featureServer + "functions/user_query_daterange_ids_day/items.json?";
  var barchartDataUrlBaseMonthIDs = featureServer + "functions/user_query_daterange_ids_month/items.json?";
  var barchartDataUrlBaseYearIDs = featureServer + "functions/user_query_daterange_ids_year/items.json?";

  var piechartDataUrlBase = featureServer + "functions/user_query_kingdoms/items.json?";
  var piechartlandcoverDataUrlBase = featureServer + "functions/user_query_landcover/items.json?";
  var piechartcountryDataUrlBase = featureServer + "functions/user_query_country/items.json?";
  var piechartadmin1DataUrlBase = featureServer + "functions/user_query_admin1/items.json?";
  var cloudDataUrlBase = featureServer + "functions/user_query_species/items.json?";
  //var speciesCountUrlBase = featureServer + "functions/user_query_species_count/items.json?";

  var usernetworkUrlBase = featureServer + "functions/user_query_network/items.json?";
  
  //GZ April 2023
  var nuserfeatuersUrlBase = featureServer + "functions/users_query_features_raw/items.json?"; 
  
  var nuserchangeposfeatuersUrlBase = featureServer + "functions/users_query_change_pos_features_raw/items.json?"; 
  var nuserchangenegfeatuersUrlBase = featureServer + "functions/users_query_change_neg_features_raw/items.json?"; 
  var nuserchangezerofeatuersUrlBase = featureServer + "functions/users_query_change_zero_features_raw/items.json?"; 
  
  var clustercentersUrlBase = featureServer + "functions/user_query_cluster_centers_raw/items.json?";

  //var vtServer = "http://localhost:80/"
  //var vtServer = "http://130.253.215.92:7800/"
  //var vtServer = "http://130.253.215.92:80/"
  var vtServer = "http://130.253.215.10:7800/"

  var vtLayerId = "public.user_query_bbox_mvt";
  var vtUrlBase = vtServer + vtLayerId + "/{z}/{x}/{y}.pbf?";

	var data_all;
	var heatLayer;
	var featureLayer;
	//var vtLayer;
	var geoJson;
	var req_null_flag = true;
	//var res;
	//var evt;
	//var u_i;
	var n_features;
	var vtColor = "red";
  var vtStyling = {};
	vtStyling[vtLayerId] = {
		"radius":4,
		"fill": true,
		"fillColor": vtColor,
		"fillOpacity": 0.5,
		"color": "gray",
		"opacity": 0.5,
		"weight": 1
	};
	myMap.createPane('OverlayPane');
      	myMap.getPane('OverlayPane').style.zIndex = 650;
	var vtOptions = {
		interactive: true, pane: 'OverlayPane',
    		rendererFactory: L.canvas.tile,
		vectorTileLayerStyles: vtStyling,
		getFeatureId: function(f) {
			return f.properties.url;
		}
	};
  var vtLayerInit = false;

  var barchartdayobsInit = false;
  var barchartmonthobsInit = false;
  var barchartyearobsInit = false;

  var barchartdaystddistInit = false;
  var barchartmonthstddistInit = false;
  var barchartyearstddistInit = false;

  var barchartdayidsInit = false;
  var barchartmonthidsInit = false;
  var barchartyearidsInit = false;

  var target = 'Submission';
  var temporalgrain = 'Day';

  var pielandcoverInit = false;
  var piecountryInit = false;
  var pieadmin1Init = false;

  var cloudcomnameInit = false;
  var cloudscinameInit = false;
  var piekingdomInit = false;
  var networkInit = false;
  
  //GZ April 2023
  var parcoordsInit = false;

  //var data_wordcloud;
  //var data_piechartkingdom;
  var tmpMode = false;
  var updateonfly = false;
  var reloadneeded = false;


	// Heat map layer
	var heatLayerOptions = {
		minOpacity: 0.25, //the minimum opacity the heat will start at
		maxZoom: 14, //zoom level where the points reach maximum intensity
		minZoom: 4, //zoom level where the points reach maximum intensity

		max: 1.0, // maximum point intensity, 1.0 by default
		radius: 25, // radius of each "point" of the heatmap, 25 by default
		blur: 15, // amount of blur, 15 by default
		gradient: {0.4: 'blue', 0.75: 'lime', 1: 'red'}
	};

	heatLayer = L.heatLayer([], heatLayerOptions); //.addTo(myMap);



	// Feature layer
	var featureMarkerOptions = {
		radius: 4,
		fillColor: "red",
		color: "gray",
		weight: 1,
		opacity: 0.5,
		fillOpacity: 0.5
	};

	featureLayer = L.geoJson([], {
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, featureMarkerOptions);
		},
		onEachFeature: function (feature, layer) {
			var p = feature.properties;
			var html = "<p>";
      //, "land_cover"
      var keys = ["user_id", "user_login", "observed_on", "time_observed_at", "created_at", "updated_at",
                  "lon", "lat", "positional_accuracy", "land_cover",
                  "place_guess", "quality_grade", "common_name", "scientific_name",
                  "iconic_taxon_name", "taxon_id", "url", "image_url"];
      var k;
      for (k=0; k<keys.length; k++) {
        if(keys[k] == "url"){
          html += "<b>" + "<a target=\"_blank\" href=" + p[keys[k]] +  ">" + "View on Web" + "</b> " + "</a>" + "<br/>"
        }
        else if(keys[k] == "image_url"){
          /*html += "<img " + "src=" + p[keys[k]] +  " width=40%>" + "</img>" + "<br/>"*/
        }
        else{
          html += "<b>" + keys[k].replace(/_/g, " ") + ":</b> " + p[keys[k]] + "<br/>"
        }
      }

      /*
      for (var k in p) {
				html += "<b>" + k + ":</b> " + p[k] + "<br/>"
			}
      */
			html += "</p>";


			layer.bindPopup(html);
		}
	}).addTo(myMap);

var params;
var params_json;
var params_tmp_json;
var year_str;
var userid_str;

var query_params_json = function(){
 
    var userid = $("#userid option:selected")[0].text;//$("#userslist").val() //$("#userid")[0].value;
    var datestart = $("#datestart")[0].value
    var dateend = $("#dateend")[0].value
    var obscured = $("#obscured")[0].checked
    var captivecultivated = $("#captivecultivated")[0].checked
    var params = {userid: userid,
                  datestart: datestart,
                  dateend: dateend,
                  obscured: obscured,
                  captivecultivated: captivecultivated};
       
    // set these two values for debug only   
    //params['datestart'] = '2020-01-01';
    //params['userid'] = 426782;

    //year_str = params['datestart'].split("-")[0];
    //userid_str = params['userid'].toString() ;

    return params;
}

var query_params_json_tmp = function(){

    var userid = $("#userid option:selected")[0].text; //$("#userslist").val() //$("#userid")[0].value;
    var datestart = $("#datestart_tmp")[0].value
    var dateend = $("#dateend_tmp")[0].value
    var obscured = $("#obscured")[0].checked
    var captivecultivated = $("#captivecultivated")[0].checked
    var params = {userid: userid,
                  datestart: datestart,
                  dateend: dateend,
                  obscured: obscured,
                  captivecultivated: captivecultivated};
    return params;
}

var query_params_json2str = function(params_json){
  
  params = "";
    var i = 0;
    for(key in params_json){
        if(i == 0){
            params = params + key + "=" + params_json[key];
        }else{
            params = params + "&" + key + "=" + params_json[key];
        }
        i = i + 1;
    }
    return params;
}

var update = function(resetMapView, updateBarchart, updategeographyPieChart, updateCloud, updateNetwork, tmpMode, updateParcoords){ // updateParcoords added by GZ April 2023
	
  $('body').css('cursor','wait');

  //year_str = (""+$("#datestart")[0].value).split("-")[0];
  year_str = '2020';
  userid_str = '426782'
	
  if(true == updateParcoords){
		
		$( "#userid" ).prop( "disabled", true );

		$( "#showclustercb" ).prop( "checked", false );	
		$( "#showclustercb" ).trigger("change");
		$( "#showclustercb" ).prop( "disabled", true );
		
        var nuserfeatuersDataUrl;
		nuserfeatuersDataUrl = nuserfeatuersUrlBase + "nusers=" + $("#batchsize option:selected")[0].text 
			+ "&udate=" + $("#datestart")[0].value + "&cuids=" + $("#cuid").val()
			+ "&nclosest=" + $("#n_closest_farthest").val();
		
		// focus on contributors whose contribution pattern has changed from 2019 to 2020
		if($("#changeonlycb")[0].checked){
			if($('#patter_increased')[0].checked){
				nuserfeatuersDataUrl = nuserchangeposfeatuersUrlBase + "nusers=" + $("#batchsize option:selected")[0].text + "&udate=" + $("#datestart")[0].value + "&cuids=" + $("#cuid").val();
			}else if($('#patter_decreased')[0].checked){
				nuserfeatuersDataUrl = nuserchangenegfeatuersUrlBase + "nusers=" + $("#batchsize option:selected")[0].text + "&udate=" + $("#datestart")[0].value + "&cuids=" + $("#cuid").val();
			}else{
				nuserfeatuersDataUrl = nuserchangezerofeatuersUrlBase + "nusers=" + $("#batchsize option:selected")[0].text + "&udate=" + $("#datestart")[0].value + "&cuids=" + $("#cuid").val();				
			}
		}
		
		//nuserfeatuersDataUrl = nuserfeatuersDataUrl + "&cuids=" + $("#cuid").val()
		console.log(nuserfeatuersDataUrl)
		
        //$.get(nuserfeatuersDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/users_query_features_raw.csv", convertNumbers, function(error, data) 
        {   
          console.log("fetched n users feature data");
          console.log(data)
          data_parcoords = jQuery.extend(true, [], data);	  
		  
		   // initialize #userid select element options
			$('#userid')
				.find('option')
				.remove()
				.end();
				
			var colors_center = ["#D3D3D3", "#90EE90", "#A7C7E7", "#FA8072"];
			var cs = unpack(data, "cluster")
			
			$.each(unpack(data, "userid"), function(index, value) {   
        
        if(year_str == '2020'){
          if(gh_uids2020.includes(value)){
            $('#userid')
            .append($("<option " + "style='background-color:" + colors_center[cs[index]-1] + ";'" + "></option>")
                  .attr("value", index)
                  .text(value));
            }else{
              $('#userid')
            .append($("<option " + "style='background-color:" + colors_center[cs[index]-1] + ";'" + " disabled></option>")
                  .attr("value", index)
                  .text(value));
            }
          }
          else if(year_str == '2019'){
            if(gh_uids2019.includes(value)){
              $('#userid')
              .append($("<option " + "style='background-color:" + colors_center[cs[index]-1] + ";'" + "></option>")
                    .attr("value", index)
                    .text(value));
              }else{
                $('#userid')
              .append($("<option " + "style='background-color:" + colors_center[cs[index]-1] + ";'" + " disabled></option>")
                    .attr("value", index)
                    .text(value));
              }
            }
          else{
            console.log("this GitHub deployed version only showcase contributors in 2019 and 2020.")
          }
			 });
			
			// temporarily disable change event
			//$( "#userid" ).off('change'); 
			
			$('#userid option[value=0]').prop('selected', true);	
			
			$( "#userid" ).prop( "disabled", false );
			
			//$('#userid').trigger("change")
		  
          //console.log(data);
			//$.get(clustercentersUrlBase + "&udate=" + $("#datestart")[0].value, function(data_center, status){
      d3.csv("data/" + year_str + "/user_query_cluster_centers_raw.csv", convertNumbers, function(error, data_center) {  
				  console.log("fetched cluster center data");	
				  data_cluster_centers = jQuery.extend(true, [], data_center);
				  
				// update options for cluster list  
				$('#clusters')
					.find('option')
					.remove()
					.end();
			
				var colors_center = ["#D3D3D3", "#90EE90", "#A7C7E7", "#FA8072"];
			
				$.each(data_center, function(index, value) {

				
			
				 if(value['cluster'] == 2){
					 $('#clusters')
					 .append($("<option selected " + "style='background-color:" + colors_center[index] + ";'" + "></option>")
								.attr("value", "cluster" + value['cluster'])
								.text("Cluster " + value['cluster'] + " (N=" + value['nusers'] + ")"));
				 }
				 else{
					 $('#clusters')
					 .append($("<option " + "style='background-color:" + colors_center[index] + ";'" + "></option>")
								.attr("value", "cluster" + value['cluster'])
								.text("Cluster " + value['cluster'] + " (N=" + value['nusers'] + ")"));
				 } 
				});
				  
				  
				  if(!parcoordsInit){
					
					draw_parcoords(data_parcoords, data_cluster_centers, parcoordsInit);
					
					parcoordsInit = true;
				  }else{
					
					draw_parcoords(data_parcoords, data_cluster_centers, parcoordsInit);
				  }
				  
				uid = parseInt($('#userid option:checked')[0].text)
        //userid_str=""+uid;
				urec = data_parcoords.filter(function(el){return el.userid==uid})
				ucluster = urec[0]["cluster"]
				val = 'cluster' + ucluster
				$('#clusters option[value=' + val + ']').prop('selected', true);
				$('#clusters').trigger('change');
				  
				  if(true == tmpMode){
            params_tmp_json = query_params_json_tmp();
					  params = query_params_json2str(params_tmp_json);
				  }
				  else{
            params_json = query_params_json();
					  params = query_params_json2str(params_json);
				  }
				  update_map_graph(params, true, true, true, true, true);
				  
				  $('body').css('cursor','default');
				  
			})
      /*
      .fail(function(){
				console.log("fetching cluster centers failed");
				//$('body').css('cursor','default');
			})
      */

        })/*.fail(function(){
            console.log("fetching n users feature data failed");
			$('body').css('cursor','default');
        })*/;
    }else{	

	  if(true == tmpMode){
      params_tmp_json = query_params_json_tmp();
		  params = query_params_json2str(params_tmp_json);
	  }
	  else{
      params_json = query_params_json();
		  params = query_params_json2str(params_json);
	  }
	  update_map_graph(params, resetMapView, updateBarchart, updategeographyPieChart, updateCloud, updateNetwork);
	}
}

//Added by GZ April 2023
/*
var update_parcoords = function(updateParcoords){
	if(true == updateParcoords){
        var nuserfeatuersDataUrl = nuserfeatuersUrlBase + "&" + $("#datestart")[0].value;
        $.get(nuserfeatuersDataUrl, function(data, status)
        {
          console.log("fetched n users feature data");
          //console.log(data);

          data_parcoords = jQuery.extend(true, [], data);
          if(!parcoordsInit){
            
			draw_parcoords(data_parcoords, parcoordsInit);
            
			parcoordsInit = true;
          }else{
            
			draw_parcoords(data_parcoords, parcoordsInit);
          }

        }).fail(function(){
            console.log("fetching n users feature data failed");
        });
      }
	
}
*/
var update_map_graph = function(params, resetMapView, updateBarchart, updategeographyPieChart, updateCloud, updateNetwork) {
    /* no vector tiles in the github deployed version
    // vector tiles
    var vtUrl = vtUrlBase + params
  	//console.log("Reading tiles from " + vtUrl);

    if (!vtLayerInit){
      vtLayer = L.vectorGrid.protobuf(vtUrl, vtOptions); //.addTo(myMap);
      //http://bl.ocks.org/reyemtm/c93cdc699b06b0b5305a9312efa2282d
    	//https://gis.stackexchange.com/questions/256888/styling-geoserver-pbf-vector-tiles-in-leaflet
      //!!!https://github.com/Leaflet/Leaflet/issues/6789
    	vtLayer.on('click', function(e){
      		//console.log(e.layer);

          var p = e.layer.properties;
          var html = "<p>";
          for (var k in p) {
            //console.log(k)
            if(k == "url"){
              html += "<b>" + "<a target=\"_blank\" href=" + p[k] +  ">" + "View on Web" + "</b> " + "</a>" + "<br/>"
            }
            else if(k == "image_url"){
              html += "<img " + "src=" + p[k] +  " width=40%>" + "</img>" + "<br/>"
            }
            else{
              html += "<b>" + k.replace(/_/g, " ") + ":</b> " + p[k] + "<br/>"
            }
          }
          html += "</p>";
          L.popup()
            .setContent(html)
            .setLatLng(e.latlng)
            .openOn(myMap);
    		    L.DomEvent.stop(e);
    	});


		///*
		var baseMap = {
		"Google Terrain": basemap_gterrain,
		"Google Streets": basemap_gstreet,
		"Google Satellite": basemap_gsat,
		"Google Hybrid": basemap_ghybrid,		
		"BaseMap OSM": basemap_osm,
		"BaseMap Carto": basemap_carto
		};
		var overlayMaps = {
			"Points": featureLayer,
			"HeatMap": heatLayer ,
			"Points(VTile)": vtLayer
		};
		var ctrl = L.control.layers(baseMap, overlayMaps).addTo(myMap);
		//ctrl.removeFrom(myMap);
		//ctrl.layers(baseMap).addTo(myMap);
		//ctrl.
	
      //vtLayerInit = true;
    }
    else{
      //vtLayer.setUrl(vtUrl)
    }
    */
    var baseMap = {
      "Google Terrain": basemap_gterrain,
      "Google Streets": basemap_gstreet,
      "Google Satellite": basemap_gsat,
      "Google Hybrid": basemap_ghybrid,		
      "BaseMap OSM": basemap_osm,
      "BaseMap Carto": basemap_carto
      };
      var overlayMaps = {
        "Points": featureLayer,
        "HeatMap": heatLayer 
      };
      var ctrl = L.control.layers(baseMap, overlayMaps).addTo(myMap);

    if(true == updateNetwork){
		networkInit = false;
        var usernetworkDataUrl = usernetworkUrlBase + params;
        //$.get(usernetworkDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_network.csv", convertNumbers, function(error, data) 
        {
          console.log("fetched user network data");
          console.log(data);

          data_network = jQuery.extend(true, [], data);
          if(!networkInit){
            draw_network(data_network, networkInit);
            networkInit = true;
          }else{
            draw_network(data_network, networkInit);
          }
		  
		  if(networkInit){
			   $("#ctrnetwork").prop("disabled", false);
			   $('body').css('cursor','default');
		  }
			
        })/*.fail(function(){
            console.log("fetching user network data failed");
			//$('body').css('cursor','default');
        })*/;
      }

    if(true == updateBarchart){

		barchartyearobsInit = false;
		barchartmonthobsInit = false;
		barchartdayobsInit = false;
		barchartyearstddistInit = false;
		barchartmonthstddistInit = false;
		barchartdaystddistInit = false;
		barchartyearidsInit = false;
		barchartmonthidsInit = false;
		barchartdayidsInit = false;

      ///*
      var barchartDataUrl = barchartDataUrlBaseDayIDs + params;
      //$.get(barchartDataUrl, function(data, status)
      //{
      d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_ids_day.csv", convertNumbers, function(error, data) 
      {  
        console.log("fetched barchart ids data (day)");
        //console.log(data);
        //return;
        if(!barchartdayidsInit){
            draw_barchart_day(data,barchartdayidsInit, "IDs");
            barchartdayidsInit = true;
         }
         else{
             draw_barchart_day(data,barchartdayidsInit, "IDs");
         }
         $("#d3bardayids").hide();
		    
			if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');	
			}
		
      })/*.fail(function(){
          console.log("fetching barchart ids data (day) failed");
		  //$('body').css('cursor','default');
      })*/;


      ////
      var barchartDataUrl = barchartDataUrlBaseMonthIDs + params;
      //$.get(barchartDataUrl, function(data, status)
      //{
      d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_ids_month.csv", convertNumbers, function(error, data) 
      {  
        console.log("fetched barchart ids data (month)");
        //console.log(data);
        //return;
        if(!barchartmonthidsInit){
            draw_barchart_month(data,barchartmonthidsInit, "IDs");
            barchartmonthidsInit = true;
         }
         else{
             draw_barchart_month(data,barchartmonthidsInit, "IDs");
         }
         $("#d3barmonthids").hide();
		   	
			if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
      })/*.fail(function(){
          console.log("fetching barchart ids data (month) failed");
		  //$('body').css('cursor','default');
      })*/;

      ////
      var barchartDataUrl = barchartDataUrlBaseYearIDs + params;
      //$.get(barchartDataUrl, function(data, status)
      //{
      d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_ids_year.csv", convertNumbers, function(error, data) 
      {
        console.log("fetched barchart ids data (year)");
        //console.log(data);
        //return;
        if(!barchartyearidsInit){
            draw_barchart_year(data,barchartyearidsInit, "IDs");
            barchartyearidsInit = true;
         }
         else{
             draw_barchart_year(data,barchartyearidsInit, "IDs");
         }
         $("#d3baryearids").hide();
			
			if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
			
			
      })/*.fail(function(){
          console.log("fetching barchart ids data (year) failed");
		  //$('body').css('cursor','default');
      })*/;

      ///***********************/


      ///*
      var barchartDataUrl = barchartDataUrlBaseDayStdDist + params;
      //$.get(barchartDataUrl, function(data, status)
      //{
      d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_stddist_day.csv", convertNumbers, function(error, data) 
      {        
        //console.log("fetching stats from " + graphDataUrl);
        console.log("fetched barchart stddist data (day)");
        //console.log(data);
        if(!barchartdaystddistInit){
            draw_barchart_day(data,barchartdaystddistInit, "StdDistance");
            barchartdaystddistInit = true;
         }
         else{
             draw_barchart_day(data,barchartdaystddistInit, "StdDistance");
         }
         $("#d3bardaystddist").hide();
		    
			if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
      })/*.fail(function(){
          console.log("fetching barchart stddist data (day) failed");
		  //$('body').css('cursor','default');
      })*/;


      ////
      var barchartDataUrl = barchartDataUrlBaseMonthStdDist + params;
      //$.get(barchartDataUrl, function(data, status)
      //{
      d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_stddist_month.csv", convertNumbers, function(error, data) 
      {
        //console.log("fetching stats from " + graphDataUrl);
        console.log("fetched barchart stddist data (month)");
        //console.log(data);
        if(!barchartmonthstddistInit){
            draw_barchart_month(data,barchartmonthstddistInit, "StdDistance");
            barchartmonthstddistInit = true;
         }
         else{
             draw_barchart_month(data,barchartmonthstddistInit, "StdDistance");
         }
         $("#d3barmonthstddist").hide();
		 
		   	if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
      })/*.fail(function(){
          console.log("fetching barchart stddist data (month) failed");
		  //$('body').css('cursor','default');
      })*/;

      ////
      var barchartDataUrl = barchartDataUrlBaseYearStdDist + params;
      //$.get(barchartDataUrl, function(data, status)
      //{
      d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_stddist_year.csv", convertNumbers, function(error, data) 
      {
        //console.log("fetching stats from " + graphDataUrl);
        console.log("fetched barchart stddist data (year)");
        //console.log(data);
        if(!barchartyearstddistInit){
            draw_barchart_year(data,barchartyearstddistInit, "StdDistance");
            barchartyearstddistInit = true;
         }
         else{
             draw_barchart_year(data,barchartyearstddistInit, "StdDistance");
         }
         $("#d3baryearstddist").hide();
		   	
			if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
      })/*.fail(function(){
          console.log("fetching barchart stddist data (year) failed");
		  //$('body').css('cursor','default');
      })*/;

      ///***********************/

        // get data for barchart
        var barchartDataUrl = barchartDataUrlBaseDayObs + params;
        //$.get(barchartDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_obs_day.csv", convertNumbers, function(error, data) 
        {  
          //console.log("fetching stats from " + graphDataUrl);
		      console.log("fetched barchart obs data (day)");
          if(!barchartdayobsInit){
              draw_barchart_day(data,barchartdayobsInit, "Submission");
              barchartdayobsInit = true;
           }
           else{
               draw_barchart_day(data,barchartdayobsInit, "Submission");
           }
		   	
			if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
        })/*.fail(function(){
            console.log("fetching barchart obs data (day) failed");
			//$('body').css('cursor','default');
        })*/;

        var barchartDataUrl = barchartDataUrlBaseMonthObs + params;
        //$.get(barchartDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_obs_month.csv", convertNumbers, function(error, data) 
        {  
          //console.log("fetching stats from " + graphDataUrl);
		      console.log("fetched barchart obs data (month)");
          if(!barchartmonthobsInit){
              draw_barchart_month(data,barchartmonthobsInit, "Submission");
              barchartmonthobsInit = true;
           }
           else{
               draw_barchart_month(data,barchartmonthobsInit, "Submission");
           }
           $("#d3barmonthobs").hide();
		   
		   	if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
			
        })/*.fail(function(){
            console.log("fetching barchart obs data (month) failed");
			    //$('body').css('cursor','default');
        })*/;

        var barchartDataUrl = barchartDataUrlBaseYearObs + params;
        //$.get(barchartDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_daterange_obs_year.csv", convertNumbers, function(error, data) 
        {
          //console.log("fetching stats from " + graphDataUrl);
		      console.log("fetched barchart obs data (year)");
          if(!barchartyearobsInit){
              draw_barchart_year(data,barchartyearobsInit, "Submission");
              barchartyearobsInit = true;
           }
           else{
               draw_barchart_year(data,barchartyearobsInit, "Submission");
           }
           $("#d3barmonthobs").hide();
        
			if(barchartyearobsInit && barchartmonthobsInit 
			    && barchartdayobsInit && barchartyearstddistInit
				&& barchartmonthstddistInit && barchartdaystddistInit
				&& barchartyearidsInit && barchartmonthidsInit && barchartdayidsInit){
					
				$("#ctrbar").prop("disabled", false);
				$('body').css('cursor','default');
			}
			
		
		})/*.fail(function(){
            console.log("fetching barchart obs data (year) failed");
			  //$('body').css('cursor','default');
        })*/;


    }


    if(true == updategeographyPieChart){
        
		piecountryInit = false;
		pielandcoverInit = false;
		
		// get data for barchart
        var piechartlandcoverDataUrl = piechartlandcoverDataUrlBase + params;
        //$.get(piechartlandcoverDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_landcover.csv", convertNumbers, function(error, data) 
        {
          //console.log(data);
          draw_piechart_landcover(data,pielandcoverInit);
          if(!pielandcoverInit){
              pielandcoverInit = true;
           }

           var landcover_checked = $("#landcover").prop("checked");
           if(true == landcover_checked){
               $("#d3pielandcover").show();
               $("#d3piecountry").hide();
               $("#d3pieadmin1").hide();
            }
		  
		  if(piecountryInit && pielandcoverInit){
			   $("#ctrpielandcover").prop("disabled", false);
			   $('body').css('cursor','default');
		  }
		  
        })/*.fail(function(){
            console.log("fetching piechart data landcover failed");
			  //$('body').css('cursor','default');
        })*/;

        var piechartcountryDataUrl = piechartcountryDataUrlBase + params;
        //$.get(piechartcountryDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_country.csv", convertNumbers, function(error, data) 
        {  
          //console.log(data);
          var data_i = [];
          var val_others = 0;
          var cnt_others = 0;
          for(var i in data){
            if(i < 10){
              if(!data[i].name){
                data[i].name = 'Unknown';
              }
              data_i.push(data[i]);
            }else{
              val_others += data[i].value;
              cnt_others += 1;
            }
          }
          if(cnt_others > 0){
            data_i.push({'name': 'Others (' + cnt_others + ')', 'value': val_others});
          }

          //console.log(data_i);

          draw_piechart_country(data_i,piecountryInit);
          if(!piecountryInit){
              piecountryInit = true;
           }

           var country_checked = $("#country").prop("checked");
           if(true == country_checked){
               $("#d3pielandcover").hide();
               $("#d3piecountry").show();
               $("#d3pieadmin1").hide();
            }
			
		  if(piecountryInit && pielandcoverInit){
			   $("#ctrpielandcover").prop("disabled", false);
			   $('body').css('cursor','default');
		  }
		  
        })/*.fail(function(){
            console.log("fetching piechart data country failed");
			//$('body').css('cursor','default');
        })*/;
    }

    if(true == updateCloud){
		
		piekingdomInit = false;
		cloudcomnameInit = false;
		cloudscinameInit = false;
			 
      // get data for barchart_kingdom
      var piechartDataUrl = piechartDataUrlBase + params;
      //$.get(piechartDataUrl, function(data, status)
      //{
      d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_kingdoms.csv", convertNumbers, function(error, data) 
      {   
        //console.log(data);
        //data_piechartkingdom = jQuery.extend(true, [], data);

        draw_piechart_kingdom(data,piekingdomInit);
        if(!piekingdomInit){piekingdomInit = true;}

        var kingdom_checked = $("#kingdom").prop("checked");
        if(true == kingdom_checked){
            $("#d3piekingdom").show();
            $("#d3cloudcomname").hide();
            $("#d3cloudsciname").hide();
         }
		  
		  if(piekingdomInit && cloudcomnameInit
		     && cloudscinameInit){
			   $("#ctrcloud").prop("disabled", false);
			   $('body').css('cursor','default');
		  }
		  
      })/*.fail(function(){
          console.log("fetching piechart kingdom data failed");
		  //$('body').css('cursor','default');
      })*/;


        // get data for cloud
        var cloudDataUrl = cloudDataUrlBase + params;
        //$.get(cloudDataUrl, function(data, status)
        //{
        d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_species.csv", convertNumbers, function(error, data) 
        {  
          //data_wordcloud = jQuery.extend(true, [], data);
          //console.log("IN MAIN.JS");
          //console.log(data);

          draw_cloud_species(data, cloudcomnameInit, true);
          if(!cloudcomnameInit){cloudcomnameInit = true;}

          var com_sci = $("#comname").prop("checked");
          if(true == com_sci){
              $("#d3piekingdom").hide();
              $("#d3cloudcomname").show();
              $("#d3cloudsciname").hide();
           }

           draw_cloud_species(data, cloudscinameInit, false);
           if(!cloudscinameInit){cloudscinameInit = true;}
           var com_sci = $("#sciname").prop("checked");
           if(true == com_sci){
               $("#d3piekingdom").hide();
               $("#d3cloudcomname").hide();
               $("#d3cloudsciname").show();
            }
		  
		  if(piekingdomInit && cloudcomnameInit
		     && cloudscinameInit){
			   $("#ctrcloud").prop("disabled", false);
			   $('body').css('cursor','default');
		  }
		  
        })/*.fail(function(){
            data_wordcloud = null;
            console.log("fetching cloud species data failed");
			//$('body').css('cursor','default');
        })*/;
    }

    if(true == resetMapView){
        params = params+'&minlon=-180';
        params = params+'&minlat=-90';
        params = params+'&maxlon=180';
        params = params+'&maxlat=90';

    }else{
        // feature layer (and heatmap)
        var bbox = myMap.getBounds()
        var minlon = bbox._southWest['lng'];
        params = params+'&minlon='+minlon;
        var minlat = bbox._southWest['lat'];
        params = params+'&minlat='+minlat;
        var maxlon = bbox._northEast['lng'];
        //console.log(maxlon);
        params = params+'&maxlon='+maxlon;
        var maxlat = bbox._northEast['lat'];
        params = params+'&maxlat='+maxlat;
    }


    var featureUrl = featureUrlBase + params

    //$.get(featureUrl, function(data, status)
    //{
    d3.csv("data/" + year_str + "/u" + userid_str + "/user_query_bbox.csv", convertNumbers, function(error, data) 
    {
    
			n_features = data.length;
			$("#fcount").html(n_features);

      var snames = new Set();
      for(var i in data){
        if(data[i].common_name != null){
          snames.add(data[i].common_name)
        }
      }
      n_species = snames.size;
      $("#scount").html(n_species);

      //if(n_features < 5000){

				var jsonFeatures = [];
				data.forEach(function(p){
					var lat = p['lat'];
					var lon = p['lon'];

					var feature = {type: 'Feature',
						properties: p,
						geometry: {
							type: 'Point',
							coordinates: [lon,lat]
						}
					};

					jsonFeatures.push(feature);
				});

				geoJson = { type: 'FeatureCollection', features: jsonFeatures };
				featureLayer.clearLayers();
				featureLayer.addData(geoJson);
		/*
        if(!myMap.hasLayer(featureLayer)){
          myMap.addLayer(featureLayer);
        }
		*/



        /*
        if(!myMap.hasLayer(heatLayer)){
          heatLayer = L.heatLayer([], heatLayerOptions)
          data.forEach(function(p){
  					var lat = p['lat'];
  					var lon = p['lon'];
            heatLayer.addLatLng(L.latLng(p['lat'], p['lon']));
  				});
          heatLayer.addTo(myMap);
          myMap.removeLayer(heatLayer);
          //heatLayer.redraw();
          //myMap.addLayer(heatLayer);
        }*/

        if(myMap.hasLayer(heatLayer)){
          heatLayer.setLatLngs(data.map(p => [p['lat'], p['lon']]));
        }
        else{
          while(heatLayer._latlngs.length > 0){
            heatLayer._latlngs.pop();
          }
          data.forEach(function(p){
            var lat = p['lat'];
            var lon = p['lon'];
            heatLayer._latlngs.push(L.latLng(p['lat'], p['lon']));
            //heatLayer.addLatLng(L.latLng(p['lat'], p['lon']));
          });
        }

        if(true == resetMapView && data.length > 0){
          //console.log(geoJson);
          //var centroid_xy = turf.centroid(geoJson).geometry.coordinates;
          //myMap.setView([centroid_xy[1], centroid_xy[0]], zoomLevel);

          myMap.fitBounds(featureLayer.getBounds());
        }
        ///*
				if(!myMap.hasLayer(featureLayer)){
					myMap.addLayer(featureLayer);
				}

				if(myMap.hasLayer(heatLayer)){
					myMap.removeLayer(heatLayer);
				}

				if(myMap.hasLayer(heatLayer)){
					heatLayer.setLatLngs(data.map(p => [p['lat'], p['lon']]));
				}
        /*
				if(myMap.hasLayer(vtLayer)){
					myMap.removeLayer(vtLayer);
				}*/

        //*/

			//}

			/*
			if (myMap.getZoom() < zoomLevelThreshold){
				myMap.removeLayer(featureLayer);
				if(myMap.hasLayer(heatLayer)){
					myMap.addLayer(heatLayer);
				}
			}
			else {
				if(myMap.hasLayer(featureLayer)){
					myMap.addLayer(featureLayer);
				}
				myMap.removeLayer(heatLayer);

			}*/



      /*
			else{
				if(myMap.hasLayer(heatLayer)){
					myMap.removeLayer(heatLayer);
				}
				if(myMap.hasLayer(featureLayer)){
					myMap.removeLayer(featureLayer);
				}

				//vectorLayer.setUrl(vectorServer + vectorLayerId + "/{z}/{x}/{y}.pbf?userid=" + userid);
				if(!myMap.hasLayer(vtLayer)){
					myMap.addLayer(vtLayer);
				}
			}
      */

		})/*.fail(function(){
			$("#fcount").html(0);
			$("#scount").html(0);
			myMap.removeLayer(heatLayer);
			myMap.removeLayer(featureLayer);
			myMap.removeLayer(vtLayer);
		})*/;


      };
	/*
    $( "#userid" ).autocomplete({
      source: function(request, response){get_userids(request, response)},
      select: function(event, ui){
        $( "#userid" )[0].value = ui.item.value;
        update(true,true, true, true, true, tmpMode);
      }
    });*/
	

    //update(true, true, true, true, true, tmpMode, true);
	update(false, false, false, false, false, tmpMode, true);

	/* moved into update_map_graph()
	var baseMap = {
    "Google Terrain": basemap_gterrain,
    "Google Streets": basemap_gstreet,
    "Google Satellite": basemap_gsat,
    "Google Hybrid": basemap_ghybrid,
    "BaseMap Carto": basemap_carto,
    "BaseMap OSM": basemap_osm
	};
	var overlayMaps = {
		"Features": featureLayer,
		"HeatMap": heatLayer,
		"VectorTiles": vtLayer
	};
	var ctrl = L.control.layers(baseMap, overlayMaps).addTo(myMap);
	//ctrl.removeFrom(myMap);
	//ctrl.layers(baseMap).addTo(myMap);
	//ctrl.
	*/

	myMap.on('moveend', function() {
		//console.log("moveend");

		//update(false,false, false, false, false, tmpMode, false);

	});
