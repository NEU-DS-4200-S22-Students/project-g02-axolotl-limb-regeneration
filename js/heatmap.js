// Based on Mike Bostock's margin convention
// https://bl.ocks.org/mbostock/3019563
let currentData = [], renderHeat;

// function that creates the heatmap 
function heatmap(data) {
  // defines margins and arrays of axis labels
  let margin = {top: 0, left: 180, right: 0, bottom: 40},
  width = 700,
  height = 400,
  xGroups = ['D0.5', 'D1', 'D1.5', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
  'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'],
  xValues = [0.5, 1, 1.5, 2, 3, 4, 5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
  
  // creates and svcg group for the heatmap boxes
  let svgHeat = d3.select('#heat')
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // creates a scale for the x axis based on the days after amputation
  let xScaleHeat = d3.scaleBand()
    .range([0, width])
    .domain(xValues)
    .padding(0.05);

  // adding the x axis and formatting it
  svgHeat.append('g')
    .style('font-size', 12)
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScaleHeat).tickSize(0))
    .select('.domain').remove();

  // creating a y scale 
  let yScaleHeat = d3.scaleBand()
    .range([height, 0])
    .padding(0.05);

  // adding a y axis 
  svgHeat.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScaleHeat))
    .select('.domain').remove();

  // color scale from: https://github.com/d3/d3-scale-chromatic
  let colors = d3.scaleSequential(d3.interpolateRdBu)
    .domain([12, -12]);

  // create a tooltip
  let tooltip = d3.select('#heat-holder')
    .append('div')
    .classed('tooltip', true);

  // updates the tooltip on mouse over
  let mouseover = function(_) {
    tooltip.style('opacity', 1);
    d3.select(this).style('stroke', 'black');
  };

  // updates the tooltip on mouse move
  let mousemove = function(event, d) {
    tooltip.html('The LFC of ' + d.y + ' on ' + d.x + ' is: ' + d.z.toFixed(2) + '<br>Click to remove this gene')
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY + 25) + 'px');
  };

  // updates the tooltip on mouse leave
  let mouseleave = function(_) {
    tooltip.style('opacity', 0);
    d3.select(this).style('stroke', 'none');
  };

  // creates a list of the current genes in the heatmap
  let genes = [];
  for(let i = 0; i < data.length; i++) {
    genes.push(data[i]['axolotl_gene']);
  };

  // on click function that removes a selected gene from the heatmap
  let click = function(d) {
    tooltip.style('opacity', 0);
    geneData = data[genes.indexOf(d.target.id)];
    currentData.splice(currentData.indexOf(geneData), 1);
    renderHeat(currentData);
  };
  
  // adding a x axis label
  svgHeat.append('text')
    .attr('x', (width) / 2)
    .attr('y', height + 35)
    .style('font-size', 16)
    .style('text-anchor', 'middle')
    .text('Days Since Amputation');

  // function that organizes the data by formatting the gene names and
  // performing a log 2 transformation of the gene expression values 
  function getDataHeat(data) {
    let xyz = [];
    let yGroups = [];
    for(let i = 0; i < data.length; i++) {
      gene = data[i];
      yGroups.push(gene['human_gene'] + '/' + gene['axolotl_gene']);
      for(let j = 0; j < xGroups.length; j++) {
        value = Math.log2(gene[xGroups[j]] / gene['D0']);
        xyz.push({x: xGroups[j], y: gene['human_gene'] + '/' + gene['axolotl_gene'], z: value});
      };
    };
    return [yGroups, xyz];
  };

  // creates the boxes in the heatmap and sets up the interactivity events
  renderHeat = function(data) {
    let [yGroups, newData] = getDataHeat(data);
    yScaleHeat.domain(yGroups);
    let newYAxis = d3.axisLeft(yScaleHeat);
    svgHeat.selectAll('.y.axis').remove();
    svgHeat.append('g')
      .attr('class', 'y axis')
      .style('font-size', 12)
      .call(newYAxis)
      .select('.domain').remove();
    svgHeat.selectAll('.heat').remove();
    svgHeat.selectAll('.heat').data(newData, function(d) {return d.x + ':' + d.y;})
      .enter()
      .append('rect')
        .attr('class', 'heat')
        .attr('id', function(d) {return d.y.split('/')[1];})
        .attr('x', function(d) {return xScaleHeat(parseFloat(d.x.substring(1)));})
        .attr('y', function(d) {return yScaleHeat(d.y);})
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('width', xScaleHeat.bandwidth() )
        .attr('height', yScaleHeat.bandwidth() )
        .style('fill', function(d) {return colors(d.z)})
        .style('stroke-width', 4)
        .style('stroke', 'none')
        .style('opacity', 1)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", click);
  };

  // returns the initial heatmap
  return heatmap;
};

// creates a blank heatmap with no data
heatmap.reset = function() {
  currentData = [];
  renderHeat(currentData);
};

// adds a new selected gene from the volcano plot if it is not included already
heatmap.updateSelection = function (selectedData) {
  if (!arguments.length) return;
  if (!currentData.includes(selectedData)) {
    currentData.push(selectedData);
    renderHeat(currentData);
  };
};
