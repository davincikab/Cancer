// CREATE ADMIN DASHBOARDS
$(function (){
  $.getJSON('http://127.0.0.1:8000/constituency/')
      .done(function (data) {
         let p_data = processData(data);
         filterSubcounty(p_data);
      }).fail(function(){
        console.log('Error while loading data');
      });

      function  processData(data){
        let data_prop = Object.keys(data.features[0].properties.breast);
        let type = Object.keys(data.features[0].properties).filter(key =>
          ["objectid", "const_nam", "const_no", "county_nam",  "total", "pk"].indexOf(key) == -1);

        let properties = [];
        let names = [];
        data.features.forEach(k =>
          properties.push({properties:k.properties})
        );
        data.features.forEach(k =>
          names.push(k.properties.const_nam)
        );

        return {year:data_prop,properties:properties,names:names,type:type};
      }

      function filterSubcounty(p_data){
        // p_data.properties.map(k => Object.values(k[0].properties.lung)
        let data = [];
        let c_data = p_data.properties.filter(k => k.properties.const_nam == "Kieni")[0];

        for (let type of p_data.type) {
          data.push({name:type, data:Object.values(c_data.properties[type])});
        }
        // Create a array for: cancer types for each subcounty
        console.log(data);

        let dataa = data.filter(k =>k.name == 'lung');
        // Pass an object with the data
        plot_general(data);
      }

      //============================= COLOR BREWER FILL COLORS ======================================
      function getColor(code){
        let color = ['#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850'];
        return code < 25 ? '#ffffbf' : code < 30 ? '#fee08b' : code < 35 ? '#fdae61' : code < 40 ? '#f46d43' : '#d73027';
        // return code < 25 ? '#d73027' : code < 30 ? '#f46d43' : code < 35 ? '#fdae61' : code < 40 ? '#fee08b' : '#ffffbf';
      }


// Plot bargraph and linegraph
      function plot_general(data){
          Highcharts.chart('line1', {
             chart: {
                  type: 'line'
              },
              title: {
                  text: 'Lung Cancer, 2010-2016'
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
                      pointStart: 2010
                  }
              },

              series: data,

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

          // Column plots
          Highcharts.chart('line2', {
              chart: {
                  type: 'column'
              },
              title: {
                  text: 'Lung Cancer, 2010-2016'
              },
              xAxis: {
                  categories:[2010,2011,2012,2013,2014,2015,2016,2017],
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
              series: data
          });

            // CUMULATIVE BARCHARTS
          Highcharts.chart('area_g', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Stacked bar chart'
            },
            xAxis: {
                categories: [2010,2011,2012,2013,2014,2015,2016,2017]
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Total fruit consumption'
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
            series: data
        });

      }

// Plot cumulative plots
      function plot_cum(){

      }
      // COMPARISON FOR TWO YEARS PER SUBCOUNTY OR COMPARE 3 SUBCOUNTIES
      // EACH CANCER FOR VARIOUS YEAR
      // FIND SAMPLE STATISTICS: mean, median, stdev, min,max, skew, distribution
      // target and status (b4 and after health facility were introduced)
      // UPCOMING EVENTS
      // SEND EMAILS: to various users
      // THOSE: UNDER MEDICATION, NOT ON MEDICATION relate the data to roads, cost
      //New cases, death toll
});
