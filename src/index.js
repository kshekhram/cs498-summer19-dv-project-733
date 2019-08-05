var stage_width;
var stage_height;
var measures;
var stories;

document.onload = init_page();

function init_page() {
  stage_width = 1080;
  stage_height = 500;
  //filter_years = [2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];
  measures = [
    "GDP",
    "GDPGrowth",
    "GDPPerCapitaGrowth",
    "TotalPopulation",
    "PopulationGrowth",
    "WorkingPopulation"
  ];

  stories = [
    {
      year: 2014,
      measure: "GDP",
      msg:
        "India was 10th largest ecconomy in 2014. But it's GDP was growing very fast at the rate of <GDP_GROWTH> %."
    },
    {
      year: 2015,
      measure: "GDP",
      msg:
        "India became 7th largest ecconomy in 2015, overtaking Italy, Brazil and Russia. it's GDP was still growing  faster at the rate of <GDP_GROWTH> %."
    },
    {
      year: 2017,
      measure: "GDP",
      msg:
        "India became 5th largest ecconomy in 2017, overtaking  even UK and France. But it's GDP growth softened to <GDP_GROWTH> %."
    }
  ];

  //build_side();
  load_data();
}

async function load_data() {
  console.log("load_data() called");
  await d3
    .csv("../data/CountriesGDPGrowth.csv")
    .then(function(csv_data) {
      csv_data.forEach(function(d) {
        d.Year = +d.Year; //Integer
        d.GDP = +d.GDP; //In Billions
        d.GDPGrowth = parseFloat(d.GDPGrowth); //Percentage
        d.GDPPerCapitaGrowth = parseFloat(d.GDPPerCapitaGrowth); //Percentage
        d.TotalPopulation = parseFloat(d.TotalPopulation); //Millions
        d.PopulationGrowth = parseFloat(d.PopulationGrowth); //Percentage
        d.WorkingPopulation = parseFloat(d.WorkingPopulation); //Millions
      });
      console.log("csv data:", csv_data[0]);
      console.log("before caling scene:");

      //test_scene();
      stories.forEach(function(story) {
        console.log("laod data year:", story.year, "measure:", story.measure);
        var chart_data = prep_chart_data(csv_data, story.year, story.measure);
        console.log("chart data:", chart_data[0]);
        build_scene(chart_data, story);
      });
      //Here build drilldown scene. Start with first latest year and GDP
      var init_story = {
        year: 2018,
        measure: "GDP",
        msg: ""
      };
      var chart_data = prep_chart_data(
        csv_data,
        init_story.year,
        init_story.measure
      );
      build_scene(chart_data, init_story, true);
      add_dropdown(csv_data);
      add_slider_year(csv_data);
    })
    .catch(function(error) {
      // handle error
      throw error;
    });
}

function build_scene(chart_data, story, drilldown = false) {
  //Use appropriate stage and clear the satge for drilldown
  var stage;
  if (drilldown) {
    stage = d3.select("#drilldown_stage");
    //clear SVG canvas for the drilldown stage
    stage.html(null);
  } else {
    stage = d3.select("#stage");
  }

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 20, bottom: 40, left: 60 },
    chart_width = stage_width - margin.left - margin.right,
    chart_height = stage_height - margin.top - margin.bottom;

  // set the ranges
  var x = d3
    .scaleBand()
    .range([0, chart_width])
    .padding(0.1);
  var y = d3.scaleLinear().range([chart_height, 0]);

  //Add svg element to the stage
  var svg = stage
    .append("svg")
    .attr("class", "chart")
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", chart_height + margin.top + margin.bottom);

  //Add chart lables
  var char_title = svg
    .append("text")
    .attr("x", chart_width / 2)
    .attr("y", 50)
    .text(story.year + " " + camelCaseToSentenceCase(story.measure))
    .style("font-weight", "bold");

  var chart = svg
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
      return d[story.measure];
    })
  ]);

  // append the rectangles for the bar chart
  chart
    .selectAll("rect")
    .data(chart_data)
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.Country);
    })
    .attr("width", x.bandwidth())
    .attr("y", function(d) {
      return y(d[story.measure]);
    })
    .attr("height", function(d) {
      return chart_height - y(d[story.measure]);
    });

  // add the x Axis
  chart
    .append("g")
    .attr("transform", "translate(0," + chart_height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  chart.append("g").call(
    d3.axisLeft(y).tickFormat(function(d) {
      var format = d;
      switch (story.measure) {
        case "GDP":
          format = d / 1000000000000 + " Trillion";
          break;
        case "GDPGrowth":
          format = d + " %";
          break;
        case "GDPPerCapitaGrowth":
          format = d + " %";
          break;
        case "TotalPopulation":
          format = d / 1000000000 + " Billion";
          break;
        case "PopulationGrowth":
          format = d + " %";
          break;
        case "WorkingPopulation":
          format = d / 1000000000 + " Billion";
          break;
        default:
          break;
      }
      return format;
    })
  );

  //Add annotations for stories
  if (!drilldown) {
    const annotations = [
      {
        note: {
          label: story.msg,
          title: "India's Ecconomic Growth Story",
          align: "middle", // try right or left
          wrap: 200, // try something smaller to see text split in several lines
          padding: 10 // More = text lower
        },
        connector: {
          end: "dot", // Can be none, or arrow or dot
          type: "line", // ?? don't know what it does
          lineType: "vertical", // ?? don't know what it does
          endScale: 10 // dot size
        },
        color: ["darkgreen"],
        x: 600,
        y: 150,
        dy: 40,
        dx: 60
      }
    ];

    // Add annotation to the chart
    const makeAnnotations = d3.annotation().annotations(annotations);
    svg.append("g").call(makeAnnotations);
  }
}

function prep_chart_data(csv, year = 2018, measure = "GDP") {
  console.log("laod prep_chart_data year:", year, "measure:", measure);

  //First filter data for the passed year
  var filtered = csv.filter(function(d) {
    return d.Year == year;
  });

  console.log("laod prep_chart_data filtered:", filtered);

  //This will give data in following format
  //key : values
  //Key will be country and values will be sum(measure). e.g GDP, Population etc.
  var c_data = d3
    .nest()
    .key(function(d) {
      return d.Country;
    })
    .rollup(function(d) {
      return d3.sum(d, function(g) {
        return g[measure];
      });
    })
    .entries(filtered);

  //Now transform data columns back into country and original column
  c_data.forEach(function(d) {
    d.Country = d.key;
    d[measure] = d.value;
  });
  //Sort data ind descending order of measure
  c_data.sort(function(a, b) {
    return b[measure] - a[measure];
  });

  return c_data;
}

function add_dropdown(csv) {
  //Get Selector div
  var measure_sel = d3
    .select("#drilldown_selectors")
    .select("#measure_selector");

  var year_sel = d3.select("#drilldown_selectors").select("#year_selector");
  var year_val = year_sel.select("p#slider-value");

  // Handler for dropdown value change
  var dropdownChange = function() {
    var newMeasure = d3.select(this).property("value");
    var currYear = year_val.text();
    handleSelection(csv, currYear, newMeasure);
  };

  // Get names of measures, for dropdown
  var dropdown_div = measure_sel.select("#dropdown-measure");
  var dropdown = dropdown_div
    .insert("select", "svg")
    .on("change", dropdownChange);

  dropdown
    .selectAll("option")
    .data(measures)
    .enter()
    .append("option")
    .attr("value", function(d) {
      return d;
    })
    .text(function(d) {
      return camelCaseToSentenceCase(d);
    });
}

function add_slider_year(csv) {
  // Time
  var dataTime = d3.range(0, 9).map(function(d) {
    return new Date(2010 + d, 10, 3);
  });

  var year_sel = d3.select("#drilldown_selectors").select("#year_selector");
  var year_val = year_sel.select("p#slider-value");

  var measure_dropdown = d3
    .select("#drilldown_selectors")
    .select("#measure_selector")
    .select("#dropdown-measure");

  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(300)
    .tickFormat(d3.timeFormat("%Y"))
    .tickValues(dataTime)
    .default(new Date(2015, 10, 3))
    .on("onchange", val => {
      var year = d3.timeFormat("%Y")(val);
      year_val.text(year);
      var measure = measure_dropdown.select("select").property("value");
      console.log("Slider on change: year:", year, "measure:", measure);
      handleSelection(csv, year, measure);
    });

  var gTime = year_sel
    .select("#slider-year")
    .append("svg")
    .attr("width", 500)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");
  gTime.call(sliderTime);

  year_val.text(d3.timeFormat("%Y")(sliderTime.value()));
}

function camelCaseToSentenceCase(str) {
  return (
    str
      // insert a space before all caps
      .replace(/([A-Z])/g, " $1")
      // uppercase the first character
      .replace(/^./, function(str) {
        return str.toUpperCase();
      })
  );
}

function handleSelection(csv, year, measure) {
  console.log("handleSelection: year:", year, "measure:", measure);
  var curr_sel = {
    year: year,
    measure: measure,
    msg: ""
  };
  var newData = prep_chart_data(csv, curr_sel.year, curr_sel.measure);
  build_scene(newData, curr_sel, true);
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
