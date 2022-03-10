const nodes = ["Node 1", "Node 2", "Node 3", "Node 4", "Node 5", "Node 6"];

window.addEventListener("load", interact);

function addListenerToButtons() {
  var groupButtons = document.querySelectorAll("button.custom");
  groupButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const groupId = this.id;
      await getAllGroups().then((groupNodeData) => {
        removeAddedNodes(groupNodeData);
        populateNodes(groupId, groupNodeData);
      });
    });
  });
}

function removeAddedNodes(groupNodeData) {
  for (const key of Object.keys(groupNodeData)) {
    for (node of groupNodeData[key]) {
      const index = nodes.indexOf(node);
      if (index > -1) {
        nodes.splice(index, 1);
      }
    }
  }
}

// Associate respective group and node pairings and display them
function populateNodes(groupId, groupNodeData) {
  const nodeHeader = document.querySelector("#nodeList"); // Select nodes currently being shown
  var customFlag = true;

  // Remove all nodes currently being displayed
  var child = nodeHeader.lastElementChild;
  while (child) {
    nodeHeader.removeChild(child);
    child = nodeHeader.lastElementChild;
  }

  // Create new node list based on groupNodeData map
  for (node of groupNodeData[groupId]) {
    const newNode = document.createElement("button");
    newNode.innerHTML = node;
    newNode.classList = "btn blackBorder shadow-none mx-1";
    newNode.id = node.replace(/ /g, "");
    if (customFlag) {
      newNode.onclick = function () {
        realtimeGraphs(newNode);
      };
      customFlag = false;
    } else {
      newNode.onclick = function () {
        updateGraphs(newNode);
      };
    }
    nodeHeader.appendChild(newNode);
  }

  const allNodes = document.createElement("button");
  allNodes.innerHTML = "All Nodes";
  allNodes.classList = "btn blackBorder shadow-none mx-1";
  allNodes.id = "allNodes";
  allNodes.onclick = function () {
    showAllGraphs(allNodes);
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
  realtimeGraphs(nodeHeader.children[0]);
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

function addGroupToProfile(groupName, nodes) {
  fetch("http://localhost:3000/profiles/addGroup", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ groupName: groupName, nodes: nodes }),
  });
}

async function getAllGroups() {
  const response = await fetch("http://localhost:3000/profiles/getGroups");
  const data = await response.json();

  return data;
}

async function getAllNodeData() {
  const response = await fetch("http://localhost:3000/nodes");
  const data = await response.json();

  return data["nodes"];
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
    console.log(rows[i])
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
  const groups = document.querySelector("#groupList").childNodes;
  if (groups.length !== 0) {
    for (group of groups) {
      if (group.tagName === "BUTTON") {
        await getAllGroups().then((groupNodeData) => {
          removeAddedNodes(groupNodeData);
          populateNodes(group.id, groupNodeData);
        });
        break;
      }
    }
  }

  $("a.downloadData").click(async function (e) {
    const rawData = await getAllNodeData();
    let data = [[]]
    let row = []
    data.push(["Node MAC Address", "Timestamp", "Temperature", "pH", "Light", "Moisture"])

    for(let i = 0; i < rawData.length; i++){
      row = []
      row.push(rawData[i]["nodeMacAddress"])
      row.push(rawData[i]["timestamp"])
      row.push(rawData[i]["temp"])
      row.push(rawData[i]["ph"])
      row.push(rawData[i]["light"])
      row.push(rawData[i]["moist"])
      data.push(row)
    }
    e.preventDefault();
    exportToCsv("nodeData", data)
  });

  // When new group is created
  $("#submitGroupButton").click(function () {
    var checked = document.querySelectorAll("input[type=checkbox]:checked"); // Selected nodes (checkboxes)
    document.querySelector("#displayGroups_Nodes").classList.remove("hidden"); // Display groups and nodes screen

    // Remove "Create a student group" button if it exists
    if (document.contains(document.querySelector("#createGroupButton"))) {
      document.querySelector("#createGroupButton").remove();
      document.querySelector("#groupText").remove();
    }

    // Create new group button and bind populateNodes function
    const groupHeader = document.querySelector("#groupList");
    const newGroup = document.createElement("button");
    newGroup.classList = "btn blackBorder shadow-none mx-1 custom";
    newGroup.id = $("#inputGroup").val();
    newGroup.innerHTML = $("#inputGroup").val();
    groupHeader.appendChild(newGroup);
    newNodes = []; // Add new group to group node data

    // Add selected nodes to the respective group and remove those nodes from available nodes
    for (node of checked) {
      newNodes.push(node.value);
    }

    addGroupToProfile(newGroup.id, newNodes);

    document.querySelector("#inputGroup").value = ""; // Reset modal text
    addListenerToButtons();
  });

  // When create a new group modal is on screen
  $("#createGroupModal").on("shown.bs.modal", function () {
    const nodeHeader = document.querySelector("#nodeListForm"); // Select node list in the modal

    // Remove all nodes from the list (clear the list)
    var child = nodeHeader.lastElementChild;
    while (child) {
      nodeHeader.removeChild(child);
      child = nodeHeader.lastElementChild;
    }

    // Populate the list
    for (node of nodes) {
      const newDiv = document.createElement("div");
      const newInput = document.createElement("input");
      const newLabel = document.createElement("label");

      newDiv.classList.add("form-check");
      newInput.classList.add("form-check-input");
      newLabel.classList.add("form-check-label");

      newDiv.id = node.replace(/ /g, "");
      newInput.type = "checkbox";
      newInput.value = node;
      newLabel.innerHTML = node;

      nodeHeader.appendChild(newDiv);
      newDiv.appendChild(newInput);
      newDiv.appendChild(newLabel);
    }
  });
}
