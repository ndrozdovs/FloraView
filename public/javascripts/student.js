window.addEventListener("load", interact);

function addListenerToButtons() {
  var groupButtons = document.querySelectorAll("button.custom");
  groupButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      populateNodesAsync(this.id)
    });
  });
}

function getCurrentNode(){
  const nodeHeader = document.querySelector("#nodeList");

  for(let child of nodeHeader.children){
    if(child.classList.contains("highlightButton")){
      return child.title
    }
  }
}

// Associate respective group and node pairings and display them
function populateNodes(groupId, groupNodeData) {
  const nodeHeader = document.querySelector("#nodeList"); // Select nodes currently being shown

  // Remove all nodes currently being displayed
  var child = nodeHeader.lastElementChild;
  while (child) {
    nodeHeader.removeChild(child);
    child = nodeHeader.lastElementChild;
  }

  // Create new node list based on groupNodeData map
  for (node of groupNodeData[groupId]) {
    const newNode = document.createElement("button");
    newNode.innerHTML = node.codeName;
    newNode.classList = "btn blackBorder shadow-none mx-1";
    newNode.id = node.codeName.replace(/ /g, "");
    newNode.title = node.macAddress;
    newNode.onclick = function () {
      highlightNodes(newNode);
      realtimeGraphs();
    };
    nodeHeader.appendChild(newNode);
  }

  const allNodes = document.createElement("button");
  allNodes.innerHTML = "All Nodes";
  allNodes.classList = "btn blackBorder shadow-none mx-1";
  allNodes.id = "allNodes";
  allNodes.onclick = function () {
    highlightNodes(allNodes);
    showAllGraphs();
  };
  nodeHeader.appendChild(allNodes);

  // Highlight the currently selected group
  for (const key of Object.keys(groupNodeData)) {
    if (groupId === key) {
      document.querySelector("#" + key).classList.add("highlight");
    } else {
      document.querySelector("#" + key).classList.remove("highlight");
    }
  }

  initAllGraphs(allNodes);
  highlightNodes(nodeHeader.children[0]);
  realtimeGraphs();
}

function highlightNodes(node) {
  const nodeList = document.querySelector("#nodeList"); // Select nodes currently being shown
  var children = nodeList.children;

  for (const key of children) {
    if (node.id === key.id) {
      document.querySelector("#" + key.id).classList.add("highlightButton");
    } else {
      document.querySelector("#" + key.id).classList.remove("highlightButton");
    }
  }
}

async function getNodeData(nodeMacAddress) {
  const response = await fetch('https://strawberry-custard-75142.herokuapp.com/hubs?' + new URLSearchParams({
    nodeMacAddress: nodeMacAddress,
  }))
  const data = await response.json();

  return data;
}

async function getAllGroups() {
  const response = await fetch("https://strawberry-custard-75142.herokuapp.com/profiles/getStudentGroups", {credentials: "include"});
  const data = await response.json();

  return data;
}

async function populateNodesAsync(group) {
  await getAllGroups().then((groupNodeData) => {
    populateNodes(group, groupNodeData);
  });
}

function exportToCsv(filename, rows) {
  var processRow = function (row) {
    var finalVal = "";
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? "" : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ",";
      finalVal += result;
    }
    return finalVal + "\n";
  };

  var csvFile = "";
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

async function interact() {
  addListenerToButtons();
  const groups = document.querySelector("#groupList");
  if (groups !== null && groups.childNodes.length !== 0) {
    for (group of groups.childNodes) {
      if (group.tagName === "BUTTON") {
        populateNodesAsync(group.id);
        break;
      }
    }
  }

  $("a.downloadData").click(async function (e) {
    var rawDataExcel = []
    if (document.querySelector("#allNodes").classList.contains("highlightButton")){
      const nodeHeader = document.querySelector("#nodeList"); // Select node list in the modal
      var children = nodeHeader.children;
      for (var i = 0; i < children.length; i++) {
        if (children[i].id !== "allNodes") {
          var dataTemp = await getNodeData(children[i].title);
          rawDataExcel.push(dataTemp)
        }
      }
    }
    else{     
      var dataTemp = await getNodeData(getCurrentNode());
      rawDataExcel.push(dataTemp)
    }
    let data = [[]]
    let row = []
    data.push(["Node MAC Address", "Timestamp", "Temperature", "pH", "Light", "Moisture"])

    for(let j = 0; j < rawDataExcel.length; j++){
      for(let i = 0; i < rawDataExcel[j].data.length; i++){
        row = []
        row.push(rawDataExcel[j].nodeMacAddress)
        row.push(rawDataExcel[j].data[i]["timestamp"])
        row.push(rawDataExcel[j].data[i]["temp"])
        row.push(rawDataExcel[j].data[i]["ph"])
        row.push(rawDataExcel[j].data[i]["light"])
        row.push(rawDataExcel[j].data[i]["moist"])
        data.push(row)
      }
    }
    e.preventDefault();
    exportToCsv("nodeData", data)
  });
}
