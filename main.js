async function GetData(period, interval, pointscount) {
  let url = `https://api.investing.com/api/financialdata/41063/historical/chart/?interval=${interval}&pointscount=${pointscount}&period=${period}`;
  let urlJson = `/data/${period}.json`;

  let urls = [url, urlJson];
  await Promise.all(
    urls.map((URL) => fetch(URL).then((resp) => resp.json()))
  ).then((results) => {
    Promise.all(
      results.map((result) => {
        return result.data;
      })
    ).then((data) => {
      DrawChart(data);
    });
  });
}

async function DrawChart(obj) {
  var format ="EEEE, dd MMMM yyyy hh:mm:ss";
  var locale = "vi-vn";

  anychart.format.outputLocale(locale);
  anychart.format.inputLocale(locale);
  anychart.format.outputDateTimeFormat(format);
  
  var offset = new Date().getTimezoneOffset();
  anychart.format.outputTimezone(offset);

  //anychart.theme("darkEarth");

  //data vnindex
  let dataTable = anychart.data.table();
  dataTable.addData(obj[0]);

  //data index
  let dataTableIndex = anychart.data.table();
  dataTableIndex.addData(obj[1]);

  // map loaded data vnidex
  let mappingVNINDEX = dataTable.mapAs({ value: 3 });
  // map loaded data index
  let mappingINDEX = dataTableIndex.mapAs({ value: 2 });

  // create stock chart
  chart = anychart.stock();
  chart.animation(true);

  chart.contextMenu().itemsProvider(function() {
    var items = {
      'menu-item-1': {
        'text': 'Save chart as image...',
        'subMenu':[
            {
            'text': '.png',
            'action':() => chart.saveAsPng() 
            },
            {
              'text': '.jpg',
              'action':() => chart.saveAsJpg()
            },
            {
              'text': '.svg',
              'action':() =>  chart.saveAsSvg()
            }
          ]
      },
      'menu-item-2':{
        'text':'Print chart',
        'action': () => chart.print()
      }
    }
  
    return items;
  });

  // chart.padding(0, 70, 10, 0);
  chart.background().fill({
    // keys: ["#A1958A", "#64B5F6", "#A1958A"],
    // angle: 130,
    // opacity: 1,
    color: "#FFFFFF ",
  });

  //chart.scroller().enabled(false);
  chart.tooltip(true);

  // create line vnindex
  var lineChart = chart.plot(0);
  

  //chart.scroller().column(mappingINDEX);
  chart.scroller().thumbs(true);
  //chart.scroller().fill('green 0.1');
  //chart.scroller().selectedFill('green 0.5');
  chart.scroller().allowRangeChange(true);

  // tăng giảm theo %
  // var firstPlotYScale = lineChart.yScale();
  // firstPlotYScale.comparisonMode("percent");
  // lineChart.yAxis().labels().format("{%value}%");

  //custom tooltip
  chart.tooltip().useHtml(true);
  chart.tooltip().titleFormat(function(e){
    let str = new Date(e.x).toLocaleString(locale);
    //str = str.replace("GMT+0700 (Indochina Time)", "GMT+1400");
    //let date = new Date(str).toISOString();
    //let newDate = new Date(date).toLocaleString(locale);
    return str.toString();
  });

  //custom line vnindex
  let seriesVNINDEX = chart.plot(0).spline(mappingVNINDEX);
  seriesVNINDEX.stroke({
    color: "#FDC345",
    opacity: 0.8,
    dash: "10 5",
    thickness: 2,
  });
  seriesVNINDEX
    .hovered()
    .stroke({ color: "#FDC345", opacity: 0.8, dash: "8 5", thickness: 2 });
  seriesVNINDEX.name("VN-Index");
  seriesVNINDEX.hovered().markers(true);
  seriesVNINDEX.hovered().markers().type("diamond");

  //custom line index
  let seriesINDEX = chart.plot(0).spline(mappingINDEX);
  seriesINDEX.stroke({
    color: "#0061C1",
    opacity: 0.8,
    lineJoin: "bevel",
    thickness: 2,
  });
  seriesINDEX
    .hovered()
    .stroke({ color: "#0061C1", opacity: 0.7, lineCap: "bevel", thickness: 2 });
  seriesINDEX.name("Index");
  seriesINDEX.hovered().markers(true);
  seriesINDEX.hovered().markers().type("circle");

  //custom xAxis, yAxis
  var xlabels = lineChart.xAxis().labels();
  xlabels.fontFamily("Courier");
  xlabels.fontSize(12);
  xlabels.offsetX(-50);
  xlabels.fontColor("#333333");
  xlabels.fontWeight("bold");
  xlabels.useHtml(false);

  var ylabels = lineChart.yAxis().labels();
  ylabels.fontFamily("Courier");
  ylabels.fontSize(12);
  ylabels.fontColor("#333333");
  ylabels.fontWeight("bold");
  ylabels.useHtml(false);
  
  // lineChart.yAxis().orientation("right");

  //Custom legend  chart
  lineChart.legend(true);
  lineChart.legend().title().useHtml(true);
  lineChart.legend().useHtml(true);
  lineChart
    .legend()
    .titleFormat(
      "<span style='color:#333333;font-weight:600;'>" + "{%value}</span>"
    );
  lineChart
    .legend()
    .itemsFormat(
      "<span style='color:#333333;font-weight:600;'>{%seriesName}:" +
        " {%value} </span>"
    );

  // configure the strokes of the crosshair on the first plot
  lineChart.crosshair(true);
  lineChart.crosshair().xStroke("#00bfa5", 1.5, "15 15", "round");
  lineChart.crosshair().yStroke("#00bfa5", 1.5, "15 15", "round");
  //set labels x,y
  lineChart.crosshair().xLabel().fontColor("#ffa000");
  lineChart.crosshair().yLabel().fontColor("#ffa000");

  var rangePicker = anychart.ui.rangePicker();
  rangePicker.fromLabelText("Từ ");
  rangePicker.toLabelText("Đến ");

  // Set date time format.
  rangePicker.format("yyyy-MM");

  //title chart
  // chart.title("LINE CHART");
  // place title into bottom of the chart
  // chart.title().orientation("top");
  // stick title to the left side
  // chart.title().align("left");
  // chart.title().fontColor("#fff");
  // chart.title().padding(10, 10, 10, 10);
  // reset
  document.getElementById("chart").innerHTML = "";
  document.getElementById("rangepicker").innerHTML = "";
  rangePicker.target(chart);

  chart.container("chart");
  // initiate chart drawing
  chart.draw();
  // Render the range picker into an instance of a stock chart
  rangePicker.render(document.getElementById("rangepicker"));

  
}

function toggleBtnTime(parrentClass, childId) {
  let classSelector = $(parrentClass);
  classSelector.find("button.active-btn").removeClass("active-btn");
  classSelector.children("button#" + childId).addClass("active-btn");
}

function selector(time) {
  switch (time) {
    case "1M":
      GetData("P1M", "PT5H", 120);
      toggleBtnTime(".selector", "1M");
      break;
    case "3M":
      GetData("P3M", "PT5H", 120);
      toggleBtnTime(".selector", "3M");
      break;
    case "6M":
      GetData("P6M", "P1D", 120);
      toggleBtnTime(".selector", "6M");
      break;
    case "1Y":
      GetData("P1Y", "P1W", 120);
      toggleBtnTime(".selector", "1Y");
      break;
    // case "5Y":
    //   GetData("P5Y", "P1M", 120);
    //   break;
    case "MAX":
      GetData("MAX", "P1M", 120);
      toggleBtnTime(".selector", "MAX");
      break;
    default:
      GetData("P1M", "PT5H", 120);
      toggleBtnTime(".selector", "1M");
  }
}

selector();


function DrawChartCombined() {
    // create data set on our data
    var dataSet = anychart.data.set([
      ['01/2021', 96.5, 2040, 1200, 1600],
      ['02/2021', 77.1, 1794, 1124, 1724],
      ['03/2021', 73.2, 2026, 1006, 1806],
      ['04/2021', 61.1, 2341, 921, 1621],
      ['05/2021', 70.0, 1800, 1500, 1700],
      ['06/2021', 60.7, 1507, 1007, 1907],
      ['07/2021', 62.1, 2701, 921, 1821],
      ['08/2021', 75.1, 1671, 971, 1671],
      ['09/2021', 80.0, 1980, 1080, 1880],
      ['10/2021', 54.1, 1041, 1041, 1641],
      ['11/2021', 51.3, 813, 1113, 1913],
      ['12/2021', 59.1, 691, 1091, 1691]
    ]);

    // map data for the first series, take x from the zero column and value from the first column of data set
    var firstSeriesData = dataSet.mapAs({ x: 0, value: 2 });

    // map data for the second series, take x from the zero column and value from the second column of data set
    var secondSeriesData = dataSet.mapAs({ x: 0, value: 2 });

    // create column chart
    let chartCombined = anychart.column();

    // turn on chart animation
    chartCombined.animation(true);
   
    // force chart scale to stuck series values
    chartCombined.yScale().stackMode('value');
   
    chartCombined.crosshair(true);
    // create second series with mapped data
    let columnSeries =  chartCombined.column(secondSeriesData);
    columnSeries.normal().fill("#00F4B0", 1);
    columnSeries.normal().stroke("#00F4B0", 1, "round");

    let lineSeries = chartCombined.line(firstSeriesData);
    lineSeries.stroke({
      color: "#093B96",
      opacity: 0.8,
      dash: "5 5",
      thickness: 2,
    });
    //lineSeries.yScale(scale).markers(true);

    chartCombined.container('chart_conbined');
    chartCombined.draw();
};
DrawChartCombined();

function DrawChartPie() {
    // create data
    var data = [
      { 
        x: "Ngân hàng", 
        value: 637166,
        normal:{ fill:"#B2EA67"}
      },
      { 
        x: "Bán lẻ", 
        value: 721630,
        normal:{
                   fill: "#EF2D62",
                }
      },
      { 
        x: "Chứng khoáng", 
        value: 148662,
        normal:{
                   fill: "#1474CB",
                }
      },
      { 
        x: "Năng lượng", 
        value: 78662,
        normal:{
                   fill: "#149231",
                }
      },
      { 
        x: "Thép - VLXD", 
        value: 90000,
        normal:{
                   fill: "#C9A334",
                }
      },
      { 
        x: "Cảng - xuất khẩu", 
        value: 156426,
        normal:{
                   fill: "#E47615",
                }
      },
      { 
        x: "Công nghệ", 
        value: 156426,
        normal:{
                   fill: "#D52F05",
                }
      },
    ];

    // create a chart and set the data
    var pieChart = anychart.pie(data);
    pieChart.innerRadius("30%");
    pieChart.tooltip().format("Giá trị: {%value}\nTỷ lệ: {%percentvalue}"+"%");

    // set the container id
    pieChart.container("chart_pie");

    // initiate drawing the chart
    pieChart.draw();
}
DrawChartPie();
