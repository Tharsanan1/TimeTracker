const express = require('express')
var fs = require('fs');
const app = express()
const port = 3000
const templateFileRelativePath = './template.json';
const templateString = fs.readFileSync(templateFileRelativePath, 'utf8');
const stopped_ind = "STOPPED";
const started_ind = "STARTED";
const running_ind = "RUNNING";

app.get('/tasks', (req, res) => {
    let date = req.query.date;
    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
        throw new Error('invalid date format');
    }
    let fileName = date + '.json';
    let fileRelativePath =  './notes/' + date + '.json';
    let tasksObj;
    if (fs.existsSync(fileRelativePath)) {
        tasksObj = JSON.parse(fs.readFileSync(fileRelativePath, 'utf8'));
    } else {
        fs.writeFileSync(fileRelativePath, templateString);
        tasksObj = JSON.parse(templateString);
    }
    let tasks = []
    for(var i = 0; i < tasksObj.tasks.length; i++) {
        tasks[i] = {}
        tasks[i].task_name = tasksObj.tasks[i].task_name;
        let arr_len = tasksObj.tasks[i].time_logs.length;
        if(arr_len !== 0) {
            tasks[i].running = tasksObj.tasks[i].time_logs[arr_len-1].split("_")[0] === stopped_ind ? false : true;
        } else {
            tasks[i].state = false;
        }
    }
    res.send(tasks);
});

app.post('/task', (req, res) => {
    let date = req.query.date;
    let task_name = req.query.task_name;

    if (task_name.length === 0) {
        throw new Error('TaskName is required');
    }

    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
            throw new Error('invalid date format');
    }
    let fileName = date + '.json';
    let fileRelativePath =  './notes/' + date + '.json';
    let tasksObj;
    if (fs.existsSync(fileRelativePath)) {
        tasksObj = JSON.parse(fs.readFileSync(fileRelativePath, 'utf8'));
    } else {
        fs.writeFileSync(fileRelativePath, templateString);
        tasksObj = JSON.parse(templateString);
    }

    // check task_name already exists
    for(var i = 0; i < tasksObj.tasks.length; i++) {
        if(task_name === tasksObj.tasks[i].task_name) {
            throw new Error("Task name already exists.");
        }
    }

    tasksObj.tasks.push({
        task_name : task_name,
        time_logs : []
    })

    fs.writeFileSync(fileRelativePath, JSON.stringify(tasksObj, null, 2));
    res.send("OK");

});

app.post('/start', (req, res) => {
    let date = req.query.date;
    let task_name = req.query.task_name;


    if (task_name.length === 0) {
        throw new Error('TaskName is required');
    }

    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
        throw new Error('invalid date format');
    }

    let fileName = date + '.json';
    let fileRelativePath =  './notes/' + date + '.json';
    let tasksObj;
    if (fs.existsSync(fileRelativePath)) {
        tasksObj = JSON.parse(fs.readFileSync(fileRelativePath, 'utf8'));
    } else {
        throw new Error("No such file or task")
    }
    let flagTaskFound = false;
    for(var i = 0; i < tasksObj.tasks.length; i++) {
        if(task_name === tasksObj.tasks[i].task_name) {
            flagTaskFound = true;
            let timeLogLen = tasksObj.tasks[i].time_logs.length;
            if (timeLogLen === 0 ) {
                tasksObj.tasks[i].time_logs.push(started_ind + "_" + new Date().getTime());
            }
            else if (tasksObj.tasks[i].time_logs[timeLogLen-1].split("_")[0] === started_ind) {
                throw new Error("Already started.")
            }
            else if (timeLogLen % 2 === 1) {
                throw new Error("Inconsistence data at the system. Please call your admin")
            } else {
                tasksObj.tasks[i].time_logs.push(started_ind + "_" + new Date().getTime());
            }
            
        }
    }
    fs.writeFileSync(fileRelativePath, JSON.stringify(tasksObj, null, 2));
    res.send("OK")

});


app.post('/stop', (req, res) => {
    let date = req.query.date;
    let task_name = req.query.task_name;


    if (task_name.length === 0) {
        throw new Error('TaskName is required');
    }

    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
        throw new Error('invalid date format');
    }

    let fileName = date + '.json';
    let fileRelativePath =  './notes/' + date + '.json';
    let tasksObj;
    if (fs.existsSync(fileRelativePath)) {
        tasksObj = JSON.parse(fs.readFileSync(fileRelativePath, 'utf8'));
    } else {
        throw new Error("No such file or task")
    }
    let flagTaskFound = false;
    for(var i = 0; i < tasksObj.tasks.length; i++) {
        if(task_name === tasksObj.tasks[i].task_name) {
            flagTaskFound = true;
            if (tasksObj.tasks[i].time_logs.length === 0) {
                throw new Error("Cant stop cos its not started yet.")
            }
            if (tasksObj.tasks[i].time_logs[tasksObj.tasks[i].time_logs.length-1].split("_")[0] === stopped_ind) {
                throw new Error("Already stopped.")
            }
            if (tasksObj.tasks[i].time_logs.length % 2 === 0) {
                throw new Error("Inconsistence data at the system. Please call your admin")
            }

            tasksObj.tasks[i].time_logs.push(stopped_ind + "_" + new Date().getTime());
        }
    }
    fs.writeFileSync(fileRelativePath, JSON.stringify(tasksObj, null, 2));
    res.send("OK")

});

app.post('/summary', (req, res) => {
    let date = req.query.date;
    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
        throw new Error('invalid date format');
    }

    let fileName = date + '.json';
    let fileRelativePath =  './notes/' + date + '.json';
    let tasksObj;
    if (fs.existsSync(fileRelativePath)) {
        tasksObj = JSON.parse(fs.readFileSync(fileRelativePath, 'utf8'));
    } else {
        throw new Error("No such file or task")
    }

    let summary = []

    for(var i = 0; i < tasksObj.tasks.length; i++) {
        let task_detail = {}
        let task_name = tasksObj.tasks[i].task_name;
        let logLength = tasksObj.tasks[i].time_logs.length;
        let totalTime = 0
        for(var j = 0; j < ((logLength / 2) | 0); j++) {
            let startedTime = tasksObj.tasks[i].time_logs[j*2].split("_")[1]
            let stoppedTime = tasksObj.tasks[i].time_logs[(j*2) + 1].split("_")[1]
            let timeTaken = parseInt(stoppedTime) - parseInt(startedTime);
            totalTime += timeTaken
        }
        task_detail.task_name = task_name;
        task_detail.total_time = totalTime;
        task_detail.running = logLength % 2 === 0 ? false : true;
        if (logLength % 2 !== 0) {
            let lastStartedTime = parseInt(tasksObj.tasks[i].time_logs[logLength - 1].split("_")[1])
            totalTime += parseInt(new Date().getTime()) - lastStartedTime
            task_detail.total_time = totalTime;
        }
        summary.push(task_detail);
    }
    res.send(summary);
    
});


app.get('/task', (req, res) => {
    let date = req.query.date;
    let task_name = req.query.task_name;

    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
        throw new Error('invalid date format');
    }

    let fileName = date + '.json';
    let fileRelativePath =  './notes/' + date + '.json';
    let tasksObj;
    if (fs.existsSync(fileRelativePath)) {
        tasksObj = JSON.parse(fs.readFileSync(fileRelativePath, 'utf8'));
    } else {
        throw new Error("No such file or task")
    }

    let task_detail = {}
    let flagTaskFound = false;
    for(var i = 0; i < tasksObj.tasks.length; i++) {
        if (task_name === tasksObj.tasks[i].task_name) {
            flagTaskFound = true
            let task_name = tasksObj.tasks[i].task_name;
            let logLength = tasksObj.tasks[i].time_logs.length;
            let totalTime = 0
            for(var j = 0; j < ((logLength / 2) | 0); j++) {
                let startedTime = tasksObj.tasks[i].time_logs[j*2].split("_")[1]
                let stoppedTime = tasksObj.tasks[i].time_logs[(j*2) + 1].split("_")[1]
                let timeTaken = parseInt(stoppedTime) - parseInt(startedTime);
                totalTime += timeTaken
            }
            task_detail.task_name = task_name;
            task_detail.total_time = totalTime;
            task_detail.running = logLength % 2 === 0 ? false : true;
            if (logLength % 2 !== 0) {
                let lastStartedTime = parseInt(tasksObj.tasks[i].time_logs[logLength - 1].split("_")[1])
                totalTime += parseInt(new Date().getTime()) - lastStartedTime
                task_detail.total_time = totalTime;
            }
        }
    }
    if (flagTaskFound) {
        res.send(task_detail);
    }
    else {
        throw new Error("No such task");
    }
    
    
});
    
    
app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})