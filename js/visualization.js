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

    let options = {0: 'img/allgenes.png', 1: 'img/cluster1.png', 2: 'img/cluster2.png', 3: 'img/cluster3.png', 4: 'img/cluster4.png', 5: 'img/cluster5.png', 6: 'img/cluster6.png'}
    
    let updateImage = function(option) {
      image = options[option];
      console.log(image);
      document.getElementById('expression').src = image;
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