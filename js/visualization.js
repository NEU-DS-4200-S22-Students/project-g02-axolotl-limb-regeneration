// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  d3.csv('data/limb_regeneration.csv').then(data => {

    let dispatch = d3.dispatch('dotToLine');

    let dotVis = dotPlot(data)
      .selectionDispatcher(dispatch);
    let lineVis = lineChart(data['1']);

    dotVis.selectionDispatcher().on('dotToLine', lineVis.updateSelection);
  });

})());