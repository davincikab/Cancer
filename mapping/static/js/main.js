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

// ============================== Heatmap =========================================
    var pots = [];

    var town = L.geoJson(patient,{
          pointToLayer:function(feature,latlng){
          pots.push(latlng);
        return L.marker(latlng,{});
      }});

     var theat = L.heatLayer(pots,{
             radius:25,
             blur:15,
             gradient:{0.4: 'red', 0.65: 'red', 1: 'red'}
           }).addTo(map);

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

      let overlays = {'Patients':markercluster,'Heatmap':theat};
      let baselayer = {'Consituency':const_data};

      L.control.layers(baselayer,overlays).addTo(map);


      // function route(target){
            var router = L.Routing.control({
              waypoints:[
                   L.latLng(-0.425414, 36.935971),
                   L.latLng(-0.458732,37.123175)
              ],
                routeWhileDragging:true,
                geocoder: L.Control.Geocoder.nominatim(),
                showAlternatives:true,
                altLineOptions:true,
                router: L.Routing.mapbox('pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA')
             });

             map.addControl(router);

             L.Routing.errorControl(router).addTo(map);
      // }

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
