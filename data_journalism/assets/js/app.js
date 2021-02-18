var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chart = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

var xax = "poverty";
var yax = "healthcare";

function xScale(d3data, xax) {
    var xscale = d3.scaleLinear()
      .domain([d3.min(d3data.map(function (d) { 
        return d[xax];
      })) * 0.9,
      d3.max(d3data.map(function (d) { 
        return d[xax];
      })
      ) * 1.1
      ])
      .range([0, width]);
    return xscale;
};

function Axes(newx, newxax) {
    var bottomax = d3.axisBottom(newx);  
    newxax.transition()
      .duration(1000)
      .call(bottomax);
    return newxax;
};

function Circles(circlesGroup, newxScale, xax) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", function (d) { 
        return xScale(d[xax]);
      })
    return circlesGroup;
};

function updateToolTip(xax, circlesGroup) {
    var label;
    if (xax === "poverty") {
      label = "Poverty:";
    }
    else  if (xax === "income") {
      label = "Income:";
    }
    else {
      label = "Age:";
    }
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.state}<br>${label} ${d[xax]}<br>Healthcare:  ${d[yax]}`);
      });
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function (data) {
      toolTip.show(data);
    })
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });
    return circlesGroup;
};

d3.csv("assets/data/data.csv").then(function (d3data, err) {
    if (err) throw err;
  
    d3data.forEach(function (data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
    });
  
    var xscale = xScale(d3data, xax);
  
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(
        d3data.map(function (d) {
          return d.healthcare;
        })
      )]
      )
      .range([height, 0]);
  
    var bottomAxis = d3.axisBottom(xscale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    var xAxis = chart.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);


    chart.append("g")
      .call(leftAxis);
  
      var circlesGroup = chart.selectAll("g circle")
      .data(d3data)
      .enter();
  
      circlesGroup
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", function(d) { 
        return xscale(d[xax]);
      })
      .attr("cy", function(d) { 
        return yLinearScale(d.healthcare);
      })
      .attr("r", 12);
  
      circlesGroup
      .append("text")
      .classed("stateText", true)
      .attr("dx", function(d) { 
        return xscale(d[xax]);
      })
      .attr("dy", function(d) { 
        return yLinearScale(d.healthcare);
      })
      .text(function (d) {
        return d.abbr;
          })
      .attr("text-size", 5);

    var labelsGroup = chart.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");
  
    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");
  
    var healthcareLabel = chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Lacks Healthcare (%)");
  
    var circlesGroup = updateToolTip(xax, circlesGroup);
  
    labelsGroup.selectAll("text")
      .on("click", function () {
        var value = d3.select(this).attr("value");
        if (value !== xax) {
          xax = value;
          console.log(xax);
          xscale = xScale(d3data, xax);
          xAxis = Axes(xscale, xAxis);
          circlesGroup = Circles(circlesGroup, xscale, xax);
          circlesGroup = updateToolTip(xax, circlesGroup);
          if (xax === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (xax === "income") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  }).catch(function (error) {
    console.log(error);
  });