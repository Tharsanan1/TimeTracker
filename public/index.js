function sendStartAction(taskName) {
    $.post("/start?task_name=" + taskName + "&date=" + getDate(),
        {},
        function(data, status){
        }
    );
}

function sendStopAction(taskName) {
    $.post("/stop?task_name=" + taskName + "&date=" + getDate(),
        {},
        function(data, status){
        }
    );
}

function updateTasks() {
    $.get("/tasks?date=" + getDate(),
        function(data, status){
            for (let i = 0; i < data.length; i++) {
                createTask(data[i].task_name, data[i].running)
            }
            
        }
    );
}

function msToHMS( ms ) {
    // 1- Convert to seconds:
    var seconds = parseInt(ms / 1000);
    // 2- Extract hours:
    var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return  hours+":"+minutes+":"+seconds ;
}

function createTaskOnSystem(taskName) {
    $.post("/task?task_name=" + taskName + "&date=" + getDate(),
        {},
        function(data, status){
        }
    );
}

function getTaskRunningTime(taskName, callback) {
    $.get("/task?task_name=" + taskName + "&date=" + getDate(),
        function(data, status){
            callback(msToHMS(data.total_time))
        }
    );
}

function updateIndividualTaskTimer(timerTextNode, taskName) {
    getTaskRunningTime(taskName, function(time) {
        timerTextNode.nodeValue = time;
    })
     
}

function createTask (taskName, running) {
    let taskDiv = document.createElement("div");
    taskDiv.style.cssText = 'border:5px solid black; margin:10px;';

    let parentDiv = document.getElementById("tasks-div");
    parentDiv.appendChild(taskDiv);

    let taskHeading = document.createElement("H1")
    taskHeading.appendChild(document.createTextNode(taskName));

    taskDiv.appendChild(taskHeading);

    let startBtn = document.createElement("input");
    startBtn.type = "button";
    startBtn.value = "Start"; 

    let stopBtn = document.createElement("input");
    stopBtn.type = "button";
    stopBtn.value = "Stop"; 
    stopBtn.disabled = !running;
    startBtn.disabled = running;


    startBtn.onclick = function() { 
        startBtn.disabled = true;
        stopBtn.disabled = false;
        sendStartAction(taskName);
    };
    stopBtn.onclick = function() { 
        stopBtn.disabled = true;
        startBtn.disabled = false;
        sendStopAction(taskName);
    };

    

    
    let runningTime = document.createElement("H4")
    let timerTextNode = document.createTextNode("0")
    runningTime.appendChild(timerTextNode);
    taskDiv.appendChild(runningTime);
    taskDiv.appendChild(startBtn);
    taskDiv.appendChild(stopBtn);

    setInterval(function(){
            updateIndividualTaskTimer(timerTextNode, taskName);
        }, 3000);

    
}

function getDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

$(document).ready(function() {
    updateTasks();
    $("#new-task-btn").on("click", function() {
        var taskName = "new_task_"  + (new Date().getTime() / 1000 | 0)  ;
        taskName = prompt("Please enter your name:", taskName);
        console.log(taskName)
        if (taskName == null || taskName == "") {
            return;
        }
        else {
            createTaskOnSystem(taskName)
            createTask(taskName, false);
        }
    });
});