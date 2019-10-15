$(function(){
  // A line graph on cancer counts per year
  // A line graph on cancer counts per subcounty
  // A line graph on specific cancer type per year
  // A line graph on specific cancer type per subcounty
  // A bagraph on
  // A piechart showing percentage contribution of subcounty on a given year
  // Color the graph according to incidences reported

 console.log("Pie Chart");
  $.get('http://127.0.0.1:8000/summary/')
    .done(function(res){
      let json = JSON.parse(res);
      updateDataValue(json['patient_all']);
      data_nhif_compare(json['nhif']);

      plot(json['patient_year']);
      let data = clean_data(json['patient_year']);

    }).

    fail(function (jqxhr,settings,ex){
      console.log(ex);
    });

function updateDataValue(data){
   let data_v = $('#summary_data').find('h1');

   let values = [data.map(a => a.Cancer_type).reduce((a,b) => a+b ),data[0].Cancer_type,data[1].Cancer_type, 200];


   for (var i in values) {
    $(data_v[i]).text(values[i]);
   }
}

function data_nhif_compare(data){

  console.log(data.filter(k => k.nhif == "true"));
  let processed_data = [
    {name:'True', data:data.filter(k => k.nhif == "false").map(k => k.Nhif)},
    {name:'False', data:data.filter(k => k.nhif == "true").map(k=>k.Nhif)}
  ];
  console.log(processed_data);
   plot_nhif(processed_data);
}

function clean_data(data){
  console.log({name:'Count',data:data.map(val=> val.Cancer_type)});
}

function plot_nhif(data){
  // Column plots
  Highcharts.chart('nhif_graph', {
      chart: {
          backgroundColor: '#ffffff',
          type: 'column',

      },
      title: {
          text: 'Patient with NHIF vs Patients without NHIF card'
      },
      xAxis: {
          categories:[2015,2016,2017,2018,2019],
          crosshair: true
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Lung Cancer'
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
              borderWidth: 0
          }
      },
      series:data
  });
}

  function plot(carea_list){
          Highcharts.chart('bhorizontal', {
          chart: {
              backgroundColor: '#ffffff',
              type: 'bar'
          },
          title: {
              text: 'Count of Cancer types'
          },
          xAxis: {
              categories: carea_list.map(value => value.year).sort(),
          },
          yAxis: {
              min: 0,
              title: {
                  text: 'Count of Cancer types'
              }
          },
          legend: {
              reversed: true
          },
          plotOptions: {
              series: {
                  stacking: 'normal'
              }
          },
          series: [{
              name: 'lung',
              data: [20, 33, 24, 17, 22]
          }]
      });

        // Column plots
      Highcharts.chart('area_g', {
          chart: {
              backgroundColor:'#ffffff',
              type: 'column'
          },
          title: {
              text: 'Icidences Reported, 2015-2019'
          },
          xAxis: {
              categories:carea_list.map(value => value.year).sort(),
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
                  color:'#D346B1'
              }
          },
          series: [{
              name: 'Incidences',
              data: carea_list.map(value => value.Cancer_type)
          }]
      });

      Highcharts.chart('smap', {
         chart: {
              backgroundColor:'#ffffff',
              type: 'line'
          },
          title: {
              text: 'Icidences Reported, 2015-2019'
          },

          yAxis: {
              title: {
                  text: 'Number of Incidences'
              }
          },
          legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle'
          },

          plotOptions: {
              series: {
                  label: {
                      connectorAllowed: false
                  },
                  pointStart: 2015
              }
          },

          series: [{name:'Count',data:carea_list.map(val=> val.Cancer_type)}],

          responsive: {
              rules: [{
                  condition: {
                      maxWidth: 500
                  },
                  chartOptions: {
                      legend: {
                          layout: 'horizontal',
                          align: 'center',
                          verticalAlign: 'bottom'
                      }
                  }
              }]
          }

      });
  }

});
