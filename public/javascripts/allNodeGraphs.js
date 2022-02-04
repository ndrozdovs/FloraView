nodeConfigs = [];
nodeCharts = [];

buttons = ['Temperature', 'pH', 'Light', 'Moisture']
colors = ['rgb(11, 245, 19)', 'rgb(156, 75, 210)', 'rgb(246, 168, 12)', 'rgb(255, 99, 132)', 'rgb(0,0,0)', 'rgb(200, 75, 210)']
minValue = [15, 4, 30, 50]
maxValue = [25, 10, 60, 100]
nodeElements = []

function initAllGraphs(node) {
  let elementCounter = 0
  nodeElements = []
  nodeCharts = [];

  document.querySelector('#temperatureButton').addEventListener('click', function(){
    randomizeData(0)
  });
  document.querySelector('#pHButton').addEventListener('click', function(){
    randomizeData(1)
  });
  document.querySelector('#lightButton').addEventListener('click', function() {
    randomizeData(2)
  });
  document.querySelector('#moistureButton').addEventListener('click', function() {
    randomizeData(3)
  });

  const nodeHeader = document.querySelector('#nodeList');
  const sectionHeader = document.querySelector('#allGraphs');
  var child = sectionHeader.lastElementChild;
  while(child) {
    sectionHeader.removeChild(child);
    child = sectionHeader.lastElementChild;
  }

  var children = nodeHeader.children;
  for(var child of children) {
    if(child.id !== node.id) {
      nodeElements.push(child.id)
    }
  }

  initConfigs(nodeElements.length)

  for(var i = 0; i < Math.round(nodeElements.length / 2); i++) {
    const newRow = document.createElement("div");
    newRow.classList = "row no-gutters"

    for(var j = 0; j < 2; j++) {
      if(nodeElements.length === elementCounter) break;

      const newCol = document.createElement("div");
      const newGraph = document.createElement("canvas");

      newCol.classList = "col-6 px-0 pt-4"
      newGraph.id = nodeElements[elementCounter++] + 'Chart'

      newCol.appendChild(newGraph);
      newRow.appendChild(newCol);
    }

    sectionHeader.append(newRow);
  }

  for(var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].data.datasets[0].label = nodeElements[i].slice(0, 4) + " " + nodeElements[i].slice(4);
    nodeConfigs[i].data.datasets[0].backgroundColor = colors[i];
    nodeConfigs[i].data.datasets[0].borderColor = colors[i];
    nodeConfigs[i].data.datasets[0].data = [];

    nodeCharts.push(new Chart(document.getElementById(nodeElements[i] + 'Chart'), nodeConfigs[i]));
  }
}

function initConfigs(numConifgs) {
  for(var i = 0; i < numConifgs; i++) {
    nodeConfigs.push({
      type: 'line',
      data: {
        datasets: [
          {
            data: [],
        }]
      },
      options: {
        scales: {
          x: {
            parsing: false,
            min: '2022-02-03 00:00:00',
            max: '2022-02-03 24:00:00',
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
}

function showAllGraphs(node) {
  document.querySelector('#individualGraphs').classList.add('removed');
  document.querySelector('#allGraphs').classList.remove('removed');
  document.querySelector('#allGraphButtons').classList.remove('removed');
  highlightNodes(node);
  randomizeData(0);
}

function randomizeData(sensorIndex) {
  var start = moment().subtract(0, 'days');
  today = start.format('YYYY-MM-DD').substr(8);
  todayNum = parseInt(today);

  for(var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].data.datasets[0].data = [];

    for(var k = 1; k < 32; k++) {
      if(k < 10) {
        day = `0${k}`;
      }
      else {
        day = k;
      }

      for(var j = 0; j < 25; j++) {
        if(j < 10) {
          time = `0${j}`;
        }
        else {
          time = j
        }
        nodeConfigs[i].data.datasets[0].data.push({
          x: `2022-01-${day} ${time}:00:00`,
          y: getRandomInt(minValue[sensorIndex], maxValue[sensorIndex])
        })
      }
    }

    for(var k = 1; k < todayNum; k++) {
      if(k < 10) {
        day = `0${k}`;
      }
      else {
        day = k;
      }

      for(var j = 0; j < 25; j++) {
        if(j < 10) {
          time = `0${j}`;
        }
        else {
          time = j
        }
        nodeConfigs[i].data.datasets[0].data.push({
          x: `2022-02-${day} ${time}:00:00`,
          y: getRandomInt(minValue[sensorIndex], maxValue[sensorIndex])
        })
      }
    }

    for(var j = 0; j < 19; j++) {
      if(j < 10) {
        time = `0${j}`;
      }
      else {
        time = j
      }
      nodeConfigs[i].data.datasets[0].data.push({
        x: `2022-02-${today} ${time}:00:00`,
        y: getRandomInt(minValue[sensorIndex], maxValue[sensorIndex])
      })
    }

    nodeCharts[i].update();
  }

  highlightChoice(sensorIndex)
}

function updateTimeScaleAll(start, end) {
  for(var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].options.scales.x.min = start + ' 00:00:00'
    nodeConfigs[i].options.scales.x.max = end + ' 24:00:00'

    if(start !== end) {
      nodeConfigs[i].options.scales.x.time.unit = 'day'
    }
    else {
      nodeConfigs[i].options.scales.x.time.unit = 'hour'
    }

    nodeCharts[i].update();
  }
}

function highlightChoice(buttonNum) {
  const buttonList = document.querySelector('#allGraphButtons'); // Select nodes currently being shown
  var children = buttonList.children;

  for(let i = 0; i < 4; i++) {
    if(i == buttonNum){
      children[i].classList.add('highlightChoice');
    }
    else{
      children[i].classList.remove('highlightChoice');
    }
  }
}