// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  d3.csv('data/LFC_transformed.csv').then(data => {

    let dispatch = d3.dispatch('dotToLine', 'dotToHeat');

    let dotVis = dotPlot(data)
      .selectionDispatcher(dispatch);
    let lineVis = lineChart(data);
    let heatVis = heatmap(data);
    dotVis.selectionDispatcher().on('dotToLine', lineVis.updateSelection);
    dotVis.selectionDispatcher().on('dotToHeat', heatVis.updateSelection);

    let axis = d3.scaleBand()
    .range([0, 700])
    .domain([0,1,2,4,7,10,20,26,28])
    .padding(-1);
    d3.select("#controls").append('g')
      .style('font-size', 12)
      .attr('transform', 'translate(10, 40)')
      .call(d3.axisTop(axis));

    let options = {0: 'img/allgenes.png', 1: 'img/cluster1.png', 2: 'img/cluster2.png', 3: 'img/cluster3.png', 4: 'img/cluster4.png', 5: 'img/cluster5.png', 6: 'img/cluster6.png'}
    
    let updateImage = function(option) {
      image = options[option];
      document.getElementById('expression').setAttribute('href', image);
    }

    d3.select("#categoryButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // update the expression trend image
      updateImage(selectedOption);
      // run the updateChart function with this selected option
      dotVis.filter(selectedOption);
    })
  });

})());