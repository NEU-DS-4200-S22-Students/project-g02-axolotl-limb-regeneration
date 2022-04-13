// Pulling all data from the csv file
//d3.csv('data/LFC_transformed.csv').then(dotPlot);
let dispatcher, selectedPoint;
// Creating a function to create dot plot
function dotPlot(data) {

  // defining margins
  let margin = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 20
  },
  width = 700,
  height = 300;

  //function chart(data) {

  let svg = d3.select('#dot')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color', 'white') // change the background color to light gray
    .attr('viewBox', [0, 0, width, height].join(' '))

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

  let tooltip = d3.select('#dot-holder')
    .append('div')
    .classed('tooltip', true);

  let mouseover = function(d) {
    tooltip.style('opacity', 1);
  }
  let mousemove = function(event, d) {
    tooltip.html(d.human_gene + '/' + d.axolotl_gene)
      .style('left', event.pageX + 'px')
      .style('top', (event.pageY + 50) + 'px');
  }
  let mouseleave = function(d) {
    tooltip.style('opacity', 0);
  }

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
      .style('stroke', 'gray')
      .attr('fill', function(d) {return colors(d.LFC)})
    .on('click', function(_){
      if (selectedPoint != null) {
        selectedPoint.classed('selected', false)
          .style('stroke', 'gray')
      }
      selectedPoint = d3.select(this).classed('selected', true)
        .style('stroke', 'darkgreen');
      dispatcher.call('dotToLine', this, this.__data__);
      dispatcher.call('dotToHeat', this, this.__data__);
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // creating a chart title 
  chartGroup
    .append('text')
      .attr('x', width/2)
      .attr('y', 30)
      .attr('class', 'chartTitle')
      .text('Axolotl Genes');

  // creating x axis label
  chartGroup
    .append('text')
      .attr('x', width/2)
      .attr('y', 285)
      .style('text-anchor', 'middle')
      .text('Log Fold Change in Gene Expression Relative to Baseline');
return dotPlot;
}
dotPlot.selectionDispatcher = function (_) {
  if (!arguments.length) return dispatcher;
  dispatcher = _;
  return dotPlot;}