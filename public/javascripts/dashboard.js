const nodes = ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6']
const groupNodeData = [];

window.onload=function(){
    $('#save').click(function() {
        document.querySelector('#wifiModal').innerHTML += $("input[name='flexRadioDefault']:checked").val();
    });

    $('#submitWifi').click(function() {
        document.querySelector('#wifiSpinner').classList.remove("hidden");

        window.setTimeout(function () {
            $('#enterWifiModal').modal('hide');
            document.querySelector('#startAddHub').remove();
            document.querySelector('#firstHub').innerHTML = $("input[name='flexRadioDefault']:checked").val();
            document.querySelector('#displayHubList').classList.remove("hidden");
            document.querySelector('#wifiSpinner').remove();
        }, 2000);
    });

    $('#addNodes').click(function() {
        var checked = document.querySelectorAll("input[type=checkbox]:checked");
        document.querySelector('#displayGroupList').classList.remove("hidden");
        if(document.contains(document.querySelector('#createGroupButton'))){
            document.querySelector('#createGroupButton').remove();
        }

        const groupHeader = document.querySelector('#groupList');
        const newGroup = document.createElement("button");
        newGroup.classList = "btn buttonClr mx-1";
        newGroup.id = $("#inputGroup").val();
        newGroup.innerHTML = $("#inputGroup").val();
        groupHeader.appendChild(newGroup);
        newGroup.onclick = function() {populateNodes(newGroup)};
        groupNodeData[newGroup.id] = [];

        const nodeHeader = document.querySelector('#nodeList');
        for(node of checked){
            groupNodeData[newGroup.id].push(node.value);
            nodes.splice(nodes.indexOf(node.value), 1);
        }

        document.querySelector('#inputGroup').value = "";
    });

    $("#createGroup").on('shown.bs.modal', function(){
        const nodeHeader = document.querySelector('#nodeListForm');
        var child = nodeHeader.lastElementChild; 
        while (child) {
            nodeHeader.removeChild(child);
            child = nodeHeader.lastElementChild;
        }

        for(node of nodes){
            const newDiv = document.createElement("div");
            const newInput = document.createElement("input");
            const newLabel = document.createElement("label");

            newDiv.classList.add("form-check");
            newInput.classList.add("form-check-input");
            newLabel.classList.add("form-check-label");

            newDiv.id = node.replace(/ /g,'');
            newInput.type ="checkbox";
            newInput.value = node;
            newLabel.innerHTML = node;

            nodeHeader.appendChild(newDiv);
            newDiv.appendChild(newInput);
            newDiv.appendChild(newLabel);
        }
    });

    function populateNodes(newGroup) {
        const nodeHeader = document.querySelector('#nodeList');
        var child = nodeHeader.lastElementChild; 
        while (child) {
            nodeHeader.removeChild(child);
            child = nodeHeader.lastElementChild;
        }

        for(node of groupNodeData[newGroup.id]){
            const newNode = document.createElement("button");
            newNode.innerHTML = node;
            newNode.classList = "btn btn-outline-dark mx-1";
            nodeHeader.appendChild(newNode);
        }

        for(const key of Object.keys(groupNodeData)){
            if(newGroup.id === key){
                document.querySelector('#' + key).classList.add('highlight');
            }
            else{
                document.querySelector('#' + key).classList.remove('highlight');
            }
        }
    }
}