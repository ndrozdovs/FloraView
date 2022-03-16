const nodes = ["Node 1", "Node 2", "Node 3", "Node 4", "Node 5", "Node 6"];

window.addEventListener("load", interact);

function addListenerToButtons() {
  var groupButtons = document.querySelectorAll("button.custom");
  groupButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      populateNodesAsync(this.id)
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
function populateNodes(groupId, groupNodeData, groupStudentsData) {
  const nodeHeader = document.querySelector("#nodeList"); // Select nodes currently being shown
  const studentHeader = document.querySelector("#studentList");
  var customFlag = true;

  var child = studentHeader.lastElementChild;
  while (child) {
    studentHeader.removeChild(child);
    child = studentHeader.lastElementChild;
  }

  for (let student of groupStudentsData[groupId]) {
    const newNode = document.createElement("button");
    newNode.innerHTML = student;
    newNode.classList = "btn blackBorder shadow-none mx-1";
    newNode.id = node.replace(/ /g, "");
    studentHeader.appendChild(newNode);
  }

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

function populateStudents(students, groupId){
  const studentHeader = document.querySelector("#studentList"); // Select nodes currently being shown

  // Remove all nodes currently being displayed
  var child = studentHeader.lastElementChild;
  while (child) {
    studentHeader.removeChild(child);
    child = studentHeader.lastElementChild;
  }

  // Create new node list based on groupNodeData map
  for (let student of students) {
    const newNode = document.createElement("button");
    newNode.innerHTML = student;
    newNode.classList = "btn blackBorder shadow-none mx-1";
    newNode.id = node.replace(/ /g, "");
    studentHeader.appendChild(newNode);
  }
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

async function addGroupToProfile(groupName, nodes) {
  await fetch("http://localhost:3000/profiles/addGroup", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ groupName: groupName, nodes: nodes }),
  });
}

async function addStudentsToGroup(students, groupName) {
  await fetch("http://localhost:3000/profiles/addStudentsToGroup", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ students: students, groupName: groupName }),
  });
}

function addPasswordToClassroom(password) {
  fetch("http://localhost:3000/profiles/addPassword", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password: password }),
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

async function getAllStudents() {
  const response = await fetch("http://localhost:3000/profiles/getStudents");
  const data = await response.json();

  return data;
}

async function populateNodesAsync(group){
  document.querySelector("#displayGroups_Nodes").classList.remove("removed"); // Display groups and nodes screen
  await getAllGroups().then(({groupNodeData, groupStudentsData}) => {
    removeAddedNodes(groupNodeData);
    populateNodes(group, groupNodeData, groupStudentsData);
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
        populateNodesAsync(group.id)
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
  
  $("#submitClassroomPassword").click(function () {
    addPasswordToClassroom($("input[id='inputClassroomPassword']").val())
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
  
  // When new group is created
  $("#submitGroupButton").click(async function () {
    var checked = document.querySelectorAll("input[type=checkbox]:checked"); // Selected nodes (checkboxes)

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

    await addGroupToProfile(newGroup.id, newNodes);

    document.querySelector("#inputGroup").value = ""; // Reset modal text
    populateNodesAsync(newGroup.id)
    addListenerToButtons();
  });


  $("#addStudentsModal").on("shown.bs.modal", async function () {
    const students = await getAllStudents();
    const studentHeader = document.querySelector("#studentListForm"); // Select node list in the modal

    // Remove all nodes from the list (clear the list)
    var child = studentHeader.lastElementChild;
    while (child) {
      studentHeader.removeChild(child);
      child = studentHeader.lastElementChild;
    }

    // Populate the list
    for (student of students) {
      const newDiv = document.createElement("div");
      const newInput = document.createElement("input");
      const newLabel = document.createElement("label");

      newDiv.classList.add("form-check");
      newInput.classList.add("form-check-input");
      newLabel.classList.add("form-check-label");

      newDiv.id = student.replace(/ /g, "");
      newInput.type = "checkbox";
      newInput.value = student;
      newLabel.innerHTML = student;

      studentHeader.appendChild(newDiv);
      newDiv.appendChild(newInput);
      newDiv.appendChild(newLabel);
    }
  });

  $("#submitStudentListButton").click(async function () {
    var checked = document.querySelectorAll("input[type=checkbox]:checked"); // Selected students (checkboxes)

    newStudents = []; // Add new group to group node data

    // Add selected nodes to the respective group and remove those nodes from available nodes
    for (student of checked) {
      newStudents.push(student.value);
    }

    let currentGroup;
    var groupButtons = document.querySelectorAll("button.custom");
    groupButtons.forEach((button) => {
      if(button.classList.contains("highlight")){
        currentGroup = button.id
      }
    });

    await addStudentsToGroup(newStudents, currentGroup);

    populateStudents(newStudents, currentGroup)
  });
}
