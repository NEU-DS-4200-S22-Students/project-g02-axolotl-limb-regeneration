// Pulling all data from the csv file
//d3.csv('data/LFC_transformed.csv').then(dotPlot);
let dispatcher;
// Creating a function to create dot plot
function dotPlot(data) {

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

  // creating an svg group for all of the dot plot elements
  let chartGroup = svg
    .append('g')
      .attr('transform', 'translate(' + margin.left +', ' + margin.top + ')');

  // creating a scale for the x axis
  let xScale = d3.scaleLinear()
    .domain([-12, 8])
    .range([0, width - margin.left -margin.right]);

  // creating an x axis based on the xScale
  let xAxis = d3.axisBottom(xScale)
  chartGroup
    .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, 250)')
    .call(xAxis)

  // adding a divergent color scale
  let colors = d3.scaleSequential(d3.interpolateRdBu)
    .domain([-8, 8])

  // creating dots on the plot
  chartGroup 
    .selectAll('circle')
      .data(data)
    .enter()
    .append('circle')
      .attr('id', function(d) {
        return d.key;
      })
      .attr('cx', d => xScale(d.LFC))
      .attr('cy', function(d) {return 230 - ((d.key % 95) * 2) })
      .attr('r', 3)
      .style('stroke', 'grey')
      .attr('fill', function(d) {return colors(d.LFC)})
      .on('click', function(_){
        d3.select(this).classed('selected', true);
        dispatcher.call('dotToLine', this, this.__data__);
      });

  // creating a chart title 
  chartGroup
    .append('text')
      .attr('x', width/2)
      .attr('y', 20)
      .attr('class', 'chartTitle')
      .text('Log Fold Change in Gene Expression Relative to Day 0');

  // creating x axis label
  chartGroup
    .append('text')
      .attr('x', width/2)
      .attr('y', 290)
      .style('text-anchor', 'middle')
      .text('LFC');
 // return chart;
//}
/*
chart.selectionDispatcher = function (_) {
  if (!arguments.length) return dispatcher;
  dispatcher = _;
  return chart;
}*/
return dotPlot;
}
dotPlot.selectionDispatcher = function (_) {
  if (!arguments.length) return dispatcher;
  dispatcher = _;
  return dotPlot;}