((() => {

  // calling in data and passing it to the charts
  d3.csv('data/LFC_transformed.csv').then(data => {

    // defining dispatch events to transition from the volcano plot
    let dispatch = d3.dispatch('dotToLine', 'dotToHeat');

    // defining visualizations and adding their dispatch events
    let dotVis = dotPlot(data).selectionDispatcher(dispatch);
    let lineVis = lineChart(data);
    let heatVis = heatmap(data);
    dotVis.selectionDispatcher().on('dotToLine', lineVis.updateSelection);
    dotVis.selectionDispatcher().on('dotToHeat', heatVis.updateSelection);

    // defining an axis for the expression trend
    let axis = d3.scaleBand()
      .range([0, 700])
      .domain([0,1,2,4,7,10,20,26,28])
      .padding(-1);
  
    // adds the axis to the expression trend
    d3.select('#trend').append('g')
      .style('font-size', 12)
      .attr('transform', 'translate(10, 40)')
      .call(d3.axisTop(axis));

    // the avaiable images of the cluster trends
    let options = {0: 'img/allgenes.png', 1: 'img/cluster1.png', 2: 'img/cluster2.png', 3: 'img/cluster3.png', 4: 'img/cluster4.png', 5: 'img/cluster5.png', 6: 'img/cluster6.png'};
    
    // displays the trend image corresponding to the selected cluster
    let updateImage = function(option) {
      image = options[option];
      document.getElementById('expression').setAttribute('href', image);
    };

    // defines the event handler for cluster category selection
    d3.select('#categoryButton').on('change', function(d) {
      // recover the option that has been chosen
      let selectedOption = d3.select(this).property('value');
      // update the expression trend image
      updateImage(selectedOption);
      // run the updateChart function with this selected option
      dotVis.filter(selectedOption);
    });

    // creates a lists of the axolotl gene names to be used for the search feature
    let genes = [];
    for(i = 0; i < data.length; i++) {
      genes.push(data[i]['axolotl_gene']);
    };

    // defines the event handler for user gene search
    d3.select('#axolotlselect').on('click', function() {
      geneName = document.getElementById('axolotlsearch').value.toLowerCase();
      // searched gene is a valid gene
      if (genes.includes(geneName)) {
        document.getElementById('searchmessage').innerText = '';
        geneData = data[genes.indexOf(geneName)];
        dotVis.select(geneData);
      }
      // searcged gene is not a valid gene
      else {
        document.getElementById('searchmessage').innerText = '\u2003No gene with this name';
      };
    });

    // defines the event handler for heatmap reset button
    d3.select('#reset-heat').on('click', function() {
      heatVis.reset();
    });
  });
})());