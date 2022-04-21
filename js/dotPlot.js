
// defining a dispatcher to carry the information for the most recent selected point
let dispatcher, selectedPoint;

// Creating a function to create dot plot
function dotPlot(data) {

  // defining margins
  let margin = {
    top: 25,
    left: 50,
    right: 50,
    bottom: 70
  },
  width = 950,
  height = 400;

  // creating an svg to hold the contents of the dot plot
  let svg = d3.select('#dot')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') 
    .attr('width', '100%') 
    .style('background-color', 'white') 
    .attr('viewBox', [0, 0, width, height].join(' '))

  // creating an svg group for all of the points in the volcano plot
  let chartGroup = svg
    .append('g')
      .attr('transform', 'translate(' + margin.left +', ' + margin.top + ')');

  // defining variables for the default axis scales
  let x0 = [-12, 8];
  let y0 = [3,15];
      
  // creating a scale for the x axis
  let xScale = d3.scaleLinear()
    .domain(x0)
    .range([0, width - margin.left -margin.right]);

  // creating an x axis based on the xScale
  let xAxis = d3.axisBottom(xScale)
  chartGroup
    .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height - margin.bottom - margin.top})`)
    .call(xAxis)

  let yScale = d3.scaleLinear()
    .domain(y0)
    .range([height - margin.bottom - margin.top, margin.top]);

  // creating an x axis based on the xScale
  let yAxis = d3.axisLeft(yScale)
  chartGroup
    .append('g')
      .attr('class', 'y axis')
    .call(yAxis)

  // adding a divergent color scale
  let colors = d3.scaleSequential(d3.interpolateRdBu)
    .domain([-8, 8]);

  // creating a chart title 
  svg.append('text')
    .attr('x', width/2)
    .attr('y', margin.top)
    .attr('class', 'chartTitle')
    .text('Axolotl Genes');

  // creating x axis label
  svg.append('text')
    .attr('x', width/2)
    .attr('y', height-(margin.bottom/2))
    .style('text-anchor', 'middle')
    .text('Log Fold Change in Gene Expression Relative to Baseline');

  // Adding y axis label
  svg.append('text')
    .attr('x', -height/2)
    .attr('y', -50 + margin.left)
    .style('text-anchor', 'middle')
    .attr('class', 'ylabel')
    .text('Mean Gene Expression');

  // function setting the idle timeout to null to use in zooming out
  let idled = function() {
    idleTimeout = null;
  }

  // function that evaluates the user's current mouse action and updates the chart.
  // If the action does not create a brush selection and the user double-clicks, 
  // the scales are set to their default values (zooming out if necessary). 
  // If the action creates a brush selection, it zooms into that selection and updates the axes.
  let zoom = function() {
    let selected = d3.brushSelection(this);
    console.log(selected)
    if (!selected) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
      xScale.domain(x0);
      yScale.domain(y0);
    } else {
      xScale.domain([selected[0][0], selected[1][0]].map(xScale.invert, xScale));
      yScale.domain([selected[1][1], selected[0][1]].map(yScale.invert, yScale));
      chartGroup.call(brush.move, null);
        
      let transition = chartGroup.transition().duration(750);
      chartGroup.select(".x.axis").transition(transition).call(xAxis);
      chartGroup.select(".y.axis").transition(transition).call(yAxis);
      chartGroup.selectAll("circle").transition(transition)
        .attr('cx', d => xScale(d.LFC))
        .attr('cy', d => yScale(d.LME));
    }
    console.log(chartGroup.select('.brush'))
  }

  // creating a brush event that calls the zoom function after the user makes a brush selection
  let brush = d3.brush().on("end", zoom),
    idleTimeout,
    idleDelay = 350;
  chartGroup.call(brush);

  // creating a div container to hold the tool tips
  let tooltip = d3.select('#dot-holder')
    .append('div')
    .attr('class', 'tooltip');

  // defines function for click event that colors the selected point green, 
  // returns the previous point to its assigned color, and
  // passes the data for the selected point to the line chart and heat map
  let click = function(event){
      if (selectedPoint != null) {
        selectedPoint.classed('selected', false)
      }
      selectedPoint = d3.select(this).classed('selected', true)
      dispatcher.call('dotToLine', this, this.__data__);
      dispatcher.call('dotToHeat', this, this.__data__);
    }

  // makes the tool tip visible while the mouse hovers over a point in the plot
  let mouseover = function(d) {
    tooltip.style('opacity', 1);
  }

  // populates the tool tip with the human gene name and the probe name and
  // offsets the tool tip to the bottom right of the cursor 
  let mousemove = function(event, d) {
    tooltip.html(d.human_gene + '/' + d.axolotl_gene)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY + 25) + 'px');
  }

  // hides the tool tip when the mouse is not hovering over a point
  let mouseleave = function(d) {
    tooltip.style('opacity', 0);
  }

  // creating dots on the plot
  chartGroup 
    .selectAll('circle')
      .data(data)
    .enter()
    .append('circle')
      .attr('id', d => d.key)
      .attr('cx', d => xScale(d.LFC))
      .attr('cy', d => yScale(d.LME))
      .attr('fill', d => colors(d.LFC))
      .attr('r', 3)
      .style('stroke', 'gray')
    .on('click', click)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

return dotPlot;
}


dotPlot.selectionDispatcher = function (_) {
  if (!arguments.length) return dispatcher;
  dispatcher = _;
  return dotPlot;}