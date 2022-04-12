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
  });

})());