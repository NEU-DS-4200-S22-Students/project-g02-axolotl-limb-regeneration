// Pulling all data from the csv file
//d3.csv('data/modified_pc.csv').then(lineChart);

key = "1";
let line;
function lineChart(data) {

	// creating a list to hold the average values for each day
  let xLabels = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
	'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'];

  let values = [3, 4, 6, 8, 9, 3, 6, 8, 0, 4, 2, 5, 7, 9, 6, 7, 8, 5];
	var xy = []; // start empty, add each element one at a time
for(var i = 0; i < xLabels.length; i++ ) {
   xy.push({x: xLabels[i], y: data[xLabels[i]]});
}

  // function getValues(data, key) {
	// 	// adding the values at a given key
	// 	values.push(data[key].D0)
	// 	values.push(data[key].D1)
	// 	values.push(data[key].D2)
	// 	values.push(data[key].D3)
	// 	values.push(data[key].D4)
	// 	values.push(data[key].D5)
	// 	values.push(data[key].D7)
	// 	values.push(data[key].D9)
	// 	values.push(data[key].D10)
	// 	values.push(data[key].D12)
	// 	values.push(data[key].D14)
	// 	values.push(data[key].D16)
	// 	values.push(data[key].D18)
	// 	values.push(data[key].D20)
	// 	values.push(data[key].D22)
	// 	values.push(data[key].D24)
	// 	values.push(data[key].D26)
	// 	values.push(data[key].D28)
	// }

	// console.log(values);

	// creating an array of the day column names
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

   // creating an svg group to hold the chart elements
   let chartGroup = svg
   	.append('g')
   		.attr('transform', 'translate(' + margin.left +', ' + height/3 + margin.top + ')');

   // creating a scale for the x axis
   let xScale = d3.scaleBand()
   	.domain(xLabels)
   	.range([0, (width - margin.left - margin.right)*2/3])
   	.padding(0.5);
 
   // drawing x axis
   let xAxis = d3.axisBottom(xScale)
   chartGroup
   	.append('g')
   		.attr('transform', 'translate(0,' + (height/3) + ')')
   	.call(xAxis)

   // creating a y scale
   let yScale = d3.scaleLinear()
   	.domain([d3.min(values), 1000])
   	.range([height/3, 0]);

   // drawing y axis
   let yAxis = chartGroup.append('g')
   	.call(d3.axisLeft(yScale));

    let slice = d3.line()
      .x(function(d){return xScale(d.x);})
      .y(function(d){return yScale(d.y);});
    
    line = chartGroup.append('path')
      .attr('class', 'line')
      .attr('d', slice(xy))
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('stroke-width', 2);
    /*
   // Add the line
   let line = chartGroup
   	.append('path')
     .data(values)
      .attr('stroke', 'black')
   		.attr('d', d3.line()
   			.x(function(d, i) {
           return xScale(values[i])
         })
   			.y(function(d, i) {
           return yScale(values[i])
         }));
*/
   	// creating an instace of a funciton call
	// return getValues(data, 1156);
 // return chart;
  //}
  /*
  // Given selected data from another visualization 
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;
      key = selectedData;
      //lineChart();
  };*/
  //return chart;
  return lineChart;
}
lineChart.updateSelection = function (selectedData) {
  if (!arguments.length) return;
    key = selectedData;
    console.log(key);
    line.style('stroke', null);
    let xLabels = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D7', 'D9', 'D10', 
	'D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26', 'D28'];

    lineChart(selectedData);
};




