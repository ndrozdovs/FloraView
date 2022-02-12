sensorConfigs = [];
sensorCharts = [];

var xMin = '0'
var xMax = '0'
var timeUnit = '0'

for(var i = 0; i < 4; i++) {
  sensorConfigs.push({
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

async function getAllData() {
  const response = await fetch("http://localhost:3000/classrooms");
  const data = await response.json();

  return data["classrooms"];
}

labels = ['Temperature', 'pH', 'Light', 'Moisture'];
colors = ['rgb(11, 245, 19)', 'rgb(156, 75, 210)', 'rgb(246, 168, 12)', 'rgb(255, 99, 132)']
chartElement = ['temperatureChart', 'phChart', 'lightChart', 'moistureChart']
minValue = [15, 4, 30, 50]
maxValue = [25, 10, 60, 100]

initGraphs();

function initGraphs() {
  for(var i = 0; i < 4; i++) {
    sensorConfigs[i].data.datasets[0].label = labels[i];
    sensorConfigs[i].data.datasets[0].backgroundColor = colors[i];
    sensorConfigs[i].data.datasets[0].borderColor = colors[i];
    sensorConfigs[i].data.datasets[0].data = [];

    sensorCharts.push(new Chart(document.getElementById(chartElement[i]), sensorConfigs[i]));
  }
}

async function realtimeGraphs(node) {
  document.querySelector('#individualGraphs').classList.remove('removed');
  document.querySelector('#allGraphs').classList.add('removed');
  document.querySelector('#allGraphButtons').classList.add('removed');

  var start = moment().subtract(0, 'days');
  today = start.format('YYYY-MM-DD').substr(8);
  todayNum = parseInt(today);

  for(var i = 0; i < 4; i++){
    sensorConfigs[i].data.datasets[0].data = [];
  }

  await getAllData()
  .then(data => {
    for(var subData of data) {
      sensorConfigs[0].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.temp
      })

      sensorConfigs[1].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.ph
      })

      sensorConfigs[2].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.light
      })

      sensorConfigs[3].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.moist
      })
    }

    for(var i = 0; i < 4; i++){
      sensorConfigs[i].options.scales.x.min = moment().subtract(0, 'days').format('YYYY-MM-DD') + ' 17:30:00'
      sensorConfigs[i].options.scales.x.max = moment().format('YYYY-MM-DD') + ' 18:00:00'
      sensorConfigs[i].options.scales.x.time.unit = 'minute'
      sensorCharts[i].update();
    }

    highlightNodes(node);
  });
}

function updateGraphs(node) {
  document.querySelector('#individualGraphs').classList.remove('removed');
  document.querySelector('#allGraphs').classList.add('removed');
  document.querySelector('#allGraphButtons').classList.add('removed');

  var start = moment().subtract(0, 'days');
  today = start.format('YYYY-MM-DD').substr(8);
  todayNum = parseInt(today);

  for(var i = 0; i < 4; i++) {
    sensorConfigs[i].data.datasets[0].data = [];

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
        sensorConfigs[i].data.datasets[0].data.push({
          x: `2022-01-${day} ${time}:00:00`,
          y: getRandomInt(minValue[i], maxValue[i])
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
        sensorConfigs[i].data.datasets[0].data.push({
          x: `2022-02-${day} ${time}:00:00`,
          y: getRandomInt(minValue[i], maxValue[i])
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
      sensorConfigs[i].data.datasets[0].data.push({
        x: `2022-02-${today} ${time}:00:00`,
        y: getRandomInt(minValue[i], maxValue[i])
      })
    }

    sensorCharts[i].update();
  }

  updateTimeScale(xMin, xMax, false);
  highlightNodes(node);
}

function updateTimeScale(start, end, fromCalendar) {
  xMin = start
  xMax = end

  for(var i = 0; i < 4; i++) {
    sensorConfigs[i].options.scales.x.min = xMin
    sensorConfigs[i].options.scales.x.max = xMax

    if(fromCalendar){
      if(start.substr(0, 10) !== end.substr(0, 10)) {
        sensorConfigs[i].options.scales.x.time.unit = 'day'
      }
      else {
        sensorConfigs[i].options.scales.x.time.unit = 'hour'
      }
    }

    sensorCharts[i].update();
  }
}