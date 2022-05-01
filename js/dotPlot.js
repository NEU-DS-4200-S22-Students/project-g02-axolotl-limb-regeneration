
// defining a dispatcher to carry the information for the most recent selected point
let dispatcher, selectedPoint, selectedGene, resetChart, updateInfo, category = 0;

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
  chartGroupDot = svg
    .append('g')
      .attr('transform', 'translate(' + margin.left +', ' + margin.top + ')');

  // defining variables for the default axis scales
  let x0 = [-12, 8],
  y0 = [3,15];
      
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
    .call(xAxis)

  let yScale = d3.scaleLinear()
    .domain(y0)
    .range([height - margin.bottom - margin.top, margin.top]);

  // creating an x axis based on the xScale
  let yAxis = d3.axisLeft(yScale)
  chartGroupDot
    .append('g')
      .attr('class', 'y axis')
    .call(yAxis)

  // adding a divergent color scale
  let colors = d3.scaleSequential(d3.interpolateRdBu)
    .domain([8, -8]);
   
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
    if (!selected) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
      xScale.domain(x0);
      yScale.domain(y0);
    } else {
      chartGroupDot.selectAll("circle").classed('invisible', function(d){
        xLower = selected[0][0],
        xUpper = selected[1][0],
        yLower = selected[0][1],
        yUpper = selected[1][1];
        if (category == 0) {
          cluster = false;
        }
        else {
          cluster = (d.cluster != category);
        }
        return (xScale(d.LFC) < xLower || xScale(d.LFC) > xUpper || yScale(d.LME) < yLower || yScale(d.LME) > yUpper || cluster);
      })
      xScale.domain([selected[0][0], selected[1][0]].map(xScale.invert, xScale));
      yScale.domain([selected[1][1], selected[0][1]].map(yScale.invert, yScale));
      chartGroupDot.call(brush.move, null);
      transitionChart();
    }
  }

  resetChart = function() {
    xScale.domain(x0);
    yScale.domain(y0);
    renderData(filterCategories());
    selected = d3.select("#" + selectedGene);
    if (selected != null) {
      selectedPoint = selected;
      selectedPoint.classed('selected', true)
    }
    transitionChart();
  }

  chartGroupDot.on("dblclick", resetChart);

  let transitionChart = function() {
      let transition = chartGroupDot.transition().duration(750);
      chartGroupDot.select(".x.axis").transition(transition).call(xAxis);
      chartGroupDot.select(".y.axis").transition(transition).call(yAxis);
      chartGroupDot.selectAll("circle").transition(transition)
        .attr('cx', d => xScale(d.LFC))
        .attr('cy', d => yScale(d.LME));
  }

  // creating a brush event that calls the zoom function after the user makes a brush selection
  let brush = d3.brush()
    .extent([[0,margin.top], [width - margin.left - margin.right, height - margin.top - margin.bottom]])
    .on("end", zoom);
  chartGroupDot.call(brush);

  let idleTimeout,
    idleDelay = 350;

  // creating a div container to hold the tool tips
  let tooltip = d3.select('#dot-holder')
    .append('div')
    .attr('class', 'tooltip');

  // defines function for click event that colors the selected point green, 
  // returns the previous point to its assigned color, and
  // passes the data for the selected point to the line chart and heat map
  let click = function(event){
      if (getComputedStyle(this).opacity == 0) {
        return;
      }
      if (selectedPoint != null) {
        selectedPoint.classed('selected', false)
      }
      selectedPoint = d3.select(this).classed('selected', true)
      selectedGene = this.id;
      updateInfo(this.__data__);
      
      dispatcher.call('dotToLine', this, this.__data__);
      dispatcher.call('dotToHeat', this, this.__data__);
    }

  // makes the tool tip visible while the mouse hovers over a point in the plot
  let mouseover = function(d) {
    if (getComputedStyle(this).opacity != 0) {
      tooltip.style('opacity', 1);
    }
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
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
  }
  renderData(data)

  let filterCategories = function() {
    if (category == 0) {
      return data;
    }
    let selectedData = []
    for(var i = 0; i < data.length; i++) {
      gene = data[i]
      if (gene['cluster'] == category) {
        selectedData.push(gene);
      };
    }
    return selectedData;
    /*
    chartGroupDot.selectAll('circle').classed('invisible', function(d) {
      if (category == 0) {
        return false;
      }
      return !(category == d.cluster);
    })*/
  }

  updateInfo = function(info) {
    document.getElementById("axolotltext").innerText = "Axolotl Gene: " + info.axolotl_gene;
    document.getElementById("humantext").innerText = "\u2003Human Gene: " + info.human_gene
    document.getElementById("lfctext").innerText = "\u2003LFC Relative to Baseline: " + parseFloat(info.LFC).toFixed(2);
    document.getElementById("searchmessage").innerText = "";
  }
/*
// filtering points based on categories 
function filterPoints() {
    const filter_section = d3.select('svg').append('div')
    const filter_select = filter_section.append('select');
    filter_select.append('option').property('value', 0).text('Categories');
    filter_select.append('option').property('value', 1).text('All Categories');
    filter_select.append('option').property('value', 2).text('Category 1');
    filter_select.append('option').property('value', 3).text('Category 2');
    filter_select.append('option').property('value', 4).text('Category 3');
    filter_select.append('option').property('value', 5).text('Category 4');
    filter_select.append('option').property('value', 6).text('Category 5');
    filter_select.append('option').property('value', 7).text('Category 6');

    filter_select.on('change', function () {
      const val = +this.value;
      chartGroupDot.selectAll('circle')
        .transition()
        .style('display', 'initial');
      if (val > 0) {
        chartGroupDot.selectAll('circle')
          .transition()
          .style('display', d => d.cluster === val ? 'inital' : 'none');
      }
    });
  }

  filterPoints();
*/
return dotPlot;
}

dotPlot.selectionDispatcher = function (_) {
  if (!arguments.length) return dispatcher;
  dispatcher = _;
  return dotPlot;}

dotPlot.filter = function(selection) {
  category = selection;
  resetChart();
}

dotPlot.select = function(geneData) {
  gene = geneData.axolotl_gene;
  //gene = document.getElementById(key)
  //if (getComputedStyle(gene).opacity != 0) {
  if (selectedPoint != null) {
    selectedPoint.classed('selected', false)
  }
  selectedPoint = d3.select('#' + gene).classed('selected', true)
  selectedGene = gene;
  //}
  updateInfo(geneData);
  dispatcher.call('dotToLine', gene, geneData);
  dispatcher.call('dotToHeat', gene, geneData);
}