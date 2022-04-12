// Based on Mike Bostock's margin convention
// https://bl.ocks.org/mbostock/3019563
let xGroups = ['D0.5', 'D1', 'D1.5', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
    'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'],
    xValues = [0.5, 1, 1.5, 2, 3, 4, 5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
    yScaleHeat, svgHeat, xScaleHeat, colors,
    currentData = [],
    mouseover, mousemove, mouseleave;

// function that creates the heatmap 
function heatmap(data) {
  let margin = {top: 0, left: 75, right: 30, bottom: 40},
  width = 600;
  height = 400;

  svgHeat = d3.select('#heat')
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  xScaleHeat = d3.scaleBand()
    .range([0, width])
    .domain(xValues)
    .padding(0.05);
  let xAxis = svgHeat.append('g')
    .style('font-size', 15)
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScaleHeat).tickSize(0))
    .select('.domain').remove();

  yScaleHeat = d3.scaleBand()
    .range([height, 0])
    .padding(0.05);
  let yAxis = svgHeat.append('g')
    .attr('class', 'y axis')
    .style('font-size', 15)
    .call(d3.axisLeft(yScaleHeat))
    .select('.domain').remove();

  // color scale from: https://github.com/d3/d3-scale-chromatic
  colors = d3.scaleSequential(d3.interpolateRdBu)
    .domain([-8, 8]);

  // create a tooltip
  var tooltip = d3.select('#heat')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px')

  // Three function that change the tooltip when user hover / move / leave a cell
  mouseover = function(d) {
    tooltip.style('opacity', 1)
    d3.select(this)
      .style('stroke', 'black')
      .style('opacity', 1)
  }
  mousemove = function(event, d) {
    tooltip.html('The LFC of ' + d.y + ' on ' + d.x + ' is: ' + d.z)
      .style('left', (event.pageX) + 'px')
      .style('top', (event.pageY) + 'px');
  }
  mouseleave = function(d) {
    tooltip.style('opacity', 0)
    d3.select(this)
      .style('stroke', 'none')
      .style('opacity', 0.8)
  }
  
  return heatmap;
};
function getDataHeat(data) {
  var xyz = [];
  var yGroups = [];
  for(var i = 0; i < data.length; i++) {
    gene = data[i]
    yGroups.push(gene['human_gene'])
    for(var j = 0; j < xGroups.length; j++) {
      value = Math.log2(gene[xGroups[j]] / gene['D0'])
      xyz.push({x: xGroups[j], y: gene['human_gene'], z: value});
    }
  }
  return [yGroups, xyz];
};

function renderHeat(data) {
  var [yGroups, newData] = getDataHeat(data);
  yScaleHeat.domain(yGroups);
  var newYAxis = d3.axisLeft(yScaleHeat);
  svgHeat.selectAll('.y.axis').remove();
  svgHeat.append('g').attr('class', 'y axis').call(newYAxis);
  //svgHeat.selectAll('.y.axis').transition().duration(1500).call(newYAxis);
  svgHeat.selectAll('.heat').remove();
  var genes = svgHeat.selectAll('.heat').data(newData, function(d) {return d.x + ':' + d.y;}).attr('class', 'heat');
  genes.enter()
    .append('rect')
      //.transition().duration(1500)
      .attr('class', 'heat')
      .attr('x', function(d) {return xScaleHeat(parseFloat(d.x.substring(1)));})
      .attr('y', function(d) {return yScaleHeat(d.y);})
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', xScaleHeat.bandwidth() )
      .attr('height', yScaleHeat.bandwidth() )
      .style('fill', function(d) {return colors(d.z)})
      .style('stroke-width', 4)
      .style('stroke', 'none')
      .style('opacity', 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
};

heatmap.updateSelection = function (selectedData) {
  if (!arguments.length) return;
    currentData.push(selectedData);
    renderHeat(currentData);
};
