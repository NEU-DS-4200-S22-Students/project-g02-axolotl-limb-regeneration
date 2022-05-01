// Pulling all data from the csv file
//d3.csv('data/modified_pc.csv').then(lineChart);

let render;

function lineChart(data) {
  // defining margins
  let margin = {
      top: 10,
      left: 60,
      right: 0,
      bottom: 45
    },
    width = 700,
    height = 350;

  //function chart(data) {
  let svg = d3.select('#line')
      .append('svg')
      .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
      .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
      .style('background-color', 'white') // change the background color to light gray
      .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))

  // creating an svg group to hold the chart elements
  let chartGroup = svg
    .append('g')
      .attr('transform', 'translate(' + margin.left +', ' + margin.top + ')');

  // creating a scale for the x axis
  let xScale = d3.scaleLinear()
    .domain([0, 28])
    .range([0, (width)])
    //.padding(0.5);
 
  // drawing x axis
  let xAxis = d3.axisBottom(xScale)
  chartGroup
    .append('g')
      .attr('transform', 'translate(0,' + (height) + ')')
    .style('font-size', 14)
    .call(xAxis)

  // creating a y scale
  let yScale = d3.scaleLinear()
    .domain([0, 0])
    .range([height, 0]);

  // drawing y axis
  let yAxis = chartGroup.append('g')
    .attr('class', 'y axis')
    .style('font-size', 14)
    .call(d3.axisLeft(yScale));

  let line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d){return xScale(d.x);})
    .y(function(d){return yScale(d.y);});
  
  chartGroup.append('path')
    .attr('class', 'line')
    .attr('d', line(data['1']))
    .style('fill', 'none')
    .style('stroke', 'black')
    .style('stroke-width', 2);
    

  // Adding x axis label
  chartGroup.append('text')
    .attr('x', (width + margin.left) / 2)
    .attr('y', height + 40)
    .style('text-anchor', 'middle')
    .text('Days Since Amputation');

  // Adding y axis label
  chartGroup.append('text')
    .attr('x', -height/2)
    .attr('y', -55)
    .style('text-anchor', 'middle')
    .attr('class', 'ylabel')
    .text('Relative Gene Expression');

  function getData(data) {
    let xLabels = ['D0', 'D0.5', 'D1', 'D1.5', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
      'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'];
    let xValues = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    let max = 0;
    let xy = [];
    for(let i = 0; i < xLabels.length; i++ ) {
      yvalue = data[xLabels[i]]
      xy.push({x: xValues[i], y: yvalue});
      if(parseInt(yvalue) > max) {
        max = parseInt(yvalue);
      }
    }
    return [max + 1, xy]
  }
    
  render = function(data) {
    let [max, newData] = getData(data);
    yScale.domain([0, max]);
    let newYAxis = d3.axisLeft(yScale);
    chartGroup.selectAll('.y.axis').transition().duration(1500).call(newYAxis);
    let lines = chartGroup.selectAll('.line').data(newData).attr('class', 'line');
    lines.transition().duration(1500)
      .attr('d', line(newData))
      .style('stroke', 'black');
  }

  return lineChart;
}

lineChart.updateSelection = function (selectedData) {
  if (!arguments.length) return;
    render(selectedData);
};