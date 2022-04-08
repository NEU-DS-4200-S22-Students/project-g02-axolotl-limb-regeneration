// Pulling all data from the csv file
//d3.csv('data/modified_pc.csv').then(lineChart);

let xLabels = ['D0', 'D0.5', 'D1', 'D1.5', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'];
let yScale, line, chartGroup;

function lineChart(data) {
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
   chartGroup = svg
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
   yScale = d3.scaleLinear()
    .domain([0, 0])
    .range([height/3, 0]);

   // drawing y axis
   let yAxis = chartGroup.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScale));

    line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(function(d){return xScale(d.x);})
      .y(function(d){return yScale(d.y);});
    
    chartGroup.append('path')
      .attr('class', 'line')
      .attr('d', line(data))
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', 2);

    // Adding x axis label
    chartGroup
    .append('text')
      .attr('x', width/3)
      .attr('y', height/3 + 50)
      .style('text-anchor', 'middle')
      .text('Days Since Amputation');

    // Adding y axis label
    chartGroup
    .append('text')
      .attr('x', -150)
      .attr('y', -30)
      .style('text-anchor', 'middle')
      .attr('class', 'ylabel')
      .text('Log Base 2 of Gene Expression');

  return lineChart;
}

function getData(data) {
  var max = 0;
  var xy = [];
  for(var i = 0; i < xLabels.length; i++ ) {
    yvalue = data[xLabels[i]]
    xy.push({x: xLabels[i], y: yvalue});
    if(parseInt(yvalue) > max) {
      max = parseInt(yvalue);
    }
  }
  return [max, xy]
}

function render(data) {
  var [max, newData] = getData(data);
  yScale.domain([0, max]);
  var newYAxis = d3.axisLeft(yScale);
  chartGroup.selectAll('.y.axis').transition().duration(1500).call(newYAxis);
  var lines = chartGroup.selectAll('.line').data(newData).attr('class', 'line');
  lines.transition().duration(1500)
    .attr('d', line(newData))
    .style('stroke', 'black');
}

lineChart.updateSelection = function (selectedData) {
  if (!arguments.length) return;
    render(selectedData);
};
