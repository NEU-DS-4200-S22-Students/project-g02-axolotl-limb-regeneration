// Pulling all data from the csv file
//d3.csv('data/LFC_transformed.csv').then(dotPlot);
let dispatcher, selectedPoint;
// Creating a function to create dot plot
function dotPlot(data) {

  // defining margins
  let margin = {
    top: 20,
    left: 50,
    right: 50,
    bottom: 20
  },
  width = 950,
  height = 400;

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
      .attr('transform', `translate(0, ${370 - margin.bottom - margin.top})`)
    .call(xAxis)

  let yScale = d3.scaleLinear()
    .domain([3, 15])
    .range([370 - margin.bottom - margin.top, margin.top]);

  // creating an x axis based on the xScale
  let yAxis = d3.axisLeft(yScale)
  chartGroup
    .append('g')
      .attr('class', 'y axis')
    .call(yAxis)

  // adding a divergent color scale
  let colors = d3.scaleSequential(d3.interpolateRdBu)
    .domain([-8, 8]);

  let tooltip = d3.select('#dot-holder')
    .append('div')
    .classed('tooltip', true);

  let mouseover = function(d) {
    tooltip.style('opacity', 1);
  }
  let mousemove = function(event, d) {
    tooltip.html(d.human_gene + '/' + d.axolotl_gene)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY + 25) + 'px');
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
      .attr('cy', d => yScale(d.LME))
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
      .attr('y', 5)
      .attr('class', 'chartTitle')
      .text('Axolotl Genes');

  // creating x axis label
  chartGroup
    .append('text')
      .attr('x', width/2)
      .attr('y', 370)
      .style('text-anchor', 'middle')
      .text('Log Fold Change in Gene Expression Relative to Baseline');

  // Adding y axis label
  chartGroup.append('text')
    .attr('x', -height/2)
    .attr('y', -50)
    .style('text-anchor', 'middle')
    .attr('class', 'ylabel')
    .text('Mean Gene Expression');

  //////////////////////////////////////////
  //////// creating zooming feature ////////
  /////////////////////////////////////////

  // let clip = chartGroup.append("defs").append("svg:clipPath")
  //     .attr("id", "clip")
  //     .append("svg:rect")
  //     .attr("width", width )
  //     .attr("height", height )
  //     .attr("x", 0)
  //     .attr("y", 0);

  // let brush = d3.brush()
  //   //.extent([[0,0], [width, height]])
  //   .on('end', brushed); 

  // chartGroup.append('g')
  // .attr("clip-path", "url(#clip)");

  // chartGroup.append('g') 
  //   .attr('class', 'brush')
  //   .call(brush);

  // let idleTimeout;
  // function idled() {
  //   idleTimeout = null
  // }

  // function brushed() { 
  //   let area =  d3.event.selection;
  //   if (!area) {
  //     if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay); 
  //   x.domain(x0);
  //   y.domain(y0);
  //   }
  //   else {
  //     x.domain([area[0][0], area[1][0]].map(x.invert, x));
  //     y.domain([area[1][1], area[0][1]].map(y.invert, y));
  //     chartGroup.select('.brush').call(brush.move, null);
  //   }
  //   zoom();
  // }

  // function zoom() {
  //   xAxis.transition().duration(1000).call(d3.axisBottom(x))
  //   chartGroup
  //     .select(".axis--x").transition(t).call(xAxis)
  //     .select(".axis--y").transition(t).call(yAxis)
  //     .selectAll("circle").transition(t)
  //       .attr("cx", function(d) { return x(d[0]); })
  //       .attr("cy", function(d) { return y(d[1]); });
  // }

return dotPlot;
}
dotPlot.selectionDispatcher = function (_) {
  if (!arguments.length) return dispatcher;
  dispatcher = _;
  return dotPlot;}