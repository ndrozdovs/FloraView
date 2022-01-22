window.onload=function(){
    $('#save').click(function() {
        document.querySelector('#wifiModal').innerHTML += $("input[name='flexRadioDefault']:checked").val();
    });

    $('#submitWifi').click(function() {
        document.querySelector('#startAddHub').remove();
        document.querySelector('#firstHub').innerHTML = $("input[name='flexRadioDefault']:checked").val();
        document.querySelector('#displayHubList').classList.toggle("hidden");
    });

    $('#addNodes').click(function() {
        var checked = document.querySelectorAll("input[type=checkbox]:checked");
        console.log($("#inputGroup").val());
        document.querySelector('#firstGroup').innerHTML = $("#inputGroup").val();
        document.querySelector('#displayGroupList').classList.toggle("hidden");
        document.querySelector('#createGroupButton').remove();

        const nodeHeader = document.querySelector('#nodeList');
        for(node of checked){
            const newButton = document.createElement("button");
            newButton.innerHTML = node.value;
            newButton.classList = "btn btn-outline-dark mx-1";
            nodeHeader.appendChild(newButton);
        }
    });
}