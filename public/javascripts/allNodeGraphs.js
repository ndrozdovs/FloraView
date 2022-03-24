nodeConfigs = [];
nodeCharts = [];

var xMin = "0";
var xMax = "0";
var timeUnit = "0";
var updateVar;
var lastEntryTimestamp;

buttons = ["Temperature", "pH", "Light", "Moisture"];
colors = ["rgb(11, 245, 19)", "rgb(156, 75, 210)", "rgb(246, 168, 12)", "rgb(255, 99, 132)", "rgb(0,0,0)", "rgb(200, 75, 210)"];
minValue = [15, 4, 30, 50];
maxValue = [25, 10, 60, 100];
nodeElements = [];

async function getHubData(hubMacAddress) {
  const response = await fetch(
    "http://localhost:3000/hubs/hub?" +
      new URLSearchParams({
        hubMacAddress: hubMacAddress,
      })
  );
  const data = await response.json();

  return data;
}

async function getLatestHubData(hubMacAddress) {
  const response = await fetch(
    "http://localhost:3000/hubs/latestHubData?" +
      new URLSearchParams({
        hubMacAddress: hubMacAddress,
      })
  );
  const data = await response.json();

  return data;
}

function initAllGraphs(node) {
  let elementCounter = 0;
  nodeElements = [];
  nodeCharts = [];

  document.querySelector("#temperatureButton").addEventListener("click", displayData);
  document.querySelector("#pHButton").addEventListener("click", displayData);
  document.querySelector("#lightButton").addEventListener("click", displayData);
  document.querySelector("#moistureButton").addEventListener("click", displayData);

  const nodeHeader = document.querySelector("#nodeList");
  const sectionHeader = document.querySelector("#allGraphs");
  var child = sectionHeader.lastElementChild;
  while (child) {
    sectionHeader.removeChild(child);
    child = sectionHeader.lastElementChild;
  }

  var children = nodeHeader.children;
  for (var child of children) {
    if (child.id !== node.id) {
      nodeElements.push(child.id);
    }
  }

  initConfigs(nodeElements.length);

  for (var i = 0; i < Math.round(nodeElements.length / 2); i++) {
    const newRow = document.createElement("div");
    newRow.classList = "row no-gutters";

    for (var j = 0; j < 2; j++) {
      if (nodeElements.length === elementCounter) break;

      const newCol = document.createElement("div");
      const newGraph = document.createElement("canvas");

      newCol.classList = "col-xl-6 col-12 px-0 pt-4";
      newGraph.id = nodeElements[elementCounter++] + "Chart";

      newCol.appendChild(newGraph);
      newRow.appendChild(newCol);
    }

    sectionHeader.append(newRow);
  }

  for (var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].data.datasets[0].label = nodeElements[i].slice(0, 4) + " " + nodeElements[i].slice(4);
    nodeConfigs[i].data.datasets[0].backgroundColor = colors[i];
    nodeConfigs[i].data.datasets[0].borderColor = colors[i];
    nodeConfigs[i].data.datasets[0].data = [];

    nodeCharts.push(new Chart(document.getElementById(nodeElements[i] + "Chart"), nodeConfigs[i]));
  }
}

function initConfigs(numConifgs) {
  for (var i = 0; i < numConifgs; i++) {
    nodeConfigs.push({
      type: "line",
      data: {
        datasets: [
          {
            data: [],
          },
        ],
      },
      options: {
        scales: {
          x: {
            parsing: false,
            min: "2022-03-03 00:00:00",
            max: "2022-03-03 24:00:00",
            type: "time",
            time: {
              unit: "hour",
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}

function showAllGraphs(node) {
  document.querySelector("#individualGraphs").classList.add("removed");
  document.querySelector("#allGraphs").classList.remove("removed");
  document.querySelector("#allGraphButtons").classList.remove("hidden");
  displayData();
}

async function realtimeGraph(sensorIndex) {
  var sensorType;
  const hubMacAddress = document.querySelector("#firstHub").innerHTML;

  switch (sensorIndex) {
    case 0:
      sensorType = "temp";
      break;
    case 1:
      sensorType = "ph";
      break;
    case 2:
      sensorType = "light";
      break;
    case 3:
      sensorType = "moist";
      break;
  }

  for (var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].data.datasets[0].data = [];
  }

  await getHubData(hubMacAddress).then((response) => {
    for (var i = 0; i < nodeElements.length; i++) {
      for (var subData of response[i].data) {
        nodeConfigs[i].data.datasets[0].data.push({
          x: subData.timestamp,
          y: subData[sensorType],
        });

        lastEntryTimestamp = subData.timestamp;

        nodeCharts[i].update()
      }

      updateTimeframeRealtimeAll();

      if (typeof updateVar !== "undefined") {
        clearInterval(updateVar);
      }

      updateVar = setIntervalImmediately(updateDataRealtimeAll, 20000);
    }
  });

  highlightChoice(sensorIndex);
}

function setIntervalImmediately(func, interval) {
  func();
  return setInterval(func, interval);
}


function displayData() {
  let sensorIndex;

  if (this.name.length !== 0) {
    sensorIndex = parseInt(this.name);
  } else {
    sensorIndex = 0;
  }

  if (typeof updateVar !== "undefined") {
    clearInterval(updateVar);
  }
  realtimeGraph(sensorIndex);
}

function updateTimeScaleAll(start, end, fromCalendar) {
  if(start[0] == '1'){
    updateTimeframeRealtimeAll()
    return;
  }
  xMin = start;
  xMax = end;

  for (var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].options.scales.x.min = xMin;
    nodeConfigs[i].options.scales.x.max = xMax;

    if (fromCalendar) {
      if (start.substr(0, 10) !== end.substr(0, 10)) {
        nodeConfigs[i].options.scales.x.time.unit = "day";
      } else {
        nodeConfigs[i].options.scales.x.time.unit = "hour";
      }
    }

    nodeCharts[i].update();
  }
}

async function updateDataRealtimeAll(sensorType) {
  const hubMacAddress = document.querySelector("#firstHub").innerHTML;
  await getLatestHubData(hubMacAddress).then((response) => {
    if (response !== null) {
      for (var i = 0; i < nodeElements.length; i++) {
        data = response[i].data[0];
        if (data.timestamp != lastEntryTimestamp) {
          lastEntryTimestamp = data.timestamp;

          nodeConfigs[i].data.datasets[0].data.push({
            x: data.timestamp,
            y: data[sensorType],
          });

          nodeCharts[i].update();
        }
      }
    }
  });
}

async function updateTimeframeRealtimeAll() {
  if(document.querySelector("#allNodes").classList.contains("highlightButton")){
    const hubMacAddress = document.querySelector("#firstHub").innerHTML;
    await getLatestHubData(hubMacAddress).then((response) => {
      if (response !== null) {
        var latestDataDate = moment(data.timestamp.substr(0,10), "YYYY-MM-DD");
        $("#reportrange span").html(latestDataDate.format("MMMM D, YYYY") + " - " + latestDataDate.format("MMMM D, YYYY"));
        for (var i = 0; i < nodeElements.length; i++) {
          data = response[i].data[0];
          var start = data.timestamp;
          var end = data.timestamp;

          switch(end[14]){
            case "0": 
              start = start.replace(start.substr(14, 5), "00:00");
              end = start.replace(start.substr(14, 5), "10:00");
              break;
            case "1":
              start = start.replace(start.substr(14, 5), "10:00");
              end = start.replace(start.substr(14, 5), "20:00");
              break;
            case "2":
              start = start.replace(start.substr(14, 5), "20:00");
              end = start.replace(start.substr(14, 5), "30:00");
              break;
            case "3":
              start = start.replace(start.substr(14, 5), "30:00");
              end = start.replace(start.substr(14, 5), "40:00");
              break;
            case "4":
              start = start.replace(start.substr(14, 5), "40:00");
              end = start.replace(start.substr(14, 5), "50:00");
              break;
            case "5":
              start = start.replace(start.substr(14, 5), "50:00");
              var nextNum = parseInt(start.substr(11, 2)) + 1;
              if (nextNum > 9) {
                end = start.replace(start.substr(11, 8), `${nextNum}:00:00`);
              } else {
                end = start.replace(start.substr(11, 8), `0${nextNum}:00:00`);
              }
              break;
          }

          nodeConfigs[i].options.scales.x.min = start;
          nodeConfigs[i].options.scales.x.max = end;
          nodeConfigs[i].options.scales.x.time.unit = "minute";
          nodeCharts[i].update();
        }
      }
    });
  }
}

function highlightChoice(buttonNum) {
  const buttonList = document.querySelector("#allGraphButtons"); // Select nodes currently being shown
  var children = buttonList.children;

  for (let i = 0; i < 4; i++) {
    if (i == buttonNum) {
      children[i].classList.add("highlightChoice");
    } else {
      children[i].classList.remove("highlightChoice");
    }
  }
}
