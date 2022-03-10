window.addEventListener("load", interact);

async function getAllGroups() {
  const response = await fetch("http://localhost:3000/profiles/getGroups");
  const data = await response.json();

  return data;
}

var groupButtons = document.querySelectorAll("button.custom");
groupButtons.forEach((button) => {
  button.addEventListener("click", async function () {
    await getAllGroups().then((groupNodeData) => {
      const nodeHeader = document.querySelector("#nodeList"); // Select nodes currently being shown
      var customFlag = true;
      var index = 0;

      for(var i = 0; i < Object.keys(groupNodeData).size; i++){
          if(this.id === groupNodeData[i].groupName){
              break;
          }
          index++;
      }

      // Remove all nodes currently being displayed
      var child = nodeHeader.lastElementChild;
      while (child) {
        nodeHeader.removeChild(child);
        child = nodeHeader.lastElementChild;
      }

      // Create new node list based on groupNodeData map
      for (node of groupNodeData[this.id]) {
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
        if (this.id === key) {
          document.querySelector("#" + key).classList.add("highlight");
        } else {
          document.querySelector("#" + key).classList.remove("highlight");
        }
      }

      initAllGraphs(allNodes);
      realtimeGraphs(nodeHeader.children[0]);
    });
  });
});

// Associate respective group and node pairings and display them
function populateNodes(selectedGroup, groupNodeData) {
  const nodeHeader = document.querySelector("#nodeList"); // Select nodes currently being shown
  var customFlag = true;

  // Remove all nodes currently being displayed
  var child = nodeHeader.lastElementChild;
  while (child) {
    nodeHeader.removeChild(child);
    child = nodeHeader.lastElementChild;
  }

  // Create new node list based on groupNodeData map
  for (node of groupNodeData[selectedGroup]) {
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
    if (selectedGroup === key) {
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

function interact() {
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
    newGroup.classList = "btn blackBorder shadow-none mx-1";
    newGroup.id = $("#inputGroup").val();
    newGroup.innerHTML = $("#inputGroup").val();
    groupHeader.appendChild(newGroup);
    newGroup.onclick = function () {
      populateNodes(newGroup);
    };
    groupNodeData[newGroup.id] = []; // Add new group to group node data

    // Add selected nodes to the respective group and remove those nodes from available nodes
    for (node of checked) {
      groupNodeData[newGroup.id].push(node.value);
      nodes.splice(nodes.indexOf(node.value), 1);
    }

    addGroupToProfile(newGroup.id, groupNodeData[newGroup.id]);

    document.querySelector("#inputGroup").value = ""; // Reset modal text
    populateNodes(newGroup);
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

function wifiIsInvalid() {
  document.querySelector("#wifiSpinner").classList.toggle("hidden"); // Disable the spinner
  document.querySelector("#inputNetworkName").value = ""; // Reset modal text
  document.querySelector("#inputNetworkPassword").value = ""; // Reset modal text
  document.querySelector("#inputNetworkName").classList.add("is-invalid");
  document.querySelector("#inputNetworkPassword").classList.add("is-invalid");
}

function wifiIsValid(hubMacAddress) {
  $("#enterWifiModal").modal("hide");
  document.querySelector("#startAddHub").remove(); // Remove initial set up info
  document.querySelector("#firstHub").innerHTML = hubMacAddress; // Save selected Hub
  document.querySelector("#displayHubList").classList.remove("removed"); // Display the next info screen
  document.querySelector("#wifiSpinner").classList.toggle("hidden"); // Disable the spinner
  createProfile(hubMacAddress);
}
