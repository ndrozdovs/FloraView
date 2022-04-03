let nodes = [];

if (window.location.protocol == 'http:') {
  window.location.href = window.location.href.replace('http:', 'https:');
}

window.addEventListener("load", interact);

function callPopulate() {
  populateNodesAsync(this.id);
}

function addListenerToButtons() {
  var groupButtons = document.querySelectorAll("button.custom");
  groupButtons.forEach((button) => {
    button.addEventListener("click", callPopulate)
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
function populateNodes(groupId, groupNodeData, groupStudentsData) {
  const nodeHeader = document.querySelector("#nodeList"); // Select nodes currently being shown
  const studentHeader = document.querySelector("#studentList");

  var child = studentHeader.lastElementChild;
  while (child) {
    studentHeader.removeChild(child);
    child = studentHeader.lastElementChild;
  }

  for (let student of groupStudentsData[groupId]) {
    const newNode = document.createElement("button");
    newNode.innerHTML = student;
    newNode.classList = "btn blackBorder shadow-none mx-1";
    newNode.id = student.replace(/ /g, "");
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
    newNode.id = student.replace(/ /g, "");
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
  await fetch("https://www.floraview.ca/profiles/addGroup", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ groupName: groupName, nodes: nodes }),
  });
}

async function addStudentsToGroup(students, groupName) {
  await fetch("https://www.floraview.ca/profiles/addStudentsToGroup", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ students: students, groupName: groupName }),
  });
}

function addPasswordToClassroom(password) {
  fetch("https://www.floraview.ca/profiles/addPassword", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password: password }),
  });
}

async function getAllGroups() {
  const response = await fetch("https://www.floraview.ca/profiles/getGroups", {
    method: "get",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function getAllNodes(hubMacAddress) {
  const response = await fetch('https://www.floraview.ca/hubs/nodes?' + new URLSearchParams({
    hubMacAddress: hubMacAddress,
  }))
  const data = await response.json();

  return data;
}

async function getNodeData(nodeMacAddress) {
  const response = await fetch('https://www.floraview.ca/hubs?' + new URLSearchParams({
    nodeMacAddress: nodeMacAddress,
  }))
  const data = await response.json();

  return data;
}

async function getAllStudents() {
  const response = await fetch("https://www.floraview.ca/profiles/getStudents", {credentials: "include"});
  const data = await response.json();

  return data;
}

async function populateNodesAsync(group){
  document.querySelector("#displayGroups_Nodes").classList.remove("removed"); // Display groups and nodes screen
  await getAllGroups().then(({groupNodeData, groupStudentsData}) => {
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
    row = []
    row.push("78:E3:6D:09:F1:E8")
    row.push("2022-04-03 22:43")
    row.push("100")
    row.push("5")
    row.push("100")
    row.push("100")
    data.push(row)
    e.preventDefault();
    exportToCsv("nodeData", data)
  });
  
  $("#submitClassroomPassword").click(function () {
    addPasswordToClassroom($("input[id='inputClassroomPassword']").val())
  });

  // When create a new group modal is on screen
  $("#createGroupModal").on("shown.bs.modal", async function () {
    const nodeHeader = document.querySelector("#nodeListForm"); // Select node list in the modal
    const hubMacAddress = document.querySelector("#firstHub").innerHTML
    nodes = await getAllNodes(hubMacAddress);

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

      newDiv.id = node.codeName.replace(/ /g, "");
      newInput.type = "checkbox";
      newInput.value = node.nodeMacAddress + " " + node.codeName;
      newInput.name = "nodeSelector"
      newLabel.innerHTML = node.codeName + " (" + node.nodeMacAddress + ")";

      nodeHeader.appendChild(newDiv);
      newDiv.appendChild(newInput);
      newDiv.appendChild(newLabel);
    }
  });
  
  // When new group is created
  $("#submitGroupButton").click(async function () {
    var checked = document.querySelectorAll("input[name=nodeSelector]:checked"); // Selected nodes (checkboxes)

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
      newNodes.push({macAddress: node.value.substr(0,17), codeName: node.value.substr(18)});
    }

    await addGroupToProfile(newGroup.id, newNodes);

    document.querySelector("#inputGroup").value = ""; // Reset modal text
    populateNodesAsync(newGroup.id)
    addListenerToButtons();
  });


  $("#addStudentsModal").on("shown.bs.modal", async function () {
    const students = await getAllStudents();
    const studentHeader = document.querySelector("#studentListForm"); // Select node list in the modal
    const currentStudentHeader = document.querySelector("#studentList");

    var currentStudents = [];
    var children = currentStudentHeader.children;
    for (var i = 0; i < children.length; i++) {
      currentStudents.push(children[i].innerHTML);
    }

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
      newInput.name = "studentSelector"
      newLabel.innerHTML = student;

      if(currentStudents.includes(student)){
        newInput.checked = true
      }

      studentHeader.appendChild(newDiv);
      newDiv.appendChild(newInput);
      newDiv.appendChild(newLabel);
    }
  });

  $("#submitStudentListButton").click(async function () {
    var checked = document.querySelectorAll("input[name=studentSelector]:checked"); // Selected students (checkboxes)

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
