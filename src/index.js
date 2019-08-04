
var chart_data;
var stage_width;
var stage_height;

document.onload = init_page();
function init_page() {
  stage_width = 1020;
  stage_height = 500;
  //build_side();
  load_data();
}

async function load_data() {
  console.log("load_data() called");
  await d3
    .csv("./data/CountriesGDPGrowth.csv")
    .then(function(csv_data) {
      csv_data.forEach(function(d) {
        d.Year = +d.Year; //Integer
        d.GDP = +d.GDP; //In Billions
        d.GDPGrowth = parseFloat(d.GDPGrowth) / 100; //Percentage
        d.GDPPerCapitaGrowth = parseFloat(d.GDPPerCapitaGrowth) / 100; //Percentage
        d.TotalPopulation = parseFloat(d.TotalPopulation); //Millions
        d.PopulationGrowth = parseFloat(d.PopulationGrowth) / 100; //Percentage
        d.WorkingPopulation = parseFloat(d.WorkingPopulation); //Millions
      });
      console.log("csv data:", csv_data[0]);
      chart_data = prep_chart_data(csv_data);
      console.log("before caling scene:");
      console.log("chart data:", chart_data[0]);
      //test_scene();
      build_scene();
    })
    .catch(function(error) {
      // handle error
      throw error;
    });
}

function build_side() {
  //create and style left pannel
  document.getElementById("left").innerHTML = "";
  var left_pannel = d3.select("#left");
  left_pannel
    .append("div")
    .attr("class", "nav")
    .style("height", stage_height + "px");

  //create and style right pannel
  document.getElementById("right").innerHTML = "";
  var right_pannel = d3.select("#right");
  right_pannel
    .append("div")
    .attr("class", "nav")
    .style("height", stage_height + "px");
}

function build_scene() {
  //Clear stage first
  document.getElementById("stage").innerHTML = "";

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 20, bottom: 40, left: 50 },
    chart_width = stage_width - margin.left - margin.right,
    chart_height = stage_height - margin.top - margin.bottom;

  // set the ranges
  var x = d3
    .scaleBand()
    .range([0, chart_width])
    .padding(0.1);
  var y = d3.scaleLinear().range([chart_height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  //select the stage element
  var stage = d3.select("#stage");

  //Add svg element to the stage
  var svg = stage
    .append("svg")
    .attr("class", "chart")
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", chart_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain(
    chart_data.map(function(d) {
      return d.Country;
    })
  );
  y.domain([
    0,
    d3.max(chart_data, function(d) {
      return d.WorkingPopulation;
    })
  ]);

  // append the rectangles for the bar chart
  svg
    .selectAll("rect")
    .data(chart_data)
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.Country);
    })
    .attr("width", x.bandwidth())
    .attr("y", function(d) {
      return y(d.WorkingPopulation);
    })
    .attr("height", function(d) {
      return chart_height - y(d.WorkingPopulation);
    });

  // add the x Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + chart_height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g").call(d3.axisLeft(y));
}

function prep_chart_data(csv) {
  //This will give data in following format
  //key : values
  //Key will be country and values will be sum(WorkingPopulation)
  var c_data = d3
    .nest()
    .key(function(d) {
      return d.Country;
    })
    .rollup(function(d) {
      return d3.sum(d, function(g) {
        return g.WorkingPopulation;
      });
    })
    .entries(csv);

  //Now transform data columns back into country and original column
  c_data.forEach(function(d) {
    d.Country = d.key;
    d.WorkingPopulation = d.value;
  });
  //Sort data ind escending order of working population
  c_data.sort(function(a, b) {
    return b.WorkingPopulation - a.WorkingPopulation;
  });

  return c_data;
}

function onNavButtonClick() {
  console.log("onNavButtonClick() Called");
  alert("I am Clicked");
}

function test_scene() {
  console.log("test_scene() called");
  var data1 = [4, 8, 5, 10, 6];
  //select the stage element
  var stage = d3.select("#stage");

  //Add svg element to the stage
  var svg = stage
    .append("svg")
    .attr("class", "chart")
    .attr("width", 600)
    .attr("height", 500);

  //Now add bar chart to svg
  var bars = svg
    .selectAll("rect")
    .data(data1)
    .enter()
    .append("rect");

  //yScale = d3.scaleLinear().domain(data).range(0, 500);
  bars
    .attr("width", 19)
    .attr("height", function(d) {
      return 10 * d;
    })
    .attr("x", function(d, i) {
      return 20 * i;
    })
    .attr("y", function(d) {
      return 420 - 10 * d;
    });
}
