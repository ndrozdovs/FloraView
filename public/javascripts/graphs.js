configs = [];
charts = [];

for(var i = 0; i < 4; i++){
  configs.push({
    type: 'line',
    data:{
      datasets: [{
        data: [],
      }]
    },
    options: {
      scales: {
        x: {
          parsing: false,
          min: '2022-02-01 00:00:00',
          max: '2022-02-01 24:00:00',
          type: 'time',
          time: {
            unit: 'hour'
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

charts = [];

labels = ['Temperature', 'pH', 'Light', 'Moisture'];
colors = ['rgb(11, 245, 19)', 'rgb(156, 75, 210)', 'rgb(246, 168, 12)', 'rgb(255, 99, 132)']
chartElement = ['temperatureChart', 'phChart', 'lightChart', 'moistureChart']
minValue = [15, 4 , 30, 50]
maxValue = [25, 10, 60, 100]

initGraphs();

function initGraphs(){
  for(var i = 0; i < 4; i++){
    configs[i].data.datasets[0].label = labels[i];
    configs[i].data.datasets[0].backgroundColor = colors[i];
    configs[i].data.datasets[0].borderColor = colors[i];
    configs[i].data.datasets[0].data = [];

    charts.push(new Chart(document.getElementById(chartElement[i]), configs[i]));
  }
}

function updateGraphs(node){
  for(var i = 0; i < 4; i++){
    configs[i].data.datasets[0].data = [];
  
    for(var k = 1; k < 32; k++){
      if(k < 10){
        day = `0${k}`;
      }
      else{
        day = k;
      }

      for(var j = 0; j < 25; j++){
        if(j < 10){
          time = `0${j}`;
        }
        else{
          time = j
        }
        configs[i].data.datasets[0].data.push({x: `2022-01-${day} ${time}:00:00`, y: getRandomInt(minValue[i], maxValue[i])})
      }
    }

    for(var j = 0; j < 19; j++){
      if(j < 10){
        time = `0${j}`;
      }
      else{
        time = j
      }
      configs[i].data.datasets[0].data.push({x: `2022-02-01 ${time}:00:00`, y: getRandomInt(minValue[i], maxValue[i])})
    }

    charts[i].update();
  }

  const nodeList = document.querySelector('#nodeList'); // Select nodes currently being shown
  var children = nodeList.children;

  for(const key of children){
    if(node.id === key.id){
      document.querySelector('#' + key.id).classList.add('highlightButton');
    }
    else{
      document.querySelector('#' + key.id).classList.remove('highlightButton');
    }
  }
}

function updateTimeScale(start, end){
  for(var i = 0; i < 4; i++){
    configs[i].options.scales.x.min = start + ' 00:00:00'
    configs[i].options.scales.x.max = end + ' 24:00:00'

    if(start !== end){
      configs[i].options.scales.x.time.unit = 'day'
    }
    else{
      configs[i].options.scales.x.time.unit = 'hour'
    }

    charts[i].update();
  }
}
