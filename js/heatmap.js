// Pulling all data from the csv file
d3.csv('data/modified_pc.csv').then(heatmap);

// Based on Mike Bostock's margin convention
// https://bl.ocks.org/mbostock/3019563
let margin = {
top: 60,
left: 50,
right: 30,
bottom: 20
  },
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// function that creates the heatmap 
function heatmap(data) {
// creating an svg group for all of the heatmap elements
  let chartGroup = svg
    .append('g')
      .attr('transform', 'translate(' + margin.left +', ' + margin.top + ')');

// labels for the x-axis 
let xLabels = ['D0', 'D0.5', 'D1', 'D1.5', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28']; 

let x = d3.scaleBand()
  .range([0, width])
  .domain(xLabels);

chartGroup.append('g')
    .attr('transform', 'translate(0, ' + height)
    .call(d3.axisBottom(x));


let y = d3.scaleBand()
    .range([height, 0])
    .domain(data); 

chartGroup.append('g')
    .attr('transform', 'translate('+ height +', 0)')
    .call(d3.axisLeft(y));

// color scale from: https://github.com/d3/d3-scale-chromatic
let colors = d3.scaleSequential(d3.interpolateBrBG)
    .domain([-1, 1]);

// used https://d3-graph-gallery.com/graph/heatmap_style.html as reference
chartGroup.selectAll('rectangle')
        .data(data, function(d) {return d.xLabels + ':' + d.percent_change})
    .enter()
    .append('rectangle')
    .attr('x', function(d) {return x(d.xLabels)})
    .attr('y', function(d) {return y(d.percent_change)})
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', function(d){return colors(d.percent_change)});





}
