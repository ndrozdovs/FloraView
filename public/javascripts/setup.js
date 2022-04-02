window.addEventListener("load", interact);

function createProfile(hubMacAddress) {
  const pairCode = getRandomInt(1000, 9999);
  fetch("https://floraview.ca/profiles", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ hubMacAddress: hubMacAddress, pairCode: pairCode }),
  });

  return pairCode;
}

function addPasswordToClassroom(password) {
  fetch("https://floraview.ca/profiles/addPassword", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password: password }),
  });
}

function interact() {
  $("#enterWifiModal").on("shown.bs.modal", function () {
    document.querySelector("#pairSpinner").classList.toggle("hidden"); // Disable the spinner
  });

  // Disconnect serial when wifi modal is exited
  $("#enterWifiModal").on("hide.bs.modal", function () {
    console.log("Serial Disconnected");
    document.querySelector("#inputNetworkName").classList.remove("is-invalid");
    document.querySelector("#inputNetworkPassword").classList.remove("is-invalid");
    disconnectSerial();
  });

  // When Wifi credentials are submitted
  $("#submitWifiButton").click(function () {
    // Enable the spinner
    document.querySelector("#wifiSpinner").classList.toggle("hidden");
    networkName = $("input[id='inputNetworkName']").val();
    networkPassword = $("input[id='inputNetworkPassword']").val();
    writeToStream(networkName);
    writeToStream(networkPassword);
  });

  $("#submitClassroomPassword").click(function () {
    addPasswordToClassroom($("input[id='inputClassroomPassword']").val())
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
  const pairCode = createProfile(hubMacAddress);
  document.querySelector("#startAddHub").remove(); // Remove initial set up info
  document.querySelector("#firstHub").innerHTML = hubMacAddress; // Save selected Hub
  document.querySelector("#displayHubList").classList.remove("removed"); // Display the next info screen
  document.querySelector("#wifiSpinner").classList.toggle("hidden"); // Disable the spinner
  document.querySelector("#pairCode").innerHTML = pairCode;
  document.querySelector("#displayPairCode").classList.remove("removed");
  document.querySelector("#displayPairInstructions").classList.remove("removed");
}
