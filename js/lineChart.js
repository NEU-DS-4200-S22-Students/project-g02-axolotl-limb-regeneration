// Pulling all data from the csv file
//d3.csv('data/modified_pc.csv').then(lineChart);

key = "1";
let line;
function lineChart(data) {

  // creating a list to hold the average values for each day
  let xLabels = ['D0', 'D0.5', 'D1', 'D1.5', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
  'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'];

  var xy = []; // start empty, add each element one at a time
for(var i = 0; i < xLabels.length; i++ ) {
   xy.push({x: xLabels[i], y: data[xLabels[i]]});
}

  // defining margins
  let margin = {
      top: 60,
      left: 50,
      right: 30,
      bottom: 35
    },
    width = 1000,
    height = 1000;

  //function chart(data) {
   let svg = d3.select('#vis-svg-1')
      .append('svg')
      .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
      .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
      .style('background-color', '#ccc') // change the background color to light gray
      .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))

   // creating an svg group to hold the chart elements
   let chartGroup = svg
    .append('g')
      .attr('transform', 'translate(' + margin.left +', ' + height/3 + margin.top + ')');

   // creating a scale for the x axis
   let xScale = d3.scaleBand()
    .domain(xLabels)
    .range([0, (width - margin.left - margin.right)*2/3])
    .padding(0.5);
 
   // drawing x axis
   let xAxis = d3.axisBottom(xScale)
   chartGroup
    .append('g')
      .attr('transform', 'translate(0,' + (height/3) + ')')
    .call(xAxis)


   // creating a y scale
   let yScale = d3.scaleLinear()
    .domain([0, 15])
    .range([height/3, 0]);

   // drawing y axis
   let yAxis = chartGroup.append('g')
    .call(d3.axisLeft(yScale));

    let slice = d3.line()
      .x(function(d){return xScale(d.x);})
      .y(function(d){return yScale(d.y);});
    
    line = chartGroup.append('path')
      .attr('class', 'line')
      .attr('d', slice(xy))
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', 2);

    // Adding x axis label
    chartGroup
    .append('text')
      .attr('x', width/3)
      .attr('y', height/3 + 50)
      .style('text-anchor', 'middle')
      .text('Days After Amputation');

    // Adding y axis label
    chartGroup
    .append('text')
      .attr('x', -150)
      .attr('y', -30)
      .style('text-anchor', 'middle')
      .attr('class', 'ylabel')
      .text('Log of Gene Expression');
 
 // return chart;
  //}
  /*
  // Given selected data from another visualization 
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;
      key = selectedData;
      //lineChart();
  };*/
  //return chart;
  return lineChart;
}
lineChart.updateSelection = function (selectedData) {
  if (!arguments.length) return;
    key = selectedData;
    // console.log(key);
    line.style('stroke', null);
    let xLabels = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
  'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'];

    lineChart(selectedData);
};
