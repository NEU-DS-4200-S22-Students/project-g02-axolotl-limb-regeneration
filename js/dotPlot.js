// Pulling all data from the csv file
d3.csv('data/limb_regeneration.csv').then(dotPlot);

// Creating a function to create dot plot
function dotPlot(data) {
  // finding the minimum and maximum percent change values for axis formatting
  // let minChange = d3.min(data, function(d) {return d.percent_change; });
  let maxChange = d3.max(data, function(d) {return d.percent_change; });

  // console.log(minChange);
  // console.log(maxChange);

  // creating an svg group for all of the dot plot elements
  let chartGroup = svg
    .append('g')
      .attr('transform', 'translate(' + margin.left +', ' + margin.top + ')');

  // creating a scale for the x axis
  let xScale = d3.scaleLinear()
    .domain([-0.8, maxChange])
    .range([0, width - margin.left -margin.right]);

  // creating an x axis based on the xScale
  let xAxis = d3.axisBottom(xScale)
  chartGroup
    .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(30, 200)')
    .call(xAxis)

  // creating dots on the plot
  chartGroup 
    .selectAll('circle')
      .data(data)
    .enter()
    .append('circle')
      .attr('cx', d => xScale(d.percent_change))
      .attr('cy', function(d) {return 180 - ((d.key % 95) * 2) })
      .attr('r', 1);
}

let margin = {
    top: 60,
    left: 50,
    right: 30,
    bottom: 35
  },
  width = 1000,
  height = 1000;


let svg = d3.select('#vis-svg-1')
  .append('svg')
  .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
  .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
  .style('background-color', '#ccc') // change the background color to light gray
  .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))