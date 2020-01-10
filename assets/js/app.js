// define SVG parameters
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top -margin.bottom;

// Create SVG area
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Create chart group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function for updating x-scale
function xScale(healthData, chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.95,
            d3.max(healthData, d=> d[chosenXAxis])
        ])
        .range([0, width]);
    
    return xLinearScale;
}

function yScale(healthData, chosenYAxis) {

    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) *0.75,
            d3.max(healthData, d=> d[chosenYAxis] ) 
    ])
    .range([height, 0]);

    return yLinearScale;
}

// Function for updating x axis
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis
}



function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d=> newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function renderCircleText(circleText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circleText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]))
        .attr("dy", "6")
        .attr("dx", "-10")

    return circleText;

}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xlabel = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Median Age";
    }
    else {
        var xlabel = "Median Household Income";
    }

    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare (%)"
    }
    else if (chosenYAxis === "obesity") {
        var ylabel = "Obesity (%)";
    }
    else {
        var ylabel = "Smokes (%)";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`)
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}


d3.csv("./assets/data/data.csv").then(function(healthData, err){
    if (err) throw err;
    console.log(healthData);

    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
    })
    console.log(healthData);
    var xLinearScale = xScale(healthData, chosenXAxis);

    var yLinearScale = yScale(healthData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", ".5");


    var circleText = chartGroup.selectAll("text")
        .data(healthData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", "6")
        .attr("dx", "-10")
        .text(d => d.abbr);


    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Median Age");
    
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Median Household Income");


    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left}, ${height / 2})`);

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare(%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese(%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes(%)");



    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    xLabelsGroup.selectAll("text")
        .on("click", function(){
            var value = d3.select(this).attr("value");
            console.log(value);
            if (value !== chosenXAxis) {
                chosenXAxis = value;

                xLinearScale = xScale(healthData, chosenXAxis);

                xAxis = renderXAxes(xLinearScale, xAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circleText = renderCircleText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if(chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if(chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                
            }
        });
    
    yLabelsGroup.selectAll("text")
        .on("click", function(){
            var value = d3.select(this).attr("value");
            console.log(value);
            if (value !== chosenYAxis) {
                chosenYAxis = value;

                yLinearScale = yScale(healthData, chosenYAxis);

                yAxis = renderYAxes(yLinearScale, yAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circleText = renderCircleText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);




                if(chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if(chosenYAxis === "obesity") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }    
        });


}).catch(function(error) {
    console.log(error);
});