//============================= DJANGO LEAFLET MAP INIT FUNCTION ======================================
function map_init(map, options){
      // loading various layers
    let soil = L.tileLayer.wms('http://localhost:8090/geoserver/amboseli_region/wms?',
                  {
                    layers:'amboseli_region:soil'
                  });
    let url = 'http://localhost:8090/geoserver/amboseli_region/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=amboseli_region:extent_soil&outputformat=json';


    function patientOnEachFeature(feature,layer){
      let popupcontent = '<h6 class="title">' + feature.properties.const_nam + ' Constituency</h6><hr>' +
                  '<div class="row ">'+
                  '<div class="col-md-6"><p>Cancer Type </p><p>Cancer Stage</p>'+
                  '<p>NHIF</p><p>Gender</p><p>Age</p></div>'+
                  '<div class="col-md-6"><p>' +feature.properties.cancer_typ +
                  '</p><p>' + feature.properties.cancer_sta +
                  '</p><p>' + feature.properties.nhif+
                  '</p><p>' + feature.properties.gender+
                  '</p><p>' + feature.properties.age +'</p></div>' +
                  '<p><button class="btn btn-sm btn-success route" data="'+
                  feature.geometry.coordinates+'">Route</button></p>'
                  '</div>';
      layer.bindPopup(popupcontent);
    }

    let markercluster = L.markerClusterGroup().addTo(map);

//  ================== layer patients data =========================================
    let patients = L.geoJSON(null,{
      onEachFeature:patientOnEachFeature,
      pointToLayer:function(geojsonp,latLng){
        return L.marker(latLng, {icon: L.AwesomeMarkers.icon({
            icon: '',
            markerColor:style_markers(geojsonp.properties.cancer_typ),
            prefix:'fa'
          })
        });

    }
  });

  $.getJSON('http://127.0.0.1:8000/patient/')
    .done(function(res){
      // console.log(res);
      let timestamps = processPatientData(res);
      loadPatientData(timestamps['year'], res);
      createSlider(timestamps['year']);
    }).
    fail(function (jqxhr,settings,ex){

    });


      $('#spatial_search').on('submit',spatialFilter);
      function spatialFilter(e){
        e.preventDefault();
        patients.clearLayers();
        markercluster.clearLayers();

        $.ajax({
          url:'http://127.0.0.1:8000/spatial/',
          data:$(this).serialize(),
          type:'get',
          dataType:'json',
          success:function(res){
            // console.log(res);
            patients.addData(res);
            markercluster.addLayer(patients);
          },
          error:function(xhr,errmsg,err){
            console.log(err);
          }
        });
      }

  $('#filter-data').on('submit',filterData);
  function filterData(e){
    patients.clearLayers();
    markercluster.clearLayers();
    e.preventDefault();

    $.ajax({
      url:'http://127.0.0.1:8000/patient/',
      data:$(this).serialize(),
      type:'get',
      dataType:'json',
      success:function(res){
        // console.log(res);
        patients.addData(res);
        markercluster.addLayer(patients);
      },
      error:function(xhr,errmsg,err){
        console.log(err);
      }
    });
  }

    function processPatientData(data){
      let timestep = data.features.map(k => k.properties.year);
      let time = [];

      for (let tm of timestep) {
        if(time.indexOf(tm) == -1){
          time.push(tm);
        }
      }

      return {'year':timestep}
    }

    function loadPatientData(timestep,data){
      let cancer = [];
      for(let k of data.features){
        if(cancer.indexOf(k.properties.cancer_typ) == -1) {
          cancer.push(k.properties.cancer_typ)
        }
      }

      // console.log(cancer);
      createLegendData(cancer);
      patients.addData(data);
      markercluster.addLayer(patients);
    }


    let ctypes = {
      "others":'lavender',
      "breast":'pink',
      "stomach":'darkblue',
      "oesophagus":'darkred',
      "cervix":'teal',
      "lung":'perl',
      "prostate":'lightblue',
      "pancreas":'purple',
      "rectum":'orange',
      "ovary":'teal',
    };

    function style_markers(cancer_type){
      var color = ctypes[cancer_type];
      if (color == undefined) {
        color = 'blue';
      }
      // console.log(color);
      return color;
    }

    function createSlider(years){

    }

// ===================================== Consituency Layer =======================================================
    function createLegendData(data){
      let legenddiv = document.getElementById('stat');
      legenddiv.innerHTML += '<h3>Legend</h3>';

        for(let i=0; i< data.length; i++){
          legenddiv.innerHTML+="<p><i class='fa fa-map-marker fa-2x' style='color:"+ ctypes[data[i]]+"'>"+
          "</i>"+data[i]+"</p>"

        }

    }

  // style the map according to the cases reported
  function onEachFeature(feature, layer){
    layer.bindPopup(feature.properties.const_nam);
  }

  function myStyle(feature){
      return {
          "color":'#000000',
          "weight":0.3,
          "fillOpacity": 0.3,
          // "fillColor": getColor(feature.properties.lukemia)
      };
  }

  var const_data = L.geoJSON(null, {onEachFeature:onEachFeature,style:myStyle}).addTo(map);

  $.getJSON('http://127.0.0.1:8000/constituency/')
      .done(function (data) {
         let timestamps = processData(data);
         loadData(timestamps, data);
      }).fail(function(){
        console.log('Error while loading data');
    });

      function loadData(time, data){
        const_data.addData(data);
        // updateStyle(time['year'][0]);

      }

      var layer_dem = L.tileLayer.wms('http://localhost:8090/geoserver/Cancer/wms?',{
        layers: 'Cancer:geotiff_coverage',
        transparent: true,
        opacity:0.9
      });

      var theat = L.tileLayer.wms('http://localhost:8090/geoserver/Cancer/wms?',{
        layers: 'Cancer:heatLayer',
        transparent: true,
        opacity:0.7

      });


      let overlays = {'Patients':markercluster,'Heatmap':theat};
      let baselayer = {"DEM":layer_dem,'Consituency':const_data};

      L.control.layers(baselayer,overlays).addTo(map);
      var hospice = L.marker([-0.425414, 36.935971],{
        icon: L.icon({
            iconUrl:'/static/images/hospital-symbol.png',
            iconSize: [38, 43],
            iconAnchor: [22, 43],
            popupAnchor: [-3, -36],
          })
      }).bindPopup("Nyeri Hospice Hospital").addTo(map);

      // function route(target){
            var router = L.Routing.control({
              waypoints:[
                   L.latLng(-0.455414, 36.935971),
                   L.latLng(-0.458732,37.123175)
              ],
                routeWhileDragging:true,
                geocoder: L.Control.Geocoder.nominatim(),
                showAlternatives:true,
                altLineOptions:true,
                show:false,
                collapsible:true,
                createMarker: function(i, wp) {
          				var options = {
          						draggable: this.draggableWaypoints,

          					},
          				    marker = L.marker(wp.latLng, options);

          				return marker;
          			},
                router: L.Routing.mapbox('pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA')
             });

             map.addControl(router);
             // L.Routing.errorControl(router).addTo(map);
             // Implement reverse geocoding
             // Patient within drive timeout
             // Autocorrelation

             console.log(router);
      // }

      // ============================================= DRIVE TIME DATA =======================================
          var isochrone;
           isochrone = L.geoJson(null,{
             style:function(feature){
               return{
                 fillColor:groupStyle(feature.properties.value),
                 fillOpacity:0.7,
                 weight:0.0
               }
             },
             onEachFeature:function(feature,layer){
               // console.log(feature.properties);
               layer.bindPopup(feature.properties.area);
             },
             filter:function(feature){
               return true;
             }
           }).addTo(map);

           overlays['Isochrone'] = isochrone;
           function groupStyle(value){
             // determine the number of drive times and color them accordingly
             let colors = ['#F87774','#F7CB73','#C7E843','#74F370'];
             return value <= 300?'#74f370':value <= 600?'#C7E843':value <= 900?'#F7CB73':'#F87774';
           }

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(map);


            function driveTime(url,body_url){
              let request = new XMLHttpRequest();

              request.open('POST', url);

              request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
              request.setRequestHeader('Content-Type', 'application/json');
              request.setRequestHeader('Authorization', '5b3ce3597851110001cf6248de42a0f46acb4c3f82a7dc3dbd69fa61');

              request.onreadystatechange = function () {
                if (this.readyState === 4) {
                  console.log('Status:', this.status);
                  console.log('Headers:', this.getAllResponseHeaders());
                  // console.log('Body:', this.responseText);
                  editDriveTime(JSON.parse(this.responseText)); //catch the error and notify the user: Network connection
                }
              };

              const body = body_url;

              request.send(body);
            }


            function editDriveTime(data){
              isochrone.clearLayers();
              //  var difference=[];
              //  for (i=0;i<(data.features.length-1); i++){
              //       console.log(i);
              //       difference.push(turf.difference(data.features[i+1],data.features[i]));
              // }
              //
              // difference.push(data.features[0]);
              // data.features = difference.filter(layer => layer != null);
              data = data.features.reverse();
              isochrone.addData(data);
              map.fitBounds(isochrone.getBounds());
              findPatientWithin();
            }

            // driveTime();
            function geolocate(){
              let location;
              map.on('locationfound', function(e){
                L.circleMarker(e.latlng,{radius:10,fillColor:'blue',fillOpacity:0.4}).addTo(map);
                location = e.latlng;
              });

              map.on('locationerror', function(e){
                let alert = $('<div></div>').attr({
                  "class":'alert alert-danger',
                  "role":"alert",
                }).text("Could not determine your location");
                document.body.append(alert);
              });


              map.locate({setView:true});
              return location;
            }

            function updaterDriveTime(values){
              console.log(values);
                let url = `https://api.openrouteservice.org/v2/isochrones/${values[1].value}`;

                let user_location = geolocate();
                if(user_location == undefined){
                  user_location = [36.949853897094734,-0.41970831301551276];
                }else{
                  user_location = [user_location.lat,user_location.lng];
                }
                let location = `{"locations":[[${user_location}]],"range":[${values.filter(k=> k.name == "time").map(a=>a.value)*60}],"attributes":["area"],"intersections":"true","interval":300}`;

                driveTime(url,location);
                console.log(location);
            }

            function findPatientWithin(){
              // call driveTime(location,time, mode_trans);
              // find all: isochrone.contains(patient);
              let patient = patients.toGeoJSON();
              let bounds = isochrone.toGeoJSON().features;

              for (let bound of bounds){
                let patientwithin = turf.pointsWithinPolygon(patient, bound);
                bound.properties['count'] = patientwithin.features.length
             }

              // Isochrone results control
              document.getElementById('output').innerHTML = "";
              let result = $('<table>').attr({
                "class":'table table responsive table-bordered',
                "role":"table",
              });
              result.append("<tr><th>Range</th><th>Patient</th></tr>");
              // <th>Area</th>  <td>${feature.properties.area}</td>
              for(let feature of bounds){
                result.append(`<tr><td>${feature.properties.value/60} min</td> <td>${feature.properties.count}</td></tr>`);
              }

              $('#output').append(result);
              console.log(bounds.map(feature=> feature.properties.count));
            }

            var drive_time_control = L.control({position:'topleft'});
            drive_time_control.onAdd = function(map){
              let div = L.DomUtil.create("div",'reachability-control-settings-container route-container');
              $(div).append(
                $("<span></span>").attr({
                "class":"reachability-control-settings-button fa fa-bullseye fa-1x",
                "title":`Hide Reachability Option`,
                "role":"button",
                "aria-label":`Hide Reachability Option`,
                })
              );

              let form = L.DomUtil.create("form",'form-horizontal route-form');
              $(form).attr({
                "method":'get',
                "action":".",
                "role":"form"
              });

              let range_type = ['distance','time']; //mode
              let trans_option = ['driving-car',"cycling-road",'foot-walking']; //Tooltip
              let trans_icon = ['fa fa-car','fa fa-bicycle','fa fa-male'];
              let intervals = [5,10,15,20,25,30];


              let select_mode = L.DomUtil.create('select','reachability-control-range-list form-control mb-2');
              $(select_mode).attr({
                "name":"range_type"
              });

              $(form).append($('<span></span>').text("Mode: "));
              for (let rc in range_type) {
                $(select_mode).append(
                  $('<option></option>').attr({"value":`${range_type[rc]}`})
                  .text(range_type[rc])
                );
              }
              $(form).append(select_mode);


              let select_trans = L.DomUtil.create('select','reachability-control-range-list form-control mb-2');
              $(select_trans).attr({
                "name":"profile"
              });
              $(form).append($('<span></span>').text("Trans: "));

              for (let to in trans_option) {
                $(select_trans).append($('<option></option>').attr({"value":`${trans_option[to]}`}).text(trans_option[to]));
              }

              $(form).append(select_trans);

              let select_control = L.DomUtil.create('select','reachability-control-range-list');
              $(select_control).attr({
                "name":"time"
              });
              $(form).append(
                $("<span></span>").attr({
                  'class':'reachability-control-range-title'
                }).text("Time "));

              for (let interval of intervals) {
                $(select_control).append($('<option></option>').attr({"value":`${interval}`}).text(interval +" min"));
              }

              form.append(select_control);
              form.innerHTML += " <span><input type='checkbox' name='interval'>  interval</span>";
              form.innerHTML += "<input type='submit' name='submit' class='form-control btn-success' value='Generate Drive'>";

              $(div).append(form);
              $(div).on('mouseover', function(e){
                $(this).css({"height":"auto","width":"auto","padding":"6px"}).find(".reachability-control-settings-button").hide();
                $(form).css({"display":"block"});
                e.stopPropagation(e);
              });

              $(div).on('mouseout', function(e){
                $(this).css({"height":"35px","width":"35px","padding":"0px"}).find(".reachability-control-settings-button").show();
                $(form).css({"display":"none"});
                e.stopPropagation(e);
              });

              $(form).on('submit',function(e){ e.preventDefault();
              updaterDriveTime($(form).serializeArray());

              });
              return div;
            }

            drive_time_control.addTo(map);
}

function  processData(data){
  let data_prop = Object.keys(data.features[0].properties.breast);
  let type = Object.keys(data.features[0].properties).filter(key =>
    ["objectid", "const_nam", "const_no", "county_nam",  "total", "pk"].indexOf(key) == -1);

  return {'year':data_prop,'type':type};
}

// Color the graph according to incidences reported
function plot(carea_list){
    Highcharts.chart('pie', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Percentage Incidences'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                colors:carea_list.map(k=> k.y).map(k=> getColor(k)),
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                // showInLegend:true
            }
        },
        series: [{
            name: 'Incidences',
            colorByPoint: true,
            data:carea_list
        }]
    });

    // Column plots
    Highcharts.chart('bar', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Sub-county Incidences'
        },
        xAxis: {
            categories:carea_list.map(value => value.name),
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Incidences  Count'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                color:'#b30000'
            }
        },
        series: [{
            name: 'Incidences',
            data: carea_list
        }]
    });
}

// Simple Dashboards using HightCharts
// Explore d3.js
// TODO: ADD LABEL FOR CANCER TYPE AND YEAR
// CHANGE THE COLOR SCHEME
// EACH CANCER FOR VARIOUS YEAR
//  stopPropagation for slider control.
// blinking popups
// Animate map style rendering: make it smooth
// let ctypes = {
//   "others":'lavender',
//   "breast":'pink',
//   "stomach":'perwinkleblue',
//   "oesophagus":'burgundy',
//   "cervix":'teal',
//   "lung":'perl',
//   "prostate":'lightblue',
//   "pancreas":'purple',
//   "rectum":'amber',
//   "ovary":'teal',
// };
// "<div style='position:relative; display:block; width: 36px; height: 45px' class='awesome-marker-icon-"+ctypes[data[i]]+" awesome-marker'>"+
//                             "<i style='margin-left:-2px; color:white 'class= 'fa fa-tint fa-inverse'></i>"+
//                              "</div>"+
//                  "<p style='position: relative; top: -20px; display: inline-block; ' >"+data[i] +"</p>";



// Populatio pyramids
// Change hospital markers
// Cancer per year: filter.
// Choropleth map to generalise the subcounty
// Relate the data to the population
// A collapsible routing tab
// Clustering using turf
//
