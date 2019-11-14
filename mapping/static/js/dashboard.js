$(function(){
  // A line graph on cancer counts per year
  // A line graph on cancer counts per subcounty
  // A line graph on specific cancer type per year
  // A line graph on specific cancer type per subcounty
  // A bagraph on
  // A piechart showing percentage contribution of subcounty on a given year
  // Color the graph according to incidences reported
  var cancer_type;
  let select = $('#filter_data');
  var years = [2015, 2016, 2017,2018,2019];
  var genders = ["Male","Female"];

  $.get('http://127.0.0.1:8000/summary/')
    .done(function(res){
      let json = JSON.parse(res);
      cancer_type = json['patient_cancer'];

      createSelectOption(cancer_type);
      createDataTable(json['table']);
      updateDataValue(json['patient_all']);
      data_nhif_compare(json['nhif']);
      dataCancerType(json['patient_cancer'],'line', years);
      populationPyramid(json['pop']);
      lineGender(json['gender']);
      // plot(json['patient_year']);

    }).fail(function (jqxhr,settings,ex){
      console.log(ex);
    });

function createSelectOption(data){
    //
    // for (let val of data.filter(el=> el.year == 2015).map(k=> k.cancer_typ)) {
    //   let option = $('<option></option>');
    //   option.text(val);
    //   select.append(option);
    // }
    //
    // select.on('change', function(){
    //   let values = $(this).val().toString();
    //   let categories = data.filter(k=> k.cancer_typ ==values ).map(el => el.year);
    //
    //   dataCancerType(data,$(this).val().toString(),categories);
    // });


}

function createDataTable(data){
    let table = document.querySelector('tbody');
    let ctyp = data.map(k=> k.cancer_typ).reduce((prev,next) => {
      if (prev.indexOf(next) === -1){
        prev.push(next);
      } return prev;
    },[]);

    console.log(ctyp);
    let datum = [];

    let nhif_true = data.filter( k => data.indexOf(k) % 2 == 0).map(k=> k.Cancer_type);
    let nhif_false = data.filter( k =>data.indexOf(k)% 2 != 0).map(k=> k.Cancer_type);


    for (var i = 0; i < ctyp.length; i++) {
      datum.push(nhif_true[i]+ nhif_true[i]);
      let values = "<tr><td>"+ ctyp[i]+"</td><td>"+nhif_true[i]+"</td><td>"+nhif_false[i]+"</td></tr>";

      table.innerHTML += values;

    }

    plot_data([{name:'Cancer',data:datum,color:'#d73027'}],'bar','bhorizontal',ctyp,"Total Cancer Incidences Reported");
}

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
   // plot_nhif(processed_data);
}

function clean_data(data){
  console.log({name:'Count',data:data.map(val=> val.Cancer_type)});
}


function dataCancerType(patient_data, type, categories){

  var cancers = patient_data.filter(el => el.year == 2015 ).map(el => el.cancer_typ);

  var data = [];
  for (let ctypes of cancers) {
    data.push({
      name:ctypes,
      data:patient_data.filter(el => el.cancer_typ == ctypes ).map(el => el.Cancer_type)
    });
  }

  let data_all = [];
  for (let year of years) {
    data_all.push(patient_data.filter(el => el.year == year ).map(el => el.Cancer_type).reduce((a,b)=>a+b));
  }

  // console.log(data_all);
  plot_data(data, type,'nhif_graph',years, "Yearly Comparison of Various Cancer");
  plot_data([{name:'Total Count', data:data_all, color:'#d73027'}], type, 'smap',years, "Trend in Incidences Reported");
}

function populationPyramid(data){
  let category = [];
  let data_plot =[];

  let colors = ['#d73027','#f46d43']
  for(let gender of genders){
    let data_obj = {
      name:gender,
      data:[],
      color:colors[genders.indexOf(gender)]
    };

      let data_filters = data.filter(k=> k.gender == gender);
      console.log(data_filters.filter(k => k.age >= 10 && k.age < 20));

      for (var i = 10; i < 90; i+=10) {
        category.push(`${i}-${i+10}`);
        if (gender == "Male"){

          data_obj['data'].push(-(data_filters.filter(k => k.age >= i && k.age < i+10 ).length)*100/171);
        }else{
          // console.log(data_filters.filter(k => k.age >= i && k.age <= i+10));
          data_obj['data'].push( (data_filters.filter(k => k.age >= i && k.age < i+10 ).length)*100/171);
        }

      }
      data_plot.push(data_obj);

  }
  console.log(data_plot[1].data.reduce((a,b)=>a+b), data_plot[0].data.reduce((a,b)=>a+b));
  plot_data(data_plot, "bar","line2",category.slice(0,8), "Population pyramid for Cancer cases");
}

function lineGender(data){

  let data_plot = [];

  // Repeated not DRY: creata function for creating the data array
  for(let gender of genders){
      data_plot.push({
        name:gender,
        data:data.filter(k=> k.gender == gender).map(k=> k.genderC)
      });
  }

  plot_data(data_plot, 'line','line1',years, "Gender wise distribution of Cancer cases");

}

function plot_data(data, type, id, category, title){
  // Column plots
  areacolors = (function(){
      let colors= ['#d73027','#f46d43'];
      return colors
  }());

  let xAxis;
  let series;

  if (type != "line") {
    // Check plot type
    xAxis = [{
        categories: category,
        reversed: false,
        labels: {
            step: 1
        }
    }, { // mirror axis on right side
        opposite: true,
        reversed: false,
        categories: category,
        linkedTo: 0,
        labels: {
            step: 1
        }
    }];
    series = {
          label: {
              connectorAllowed: false,
          },
          stacking: 'normal',
          // color:['#d73027','#f46d43'],
      }
  }else{
    xAxis = [{
      crosshair:true,
    }
  ];

    series = {
          label: {
              connectorAllowed: false,
          },
          pointStart: 2015
      }
  }


    // Column plots
    Highcharts.chart(id, {
        chart: {
            backgroundColor:'#ffffff',
            type: type
        },
        title: {
            text: `${title} `
        },
        xAxis:xAxis,
        yAxis: {
            // min: 0,
            title: {
                text: null
            },labels: {
                formatter: function () {
                    return Math.abs(this.value) + '';
                }
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
         series: series
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
}

});
