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
  return code < 25 ? '#ffffbf' : code < 30 ? '#fee08b' : code < 35 ? '#fdae61' : code < 40 ? '#f46d43' : '#d73027';
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
      layer.on({
        mouseover:highlightFeature,
        mouseout:resetHighlight,
      });

    }

    function myStyle(feature){
        return {
            "color":'#000000',
            "weight":0.3,
            "fillOpacity": 0.4,
            // "fillColor": getColor(feature.properties.lukemia)
        };
    }

  var const_data = L.geoJSON(null, {onEachFeature:onEachFeature,style:myStyle}).addTo(map);

  $.getJSON('http://127.0.0.1:8000/constituency/')
      .done(function (data) {
         let timestamps = processData(data);
         loadData(timestamps, data);
         createLegend();
         createSlider(timestamps['year']);
         createOption(timestamps['type'],data);
      }).fail(function(){
        console.log('Error while loading data');
      });

      function loadData(time, data){
        const_data.addData(data);
        updateStyle(time['year'][0]);

      }

      function updateStyle(time,type ='lukemia'){
        // change the column
        console.log(type + ' '+  time);
        let values = [];

        const_data.eachLayer( layer => {
          let fill = getColor(layer.feature.properties[type][time]);
          values.push({name:layer.feature.properties.const_nam,y:layer.feature.properties[type][time]});
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
          let labels = [24,29,34,39,44];

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

  L.control.layers({'Consituency':const_data}).addTo(map);

}

function  processData(data){
  let data_prop = Object.keys(data.features[0].properties.breast);
  let type = Object.keys(data.features[0].properties).filter(key =>
    ["objectid", "const_nam", "const_no", "county_nam",  "total", "pk"].indexOf(key) == -1);

  return {'year':data_prop,'type':type};
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
