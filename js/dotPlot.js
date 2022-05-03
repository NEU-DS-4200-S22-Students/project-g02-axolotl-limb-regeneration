
// defining a dispatcher for dispatch events and defines functions for interactivity
let dispatcher, filterDot, selectDot;

// Creating a function to create dot plot
function dotPlot(data) {

  // defining margins and initial variables
  let margin = {
    top: 25,
    left: 50,
    right: 50,
    bottom: 70
  },
  width = 950,
  height = 400,
  x0 = [-12,8],
  y0 = [3,15],
  selectedPoint,
  selectedGene,
  category = 0;

  // creating an svg to hold the contents of the dot plot
  let svg = d3.select('#dot')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') 
    .attr('width', '100%') 
    .style('background-color', 'white') 
    .attr('viewBox', [0, 0, width, height].join(' '));

  // creating an svg group for all of the points in the dot plot
  chartGroupDot = svg.append('g')
    .attr('transform', 'translate(' + margin.left +', ' + margin.top + ')');
      
  // creating a scale for the x axis
  let xScale = d3.scaleLinear()
    .domain(x0)
    .range([0, width - margin.left -margin.right]);

  // creating an x axis based on the xScale
  let xAxis = d3.axisBottom(xScale)
  chartGroupDot
    .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height - margin.bottom - margin.top})`)
    .call(xAxis);

  let yScale = d3.scaleLinear()
    .domain(y0)
    .range([height - margin.bottom - margin.top, margin.top]);

  // creating an x axis based on the xScale
  let yAxis = d3.axisLeft(yScale)
  chartGroupDot
    .append('g')
      .attr('class', 'y axis')
    .call(yAxis);

  // adding a divergent color scale
  let colors = d3.scaleSequential(d3.interpolateRdBu)
    .domain([8,-8]);
   
  // creating a chart title 
  svg.append('text')
    .attr('x', width/2)
    .attr('y', margin.top)
    .attr('class', 'chartTitle')
    .text('Axolotl Genes');

  // creating x axis label
  svg.append('text')
    .attr('x', width/2)
    .attr('y', height - (margin.bottom/2))
    .style('text-anchor', 'middle')
    .text('Maximum Log Fold Change in Gene Expression Relative to Baseline');

  // Adding y axis label
  svg.append('text')
    .attr('x', -height/2)
    .attr('y', -50 + margin.left)
    .style('text-anchor', 'middle')
    .attr('class', 'ylabel')
    .text('Mean Gene Expression');

  // setting these variables for double-clicking and brushing functionality
  let idleTimeout, idleDelay = 350;

  // function setting the idle timeout to null to use in zooming out
  let idled = function() {
    idleTimeout = null;
  };

  // function that evaluates the user's current mouse action and updates the chart.
  // If the action does not create a brush selection and the user double-clicks, 
  // the scales are set to their default values (zooming out if necessary). 
  // If the action creates a brush selection, it zooms into that selection and updates the axes.
  let zoom = function() {
    let selected = d3.brushSelection(this);
    if (!selected) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
      xScale.domain(x0);
      yScale.domain(y0);
    } else {
      // makes circles that are no within the visible domain after zooming invisible
      chartGroupDot.selectAll('circle').classed('invisible', function(d){
        xLower = selected[0][0],
        xUpper = selected[1][0],
        yLower = selected[0][1],
        yUpper = selected[1][1];
        if (category == 0) {
          cluster = false;
        }
        else {
          cluster = (d.cluster != category);
        };
        return (xScale(d.LFC) < xLower || xScale(d.LFC) > xUpper || yScale(d.LME) < yLower || yScale(d.LME) > yUpper || cluster);
      });
      // updates the axis, resets the brush, and moves the points of the dot plot accordingly
      xScale.domain([selected[0][0], selected[1][0]].map(xScale.invert, xScale));
      yScale.domain([selected[1][1], selected[0][1]].map(yScale.invert, yScale));
      chartGroupDot.call(brush.move, null);
      transitionChart();
    };
  };

  // sets the x and y scales back to their original domains and 
  // renders the data with the selected category
  let resetChart = function() {
    xScale.domain(x0);
    yScale.domain(y0);
    renderData(filterCategories());
    selected = d3.select('#' + selectedGene);
    if (selected != null) {
      selectedPoint = selected.classed('selected', true);
    };
    transitionChart();
  };

  // calls the double click function to zoom out
  chartGroupDot.on('dblclick', resetChart);

  // transisitons for the dot plot on brushing and reset interactions
  let transitionChart = function() {
    let transition = chartGroupDot.transition().duration(750);
    chartGroupDot.select('.x.axis').transition(transition).call(xAxis);
    chartGroupDot.select('.y.axis').transition(transition).call(yAxis);
    chartGroupDot.selectAll('circle').transition(transition)
      .attr('cx', d => xScale(d.LFC))
      .attr('cy', d => yScale(d.LME));
  };

  // creating a brush event that calls the zoom function after the user makes a brush selection
  let brush = d3.brush()
    .extent([[0,margin.top], [width - margin.left - margin.right, height - margin.top - margin.bottom]])
    .on('end', zoom);

  // Modified from https://stackoverflow.com/questions/18036836/disable-clearing-of-d3-js-brush
  // Gets the <g> the brush is created on
  let brushElement = chartGroupDot.call(brush);

  // store the original mousedown handler to use when we need it
  let oldMousedown = brushElement.on('mousedown.brush');

  // and replace it with our custom handler that doesn't trigger when circles are the mousedown targets
  brushElement.on('mousedown.brush', function (event, d) {
    if(event.target.nodeName !== 'circle'){
      oldMousedown.call(brushElement.node(), event);
    }
  });

  // creating a div container to hold the tool tips
  let tooltip = d3.select('#dot-holder')
    .append('div')
    .attr('class', 'tooltip');

  // defines function for click event that colors the selected point green, 
  // returns the previous point to its assigned color, and
  // passes the data for the selected point to the line chart and heat map
  let click = function(event, d) {
    if (getComputedStyle(this).opacity == 0) {
      return;
    };
    if (selectedPoint != null) {
      selectedPoint.classed('selected', false);
    };
    selectedPoint = d3.select(this).classed('selected', true);
    selectedGene = this.id;
    update(this.__data__);
  };

  // makes the tool tip visible while the mouse hovers over a point in the plot
  let mouseover = function(event, d) {
    if (getComputedStyle(this).opacity != 0) {
      tooltip.style('opacity', 1);
    };
  };

  // populates the tool tip with the human gene name and the probe name and
  // offsets the tool tip to the bottom right of the cursor 
  let mousemove = function(event, d) {
    tooltip.html(d.human_gene + '/' + d.axolotl_gene)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY + 25) + 'px');
  };

  // hides the tool tip when the mouse is not hovering over a point
  let mouseleave = function(event, d) {
    tooltip.style('opacity', 0);
  };

  // creating dots on the plot
  let renderData = function(selectedData) {
    d3.selectAll('circle').remove();
    chartGroupDot
      .selectAll('circle')
        .data(selectedData)
      .enter()
      .append('circle')
        .attr('id', d => d.axolotl_gene)
        .attr('cx', d => xScale(d.LFC))
        .attr('cy', d => yScale(d.LME))
        .attr('fill', d => colors(d.LFC))
        .attr('r', 3)
        .style('stroke', 'gray')
      .on('click', click)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);
  };

  // creates the initial points on the dot plot
  renderData(data);

  // function that subsets the data to only include points in the selected cluster 
  let filterCategories = function() {
    // all genes
    if (category == 0) {
      return data;
    };
    // genes from selected cluster
    let selectedData = [];
    for (let i = 0; i < data.length; i++) {
      gene = data[i];
      if (gene['cluster'] == category) {
        selectedData.push(gene);
      };
    };
    return selectedData;
  };

  // filters the dot plot based on the selected category
  filterDot = function(selection) {
    category = selection;
    resetChart();
  }

  // selects a point based on a user search and updates the dot plot accordingly
  selectDot = function(geneData) {
    gene = geneData.axolotl_gene;
    if (selectedPoint != null) {
      selectedPoint.classed('selected', false)
    };
    selectedPoint = d3.select('#' + gene).classed('selected', true)
    selectedGene = gene;
    update(geneData);
  }

  // updates the text labels for the human and axolotl gene names
  // and passes the selected data to the line chart and heat map
  let update = function(info) {
    document.getElementById('axolotltext').innerText = 'Axolotl Gene: ' + info.axolotl_gene;
    document.getElementById('humantext').innerText = '\u2003Human Gene: ' + info.human_gene
    document.getElementById('lfctext').innerText = '\u2003LFC Relative to Baseline: ' + parseFloat(info.LFC).toFixed(2);
    document.getElementById('searchmessage').innerText = '';
    dispatcher.call('dotToLine', info.axolotl_gene, info);
    dispatcher.call('dotToHeat', info.axolotl_gene, info);
  };

  // returns the initial dot plot
  return dotPlot;
};

// dispatches dotplot events for interactivity between chats
dotPlot.selectionDispatcher = function (_) {
  if (!arguments.length) return dispatcher;
  dispatcher = _;
  return dotPlot;
};

// applies the category selection to the dotplot
dotPlot.filter = function(selection) {
  filterDot(selection);
};

// selects the appropriate point from a user search and updates the plot accordingly
dotPlot.select = function(geneData) {
  selectDot(geneData);
};