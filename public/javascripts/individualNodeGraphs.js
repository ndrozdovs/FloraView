sensorConfigs = [];
sensorCharts = [];

var rawData;
var numDaysIndiv;
var displayCurrentData = true;
var xMin = "0";
var xMax = "0";

const socket = io("https://www.floraview.ca");
socket.on("connection");

socket.on("newData", (data) => {
  console.log("RECEIVED NEW DATA: ", data.nodeMacAddress)
  // rawData is undefined, exiting
  if (typeof rawData === "undefined") {
    return;
  }

  if (getCurrentNode() === data.nodeMacAddress) {
    rawData[0].push({
      x: data.timestamp,
      y: data.temp,
    });

    rawData[1].push({
      x: data.timestamp,
      y: data.ph,
    });

    rawData[2].push({
      x: data.timestamp,
      y: data.light,
    });

    rawData[3].push({
      x: data.timestamp,
      y: data.moist,
    });

    updateDataRealtime(data);
    updateTimeframeRealtime(data);
  }
});

for (var i = 0; i < 4; i++) {
  sensorConfigs.push({
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
          min: "2022-02-01 00:00:00",
          max: "2022-02-01 24:00:00",
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

async function getNodeData(nodeMacAddress) {
  const response = await fetch(
    "https://www.floraview.ca/hubs?" +
      new URLSearchParams({
        nodeMacAddress: nodeMacAddress,
      })
  );
  const data = await response.json();

  return data;
}

labels = ["Temperature", "pH", "Light", "Moisture"];
colors = ["rgb(11, 245, 19)", "rgb(156, 75, 210)", "rgb(246, 168, 12)", "rgb(255, 99, 132)"];
chartElement = ["temperatureChart", "phChart", "lightChart", "moistureChart"];
minValue = [15, 4, 30, 50];
maxValue = [25, 10, 60, 100];

initGraphs();

function initGraphs() {
  for (var i = 0; i < 4; i++) {
    sensorConfigs[i].data.datasets[0].label = labels[i];
    sensorConfigs[i].data.datasets[0].backgroundColor = colors[i];
    sensorConfigs[i].data.datasets[0].borderColor = colors[i];
    sensorConfigs[i].data.datasets[0].data = [];

    sensorCharts.push(new Chart(document.getElementById(chartElement[i]), sensorConfigs[i]));
  }
}

async function realtimeGraphs() {
  document.querySelector("#individualGraphs").classList.remove("removed");
  document.querySelector("#allGraphs").classList.add("removed");
  document.querySelector("#allGraphButtons").classList.add("removed");

  for (var i = 0; i < 4; i++) {
    sensorConfigs[i].data.datasets[0].data = [];
  }

  rawData = [[], [], [], []];

  await getNodeData(getCurrentNode()).then((response) => {
    for (var subData of response.data) {
      sensorConfigs[0].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.temp,
      });

      sensorConfigs[1].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.ph,
      });

      sensorConfigs[2].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.light,
      });

      sensorConfigs[3].data.datasets[0].data.push({
        x: subData.timestamp,
        y: subData.moist,
      });
    }

    for (var i = 0; i < 4; i++) {
      rawData[i] = [...sensorConfigs[i].data.datasets[0].data];
      sensorCharts[i].update();
    }

    updateTimeframeRealtime({ timestamp: rawData[0][rawData[0].length - 1]["x"] });
    if (!displayCurrentData) {
      averageOutData();
    }
  });
}

function updateTimeScale(start, end, fromCalendar) {
  for (var i = 0; i < 4; i++) {
    sensorConfigs[i].data.datasets[0].data = [];
  }
  // Populate with Raw Data
  for (var i = 0; i < 4; i++) {
    sensorConfigs[i].data.datasets[0].data = [...rawData[i]];
    sensorCharts[i].update();
  }

  if (start[0] == "1") {
    displayCurrentData = true;
    updateTimeframeRealtime({ timestamp: rawData[0][rawData[0].length - 1]["x"] });
    return;
  }
  displayCurrentData = false;
  xMin = start;
  xMax = end;
  var a = moment(end.substr(0, 10), "YYYY-MM-DD");
  var b = moment(start.substr(0, 10), "YYYY-MM-DD");
  numDaysIndiv = a.diff(b, "days") + 1;
  averageOutData();

  for (var i = 0; i < 4; i++) {
    sensorConfigs[i].options.scales.x.min = xMin;
    sensorConfigs[i].options.scales.x.max = xMax;

    if (fromCalendar) {
      if (start.substr(0, 10) !== end.substr(0, 10)) {
        sensorConfigs[i].options.scales.x.time.unit = "day";
      } else {
        sensorConfigs[i].options.scales.x.time.unit = "hour";
      }
    }

    sensorCharts[i].update();
  }
}

function averageOutData() {
  let latestData;
  let currentDataSum = 0;
  let currentDataCount = 0;
  let averageData = [];

  for (var i = 0; i < 4; i++) {
    averageData = [];
    currentDataSum = 0;
    currentDataCount = 0;
    latestData = sensorConfigs[i].data.datasets[0].data.shift();
    var latestDataTime = parseInt(latestData["x"].substr(11, 2)) + Math.round(numDaysIndiv / 2) - 1;
    var latestDay = latestData["x"].substr(0, 10);
    var time;
    let currentData;
    let dataRightBeforeCurrent = latestData;
    currentDataSum += parseInt(latestData["y"]);
    currentDataCount++;

    while (sensorConfigs[i].data.datasets[0].data.length !== 0) {
      currentData = sensorConfigs[i].data.datasets[0].data.shift();
      let currentDataTime = parseInt(currentData["x"].substr(11, 2));
      let currentDay = currentData["x"].substr(0, 10);

      if (latestDay !== currentDay) {
        var newString = dataRightBeforeCurrent["x"].substr(0, 17) + "00"
        averageData.push({
          x: newString,
          y: String(currentDataSum / currentDataCount),
        });
        currentDataSum = 0;
        currentDataCount = 0;
        latestData = currentData;
        latestDataTime = parseInt(latestData["x"].substr(11, 2)) + Math.round(numDaysIndiv / 2) - 1;
        latestDay = latestData["x"].substr(0, 10);
      } else if (latestDataTime >= currentDataTime) {
        currentDataSum += parseInt(latestData["y"]);
        currentDataCount++;
      } else {
        time = moment(dataRightBeforeCurrent["x"], "YYYY-MM-DD HH:mm:ss").add(1, "hour").format("YYYY-MM-DD HH:mm:ss");
        time = time.substr(0, 14) + "00:00"
        averageData.push({
          x: time,
          y: String(currentDataSum / currentDataCount),
        });
        currentDataSum = 0;
        currentDataCount = 0;
        latestData = currentData;
        latestDataTime = parseInt(latestData["x"].substr(11, 2)) + Math.round(numDaysIndiv / 2) - 1;
        latestDay = latestData["x"].substr(0, 10);
      }

      dataRightBeforeCurrent = currentData;
    }

    var newString = dataRightBeforeCurrent["x"].substr(0, 17) + "00"
    averageData.push({
      x: newString,
      y: String(currentDataSum / currentDataCount),
    });
    sensorConfigs[i].data.datasets[0].data = averageData;

    sensorCharts[i].update();
  }
}

async function updateDataRealtime(data) {
  if (displayCurrentData) {
    sensorConfigs[0].data.datasets[0].data.push({
      x: data.timestamp,
      y: data.temp,
    });

    sensorConfigs[1].data.datasets[0].data.push({
      x: data.timestamp,
      y: data.ph,
    });

    sensorConfigs[2].data.datasets[0].data.push({
      x: data.timestamp,
      y: data.light,
    });

    sensorConfigs[3].data.datasets[0].data.push({
      x: data.timestamp,
      y: data.moist,
    });

    for (var i = 0; i < 4; i++) {
      sensorCharts[i].update();
    }
  }
}

async function updateTimeframeRealtime(data) {
  if (!document.querySelector("#allNodes").classList.contains("highlightButton") && displayCurrentData) {
    var start = data.timestamp;
    var end = data.timestamp;
    var latestDataDate = moment(data.timestamp.substr(0, 10), "YYYY-MM-DD");
    $("#reportrange span").html(latestDataDate.format("MMMM D, YYYY") + " - " + latestDataDate.format("MMMM D, YYYY"));

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

    for (var i = 0; i < 4; i++) {
      sensorConfigs[i].options.scales.x.min = start;
      sensorConfigs[i].options.scales.x.max = end;
      sensorConfigs[i].options.scales.x.time.unit = "minute";
      sensorCharts[i].update();
    }
  }
}
