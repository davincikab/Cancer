//============================= HIGHLIGHT FEATURE =============================================
function highlightFeature(e){
 let layer = e.target;
 console.log(e);
 layer.openPopup();
 layer.setStyle({ color: '#FFFF00', fillOpacity:0.6});

}

//============================= COLOR BREWER FILL COLORS ======================================
function getColor(code){
 let color = ['#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850'];
 return code < 1 ? '#ffffbf' : code < 2.0 ? '#fee08b' : code < 3 ? '#fdae61' : code < 4 ? '#f46d43' : '#d73027';
 // return code < 25 ? '#d73027' : code < 30 ? '#f46d43' : code < 35 ? '#fdae61' : code < 40 ? '#fee08b' : '#ffffbf';
}

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
                 '</div>';
     layer.bindPopup(popupcontent);
   }

   let markercluster = L.markerClusterGroup().addTo(map);

//  ================== layer patients data =========================================
   let patients = L.geoJSON(null,{
     onEachFeature:patientOnEachFeature,
     pointToLayer:function(geojsonp,latLng){
       return L.marker(latLng, {icon: L.AwesomeMarkers.icon({
           icon: 'tint',
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

   // let ctypes = {
   //   "others":'#e6e6fa',
   //   "breast":'pink',
   //   "stomach":'#ccccff',
   //   "oesophagus":'#800020',
   //   "cervix":'#000000',
   //   "lung":'#eae0c8',
   //   "prostate":'#0000ff',
   //   "pancreas":'purple',
   //   "rectum":'#ffbf00',
   //   "ovary":'#008080'
   // };
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

// ============================== Heatmap =========================================
   var pots = [];

   var town = L.geoJson(patient,{
         pointToLayer:function(feature,latlng){
         pots.push(latlng);
       return L.marker(latlng,{});
     }});


          var theat = new L.heatLayer(pots,{
                  radius:15,
                  max:1,
                  minOpacity: 1,
                  gradient: {0: '#fff5f0', 0.13: '#fee0d2', 0.26: '#fcbba1', 0.39: '#fc9272', 0.52: '#fb6a4a', 0.65: '#ef3b2c', 0.78: '#cb181d', 0.9: '#a50f15', 1: '#67000d'}
                  // gradient: {0: '#fff5f0', 0.13: '#fee0d2', 0.26: '#fcbba1', 0.39: '#fc9272', 0.52: '#fb6a4a', 0.65: '#ef3b2c', 0.78: '#cb181d', 0.9: '#a50f15', 1: '#67000d'}
                });
// gradient:{0.1:"#ff333", 0.2:#ff1a1a, 0.3:#ff0000, 0.6: #e60000, 1:#cc0000}
// ===================================== Consituency Layer =======================================================
   function resetHighlight(e){
     let layer = e.target;
     layer.closePopup();
     const_data.setStyle({fillOpacity:0.4,color:'#000000',weight:0.3});

   }

   function zoomToFeature(e){
     let layer = e.target;
     description(layer);
     map.fitBounds(layer.getBounds());

   }


   function onEachFeature(feature, layer){
     let popupcontent = '<h6 class="title">' + feature.properties.const_nam + ' Constituency</h6><hr>' +
                 '<div class="row ">'+
                 '<div class="col-md-6"><p>Leukemia</p><p>Lung</p>'+
                 '<p>Cervical Cancer</p><p>Throat Cancer</p><p>Breast</p></div>'+
                 '<div class="col-md-6"><p>' +JSON.stringify(feature.properties.lukemia) +
                 '</p><p>' + JSON.stringify(feature.properties.lung) +
                 '</p><p>' + JSON.stringify(feature.properties.cervical)+
                 '</p><p>' + JSON.stringify(feature.properties.throat)+
                 '</p><p>' +  JSON.stringify(feature.properties.breast) +'</p></div>' +
                 '</div>';
     layer.bindPopup(popupcontent);

     // Events on Soil Layer
     // layer.on({
     //   mouseover:highlightFeature,
     //   mouseout:resetHighlight,
     // });

   }

   function myStyle(feature){
       return {
           "color":'#000000',
           "weight":0.2,
           "fillOpacity": 0.2,
           "fillColor": getColor(feature.properties.lukemia)
       };
   }

   function createLegendData(data){
     var legend =  L.control({position:'bottomleft'});

    legend.onAdd =function(map) {
      var div = L.DomUtil.create('div','legend');

       div.innerHTML += '<p>Cancer Type</p>';
       for(let i=0; i< data.length; i++){
         div.innerHTML+=  "<div style='position:relative; display:block; width: 36px; height: 45px' class='awesome-marker-icon-"+ctypes[data[i]]+" awesome-marker'>"+
                             "<i style='margin-left:-2px; color:white 'class= 'fa fa-tint fa-inverse'></i>"+
                              "</div>"+
                  "<p style='position: relative; top: -20px; display: inline-block; ' >"+data[i] +"</p>";

       }

       return div;
     }

     // legend.addTo(map);
   }

 var const_data = L.geoJSON(null, {onEachFeature:onEachFeature,style:myStyle}).addTo(map);

 $.getJSON('http://127.0.0.1:8000/constituency/')
     .done(function (data) {
        let timestamps = processData(data);
        loadData(timestamps, data);
        createLegend();
        // createSlider(timestamps['year']);
        createOption(timestamps['type'],data);
     }).fail(function(){
       console.log('Error while loading data');
     });

     function loadData(time, data){
       const_data.addData(data);
       updateStyle(time['year'][1]);
     }

     function updateStyle(time,type ='others'){
       // change the column
       let values = [];

       const_data.eachLayer( layer => {
         let data = layer.feature.properties.lung.filter( k=> Object.keys(k).indexOf(type) !=-1);
         console.log(layer.feature.properties.lung);
         let fill = getColor(data[0][type][time]);
         values.push({name:layer.feature.properties.const_nam,y:data[0][type][time]});
         layer.setStyle({fillColor:fill,fillOpacity:0.8,color:'#000000',weight:1});
       });

       plot(values);
     }

     function createSlider(timestamps){
       let slider_control = L.control({position:'bottomleft'});

       slider_control.onAdd = function(map){
         let slider = L.DomUtil.create('input','range-slider');

         L.DomEvent.addListener(slider,'mousedown', e =>{
           L.DomEvent.stopPropagation(e);
         });

         $(slider)
           .attr({
               'type':'range',
               'max':timestamps[timestamps.length-1],
               'min':timestamps[0],
               'step':1})
             .on('input change', function(){
               console.log($(this).val().toString());
             // updateFilter($(this).val().toString());
             updateStyle($(this).val().toString(),$('.c_type').val().toString());
             $('.temporal_legend').text($(this).val().toString());
         });

         return slider;
       }

       slider_control.addTo(map);
       createTemporaLegend(timestamps[0]);
     }

     function createTemporaLegend(timestamps){
       let temporal_legend = L.control({position:'bottomleft'});

        temporal_legend.onAdd = function(map){
          let output = L.DomUtil.create('output','temporal_legend');

          $(output).text(timestamps);
          return output;
        }

        temporal_legend.addTo(map);
     }

     function createLegend(){
       var legend =  L.control({position:'bottomright'});

      legend.onAdd =function(map) {
        var div = L.DomUtil.create('div','legend');

         div.innerHTML += '<p>Incidences</p>'
         let labels = [1,2,3,4,5];

         for(let i=0; i< labels.length; i++){
           div.innerHTML+='<i style="background:'
           +getColor(labels[i])+ '">&nbsp;&nbsp;</i>&nbsp;&nbsp; less than '
           +Number(labels[i]+1)+'<br>';
         }

         return div;
       }

       legend.addTo(map);
     }

     function createOption(types, data){
       let option = L.control({postion:'topleft'});

       option.onAdd = function(map){
         let select_type = L.DomUtil.create('select','c_type');

         L.DomEvent.addListener(select_type,'click', e =>{
           L.DomEvent.stopPropagation(e);
         });

         for (let type of types){
           let option = L.DomUtil.create('option');
           option.text = type;

           select_type.append(option);
         }

         $(select_type).on('change',function(){
           updateStyle($('.range-slider').val().toString(),$(this).val().toString());
           $('#c_name').text($(this).val().toString().toUpperCase() + ' Cancer');
         });

         return select_type;
       }

       option.addTo(map);
     }

 let overlays = {'Patients':markercluster,'Heatmap':theat};
 let baselayer = {'Consituency':const_data};

 L.control.layers(baselayer,overlays).addTo(map);

}

function  processData(data){
 let type= [];
 for (obj of data.features[0].properties.lung) {
   type.push(Object.keys(obj).reduce(k=> k));
 }

 // Object.keys(data.features[0].properties.breast); // Working with Sets
 // data.features[0].properties.lung[0]['others']['2015']
 let timestamps = Object.keys(data.features[0].properties.lung[0]['others']);
 return {'year':timestamps,'type':type};
}

// Color the graph according to incidences reported
function plot(carea_list){
   // areacolors = (function(){
   //     let colors= []
   //     for (const area of carea_list) {
   //         let col = getColor(area.y);
   //         colors.push(col);
   //     }
   //
   //     console.log(carea_list.map(k=> k.y).map(k=> getColor(k)));
   //     return colors;
   // }());

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
