nodeConfigs = [];
nodeCharts = [];

var currentSensor;
var rawDataAll;
var numDaysAll;
var displayCurrentDataAll = true;
var xMin = "0";
var xMax = "0";

socket.on("newDataAll", (data) => {
  // rawDataAll is undefined, exiting
  if (typeof rawDataAll === "undefined") {
    return;
  }

  // Not our Hub, exiting
  if (document.querySelector("#firstHub").innerHTML !== data.hubMacAddress) {
    return;
  }

  for (let i = 0; i < rawDataAll.length; i++) {
    if (rawDataAll[i].macAddress === data.nodeMacAddress) {
      rawDataAll[i].data.push({
        temp: data.temp,
        ph: data.ph,
        light: data.light,
        moist: data.moist,
        timestamp: data.timestamp,
      });

      updateDataRealtimeAll(data, i);
      updateTimeframeRealtimeAll(data, i);
    }
  }
});

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

buttons = ["Temperature", "pH", "Light", "Moisture"];
colors = ["rgb(11, 245, 19)", "rgb(156, 75, 210)", "rgb(246, 168, 12)", "rgb(255, 99, 132)", "rgb(0,0,0)", "rgb(200, 75, 210)"];
minValue = [15, 4, 30, 50];
maxValue = [25, 10, 60, 100];
nodeElements = [];

async function getHubData(hubMacAddress) {
  const response = await fetch(
    "https://flora-view.herokuapp.com/hubs/hub?" +
      new URLSearchParams({
        hubMacAddress: hubMacAddress,
      })
  );
  const data = await response.json();

  const nodeHeader = document.querySelector("#nodeList"); // Select node list in the modal
  var nodesInGroup = [];
  var children = nodeHeader.children;
  for (var i = 0; i < children.length; i++) {
    if (children[i].id !== "allNodes") {
      nodesInGroup.push(children[i].title);
    }
  }

  rawDataAll = [];
  var index = 0;
  for (i = 0; i < data.length; i++) {
    if (nodesInGroup.includes(data[i].nodeMacAddress)) {
      rawDataAll[index] = { macAddress: data[i].nodeMacAddress, data: [...data[i].data] };
      index++;
    }
  }

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

  getHubData(document.querySelector("#firstHub").innerHTML);
}

function showAllGraphs() {
  document.querySelector("#individualGraphs").classList.add("removed");
  document.querySelector("#allGraphs").classList.remove("removed");
  document.querySelector("#allGraphButtons").classList.remove("removed");
  displayData();
}

async function realtimeGraph(sensorIndex) {
  switch (sensorIndex) {
    case 0:
      currentSensor = "temp";
      break;
    case 1:
      currentSensor = "ph";
      break;
    case 2:
      currentSensor = "light";
      break;
    case 3:
      currentSensor = "moist";
      break;
  }

  for (var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].data.datasets[0].data = [];
  }

  for (var i = 0; i < nodeElements.length; i++) {
    for (var subData of rawDataAll[i]["data"]) {
      nodeConfigs[i].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData[currentSensor],
      });
    }
    nodeCharts[i].update();

    updateTimeframeRealtimeAll({ timestamp: rawDataAll[i].data[rawDataAll[i].data.length - 1]["timestamp"] }, i);
  }

  if (!displayCurrentDataAll) {
    averageOutDataAll();
  }

  highlightChoice(sensorIndex);
}

function displayData() {
  let sensorIndex;

  if (this.name.length !== 0) {
    sensorIndex = parseInt(this.name);
  } else {
    sensorIndex = 0;
  }

  realtimeGraph(sensorIndex);
}

function updateTimeScaleAll(start, end, fromCalendar) {
  // Populate with Raw Data
  for (var i = 0; i < nodeElements.length; i++) {
    nodeConfigs[i].data.datasets[0].data = [];
  }
  for (var i = 0; i < nodeElements.length; i++) {
    for (var subData of rawDataAll[i]["data"]) {
      nodeConfigs[i].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData[currentSensor],
      });
    }
    nodeCharts[i].update();
  }

  if (start[0] == "1") {
    for (var i = 0; i < nodeElements.length; i++) {
      displayCurrentDataAll = true;
      updateTimeframeRealtimeAll({ timestamp: rawDataAll[i].data[rawDataAll[i].data.length - 1]["timestamp"] }, i);
    }
    return;
  }
  displayCurrentDataAll = false;
  xMin = start;
  xMax = end;
  var a = moment(end.substr(0, 10), "YYYY-MM-DD");
  var b = moment(start.substr(0, 10), "YYYY-MM-DD");
  numDaysAll = a.diff(b, "days") + 1;
  averageOutDataAll();

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

function averageOutDataAll() {
  let latestData;
  let currentDataSum = 0;
  let currentDataCount = 0;
  let averageData = [];

  for (var i = 0; i < nodeElements.length; i++) {
    averageData = [];
    currentDataSum = 0;
    currentDataCount = 0;
    latestData = nodeConfigs[i].data.datasets[0].data.shift();
    var latestDataTime = parseInt(latestData["x"].substr(11, 2)) + Math.round(numDaysAll / 2) - 1;
    var latestDay = latestData["x"].substr(0, 10);
    var time;
    let currentData;
    let dataRightBeforeCurrent = latestData;
    currentDataSum += parseInt(latestData["y"]);
    currentDataCount++;

    while (nodeConfigs[i].data.datasets[0].data.length !== 0) {
      currentData = nodeConfigs[i].data.datasets[0].data.shift();
      let currentDataTime = parseInt(currentData["x"].substr(11, 2));
      let currentDay = currentData["x"].substr(0, 10);

      if (latestDay !== currentDay) {
        averageData.push({
          x: dataRightBeforeCurrent["x"].replace(dataRightBeforeCurrent["x"].substr(17, 2), "00"),
          y: String(currentDataSum / currentDataCount),
        });
        currentDataSum = 0;
        currentDataCount = 0;
        latestData = currentData;
        latestDataTime = parseInt(latestData["x"].substr(11, 2)) + Math.round(numDaysAll / 2) - 1;
        latestDay = latestData["x"].substr(0, 10);
      } else if (latestDataTime >= currentDataTime) {
        currentDataSum += parseInt(latestData["y"]);
        currentDataCount++;
      } else {
        time = moment(dataRightBeforeCurrent["x"], "YYYY-MM-DD HH:mm:ss").add(1, "hour").format("YYYY-MM-DD HH:mm:ss");
        averageData.push({
          x: time.replace(time.substr(14, 5), "00:00"),
          y: String(currentDataSum / currentDataCount),
        });
        currentDataSum = 0;
        currentDataCount = 0;
        latestData = currentData;
        latestDataTime = parseInt(latestData["x"].substr(11, 2)) + Math.round(numDaysAll / 2) - 1;
        latestDay = latestData["x"].substr(0, 10);
      }

      dataRightBeforeCurrent = currentData;
    }

    averageData.push({
      x: dataRightBeforeCurrent["x"].replace(dataRightBeforeCurrent["x"].substr(17, 2), "00"),
      y: String(currentDataSum / currentDataCount),
    });
    nodeConfigs[i].data.datasets[0].data = averageData;

    nodeCharts[i].update();
  }
}

function updateDataRealtimeAll(data, index) {
  if (displayCurrentDataAll) {
    nodeConfigs[index].data.datasets[0].data.push({
      x: data.timestamp,
      y: data[currentSensor],
    });

    nodeCharts[index].update();
  }
}

function updateTimeframeRealtimeAll(data, index) {
  if (document.querySelector("#allNodes").classList.contains("highlightButton") && displayCurrentDataAll) {
    var latestDataDate = moment(data.timestamp.substr(0, 10), "YYYY-MM-DD");
    $("#reportrange span").html(latestDataDate.format("MMMM D, YYYY") + " - " + latestDataDate.format("MMMM D, YYYY"));
    var start = data.timestamp;
    var end = data.timestamp;

    switch (end[14]) {
      case "0":
        if (end[15] < "5") {
          start = start.replace(start.substr(14, 5), "00:00");
          end = start.replace(start.substr(14, 5), "05:00");
        } else {
          start = start.replace(start.substr(14, 5), "05:00");
          end = start.replace(start.substr(14, 5), "10:00");
        }
        break;
      case "1":
        if (end[15] < "5") {
          start = start.replace(start.substr(14, 5), "10:00");
          end = start.replace(start.substr(14, 5), "15:00");
        } else {
          start = start.replace(start.substr(14, 5), "15:00");
          end = start.replace(start.substr(14, 5), "20:00");
        }
        break;
      case "2":
        if (end[15] < "5") {
          start = start.replace(start.substr(14, 5), "20:00");
          end = start.replace(start.substr(14, 5), "25:00");
        } else {
          start = start.replace(start.substr(14, 5), "25:00");
          end = start.replace(start.substr(14, 5), "30:00");
        }
        break;
      case "3":
        if (end[15] < "5") {
          start = start.replace(start.substr(14, 5), "30:00");
          end = start.replace(start.substr(14, 5), "35:00");
        } else {
          start = start.replace(start.substr(14, 5), "35:00");
          end = start.replace(start.substr(14, 5), "40:00");
        }
        break;
      case "4":
        if (end[15] < "5") {
          start = start.replace(start.substr(14, 5), "40:00");
          end = start.replace(start.substr(14, 5), "45:00");
        } else {
          start = start.replace(start.substr(14, 5), "45:00");
          end = start.replace(start.substr(14, 5), "50:00");
        }
        break;
      case "5":
        if (end[15] < "5") {
          start = start.replace(start.substr(14, 5), "50:00");
          end = start.replace(start.substr(14, 5), "55:00");
        } else {
          start = start.replace(start.substr(14, 5), "55:00");
          var nextNum = parseInt(start.substr(11, 2)) + 1;
          if (nextNum > 9) {
            end = start.replace(start.substr(11, 8), `${nextNum}:00:00`);
          } else {
            end = start.replace(start.substr(11, 8), `0${nextNum}:00:00`);
          }
        }
        break;
    }

    nodeConfigs[index].options.scales.x.min = start;
    nodeConfigs[index].options.scales.x.max = end;
    nodeConfigs[index].options.scales.x.time.unit = "minute";
    nodeCharts[index].update();
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
